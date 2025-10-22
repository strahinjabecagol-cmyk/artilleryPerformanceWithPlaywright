@echo off
echo Running Artillery load test...
call "%AppData%\npm\artillery.cmd" run artillery.yml --output results.json
echo Done!
pause