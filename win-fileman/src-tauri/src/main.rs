// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod appdata_rules;
mod appdata_scanner;
mod deep_rules;
mod explorer;
mod models;
mod quarantine;
mod shortcut_scanner;
mod storage_scan;
mod volume_info;

fn main() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![
      explorer::list_drives,
      explorer::get_library_locations,
      explorer::list_directory,
      storage_scan::get_cleaner_scan_roots,
      storage_scan::scan_storage,
      appdata_scanner::scan_appdata_candidates,
      quarantine::list_quarantine,
      quarantine::quarantine_paths,
      quarantine::restore_quarantined_item,
      quarantine::purge_quarantined_item,
      quarantine::empty_quarantine,
      volume_info::get_volume_space,
      volume_info::open_in_explorer,
      volume_info::create_folder,
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}

#[cfg(test)]
mod tests {
  #[test]
  fn test_live_appdata_and_volume_scan() {
    let report = super::appdata_scanner::scan_appdata_sync_for_test();
    assert!(report.is_ok(), "AppData scan failed: {:?}", report.err());
    let report = report.unwrap();
    println!(
      "SCAN OK: {} findings in {} ms (installed apps: {}, skipped: {})",
      report.findings.len(), report.duration_ms, report.installed_app_count, report.skipped_count
    );
    for f in report.findings.iter().take(10) {
      println!("  [{} | {}] {} ({} bytes) -> {}", f.category, f.safety, f.name, f.size_bytes, f.path);
    }
    let vol = super::volume_info::get_volume_space("C:\\".into()).expect("Volume query failed");
    println!("VOLUME C:\\ -> total={} GB, free={} GB", vol.total_bytes / 1073741824, vol.free_bytes / 1073741824);
    assert!(vol.total_bytes > 0);
  }
}
