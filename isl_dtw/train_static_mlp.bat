@echo off
echo ═══════════════════════════════════════════════════
echo   SignKYC ISL — Static Pose MLP Training Pipeline
echo ═══════════════════════════════════════════════════
echo.

cd /d "%~dp0"

echo [Step 1/2] Preprocessing — extracting hand features from images...
echo (Train CSV will be skipped if it already exists)
echo.
python preprocess_static.py
if %ERRORLEVEL% NEQ 0 (
    echo FAILED: Preprocessing error.
    pause
    exit /b 1
)

echo.
echo [Step 2/2] Training MLP model + exporting to TF.js...
echo.
python train_static_mlp.py
if %ERRORLEVEL% NEQ 0 (
    echo FAILED: Training error.
    pause
    exit /b 1
)

echo.
echo ═══════════════════════════════════════════════════
echo   SUCCESS! Model deployed to public/tfjs_model/
echo ═══════════════════════════════════════════════════
pause
