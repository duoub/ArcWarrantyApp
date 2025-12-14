#!/bin/bash

# Script to rebuild iOS app with VisionCamera
# Usage: ./scripts/rebuild-ios.sh

set -e

echo "🔄 Rebuilding iOS app..."

# Step 1: Clean iOS build
echo "📦 Step 1: Cleaning iOS build..."
cd ios
rm -rf build
cd ..

# Step 2: Clean Metro cache
echo "🗑️  Step 2: Cleaning Metro cache..."
rm -rf $TMPDIR/metro-* 2>/dev/null || true
rm -rf $TMPDIR/haste-map-* 2>/dev/null || true

# Step 3: Reinstall pods (optional - uncomment if needed)
# echo "📱 Step 3: Reinstalling pods..."
# cd ios
# export LANG=en_US.UTF-8
# bundle exec pod deintegrate
# bundle exec pod install
# cd ..

# Step 4: Start Metro with clean cache
echo "🚀 Step 4: Starting Metro with clean cache..."
pkill -f "Metro" 2>/dev/null || true
npm start -- --reset-cache &
sleep 5

# Step 5: Build and run iOS
echo "📲 Step 5: Building iOS app..."
npx react-native run-ios --simulator="iPhone 17 Pro"

echo "✅ Done!"
