# Lumen Files design specification

## North star

An Android file manager should make a large, messy personal filesystem feel legible. Its visual language is warm, quiet and tactile; its interaction model is direct and unsurprising. Beauty is earned by hierarchy, motion restraint and excellent empty/error states—not decorative complexity.

## Screen system

| Context | Phone | Tablet / foldable |
| --- | --- | --- |
| Browse | One content pane, location chips exposed on demand | Persistent location rail plus content pane |
| Transfer | Selection mode with action bar and reversible operation queue | Two panes with explicit source/destination focus |
| Grouping | Segmented list/grid/gallery controls | Same controls plus preview pane |

Use Material 3 semantic colors, 8dp spacing rhythm, 14–18sp readable text, 48dp minimum touch targets and system dynamic color where it does not harm contrast. Thumbnails must never block folder navigation.

## File grouping model

Groups are views, not relocations. A file can belong to several user-visible groups without changing its underlying URI or folder:

- **Places:** pinned user-granted roots and recent locations.
- **Kinds:** images, video, audio, documents, archives, apps and folders.
- **Signals:** recent, large, duplicate candidates, untagged and downloads.
- **Tags:** explicit user labels stored by stable document URI plus a display-name fallback; URI revocation must degrade gracefully.

Smart rules run on-device and show why a file appears. They must be reviewable, removable and never silently move/delete content.

## Operation guarantees

- All mutations enter a durable operation queue before execution.
- Copy/move shows source, destination, conflict policy and progress.
- A completed operation records enough metadata to offer undo where the provider supports it.
- Deletion defaults to the provider's trash/recycle behavior if available; otherwise it requires an explicit destructive confirmation.
- Transfer verification uses size and, where feasible, a content hash.

## Provider boundaries

The initial SAF provider is authoritative for user-granted trees. Future providers use the same `ExplorerProvider` interface and expose capabilities (read, write, rename, trash, thumbnail, streaming) rather than assuming a Unix path. SMB/SFTP/WebDAV credentials remain encrypted in Android Keystore-backed storage.

## Accessibility and quality bar

Every icon has a label, selection status is announced, keyboard navigation works with physical keyboards, color never communicates state alone, and motion obeys the system reduced-motion setting. Test on a narrow phone, a large tablet, offline/removable storage, permission revocation, provider errors and 10,000-entry folders.
