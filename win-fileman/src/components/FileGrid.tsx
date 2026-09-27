import React from 'react';
import { FileCard, FileItem } from './FileCard';

interface FileGridProps {
  files: FileItem[];
  onFileClick?: (file: FileItem) => void;
}

export const FileGrid: React.FC<FileGridProps> = ({ files, onFileClick }) => {
  if (files.length === 0) {
    return (
      <div style={{ padding: '40px', color: 'var(--text-secondary)', textAlign: 'center' }}>
        No files or folders found.
      </div>
    );
  }

  return (
    <div className="file-grid">
      {files.map((file, idx) => (
        <FileCard key={idx} file={file} onClick={() => onFileClick?.(file)} />
      ))}
    </div>
  );
};
