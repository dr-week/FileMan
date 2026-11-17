import React, { useEffect, useState } from 'react';
import { AlertTriangle, HardDrive, RotateCw, ScanSearch, ShieldAlert } from 'lucide-react';
import { formatBytes } from '../services/appCleanerService';
import {
  CleanerScanRoot,
  getCleanerScanRoots,
  scanStorage,
  StorageScanResult,
} from '../services/fileSystemApi';
import { AppDataAuditView } from '../features/cleaner/components/AppDataAuditView';
import { StorageScanResults } from '../features/cleaner/components/StorageScanResults';

type CleanerMode = 'appdata' | 'storage-map';

export const AppCleaner: React.FC = () => {
  const [mode, setMode] = useState<CleanerMode>('appdata');
  const [roots, setRoots] = useState<CleanerScanRoot[]>([]);
  const [selectedRoot, setSelectedRoot] = useState('');
  const [scan, setScan] = useState<StorageScanResult | null>(null);
  const [isLoadingRoots, setIsLoadingRoots] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getCleanerScanRoots()
      .then(availableRoots => {
        setRoots(availableRoots);
        setSelectedRoot(availableRoots[0]?.path ?? '');
      })
      .catch(reason => setError(reason instanceof Error ? reason.message : 'Unable to load scan locations.'))
      .finally(() => setIsLoadingRoots(false));
  }, []);

  const handleScan = async () => {
    if (!selectedRoot || isScanning) return;
    setIsScanning(true);
    setError(null);
    setScan(null);
    try {
      setScan(await scanStorage(selectedRoot));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'The selected location could not be scanned.');
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="cleaner-container real-cleaner">
      <div className="cleaner-mode-bar">
        <button
          type="button"
          className={`cleaner-mode-pill ${mode === 'appdata' ? 'active' : ''}`}
          onClick={() => setMode('appdata')}
        >
          <ShieldAlert size={15} />
          <span>AppData & Junk Scan</span>
        </button>
        <button
          type="button"
          className={`cleaner-mode-pill ${mode === 'storage-map' ? 'active' : ''}`}
          onClick={() => setMode('storage-map')}
        >
          <HardDrive size={15} />
          <span>Folder Storage Map</span>
        </button>
      </div>

      {mode === 'appdata' ? (
        <AppDataAuditView />
      ) : (
        <>
          <header className="storage-scan-header">
            <div>
              <div className="storage-scan-kicker"><HardDrive size={14} /> Disk storage</div>
              <h1>Storage scan</h1>
              <p>Measure real files in a selected folder. This scan does not modify or delete files.</p>
            </div>
            <div className="storage-scan-controls">
              <select
                aria-label="Folder to scan"
                value={selectedRoot}
                onChange={event => setSelectedRoot(event.target.value)}
                disabled={isLoadingRoots || isScanning || roots.length === 0}
              >
                {roots.map(root => <option key={root.path} value={root.path}>{root.name}</option>)}
              </select>
              <button type="button" className="cleaner-btn primary" onClick={handleScan} disabled={!selectedRoot || isScanning || isLoadingRoots}>
                {isScanning ? <RotateCw size={16} className="spin" /> : <ScanSearch size={16} />}
                <span>{isScanning ? 'Scanning...' : scan ? 'Scan again' : 'Scan folder'}</span>
              </button>
            </div>
          </header>

          {error && (
            <div className="storage-scan-message error" role="alert">
              <AlertTriangle size={17} />
              <span>{error}</span>
            </div>
          )}
          {isScanning && <div className="storage-scan-empty">Reading folder and file metadata. Large locations can take time.</div>}
          {!isScanning && !scan && !error && !isLoadingRoots && roots.length > 0 && (
            <div className="storage-scan-empty">Choose a location and start a scan to see measured storage usage.</div>
          )}
          {scan && !isScanning && <StorageScanResults scan={scan} formatBytes={formatBytes} />}
        </>
      )}
    </div>
  );
};
