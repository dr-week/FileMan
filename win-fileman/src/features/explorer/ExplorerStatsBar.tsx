import React from 'react';
import { ExternalLink, FolderPlus } from 'lucide-react';
import { FileEntry } from '../shared/types';
import { formatBytes } from '../shared/formatters';
import { createFolder, isDesktopRuntime, openInExplorer } from '../../services/fileSystemApi';

interface ExplorerStatsBarProps {
  currentPath: string;
  files: FileEntry[];
  onRefresh: () => void;
}

const CAT_COLORS: Record<string, string> = {
  image: '#38bdf8',
  video: '#f97316',
  audio: '#a3e635',
  document: '#facc15',
  archive: '#c084fc',
  application: '#fb7185',
  other: '#94a3b8',
};

export const ExplorerStatsBar: React.FC<ExplorerStatsBarProps> = ({
  currentPath,
  files,
  onRefresh,
}) => {
  const totalBytes = files.reduce((sum, item) => sum + (item.sizeBytes ?? 0), 0);
  const folderCount = files.filter(item => item.type === 'folder').length;
  const catTotals = new Map<string, number>();

  for (const file of files) {
    if (file.type === 'folder') continue;
    const cat = file.category ?? 'other';
    catTotals.set(cat, (catTotals.get(cat) ?? 0) + (file.sizeBytes ?? 0));
  }

  const handleNewFolder = async () => {
    const name = window.prompt('New folder name:');
    if (!name || !isDesktopRuntime()) return;
    await createFolder(currentPath, name);
    onRefresh();
  };

  return (
    <div className="explorer-stats-wrap">
      <div className="explorer-summary-row">
        <div className="explorer-summary-card"><span className="explorer-kicker">Items</span><strong>{files.length}</strong></div>
        <div className="explorer-summary-card"><span className="explorer-kicker">Total</span><strong>{formatBytes(totalBytes)}</strong></div>
        <div className="explorer-summary-card"><span className="explorer-kicker">Folders</span><strong>{folderCount}</strong></div>
        <div className="explorer-quick-actions">
          <button type="button" className="cleaner-btn secondary" onClick={handleNewFolder} title="Create folder">
            <FolderPlus size={14} /><span>New Folder</span>
          </button>
          <button type="button" className="cleaner-btn secondary" onClick={() => isDesktopRuntime() && openInExplorer(currentPath)} title="Open in Windows Explorer">
            <ExternalLink size={14} /><span>Explorer</span>
          </button>
        </div>
      </div>
      {totalBytes > 0 && (
        <div className="stacked-bar-track explorer-cat-bar" aria-label="Folder file category breakdown">
          {Array.from(catTotals.entries()).map(([cat, bytes]) => (
            <div key={cat} title={`${cat}: ${formatBytes(bytes)}`} style={{ width: `${(bytes / totalBytes) * 100}%`, background: CAT_COLORS[cat] ?? '#94a3b8' }} />
          ))}
        </div>
      )}
    </div>
  );
};
