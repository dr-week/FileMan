package app.lumen.files

import app.lumen.files.model.ExplorerEntry
import app.lumen.files.model.FileCategory
import app.lumen.files.model.GroupMode
import app.lumen.files.model.category
import org.junit.Assert.assertEquals
import org.junit.Test

class ExplorerViewModelTest {

    @Test
    fun testVisibleEntriesSortingByName() {
        val entries = listOf(
            ExplorerEntry(android.net.Uri.EMPTY, "zeta.txt", "text/plain", false, 100, 1000),
            ExplorerEntry(android.net.Uri.EMPTY, "alpha.txt", "text/plain", false, 200, 500),
            ExplorerEntry(android.net.Uri.EMPTY, "Docs", null, true, null, 2000)
        )

        val sorted = entries.sortedWith(
            compareBy<ExplorerEntry> { !it.isDirectory }.thenComparator { a, b ->
                a.name.compareTo(b.name, ignoreCase = true)
            }
        )

        assertEquals("Docs", sorted[0].name)
        assertEquals("alpha.txt", sorted[1].name)
        assertEquals("zeta.txt", sorted[2].name)
    }

    @Test
    fun testFileCategoryClassification() {
        val image = ExplorerEntry(android.net.Uri.EMPTY, "photo.jpg", "image/jpeg", false, 100, 1000)
        val document = ExplorerEntry(android.net.Uri.EMPTY, "notes.pdf", "application/pdf", false, 200, 500)
        val archive = ExplorerEntry(android.net.Uri.EMPTY, "data.zip", "application/zip", false, 500, 800)

        assertEquals(FileCategory.IMAGES, image.category)
        assertEquals(FileCategory.DOCUMENTS, document.category)
        assertEquals(FileCategory.ARCHIVES, archive.category)
    }

    @Test
    fun testGroupingByExtension() {
        val entries = listOf(
            ExplorerEntry(android.net.Uri.EMPTY, "photo.jpg", "image/jpeg", false, 100, 1000),
            ExplorerEntry(android.net.Uri.EMPTY, "avatar.jpg", "image/jpeg", false, 150, 1200),
            ExplorerEntry(android.net.Uri.EMPTY, "notes.pdf", "application/pdf", false, 200, 500)
        )

        val grouped = entries.groupBy { it.name.substringAfterLast('.', "No Ext").uppercase() }
        assertEquals(2, grouped.keys.size)
        assertEquals(2, grouped["JPG"]?.size)
        assertEquals(1, grouped["PDF"]?.size)
    }

    @Test
    fun testGroupingByType() {
        val entries = listOf(
            ExplorerEntry(android.net.Uri.EMPTY, "photo.jpg", "image/jpeg", false, 100, 1000),
            ExplorerEntry(android.net.Uri.EMPTY, "notes.pdf", "application/pdf", false, 200, 500),
            ExplorerEntry(android.net.Uri.EMPTY, "Folder1", null, true, null, 2000)
        )

        val grouped = entries.groupBy { if (it.isDirectory) "Folders" else it.category.label }
        assertEquals(3, grouped.keys.size)
        assertEquals(1, grouped["Folders"]?.size)
        assertEquals(1, grouped["Images"]?.size)
        assertEquals(1, grouped["Docs"]?.size)
    }
}
