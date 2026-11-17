# Open-Source References & Cleaner v2 Implementation

## 1. Open-Source GitHub Repositories Researched

These open-source projects share our **Tauri / Rust / React** or **Windows Cleaner** domain and inform our modular design:

| Repository | Stack | Useful Modular Patterns |
| --- | --- | --- |
| [TheHolyOneZ/ZCleanSlate](https://github.com/TheHolyOneZ/ZCleanSlate) | Tauri 2 + Rust + React | Preview-before-delete, snapshot/undo mindset, artifact categorization |
| [Swaksm/Kleaner](https://github.com/Swaksm/Kleaner) | Rust + Tauri | Transparent explanations for every cache/update/temp candidate |
| [GeLith/system-cleaner](https://github.com/GeLith/system-cleaner) | Tauri 2 + Rust | Lightweight localized rule engine, startup & temp scanning |
| [Hermesiss/appdata-cleaner](https://github.com/Hermesiss/appdata-cleaner) | Rust | Focused `AppData\Local`, `Roaming`, `LocalLow` size breakdowns |
| [riponcm/Jharu](https://github.com/riponcm/Jharu) | Tauri + Rust | Developer cache targeting (`npm`, `pip`, `Ollama`, `pnpm`) |
| [qarmin/czkawka](https://github.com/qarmin/czkawka) | Rust | Staged duplicate hashing, empty-folder & broken-symlink scanning |
| [bleachbit/bleachbit](https://github.com/bleachbit/bleachbit) | Python | Rule provenance, human-readable descriptions, preview-before-delete |
| [conaticus/FileExplorer](https://github.com/conaticus/FileExplorer) | Tauri + Rust + React | Fast directory traversal & search indexing |
| [kotru21/FileManagerTauri](https://github.com/kotru21/FileManagerTauri) | Tauri 2 + Rust + React | Strict backend safety checks, virtualized lists, history navigation |

## 2. What Was Implemented in Cleaner & Explorer v2

### Rust Backend (`win-fileman/src-tauri/src/`)
- **`appdata_scanner.rs` & `appdata_rules.rs`**: Live read-only scanner for `*-updater` installers, empty `Local\Programs` folders, stale VS Code commit builds, dev/media caches, telemetry (`com.adobe.dunamis`), and `HKCU\...\Run` PUP/broken startup entries.
- **`shortcut_scanner.rs`**: Scans Desktop and Start Menu `.lnk` files via `WScript.Shell`, flagging missing local targets as `safe` abandoned shortcuts while marking offline/removable drives as `caution` ("Could not verify").
- **`quarantine.rs`**: Reversible quarantine in `%LOCALAPPDATA%\LumenFiles\Quarantine` with `manifest.json`, `restore_quarantined_item`, `purge_quarantined_item`, and `empty_quarantine`. Protected roots and registry keys are blocked.
- **`volume_info.rs`**: Windows `GetDiskFreeSpaceExW` volume capacity query, `open_in_explorer`, and `create_folder`.

### Frontend (`win-fileman/src/`)
- **`CleanerInfographics.tsx` & `VolumeCapacityBar.tsx`**: Safety distribution stacked bar, category breakdown bars, and real Windows volume used/free bar.
- **`AppDataAuditView.tsx` & `QuarantinePanel.tsx`**: Category tabs (including Shortcuts and Quarantine), one-click **Auto-Purge Safe**, restore, and permanent purge controls.
- **`ExplorerStatsBar.tsx` & `ExplorerView.tsx`**: Folder category infographic bar, New Folder, and Open in Windows Explorer actions.
