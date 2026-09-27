package app.lumen.files.ui.components

import android.net.Uri
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.lazy.items
import androidx.compose.runtime.Composable
import androidx.compose.ui.unit.dp
import app.lumen.files.model.ExplorerEntry

@Composable
fun EntriesList(
    entries: List<ExplorerEntry>,
    selected: Set<Uri>,
    onSelect: (Uri) -> Unit,
    onOpen: (ExplorerEntry) -> Unit
) {
    LazyColumn(verticalArrangement = Arrangement.spacedBy(8.dp)) {
        items(entries, key = { it.uri }) { entry ->
            EntryCard(
                entry = entry,
                selected = selected.contains(entry.uri),
                onSelect = onSelect,
                onOpen = onOpen
            )
        }
    }
}

@Composable
fun EntriesGrid(
    entries: List<ExplorerEntry>,
    selected: Set<Uri>,
    onSelect: (Uri) -> Unit,
    onOpen: (ExplorerEntry) -> Unit
) {
    LazyVerticalGrid(
        columns = GridCells.Adaptive(150.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp),
        horizontalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        items(entries, key = { it.uri }) { entry ->
            EntryCard(
                entry = entry,
                selected = selected.contains(entry.uri),
                onSelect = onSelect,
                onOpen = onOpen
            )
        }
    }
}
