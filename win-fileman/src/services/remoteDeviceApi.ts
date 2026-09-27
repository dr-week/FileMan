import { RemoteDevice, RemoteFilesResponse, RemoteFileItem } from './remoteDeviceTypes';

const TIMEOUT_MS = 6000;

export async function pingDevice(ip: string, port = 8888): Promise<RemoteDevice | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`http://${ip}:${port}/api/info`, {
      method: 'GET',
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!res.ok) return null;
    const data = await res.json();
    return {
      id: `${ip}:${port}`,
      ip,
      port,
      name: data.deviceName || data.device || 'Android Unit',
      type: (data.type as any) || 'android',
      isOnline: true,
      freeSpaceBytes: data.freeSpaceBytes,
      totalSpaceBytes: data.totalSpaceBytes,
      version: data.version,
    };
  } catch {
    clearTimeout(timer);
    return null;
  }
}

export async function listRemoteFiles(
  ip: string,
  port = 8888,
  remotePath = ''
): Promise<RemoteFilesResponse> {
  const query = remotePath ? `?path=${encodeURIComponent(remotePath)}` : '';
  const res = await fetch(`http://${ip}:${port}/api/files${query}`);
  if (!res.ok) {
    throw new Error(`Failed to list files: ${res.statusText}`);
  }
  return await res.json();
}

export function uploadFileToDevice(
  ip: string,
  port = 8888,
  remoteFolderPath: string,
  file: File | Blob,
  fileName: string,
  onProgress?: (percent: number) => void
): Promise<{ success: boolean; filename: string; size: number }> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const query = `?path=${encodeURIComponent(remoteFolderPath)}&name=${encodeURIComponent(fileName)}`;
    xhr.open('POST', `http://${ip}:${port}/api/upload${query}`);

    if (xhr.upload && onProgress) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          onProgress(percent);
        }
      };
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const result = JSON.parse(xhr.responseText);
          resolve(result);
        } catch {
          resolve({ success: true, filename: fileName, size: file.size });
        }
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}: ${xhr.statusText}`));
      }
    };

    xhr.onerror = () => reject(new Error('Network error during file upload'));
    xhr.setRequestHeader('Content-Type', 'application/octet-stream');
    xhr.send(file);
  });
}

export async function downloadFileFromDevice(
  ip: string,
  port = 8888,
  remoteFilePath: string,
  fileName: string
): Promise<void> {
  const query = `?path=${encodeURIComponent(remoteFilePath)}`;
  const res = await fetch(`http://${ip}:${port}/api/download${query}`);
  if (!res.ok) {
    throw new Error(`Download failed: ${res.statusText}`);
  }
  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

export async function executeDeviceAction(
  ip: string,
  port = 8888,
  action: 'mkdir' | 'delete' | 'rename',
  path: string,
  target?: string
): Promise<boolean> {
  const res = await fetch(`http://${ip}:${port}/api/action`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, path, target }),
  });
  if (!res.ok) return false;
  const data = await res.json();
  return !!data.success;
}

export function formatBytes(bytes: number, decimals = 1): string {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}
