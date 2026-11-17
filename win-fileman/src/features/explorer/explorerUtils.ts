import { FileEntry } from '../shared/types';

export function filterFiles(files: FileEntry[], query: string): FileEntry[] {
  const value = query.trim().toLowerCase();
  if (!value) return files;

  return files.filter((file) => file.name.toLowerCase().includes(value));
}

export function sortFiles(files: FileEntry[], field: 'name' | 'size' | 'modifiedAt' = 'name'): FileEntry[] {
  return [...files].sort((a, b) => {
    if (field === 'size') {
      return (b.sizeBytes ?? 0) - (a.sizeBytes ?? 0);
    }

    if (field === 'modifiedAt') {
      return (b.modifiedAt ?? '').localeCompare(a.modifiedAt ?? '');
    }

    return a.name.localeCompare(b.name);
  });
}
