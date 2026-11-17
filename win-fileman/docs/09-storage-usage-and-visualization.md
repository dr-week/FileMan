# Storage Usage and Visualization Plan

**Status:** Planned; the current native API lists one folder at a time and does not calculate recursive sizes.

## Terminology

The cleaner reports **disk storage**, not system RAM. Use “used space,” “free space,” “folder size,” and “potentially reclaimable space.” RAM is volatile working memory and is outside this cleaner's scope.

## User questions to answer

- Which drives are full, and how much space is used/free on each?
- Which folders and file categories account for the most disk space?
- Which measured items are potential cleanup candidates, and why?
- What parts of the scan were inaccessible, skipped, cloud-only, or still unindexed?

## Metrics and definitions

| Metric | Definition | Important limitation |
| --- | --- | --- |
| Drive used/free | Windows volume capacity and available bytes from the volume API | Includes data outside the scanner's accessible paths |
| Folder size | Sum of scanned file sizes under a selected folder | Can differ from allocated disk usage because of compression, sparse files, hard links, cloud placeholders, permissions, and concurrent changes |
| System/OS usage | Explicitly identified Windows-managed areas and known system files, only when measurable | Do not infer this as total used space minus the current user's file sizes and label the remainder “system” |
| User files | Files under selected user profiles and known folders, grouped by profile and category | Must distinguish the signed-in user from other profiles and honor access permissions |
| Unscanned/other | Drive usage not explained by measured scanner results | Keep this as an honest residual; never silently allocate it to system or user categories |
| Potentially reclaimable | Unique bytes associated with reviewed candidate actions | Must avoid double-counting a file that appears in several rules, duplicate groups, or nested folder summaries |

## Recommended visual design

Use a drive-capacity bar for used/free space, a ranked folder list with exact size and percent of the selected root, and a treemap for discovering large nested folders. Add a category donut only after category totals are based on a complete, deduplicated index. A pie chart is a summary, not a substitute for the ranked folder drill-down.

Separate the views for:

- **Where storage is used:** folders, file types, and user/system attribution with scan coverage.
- **Potential waste:** duplicates, age-based review candidates, temporary/cache candidates, and app remnants.
- **Potential recovery:** unique reclaimable bytes after candidates are de-duplicated and exclusions are applied.

Never combine “largest” and “waste” into one chart. A large video, project, or app can be valuable and must not be presented as junk based on size alone.

## Scan contract

- Scan only a selected drive or user-approved root; show the exact scope before starting.
- Report progress, elapsed time, indexed paths, skipped paths, errors, and last scan time.
- Permit cancel and rescan; mark totals as incomplete until the scan completes.
- Do not follow directory junctions/symlinks by default; track visited file identities to avoid loops and double counting.
- Detect hard links where possible and report logical size separately from unique allocated usage.
- Treat cloud placeholders, inaccessible files, reparse points, and files that change during scanning as special/uncertain states.
- Preserve a scope identifier and scan timestamp with every saved result.

## Acceptance criteria

- Drive used/free totals reconcile to the Windows volume API, with an explicit unaccounted amount where scan coverage is incomplete.
- Every chart can be drilled to the folder/file list that produced its number.
- Nested summaries and duplicate candidates do not inflate reclaimable totals.
- UI says disk space, not memory, and never claims unexplained space is system waste.
- The first scan is read-only and clearly indicates whether it covers one profile or all profiles.

## Research references

- [WizTree](https://diskanalyzer.com/): fast drive/folder scan and treemap; documents NTFS MFT access and hard-link handling.
- [WinDirStat](https://windirstat.net/): directory/file-type views, treemap and other visualizations, scan snapshots, and reporting.
- [TreeSize](https://www.jam-software.com/treesize): pie, bar, treemap, and detailed folder breakdowns.
- [SpaceSniffer](http://www.uderzo.it/main_products/space_sniffer/): interactive treemap drill-down and filters for type, size, and age.
- [Windows Storage Sense](https://support.microsoft.com/en-us/windows/manage-drive-space-with-storage-sense-654f6ada-7bfc-45e5-966b-e24aded96ad5): Microsoft's drive cleanup model; Downloads and cloud cleanup require explicit choices.