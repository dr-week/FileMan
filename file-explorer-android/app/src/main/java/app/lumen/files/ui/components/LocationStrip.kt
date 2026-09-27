package app.lumen.files.ui.components

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Add
import androidx.compose.material.icons.outlined.Close
import androidx.compose.material3.AssistChip
import androidx.compose.material3.AssistChipDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import app.lumen.files.model.ExplorerLocation
import app.lumen.files.ui.theme.CyberCyan
import app.lumen.files.ui.theme.ElectricIndigo
import app.lumen.files.ui.theme.GlassSurfaceVariant

@Composable
fun LocationStrip(
    pins: List<ExplorerLocation>,
    onOpenLocation: (ExplorerLocation) -> Unit,
    onRemovePin: (ExplorerLocation) -> Unit,
    onChooseFolder: () -> Unit
) {
    LazyRow(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 8.dp),
        horizontalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        item {
            AssistChip(
                onClick = onChooseFolder,
                label = { Text("Add Root", color = Color.White) },
                leadingIcon = { Icon(Icons.Outlined.Add, contentDescription = null, tint = ElectricIndigo) },
                colors = AssistChipDefaults.assistChipColors(containerColor = GlassSurfaceVariant)
            )
        }
        items(pins, key = { it.uri }) { location ->
            AssistChip(
                onClick = { onOpenLocation(location) },
                label = {
                    Text(
                        location.name,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis,
                        color = CyberCyan
                    )
                },
                trailingIcon = {
                    Icon(
                        imageVector = Icons.Outlined.Close,
                        contentDescription = "Unpin",
                        tint = Color.Gray,
                        modifier = Modifier
                            .size(16.dp)
                            .clickable { onRemovePin(location) }
                    )
                },
                colors = AssistChipDefaults.assistChipColors(containerColor = GlassSurfaceVariant)
            )
        }
    }
}
