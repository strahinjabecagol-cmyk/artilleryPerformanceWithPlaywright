@echo off
REM ============================================
REM Artillery Test Runner + Local Report Viewer
REM ============================================

REM Get the folder where this .bat file is located
set "SCRIPT_DIR=%~dp0"
REM Navigate to parent directory (project root)
set "PROJECT_ROOT=%SCRIPT_DIR%.."
set "LOG_DIR=%PROJECT_ROOT%\logs"
set "RESULTS_DIR=%PROJECT_ROOT%\results"

REM Step 0: Ensure folders exist
if not exist "%LOG_DIR%" (
    echo Creating logs directory...
    mkdir "%LOG_DIR%"
)
if not exist "%RESULTS_DIR%" (
    echo Creating results directory...
    mkdir "%RESULTS_DIR%"
)

REM Step 1: Compile TypeScript files
echo Compiling TypeScript files...
call tsc

REM Step 2: Run the Artillery test
echo Running Artillery load test...
call "%AppData%\npm\artillery.cmd" run "%PROJECT_ROOT%\artillery.yml" --output "%RESULTS_DIR%\results.json" > "%LOG_DIR%\execution.log" 2>&1
type "%LOG_DIR%\execution.log"

REM Step 3: Kill existing HTTP server if running and start a new one
echo Checking for existing server on port 8080...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8080 ^| findstr LISTENING') do taskkill /F /PID %%a 2>nul
echo Starting local server on http://localhost:8080 ...
cd "%PROJECT_ROOT%"
start "" python -m http.server 8080

REM Step 4: Give the server a few seconds to start
timeout /t 3 >nul

REM Step 5: Open Chrome report
echo Opening report in Chrome...
start "" "chrome" "http://localhost:8080/docs/index.html"

echo ============================================
echo ✅ All tasks completed successfully!
echo 🔹 Logs saved in: %LOG_DIR%
echo 🔹 Results saved in: %RESULTS_DIR%
pause