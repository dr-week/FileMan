package app.lumen.files

import android.app.Application
import android.net.Uri
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import app.lumen.files.data.FileTransferManager
import app.lumen.files.data.PinStore
import app.lumen.files.domain.ExplorerClipboard
import app.lumen.files.domain.ExplorerSorter
import app.lumen.files.model.ExplorerEntry
import app.lumen.files.model.ExplorerLocation
import app.lumen.files.model.FileCategory
import app.lumen.files.model.GroupMode
import app.lumen.files.model.OperationEvent
import app.lumen.files.model.OperationResult
import app.lumen.files.model.SortMode
import app.lumen.files.worker.FileOperationWorker
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

data class ExplorerState(
    val location: ExplorerLocation? = null,
    val breadcrumbs: List<ExplorerLocation> = emptyList(),
    val entries: List<ExplorerEntry> = emptyList(),
    val pins: List<ExplorerLocation> = emptyList(),
    val query: String = "",
    val sort: SortMode = SortMode.NAME,
    val group: GroupMode = GroupMode.NONE,
    val category: FileCategory = FileCategory.ALL,
    val grid: Boolean = false,
    val selected: Set<Uri> = emptySet(),
    val clipboardUris: Set<Uri> = emptySet(),
    val isMoveOperation: Boolean = false,
    val loading: Boolean = false,
    val error: String? = null,
    val operations: List<OperationEvent> = emptyList()
)

class ExplorerViewModel(application: Application) : AndroidViewModel(application) {
    private val repository = DocumentRepository(application)
    private val pinStore = PinStore(application)
    private val transferManager = FileTransferManager(application)
    private var activeLoadGeneration: Long = 0

    private val _state = MutableStateFlow(ExplorerState(pins = pinStore.load()))
    val state: StateFlow<ExplorerState> = _state.asStateFlow()

    fun open(location: ExplorerLocation) {
        val currentGen = ++activeLoadGeneration
        _state.update { current ->
            val breadcrumbs = if (current.breadcrumbs.any { it.uri == location.uri }) {
                val index = current.breadcrumbs.indexOfFirst { it.uri == location.uri }
                current.breadcrumbs.take(index + 1)
            } else current.breadcrumbs + location

            current.copy(location = location, breadcrumbs = breadcrumbs, selected = emptySet(), loading = true, error = null)
        }
        viewModelScope.launch {
            val result = runCatching { withContext(Dispatchers.IO) { repository.children(location.uri) } }
            if (currentGen == activeLoadGeneration) {
                result.onSuccess { entries -> _state.update { it.copy(entries = entries, loading = false) } }
                    .onFailure { _state.update { it.copy(loading = false, error = "Can't open this location.") } }
            }
        }
    }

    fun navigateToBreadcrumb(location: ExplorerLocation) = open(location)

    fun addLocation(uri: Uri, name: String) {
        val location = ExplorerLocation(uri, name)
        val updated = (_state.value.pins.filterNot { it.uri == uri } + location).sortedBy { it.name.lowercase() }
        pinStore.save(updated)
        _state.update { it.copy(pins = updated, breadcrumbs = emptyList()) }
        open(location)
    }

    fun removePin(location: ExplorerLocation) {
        val updated = _state.value.pins.filterNot { it.uri == location.uri }
        pinStore.save(updated)
        _state.update { it.copy(pins = updated) }
    }

    fun setQuery(query: String) = _state.update { it.copy(query = query) }
    fun setSort(sort: SortMode) = _state.update { it.copy(sort = sort) }
    fun setGroup(group: GroupMode) = _state.update { it.copy(group = group) }
    fun setCategory(category: FileCategory) = _state.update { it.copy(category = category) }
    fun toggleGrid() = _state.update { it.copy(grid = !it.grid) }

    fun toggleSelection(uri: Uri) = _state.update {
        it.copy(selected = ExplorerClipboard.toggleSelection(it.selected, uri))
    }
    fun clearSelection() = _state.update { it.copy(selected = emptySet()) }

    fun copySelected() = _state.update {
        val res = ExplorerClipboard.copy(it.selected)
        it.copy(selected = res.selected, clipboardUris = res.clipboardUris, isMoveOperation = res.isMoveOperation)
    }

    fun cutSelected() = _state.update {
        val res = ExplorerClipboard.cut(it.selected)
        it.copy(selected = res.selected, clipboardUris = res.clipboardUris, isMoveOperation = res.isMoveOperation)
    }

    fun pasteSelected(conflictPolicy: String = FileOperationWorker.POLICY_OVERWRITE) {
        val clipboard = _state.value.clipboardUris
        val location = _state.value.location ?: return
        if (clipboard.isEmpty()) return

        if (_state.value.isMoveOperation) transferManager.enqueueMove(clipboard, location.uri, conflictPolicy)
        else transferManager.enqueueCopy(clipboard, location.uri, conflictPolicy)

        val eventText = if (_state.value.isMoveOperation) "Moving ${clipboard.size} files in background" else "Copying ${clipboard.size} files in background"
        _state.update {
            val res = ExplorerClipboard.clearClipboard()
            it.copy(clipboardUris = res.clipboardUris, isMoveOperation = res.isMoveOperation, operations = listOf(OperationEvent(eventText, successful = true)) + it.operations.take(19))
        }
        open(location)
    }

    fun createFolder(name: String) = performMutation("Created folder $name") { repository.createDirectory(it, name) }

    fun renameSelected(name: String) {
        val target = _state.value.entries.firstOrNull { it.uri in _state.value.selected } ?: return
        performMutation("Renamed ${target.name} to $name") { repository.rename(target.uri, name) }
    }

    fun deleteSelected() {
        val targets = _state.value.selected
        if (targets.isEmpty()) return
        val location = _state.value.location ?: return
        _state.update { it.copy(loading = true, error = null) }
        viewModelScope.launch {
            val successfulUris = mutableSetOf<Uri>()
            withContext(Dispatchers.IO) {
                targets.forEach { uri ->
                    if (repository.delete(uri) is OperationResult.Success) successfulUris.add(uri)
                }
            }
            val eventText = if (successfulUris.size == targets.size) "Deleted ${targets.size} items" else "Deleted ${successfulUris.size} of ${targets.size} items"
            _state.update { it.copy(selected = it.selected - successfulUris, loading = false, operations = listOf(OperationEvent(eventText, successful = successfulUris.isNotEmpty())) + it.operations.take(19)) }
            open(location)
        }
    }

    private fun performMutation(description: String, action: (Uri) -> OperationResult<*>) {
        val location = _state.value.location ?: return
        _state.update { it.copy(loading = true, error = null) }
        viewModelScope.launch {
            val result = withContext(Dispatchers.IO) { action(location.uri) }
            val (success, err) = when (result) {
                is OperationResult.Success -> true to null
                is OperationResult.Failure -> false to result.message
            }
            _state.update { it.copy(selected = emptySet(), loading = false, operations = listOf(OperationEvent(description, successful = success)) + it.operations.take(19), error = err) }
            open(location)
        }
    }

    fun visibleEntries(): List<ExplorerEntry> = ExplorerSorter.filterAndSort(_state.value.entries, _state.value.query, _state.value.category, _state.value.sort)

    fun groupedEntries(): Map<String, List<ExplorerEntry>> = ExplorerSorter.groupEntries(visibleEntries(), _state.value.group)
}
