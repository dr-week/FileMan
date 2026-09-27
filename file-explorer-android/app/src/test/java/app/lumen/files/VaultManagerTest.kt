package app.lumen.files

import app.lumen.files.data.VaultManager
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test
import java.io.ByteArrayInputStream
import java.io.ByteArrayOutputStream

class VaultManagerTest {

    @Test
    fun testAES256EncryptionAndDecryptionRoundtrip() {
        val vaultManager = VaultManager()
        val originalText = "LumenFiles Top Secret Document Content 2026"
        val passphrase = "SecurePassword123!".toCharArray()

        val inputStream = ByteArrayInputStream(originalText.toByteArray())
        val encryptedOutputStream = ByteArrayOutputStream()

        vaultManager.encryptStream(inputStream, encryptedOutputStream, passphrase)
        val encryptedBytes = encryptedOutputStream.toByteArray()

        assertTrue(encryptedBytes.isNotEmpty())

        val encryptedInputStream = ByteArrayInputStream(encryptedBytes)
        val decryptedOutputStream = ByteArrayOutputStream()

        val success = vaultManager.decryptStream(encryptedInputStream, decryptedOutputStream, passphrase)
        assertTrue(success)

        val decryptedText = String(decryptedOutputStream.toByteArray())
        assertEquals(originalText, decryptedText)
    }
}
