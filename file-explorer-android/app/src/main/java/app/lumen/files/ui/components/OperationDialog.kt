package app.lumen.files.ui.components

import androidx.compose.material3.AlertDialog
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.graphics.Color
import app.lumen.files.ui.theme.CrimsonRose
import app.lumen.files.ui.theme.ElectricIndigo
import app.lumen.files.ui.theme.GlassBorder
import app.lumen.files.ui.theme.GlassSurface

enum class DialogMode { Create, Rename, Delete }

@Composable
fun OperationDialog(
    mode: DialogMode,
    onDismiss: () -> Unit,
    onConfirm: (String) -> Unit
) {
    var text by remember { mutableStateOf("") }
    val destructive = mode == DialogMode.Delete

    AlertDialog(
        containerColor = GlassSurface,
        onDismissRequest = onDismiss,
        title = {
            Text(
                text = when (mode) {
                    DialogMode.Create -> "New Folder"
                    DialogMode.Rename -> "Rename Item"
                    DialogMode.Delete -> "Delete Items?"
                },
                color = Color.White
            )
        },
        text = {
            if (destructive) {
                Text(
                    "This asks the storage provider to permanently delete the selected items.",
                    color = Color.LightGray
                )
            } else {
                OutlinedTextField(
                    value = text,
                    onValueChange = { text = it },
                    label = { Text(if (mode == DialogMode.Create) "Folder Name" else "New Name") },
                    singleLine = true,
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = ElectricIndigo,
                        unfocusedBorderColor = GlassBorder,
                        focusedTextColor = Color.White,
                        unfocusedTextColor = Color.White
                    )
                )
            }
        },
        confirmButton = {
            TextButton(
                onClick = { onConfirm(text) },
                enabled = destructive || text.isNotBlank()
            ) {
                Text(
                    text = if (destructive) "Delete" else "Save",
                    color = if (destructive) CrimsonRose else ElectricIndigo
                )
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Cancel", color = Color.Gray)
            }
        }
    )
}
