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
import {
  getVolumeSpace,
  listDirectory,
  VolumeSpaceInfo,
} from '../../services/fileSystemApi';

export interface PaneTab {
  id: string;
  path: string;
}

export interface FilePaneProps {
  paneId: 'left' | 'right';
  paneTitle?: string;
  isActive: boolean;
  currentPath: string;
  tabs: PaneTab[];
  activeTabId: string;
  showHidden: boolean;
  canGoBack: boolean;
  canGoForward: boolean;
  backTarget?: string | null;
  forwardTarget?: string | null;
  upTarget?: string | null;
  refreshToken: number;
  onFocus: () => void;
  onNavigate: (path: string) => void;
  onNavigateNewTab: (path: string) => void;
  onBack: () => void;
  onForward: () => void;
  onUp: () => void;
  onRefresh: () => void;
  onNewTab: () => void;
  onSelectTab: (tabId: string) => void;
  onCloseTab: (tabId: string) => void;
  onReorderTabs?: (fromIdx: number, toIdx: number) => void;
  onSelectionChange: (item: FileEntry | null) => void;
  onDropFiles: (sourcePath: string, targetFolder: string, isMove: boolean) => void;
  onImportNativeFiles: (files: File[], targetFolder: string) => void;
  onNotify: (message: string) => void;
  onStatsCalculated?: (stats: { totalBytes: number; folderCount: number; catTotals: Map<string, number>; volumeInfo: VolumeSpaceInfo | null }) => void;
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

export const FilePane: React.FC<FilePaneProps> = ({
  paneId,
  paneTitle,
  isActive,
  currentPath,
  tabs,
  activeTabId,
  showHidden,
  canGoBack,
  canGoForward,
  backTarget,
  forwardTarget,
  upTarget,
  refreshToken,
  onFocus,
  onNavigate,
  onNavigateNewTab,
  onBack,
  onForward,
  onUp,
  onRefresh,
  onNewTab,
  onSelectTab,
  onCloseTab,
  onReorderTabs,
  onSelectionChange,
  onDropFiles,
  onImportNativeFiles,
  onNotify,
  onStatsCalculated,
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

  // Drag and drop states
  const [dragOverFolderId, setDragOverFolderId] = useState<string | null>(null);
  const [isDragOverPane, setIsDragOverPane] = useState(false);
  const [draggedTabIdx, setDraggedTabIdx] = useState<number | null>(null);
  const [dragOverTabIdx, setDragOverTabIdx] = useState<number | null>(null);

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

  const visibleFiles = useMemo(() => {
    const hiddenFiltered = showHidden ? files : files.filter(entry => !entry.isHidden);
    return sortFiles(filterFiles(hiddenFiltered, filterQuery), sortMode);
  }, [files, showHidden, filterQuery, sortMode]);

  const selectedItem = useMemo(
    () => visibleFiles.find(item => item.id === selectedId) ?? visibleFiles[0] ?? null,
    [visibleFiles, selectedId],
  );

  useEffect(() => {
    if (isActive) {
      onSelectionChange(selectedItem);
    }
  }, [selectedItem, isActive, onSelectionChange]);

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

  useEffect(() => {
    if (isActive) {
      onStatsCalculated?.({ totalBytes, folderCount, catTotals, volumeInfo });
    }
  }, [isActive, totalBytes, folderCount, catTotals, volumeInfo, onStatsCalculated]);

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

  // Helper for middle-click opening in a new tab
  const handleMiddleClick = (e: React.MouseEvent, targetPath?: string | null) => {
    if (e.button === 1) {
      e.preventDefault();
      e.stopPropagation();
      if (targetPath) {
        onNavigateNewTab(targetPath);
      }
    }
  };

  // Drop execution
  const processDrop = (e: React.DragEvent, targetFolder: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverFolderId(null);
    setIsDragOverPane(false);

    // Native files from OS
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const nativeList = Array.from(e.dataTransfer.files);
      onImportNativeFiles(nativeList, targetFolder);
      return;
    }

    // Intra-app item
    const raw = e.dataTransfer.getData('application/x-fileman-entry');
    if (raw) {
      try {
        const item = JSON.parse(raw);
        if (item && item.path) {
          const isMove = e.shiftKey || (item.sourcePaneId === paneId && item.type === 'folder');
          onDropFiles(item.path, targetFolder, isMove);
        }
      } catch {
        // ignore parse errors
      }
    }
  };

  return (
    <section
      className={`fl-pane-card ${isActive ? 'active-pane' : 'inactive-pane'} ${isDragOverPane ? 'fl-drop-active' : ''}`}
      aria-label={`${paneTitle ?? paneId} file pane`}
      onClick={() => {
        if (!isActive) onFocus();
      }}
      onDragOver={e => {
        e.preventDefault();
        e.dataTransfer.dropEffect = e.shiftKey ? 'move' : 'copy';
        setIsDragOverPane(true);
      }}
      onDragLeave={e => {
        // Only clear if leaving the pane card itself
        if (e.currentTarget === e.target) {
          setIsDragOverPane(false);
        }
      }}
      onDrop={e => processDrop(e, currentPath)}
    >
      {/* Browser-style Tab Strip */}
      <div className="fl-tab-strip" role="tablist">
        {tabs.map((tab, idx) => {
          const isTabActive = tab.id === activeTabId;
          const isDragOver = dragOverTabIdx === idx;
          return (
            <div
              key={tab.id}
              role="tab"
              aria-selected={isTabActive}
              className={`fl-tab ${isTabActive ? 'active' : ''} ${isDragOver ? 'fl-tab-dragover' : ''}`}
              draggable={true}
              onDragStart={e => {
                setDraggedTabIdx(idx);
                e.dataTransfer.setData('text/tab-id', tab.id);
                e.dataTransfer.effectAllowed = 'move';
              }}
              onDragOver={e => {
                e.preventDefault();
                setDragOverTabIdx(idx);
              }}
              onDragLeave={() => {
                if (dragOverTabIdx === idx) setDragOverTabIdx(null);
              }}
              onDrop={e => {
                e.preventDefault();
                setDragOverTabIdx(null);
                if (draggedTabIdx !== null && draggedTabIdx !== idx) {
                  onReorderTabs?.(draggedTabIdx, idx);
                }
                setDraggedTabIdx(null);
              }}
              onClick={() => onSelectTab(tab.id)}
              onMouseDown={e => {
                // Middle-click closes tab (File Labs standard)
                if (e.button === 1) {
                  e.preventDefault();
                  e.stopPropagation();
                  onCloseTab(tab.id);
                }
              }}
              onAuxClick={e => {
                if (e.button === 1) {
                  e.preventDefault();
                  e.stopPropagation();
                  onCloseTab(tab.id);
                }
              }}
              title={`${tab.path} (Middle-click to close tab)`}
            >
              <Folder size={13} color={isTabActive ? 'var(--fl-accent)' : 'var(--fl-text-muted)'} />
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
                  title="Close tab (or middle-click)"
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
        <button
          type="button"
          className="fl-icon-btn"
          onClick={onBack}
          disabled={!canGoBack}
          onMouseDown={e => handleMiddleClick(e, backTarget)}
          onAuxClick={e => handleMiddleClick(e, backTarget)}
          title={`Back (Alt+Left)${backTarget ? ` · Middle-click: open ${backTarget} in new tab` : ''}`}
          aria-label="Back"
        >
          <ArrowLeft size={14} />
        </button>
        <button
          type="button"
          className="fl-icon-btn"
          onClick={onForward}
          disabled={!canGoForward}
          onMouseDown={e => handleMiddleClick(e, forwardTarget)}
          onAuxClick={e => handleMiddleClick(e, forwardTarget)}
          title={`Forward (Alt+Right)${forwardTarget ? ` · Middle-click: open ${forwardTarget} in new tab` : ''}`}
          aria-label="Forward"
        >
          <ArrowRight size={14} />
        </button>
        <button
          type="button"
          className="fl-icon-btn"
          onClick={onUp}
          disabled={currentPath.length <= 3}
          onMouseDown={e => handleMiddleClick(e, upTarget)}
          onAuxClick={e => handleMiddleClick(e, upTarget)}
          title={`Up folder (Alt+Up)${upTarget ? ` · Middle-click: open ${upTarget} in new tab` : ''}`}
          aria-label="Up"
        >
          <ArrowUp size={14} />
        </button>
        <button
          type="button"
          className="fl-icon-btn"
          onClick={onRefresh}
          title="Refresh (F5)"
          aria-label="Refresh"
        >
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
            <div
              onClick={e => e.stopPropagation()}
              style={{ display: 'flex', alignItems: 'center', minWidth: 0, overflow: 'hidden' }}
            >
              <Breadcrumb
                path={currentPath}
                onNavigate={onNavigate}
                onNavigateNewTab={onNavigateNewTab}
              />
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

      {/* Drive Usage & Drop Strip */}
      <div
        className="fl-folder-strip"
        onDragOver={e => {
          e.preventDefault();
          e.dataTransfer.dropEffect = e.shiftKey ? 'move' : 'copy';
        }}
        onDrop={e => processDrop(e, currentPath)}
        title="Drop here to put files into this folder"
      >
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

            {visibleFiles.map(file => {
              const isSelected = selectedId === file.id;
              const isDropHover = dragOverFolderId === file.id;
              const isFolder = file.type === 'folder';

              return (
                <button
                  key={file.id}
                  type="button"
                  draggable={true}
                  onDragStart={e => {
                    e.dataTransfer.setData(
                      'application/x-fileman-entry',
                      JSON.stringify({
                        id: file.id,
                        name: file.name,
                        path: file.path,
                        type: file.type,
                        sourcePaneId: paneId,
                      }),
                    );
                    e.dataTransfer.setData('text/plain', file.path);
                    e.dataTransfer.effectAllowed = 'copyMove';
                  }}
                  onDragOver={e => {
                    if (isFolder) {
                      e.preventDefault();
                      e.stopPropagation();
                      e.dataTransfer.dropEffect = e.shiftKey ? 'move' : 'copy';
                      setDragOverFolderId(file.id);
                    }
                  }}
                  onDragLeave={() => {
                    if (dragOverFolderId === file.id) setDragOverFolderId(null);
                  }}
                  onDrop={e => {
                    if (isFolder) {
                      processDrop(e, file.path);
                    }
                  }}
                  className={`fl-details-row ${isSelected ? 'selected' : ''} ${file.isHidden ? 'dimmed' : ''} ${isDropHover ? 'fl-drop-hover' : ''}`}
                  onClick={() => setSelectedId(file.id)}
                  onDoubleClick={() => {
                    if (isFolder) onNavigate(file.path);
                  }}
                  onMouseDown={e => {
                    if (isFolder) handleMiddleClick(e, file.path);
                  }}
                  onAuxClick={e => {
                    if (isFolder) handleMiddleClick(e, file.path);
                  }}
                  title={
                    isFolder
                      ? `${file.name} (Double-click to open · Middle-click to open in new tab · drag files here)`
                      : file.name
                  }
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
                  <span className="fl-meta-cell">
                    {isFolder ? 'Folder' : file.extension || file.category || 'File'}
                  </span>
                  <span className="fl-meta-cell">{file.sizeBytes ? formatBytes(file.sizeBytes) : '—'}</span>
                  <span className="fl-meta-cell">{file.modifiedAt ?? '—'}</span>
                </button>
              );
            })}
          </>
        ) : (
          <div className="fl-tiles-grid">
            {visibleFiles.map(file => {
              const isSelected = selectedId === file.id;
              const isDropHover = dragOverFolderId === file.id;
              const isFolder = file.type === 'folder';

              return (
                <button
                  key={file.id}
                  type="button"
                  draggable={true}
                  onDragStart={e => {
                    e.dataTransfer.setData(
                      'application/x-fileman-entry',
                      JSON.stringify({
                        id: file.id,
                        name: file.name,
                        path: file.path,
                        type: file.type,
                        sourcePaneId: paneId,
                      }),
                    );
                    e.dataTransfer.setData('text/plain', file.path);
                    e.dataTransfer.effectAllowed = 'copyMove';
                  }}
                  onDragOver={e => {
                    if (isFolder) {
                      e.preventDefault();
                      e.stopPropagation();
                      e.dataTransfer.dropEffect = e.shiftKey ? 'move' : 'copy';
                      setDragOverFolderId(file.id);
                    }
                  }}
                  onDragLeave={() => {
                    if (dragOverFolderId === file.id) setDragOverFolderId(null);
                  }}
                  onDrop={e => {
                    if (isFolder) {
                      processDrop(e, file.path);
                    }
                  }}
                  className={`fl-tile ${isSelected ? 'selected' : ''} ${isDropHover ? 'fl-drop-hover' : ''}`}
                  onClick={() => setSelectedId(file.id)}
                  onDoubleClick={() => {
                    if (isFolder) onNavigate(file.path);
                  }}
                  onMouseDown={e => {
                    if (isFolder) handleMiddleClick(e, file.path);
                  }}
                  onAuxClick={e => {
                    if (isFolder) handleMiddleClick(e, file.path);
                  }}
                  title={
                    isFolder
                      ? `${file.name} (Middle-click to open in new tab)`
                      : file.name
                  }
                >
                  {renderEntryIcon(file, 34)}
                  <span className="fl-tile-age" style={{ background: getRecencyColor(file.modifiedAt) }} />
                  <span className="fl-tile-name">{file.name}</span>
                </button>
              );
            })}
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
  );
};
