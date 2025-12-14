# Hướng dẫn cấu hình Barcode Scanner

Ứng dụng đã được tích hợp tính năng quét mã vạch/QR code sử dụng **react-native-vision-camera** và **vision-camera-code-scanner**.

## Các bước cấu hình

### 1. iOS Configuration

#### a. Cập nhật Info.plist

Thêm các permission sau vào file `ios/AkitoWarrantyApp/Info.plist`:

```xml
<key>NSCameraUsageDescription</key>
<string>Ứng dụng cần truy cập camera để quét mã vạch/QR code trên sản phẩm</string>
```

#### b. Cập nhật Podfile

Đảm bảo file `ios/Podfile` có cấu hình sau:

```ruby
# Thêm vào đầu file (sau platform :ios)
require_relative '../node_modules/react-native-vision-camera/package.json'

# Trong target 'AkitoWarrantyApp' do
target 'AkitoWarrantyApp' do
  # ...existing code...

  # Thêm permission handlers nếu cần
  permissions_path = '../node_modules/react-native-permissions/ios'
  pod 'Permission-Camera', :path => "#{permissions_path}/Camera"
end

# Sau target, thêm post_install hook
post_install do |installer|
  installer.pods_project.targets.each do |target|
    target.build_configurations.each do |config|
      config.build_settings['GCC_PREPROCESSOR_DEFINITIONS'] ||= ['$(inherited)', '_LIBCPP_ENABLE_CXX17_REMOVED_UNARY_BINARY_FUNCTION']
    end
  end
end
```

#### c. Chạy pod install

```bash
cd ios
pod install
cd ..
```

#### d. Build lại project

```bash
npm run ios
```

---

### 2. Android Configuration

#### a. Cập nhật AndroidManifest.xml

Thêm camera permission vào file `android/app/src/main/AndroidManifest.xml`:

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <!-- Thêm permission -->
    <uses-permission android:name="android.permission.CAMERA" />

    <!-- Khai báo camera feature -->
    <uses-feature android:name="android.hardware.camera" android:required="false" />
    <uses-feature android:name="android.hardware.camera.autofocus" android:required="false" />

    <application ...>
        ...
    </application>
</manifest>
```

#### b. Cập nhật build.gradle (app level)

File `android/app/build.gradle`:

```gradle
android {
    ...

    defaultConfig {
        ...
        minSdkVersion = 26  // Vision Camera yêu cầu tối thiểu API 26
    }

    ...
}
```

#### c. Build lại project

```bash
npm run android
```

---

## Sử dụng trong code

Component `BarcodeScanner` đã được tích hợp vào các màn hình:

1. **WarrantyActivationScreen** - Quét serial khi kích hoạt bảo hành
2. **WarrantyLookupScreen** - Quét serial khi tra cứu bảo hành
3. **ProductLookupScreen** - Quét serial khi kiểm tra sản phẩm chính hãng
4. **WarrantyReportScreen** - Quét serial khi báo ca bảo hành

### Ví dụ sử dụng:

```tsx
import BarcodeScanner from '../../../components/BarcodeScanner';

const MyScreen = () => {
  const [showScanner, setShowScanner] = useState(false);
  const [serial, setSerial] = useState('');

  const handleScanComplete = (data: string) => {
    setSerial(data);
    setShowScanner(false);
  };

  return (
    <View>
      <TouchableOpacity onPress={() => setShowScanner(true)}>
        <Text>Quét mã</Text>
      </TouchableOpacity>

      <BarcodeScanner
        visible={showScanner}
        onClose={() => setShowScanner(false)}
        onScan={handleScanComplete}
        title="Quét mã sản phẩm"
      />
    </View>
  );
};
```

## Các loại mã được hỗ trợ

Component hỗ trợ quét các loại mã sau:
- QR Code
- EAN-13, EAN-8
- Code-128, Code-39, Code-93
- Codabar
- ITF
- UPC-A, UPC-E
- PDF-417
- Aztec
- Data Matrix

## Troubleshooting

### iOS

**Lỗi: "App has crashed because it attempted to access privacy-sensitive data"**
- Đảm bảo đã thêm `NSCameraUsageDescription` vào Info.plist

**Lỗi build với CocoaPods**
```bash
cd ios
pod deintegrate
pod install
```

### Android

**Lỗi: "Camera permission denied"**
- Kiểm tra permission trong AndroidManifest.xml
- Xóa và cài lại app để yêu cầu permission lại

**Lỗi: "minSdkVersion is lower than required"**
- Cập nhật `minSdkVersion = 26` trong build.gradle

**Clean build khi gặp lỗi:**
```bash
cd android
./gradlew clean
cd ..
npm run android
```

## Icon mã vạch

Icon quét mã (⚡) được sử dụng thống nhất trong tất cả các màn hình thay vì text "Quét" hoặc emoji camera.

## Performance

- Camera sẽ chỉ được khởi động khi modal scanner được mở
- Camera tự động tắt khi đóng modal hoặc sau khi quét thành công
- Hỗ trợ zoom gesture (pinch to zoom)

## Bảo mật

- App chỉ yêu cầu quyền camera khi người dùng nhấn nút quét
- Không lưu trữ hình ảnh từ camera
- Chỉ đọc dữ liệu từ mã vạch/QR code
