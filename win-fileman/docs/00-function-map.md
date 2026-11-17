# Lumen Files Function Map

## Purpose

This document explains the product by function, not by internal file layout. It helps the team see the app as a set of user-facing capabilities and track which functions are already implemented, in progress, or planned.

## Core functions

### 1. File exploration

**Primary user outcome**
- browse local folders and files
- understand item metadata
- keep path context visible

**Current status**
- Tauri desktop app starts at C: and enumerates available drives
- Back/Forward/Up/Refresh, address entry, breadcrumbs, and lazy folder tree are connected to one location state
- Documents, Pictures, and Videos resolve as Library shortcuts
- current-folder contents are real read-only metadata; background indexing and file operations are pending

**Next priorities**
- recursive metadata indexing with progress, permissions, and freshness
- cross-folder categories and folder-size summaries
- everyday file operations and recovery

**Key implementation areas**
- [src/App.tsx](../src/App.tsx)
- [src/features/explorer/ExplorerView.tsx](../src/features/explorer/ExplorerView.tsx)
- [src/features/explorer/Breadcrumb.tsx](../src/features/explorer/Breadcrumb.tsx)
- [src/features/explorer/ExplorerToolbar.tsx](../src/features/explorer/ExplorerToolbar.tsx)
- [src/features/explorer/MetadataPanel.tsx](../src/features/explorer/MetadataPanel.tsx)

**Related documentation**
- [01-file-manager.md](./01-file-manager.md)

---

### 2. Storage auditing and cleanup

**Primary user outcome**
- review storage usage
- identify stale or redundant app data
- safely reclaim space

**Current status**
- interactive cleaner screen uses fixed example data
- review and simulated quarantine UI exist, but no real filesystem operation runs
- no live disk totals, charts, duplicate scan, old-file scan, app inventory, or shortcut scan exists
- research and phased requirements are documented in the Cleaner sub-documents

**Key implementation areas**
- [src/components/AppCleaner.tsx](../src/components/AppCleaner.tsx)
- [src/services/appCleanerService.ts](../src/services/appCleanerService.ts)
- [src/services/appCleanerTypes.ts](../src/services/appCleanerTypes.ts)

**Related documentation**
- [02-cleaner-engine.md](./02-cleaner-engine.md)
- [04-safety-guardrails.md](./04-safety-guardrails.md)

---

### 3. Local device synchronization

**Primary user outcome**
- connect to nearby devices
- browse remote files
- transfer files with visible status

**Current status**
- shell is present
- queue and connection model still need stronger implementation

**Key implementation areas**
- [src/components/DeviceTransferPanel.tsx](../src/components/DeviceTransferPanel.tsx)
- [src/features/sync/SyncView.tsx](../src/features/sync/SyncView.tsx)

**Related documentation**
- [03-device-sync.md](./03-device-sync.md)

---

### 4. Safety and guardrails

**Primary user outcome**
- understand risk before destructive action
- maintain user trust in cleanup and transfer actions

**Current status**
- policy and risk model are defined
- actual runtime enforcement still needs to be expanded

**Related documentation**
- [04-safety-guardrails.md](./04-safety-guardrails.md)

---

### 5. Shared app shell and system-wide UX

**Primary user outcome**
- provide a consistent desktop experience
- keep the app visually coherent and easy to navigate

**Current status**
- app shell, sidebar, and header are active
- layout is already using a premium glassmorphism visual system

**Key implementation areas**
- [src/App.tsx](../src/App.tsx)
- [src/components/Sidebar.tsx](../src/components/Sidebar.tsx)
- [src/components/HeaderBar.tsx](../src/components/HeaderBar.tsx)
- [src/styles.css](../src/styles.css)

**Related documentation**
- [06-framework-adaptation.md](./06-framework-adaptation.md)
- [05-architecture-and-maintainability.md](./05-architecture-and-maintainability.md)

## Function status summary

| Function | Status | Notes |
| --- | --- | --- |
| File exploration | Native read-only core | Real current-folder listing, drive/library locations, and navigation history; recursive indexing/actions pending |
| Storage cleanup | UI prototype | Fixed examples and simulated actions only; no real scan or cleanup |
| Device sync | Foundational shell | Needs queue and transfer validation |
| Safety policy | Defined | Needs stronger enforcement and flow review |
| App shell | Active | Structure and styling are set |

## Recommended documentation use

Use this file as the product map and use the function-specific docs for deep detail.

- use this file to understand the app by purpose
- use the feature docs to understand scope and delivery steps
- use the code references to track actual progress and implementation status
