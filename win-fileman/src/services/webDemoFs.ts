import { FileEntry } from '../features/shared/types';
import { FileSystemLocation, VolumeSpaceInfo } from './fileSystemApi';

const DEMO_DRIVES: FileSystemLocation[] = [
  { name: 'Local Disk (C:)', path: 'C:\\' },
  { name: 'Media & Projects (D:)', path: 'D:\\' },
];

const DEMO_LIBRARIES: FileSystemLocation[] = [
  { name: 'Desktop', path: 'C:\\Users\\User\\Desktop' },
  { name: 'Documents', path: 'C:\\Users\\User\\Documents' },
  { name: 'Downloads', path: 'C:\\Users\\User\\Downloads' },
  { name: 'Pictures', path: 'C:\\Users\\User\\Pictures' },
  { name: 'Videos', path: 'C:\\Users\\User\\Videos' },
];

const DEMO_TREE: Record<string, FileEntry[]> = {
  'c:\\': [
    { id: 'c-users', name: 'Users', path: 'C:\\Users', type: 'folder', modifiedAt: '2026-11-26' },
    { id: 'c-projects', name: 'Projects', path: 'C:\\Projects', type: 'folder', modifiedAt: '2026-11-25' },
    { id: 'c-programfiles', name: 'Program Files', path: 'C:\\Program Files', type: 'folder', modifiedAt: '2026-10-14' },
    { id: 'c-windows', name: 'Windows', path: 'C:\\Windows', type: 'folder', modifiedAt: '2026-09-20', isSystem: true },
    { id: 'c-readme', name: 'LumenFiles_QuickStart.md', path: 'C:\\LumenFiles_QuickStart.md', type: 'file', extension: 'md', category: 'document', sizeBytes: 14820, modifiedAt: '2026-11-26' },
    { id: 'c-config', name: '.lumenrc.json', path: 'C:\\.lumenrc.json', type: 'file', extension: 'json', category: 'code', sizeBytes: 1240, modifiedAt: '2026-11-24', isHidden: true },
  ],
  'c:\\users': [
    { id: 'u-user', name: 'User', path: 'C:\\Users\\User', type: 'folder', modifiedAt: '2026-11-26' },
    { id: 'u-public', name: 'Public', path: 'C:\\Users\\Public', type: 'folder', modifiedAt: '2026-08-12' },
  ],
  'c:\\users\\user': [
    { id: 'uu-desk', name: 'Desktop', path: 'C:\\Users\\User\\Desktop', type: 'folder', modifiedAt: '2026-11-26' },
    { id: 'uu-docs', name: 'Documents', path: 'C:\\Users\\User\\Documents', type: 'folder', modifiedAt: '2026-11-25' },
    { id: 'uu-dl', name: 'Downloads', path: 'C:\\Users\\User\\Downloads', type: 'folder', modifiedAt: '2026-11-26' },
    { id: 'uu-pic', name: 'Pictures', path: 'C:\\Users\\User\\Pictures', type: 'folder', modifiedAt: '2026-11-20' },
    { id: 'uu-vid', name: 'Videos', path: 'C:\\Users\\User\\Videos', type: 'folder', modifiedAt: '2026-11-18' },
  ],
  'c:\\users\\user\\desktop': [
    { id: 'd-spec', name: 'FileLabs_Design_Spec.pdf', path: 'C:\\Users\\User\\Desktop\\FileLabs_Design_Spec.pdf', type: 'file', extension: 'pdf', category: 'document', sizeBytes: 2457600, modifiedAt: '2026-11-26' },
    { id: 'd-notes', name: 'Release_Notes.txt', path: 'C:\\Users\\User\\Desktop\\Release_Notes.txt', type: 'file', extension: 'txt', category: 'document', sizeBytes: 6420, modifiedAt: '2026-11-25' },
  ],
  'c:\\users\\user\\documents': [
    { id: 'doc-proj', name: 'Projects', path: 'C:\\Users\\User\\Documents\\Projects', type: 'folder', modifiedAt: '2026-11-24' },
    { id: 'doc-arch', name: 'Architecture_Plan.md', path: 'C:\\Users\\User\\Documents\\Architecture_Plan.md', type: 'file', extension: 'md', category: 'document', sizeBytes: 38912, modifiedAt: '2026-11-26' },
    { id: 'doc-theme', name: 'Custom_Theme_Tokens.json', path: 'C:\\Users\\User\\Documents\\Custom_Theme_Tokens.json', type: 'file', extension: 'json', category: 'code', sizeBytes: 9120, modifiedAt: '2026-11-23' },
  ],
  'c:\\users\\user\\documents\\projects': [
    { id: 'p-app', name: 'App.tsx', path: 'C:\\Users\\User\\Documents\\Projects\\App.tsx', type: 'file', extension: 'tsx', category: 'code', sizeBytes: 11240, modifiedAt: '2026-11-26' },
    { id: 'p-cargo', name: 'Cargo.toml', path: 'C:\\Users\\User\\Documents\\Projects\\Cargo.toml', type: 'file', extension: 'toml', category: 'code', sizeBytes: 2150, modifiedAt: '2026-11-21' },
  ],
  'c:\\users\\user\\downloads': [
    { id: 'dl-backup', name: 'System_Backup_2026.zip', path: 'C:\\Users\\User\\Downloads\\System_Backup_2026.zip', type: 'file', extension: 'zip', category: 'archive', sizeBytes: 470000000, modifiedAt: '2026-11-22' },
    { id: 'dl-sound', name: 'V8_Supercharger_Pack.wav', path: 'C:\\Users\\User\\Downloads\\V8_Supercharger_Pack.wav', type: 'file', extension: 'wav', category: 'audio', sizeBytes: 18432000, modifiedAt: '2026-11-25' },
    { id: 'dl-setup', name: 'LumenFiles-Setup-0.1.0.exe', path: 'C:\\Users\\User\\Downloads\\LumenFiles-Setup-0.1.0.exe', type: 'file', extension: 'exe', category: 'application', sizeBytes: 28600000, modifiedAt: '2026-11-26' },
  ],
  'c:\\users\\user\\pictures': [
    { id: 'pic-1', name: 'Concept_Art_Obsidian.png', path: 'C:\\Users\\User\\Pictures\\Concept_Art_Obsidian.png', type: 'file', extension: 'png', category: 'image', sizeBytes: 3145728, modifiedAt: '2026-11-24' },
    { id: 'pic-2', name: 'Wallpaper_Acrylic_4K.jpg', path: 'C:\\Users\\User\\Pictures\\Wallpaper_Acrylic_4K.jpg', type: 'file', extension: 'jpg', category: 'image', sizeBytes: 6291456, modifiedAt: '2026-11-12' },
  ],
  'c:\\users\\user\\videos': [
    { id: 'vid-1', name: 'UI_Walkthrough_60fps.mp4', path: 'C:\\Users\\User\\Videos\\UI_Walkthrough_60fps.mp4', type: 'file', extension: 'mp4', category: 'video', sizeBytes: 142670000, modifiedAt: '2026-11-19' },
  ],
  'c:\\projects': [
    { id: 'cp-fileman', name: 'FileMan', path: 'C:\\Projects\\FileMan', type: 'folder', modifiedAt: '2026-11-26' },
    { id: 'cp-theme', name: 'ThemeAdapter.ts', path: 'C:\\Projects\\ThemeAdapter.ts', type: 'file', extension: 'ts', category: 'code', sizeBytes: 8420, modifiedAt: '2026-11-26' },
  ],
  'c:\\projects\\fileman': [
    { id: 'fm-readme', name: 'README.md', path: 'C:\\Projects\\FileMan\\README.md', type: 'file', extension: 'md', category: 'document', sizeBytes: 10199, modifiedAt: '2026-11-26' },
    { id: 'fm-pkg', name: 'package.json', path: 'C:\\Projects\\FileMan\\package.json', type: 'file', extension: 'json', category: 'code', sizeBytes: 635, modifiedAt: '2026-11-25' },
  ],
  'd:\\': [
    { id: 'd-car', name: 'CarSoundMod', path: 'D:\\CarSoundMod', type: 'folder', modifiedAt: '2026-11-25' },
    { id: 'd-archive', name: 'Backups_Archive.7z', path: 'D:\\Backups_Archive.7z', type: 'file', extension: '7z', category: 'archive', sizeBytes: 1280000000, modifiedAt: '2026-11-15' },
    { id: 'd-clip', name: 'TrackDay_Dashcam.mkv', path: 'D:\\TrackDay_Dashcam.mkv', type: 'file', extension: 'mkv', category: 'video', sizeBytes: 890000000, modifiedAt: '2026-11-10' },
  ],
  'd:\\carsoundmod': [
    { id: 'cs-1', name: 'Exhaust_Pop_Tune.wav', path: 'D:\\CarSoundMod\\Exhaust_Pop_Tune.wav', type: 'file', extension: 'wav', category: 'audio', sizeBytes: 12450000, modifiedAt: '2026-11-25' },
    { id: 'cs-2', name: 'CarUnit_Profile.json', path: 'D:\\CarSoundMod\\CarUnit_Profile.json', type: 'file', extension: 'json', category: 'code', sizeBytes: 3420, modifiedAt: '2026-11-24' },
  ],
};

