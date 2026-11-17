# Navigation and Drawer UX Research

## Summary

For the current milestone, the app should treat Library and Drive as the same underlying file workspace. They are both entry points into the same local content model, and the difference should be in presentation rather than underlying data structure.

This keeps the product simple while the file manager is still in its early state.

## Research conclusion

The most effective pattern for a desktop productivity app like Lumen Files is:

- a slim left-side drawer for primary destinations
- a shallow, single-level submenu for grouped views
- short labels that match user intent
- no deep nesting beyond one submenu level

This pattern reduces navigation cost, keeps the interface calm, and supports quick switching between app sections.

## Why Drive and Library should align for now

At the moment the product is centered on local browsing and cleanup, not large multi-root document systems. Library and Drive both represent the same core experience: a user views local files and folders in a structured way.

For v1, we should treat them as:

- Drive = the main local storage view
- Library = a contextual grouping of common file views

The actual file-source backend remains the same, with different labels or filters applied in the UI.

## Recommended menu model

### Primary entries
- Drive
- Library
- Sync
- Vault
- Clean

### Library submenu options
- Overview
- Recent
- Projects
- Shared

This is shallow, legible, and extensible. It avoids overloading the user with too many top-level items while making each destination clearly understandable.

## Design guidance

### Keep labels short
Prefer labels like:
- Drive
- Library
- Sync
- Clean

Avoid heavy labels like:
- Local File Index
- Storage Management Overview
- Connected Device Transfer Queue

Short labels reduce cognitive load and work better in a compact desktop drawer.

### Limit tree depth
The drawer should not become a file browser itself. The goal is to help users move between app sections, not to mirror the filesystem.

Recommended maximum depth:
- level 1: app destination
- level 2: grouped views inside Library or Sync
- no deeper nesting unless the app grows significantly

### Use status badges sparingly
Use badges only for simple delivery-state signals, such as:
- API for sync
- 24.1G for storage cleanup
- online/offline for connected device status

Badges are useful when they summarize real state. They should not become clutter.

## Product recommendation for current build

For now, the most defensible approach is:

1. Keep Library and Drive mapped to the same workspace root.
2. Let the app treat Library as a filtered or grouped view of the same content.
3. Use Library submenu items to create a sense of organization without introducing duplicate backend paths.
4. In future phases, if the app expands to multiple source roots, split the data model more formally.

## Acceptance criteria

The navigation is successful when a user can:

- understand the main app destinations in a glance
- tell that Library and Drive are related without confusion
- reach common file views in one click
- keep the drawer focused on product flow rather than raw file structure

## Recommended implementation note

The current UX should not imply that Library and Drive are separate data stores unless the product is actually designed to support that. Until then, they should act as two presentation layers of the same workspace.
