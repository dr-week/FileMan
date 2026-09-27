# Lumen Files

A cross-platform file management and intelligent disk sanitation suite featuring a native Android file explorer (Kotlin + Jetpack Compose) and a high-performance Windows desktop companion (React, TypeScript, Vite & Tauri).

---

## Architecture

| Component | Stack | Highlights |
| :--- | :--- | :--- |
| **`win-fileman`** | React 18, TypeScript, Vite, Tauri | Obsidian-themed desktop UI, App Cleaner engine, 3-tier safety matrix, LAN Wi-Fi device pairing. |
| **`file-explorer-android`** | Kotlin, Jetpack Compose, Coroutines | Native Android document provider, smooth navigation, modular components. |
| **Diagnostics & Tests** | Python (`test-suite-validator.py`), PowerShell | Automated syntax, brace balance, and multi-platform integrity audits. |

---

## Key Achievements & Features

### 1. Smart AppData Cleaner & Storage Optimizer
- **Live User-Space Diagnostics:** Scans and analyzes hidden redundancy across `%LOCALAPPDATA%`, `%APPDATA%`, and `LocalLow`.
- **3-Tier Safety Matrix:**
  - **Level 1 (Safe to Clean):** Temporary scratch files, regenerable Adobe media/peak caches, lingering updater packages (`*-updater`), and package manager caches (`pnpm`, `npm`).
  - **Level 2 (Needs Review):** Stale multi-version build directories from auto-updates (e.g., historical commit folders in VS Code Insiders, prior WPS Office builds).
  - **Level 3 (Protected):** User preferences, active browser profiles, and critical application settings remain strictly untouched.
- **Visual Analytics:** Interactive storage breakdown, category filters, and single-click safe reclamation.

### 2. High-Performance Companion Interface
- Dark obsidian and glassmorphic UI built with pure CSS custom properties—zero heavy UI framework bloat.
- Instant search, responsive file grid, and real-time LAN device synchronization status.

---

## Getting Started

### Windows Companion (`win-fileman`)
```powershell
cd win-fileman
npm install
npm run dev        # Run web UI preview
npm run build      # Validate TypeScript & bundle production assets
```

### Automated Codebase Audit
From repository root:
```powershell
python test-suite-validator.py
```

---

## Roadmap

- [ ] Native Rust Recycle Bin integration via Tauri shell commands.
- [ ] On-device decision classifier integration (System 1 edge decision engine).
- [ ] End-to-end Wi-Fi P2P file transfer and synchronization between Android and Windows.
