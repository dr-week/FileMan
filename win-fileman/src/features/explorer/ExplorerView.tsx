import React, { FormEvent, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, ArrowUp, RotateCw } from 'lucide-react';
import { FileEntry } from '../shared/types';
import { formatBytes } from '../shared/formatters';
import { filterFiles, sortFiles } from './explorerUtils';
import { ExplorerToolbar } from './ExplorerToolbar';
import { ExplorerStatsBar } from './ExplorerStatsBar';
import { Breadcrumb } from './Breadcrumb';
import { MetadataPanel } from './MetadataPanel';
import { listDirectory } from '../../services/fileSystemApi';

interface ExplorerViewProps {
  currentPath: string;
  query: string;
  canGoBack: boolean;
  canGoForward: boolean;
  onNavigate: (path: string) => void;
  onBack: () => void;
  onForward: () => void;
  onUp: () => void;
  onRefresh: () => void;
  refreshToken: number;
}

export const ExplorerView: React.FC<ExplorerViewProps> = ({
  currentPath, query, canGoBack, canGoForward, onNavigate, onBack, onForward, onUp, onRefresh, refreshToken,
}) => {
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [skippedCount, setSkippedCount] = useState(0);
  const [addressValue, setAddressValue] = useState(currentPath);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [sortMode, setSortMode] = useState<'name' | 'size' | 'modifiedAt'>('name');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setAddressValue(currentPath);
    setIsLoading(true);
    setLoadError(null);

    listDirectory(currentPath)
      .then(result => {
        if (!active) return;
        const entries = result.entries.map(entry => ({
          ...entry,
          modifiedAt: entry.modifiedAt && /^\d+$/.test(entry.modifiedAt)
            ? new Date(Number(entry.modifiedAt) * 1000).toISOString().slice(0, 10)
            : entry.modifiedAt,
        }));
        setFiles(entries);
        setSkippedCount(result.skippedCount);
        setSelectedId(entries[0]?.id ?? null);
      })
      .catch(error => {
        if (!active) return;
        setFiles([]);
        setSkippedCount(0);
        setSelectedId(null);
        setLoadError(error instanceof Error ? error.message : 'Unable to open this location.');
      })
      .finally(() => { if (active) setIsLoading(false); });

    return () => { active = false; };
  }, [currentPath, refreshToken]);

  const visibleFiles = useMemo(() => sortFiles(filterFiles(files, query), sortMode), [files, query, sortMode]);
  const selectedItem = visibleFiles.find(item => item.id === selectedId) ?? visibleFiles[0] ?? null;

  const handleAddressSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (addressValue.trim()) onNavigate(addressValue.trim());
  };

  return (
    <div className="explorer-shell">
      <ExplorerStatsBar currentPath={currentPath} files={visibleFiles} onRefresh={onRefresh} />

      <div className="explorer-topbar">
        <div className="explorer-location-controls">
          <button type="button" className="location-control" onClick={onBack} disabled={!canGoBack} aria-label="Back"><ArrowLeft size={16} /></button>
          <button type="button" className="location-control" onClick={onForward} disabled={!canGoForward} aria-label="Forward"><ArrowRight size={16} /></button>
          <button type="button" className="location-control" onClick={onUp} disabled={currentPath.length <= 3} aria-label="Up"><ArrowUp size={16} /></button>
          <button type="button" className="location-control" onClick={onRefresh} aria-label="Refresh"><RotateCw size={16} /></button>
          <form className="address-form" onSubmit={handleAddressSubmit}>
            <input aria-label="Folder path" value={addressValue} onChange={event => setAddressValue(event.target.value)} />
          </form>
        </div>
        <Breadcrumb path={currentPath} onNavigate={onNavigate} />
        <ExplorerToolbar sortMode={sortMode} onSortChange={setSortMode} viewMode={viewMode} onViewChange={setViewMode} />
      </div>

      <div className="explorer-main">
        <div className="explorer-pane">
          <div className="explorer-table-wrap">
            <div className="explorer-table-header"><span>Name</span><span>Type</span><span>Size</span><span>Modified</span></div>
            {visibleFiles.map(file => (
              <button
                key={file.id}
                type="button"
                className={`explorer-row ${selectedId === file.id ? 'selected' : ''}`}
                onClick={() => setSelectedId(file.id)}
                onDoubleClick={() => file.type === 'folder' && onNavigate(file.path)}
              >
                <span className="explorer-name">{file.name}</span>
                <span className="explorer-meta">{file.type}</span>
                <span className="explorer-meta">{file.sizeBytes ? formatBytes(file.sizeBytes) : '—'}</span>
                <span className="explorer-meta">{file.modifiedAt ?? 'n/a'}</span>
              </button>
            ))}
            {!isLoading && loadError && <div className="explorer-empty-state">{loadError}</div>}
            {!isLoading && !loadError && visibleFiles.length === 0 && <div className="explorer-empty-state">This folder is empty.</div>}
            {isLoading && <div className="explorer-empty-state">Loading folder contents...</div>}
            {!isLoading && skippedCount > 0 && <div className="explorer-empty-state">{skippedCount} items skipped due to permissions.</div>}
          </div>
        </div>
        <MetadataPanel item={selectedItem} />
      </div>
    </div>
  );
};
