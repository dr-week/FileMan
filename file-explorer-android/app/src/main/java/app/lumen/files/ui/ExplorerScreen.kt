package app.lumen.files.ui

import android.net.Uri
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.rememberModalBottomSheetState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import app.lumen.files.ExplorerState
import app.lumen.files.model.ExplorerEntry
import app.lumen.files.model.ExplorerLocation
import app.lumen.files.model.FileCategory
import app.lumen.files.model.SortMode
import app.lumen.files.ui.components.BreadcrumbBar
import app.lumen.files.ui.components.CategoryFilterChips
import app.lumen.files.ui.components.DialogMode
import app.lumen.files.ui.components.EntriesGrid
import app.lumen.files.ui.components.EntriesList
import app.lumen.files.ui.components.ExplorerTopBar
import app.lumen.files.ui.components.LocationStrip
import app.lumen.files.ui.components.OperationDialog
import app.lumen.files.ui.components.OperationHistorySheet
import app.lumen.files.ui.components.SearchBarAndFilters
import app.lumen.files.ui.components.WelcomeState
import app.lumen.files.ui.theme.ElectricIndigo
import app.lumen.files.ui.theme.LumenAuraTheme
import app.lumen.files.ui.theme.ObsidianBg

import app.lumen.files.ui.components.ConflictDialog

import app.lumen.files.model.GroupMode

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ExplorerScreen(
    state: ExplorerState,
    entries: List<ExplorerEntry>,
    onChooseFolder: () -> Unit,
    onOpenLocation: (ExplorerLocation) -> Unit,
    onRemovePin: (ExplorerLocation) -> Unit,
    onQueryChange: (String) -> Unit,
    onSortChange: (SortMode) -> Unit,
    onGroupChange: (GroupMode) -> Unit,
    onCategorySelect: (FileCategory) -> Unit,
    onBreadcrumbClick: (ExplorerLocation) -> Unit,
    onGridChange: () -> Unit,
    onSelect: (Uri) -> Unit,
    onClearSelection: () -> Unit,
    onCreateFolder: (String) -> Unit,
    onCopyClick: () -> Unit,
    onCutClick: () -> Unit,
    onPasteClick: (String) -> Unit,
    onRenameSelected: (String) -> Unit,
    onDeleteSelected: () -> Unit,
    onOpenEntry: (ExplorerEntry) -> Unit
) {
    var showLocations by remember { mutableStateOf(false) }
    var showHistory by remember { mutableStateOf(false) }
    var showConflictDialog by remember { mutableStateOf(false) }
    var dialogMode by remember { mutableStateOf<DialogMode?>(null) }
    val sheetState = rememberModalBottomSheetState()

    LumenAuraTheme {
        Scaffold(
            containerColor = ObsidianBg,
            topBar = {
                ExplorerTopBar(
                    selectedCount = state.selected.size,
                    hasClipboardContent = state.clipboardUris.isNotEmpty(),
                    isGrid = state.grid,
                    onClearSelection = onClearSelection,
                    onCreateFolderClick = { dialogMode = DialogMode.Create },
                    onCopyClick = onCopyClick,
                    onCutClick = onCutClick,
                    onPasteClick = { showConflictDialog = true },
                    onRenameClick = { dialogMode = DialogMode.Rename },
                    onDeleteClick = { dialogMode = DialogMode.Delete },
                    onToggleGrid = onGridChange,
                    onToggleHistory = { showHistory = !showHistory },
                    onToggleLocations = { showLocations = !showLocations }
                )
            }
        ) { paddingValues ->
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues)
                    .padding(horizontal = 16.dp)
            ) {
                if (showLocations) {
                    LocationStrip(
                        pins = state.pins,
                        onOpenLocation = onOpenLocation,
                        onRemovePin = onRemovePin,
                        onChooseFolder = onChooseFolder
                    )
                }

                BreadcrumbBar(
                    breadcrumbs = state.breadcrumbs,
                    onBreadcrumbClick = onBreadcrumbClick
                )

                SearchBarAndFilters(
                    query = state.query,
                    currentSort = state.sort,
                    currentGroup = state.group,
                    onQueryChange = onQueryChange,
                    onSortChange = onSortChange,
                    onGroupChange = onGroupChange
                )

                CategoryFilterChips(
                    selectedCategory = state.category,
                    onCategorySelect = onCategorySelect
                )

                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(top = 8.dp)
                ) {
                    when {
                        state.location == null -> WelcomeState(onChooseFolder = onChooseFolder)
                        state.loading -> {
                            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                                CircularProgressIndicator(color = ElectricIndigo)
                            }
                        }
                        state.error != null -> {
                            Text(
                                text = state.error,
                                color = MaterialTheme.colorScheme.error,
                                modifier = Modifier.padding(24.dp)
                            )
                        }
                        entries.isEmpty() -> {
                            Text(
                                text = "This folder is empty.",
                                color = Color.Gray,
                                modifier = Modifier.padding(24.dp)
                            )
                        }
                        state.grid -> {
                            EntriesGrid(
                                entries = entries,
                                selected = state.selected,
                                onSelect = onSelect,
                                onOpen = onOpenEntry
                            )
                        }
                        else -> {
                            EntriesList(
                                entries = entries,
                                selected = state.selected,
                                onSelect = onSelect,
                                onOpen = onOpenEntry
                            )
                        }
                    }
                }
            }

            dialogMode?.let { mode ->
                OperationDialog(
                    mode = mode,
                    onDismiss = { dialogMode = null },
                    onConfirm = { input ->
                        when (mode) {
                            DialogMode.Create -> onCreateFolder(input)
                            DialogMode.Rename -> onRenameSelected(input)
                            DialogMode.Delete -> onDeleteSelected()
                        }
                        dialogMode = null
                    }
                )
            }

            if (showConflictDialog) {
                ConflictDialog(
                    onDismiss = { showConflictDialog = false },
                    onSelectPolicy = { policy ->
                        onPasteClick(policy)
                        showConflictDialog = false
                    }
                )
            }

            if (showHistory) {
                OperationHistorySheet(
                    operations = state.operations,
                    sheetState = sheetState,
                    onDismiss = { showHistory = false }
                )
            }
        }
    }
}
