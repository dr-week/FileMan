use serde::Serialize;

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Location {
  pub name: String,
  pub path: String,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct FileRecord {
  pub id: String,
  pub name: String,
  pub path: String,
  #[serde(rename = "type")]
  pub kind: String,
  pub extension: Option<String>,
  pub size_bytes: Option<u64>,
  pub modified_at: Option<String>,
  pub category: String,
  pub is_link: bool,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DirectoryListing {
  pub path: String,
  pub entries: Vec<FileRecord>,
  pub skipped_count: usize,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ScanRoot {
  pub name: String,
  pub path: String,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CategoryTotal {
  pub category: String,
  pub size_bytes: u64,
  pub file_count: u64,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct FolderTotal {
  pub name: String,
  pub path: String,
  pub size_bytes: u64,
  pub file_count: u64,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct StorageScanResult {
  pub root: String,
  pub total_bytes: u64,
  pub file_count: u64,
  pub folder_count: u64,
  pub skipped_count: u64,
  pub duration_ms: u128,
  pub categories: Vec<CategoryTotal>,
  pub largest_folders: Vec<FolderTotal>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CleanerFinding {
  pub id: String,
  pub name: String,
  pub category: String,
  pub safety: String,
  pub path: String,
  pub size_bytes: u64,
  pub file_count: u64,
  pub last_modified: String,
  pub description: String,
  pub recommendation: String,
  pub evidence: String,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AppDataScanReport {
  pub scanned_at: String,
  pub duration_ms: u128,
  pub findings: Vec<CleanerFinding>,
  pub installed_app_count: usize,
  pub skipped_count: u64,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct VolumeSpaceInfo {
  pub root: String,
  pub total_bytes: u64,
  pub free_bytes: u64,
  pub used_bytes: u64,
}

#[derive(serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct QuarantineRequest {
  pub id: String,
  pub name: String,
  pub path: String,
  pub size_bytes: u64,
}

#[derive(Serialize, serde::Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct QuarantineRecord {
  pub id: String,
  pub name: String,
  pub original_path: String,
  pub quarantine_path: String,
  pub size_bytes: u64,
  pub quarantined_at: String,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct QuarantineActionResult {
  pub moved_count: usize,
  pub skipped_count: usize,
  pub errors: Vec<String>,
  pub records: Vec<QuarantineRecord>,
}
