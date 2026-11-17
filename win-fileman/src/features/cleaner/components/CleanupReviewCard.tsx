import React from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { CleanerItem, CleanerSummary } from '../../../services/appCleanerTypes';

interface CleanupReviewCardProps {
  summary: CleanerSummary;
  selectedItems: CleanerItem[];
  onCancel: () => void;
  onConfirm: () => void;
}

export const CleanupReviewCard: React.FC<CleanupReviewCardProps> = ({
  summary,
  selectedItems,
  onCancel,
  onConfirm,
}) => {
  return (
    <div className="cleanup-confirmation">
      <div className="confirm-header">
        <AlertTriangle size={18} color="#f59e0b" />
        <div>
          <h3>Review sample cleanup</h3>
          <p>{summary.selectedCount} sample item(s) selected. No files will be changed.</p>
        </div>
      </div>

      <div className="confirm-summary-row">
        <div className="summary-chip">
          <span>Estimated space</span>
          <strong>{summary.selectedFormatted}</strong>
        </div>
        <div className="summary-chip">
          <span>Items</span>
          <strong>{summary.selectedCount}</strong>
        </div>
      </div>

      <div className="confirm-list">
        {selectedItems.map(item => (
          <div key={item.id} className="confirm-item">
            <span className={`safety-badge ${item.safety}`}>
              {item.safety === 'safe' ? 'Safe' : 'Review'}
            </span>
            <div>
              <strong>{item.name}</strong>
              <small>{item.path}</small>
            </div>
          </div>
        ))}
      </div>

      <div className="confirm-actions">
        <button className="cleaner-btn secondary" onClick={onCancel}>
          Cancel
        </button>
        <button className="cleaner-btn primary" onClick={onConfirm}>
          <Trash2 size={16} />
          <span>Simulate quarantine</span>
        </button>
      </div>
    </div>
  );
};
