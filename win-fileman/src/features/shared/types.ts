export type RiskLevel = 'safe' | 'review' | 'protected';

export interface FileEntry {
  id: string;
  name: string;
  path: string;
  type: 'file' | 'folder';
  extension?: string;
  sizeBytes?: number;
  modifiedAt?: string;
  isHidden?: boolean;
  isSystem?: boolean;
  isLink?: boolean;
  category?: 'image' | 'video' | 'audio' | 'document' | 'code' | 'archive' | 'application' | 'other';
  selected?: boolean;
}

export interface CleanupItem {
  id: string;
  name: string;
  path: string;
  category: 'updates' | 'media' | 'dev-tools' | 'installers' | 'temp' | 'orphaned';
  risk: RiskLevel;
  sizeBytes: number;
  reason: string;
  selected: boolean;
}

export interface DeviceRecord {
  id: string;
  name: string;
  ip: string;
  port: number;
  type: 'android' | 'car' | 'windows';
  status: 'online' | 'offline';
  freeSpaceBytes?: number;
  totalSpaceBytes?: number;
}
