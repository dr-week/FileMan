import React, { useState } from 'react';
import { 
  Sparkles, 
  Trash2, 
  RotateCw, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  FolderArchive,
  Layers,
  HardDrive,
  Cpu,
  Package,
  Clock
} from 'lucide-react';
import { CleanerItem, CleanerCategory } from '../services/appCleanerTypes';
import { INITIAL_AUDIT_ITEMS, calculateSummary } from '../services/appCleanerService';

export const AppCleaner: React.FC = () => {
  const [items, setItems] = useState<CleanerItem[]>(INITIAL_AUDIT_ITEMS);
  const [activeCategory, setActiveCategory] = useState<CleanerCategory>('all');
  const [isScanning, setIsScanning] = useState(false);
  const [isCleaning, setIsCleaning] = useState(false);
  const [cleanProgress, setCleanProgress] = useState(0);
  const [cleanSuccess, setCleanSuccess] = useState<string | null>(null);

  const summary = calculateSummary(items);

  const filteredItems = items.filter(item => {
    if (activeCategory === 'all') return true;
    return item.category === activeCategory;
  });

  const handleToggleItem = (id: string) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, selected: !item.selected } : item
    ));
  };

  const handleSelectAll = (select: boolean) => {
    setItems(prev => prev.map(item => ({ ...item, selected: select })));
  };

  const handleSelectSafeOnly = () => {
    setItems(prev => prev.map(item => ({
      ...item,
      selected: item.safety === 'safe'
    })));
  };

  const handleRescan = () => {
    setIsScanning(true);
    setCleanSuccess(null);
    setTimeout(() => {
      setItems(INITIAL_AUDIT_ITEMS);
      setIsScanning(false);
    }, 1200);
  };

  const handleCleanSelected = () => {
    if (summary.selectedCount === 0) return;
    setIsCleaning(true);
    setCleanProgress(10);
    setCleanSuccess(null);

    const interval = setInterval(() => {
      setCleanProgress(prev => {
        if (prev >= 95) {
          clearInterval(interval);
          setTimeout(() => {
            const freedFormatted = summary.selectedFormatted;
            const cleanedCount = summary.selectedCount;
            // Remove cleaned items from list
            setItems(prevItems => prevItems.filter(i => !i.selected));
            setIsCleaning(false);
            setCleanProgress(0);
            setCleanSuccess(`Successfully freed ${freedFormatted} across ${cleanedCount} item locations!`);
          }, 400);
          return 100;
        }
        return prev + 25;
      });
    }, 180);
  };

  const categories: { key: CleanerCategory; label: string; icon: React.ReactNode }[] = [
    { key: 'all', label: 'All Items', icon: <Layers size={15} /> },
    { key: 'updates', label: 'Update Residuals', icon: <FolderArchive size={15} /> },
    { key: 'media-cache', label: 'Media Caches', icon: <Cpu size={15} /> },
    { key: 'installers', label: 'Update Installers', icon: <Package size={15} /> },
    { key: 'dev-tools', label: 'Developer Stores', icon: <HardDrive size={15} /> },
    { key: 'orphaned', label: 'Orphaned Apps', icon: <AlertTriangle size={15} /> },
    { key: 'temp', label: 'Temp Files', icon: <Clock size={15} /> },
  ];

  return (
    <div className="cleaner-container">
      {/* Hero Overview Card */}
      <div className="cleaner-hero-card">
        <div className="hero-content">
          <div className="hero-badge">
            <Sparkles size={14} color="#06b6d4" />
            <span>SMART APPDATA ANALYZER</span>
          </div>
          <h2 className="hero-title">{summary.totalFormatted}</h2>
          <p className="hero-subtitle">
            Redundant update builds, unpruned media scratch caches, and installer remnants detected in user storage.
          </p>
          <div className="hero-stats-row">
            <div className="stat-pill safe">
              <ShieldCheck size={14} />
              <span>Safe to Clean: {summary.safeFormatted}</span>
            </div>
            <div className="stat-pill caution">
              <AlertTriangle size={14} />
              <span>Needs Review: {summary.cautionFormatted}</span>
            </div>
            <div className="stat-pill neutral">
              <span>{summary.itemCount} Redundancy Locations</span>
            </div>
          </div>
        </div>

        <div className="hero-actions">
          <button 
            className="cleaner-btn secondary" 
            onClick={handleRescan}
            disabled={isScanning || isCleaning}
          >
            <RotateCw size={16} className={isScanning ? 'spin' : ''} />
            <span>{isScanning ? 'Analyzing...' : 'Rescan Storage'}</span>
          </button>
          <button 
            className="cleaner-btn primary"
            onClick={handleCleanSelected}
            disabled={summary.selectedCount === 0 || isCleaning}
          >
            <Trash2 size={16} />
            <span>Clean Selected ({summary.selectedFormatted})</span>
          </button>
        </div>
      </div>

      {/* Cleaning Progress Bar */}
      {isCleaning && (
        <div className="clean-progress-card">
          <div className="progress-header">
            <span>Purging redundant files safely...</span>
            <span>{cleanProgress}%</span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${cleanProgress}%` }} />
          </div>
        </div>
      )}

      {/* Success Notification */}
      {cleanSuccess && (
        <div className="cleaner-success-banner">
          <CheckCircle2 size={18} color="#10b981" />
          <span>{cleanSuccess}</span>
        </div>
      )}

      {/* Filter Tabs & Bulk Actions */}
      <div className="cleaner-toolbar">
        <div className="category-tabs">
          {categories.map(c => (
            <button
              key={c.key}
              className={`category-tab ${activeCategory === c.key ? 'active' : ''}`}
              onClick={() => setActiveCategory(c.key)}
            >
              {c.icon}
              <span>{c.label}</span>
            </button>
          ))}
        </div>

        <div className="bulk-selection-actions">
          <button onClick={handleSelectSafeOnly} className="link-action safe-action">
            Select Safe Only
          </button>
          <span className="divider">•</span>
          <button onClick={() => handleSelectAll(true)} className="link-action">
            All
          </button>
          <span className="divider">•</span>
          <button onClick={() => handleSelectAll(false)} className="link-action">
            None
          </button>
        </div>
      </div>

      {/* Items List */}
      <div className="cleaner-items-list">
        {filteredItems.length === 0 ? (
          <div className="empty-state">
            <CheckCircle2 size={36} color="#10b981" />
            <p>All items in this category are completely clean!</p>
          </div>
        ) : (
          filteredItems.map(item => (
            <div 
              key={item.id} 
              className={`cleaner-item-row ${item.selected ? 'selected' : ''}`}
              onClick={() => handleToggleItem(item.id)}
            >
              <input 
                type="checkbox" 
                checked={item.selected} 
                onChange={() => {}} // handled by parent onClick
                className="item-checkbox"
              />
              <div className="item-info">
                <div className="item-title-row">
                  <span className="item-name">{item.name}</span>
                  <span className={`safety-badge ${item.safety}`}>
                    {item.safety === 'safe' ? 'Safe to Clean' : 'Review Before Deleting'}
                  </span>
                  <span className="item-size">{item.sizeFormatted}</span>
                </div>
                <div className="item-path">{item.path}</div>
                <div className="item-description">{item.description}</div>
                <div className="item-footer">
                  <span className="item-recommendation">💡 {item.recommendation}</span>
                  <span className="item-meta">
                    {item.fileCount.toLocaleString()} files • Last active: {item.lastModified}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
