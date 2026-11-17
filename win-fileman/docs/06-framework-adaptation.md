# Framework adaptation plan

## Goal

Pull the useful styling and architecture ideas from the external web framework without importing the entire framework or locking the app into an unnecessary runtime.

The intent is to keep the premium dark-glass aesthetic, but only borrow the pieces that directly improve Lumen Files.

## Principle

We should copy the framework’s patterns, not its baggage.

That means keeping:
- the dark premium visual language
- glass panel behavior
- compact and readable information density
- modular, feature-first file organization

And avoiding:
- full framework integration
- demo-only components
- large UI utilities that do not serve this app
- over-styled decoration that hurts clarity

## Keep

These are the high-value elements to adapt:

### Visual system
- dark neutral palette with strong contrast
- soft cyan / violet accent color language
- translucent surfaces with blur
- light border glow and ambient shadow
- rounded cards and dense but readable layout spacing

### UX patterns
- short labels and clear hierarchy
- minimal noise in text-heavy panels
- summary cards and compact metadata blocks
- action-first surfaces without visual clutter

### Architecture patterns
- small feature folders
- shared contracts and type definitions
- utility modules for formatting and logic
- clear separation between view, logic and service work

## Adapt

These items should be translated into Lumen Files-native code:

### 1. Design tokens
Create local CSS variables for:
- background base
- panel surface
- panel highlight
- border glow
- accent color
- text primary / secondary
- radius scale
- spacing scale

### 2. Glass panel primitives
Turn the framework’s panel style into a reusable pattern used for:
- app shell
- sidebar cards
- explorer panels
- cleaner summary cards
- sync status and queue blocks

### 3. Compact text rules
Compress labels and reduce excess wording in UI, such as:
- Items instead of Total tracked items
- Folders instead of Folder count
- Clean instead of Start cleanup operation

### 4. Modular feature layout
Keep the architectural rule from the framework:
- one feature per folder
- one responsibility per file
- shared types in a central domain layer
- only small UI modules within each feature

## Skip

These should not be pulled in as-is:

- full CSS framework stacks
- demo pages and demo data screens
- large animation libraries for decorative effects
- app shell structures that are not relevant to this desktop app
- generic marketing layouts
- non-essential state management patterns

## Extraction workflow

### Phase 1 — Audit and classify
Review the framework and sort each file or pattern into:
- keep
- adapt
- skip

This keeps the work grounded in actual product needs.

### Phase 2 — Build a local design layer
Create a small internal layer with:
- tokens.css
- glass surface styles
- typography rules
- button and badge primitives

This gives the app a clean, consistent visual system without vendor lock-in.

### Phase 3 — Apply only to the app shell
Start with:
- top navigation
- sidebar
- main panel containers
- summary cards
- metadata blocks

Do not style every element in one pass.

### Phase 4 — Move into feature screens
Apply the design to:
- explorer list and metadata panel
- cleaner overview and risk cards
- device transfer panels and status blocks

### Phase 5 — Trim and review
Once the UI is stable, remove any design pattern that does not improve comprehension, speed, or usability.

## Recommended implementation order

1. Build the token layer and glass panel primitives
2. Refresh the app shell and navigation to match the premium dark style
3. Update the explorer panel and metadata area
4. Apply the same standards to cleaner and sync sections
5. Refine label wording and reduce UI noise
6. Keep only the patterns that improve clarity and trust

## Acceptance criteria

The framework extraction is successful when:
- the app keeps a premium dark-glass aesthetic
- the codebase remains small and local
- no heavy framework dependency is introduced
- the UI stays clear and readable
- modules remain modular and easy to replace
- the design improves product trust rather than adding decoration

## Final rule

Use the framework for inspiration and reusable structure, but keep Lumen Files grounded in its own product goals:
- file clarity
- safe cleanup
- local transfer reliability
- minimal but premium desktop UX

That is the correct balance between a polished visual direction and a maintainable engineering system.
