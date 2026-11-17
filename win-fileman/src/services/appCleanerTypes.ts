export type SafetyTier = 'safe' | 'caution' | 'protected';

export type CleanerCategory =
  | 'all'
  | 'updates'
  | 'media-cache'
  | 'installers'
  | 'dev-tools'
  | 'orphaned'
  | 'shortcuts'
  | 'adware-pup'
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
  evidence?: string;
  selected: boolean;
  quarantined?: boolean;
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

export interface AppDataAuditResult {
  items: CleanerItem[];
  source: 'live-scan' | 'sample';
  durationMs: number;
  installedAppCount: number;
  skippedCount: number;
}

export interface QuarantineRecord {
  id: string;
  name: string;
  originalPath: string;
  quarantinePath: string;
  sizeBytes: number;
  quarantinedAt: string;
}

export interface QuarantineActionResult {
  movedCount: number;
  skippedCount: number;
  errors: string[];
  records: QuarantineRecord[];
}
