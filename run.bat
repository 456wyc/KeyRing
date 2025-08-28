@echo off
echo Building Key Ring...
npm run build
if %errorlevel% neq 0 (
    echo Build failed!
    pause
    exit /b %errorlevel%
)

echo Starting Key Ring...
npx electron dist/main.js
pause