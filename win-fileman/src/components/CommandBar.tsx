import React from 'react';
import { ArrowLeftRight, Sparkles } from 'lucide-react';
import { WorkspaceViewId } from '../extensions/registry';

interface CommandBarProps {
  activeView: WorkspaceViewId;
  isDualPane: boolean;
  showHidden: boolean;
  showPreview: boolean;
  statusMessage: string;
  onOpenExternal: () => void;
  onNewFolder: () => void;
  onCopy: () => void;
  onMove: () => void;
  onDelete: () => void;
  onToggleDualPane: () => void;
  onToggleHidden: () => void;
  onTogglePreview: () => void;
  onSelectView: (view: WorkspaceViewId) => void;
  onPhaseNotice: (feature: string) => void;
}

export const CommandBar: React.FC<CommandBarProps> = ({
  activeView,
  isDualPane,
  showHidden,
  showPreview,
  statusMessage,
  onOpenExternal,
  onNewFolder,
  onCopy,
  onMove,
  onDelete,
  onToggleDualPane,
  onToggleHidden,
  onTogglePreview,
  onSelectView,
  onPhaseNotice,
}) => {
  return (
    <footer className="fl-command-bar" aria-label="Command bar">
      <div className="fl-command-group">
        <button type="button" className="fl-cmd-btn" onClick={() => onPhaseNotice('Inline Rename (F2)')} title="Rename selected item (F2)">
          <span className="fl-cmd-key">F2</span> Rename
        </button>
        <button type="button" className="fl-cmd-btn" onClick={onOpenExternal} title="Open in Windows Explorer (F3)">
          <span className="fl-cmd-key">F3</span> Open
        </button>
        <button type="button" className="fl-cmd-btn" onClick={onCopy} title="Copy selected item to the other pane (Ctrl+F5)">
          <span className="fl-cmd-key">Ctrl+F5</span> Copy
        </button>
        <button type="button" className="fl-cmd-btn" onClick={onMove} title="Move selected item to the other pane (F6)">
          <span className="fl-cmd-key">F6</span> Move
        </button>
        <button type="button" className="fl-cmd-btn" onClick={onNewFolder} title="Create new folder (F7)">
          <span className="fl-cmd-key">F7</span> New folder
        </button>
        <button type="button" className="fl-cmd-btn" onClick={onDelete} title="Delete selected item (F8 / Del)">
          <span className="fl-cmd-key">F8</span> Delete
        </button>
        <button
          type="button"
          className={`fl-cmd-btn ${showHidden ? 'active' : ''}`}
          onClick={onToggleHidden}
          title="Show or hide hidden files (Ctrl+H)"
        >
          <span className="fl-cmd-key">Ctrl+H</span> Hidden
        </button>
        <button
          type="button"
          className={`fl-cmd-btn ${isDualPane ? 'active' : ''}`}
          onClick={onToggleDualPane}
          title="Toggle one or two panes (Ctrl+P)"
        >
          <span className="fl-cmd-key">Ctrl+P</span> {isDualPane ? 'Dual pane' : 'Single pane'}
        </button>
        <button
          type="button"
          className={`fl-cmd-btn ${showPreview && activeView === 'files' ? 'active' : ''}`}
          onClick={onTogglePreview}
          title="Toggle inspector/preview panel (Alt+P)"
        >
          <span className="fl-cmd-key">Alt+P</span> Preview
        </button>
        <button
          type="button"
          className={`fl-cmd-btn ${activeView === 'devices' ? 'active' : ''}`}
          onClick={() => onSelectView(activeView === 'devices' ? 'files' : 'devices')}
          title="Android & CarUnit Transfers"
        >
          <ArrowLeftRight size={12} color="var(--fl-accent)" /> Transfers
        </button>
        <button
          type="button"
          className={`fl-cmd-btn ${activeView === 'cleaner' ? 'active' : ''}`}
          onClick={() => onSelectView(activeView === 'cleaner' ? 'files' : 'cleaner')}
          title="Storage Audit & Quarantine Cleanup"
        >
          <Sparkles size={12} color="var(--fl-amber)" /> Cleanup
        </button>
      </div>
      <span className="fl-status-text" title={statusMessage}>{statusMessage}</span>
    </footer>
  );
};
