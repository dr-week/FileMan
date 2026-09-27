# Lumen Files

Lumen Files is an Android-first, privacy-respecting file manager prototype. It is intentionally separate from the Never Forget application in the repository root.

## Product direction

The product goal is a calm, capable alternative to a desktop file explorer:

- familiar locations, breadcrumbs, list/grid views and bulk selection;
- user-controlled folder access through Android's Storage Access Framework (SAF);
- local-only pins and preferences; no account, telemetry or network permission;
- a foundation for Smart Groups, tags, dual-pane tablets, archives and network shares.

## MVP implemented here

1. Select a folder with the system picker and retain its read/write permission.
2. Browse the selected tree with folders first, sort choices and name/type search.
3. Open folders, select entries and open files with a compatible app.
4. Pin roots and return to them from the Locations sheet.
5. Switch between a compact list and a visual grid.
6. Create folders, rename a selected item and delete a multi-selection through the active document provider.
7. Keep an in-memory, bounded operation history ready for replacement by the durable operation queue in 0.2.

## Privacy and Android constraints

Lumen uses `ACTION_OPEN_DOCUMENT_TREE`, persisted URI permissions and `DocumentFile`; it does **not** request `MANAGE_EXTERNAL_STORAGE`. A user selects exactly what Lumen may see. Pins are only URI strings stored in app-private SharedPreferences. No file names or content are indexed or uploaded in this MVP.

This means Android remains in control of device and cloud-provider access. A complete file manager can add optional MediaStore collections and properly scoped USB/network providers later, but must retain the same explicit-consent model.

## Architecture

```text
app/
  FileExplorerActivity.kt       composition root and SAF permission boundary
  ExplorerViewModel.kt          UI state, filtering, browsing and pins
  DocumentRepository.kt         DocumentFile tree adapter
  ExplorerScreen.kt             Jetpack Compose Explorer interface
  model/ExplorerEntry.kt        UI-neutral file model
  data/PinStore.kt              app-private local pin persistence
```

The Android framework owns document URIs. UI state never assumes a path is readable: every browse/open operation is based on a granted URI, and errors become visible UI states.

## Roadmap

| Release | Scope |
| --- | --- |
| 0.1 — Explorer | SAF locations, browse, search, pinning, selection, open/share |
| 0.2 — Organize | User tags, smart rules, large-file finder, duplicate review, undo queue |
| 0.3 — Power | Tablets/dual pane, archive-as-folder, SMB/SFTP/WebDAV, transfer verification |
| 1.0 — Trust | Encrypted vault, backup/export, accessibility/device test matrix, F-Droid release |

## Advanced-feature decisions

- **Do now:** capability-aware rename, delete and create; deterministic sorting; a clear destructive confirmation.
- **Do next:** copy/move with a persistent WorkManager queue, conflict policy, progress notifications, checksums and provider-aware undo/trash.
- **Do separately:** archive-as-folder, SMB/SFTP/WebDAV, text/media viewers, wireless transfer, app/APK management, root/Shizuku and encrypted vaults. Each adds a new provider/security boundary and should not be bolted into the SAF browser.
- **Do not claim:** universal device-root, Download-root or `Android/data` access. Android 11+ intentionally restricts those selections through SAF.

## Build

Open `file-explorer-android` in Android Studio and use JDK 17. The project needs an Android SDK with API 35 installed.

```powershell
..\android\gradlew.bat -p . assembleDebug
```

The root project's Capacitor Android app is intentionally untouched.
