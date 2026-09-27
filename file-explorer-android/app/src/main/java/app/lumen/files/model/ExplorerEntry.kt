package app.lumen.files.model

import android.net.Uri

data class ExplorerEntry(
    val uri: Uri,
    val name: String,
    val mimeType: String?,
    val isDirectory: Boolean,
    val size: Long?,
    val modifiedAt: Long?,
    val canWrite: Boolean = true,
    val canDelete: Boolean = true,
    val canRename: Boolean = true
)

enum class SortMode(val label: String) {
    NAME("Name"),
    MODIFIED("Modified"),
    SIZE("Size"),
    TYPE("Type"),
    EXTENSION("Extension")
}

enum class GroupMode(val label: String) {
    NONE("No Grouping"),
    TYPE("Group by Type"),
    DATE("Group by Date"),
    EXTENSION("Group by Extension")
}

enum class FileCategory(val label: String) {
    ALL("All"),
    IMAGES("Images"),
    VIDEOS("Videos"),
    AUDIO("Audio"),
    DOCUMENTS("Docs"),
    ARCHIVES("Archives")
}


val ExplorerEntry.category: FileCategory get() {
    if (isDirectory) return FileCategory.ALL
    val mime = mimeType?.lowercase() ?: ""
    val ext = name.substringAfterLast('.', "").lowercase()
    return when {
        mime.startsWith("image/") || ext in listOf("jpg", "jpeg", "png", "gif", "webp", "svg") -> FileCategory.IMAGES
        mime.startsWith("video/") || ext in listOf("mp4", "mkv", "avi", "mov", "webm") -> FileCategory.VIDEOS
        mime.startsWith("audio/") || ext in listOf("mp3", "wav", "flac", "ogg", "m4a") -> FileCategory.AUDIO
        mime.startsWith("text/") || mime.contains("pdf") || mime.contains("word") || mime.contains("excel") || ext in listOf("pdf", "doc", "docx", "txt", "csv", "json") -> FileCategory.DOCUMENTS
        mime.contains("zip") || mime.contains("rar") || mime.contains("tar") || ext in listOf("zip", "rar", "7z", "tar", "gz") -> FileCategory.ARCHIVES
        else -> FileCategory.ALL
    }
}


data class ExplorerLocation(val uri: Uri, val name: String)

data class OperationEvent(
    val description: String,
    val completedAt: Long = System.currentTimeMillis(),
    val successful: Boolean
)

sealed class OperationResult<out T> {
    data class Success<out T>(val data: T) : OperationResult<T>()
    data class Failure(val message: String, val cause: Throwable? = null) : OperationResult<Nothing>()
}

