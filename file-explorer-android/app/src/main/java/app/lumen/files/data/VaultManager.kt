package app.lumen.files.data

import java.io.InputStream
import java.io.OutputStream
import java.security.SecureRandom
import javax.crypto.Cipher
import javax.crypto.SecretKey
import javax.crypto.SecretKeyFactory
import javax.crypto.spec.GCMParameterSpec
import javax.crypto.spec.PBEKeySpec
import javax.crypto.spec.SecretKeySpec

class VaultManager {

    fun encryptStream(inputStream: InputStream, outputStream: OutputStream, passphrase: CharArray) {
        val salt = ByteArray(SALT_SIZE_BYTES)
        SecureRandom().nextBytes(salt)
        outputStream.write(salt)

        val iv = ByteArray(IV_SIZE_BYTES)
        SecureRandom().nextBytes(iv)
        outputStream.write(iv)

        val key = deriveKey(passphrase, salt)
        val cipher = Cipher.getInstance(TRANSFORMATION)
        cipher.init(Cipher.ENCRYPT_MODE, key, GCMParameterSpec(TAG_LENGTH_BITS, iv))

        val buffer = ByteArray(8192)
        var bytesRead: Int
        while (inputStream.read(buffer).also { bytesRead = it } != -1) {
            val encryptedBytes = cipher.update(buffer, 0, bytesRead)
            if (encryptedBytes != null) {
                outputStream.write(encryptedBytes)
            }
        }
        val finalBytes = cipher.doFinal()
        if (finalBytes != null) {
            outputStream.write(finalBytes)
        }
    }

    fun decryptStream(inputStream: InputStream, outputStream: OutputStream, passphrase: CharArray): Boolean {
        return try {
            val salt = ByteArray(SALT_SIZE_BYTES)
            var saltRead = 0
            while (saltRead < SALT_SIZE_BYTES) {
                val count = inputStream.read(salt, saltRead, SALT_SIZE_BYTES - saltRead)
                if (count == -1) return false
                saltRead += count
            }

            val iv = ByteArray(IV_SIZE_BYTES)
            var ivRead = 0
            while (ivRead < IV_SIZE_BYTES) {
                val count = inputStream.read(iv, ivRead, IV_SIZE_BYTES - ivRead)
                if (count == -1) return false
                ivRead += count
            }

            val key = deriveKey(passphrase, salt)
            val cipher = Cipher.getInstance(TRANSFORMATION)
            cipher.init(Cipher.DECRYPT_MODE, key, GCMParameterSpec(TAG_LENGTH_BITS, iv))

            val buffer = ByteArray(8192)
            var bytesRead: Int
            while (inputStream.read(buffer).also { bytesRead = it } != -1) {
                val decryptedBytes = cipher.update(buffer, 0, bytesRead)
                if (decryptedBytes != null) {
                    outputStream.write(decryptedBytes)
                }
            }
            val finalBytes = cipher.doFinal()
            if (finalBytes != null) {
                outputStream.write(finalBytes)
            }
            true
        } catch (e: Exception) {
            false
        }
    }

    private fun deriveKey(passphrase: CharArray, salt: ByteArray): SecretKey {
        val factory = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256")
        val spec = PBEKeySpec(passphrase, salt, ITERATION_COUNT, KEY_LENGTH_BITS)
        val keyBytes = factory.generateSecret(spec).encoded
        return SecretKeySpec(keyBytes, "AES")
    }

    companion object {
        private const val TRANSFORMATION = "AES/GCM/NoPadding"
        private const val KEY_LENGTH_BITS = 256
        private const val TAG_LENGTH_BITS = 128
        private const val SALT_SIZE_BYTES = 16
        private const val IV_SIZE_BYTES = 12
        private const val ITERATION_COUNT = 10000
    }
}
