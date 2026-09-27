@echo off
setlocal
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0build-apk.ps1" %*
if %ERRORLEVEL% neq 0 (
    echo.
    echo [!] Build script exited with error code %ERRORLEVEL%
    exit /b %ERRORLEVEL%
)
