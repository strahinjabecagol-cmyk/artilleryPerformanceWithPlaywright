@echo off
REM ============================================
REM Artillery Polymer Shop Test Runner + Report Viewer
REM ============================================

REM Get the folder where this .bat file is located
set "SCRIPT_DIR=%~dp0"
REM Navigate to parent directory (project root)
set "PROJECT_ROOT=%SCRIPT_DIR%.."
set "LOG_DIR=%PROJECT_ROOT%\docs\logs"
set "RESULTS_DIR=%PROJECT_ROOT%\docs\results"
set "TEMP_RESULTS_DIR=%PROJECT_ROOT%\results"
set "TEMP_LOGS_DIR=%PROJECT_ROOT%\logs"

REM Step 0: Ensure folders exist
if not exist "%LOG_DIR%" mkdir "%LOG_DIR%"
if not exist "%RESULTS_DIR%" mkdir "%RESULTS_DIR%"
if not exist "%TEMP_RESULTS_DIR%" mkdir "%TEMP_RESULTS_DIR%"
if not exist "%TEMP_LOGS_DIR%" mkdir "%TEMP_LOGS_DIR%"

REM Generate timestamp (format: YYYY-MM-DD_HH-MM-SS)
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set datetime=%%I
set TIMESTAMP=%datetime:~0,4%-%datetime:~4,2%-%datetime:~6,2%_%datetime:~8,2%-%datetime:~10,2%-%datetime:~12,2%

set "RESULTS_FILE=results_%TIMESTAMP%.json"
set "LOG_FILE=execution_%TIMESTAMP%.log"

echo.
echo ============================================
echo 🚀 Running Artillery Polymer Shop Test
echo 📅 Timestamp: %TIMESTAMP%
echo ============================================
echo.

REM Step 1: Compile TypeScript files
echo [1/5] Compiling TypeScript files...
call tsc

REM Step 2: Run the Artillery test with timestamped files
echo [2/5] Running Artillery Polymer test...
call "%AppData%\npm\artillery.cmd" run "%PROJECT_ROOT%\artilleryPolymer.yml" --output "%TEMP_RESULTS_DIR%\%RESULTS_FILE%" > "%TEMP_LOGS_DIR%\%LOG_FILE%" 2>&1
type "%TEMP_LOGS_DIR%\%LOG_FILE%"

REM Step 3: Update map files
echo.
echo [3/5] Updating map files...
cd "%PROJECT_ROOT%"
node scripts\update-maps.js %RESULTS_FILE% %LOG_FILE%

REM Step 4: Copy timestamped files to docs
echo [4/5] Copying files to docs...
copy "%TEMP_RESULTS_DIR%\%RESULTS_FILE%" "%RESULTS_DIR%\" >nul
copy "%TEMP_LOGS_DIR%\%LOG_FILE%" "%LOG_DIR%\" >nul
if exist "%TEMP_RESULTS_DIR%\resultsMap.json" copy "%TEMP_RESULTS_DIR%\resultsMap.json" "%RESULTS_DIR%\" >nul
if exist "%TEMP_LOGS_DIR%\logsMap.json" copy "%TEMP_LOGS_DIR%\logsMap.json" "%LOG_DIR%\" >nul


REM Step 5: Kill existing HTTP server if running and start a new one
echo [5/5] Starting local server...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8080 ^| findstr LISTENING') do taskkill /F /PID %%a 2>nul
cd "%PROJECT_ROOT%"
start "" python -m http.server 8080

REM Step 6: Give the server a few seconds to start
timeout /t 3 >nul

REM Step 7: Open Chrome report
echo Opening report in Chrome...
start "" "chrome" "http://localhost:8080/docs/index.html"

echo.
echo ============================================
echo ✅ All tasks completed successfully!
echo 📊 Results: %RESULTS_FILE%
echo 📄 Log: %LOG_FILE%
echo 🔹 Files saved in docs/results and docs/logs
echo ============================================
pause
