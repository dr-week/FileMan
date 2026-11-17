import React, { useEffect, useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { HeaderBar } from './components/HeaderBar';
import { ExplorerView } from './features/explorer/ExplorerView';
import { CleanerView } from './features/cleaner/CleanerView';
import { SyncView } from './features/sync/SyncView';

export default function App() {
  const [activeTab, setActiveTab] = useState<'files' | 'cleaner' | 'devices'>('files');
  const [history, setHistory] = useState({ paths: ['C:\\'], index: 0 });
  const [refreshToken, setRefreshToken] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [wifiConnected, setWifiConnected] = useState(false);
  const [androidDevice, setAndroidDevice] = useState<string | null>(null);
  const currentPath = history.paths[history.index];

  const navigateTo = (path: string) => {
    setActiveTab('files');
    setHistory(previous => {
      if (previous.paths[previous.index].toLowerCase() === path.toLowerCase()) return previous;
      const paths = previous.paths.slice(0, previous.index + 1);
      paths.push(path);
      return { paths, index: paths.length - 1 };
    });
  };

  const goBack = () => setHistory(previous => ({ ...previous, index: Math.max(0, previous.index - 1) }));
  const goForward = () => setHistory(previous => ({
    ...previous,
    index: Math.min(previous.paths.length - 1, previous.index + 1),
  }));
  const goUp = () => {
    const trimmed = currentPath.replace(/[\\/]+$/, '');
    const separator = Math.max(trimmed.lastIndexOf('\\'), trimmed.lastIndexOf('/'));
    navigateTo(separator <= 2 ? `${trimmed.slice(0, 2)}\\` : trimmed.slice(0, separator));
  };

  useEffect(() => {
    const handleNavigationKey = (event: KeyboardEvent) => {
      if (!event.altKey) return;
      const key = event.key.toLowerCase();
      if (key === 'arrowleft' && history.index > 0) {
        event.preventDefault();
        goBack();
      } else if (key === 'arrowright' && history.index < history.paths.length - 1) {
        event.preventDefault();
        goForward();
      } else if (key === 'arrowup') {
        event.preventDefault();
        goUp();
      }
    };

    window.addEventListener('keydown', handleNavigationKey);
    return () => window.removeEventListener('keydown', handleNavigationKey);
  }, [currentPath, history.index, history.paths.length]);

  const handleConnectAndroid = () => {
    setActiveTab('devices');
    setWifiConnected(true);
    setAndroidDevice('LumenFiles / CarUnit');
  };

  const getHeaderTitle = () => {
    if (activeTab === 'cleaner') return 'Storage';
    if (activeTab === 'devices') return 'Transfers';
    return currentPath;
  };

  return (
    <div className="app-container">
      <Sidebar
        currentPath={currentPath}
        activeTab={activeTab}
        wifiConnected={wifiConnected}
        androidDevice={androidDevice}
        onConnectAndroid={handleConnectAndroid}
        onSelectNav={navigateTo}
        onSelectTab={setActiveTab}
      />
      <div className="main-content">
        <HeaderBar
          currentPath={getHeaderTitle()}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
        {activeTab === 'cleaner' && <CleanerView />}
        {activeTab === 'devices' && <SyncView />}
        {activeTab === 'files' && (
          <ExplorerView
            currentPath={currentPath}
            query={searchQuery}
            canGoBack={history.index > 0}
            canGoForward={history.index < history.paths.length - 1}
            onNavigate={navigateTo}
            onBack={goBack}
            onForward={goForward}
            onUp={goUp}
            onRefresh={() => setRefreshToken(token => token + 1)}
            refreshToken={refreshToken}
          />
        )}
      </div>
    </div>
  );
}
