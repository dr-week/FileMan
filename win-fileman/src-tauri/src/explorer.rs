use std::path::Path;
use crate::models::{DirectoryListing, FileRecord, Location};

#[tauri::command]
pub fn list_drives() -> Vec<Location> {
  #[cfg(windows)]
  {
    let mask = unsafe { windows_sys::Win32::Storage::FileSystem::GetLogicalDrives() };
    let mut drives: Vec<Location> = (0..26)
      .filter(|index| mask & (1 << index) != 0)
      .map(|index| {
        let letter = char::from(b'A' + index as u8);
        Location { name: format!("{letter}:"), path: format!("{letter}:\\") }
      })
      .collect();
    drives.sort_by_key(|drive| if drive.name == "C:" { 0 } else { 1 });
    drives
  }

  #[cfg(not(windows))]
  {
    vec![Location { name: "/".into(), path: "/".into() }]
  }
}

#[tauri::command]
pub fn get_library_locations() -> Vec<Location> {
  [
    ("Documents", dirs_next::document_dir()),
    ("Pictures", dirs_next::picture_dir()),
    ("Videos", dirs_next::video_dir()),
  ]
  .into_iter()
  .filter_map(|(name, path)| path.map(|p| Location {
    name: name.into(),
    path: p.to_string_lossy().into_owned(),
  }))
  .collect()
}

#[tauri::command]
pub fn list_directory(path: String) -> Result<DirectoryListing, String> {
  let directory = Path::new(&path);
  if !directory.is_dir() {
    return Err("The selected path is not a directory.".into());
  }

  let directory_entries = std::fs::read_dir(directory)
    .map_err(|error| error.to_string())?
    .collect::<Vec<_>>();
  let mut entries = Vec::new();
  let mut skipped_count = 0;

  for result in directory_entries {
    let Ok(entry) = result else { skipped_count += 1; continue; };
    let Ok(metadata) = entry.metadata() else { skipped_count += 1; continue; };
    let entry_path = entry.path();
    let name = entry.file_name().to_string_lossy().into_owned();
    let extension = entry_path.extension().map(|v| v.to_string_lossy().to_lowercase());
    let is_directory = metadata.is_dir();
    let category = classify_extension(extension.as_deref(), is_directory);
    let modified_at = metadata.modified().ok().and_then(|time| {
      time.duration_since(std::time::UNIX_EPOCH).ok().map(|d| d.as_secs().to_string())
    });

    entries.push(FileRecord {
      id: entry_path.to_string_lossy().into_owned(),
      name,
      path: entry_path.to_string_lossy().into_owned(),
      kind: if is_directory { "folder" } else { "file" }.into(),
      extension,
      size_bytes: if is_directory { None } else { Some(metadata.len()) },
      modified_at,
      category,
      is_link: entry.file_type().map(|k| k.is_symlink()).unwrap_or(false),
    });
  }

  Ok(DirectoryListing {
    path: directory.to_string_lossy().into_owned(),
    entries,
    skipped_count,
  })
}

pub fn classify_extension(extension: Option<&str>, is_directory: bool) -> String {
  if is_directory {
    return "folder".into();
  }
  match extension.unwrap_or_default() {
    "jpg" | "jpeg" | "png" | "gif" | "bmp" | "webp" | "heic" => "image",
    "mp4" | "mkv" | "mov" | "avi" | "wmv" | "webm" => "video",
    "mp3" | "wav" | "flac" | "aac" | "ogg" | "m4a" => "audio",
    "pdf" | "doc" | "docx" | "txt" | "rtf" | "xls" | "xlsx" | "ppt" | "pptx" => "document",
    "zip" | "7z" | "rar" | "tar" | "gz" => "archive",
    "exe" | "msi" | "appx" | "msix" => "application",
    _ => "other",
  }
  .into()
}
