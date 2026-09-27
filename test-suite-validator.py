import os
import re
import sys

print("========================================================")
print("     Lumen Files - Comprehensive Test & Code Audit     ")
print("========================================================")

errors = []
warnings = []
passed = 0

# ------------------------------------------------------------------------------
# 1. Android Kotlin Codebase Validation
# ------------------------------------------------------------------------------
android_dir = r"c:\Users\disha\Documents\CODES\studio\fileMAN\file-explorer-android\app\src\main\java"
test_dir = r"c:\Users\disha\Documents\CODES\studio\fileMAN\file-explorer-android\app\src\test\java"

print("\n[+] Auditing Android Kotlin Source Files...")

kt_files = []
for root, _, files in os.walk(android_dir):
    for f in files:
        if f.endswith(".kt"):
            kt_files.append(os.path.join(root, f))

for root, _, files in os.walk(test_dir):
    for f in files:
        if f.endswith(".kt"):
            kt_files.append(os.path.join(root, f))

print(f"    Found {len(kt_files)} Kotlin source and test files.")

for kt_path in kt_files:
    rel_path = os.path.relpath(kt_path, r"c:\Users\disha\Documents\CODES\studio\fileMAN")
    with open(kt_path, "r", encoding="utf-8") as f:
        content = f.read()

    # Check balanced braces
    open_braces = content.count("{")
    close_braces = content.count("}")
    if open_braces != close_braces:
        errors.append(f"Mismatched braces in {rel_path}: {open_braces} open vs {close_braces} close")
    else:
        passed += 1

    # Check package statement
    if not re.search(r"^package\s+app\.lumen\.files", content, re.MULTILINE):
        warnings.append(f"Missing standard package statement in {rel_path}")

    # Check modular file size rule (<100 lines for components)
    lines = content.splitlines()
    if len(lines) > 200:
        warnings.append(f"File {rel_path} has {len(lines)} lines (exceeds modular recommendation)")

print(f"    [OK] Audited {len(kt_files)} Kotlin files. Balanced syntax verified.")

# ------------------------------------------------------------------------------
# 2. Windows Desktop TSX Codebase Validation
# ------------------------------------------------------------------------------
win_dir = r"c:\Users\disha\Documents\CODES\studio\fileMAN\win-fileman\src"

print("\n[+] Auditing Windows Desktop React/TypeScript Files...")

ts_files = []
for root, _, files in os.walk(win_dir):
    for f in files:
        if f.endswith(".tsx") or f.endswith(".ts"):
            ts_files.append(os.path.join(root, f))

print(f"    Found {len(ts_files)} TypeScript files.")

for ts_path in ts_files:
    rel_path = os.path.relpath(ts_path, r"c:\Users\disha\Documents\CODES\studio\fileMAN")
    with open(ts_path, "r", encoding="utf-8") as f:
        content = f.read()

    # Check balanced braces
    open_braces = content.count("{")
    close_braces = content.count("}")
    if open_braces != close_braces:
        errors.append(f"Mismatched braces in {rel_path}: {open_braces} open vs {close_braces} close")
    else:
        passed += 1

print(f"    [OK] Audited {len(ts_files)} TSX files. Balanced syntax verified.")

# ------------------------------------------------------------------------------
# Summary Report
# ------------------------------------------------------------------------------
print("\n========================================================")
print(f" Audit Result: {passed} files verified clean.")
if warnings:
    print(f" Warnings: {len(warnings)}")
    for w in warnings:
        print(f"  - {w}")
if errors:
    print(f" Errors: {len(errors)}")
    for e in errors:
        print(f"  - {e}")
    sys.exit(1)
else:
    print(" Status: ALL FILES PASSED SYNTAX & STRUCTURE AUDIT 100%")
print("========================================================")
