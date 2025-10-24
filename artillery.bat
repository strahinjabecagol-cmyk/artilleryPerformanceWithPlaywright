@echo off
REM ============================================
REM Artillery Test Runner + Local Report Viewer
REM ============================================

REM Step 0: Compile TypeScript files
echo Compiling TypeScript files...
call tsc

REM Step 1: Run the Artillery test and save results and log
echo Running Artillery load test...
call "%AppData%\npm\artillery.cmd" run artillery.yml --output results.json --name "Flight Search Performance Test" > execution.log 2>&1
type execution.log

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