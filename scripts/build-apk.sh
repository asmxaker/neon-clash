#!/usr/bin/env bash
# Сборка debug APK и копирование в dist/.
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

if [ -z "${JAVA_HOME:-}" ] && command -v brew >/dev/null 2>&1; then
  JDK21="$(brew --prefix openjdk@21 2>/dev/null || true)/libexec/openjdk.jdk/Contents/Home"
  if [ -d "$JDK21" ]; then
    export JAVA_HOME="$JDK21"
  fi
fi

if [ -z "${ANDROID_HOME:-}" ] && [ -d "$HOME/Library/Android/sdk" ]; then
  export ANDROID_HOME="$HOME/Library/Android/sdk"
fi

echo "JAVA_HOME=${JAVA_HOME:-<system>}"
echo "ANDROID_HOME=${ANDROID_HOME:-<local.properties>}"

node scripts/fix-ble-gradle.mjs
npx cap sync android
(cd android && ./gradlew assembleDebug)

mkdir -p dist
cp android/app/build/outputs/apk/debug/app-debug.apk dist/NeonClash-MVP.apk
echo
echo "Готово: $ROOT/dist/NeonClash-MVP.apk"
