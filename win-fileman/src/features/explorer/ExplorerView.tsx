import React, { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowDownUp,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  File,
  FileArchive,
  FileCode2,
  FileImage,
  FileMusic,
  FileText,
  FileVideo,
  Folder,
  HardDrive,
  Info,
  LayoutGrid,
  List,
  Plus,
  RotateCw,
  Search,
  X,
} from 'lucide-react';
import { FileEntry } from '../shared/types';
import { formatBytes } from '../shared/formatters';
import { filterFiles, sortFiles } from './explorerUtils';
import { Breadcrumb } from './Breadcrumb';
import { MetadataPanel } from './MetadataPanel';
import {
  getVolumeSpace,
  listDirectory,
  VolumeSpaceInfo,
} from '../../services/fileSystemApi';
import { WorkspaceViewId } from '../../extensions/registry';

export interface PaneTab {
  id: string;
  path: string;
}

interface ExplorerViewProps {
  currentPath: string;
  tabs: PaneTab[];
  activeTabId: string;
  showHidden: boolean;
  showPreview: boolean;
  canGoBack: boolean;
  canGoForward: boolean;
  refreshToken: number;
  onNavigate: (path: string) => void;
  onBack: () => void;
  onForward: () => void;
  onUp: () => void;
  onRefresh: () => void;
  onNewTab: () => void;
  onSelectTab: (tabId: string) => void;
  onCloseTab: (tabId: string) => void;
  onClosePreview: () => void;
  onSelectionChange: (item: FileEntry | null) => void;
  onOpenView: (view: WorkspaceViewId) => void;
  onNotify: (message: string) => void;
}

const CAT_COLORS: Record<string, string> = {
  image: '#38bdf8',
  video: '#f97316',
  audio: '#a3e635',
  document: '#facc15',
  code: '#818cf8',
  archive: '#c084fc',
  application: '#fb7185',
  other: '#94a3b8',
};

function getFolderLabel(path: string): string {
  const cleaned = path.replace(/[\\/]+$/, '');
  if (!cleaned || /^[a-z]:$/i.test(cleaned)) return cleaned ? `${cleaned}\\` : 'Root';
  const parts = cleaned.split(/[\\/]/).filter(Boolean);
  return parts[parts.length - 1] || cleaned;
}

function getRecencyColor(modifiedAt?: string): string {
  if (!modifiedAt) return 'transparent';
  const parsed = Date.parse(modifiedAt);
  if (Number.isNaN(parsed)) return 'transparent';
  const ageDays = (Date.now() - parsed) / (1000 * 60 * 60 * 24);
  if (ageDays <= 1) return '#34d399';
  if (ageDays <= 7) return '#38bdf8';
  if (ageDays <= 30) return '#818cf8';
  if (ageDays <= 180) return '#64748b';
  return 'rgba(148, 163, 184, 0.25)';
}

function renderEntryIcon(entry: FileEntry, size = 15) {
  if (entry.type === 'folder') return <Folder size={size} color="var(--fl-amber)" />;
  const color = CAT_COLORS[entry.category ?? 'other'] ?? 'var(--fl-text-secondary)';
  switch (entry.category) {
    case 'image':
      return <FileImage size={size} color={color} />;
    case 'video':
      return <FileVideo size={size} color={color} />;
    case 'audio':
      return <FileMusic size={size} color={color} />;
    case 'archive':
      return <FileArchive size={size} color={color} />;
    case 'code':
      return <FileCode2 size={size} color={color} />;
    case 'document':
      return <FileText size={size} color={color} />;
    default:
      return <File size={size} color={color} />;
  }
}

