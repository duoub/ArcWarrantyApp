# 🍎 Firebase iOS Testing Guide

## ⚠️ iOS Simulator Limitation

**iOS Simulator KHÔNG hỗ trợ push notifications!**

Khi chạy trên simulator, bạn sẽ thấy:
```
⚠️ Running on iOS Simulator - Skipping FCM setup
📱 Push notifications require a real iOS device
```

---

## 📱 Testing on Real iOS Device

### **Prerequisites**

1. ✅ Apple Developer Account (Free hoặc Paid)
2. ✅ Thiết bị iPhone/iPad thật
3. ✅ USB cable hoặc WiFi connection
4. ✅ Xcode đã cài đặt
5. ✅ APNs Certificate configured trên Firebase Console

---

## 🔧 Setup Steps

### **1. Xcode Configuration**

1. Mở workspace:
   ```bash
   open ios/AkitoWarrantyApp.xcworkspace
   ```

2. Chọn target `AkitoWarrantyApp` → Signing & Capabilities

3. Enable **Automatically manage signing**

4. Chọn Team (Apple Developer Account)

5. Thêm Capability: **Push Notifications**
   - Click `+ Capability`
   - Tìm và thêm "Push Notifications"

6. Thêm Capability: **Background Modes**
   - Click `+ Capability`
   - Tìm và thêm "Background Modes"
   - Check ✅ "Remote notifications"

---

### **2. Firebase Console - APNs Setup**

1. Truy cập: https://console.firebase.google.com/

2. Chọn project: `qbis-d998a`

3. Project Settings → Cloud Messaging → iOS app configuration

4. Upload **APNs Authentication Key** hoặc **APNs Certificate**:

   **Option A: APNs Auth Key (Recommended)**
   - Generate từ Apple Developer Portal
   - Key ID, Team ID cần có

   **Option B: APNs Certificate**
   - Development hoặc Production
   - Generate từ Keychain Access

---

### **3. Build & Run trên Device**

1. Connect iPhone/iPad vào Mac

2. Trong Xcode:
   - Chọn device từ dropdown (không phải simulator)
   - Click Run (⌘R)

3. Nếu gặp lỗi "Developer Mode disabled":
   - Trên iPhone: Settings → Privacy & Security → Developer Mode → ON
   - Restart device

4. Nếu gặp lỗi "Untrusted Developer":
   - Trên iPhone: Settings → General → VPN & Device Management
   - Trust certificate

---

## ✅ Verification Steps

### **1. Check Console Logs**

Sau khi app chạy trên device, kiểm tra logs:

```
✅ Notification permission granted: 1
✅ FCM Token: [long-token-string]
```

**Nếu thấy lỗi:**
```
❌ Error getting FCM token: [messaging/unregistered]
```
→ APNs chưa được config đúng trên Firebase Console

---

### **2. Send Test Notification**

#### **From Firebase Console:**

1. Firebase Console → Cloud Messaging → Send your first message

2. **Notification text:**
   - Title: "Test Notification"
   - Text: "Hello from Firebase!"

3. **Target:**
   - Chọn "Single device"
   - Paste FCM Token từ console log

4. Click **Test** hoặc **Send**

#### **Expected Results:**

**App in Foreground:**
- Alert dialog hiển thị với title và message

**App in Background:**
- System notification xuất hiện
- Tap → mở app
- Console log: "Notification caused app to open from background state"

**App Killed:**
- System notification xuất hiện
- Tap → launch app
- Console log: "Notification caused app to open from quit state"

---

## 🐛 Troubleshooting

### **Problem: No FCM Token**

**Symptoms:**
```
❌ Error getting FCM token: [messaging/unregistered]
```

**Solutions:**
1. Kiểm tra APNs certificate trên Firebase Console
2. Kiểm tra Bundle ID match: `vn.qbis.akito`
3. Kiểm tra Push Notifications capability enabled
4. Clean build: Product → Clean Build Folder (⇧⌘K)
5. Reinstall app

---

### **Problem: Permission Denied**

**Symptoms:**
```
❌ Notification permission not granted
```

**Solutions:**
1. Xóa app khỏi device
2. Settings → Notifications → Reset permissions
3. Cài lại app
4. Accept permission khi prompted

---

### **Problem: Notifications Not Received**

**Checklist:**
- [ ] APNs certificate valid và đúng environment (Dev/Prod)
- [ ] Background Modes → Remote notifications enabled
- [ ] Device có internet connection
- [ ] FCM token đúng (không expired)
- [ ] Firebase Console → Cloud Messaging có log thành công

---

## 📊 Current Status

### **Simulator** ⚠️
- ❌ Push notifications: Not supported
- ✅ Other features: Work normally
- ℹ️ Use for: UI/UX testing only

### **Real Device** ✅
- ✅ Push notifications: Fully supported
- ✅ FCM token: Available
- ✅ All notification states: Working
- ℹ️ Use for: Complete testing

---

## 🎯 Testing Checklist

- [ ] App runs on real iOS device
- [ ] Push Notifications capability enabled
- [ ] Background Modes → Remote notifications enabled
- [ ] APNs configured on Firebase Console
- [ ] Bundle ID matches: `vn.qbis.akito`
- [ ] Permission granted on device
- [ ] FCM token obtained successfully
- [ ] Test notification received (foreground)
- [ ] Test notification received (background)
- [ ] Test notification received (killed state)
- [ ] Notification tap opens app correctly

---

## 📝 Notes

1. **Development vs Production:**
   - Development APNs: For debug builds
   - Production APNs: For TestFlight/App Store builds
   - Configure both trong Firebase Console

2. **Token Management:**
   - FCM token có thể change khi:
     - App reinstall
     - Device restore
     - APNs certificate change
   - Cần update token lên server khi có thay đổi

3. **Background Notifications:**
   - iOS có thể throttle background notifications
   - Priority càng cao càng reliable
   - Silent notifications có limits

---

## 🚀 Next Steps

1. Test trên real device
2. Configure APNs trên Firebase Console
3. Send test notification
4. Integrate token storage với backend
5. Setup deep linking cho notification actions

---

*Last updated: 2026-01-06*
