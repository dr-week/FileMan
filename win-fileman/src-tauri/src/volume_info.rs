use std::path::Path;
use std::process::Command;
use crate::models::VolumeSpaceInfo;

#[cfg(windows)]
#[link(name = "kernel32")]
extern "system" {
  fn GetDiskFreeSpaceExW(
    lpDirectoryName: *const u16,
    lpFreeBytesAvailableToCaller: *mut u64,
    lpTotalNumberOfBytes: *mut u64,
    lpTotalNumberOfFreeBytes: *mut u64,
  ) -> i32;
}

#[tauri::command]
pub fn get_volume_space(path: String) -> Result<VolumeSpaceInfo, String> {
  #[cfg(windows)]
  {
    use std::os::windows::ffi::OsStrExt;
    let p = Path::new(&path);
    let root = p.components().next()
      .map(|c| format!("{}\\", c.as_os_str().to_string_lossy()))
      .unwrap_or_else(|| "C:\\".into());
    let wide: Vec<u16> = std::ffi::OsStr::new(&root).encode_wide().chain(Some(0)).collect();
    let mut free_avail = 0u64;
    let mut total = 0u64;
    let mut total_free = 0u64;
    let ok = unsafe {
      GetDiskFreeSpaceExW(wide.as_ptr(), &mut free_avail, &mut total, &mut total_free)
    };
    if ok == 0 {
      return Err("Unable to query volume capacity.".into());
    }
    Ok(VolumeSpaceInfo {
      root,
      total_bytes: total,
      free_bytes: free_avail,
      used_bytes: total.saturating_sub(free_avail),
    })
  }
  #[cfg(not(windows))]
  {
    Err("Volume query only supported on Windows.".into())
  }
}

#[tauri::command]
pub fn open_in_explorer(path: String) -> Result<(), String> {
  let target = Path::new(&path);
  if !target.exists() {
    return Err("Path does not exist on disk.".into());
  }
  let mut cmd = Command::new("explorer");
  if target.is_file() {
    cmd.arg(format!("/select,{}", target.to_string_lossy()));
  } else {
    cmd.arg(target);
  }
  cmd.spawn().map_err(|e| e.to_string())?;
  Ok(())
}

#[tauri::command]
pub fn create_folder(parent_path: String, name: String) -> Result<String, String> {
  let clean = name.trim();
  if clean.is_empty() || clean.contains(['\\', '/', ':', '*', '?', '"', '<', '>', '|']) {
    return Err("Invalid folder name.".into());
  }
  let target = Path::new(&parent_path).join(clean);
  if target.exists() {
    return Err("A file or folder with that name already exists.".into());
  }
  std::fs::create_dir(&target).map_err(|e| e.to_string())?;
  Ok(target.to_string_lossy().into_owned())
}
