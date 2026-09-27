package app.lumen.files.ui.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Search
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import app.lumen.files.model.GroupMode
import app.lumen.files.model.SortMode
import app.lumen.files.ui.theme.CyberCyan
import app.lumen.files.ui.theme.ElectricIndigo
import app.lumen.files.ui.theme.GlassBorder
import app.lumen.files.ui.theme.GlassSurface
import app.lumen.files.ui.theme.TextSecondary

@Composable
fun SearchBarAndFilters(
    query: String,
    currentSort: SortMode,
    currentGroup: GroupMode,
    onQueryChange: (String) -> Unit,
    onSortChange: (SortMode) -> Unit,
    onGroupChange: (GroupMode) -> Unit
) {
    Column(modifier = Modifier.fillMaxWidth()) {
        OutlinedTextField(
            value = query,
            onValueChange = onQueryChange,
            modifier = Modifier.fillMaxWidth(),
            leadingIcon = { Icon(Icons.Outlined.Search, contentDescription = null, tint = ElectricIndigo) },
            singleLine = true,
            placeholder = { Text("Search files & folders...", color = TextSecondary) },
            shape = RoundedCornerShape(16.dp),
            colors = OutlinedTextFieldDefaults.colors(
                focusedContainerColor = GlassSurface,
                unfocusedContainerColor = GlassSurface,
                focusedBorderColor = ElectricIndigo,
                unfocusedBorderColor = GlassBorder,
                focusedTextColor = Color.White,
                unfocusedTextColor = Color.White
            )
        )
        LazyRow(
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 8.dp),
            horizontalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            items(SortMode.entries.toTypedArray()) { mode ->
                val selected = mode == currentSort
                FilterChip(
                    selected = selected,
                    onClick = { onSortChange(mode) },
                    label = { Text("Sort: ${mode.label}") },
                    colors = FilterChipDefaults.filterChipColors(
                        selectedContainerColor = ElectricIndigo,
                        selectedLabelColor = Color.White,
                        containerColor = GlassSurface,
                        labelColor = TextSecondary
                    )
                )
            }
            items(GroupMode.entries.toTypedArray()) { group ->
                val selected = group == currentGroup
                FilterChip(
                    selected = selected,
                    onClick = { onGroupChange(group) },
                    label = { Text(group.label) },
                    colors = FilterChipDefaults.filterChipColors(
                        selectedContainerColor = CyberCyan,
                        selectedLabelColor = Color.Black,
                        containerColor = GlassSurface,
                        labelColor = TextSecondary
                    )
                )
            }
        }
    }
}
