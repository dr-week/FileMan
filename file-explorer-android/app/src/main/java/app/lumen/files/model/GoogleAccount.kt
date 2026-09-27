package app.lumen.files.model

import android.net.Uri

data class GoogleAccount(
    val id: String,
    val email: String,
    val displayName: String,
    val avatarUrl: String? = null,
    val accessToken: String,
    val refreshToken: String? = null,
    val storageUsedBytes: Long = 0,
    val storageTotalBytes: Long = 0
)

data class FolderAccountMap(
    val folderUri: Uri,
    val folderName: String,
    val googleAccountId: String,
    val targetCloudFolderId: String? = null
)
