# App Remnants and Shortcut Cleanup Plan

**Status:** Research and requirements; no app inventory, .lnk resolver, or remnant cleaner is implemented.

## Adobe uninstall recovery case

If an Adobe suite cannot be removed through Creative Cloud or its registered uninstaller, deleting Program Files manually is a risky last resort. It can leave installer records, services, scheduled tasks, shared components, file associations, start-menu entries, shortcuts, licensing state, and per-user settings behind. Adobe's Creative Cloud Cleaner Tool is intended for experienced users resolving corrupted installations or removing older Adobe software; Adobe advises closing apps and backing up content, settings, and presets first.

Lumen Files should guide the user to the vendor uninstaller/repair flow first. It may report candidate remnants after an uninstall, but must not claim a directory is orphaned simply because an app folder or shortcut target is missing.

## Evidence model for application remnants

Each finding should include the evidence and confidence:

- **Installed app:** registered uninstall record or Windows package registration.
- **Broken uninstall record:** registered entry but missing install location or uninstaller; open system app settings or present vendor recovery instructions.
- **Possible leftover:** app-related path remains after an uninstall record is absent; manual review only.
- **Shared component:** file/path may belong to more than one product; protected by default.
- **User data/configuration:** preferences, projects, presets, libraries, sync state, databases, or license data; never classify as disposable by path name alone.

Potential correlators include uninstall registry metadata, package inventory, signed executable publisher, known product manifests, service/task references, and shortcut target paths. This correlation should remain read-only during analysis; do not execute uninstallers or modify registry/services as part of a scan.

## Broken shortcuts

Windows `.lnk` files are Shell Link objects, not plain text paths. They can carry a target, working directory, arguments, icon data, and shell item identifiers; Windows may also resolve moved targets through link tracking. A missing target during one scan can mean a removable drive is disconnected, a network share is offline, a cloud provider is unavailable, or Windows has not resolved the link yet.

Proposed workflow:

1. Scan only explicitly selected Desktop and Start Menu locations, for the current user by default.
2. Resolve shortcuts with the Windows Shell Link API without displaying modal resolution dialogs.
3. Show shortcut path, resolved target, target status, and whether the target is local, removable, network, shell namespace, or unknown.
4. Label uncertain/unavailable targets “Could not verify,” not “broken.”
5. Never delete or rewrite a shortcut automatically. Offer open location, recheck, and user-confirmed move-to-recycle-bin only after verification.

Deleting a `.lnk` removes only the shortcut, not its target; the UI must say that plainly.

## All-user and privilege boundary

The initial scan is current-user only. Scanning every profile can expose personal file names and requires crossing Windows ACL boundaries; it must be a separate opt-in workflow, ideally per selected profile. Do not silently elevate the app or attempt to bypass permissions. Ask for the minimum required consent at the operation boundary, preserve the account identity, skip inaccessible folders, and audit what profile/path was scanned.

System locations, Windows Installer data, shared runtimes, drivers, services, scheduled tasks, registry entries, and files referenced by another registered product are protected. “Uninstall leftovers” are review candidates, never a generic delete category.

## Action policy

- Prefer Windows Installed Apps or the registered vendor uninstaller.
- Do not reproduce forced uninstall or registry-cleaner behavior in the initial scope.
- Any actual cleanup requires exact-path preview, backups or recycle-bin recovery where possible, and a per-item confirmation.
- If safe recovery is not available, show instructions or export a report instead of deleting.

## Research references

- [Adobe Creative Cloud Cleaner Tool preparation](https://helpx.adobe.com/creative-cloud/kb/cc-cleaner-tool-installation-problems.html): intended for experienced users in corrupted-install scenarios and calls out backups and closing processes.
- [Bulk Crap Uninstaller](https://www.bcuninstaller.com/): application inventory from multiple sources and vendor-uninstaller-first automation; demonstrates why app removal is a separate, high-risk workflow.
- [Revo Uninstaller](https://www.revouninstaller.com/revo-uninstaller-free-download/): standard uninstall followed by a leftovers scan; forced uninstall and deeper cleanup are edition-dependent.
- [Microsoft Shell Links documentation](https://learn.microsoft.com/en-us/windows/win32/shell/links): `.lnk` format, target resolution, link tracking, and the fact that a link file is distinct from its target.