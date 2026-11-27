import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { CommandBar } from './components/CommandBar';
import { ThemeSettingsModal } from './components/ThemeSettingsModal';
import { ExplorerView } from './features/explorer/ExplorerView';
import { PaneTab } from './features/explorer/FilePane';
import { CleanerView } from './features/cleaner/CleanerView';
import { SyncView } from './features/sync/SyncView';
import { FileEntry } from './features/shared/types';
import { WorkspaceViewId } from './extensions/registry';
import {
  copyOrMoveItem,
  createFolder,
  deleteFileOrFolder,
  importLocalFiles,
  isDesktopRuntime,
  openInExplorer,
} from './services/fileSystemApi';
import { ThemeProvider } from './theme/ThemeProvider';

const SIDEBAR_DEFAULT_WIDTH = 256;
const SIDEBAR_MIN_WIDTH = 180;
const SIDEBAR_MAX_WIDTH = 420;
const PINNED_STORAGE_KEY = 'lumen.filelabs.pinnedPaths';

interface HistoryState {
  paths: string[];
  index: number;
}

function AppShell() {
  const [activeTab, setActiveTab] = useState<WorkspaceViewId>('files');
  const [isDualPane, setIsDualPane] = useState(true);
  const [activePaneId, setActivePaneId] = useState<'left' | 'right'>('left');

  // Left Pane State
  const [leftTabs, setLeftTabs] = useState<PaneTab[]>([{ id: 'ltab-1', path: 'C:\\' }]);
  const [leftActiveTabId, setLeftActiveTabId] = useState<string>('ltab-1');
  const [leftHistory, setLeftHistory] = useState<Record<string, HistoryState>>({
    'ltab-1': { paths: ['C:\\'], index: 0 },
  });

  // Right Pane State
  const [rightTabs, setRightTabs] = useState<PaneTab[]>([
    { id: 'rtab-1', path: 'C:\\Users\\User\\Documents' },
  ]);
  const [rightActiveTabId, setRightActiveTabId] = useState<string>('rtab-1');
  const [rightHistory, setRightHistory] = useState<Record<string, HistoryState>>({
    'rtab-1': { paths: ['C:\\Users\\User\\Documents'], index: 0 },
  });

  const [sidebarWidth, setSidebarWidth] = useState(SIDEBAR_DEFAULT_WIDTH);
  const [isDraggingSplitter, setIsDraggingSplitter] = useState(false);
  const [showHidden, setShowHidden] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [showAppearance, setShowAppearance] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<FileEntry | null>(null);
  const [statusMessage, setStatusMessage] = useState('Dual Pane Ready · Middle-click to open new tab · Drag & drop enabled');

  const [refreshToken, setRefreshToken] = useState(0);
  const [wifiConnected, setWifiConnected] = useState(false);
  const [androidDevice, setAndroidDevice] = useState<string | null>(null);
  const [pinnedPaths, setPinnedPaths] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(PINNED_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const dragStartRef = useRef<{ x: number; width: number } | null>(null);

  // Active path getters
  const leftActiveHistory = leftHistory[leftActiveTabId] ?? { paths: ['C:\\'], index: 0 };
  const leftCurrentPath = leftActiveHistory.paths[leftActiveHistory.index] ?? 'C:\\';

  const rightActiveHistory = rightHistory[rightActiveTabId] ?? {
    paths: ['C:\\Users\\User\\Documents'],
    index: 0,
  };
  const rightCurrentPath = rightActiveHistory.paths[rightActiveHistory.index] ?? 'C:\\Users\\User\\Documents';

  const activeCurrentPath = activePaneId === 'left' ? leftCurrentPath : rightCurrentPath;
  const otherCurrentPath = activePaneId === 'left' ? rightCurrentPath : leftCurrentPath;

  // Navigation: Left Pane
  const navigateLeft = useCallback(
    (path: string) => {
      setActiveTab('files');
      setLeftHistory(prev => {
        const cur = prev[leftActiveTabId] ?? { paths: ['C:\\'], index: 0 };
        if (cur.paths[cur.index].toLowerCase() === path.toLowerCase()) return prev;
        const paths = cur.paths.slice(0, cur.index + 1);
        paths.push(path);
        return { ...prev, [leftActiveTabId]: { paths, index: paths.length - 1 } };
      });
      setLeftTabs(tabs => tabs.map(t => (t.id === leftActiveTabId ? { ...t, path } : t)));
    },
    [leftActiveTabId],
  );

  const navigateLeftNewTab = useCallback((path: string) => {
    setActiveTab('files');
    const id = `ltab-${Date.now()}`;
    setLeftTabs(prev => [...prev, { id, path }]);
    setLeftHistory(prev => ({ ...prev, [id]: { paths: [path], index: 0 } }));
    setLeftActiveTabId(id);
    setActivePaneId('left');
    setStatusMessage(`Opened "${path}" in a new Left tab`);
  }, []);

  const goBackLeft = useCallback(() => {
    setLeftHistory(prev => {
      const cur = prev[leftActiveTabId];
      if (!cur || cur.index <= 0) return prev;
      const nextIndex = cur.index - 1;
      const nextPath = cur.paths[nextIndex];
      setLeftTabs(tabs => tabs.map(t => (t.id === leftActiveTabId ? { ...t, path: nextPath } : t)));
      return { ...prev, [leftActiveTabId]: { ...cur, index: nextIndex } };
    });
  }, [leftActiveTabId]);

  const goForwardLeft = useCallback(() => {
    setLeftHistory(prev => {
      const cur = prev[leftActiveTabId];
      if (!cur || cur.index >= cur.paths.length - 1) return prev;
      const nextIndex = cur.index + 1;
      const nextPath = cur.paths[nextIndex];
      setLeftTabs(tabs => tabs.map(t => (t.id === leftActiveTabId ? { ...t, path: nextPath } : t)));
      return { ...prev, [leftActiveTabId]: { ...cur, index: nextIndex } };
    });
  }, [leftActiveTabId]);

  const goUpLeft = useCallback(() => {
    const trimmed = leftCurrentPath.replace(/[\\/]+$/, '');
    const sep = Math.max(trimmed.lastIndexOf('\\'), trimmed.lastIndexOf('/'));
    const parent = sep <= 2 ? `${trimmed.slice(0, 2)}\\` : trimmed.slice(0, sep);
    navigateLeft(parent);
  }, [leftCurrentPath, navigateLeft]);

  const newTabLeft = useCallback(() => {
    navigateLeftNewTab(leftCurrentPath);
  }, [leftCurrentPath, navigateLeftNewTab]);

  const closeTabLeft = useCallback(
    (tabId: string) => {
      setLeftTabs(prev => {
        if (prev.length <= 1) return prev;
        const idx = prev.findIndex(t => t.id === tabId);
        const remaining = prev.filter(t => t.id !== tabId);
        if (leftActiveTabId === tabId) {
          const fallback = remaining[Math.max(0, idx - 1)] ?? remaining[0];
          setLeftActiveTabId(fallback.id);
        }
        return remaining;
      });
    },
    [leftActiveTabId],
  );

  const reorderTabsLeft = useCallback((fromIdx: number, toIdx: number) => {
    setLeftTabs(prev => {
      const copy = [...prev];
      const [moved] = copy.splice(fromIdx, 1);
      copy.splice(toIdx, 0, moved);
      return copy;
    });
  }, []);

  // Navigation: Right Pane
  const navigateRight = useCallback(
    (path: string) => {
      setActiveTab('files');
      setRightHistory(prev => {
        const cur = prev[rightActiveTabId] ?? { paths: ['C:\\Users\\User\\Documents'], index: 0 };
        if (cur.paths[cur.index].toLowerCase() === path.toLowerCase()) return prev;
        const paths = cur.paths.slice(0, cur.index + 1);
        paths.push(path);
        return { ...prev, [rightActiveTabId]: { paths, index: paths.length - 1 } };
      });
      setRightTabs(tabs => tabs.map(t => (t.id === rightActiveTabId ? { ...t, path } : t)));
    },
    [rightActiveTabId],
  );

  const navigateRightNewTab = useCallback((path: string) => {
    setActiveTab('files');
    const id = `rtab-${Date.now()}`;
    setRightTabs(prev => [...prev, { id, path }]);
    setRightHistory(prev => ({ ...prev, [id]: { paths: [path], index: 0 } }));
    setRightActiveTabId(id);
    setActivePaneId('right');
    setStatusMessage(`Opened "${path}" in a new Right tab`);
  }, []);

  const goBackRight = useCallback(() => {
    setRightHistory(prev => {
      const cur = prev[rightActiveTabId];
      if (!cur || cur.index <= 0) return prev;
      const nextIndex = cur.index - 1;
      const nextPath = cur.paths[nextIndex];
      setRightTabs(tabs => tabs.map(t => (t.id === rightActiveTabId ? { ...t, path: nextPath } : t)));
      return { ...prev, [rightActiveTabId]: { ...cur, index: nextIndex } };
    });
  }, [rightActiveTabId]);

  const goForwardRight = useCallback(() => {
    setRightHistory(prev => {
      const cur = prev[rightActiveTabId];
      if (!cur || cur.index >= cur.paths.length - 1) return prev;
      const nextIndex = cur.index + 1;
      const nextPath = cur.paths[nextIndex];
      setRightTabs(tabs => tabs.map(t => (t.id === rightActiveTabId ? { ...t, path: nextPath } : t)));
      return { ...prev, [rightActiveTabId]: { ...cur, index: nextIndex } };
    });
  }, [rightActiveTabId]);

  const goUpRight = useCallback(() => {
    const trimmed = rightCurrentPath.replace(/[\\/]+$/, '');
    const sep = Math.max(trimmed.lastIndexOf('\\'), trimmed.lastIndexOf('/'));
    const parent = sep <= 2 ? `${trimmed.slice(0, 2)}\\` : trimmed.slice(0, sep);
    navigateRight(parent);
  }, [rightCurrentPath, navigateRight]);

  const newTabRight = useCallback(() => {
    navigateRightNewTab(rightCurrentPath);
  }, [rightCurrentPath, navigateRightNewTab]);

  const closeTabRight = useCallback(
    (tabId: string) => {
      setRightTabs(prev => {
        if (prev.length <= 1) return prev;
        const idx = prev.findIndex(t => t.id === tabId);
        const remaining = prev.filter(t => t.id !== tabId);
        if (rightActiveTabId === tabId) {
          const fallback = remaining[Math.max(0, idx - 1)] ?? remaining[0];
          setRightActiveTabId(fallback.id);
        }
        return remaining;
      });
    },
    [rightActiveTabId],
  );

  const reorderTabsRight = useCallback((fromIdx: number, toIdx: number) => {
    setRightTabs(prev => {
      const copy = [...prev];
      const [moved] = copy.splice(fromIdx, 1);
      copy.splice(toIdx, 0, moved);
      return copy;
    });
  }, []);

  // Swap Left and Right panes (Ctrl+U)
  const swapPanes = useCallback(() => {
    setLeftTabs(rightTabs);
    setRightTabs(leftTabs);
    setLeftActiveTabId(rightActiveTabId);
    setRightActiveTabId(leftActiveTabId);
    setLeftHistory(rightHistory);
    setRightHistory(leftHistory);
    setStatusMessage('Swapped Left and Right panes (Ctrl+U)');
  }, [leftTabs, rightTabs, leftActiveTabId, rightActiveTabId, leftHistory, rightHistory]);

  // Sidebar navigation routes to active pane
  const handleSidebarNav = useCallback(
    (path: string) => {
      if (activePaneId === 'left') navigateLeft(path);
      else navigateRight(path);
    },
    [activePaneId, navigateLeft, navigateRight],
  );

  const handleSidebarNavNewTab = useCallback(
    (path: string) => {
      if (activePaneId === 'left') navigateLeftNewTab(path);
      else navigateRightNewTab(path);
    },
    [activePaneId, navigateLeftNewTab, navigateRightNewTab],
  );

  // File Operations: Copy to other pane (Ctrl+F5)
  const copySelectionToOtherPane = useCallback(async () => {
    if (!selectedEntry) {
      setStatusMessage('Select a file or folder to copy to the other pane.');
      return;
    }
    const targetFolder = otherCurrentPath;
    const ok = await copyOrMoveItem(selectedEntry.path, targetFolder, false);
    if (ok) {
      setRefreshToken(t => t + 1);
      setStatusMessage(`Copied "${selectedEntry.name}" to ${targetFolder}`);
    } else {
      setStatusMessage(`Failed to copy "${selectedEntry.name}"`);
    }
  }, [selectedEntry, otherCurrentPath]);

  // File Operations: Move to other pane (F6)
  const moveSelectionToOtherPane = useCallback(async () => {
    if (!selectedEntry) {
      setStatusMessage('Select a file or folder to move to the other pane.');
      return;
    }
    const targetFolder = otherCurrentPath;
    const ok = await copyOrMoveItem(selectedEntry.path, targetFolder, true);
    if (ok) {
      setRefreshToken(t => t + 1);
      setStatusMessage(`Moved "${selectedEntry.name}" to ${targetFolder}`);
    } else {
      setStatusMessage(`Failed to move "${selectedEntry.name}"`);
    }
  }, [selectedEntry, otherCurrentPath]);

  // File Operations: Delete
  const handleDelete = useCallback(async () => {
    if (!selectedEntry) {
      setStatusMessage('Select an item to delete.');
      return;
    }
    const confirm = window.confirm(`Are you sure you want to delete "${selectedEntry.name}"?`);
    if (!confirm) return;
    const ok = await deleteFileOrFolder(selectedEntry.path);
    if (ok) {
      setRefreshToken(t => t + 1);
      setStatusMessage(`Deleted "${selectedEntry.name}"`);
    } else {
      setStatusMessage(`Could not delete "${selectedEntry.name}"`);
    }
  }, [selectedEntry]);

  // Drag and drop handler
  const handleDropFiles = useCallback(async (sourcePath: string, targetFolder: string, isMove: boolean) => {
    const ok = await copyOrMoveItem(sourcePath, targetFolder, isMove);
    if (ok) {
      setRefreshToken(t => t + 1);
      const name = sourcePath.replace(/[\\/]+$/, '').split(/[\\/]/).pop() || sourcePath;
      setStatusMessage(`${isMove ? 'Moved' : 'Copied'} "${name}" into ${targetFolder}`);
    }
  }, []);

  // Import native dragged files from desktop
  const handleImportNativeFiles = useCallback(async (files: File[], targetFolder: string) => {
    const imported = await importLocalFiles(files, targetFolder);
    setRefreshToken(t => t + 1);
    setStatusMessage(`Imported ${imported.length || files.length} file(s) into ${targetFolder}`);
  }, []);

  const handleTogglePin = useCallback((path: string) => {
    setPinnedPaths(prev => {
      const exists = prev.some(p => p.toLowerCase() === path.toLowerCase());
      const next = exists
        ? prev.filter(p => p.toLowerCase() !== path.toLowerCase())
        : [...prev, path];
      try {
        localStorage.setItem(PINNED_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      setStatusMessage(exists ? `Unpinned ${path}` : `Pinned ${path} to Quick Access`);
      return next;
    });
  }, []);

  const handleNewFolder = useCallback(async () => {
    const name = window.prompt('New folder name:');
    if (!name?.trim()) return;
    try {
      await createFolder(activeCurrentPath, name.trim());
      setRefreshToken(t => t + 1);
      setStatusMessage(`Created folder "${name.trim()}" in ${activeCurrentPath}`);
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'Unable to create folder.');
    }
  }, [activeCurrentPath]);

  const handleOpenExternal = useCallback(async () => {
    const target = selectedEntry?.path || activeCurrentPath;
    if (!isDesktopRuntime()) {
      setStatusMessage(`Desktop runtime required to open ${target} in Windows Explorer.`);
      return;
    }
    await openInExplorer(target);
    setStatusMessage(`Opened ${target} in Windows Explorer`);
  }, [selectedEntry, activeCurrentPath]);

  // Sidebar splitter drag handling
  useEffect(() => {
    if (!isDraggingSplitter) return;
    const onMouseMove = (event: MouseEvent) => {
      if (!dragStartRef.current) return;
      const delta = event.clientX - dragStartRef.current.x;
      const clamped = Math.max(SIDEBAR_MIN_WIDTH, Math.min(SIDEBAR_MAX_WIDTH, dragStartRef.current.width + delta));
      setSidebarWidth(clamped);
    };
    const onMouseUp = () => {
      setIsDraggingSplitter(false);
      dragStartRef.current = null;
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [isDraggingSplitter]);

  // Global File Labs keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isInput = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);

      // Tab key switches pane focus
      if (event.key === 'Tab' && !isInput && isDualPane) {
        event.preventDefault();
        setActivePaneId(prev => (prev === 'left' ? 'right' : 'left'));
        return;
      }

      const key = event.key.toLowerCase();

      if (event.altKey) {
        if (key === 'arrowleft') {
          event.preventDefault();
          if (activePaneId === 'left') goBackLeft();
          else goBackRight();
        } else if (key === 'arrowright') {
          event.preventDefault();
          if (activePaneId === 'left') goForwardLeft();
          else goForwardRight();
        } else if (key === 'arrowup') {
          event.preventDefault();
          if (activePaneId === 'left') goUpLeft();
          else goUpRight();
        } else if (key === 'p') {
          event.preventDefault();
          setShowPreview(v => !v);
        }
        return;
      }

      if (event.ctrlKey || event.metaKey) {
        if (key === 'u' && isDualPane) {
          event.preventDefault();
          swapPanes();
        } else if (key === 'p') {
          event.preventDefault();
          setIsDualPane(v => !v);
        } else if (event.key === 'F5' || (event.ctrlKey && key === 'f5')) {
          event.preventDefault();
          void copySelectionToOtherPane();
        } else if (key === 'h') {
          event.preventDefault();
          setShowHidden(v => !v);
        } else if (key === 't') {
          event.preventDefault();
          if (activePaneId === 'left') newTabLeft();
          else newTabRight();
        } else if (key === 'w') {
          event.preventDefault();
          if (activePaneId === 'left') closeTabLeft(leftActiveTabId);
          else closeTabRight(rightActiveTabId);
        } else if (key === 'd') {
          event.preventDefault();
          handleTogglePin(activeCurrentPath);
        } else if (key === ',') {
          event.preventDefault();
          setShowAppearance(v => !v);
        }
        return;
      }

      if (event.key === 'F6') {
        event.preventDefault();
        void moveSelectionToOtherPane();
      } else if (event.key === 'F8' || event.key === 'Delete') {
        if (!isInput) {
          event.preventDefault();
          void handleDelete();
        }
      } else if (event.key === 'F5') {
        event.preventDefault();
        setRefreshToken(t => t + 1);
      } else if (event.key === 'F7') {
        event.preventDefault();
        void handleNewFolder();
      } else if (event.key === 'F3') {
        event.preventDefault();
        void handleOpenExternal();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    isDualPane,
    activePaneId,
    goBackLeft,
    goForwardLeft,
    goUpLeft,
    goBackRight,
    goForwardRight,
    goUpRight,
    swapPanes,
    copySelectionToOtherPane,
    moveSelectionToOtherPane,
    handleDelete,
    newTabLeft,
    newTabRight,
    closeTabLeft,
    closeTabRight,
    leftActiveTabId,
    rightActiveTabId,
    activeCurrentPath,
    handleTogglePin,
    handleNewFolder,
    handleOpenExternal,
  ]);

  const handleConnectAndroid = () => {
    setActiveTab('devices');
    setWifiConnected(true);
    setAndroidDevice('LumenFiles / CarUnit');
    setStatusMessage('Connected to LumenFiles / CarUnit transfer bridge');
  };

  // Up/back targets for middle click tooltips
  const getUpTarget = (path: string) => {
    const trimmed = path.replace(/[\\/]+$/, '');
    const sep = Math.max(trimmed.lastIndexOf('\\'), trimmed.lastIndexOf('/'));
    return sep <= 2 ? `${trimmed.slice(0, 2)}\\` : trimmed.slice(0, sep);
  };

  return (
    <div className="fl-app-shell">
      <Sidebar
        width={sidebarWidth}
        currentPath={activeCurrentPath}
        activeTab={activeTab}
        pinnedPaths={pinnedPaths}
        wifiConnected={wifiConnected}
        androidDevice={androidDevice}
        onConnectAndroid={handleConnectAndroid}
        onSelectNav={handleSidebarNav}
        onSelectNavNewTab={handleSidebarNavNewTab}
        onSelectTab={setActiveTab}
        onTogglePin={handleTogglePin}
        onOpenAppearance={() => setShowAppearance(true)}
      />

      <div
        className={`fl-splitter ${isDraggingSplitter ? 'dragging' : ''}`}
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize sidebar"
        title="Drag to resize sidebar · double-click to reset"
        onMouseDown={event => {
          dragStartRef.current = { x: event.clientX, width: sidebarWidth };
          setIsDraggingSplitter(true);
        }}
        onDoubleClick={() => setSidebarWidth(SIDEBAR_DEFAULT_WIDTH)}
      />

      <main className="fl-workspace">
        {activeTab === 'files' && (
          <ExplorerView
            isDualPane={isDualPane}
            onToggleDualPane={() => setIsDualPane(v => !v)}
            onSwapPanes={swapPanes}
            activePaneId={activePaneId}
            onSetActivePane={setActivePaneId}

            // Left Pane
            leftPath={leftCurrentPath}
            leftTabs={leftTabs}
            leftActiveTabId={leftActiveTabId}
            leftCanGoBack={leftActiveHistory.index > 0}
            leftCanGoForward={leftActiveHistory.index < leftActiveHistory.paths.length - 1}
            leftBackTarget={leftActiveHistory.index > 0 ? leftActiveHistory.paths[leftActiveHistory.index - 1] : null}
            leftForwardTarget={leftActiveHistory.index < leftActiveHistory.paths.length - 1 ? leftActiveHistory.paths[leftActiveHistory.index + 1] : null}
            leftUpTarget={getUpTarget(leftCurrentPath)}
            onLeftNavigate={navigateLeft}
            onLeftNavigateNewTab={navigateLeftNewTab}
            onLeftBack={goBackLeft}
            onLeftForward={goForwardLeft}
            onLeftUp={goUpLeft}
            onLeftNewTab={newTabLeft}
            onLeftSelectTab={tabId => {
              setLeftActiveTabId(tabId);
              setActivePaneId('left');
            }}
            onLeftCloseTab={closeTabLeft}
            onLeftReorderTabs={reorderTabsLeft}

            // Right Pane
            rightPath={rightCurrentPath}
            rightTabs={rightTabs}
            rightActiveTabId={rightActiveTabId}
            rightCanGoBack={rightActiveHistory.index > 0}
            rightCanGoForward={rightActiveHistory.index < rightActiveHistory.paths.length - 1}
            rightBackTarget={rightActiveHistory.index > 0 ? rightActiveHistory.paths[rightActiveHistory.index - 1] : null}
            rightForwardTarget={rightActiveHistory.index < rightActiveHistory.paths.length - 1 ? rightActiveHistory.paths[rightActiveHistory.index + 1] : null}
            rightUpTarget={getUpTarget(rightCurrentPath)}
            onRightNavigate={navigateRight}
            onRightNavigateNewTab={navigateRightNewTab}
            onRightBack={goBackRight}
            onRightForward={goForwardRight}
            onRightUp={goUpRight}
            onRightNewTab={newTabRight}
            onRightSelectTab={tabId => {
              setRightActiveTabId(tabId);
              setActivePaneId('right');
            }}
            onRightCloseTab={closeTabRight}
            onRightReorderTabs={reorderTabsRight}

            // Common
            showHidden={showHidden}
            showPreview={showPreview}
            refreshToken={refreshToken}
            onRefresh={() => setRefreshToken(t => t + 1)}
            onClosePreview={() => setShowPreview(false)}
            onSelectionChange={setSelectedEntry}
            onDropFiles={handleDropFiles}
            onImportNativeFiles={handleImportNativeFiles}
            onOpenView={setActiveTab}
            onNotify={setStatusMessage}
          />
        )}

        {activeTab === 'cleaner' && (
          <div className="fl-addon-viewport">
            <CleanerView />
          </div>
        )}

        {activeTab === 'devices' && (
          <div className="fl-addon-viewport">
            <SyncView />
          </div>
        )}

        <CommandBar
          activeView={activeTab}
          isDualPane={isDualPane}
          showHidden={showHidden}
          showPreview={showPreview}
          statusMessage={statusMessage}
          onOpenExternal={() => void handleOpenExternal()}
          onNewFolder={() => void handleNewFolder()}
          onCopy={() => void copySelectionToOtherPane()}
          onMove={() => void moveSelectionToOtherPane()}
          onDelete={() => void handleDelete()}
          onToggleDualPane={() => setIsDualPane(v => !v)}
          onToggleHidden={() => setShowHidden(v => !v)}
          onTogglePreview={() => {
            setActiveTab('files');
            setShowPreview(v => !v);
          }}
          onSelectView={setActiveTab}
          onPhaseNotice={label => setStatusMessage(`${label} executed`)}
        />
      </main>

      <ThemeSettingsModal open={showAppearance} onClose={() => setShowAppearance(false)} />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppShell />
    </ThemeProvider>
  );
}
