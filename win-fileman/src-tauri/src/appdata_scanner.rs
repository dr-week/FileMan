use std::path::Path;
use std::time::Instant;
use crate::appdata_rules::{
  format_unix_date, is_commit_hash_dir, measure_dir, read_installed_app_names, scan_startup_anomalies,
};
use crate::models::{AppDataScanReport, CleanerFinding};

#[tauri::command]
pub async fn scan_appdata_candidates() -> Result<AppDataScanReport, String> {
  tauri::async_runtime::spawn_blocking(scan_appdata_sync)
    .await
    .map_err(|error| error.to_string())?
}

#[cfg(test)]
pub fn scan_appdata_sync_for_test() -> Result<AppDataScanReport, String> {
  scan_appdata_sync()
}

fn add_dir_finding(
  findings: &mut Vec<CleanerFinding>,
  skipped: &mut u64,
  id: &str,
  name: &str,
  category: &str,
  safety: &str,
  path: &Path,
  description: &str,
  recommendation: &str,
  evidence: &str,
) {
  if !path.is_dir() { return; }
  let (bytes, files, skip, mtime) = measure_dir(path);
  *skipped += skip;
  if bytes == 0 && files == 0 && category != "orphaned" { return; }
  findings.push(CleanerFinding {
    id: id.into(),
    name: name.into(),
    category: category.into(),
    safety: safety.into(),
    path: path.to_string_lossy().into_owned(),
    size_bytes: bytes,
    file_count: files,
    last_modified: format_unix_date(mtime),
    description: description.into(),
    recommendation: recommendation.into(),
    evidence: evidence.into(),
  });
}

