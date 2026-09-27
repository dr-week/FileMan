package app.lumen.files.ui.components

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Add
import androidx.compose.material.icons.outlined.FolderSpecial
import androidx.compose.material3.AssistChip
import androidx.compose.material3.AssistChipDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import app.lumen.files.ui.theme.ElectricIndigo
import app.lumen.files.ui.theme.GlassSurfaceVariant
import app.lumen.files.ui.theme.TextSecondary

@Composable
fun WelcomeState(onChooseFolder: () -> Unit) {
    Column(
        modifier = Modifier.padding(top = 64.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Icon(
            imageVector = Icons.Outlined.FolderSpecial,
            contentDescription = null,
            modifier = Modifier.size(72.dp),
            tint = ElectricIndigo
        )
        Text(
            text = "PRIVACY-FIRST EXPLORER",
            style = MaterialTheme.typography.titleMedium,
            fontWeight = FontWeight.Bold,
            color = Color.White,
            modifier = Modifier.padding(top = 16.dp)
        )
        Text(
            text = "Select a folder via Storage Access Framework to begin browsing.",
            style = MaterialTheme.typography.bodyMedium,
            color = TextSecondary,
            modifier = Modifier.padding(top = 8.dp)
        )
        AssistChip(
            onClick = onChooseFolder,
            label = { Text("Choose Storage Folder", color = Color.White) },
            leadingIcon = { Icon(Icons.Outlined.Add, contentDescription = null, tint = ElectricIndigo) },
            colors = AssistChipDefaults.assistChipColors(containerColor = GlassSurfaceVariant),
            modifier = Modifier.padding(top = 24.dp)
        )
    }
}
