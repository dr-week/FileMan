package app.lumen.files.net

import android.content.Context
import java.io.BufferedInputStream
import java.io.BufferedOutputStream
import java.net.ServerSocket
import java.net.Socket
import java.security.MessageDigest
import kotlin.concurrent.thread

class TransferServer(
    private val context: Context,
    val port: Int = 8888
) {
    private var serverSocket: ServerSocket? = null
    var isRunning = false
        private set

    fun start(onFileReceived: (String, Boolean) -> Unit) {
        if (isRunning) return
        isRunning = true
        thread(name = "LumenTransferServer") {
            try {
                serverSocket = ServerSocket(port)
                while (isRunning) {
                    val clientSocket = serverSocket?.accept() ?: break
                    handleClient(clientSocket, onFileReceived)
                }
            } catch (e: Exception) {
                // Server closed or port error
            } finally {
                stop()
            }
        }
    }

    private fun handleClient(socket: Socket, onFileReceived: (String, Boolean) -> Unit) {
        thread(name = "LumenClientWorker") {
            try {
                socket.soTimeout = 30000
                val input = BufferedInputStream(socket.getInputStream())
                val output = BufferedOutputStream(socket.getOutputStream())

                val headers = mutableListOf<String>()
                val lineBuf = StringBuilder()
                var prev = -1
                while (true) {
                    val curr = input.read()
                    if (curr == -1) break
                    if (prev == '\r'.code && curr == '\n'.code) {
                        val line = lineBuf.toString().trimEnd('\r')
                        if (line.isEmpty()) break
                        headers.add(line)
                        lineBuf.setLength(0)
                    } else if (curr != '\r'.code) {
                        lineBuf.append(curr.toChar())
                    }
                    prev = curr
                }

                if (headers.isNotEmpty()) {
                    TransferRoutes.handleRequest(context, headers, input, output, onFileReceived)
                }
            } catch (e: Exception) {
                onFileReceived("Transfer error: ${e.localizedMessage}", false)
            } finally {
                try { socket.close() } catch (_: Exception) {}
            }
        }
    }

    fun stop() {
        isRunning = false
        try {
            serverSocket?.close()
        } catch (_: Exception) {}
    }

    companion object {
        fun calculateChecksum(inputStream: java.io.InputStream): String {
            val digest = MessageDigest.getInstance("SHA-256")
            val buffer = ByteArray(8192)
            var bytesRead: Int
            while (inputStream.read(buffer).also { bytesRead = it } != -1) {
                digest.update(buffer, 0, bytesRead)
            }
            return digest.digest().joinToString("") { "%02x".format(it) }
        }
    }
}
