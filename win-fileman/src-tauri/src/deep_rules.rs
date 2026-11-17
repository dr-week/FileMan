use std::path::Path;
use std::process::Command;
use crate::appdata_rules::{format_unix_date, measure_dir};
use crate::models::CleanerFinding;

#[cfg(windows)]
use std::os::windows::process::CommandExt;

const CREATE_NO_WINDOW: u32 = 0x08000000;

pub fn scan_deep_caches(findings: &mut Vec<CleanerFinding>, skipped: &mut u64) {
  let Some(local) = dirs_next::data_local_dir() else { return; };
  let home = dirs_next::home_dir();

  let mut rules: Vec<(&str, &str, &str, &str, std::path::PathBuf, &str)> = vec![
    ("crash-dumps", "Windows CrashDumps", "temp", "safe", local.join("CrashDumps"), "Memory crash dump files generated when apps crash."),
    ("wer-reports", "Windows Error Reporting (WER)", "temp", "safe", local.join("Microsoft\\Windows\\WER"), "Windows Error Reporting queues and archived crash reports."),
    ("chrome-gpu", "Chrome GPU & Code Cache", "temp", "safe", local.join("Google\\Chrome\\User Data\\Default\\Code Cache"), "Regenerable Chromium bytecode and shader cache."),
    ("edge-gpu", "Edge GPU Shader Cache", "temp", "safe", local.join("Microsoft\\Edge\\User Data\\GrShaderCache"), "Regenerable Edge graphics shader cache."),
    ("uv-cache", "uv Python Package Cache", "dev-tools", "safe", local.join("uv\\cache"), "Cached Python wheels and archives downloaded by uv."),
  ];

  if let Some(h) = home {
    rules.push(("cargo-cache", "Rust Cargo Registry Cache", "dev-tools", "caution", h.join(".cargo\\registry\\cache"), "Downloaded .crate tarballs in Cargo global cache."));
  }

  for (id, name, cat, safety, path, desc) in rules {
    if !path.is_dir() { continue; }
    let (bytes, files, skip, mtime) = measure_dir(&path);
    *skipped += skip;
    if bytes == 0 && files == 0 { continue; }
    findings.push(CleanerFinding {
      id: id.into(),
      name: name.into(),
      category: cat.into(),
      safety: safety.into(),
      path: path.to_string_lossy().into_owned(),
      size_bytes: bytes,
      file_count: files,
      last_modified: format_unix_date(mtime),
      description: desc.into(),
      recommendation: "Safe to clear when related apps are closed; regenerated automatically.".into(),
      evidence: "Matched deep cache / CrashDump / WER rule.".into(),
    });
  }
}

pub fn scan_suspicious_scheduled_tasks(findings: &mut Vec<CleanerFinding>) {
  let mut cmd = Command::new("schtasks");
  cmd.args(["/query", "/v", "/fo", "CSV", "/nh"]);
  #[cfg(windows)]
  cmd.creation_flags(CREATE_NO_WINDOW);

  let Ok(out) = cmd.output() else { return; };
  let text = String::from_utf8_lossy(&out.stdout);

  for line in text.lines() {
    let lower = line.to_lowercase();
    let is_suspicious_path = lower.contains("\\appdata\\local\\temp\\") || lower.contains("\\users\\public\\");
    if !is_suspicious_path { continue; }

    let cols: Vec<&str> = line.split("\",\"").collect();
    let task_name = cols.get(1).unwrap_or(&"Unknown Task").trim_matches('"');
    let action = cols.get(8).unwrap_or(&"").trim_matches('"');

    findings.push(CleanerFinding {
      id: format!("task-pup-{}", task_name.replace(['\\', ' ', '/'], "-").to_lowercase()),
      name: format!("Suspicious Scheduled Task: {task_name}"),
      category: "adware-pup".into(),
      safety: "caution".into(),
      path: Path::new(action).to_string_lossy().into_owned(),
      size_bytes: 0,
      file_count: 1,
      last_modified: "Scheduled Task".into(),
      description: format!("Task executes from Temp or Public directory: {action}"),
      recommendation: "Inspect in Windows Task Scheduler (taskschd.msc) before disabling.".into(),
      evidence: "Scheduled task action points to Temp or Users\\Public (common adware persistence).".into(),
    });
  }
}
