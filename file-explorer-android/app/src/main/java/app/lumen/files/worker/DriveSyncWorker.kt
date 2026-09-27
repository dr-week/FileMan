package app.lumen.files.worker

import android.content.Context
import android.net.Uri
import androidx.documentfile.provider.DocumentFile
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import androidx.work.workDataOf
import app.lumen.files.data.AccountStore
import app.lumen.files.net.GoogleDriveApi
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

class DriveSyncWorker(
    private val context: Context,
    params: WorkerParameters
) : CoroutineWorker(context, params) {

    override suspend fun doWork(): Result = withContext(Dispatchers.IO) {
        val folderUriString = inputData.getString(KEY_FOLDER_URI) ?: return@withContext Result.failure()
        val fileUriString = inputData.getString(KEY_FILE_URI) ?: return@withContext Result.failure()

        val folderUri = Uri.parse(folderUriString)
        val fileUri = Uri.parse(fileUriString)

        val accountStore = AccountStore(context)
        val account = accountStore.getAccountForFolder(folderUri) ?: return@withContext Result.failure()
        val mapping = accountStore.loadFolderMappings().firstOrNull { it.folderUri == folderUri }

        val docFile = DocumentFile.fromSingleUri(context, fileUri) ?: return@withContext Result.failure()
        val fileName = docFile.name ?: "upload_${System.currentTimeMillis()}"
        val mimeType = docFile.type ?: "image/jpeg"

        val inputStream = context.contentResolver.openInputStream(fileUri) ?: return@withContext Result.failure()

        val driveApi = GoogleDriveApi(account.accessToken)
        val cloudFileId = driveApi.uploadFile(
            fileName = fileName,
            mimeType = mimeType,
            inputStream = inputStream,
            targetCloudFolderId = mapping?.targetCloudFolderId
        )

        if (cloudFileId != null) {
            Result.success(workDataOf(KEY_CLOUD_FILE_ID to cloudFileId))
        } else {
            Result.retry()
        }
    }

    companion object {
        const val KEY_FOLDER_URI = "key_folder_uri"
        const val KEY_FILE_URI = "key_file_uri"
        const val KEY_CLOUD_FILE_ID = "key_cloud_file_id"
    }
}
