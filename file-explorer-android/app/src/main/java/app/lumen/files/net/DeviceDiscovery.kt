package app.lumen.files.net

import java.net.DatagramPacket
import java.net.DatagramSocket
import java.net.InetAddress
import kotlin.concurrent.thread

data class DiscoveredDevice(
    val ip: String,
    val name: String,
    val port: Int,
    val deviceType: String = "android"
)

class DeviceDiscovery(private val discoveryPort: Int = 8889) {
    private var socket: DatagramSocket? = null
    private var isListening = false

    fun startListening(onDeviceDiscovered: (DiscoveredDevice) -> Unit) {
        if (isListening) return
        isListening = true
        thread {
            try {
                socket = DatagramSocket(discoveryPort)
                val buffer = ByteArray(1024)
                while (isListening) {
                    val packet = DatagramPacket(buffer, buffer.size)
                    socket?.receive(packet)
                    val message = String(packet.data, 0, packet.length).trim()
                    if (message.startsWith("LUMEN_DISCOVERY")) {
                        val parts = message.split(":")
                        val deviceName = parts.getOrNull(1) ?: "Unknown Device"
                        val (deviceType, port) = if (parts.size >= 4) {
                            Pair(parts[2], parts[3].toIntOrNull() ?: 8888)
                        } else {
                            Pair("android", parts.getOrNull(2)?.toIntOrNull() ?: 8888)
                        }
                        val deviceIp = packet.address.hostAddress ?: ""
                        onDeviceDiscovered(DiscoveredDevice(deviceIp, deviceName, port, deviceType))
                    }
                }
            } catch (e: Exception) {
                // Socket closed or error during shutdown
            }
        }
    }

    fun broadcastPresence(deviceName: String, targetPort: Int = 8888, deviceType: String = "android") {
        thread {
            try {
                val broadcastSocket = DatagramSocket()
                broadcastSocket.broadcast = true
                val msg = "LUMEN_DISCOVERY:$deviceName:$deviceType:$targetPort"
                val bytes = msg.toByteArray()
                val packet = DatagramPacket(bytes, bytes.size, InetAddress.getByName("255.255.255.255"), discoveryPort)
                broadcastSocket.send(packet)
                broadcastSocket.close()
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }

    fun stop() {
        isListening = false
        try {
            socket?.close()
        } catch (_: Exception) {}
    }
}
