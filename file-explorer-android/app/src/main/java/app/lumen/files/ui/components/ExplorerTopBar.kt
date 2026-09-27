package app.lumen.files.ui.components

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Close
import androidx.compose.material.icons.outlined.ContentCopy
import androidx.compose.material.icons.outlined.ContentCut
import androidx.compose.material.icons.outlined.ContentPaste
import androidx.compose.material.icons.outlined.CreateNewFolder
import androidx.compose.material.icons.outlined.DeleteOutline
import androidx.compose.material.icons.outlined.DriveFileRenameOutline
import androidx.compose.material.icons.outlined.GridView
import androidx.compose.material.icons.outlined.History
import androidx.compose.material.icons.outlined.List
import androidx.compose.material.icons.outlined.MoreVert
import androidx.compose.material3.CenterAlignedTopAppBar
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import app.lumen.files.ui.theme.CyberCyan
import app.lumen.files.ui.theme.ElectricIndigo
import app.lumen.files.ui.theme.NeonEmerald
import app.lumen.files.ui.theme.ObsidianBg

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ExplorerTopBar(
    selectedCount: Int,
    hasClipboardContent: Boolean,
    isGrid: Boolean,
    onClearSelection: () -> Unit,
    onCreateFolderClick: () -> Unit,
    onCopyClick: () -> Unit,
    onCutClick: () -> Unit,
    onPasteClick: () -> Unit,
    onRenameClick: () -> Unit,
    onDeleteClick: () -> Unit,
    onToggleGrid: () -> Unit,
    onToggleHistory: () -> Unit,
    onToggleLocations: () -> Unit
) {
    CenterAlignedTopAppBar(
        colors = TopAppBarDefaults.centerAlignedTopAppBarColors(
            containerColor = ObsidianBg,
            titleContentColor = Color.White
        ),
        title = {
            Text(
                text = if (selectedCount > 0) "$selectedCount Selected" else "LUMEN FILES",
                fontWeight = FontWeight.Bold
            )
        },
        navigationIcon = {
            if (selectedCount > 0) {
                IconButton(onClick = onClearSelection) {
                    Icon(Icons.Outlined.Close, contentDescription = "Clear Selection", tint = Color.White)
                }
            }
        },
        actions = {
            if (selectedCount > 0) {
                IconButton(onClick = onCopyClick) {
                    Icon(Icons.Outlined.ContentCopy, contentDescription = "Copy", tint = CyberCyan)
                }
                IconButton(onClick = onCutClick) {
                    Icon(Icons.Outlined.ContentCut, contentDescription = "Cut", tint = ElectricIndigo)
                }
                if (selectedCount == 1) {
                    IconButton(onClick = onRenameClick) {
                        Icon(Icons.Outlined.DriveFileRenameOutline, contentDescription = "Rename", tint = ElectricIndigo)
                    }
                }
                IconButton(onClick = onDeleteClick) {
                    Icon(Icons.Outlined.DeleteOutline, contentDescription = "Delete", tint = Color.Red)
                }
            } else {
                if (hasClipboardContent) {
                    IconButton(onClick = onPasteClick) {
                        Icon(Icons.Outlined.ContentPaste, contentDescription = "Paste", tint = NeonEmerald)
                    }
                }
                IconButton(onClick = onCreateFolderClick) {
                    Icon(Icons.Outlined.CreateNewFolder, contentDescription = "New Folder", tint = ElectricIndigo)
                }
            }
            IconButton(onClick = onToggleGrid) {
                Icon(
                    if (isGrid) Icons.Outlined.List else Icons.Outlined.GridView,
                    contentDescription = "Toggle Grid/List View",
                    tint = Color.White
                )
            }
            IconButton(onClick = onToggleHistory) {
                Icon(Icons.Outlined.History, contentDescription = "History Log", tint = CyberCyan)
            }
            IconButton(onClick = onToggleLocations) {
                Icon(Icons.Outlined.MoreVert, contentDescription = "Locations", tint = Color.White)
            }
        }
    )
}
