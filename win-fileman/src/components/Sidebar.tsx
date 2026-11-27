import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  HardDrive,
  Palette,
  PanelLeftClose,
  PanelLeftOpen,
  Pin,
  Smartphone,
  Sparkles,
  Wifi,
} from 'lucide-react';
import { ExplorerNavigation } from '../features/explorer/ExplorerNavigation';
import { WORKSPACE_ADDONS, WorkspaceViewId } from '../extensions/registry';

interface SidebarProps {
  width: number;
  currentPath: string;
  activeTab: WorkspaceViewId;
  pinnedPaths: string[];
  wifiConnected: boolean;
  androidDevice: string | null;
  onConnectAndroid: () => void;
  onSelectNav: (path: string) => void;
  onSelectTab: (tab: WorkspaceViewId) => void;
  onTogglePin: (path: string) => void;
  onOpenAppearance: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  width,
  currentPath,
  activeTab,
  pinnedPaths,
  wifiConnected,
  androidDevice,
  onConnectAndroid,
  onSelectNav,
  onSelectTab,
  onTogglePin,
  onOpenAppearance,
}) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);
  const [showQuickAccess, setShowQuickAccess] = useState(true);
  const [showAddons, setShowAddons] = useState(true);

  const renderAddonIcon = (id: WorkspaceViewId) => {
    if (id === 'devices') return <Smartphone size={15} color="var(--fl-accent)" />;
    return <Sparkles size={15} color="var(--fl-amber)" />;
  };

  return (
    <aside
      className={`fl-sidebar ${isDrawerOpen ? 'open' : 'collapsed'}`}
      style={{ width: isDrawerOpen ? `${width}px` : undefined }}
    >
      <div className="fl-sidebar-header">
        <span className="fl-brand-mark">LF</span>
        {isDrawerOpen && (
          <>
            <span className="fl-brand-name">Lumen Files</span>
            <span className="fl-brand-version">v0.1</span>
          </>
        )}
        <button
          type="button"
          className="fl-icon-btn"
          style={{ marginLeft: 'auto' }}
          onClick={() => setIsDrawerOpen(prev => !prev)}
          aria-label={isDrawerOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          title={isDrawerOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          {isDrawerOpen ? <PanelLeftClose size={15} /> : <PanelLeftOpen size={15} />}
        </button>
      </div>

      <div className="fl-sidebar-scroll">
        {isDrawerOpen ? (
          <>
            {/* Quick Access / Pinned Folders (File Labs SidebarSections pattern) */}
            <div className="fl-sidebar-section">
              <button
                type="button"
                className="fl-sidebar-section-header"
                onClick={() => setShowQuickAccess(v => !v)}
              >
                <span>Quick Access</span>
                {showQuickAccess ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
              </button>
              {showQuickAccess && (
                <>
                  {pinnedPaths.length === 0 ? (
                    <span style={{ padding: '4px 10px', fontSize: 11, color: 'var(--fl-text-muted)' }}>
                      Ctrl+D pins the current folder
                    </span>
                  ) : (
                    pinnedPaths.map(path => {
                      const label = path.replace(/[\\/]+$/, '').split(/[\\/]/).pop() || path;
                      const isActive = activeTab === 'files' && currentPath.toLowerCase() === path.toLowerCase();
                      return (
                        <button
                          key={path}
                          type="button"
                          className={`fl-sidebar-item ${isActive ? 'active' : ''}`}
                          onClick={() => {
                            onSelectTab('files');
                            onSelectNav(path);
                          }}
                          title={`${path} (right-click to unpin)`}
                          onContextMenu={e => {
                            e.preventDefault();
                            onTogglePin(path);
                          }}
                        >
                          <Pin size={13} color="var(--fl-accent)" />
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
                        </button>
                      );
                    })
                  )}
                </>
              )}
            </div>

            {/* Existing Drives & Libraries Tree preserved intact */}
            <ExplorerNavigation
              currentPath={currentPath}
              onNavigate={path => {
                onSelectTab('files');
                onSelectNav(path);
              }}
              onSelectFiles={() => onSelectTab('files')}
            />

            {/* Workspace Add-ons & Integrations Registry */}
            <div className="fl-sidebar-section">
              <button
                type="button"
                className="fl-sidebar-section-header"
                onClick={() => setShowAddons(v => !v)}
              >
                <span>Add-ons &amp; Tools</span>
                {showAddons ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
              </button>
              {showAddons &&
                WORKSPACE_ADDONS.map(addon => (
                  <button
                    key={addon.id}
                    type="button"
                    className={`fl-sidebar-item ${activeTab === addon.id ? 'active' : ''}`}
                    onClick={() => onSelectTab(addon.id)}
                    title={addon.description}
                  >
                    {renderAddonIcon(addon.id)}
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {addon.label}
                    </span>
                    {addon.badge ? <span className="fl-sidebar-badge">{addon.badge}</span> : null}
                  </button>
                ))}
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <button
              type="button"
              className={`fl-icon-btn ${activeTab === 'files' ? 'active' : ''}`}
              onClick={() => {
                onSelectTab('files');
                onSelectNav(currentPath || 'C:\\');
              }}
              title="Files"
              aria-label="Files"
            >
              <HardDrive size={16} color="var(--fl-accent)" />
            </button>
            {WORKSPACE_ADDONS.map(addon => (
              <button
                key={addon.id}
                type="button"
                className={`fl-icon-btn ${activeTab === addon.id ? 'active' : ''}`}
                onClick={() => onSelectTab(addon.id)}
                title={addon.label}
                aria-label={addon.label}
              >
                {renderAddonIcon(addon.id)}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* File Labs-style Sidebar Footer with Device Sync & Appearance Settings */}
      <div className="fl-sidebar-footer">
        <button
          type="button"
          className={`fl-icon-btn ${wifiConnected || activeTab === 'devices' ? 'active' : ''}`}
          style={{ flex: isDrawerOpen ? 1 : undefined, justifyContent: isDrawerOpen ? 'flex-start' : 'center' }}
          onClick={() => {
            onSelectTab('devices');
            onConnectAndroid();
          }}
          title={androidDevice ? `Connected: ${androidDevice}` : 'Connect Android / CarUnit'}
        >
          <Wifi size={14} color={wifiConnected ? 'var(--fl-emerald)' : 'var(--fl-text-muted)'} />
          {isDrawerOpen && (
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {androidDevice || 'Devices'}
            </span>
          )}
        </button>

        <button
          type="button"
          className="fl-icon-btn"
          onClick={onOpenAppearance}
          title="Appearance & Themes (Ctrl+,)"
          aria-label="Appearance & Themes"
        >
          <Palette size={15} />
        </button>
      </div>
    </aside>
  );
};
