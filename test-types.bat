@echo off
echo Running TypeScript type check...
echo.
call npx tsc --noEmit
echo.
echo Type check complete!
pause

