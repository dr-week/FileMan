package app.lumen.files.data

import android.content.Context
import android.net.Uri
import app.lumen.files.model.ExplorerLocation

class PinStore(context: Context) {
    private val preferences = context.getSharedPreferences("lumen.pins.v1", Context.MODE_PRIVATE)

    fun load(): List<ExplorerLocation> = preferences.getStringSet("locations", emptySet())
        .orEmpty()
        .mapNotNull { value ->
            val parts = value.split("\u001F", limit = 2)
            if (parts.size != 2) null else runCatching { ExplorerLocation(Uri.parse(parts[0]), parts[1]) }.getOrNull()
        }
        .sortedBy { it.name.lowercase() }

    fun save(locations: List<ExplorerLocation>) {
        preferences.edit().putStringSet("locations", locations.map { "${it.uri}\u001F${it.name}" }.toSet()).apply()
    }
}
