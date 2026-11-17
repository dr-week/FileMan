# Lumen Files Documentation

## Overview

Lumen Files is a desktop-first file management and cleanup application designed for clarity, safety, and local-device productivity. The current Windows app focuses on three core experiences:

- file browsing and metadata visibility
- storage audit and cleanup review
- local device sync and transfer flows

The project is structured as a modular desktop frontend with a premium dark glassmorphism interface and a strong safety-first approach for destructive actions.

## Product goals

- make local filesystem browsing fast and understandable
- show storage usage without clutter or confusion
- help users identify stale or redundant app-data areas
- keep cleanup actions reviewable and reversible where possible
- support nearby-device transfer with simple status feedback

## Current app scope

### Active feature areas
- Native drive-first Explorer with read-only directory listing and location history
- Documents, Pictures, and Videos Library shortcuts
- Cleaner summary and review flow
- Device sync shell and transfer awareness
- Shared layout, sidebar, and app shell behavior

### Planned feature areas
- recursive Explorer metadata index and categories for approved locations
- everyday file actions, recovery, preview, and bulk selection
- storage capacity/folder-size accounting and drillable visual reports
- duplicate and age reports with non-destructive review
- evidence-based app-remnant and shortcut reports, including Adobe recovery guidance
- real read-only cleaner scan, then reversible cleanup/history
- explicit all-user scope only after privacy and authorization review
- later Explorer power features: tabs, favorites, dual pane, archives, and folder compare
- real transfer queue and device validation logic

The cleaner currently uses static sample data and simulated in-memory quarantine; it does not scan or modify files. See [02-cleaner-engine.md](./02-cleaner-engine.md) for the sourced comparison and phased plan.

The Explorer now browses real folders in the Tauri desktop app, but it does not yet maintain a recursive metadata index or perform file operations. The browser preview cannot access local drives. See [01-file-manager.md](./01-file-manager.md) for the restructured requirements and [08-file-manager-research.md](./08-file-manager-research.md) for the market benchmark.

## Documentation map

| Area | File | Purpose |
| --- | --- | --- |
| Function overview | [00-function-map.md](./00-function-map.md) | Product features categorized by user value and implementation status |
| File manager plan | [01-file-manager.md](./01-file-manager.md) | Explorer behavior, metadata, sorting, and file operations |
| Cleaner engine plan | [02-cleaner-engine.md](./02-cleaner-engine.md) | Cleanup rules, reclaim calculations, and review workflow |
| Device sync plan | [03-device-sync.md](./03-device-sync.md) | Nearby-device connectivity and transfer model |
| Safety guardrails | [04-safety-guardrails.md](./04-safety-guardrails.md) | Risk policy, protected paths, and safe-action rules |
| Architecture guidance | [05-architecture-and-maintainability.md](./05-architecture-and-maintainability.md) | Modular structure and engineering standards |
| UI framework adaptation | [06-framework-adaptation.md](./06-framework-adaptation.md) | Design language and app-shell adaptation guidance |
| Navigation and drawer UX | [07-navigation-ux.md](./07-navigation-ux.md) | Drawer model, Library vs Drive research, and current workspace model |
| Strategy plan | [MASTER-PLAN.md](./MASTER-PLAN.md) | Overall product direction and delivery strategy |
| Phases | [PHASES.md](./PHASES.md) | Milestones and completion checkpoints |
| Future tasks | [FUTURE-TASKS.md](./FUTURE-TASKS.md) | Backlog and future enhancements |
| Research notes | [APPDATA_CLEANUP_RESEARCH.md](./APPDATA_CLEANUP_RESEARCH.md) | AppData cleanup patterns and safety research |
| Storage visuals research | [09-storage-usage-and-visualization.md](./09-storage-usage-and-visualization.md) | Disk-space accounting, folder ranking, chart design, and scan accuracy |
| Duplicate and age research | [10-duplicates-and-aging.md](./10-duplicates-and-aging.md) | Exact duplicates, aging filters, app-use uncertainty, and profile scope |
| App remnants research | [11-app-remnants-and-shortcuts.md](./11-app-remnants-and-shortcuts.md) | Adobe recovery, installed-app evidence, orphaned shortcuts, and all-user safety |
| Cleaner product benchmark | [12-cleaner-product-benchmark.md](./12-cleaner-product-benchmark.md) | Representative Windows cleanup/analyzer product comparison and product decisions |
| Adjacent maintenance features | [13-adjacent-maintenance-features.md](./13-adjacent-maintenance-features.md) | Uninstallers, drivers, registry tools, updaters, and related feature risk catalog |
| File-manager research | [08-file-manager-research.md](./08-file-manager-research.md) | Representative Windows and cross-platform feature benchmark |

## Source structure

```text
win-fileman/
├── src/
│   ├── App.tsx
│   ├── styles.css
│   ├── components/
│   │   ├── Sidebar.tsx
│   │   ├── HeaderBar.tsx
│   │   ├── AppCleaner.tsx
│   │   ├── DeviceTransferPanel.tsx
│   │   └── FileCard.tsx
│   ├── features/
│   │   ├── explorer/
│   │   ├── cleaner/
│   │   ├── sync/
│   │   └── shared/
│   └── services/
├── docs/
│   └── README.md
└── package.json
```

## Architecture principles

The app should stay modular and easy to reason about.

- keep feature modules focused and small
- separate UI, business logic, and destructive actions
- keep shared contracts in shared type and utility files
- avoid mixing review logic and execution logic in one component
- prefer explicit confirmation before any destructive operation

## Design principle

The product should feel premium and modern, but never at the cost of clarity or user safety. Glassmorphism is a visual layer, not a substitute for trustworthy behavior.

## Contribution guidance

When adding a new feature or UI area, follow this pattern:

1. define the feature contract
2. place shared types in the shared layer
3. create a small feature folder for the screen and local logic
4. move utility logic into service or helper modules
5. keep safety and review boundaries explicit
6. document the feature in the matching doc file

## Delivery approach

### Phase 1: foundation
- layout and navigation
- basic file browsing
- storage summary view

### Phase 2: safety and review
- cleanup preview and confirmation
- protected-path checks
- risk scoring and explanatory UI

### Phase 3: expansion
- folder tree and richer explorer actions
- transfer queue and device validation
- stronger cleanup execution flows

### Phase 4: hardening
- production polish
- dependency reduction
- validation and documentation cleanup

## Documentation standard

Each feature document should cover:

- purpose and user value
- in-scope behavior
- non-goals
- current state
- key requirements
- acceptance criteria
- risks and assumptions
- follow-up plan

## Summary

The current codebase is already organized around a clear feature split, and the docs are aligned to that structure. The main objective is to keep growing the app in small, reviewable modules while preserving trust in any cleanup or transfer action.
