#!/usr/bin/env bash
#
# scripts/build-apk.sh
# One-command APK build for SignKYC VCIP (SIH 2026)
#
# Usage:
#   bash scripts/build-apk.sh            # debug APK
#   bash scripts/build-apk.sh --release  # release APK (needs keystore)
#
# Prerequisites:
#   - JDK 17+ installed and on PATH
#   - ANDROID_HOME set (or android SDK in ~/Android/Sdk)
#   - npx cap add android (done once)

set -e  # Exit on any error

RELEASE=false
[[ "$1" == "--release" ]] && RELEASE=true

echo ""
echo "╔══════════════════════════════════════╗"
echo "║  SignKYC VCIP — APK Build Pipeline  ║"
echo "╚══════════════════════════════════════╝"
echo ""

# ── Step 1: Bundle MediaPipe models locally ──────────────────────────
echo "▶ Step 1/4: Bundling MediaPipe models..."
node scripts/bundle-models.mjs

# ── Step 2: Vite production build (with local models) ────────────────
echo ""
echo "▶ Step 2/4: Building React app..."
VITE_LOCAL_MODELS=true npm run build
echo "  ✓ Vite build complete → dist/"

# ── Step 3: Capacitor sync ───────────────────────────────────────────
echo ""
echo "▶ Step 3/4: Syncing to Android project..."
npx cap sync android
echo "  ✓ Capacitor sync complete"

# ── Step 4: Gradle build ─────────────────────────────────────────────
echo ""
if [ "$RELEASE" = true ]; then
  echo "▶ Step 4/4: Building RELEASE APK..."
  cd android && ./gradlew assembleRelease
  APK_PATH="android/app/build/outputs/apk/release/app-release.apk"
else
  echo "▶ Step 4/4: Building DEBUG APK..."
  cd android && ./gradlew assembleDebug
  APK_PATH="android/app/build/outputs/apk/debug/app-debug.apk"
fi

cd ..

echo ""
echo "╔══════════════════════════════════════╗"
echo "║  ✅  BUILD SUCCESS                   ║"
echo "╚══════════════════════════════════════╝"
echo ""
echo "  APK: $APK_PATH"
echo ""
echo "  Install on connected device:"
echo "  adb install $APK_PATH"
echo ""
