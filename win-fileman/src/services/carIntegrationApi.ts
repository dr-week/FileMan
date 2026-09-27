import { uploadFileToDevice, listRemoteFiles, downloadFileFromDevice } from './remoteDeviceApi';
import { RemoteFileItem } from './remoteDeviceTypes';

export interface SoundPackPreset {
  name: string;
  category: 'engine' | 'exhaust' | 'supercharger' | 'ui';
  fileName: string;
}

export const KNOWN_CAR_DIRECTORIES = {
  SOUNDS: '/storage/emulated/0/CarSoundMod/sounds',
  PLAYLISTS: '/storage/emulated/0/Music',
  LOGS: '/storage/emulated/0/CarSoundMod/logs',
  CONFIG: '/storage/emulated/0/CarSoundMod/config',
};

export async function uploadSoundToCar(
  carIp: string,
  port: number,
  soundFile: File | Blob,
  soundName: string,
  onProgress?: (percent: number) => void
) {
  return await uploadFileToDevice(
    carIp,
    port,
    KNOWN_CAR_DIRECTORIES.SOUNDS,
    soundFile,
    soundName,
    onProgress
  );
}

export async function uploadMusicToCar(
  carIp: string,
  port: number,
  musicFile: File | Blob,
  fileName: string,
  onProgress?: (percent: number) => void
) {
  return await uploadFileToDevice(
    carIp,
    port,
    KNOWN_CAR_DIRECTORIES.PLAYLISTS,
    musicFile,
    fileName,
    onProgress
  );
}

export async function listCarSoundFiles(carIp: string, port: number): Promise<RemoteFileItem[]> {
  try {
    const res = await listRemoteFiles(carIp, port, KNOWN_CAR_DIRECTORIES.SOUNDS);
    return res.files || [];
  } catch {
    return [];
  }
}

export async function downloadCarLog(
  carIp: string,
  port: number,
  logPath: string,
  logName: string
) {
  return await downloadFileFromDevice(carIp, port, logPath, logName);
}
