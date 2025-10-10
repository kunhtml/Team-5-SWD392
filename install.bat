@echo off
setlocal ENABLEDELAYEDEXPANSION

REM Determine project root (folder of this script)
set "ROOT=%~dp0"
pushd "%ROOT%" >nul

echo ==========================================
echo   Project dependency installation (Windows)
echo ==========================================
echo.
echo [1/5] Checking Node.js and npm...
where node >nul 2>&1
if errorlevel 1 (
  echo [ERROR] Node.js is not installed or not in PATH.
  echo         Please install Node.js LTS from https://nodejs.org/ first.
  goto :error
)
where npm >nul 2>&1
if errorlevel 1 (
  echo [ERROR] npm is not available. Ensure Node.js installation added npm to PATH.
  goto :error
)
for /f "tokens=*" %%v in ('node -v') do set NODE_VER=%%v
for /f "tokens=*" %%v in ('npm -v') do set NPM_VER=%%v
echo     Node: %NODE_VER%
echo     npm : %NPM_VER%
echo.

echo [2/5] Installing backend dependencies...
pushd "backend" >nul
if not exist "package.json" (
  echo [ERROR] backend\package.json not found. Are you in the project root?
  popd >nul
  goto :error
)
call npm install
if errorlevel 1 (
  echo [ERROR] npm install failed in backend.
  popd >nul
  goto :error
)

REM Create .env from example if missing
if not exist ".env" (
  if exist ".env.example" (
    copy /Y ".env.example" ".env" >nul
    echo     Created backend\.env from .env.example. Please review and update secrets.
  ) else (
    echo     [WARN] backend\.env.example not found. Skipping .env creation.
  )
)
popd >nul
echo.

echo [3/5] Installing frontend dependencies...
pushd "frontend" >nul
if not exist "package.json" (
  echo [ERROR] frontend\package.json not found. Are you in the project root?
  popd >nul
  goto :error
)
call npm install
if errorlevel 1 (
  echo [ERROR] npm install failed in frontend.
  popd >nul
  goto :error
)

REM Create a minimal .env with placeholder if missing
if not exist ".env" (
  echo REACT_APP_IMGBB_KEY=your_imgbb_api_key_here>> ".env"
  echo     Created frontend\.env with placeholder REACT_APP_IMGBB_KEY. Replace with your key.
)
popd >nul
echo.

echo [4/5] Ensuring upload directories exist...
if not exist "backend\uploads\products" mkdir "backend\uploads\products" >nul 2>&1
if not exist "backend\uploads\shops" mkdir "backend\uploads\shops" >nul 2>&1
echo     Upload directories ready.

echo.
echo [5/5] Done.
echo All dependencies installed successfully.
echo You can start the app with run.bat, or run backend and frontend separately.

popd >nul
endlocal
exit /b 0

:error
echo.
echo Installation failed. See messages above.
popd >nul
endlocal
exit /b 1
