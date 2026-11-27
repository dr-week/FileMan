import { invoke } from '@tauri-apps/api/tauri';
import { FileEntry } from '../features/shared/types';
import { QuarantineActionResult, QuarantineRecord } from './appCleanerTypes';
import {
  copyOrMoveDemoItem,
  createDemoFolder,
  deleteDemoItem,
  getDemoDrives,
  getDemoLibraries,
  getDemoVolumeSpace,
  importDemoFiles,
  listDemoDirectory,
} from './webDemoFs';

export interface FileSystemLocation {
  name: string;
  path: string;
}

export interface CleanerScanRoot extends FileSystemLocation {}

export interface StorageCategoryTotal {
  category: string;
  sizeBytes: number;
  fileCount: number;
}

export interface LargestFolder {
  name: string;
  path: string;
  sizeBytes: number;
  fileCount: number;
}

export interface StorageScanResult {
  root: string;
  totalBytes: number;
  fileCount: number;
  folderCount: number;
  skippedCount: number;
  durationMs: number;
  categories: StorageCategoryTotal[];
  largestFolders: LargestFolder[];
}

export interface NativeCleanerFinding {
  id: string;
  name: string;
  category: string;
  safety: string;
  path: string;
  sizeBytes: number;
  fileCount: number;
  lastModified: string;
  description: string;
  recommendation: string;
  evidence: string;
}

export interface AppDataScanReport {
  scannedAt: string;
  durationMs: number;
  findings: NativeCleanerFinding[];
  installedAppCount: number;
  skippedCount: number;
}

export interface VolumeSpaceInfo {
  root: string;
  totalBytes: number;
  freeBytes: number;
  usedBytes: number;
}

interface DirectoryListing {
  path: string;
  entries: FileEntry[];
  skippedCount: number;
}

export function isDesktopRuntime(): boolean {
  return '__TAURI_IPC__' in window;
}

function ensureDesktopRuntime() {
  if (!isDesktopRuntime()) {
    throw new Error('Local drive access is available in the Lumen Files desktop app.');
  }
}

export async function listDrives(): Promise<FileSystemLocation[]> {
  if (!isDesktopRuntime()) return getDemoDrives();
  return invoke<FileSystemLocation[]>('list_drives');
}

export async function getLibraryLocations(): Promise<FileSystemLocation[]> {
  if (!isDesktopRuntime()) return getDemoLibraries();
  return invoke<FileSystemLocation[]>('get_library_locations');
}

export async function listDirectory(path: string): Promise<DirectoryListing> {
  if (!isDesktopRuntime()) return listDemoDirectory(path);
  return invoke<DirectoryListing>('list_directory', { path });
}

export async function getCleanerScanRoots(): Promise<CleanerScanRoot[]> {
  if (!isDesktopRuntime()) return getDemoDrives();
  return invoke<CleanerScanRoot[]>('get_cleaner_scan_roots');
}

export async function scanStorage(root: string): Promise<StorageScanResult> {
  ensureDesktopRuntime();
  return invoke<StorageScanResult>('scan_storage', { root });
}

export async function scanAppDataCandidates(): Promise<AppDataScanReport> {
  ensureDesktopRuntime();
  return invoke<AppDataScanReport>('scan_appdata_candidates');
}

export async function getVolumeSpace(path: string): Promise<VolumeSpaceInfo> {
  if (!isDesktopRuntime()) return getDemoVolumeSpace(path);
  return invoke<VolumeSpaceInfo>('get_volume_space', { path });
}

export async function openInExplorer(path: string): Promise<void> {
  ensureDesktopRuntime();
  return invoke<void>('open_in_explorer', { path });
}

export async function createFolder(parentPath: string, name: string): Promise<string> {
  if (!isDesktopRuntime()) return createDemoFolder(parentPath, name);
  return invoke<string>('create_folder', { parentPath, name });
}

export async function copyOrMoveItem(sourcePath: string, destFolder: string, isMove: boolean): Promise<boolean> {
  if (!isDesktopRuntime()) {
    const res = copyOrMoveDemoItem(sourcePath, destFolder, isMove);
    return res !== null;
  }
  // Desktop runtime command
  try {
    await invoke('copy_or_move_item', { sourcePath, destFolder, isMove });
    return true;
  } catch {
    return false;
  }
}

export async function importLocalFiles(files: File[], destFolder: string): Promise<FileEntry[]> {
  if (!isDesktopRuntime()) {
    const payloads = files.map(f => ({ name: f.name, size: f.size, type: f.type }));
    return importDemoFiles(payloads, destFolder);
  }
  // Desktop runtime stub
  return [];
}

export async function deleteFileOrFolder(path: string): Promise<boolean> {
  if (!isDesktopRuntime()) {
    return deleteDemoItem(path);
  }
  try {
    await invoke('delete_path', { path });
    return true;
  } catch {
    return false;
  }
}

export async function listQuarantine(): Promise<QuarantineRecord[]> {
  ensureDesktopRuntime();
  return invoke<QuarantineRecord[]>('list_quarantine');
}

export async function quarantinePaths(
  items: Array<{ id: string; name: string; path: string; sizeBytes: number }>,
): Promise<QuarantineActionResult> {
  ensureDesktopRuntime();
  return invoke<QuarantineActionResult>('quarantine_paths', { items });
}

export async function restoreQuarantinedItem(id: string): Promise<QuarantineRecord[]> {
  ensureDesktopRuntime();
  return invoke<QuarantineRecord[]>('restore_quarantined_item', { id });
}

export async function purgeQuarantinedItem(id: string): Promise<QuarantineRecord[]> {
  ensureDesktopRuntime();
  return invoke<QuarantineRecord[]>('purge_quarantined_item', { id });
}

export async function emptyQuarantine(): Promise<QuarantineRecord[]> {
  ensureDesktopRuntime();
  return invoke<QuarantineRecord[]>('empty_quarantine');
}
