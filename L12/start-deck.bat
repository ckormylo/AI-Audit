@echo off
rem Starts the L12 deck with live reload. Leave this window open while you edit slides.md.
cd /d "%~dp0"
where node >nul 2>nul || (echo Node.js is not installed. You can still open index.html directly. & pause & exit /b)
start "" http://localhost:5212
node scripts\serve.mjs
