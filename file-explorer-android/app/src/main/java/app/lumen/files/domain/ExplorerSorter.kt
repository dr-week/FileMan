package app.lumen.files.domain

import app.lumen.files.model.ExplorerEntry
import app.lumen.files.model.FileCategory
import app.lumen.files.model.GroupMode
import app.lumen.files.model.SortMode
import app.lumen.files.model.category
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

object ExplorerSorter {

    fun filterAndSort(
        entries: List<ExplorerEntry>,
        query: String,
        category: FileCategory,
        sortMode: SortMode
    ): List<ExplorerEntry> {
        return entries
            .filter { query.isBlank() || it.name.contains(query, ignoreCase = true) }
            .filter { category == FileCategory.ALL || it.isDirectory || it.category == category }
            .sortedWith(compareBy<ExplorerEntry> { !it.isDirectory }.thenComparator { first, second ->
                when (sortMode) {
                    SortMode.NAME -> first.name.compareTo(second.name, ignoreCase = true)
                    SortMode.MODIFIED -> (second.modifiedAt ?: 0).compareTo(first.modifiedAt ?: 0)
                    SortMode.SIZE -> (second.size ?: 0).compareTo(first.size ?: 0)
                    SortMode.TYPE -> (first.category.label).compareTo(second.category.label)
                    SortMode.EXTENSION -> (first.name.substringAfterLast('.', "")).compareTo(second.name.substringAfterLast('.', ""))
                }
            })
    }

    fun groupEntries(
        entries: List<ExplorerEntry>,
        groupMode: GroupMode
    ): Map<String, List<ExplorerEntry>> {
        if (groupMode == GroupMode.NONE) return mapOf("" to entries)

        val dateFormat = SimpleDateFormat("MMM yyyy", Locale.getDefault())
        return entries.groupBy { entry ->
            if (entry.isDirectory) {
                "Folders"
            } else {
                when (groupMode) {
                    GroupMode.TYPE -> entry.category.label
                    GroupMode.DATE -> entry.modifiedAt?.let { dateFormat.format(Date(it)) } ?: "Unknown Date"
                    GroupMode.EXTENSION -> entry.name.substringAfterLast('.', "No Ext").uppercase()
                    GroupMode.NONE -> ""
                }
            }
        }
    }
}
