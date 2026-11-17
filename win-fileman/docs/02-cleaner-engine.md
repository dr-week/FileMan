# Cleaner Engine Feature Plan

## Summary

The cleaner should explain where disk storage is used, which items are only candidates for review, and what will happen before any file operation. “Memory” in this feature means disk storage, not RAM. The current screen is still a prototype using fixed sample data; it does not scan or change the filesystem.

## User value

- see how much space is recoverable
- understand why an item is considered reclaimable
- review risky items before deleting anything
- safely clean local app caches and stale installers
- restore or undo where possible

## Scope

### In scope
- per-drive used/free totals and scan coverage
- recursive folder-size ranking and visual storage breakdown
- current-user library indexing and file categories
- exact duplicate, age-filter, old-app, and shortcut-remnant reports
- safe and review-level item classification
- dry-run preview and selected cleanup actions
- quarantine and restore flow
- audit history and rule explanation

### Out of scope
- kernel/system file cleanup
- automated deletion without preview
- destructive action outside known safe rules
- long-term retention analytics beyond local machine use
- reliable “last used” claims inferred from folder timestamps
- all-user profile scans without explicit selection and required authorization
- forced uninstall, registry cleaning, service/task removal, or broad Program Files deletion

## Requirements

### Core workflow
1. scan target roots
2. classify each item by category and risk
3. estimate reclaimable space
4. preview selected actions
5. require review for higher-risk items
6. execute cleanup safely with logs
7. preserve restore options where appropriate

### Risk categories
- safe
- caution
- protected

### Safe heuristics
- skip locked files
- skip active app install roots
- skip user data and protected profiles
- favor stale update payloads and cache files over personal content
- explain every recommendation

## Current status

Status: interactive prototype; no live scanner or filesystem cleanup is connected.

Completed:
- sample category summaries and risk labels
- selection and cleanup review UI
- protected items blocked by both UI selection and cleanup planning
- simulated quarantine and restore state within the current page session
- UI copy identifies the sample data and simulated actions

Pending:
- read-only scanner with measured size, timestamps, locked-file reporting, and scan errors
- rule validation against resolved paths and active processes
- real quarantine with same-volume moves, conflict handling, and rollback
- persistent cleanup history and restore across app restarts

### Research comparison

