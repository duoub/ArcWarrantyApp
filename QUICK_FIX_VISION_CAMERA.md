# Fix: "Cannot read property 'getConstants' of null" - VisionCamera

## Vấn đề
Lỗi `TypeError: Cannot read property 'getConstants' of null` xảy ra khi sử dụng `react-native-vision-camera` vì native module chưa được link.

## Giải pháp đã thực hiện

### 1. ✅ Thêm Camera Permissions vào Info.plist
File: `ios/AkitoWarrantyApp/Info.plist`

```xml
<key>NSCameraUsageDescription</key>
<string>Ứng dụng cần truy cập camera để quét mã vạch/QR code trên sản phẩm</string>
<key>NSMicrophoneUsageDescription</key>
<string>Ứng dụng cần truy cập microphone để quay video (nếu cần)</string>
```

### 2. ✅ Cài đặt iOS Pods
```bash
cd ios
export LANG=en_US.UTF-8
bundle exec pod install
cd ..
```

Kết quả:
- ✅ VisionCamera (4.7.3) installed
- ✅ vision-camera-code-scanner (0.2.0) installed
- ✅ MLKitBarcodeScanning (5.0.0) installed
- ✅ Total 95 pods installed

### 3. ✅ Rebuild iOS App
```bash
npm run ios
```

## Nếu vẫn gặp lỗi

### Clean Build (nếu cần)
```bash
cd ios
rm -rf build
rm -rf Pods
rm -rf ~/Library/Developer/Xcode/DerivedData/*
pod deintegrate
pod install
cd ..
npm run ios
```

### Reset Metro Cache
```bash
npm start -- --reset-cache
```

### Xác nhận Native Module đã được link
```bash
cd ios
grep -r "VisionCamera" Pods/
```

## Kiểm tra app hoạt động

1. Mở app
2. Vào màn hình "Kích hoạt bảo hành"
3. Nhấn icon ⚡ để mở scanner
4. App sẽ yêu cầu quyền camera (lần đầu tiên)
5. Camera sẽ mở và hiển thị khung quét

## Lưu ý

- App sử dụng New Architecture (RCTNewArchEnabled = true)
- VisionCamera v4.7.3 hỗ trợ New Architecture
- Frame Processors bị disabled vì không có react-native-worklets-core (không cần thiết cho quét mã vạch)

## Tài liệu tham khảo

- [VisionCamera Documentation](https://react-native-vision-camera.com/docs/guides)
- [Vision Camera Code Scanner](https://github.com/rodgomesc/vision-camera-code-scanner)
