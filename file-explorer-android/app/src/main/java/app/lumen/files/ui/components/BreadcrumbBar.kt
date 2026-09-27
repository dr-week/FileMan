package app.lumen.files.ui.components

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.ChevronRight
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import app.lumen.files.model.ExplorerLocation
import app.lumen.files.ui.theme.CyberCyan
import app.lumen.files.ui.theme.TextSecondary

@Composable
fun BreadcrumbBar(
    breadcrumbs: List<ExplorerLocation>,
    onBreadcrumbClick: (ExplorerLocation) -> Unit
) {
    if (breadcrumbs.isEmpty()) return

    LazyRow(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 6.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        itemsIndexed(breadcrumbs) { index, location ->
            val isLast = index == breadcrumbs.lastIndex
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(
                    text = location.name,
                    style = MaterialTheme.typography.labelLarge,
                    fontWeight = if (isLast) FontWeight.Bold else FontWeight.Medium,
                    color = if (isLast) Color.White else CyberCyan,
                    modifier = Modifier
                        .clickable(enabled = !isLast) { onBreadcrumbClick(location) }
                        .padding(horizontal = 4.dp, vertical = 2.dp)
                )
                if (!isLast) {
                    Icon(
                        imageVector = Icons.Outlined.ChevronRight,
                        contentDescription = null,
                        tint = TextSecondary,
                        modifier = Modifier.padding(horizontal = 2.dp)
                    )
                }
            }
        }
    }
}
