import React from 'react';
import { HardDrive, Folder, Shield, Wifi, Sparkles, Smartphone } from 'lucide-react';

interface SidebarProps {
  currentPath: string;
  activeTab: 'files' | 'cleaner' | 'devices';
  wifiConnected: boolean;
  androidDevice: string | null;
  onConnectAndroid: () => void;
  onSelectNav: (path: string) => void;
  onSelectTab: (tab: 'files' | 'cleaner' | 'devices') => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPath,
  activeTab,
  wifiConnected,
  androidDevice,
  onConnectAndroid,
  onSelectNav,
  onSelectTab,
}) => {
  return (
    <div className="sidebar">
      <div className="brand-title">
        <span>LUMEN FILES</span>
        <span className="brand-badge">WIN</span>
      </div>

      <div className="nav-section">
        <div
          className={`nav-item ${activeTab === 'files' && currentPath.startsWith('C:') ? 'active' : ''}`}
          onClick={() => {
            onSelectTab('files');
            onSelectNav('C:\\Users\\User\\Documents');
          }}
        >
          <HardDrive size={18} color="#06b6d4" />
          <span>Local Disk (C:)</span>
        </div>

        <div
          className={`nav-item ${activeTab === 'files' && currentPath.includes('Documents') ? 'active' : ''}`}
          onClick={() => {
            onSelectTab('files');
            onSelectNav('C:\\Users\\User\\Documents');
          }}
        >
          <Folder size={18} color="#6366f1" />
          <span>Documents</span>
        </div>

        <div
          className={`nav-item ${activeTab === 'devices' ? 'active' : ''}`}
          onClick={() => onSelectTab('devices')}
        >
          <Smartphone size={18} color="#06b6d4" />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <span>Car & Android Sync</span>
            <span className="cleaner-badge" style={{ background: 'rgba(6, 182, 212, 0.2)', color: '#06b6d4' }}>
              REST API
            </span>
          </div>
        </div>

        <div className="nav-item">
          <Shield size={18} color="#10b981" />
          <span>Privacy Vault</span>
        </div>

        <div
          className={`nav-item ${activeTab === 'cleaner' ? 'active' : ''}`}
          onClick={() => onSelectTab('cleaner')}
        >
          <Sparkles size={18} color="#f59e0b" />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <span>App Cleaner</span>
            <span className="cleaner-badge">24.1 GB</span>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--border-glass)' }}>
        <div
          className={`nav-item ${wifiConnected || activeTab === 'devices' ? 'active' : ''}`}
          onClick={() => {
            onSelectTab('devices');
            onConnectAndroid();
          }}
        >
          <Wifi size={18} color={wifiConnected ? '#10b981' : '#94a3b8'} />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.85rem' }}>{wifiConnected ? 'Device Connected' : 'Connect Device / Car'}</span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
              {androidDevice || 'Tap to open API Transfer'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
