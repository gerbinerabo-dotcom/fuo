@echo off
setlocal

rem Find a modern Node.js install without assuming a specific Windows username.
if exist "%ProgramFiles%\nodejs\node.exe" set "PATH=%PATH%;%ProgramFiles%\nodejs"
if exist "%LOCALAPPDATA%\Programs\nodejs\node.exe" set "PATH=%LOCALAPPDATA%\Programs\nodejs;%PATH%"
if exist "%USERPROFILE%\.nodejs\node-v22.12.0-win-x64\node.exe" set "PATH=%USERPROFILE%\.nodejs\node-v22.12.0-win-x64;%PATH%"

cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 goto missing_node

node -e "const [major,minor]=process.versions.node.split('.').map(Number); process.exit((major===20&&minor>=19)||(major>=22&&(major>22||minor>=12))?0:1)" >nul 2>nul
if errorlevel 1 goto old_node

echo Starting LifeSkill with Node.js:
node -v
call npm run dev
goto end

:missing_node
echo Node.js was not found. Install Node.js 22 LTS, then reopen this terminal.
echo Download: https://nodejs.org/en/download
pause
exit /b 1

:old_node
echo This project needs Node.js 20.19+ or 22.12+. The detected version is:
node -v
echo Install Node.js 22 LTS, then reopen this terminal.
echo Download: https://nodejs.org/en/download
pause

:end