| Product | Useful pattern | Lumen Files decision |
| --- | --- | --- |
| [Windows Storage Sense](https://support.microsoft.com/en-us/windows/manage-drive-space-with-storage-sense-654f6ada-7bfc-45e5-966b-e24aded96ad5) | Selective categories, configurable cadence, and explicit opt-in for Downloads and cloud files | Keep personal folders opt-in; consider scheduling only after a trustworthy scanner exists |
| [BleachBit](https://www.bleachbit.org/features) | Per-application cleaner rules, readable descriptions, and Preview before Delete | Adopt transparent rules and a dry-run list with exact paths and expected effects |
| [CCleaner](https://www.ccleaner.com/ccleaner/features) | Guided health review, custom cleaning, reminders/automation, and duplicate-file discovery | Consider guided review and later reminders; prioritize storage cleanup over broad performance-optimizer scope |
| [WizTree](https://diskanalyzer.com/), [WinDirStat](https://windirstat.net/), [TreeSize](https://www.jam-software.com/treesize), [SpaceSniffer](http://www.uderzo.it/main_products/space_sniffer/) | Folder ranking, treemap/pie/bar visualizations, large-file views, and scan reports | Separate measured storage maps from cleanup candidates; make charts drillable to exact paths |
| [dupeGuru](https://dupeguru.voltaicideas.net/), [Czkawka/Krokiet](https://github.com/qarmin/czkawka) | Content-based duplicate and similar-media tools, with matching options | Use staged hash matching; keep exact duplicates distinct from similar files and never auto-select deletion |
| [Bulk Crap Uninstaller](https://www.bcuninstaller.com/), [Revo Uninstaller](https://www.revouninstaller.com/revo-uninstaller-free-download/) | App inventory, original uninstaller integration, and post-uninstall leftover review | Treat app lifecycle as a separate high-risk workflow and use registered uninstallers first |
| [Adobe Creative Cloud Cleaner Tool](https://helpx.adobe.com/creative-cloud/kb/cc-cleaner-tool-installation-problems.html) | Expert recovery for corrupted installations, with backup and process-close precautions | For Adobe-like cases, produce evidence and vendor recovery guidance before considering cleanup |
| [Microsoft driver guidance](https://support.microsoft.com/en-us/topic/0549a8d9-4842-8acb-75fa-a6faadb62507), [Driver Booster](https://www.iobit.com/en/driver-booster.php) | Windows Update/hardware-vendor drivers versus third-party catalog and bulk installation | Do not install drivers from the Cleaner; link to Windows Update or the hardware vendor |
| [Wise Registry Cleaner](https://www.wisecleaner.com/wise-registry-cleaner.html), [Revo Registry Cleaner](https://www.revouninstaller.com/revo-uninstaller-free-download/) | Registry scan, backup, restore, scheduled cleaning, and tuning | Do not add registry deletion/tuning to this product; risk is unrelated to disk-space reporting |
| [IObit Software Updater](https://www.iobit.com/en/iobit-software-updater.php) | App catalog, batch/scheduled updates, and restore-point claims | Keep update inventory separate; automatic installer execution is deferred |

The comparison uses public product documentation, not independent safety evaluations. These products are references for interaction patterns, not endorsements of every feature.

### Prioritized feature plan

1. **Truthful accounting:** show drive capacity, free/used disk bytes, scan scope, completeness, and an unaccounted category. Never call disk usage RAM or guess residual usage is system data.
2. **Folder intelligence:** recursively measure user-approved roots; rank folders; add drillable treemap and category chart with explicit unscanned/other data.
3. **Waste candidates:** add exact duplicate groups, user-configurable age filters, and old-app inventory as separate review reports with evidence/confidence.
4. **Residue investigation:** inspect selected shortcuts and app-related folders, identify unavailable/uncertain targets, and correlate with installed-app metadata; report first, do not delete.
5. **Recovery operations:** after rules and path safety are proven, support exact-path preview, recycle-bin/quarantine, restore, conflict handling, and history.
6. **Cross-user scope:** only after security review, allow explicit per-profile selection, permissions reporting, least-privilege elevation, and audit logs.

Do not include registry cleaners, third-party driver installation, browser-history deletion, secure shredding, forced uninstall, or automatic deletion in the initial cleaner scope. The fuller adjacent-feature inventory is in [13-adjacent-maintenance-features.md](./13-adjacent-maintenance-features.md).

See [09-storage-usage-and-visualization.md](./09-storage-usage-and-visualization.md), [10-duplicates-and-aging.md](./10-duplicates-and-aging.md), [11-app-remnants-and-shortcuts.md](./11-app-remnants-and-shortcuts.md), [12-cleaner-product-benchmark.md](./12-cleaner-product-benchmark.md), and [13-adjacent-maintenance-features.md](./13-adjacent-maintenance-features.md) for the detailed research and decisions.

## Acceptance criteria

The cleaner is ready for its first real-data milestone when a user can:
- see reclaimable space grouped by category
- review why each item is flagged
- see measured targets and distinguish scan results from estimates
- select candidates without protected items entering the cleanup plan
- preview the exact operation before quarantine
- understand skipped, failed, and recoverable items

## Risks and assumptions

- any cleanup near user-generated folders must require stronger verification
- large sweep operations should default to preview and explicit approval
- some system data may need to be excluded by policy even if technically reclaimable

## Delivery plan

### Phase 0: Prototype honesty and policy
- label all static findings and simulated operations
- block protected items at both UI and service boundaries
- require explicit opt-in for caution-tier items

### Phase 1: Read-only scanner
- scan approved roots for the signed-in user with narrow rules
- measure drive used/free bytes and recursive folder sizes
- show largest folders and storage charts with scan coverage
- report locked files, errors, and rule provenance

### Phase 2: File intelligence
- find exact duplicates with staged content hashes and keeper selection
- add old-file filters using configurable modified-time thresholds
- report installed-app inventory and possible unused/old apps without guessing last use
- resolve shortcut targets and show broken/unavailable/unknown states

### Phase 3: App remnants and safe recovery
- correlate leftover paths with registered apps and vendor uninstall records
- provide vendor uninstall/repair guidance, including Adobe recovery guidance
- preview exact targets and deduplicated reclaim estimates
- quarantine selected candidates; require extra confirmation for caution items
- support restore and conflict-safe rollback

### Phase 4: History and maintenance
- persist scan/cleanup history and exclusions
- add optional reminders or schedules with user-controlled categories
- add repeat scans and change-over-time reports

### Phase 5: All-user analysis
- require explicit per-profile scope selection and authorization
- respect ACLs and skip inaccessible profiles without changing ownership
- audit profile scope, elevation, skipped paths, and user-visible results
