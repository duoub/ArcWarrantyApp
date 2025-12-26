import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  StatusBar,
  Image,
  PermissionsAndroid,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import ImagePicker from 'react-native-image-crop-picker';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../../config/theme';
import CustomHeader from '../../../components/CustomHeader';
import BarcodeScanner from '../../../components/BarcodeScanner';
import LocationSelector from '../../../components/LocationSelector';
import { Location } from '../../../types/province';
import { uploadService } from '../../../api/uploadService';

const WarrantyReportScreen = () => {
  const navigation = useNavigation();

  // Form states
  const [serial, setSerial] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [province, setProvince] = useState<Location | null>(null);
  const [district, setDistrict] = useState<Location | null>(null);
  const [ward, setWard] = useState<Location | null>(null);
  const [address, setAddress] = useState('');
  const [issueDescription, setIssueDescription] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showScanner, setShowScanner] = useState(false);

  const handleScanQR = () => {
    setShowScanner(true);
  };

  const handleScanComplete = (data: string) => {
    setSerial(data);
    setShowScanner(false);
  };

  const handleSearchByPhone = () => {
    Alert.alert(
      'Tìm theo SĐT',
      'Tính năng tìm kiếm theo số điện thoại đang được phát triển.',
      [{ text: 'OK' }]
    );
  };

  const handleAddImage = () => {
    Alert.alert(
      'Thêm ảnh',
      'Chọn nguồn ảnh',
      [
        {
          text: 'Chụp ảnh',
          onPress: () => handleTakePhoto(),
        },
        {
          text: 'Thư viện',
          onPress: () => handlePickFromLibrary(),
        },
        {
          text: 'Hủy',
          style: 'cancel',
        },
      ],
      { cancelable: true }
    );
  };

  const handleTakePhoto = async () => {
    try {
      // Request camera permission for Android
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Quyền truy cập Camera',
            message: 'Ứng dụng cần quyền truy cập camera để chụp ảnh.',
            buttonNeutral: 'Hỏi sau',
            buttonNegative: 'Từ chối',
            buttonPositive: 'Đồng ý',
          }
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert('Lỗi', 'Bạn cần cấp quyền truy cập camera để tiếp tục.');
          return;
        }
      }

      const image = await ImagePicker.openCamera({
        mediaType: 'photo',
        compressImageQuality: 0.8,
      });

      // Add the new image to the images array
      setImages([...images, image.path]);
    } catch (error: any) {
      if (error.code !== 'E_PICKER_CANCELLED') {
        Alert.alert('Lỗi', 'Không thể chụp ảnh. Vui lòng thử lại.');
        console.error('Camera error:', error);
      }
    }
  };

  const handlePickFromLibrary = async () => {
    try {
      const selectedImages = await ImagePicker.openPicker({
        multiple: true,
        mediaType: 'photo',
        compressImageQuality: 0.8,
      });

      // Add all selected images to the images array
      const imagePaths = selectedImages.map((img) => img.path);
      setImages([...images, ...imagePaths]);
    } catch (error: any) {
      if (error.code !== 'E_PICKER_CANCELLED') {
        Alert.alert('Lỗi', 'Không thể chọn ảnh. Vui lòng thử lại.');
        console.error('Image picker error:', error);
      }
    }
  };

  const handleRemoveImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
  };

  const handleSubmit = async () => {
    // Validation
    // if (!serial.trim()) {
    //   Alert.alert('Lỗi', 'Vui lòng nhập số serial');
    //   return;
    // }
    // if (!customerName.trim()) {
    //   Alert.alert('Lỗi', 'Vui lòng nhập tên khách hàng');
    //   return;
    // }
    // if (!phone.trim()) {
    //   Alert.alert('Lỗi', 'Vui lòng nhập số điện thoại');
    //   return;
    // }
    // if (!province) {
    //   Alert.alert('Lỗi', 'Vui lòng chọn tỉnh thành');
    //   return;
    // }
    // if (!district) {
    //   Alert.alert('Lỗi', 'Vui lòng chọn quận huyện');
    //   return;
    // }
    // if (!ward) {
    //   Alert.alert('Lỗi', 'Vui lòng chọn xã phường');
    //   return;
    // }
    // if (!address.trim()) {
    //   Alert.alert('Lỗi', 'Vui lòng nhập địa chỉ');
    //   return;
    // }
    // if (!issueDescription.trim()) {
    //   Alert.alert('Lỗi', 'Vui lòng nhập thông tin lỗi');
    //   return;
    // }

    try {
      setIsLoading(true);

      let uploadedImageUrls: string[] = [];

      // Step 1: Upload images if any
      if (images.length > 0) {
        console.log(`📤 Starting upload of ${images.length} images...`);

        try {
          uploadedImageUrls = await uploadService.uploadMultipleImages(images);
          console.log(`✅ All images uploaded:`, uploadedImageUrls);
        } catch (uploadError: any) {
          console.error('❌ Image upload failed:', uploadError);
          Alert.alert(
            'Lỗi upload ảnh',
            uploadError.message || 'Không thể upload ảnh. Vui lòng thử lại.',
            [{ text: 'OK' }]
          );
          setIsLoading(false);
          return;
        }
      }

      // Step 2: Submit warranty report with uploaded image URLs
      // TODO: Call warranty report API here with uploadedImageUrls
      console.log('📋 Submitting warranty report with data:', {
        serial,
        customerName,
        phone,
        province: province?.TenDiaBan,
        district: district?.TenDiaBan,
        ward: ward?.TenDiaBan,
        address,
        issueDescription,
        imageUrls: uploadedImageUrls,
      });

      // Simulate API call
      await new Promise<void>((resolve) => setTimeout(resolve, 1000));

      Alert.alert(
        'Thành công',
        'Báo ca bảo hành đã được gửi thành công!',
        [
          {
            text: 'OK',
            onPress: () => {
              // Clear form or navigate back
              navigation.goBack();
            },
          },
        ]
      );
    } catch (error: any) {
      console.error('❌ Submit error:', error);
      Alert.alert(
        'Lỗi',
        error.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      <CustomHeader
        title="Báo ca bảo hành"
        leftIcon={<Text style={styles.backIcon}>‹</Text>}
        onLeftPress={() => navigation.goBack()}
      />

      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.formCard}>
            {/* Serial Number */}
            <View style={styles.inputContainer}>
              <View style={styles.labelRow}>
                <Text style={styles.inputLabel}>
                  Số serial <Text style={styles.required}>*</Text>
                </Text>
                <TouchableOpacity onPress={handleSearchByPhone}>
                  <Text style={styles.linkText}>
                    📞 Tìm theo Tên/SĐT
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputIcon}>🔍</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Serial"
                  placeholderTextColor={COLORS.gray400}
                  value={serial}
                  onChangeText={setSerial}
                  editable={!isLoading}
                />
                <TouchableOpacity onPress={handleScanQR} style={styles.scanButton}>
                  <Image
                    source={require('../../../assets/images/scan_me.png')}
                    style={styles.scanImage}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Customer Name */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>
                Tên khách hàng <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputIcon}>👤</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Họ tên"
                  placeholderTextColor={COLORS.gray400}
                  value={customerName}
                  onChangeText={setCustomerName}
                  editable={!isLoading}
                />
              </View>
            </View>

            {/* Phone */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>
                Số điện thoại <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputIcon}>📞</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Số điện thoại"
                  placeholderTextColor={COLORS.gray400}
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  editable={!isLoading}
                />
              </View>
            </View>

            {/* Province */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>
                Tỉnh thành <Text style={styles.required}>*</Text>
              </Text>
              <LocationSelector
                parentCode=""
                selectedLocation={province?.TenDiaBan || ''}
                onLocationChange={(location) => {
                  setProvince(location);
                  setDistrict(null);
                  setWard(null);
                }}
                placeholder="Chọn tỉnh thành"
              />
            </View>

            {/* District */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>
                Quận huyện <Text style={styles.required}>*</Text>
              </Text>
              <LocationSelector
                parentCode={province?.MaDiaBan || ''}
                selectedLocation={district?.TenDiaBan || ''}
                onLocationChange={(location) => {
                  setDistrict(location);
                  setWard(null);
                }}
                placeholder="Chọn quận huyện"
                disabled={!province}
              />
            </View>

            {/* Ward */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>
                Xã phường <Text style={styles.required}>*</Text>
              </Text>
              <LocationSelector
                parentCode={district?.MaDiaBan || ''}
                selectedLocation={ward?.TenDiaBan || ''}
                onLocationChange={setWard}
                placeholder="Chọn xã phường"
                disabled={!district}
              />
            </View>

            {/* Address */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>
                Địa chỉ <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputIcon}>📍</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Địa chỉ"
                  placeholderTextColor={COLORS.gray400}
                  value={address}
                  onChangeText={setAddress}
                  editable={!isLoading}
                  multiline
                  numberOfLines={2}
                />
              </View>
            </View>

            {/* Issue Description */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>
                Thông tin lỗi / hiện tượng hư hỏng <Text style={styles.required}>*</Text>
              </Text>
              <View style={[styles.inputWrapper, styles.textareaWrapper]}>
                <Text style={[styles.inputIcon, styles.textareaIcon]}>📝</Text>
                <TextInput
                  style={[styles.input, styles.textarea]}
                  placeholder="Mô tả chi tiết hiện tượng hư hỏng..."
                  placeholderTextColor={COLORS.gray400}
                  value={issueDescription}
                  onChangeText={setIssueDescription}
                  editable={!isLoading}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>
            </View>

            {/* Add Image Button */}
            <TouchableOpacity
              style={styles.addImageButton}
              onPress={handleAddImage}
              activeOpacity={0.7}
            >
              <Text style={styles.addImageButtonText}>Chụp ảnh thiết bị</Text>
            </TouchableOpacity>

            {/* Images Preview */}
            {images.length > 0 && (
              <View style={styles.imagesContainer}>
                {images.map((image, index) => (
                  <View key={index} style={styles.imageCard}>
                    <Image source={{ uri: image }} style={styles.imagePreview} />
                    <TouchableOpacity
                      style={styles.removeImageButton}
                      onPress={() => handleRemoveImage(index)}
                    >
                      <Text style={styles.removeImageIcon}>🗑️</Text>
                      <Text style={styles.removeImageText}>Xóa</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              activeOpacity={0.8}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={COLORS.white} size="small" />
              ) : (
                <Text style={styles.submitButtonText}>Gửi thông tin</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.bottomSpacing} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Barcode Scanner Modal */}
      <BarcodeScanner
        visible={showScanner}
        onClose={() => setShowScanner(false)}
        onScan={handleScanComplete}
        title="Quét mã sản phẩm"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  backIcon: {
    fontSize: 32,
    color: COLORS.white,
    fontWeight: '300',
  },

  // Form Card
  formCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    ...SHADOWS.md,
  },

  // Input Fields
  inputContainer: {
    marginBottom: SPACING.md,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  required: {
    color: COLORS.error,
  },
  linkText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray50,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    paddingHorizontal: SPACING.md,
    minHeight: 48,
  },
  textareaWrapper: {
    alignItems: 'flex-start',
    paddingVertical: SPACING.sm,
  },
  inputIcon: {
    fontSize: 20,
    marginRight: SPACING.sm,
  },
  textareaIcon: {
    marginTop: SPACING.xs,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: COLORS.textPrimary,
    paddingVertical: SPACING.sm,
  },
  textarea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  scanButton: {
    padding: SPACING.xs,
    marginLeft: SPACING.xs,
  },
  scanIcon: {
    fontSize: 24,
  },
  scanImage: {
    width: 32,
    height: 32,
  },

  // Image Upload
  addImageButton: {
    backgroundColor: COLORS.gray100,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.gray300,
    borderStyle: 'dashed',
  },
  addImageButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  imagesContainer: {
    marginBottom: SPACING.md,
  },
  imageCard: {
    marginBottom: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  imagePreview: {
    width: '100%',
    height: 200,
    backgroundColor: COLORS.gray100,
  },
  removeImageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    paddingVertical: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray200,
  },
  removeImageIcon: {
    fontSize: 16,
    marginRight: SPACING.xs,
  },
  removeImageText: {
    fontSize: 14,
    color: COLORS.error,
    fontWeight: '600',
  },

  // Submit Button
  submitButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 0,
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderRadius: BORDER_RADIUS.md,
    ...SHADOWS.md,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
    letterSpacing: 0.5,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },

  bottomSpacing: {
    height: SPACING.xl,
  },
});

export default WarrantyReportScreen;
