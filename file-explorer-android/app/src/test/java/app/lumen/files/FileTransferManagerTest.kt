package app.lumen.files

import app.lumen.files.worker.FileOperationWorker
import org.junit.Assert.assertEquals
import org.junit.Test

class FileTransferManagerTest {

    @Test
    fun testConflictPoliciesDefined() {
        assertEquals("policy_overwrite", FileOperationWorker.POLICY_OVERWRITE)
        assertEquals("policy_skip", FileOperationWorker.POLICY_SKIP)
        assertEquals("policy_rename", FileOperationWorker.POLICY_RENAME)
    }

    @Test
    fun testActionsDefined() {
        assertEquals("action_copy", FileOperationWorker.ACTION_COPY)
        assertEquals("action_move", FileOperationWorker.ACTION_MOVE)
    }
}
