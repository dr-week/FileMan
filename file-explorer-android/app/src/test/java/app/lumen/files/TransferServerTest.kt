package app.lumen.files

import app.lumen.files.net.TransferServer
import org.junit.Assert.assertEquals
import org.junit.Test
import java.io.ByteArrayInputStream

class TransferServerTest {

    @Test
    fun testSHA256ChecksumCalculation() {
        val sampleData = "LumenFiles Test Data Stream".toByteArray()
        val inputStream = ByteArrayInputStream(sampleData)
        val checksum = TransferServer.calculateChecksum(inputStream)

        // SHA-256 length should always be 64 hex characters
        assertEquals(64, checksum.length)
    }
}
