# Hướng dẫn chạy ứng dụng React Native trên Windows với Android Studio

## Yêu cầu hệ thống

- Windows 10 hoặc cao hơn
- Node.js >= 20 (LTS)
- Git
- Android Studio (phiên bản mới nhất)
- JDK 17 (đi kèm với Android Studio)

## Bước 1: Cài đặt môi trường

### 1.1. Cài đặt Node.js
1. Tải Node.js LTS (version 20 trở lên) từ: https://nodejs.org/
2. Chạy file cài đặt và làm theo hướng dẫn
3. Kiểm tra cài đặt bằng cách mở Command Prompt:
   ```bash
   node --version
   npm --version
   ```

### 1.2. Cài đặt Git
1. Tải Git từ: https://git-scm.com/download/win
2. Cài đặt với các tùy chọn mặc định
3. Kiểm tra:
   ```bash
   git --version
   ```

### 1.3. Cài đặt Android Studio
1. Tải Android Studio từ: https://developer.android.com/studio
2. Chạy file cài đặt và chọn "Standard" installation
3. Đảm bảo các thành phần sau được cài đặt:
   - Android SDK
   - Android SDK Platform
   - Android Virtual Device (AVD)
   - Performance (Intel HAXM hoặc Android Emulator Hypervisor)

### 1.4. Cấu hình Android SDK
1. Mở Android Studio
2. Click vào **More Actions** → **SDK Manager**
3. Trong tab **SDK Platforms**, chọn:
   - Android 14.0 (UpsideDownCake) - API Level 34
   - Android 13.0 (Tiramisu) - API Level 33
4. Trong tab **SDK Tools**, chọn:
   - Android SDK Build-Tools 34
   - Android Emulator
   - Android SDK Platform-Tools
   - Intel x86 Emulator Accelerator (HAXM installer)
5. Click **Apply** để cài đặt

### 1.5. Thiết lập biến môi trường

1. Mở **System Properties** → **Advanced** → **Environment Variables**
2. Thêm các biến sau vào **User variables**:

   **ANDROID_HOME**:
   ```
   C:\Users\<YourUsername>\AppData\Local\Android\Sdk
   ```

3. Thêm vào biến **Path** (User variables):
   ```
   %ANDROID_HOME%\platform-tools
   %ANDROID_HOME%\emulator
   %ANDROID_HOME%\tools
   %ANDROID_HOME%\tools\bin
   ```

4. Khởi động lại Command Prompt và kiểm tra:
   ```bash
   adb --version
   ```

## Bước 2: Clone code từ Git

1. Mở Command Prompt hoặc Git Bash
2. Di chuyển đến thư mục muốn lưu code:
   ```bash
   cd C:\Users\<YourUsername>\Projects
   ```

3. Clone repository:
   ```bash
   git clone <git-repository-url>
   cd app-bao-hanh\AkitoWarrantyApp
   ```

## Bước 3: Cài đặt dependencies

1. Cài đặt Node modules:
   ```bash
   npm install
   ```

2. Nếu gặp lỗi, thử xóa cache và cài lại:
   ```bash
   npm cache clean --force
   del /f /s /q node_modules
   del package-lock.json
   npm install
   ```

## Bước 4: Tạo và khởi động Android Emulator

### Cách 1: Sử dụng Android Studio (Khuyến nghị)

1. Mở Android Studio
2. Click **More Actions** → **Virtual Device Manager**
3. Click **Create Device**
4. Chọn một thiết bị (ví dụ: Pixel 5)
5. Chọn System Image:
   - Khuyến nghị: **Android 13.0 (Tiramisu) - API Level 33**
   - Nếu chưa có, click **Download** để tải
6. Click **Next** → **Finish**
7. Click biểu tượng **Play** (▶️) để khởi động emulator

### Cách 2: Sử dụng Command Line

```bash
# Liệt kê các AVD có sẵn
emulator -list-avds

# Khởi động AVD (thay <avd_name> bằng tên AVD của bạn)
emulator -avd <avd_name>
```

### Sử dụng thiết bị thật (Tùy chọn)

1. Bật **Developer Options** trên điện thoại Android
2. Bật **USB Debugging**
3. Kết nối điện thoại với máy tính qua USB
4. Kiểm tra kết nối:
   ```bash
   adb devices
   ```
   Bạn sẽ thấy danh sách thiết bị đã kết nối

## Bước 5: Chạy ứng dụng

### Phương pháp 1: Sử dụng npm scripts (Khuyến nghị)

