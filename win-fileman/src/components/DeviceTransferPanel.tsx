import React, { useState, useEffect, useRef } from 'react';
import { Smartphone, Car, Upload, RefreshCw, ArrowLeft, Plus } from 'lucide-react';
import { RemoteDevice, RemoteFileItem, TransferProgress } from '../services/remoteDeviceTypes';
import { pingDevice, listRemoteFiles, uploadFileToDevice, downloadFileFromDevice, executeDeviceAction, formatBytes } from '../services/remoteDeviceApi';
import { uploadSoundToCar, KNOWN_CAR_DIRECTORIES } from '../services/carIntegrationApi';
import { DeviceFileList } from './DeviceFileList';

export const DeviceTransferPanel: React.FC = () => {
  const [deviceIp, setDeviceIp] = useState('192.168.1.45');
  const [devicePort, setDevicePort] = useState(8888);
  const [device, setDevice] = useState<RemoteDevice | null>(null);
  const [currentPath, setCurrentPath] = useState('');
  const [files, setFiles] = useState<RemoteFileItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<TransferProgress | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleConnect = async () => {
    setLoading(true);
    const d = await pingDevice(deviceIp, devicePort);
    setDevice(d);
    if (d) {
      await loadFiles(deviceIp, devicePort, '');
    }
    setLoading(false);
  };

  const loadFiles = async (ip: string, port: number, path: string) => {
    setLoading(true);
    try {
      const res = await listRemoteFiles(ip, port, path);
      setCurrentPath(res.path || path);
      setFiles(res.files || []);
    } catch {
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, isCarSound = false) => {
    const file = e.target.files?.[0];
    if (!file || !device) return;
    setProgress({ filename: file.name, progress: 0, status: 'uploading' });
    try {
      if (isCarSound) {
        await uploadSoundToCar(device.ip, device.port, file, file.name, (pct) => {
          setProgress({ filename: file.name, progress: pct, status: 'uploading' });
        });
      } else {
        await uploadFileToDevice(device.ip, device.port, currentPath, file, file.name, (pct) => {
          setProgress({ filename: file.name, progress: pct, status: 'uploading' });
        });
      }
      setProgress({ filename: file.name, progress: 100, status: 'completed' });
      setTimeout(() => setProgress(null), 2500);
      loadFiles(device.ip, device.port, currentPath);
    } catch (err: any) {
      setProgress({ filename: file.name, progress: 0, status: 'error', errorMessage: err.message });
    }
  };

  const handleNavigateUp = () => {
    if (!currentPath) return;
    const parent = currentPath.substring(0, currentPath.lastIndexOf('/')) || '/';
    loadFiles(deviceIp, devicePort, parent);
  };

  const handleDelete = async (item: RemoteFileItem) => {
    if (!device) return;
    const ok = await executeDeviceAction(device.ip, device.port, 'delete', item.path);
    if (ok) loadFiles(device.ip, device.port, currentPath);
  };

  return (
    <div className="transfer-panel-container">
      <div className="transfer-connection-bar">
        <div className="input-group">
          <input
            type="text"
            className="cleaner-input"
            value={deviceIp}
            onChange={(e) => setDeviceIp(e.target.value)}
            placeholder="Target IP (e.g. 192.168.1.45)"
          />
          <input
            type="number"
            className="cleaner-input port"
            value={devicePort}
            onChange={(e) => setDevicePort(parseInt(e.target.value) || 8888)}
            placeholder="Port"
          />
          <button className="scan-btn" onClick={handleConnect} disabled={loading}>
            {loading ? <RefreshCw className="spin" size={15} /> : 'Connect API'}
          </button>
        </div>

        <div className="quick-targets">
          <button onClick={() => { setDeviceIp('192.168.1.45'); setDevicePort(8888); }}>
            <Smartphone size={13} /> Android Phone
          </button>
          <button onClick={() => { setDeviceIp('192.168.1.100'); setDevicePort(8888); }}>
            <Car size={13} /> Car Unit
          </button>
        </div>
      </div>

      {device && (
        <div className="device-status-card">
          <div className="device-info">
            {device.type === 'car' ? <Car size={24} color="#06b6d4" /> : <Smartphone size={24} color="#6366f1" />}
            <div>
              <div className="device-title">{device.name}</div>
              <div className="device-subtitle">{device.ip}:{device.port} • Status: Online</div>
            </div>
          </div>
          {device.freeSpaceBytes !== undefined && (
            <div className="storage-summary">
              Free: {formatBytes(device.freeSpaceBytes)} / {formatBytes(device.totalSpaceBytes || 0)}
            </div>
          )}
        </div>
      )}

      {progress && (
        <div className="progress-bar-container">
          <div className="progress-info">
            <span>{progress.filename}</span>
            <span>{progress.status === 'uploading' ? `${progress.progress}%` : progress.status}</span>
          </div>
          <div className="progress-track">
            <div className={`progress-fill ${progress.status}`} style={{ width: `${progress.progress}%` }} />
          </div>
        </div>
      )}

      <div className="remote-explorer-header">
        <div className="path-controls">
          <button className="icon-action-btn" onClick={handleNavigateUp} title="Parent Directory">
            <ArrowLeft size={16} />
          </button>
          <span className="current-path-text">{currentPath || 'Root / Storage'}</span>
        </div>
        <div className="action-buttons">
          <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={(e) => handleUpload(e, false)} />
          <button className="action-pill-btn" onClick={() => fileInputRef.current?.click()} disabled={!device}>
            <Upload size={14} /> Send File
          </button>
          <button className="action-pill-btn car" onClick={() => fileInputRef.current?.click()} disabled={!device}>
            <Car size={14} /> Send Sound Pack
          </button>
          <button className="icon-action-btn" onClick={() => device && loadFiles(device.ip, device.port, currentPath)} title="Refresh">
            <RefreshCw size={15} />
          </button>
        </div>
      </div>

      <div className="remote-files-scroll">
        <DeviceFileList
          files={files}
          onNavigateFolder={(p) => loadFiles(deviceIp, devicePort, p)}
          onDownloadFile={(f) => device && downloadFileFromDevice(device.ip, device.port, f.path, f.name)}
          onDeleteFile={handleDelete}
        />
      </div>
    </div>
  );
};
