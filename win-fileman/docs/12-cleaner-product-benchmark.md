# Cleaner Product Benchmark

**Research date:** 2026-11-14  
**Scope:** Representative Windows cleaner, storage analyzer, duplicate finder, and uninstall/remnant tools. This is not an exhaustive list or an independent safety certification.

| Product | Primary focus | Publicly documented patterns | Lumen Files takeaway |
| --- | --- | --- | --- |
| [Windows Storage Sense](https://support.microsoft.com/en-us/windows/manage-drive-space-with-storage-sense-654f6ada-7bfc-45e5-966b-e24aded96ad5) | Windows-managed cleanup | Temporary files, Recycle Bin, optional Downloads/cloud behavior, user-controlled schedule | Start with Windows-owned cleanup candidates and make personal/cloud paths opt-in |
| [BleachBit](https://www.bleachbit.org/features) | App/system cleaner | Application-specific rules, descriptions, preview before delete, custom cleaners | Keep rules explainable and make a dry-run list central to the workflow |
| [CCleaner](https://www.ccleaner.com/ccleaner/features) | Consumer cleanup/maintenance | Guided health review, custom cleaning, reminders, duplicate/cloud-file discovery | Guided review is useful; avoid bundling driver, registry, or performance optimizers into storage cleanup |
| [WizTree](https://diskanalyzer.com/) | Fast storage analysis | Visual treemap, large files/folders, NTFS MFT scanning, hard-link accounting | Treemap and large-file ranking matter; physical/logical size and link handling must be accurate |
| [WinDirStat](https://windirstat.net/) | Open-source disk analysis | Folder/file-type views, treemap and other charts, snapshots, duplicate search, reports | Use drill-down visuals and saved scan reports; separate analysis from destructive cleanup |
| [TreeSize](https://www.jam-software.com/treesize) | Storage analysis/reporting | Pie/bar/treemap, folder breakdown, large/duplicate search, exports and monitoring in some editions | Folder ranking, chart drill-down, scan scope, and report export are strong references |
| [SpaceSniffer](http://www.uderzo.it/main_products/space_sniffer/) | Interactive storage map | Treemap zoom, size/age/type filters, tags, export | Age is a filter for review, not proof that data is disposable |
| [dupeGuru](https://dupeguru.voltaicideas.net/) | Exact/fuzzy duplicates | Name/content matching, configurable engine, reference folders, sorting and filtering | Keepers/reference folders and visible groups reduce accidental deletion |
| [Czkawka / Krokiet](https://github.com/qarmin/czkawka) | Multi-tool file analysis | Duplicates, big/empty files, invalid symbolic links, similar media | Separate exact duplicates, similar media, empty data, and invalid links into independent analyses |
| [Bulk Crap Uninstaller](https://www.bcuninstaller.com/) | Windows app inventory/uninstall | Registry/package/portable app detection, uses original uninstaller, leftover scan, force uninstall | App inventory and uninstall are distinct from cache cleaning; prefer original uninstallers |
| [Revo Uninstaller](https://www.revouninstaller.com/revo-uninstaller-free-download/) | App uninstall/leftover scan | Standard uninstall followed by leftover scan; forced removal and deeper scan in Pro | Post-uninstall remnants need app-specific evidence and extra confirmation |
| [IObit Uninstaller](https://www.iobit.com/en/advanceduninstaller.php) | App uninstall/maintenance | Advertises leftovers, extension management, install monitoring, software relocation and forced removal | Read-only inventory/remnant reports are useful; forced actions are not part of MVP |
| [IObit Software Updater](https://www.iobit.com/en/iobit-software-updater.php) | Third-party app updates | Advertises catalogs, batch/scheduled updates, official-source downloads, and restore points | Consider update inventory only; don't run installers without provenance/signature validation and explicit consent |
| [IObit Driver Booster](https://www.iobit.com/en/driver-booster.php) | Driver update/optimization | Advertises driver catalog, batch install, restore points and gaming tools | Exclude driver installation; route users to Windows Update or hardware vendors |
| [Wise Registry Cleaner](https://www.wisecleaner.com/wise-registry-cleaner.html) | Registry scan/tuning | Advertises scan modes, exclusions, backups, restore points, scheduling and multi-user registry cleanup | Exclude registry mutation; registry cleanup is not a storage analyzer and has system-wide impact |
| [Microsoft driver guidance](https://support.microsoft.com/en-us/topic/0549a8d9-4842-8acb-75fa-a6faadb62507) | OS driver maintenance | Windows Update supplies recommended drivers; optional updates and hardware-vendor guidance are available | Prefer the OS and hardware vendor as driver sources |
| [Adobe Creative Cloud Cleaner Tool](https://helpx.adobe.com/creative-cloud/kb/cc-cleaner-tool-installation-problems.html) | Repair corrupted Adobe installs | Expert recovery for install/update problems and older Adobe software; backup/process-close guidance | Treat Adobe cleanup as recovery workflow, not a generic “delete large Adobe folder” rule |

## Feature families

### 1. Storage mapping

Drive totals, largest folders/files, treemaps, category breakdowns, scan snapshots, and exports. This answers “where is my disk space used?” but does not determine what is safe to remove.

### 2. Candidate cleanup

Rule-based caches, temporary items, optional aged Downloads/Recycle Bin cleanup, and a preview/review step. Candidates must be scoped, explained, and excluded when in use, cloud-backed, or protected.

### 3. Duplicate/aging analysis

Content-hash duplicates, similar-media matches, largest files, and age filters. Exact duplicates and perceptually similar files have different confidence and reclaim calculations; neither should be auto-deleted.

### 4. App lifecycle/remnants

Installed-app inventory, original uninstallers, post-uninstall residue scans, and forced uninstall. This category has much higher blast radius than clearing caches and should be developed as a separate user-confirmed workflow.

### 5. Adjacent system maintenance

Driver catalogs, registry cleaners, app updaters, startup managers, privacy cleaning, file recovery, app sleep, and secure shredding appear in broader maintenance suites. They are separate product domains with their own trust and rollback requirements, not default Cleaner checkboxes.

## Product decision

Build Lumen Files as a storage and file manager first:

1. Drive and user-folder accounting with coverage/error disclosure.
2. Folder ranking and treemap; show used/free separately from candidate waste.
3. Read-only duplicate and age reports with explicit scope.
4. App/shortcut remnant inventory with evidence and confidence.
5. Only then add reversible, exact-path cleanup actions.

Do not implement registry cleaning, third-party driver installation, forced uninstall, service/task removal, browser history cleaning, secure shredding, or automatic cleanup in the first product plan. The user’s Adobe case should produce a report and safe vendor-recovery guidance before any destructive cleanup feature exists. See [Adjacent Maintenance Feature Catalog](./13-adjacent-maintenance-features.md) for the broader feature inventory and risk decisions.

## Related research

- [Storage Usage and Visualization](./09-storage-usage-and-visualization.md)
- [Duplicate and Aging Analysis](./10-duplicates-and-aging.md)
- [App Remnants and Shortcuts](./11-app-remnants-and-shortcuts.md)
- [Adjacent Maintenance Features](./13-adjacent-maintenance-features.md)