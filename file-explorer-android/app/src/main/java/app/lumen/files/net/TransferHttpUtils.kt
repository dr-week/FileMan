package app.lumen.files.net

import java.io.InputStream
import java.io.OutputStream
import java.net.URLDecoder
import java.nio.charset.StandardCharsets

object TransferHttpUtils {

    fun parseHeadersMap(headers: List<String>): Map<String, String> {
        val map = mutableMapOf<String, String>()
        for (i in 1 until headers.size) {
            val line = headers[i]
            val idx = line.indexOf(':')
            if (idx != -1) {
                map[line.substring(0, idx).trim().lowercase()] = line.substring(idx + 1).trim()
            }
        }
        return map
    }

    fun parseQuery(qs: String): Map<String, String> {
        if (qs.isBlank()) return emptyMap()
        return qs.split("&").mapNotNull {
            val idx = it.indexOf('=')
            if (idx != -1) {
                URLDecoder.decode(it.substring(0, idx), "UTF-8") to URLDecoder.decode(it.substring(idx + 1), "UTF-8")
            } else null
        }.toMap()
    }

    fun readBodyString(input: InputStream, len: Int): String {
        if (len <= 0) return ""
        val buf = ByteArray(len)
        var total = 0
        while (total < len) {
            val r = input.read(buf, total, len - total)
            if (r == -1) break
            total += r
        }
        return String(buf, 0, total, StandardCharsets.UTF_8)
    }

    fun sendJsonResponse(out: OutputStream, status: Int, json: String) {
        val bytes = json.toByteArray(StandardCharsets.UTF_8)
        val resp = "HTTP/1.1 $status OK\r\n" +
                "Access-Control-Allow-Origin: *\r\n" +
                "Access-Control-Allow-Headers: Content-Type, Content-Length\r\n" +
                "Access-Control-Allow-Methods: GET, POST, OPTIONS\r\n" +
                "Content-Type: application/json; charset=utf-8\r\n" +
                "Content-Length: ${bytes.size}\r\n" +
                "Connection: close\r\n\r\n"
        out.write(resp.toByteArray(StandardCharsets.UTF_8))
        out.write(bytes)
        out.flush()
    }

    fun sendCorsOk(out: OutputStream) {
        val resp = "HTTP/1.1 200 OK\r\n" +
                "Access-Control-Allow-Origin: *\r\n" +
                "Access-Control-Allow-Methods: GET, POST, OPTIONS\r\n" +
                "Access-Control-Allow-Headers: Content-Type, Content-Length\r\n" +
                "Content-Length: 0\r\n" +
                "Connection: close\r\n\r\n"
        out.write(resp.toByteArray(StandardCharsets.UTF_8))
        out.flush()
    }
}
