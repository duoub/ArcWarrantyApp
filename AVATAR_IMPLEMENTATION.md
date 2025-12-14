# Avatar Change Feature Implementation

## Tổng quan
Đã implement tính năng đổi avatar trong ProfileScreen.tsx với các tính năng:
- Chọn ảnh từ thư viện (Library)
- Chụp ảnh từ camera
- Crop ảnh với khung tròn và cho phép drag/zoom để điều chỉnh
- Lưu avatar vào local storage

## Libraries đã sử dụng

### 1. react-native-image-crop-picker (v0.51.1)
- Library chính để pick và crop ảnh
- Hỗ trợ cả iOS và Android
- Tích hợp sẵn cropper với UI đẹp, hỗ trợ circular crop
- Compatible với React Native 0.83.0

### 2. react-native-image-picker (v8.2.1)
- Thư viện phụ, được cài đặt như dependency của image-crop-picker

## Các files đã thay đổi

### 1. `/src/screens/main/ProfileScreen/ProfileScreen.tsx`
**Thay đổi:**
- Thêm import `ImagePicker` từ `react-native-image-crop-picker`
- Thêm `Platform` và `PermissionsAndroid` để xử lý permissions
- Thêm `updateAvatar` từ `useAuthStore`

**Functions mới:**
- `handleChangeAvatar()`: Hiển thị Alert cho user chọn Camera hoặc Library
- `handleTakePhoto()`: Mở camera, request permission (Android), và crop ảnh
- `handlePickFromLibrary()`: Mở thư viện ảnh và crop ảnh

**Cấu hình crop:**
```javascript
{
  width: 400,
  height: 400,
  cropping: true,
  cropperCircleOverlay: true,      // Hiển thị khung crop hình tròn
  enableRotationGesture: true,      // Cho phép xoay ảnh
  freeStyleCropEnabled: false,      // Giữ tỷ lệ 1:1
  mediaType: 'photo',
  compressImageQuality: 0.8,        // Nén ảnh 80% để tối ưu dung lượng
}
```

### 2. `/src/store/authStore.ts`
**Thay đổi:**
- Thêm method `updateAvatar(avatarUri: string)` vào AuthState interface
- Implement function `updateAvatar` để:
  - Update user.avatar trong state
  - Lưu user data mới vào MMKV storage
  - Tự động sync với tất cả components sử dụng useAuthStore

### 3. `/src/components/ImageCropperModal.tsx` (NEW)
**Mô tả:**
- Component modal đơn giản để hiển thị loading khi đang crop
- Tự động mở cropper của react-native-image-crop-picker
- Handle error và user cancel

**Note:** Component này có thể bỏ qua vì chúng ta đang dùng built-in cropper của library, nhưng giữ lại để có thể mở rộng sau này.

### 4. `/ios/AkitoWarrantyApp/Info.plist`
**Permissions đã thêm:**
```xml
<key>NSPhotoLibraryUsageDescription</key>
<string>Ứng dụng cần truy cập thư viện ảnh để chọn ảnh đại diện</string>

<key>NSPhotoLibraryAddUsageDescription</key>
<string>Ứng dụng cần quyền lưu ảnh vào thư viện</string>
```

**Permissions đã có sẵn:**
- `NSCameraUsageDescription`: Đã có sẵn cho tính năng scan QR

### 5. `/android/app/src/main/AndroidManifest.xml`
**Permissions đã thêm:**
```xml
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />
```

**Permissions đã có sẵn:**
- `CAMERA`: Đã có sẵn cho tính năng scan QR

## Cách sử dụng

1. User click vào nút camera trên avatar trong ProfileScreen
2. Alert hiện lên với 2 options: "Chụp ảnh" hoặc "Thư viện"
3. Nếu chọn "Chụp ảnh":
   - App request camera permission (chỉ Android)
   - Mở camera
   - User chụp ảnh
   - Cropper tự động mở với khung tròn
   - User drag/zoom/rotate để adjust
   - Confirm → Avatar được update
4. Nếu chọn "Thư viện":
   - Mở photo library
   - User chọn ảnh
   - Cropper tự động mở với khung tròn
   - User drag/zoom/rotate để adjust
   - Confirm → Avatar được update
5. Avatar mới được:
   - Lưu vào MMKV storage
   - Tự động update trên tất cả screens (ProfileScreen, HomeScreen)

## User Experience

### Ưu điểm:
- UI/UX mượt mà với built-in cropper của react-native-image-crop-picker
- Hỗ trợ circular crop phù hợp với avatar
- Cho phép drag, zoom, rotate để adjust ảnh
- Auto-compress ảnh (80%) để tiết kiệm storage
- Permissions được handle đúng chuẩn iOS/Android

### Drag to Adjust:
- **Pan (Kéo)**: User có thể kéo ảnh để căn chỉnh vị trí trong khung crop
- **Pinch to Zoom**: User có thể zoom in/out bằng 2 ngón tay
- **Rotate**: User có thể xoay ảnh bằng gesture

## Testing

### iOS:
```bash
cd ios && pod install
cd ..
npm run ios
```

### Android:
```bash
npm run android
```

### Test cases:
1. ✅ Click camera button → Alert hiện đúng
2. ✅ Chọn "Chụp ảnh" → Camera mở
3. ✅ Chụp ảnh → Cropper mở với khung tròn
4. ✅ Drag/Zoom ảnh trong cropper
5. ✅ Confirm → Avatar update thành công
6. ✅ Chọn "Thư viện" → Photo library mở
7. ✅ Chọn ảnh → Cropper mở
8. ✅ Confirm → Avatar update
9. ✅ Avatar hiển thị đúng trên ProfileScreen và HomeScreen
10. ✅ Restart app → Avatar vẫn được giữ (MMKV storage)

## Lưu ý

1. **Storage**: Hiện tại avatar được lưu local (MMKV). Để sync với backend, cần:
   - Upload ảnh lên server trong `updateAvatar` function
   - Lưu URL từ server vào user.avatar
   - Update API endpoint

2. **File size**: Ảnh được compress 80% và resize về 400x400px để tối ưu storage

3. **Permissions**:
   - iOS: Permissions được request tự động khi user click
   - Android: Camera permission được request programmatically, Photo library permission được Android tự động request

4. **Libraries compatibility**:
   - ✅ react-native-image-crop-picker: v0.51.1 - Compatible với RN 0.83.0
   - ✅ Không cần react-native-reanimated (tránh conflict)
   - ✅ Sử dụng react-native-gesture-handler đã có sẵn

## Future Improvements

1. Upload avatar lên server thay vì lưu local
2. Cache avatar với CDN
3. Thêm option "Xóa ảnh đại diện" để reset về default
4. Thêm loading indicator khi upload
5. Thêm preview trước khi confirm
6. Thêm filters/effects cho ảnh
