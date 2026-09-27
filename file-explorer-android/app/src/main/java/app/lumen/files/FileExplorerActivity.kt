package app.lumen.files

import android.content.Intent
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.activity.viewModels
import androidx.compose.material3.MaterialTheme
import androidx.compose.runtime.getValue
import androidx.lifecycle.compose.collectAsStateWithLifecycle

import app.lumen.files.ui.ExplorerScreen
import app.lumen.files.ui.theme.LumenAuraTheme

class FileExplorerActivity : ComponentActivity() {
    private val model: ExplorerViewModel by viewModels()
    private val chooseFolder = registerForActivityResult(ActivityResultContracts.OpenDocumentTree()) { uri ->
        uri ?: return@registerForActivityResult
        val flags = Intent.FLAG_GRANT_READ_URI_PERMISSION or Intent.FLAG_GRANT_WRITE_URI_PERMISSION
        runCatching { contentResolver.takePersistableUriPermission(uri, flags) }
        model.addLocation(uri, "Selected folder")
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            LumenAuraTheme {
                val state by model.state.collectAsStateWithLifecycle()
                ExplorerScreen(
                    state = state,
                    entries = model.visibleEntries(),
                    onChooseFolder = { chooseFolder.launch(null) },
                    onOpenLocation = model::open,
                    onRemovePin = model::removePin,
                    onQueryChange = model::setQuery,
                    onSortChange = model::setSort,
                    onGroupChange = model::setGroup,
                    onCategorySelect = model::setCategory,
                    onBreadcrumbClick = model::navigateToBreadcrumb,
                    onGridChange = model::toggleGrid,
                    onSelect = model::toggleSelection,
                    onClearSelection = model::clearSelection,
                    onCreateFolder = model::createFolder,
                    onCopyClick = model::copySelected,
                    onCutClick = model::cutSelected,
                    onPasteClick = model::pasteSelected,
                    onRenameSelected = model::renameSelected,
                    onDeleteSelected = model::deleteSelected,
                    onOpenEntry = { entry ->
                        if (entry.isDirectory) model.open(app.lumen.files.model.ExplorerLocation(entry.uri, entry.name))
                        else openFile(entry.uri, entry.mimeType)
                    }
                )
            }
        }
    }

    private fun openFile(uri: android.net.Uri, type: String?) {
        try {
            val intent = Intent(Intent.ACTION_VIEW).apply {
                setDataAndType(uri, type ?: "*/*")
                addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
            }
            val chooser = Intent.createChooser(intent, "Open file with")
            startActivity(chooser)
        } catch (e: Exception) {
            android.widget.Toast.makeText(this, "No application found to open this file", android.widget.Toast.LENGTH_SHORT).show()
        }
    }
}
