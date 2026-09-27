@echo off
setlocal
cd /d "%~dp0file-explorer-android"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0file-explorer-android\build-apk.ps1" %*
if %ERRORLEVEL% neq 0 (
    echo.
    echo [!] Build script exited with error code %ERRORLEVEL%
    exit /b %ERRORLEVEL%
)
