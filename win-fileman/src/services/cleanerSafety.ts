import { CleanerItem } from './appCleanerTypes';

export function planCleanup(items: CleanerItem[]): CleanerItem[] {
  return items.filter(item => item.selected && item.safety !== 'protected');
}

export function quarantineSelected(items: CleanerItem[]): CleanerItem[] {
  return items.map(item =>
    item.selected
      ? { ...item, selected: false, quarantined: true }
      : item,
  );
}

export function restoreQuarantined(items: CleanerItem[], ids: string[]): CleanerItem[] {
  return items.map(item =>
    ids.includes(item.id)
      ? { ...item, selected: false, quarantined: false }
      : item,
  );
}
