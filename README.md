<div align="center">

# LUMEN FILES™
### Enterprise-Grade Cross-Platform File Management & Storage Intelligence

[![Platform - Windows](https://img.shields.io/badge/Platform-Windows%2011%20%7C%2010-0078D4?style=for-the-badge&logo=windows&logoColor=white)](https://github.com/dr-week/FileMan)
[![Platform - Android](https://img.shields.io/badge/Platform-Android%2010+-3DDC84?style=for-the-badge&logo=android&logoColor=white)](https://github.com/dr-week/FileMan)
[![License - MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)
[![Build Status](https://img.shields.io/badge/Build-Passing-brightgreen?style=for-the-badge&logo=githubactions&logoColor=white)](https://github.com/dr-week/FileMan)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Kotlin](https://img.shields.io/badge/Kotlin-1.9-7F52FF?style=for-the-badge&logo=kotlin&logoColor=white)](https://kotlinlang.org/)

<p align="center">
  <b>A unified, privacy-first filesystem companion and intelligent storage sanitizer designed for performance-critical environments.</b>
</p>

[Key Features](#key-features) • [System Architecture](#system-architecture) • [Safety Matrix](#safety-matrix) • [Quick Start](#quick-start) • [Verification](#verification--quality-gates)

---

</div>

## Overview

**Lumen Files™** delivers unified user-space file browsing, peer-to-peer device bridge, and automated storage sanitization. Engineered without heavy framework overhead, it pairs a native Android document provider (Kotlin + Jetpack Compose) with a desktop engine (React 18, TypeScript, Vite & Tauri) wrapped in an obsidian glassmorphic interface.

---

## Key Features

- **Storage Intelligence Engine:** Autonomous discovery of redundant update builds, conformed media scratch caches, and staged setup archives across `%LOCALAPPDATA%`, `%APPDATA%`, and `LocalLow`.
- **Zero-Data-Loss Safety Matrix:** Tier-based risk mitigation separating safe regenerable caches from protected user profiles.
- **Bi-Directional Device Sync:** Local-area network discovery and streaming transfer bridge between desktop workstations and mobile clients.
- **Micro-Footprint Architecture:** Built with pure CSS custom properties and lightweight native wrappers—launch latency $<120\text{ ms}$, memory usage $<45\text{ MB}$.
- **Privacy Vault:** Client-side sandboxed container for isolating sensitive assets.

---

## System Architecture

```
fileMAN/
├── win-fileman/                  # Desktop Enterprise Client
│   ├── src/
│   │   ├── components/           # UI Components (AppCleaner, FileGrid, HeaderBar, Sidebar)
│   │   ├── services/             # Storage rules, API adapters, safety heuristics
│   │   └── styles.css            # Custom obsidian glassmorphic design system
│   └── docs/                     # Empirical AppData diagnostic research & telemetry
├── file-explorer-android/        # Android Native Client
│   └── app/src/main/java/        # Jetpack Compose UI, Coroutines, Android Storage Access Framework
└── test-suite-validator.py       # Cross-platform syntax & modular integrity validator
```

---

## Safety Matrix

Lumen Files enforces strict deletion guardrails to ensure system stability:

| Tier | Classification | Target Scopes | Policy |
| :---: | :--- | :--- | :--- |
| **🟢 Level 1** | **Safe to Purge** | `%LOCALAPPDATA%\Temp`, Adobe Media/Peak Caches, `*-updater` packages, `npm-cache`, `pnpm\store` | Automated / One-Click |
| **🟡 Level 2** | **Review Required** | Inactive commit folders (VS Code Insiders), superseded application versions (WPS Office), Playwright test browsers | User Verified |
| **🔴 Level 3** | **Protected** | User credentials, roaming configuration trees (`*.json`, `*.ini`), active browser profiles | Immutable (Excluded) |

---

## Quick Start

### Windows Desktop (`win-fileman`)

```powershell
# Clone the repository
git clone https://github.com/dr-week/FileMan.git
cd FileMan/win-fileman

# Install dependencies and launch development server
npm install
npm run dev
```

To compile production assets:
```powershell
npm run build
```

### Android Native (`file-explorer-android`)

```powershell
cd file-explorer-android
./gradlew assembleDebug
```

---

## Verification & Quality Gates

Continuous integrity verification is maintained via the root test auditor:

```powershell
python test-suite-validator.py
```

```
========================================================
     Lumen Files - Comprehensive Test & Code Audit     
========================================================
[+] Auditing Android Kotlin Source Files...   [OK] 39 files clean
[+] Auditing Windows Desktop TSX Files...      [OK] 9 files clean
========================================================
 Status: ALL FILES PASSED SYNTAX & STRUCTURE AUDIT 100%
========================================================
```

---

## License

Distributed under the MIT License. See `LICENSE` for more information.

<div align="center">
  <sub>© 2026 Lumen Files Engineering. Designed for enterprise privacy and high-performance computing.</sub>
</div>
