import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { HeaderBar } from './components/HeaderBar';
import { FileGrid } from './components/FileGrid';
import { FileItem } from './components/FileCard';
import { AppCleaner } from './components/AppCleaner';
import { DeviceTransferPanel } from './components/DeviceTransferPanel';

export default function App() {
  const [activeTab, setActiveTab] = useState<'files' | 'cleaner' | 'devices'>('devices');
  const [currentPath, setCurrentPath] = useState('C:\\Users\\User\\Documents');
  const [searchQuery, setSearchQuery] = useState('');
  const [wifiConnected, setWifiConnected] = useState(false);
  const [androidDevice, setAndroidDevice] = useState<string | null>(null);

  const mockFiles: FileItem[] = [
    { name: 'Projects', isDir: true },
    { name: 'Photos', isDir: true },
    { name: 'Report_2026.pdf', isDir: false, size: '2.4 MB' },
    { name: 'System_Backup.zip', isDir: false, size: '450 MB' },
    { name: 'Design_Spec.png', isDir: false, size: '1.2 MB' },
  ];

  const filteredFiles = mockFiles.filter((f) => f.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleConnectAndroid = () => {
    setActiveTab('devices');
    setWifiConnected(true);
    setAndroidDevice('LumenFiles / CarUnit');
  };

  const getHeaderTitle = () => {
    if (activeTab === 'cleaner') return 'AppData System Analyzer & Cleaner';
    if (activeTab === 'devices') return 'Remote Device & Car Infotainment File Sync (REST API)';
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
        onSelectNav={setCurrentPath}
        onSelectTab={setActiveTab}
      />
      <div className="main-content">
        <HeaderBar
          currentPath={getHeaderTitle()}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
        {activeTab === 'cleaner' && <AppCleaner />}
        {activeTab === 'devices' && <DeviceTransferPanel />}
        {activeTab === 'files' && <FileGrid files={filteredFiles} />}
      </div>
    </div>
  );
}
