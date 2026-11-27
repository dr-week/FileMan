import { FileEntry } from '../features/shared/types';
import { isDesktopRuntime, openInExplorer } from '../services/fileSystemApi';

export type WorkspaceViewId = 'files' | 'cleaner' | 'devices';

export interface ExternalAppAction {
  id: string;
  label: string;
  description: string;
  shortcut?: string;
  appliesTo: (item: FileEntry | null, currentPath: string) => boolean;
  execute: (item: FileEntry | null, currentPath: string, ctx: ExtensionExecutionContext) => Promise<void> | void;
}

export interface WorkspaceAddon {
  id: WorkspaceViewId;
  label: string;
  badge?: string;
  description: string;
  accentColorVar: string;
}

export interface ExtensionExecutionContext {
  onOpenView: (view: WorkspaceViewId) => void;
  onNotify: (message: string) => void;
}

/**
 * Built-in workspace add-ons preserved from FileMan.
 * New plugins/add-ons can register into this registry without modifying core shell layout.
 */
export const WORKSPACE_ADDONS: WorkspaceAddon[] = [
  {
    id: 'devices',
    label: 'Transfers & Devices',
    badge: 'USB / Wi-Fi',
    description: 'Android & CarUnit Wi-Fi file sync and sound-pack workflows',
    accentColorVar: 'var(--fl-accent)',
  },
  {
    id: 'cleaner',
    label: 'Storage & Cleanup',
    badge: 'Audit',
    description: 'AppData/PUP scanner, Quarantine vault, and volume infographics',
    accentColorVar: 'var(--fl-amber)',
  },
];

/**
 * External app integrations ("Open with", OS Explorer, CarUnit/Device transfer handoff).
 */
export const EXTERNAL_APP_ACTIONS: ExternalAppAction[] = [
  {
    id: 'open-in-windows-explorer',
    label: 'Open in Windows Explorer',
    description: 'Reveal this folder or selected item in the native OS file manager',
    shortcut: 'F3',
    appliesTo: () => true,
    execute: async (item, currentPath, ctx) => {
      const target = item?.path || currentPath;
      if (!isDesktopRuntime()) {
        ctx.onNotify(`Desktop runtime required to launch Explorer for ${target}`);
        return;
      }
      await openInExplorer(target);
      ctx.onNotify(`Opened ${target} in Windows Explorer`);
    },
  },
  {
    id: 'send-to-device-transfer',
    label: 'Send to Android / CarUnit',
    description: 'Open Transfers & CarUnit sync panel to send files over Wi-Fi',
    appliesTo: (item) => Boolean(item && item.type === 'file'),
    execute: (item, _currentPath, ctx) => {
      ctx.onOpenView('devices');
      ctx.onNotify(item ? `Ready to transfer "${item.name}" in Transfers` : 'Opened Transfers & Devices');
    },
  },
  {
    id: 'inspect-in-cleaner',
    label: 'Analyze Storage & Cleanup',
    description: 'Open Storage & AppData Cleanup audit for this drive',
    appliesTo: () => true,
    execute: (_item, _currentPath, ctx) => {
      ctx.onOpenView('cleaner');
      ctx.onNotify('Opened Storage & Cleanup Audit');
    },
  },
];
