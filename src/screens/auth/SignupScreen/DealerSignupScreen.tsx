import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  StatusBar,
  Image,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import ImagePicker from 'react-native-image-crop-picker';
import { COLORS, SPACING, BORDER_RADIUS } from '../../../config/theme';
import { USER_TYPE } from '../../../config/constants';
import { AuthStackParamList } from '../../../navigation/AuthNavigator';
import CustomHeader from '../../../components/CustomHeader';
import ProvinceSelector from '../../../components/ProvinceSelector';
import { uploadService, UploadedFile } from '../../../api/uploadService';
import { authService } from '../../../api/authService';

type DealerSignupScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'DealerSignup'>;

interface ImageItem {
  src: string;
  uri: string;
}

// Dealer Signup Validation Schema
const dealerSignupSchema = z.object({
  hoten: z.string().min(1, 'Tên đơn vị là bắt buộc'),
  phone: z.string().min(1, 'Số điện thoại là bắt buộc').regex(/^[0-9]{10}$/, 'Số điện thoại không hợp lệ'),
  email: z.string().email('Email không hợp lệ').optional().or(z.literal('')),
  address: z.string().min(1, 'Địa chỉ là bắt buộc'),
  city: z.string().min(1, 'Tỉnh thành là bắt buộc'),
  sotaikhoan: z.string().min(1, 'Số tài khoản là bắt buộc'),
  tentaikhoan: z.string().min(1, 'Tên tài khoản là bắt buộc'),
  nganhang: z.string().min(1, 'Ngân hàng là bắt buộc'),
  tendangnhap: z.string().min(1, 'Tên đăng nhập là bắt buộc').regex(/^[a-z0-9]+$/, 'Tên đăng nhập viết liền không dấu'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
  repassword: z.string().min(1, 'Vui lòng nhập lại mật khẩu'),
}).refine((data) => data.password === data.repassword, {
  message: 'Mật khẩu xác nhận không khớp',
  path: ['repassword'],
});

type DealerSignupFormData = z.infer<typeof dealerSignupSchema>;

const DealerSignupScreen: React.FC = () => {
  const navigation = useNavigation<DealerSignupScreenNavigationProp>();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showRePassword, setShowRePassword] = useState(false);
  const [images, setImages] = useState<ImageItem[]>([]);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<DealerSignupFormData>({
    resolver: zodResolver(dealerSignupSchema),
    defaultValues: {
      hoten: '',
      phone: '',
      email: '',
      address: '',
      city: '',
      sotaikhoan: '',
      tentaikhoan: '',
      nganhang: '',
      tendangnhap: '',
      password: '',
      repassword: '',
    },
  });

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

      const newImage: ImageItem = {
        src: image.path,
        uri: image.path,
      };

      setImages([...images, newImage]);
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
      const newImages: ImageItem[] = selectedImages.map((img) => ({
        src: img.path,
        uri: img.path,
      }));

      setImages([...images, ...newImages]);
    } catch (error: any) {
      if (error.code !== 'E_PICKER_CANCELLED') {
        Alert.alert('Lỗi', 'Không thể chọn ảnh. Vui lòng thử lại.');
        console.error('Image picker error:', error);
      }
    }
  };

  const handleRemoveImage = (index: number) => {
    const updatedImages = images.filter((_, i) => i !== index);
    setImages(updatedImages);
  };

  const onSubmit = async (data: DealerSignupFormData) => {
    // Validate images
    if (images.length < 4) {
      Alert.alert('Thông báo', 'Vui lòng tải lên ít nhất 4 hình ảnh');
      return;
    }

    // Validate terms
    if (!termsAccepted) {
      Alert.alert('Thông báo', 'Vui lòng đồng ý với điều khoản sử dụng');
      return;
    }

    try {
      setIsLoading(true);

      let uploadedFiles: UploadedFile[] = [];

      // Step 1: Upload images
      console.log(`📤 Starting upload of ${images.length} images...`);

      try {
        // Extract URIs from ImageItem array
        const imagePaths = images.map((img) => img.uri);
        uploadedFiles = await uploadService.uploadMultipleImages(imagePaths);
        console.log(`✅ All images uploaded:`, uploadedFiles);
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

      // Step 2: Submit dealer signup with uploaded image files
      console.log('📋 Dealer Signup Data:', {
        ...data,
        files: uploadedFiles,
      });

      // Prepare signup request data
      const signupData = {
        tendangnhap: data.tendangnhap,
        pasword: data.password, // Note: API uses 'pasword' typo
        hoten: data.hoten,
        phone: data.phone,
        email: data.email || '',
        repassword: data.repassword,
        address: data.address,
        imgs: uploadedFiles,
        loai: USER_TYPE.DEALER, // 2 for Dealer
        tendiaban: '', // Will be implemented later
        madiaban: '', // Will be implemented later
        sotaikhoan: data.sotaikhoan,
        nganhang: data.nganhang,
        tentaikhoan: data.tentaikhoan,
      };

      console.log('🚀 Calling signup API with data:', signupData);

      // Call signup API
      const response = await authService.signup(signupData);

      console.log('✅ Signup successful:', response);

      Alert.alert(
        'Đăng ký thành công',
        response.message || 'Tài khoản đại lý của bạn đã được tạo thành công!',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Login'),
          },
        ]
      );
    } catch (error: any) {
      console.error('❌ Signup error:', error);
      Alert.alert(
        'Đăng ký thất bại',
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

      {/* Custom Header */}
      <CustomHeader
        title="Đăng ký tài khoản đại lý"
        leftIcon={<Text style={styles.backIconHeader}>‹</Text>}
        onLeftPress={() => navigation.goBack()}
      />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Dealer Registration Form */}
        <View style={styles.registrationCard}>
          {/* Tên đơn vị */}
          <Controller
            control={control}
            name="hoten"
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>
                  Tên đơn vị <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={[styles.input, errors.hoten && styles.inputError]}
                  placeholder="Nhập tên đơn vị"
                  placeholderTextColor={COLORS.textSecondary}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                />
                {errors.hoten && (
                  <Text style={styles.errorText}>{errors.hoten.message}</Text>
                )}
              </View>
            )}
          />

          {/* Số điện thoại */}
          <Controller
            control={control}
            name="phone"
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>
                  Số điện thoại <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={[styles.input, errors.phone && styles.inputError]}
                  placeholder="Nhập số điện thoại"
                  placeholderTextColor={COLORS.textSecondary}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  keyboardType="phone-pad"
                />
                {errors.phone && (
                  <Text style={styles.errorText}>{errors.phone.message}</Text>
                )}
              </View>
            )}
          />

          {/* Email */}
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Email</Text>
                <TextInput
                  style={[styles.input, errors.email && styles.inputError]}
                  placeholder="Nhập email"
                  placeholderTextColor={COLORS.textSecondary}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                {errors.email && (
                  <Text style={styles.errorText}>{errors.email.message}</Text>
                )}
              </View>
            )}
          />

          {/* Địa chỉ */}
          <Controller
            control={control}
            name="address"
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>
                  Địa chỉ <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={[styles.input, errors.address && styles.inputError]}
                  placeholder="Nhập địa chỉ"
                  placeholderTextColor={COLORS.textSecondary}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                />
                {errors.address && (
                  <Text style={styles.errorText}>{errors.address.message}</Text>
                )}
              </View>
            )}
          />

          {/* Tỉnh thành */}
          <Controller
            control={control}
            name="city"
            render={({ field: { onChange, value } }) => (
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>
                  Tỉnh thành <Text style={styles.required}>*</Text>
                </Text>
                <ProvinceSelector
                  selectedProvince={value}
                  onProvinceChange={onChange}
                  placeholder="Chọn tỉnh thành"
                />
                {errors.city && (
                  <Text style={styles.errorText}>{errors.city.message}</Text>
                )}
              </View>
            )}
          />

          {/* Số tài khoản */}
          <Controller
            control={control}
            name="sotaikhoan"
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>
                  Số tài khoản ngân hàng<Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={[styles.input, errors.sotaikhoan && styles.inputError]}
                  placeholder="Nhập số tài khoản"
                  placeholderTextColor={COLORS.textSecondary}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  keyboardType="number-pad"
                />
                {errors.sotaikhoan && (
                  <Text style={styles.errorText}>{errors.sotaikhoan.message}</Text>
                )}
              </View>
            )}
          />

          {/* Tên tài khoản */}
          <Controller
            control={control}
            name="tentaikhoan"
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>
                  Tên tài khoản ngân hàng<Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={[styles.input, errors.tentaikhoan && styles.inputError]}
                  placeholder="Nhập tên tài khoản"
                  placeholderTextColor={COLORS.textSecondary}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                />
                {errors.tentaikhoan && (
                  <Text style={styles.errorText}>{errors.tentaikhoan.message}</Text>
                )}
              </View>
            )}
          />

          {/* Ngân hàng */}
          <Controller
            control={control}
            name="nganhang"
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>
                  Ngân hàng <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={[styles.input, errors.nganhang && styles.inputError]}
                  placeholder="Nhập tên ngân hàng"
                  placeholderTextColor={COLORS.textSecondary}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                />
                {errors.nganhang && (
                  <Text style={styles.errorText}>{errors.nganhang.message}</Text>
                )}
              </View>
            )}
          />

          {/* Tên đăng nhập */}
          <Controller
            control={control}
            name="tendangnhap"
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>
                  Tên đăng nhập <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={[styles.input, errors.tendangnhap && styles.inputError]}
                  placeholder="Nhập tên đăng nhập"
                  placeholderTextColor={COLORS.textSecondary}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  autoCapitalize="none"
                />
                {errors.tendangnhap && (
                  <Text style={styles.errorText}>{errors.tendangnhap.message}</Text>
                )}
              </View>
            )}
          />

          {/* Mật khẩu */}
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>
                  Mật khẩu <Text style={styles.required}>*</Text>
                </Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={[
                      styles.input,
                      styles.passwordInput,
                      errors.password && styles.inputError,
                    ]}
                    placeholder="Nhập mật khẩu"
                    placeholderTextColor={COLORS.textSecondary}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity
                    style={styles.eyeIcon}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Text style={styles.eyeIconText}>{showPassword ? 'Ẩn' : 'Hiện'}</Text>
                  </TouchableOpacity>
                </View>
                {errors.password && (
                  <Text style={styles.errorText}>{errors.password.message}</Text>
                )}
              </View>
            )}
          />

          {/* Nhập lại mật khẩu */}
          <Controller
            control={control}
            name="repassword"
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>
                  Nhập lại mật khẩu <Text style={styles.required}>*</Text>
                </Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={[
                      styles.input,
                      styles.passwordInput,
                      errors.repassword && styles.inputError,
                    ]}
                    placeholder="Nhập lại mật khẩu"
                    placeholderTextColor={COLORS.textSecondary}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    secureTextEntry={!showRePassword}
                  />
                  <TouchableOpacity
                    style={styles.eyeIcon}
                    onPress={() => setShowRePassword(!showRePassword)}
                  >
                    <Text style={styles.eyeIconText}>{showRePassword ? 'Ẩn' : 'Hiện'}</Text>
                  </TouchableOpacity>
                </View>
                {errors.repassword && (
                  <Text style={styles.errorText}>{errors.repassword.message}</Text>
                )}
              </View>
            )}
          />

          {/* Image Upload */}
          <View style={styles.imageUploadSection}>
            <Text style={styles.sectionTitle}>
              Hình ảnh <Text style={styles.required}>*</Text>
            </Text>
            <Text style={styles.sectionSubtitle}>Tối thiểu 4 hình ảnh gồm Giấy tờ doanh nghiệp và ảnh cửa hàng</Text>

            <View style={styles.imageGrid}>
              {images.map((image, index) => (
                <View key={index} style={styles.imageItem}>
                  <Image source={{ uri: image.uri }} style={styles.imagePreview} />
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => handleRemoveImage(index)}
                  >
                    <Text style={styles.removeImageText}>×</Text>
                  </TouchableOpacity>
                </View>
              ))}

              {images.length < 6 && (
                <TouchableOpacity
                  style={styles.addImageButton}
                  onPress={handleAddImage}
                  activeOpacity={0.7}
                >
                  <Text style={styles.addImageIcon}>📷</Text>
                  <Text style={styles.addImageText}>Thêm ảnh</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Terms and Conditions */}
          <TouchableOpacity
            style={styles.termsContainer}
            onPress={() => setTermsAccepted(!termsAccepted)}
            activeOpacity={0.7}
          >
            <View style={[styles.checkbox, termsAccepted && styles.checkboxChecked]}>
              {termsAccepted && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.termsText}>
              Tôi đã đọc, hiểu và chấp nhận{' '}
              <Text style={styles.termsLink}>Điều kiện và điều khoản hội viên</Text>
            </Text>
          </TouchableOpacity>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
            onPress={handleSubmit(onSubmit)}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.submitButtonText}>Đăng ký</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  backIconHeader: {
    fontSize: 32,
    color: COLORS.white,
    fontWeight: '300',
  },
  scrollView: {
    flex: 1,
  },

  // Registration Card
  registrationCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    marginBottom: SPACING.xl,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },

  // Input Fields
  inputContainer: {
    marginBottom: SPACING.md,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  required: {
    color: COLORS.error,
  },
  input: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.gray300,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  errorText: {
    fontSize: 12,
    color: COLORS.error,
    marginTop: SPACING.xs,
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 48,
  },
  eyeIcon: {
    position: 'absolute',
    right: 12,
    top: 0,
    bottom: 0,
    padding: 4,
    minWidth: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyeIconText: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '600',
  },

  // Image Upload
  imageUploadSection: {
    marginTop: SPACING.md,
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  imageItem: {
    position: 'relative',
    width: 100,
    height: 100,
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
  addImageButton: {
    width: 100,
    height: 100,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: COLORS.gray300,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addImageIcon: {
    fontSize: 32,
    marginBottom: 4,
  },
  addImageText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },

  // Terms
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: COLORS.gray300,
    borderRadius: 4,
    marginRight: SPACING.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  checkmark: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
  termsText: {
    fontSize: 14,
    color: COLORS.textPrimary,
    flex: 1,
  },
  termsLink: {
    color: COLORS.primary,
    fontWeight: '600',
  },

  // Submit Button
  submitButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  submitButtonDisabled: {
    backgroundColor: COLORS.gray400,
  },
  submitButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
});

export default DealerSignupScreen;
