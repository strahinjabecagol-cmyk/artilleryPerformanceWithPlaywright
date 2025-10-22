@echo off
REM ============================================
REM Webstore Artillery Test Runner + Report Viewer
REM ============================================

REM Step 1: Run the Artillery webstore test and save results
echo Running Artillery webstore load test...
call "%AppData%\npm\artillery.cmd" run artillery_copy.yml --output results.json

REM Step 2: Kill existing HTTP server if running and start a new one
echo Checking for existing server on port 8080...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8080 ^| findstr LISTENING') do taskkill /F /PID %%a 2>nul
echo Starting local server on http://localhost:8080 ...
start "" python -m http.server 8080

REM Step 3: Give the server a few seconds to start
timeout /t 3 >nul

REM Step 4: Open Chrome (new tab if already running)
echo Opening report in Chrome...
start "" "chrome" "http://localhost:8080/dashboard1.html"

echo ============================================
echo All tasks completed successfully!
pause