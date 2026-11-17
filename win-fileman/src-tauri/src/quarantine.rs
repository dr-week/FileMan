use std::path::{Path, PathBuf};
use std::time::{SystemTime, UNIX_EPOCH};
use crate::appdata_rules::format_unix_date;
use crate::models::{QuarantineActionResult, QuarantineRecord, QuarantineRequest};

fn quarantine_dir() -> Result<PathBuf, String> {
  let local = dirs_next::data_local_dir().ok_or("Could not resolve AppData\\Local")?;
  let dir = local.join("LumenFiles").join("Quarantine");
  std::fs::create_dir_all(&dir).map_err(|e| e.to_string())?;
  Ok(dir)
}

fn manifest_path() -> Result<PathBuf, String> {
  Ok(quarantine_dir()?.join("manifest.json"))
}

fn load_manifest() -> Vec<QuarantineRecord> {
  let Ok(path) = manifest_path() else { return Vec::new(); };
  let Ok(raw) = std::fs::read_to_string(path) else { return Vec::new(); };
  serde_json::from_str(&raw).unwrap_or_default()
}

fn save_manifest(records: &[QuarantineRecord]) -> Result<(), String> {
  let path = manifest_path()?;
  let json = serde_json::to_string_pretty(records).map_err(|e| e.to_string())?;
  std::fs::write(path, json).map_err(|e| e.to_string())
}

fn is_allowed_cleanup_target(target: &Path) -> bool {
  let s = target.to_string_lossy().to_lowercase();
  if s.starts_with("hkcu\\") || s.starts_with("hklm\\") { return false; }
  let Some(user) = dirs_next::home_dir() else { return false; };
  let user_str = user.to_string_lossy().to_lowercase();
  if !s.starts_with(&user_str) { return false; }
  let blocked_roots = ["appdata", "appdata\\local", "appdata\\roaming", "appdata\\locallow", "appdata\\local\\programs", "desktop"];
  !blocked_roots.iter().any(|b| s == format!("{user_str}\\{b}"))
}

#[tauri::command]
pub fn list_quarantine() -> Vec<QuarantineRecord> {
  load_manifest()
}

#[tauri::command]
pub async fn quarantine_paths(items: Vec<QuarantineRequest>) -> Result<QuarantineActionResult, String> {
  tauri::async_runtime::spawn_blocking(move || quarantine_sync(items))
    .await
    .map_err(|e| e.to_string())?
}

fn quarantine_sync(items: Vec<QuarantineRequest>) -> Result<QuarantineActionResult, String> {
  let q_root = quarantine_dir()?;
  let mut records = load_manifest();
  let mut moved_count = 0;
  let mut skipped_count = 0;
  let mut errors = Vec::new();
  let ts = SystemTime::now().duration_since(UNIX_EPOCH).map(|d| d.as_secs()).unwrap_or(0);
  let date_str = format_unix_date(ts);

  for item in items {
    let src = Path::new(&item.path);
    if !is_allowed_cleanup_target(src) || !src.exists() {
      skipped_count += 1;
      errors.push(format!("Skipped protected or missing path: {}", item.path));
      continue;
    }
    let file_name = src.file_name().unwrap_or_default().to_string_lossy();
    let dest = q_root.join(format!("{ts}_{}_{}", item.id, file_name));
    if std::fs::rename(src, &dest).is_err() {
      skipped_count += 1;
      errors.push(format!("In use or locked: {}", item.name));
      continue;
    }
    records.push(QuarantineRecord {
      id: format!("{ts}-{}", item.id),
      name: item.name,
      original_path: item.path,
      quarantine_path: dest.to_string_lossy().into_owned(),
      size_bytes: item.size_bytes,
      quarantined_at: date_str.clone(),
    });
    moved_count += 1;
  }

  save_manifest(&records)?;
  Ok(QuarantineActionResult { moved_count, skipped_count, errors, records })
}

#[tauri::command]
pub fn restore_quarantined_item(id: String) -> Result<Vec<QuarantineRecord>, String> {
  let mut records = load_manifest();
  let Some(idx) = records.iter().position(|r| r.id == id) else {
    return Err("Quarantine record not found.".into());
  };
  let rec = records[idx].clone();
  let src = Path::new(&rec.quarantine_path);
  let dest = Path::new(&rec.original_path);
  if dest.exists() {
    return Err("Original path already exists; cannot overwrite.".into());
  }
  if let Some(parent) = dest.parent() {
    std::fs::create_dir_all(parent).map_err(|e| e.to_string())?;
  }
  std::fs::rename(src, dest).map_err(|e| format!("Restore failed: {e}"))?;
  records.remove(idx);
  save_manifest(&records)?;
  Ok(records)
}

#[tauri::command]
pub fn purge_quarantined_item(id: String) -> Result<Vec<QuarantineRecord>, String> {
  let mut records = load_manifest();
  let Some(idx) = records.iter().position(|r| r.id == id) else {
    return Err("Quarantine record not found.".into());
  };
  let target = Path::new(&records[idx].quarantine_path);
  if target.is_dir() {
    std::fs::remove_dir_all(target).map_err(|e| e.to_string())?;
  } else if target.is_file() {
    std::fs::remove_file(target).map_err(|e| e.to_string())?;
  }
  records.remove(idx);
  save_manifest(&records)?;
  Ok(records)
}

#[tauri::command]
pub fn empty_quarantine() -> Result<Vec<QuarantineRecord>, String> {
  let mut remaining = Vec::new();
  for rec in load_manifest() {
    let target = Path::new(&rec.quarantine_path);
    let res = if target.is_dir() { std::fs::remove_dir_all(target) }
      else if target.is_file() { std::fs::remove_file(target) }
      else { Ok(()) };
    if res.is_err() { remaining.push(rec); }
  }
  save_manifest(&remaining)?;
  Ok(remaining)
}