fn scan_appdata_sync() -> Result<AppDataScanReport, String> {
  let started = Instant::now();
  let local = dirs_next::data_local_dir().ok_or("Could not resolve AppData\\Local")?;
  let roaming = dirs_next::data_dir().ok_or("Could not resolve AppData\\Roaming")?;
  let installed_apps = read_installed_app_names();
  let mut findings = Vec::new();
  let mut skipped = 0u64;

  // 1. Staged *-updater installers in AppData\Local
  if let Ok(entries) = std::fs::read_dir(&local) {
    for entry in entries.flatten() {
      let path = entry.path();
      let name = entry.file_name().to_string_lossy().into_owned();
      if path.is_dir() && name.to_lowercase().ends_with("-updater") {
        add_dir_finding(
          &mut findings, &mut skipped, &format!("updater-{}", name.to_lowercase()),
          &format!("Staged Updater: {name}"), "installers", "safe", &path,
          "Downloaded Electron/Squirrel installer payloads left behind after app update.",
          "Safe to quarantine; apps re-download installers if another update is needed.",
          "Matched *-updater staged installer pattern in AppData\\Local.",
        );
      }
    }
  }

  // 2. Empty 0-byte leftover folders in AppData\Local\Programs
  let programs_dir = local.join("Programs");
  if let Ok(entries) = std::fs::read_dir(&programs_dir) {
    for entry in entries.flatten() {
      let path = entry.path();
      if !path.is_dir() { continue; }
      let name = entry.file_name().to_string_lossy().into_owned();
      let (bytes, files, skip, _) = measure_dir(&path);
      skipped += skip;
      if bytes == 0 && files == 0 && name != "Common" {
        add_dir_finding(
          &mut findings, &mut skipped, &format!("empty-prog-{}", name.to_lowercase()),
          &format!("Empty Program Folder: {name}"), "orphaned", "safe", &path,
          "Zero-byte directory left in Local\\Programs after uninstall or incomplete setup.",
          "Safe to remove empty directory.",
          "0 files and 0 bytes inside AppData\\Local\\Programs.",
        );
      }
    }
  }

  // 3. Stale VS Code / Insiders multi-version commit folders (keep newest)
  for editor in ["Microsoft VS Code", "Microsoft VS Code Insiders"] {
    let ep = programs_dir.join(editor);
    if !ep.is_dir() { continue; }
    let mut commits: Vec<(u64, String, std::path::PathBuf)> = std::fs::read_dir(&ep)
      .into_iter().flatten().flatten()
      .filter(|e| e.path().is_dir() && is_commit_hash_dir(&e.file_name().to_string_lossy()))
      .map(|e| {
        let (_, _, _, mt) = measure_dir(&e.path());
        (mt, e.file_name().to_string_lossy().into_owned(), e.path())
      })
      .collect();
    commits.sort_by(|a, b| b.0.cmp(&a.0));
    for (_, hash, path) in commits.into_iter().skip(1) {
      add_dir_finding(
        &mut findings, &mut skipped, &format!("vscode-old-{hash}"),
        &format!("{editor} Old Build ({hash})"), "updates", "caution", &path,
        "Older commit-hash build directory retained alongside a newer build.",
        "Review and remove if editor is closed and updated.",
        "Multiple commit-hash folders detected; newer build exists.",
      );
    }
  }

  // 4. Known caches, temp, telemetry & dev tool stores
  let known_rules: &[(&str, &str, &str, &str, &str, &str)] = &[
    ("temp", "Windows User Temp", "temp", "safe", "Temp", "Temporary files created by installers and apps."),
    ("npm-cache", "npm Global Cache", "dev-tools", "safe", "npm-cache", "Cached npm package tarballs."),
    ("pnpm-store", "pnpm Package Store", "dev-tools", "caution", "pnpm\\store", "Global pnpm content-addressable store."),
    ("pnpm-cache", "pnpm Metadata Cache", "dev-tools", "safe", "pnpm-cache", "Cached pnpm HTTP/metadata files."),
    ("playwright", "Playwright Test Browsers", "dev-tools", "caution", "ms-playwright", "Downloaded headless browser binaries."),
    ("pip-cache", "Python pip Cache", "dev-tools", "safe", "pip\\cache", "Cached Python wheel and source packages."),
    ("d3d-cache", "DirectX Shader Cache", "temp", "safe", "D3DSCache", "Compiled GPU shader cache; regenerated automatically."),
  ];
  for (id, name, cat, safety, rel, desc) in known_rules {
    add_dir_finding(&mut findings, &mut skipped, id, name, cat, safety, &local.join(rel), desc, "Can be cleared or pruned when tools are closed.", "Known AppData\\Local cache path.");
  }

  let roaming_rules: &[(&str, &str, &str, &str, &str, &str)] = &[
    ("adobe-media", "Adobe Media Cache Files", "media-cache", "safe", "Adobe\\Common\\Media Cache Files", "Conformed audio/video scratch files."),
    ("adobe-dunamis", "Adobe Dunamis Telemetry Cache", "adware-pup", "safe", "com.adobe.dunamis", "Adobe telemetry database and IPC cache."),
    ("vscode-vsix", "VS Code Cached VSIXs", "updates", "safe", "Code\\CachedExtensionVSIXs", "Downloaded extension archives."),
    ("insiders-vsix", "VS Code Insiders Cached VSIXs", "updates", "safe", "Code - Insiders\\CachedExtensionVSIXs", "Downloaded extension archives."),
  ];
  for (id, name, cat, safety, rel, desc) in roaming_rules {
    add_dir_finding(&mut findings, &mut skipped, id, name, cat, safety, &roaming.join(rel), desc, "Regenerable cache/telemetry; close app first.", "Known AppData\\Roaming rule.");
  }

  // 5. Startup & Adware/PUP registry check
  scan_startup_anomalies(&mut findings);

  // 6. Abandoned Desktop & Start Menu shortcuts (.lnk)
  crate::shortcut_scanner::scan_abandoned_shortcuts(&mut findings);

  // 7. Deep caches (CrashDumps, WER, Browser GPU/Code Cache, Cargo/uv) & Scheduled Tasks
  crate::deep_rules::scan_deep_caches(&mut findings, &mut skipped);
  crate::deep_rules::scan_suspicious_scheduled_tasks(&mut findings);

  findings.sort_by(|a, b| b.size_bytes.cmp(&a.size_bytes));
  Ok(AppDataScanReport {
    scanned_at: format_unix_date(
      std::time::SystemTime::now().duration_since(std::time::UNIX_EPOCH).map(|d| d.as_secs()).unwrap_or(0),
    ),
    duration_ms: started.elapsed().as_millis(),
    findings,
    installed_app_count: installed_apps.len(),
    skipped_count: skipped,
  })
}
