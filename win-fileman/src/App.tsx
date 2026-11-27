import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { CommandBar } from './components/CommandBar';
import { ThemeSettingsModal } from './components/ThemeSettingsModal';
import { ExplorerView, PaneTab } from './features/explorer/ExplorerView';
import { CleanerView } from './features/cleaner/CleanerView';
import { SyncView } from './features/sync/SyncView';
import { FileEntry } from './features/shared/types';
import { WorkspaceViewId } from './extensions/registry';
import { createFolder, isDesktopRuntime, openInExplorer } from './services/fileSystemApi';
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
  const [paneTabs, setPaneTabs] = useState<PaneTab[]>([{ id: 'tab-1', path: 'C:\\' }]);
  const [activePaneTabId, setActivePaneTabId] = useState<string>('tab-1');
  const [historyByTab, setHistoryByTab] = useState<Record<string, HistoryState>>({
    'tab-1': { paths: ['C:\\'], index: 0 },
  });

  const [sidebarWidth, setSidebarWidth] = useState(SIDEBAR_DEFAULT_WIDTH);
  const [isDraggingSplitter, setIsDraggingSplitter] = useState(false);
  const [showHidden, setShowHidden] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [showAppearance, setShowAppearance] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<FileEntry | null>(null);
  const [statusMessage, setStatusMessage] = useState('Ready · File Labs Layout + Lumen Theme Engine');

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

  const activeHistory = historyByTab[activePaneTabId] ?? { paths: ['C:\\'], index: 0 };
  const currentPath = activeHistory.paths[activeHistory.index] ?? 'C:\\';

  const navigateTo = useCallback(
    (path: string) => {
      setActiveTab('files');
      setHistoryByTab(prev => {
        const current = prev[activePaneTabId] ?? { paths: ['C:\\'], index: 0 };
        if (current.paths[current.index].toLowerCase() === path.toLowerCase()) return prev;
        const paths = current.paths.slice(0, current.index + 1);
        paths.push(path);
        return { ...prev, [activePaneTabId]: { paths, index: paths.length - 1 } };
      });
      setPaneTabs(prev =>
        prev.map(tab => (tab.id === activePaneTabId ? { ...tab, path } : tab)),
      );
    },
    [activePaneTabId],
  );

  const goBack = useCallback(() => {
    setHistoryByTab(prev => {
      const current = prev[activePaneTabId];
      if (!current || current.index <= 0) return prev;
      const nextIndex = current.index - 1;
      const nextPath = current.paths[nextIndex];
      setPaneTabs(tabs => tabs.map(t => (t.id === activePaneTabId ? { ...t, path: nextPath } : t)));
      return { ...prev, [activePaneTabId]: { ...current, index: nextIndex } };
    });
  }, [activePaneTabId]);

  const goForward = useCallback(() => {
    setHistoryByTab(prev => {
      const current = prev[activePaneTabId];
      if (!current || current.index >= current.paths.length - 1) return prev;
      const nextIndex = current.index + 1;
      const nextPath = current.paths[nextIndex];
      setPaneTabs(tabs => tabs.map(t => (t.id === activePaneTabId ? { ...t, path: nextPath } : t)));
      return { ...prev, [activePaneTabId]: { ...current, index: nextIndex } };
    });
  }, [activePaneTabId]);

  const goUp = useCallback(() => {
    const trimmed = currentPath.replace(/[\\/]+$/, '');
    const separator = Math.max(trimmed.lastIndexOf('\\'), trimmed.lastIndexOf('/'));
    navigateTo(separator <= 2 ? `${trimmed.slice(0, 2)}\\` : trimmed.slice(0, separator));
  }, [currentPath, navigateTo]);

  const handleNewTab = useCallback(() => {
    const id = `tab-${Date.now()}`;
    setPaneTabs(prev => [...prev, { id, path: currentPath }]);
    setHistoryByTab(prev => ({ ...prev, [id]: { paths: [currentPath], index: 0 } }));
    setActivePaneTabId(id);
    setActiveTab('files');
  }, [currentPath]);

  const handleCloseTab = useCallback(
    (tabId: string) => {
      setPaneTabs(prev => {
        if (prev.length <= 1) return prev;
        const idx = prev.findIndex(t => t.id === tabId);
        const remaining = prev.filter(t => t.id !== tabId);
        if (activePaneTabId === tabId) {
          const fallback = remaining[Math.max(0, idx - 1)] ?? remaining[0];
          setActivePaneTabId(fallback.id);
        }
        return remaining;
      });
    },
    [activePaneTabId],
  );

  const handleTogglePin = useCallback((path: string) => {
    setPinnedPaths(prev => {
      const exists = prev.some(p => p.toLowerCase() === path.toLowerCase());
      const next = exists
        ? prev.filter(p => p.toLowerCase() !== path.toLowerCase())
        : [...prev, path];
      try {
        localStorage.setItem(PINNED_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore storage errors
      }
      setStatusMessage(exists ? `Unpinned ${path}` : `Pinned ${path} to Quick Access`);
      return next;
    });
  }, []);

  const handleNewFolder = useCallback(async () => {
    const name = window.prompt('New folder name:');
    if (!name?.trim()) return;
    try {
      await createFolder(currentPath, name.trim());
      setRefreshToken(t => t + 1);
      setStatusMessage(`Created folder "${name.trim()}"`);
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'Unable to create folder.');
    }
  }, [currentPath]);

  const handleOpenExternal = useCallback(async () => {
    const target = selectedEntry?.path || currentPath;
    if (!isDesktopRuntime()) {
      setStatusMessage(`Desktop runtime required to open ${target} in Windows Explorer.`);
      return;
    }
    await openInExplorer(target);
    setStatusMessage(`Opened ${target} in Windows Explorer`);
  }, [selectedEntry, currentPath]);

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
      const key = event.key.toLowerCase();
      if (event.altKey) {
        if (key === 'arrowleft') {
          event.preventDefault();
          goBack();
        } else if (key === 'arrowright') {
          event.preventDefault();
          goForward();
        } else if (key === 'arrowup') {
          event.preventDefault();
          goUp();
        } else if (key === 'p') {
          event.preventDefault();
          setShowPreview(v => !v);
        }
        return;
      }

      if (event.ctrlKey || event.metaKey) {
        if (key === 'h') {
          event.preventDefault();
          setShowHidden(v => !v);
        } else if (key === 't') {
          event.preventDefault();
          handleNewTab();
        } else if (key === 'w' && paneTabs.length > 1) {
          event.preventDefault();
          handleCloseTab(activePaneTabId);
        } else if (key === 'd') {
          event.preventDefault();
          handleTogglePin(currentPath);
        } else if (key === ',') {
          event.preventDefault();
          setShowAppearance(v => !v);
        }
        return;
      }

      if (event.key === 'F5') {
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
    goBack,
    goForward,
    goUp,
    handleNewTab,
    handleCloseTab,
    handleTogglePin,
    handleNewFolder,
    handleOpenExternal,
    activePaneTabId,
    paneTabs.length,
    currentPath,
  ]);

  const handleConnectAndroid = () => {
    setActiveTab('devices');
    setWifiConnected(true);
    setAndroidDevice('LumenFiles / CarUnit');
    setStatusMessage('Connected to LumenFiles / CarUnit transfer bridge');
  };

  return (
    <div className="fl-app-shell">
      <Sidebar
        width={sidebarWidth}
        currentPath={currentPath}
        activeTab={activeTab}
        pinnedPaths={pinnedPaths}
        wifiConnected={wifiConnected}
        androidDevice={androidDevice}
        onConnectAndroid={handleConnectAndroid}
        onSelectNav={navigateTo}
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
            currentPath={currentPath}
            tabs={paneTabs}
            activeTabId={activePaneTabId}
            showHidden={showHidden}
            showPreview={showPreview}
            canGoBack={activeHistory.index > 0}
            canGoForward={activeHistory.index < activeHistory.paths.length - 1}
            refreshToken={refreshToken}
            onNavigate={navigateTo}
            onBack={goBack}
            onForward={goForward}
            onUp={goUp}
            onRefresh={() => setRefreshToken(token => token + 1)}
            onNewTab={handleNewTab}
            onSelectTab={tabId => {
              setActivePaneTabId(tabId);
              setActiveTab('files');
            }}
            onCloseTab={handleCloseTab}
            onClosePreview={() => setShowPreview(false)}
            onSelectionChange={setSelectedEntry}
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
          showHidden={showHidden}
          showPreview={showPreview}
          statusMessage={statusMessage}
          onOpenExternal={() => void handleOpenExternal()}
          onNewFolder={() => void handleNewFolder()}
          onToggleHidden={() => setShowHidden(v => !v)}
          onTogglePreview={() => {
            setActiveTab('files');
            setShowPreview(v => !v);
          }}
          onSelectView={setActiveTab}
          onPhaseNotice={label => setStatusMessage(`${label} is scheduled in the rollout plan.`)}
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
