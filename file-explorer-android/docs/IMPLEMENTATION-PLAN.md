# Lumen Files implementation plan

Status: proposed after a source and documentation audit on 2026-09-15. This plan is deliberately sequenced so that the SAF explorer works correctly and is testable before adding smart groups, remote providers, or destructive-operation infrastructure.

## Current-state decision

Treat the app as a **0.1 prototype**, not a feature-complete Explorer release. It has a sound privacy direction (user-selected SAF trees, no broad-storage permission, and local pins), but the current folder-navigation implementation is not valid for nested SAF directories and the release claims outpace both the code and the quality controls.

## Findings to fix first

| Priority | Finding | Evidence | Required outcome |
| --- | --- | --- | --- |
| P0 | Opening a child directory passes a document URI to `DocumentFile.fromTreeUri`. Tree URIs and child document URIs are different SAF URI forms, so nested browsing will fail or return no content depending on provider. | `ExplorerScreen.kt` opens `entry.uri`; `DocumentRepository.kt` always calls `fromTreeUri`. | Keep the granted tree URI as authority, derive child document files from that tree, and model the current directory separately from the granted root. Test multiple nesting levels with a real provider. |
| P0 | Concurrent loads can render the wrong folder. A slow earlier `open` may complete after a later one and replace `entries` without checking the active location. A mutation also always reopens the location captured when it began. | `ExplorerViewModel.kt` load success at lines 39–45; mutation refresh at lines 90–100. | Associate each load with a navigation generation/current location; discard stale results. Refresh only when the user is still viewing the affected location. |
| P1 | Delete reporting is misleading and non-actionable for partial failures. `all` stops after the first false result; the event says every selected item was deleted, clears the entire selection, and a `false` result has no error message. | `ExplorerViewModel.kt` lines 76–87. | Attempt every target, retain/identify failures, report successes and failures separately, and only clear successfully processed selections. |
| P1 | Rename can be recorded as successful when the provider returns `null`, because the repository converts `null` to the original URI. | `DocumentRepository.kt` lines 30–33; generic `runCatching` success check in `ExplorerViewModel.kt`. | Return a typed result and treat provider refusal/null as a failure with a useful message. |
| P1 | Provider capabilities are assumed, despite product docs saying actions are capability-aware. No read/write/rename/delete/trash capability is represented or used to enable actions. | `DocumentRepository.kt`; `README.md` “Do now” at line 55. | Add capability discovery to repository/domain models; hide or disable unavailable operations and explain why. |
| P1 | External file opening can crash if no application handles the MIME type. | `FileExplorerActivity.kt` starts `ACTION_VIEW` without resolving or catching failure. | Use a chooser or resolution check and surface a non-fatal user message. |
| P1 | The project cannot be built from a clean checkout using the documented command: no Gradle wrapper exists, and `../android/gradlew.bat` does not exist in this workspace. | `README.md` lines 60–66; repository inventory. | Commit the Gradle wrapper, pin the expected JDK/SDK, and make the documented command runnable from the project root. |
| P2 | The UI does not provide the promised breadcrumb/navigation-up path, locations sheet, type search, share action, or visible operation history. | `README.md` lines 9, 17–22, 48; `ExplorerScreen.kt`. | Either implement each claim or revise the 0.1 scope before release. |
| P2 | Large folders are read, mapped, filtered, and sorted in one in-memory operation; there is no pagination/cancellation strategy. | `DocumentRepository.kt` lines 10–22; `ExplorerViewModel.kt` lines 103–114. | Define a 10,000-entry performance budget, add cancellation and a loading/error model, then choose pagination or provider-query support where available. |
| P2 | Accessibility and responsive-layout claims are not verified. Controls such as the horizontal locations row have no overflow strategy, and selection state is not explicitly announced. | `ExplorerScreen.kt` lines 97–110 and 148–152; `DESIGN-SPEC.md` lines 40–42. | Add semantics, keyboard tests, TalkBack checks, narrow-width and tablet layouts, and reduced-motion behavior before calling the quality bar met. |

## Documentation corrections

Update `README.md` before the next build so it says what is true today:

- Replace “MVP implemented here” with “prototype implemented here” until nested SAF navigation, build reproducibility, and tests pass.
- Remove or mark as planned: breadcrumbs, type search, share, locations sheet, and visible operation history.
- Replace “capability-aware rename, delete and create” with the current limitation, or implement capability modeling first.
- State that deletion currently invokes permanent provider deletion; do not imply trash support.
- Correct the build instructions after adding the wrapper; the intended command should be `./gradlew.bat assembleDebug` from this directory on Windows.

