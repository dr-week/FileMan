import React from 'react';
import { BarChart3 } from 'lucide-react';
import { CleanerSummary } from '../../../services/appCleanerTypes';

interface CleanerInfographicsProps {
  summary: CleanerSummary;
  categoryBreakdown: Array<{
    category: string;
    totalFormatted: string;
    itemCount: number;
    share: number;
  }>;
}

const CAT_COLORS: Record<string, string> = {
  installers: '#38bdf8',
  updates: '#a78bfa',
  'dev-tools': '#f59e0b',
  'media-cache': '#ec4899',
  orphaned: '#f97316',
  shortcuts: '#22d3ee',
  'adware-pup': '#ef4444',
  temp: '#10b981',
};

export const CleanerInfographics: React.FC<CleanerInfographicsProps> = ({
  summary,
  categoryBreakdown,
}) => {
  const safePct = summary.totalBytes > 0 ? (summary.safeBytes / summary.totalBytes) * 100 : 0;
  const cautionPct = summary.totalBytes > 0 ? (summary.cautionBytes / summary.totalBytes) * 100 : 0;

  return (
    <section className="cleaner-infographics">
      <div className="infographic-card">
        <div className="infographic-header">
          <BarChart3 size={15} />
          <span>Safety Distribution</span>
          <small>{summary.safeFormatted} Safe · {summary.cautionFormatted} Review</small>
        </div>
        <div className="stacked-bar-track" role="img" aria-label="Safe vs Review space">
          <div className="stacked-bar-safe" style={{ width: `${safePct}%` }} />
          <div className="stacked-bar-caution" style={{ width: `${cautionPct}%` }} />
        </div>
        <div className="stacked-bar-legend">
          <span><i className="dot safe" /> Safe ({safePct.toFixed(0)}%)</span>
          <span><i className="dot caution" /> Review Required ({cautionPct.toFixed(0)}%)</span>
        </div>
      </div>

      <div className="infographic-card">
        <div className="infographic-header">
          <span>Category Breakdown</span>
          <small>{categoryBreakdown.length} active groups</small>
        </div>
        <div className="cat-bars-list">
          {categoryBreakdown.slice(0, 5).map(cat => (
            <div key={cat.category} className="cat-bar-row">
              <span className="cat-bar-label">{cat.category.replace('-', ' ')}</span>
              <div className="cat-bar-track">
                <div
                  className="cat-bar-fill"
                  style={{
                    width: `${Math.max(cat.share, 3)}%`,
                    background: CAT_COLORS[cat.category] ?? '#64748b',
                  }}
                />
              </div>
              <span className="cat-bar-val">{cat.totalFormatted}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
