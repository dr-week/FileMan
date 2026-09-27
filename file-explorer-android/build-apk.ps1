# ==============================================================================
# Lumen Files - Automated APK Builder & Packaging Script
# ==============================================================================
# Usage:
#   .\build-apk.ps1               Builds Debug APK (default)
#   .\build-apk.ps1 -Release      Builds Release APK
#   .\build-apk.ps1 -InstallDeps  Attempts to auto-install JDK 17 via Winget
# ==============================================================================

param (
    [switch]$Release,
    [switch]$InstallDeps
)

$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
Set-Location $ScriptDir

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "         Lumen Files - Android APK Packaging            " -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan

# ------------------------------------------------------------------------------
# 1. Dependency Installation (If -InstallDeps requested)
# ------------------------------------------------------------------------------
if ($InstallDeps) {
    Write-Host "[+] Attempting automated installation of OpenJDK 17 via Winget..." -ForegroundColor Yellow
    try {
        winget install Microsoft.OpenJDK.17 --accept-package-agreements --accept-source-agreements
        Write-Host "[✓] OpenJDK 17 installed. Please restart your terminal if environment variables need refreshing." -ForegroundColor Green
    } catch {
        Write-Host "[!] Failed to auto-install via Winget. Please install manually." -ForegroundColor Red
    }
}

# ------------------------------------------------------------------------------
# 2. Locate Java Development Kit (JDK 17+)
# ------------------------------------------------------------------------------
$JavaExe = $null

if ($env:JAVA_HOME -and (Test-Path "$env:JAVA_HOME\bin\java.exe")) {
    $JavaExe = "$env:JAVA_HOME\bin\java.exe"
    Write-Host "[✓] Found JAVA_HOME: $env:JAVA_HOME" -ForegroundColor Green
} else {
    # Check common JDK locations
    $PossibleJavaPaths = @(
        "$ScriptDir\.jdk\*\bin\java.exe",
        "$ScriptDir\.jdk\bin\java.exe",
        "C:\Program Files\Microsoft\jdk-17*\bin\java.exe",
        "C:\Program Files\Java\jdk-17*\bin\java.exe",
        "C:\Program Files\Java\jdk*\bin\java.exe",
        "C:\Program Files\Android\Android Studio\jbr\bin\java.exe",
        "$env:LOCALAPPDATA\Android\Sdk\jbr\bin\java.exe",
        "C:\Program Files\Eclipse Adoptium\jdk-17*\bin\java.exe"
    )

    foreach ($Pattern in $PossibleJavaPaths) {
        $Match = Get-Item $Pattern -ErrorAction SilentlyContinue | Select-Object -First 1
        if ($Match) {
            $JavaExe = $Match.FullName
            $JdkHome = Split-Path -Parent (Split-Path -Parent $JavaExe)
            $env:JAVA_HOME = $JdkHome
            Write-Host "[✓] Auto-detected JDK at: $JdkHome" -ForegroundColor Green
            break
        }
    }
}

if (-not $JavaExe) {
    # Check if java is on system path
    $JavaCmd = Get-Command java -ErrorAction SilentlyContinue
    if ($JavaCmd) {
        $JavaExe = $JavaCmd.Source
        Write-Host "[✓] Found Java in PATH: $JavaExe" -ForegroundColor Green
    }
}

# ------------------------------------------------------------------------------
# 3. Locate Android SDK
# ------------------------------------------------------------------------------
$AndroidSdkDir = $null

if ($env:ANDROID_HOME -and (Test-Path $env:ANDROID_HOME)) {
    $AndroidSdkDir = $env:ANDROID_HOME
} elseif ($env:ANDROID_SDK_ROOT -and (Test-Path $env:ANDROID_SDK_ROOT)) {
    $AndroidSdkDir = $env:ANDROID_SDK_ROOT
} else {
    $PossibleSdkPaths = @(
        "$ScriptDir\.sdk",
        "$ScriptDir\..\.sdk",
        "$env:LOCALAPPDATA\Android\Sdk",
        "C:\Android\sdk",
        "C:\Users\Public\Android\sdk"
    )

    foreach ($Path in $PossibleSdkPaths) {
        if (Test-Path $Path) {
            $AndroidSdkDir = $Path
            $env:ANDROID_HOME = $Path
            Write-Host "[✓] Auto-detected Android SDK at: $Path" -ForegroundColor Green
            break
        }
    }
}

