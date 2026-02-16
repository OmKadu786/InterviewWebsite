@echo off
echo ==========================================
echo Starting TestSprite Execution...
echo ==========================================
cd /d "%~dp0"
npx @testsprite/testsprite-mcp@latest generateCodeAndExecute
pause
