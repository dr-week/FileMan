import React from 'react';
import { ExternalLink, File, Folder, X } from 'lucide-react';
import { FileEntry } from '../shared/types';
import { formatBytes } from '../shared/formatters';
import { EXTERNAL_APP_ACTIONS, WorkspaceViewId } from '../../extensions/registry';

interface MetadataPanelProps {
  item: FileEntry | null;
  currentPath: string;
  onClose: () => void;
  onOpenView: (view: WorkspaceViewId) => void;
  onNotify: (message: string) => void;
}

export const MetadataPanel: React.FC<MetadataPanelProps> = ({
  item,
  currentPath,
  onClose,
  onOpenView,
  onNotify,
}) => {
  const applicableActions = EXTERNAL_APP_ACTIONS.filter(action => action.appliesTo(item, currentPath));

  return (
    <aside className="fl-preview-pane" aria-label="Inspector and Preview">
      <div className="fl-preview-header">
        <span style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {item ? item.name : 'Inspector'}
        </span>
        <button type="button" className="fl-icon-btn" onClick={onClose} title="Close Preview (Alt+P)" aria-label="Close preview">
          <X size={13} />
        </button>
      </div>

      <div className="fl-preview-body">
        {!item ? (
          <div style={{ color: 'var(--fl-text-muted)', fontSize: 12, paddingTop: 12 }}>
            Select a file or folder to inspect metadata and external app actions.
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 'var(--fl-radius-md)',
                  background: 'var(--fl-accent-soft)',
                  border: '1px solid var(--fl-accent-edge)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--fl-accent)',
                  flexShrink: 0,
                }}
              >
                {item.type === 'folder' ? <Folder size={18} /> : <File size={18} />}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 13, wordBreak: 'break-word' }}>{item.name}</div>
                <div style={{ fontSize: 11, color: 'var(--fl-text-muted)', textTransform: 'uppercase' }}>
                  {item.type === 'folder' ? 'Folder' : item.extension || item.category || 'File'}
                </div>
              </div>
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
                <dt>Category</dt>
                <dd>{item.category ?? item.type}</dd>
              </div>
            </dl>
          </>
        )}

        <div className="fl-integration-list">
          <span style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--fl-text-muted)' }}>
            Open With &amp; Integrations
          </span>
          {applicableActions.map(action => (
            <button
              key={action.id}
              type="button"
              className="fl-integration-btn"
              title={action.description}
              onClick={() => action.execute(item, currentPath, { onOpenView, onNotify })}
            >
              <span>{action.label}</span>
              <ExternalLink size={12} color="var(--fl-text-muted)" />
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
};
