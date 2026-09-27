package app.lumen.files

import app.lumen.files.model.GoogleAccount
import org.junit.Assert.assertEquals
import org.junit.Test

class AccountStoreTest {

    @Test
    fun testGoogleAccountModel() {
        val account = GoogleAccount(
            id = "acc_123",
            email = "work@company.com",
            displayName = "Work Account",
            accessToken = "ya29.fake_token"
        )

        assertEquals("acc_123", account.id)
        assertEquals("work@company.com", account.email)
        assertEquals("Work Account", account.displayName)
        assertEquals("ya29.fake_token", account.accessToken)
    }
}
