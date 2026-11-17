# Duplicate and Aging Analysis Plan

**Status:** Planned; no duplicate, age, or application-usage scanner exists yet.

## Duplicate files

### Matching pipeline

1. Restrict analysis to selected roots and eligible file types; apply exclusions first.
2. Bucket files by size as a cheap candidate filter.
3. Compare a small sample or chunk hash for large candidates.
4. Compute a full content hash before presenting an exact-duplicate group.
5. Optionally add separate “similar image/audio/video” analysis later; never mix similarity with exact matches.

File names and extensions are not proof of duplicate content. Exact duplicates are files with matching content hashes, but hard links may refer to the same underlying file and must not be counted as extra recoverable space. Cloud placeholders, reparse points, protected system files, active application files, and unreadable files should be excluded or clearly marked.

### Review and reclaim calculation

- Show every path, size, modified time, selected keeper, hash method, and scan scope.
- Never preselect files for deletion.
- Let the user choose a keeper; provide reversible move/quarantine only in a later milestone.
- For a verified duplicate group, estimated reclaim is the size of removable copies after one keeper, minus any hard-link/shared allocation overlap.
- Keep duplicate results separate from folder totals so the same bytes are not counted twice.

## Old files

“Old” means a user-selected modified-time threshold, not “unneeded.” Last-access times may be disabled, coarse, or updated by background services; do not describe them as reliable usage history. Show age as a filter, not an automatic deletion recommendation.

Initial review filters can include:

- older than a chosen interval (for example 6, 12, or 24 months)
- size above a user-defined threshold
- selected file categories or roots
- exclude recent project folders, cloud-synced placeholders, system/application roots, and user-excluded paths

Results remain review-only. The user must see the exact file list and path before any action.

## “Old apps I do not use”

An app's age or apparent lack of recent activity is not enough to call it unused. Windows does not provide a universal, reliable, privacy-safe last-used timestamp for every program. Use cautious labels such as **installed app**, **old install record**, **missing uninstall command**, or **possible leftover**, and show the evidence. Never infer “unused” from an old directory timestamp alone.

An installed-app inventory should read uninstall registration and package inventory metadata, including display name, publisher, version, install location, and uninstall command when available. It must not execute uninstall commands during discovery. Offer “Open Windows Installed Apps” or launch the registered vendor uninstaller rather than deleting Program Files directly.

## Cross-user scope

- Default scope is the signed-in user's selected folders.
- Other user profiles are a separate explicit scan scope with a per-profile selection list.
- Do not elevate the entire app silently. If access requires administrator rights, request a narrowly scoped operation with clear consent and audit logging.
- Report inaccessible profile paths without trying to bypass ACLs or take ownership.
- Do not reveal file names from another profile until the user authorized that profile's scan.

## Acceptance criteria

- Exact duplicate groups require a content match and show the matching method.
- Hard links and other shared allocations do not inflate reclaim estimates.
- Old-file results are not described as junk solely because of age.
- App records are evidence-based and never imply usage certainty that Windows cannot provide.
- Current-user and all-user scans are visibly distinct, permission-aware, cancellable, and logged.

## Research references

- [dupeGuru](https://dupeguru.voltaicideas.net/): configurable name/content matching and reference-folder safeguards.
- [Czkawka / Krokiet](https://github.com/qarmin/czkawka): duplicate, big-file, empty-file, invalid-link, and similar-media tools; project notes that the GTK Czkawka frontend is superseded by Krokiet.
- [WinDirStat](https://windirstat.net/): search and duplicate analysis alongside folder-size views.
- [TreeSize](https://www.jam-software.com/treesize): large-file and duplicate search features in its paid editions.
- [SpaceSniffer](http://www.uderzo.it/main_products/space_sniffer/): age and size filters for inspection.