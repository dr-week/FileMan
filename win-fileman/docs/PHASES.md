# Lumen Files Delivery Phases

## Phase 0 — Product and Architecture Lock

### Goal
Define the final app boundaries before writing feature code.

### Deliverables
- target product scope
- module boundaries
- file size guidelines
- safety policy
- type contracts for primary entities
- feature roadmap

### Rules
- no speculative code beyond the final architecture
- no large refactor before architecture lock
- no destructive operation without a safety check

---

## Phase 1 — File Manager Core

### Goal
Build a usable explorer with real browsing and metadata in a clean shell.

### Deliverables
- C: drive shown first and selected at initial launch
- Back, Forward, Up, Refresh, address path, and breadcrumb navigation
- expandable drive/folder tree with a shared location-history model
- Library group mapped to Documents, Pictures, and Videos known folders
- real folder listing through the native filesystem adapter
- search and filter
- list/grid switch
- metadata panel
- file/folder item metadata
- basic selection and actions

### Must-have behavior
- start at C: and browse actual local directories
- navigate Back, Forward, Up, and by entering/selecting a path
- keep tree, breadcrumb, address bar, and list on the same location
- resolve user Libraries from the OS instead of hard-coded sample paths
- show size and modification data
- basic sort and filter
- handle permission errors, missing paths, removable drives, and slow folders clearly
- hide protected/system entries by default

### Exit criteria
Users can start at C:, navigate predictably, open Documents/Pictures/Videos, and see real filesystem entries and metadata.

---

## Phase 2 — Storage Intelligence

### Goal
Turn the explorer into a storage analytics surface.

### Deliverables
- cancellable metadata indexing for user-approved locations
- categorized views for documents, photos, videos, audio, archives, applications, and other files
- index freshness, progress, skipped-item, and permission-error reporting
- volume capacity/used/free accounting, clearly labeled as disk storage
- recursive folder and largest-file ranking for approved roots
- drillable treemap and category chart with unscanned/other coverage
- exact duplicate report with staged hashes and keeper review
- configurable old-file filters, never treating age as proof of waste
- current storage health panel

### Must-have behavior
- item-level and recursive folder sizes with hard-link/scan-coverage caveats
- use volume APIs for used/free totals and don't guess “system” from leftover bytes
- calculate unique reclaim candidates without double-counting nested folders/duplicates
- distinguish size, old age, duplicate certainty, and cleanup risk
- categorize findings into safe / review / protected groups with rule provenance

### Exit criteria
Users can see which folders consume storage, distinguish measured use from possible waste, drill into charts, and understand index freshness and omissions.

---

## Phase 3 — Cleaner Engine

### Goal
Build the safe cleanup system that identifies and previews redundant payloads.

### Deliverables
- cleanup rule set
- safe/review/protected classification
- installed-app inventory and possible-remnant reports with evidence/confidence
- selected shortcut inspection with broken/unavailable/unknown outcomes
- vendor uninstall/repair guidance for Adobe-like failed uninstalls
- dry run preview
- selected cleanup actions
- quarantine and restore flow
- cleanup history log

### Must-have behavior
- no auto-delete in protected data
- show reason and risk before action
- allow safe clean by default
- require review for suspicious items
- log every cleanup event

### Exit criteria
Users can preview candidate cleanup actions, understand the evidence and uncertainty, and recover from mistakes without the app claiming that old or large automatically means unused.

---

## Phase 4 — Sync and Transfer

### Goal
Add a reliable local-device transfer flow.

### Deliverables
- device connection flow
- remote file list
- upload/download queue
- transfer status and progress
- file conflicts handling
- retry behavior for failed transfers

### Must-have behavior
- show current transfer state clearly
- validate target path and file write safety
- allow queue and resume
- maintain transfer history

### Exit criteria
Users can browse a connected device and transfer files reliably across the local network.

---

## Phase 5 — Safety Hardening and Documentation

### Goal
Ensure the app is trustworthy and maintainable before expansion.

### Deliverables
- protected path policy
- cleanup and transfer audit logs
- architecture docs
- feature docs
- module split review
- final risk review

### Must-have behavior
- no hidden destructive logic
- all user-impacting actions explain themselves
- code remains small and reviewable
- feature docs are up to date

### Exit criteria
The product is stable enough for real use and ready for broader feature expansion.

---

## Phase 6 — Multi-user Cleaner Scope

### Goal
Extend analysis beyond the signed-in profile without exposing other users' data or bypassing Windows permissions.

### Deliverables
- explicit profile picker and per-profile scan scope
- least-privilege permission/elevation flow
- inaccessible-profile reporting and audit trail
- per-user results separation and privacy review

### Exit criteria
An authorized user can scan only the selected profiles, see skipped/access-denied paths, and confirm which profiles are included before starting.

---

## Working rule for all phases

- keep each feature file focused
- keep each file under roughly 100–150 lines when practical
- separate logic from UI
- keep shared types and helpers in dedicated small modules
- only build the module set needed for the current phase
