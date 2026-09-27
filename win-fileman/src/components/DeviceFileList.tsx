import React from 'react';
import { Folder, FileText, Music, Image, Download, Trash2 } from 'lucide-react';
import { RemoteFileItem } from '../services/remoteDeviceTypes';
import { formatBytes } from '../services/remoteDeviceApi';

interface DeviceFileListProps {
  files: RemoteFileItem[];
  onNavigateFolder: (path: string) => void;
  onDownloadFile: (file: RemoteFileItem) => void;
  onDeleteFile: (file: RemoteFileItem) => void;
}

export const DeviceFileList: React.FC<DeviceFileListProps> = ({
  files,
  onNavigateFolder,
  onDownloadFile,
  onDeleteFile,
}) => {
  const getFileIcon = (file: RemoteFileItem) => {
    if (file.isDir) return <Folder size={18} color="#f59e0b" />;
    const mime = (file.mime || '').toLowerCase();
    const name = file.name.toLowerCase();
    if (mime.includes('audio') || name.endsWith('.mp3') || name.endsWith('.wav') || name.endsWith('.ogg')) {
      return <Music size={18} color="#ec4899" />;
    }
    if (mime.includes('image') || name.endsWith('.png') || name.endsWith('.jpg')) {
      return <Image size={18} color="#06b6d4" />;
    }
    return <FileText size={18} color="#94a3b8" />;
  };

  if (files.length === 0) {
    return (
      <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>
        No files found in this directory.
      </div>
    );
  }

  return (
    <div className="remote-files-list">
      {files.map((file) => (
        <div
          key={file.path || file.name}
          className="remote-file-row"
          onClick={() => file.isDir && onNavigateFolder(file.path)}
        >
          <div className="remote-file-info">
            {getFileIcon(file)}
            <span className="remote-file-name" title={file.name}>
              {file.name}
            </span>
          </div>

          <div className="remote-file-actions">
            <span className="remote-file-size">
              {file.isDir ? 'Folder' : formatBytes(file.size)}
            </span>

            {!file.isDir && (
              <button
                className="icon-action-btn"
                title="Download to Windows"
                onClick={(e) => {
                  e.stopPropagation();
                  onDownloadFile(file);
                }}
              >
                <Download size={15} color="#06b6d4" />
              </button>
            )}

            <button
              className="icon-action-btn delete"
              title="Delete remote item"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteFile(file);
              }}
            >
              <Trash2 size={15} color="#ef4444" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
