import React from 'react';
import { Folder, File } from 'lucide-react';

export interface FileItem {
  name: string;
  isDir: boolean;
  size?: string;
}

interface FileCardProps {
  file: FileItem;
  onClick?: () => void;
}

export const FileCard: React.FC<FileCardProps> = ({ file, onClick }) => {
  return (
    <div className="file-card" onClick={onClick}>
      {file.isDir ? (
        <Folder size={42} color="#06b6d4" />
      ) : (
        <File size={42} color="#10b981" />
      )}
      <div className="file-name">{file.name}</div>
      {!file.isDir && (
        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
          {file.size}
        </div>
      )}
    </div>
  );
};
