# File Manager Feature Plan

## Summary

The file manager is the foundation of Lumen Files. It must help a user browse local files quickly, understand what they are looking at, and safely perform common operations without visual friction.

## User value

- see file systems clearly and confidently
- understand size, path, and change history
- move through folders without losing context
- identify files by type and status quickly
- perform safe actions with visible confirmation

## Scope

### In scope
- drive-first navigation, folder tree, and location history
- Windows Library shortcuts mapped to real known folders
- folder browsing and editable breadcrumb/address path
- search and sorting
- file metadata display
- list and grid view states
- selection and bulk action workflow
- safe file actions and review steps
- metadata indexing and file-type categories

### Out of scope
- full enterprise document collaboration
- multi-device shared cloud sync
- deep AI content classification
- advanced archive extraction flows

## Requirements

### Core behavior
- open at the `C:\` drive root by default
- show drives first, then a clearly labeled Library group with Documents, Pictures, and Videos
- make Library entries shortcuts to actual Windows known folders, not invented folder paths
- support Back, Forward, Up, Refresh, address entry, and breadcrumb navigation
- keep the folder tree, selected location, breadcrumb, and file list synchronized
- browse local folders and show their contents clearly
- support search, filter, and sort by standard metadata
- render item type, size, and modified date consistently
- allow users to select a file or folder and inspect additional details
- keep destructive actions behind review or confirmation

### Navigation model

The initial left navigation should be ordered as follows:

1. **C:** drive (selected at first launch; other detected drives appear beneath it)
2. **Library** group (a label, not a second filesystem root)
3. **Documents**, **Pictures**, and **Videos** shortcuts, each resolved from Windows known-folder locations
4. Later additions: Downloads, Desktop, Music, removable drives, and network locations

The main toolbar provides Back, Forward, Up, Refresh, and an address/breadcrumb control. Back and Forward use a location history stack; Up moves to the parent directory. Keyboard equivalents should follow Windows conventions, including Alt+Left, Alt+Right, and Alt+Up. Every navigation method must update one shared location state.

### Index and category model

- Index filesystem metadata only: path, name, extension, size, modified time, and file/folder type.
- Start with user-approved libraries and drives; do not crawl all disks or protected locations silently.
- Categorize by file type into Documents, Photos, Videos, Audio, Archives, Applications, and Other; category views are virtual filters over indexed locations, not duplicate copies.
- Show indexing progress, skipped paths, permission errors, and the last indexed time.
- Keep content inspection and cleanup rules separate from metadata indexing.
- Support incremental refresh/watchers after a complete, cancellable initial scan works.

### Metadata requirements
Each item should expose:
- name
- path
- type
- extension
- size
- last modified date
- hidden/system status when applicable
- folder count or file count when relevant

### Action requirements
- open
- rename
- move
- copy
- create folder
- multi-select
- safe delete or quarantine
- duplicate detection summary

## Current workspace model

The intended product model is drive-first. `C:\` is the initial location, while Library is a grouping of shortcuts to actual Windows known folders. A library shortcut may resolve to a redirected or cloud-backed path, so the UI must display the real location and status rather than assume a fixed `C:\Users\User\...` path.

## Current status

Status: native read-only browsing and core location navigation are implemented; global indexing and file operations are pending.

Completed:
- Tauri v1 backend with read-only drive enumeration and directory metadata commands
- C: root as the initial location, with C: sorted first in the drive list
- Documents, Pictures, and Videos shortcut resolution through platform folder helpers
- lazy drive/folder tree with symlink directories excluded from recursive expansion
- shared Back/Forward history, Up, Refresh, address entry, and clickable breadcrumbs
- directory listing, extension-based categories, and unreadable-item counts

Pending:
- recursive metadata index across approved locations, with cancellation and freshness state
- cross-folder virtual category views for Documents, Photos, Videos, Audio, Archives, Applications, and Other
- category and file-type filters, indexing progress, and persistent index errors
- select, copy/cut/paste, create folder, rename, move, safe delete, and undo
- preview, thumbnails, folder-size calculation, favorites, and tabs

Current limitation: folders are enumerated on demand in the native desktop app; the web preview cannot access local drives, and the app does not yet maintain a background index.

## Acceptance criteria

The file manager is ready for the next milestone when a user can:
- start at C: and navigate using Back, Forward, Up, address path, breadcrumb, and folder tree
- open Documents, Pictures, and Videos from Library and see their real paths
- see an accurate drive and folder listing instead of sample data
- understand whether a location is indexed, still scanning, or unavailable
- see file metadata in context
- sort and filter results quickly
- understand the selected item and its path
- perform safe actions with visible confirmation before destructive operation

## Risks and assumptions

- local file access must remain explicit and not hide risky destinations
- large directories require lightweight filtering and predictable rendering
- folder operations need a clear safety policy before delete or overwrite actions

## Delivery plan

### Phase 1: Navigation foundation
- agree on drive-first and Library information architecture
- implement one location state with Back/Forward/Up/Refresh history
- render C: and a real expandable directory tree
- resolve Documents, Pictures, and Videos through Windows known-folder APIs

### Phase 2: Indexed browsing
- enumerate folder contents with accurate metadata
- build a cancellable metadata index for approved roots
- categorize documents, photos, videos, audio, archives, applications, and other files
- add search, sort, filter, and index status/error states

### Phase 3: Everyday file operations
- multi-select, copy, cut, paste, create folder, rename, and safe delete
- progress, conflict handling, undo/recycle-bin behavior, and operation history
- previews, thumbnails, and folder-size calculation

### Phase 4: Power-user workflows
- tabs and favorites
- optional dual-pane mode
- batch rename, archive tools, folder compare, and synchronization
