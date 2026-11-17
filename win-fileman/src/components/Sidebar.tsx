import React, { useState } from 'react';
import {
  HardDrive,
  Wifi,
  Sparkles,
  Smartphone,
  PanelLeftOpen,
  PanelLeftClose,
} from 'lucide-react';
import { ExplorerNavigation } from '../features/explorer/ExplorerNavigation';

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
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);

  const navItems = [
    {
      key: 'devices-sync',
      label: 'Transfers',
      badge: 'USB',
      icon: <Smartphone size={18} color="#06b6d4" />,
      active: activeTab === 'devices',
      onClick: () => onSelectTab('devices'),
    },
    {
      key: 'cleaner',
      label: 'Cleanup',
      badge: '24G',
      icon: <Sparkles size={18} color="#f59e0b" />,
      active: activeTab === 'cleaner',
      onClick: () => onSelectTab('cleaner'),
    },
  ];

  return (
    <aside className={`sidebar ${isDrawerOpen ? 'open' : 'collapsed'}`}>
      <div className="brand-title">
        {isDrawerOpen && <span className="brand-text">Files</span>}
        <span className="brand-badge">Desk</span>
        <button
          type="button"
          className="drawer-toggle"
          onClick={() => setIsDrawerOpen(prev => !prev)}
          aria-label={isDrawerOpen ? 'Collapse drawer' : 'Expand drawer'}
        >
          {isDrawerOpen ? <PanelLeftClose size={16} /> : <PanelLeftOpen size={16} />}
        </button>
      </div>

      <div className="nav-section">
        {isDrawerOpen ? (
          <ExplorerNavigation
            currentPath={currentPath}
            onNavigate={path => {
              onSelectTab('files');
              onSelectNav(path);
            }}
            onSelectFiles={() => onSelectTab('files')}
          />
        ) : (
          <button
            type="button"
            className={`nav-item ${activeTab === 'files' ? 'active' : ''}`}
            onClick={() => {
              onSelectTab('files');
              onSelectNav('C:\\');
            }}
            aria-label="Files"
            title="Files"
          >
            <HardDrive size={18} color="#06b6d4" />
          </button>
        )}
        {navItems.map((item) => (
          <div key={item.key} className="nav-group">
            <button
              type="button"
              className={`nav-item ${item.active ? 'active' : ''}`}
              onClick={item.onClick}
            >
              {item.icon}
              {isDrawerOpen && (
                <div className="nav-item-content">
                  <span className="nav-label">{item.label}</span>
                  {item.badge ? <span className="cleaner-badge">{item.badge}</span> : null}
                </div>
              )}
            </button>

          </div>
        ))}
      </div>

      <div className="drawer-footer">
        <button
          type="button"
          className={`nav-item ${wifiConnected || activeTab === 'devices' ? 'active' : ''}`}
          onClick={() => {
            onSelectTab('devices');
            onConnectAndroid();
          }}
        >
          <Wifi size={18} color={wifiConnected ? '#10b981' : '#94a3b8'} />
          {isDrawerOpen && (
            <div className="nav-item-stack">
              <span className="nav-label">{wifiConnected ? 'Online' : 'Devices'}</span>
              <span className="mini-status">{androidDevice || 'No device'}</span>
            </div>
          )}
        </button>
      </div>
    </aside>
  );
};
