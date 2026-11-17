# Lumen Files Master Plan

## Product vision

Lumen Files is a Windows desktop utility for:
- exploring local files and folders
- measuring storage usage and reclaimable waste
- safely cleaning redundant app data
- transferring files to nearby devices on the local network
- protecting user data with explicit safety guardrails

## Product promise

The app should feel premium and fast, but it must remain trustworthy. The UI should be glassmorphic and minimal, while the underlying system must prioritize:
- correctness
- predictable destructive actions
- explicit review for risky cleanup
- visible metadata and sizing
- modular engineering and easy testing

## Strategic priorities

### 1. File manager foundation
The first product milestone is a drive-first file manager with reliable real navigation. The initial view is C:; Library is a labeled group of shortcuts to real Windows known folders.

Deliverables:
- C: root and detected-drive list
- Back/Forward/Up/Refresh, address entry, breadcrumbs, and expandable tree
- Documents, Pictures, and Videos mapped through OS known-folder resolution
- real directory listing and metadata
- explicit user-approved metadata indexing and categories
- search, sort, filter, and clear permission/index states

### 2. Storage intelligence
The second milestone is understanding what is on disk and what is reclaimable.

Deliverables:
- accurate volume capacity, used/free values, and scan-coverage accounting
- ranked recursive folder/file sizes and drillable treemap/category chart
- deduplicated exact-duplicate report with keeper review
- old-file filters and evidence-based installed-app/remnant reports
- cache vs user-data classification with uncertainty shown
- vendor-first recovery guidance for failed uninstalls such as Adobe
- current-user scope by default; all-user analysis is a later, separately authorized phase

### 3. Cleaner engine
The cleaner is the product differentiator.

Deliverables:
- rule engine for safe and review categories
- dry-run preview
- quarantine and restore flow
- cleanup history
- protected path policy
- graceful handling of locked files

### 4. Device sync
The network sync feature should feel like a secure local transfer system, not a demo panel.

Deliverables:
- device discovery and target presets
- remote folder browsing
- upload/download queue
- progress and retries
- conflict handling
- safe target validation

### 5. Reliability and maintainability
The app should remain maintainable as it grows.

Deliverables:
- modular feature files
- small logic units
- typed rules and safety models
- tests around risk calculations
- documentation for each feature

## Delivery order

1. Drive-first Explorer navigation and real filesystem adapter
2. Library resolution, metadata indexing, and file categories
3. Everyday file operations and recovery behavior
4. Storage summary and size reporting
5. Cleaner rules and dry-run engine
6. Safe cleanup, quarantine, and restore
7. Device transfer and local sync flow
8. Tabs, dual pane, and power-user operations
9. Documentation review and final hardening

## Execution rules

- no destructive action without preview
- no auto-delete in protected category
- all risky actions should be visible and explainable
- every feature should be small, testable and reviewable
- each module should perform one job clearly

## Soft coding rules

Use a practical module size guideline:
- 100–150 lines per file when possible
- one concern per file
- separate UI, logic, rules and data contracts
- split service logic from rendering logic

## Success criteria

The app is ready for a serious alpha when:
- users can browse local files reliably
- size and metadata are visible in real time
- cleanup actions are previewable and safe
- protected data is never auto-deleted
- device sync is repeatable and trackable
- the codebase remains organized and maintainable

## Feature docs map

- [01-file-manager.md](./01-file-manager.md)
- [02-cleaner-engine.md](./02-cleaner-engine.md)
- [03-device-sync.md](./03-device-sync.md)
- [04-safety-guardrails.md](./04-safety-guardrails.md)
- [05-architecture-and-maintainability.md](./05-architecture-and-maintainability.md)
