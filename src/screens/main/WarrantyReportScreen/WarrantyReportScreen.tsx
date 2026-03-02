import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ActivityIndicator,
  Alert,
  StatusBar,
  Image,
  PermissionsAndroid,
  Dimensions,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useNavigation } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import ImagePicker from 'react-native-image-crop-picker';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../../config/theme';
import CustomHeader from '../../../components/CustomHeader';
import BarcodeScanner from '../../../components/BarcodeScanner/BarcodeScanner';
import LocationSelector from '../../../components/LocationSelector';
import { Location } from '../../../types/province';
import { uploadService, UploadedFile } from '../../../api/uploadService';
import { warrantyService } from '../../../api/warrantyService';
import { warrantyLookupService } from '../../../api/warrantyLookupService';
import { provinceService } from '../../../api/provinceService';
import { Icon } from '../../../components/common';
import CustomerLookupModal from '../../../components/CustomerLookupModal';
import { WarrantyInfo } from '../../../types/warrantyLookup';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
// cardPadding = SPACING.lg (mỗi bên), cardMargin = SPACING.screen_lg (mỗi bên), gap = SPACING.md
const IMAGE_SIZE = (SCREEN_WIDTH - SPACING.screen_lg * 2 - SPACING.lg * 2 - SPACING.md) / 2;

// Validation Schema
const warrantyReportSchema = z.object({
  serial: z.string().min(1, 'Số serial là bắt buộc'),
  customerName: z.string().min(1, 'Tên khách hàng là bắt buộc'),
  phone: z
    .string()
    .min(1, 'Số điện thoại là bắt buộc')
    .regex(/^[0-9]{9,11}$/, 'Số điện thoại không hợp lệ'),
  tinhthanh: z.string().min(1, 'Tỉnh thành là bắt buộc'),
  quanhuyen: z.string().min(1, 'Quận huyện là bắt buộc'),
  xaphuong: z.string().min(1, 'Xã phường là bắt buộc'),
  address: z.string().min(1, 'Địa chỉ là bắt buộc'),
  issueDescription: z.string().min(1, 'Thông tin lỗi là bắt buộc'),
});

type WarrantyReportFormData = z.infer<typeof warrantyReportSchema>;

