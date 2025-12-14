# Fix: Xcode Build Error Code 70

## Vấn đề hiện tại
Build iOS thất bại với error code 70 sau khi cài đặt VisionCamera.

## ✅ Đã hoàn thành
1. ✅ Cài đặt react-native-vision-camera và vision-camera-code-scanner
2. ✅ Thêm camera permissions vào Info.plist
3. ✅ Chạy pod install thành công (95 pods installed)
4. ✅ Clean build thành công

## ❌ Vấn đề hiện tại: Build Error 70

Error code 70 thường do:
- Signing & Capabilities issues
- Provisioning profile
- Bundle identifier conflicts
- Derived Data corruption

## 🔧 Giải pháp: Build bằng Xcode (KHUYÊN DÙNG)

### Bước 1: Mở Xcode
```bash
cd ios
open AkitoWarrantyApp.xcworkspace
```
**LƯU Ý:** Phải mở file `.xcworkspace`, KHÔNG phải `.xcodeproj`

### Bước 2: Chọn Target và Simulator
1. Ở thanh toolbar trên, chọn:
   - Target: `AkitoWarrantyApp`
   - Destination: `iPhone 17 Pro` (simulator đang chạy)

### Bước 3: Kiểm tra Signing
1. Chọn project `AkitoWarrantyApp` trong sidebar trái
2. Chọn target `AkitoWarrantyApp`
3. Vào tab `Signing & Capabilities`
4. Đảm bảo:
   - ✅ "Automatically manage signing" được check
   - ✅ Team được chọn (hoặc để Personal Team)
   - ✅ Bundle Identifier không có lỗi đỏ

### Bước 4: Build trong Xcode
Nhấn `Cmd + B` hoặc menu `Product > Build`

### Bước 5: Xem lỗi chi tiết (nếu build thất bại)
1. Mở Report Navigator: `Cmd + 9`
2. Click vào build mới nhất để xem log
3. Tìm lỗi màu đỏ
4. Common errors:
   - **Code Signing**: Fix ở Signing & Capabilities
   - **Missing Dependencies**: Chạy `pod install` lại
   - **Derived Data**: Clean derived data (xem bên dưới)

### Bước 6: Chạy app
Nếu build thành công, nhấn `Cmd + R` để chạy app trên simulator

## 🔧 Giải pháp thay thế

### Option 1: Clean Derived Data
```bash
rm -rf ~/Library/Developer/Xcode/DerivedData/*
cd /Users/caboono/Desktop/qbis.vn/Akito/app-bao-hanh/AkitoWarrantyApp
cd ios
xcodebuild clean -workspace AkitoWarrantyApp.xcworkspace -scheme AkitoWarrantyApp
cd ..
npx react-native run-ios --udid 7D7D29E5-81D1-48F7-89BF-83DFCCCD1A02
```

### Option 2: Reinstall Pods
```bash
cd ios
export LANG=en_US.UTF-8
rm -rf Pods
rm -rf Podfile.lock
rm -rf build
bundle exec pod install
cd ..
npx react-native run-ios --udid 7D7D29E5-81D1-48F7-89BF-83DFCCCD1A02
```

### Option 3: Reset Everything
```bash
# Clean all
cd ios
rm -rf build
rm -rf Pods
rm -rf Podfile.lock
rm -rf ~/Library/Developer/Xcode/DerivedData/*
cd ..
rm -rf node_modules
rm -rf $TMPDIR/metro-*
rm -rf $TMPDIR/haste-map-*

# Reinstall
npm install
cd ios
export LANG=en_US.UTF-8
bundle exec pod install
cd ..

# Build
npx react-native run-ios --udid 7D7D29E5-81D1-48F7-89BF-83DFCCCD1A02
```

## 📱 Thông tin Simulator
Simulator hiện tại đang chạy:
- **Name**: iPhone 17 Pro
- **UDID**: 7D7D29E5-81D1-48F7-89BF-83DFCCCD1A02
- **Status**: Booted

Để list tất cả simulators:
```bash
xcrun simctl list devices available
```

## ✅ Sau khi build thành công

### Test tính năng quét mã
1. Mở app trên simulator
2. Vào "Kích hoạt bảo hành" hoặc màn hình khác có tính năng quét
3. Nhấn icon ⚡
4. App sẽ yêu cầu quyền camera (lần đầu)
5. Scanner sẽ mở với khung quét

**LƯU Ý**: Simulator không có camera thật, nên không thể quét mã thực tế. Để test đầy đủ, cần:
- Chạy trên thiết bị thật (iPhone/iPad)
- Hoặc sử dụng camera của Mac (nếu có)

## 🎯 Tóm tắt

**Native modules đã được cài đặt chính xác**, chỉ cần fix signing/build issue.

**Khuyến nghị**: Build bằng Xcode để thấy lỗi chi tiết và fix dễ dàng hơn.

Sau khi build thành công 1 lần trong Xcode, có thể dùng `npm run ios` bình thường.