1. Mở một terminal và khởi động Metro Bundler:
   ```bash
   npm start
   ```

2. Mở một terminal khác và chạy ứng dụng trên Android:
   ```bash
   npm run android
   ```

### Phương pháp 2: Sử dụng React Native CLI

```bash
# Khởi động Metro Bundler
npx react-native start

# Trong terminal khác
npx react-native run-android
```

### Phương pháp 3: Mở project trong Android Studio

1. Mở Android Studio
2. Click **Open an Existing Project**
3. Chọn thư mục `android` trong project (ví dụ: `C:\Users\YourUsername\Projects\app-bao-hanh\AkitoWarrantyApp\android`)
4. Đợi Gradle sync hoàn tất
5. Click **Run** (▶️) hoặc nhấn Shift + F10

## Bước 6: Kiểm tra và Debug

### Kiểm tra Metro Bundler
- Metro Bundler sẽ chạy tại: http://localhost:8081
- Bạn có thể mở URL này trên trình duyệt để xem bundler status

### Mở Developer Menu trên Emulator
- Nhấn `Ctrl + M` (Windows)
- Hoặc chạy: `adb shell input keyevent 82`

### Debug với React DevTools
```bash
npm install -g react-devtools
react-devtools
```

## Xử lý sự cố thường gặp

### Lỗi: "SDK location not found"
**Giải pháp**: Tạo file `local.properties` trong thư mục `android/`:
```properties
sdk.dir=C:\\Users\\<YourUsername>\\AppData\\Local\\Android\\Sdk
```

### Lỗi: "Unable to load script from assets"
**Giải pháp**:
```bash
# Xóa cache Metro
npx react-native start --reset-cache

# Trong terminal khác
npm run android
```

### Lỗi: "INSTALL_FAILED_INSUFFICIENT_STORAGE"
**Giải pháp**:
- Xóa dữ liệu emulator hoặc tạo emulator mới với dung lượng lớn hơn
- Hoặc gỡ cài đặt các ứng dụng không cần thiết trên emulator

### Lỗi: Gradle build failed
**Giải pháp**:
```bash
cd android
gradlew clean
cd ..
npm run android
```

### Lỗi: "adb: command not found"
**Giải pháp**: Kiểm tra lại biến môi trường ANDROID_HOME và Path

### Ứng dụng crash khi mở camera/image picker
**Giải pháp**: Cấp quyền camera và storage cho ứng dụng trong Settings của emulator

### Metro Bundler không kết nối được
**Giải pháp**:
```bash
# Reverse port cho emulator
adb reverse tcp:8081 tcp:8081
```

## Cấu trúc thư mục quan trọng

```
AkitoWarrantyApp/
├── android/                 # Code Android native
│   ├── app/
│   ├── build.gradle
│   └── gradle.properties
├── ios/                     # Code iOS native (không dùng trên Windows)
├── src/                     # Source code React Native
│   ├── components/          # Components tái sử dụng
│   ├── screens/            # Các màn hình
│   ├── store/              # State management (Zustand)
│   ├── services/           # API services
│   └── navigation/         # React Navigation
├── App.tsx                 # Entry point
├── package.json            # Dependencies
└── tsconfig.json          # TypeScript config
```

## Scripts hữu ích

```bash
# Khởi động Metro Bundler
npm start

# Chạy trên Android
npm run android

# Chạy trên iOS (chỉ dành cho macOS)
npm run ios

# Chạy linter
npm run lint

# Chạy tests
npm test

# Xóa cache và build lại
npm start -- --reset-cache
```

## Lưu ý quan trọng

1. **Permissions**: Ứng dụng sử dụng camera và image picker, cần cấp quyền trong emulator
2. **Node version**: Đảm bảo sử dụng Node.js >= 20 như yêu cầu trong package.json
3. **First build**: Lần build đầu tiên có thể mất 5-10 phút để download dependencies
4. **Hot reload**: Sau khi ứng dụng chạy, bạn có thể chỉnh sửa code và thấy thay đổi tự động
5. **API Connection**: Kiểm tra cấu hình API endpoint trong source code trước khi test

## Hỗ trợ

- React Native Documentation: https://reactnative.dev/
- Android Studio Guide: https://developer.android.com/studio/intro
- Troubleshooting: https://reactnative.dev/docs/troubleshooting

## Cập nhật code

```bash
# Pull code mới nhất từ Git
git pull origin main

# Cài đặt dependencies mới (nếu có)
npm install

# Xóa build cũ và build lại
cd android
gradlew clean
cd ..
npm run android
```
