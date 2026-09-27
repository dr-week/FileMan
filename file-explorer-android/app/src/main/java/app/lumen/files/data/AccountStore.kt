package app.lumen.files.data

import android.content.Context
import android.net.Uri
import app.lumen.files.model.FolderAccountMap
import app.lumen.files.model.GoogleAccount
import org.json.JSONArray
import org.json.JSONObject

class AccountStore(context: Context) {
    private val prefs = context.getSharedPreferences("lumen_google_accounts", Context.MODE_PRIVATE)

    fun saveAccounts(accounts: List<GoogleAccount>) {
        val array = JSONArray()
        accounts.forEach { acc ->
            val obj = JSONObject().apply {
                put("id", acc.id)
                put("email", acc.email)
                put("displayName", acc.displayName)
                put("avatarUrl", acc.avatarUrl ?: "")
                put("accessToken", acc.accessToken)
                put("refreshToken", acc.refreshToken ?: "")
                put("storageUsedBytes", acc.storageUsedBytes)
                put("storageTotalBytes", acc.storageTotalBytes)
            }
            array.put(obj)
        }
        prefs.edit().putString("accounts_json", array.toString()).apply()
    }

    fun loadAccounts(): List<GoogleAccount> {
        val jsonStr = prefs.getString("accounts_json", null) ?: return emptyList()
        return try {
            val array = JSONArray(jsonStr)
            List(array.length()) { i ->
                val obj = array.getJSONObject(i)
                GoogleAccount(
                    id = obj.getString("id"),
                    email = obj.getString("email"),
                    displayName = obj.getString("displayName"),
                    avatarUrl = obj.optString("avatarUrl").ifBlank { null },
                    accessToken = obj.getString("accessToken"),
                    refreshToken = obj.optString("refreshToken").ifBlank { null },
                    storageUsedBytes = obj.optLong("storageUsedBytes", 0),
                    storageTotalBytes = obj.optLong("storageTotalBytes", 0)
                )
            }
        } catch (e: Exception) {
            emptyList()
        }
    }

    fun saveFolderMappings(mappings: List<FolderAccountMap>) {
        val array = JSONArray()
        mappings.forEach { map ->
            val obj = JSONObject().apply {
                put("folderUri", map.folderUri.toString())
                put("folderName", map.folderName)
                put("googleAccountId", map.googleAccountId)
                put("targetCloudFolderId", map.targetCloudFolderId ?: "")
            }
            array.put(obj)
        }
        prefs.edit().putString("mappings_json", array.toString()).apply()
    }

    fun loadFolderMappings(): List<FolderAccountMap> {
        val jsonStr = prefs.getString("mappings_json", null) ?: return emptyList()
        return try {
            val array = JSONArray(jsonStr)
            List(array.length()) { i ->
                val obj = array.getJSONObject(i)
                FolderAccountMap(
                    folderUri = Uri.parse(obj.getString("folderUri")),
                    folderName = obj.getString("folderName"),
                    googleAccountId = obj.getString("googleAccountId"),
                    targetCloudFolderId = obj.optString("targetCloudFolderId").ifBlank { null }
                )
            }
        } catch (e: Exception) {
            emptyList()
        }
    }

    fun getAccountForFolder(folderUri: Uri): GoogleAccount? {
        val mapping = loadFolderMappings().firstOrNull { it.folderUri == folderUri } ?: return null
        return loadAccounts().firstOrNull { it.id == mapping.googleAccountId }
    }
}
