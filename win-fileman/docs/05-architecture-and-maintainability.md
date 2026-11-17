# Architecture and Maintainability Plan

## Summary

The product must remain modular and easy to review as it grows. The architecture should favor small features, clear contracts, and shared guardrails over large, hard-to-maintain components.

## User value

- faster enhancement without breaking existing flows
- easier onboarding for new contributors
- simpler testing and verification
- clearer boundaries for safe destructive actions

## Scope

### In scope
- feature-by-feature modular structure
- shared types and formatter utilities
- review-friendly file size and responsibility rules
- testable rules and execution boundaries

### Out of scope
- broad framework migration for its own sake
- speculative abstraction before the feature has a stable shape

## Requirements

### Module requirements
- one module should do one primary job
- UI rendering should be separated from service logic and rule logic
- shared contracts should live in central type files
- avoid deeply nested cross-feature coupling

### File size guidance
- keep most feature modules around 100–150 lines when practical
- split complex logic into specific helper modules
- prefer readable small files over large single-purpose containers

## Current status

Status: modular foundation is active and improving.

Completed:
- shared types and format utilities
- feature-based folders for explorer, cleaner, and sync
- staged UI views and smaller modules

Pending:
- deeper file split for bigger rules and service layers
- more tests around safety and execution logic

## Acceptance criteria

The architecture is healthy when:
- a developer can understand a feature from a small set of files
- a new change is isolated to the relevant feature area
- tests can validate rules without broad UI coupling
- destructive actions remain behind safety boundaries and reviews

## Risks and assumptions

- if features grow too quickly without review, module boundaries can drift
- abstraction should happen only after a stable workflow is proven
- keep the design simple enough to remain understandable by test and review

## Delivery plan

### Phase 1
- finalize shared types and small utilities
- keep explorer, cleaner, and sync modules separate

### Phase 2
- split rule logic and execution flows more deeply
- confirm tests for summary and safety behavior

### Phase 3
- finalize maintainability and documentation review before expansion
