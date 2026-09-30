@echo off
setlocal EnableExtensions EnableDelayedExpansion
cd /d "%~dp0"

REM ============================================================
REM
REM  FIREBASE DEPLOY TOOL
REM  PowerShell-rendered colors for reliable Windows console output
REM
REM ============================================================

REM UTF-8 for box drawing and Unicode characters
chcp 65001 >nul

set "CONFIG_FILE=%~dp0public\assets\js\config.js"
set "CHANGELOG_FILE=%~dp0public\changelog\CHANGELOG.txt"
set "LAST_VERSION_FILE=%~dp0.last-deployed-version"

REM ============================================================
REM  CHECK POWERSHELL
REM ============================================================

where powershell >nul 2>&1
if errorlevel 1 (
    echo.
    echo PowerShell is required for this deployment script.
    echo.
    pause
    exit /b 1
)

REM ============================================================
REM  FUNCTIONS
REM ============================================================

goto :MAIN


:PSECHO
REM Usage: call :PSECHO Color "Text"
powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "Write-Host '%~2' -ForegroundColor %~1"
exit /b


:PSECHOBOLD
REM Usage: call :PSECHOBOLD Color "Text"
powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "$Host.UI.RawUI.ForegroundColor='%~1'; Write-Host '%~2'; $Host.UI.RawUI.ForegroundColor='Gray'"
exit /b


:PSECHO2
REM Usage: call :PSECHO2 Color "Text"
powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "Write-Host ''; Write-Host '%~2' -ForegroundColor %~1"
exit /b


:PROGRESS
REM Usage: call :PROGRESS Percent "Message"

powershell.exe -NoProfile -ExecutionPolicy Bypass -Command ^
"$p=%~1; $m='%~2'; $width=52; $filled=[math]::Floor($width*$p/100); $empty=$width-$filled; $bar=('█'*$filled)+('─'*$empty); [Console]::SetCursorPosition(0,[Console]::CursorTop); [Console]::Write((' '*120)); [Console]::SetCursorPosition(0,[Console]::CursorTop); Write-Host ('  [' + $bar + '] ') -NoNewline -ForegroundColor Cyan; Write-Host (($p.ToString() + '%').PadLeft(4)) -NoNewline -ForegroundColor White; Write-Host ('  ' + $m) -NoNewline -ForegroundColor Gray"

exit /b


:PROGRESSOK
REM Usage: call :PROGRESSOK Percent "Message"

powershell.exe -NoProfile -ExecutionPolicy Bypass -Command ^
"$p=%~1; $m='%~2'; $width=52; $filled=[math]::Floor($width*$p/100); $empty=$width-$filled; $bar=('█'*$filled)+('─'*$empty); [Console]::SetCursorPosition(0,[Console]::CursorTop); [Console]::Write((' '*120)); [Console]::SetCursorPosition(0,[Console]::CursorTop); Write-Host ('  [' + $bar + '] ') -NoNewline -ForegroundColor Green; Write-Host (($p.ToString() + '%').PadLeft(4)) -NoNewline -ForegroundColor White; Write-Host ('  ✓ ' + $m) -NoNewline -ForegroundColor Green"

exit /b


:CENTER
REM Usage: call :CENTER Color "Text"

powershell.exe -NoProfile -ExecutionPolicy Bypass -Command ^
"$w=$Host.UI.RawUI.WindowSize.Width; $t='%~2'; $pad=[math]::Max(0,[math]::Floor(($w-$t.Length)/2)); Write-Host ((' '*$pad)+$t) -ForegroundColor %~1"

exit /b


:MAIN

cls

REM ============================================================
REM  HEADER
REM ============================================================

echo.