# Ensure local.properties exists with sdk.dir
if ($AndroidSdkDir) {
    $EscapedSdkPath = $AndroidSdkDir.Replace("\", "\\")
    $LocalPropsPath = Join-Path $ScriptDir "local.properties"
    "sdk.dir=$EscapedSdkPath" | Out-File -FilePath $LocalPropsPath -Encoding utf8 -Force
}

# ------------------------------------------------------------------------------
# 4. Environment Sanity Check & Guidance
# ------------------------------------------------------------------------------
if (-not $JavaExe -or -not $AndroidSdkDir) {
    Write-Host "`n[!] Missing Prerequisite Build Tools:" -ForegroundColor Yellow
    if (-not $JavaExe) {
        Write-Host "    - JDK 17 (Java Development Kit) is missing." -ForegroundColor Red
    }
    if (-not $AndroidSdkDir) {
        Write-Host "    - Android SDK is missing." -ForegroundColor Red
    }

    Write-Host "`n--------------------------------------------------------" -ForegroundColor DarkGray
    Write-Host " QUICK FIX & INSTALLATION STEPS:" -ForegroundColor Cyan
    Write-Host "--------------------------------------------------------" -ForegroundColor DarkGray
    Write-Host " 1. To install JDK 17 automatically, run:" -ForegroundColor White
    Write-Host "    winget install Microsoft.OpenJDK.17" -ForegroundColor Yellow
    Write-Host "`n 2. To install Android SDK & Studio, run:" -ForegroundColor White
    Write-Host "    winget install Google.AndroidStudio" -ForegroundColor Yellow
    Write-Host "`n 3. Alternatively, run this script with -InstallDeps flag:" -ForegroundColor White
    Write-Host "    .\build-apk.ps1 -InstallDeps" -ForegroundColor Yellow
    Write-Host "--------------------------------------------------------`n" -ForegroundColor DarkGray

    if (-not $InstallDeps) {
        Write-Host "[!] Build aborted due to missing JDK/Android SDK binaries." -ForegroundColor Red
        exit 1
    }
}

# ------------------------------------------------------------------------------
# 5. Execute Gradle Build Task
# ------------------------------------------------------------------------------
$Task = if ($Release) { "assembleRelease" } else { "assembleDebug" }
Write-Host "`n[+] Starting Gradle build task: $Task..." -ForegroundColor Cyan

$GradleCmd = Join-Path $ScriptDir "gradlew.bat"
if (-not (Test-Path $GradleCmd)) {
    Write-Host "[!] gradlew.bat not found in $ScriptDir" -ForegroundColor Red
    exit 1
}

& $GradleCmd $Task --stacktrace

if ($LASTEXITCODE -ne 0) {
    Write-Host "[!] Gradle build failed with exit code $LASTEXITCODE" -ForegroundColor Red
    exit $LASTEXITCODE
}

# ------------------------------------------------------------------------------
# 6. Process & Copy Generated APK Output
# ------------------------------------------------------------------------------
$BuildVariant = if ($Release) { "release" } else { "debug" }
$ApkSource = Join-Path $ScriptDir "app\build\outputs\apk\$BuildVariant\app-$BuildVariant.apk"
$DistDir = Join-Path $ScriptDir "dist"

if (Test-Path $ApkSource) {
    if (-not (Test-Path $DistDir)) {
        New-Item -ItemType Directory -Path $DistDir | Out-Null
    }

    $Timestamp = Get-Date -Format "yyyyMMdd-HHmm"
    $ApkDestName = "LumenFiles-v0.1.0-$BuildVariant.apk"
    $ApkDest = Join-Path $DistDir $ApkDestName

    Copy-Item -Path $ApkSource -Destination $ApkDest -Force

    $Hash = (Get-FileHash -Path $ApkDest -Algorithm SHA256).Hash
    $SizeMb = [math]::Round(((Get-Item $ApkDest).Length / 1MB), 2)

    Write-Host "`n========================================================" -ForegroundColor Green
    Write-Host "         BUILD SUCCESSFUL - APK GENERATED               " -ForegroundColor Green
    Write-Host "========================================================" -ForegroundColor Green
    Write-Host " Output File : $ApkDest" -ForegroundColor White
    Write-Host " File Size   : $SizeMb MB" -ForegroundColor White
    Write-Host " SHA-256     : $Hash" -ForegroundColor White
    Write-Host "========================================================`n" -ForegroundColor Green
} else {
    Write-Host "[!] Expected APK output not found at $ApkSource" -ForegroundColor Red
    exit 1
}
