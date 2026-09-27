package app.lumen.files.worker

import android.content.Context
import android.net.Uri
import android.provider.DocumentsContract
import androidx.documentfile.provider.DocumentFile
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import androidx.work.workDataOf
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.InputStream
import java.io.OutputStream

class FileOperationWorker(
    private val context: Context,
    params: WorkerParameters
) : CoroutineWorker(context, params) {

    override suspend fun doWork(): Result = withContext(Dispatchers.IO) {
        val action = inputData.getString(KEY_ACTION) ?: return@withContext Result.failure()
        val sourceUriStrings = inputData.getStringArray(KEY_SOURCE_URIS) ?: return@withContext Result.failure()
        val destUriString = inputData.getString(KEY_DEST_URI) ?: return@withContext Result.failure()
        val conflictPolicy = inputData.getString(KEY_CONFLICT_POLICY) ?: POLICY_OVERWRITE

        val destUri = Uri.parse(destUriString)
        val destFolder = DocumentFile.fromTreeUri(context, destUri)
            ?: DocumentFile.fromSingleUri(context, destUri)
            ?: return@withContext Result.failure()

        var processedCount = 0
        val totalCount = sourceUriStrings.size

        for (uriString in sourceUriStrings) {
            val sourceUri = Uri.parse(uriString)
            val sourceDoc = DocumentFile.fromSingleUri(context, sourceUri) ?: continue
            val fileName = sourceDoc.name ?: "file_${System.currentTimeMillis()}"

            var targetFile = destFolder.findFile(fileName)
            if (targetFile != null) {
                when (conflictPolicy) {
                    POLICY_SKIP -> {
                        processedCount++
                        continue
                    }
                    POLICY_RENAME -> {
                        val newName = "Copy_${System.currentTimeMillis()}_$fileName"
                        targetFile = destFolder.createFile(sourceDoc.type ?: "*/*", newName)
                    }
                    POLICY_OVERWRITE -> {
                        targetFile.delete()
                        targetFile = destFolder.createFile(sourceDoc.type ?: "*/*", fileName)
                    }
                }
            } else {
                targetFile = destFolder.createFile(sourceDoc.type ?: "*/*", fileName)
            }

            if (targetFile == null) continue

            val success = copyStream(sourceUri, targetFile.uri)
            if (success) {
                if (action == ACTION_MOVE) {
                    sourceDoc.delete()
                }
                processedCount++
                val progress = ((processedCount.toFloat() / totalCount) * 100).toInt()
                setProgress(workDataOf(KEY_PROGRESS to progress))
            }
        }

        Result.success(workDataOf(KEY_PROCESSED_COUNT to processedCount))
    }

    private fun copyStream(src: Uri, dest: Uri): Boolean {
        return try {
            val inStream: InputStream? = context.contentResolver.openInputStream(src)
            val outStream: OutputStream? = context.contentResolver.openOutputStream(dest)
            if (inStream != null && outStream != null) {
                inStream.use { input ->
                    outStream.use { output ->
                        input.copyTo(output)
                    }
                }
                true
            } else false
        } catch (e: Exception) {
            false
        }
    }

    companion object {
        const val KEY_ACTION = "key_action"
        const val KEY_SOURCE_URIS = "key_source_uris"
        const val KEY_DEST_URI = "key_dest_uri"
        const val KEY_CONFLICT_POLICY = "key_conflict_policy"
        const val KEY_PROGRESS = "key_progress"
        const val KEY_PROCESSED_COUNT = "key_processed_count"

        const val ACTION_COPY = "action_copy"
        const val ACTION_MOVE = "action_move"

        const val POLICY_OVERWRITE = "policy_overwrite"
        const val POLICY_SKIP = "policy_skip"
        const val POLICY_RENAME = "policy_rename"
    }
}