const WarrantyReportScreen = () => {
  const navigation = useNavigation();

  // Location states
  const [province, setProvince] = useState<Location | null>(null);
  const [district, setDistrict] = useState<Location | null>(null);
  const [ward, setWard] = useState<Location | null>(null);

  // Other states
  const [images, setImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLookingUpSerial, setIsLookingUpSerial] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [showCustomerLookup, setShowCustomerLookup] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm<WarrantyReportFormData>({
    resolver: zodResolver(warrantyReportSchema),
    defaultValues: {
      serial: '',
      customerName: '',
      phone: '',
      tinhthanh: '',
      quanhuyen: '',
      xaphuong: '',
      address: '',
      issueDescription: '',
    },
  });

  const handleScanQR = () => {
    setShowScanner(true);
  };

  const handleScanComplete = (data: string) => {
    setValue('serial', data);
    setShowScanner(false);
  };

  const handleSearchByPhone = () => {
    setShowCustomerLookup(true);
  };

  /**
   * Auto-fill location selectors from formatted address
   * Parses the formattedAddress which contains province, district, ward info
   */
  const autoFillLocations = async (warrantyInfo: WarrantyInfo) => {
    if (!warrantyInfo.formattedAddress) return;

    try {
      // Extract location names from formattedAddress
      // Format: "xxx - Xã xxx - Huyện xxx - Tỉnh xxx"
      const parts = warrantyInfo.formattedAddress.split(' - ');

      let provinceName = '';
      let districtName = '';
      let wardName = '';

      // Find province, district, ward by their prefixes
      parts.forEach(part => {
        if (part.startsWith('Tỉnh ') || part.startsWith('Thành phố ')) {
          provinceName = part;
        } else if (part.startsWith('Huyện ') || part.startsWith('Quận ') || part.startsWith('Thị xã ')) {
          districtName = part;
        } else if (part.startsWith('Xã ') || part.startsWith('Phường ') || part.startsWith('Thị trấn ')) {
          wardName = part;
        }
      });

      // Step 1: Find and set province
      if (provinceName) {
        const provincesResponse = await provinceService.getProvinces();
        const foundProvince = provincesResponse.list.find(
          p => p.TenDiaBan === provinceName
        );

        if (foundProvince) {
          setProvince(foundProvince);
          setValue('tinhthanh', foundProvince.TenDiaBan);

          // Step 2: Find and set district
          if (districtName) {
            const districtsResponse = await provinceService.getLocations(foundProvince.MaDiaBan);
            const foundDistrict = districtsResponse.list.find(
              d => d.TenDiaBan === districtName
            );

            if (foundDistrict) {
              setDistrict(foundDistrict);
              setValue('quanhuyen', foundDistrict.TenDiaBan);

              // Step 3: Find and set ward
              if (wardName) {
                const wardsResponse = await provinceService.getLocations(foundDistrict.MaDiaBan);
                const foundWard = wardsResponse.list.find(
                  w => w.TenDiaBan === wardName
                );

                if (foundWard) {
                  setWard(foundWard);
                  setValue('xaphuong', foundWard.TenDiaBan);
                }
              }
            }
          }
        }
      }
    } catch (error) {
      // Silently fail - user can manually select if auto-fill fails
    }
  };

  const handleSelectCustomer = (customer: WarrantyInfo) => {
    // Auto-fill form fields with customer data
    setValue('serial', customer.serial);
    setValue('customerName', customer.customerName);
    setValue('phone', customer.customerMobile || customer.customerPhone);
    setValue('address', customer.customerAddress);

    // Reset location selectors first
    setProvince(null);
    setDistrict(null);
    setWard(null);
    setValue('tinhthanh', '');
    setValue('quanhuyen', '');
    setValue('xaphuong', '');

    // Auto-fill location selectors from formatted address if available
    if (customer.formattedAddress) {
      autoFillLocations(customer);
    }
  };

  const handleSerialBlur = async (serial: string) => {
    if (!serial.trim()) return;

    try {
      setIsLookingUpSerial(true);

      const response = await warrantyLookupService.lookupWarranty({
        keyword: serial.trim(),
      });

      if (response.data && response.data.length > 0) {
        const warrantyInfo = response.data[0]; // Take first result

        // Auto-fill customer information if available
        if (warrantyInfo.customerName) {
          setValue('customerName', warrantyInfo.customerName);
        }
        if (warrantyInfo.customerMobile || warrantyInfo.customerPhone) {
          setValue('phone', warrantyInfo.customerMobile || warrantyInfo.customerPhone);
        }
        if (warrantyInfo.customerAddress) {
          setValue('address', warrantyInfo.customerAddress);
        }

        // Reset location selectors first
        setProvince(null);
        setDistrict(null);
        setWard(null);
        setValue('tinhthanh', '');
        setValue('quanhuyen', '');
        setValue('xaphuong', '');

        // Auto-fill location selectors from formatted address if available
        if (warrantyInfo.formattedAddress) {
          autoFillLocations(warrantyInfo);
        }
      } else {
        // Reset customer fields if no data found
        setValue('customerName', '');
        setValue('phone', '');
        setValue('address', '');

        // Reset location selectors
        setProvince(null);
        setDistrict(null);
        setWard(null);
        setValue('tinhthanh', '');
        setValue('quanhuyen', '');
        setValue('xaphuong', '');
      }
    } catch (error) {
      // Reset customer fields on error
      setValue('customerName', '');
      setValue('phone', '');
      setValue('address', '');

      // Reset location selectors
      setProvince(null);
      setDistrict(null);
      setWard(null);
      setValue('tinhthanh', '');
      setValue('quanhuyen', '');
      setValue('xaphuong', '');
    } finally {
      setIsLookingUpSerial(false);
    }
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
      }
    }
  };

  const handleRemoveImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
  };

  const onSubmit = async (data: WarrantyReportFormData) => {
    try {
      setIsLoading(true);

      let uploadedFiles: UploadedFile[] = [];

      // Step 1: Upload images if any
      if (images.length > 0) {
        try {
          uploadedFiles = await uploadService.uploadMultipleImages(images);
        } catch (uploadError: any) {
          Alert.alert(
            'Lỗi upload ảnh',
            uploadError.message || 'Không thể upload ảnh. Vui lòng thử lại.',
            [{ text: 'OK' }]
          );
          setIsLoading(false);
          return;
        }
      }

      // Step 2: Submit warranty report with uploaded image files
      const response = await warrantyService.report({
        serial: data.serial,
        issueDescription: data.issueDescription,
        customerName: data.customerName,
        phone: data.phone,
        tinhthanh: data.tinhthanh,
        quanhuyen: data.quanhuyen,
        xaphuong: data.xaphuong,
        address: data.address,
        images: uploadedFiles,
      });

      Alert.alert(
        'Thành công',
        response.message || 'Báo cáo bảo hành đã được gửi thành công!',
        [
          {
            text: 'OK',
            onPress: () => {
              // Reset form and navigate back
              reset();
              setProvince(null);
              setDistrict(null);
              setWard(null);
              setImages([]);
              navigation.goBack();
            },
          },
        ]
      );
    } catch (error: any) {
      Alert.alert(
        'Lỗi',
        error instanceof Error ? error.message : 'Đã có lỗi xảy ra. Vui lòng thử lại.',
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

      <KeyboardAwareScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid={true}
        extraScrollHeight={Platform.OS === 'ios' ? 20 : 100}
        extraHeight={120}
      >
          <View style={styles.formCard}>
            {/* Serial Number */}
            <Controller
              control={control}
              name="serial"
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={styles.inputContainer}>
                  <View style={styles.labelRow}>
                    <Text style={styles.inputLabel}>
                      Số serial <Text style={styles.required}>*</Text>
                    </Text>
                    <TouchableOpacity onPress={handleSearchByPhone}>
                      <View style={styles.linkRow}>
                        <Icon name="phone" size={14} color={COLORS.primary} />
                        <Text style={styles.linkText}>Tìm theo Số điện thoại</Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                  <View style={[
                    styles.inputWrapper,
                    errors.serial && styles.inputWrapperError,
                  ]}>
                    <Icon name="search" size={18} color={COLORS.gray500} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Serial"
                      placeholderTextColor={COLORS.gray400}
                      value={value}
                      onChangeText={onChange}
                      onBlur={() => {
                        onBlur();
                        handleSerialBlur(value);
                      }}
                      editable={!isLoading && !isLookingUpSerial}
                    />
                    {isLookingUpSerial ? (
                      <ActivityIndicator
                        size="small"
                        color={COLORS.primary}
                        style={styles.serialLoadingIndicator}
                      />
                    ) : (
                      <TouchableOpacity onPress={handleScanQR} style={styles.scanButton}>
                        <Image
                          source={require('../../../assets/images/scan_me.png')}
                          style={styles.scanImage}
                          resizeMode="contain"
                        />
                      </TouchableOpacity>
                    )}
                  </View>
                  {errors.serial && (
                    <Text style={styles.errorText}>{errors.serial.message}</Text>
                  )}
                </View>
              )}
            />

            {/* Customer Name */}
            <Controller
              control={control}
              name="customerName"
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>
                    Tên khách hàng <Text style={styles.required}>*</Text>
                  </Text>
                  <View style={[
                    styles.inputWrapper,
                    errors.customerName && styles.inputWrapperError,
                  ]}>
                    <Icon name="user" size={20} color={COLORS.gray400} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Họ tên"
                      placeholderTextColor={COLORS.gray400}
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      editable={!isLoading}
                    />
                  </View>
                  {errors.customerName && (
                    <Text style={styles.errorText}>{errors.customerName.message}</Text>
                  )}
                </View>
              )}
            />

            {/* Phone */}
            <Controller
              control={control}
              name="phone"
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>
                    Số điện thoại <Text style={styles.required}>*</Text>
                  </Text>
                  <View style={[
                    styles.inputWrapper,
                    errors.phone && styles.inputWrapperError,
                  ]}>
                    <Icon name="phone" size={20} color={COLORS.gray400} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Số điện thoại"
                      placeholderTextColor={COLORS.gray400}
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      keyboardType="phone-pad"
                      editable={!isLoading}
                    />
                  </View>
                  {errors.phone && (
                    <Text style={styles.errorText}>{errors.phone.message}</Text>
                  )}
                </View>
              )}
            />

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
                  setValue('tinhthanh', location?.TenDiaBan || '');
                  setDistrict(null);
                  setWard(null);
                  setValue('quanhuyen', '');
                  setValue('xaphuong', '');
                }}
                placeholder="Chọn tỉnh thành"
              />
              {errors.tinhthanh && (
                <Text style={styles.errorText}>{errors.tinhthanh.message}</Text>
              )}
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
                  setValue('quanhuyen', location?.TenDiaBan || '');
                  setWard(null);
                  setValue('xaphuong', '');
                }}
                placeholder="Chọn quận huyện"
                disabled={!province}
              />
              {errors.quanhuyen && (
                <Text style={styles.errorText}>{errors.quanhuyen.message}</Text>
              )}
            </View>

            {/* Ward */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>
                Xã phường <Text style={styles.required}>*</Text>
              </Text>
              <LocationSelector
                parentCode={district?.MaDiaBan || ''}
                selectedLocation={ward?.TenDiaBan || ''}
                onLocationChange={(location) => {
                  setWard(location);
                  setValue('xaphuong', location?.TenDiaBan || '');
                }}
                placeholder="Chọn xã phường"
                disabled={!district}
              />
              {errors.xaphuong && (
                <Text style={styles.errorText}>{errors.xaphuong.message}</Text>
              )}
            </View>

            {/* Address */}
            <Controller
              control={control}
              name="address"
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>
                    Địa chỉ <Text style={styles.required}>*</Text>
                  </Text>
                  <View style={[
                    styles.inputWrapper,
                    errors.address && styles.inputWrapperError,
                  ]}>
                    <Icon name="location" size={18} color={COLORS.gray500} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Địa chỉ"
                      placeholderTextColor={COLORS.gray400}
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      editable={!isLoading}
                      multiline
                      numberOfLines={2}
                    />
                  </View>
                  {errors.address && (
                    <Text style={styles.errorText}>{errors.address.message}</Text>
                  )}
                </View>
              )}
            />

            {/* Issue Description */}
            <Controller
              control={control}
              name="issueDescription"
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>
                    Thông tin lỗi / hiện tượng hư hỏng <Text style={styles.required}>*</Text>
                  </Text>
                  <View style={[
                    styles.inputWrapper,
                    styles.textareaWrapper,
                    errors.issueDescription && styles.inputWrapperError,
                  ]}>
                    <Text style={[styles.inputIcon, styles.textareaIcon]}>📝</Text>
                    <TextInput
                      style={[styles.input, styles.textarea]}
                      placeholder="Mô tả chi tiết hiện tượng hư hỏng..."
                      placeholderTextColor={COLORS.gray400}
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      editable={!isLoading}
                      multiline
                      numberOfLines={4}
                      textAlignVertical="top"
                    />
                  </View>
                  {errors.issueDescription && (
                    <Text style={styles.errorText}>{errors.issueDescription.message}</Text>
                  )}
                </View>
              )}
            />

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
                  <View key={index} style={styles.imageItem}>
                    <Image source={{ uri: image }} style={styles.imagePreview} />
                    <TouchableOpacity
                      style={styles.removeImageButton}
                      onPress={() => handleRemoveImage(index)}
                    >
                      <Text style={styles.removeImageText}>×</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
              onPress={handleSubmit(onSubmit)}
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
      </KeyboardAwareScrollView>

      {/* Barcode Scanner Modal */}
      <BarcodeScanner
        visible={showScanner}
        onClose={() => setShowScanner(false)}
        onScan={handleScanComplete}
        title="Quét mã sản phẩm"
      />

      {/* Customer Lookup Modal */}
      <CustomerLookupModal
        visible={showCustomerLookup}
        onClose={() => setShowCustomerLookup(false)}
        onSelectCustomer={handleSelectCustomer}
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
  scrollContent: {
    paddingBottom: SPACING.xl,
  },
  backIcon: {
    fontSize: 32,
    color: COLORS.white,
    fontWeight: '300',
  },

  // Form Card
  formCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.screen_lg,
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
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
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
  inputWrapperError: {
    borderColor: COLORS.error,
  },
  textareaWrapper: {
    alignItems: 'flex-start',
    paddingVertical: SPACING.sm,
  },
  inputIcon: {
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
  serialLoadingIndicator: {
    marginLeft: SPACING.xs,
  },
  errorText: {
    fontSize: 12,
    color: COLORS.error,
    marginTop: SPACING.xs,
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
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  imageItem: {
    position: 'relative',
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    borderRadius: BORDER_RADIUS.md,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: COLORS.error,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeImageText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
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
