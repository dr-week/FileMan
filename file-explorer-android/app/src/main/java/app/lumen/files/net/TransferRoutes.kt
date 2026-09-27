package app.lumen.files.net

import android.content.Context
import android.os.Build
import android.os.Environment
import android.webkit.MimeTypeMap
import java.io.*
import java.net.URLDecoder
import java.nio.charset.StandardCharsets

object TransferRoutes {

    fun handleRequest(
        context: Context,
        rawHeaders: List<String>,
        rawInput: InputStream,
        rawOutput: OutputStream,
        onFileReceived: (String, Boolean) -> Unit
    ) {
        if (rawHeaders.isEmpty()) return
        val reqLine = rawHeaders[0]
        val parts = reqLine.split(" ")
        if (parts.size < 2) return

        val method = parts[0].uppercase()
        val fullPath = parts[1]
        val pathOnly = fullPath.substringBefore("?")
        val queryString = fullPath.substringAfter("?", "")
        val params = TransferHttpUtils.parseQuery(queryString)

        when {
            method == "GET" && (pathOnly == "/ping" || pathOnly == "/api/info") -> sendInfoResponse(rawOutput)
            method == "GET" && pathOnly == "/api/files" -> {
                val targetDir = resolveDirectory(context, params["path"])
                sendFilesList(rawOutput, targetDir)
            }
            method == "GET" && pathOnly == "/api/download" -> {
                val targetFile = resolveFile(params["path"])
                sendFileDownload(rawOutput, targetFile)
            }
            method == "POST" && pathOnly == "/api/upload" -> {
                val headersMap = TransferHttpUtils.parseHeadersMap(rawHeaders)
                val contentLength = headersMap["content-length"]?.toLongOrNull() ?: 0L
                val targetFolder = resolveDirectory(context, params["path"])
                val fileName = params["name"] ?: "upload_${System.currentTimeMillis()}.bin"
                receiveFileUpload(rawInput, rawOutput, targetFolder, fileName, contentLength, onFileReceived)
            }
            method == "POST" && pathOnly == "/api/action" -> {
                val headersMap = TransferHttpUtils.parseHeadersMap(rawHeaders)
                val len = headersMap["content-length"]?.toIntOrNull() ?: 0
                val body = TransferHttpUtils.readBodyString(rawInput, len)
                handleFileAction(rawOutput, body)
            }
            method == "OPTIONS" -> TransferHttpUtils.sendCorsOk(rawOutput)
            else -> TransferHttpUtils.sendJsonResponse(rawOutput, 404, "{\"error\":\"Route not found\"}")
        }
    }

    private fun sendInfoResponse(out: OutputStream) {
        val storage = Environment.getExternalStorageDirectory()
        val free = storage.freeSpace
        val total = storage.totalSpace
        val model = Build.MODEL ?: "Android Device"
        val json = """{"status":"online","device":"LumenFiles-Android","deviceName":"$model","type":"android","version":"0.1.0","freeSpaceBytes":$free,"totalSpaceBytes":$total}"""
        TransferHttpUtils.sendJsonResponse(out, 200, json)
    }

    private fun sendFilesList(out: OutputStream, dir: File) {
        if (!dir.exists() || !dir.isDirectory) {
            TransferHttpUtils.sendJsonResponse(out, 404, """{"error":"Directory not found"}""")
            return
        }
        val items = dir.listFiles()?.map { f ->
            val ext = f.extension
            val mime = MimeTypeMap.getSingleton().getMimeTypeFromExtension(ext) ?: if (f.isDirectory) "inode/directory" else "application/octet-stream"
            val safeName = f.name.replace("\"", "\\\"")
            val safePath = f.absolutePath.replace("\\", "/").replace("\"", "\\\"")
            """{"name":"$safeName","path":"$safePath","isDir":${f.isDirectory},"size":${if (f.isDirectory) 0 else f.length()},"modifiedAt":${f.lastModified()},"mime":"$mime"}"""
        } ?: emptyList()

        val json = """{"path":"${dir.absolutePath.replace("\\", "/")}","files":[${items.joinToString(",")}]}"""
        TransferHttpUtils.sendJsonResponse(out, 200, json)
    }

