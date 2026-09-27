package app.lumen.files.net

import java.io.InputStream
import java.io.OutputStream
import java.net.HttpURLConnection
import java.net.URL
import org.json.JSONObject

class GoogleDriveApi(private val accessToken: String) {

    fun uploadFile(
        fileName: String,
        mimeType: String,
        inputStream: InputStream,
        targetCloudFolderId: String? = null
    ): String? {
        val url = URL("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart")
        val connection = url.openConnection() as HttpURLConnection
        val boundary = "=====LumenDriveBoundary${System.currentTimeMillis()}====="

        try {
            connection.requestMethod = "POST"
            connection.doOutput = true
            connection.setRequestProperty("Authorization", "Bearer $accessToken")
            connection.setRequestProperty("Content-Type", "multipart/related; boundary=$boundary")

            val out: OutputStream = connection.outputStream

            val metadataJson = JSONObject().apply {
                put("name", fileName)
                put("mimeType", mimeType)
                if (!targetCloudFolderId.isNull_Blank()) {
                    put("parents", org.json.JSONArray().put(targetCloudFolderId))
                }
            }.toString()

            val bodyHeader = "--$boundary\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n$metadataJson\r\n--$boundary\r\nContent-Type: $mimeType\r\n\r\n"
            out.write(bodyHeader.toByteArray())

            inputStream.copyTo(out)

            val bodyFooter = "\r\n--$boundary--\r\n"
            out.write(bodyFooter.toByteArray())
            out.flush()

            if (connection.responseCode in 200..299) {
                val responseStr = connection.inputStream.bufferedReader().use { it.readText() }
                val json = JSONObject(responseStr)
                return json.optString("id")
            }
        } catch (e: Exception) {
            e.printStackTrace()
        } finally {
            connection.disconnect()
        }
        return null
    }

    private fun String?.isNull_Blank(): Boolean = this == null || this.isBlank()
}
