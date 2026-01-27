# Hướng dẫn Build APK và AAB - Akito Warranty App

## Yêu cầu

- Node.js >= 20
- Java JDK 17+
- Android SDK
- Android NDK 28.x

## Cấu hình hiện tại

- **Package**: `vn.qbis.akito`
- **Version Name**: `2.0.1`
- **Version Code**: `21`
- **Target SDK**: 36 (Android 16)
- **Min SDK**: 26 (Android 8.0)
- **ABI**: arm64-v8a (tối ưu size)

## Build Commands

### 1. Build APK Release (để test trên thiết bị)

```bash
cd android
./gradlew assembleRelease
```

**Output:** `android/app/build/outputs/apk/release/app-release.apk`

### 2. Build App Bundle (.aab) (để upload Google Play)

```bash
cd android
./gradlew bundleRelease
```

**Output:** `android/app/build/outputs/bundle/release/app-release.aab`

### 3. Build APK Debug

```bash
cd android
./gradlew assembleDebug
```

**Output:** `android/app/build/outputs/apk/debug/app-debug.apk`

### 4. Clean build (khi gặp lỗi)

```bash
cd android
./gradlew clean
./gradlew assembleRelease
```

## Cài đặt APK lên thiết bị

### Qua ADB

```bash
adb install -r android/app/build/outputs/apk/release/app-release.apk
```

### Thủ công

Copy file APK sang điện thoại và cài đặt trực tiếp.

## Cập nhật Version trước khi release

Chỉnh sửa file `android/app/build.gradle`:

```gradle
defaultConfig {
    versionCode 22          // Tăng mỗi lần release
    versionName "2.0.2"     // Version hiển thị cho user
}
```

## Signing cho Production

Hiện tại app đang dùng debug keystore. Để release chính thức lên Google Play:

1. Tạo keystore mới:
```bash
keytool -genkeypair -v -storetype PKCS12 -keystore akito-release.keystore -alias akito -keyalg RSA -keysize 2048 -validity 10000
```

2. Cập nhật `android/app/build.gradle`:
```gradle
signingConfigs {
    release {
        storeFile file('akito-release.keystore')
        storePassword 'your_store_password'
        keyAlias 'akito'
        keyPassword 'your_key_password'
    }
}

buildTypes {
    release {
        signingConfig signingConfigs.release
        // ...
    }
}
```

## Lưu ý

- **Proguard**: Đã bật (`enableProguardInReleaseBuilds = true`) để giảm size
- **16KB Page Size**: Đã cấu hình `useLegacyPackaging = false` để hỗ trợ Android 15+
- **ABI Filter**: Chỉ build cho `arm64-v8a` để giảm size APK (~50%)

## Troubleshooting

### Lỗi Manifest Merger

Nếu gặp lỗi xung đột manifest, thêm `tools:replace` vào permission trong `AndroidManifest.xml`.

### Lỗi Out of Memory

```bash
# Tăng memory cho Gradle
echo "org.gradle.jvmargs=-Xmx4096m" >> android/gradle.properties
```

### Build chậm

```bash
# Bật configuration cache
./gradlew bundleRelease --configuration-cache
```
