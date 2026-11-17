# Safety and Guardrails Plan

## Summary

Safety is a first-class product requirement. The app must show clear evidence for why an item is considered safe, risky, or protected before any destructive action is triggered.

## User value

- feel safe trusting cleanup actions
- understand why an item is suggested for deletion
- avoid accidental removal of user content or active system state
- recover from mistakes with restore or quarantine paths

## Scope

### In scope
- protected path policy
- safe, caution, and protected risk tiers
- review requirements for destructive flows
- preflight checks and delete explanation
- restore and rollback capabilities

### Out of scope
- full system hardening beyond the app’s local cleanup scope
- unsupported uninstall logic for arbitrary software

## Requirements

### Protection requirements
- protect active user directories and generated content by default
- block destructive actions for active system paths
- require explicit review for all non-safe categories
- display the reason and path for flagged items

### Risk model
- safe: regenerable cache or stale app payloads
- caution: stale versions or review-required app data
- protected: active profiles, user content, and system areas

### Operational rules
- scan before delete
- preview before execute
- quarantine before purge when review is required
- skip locked or in-use files
- log every cleanup action and restore path

## Current status

Status: prototype policy partly enforced; native path and filesystem validation are not implemented.

Completed:
- safe/review/protected concept
- protected items cannot be selected in the UI or included by the cleanup planner
- caution-tier sample items start unselected and require user opt-in
- sample and simulated behavior is disclosed in the cleaner UI

Pending:
- validation of resolved paths, reparse points, active processes, and file locks
- real quarantine, restore history, and recovery after app restart
- persistent audit logs and operation-level failure reporting

## Acceptance criteria

The safety system is ready when a user can:
- tell why an item is flagged
- see whether the action is safe or review-required
- confirm before any destructive step
- recover a cleaned item if the app supports quarantine or restore

## Risks and assumptions

- user expectations vary between “cache cleanup” and “safe file management”
- local file systems can contain mixed content in the same folder
- a robust policy must prioritize explanation over convenience

## Delivery plan

### Phase 1
- protected path definitions
- explicit safety tiering

### Phase 2
- in-app confirmation and review actions
- quarantine and restore flow

### Phase 3
- final safety audit and policy enforcement review
