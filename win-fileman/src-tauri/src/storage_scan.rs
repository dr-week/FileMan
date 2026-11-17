use std::collections::{HashMap, HashSet};
use std::path::{Path, PathBuf};
use std::time::Instant;
use walkdir::WalkDir;

use crate::explorer::classify_extension;
use crate::models::{CategoryTotal, FolderTotal, ScanRoot, StorageScanResult};

#[tauri::command]
pub fn get_cleaner_scan_roots() -> Vec<ScanRoot> {
  let candidates = [
    ("Current user", dirs_next::home_dir()),
    ("AppData Local", dirs_next::data_local_dir()),
    ("AppData Roaming", dirs_next::data_dir()),
    ("Desktop", dirs_next::desktop_dir()),
    ("Documents", dirs_next::document_dir()),
    ("Downloads", dirs_next::download_dir()),
    ("Pictures", dirs_next::picture_dir()),
    ("Videos", dirs_next::video_dir()),
  ];
  let mut seen = HashSet::new();

  candidates.into_iter().filter_map(|(name, path)| {
    let path = path?;
    let canonical = path.canonicalize().ok()?;
    let key = canonical.to_string_lossy().to_lowercase();
    if !seen.insert(key) || !canonical.is_dir() {
      return None;
    }
    Some(ScanRoot { name: name.into(), path: canonical.to_string_lossy().into_owned() })
  }).collect()
}

#[tauri::command]
pub async fn scan_storage(root: String) -> Result<StorageScanResult, String> {
  tauri::async_runtime::spawn_blocking(move || scan_storage_sync(root))
    .await
    .map_err(|error| error.to_string())?
}

fn scan_storage_sync(root: String) -> Result<StorageScanResult, String> {
  let started = Instant::now();
  let root = Path::new(&root).canonicalize().map_err(|_| "The selected folder could not be found.".to_string())?;
  if !root.is_dir() {
    return Err("The selected path is not a folder.".into());
  }

  let mut total_bytes: u64 = 0;
  let mut file_count: u64 = 0;
  let mut folder_count: u64 = 0;
  let mut skipped_count: u64 = 0;
  let mut categories: HashMap<String, (u64, u64)> = HashMap::new();
  let mut folders: HashMap<PathBuf, (u64, u64)> = HashMap::new();

  for entry in WalkDir::new(&root).follow_links(false) {
    let Ok(entry) = entry else { skipped_count += 1; continue; };
    if entry.path_is_symlink() { skipped_count += 1; continue; }
    if entry.file_type().is_dir() {
      if entry.path() != root { folder_count += 1; }
      continue;
    }
    if !entry.file_type().is_file() { continue; }
    let Ok(metadata) = entry.metadata() else { skipped_count += 1; continue; };
    let size = metadata.len();
    let ext = entry.path().extension().and_then(|v| v.to_str()).map(str::to_lowercase);
    let category = classify_extension(ext.as_deref(), false);

    total_bytes = total_bytes.saturating_add(size);
    file_count += 1;
    let cat_entry = categories.entry(category).or_insert((0, 0));
    cat_entry.0 = cat_entry.0.saturating_add(size);
    cat_entry.1 += 1;

    let mut parent = entry.path().parent();
    while let Some(path) = parent {
      if !path.starts_with(&root) { break; }
      let folder_entry = folders.entry(path.to_path_buf()).or_insert((0, 0));
      folder_entry.0 = folder_entry.0.saturating_add(size);
      folder_entry.1 += 1;
      if path == root { break; }
      parent = path.parent();
    }
  }

  let mut category_totals: Vec<CategoryTotal> = categories.into_iter()
    .map(|(category, (size_bytes, file_count))| CategoryTotal { category, size_bytes, file_count })
    .collect();
  category_totals.sort_by(|a, b| b.size_bytes.cmp(&a.size_bytes));

  let mut largest_folders: Vec<FolderTotal> = folders.into_iter()
    .filter(|(path, (size, _))| *path != root && *size > 0)
    .map(|(path, (size_bytes, file_count))| FolderTotal {
      name: path.file_name().unwrap_or_default().to_string_lossy().into_owned(),
      path: path.to_string_lossy().into_owned(),
      size_bytes,
      file_count,
    })
    .collect();
  largest_folders.sort_by(|a, b| b.size_bytes.cmp(&a.size_bytes));
  largest_folders.truncate(10);

  Ok(StorageScanResult {
    root: root.to_string_lossy().into_owned(),
    total_bytes,
    file_count,
    folder_count,
    skipped_count,
    duration_ms: started.elapsed().as_millis(),
    categories: category_totals,
    largest_folders,
  })
}
