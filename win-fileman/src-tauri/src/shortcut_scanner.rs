use std::path::Path;
use std::process::Command;
use crate::models::CleanerFinding;

#[cfg(windows)]
use std::os::windows::process::CommandExt;

const CREATE_NO_WINDOW: u32 = 0x08000000;

pub fn scan_abandoned_shortcuts(findings: &mut Vec<CleanerFinding>) {
  let mut search_dirs = Vec::new();
  if let Some(desktop) = dirs_next::desktop_dir() {
    search_dirs.push(desktop);
  }
  if let Some(roaming) = dirs_next::data_dir() {
    let start_menu = roaming.join("Microsoft\\Windows\\Start Menu\\Programs");
    if start_menu.is_dir() {
      search_dirs.push(start_menu);
    }
  }

  let mut lnk_paths = Vec::new();
  for dir in search_dirs {
    for entry in walkdir::WalkDir::new(dir).max_depth(4).follow_links(false).into_iter().flatten() {
      let path = entry.path();
      if path.is_file() && path.extension().and_then(|e| e.to_str()).map(|e| e.eq_ignore_ascii_case("lnk")).unwrap_or(false) {
        lnk_paths.push(path.to_string_lossy().into_owned());
      }
    }
  }
  if lnk_paths.is_empty() { return; }

  let resolved = resolve_lnk_batch(&lnk_paths);
  for (lnk_path, target) in resolved {
    if target.is_empty() { continue; }
    let lower = target.to_lowercase();
    if lower.starts_with("\\\\") || lower.starts_with("http") { continue; }

    let target_path = Path::new(&target);
    if target_path.exists() { continue; }

    let drive_letter = target.chars().next().unwrap_or('C');
    let drive_root = format!("{drive_letter}:\\");
    let drive_ready = Path::new(&drive_root).exists();
    let name = Path::new(&lnk_path).file_stem().unwrap_or_default().to_string_lossy().into_owned();

    if drive_ready {
      findings.push(CleanerFinding {
        id: format!("shortcut-{}", name.to_lowercase().replace(' ', "-")),
        name: format!("Abandoned Shortcut: {name}.lnk"),
        category: "shortcuts".into(),
        safety: "safe".into(),
        path: lnk_path,
        size_bytes: std::fs::metadata(target_path).map(|m| m.len()).unwrap_or(2048),
        file_count: 1,
        last_modified: "Missing Target".into(),
        description: format!("Shortcut points to missing local target: {target}"),
        recommendation: "Safe to quarantine or delete; only removes the .lnk shortcut file.".into(),
        evidence: "Shell Link target does not exist on mounted local drive.".into(),
      });
    } else {
      findings.push(CleanerFinding {
        id: format!("shortcut-unavail-{}", name.to_lowercase().replace(' ', "-")),
        name: format!("Unverified Shortcut: {name}.lnk"),
        category: "shortcuts".into(),
        safety: "caution".into(),
        path: lnk_path,
        size_bytes: 2048,
        file_count: 1,
        last_modified: "Drive Offline".into(),
        description: format!("Could not verify target on disconnected drive: {target}"),
        recommendation: "Reconnect the drive before deciding whether to remove this shortcut.".into(),
        evidence: "Target drive is currently unavailable.".into(),
      });
    }
  }
}

fn resolve_lnk_batch(paths: &[String]) -> Vec<(String, String)> {
  let joined = paths.iter().map(|p| format!("'{}'", p.replace('\'', "''"))).collect::<Vec<_>>().join(",");
  let script = format!(
    "$sh = New-Object -ComObject WScript.Shell; @({joined}) | ForEach-Object {{ try {{ $s = $sh.CreateShortcut($_); \"$_|$($s.TargetPath)\" }} catch {{}} }}"
  );
  let mut cmd = Command::new("powershell");
  cmd.args(["-NoProfile", "-NonInteractive", "-Command", &script]);
  #[cfg(windows)]
  cmd.creation_flags(CREATE_NO_WINDOW);

  let Ok(output) = cmd.output() else { return Vec::new(); };
  String::from_utf8_lossy(&output.stdout)
    .lines()
    .filter_map(|line| {
      let (lnk, target) = line.split_once('|')?;
      Some((lnk.trim().to_string(), target.trim().to_string()))
    })
    .collect()
}
