# Device Sync Feature Plan

## Summary

The device sync flow enables local transfer between the Windows desktop and nearby Android or automotive systems. The product should feel fast and reliable, while keeping all writes predictable and safe.

## User value

- share files between local devices without cloud friction
- inspect remote folders and file states
- confirm transfer target before writing anything
- understand failure states and retry paths clearly

## Scope

### In scope
- connection setup to known devices
- remote folder browsing
- upload and download queue
- transfer status with progress feedback
- conflict handling for same-name files
- safety checks before overwrite

### Out of scope
- internet-based sync or cloud storage
- large peer-to-peer network orchestration
- complex multi-host file replication

## Requirements

### Connection requirements
- quick target presets and known device list
- online/offline status
- IP and port-based connection setup
- clear health and transfer state indicators

### Transfer requirements
- queue, retry, and resume behavior
- per-item progress tracking
- simple and clear transfer status steps
- conflict warnings before overwrite

### Safety requirements
- validate destination folders before write
- prevent protected path writes
- confirm before replacement or overwrite
- show transfer source and result clearly

## Current status

Status: shell exists, but transfer flow remains foundational.

Completed:
- device sync panel shell
- basic connection and status concept
- local transfer UI layout

Pending:
- safe queue system
- remote browse depth
- retries and failsafe handling
- conflict resolution workflows

## Acceptance criteria

The device sync flow is ready for the next milestone when a user can:
- connect to a nearby device
- browse remote folders reliably
- queue and monitor file transfers
- handle overwrite conflicts safely
- understand whether transfer succeeded, failed, or needs retry

## Risks and assumptions

- network reliability varies by device and environment
- local device target validation must be explicit to avoid path corruption
- file overwrite decisions must remain human-confirmed in risky scenarios

## Delivery plan

### Phase 1
- known device connection and status display
- simple file upload/download flow

### Phase 2
- folder browsing and queue handling
- progress and retry states

### Phase 3
- conflict resolution, history, and stronger validation
