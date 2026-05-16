#!/bin/bash

# Exit on error
set -e

# Build the web app
echo "Building web app..."
npm run build

# Sync the web app with the Android project
echo "Syncing with Android project..."
npx cap sync android

# Build the Android app (debug APK)
echo "Building Android app..."
cd android
./gradlew clean
./gradlew assembleDebug --stacktrace
cd ..

echo "Build complete!"
echo "You can find the debug APK at: android/app/build/outputs/apk/debug/app-debug.apk"
