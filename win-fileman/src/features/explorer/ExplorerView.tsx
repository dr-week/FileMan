import React, { useEffect, useRef, useState } from 'react';
import {
  Columns2,
  Folder,
  HardDrive,
  Info,
  Square,
  ArrowLeftRight,
} from 'lucide-react';
import { FileEntry } from '../shared/types';
import { formatBytes } from '../shared/formatters';
import { FilePane, PaneTab } from './FilePane';
import { MetadataPanel } from './MetadataPanel';
import { VolumeSpaceInfo } from '../../services/fileSystemApi';
import { WorkspaceViewId } from '../../extensions/registry';

export interface PaneState {
  tabs: PaneTab[];
  activeTabId: string;
  history: Record<string, { paths: string[]; index: number }>;
}

interface ExplorerViewProps {
  isDualPane: boolean;
  onToggleDualPane: () => void;
  onSwapPanes: () => void;
  activePaneId: 'left' | 'right';
  onSetActivePane: (pane: 'left' | 'right') => void;

  // Left pane
  leftPath: string;
  leftTabs: PaneTab[];
  leftActiveTabId: string;
  leftCanGoBack: boolean;
  leftCanGoForward: boolean;
  leftBackTarget?: string | null;
  leftForwardTarget?: string | null;
  leftUpTarget?: string | null;
  onLeftNavigate: (path: string) => void;
  onLeftNavigateNewTab: (path: string) => void;
  onLeftBack: () => void;
  onLeftForward: () => void;
  onLeftUp: () => void;
  onLeftNewTab: () => void;
  onLeftSelectTab: (tabId: string) => void;
  onLeftCloseTab: (tabId: string) => void;
  onLeftReorderTabs: (fromIdx: number, toIdx: number) => void;

  // Right pane
  rightPath: string;
  rightTabs: PaneTab[];
  rightActiveTabId: string;
  rightCanGoBack: boolean;
  rightCanGoForward: boolean;
  rightBackTarget?: string | null;
  rightForwardTarget?: string | null;
  rightUpTarget?: string | null;
  onRightNavigate: (path: string) => void;
  onRightNavigateNewTab: (path: string) => void;
  onRightBack: () => void;
  onRightForward: () => void;
  onRightUp: () => void;
  onRightNewTab: () => void;
  onRightSelectTab: (tabId: string) => void;
  onRightCloseTab: (tabId: string) => void;
  onRightReorderTabs: (fromIdx: number, toIdx: number) => void;

