# Adjacent Maintenance Feature Catalog

**Research date:** 2026-11-15  
**Scope:** Features found in Windows cleaner, uninstall, driver, registry, and maintenance utilities. Product descriptions below summarize vendor claims and are not independent efficacy or safety tests.

## Product references

| Product/source | Advertised feature family | Observed pattern | Lumen Files assessment |
| --- | --- | --- | --- |
| [Windows Update driver guidance](https://support.microsoft.com/en-us/topic/0549a8d9-4842-8acb-75fa-a6faadb62507) | Driver delivery | Windows Update supplies recommended drivers; optional drivers can be selected; Microsoft points to the device maker when needed | Preferred update channel; link users to Windows Update or hardware vendor rather than installing drivers |
| [IObit Driver Booster](https://www.iobit.com/en/driver-booster.php) | Third-party driver updater | Bulk driver scan/install, large driver catalog, game optimization and restore-point/rollback claims | High system risk and supply-chain scope; do not install drivers from Lumen Files |
| [Wise Registry Cleaner](https://www.wisecleaner.com/wise-registry-cleaner.html) | Registry clean/tune | Fast/deep categories, exclusions, scheduled cleaning, registry backups, restore points, and multi-user registry cleanup in a paid edition | Do not implement registry deletion or tuning; backups do not establish that a suggested key is unnecessary |
| [Revo Uninstaller](https://www.revouninstaller.com/revo-uninstaller-free-download/) | App uninstall and leftovers | Standard uninstall followed by residue scans; forced uninstall and deeper scans are edition-dependent | Inventory and vendor-uninstaller handoff are useful; forced removal remains out of scope |
| [Bulk Crap Uninstaller](https://www.bcuninstaller.com/) | App inventory and bulk uninstall | Detects registered, Store, portable and other packages; prefers original uninstallers; also advertises leftover cleanup and forced uninstall | Model inventory breadth and evidence; never bulk-remove automatically |
| [IObit Uninstaller](https://www.iobit.com/en/advanceduninstaller.php) | Uninstall, plugins, bundles, install monitoring | Advertises leftover scans, browser extension management, install monitoring, app relocation, and forced removal | Consider read-only inventory and residue reports; install monitoring and relocation need separate design/security review |
| [IObit Software Updater](https://www.iobit.com/en/iobit-software-updater.php) | Third-party application updater | Advertises batch and scheduled updates, catalog installs, official-source downloads, and restore points | Read-only update inventory could be useful later; any installer execution needs source/signature verification and explicit approval |
| [CCleaner](https://www.ccleaner.com/ccleaner/features) | Bundled PC maintenance | Advertises startup management, app sleep, browser cleanup, software/driver updaters, duplicate/cloud scan, scheduling, recovery and system information | This breadth is a feature catalog, not a single coherent Cleaner scope; split modules by user goal and risk |

## Feature inventory

| Feature | User value | Risk | Plan |
| --- | --- | --- | --- |
| Installed software inventory | See product, publisher, version, install location, and uninstall state | Low when read-only; moderate when acting | Include as a report after storage analytics |
| Vendor-uninstaller handoff | Recover an app through its registered uninstall/repair flow | Moderate | Include after inventory; show target and ask before launch |
| Residue report | Find possible files, services, tasks, or shortcuts left by an app | High if treated as certain | Read-only evidence report only; no automatic removal |
| Startup-app inventory | Identify apps configured to launch at sign-in | Moderate | Later read-only view; actions require explicit enable/disable confirmation |
| Software-update inventory | Show installed apps with a newer official release | Moderate | Later; report version/source first, don't install automatically |
| Driver inventory | Show hardware, driver provider, version, date, and device status | Moderate | Optional system-information view; do not claim a newer driver is inherently better |
| Third-party driver install | Replace system/device drivers from an external catalog | High: compatibility, boot, network, and supply-chain impact | Exclude; send user to Windows Update or hardware manufacturer |
| Registry cleaner/tuner | Remove “orphaned” keys or alter performance/network settings | High and difficult to validate; limited direct storage benefit | Exclude registry edits and scheduled registry cleaning |
| Browser privacy cleanup | Remove history, cookies, cache, autofill or extension data | High privacy and session impact | Separate opt-in privacy feature, not part of Cleaner MVP |
| App sleep/performance optimizer | Pause background processes or change startup behavior | Moderate/high; may disrupt active work | Exclude from storage Cleaner |
| Cloud-drive cleaner | Find duplicate, old, or large remote files | High: deletes synchronized copies across devices | Later, separate cloud product area with provider-native trash/restore semantics |
| File recovery | Attempt recovery of deleted data | High and can overwrite recoverable data | Separate workflow; never combine with cleanup |
| Secure shredder | Make deleted data harder to recover | High and irreversible, especially on SSD/cloud storage | Exclude |
| Disk defrag/optimizer | Rearrange or tune storage | System-managed, device-dependent behavior | Exclude; do not duplicate Windows storage maintenance |
| Scheduled automatic cleanup | Run chosen rules on a cadence | High when the scan scope or rule changes | Defer until scanning, exclusions, audit history, and rollback are proven |
| Hardware/system information | Show drive/device capacity, model, health signals | Low when read-only, but health diagnosis may overclaim | Include only factual inventory fields and source/age of each signal |

## Lumen Files product boundary

### Include in the storage product plan

1. Disk usage map, folder ranking, and per-category storage accounting.
2. Read-only duplicate and age reports with user-selected scope.
3. Installed-app inventory with publisher/version/path evidence.
4. Broken/unavailable shortcut report that distinguishes an offline target from a confirmed missing target.
5. Vendor-first uninstall/repair guidance, including Adobe's own recovery instructions.
6. Later reversible cleanup operations with exact-path preview and history.

### Defer or exclude

- **Driver updater:** keep driver delivery in Windows Update or the hardware manufacturer's official tool. Microsoft recommends Windows Update for recommended drivers and points to the device maker if a driver is unavailable.
- **Registry cleaner:** don't delete or tune registry entries as a space-saving operation. The Windows registry is configuration/state storage, and a scanner cannot infer a key is safe to remove from “orphaned” appearance alone.
- **Forced uninstaller:** never replace a failed vendor uninstall with blind deletion of Program Files, services, tasks, or registry keys.
- **Automatic updates and cleanup:** defer until source authenticity, signatures, restore behavior, and user consent are designed and tested.
- **Privacy cleanup, app sleep, cloud deletion, recovery, and shredding:** separate from disk-space analysis because their effects and recovery models differ.

## Recommended sequencing

1. Storage scanner and truthful visualization.
2. Duplicate, age, shortcut, and app-inventory reports (read-only).
3. Vendor-uninstaller handoff and evidence-based leftover reports.
4. Reversible cleanup with preview and history.
5. Separate product decisions for software updates, privacy, cloud actions, or other high-impact maintenance; no driver or registry modification in this roadmap.

## Sources

- [Microsoft: Automatically get recommended and updated hardware drivers](https://support.microsoft.com/en-us/topic/0549a8d9-4842-8acb-75fa-a6faadb62507)
- [Microsoft Learn: About the Registry](https://learn.microsoft.com/en-us/windows/win32/sysinfo/about-the-registry)
- [IObit Driver Booster](https://www.iobit.com/en/driver-booster.php)
- [Wise Registry Cleaner](https://www.wisecleaner.com/wise-registry-cleaner.html)
- [Revo Uninstaller](https://www.revouninstaller.com/revo-uninstaller-free-download/)
- [Bulk Crap Uninstaller](https://www.bcuninstaller.com/)
- [IObit Uninstaller](https://www.iobit.com/en/advanceduninstaller.php)
- [IObit Software Updater](https://www.iobit.com/en/iobit-software-updater.php)
- [CCleaner feature overview](https://www.ccleaner.com/ccleaner/features)