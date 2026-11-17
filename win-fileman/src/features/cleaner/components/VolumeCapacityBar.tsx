import React from 'react';
import { HardDrive } from 'lucide-react';
import { VolumeSpaceInfo } from '../../../services/fileSystemApi';

interface VolumeCapacityBarProps {
  volume: VolumeSpaceInfo;
  scannedBytes: number;
  formatBytes: (bytes: number) => string;
}

export const VolumeCapacityBar: React.FC<VolumeCapacityBarProps> = ({
  volume,
  scannedBytes,
  formatBytes,
}) => {
  const usedPct = volume.totalBytes > 0 ? (volume.usedBytes / volume.totalBytes) * 100 : 0;
  const scannedPct = volume.totalBytes > 0 ? (scannedBytes / volume.totalBytes) * 100 : 0;

  return (
    <div className="infographic-card volume-capacity-card">
      <div className="infographic-header">
        <HardDrive size={15} />
        <span>Volume {volume.root} Disk Capacity</span>
        <small>{formatBytes(volume.freeBytes)} free of {formatBytes(volume.totalBytes)}</small>
      </div>
      <div className="stacked-bar-track">
        <div className="stacked-bar-caution" style={{ width: `${Math.min(usedPct, 100)}%` }} />
        <div className="stacked-bar-safe" style={{ width: `${Math.min(scannedPct, 100)}%`, position: 'absolute', left: 0, top: 0, bottom: 0 }} />
      </div>
      <div className="stacked-bar-legend">
        <span><i className="dot safe" /> Scanned Root: {formatBytes(scannedBytes)} ({scannedPct.toFixed(1)}%)</span>
        <span><i className="dot caution" /> Total Volume Used: {formatBytes(volume.usedBytes)} ({usedPct.toFixed(1)}%)</span>
      </div>
    </div>
  );
};