function normalizePathKey(path: string): string {
  const cleaned = path.replace(/\//g, '\\').trim();
  if (/^[a-z]:$/i.test(cleaned)) return `${cleaned.toLowerCase()}\\`;
  if (/^[a-z]:\\$/i.test(cleaned)) return cleaned.toLowerCase();
  return cleaned.replace(/\\+$/, '').toLowerCase();
}

export function getDemoDrives(): FileSystemLocation[] {
  return DEMO_DRIVES;
}

export function getDemoLibraries(): FileSystemLocation[] {
  return DEMO_LIBRARIES;
}

export function listDemoDirectory(path: string): { path: string; entries: FileEntry[]; skippedCount: number } {
  const key = normalizePathKey(path);
  const entries = DEMO_TREE[key] ?? [];
  return { path, entries: [...entries], skippedCount: 0 };
}

export function createDemoFolder(parentPath: string, name: string): string {
  const key = normalizePathKey(parentPath);
  const normalizedParent = parentPath.replace(/[\\/]+$/, '');
  const fullPath = `${normalizedParent}\\${name}`;
  const entry: FileEntry = {
    id: `demo-folder-${Date.now()}`,
    name,
    path: fullPath,
    type: 'folder',
    modifiedAt: new Date().toISOString().slice(0, 10),
  };
  if (!DEMO_TREE[key]) DEMO_TREE[key] = [];
  DEMO_TREE[key] = [entry, ...DEMO_TREE[key]];
  DEMO_TREE[normalizePathKey(fullPath)] = [];
  return fullPath;
}

export function getDemoVolumeSpace(path: string): VolumeSpaceInfo {
  const isD = path.toLowerCase().startsWith('d:');
  if (isD) {
    const total = 1000 * 1024 ** 3;
    const used = 612 * 1024 ** 3;
    return { root: 'D:\\', totalBytes: total, usedBytes: used, freeBytes: total - used };
  }
  const total = 512 * 1024 ** 3;
  const used = 324 * 1024 ** 3;
  return { root: 'C:\\', totalBytes: total, usedBytes: used, freeBytes: total - used };
}

export function copyOrMoveDemoItem(sourcePath: string, destFolder: string, isMove: boolean): FileEntry | null {
  const normSource = normalizePathKey(sourcePath);
  const normDest = normalizePathKey(destFolder);
  if (normSource === normDest) return null;

  const sourceTrimmed = sourcePath.replace(/[\\/]+$/, '');
  const sep = Math.max(sourceTrimmed.lastIndexOf('\\'), sourceTrimmed.lastIndexOf('/'));
  const sourceParentKey = sep > 0 ? normalizePathKey(sep <= 2 ? `${sourceTrimmed.slice(0, 2)}\\` : sourceTrimmed.slice(0, sep)) : 'c:\\';

  const sourceEntries = DEMO_TREE[sourceParentKey] || [];
  const itemIndex = sourceEntries.findIndex(e => normalizePathKey(e.path) === normSource);
  if (itemIndex < 0) return null;
  const original = sourceEntries[itemIndex];

  const destParentTrimmed = destFolder.replace(/[\\/]+$/, '');
  const newPath = `${destParentTrimmed}\\${original.name}`;
  const newEntry: FileEntry = {
    ...original,
    id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    path: newPath,
    modifiedAt: new Date().toISOString().slice(0, 10),
  };

  if (!DEMO_TREE[normDest]) DEMO_TREE[normDest] = [];
  const existingIdx = DEMO_TREE[normDest].findIndex(e => e.name.toLowerCase() === original.name.toLowerCase());
  if (existingIdx >= 0) {
    DEMO_TREE[normDest][existingIdx] = newEntry;
  } else {
    DEMO_TREE[normDest] = [newEntry, ...DEMO_TREE[normDest]];
  }

  if (original.type === 'folder') {
    const oldChildren = DEMO_TREE[normSource] || [];
    DEMO_TREE[normalizePathKey(newPath)] = [...oldChildren];
    if (isMove) {
      delete DEMO_TREE[normSource];
    }
  }

  if (isMove) {
    sourceEntries.splice(itemIndex, 1);
  }

  return newEntry;
}

export function importDemoFiles(files: Array<{ name: string; size: number }>, destFolder: string): FileEntry[] {
  const normDest = normalizePathKey(destFolder);
  if (!DEMO_TREE[normDest]) DEMO_TREE[normDest] = [];
  const created: FileEntry[] = [];
  for (const f of files) {
    const ext = f.name.includes('.') ? f.name.split('.').pop()?.toLowerCase() : undefined;
    const destParentTrimmed = destFolder.replace(/[\\/]+$/, '');
    const entry: FileEntry = {
      id: `imported-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: f.name,
      path: `${destParentTrimmed}\\${f.name}`,
      type: 'file',
      extension: ext,
      sizeBytes: f.size,
      modifiedAt: new Date().toISOString().slice(0, 10),
      category:
        ext === 'png' || ext === 'jpg' || ext === 'svg'
          ? 'image'
          : ext === 'mp4' || ext === 'mkv'
            ? 'video'
            : ext === 'mp3' || ext === 'wav'
              ? 'audio'
              : ext === 'zip' || ext === '7z'
                ? 'archive'
                : ext === 'ts' || ext === 'tsx' || ext === 'json' || ext === 'rs'
                  ? 'code'
                  : 'document',
    };
    DEMO_TREE[normDest].unshift(entry);
    created.push(entry);
  }
  return created;
}

export function deleteDemoItem(itemPath: string): boolean {
  const norm = normalizePathKey(itemPath);
  const trimmed = itemPath.replace(/[\\/]+$/, '');
  const sep = Math.max(trimmed.lastIndexOf('\\'), trimmed.lastIndexOf('/'));
  const parentKey = sep > 0 ? normalizePathKey(sep <= 2 ? `${trimmed.slice(0, 2)}\\` : trimmed.slice(0, sep)) : 'c:\\';
  const entries = DEMO_TREE[parentKey];
  if (!entries) return false;
  const idx = entries.findIndex(e => normalizePathKey(e.path) === norm);
  if (idx >= 0) {
    entries.splice(idx, 1);
    delete DEMO_TREE[norm];
    return true;
  }
  return false;
}