call :PSECHOBOLD Cyan "  ███████╗██╗██████╗ ███████╗██████╗  █████╗ ███████╗███████╗"
call :PSECHO Cyan      "  ██╔════╝██║██╔══██╗██╔════╝██╔══██╗██╔══██╗██╔════╝██╔════╝"
call :PSECHO Cyan      "  █████╗  ██║██████╔╝█████╗  ██████╔╝███████║███████╗█████╗ "
call :PSECHO Cyan      "  ██╔══╝  ██║██╔══██╗██╔══╝  ██╔══██╗██╔══██║╚════██║██╔══╝ "
call :PSECHO Cyan      "  ██║     ██║██║  ██║███████╗██████╔╝██║  ██║███████║███████╗"
call :PSECHO Cyan      "  ╚═╝     ╚═╝╚═╝  ╚═╝╚══════╝╚═════╝ ╚═╝  ╚═╝╚══════╝╚══════╝"                                                          

echo.

call :PSECHO White "                             FIREBASE"
call :PSECHO Gray  "                  Automated Deployment Utility"

echo.

call :PSECHO Cyan "  ============================================================"

echo.

REM ============================================================
REM  INITIAL PROGRESS
REM ============================================================

call :PROGRESS 0 "Initializing deployment checks..."

timeout /t 1 /nobreak >nul

REM ============================================================
REM  CHECK DEPLOYMENT FILES
REM ============================================================

call :PROGRESS 20 "Checking deployment files..."

if not exist "%CONFIG_FILE%" (

    echo.
    call :PSECHOBOLD Red "  [X] config.js not found!"
    echo.
    call :PSECHO Gray "  Expected:"
    echo.
    echo  %CONFIG_FILE%
    echo.
    pause
    exit /b 1
)

if not exist "%CHANGELOG_FILE%" (

    echo.
    call :PSECHOBOLD Red "  [X] CHANGELOG.txt not found!"
    echo.
    call :PSECHO Gray "  Expected:"
    echo.
    echo  %CHANGELOG_FILE%
    echo.
    pause
    exit /b 1
)

call :PROGRESSOK 25 "Deployment files found."

timeout /t 1 /nobreak >nul

REM ============================================================
REM  CHECK FIREBASE CLI
REM ============================================================

call :PROGRESS 40 "Checking Firebase CLI..."

where firebase >nul 2>&1

if errorlevel 1 (

    echo.
    call :PSECHOBOLD Red "  [X] Firebase CLI not found on PATH!"
    echo.
    call :PSECHO Gray "  Install it with:"
    echo.
    call :PSECHO Cyan "      npm install -g firebase-tools"
    echo.
    pause
    exit /b 1
)

call :PROGRESSOK 50 "Firebase CLI found."

timeout /t 1 /nobreak >nul

REM ============================================================
REM  GET VERSION
REM ============================================================

call :PROGRESS 60 "Reading asset version..."

set "VERSION="

for /f "tokens=2 delims==" %%A in ('findstr /C:"window.ASSET_VERSION" "%CONFIG_FILE%"') do (
    set "VERSION=%%A"
)

set "VERSION=!VERSION:"=!"
set "VERSION=!VERSION: =!"
set "VERSION=!VERSION:;=!"

if not defined VERSION (

    echo.
    call :PSECHOBOLD Red "  [X] ASSET_VERSION could not be found!"
    echo.
    pause
    exit /b 1
)

title Firebase Deploy V!VERSION!

call :PROGRESSOK 70 "Asset version detected: V!VERSION!"

timeout /t 1 /nobreak >nul

REM ============================================================
REM  CHANGELOG CHECK
REM ============================================================

call :PROGRESS 80 "Verifying changelog..."

findstr /I /C:"Version: !VERSION!" "%CHANGELOG_FILE%" >nul

if errorlevel 1 (

    echo.

    call :PSECHOBOLD Red "  [X] NO COMMIT MESSAGE IN CHANGE LOG!"

    echo.

    call :PSECHO Yellow "  Version !VERSION! was not found in:"
    echo.
    call :PSECHO Gray "  public\changelog\CHANGELOG.txt"

    echo.

    call :PSECHO White "  Add:"
    echo.
    call :PSECHO Cyan "      Version: !VERSION!"

    echo.

    call :PSECHO Red "  Deployment blocked."

    echo.

    call :PSECHO Gray "  Press any key to close..."
    pause >nul

    exit /b 1
)

call :PROGRESSOK 100 "Changelog verified for V!VERSION!."

timeout /t 1 /nobreak >nul

