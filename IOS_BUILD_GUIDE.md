# Hướng dẫn Build iOS - AkitoWarrantyApp

Tài liệu hướng dẫn step-by-step để clone và build app trên Xcode từ máy mới.

---

## Yêu cầu hệ thống

| Phần mềm | Phiên bản tối thiểu | Ghi chú |
|----------|---------------------|---------|
| macOS | Sonoma 14.0+ | Bắt buộc để chạy Xcode |
| Xcode | 15.0+ | Khuyến nghị 16.0+ |
| Node.js | 20.x | Bắt buộc theo package.json |
| Ruby | 2.6.10+ | Dùng cho CocoaPods |
| CocoaPods | 1.15+ | Quản lý dependencies iOS |

---

## Step 1: Cài đặt môi trường

### 1.1 Cài đặt Xcode

```bash
# Tải Xcode từ Mac App Store hoặc Apple Developer

# Sau khi cài, chạy lệnh này để cài Command Line Tools
xcode-select --install

# Đồng ý license Xcode
sudo xcodebuild -license accept
```

### 1.2 Cài đặt Homebrew (nếu chưa có)

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

### 1.3 Cài đặt Node.js

```bash
# Cài đặt qua Homebrew
brew install node@22

# Hoặc dùng nvm (khuyến nghị)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.zshrc
nvm install 22
nvm use 22

# Kiểm tra version
node --version  # Phải >= 20.x
npm --version
```

### 1.4 Cài đặt Ruby và CocoaPods

```bash
# macOS đã có sẵn Ruby, nhưng nếu cần version mới hơn:
brew install ruby

# Cài CocoaPods
sudo gem install cocoapods

# Kiểm tra version
pod --version  # Phải >= 1.15
```

---

## Step 2: Clone source code

```bash
# Clone repo từ Git
git clone <YOUR_GIT_REPO_URL> AkitoWarrantyApp

# Di chuyển vào folder project
cd AkitoWarrantyApp
```

---

## Step 3: Cài đặt Dependencies

### 3.1 Cài đặt Node modules

```bash
# Cài đặt tất cả dependencies từ package.json
npm install

# Hoặc dùng yarn nếu có
yarn install
```

### 3.2 Cài đặt iOS Pods

```bash
# Di chuyển vào folder ios
cd ios

# Cài đặt CocoaPods dependencies
pod install

# Nếu gặp lỗi, thử clear cache và cài lại
pod deintegrate
pod cache clean --all
pod install --repo-update

# Quay lại folder gốc
cd ..
```

---

## Step 4: Cấu hình Firebase (QUAN TRỌNG)

### 4.1 File GoogleService-Info.plist

File `ios/AkitoWarrantyApp/GoogleService-Info.plist` chứa cấu hình Firebase.

**Lưu ý:** File này có thể đã bị ignore trong `.gitignore` vì chứa thông tin nhạy cảm. Nếu không có file này:

