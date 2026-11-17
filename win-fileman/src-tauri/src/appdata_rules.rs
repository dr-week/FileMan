use std::collections::HashSet;
use std::path::Path;
use std::process::Command;
use std::time::UNIX_EPOCH;
use walkdir::WalkDir;
use crate::models::CleanerFinding;

#[cfg(windows)]
use std::os::windows::process::CommandExt;

const CREATE_NO_WINDOW: u32 = 0x08000000;

const PUP_SIGNATURES: &[(&str, &str)] = &[
  ("bingsvc", "Microsoft Bing background service"),
  ("segurazo", "Segurazo / SAntivirus PUP"),
  ("bytefence", "ByteFence PUP"),
  ("driverbooster", "IObit Driver Booster background task"),
  ("conduit", "Conduit browser adware"),
  ("asktoolbar", "Ask Toolbar adware"),
  ("searchprotect", "Search Protect browser hijacker"),
  ("webcompanion", "Lavasoft Web Companion PUP"),
  ("relevantknowledge", "RelevantKnowledge spyware/adware"),
  ("mindspark", "Mindspark browser PUP"),
  ("opencandy", "OpenCandy adware remnant"),
];

pub fn measure_dir(path: &Path) -> (u64, u64, u64, u64) {
  let mut bytes = 0u64;
  let mut files = 0u64;
  let mut skipped = 0u64;
  let mut latest_mtime = 0u64;

  for entry in WalkDir::new(path).follow_links(false) {
    let Ok(entry) = entry else { skipped += 1; continue; };
    if entry.path_is_symlink() || !entry.file_type().is_file() { continue; }
    let Ok(meta) = entry.metadata() else { skipped += 1; continue; };
    bytes = bytes.saturating_add(meta.len());
    files += 1;
    if let Ok(modified) = meta.modified() {
      if let Ok(secs) = modified.duration_since(UNIX_EPOCH) {
        latest_mtime = latest_mtime.max(secs.as_secs());
      }
    }
  }
  (bytes, files, skipped, latest_mtime)
}

pub fn format_unix_date(secs: u64) -> String {
  if secs == 0 { return "Unknown".into(); }
  let days = secs / 86400;
  let z = days as i64 + 719468;
  let era = if z >= 0 { z } else { z - 146096 } / 146097;
  let doe = z - era * 146097;
  let yoe = (doe - doe / 1460 + doe / 36524 - doe / 146096) / 365;
  let y = yoe + era * 400;
  let doy = doe - (365 * yoe + yoe / 4 - yoe / 100);
  let mp = (5 * doy + 2) / 153;
  let d = doy - (153 * mp + 2) / 5 + 1;
  let m = mp + if mp < 10 { 3 } else { -9 };
  let year = y + if m <= 2 { 1 } else { 0 };
  format!("{year:04}-{m:02}-{d:02}")
}

pub fn is_commit_hash_dir(name: &str) -> bool {
  (name.len() == 10 || name.len() == 12) && name.chars().all(|c| c.is_ascii_hexdigit())
}

fn run_reg_query(key: &str, args: &[&str]) -> String {
  let mut cmd = Command::new("reg");
  cmd.arg("query").arg(key).args(args);
  #[cfg(windows)]
  cmd.creation_flags(CREATE_NO_WINDOW);
  cmd.output()
    .map(|out| String::from_utf8_lossy(&out.stdout).into_owned())
    .unwrap_or_default()
}

pub fn read_installed_app_names() -> HashSet<String> {
  let mut names = HashSet::new();
  let keys = [
    r"HKCU\Software\Microsoft\Windows\CurrentVersion\Uninstall",
    r"HKLM\Software\Microsoft\Windows\CurrentVersion\Uninstall",
    r"HKLM\Software\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall",
  ];
  for key in keys {
    let stdout = run_reg_query(key, &["/s", "/v", "DisplayName"]);
    for line in stdout.lines() {
      if let Some(pos) = line.find("REG_SZ") {
        let val = line[pos + 6..].trim().to_lowercase();
        if !val.is_empty() { names.insert(val); }
      }
    }
  }
  names
}

pub fn scan_startup_anomalies(findings: &mut Vec<CleanerFinding>) {
  let stdout = run_reg_query(r"HKCU\Software\Microsoft\Windows\CurrentVersion\Run", &[]);
  for line in stdout.lines() {
    let Some(pos) = line.find("REG_SZ") else { continue; };
    let entry_name = line[..pos].trim();
    let command = line[pos + 6..].trim();
    let lower = format!("{entry_name} {command}").to_lowercase();

    if let Some((_, label)) = PUP_SIGNATURES.iter().find(|(sig, _)| lower.contains(sig)) {
      findings.push(CleanerFinding {
        id: format!("pup-startup-{}", entry_name.to_lowercase()),
        name: format!("Startup Adware/Telemetry: {entry_name}"),
        category: "adware-pup".into(),
        safety: "caution".into(),
        path: format!(r"HKCU\...\Run\{entry_name}"),
        size_bytes: 0,
        file_count: 1,
        last_modified: "Active Startup".into(),
        description: format!("{label} configured to launch at Windows sign-in ({command})."),
        recommendation: "Review in Windows Startup Apps or Task Manager before disabling.".into(),
        evidence: "HKCU Run registry key matches known PUP/telemetry signature.".into(),
      });
      continue;
    }

    let exe_path = extract_exe_path(command);
    if !exe_path.is_empty() && !Path::new(&exe_path).exists() {
      findings.push(CleanerFinding {
        id: format!("broken-startup-{}", entry_name.to_lowercase()),
        name: format!("Orphaned Startup Entry: {entry_name}"),
        category: "adware-pup".into(),
        safety: "caution".into(),
        path: format!(r"HKCU\...\Run\{entry_name}"),
        size_bytes: 0,
        file_count: 1,
        last_modified: "Missing Target".into(),
        description: format!("Startup entry points to missing executable: {exe_path}"),
        recommendation: "Target app appears uninstalled. Review and remove via Startup settings.".into(),
        evidence: "Target executable path does not exist on disk.".into(),
      });
    }
  }
}

fn extract_exe_path(command: &str) -> String {
  let trimmed = command.trim();
  if let Some(rest) = trimmed.strip_prefix('"') {
    return rest.split('"').next().unwrap_or("").to_string();
  }
  if let Some(idx) = trimmed.to_lowercase().find(".exe") {
    return trimmed[..idx + 4].to_string();
  }
  String::new()
}
