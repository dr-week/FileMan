package app.lumen.files.data

import android.content.Context
import android.net.Uri
import androidx.work.Data
import androidx.work.OneTimeWorkRequestBuilder
import androidx.work.WorkManager
import app.lumen.files.worker.FileOperationWorker

class FileTransferManager(private val context: Context) {
    private val workManager = WorkManager.getInstance(context)

    fun enqueueCopy(sourceUris: Set<Uri>, destinationUri: Uri, conflictPolicy: String = FileOperationWorker.POLICY_OVERWRITE) {
        val inputData = Data.Builder()
            .putString(FileOperationWorker.KEY_ACTION, FileOperationWorker.ACTION_COPY)
            .putStringArray(FileOperationWorker.KEY_SOURCE_URIS, sourceUris.map { it.toString() }.toTypedArray())
            .putString(FileOperationWorker.KEY_DEST_URI, destinationUri.toString())
            .putString(FileOperationWorker.KEY_CONFLICT_POLICY, conflictPolicy)
            .build()

        val request = OneTimeWorkRequestBuilder<FileOperationWorker>()
            .setInputData(inputData)
            .build()

        workManager.enqueue(request)
    }

    fun enqueueMove(sourceUris: Set<Uri>, destinationUri: Uri, conflictPolicy: String = FileOperationWorker.POLICY_OVERWRITE) {
        val inputData = Data.Builder()
            .putString(FileOperationWorker.KEY_ACTION, FileOperationWorker.ACTION_MOVE)
            .putStringArray(FileOperationWorker.KEY_SOURCE_URIS, sourceUris.map { it.toString() }.toTypedArray())
            .putString(FileOperationWorker.KEY_DEST_URI, destinationUri.toString())
            .putString(FileOperationWorker.KEY_CONFLICT_POLICY, conflictPolicy)
            .build()

        val request = OneTimeWorkRequestBuilder<FileOperationWorker>()
            .setInputData(inputData)
            .build()

        workManager.enqueue(request)
    }
}