REM Remove completion text while keeping the 100% bar
powershell.exe -NoProfile -ExecutionPolicy Bypass -Command ^
"$x=[Console]::CursorTop; [Console]::SetCursorPosition(62,$x); [Console]::Write((' '*60)); [Console]::SetCursorPosition(62,$x)"

echo.
echo.

REM ============================================================
REM  DUPLICATE VERSION CHECK
REM ============================================================

if exist "%LAST_VERSION_FILE%" (

    set /p LAST_VERSION=<"%LAST_VERSION_FILE%"

    if "!LAST_VERSION!"=="!VERSION!" (

        call :PSECHO Yellow "  ============================================================"
        call :PSECHOBOLD Yellow "                 WARNING: SAME VERSION NUMBER"
        call :PSECHO Yellow "  ============================================================"

        echo.

        call :PSECHO White "               You are deploying V!VERSION! again."

        echo.

        call :PSECHO Yellow "   Update the version number to ensure the code works properly."

        echo.

        call :PSECHO White "        If you are aware of this and still want to deploy:"

        echo.

        call :PSECHOBOLD Cyan "     Type Y to continue"
        call :PSECHO Gray "     Any other key will cancel"

        echo.

        set /p "CONFIRM=  Continue? "

        if /I not "!CONFIRM!"=="Y" (

            echo.
            call :PSECHO Red "     Deployment cancelled."
            echo.

            pause
            exit /b 1
        )

        echo.

        call :PSECHO Green "     Continuing with V!VERSION!..."

        timeout /t 2 /nobreak >nul

        echo.
    )
)

REM ============================================================
REM  DEPLOYMENT SCREEN
REM ============================================================

cls

echo.

call :PSECHO Cyan "  ============================================================"
echo.
call :PSECHO Cyan "                      FIREBASE DEPLOYING"
call :PSECHO White "                           V!VERSION!"
echo.
call :PSECHO Cyan "  ============================================================"

echo.

call :PROGRESS 0 "Preparing Firebase deployment..."

timeout /t 1 /nobreak >nul

call :PROGRESS 25 "Preparing Firebase deployment..."

timeout /t 1 /nobreak >nul

call :PROGRESS 50 "Uploading files..."

timeout /t 1 /nobreak >nul

call :PROGRESS 100 "Uploading files..."
echo.
call :PSECHO Yellow "  ============================================================"

REM ============================================================
REM  FIREBASE DEPLOY
REM ============================================================

call firebase deploy

set "DEPLOY_RESULT=%ERRORLEVEL%"

echo.

REM ============================================================
REM  FAILURE
REM ============================================================

if not "!DEPLOY_RESULT!"=="0" (

    echo.

    call :PSECHO Red "  ============================================================"
    echo.
    call :PSECHOBOLD Red "                       DEPLOY FAILED"
    echo.
    call :PSECHO Red "  ============================================================"

    echo.

    call :PSECHO White "  Version: V!VERSION!"

    echo.

    call :PSECHO Red "  Firebase returned error code: !DEPLOY_RESULT!"

    echo.

    call :PSECHO Yellow "  This version was NOT marked as deployed."

    echo.

    call :PSECHO Gray "  Press ENTER to close..."

    set /p "dummy="

    exit /b !DEPLOY_RESULT!
)

REM ============================================================
REM  RECORD VERSION
REM ============================================================

echo !VERSION!>"%LAST_VERSION_FILE%"

REM ============================================================
REM  SUCCESS
REM ============================================================

echo.

call :PSECHO Green "  ============================================================"
echo.
call :PSECHOBOLD Green "                    ✓ DEPLOY SUCCESSFUL"
echo.
call :PSECHO Green "  ============================================================"

echo.
echo.
echo.

call :PSECHO Green "  ✓ Changelog verified"
call :PSECHO Green "  ✓ Firebase deployment completed"
call :PSECHO Green "  ✓ Version recorded"

echo.

call :PSECHO Cyan "  Deployment complete."

echo.

call :PSECHO Gray "  Press ENTER to close..."

set /p "dummy="

endlocal
exit /b 0