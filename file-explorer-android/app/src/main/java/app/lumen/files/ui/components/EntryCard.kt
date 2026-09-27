package app.lumen.files.ui.components

import android.net.Uri
import androidx.compose.foundation.ExperimentalFoundationApi
import androidx.compose.foundation.combinedClickable
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Folder
import androidx.compose.material.icons.outlined.InsertDriveFile
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import app.lumen.files.model.ExplorerEntry
import app.lumen.files.ui.theme.CyberCyan
import app.lumen.files.ui.theme.ElectricIndigo
import app.lumen.files.ui.theme.GlassBorder
import app.lumen.files.ui.theme.GlassSurface
import app.lumen.files.ui.theme.GlassSurfaceVariant
import app.lumen.files.ui.theme.NeonEmerald
import app.lumen.files.ui.theme.TextSecondary
import java.text.DateFormat
import java.util.Date

import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.ui.draw.clip
import androidx.compose.ui.layout.ContentScale
import coil.compose.AsyncImage
import app.lumen.files.model.FileCategory
import app.lumen.files.model.category

@OptIn(ExperimentalFoundationApi::class)
@Composable
fun EntryCard(
    entry: ExplorerEntry,
    selected: Boolean,
    onSelect: (Uri) -> Unit,
    onOpen: (ExplorerEntry) -> Unit
) {
    val bgColor = if (selected) ElectricIndigo.copy(alpha = 0.25f) else GlassSurface
    val borderColor = if (selected) ElectricIndigo else GlassBorder
    val isMedia = entry.category == FileCategory.IMAGES || entry.category == FileCategory.VIDEOS

    GlassmorphicCard(
        backgroundColor = bgColor,
        borderColor = borderColor,
        modifier = Modifier
            .fillMaxWidth()
            .combinedClickable(
                onClick = { onOpen(entry) },
                onLongClick = { onSelect(entry.uri) }
            )
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically
        ) {
            if (isMedia) {
                AsyncImage(
                    model = entry.uri,
                    contentDescription = entry.name,
                    contentScale = ContentScale.Crop,
                    modifier = Modifier
                        .size(36.dp)
                        .clip(RoundedCornerShape(8.dp))
                )
            } else {
                Icon(
                    imageVector = if (entry.isDirectory) Icons.Outlined.Folder else Icons.Outlined.InsertDriveFile,
                    contentDescription = null,
                    tint = if (entry.isDirectory) CyberCyan else NeonEmerald,
                    modifier = Modifier.size(28.dp)
                )
            }
            Spacer(modifier = Modifier.width(12.dp))
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = entry.name,
                    fontWeight = FontWeight.SemiBold,
                    color = Color.White,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )
                Text(
                    text = formatEntryMetadata(entry),
                    style = MaterialTheme.typography.labelSmall,
                    color = TextSecondary
                )
            }
        }
    }
}

private fun formatEntryMetadata(entry: ExplorerEntry): String = buildList {
    if (entry.isDirectory) add("Folder") else add(entry.size?.let(::formatBytes) ?: entry.mimeType ?: "File")
    entry.modifiedAt?.let { add(DateFormat.getDateInstance(DateFormat.MEDIUM).format(Date(it))) }
}.joinToString(" · ")

private fun formatBytes(bytes: Long): String = when {
    bytes < 1024 -> "$bytes B"
    bytes < 1024 * 1024 -> "${bytes / 1024} KB"
    else -> "${bytes / (1024 * 1024)} MB"
}