  // Common
  showHidden: boolean;
  showPreview: boolean;
  refreshToken: number;
  onRefresh: () => void;
  onClosePreview: () => void;
  onSelectionChange: (item: FileEntry | null) => void;
  onDropFiles: (sourcePath: string, targetFolder: string, isMove: boolean) => void;
  onImportNativeFiles: (files: File[], targetFolder: string) => void;
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

export const ExplorerView: React.FC<ExplorerViewProps> = ({
  isDualPane,
  onToggleDualPane,
  onSwapPanes,
  activePaneId,
  onSetActivePane,

  leftPath,
  leftTabs,
  leftActiveTabId,
  leftCanGoBack,
  leftCanGoForward,
  leftBackTarget,
  leftForwardTarget,
  leftUpTarget,
  onLeftNavigate,
  onLeftNavigateNewTab,
  onLeftBack,
  onLeftForward,
  onLeftUp,
  onLeftNewTab,
  onLeftSelectTab,
  onLeftCloseTab,
  onLeftReorderTabs,

  rightPath,
  rightTabs,
  rightActiveTabId,
  rightCanGoBack,
  rightCanGoForward,
  rightBackTarget,
  rightForwardTarget,
  rightUpTarget,
  onRightNavigate,
  onRightNavigateNewTab,
  onRightBack,
  onRightForward,
  onRightUp,
  onRightNewTab,
  onRightSelectTab,
  onRightCloseTab,
  onRightReorderTabs,

  showHidden,
  showPreview,
  refreshToken,
  onRefresh,
  onClosePreview,
  onSelectionChange,
  onDropFiles,
  onImportNativeFiles,
  onOpenView,
  onNotify,
}) => {
  const [splitRatio, setSplitRatio] = useState(0.5);
  const [isDraggingSplitter, setIsDraggingSplitter] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Active pane stats & selection
  const [activeStats, setActiveStats] = useState<{
    totalBytes: number;
    folderCount: number;
    catTotals: Map<string, number>;
    volumeInfo: VolumeSpaceInfo | null;
  }>({
    totalBytes: 0,
    folderCount: 0,
    catTotals: new Map(),
    volumeInfo: null,
  });
  const [selectedItem, setSelectedItem] = useState<FileEntry | null>(null);

  const activeCurrentPath = activePaneId === 'left' ? leftPath : rightPath;

  // Splitter drag handling between the 2 panes
  useEffect(() => {
    if (!isDraggingSplitter) return;
    const onMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const relativeX = e.clientX - rect.left;
      const ratio = Math.max(0.2, Math.min(0.8, relativeX / rect.width));
      setSplitRatio(ratio);
    };
    const onMouseUp = () => {
      setIsDraggingSplitter(false);
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [isDraggingSplitter]);

  const usedPercent = activeStats.volumeInfo && activeStats.volumeInfo.totalBytes > 0
    ? Math.min(100, Math.round((activeStats.volumeInfo.usedBytes / activeStats.volumeInfo.totalBytes) * 100))
    : 0;

  return (
    <>
      {/* Panes workspace with quick dual-pane tools */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4px', minHeight: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--fl-text-muted)' }}>
          <span style={{ fontWeight: 600, color: 'var(--fl-accent)' }}>
            {activePaneId === 'left' ? 'Left Pane Active' : 'Right Pane Active'}
          </span>
          <span>·</span>
          <span>Press <kbd style={{ padding: '1px 4px', borderRadius: 3, background: 'var(--fl-card-bg)', border: '1px solid var(--fl-border-subtle)' }}>Tab</kbd> to switch</span>
          <span>·</span>
          <span>Middle-click opens in new tab</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {isDualPane && (
            <button
              type="button"
              className="fl-icon-btn"
              onClick={onSwapPanes}
              title="Swap Left and Right panes (Ctrl+U)"
            >
              <ArrowLeftRight size={13} />
              <span>Swap (Ctrl+U)</span>
            </button>
          )}
          <button
            type="button"
            className={`fl-icon-btn ${isDualPane ? 'active' : ''}`}
            onClick={onToggleDualPane}
            title={isDualPane ? 'Switch to single pane (Ctrl+P)' : 'Switch to dual pane (Ctrl+P)'}
          >
            {isDualPane ? <Columns2 size={13} /> : <Square size={13} />}
            <span>{isDualPane ? 'Dual Pane' : 'Single Pane'}</span>
          </button>
        </div>
      </div>

      {/* Main Panes Container + Optional Right Preview */}
      <div className="fl-workspace-body">
        <div ref={containerRef} className="fl-pane-grid">
          {/* Left Pane (Always present) */}
          <div
            className="fl-pane-col"
            style={{ flex: isDualPane ? `${splitRatio}` : '1 1 100%', minWidth: 240 }}
          >
            <FilePane
              paneId="left"
              paneTitle="Left"
              isActive={activePaneId === 'left'}
              currentPath={leftPath}
              tabs={leftTabs}
              activeTabId={leftActiveTabId}
              showHidden={showHidden}
              canGoBack={leftCanGoBack}
              canGoForward={leftCanGoForward}
              backTarget={leftBackTarget}
              forwardTarget={leftForwardTarget}
              upTarget={leftUpTarget}
              refreshToken={refreshToken}
              onFocus={() => onSetActivePane('left')}
              onNavigate={onLeftNavigate}
              onNavigateNewTab={onLeftNavigateNewTab}
              onBack={onLeftBack}
              onForward={onLeftForward}
              onUp={onLeftUp}
              onRefresh={onRefresh}
              onNewTab={onLeftNewTab}
              onSelectTab={onLeftSelectTab}
              onCloseTab={onLeftCloseTab}
              onReorderTabs={onLeftReorderTabs}
              onSelectionChange={item => {
                if (activePaneId === 'left') {
                  setSelectedItem(item);
                  onSelectionChange(item);
                }
              }}
              onDropFiles={onDropFiles}
              onImportNativeFiles={onImportNativeFiles}
              onNotify={onNotify}
              onStatsCalculated={stats => {
                if (activePaneId === 'left') setActiveStats(stats);
              }}
            />
          </div>

          {/* Draggable Resizable Splitter between the 2 panes */}
          {isDualPane && (
            <div
              className={`fl-pane-splitter ${isDraggingSplitter ? 'dragging' : ''}`}
              title="Drag to resize panes · double-click to reset 50/50"
              onMouseDown={() => setIsDraggingSplitter(true)}
              onDoubleClick={() => setSplitRatio(0.5)}
            />
          )}

          {/* Right Pane (When Dual-Pane is enabled) */}
          {isDualPane && (
            <div
              className="fl-pane-col"
              style={{ flex: `${1 - splitRatio}`, minWidth: 240 }}
            >
              <FilePane
                paneId="right"
                paneTitle="Right"
                isActive={activePaneId === 'right'}
                currentPath={rightPath}
                tabs={rightTabs}
                activeTabId={rightActiveTabId}
                showHidden={showHidden}
                canGoBack={rightCanGoBack}
                canGoForward={rightCanGoForward}
                backTarget={rightBackTarget}
                forwardTarget={rightForwardTarget}
                upTarget={rightUpTarget}
                refreshToken={refreshToken}
                onFocus={() => onSetActivePane('right')}
                onNavigate={onRightNavigate}
                onNavigateNewTab={onRightNavigateNewTab}
                onBack={onRightBack}
                onForward={onRightForward}
                onUp={onRightUp}
                onRefresh={onRefresh}
                onNewTab={onRightNewTab}
                onSelectTab={onRightSelectTab}
                onCloseTab={onRightCloseTab}
                onReorderTabs={onRightReorderTabs}
                onSelectionChange={item => {
                  if (activePaneId === 'right') {
                    setSelectedItem(item);
                    onSelectionChange(item);
                  }
                }}
                onDropFiles={onDropFiles}
                onImportNativeFiles={onImportNativeFiles}
                onNotify={onNotify}
                onStatsCalculated={stats => {
                  if (activePaneId === 'right') setActiveStats(stats);
                }}
              />
            </div>
          )}
        </div>

        {/* Collapsible Preview/Inspector Pane on the right */}
        {showPreview && (
          <MetadataPanel
            item={selectedItem}
            currentPath={activeCurrentPath}
            onClose={onClosePreview}
            onOpenView={onOpenView}
            onNotify={onNotify}
          />
        )}
      </div>

      {/* File Labs 3-Card Summary Row for Active Pane */}
      <div className="fl-stats-row">
        <div className="fl-stat-card">
          <HardDrive size={18} className="fl-stat-icon" />
          <div className="fl-stat-content">
            <div className="fl-stat-top">
              <strong>{activeStats.volumeInfo?.root ?? getFolderLabel(activeCurrentPath)}</strong>
              <span>{activeStats.volumeInfo ? `${usedPercent}% used` : 'Local'}</span>
            </div>
            <div className="fl-stat-value">
              {activeStats.volumeInfo ? `${formatBytes(activeStats.volumeInfo.freeBytes)} free` : 'Ready'}
            </div>
            <div className="fl-drive-track" style={{ marginTop: 4, height: 4 }}>
              <div
                className={`fl-drive-fill ${usedPercent >= 90 ? 'critical' : ''}`}
                style={{ width: `${activeStats.volumeInfo ? usedPercent : 0}%` }}
              />
            </div>
          </div>
        </div>

        <div className="fl-stat-card">
          <Folder size={18} className="fl-stat-icon" color="var(--fl-accent)" />
          <div className="fl-stat-content">
            <div className="fl-stat-top">
              <span>{activePaneId === 'left' ? 'Left folder' : 'Right folder'}</span>
              <span>{activeStats.folderCount} folders</span>
            </div>
            <div className="fl-stat-value">{formatBytes(activeStats.totalBytes)}</div>
            <div className="fl-kind-bar" aria-label="Folder file category breakdown">
              {activeStats.totalBytes > 0 &&
                Array.from(activeStats.catTotals.entries()).map(([cat, bytes]) => (
                  <div
                    key={cat}
                    title={`${cat}: ${formatBytes(bytes)}`}
                    style={{
                      width: `${(bytes / activeStats.totalBytes) * 100}%`,
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
