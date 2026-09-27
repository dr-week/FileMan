export type DevicePlatform = 'android' | 'car' | 'windows';

export interface RemoteDevice {
  id: string;
  ip: string;
  port: number;
  name: string;
  type: DevicePlatform;
  isOnline: boolean;
  freeSpaceBytes?: number;
  totalSpaceBytes?: number;
  version?: string;
}

export interface RemoteFileItem {
  name: string;
  path: string;
  isDir: boolean;
  size: number;
  modifiedAt: number;
  mime?: string;
}

export interface RemoteFilesResponse {
  path: string;
  files: RemoteFileItem[];
}

export interface TransferProgress {
  filename: string;
  progress: number;
  status: 'idle' | 'uploading' | 'downloading' | 'completed' | 'error';
  errorMessage?: string;
}
