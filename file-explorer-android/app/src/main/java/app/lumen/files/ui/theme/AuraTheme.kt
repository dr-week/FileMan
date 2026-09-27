package app.lumen.files.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

// Avant-Garde Color Palette
val ObsidianBg = Color(0xFF0B0F19)
val GlassSurface = Color(0xFF161E2E)
val GlassSurfaceVariant = Color(0xFF1E293B)
val GlassBorder = Color(0xFF334155)

val ElectricIndigo = Color(0xFF6366F1)
val CyberCyan = Color(0xFF06B6D4)
val NeonEmerald = Color(0xFF10B981)
val CrimsonRose = Color(0xFFF43F5E)

val TextPrimary = Color(0xFFF8FAFC)
val TextSecondary = Color(0xFF94A3B8)

private val DarkColorScheme = darkColorScheme(
    primary = ElectricIndigo,
    secondary = CyberCyan,
    tertiary = NeonEmerald,
    background = ObsidianBg,
    surface = GlassSurface,
    surfaceVariant = GlassSurfaceVariant,
    onPrimary = Color.White,
    onSecondary = Color.Black,
    onBackground = TextPrimary,
    onSurface = TextPrimary,
    onSurfaceVariant = TextSecondary,
    error = CrimsonRose
)

@Composable
fun LumenAuraTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    MaterialTheme(
        colorScheme = DarkColorScheme,
        content = content
    )
}
