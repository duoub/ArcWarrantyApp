#!/bin/bash

# Fix jcenter() and add MLKit dependencies in vision-camera-code-scanner
VISION_SCANNER_BUILD_GRADLE="node_modules/vision-camera-code-scanner/android/build.gradle"

if [ -f "$VISION_SCANNER_BUILD_GRADLE" ]; then
    echo "Patching vision-camera-code-scanner build.gradle..."

    # Replace jcenter() with mavenCentral()
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' 's/jcenter()/mavenCentral()/g' "$VISION_SCANNER_BUILD_GRADLE"

        # Add MLKit dependency if not exists
        if ! grep -q "com.google.mlkit:barcode-scanning" "$VISION_SCANNER_BUILD_GRADLE"; then
            sed -i '' '/dependencies {/a\
    implementation "com.google.mlkit:barcode-scanning:17.2.0"
' "$VISION_SCANNER_BUILD_GRADLE"
        fi
    else
        # Linux
        sed -i 's/jcenter()/mavenCentral()/g' "$VISION_SCANNER_BUILD_GRADLE"

        if ! grep -q "com.google.mlkit:barcode-scanning" "$VISION_SCANNER_BUILD_GRADLE"; then
            sed -i '/dependencies {/a\    implementation "com.google.mlkit:barcode-scanning:17.2.0"' "$VISION_SCANNER_BUILD_GRADLE"
        fi
    fi

    echo "✅ vision-camera-code-scanner patched successfully"
else
    echo "⚠️  vision-camera-code-scanner build.gradle not found"
fi
