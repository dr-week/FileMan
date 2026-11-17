import React, { useEffect, useState } from 'react';
import { AlertTriangle, Folder, HardDrive, Layers3 } from 'lucide-react';
import { getVolumeSpace, isDesktopRuntime, StorageScanResult, VolumeSpaceInfo } from '../../../services/fileSystemApi';
import { VolumeCapacityBar } from './VolumeCapacityBar';

interface StorageScanResultsProps {
  scan: StorageScanResult;
  formatBytes: (bytes: number) => string;
}

const categoryColors: Record<string, string> = {
  image: '#38bdf8',
  video: '#f97316',
  audio: '#a3e635',
  document: '#facc15',
  archive: '#c084fc',
  application: '#fb7185',
  other: '#94a3b8',
};

const categoryLabels: Record<string, string> = {
  image: 'Photos',
  video: 'Videos',
  audio: 'Audio',
  document: 'Documents',
  archive: 'Archives',
  application: 'Applications',
  other: 'Other files',
};

export const StorageScanResults: React.FC<StorageScanResultsProps> = ({ scan, formatBytes }) => {
  const [volume, setVolume] = useState<VolumeSpaceInfo | null>(null);

  useEffect(() => {
    if (!isDesktopRuntime()) return;
    getVolumeSpace(scan.root).then(setVolume).catch(() => setVolume(null));
  }, [scan.root]);

  let chartOffset = 0;
  const chartSlices = scan.categories.map(category => {
    const start = chartOffset;
    chartOffset += scan.totalBytes > 0 ? category.sizeBytes / scan.totalBytes * 100 : 0;
    return `${categoryColors[category.category] ?? categoryColors.other} ${start}% ${chartOffset}%`;
  });
  const chartBackground = chartSlices.length > 0
    ? `conic-gradient(${chartSlices.join(', ')})`
    : 'conic-gradient(#334155 0% 100%)';

  return (
    <div className="storage-scan-results">
      {volume && <VolumeCapacityBar volume={volume} scannedBytes={scan.totalBytes} formatBytes={formatBytes} />}
      <div className="storage-scan-metrics">
        <div><span>Measured size</span><strong>{formatBytes(scan.totalBytes)}</strong></div>
        <div><span>Files</span><strong>{scan.fileCount.toLocaleString()}</strong></div>
        <div><span>Folders</span><strong>{scan.folderCount.toLocaleString()}</strong></div>
        <div><span>Scan time</span><strong>{(scan.durationMs / 1000).toFixed(1)} sec</strong></div>
      </div>

      {scan.skippedCount > 0 && (
        <div className="storage-scan-message warning">
          <AlertTriangle size={17} />
          <span>{scan.skippedCount.toLocaleString()} files, folders, or links were skipped; totals may be incomplete.</span>
        </div>
      )}

      <section className="storage-scan-visuals">
        <div className="storage-panel storage-category-panel">
          <div className="storage-panel-heading"><Layers3 size={16} /><h2>Space by file type</h2></div>
          {scan.categories.length === 0 ? (
            <p className="storage-empty-inline">No files were found in this location.</p>
          ) : (
            <div className="storage-chart-layout">
              <div className="storage-pie-chart" style={{ background: chartBackground }} role="img" aria-label="Disk space by file type" />
              <div className="storage-category-legend">
                {scan.categories.map(category => {
                  const share = scan.totalBytes > 0 ? category.sizeBytes / scan.totalBytes * 100 : 0;
                  return (
                    <div className="storage-category-row" key={category.category}>
                      <span className="storage-category-dot" style={{ background: categoryColors[category.category] ?? categoryColors.other }} />
                      <span className="storage-category-name">{categoryLabels[category.category] ?? category.category}</span>
                      <strong>{formatBytes(category.sizeBytes)}</strong>
                      <small>{share.toFixed(1)}%</small>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="storage-panel storage-largest-panel">
          <div className="storage-panel-heading"><HardDrive size={16} /><h2>Largest folders</h2></div>
          {scan.largestFolders.length === 0 ? (
            <p className="storage-empty-inline">No non-empty subfolders were found.</p>
          ) : scan.largestFolders.map(folder => {
            const share = scan.totalBytes > 0 ? folder.sizeBytes / scan.totalBytes * 100 : 0;
            return (
              <div className="storage-folder-row" key={folder.path} title={folder.path}>
                <div className="storage-folder-heading">
                  <Folder size={15} />
                  <span>{folder.name}</span>
                  <strong>{formatBytes(folder.sizeBytes)}</strong>
                </div>
                <div className="storage-folder-bar"><span style={{ width: `${Math.min(share, 100)}%` }} /></div>
                <small>{folder.fileCount.toLocaleString()} files · {share.toFixed(1)}% of scanned size</small>
              </div>
            );
          })}
        </div>
      </section>

      <div className="storage-scan-disclaimer">
        Scanned: {scan.root}. This is the signed-in user’s selected folder only. System areas, other user profiles, duplicate files, and installed-app usage were not analyzed. No files were changed.
      </div>
    </div>
  );
};