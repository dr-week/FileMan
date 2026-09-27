package app.lumen.files.ui.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import app.lumen.files.model.FileCategory
import app.lumen.files.ui.theme.CyberCyan
import app.lumen.files.ui.theme.GlassSurface
import app.lumen.files.ui.theme.TextSecondary

@Composable
fun CategoryFilterChips(
    selectedCategory: FileCategory,
    onCategorySelect: (FileCategory) -> Unit
) {
    LazyRow(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp),
        horizontalArrangement = Arrangement.spacedBy(6.dp)
    ) {
        items(FileCategory.entries.toTypedArray()) { category ->
            val isSelected = category == selectedCategory
            FilterChip(
                selected = isSelected,
                onClick = { onCategorySelect(category) },
                label = { Text(category.label) },
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