Add these documents:

1. `docs/SAF-DESIGN.md` — URI/root-vs-child model, persisted-permission lifecycle, document-ID handling, capability matrix, provider error taxonomy, and permission-revocation behavior.
2. `docs/RELEASE-CHECKLIST.md` — exact build, lint, unit-test, instrumented-test, accessibility, device/provider, and release-signing gates.
3. `docs/DECISIONS.md` — concise ADRs for SAF-only scope, no broad-storage permission, metadata retention, deletion policy, and deferred providers/features.
4. `CONTRIBUTING.md` — local setup, wrapper command, code style, test expectations, and how a change updates product/docs/release claims.

## Delivery sequence

### Milestone 0 — make planning truthful and builds repeatable

1. Commit the Gradle wrapper and verify `assembleDebug` in a clean directory using JDK 17 and API 35.
2. Add a CI workflow that runs wrapper validation, compilation, unit tests, and Android lint.
3. Apply the documentation corrections above and add the release checklist.

Exit criteria: a new contributor can clone, build, and run a debug APK with one documented command; CI is green; no current capability is represented as already implemented when it is not.

### Milestone 1 — repair the SAF explorer foundation

1. Introduce a domain model that separates `GrantedTree`, `DirectoryRef`, and `DocumentRef`; never infer a child folder is another tree grant.
2. Refactor repository operations around this model and return typed outcomes (`Success`, `Unsupported`, `PermissionRevoked`, `ProviderFailure`) instead of nullable/Boolean ambiguity.
3. Make browse jobs cancellable or generation-checked; clear stale content during transitions and avoid refreshing a location the user has left.
4. Restore navigation affordances: current location, parent/up navigation constrained to the granted root, and accurate child display names.
5. Add tests for nested navigation, rapid A→B navigation, revoked permission, unreadable provider, empty directory, and provider failure.

Exit criteria: three nested levels browse reliably, a rapid navigation test cannot show stale results, and all SAF error states provide a recovery action.

### Milestone 2 — safe, capability-aware mutations

1. Query and expose read/write/create/rename/delete/trash capabilities per location/document.
2. Validate names (blank, separator/provider-invalid cases, collision policy) before mutations.
3. Replace aggregate delete with per-item results; use provider trash only when advertised, otherwise present a specific irreversible confirmation.
4. Show operation feedback in the UI, but do not call it undo/history durability until it is persisted.
5. Add tests for unsupported operations, partial delete failure, rename refusal, and cancellation/navigation during an operation.

Exit criteria: unavailable actions cannot be invoked, partial failure is visible and recoverable, and the user sees whether deletion is trash or irreversible.

### Milestone 3 — complete an honest Explorer 0.1

Choose and implement the remaining 0.1 commitments: type filters (not merely name search), share via `ACTION_SEND`/`ACTION_SEND_MULTIPLE` with URI grants, scrollable locations UI, list/grid state persistence, and a real empty/error/retry design. Add Compose UI tests and manual TalkBack/keyboard checks.

Exit criteria: every approved 0.1 item is demonstrable in the release checklist on phone and tablet; the README matches that checklist exactly.

### Milestone 4 — organize only after the explorer is trustworthy

Design the persistent operation queue with WorkManager, foreground/progress notification policy, conflict handling, cancellation, restart recovery, and provider-aware undo/trash. Establish a metadata store with URI-revocation cleanup before tags, smart rules, duplicate detection, or large-file scanning. Do not start SMB/SFTP/WebDAV or archive support until this model has an explicit provider-interface ADR and threat review.

## Planner workflow repair

The current planning has the right long-term themes but lacks a delivery-control loop. Use this workflow for every milestone:

1. Write one outcome-oriented milestone brief: user problem, explicitly in/out of scope, SAF/provider assumptions, and measurable exit criteria.
2. Convert it into thin vertical slices, each with UI behavior, repository behavior, error states, automated tests, docs impact, and manual-device matrix.
3. Record unresolved product choices as ADRs before implementation (for example, collision policy and permanent-delete wording). Do not bury them in a roadmap row.
4. Implement only slices whose acceptance tests are defined; update the release checklist and README in the same change.
5. Run CI plus the provider/device matrix; demo the acceptance criteria; then mark the slice complete. Failed/untested criteria remain planned, never “implemented.”
6. Re-plan from evidence at the end of the milestone: performance measurements, provider incompatibilities, accessibility findings, and supportability cost determine the next scope.

This corrects the key planning mistake: releases are currently feature lists without dependencies, ownership, acceptance evidence, or a distinction between promised, prototyped, and verified behavior.