export const ExplorerView: React.FC<ExplorerViewProps> = ({
  currentPath,
  tabs,
  activeTabId,
  showHidden,
  showPreview,
  canGoBack,
  canGoForward,
  refreshToken,
  onNavigate,
  onBack,
  onForward,
  onUp,
  onRefresh,
  onNewTab,
  onSelectTab,
  onCloseTab,
  onClosePreview,
  onSelectionChange,
  onOpenView,
  onNotify,
}) => {
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [skippedCount, setSkippedCount] = useState(0);
  const [volumeInfo, setVolumeInfo] = useState<VolumeSpaceInfo | null>(null);
  const [addressValue, setAddressValue] = useState(currentPath);
  const [isEditingPath, setIsEditingPath] = useState(false);
  const [filterQuery, setFilterQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [sortMode, setSortMode] = useState<'name' | 'size' | 'modifiedAt'>('name');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const pathInputRef = useRef<HTMLInputElement>(null);
  const filterInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let active = true;
    setAddressValue(currentPath);
    setIsEditingPath(false);
    setIsLoading(true);
    setLoadError(null);

    listDirectory(currentPath)
      .then(result => {
        if (!active) return;
        const entries = result.entries.map(entry => ({
          ...entry,
          modifiedAt:
            entry.modifiedAt && /^\d+$/.test(entry.modifiedAt)
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
      .finally(() => {
        if (active) setIsLoading(false);
      });

    getVolumeSpace(currentPath)
      .then(info => {
        if (active) setVolumeInfo(info);
      })
      .catch(() => {
        if (active) setVolumeInfo(null);
      });

    return () => {
      active = false;
    };
  }, [currentPath, refreshToken]);

  // Pane-level keyboard shortcuts (Ctrl+L edit path, Ctrl+F focus filter)
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'l') {
        event.preventDefault();
        setIsEditingPath(true);
        setTimeout(() => pathInputRef.current?.select(), 0);
      } else if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'f') {
        event.preventDefault();
        filterInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const visibleFiles = useMemo(() => {
    const hiddenFiltered = showHidden ? files : files.filter(entry => !entry.isHidden);
    return sortFiles(filterFiles(hiddenFiltered, filterQuery), sortMode);
  }, [files, showHidden, filterQuery, sortMode]);

  const selectedItem = useMemo(
    () => visibleFiles.find(item => item.id === selectedId) ?? visibleFiles[0] ?? null,
    [visibleFiles, selectedId],
  );

  useEffect(() => {
    onSelectionChange(selectedItem);
  }, [selectedItem, onSelectionChange]);

  const { totalBytes, folderCount, catTotals } = useMemo(() => {
    let bytes = 0;
    let folders = 0;
    const cats = new Map<string, number>();
    for (const entry of visibleFiles) {
      if (entry.type === 'folder') {
        folders += 1;
        continue;
      }
      const size = entry.sizeBytes ?? 0;
      bytes += size;
      const cat = entry.category ?? 'other';
      cats.set(cat, (cats.get(cat) ?? 0) + size);
    }
    return { totalBytes: bytes, folderCount: folders, catTotals: cats };
  }, [visibleFiles]);

  const usedPercent = useMemo(() => {
    if (!volumeInfo || volumeInfo.totalBytes <= 0) return 0;
    return Math.min(100, Math.round((volumeInfo.usedBytes / volumeInfo.totalBytes) * 100));
  }, [volumeInfo]);

  const handleAddressSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (addressValue.trim()) {
      onNavigate(addressValue.trim());
    }
    setIsEditingPath(false);
  };

  const cycleSort = () => {
    setSortMode(prev => (prev === 'name' ? 'size' : prev === 'size' ? 'modifiedAt' : 'name'));
  };

  return (
    <>
      {/* Main Pane + Optional Right Preview Area */}
      <div className="fl-workspace-body">
        <section className="fl-pane-card active-pane" aria-label="Active file pane">
          {/* Browser-style Tab Strip */}
          <div className="fl-tab-strip" role="tablist">
            {tabs.map(tab => {
              const isActive = tab.id === activeTabId;
              return (
                <div
                  key={tab.id}
                  role="tab"
                  aria-selected={isActive}
                  className={`fl-tab ${isActive ? 'active' : ''}`}
                  onClick={() => onSelectTab(tab.id)}
                  title={tab.path}
                >
                  <Folder size={13} color={isActive ? 'var(--fl-accent)' : 'var(--fl-text-muted)'} />
                  <span className="fl-tab-label">{getFolderLabel(tab.path)}</span>
                  {tabs.length > 1 && (
                    <button
                      type="button"
                      className="fl-tab-close"
                      aria-label={`Close ${getFolderLabel(tab.path)} tab`}
                      onClick={e => {
                        e.stopPropagation();
                        onCloseTab(tab.id);
                      }}
                    >
                      <X size={11} />
                    </button>
                  )}
                </div>
              );
            })}
            <button
              type="button"
              className="fl-icon-btn"
              onClick={onNewTab}
              title="New tab (Ctrl+T)"
              aria-label="New tab"
              style={{ marginBottom: 2 }}
            >
              <Plus size={13} />
            </button>
          </div>

          {/* Integrated Navigation, Breadcrumb/Path Input & Per-Pane Filter */}
          <div className="fl-path-bar">
            <button type="button" className="fl-icon-btn" onClick={onBack} disabled={!canGoBack} title="Back (Alt+Left)" aria-label="Back">
              <ArrowLeft size={14} />
            </button>
            <button type="button" className="fl-icon-btn" onClick={onForward} disabled={!canGoForward} title="Forward (Alt+Right)" aria-label="Forward">
              <ArrowRight size={14} />
            </button>
            <button type="button" className="fl-icon-btn" onClick={onUp} disabled={currentPath.length <= 3} title="Up (Alt+Up)" aria-label="Up">
              <ArrowUp size={14} />
            </button>
            <button type="button" className="fl-icon-btn" onClick={onRefresh} title="Refresh (F5)" aria-label="Refresh">
              <RotateCw size={13} />
            </button>

            <div
              className={`fl-crumb-box ${isEditingPath ? 'editing' : ''}`}
              onClick={() => {
                if (!isEditingPath) {
                  setIsEditingPath(true);
                  setTimeout(() => pathInputRef.current?.select(), 0);
                }
              }}
              title="Click or press Ctrl+L to edit path"
            >
              {isEditingPath ? (
                <form onSubmit={handleAddressSubmit} style={{ width: '100%' }}>
                  <input
                    ref={pathInputRef}
                    className="fl-path-input"
                    aria-label="Folder path"
                    value={addressValue}
                    onChange={e => setAddressValue(e.target.value)}
                    onBlur={() => setIsEditingPath(false)}
                    onKeyDown={e => {
                      if (e.key === 'Escape') {
                        setAddressValue(currentPath);
                        setIsEditingPath(false);
                      }
                    }}
                  />
                </form>
              ) : (
                <div onClick={e => e.stopPropagation()} style={{ display: 'flex', alignItems: 'center', minWidth: 0, overflow: 'hidden' }}>
                  <Breadcrumb path={currentPath} onNavigate={onNavigate} />
                </div>
              )}
            </div>

            <div className="fl-filter-box">
              <Search size={12} color="var(--fl-text-muted)" />
              <input
                ref={filterInputRef}
                className="fl-filter-input"
                placeholder="Filter folder (Ctrl+F)"
                value={filterQuery}
                onChange={e => setFilterQuery(e.target.value)}
              />
              {filterQuery && (
                <button
                  type="button"
                  className="fl-tab-close"
                  onClick={() => setFilterQuery('')}
                  aria-label="Clear filter"
                >
                  <X size={11} />
                </button>
              )}
            </div>
          </div>

          {/* Drive Usage Strip */}
          <div className="fl-folder-strip">
            <div className="fl-drive-track" title={volumeInfo ? `${usedPercent}% used` : 'Volume usage'}>
              <div
                className={`fl-drive-fill ${usedPercent >= 90 ? 'critical' : ''}`}
                style={{ width: `${volumeInfo ? usedPercent : 0}%` }}
              />
            </div>
            <span className="fl-drive-label">
              {volumeInfo
                ? `${formatBytes(volumeInfo.freeBytes)} free of ${formatBytes(volumeInfo.totalBytes)}`
                : currentPath}
            </span>
          </div>

          {/* File List / Tiles Viewport */}
          <div className="fl-list-viewport">
            {viewMode === 'list' ? (
              <>
                <div className="fl-details-header">
                  <button type="button" className="fl-col-btn" onClick={() => setSortMode('name')}>
                    Name {sortMode === 'name' ? '▾' : ''}
                  </button>
                  <span>Type</span>
                  <button type="button" className="fl-col-btn" onClick={() => setSortMode('size')}>
                    Size {sortMode === 'size' ? '▾' : ''}
                  </button>
                  <button type="button" className="fl-col-btn" onClick={() => setSortMode('modifiedAt')}>
                    Modified {sortMode === 'modifiedAt' ? '▾' : ''}
                  </button>
                </div>

                {visibleFiles.map(file => (
                  <button
                    key={file.id}
                    type="button"
                    className={`fl-details-row ${selectedId === file.id ? 'selected' : ''} ${file.isHidden ? 'dimmed' : ''}`}
                    onClick={() => setSelectedId(file.id)}
                    onDoubleClick={() => {
                      if (file.type === 'folder') onNavigate(file.path);
                    }}
                  >
                    <span className="fl-name-cell">
                      <span
                        className="fl-age-bar"
                        style={{ background: getRecencyColor(file.modifiedAt) }}
                        aria-hidden="true"
                      />
                      {renderEntryIcon(file, 15)}
                      <span className="fl-name-text">{file.name}</span>
                    </span>
                    <span className="fl-meta-cell">{file.type === 'folder' ? 'Folder' : file.extension || file.category || 'File'}</span>
                    <span className="fl-meta-cell">{file.sizeBytes ? formatBytes(file.sizeBytes) : '—'}</span>
                    <span className="fl-meta-cell">{file.modifiedAt ?? '—'}</span>
                  </button>
                ))}
              </>
            ) : (
              <div className="fl-tiles-grid">
                {visibleFiles.map(file => (
                  <button
                    key={file.id}
                    type="button"
                    className={`fl-tile ${selectedId === file.id ? 'selected' : ''}`}
                    onClick={() => setSelectedId(file.id)}
                    onDoubleClick={() => {
                      if (file.type === 'folder') onNavigate(file.path);
                    }}
                  >
                    {renderEntryIcon(file, 34)}
                    <span className="fl-tile-age" style={{ background: getRecencyColor(file.modifiedAt) }} />
                    <span className="fl-tile-name">{file.name}</span>
                  </button>
                ))}
              </div>
            )}

            {!isLoading && loadError && <div className="explorer-empty-state">{loadError}</div>}
            {!isLoading && !loadError && visibleFiles.length === 0 && (
              <div className="explorer-empty-state">
                {filterQuery ? `No items matching "${filterQuery}".` : 'This folder is empty.'}
              </div>
            )}
            {isLoading && <div className="explorer-empty-state">Loading folder contents...</div>}
            {!isLoading && skippedCount > 0 && (
              <div className="explorer-empty-state">{skippedCount} items skipped due to permissions.</div>
            )}
          </div>

          {/* Pane Footer (Sort & View Controls) */}
          <div className="fl-pane-footer">
            <span>
              {visibleFiles.length} items ({folderCount} folders) · {formatBytes(totalBytes)}
            </span>
            <div className="fl-pane-footer-actions">
              <button type="button" className="fl-icon-btn" onClick={cycleSort} title="Cycle sort column">
                <ArrowDownUp size={12} />
                <span>{sortMode === 'modifiedAt' ? 'Modified' : sortMode === 'size' ? 'Size' : 'Name'}</span>
              </button>
              <button
                type="button"
                className={`fl-icon-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
                title="Details view"
              >
                <List size={12} />
                <span>Details</span>
              </button>
              <button
                type="button"
                className={`fl-icon-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
                title="Tiles view"
              >
                <LayoutGrid size={12} />
                <span>Tiles</span>
              </button>
            </div>
          </div>
        </section>

        {showPreview && (
          <MetadataPanel
            item={selectedItem}
            currentPath={currentPath}
            onClose={onClosePreview}
            onOpenView={onOpenView}
            onNotify={onNotify}
          />
        )}
      </div>

      {/* File Labs 3-Card Summary Row underneath panes */}
      <div className="fl-stats-row">
        <div className="fl-stat-card">
          <HardDrive size={18} className="fl-stat-icon" />
          <div className="fl-stat-content">
            <div className="fl-stat-top">
              <strong>{volumeInfo?.root ?? getFolderLabel(currentPath)}</strong>
              <span>{volumeInfo ? `${usedPercent}% used` : 'Local'}</span>
            </div>
            <div className="fl-stat-value">
              {volumeInfo ? `${formatBytes(volumeInfo.freeBytes)} free` : 'Desktop Ready'}
            </div>
            <div className="fl-drive-track" style={{ marginTop: 4, height: 4 }}>
              <div
                className={`fl-drive-fill ${usedPercent >= 90 ? 'critical' : ''}`}
                style={{ width: `${volumeInfo ? usedPercent : 0}%` }}
              />
            </div>
          </div>
        </div>

        <div className="fl-stat-card">
          <Folder size={18} className="fl-stat-icon" color="var(--fl-accent)" />
          <div className="fl-stat-content">
            <div className="fl-stat-top">
              <span>This folder</span>
              <span>{folderCount} folders</span>
            </div>
            <div className="fl-stat-value">{formatBytes(totalBytes)}</div>
            <div className="fl-kind-bar" aria-label="Folder file category breakdown">
              {totalBytes > 0 &&
                Array.from(catTotals.entries()).map(([cat, bytes]) => (
                  <div
                    key={cat}
                    title={`${cat}: ${formatBytes(bytes)}`}
                    style={{
                      width: `${(bytes / totalBytes) * 100}%`,
                      background: CAT_COLORS[cat] ?? '#94a3b8',
                    }}
                  />
                ))}
            </div>
          </div>
        </div>

        <div className="fl-stat-card">
          <Info size={18} className="fl-stat-icon" />
          <div className="fl-stat-content">
            <div className="fl-stat-top">
              <span>Selection</span>
              <span>{selectedItem?.type ?? 'None'}</span>
            </div>
            <div className="fl-stat-value">{selectedItem ? selectedItem.name : 'No item selected'}</div>
            <div className="fl-stat-sub">
              {selectedItem
                ? `${selectedItem.sizeBytes ? formatBytes(selectedItem.sizeBytes) : 'Folder'} · ${selectedItem.modifiedAt ?? 'n/a'}`
                : 'Click an item to inspect'}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
