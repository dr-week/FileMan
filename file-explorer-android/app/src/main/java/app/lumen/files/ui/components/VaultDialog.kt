package app.lumen.files.ui.components

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.height
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
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import app.lumen.files.ui.theme.ElectricIndigo
import app.lumen.files.ui.theme.GlassBorder
import app.lumen.files.ui.theme.GlassSurface
import app.lumen.files.ui.theme.NeonEmerald

@Composable
fun VaultDialog(
    isEncryptMode: Boolean,
    onDismiss: () -> Unit,
    onConfirmPassphrase: (String) -> Unit
) {
    var passphrase by remember { mutableStateOf("") }

    AlertDialog(
        containerColor = GlassSurface,
        onDismissRequest = onDismiss,
        title = {
            Text(
                text = if (isEncryptMode) "Encrypt Selected Files" else "Unlock Privacy Vault",
                fontWeight = FontWeight.Bold,
                color = Color.White
            )
        },
        text = {
            Column {
                Text(
                    text = if (isEncryptMode)
                        "Enter a passphrase to lock these files with AES-256 encryption."
                    else
                        "Enter your vault passphrase to decrypt and open files.",
                    color = Color.LightGray
                )
                Spacer(modifier = Modifier.height(16.dp))
                OutlinedTextField(
                    value = passphrase,
                    onValueChange = { passphrase = it },
                    label = { Text("Passphrase") },
                    singleLine = true,
                    visualTransformation = PasswordVisualTransformation(),
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
                onClick = { onConfirmPassphrase(passphrase) },
                enabled = passphrase.isNotBlank()
            ) {
                Text(
                    text = if (isEncryptMode) "Lock Files" else "Unlock",
                    color = if (isEncryptMode) NeonEmerald else ElectricIndigo,
                    fontWeight = FontWeight.Bold
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
