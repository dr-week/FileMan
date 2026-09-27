package app.lumen.files

import androidx.compose.runtime.Composable
import app.lumen.files.model.ExplorerEntry
import app.lumen.files.model.ExplorerLocation
import app.lumen.files.model.SortMode
import app.lumen.files.model.GroupMode
import app.lumen.files.model.FileCategory

@Composable
fun LegacyExplorerScreen(
    state: ExplorerState,
    entries: List<ExplorerEntry>,
    onChooseFolder: () -> Unit,
    onOpenLocation: (ExplorerLocation) -> Unit,
    onRemovePin: (ExplorerLocation) -> Unit,
    onQueryChange: (String) -> Unit,
    onSortChange: (SortMode) -> Unit,
    onGridChange: () -> Unit,
    onSelect: (android.net.Uri) -> Unit,
    onClearSelection: () -> Unit,
    onCreateFolder: (String) -> Unit,
    onRenameSelected: (String) -> Unit,
    onDeleteSelected: () -> Unit,
    onOpenEntry: (ExplorerEntry) -> Unit
) {
    app.lumen.files.ui.ExplorerScreen(
        state = state,
        entries = entries,
        onChooseFolder = onChooseFolder,
        onOpenLocation = onOpenLocation,
        onRemovePin = onRemovePin,
        onQueryChange = onQueryChange,
        onSortChange = onSortChange,
        onGroupChange = {},
        onCategorySelect = {},
        onBreadcrumbClick = onOpenLocation,
        onGridChange = onGridChange,
        onSelect = onSelect,
        onClearSelection = onClearSelection,
        onCreateFolder = onCreateFolder,
        onCopyClick = {},
        onCutClick = {},
        onPasteClick = {},
        onRenameSelected = onRenameSelected,
        onDeleteSelected = onDeleteSelected,
        onOpenEntry = onOpenEntry
    )
}
