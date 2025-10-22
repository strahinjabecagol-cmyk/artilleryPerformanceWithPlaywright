@echo off
REM ============================================
REM Artillery Test Runner + Local Report Viewer
REM ============================================

REM Step 1: Run the Artillery test and save results
echo Running Artillery load test...
call "%AppData%\npm\artillery.cmd" run artillery.yml --output results.json

REM Step 2: Start a local HTTP server in the background
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