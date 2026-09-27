package app.lumen.files

import android.content.Context
import android.net.Uri
import android.provider.DocumentsContract
import androidx.documentfile.provider.DocumentFile
import app.lumen.files.model.ExplorerEntry
import app.lumen.files.model.OperationResult

class DocumentRepository(private val context: Context) {
    fun children(parent: Uri): List<ExplorerEntry> {
        val folder = resolveDocumentFolder(parent) ?: return emptyList()
        return folder.listFiles().map { document ->
            ExplorerEntry(
                uri = document.uri,
                name = document.name ?: "Untitled",
                mimeType = document.type,
                isDirectory = document.isDirectory,
                size = document.length().takeIf { !document.isDirectory },
                modifiedAt = document.lastModified().takeIf { it > 0 },
                canWrite = document.canWrite(),
                canDelete = document.canWrite(),
                canRename = document.canWrite()
            )
        }
    }

    private fun resolveDocumentFolder(uri: Uri): DocumentFile? {
        val treeFolder = DocumentFile.fromTreeUri(context, uri)
        if (treeFolder != null && treeFolder.exists() && treeFolder.isDirectory) {
            return treeFolder
        }
        val singleDoc = DocumentFile.fromSingleUri(context, uri)
        if (singleDoc != null && singleDoc.exists() && singleDoc.isDirectory) {
            return singleDoc
        }
        return treeFolder ?: singleDoc
    }

    fun createDirectory(parent: Uri, name: String): OperationResult<ExplorerEntry> {
        val trimmedName = name.trim()
        if (trimmedName.isBlank()) {
            return OperationResult.Failure("Folder name cannot be blank")
        }
        val folder = resolveDocumentFolder(parent)
            ?: return OperationResult.Failure("Selected location is unavailable or permission revoked")
        
        if (!folder.canWrite()) {
            return OperationResult.Failure("Write permission is denied for this location")
        }

        val created = folder.createDirectory(trimmedName)
            ?: return OperationResult.Failure("Provider failed to create folder '$trimmedName'")
        
        val entry = ExplorerEntry(
            uri = created.uri,
            name = created.name ?: trimmedName,
            mimeType = created.type,
            isDirectory = true,
            size = null,
            modifiedAt = created.lastModified(),
            canWrite = created.canWrite(),
            canDelete = created.canWrite(),
            canRename = created.canWrite()
        )
        return OperationResult.Success(entry)
    }

    fun rename(uri: Uri, name: String): OperationResult<Uri> {
        val trimmedName = name.trim()
        if (trimmedName.isBlank()) {
            return OperationResult.Failure("New name cannot be empty")
        }
        return try {
            val resultUri = DocumentsContract.renameDocument(context.contentResolver, uri, trimmedName)
            if (resultUri != null && resultUri != uri) {
                OperationResult.Success(resultUri)
            } else if (resultUri == uri) {
                OperationResult.Success(uri)
            } else {
                OperationResult.Failure("Provider returned null when renaming '$name'")
            }
        } catch (e: Exception) {
            OperationResult.Failure("Failed to rename file: ${e.localizedMessage}", e)
        }
    }

    fun delete(uri: Uri): OperationResult<Boolean> {
        val document = DocumentFile.fromSingleUri(context, uri)
            ?: return OperationResult.Failure("File is unavailable")
        
        if (!document.canWrite()) {
            return OperationResult.Failure("Delete permission denied for '${document.name}'")
        }

        return try {
            if (document.delete()) {
                OperationResult.Success(true)
            } else {
                OperationResult.Failure("Failed to delete '${document.name ?: uri.lastPathSegment}'")
            }
        } catch (e: Exception) {
            OperationResult.Failure("Error deleting document: ${e.localizedMessage}", e)
        }
    }
}

