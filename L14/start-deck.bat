@echo off
rem Starts the L14 deck with live reload and the Ollama proxy. Leave this window open during class.
cd /d "%~dp0"
where node >nul 2>nul || (echo Node.js is not installed. You can still open index.html directly. & pause & exit /b)
start "" http://localhost:5214
node scripts\serve.mjs
