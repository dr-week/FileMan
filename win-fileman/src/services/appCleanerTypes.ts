export type SafetyTier = 'safe' | 'caution' | 'protected';

export type CleanerCategory = 
  | 'all'
  | 'updates'
  | 'media-cache'
  | 'installers'
  | 'dev-tools'
  | 'orphaned'
  | 'temp';

export interface CleanerItem {
  id: string;
  name: string;
  category: CleanerCategory;
  safety: SafetyTier;
  path: string;
  sizeBytes: number;
  sizeFormatted: string;
  fileCount: number;
  lastModified: string;
  description: string;
  recommendation: string;
  selected: boolean;
}

export interface CleanerSummary {
  totalBytes: number;
  totalFormatted: string;
  safeBytes: number;
  safeFormatted: string;
  cautionBytes: number;
  cautionFormatted: string;
  itemCount: number;
  selectedBytes: number;
  selectedFormatted: string;
  selectedCount: number;
}
