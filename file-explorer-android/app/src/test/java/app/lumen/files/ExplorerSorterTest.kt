package app.lumen.files

import app.lumen.files.domain.ExplorerSorter
import app.lumen.files.model.ExplorerEntry
import app.lumen.files.model.FileCategory
import app.lumen.files.model.GroupMode
import app.lumen.files.model.SortMode
import org.junit.Assert.assertEquals
import org.junit.Test

class ExplorerSorterTest {

    @Test
    fun testDomainSorterFilterAndSort() {
        val entries = listOf(
            ExplorerEntry(android.net.Uri.EMPTY, "zeta.txt", "text/plain", false, 100, 1000),
            ExplorerEntry(android.net.Uri.EMPTY, "alpha.txt", "text/plain", false, 200, 500),
            ExplorerEntry(android.net.Uri.EMPTY, "Docs", null, true, null, 2000)
        )

        val result = ExplorerSorter.filterAndSort(entries, "", FileCategory.ALL, SortMode.NAME)
        assertEquals("Docs", result[0].name)
        assertEquals("alpha.txt", result[1].name)
        assertEquals("zeta.txt", result[2].name)
    }

    @Test
    fun testDomainSorterGrouping() {
        val entries = listOf(
            ExplorerEntry(android.net.Uri.EMPTY, "photo.jpg", "image/jpeg", false, 100, 1000),
            ExplorerEntry(android.net.Uri.EMPTY, "notes.pdf", "application/pdf", false, 200, 500)
        )

        val grouped = ExplorerSorter.groupEntries(entries, GroupMode.TYPE)
        assertEquals(2, grouped.keys.size)
        assertEquals(1, grouped["Images"]?.size)
        assertEquals(1, grouped["Docs"]?.size)
    }
}
