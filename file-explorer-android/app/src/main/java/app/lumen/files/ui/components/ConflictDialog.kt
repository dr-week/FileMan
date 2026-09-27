package app.lumen.files.ui.components

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import app.lumen.files.ui.theme.CyberCyan
import app.lumen.files.ui.theme.ElectricIndigo
import app.lumen.files.ui.theme.GlassSurface

@Composable
fun ConflictDialog(
    onDismiss: () -> Unit,
    onSelectPolicy: (String) -> Unit
) {
    AlertDialog(
        containerColor = GlassSurface,
        onDismissRequest = onDismiss,
        title = {
            Text(
                text = "File Name Conflict",
                fontWeight = FontWeight.Bold,
                color = Color.White
            )
        },
        text = {
            Column {
                Text(
                    text = "One or more files already exist in this destination folder. Choose a resolution policy:",
                    color = Color.LightGray
                )
                Spacer(modifier = Modifier.height(16.dp))
                Row(modifier = Modifier.fillMaxWidth()) {
                    TextButton(onClick = { onSelectPolicy(app.lumen.files.worker.FileOperationWorker.POLICY_OVERWRITE) }) {
                        Text("Overwrite", color = ElectricIndigo, fontWeight = FontWeight.Bold)
                    }
                    TextButton(onClick = { onSelectPolicy(app.lumen.files.worker.FileOperationWorker.POLICY_RENAME) }) {
                        Text("Keep Both", color = CyberCyan, fontWeight = FontWeight.Bold)
                    }
                    TextButton(onClick = { onSelectPolicy(app.lumen.files.worker.FileOperationWorker.POLICY_SKIP) }) {
                        Text("Skip", color = Color.Gray)
                    }
                }
            }
        },
        confirmButton = {},
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Cancel", color = Color.Gray)
            }
        }
    )
}
