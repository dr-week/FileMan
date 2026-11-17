# Windows AppData & Redundant User Data Cleanup Architecture
**Project:** Lumen Files (`win-fileman`)  
**Document Version:** 1.1.0  
**Status:** Research baseline; scanner verification required  

---

## 1. Executive Summary

This document records candidate AppData cleanup patterns and sample sizes for the cleaner prototype. The listed sizes are not a current scan of this machine and must never be shown as live findings. A future scanner must measure the current user's data and verify each rule before recommending an action.

Traditional file managers treat `AppData` as a black box or hide it behind a hidden folder flag. Because modern Electron, Chromium, Python, and creative applications (Adobe, WPS, VS Code, Cursor) update and cache aggressively in user space (`AppData\Local\Programs` and `AppData\Roaming`), users experience massive silent disk exhaustion.

This document details:
1. Example cleanup patterns to validate with a future read-only scanner.
2. A comprehensive taxonomy of Windows AppData redundancy patterns.
3. Safe vs. dangerous cleanup boundaries based on industry best practices (Microsoft Storage Sense, BleachBit, Revo Uninstaller).
4. A structured technical architecture for integrating the **App Cleaner & Redundant Data Manager** into Lumen Files (`win-fileman`).

---

## 2. Example Findings to Verify

The values below are historical sample data used by the prototype, not universal estimates or verified current results. Labels such as “safe” are hypotheses; actual risk depends on the active application, file state, and exact target path.

| Category | Typical Location | Historical Sample Size | Root Cause | Initial Review |
| :--- | :--- | :--- | :--- | :--- |
| **Failed Update Cleanups** | `AppData\Local\Programs\Microsoft VS Code Insiders` | **7.03 GB** | Sample of historical commit-hash builds retained after updates. | Review active build and updater state |
| **Duplicate Suite Builds** | `AppData\Local\Kingsoft\WPS Office` | **3.20 GB** | Sample of adjacent version directories. | Confirm active version before review |
| **Old Version Backups** | `AppData\Local\Programs\cursor\_` | **~700 MB** | Sample backup directory created around an update. | Review updater state |
| **Creative Media Scratch** | `AppData\Roaming\Adobe\Common\Media Cache Files` | **6.83 GB** | Sample cache path for media applications. | Candidate cache; check app state |
| **Extension VSIX Caches** | `AppData\Roaming\Code - Insiders\CachedExtensionVSIXs` | **894 MB** | Sample of downloaded extension archives. | Candidate cache; validate exact rule |
| **Staged Updater Binaries** | `AppData\Local\*-updater` (e.g. `lm-studio-updater`) | **~920 MB** | Sample updater installer and payload locations. | Review pending updater state |
| **Dev Package Stores** | `AppData\Local\pnpm\store`, `npm-cache` | **1.41 GB** | Sample package-manager cache sizes. | Prefer package-manager-supported prune |
| **Test Browser Binaries** | `AppData\Local\ms-playwright` | **1.35 GB** | Sample of installed test browser revisions. | Review project requirements |
| **Orphaned / Uninstalled Apps**| `AppData\Roaming\AionUi`, `AppData\Local\NEO` | **~927 MB** | Sample of app-named directories with uncertain ownership. | Manual review; do not infer orphan status |
| **Standard Temp Junk** | `AppData\Local\Temp` | **71.5 MB** | Sample temporary-directory size. | Candidate; skip in-use files |

---

## 3. Taxonomy of AppData Redundancy

