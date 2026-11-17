import React, { useEffect, useMemo, useState } from 'react';
import { Flame } from 'lucide-react';
import { CleanerCategory, CleanerItem, QuarantineRecord } from '../../../services/appCleanerTypes';
import { buildCategoryBreakdown, calculateSummary, runAppDataAudit } from '../../../services/appCleanerService';
import { planCleanup } from '../../../services/cleanerSafety';
import {
  emptyQuarantine,
  isDesktopRuntime,
  listQuarantine,
  purgeQuarantinedItem,
  quarantinePaths,
  restoreQuarantinedItem,
} from '../../../services/fileSystemApi';
import { CleanerOverview } from './CleanerOverview';
import { CleanerInfographics } from './CleanerInfographics';
import { CleanerItemList } from './CleanerItemList';
import { CleanupReviewCard } from './CleanupReviewCard';
import { QuarantinePanel } from './QuarantinePanel';

const CATEGORY_TABS: Array<{ id: CleanerCategory | 'quarantine'; label: string }> = [
  { id: 'all', label: 'All findings' },
  { id: 'installers', label: 'Updaters' },
  { id: 'updates', label: 'Old builds' },
  { id: 'dev-tools', label: 'Dev caches' },
  { id: 'media-cache', label: 'Media cache' },
  { id: 'orphaned', label: 'Abandoned' },
  { id: 'shortcuts', label: 'Shortcuts' },
  { id: 'adware-pup', label: 'Adware / Startup' },
  { id: 'temp', label: 'Temp' },
  { id: 'quarantine', label: 'Quarantine' },
];

export const AppDataAuditView: React.FC = () => {
  const [items, setItems] = useState<CleanerItem[]>([]);
  const [quarantine, setQuarantine] = useState<QuarantineRecord[]>([]);
  const [source, setSource] = useState<'live-scan' | 'sample'>('sample');
  const [durationMs, setDurationMs] = useState(0);
  const [activeCategory, setActiveCategory] = useState<CleanerCategory | 'quarantine'>('all');
  const [selectedItemId, setSelectedItemId] = useState('');
  const [isScanning, setIsScanning] = useState(true);
  const [isBusy, setIsBusy] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const loadScan = async () => {
    setIsScanning(true);
    setShowReview(false);
    setStatusMessage(null);
    try {
      const result = await runAppDataAudit();
      setItems(result.items);
      setSource(result.source);
      setDurationMs(result.durationMs);
      setSelectedItemId(result.items[0]?.id ?? '');
      if (isDesktopRuntime()) {
        setQuarantine(await listQuarantine());
      }
    } finally {
      setIsScanning(false);
    }
  };

  useEffect(() => { loadScan(); }, []);

  const activeItems = useMemo(() => items.filter(item => !item.quarantined), [items]);
  const summary = useMemo(() => calculateSummary(items), [items]);
  const categoryBreakdown = useMemo(() => buildCategoryBreakdown(items, summary.totalBytes), [items, summary.totalBytes]);
  const filteredItems = useMemo(
    () => activeCategory === 'all' || activeCategory === 'quarantine'
      ? activeItems
      : activeItems.filter(item => item.category === activeCategory),
    [activeCategory, activeItems],
  );
  const activeItem = filteredItems.find(item => item.id === selectedItemId) ?? filteredItems[0] ?? null;

  const executeQuarantine = async (targets: CleanerItem[]) => {
    if (targets.length === 0) return;
    setIsBusy(true);
    setShowReview(false);
    try {
      if (isDesktopRuntime()) {
        const res = await quarantinePaths(targets.map(t => ({ id: t.id, name: t.name, path: t.path, sizeBytes: t.sizeBytes })));
        setQuarantine(res.records);
        const movedIds = new Set(targets.map(t => t.id));
        setItems(prev => prev.map(i => (movedIds.has(i.id) && res.movedCount > 0 ? { ...i, quarantined: true, selected: false } : i)));
        setStatusMessage(`Quarantined ${res.movedCount} item(s). Skipped ${res.skippedCount} locked or protected item(s).`);
      } else {
        const ids = new Set(targets.map(t => t.id));
        setItems(prev => prev.map(i => (ids.has(i.id) ? { ...i, quarantined: true, selected: false } : i)));
        setStatusMessage(`Simulated quarantine for ${targets.length} item(s) in browser preview.`);
      }
    } finally {
      setIsBusy(false);
    }
  };

  const handleAutoPurgeSafe = () => {
    const safeTargets = activeItems.filter(item => item.safety === 'safe');
    executeQuarantine(safeTargets);
  };

  return (
    <div className="appdata-audit-view">
      <CleanerOverview
        summary={summary}
        source={source}
        durationMs={durationMs}
        categoryBreakdown={categoryBreakdown}
        isScanning={isScanning}
        isCleaning={isBusy}
        cleanProgress={isBusy ? 65 : 0}
        onRescan={loadScan}
        onCleanSelected={() => setShowReview(true)}
      />

      <div className="auto-purge-bar">
        <span>Safe items ({summary.safeFormatted}) can be moved to reversible Quarantine in one click.</span>
        <button type="button" className="cleaner-btn primary" disabled={isBusy || summary.safeBytes === 0} onClick={handleAutoPurgeSafe}>
          <Flame size={15} />
          <span>Auto-Purge Safe ({summary.safeFormatted})</span>
        </button>
      </div>

      {statusMessage && <div className="storage-scan-message warning">{statusMessage}</div>}
      {summary.itemCount > 0 && <CleanerInfographics summary={summary} categoryBreakdown={categoryBreakdown} />}

      {showReview && (
        <CleanupReviewCard
          summary={summary}
          selectedItems={planCleanup(activeItems)}
          onCancel={() => setShowReview(false)}
          onConfirm={() => executeQuarantine(planCleanup(activeItems))}
        />
      )}

      <div className="cleaner-category-tabs">
        {CATEGORY_TABS.map(tab => (
          <button
            key={tab.id}
            type="button"
            className={`cleaner-tab-btn ${activeCategory === tab.id ? 'active' : ''}`}
            onClick={() => setActiveCategory(tab.id)}
          >
            {tab.id === 'quarantine' ? `Quarantine (${quarantine.length})` : tab.label}
          </button>
        ))}
      </div>

      {activeCategory === 'quarantine' ? (
        <QuarantinePanel
          records={quarantine}
          isBusy={isBusy}
          onRestore={async id => setQuarantine(await restoreQuarantinedItem(id))}
          onPurge={async id => setQuarantine(await purgeQuarantinedItem(id))}
          onEmptyAll={async () => setQuarantine(await emptyQuarantine())}
        />
      ) : (
        <CleanerItemList
          filteredItems={filteredItems}
          selectedItemId={selectedItemId}
          activeItem={activeItem}
          onToggleItem={id => setItems(prev => prev.map(item => (item.id === id && item.safety !== 'protected' ? { ...item, selected: !item.selected } : item)))}
          onSelectItem={setSelectedItemId}
        />
      )}
    </div>
  );
};
