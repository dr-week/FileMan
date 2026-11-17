import React from 'react';
import {
  Sparkles,
  RotateCw,
  ShieldCheck,
  AlertTriangle,
  Trash2,
} from 'lucide-react';
import { CleanerSummary } from '../../../services/appCleanerTypes';

interface CleanerOverviewProps {
  summary: CleanerSummary;
  source: 'live-scan' | 'sample';
  durationMs: number;
  categoryBreakdown: Array<{
    category: string;
    totalFormatted: string;
    itemCount: number;
    share: number;
  }>;
  isScanning: boolean;
  isCleaning: boolean;
  cleanProgress: number;
  onRescan: () => void;
  onCleanSelected: () => void;
}

export const CleanerOverview: React.FC<CleanerOverviewProps> = ({
  summary,
  source,
  durationMs,
  categoryBreakdown,
  isScanning,
  isCleaning,
  cleanProgress,
  onRescan,
  onCleanSelected,
}) => {
  const isLive = source === 'live-scan';
  return (
    <>
      <div className="cleaner-hero-card">
        <div className="hero-content">
          <div className="hero-badge">
            <Sparkles size={14} color="#06b6d4" />
            <span>{isLive ? `Live AppData scan · ${(durationMs / 1000).toFixed(1)}s` : 'Demo data (browser preview)'}</span>
          </div>
          <h2 className="hero-title">{summary.totalFormatted}</h2>
          <p className="hero-subtitle">
            {isLive
              ? 'Read-only scan of AppData caches, staged updaters, empty leftovers, and startup entries.'
              : 'Example findings only. Run the desktop app for a live Windows AppData scan.'}
          </p>
          <div className="hero-stats-row">
            <div className="stat-pill safe">
              <ShieldCheck size={14} />
              <span>Safe {summary.safeFormatted}</span>
            </div>
            <div className="stat-pill caution">
              <AlertTriangle size={14} />
              <span>Review {summary.cautionFormatted}</span>
            </div>
            <div className="stat-pill neutral">
              <span>{summary.itemCount} items</span>
            </div>
          </div>
        </div>

        <div className="hero-actions">
          <button
            className="cleaner-btn secondary"
            onClick={onRescan}
            disabled={isScanning || isCleaning}
          >
            <RotateCw size={16} className={isScanning ? 'spin' : ''} />
            <span>{isScanning ? 'Scanning...' : isLive ? 'Rescan AppData' : 'Reload examples'}</span>
          </button>
          <button
            className="cleaner-btn primary"
            onClick={onCleanSelected}
            disabled={summary.selectedCount === 0 || isCleaning}
          >
            <Trash2 size={16} />
            <span>Review {summary.selectedFormatted}</span>
          </button>
        </div>
      </div>

      <div className="cleaner-summary-grid">
        {categoryBreakdown.slice(0, 4).map(card => (
          <div key={card.category} className="summary-card">
            <span className="summary-label">{card.category.replace('-', ' ')}</span>
            <strong>{card.totalFormatted}</strong>
            <small>{card.itemCount} items • {card.share}%</small>
          </div>
        ))}
      </div>

      {isCleaning && (
        <div className="clean-progress-card">
          <div className="progress-header">
            <span>Simulating quarantine...</span>
            <span>{cleanProgress}%</span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${cleanProgress}%` }} />
          </div>
        </div>
      )}
    </>
  );
};