Windows distributes application data across three canonical folders:
- **`AppData\Local`**: Machine-dependent data, caches, non-roaming storage, and user-level program installations (`Programs\`).
- **`AppData\Roaming`**: Machine-independent configurations, license states, synchronization tokens, and user profiles.
- **`AppData\LocalLow`**: Sandboxed low-integrity application data (e.g. browser plugins, hardware vendor caches like Intel/Java).

### Pattern A: Multi-Version Commit Stacking (The VS Code & WPS Pattern)
*Modern user-space auto-updaters unpack a new folder named after the release version or commit hash (e.g., `app-1.43.0` or `54917b34ea`). When the update finalizes, if file locks or system restarts prevent the uninstaller from deleting the previous folder, both versions remain indefinitely.*

### Pattern B: Media Index & Conform Caches (The Adobe Pattern)
*Video/audio editing apps conform imported clips into uncompressed 32-bit floating point audio cache (`.cfa`) and peak files (`.pek`). These caches never expire by default and can consume dozens of gigabytes across old completed projects.*

### Pattern C: Staged Setup Installers (The Electron Updater Pattern)
*Electron-updater and Squirrel download full installers into `AppData\Local\<app>-updater\pending` before running them. Once the app restarts, the multi-hundred-megabyte `.exe` installer is frequently never removed.*

### Pattern D: Package Manager Caches (The npm/pnpm/pip Pattern)
*Global package stores save every downloaded tarball across multiple versions. While convenient for offline use, they grow unbounded until an explicit `prune` or `cache clean` command is executed.*

### Pattern E: Orphaned Remnants of Uninstalled Software
*Standard Windows uninstallers only remove files registered in their initial manifest. Dynamic caches, log directories, and user settings created during runtime are deliberately or accidentally left behind.*

---

## 4. Candidate Risk Matrix & Guardrails

No path pattern is inherently “100% safe.” The scanner must inspect the exact target and current app state. Treat broad application folders as protected unless a narrow rule can establish that a specific child is disposable.

To prevent accidental data loss or breaking installed software, the cleaner must enforce strict guardrails:

```
+-------------------------------------------------------------------------------+
| LOWER RISK CANDIDATES (must still be verified)                                |
| - %LOCALAPPDATA%\Temp                                                         |
| - %APPDATA%\Adobe\Common\Media Cache Files & Peak Files                       |
| - %LOCALAPPDATA%\*-updater (staged installer .exe files)                     |
| - %APPDATA%\Code*\CachedExtensionVSIXs                                        |
| - Standard Shader / DirectX Caches (%LOCALAPPDATA%\D3DSCache)                |
+-------------------------------------------------------------------------------+
| REVIEW REQUIRED (never inferred from age alone)                               |
| - Older commit directories in VS Code/Cursor where a newer active build exists|
| - Inactive version folders in WPS Office (older than currently active version)|
| - ms-playwright older browser revisions                                      |
| - pnpm store prune / npm cache prune                                          |
| - Orphaned AppData folders where no matching registry uninstall key exists    |
+-------------------------------------------------------------------------------+
| PROTECTED (exclude from cleanup plans)                                        |
| - Root AppData, Local, Roaming, LocalLow                                      |
| - AppData\Roaming configuration files (*.json, *.ini, credentials, databases) |
| - Active browser user profiles (Default\Preferences, Login Data, Bookmarks)   |
| - Current active executables and running processes                            |
+-------------------------------------------------------------------------------+
```

---

## 5. Feature Design for Lumen Files (`win-fileman`)

The cleaner currently uses static examples and simulated in-memory quarantine. No filesystem scan, delete, or restore operation exists yet. The implementation plan and prioritized feature roadmap are maintained in [02-cleaner-engine.md](./02-cleaner-engine.md).

### 5.1 Planned Architecture

The current `appCleanerService.ts` contains fixed sample items and calculations. `cleanerSafety.ts` filters eligible selections and simulates quarantine/restore in memory; it does not inspect or move files. A production implementation should separate:

1. **Read-only scanner and rule catalog:** narrow rules with provenance, measured metadata, and explicit error/locked-file reporting.
2. **Safety validator:** resolved-path checks, protected locations, active-process checks, and risk classification before an operation is planned.
3. **Preview and operation service:** exact target list, dry-run totals, same-volume quarantine, rollback, and persistent history.
4. **Cleaner UI:** transparent scan status, category review, exclusions, operation progress, and recovery controls.

Native filesystem integration must be added explicitly; the current frontend has no live Tauri cleanup invocation.

---

## 6. External Product References

- [Microsoft Storage Sense](https://support.microsoft.com/en-us/windows/manage-drive-space-with-storage-sense-654f6ada-7bfc-45e5-966b-e24aded96ad5): scheduled and category-based cleanup; Downloads and cloud content require explicit settings.
- [BleachBit features](https://www.bleachbit.org/features): application-specific cleaners, descriptions, and Preview before Delete.
- [CCleaner features](https://www.ccleaner.com/ccleaner/features): guided checks, customizable cleanup, reminders/automation, and duplicate cloud-file discovery.

Use these as references for feature discovery only. Lumen Files should preserve user review and avoid copying broad or risky optimization features without a clear storage-management need.

## Related cleaner research documents

- [Cleaner Engine Plan](./02-cleaner-engine.md): product scope and delivery phases.
- [Storage Usage and Visualization](./09-storage-usage-and-visualization.md): disk-space accounting, folder ranking, and charts.
- [Duplicate and Aging Analysis](./10-duplicates-and-aging.md): exact matching, age filters, and old-app evidence.
- [App Remnants and Shortcuts](./11-app-remnants-and-shortcuts.md): Adobe recovery, installed-app evidence, and `.lnk` handling.
- [Cleaner Product Benchmark](./12-cleaner-product-benchmark.md): representative product comparison.
