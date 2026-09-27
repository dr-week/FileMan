package app.lumen.files.domain

import android.net.Uri

data class ClipboardState(
    val selected: Set<Uri> = emptySet(),
    val clipboardUris: Set<Uri> = emptySet(),
    val isMoveOperation: Boolean = false
) {
    val hasSelection: Boolean get() = selected.isNotEmpty()
    val hasClipboard: Boolean get() = clipboardUris.isNotEmpty()
}

object ExplorerClipboard {

    fun toggleSelection(currentSelected: Set<Uri>, uri: Uri): Set<Uri> {
        val updated = currentSelected.toMutableSet()
        if (!updated.add(uri)) {
            updated.remove(uri)
        }
        return updated
    }

    fun copy(selected: Set<Uri>): ClipboardState {
        return ClipboardState(
            selected = emptySet(),
            clipboardUris = selected,
            isMoveOperation = false
        )
    }

    fun cut(selected: Set<Uri>): ClipboardState {
        return ClipboardState(
            selected = emptySet(),
            clipboardUris = selected,
            isMoveOperation = true
        )
    }

    fun clearClipboard(): ClipboardState {
        return ClipboardState(
            selected = emptySet(),
            clipboardUris = emptySet(),
            isMoveOperation = false
        )
    }
}
