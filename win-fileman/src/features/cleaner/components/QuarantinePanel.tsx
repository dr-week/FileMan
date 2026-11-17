import React from 'react';
import { ArchiveRestore, Flame, ShieldCheck, Trash2 } from 'lucide-react';
import { QuarantineRecord } from '../../../services/appCleanerTypes';
import { formatBytes } from '../../../services/appCleanerService';

interface QuarantinePanelProps {
  records: QuarantineRecord[];
  isBusy: boolean;
  onRestore: (id: string) => void;
  onPurge: (id: string) => void;
  onEmptyAll: () => void;
}

export const QuarantinePanel: React.FC<QuarantinePanelProps> = ({
  records,
  isBusy,
  onRestore,
  onPurge,
  onEmptyAll,
}) => {
  const totalBytes = records.reduce((acc, rec) => acc + rec.sizeBytes, 0);

  if (records.length === 0) {
    return (
      <div className="empty-state">
        <ShieldCheck size={34} color="#10b981" />
        <p>Quarantine is empty. Items moved here can be restored or permanently purged.</p>
      </div>
    );
  }

  return (
    <div className="quarantine-panel">
      <div className="quarantine-header">
        <div>
          <h3>Quarantined Items ({records.length})</h3>
          <p>{formatBytes(totalBytes)} held safely in AppData\Local\LumenFiles\Quarantine</p>
        </div>
        <button
          type="button"
          className="cleaner-btn danger"
          disabled={isBusy}
          onClick={onEmptyAll}
        >
          <Flame size={15} />
          <span>Purge All ({formatBytes(totalBytes)})</span>
        </button>
      </div>

      <div className="quarantine-list">
        {records.map(rec => (
          <div key={rec.id} className="quarantine-row">
            <div className="quarantine-info">
              <strong>{rec.name}</strong>
              <small>{rec.originalPath}</small>
              <span className="quarantine-meta">
                {formatBytes(rec.sizeBytes)} · Quarantined {rec.quarantinedAt}
              </span>
            </div>
            <div className="quarantine-actions">
              <button
                type="button"
                className="cleaner-btn secondary"
                disabled={isBusy}
                onClick={() => onRestore(rec.id)}
              >
                <ArchiveRestore size={14} />
                <span>Restore</span>
              </button>
              <button
                type="button"
                className="cleaner-btn danger"
                disabled={isBusy}
                onClick={() => onPurge(rec.id)}
              >
                <Trash2 size={14} />
                <span>Purge</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
