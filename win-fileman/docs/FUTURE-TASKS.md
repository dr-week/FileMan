# Future Tasks and Modular Split Plan

## Goal

Keep the app maintainable by splitting each product area into dedicated feature modules and tracking future work in small, reviewable pieces.

## Feature boundaries

### Explorer
- [x] P0: Start at `C:\` and list detected drives, with C: first
- [x] P0: Add Back, Forward, Up, Refresh, editable address path, and breadcrumb navigation
- [x] P0: Use one navigation-history state shared by toolbar, tree, address bar, and file list
- [x] P0: Add an expandable drive/folder tree with clear selected-location state
- [x] P0: Add a Library group mapped to Documents, Pictures, and Videos known folders
- [x] P1: Add a native filesystem adapter for drive enumeration, known-folder resolution, directory listing, and metadata
- [ ] P1: Build a cancellable, incremental metadata index for user-approved locations
- [ ] P1: Add categories for Documents, Photos, Videos, Audio, Archives, Applications, and Other
- [ ] P1: Add honest loading, empty, permission-denied, offline, and indexing-error states
- [ ] P1: Add search, sort, filters, hidden-item preference, and folder-size reporting
- [ ] P2: Add multi-select, copy/cut/paste, create folder, rename, move, safe delete, and undo
- [ ] P2: Add previews, thumbnails, and file properties
- [ ] P3: Add tabs, favorites, and optional dual-pane mode
- [ ] P3: Add batch rename, archive support, folder compare/sync, and hash tools

### Cleaner
- [ ] P0: Report volume capacity, used bytes, free bytes, scan scope, and scan completeness; label as disk storage, not RAM
- [ ] P0: Recursively measure approved current-user roots and rank largest folders/files
- [ ] P0: Add drillable treemap and category chart with explicit unscanned/other space
- [ ] P1: Add a read-only exact-duplicate report using staged size/hash matching and keeper selection
- [ ] P1: Add configurable old-file filters; do not describe age as proof of disuse
- [ ] P1: Inventory installed apps from registration metadata and report evidence, not assumed last-use dates
- [ ] P1: Inspect selected Desktop/Start Menu shortcuts with Shell Link resolution; distinguish broken from unavailable
- [ ] P1: Report possible Adobe/other app leftovers and guide to vendor uninstall/repair before manual removal
- [ ] P2: Add versioned rules with safe/review/protected tiers and exact-path dry-run previews
- [ ] P2: Add reversible quarantine, restore, conflict handling, and persistent operation history
- [ ] P2: Add exclusions and locked/skipped-file reporting
- [ ] P3: Add optional reminders/schedules after scan and rollback are reliable
- [ ] P4: Add explicit all-user profile scans only after privacy, ACL, elevation, and audit review

### Sync
- remote device discovery
- transfer queue and retries
- conflict handling
- remote browsing and preview
- device health and status

### Shared utilities
- formatters
- path validation
- risk levels and type guards
- cross-feature constants and safety helpers

## Short-term task list

1. [ ] Lock the drive-first navigation and Library mapping in the file-manager contract.
2. [ ] Decide and document the Tauri native backend and filesystem permission boundary.
3. [ ] Implement and test Back/Forward/Up/Refresh before adding more explorer polish.
4. [ ] Implement real drive/folder listing and known-folder resolution.
5. [ ] Implement metadata indexing and categories for approved locations.
6. [ ] Add Cleaner Phase 1 volume accounting, folder-size index, and visual storage report.
7. [ ] Add duplicate and age reports with non-destructive review flows.
8. [ ] Add app/shortcut residue reports with explicit evidence and vendor recovery guidance.
9. [ ] Add navigation, indexing, hash, and safety tests, including redirected folders and unavailable drives.
10. [ ] Move all file-manager logic into explorer feature modules.
11. [ ] Continue cleaner and sync modularization after Explorer's navigation contract stabilizes.
12. [ ] Review and reduce large files under the 100–150 line guideline.

## Coding rule for future work

When implementing new features, always do this:
- create a feature folder under `src/features/...`
- separate rendering from logic
- isolate data contracts in dedicated types files
- keep shared helper code in `src/features/shared`
- keep route-level composition in `App.tsx` only

## Development discipline

- no giant component files
- no business logic mixed into UI components
- no unsafe logic hidden in display files
- every task should be small enough to reason about in one pass
