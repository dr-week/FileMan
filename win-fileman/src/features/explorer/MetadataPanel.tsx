import React from 'react';
import { FileEntry } from '../shared/types';
import { formatBytes } from '../shared/formatters';

interface MetadataPanelProps {
  item: FileEntry | null;
}

export const MetadataPanel: React.FC<MetadataPanelProps> = ({ item }) => {
  if (!item) {
    return (
      <aside className="metadata-panel empty">
        <h3>Details</h3>
        <p>Select an item to view metadata.</p>
      </aside>
    );
  }

  return (
    <aside className="metadata-panel">
      <div className="metadata-header">
        <span className="metadata-badge">{item.type}</span>
        <h3>{item.name}</h3>
      </div>

      <dl className="metadata-list">
        <div>
          <dt>Path</dt>
          <dd>{item.path}</dd>
        </div>
        <div>
          <dt>Size</dt>
          <dd>{item.sizeBytes ? formatBytes(item.sizeBytes) : '—'}</dd>
        </div>
        <div>
          <dt>Modified</dt>
          <dd>{item.modifiedAt ?? 'n/a'}</dd>
        </div>
        <div>
          <dt>Type</dt>
          <dd>{item.extension ?? item.category ?? 'unknown'}</dd>
        </div>
      </dl>
    </aside>
  );
};