    private fun sendFileDownload(out: OutputStream, file: File?) {
        if (file == null || !file.exists() || file.isDirectory) {
            TransferHttpUtils.sendJsonResponse(out, 404, """{"error":"File not found"}""")
            return
        }
        val ext = file.extension
        val mime = MimeTypeMap.getSingleton().getMimeTypeFromExtension(ext) ?: "application/octet-stream"
        val header = "HTTP/1.1 200 OK\r\n" +
                "Access-Control-Allow-Origin: *\r\n" +
                "Content-Type: $mime\r\n" +
                "Content-Length: ${file.length()}\r\n" +
                "Content-Disposition: attachment; filename=\"${file.name}\"\r\n" +
                "Connection: close\r\n\r\n"
        out.write(header.toByteArray(StandardCharsets.UTF_8))
        FileInputStream(file).use { fis -> fis.copyTo(out, bufferSize = 16384) }
        out.flush()
    }

    private fun receiveFileUpload(
        input: InputStream,
        out: OutputStream,
        destDir: File,
        fileName: String,
        contentLength: Long,
        callback: (String, Boolean) -> Unit
    ) {
        if (!destDir.exists()) destDir.mkdirs()
        val destFile = File(destDir, fileName)
        var bytesCopied = 0L
        try {
            FileOutputStream(destFile).use { fos ->
                val buffer = ByteArray(16384)
                var remaining = contentLength
                while (remaining > 0) {
                    val toRead = if (remaining < buffer.size) remaining.toInt() else buffer.size
                    val read = input.read(buffer, 0, toRead)
                    if (read == -1) break
                    fos.write(buffer, 0, read)
                    bytesCopied += read
                    remaining -= read
                }
            }
            callback("Received: $fileName (${destFile.length()} bytes)", true)
            TransferHttpUtils.sendJsonResponse(out, 200, """{"success":true,"filename":"$fileName","size":$bytesCopied}""")
        } catch (e: Exception) {
            callback("Upload failed: ${e.message}", false)
            TransferHttpUtils.sendJsonResponse(out, 500, """{"success":false,"error":"${e.message}"}""")
        }
    }

    private fun handleFileAction(out: OutputStream, body: String) {
        val action = Regex(""""action"\s*:\s*"([^"]+)"""").find(body)?.groupValues?.get(1)
        val path = Regex(""""path"\s*:\s*"([^"]+)"""").find(body)?.groupValues?.get(1)
        val target = Regex(""""target"\s*:\s*"([^"]+)"""").find(body)?.groupValues?.get(1)
        val file = if (path != null) File(path) else null
        when (action) {
            "mkdir" -> TransferHttpUtils.sendJsonResponse(out, 200, """{"success":${file?.mkdirs() == true}}""")
            "delete" -> TransferHttpUtils.sendJsonResponse(out, 200, """{"success":${file?.deleteRecursively() == true}}""")
            "rename" -> {
                val dest = if (target != null) File(file?.parentFile, target) else null
                TransferHttpUtils.sendJsonResponse(out, 200, """{"success":${dest != null && file?.renameTo(dest) == true}}""")
            }
            else -> TransferHttpUtils.sendJsonResponse(out, 400, """{"error":"Unknown action"}""")
        }
    }

    fun resolveDirectory(context: Context, rawPath: String?): File {
        if (!rawPath.isNullOrBlank()) {
            val f = File(URLDecoder.decode(rawPath, "UTF-8"))
            if (f.exists() && f.isDirectory) return f
        }
        val ext = Environment.getExternalStorageDirectory()
        return if (ext.exists() && ext.canRead()) ext else context.filesDir
    }

    private fun resolveFile(rawPath: String?): File? {
        if (rawPath.isNullOrBlank()) return null
        return File(URLDecoder.decode(rawPath, "UTF-8"))
    }
}