1. Truy cập [Firebase Console](https://console.firebase.google.com/)
2. Chọn project **Akito**
3. Vào **Project Settings** → **General**
4. Trong phần **Your apps**, chọn iOS app
5. Download file `GoogleService-Info.plist`
6. Copy vào `ios/AkitoWarrantyApp/GoogleService-Info.plist`

---

## Step 5: Mở project trong Xcode

### 5.1 Mở Workspace (KHÔNG phải .xcodeproj)

```bash
# Mở bằng terminal
open ios/AkitoWarrantyApp.xcworkspace

# HOẶC mở Xcode → File → Open → chọn file:
# ios/AkitoWarrantyApp.xcworkspace
```

**QUAN TRỌNG:** Luôn mở file `.xcworkspace`, KHÔNG phải `.xcodeproj`

### 5.2 Cấu hình Signing & Capabilities

1. Trong Xcode, chọn **AkitoWarrantyApp** trong Project Navigator (panel bên trái)
2. Chọn target **AkitoWarrantyApp**
3. Vào tab **Signing & Capabilities**
4. Trong phần **Signing**:
   - **Team**: Chọn Apple Developer Team của bạn
   - **Bundle Identifier**: `com.akito.warrantyapp` (hoặc ID đã đăng ký)
   - Tick **Automatically manage signing**

5. Nếu chưa có Apple Developer Account:
   - Xcode → Settings → Accounts → Add (+)
   - Đăng nhập Apple ID

---

## Step 6: Build và Run

### 6.1 Chọn Target Device

1. Trên thanh toolbar Xcode, click dropdown bên cạnh tên scheme
2. Chọn:
   - **Simulator**: iPhone 15 Pro, iPhone 16, etc.
   - **Physical Device**: Kết nối iPhone qua cable USB

### 6.2 Build Project

```
Phím tắt: ⌘ + B (Command + B)
```

Hoặc: **Product** → **Build**

### 6.3 Run App

```
Phím tắt: ⌘ + R (Command + R)
```

Hoặc: **Product** → **Run**

---

## Step 7: Build cho Production (Archive)

### 7.1 Tạo Archive

1. Chọn target device: **Any iOS Device (arm64)**
2. **Product** → **Archive**
3. Đợi build hoàn tất

### 7.2 Upload lên App Store Connect

1. Sau khi Archive xong, cửa sổ **Organizer** sẽ mở
2. Chọn archive vừa tạo
3. Click **Distribute App**
4. Chọn **App Store Connect** → **Upload**
5. Làm theo hướng dẫn để upload

---

## Xử lý lỗi thường gặp

### Lỗi 1: "Unable to load contents of file list"

```bash
cd ios
pod deintegrate
rm -rf Pods
rm Podfile.lock
pod install --repo-update
```

### Lỗi 2: "No bundle URL present"

```bash
# Terminal 1: Chạy Metro bundler
npm start

# Terminal 2: Build lại app
cd ios && xcodebuild clean && cd ..
```

### Lỗi 3: "Signing requires a development team"

- Vào **Signing & Capabilities** trong Xcode
- Chọn Team từ dropdown
- Nếu không có team, đăng nhập Apple Developer Account

### Lỗi 4: "Module not found" hoặc "No such module"

```bash
# Clean và reinstall
rm -rf node_modules
rm -rf ios/Pods
npm install
cd ios && pod install --repo-update
```

### Lỗi 5: Build failed với lỗi Swift version

```bash
cd ios
pod update
```

### Lỗi 6: "GoogleService-Info.plist not found"

- Đảm bảo file `GoogleService-Info.plist` tồn tại trong `ios/AkitoWarrantyApp/`
- Download từ Firebase Console nếu chưa có

---

## Cấu trúc thư mục iOS quan trọng

```
ios/
├── AkitoWarrantyApp/
│   ├── AppDelegate.swift          # Entry point của app
│   ├── Info.plist                 # Cấu hình app (permissions, etc.)
│   ├── GoogleService-Info.plist   # Firebase config
│   ├── Images.xcassets/           # App icons & images
│   ├── LaunchScreen.storyboard    # Splash screen
│   └── PrivacyInfo.xcprivacy      # Privacy manifest
├── AkitoWarrantyApp.xcodeproj/    # Xcode project (KHÔNG mở trực tiếp)
├── AkitoWarrantyApp.xcworkspace/  # Workspace (MỞ FILE NÀY)
├── Podfile                        # CocoaPods config
├── Podfile.lock                   # Lock file cho pods
└── Pods/                          # Thư viện iOS (auto-generated)
```

---

## Checklist trước khi build

- [ ] Node.js >= 20.x đã cài
- [ ] Xcode đã cài và license đã accept
- [ ] CocoaPods >= 1.15 đã cài
- [ ] `npm install` hoàn tất không lỗi
- [ ] `pod install` hoàn tất không lỗi
- [ ] `GoogleService-Info.plist` có trong `ios/AkitoWarrantyApp/`
- [ ] Mở đúng file `.xcworkspace` (không phải `.xcodeproj`)
- [ ] Đã chọn Development Team trong Signing
- [ ] Metro bundler đang chạy (cho debug build)

---

## Thông tin Project

| Thuộc tính | Giá trị |
|------------|---------|
| App Name | Akito |
| Bundle ID | com.akito.warrantyapp |
| React Native | 0.83.0 |
| Min iOS Version | (theo cấu hình Podfile) |
| Architecture | New Architecture enabled |

---

## Liên hệ hỗ trợ

Nếu gặp vấn đề khi build, liên hệ team phát triển kèm theo:
1. Screenshot lỗi
2. Output của `pod install`
3. Xcode version (`xcodebuild -version`)
4. Node version (`node --version`)
