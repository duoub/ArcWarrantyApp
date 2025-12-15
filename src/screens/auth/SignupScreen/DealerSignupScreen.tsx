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
  Modal,
  Pressable,
  StatusBar,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import ImagePicker from 'react-native-image-crop-picker';
import { COLORS, SPACING, BORDER_RADIUS } from '../../../config/theme';
import { AuthStackParamList } from '../../../navigation/AuthNavigator';
import CustomHeader from '../../../components/CustomHeader';

type DealerSignupScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'DealerSignup'>;

interface Province {
  id: string;
  TenDiaBan: string;
}

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

// List of 63 provinces in Vietnam
const PROVINCES: Province[] = [
  { id: '1', TenDiaBan: 'An Giang' },
  { id: '2', TenDiaBan: 'Bà Rịa - Vũng Tàu' },
  { id: '3', TenDiaBan: 'Bắc Giang' },
  { id: '4', TenDiaBan: 'Bắc Kạn' },
  { id: '5', TenDiaBan: 'Bạc Liêu' },
  { id: '6', TenDiaBan: 'Bắc Ninh' },
  { id: '7', TenDiaBan: 'Bến Tre' },
  { id: '8', TenDiaBan: 'Bình Định' },
  { id: '9', TenDiaBan: 'Bình Dương' },
  { id: '10', TenDiaBan: 'Bình Phước' },
  { id: '11', TenDiaBan: 'Bình Thuận' },
  { id: '12', TenDiaBan: 'Cà Mau' },
  { id: '13', TenDiaBan: 'Cần Thơ' },
  { id: '14', TenDiaBan: 'Cao Bằng' },
  { id: '15', TenDiaBan: 'Đà Nẵng' },
  { id: '16', TenDiaBan: 'Đắk Lắk' },
  { id: '17', TenDiaBan: 'Đắk Nông' },
  { id: '18', TenDiaBan: 'Điện Biên' },
  { id: '19', TenDiaBan: 'Đồng Nai' },
  { id: '20', TenDiaBan: 'Đồng Tháp' },
  { id: '21', TenDiaBan: 'Gia Lai' },
  { id: '22', TenDiaBan: 'Hà Giang' },
  { id: '23', TenDiaBan: 'Hà Nam' },
  { id: '24', TenDiaBan: 'Hà Nội' },
  { id: '25', TenDiaBan: 'Hà Tĩnh' },
  { id: '26', TenDiaBan: 'Hải Dương' },
  { id: '27', TenDiaBan: 'Hải Phòng' },
  { id: '28', TenDiaBan: 'Hậu Giang' },
  { id: '29', TenDiaBan: 'Hòa Bình' },
  { id: '30', TenDiaBan: 'Hưng Yên' },
  { id: '31', TenDiaBan: 'Khánh Hòa' },
  { id: '32', TenDiaBan: 'Kiên Giang' },
  { id: '33', TenDiaBan: 'Kon Tum' },
  { id: '34', TenDiaBan: 'Lai Châu' },
  { id: '35', TenDiaBan: 'Lâm Đồng' },
  { id: '36', TenDiaBan: 'Lạng Sơn' },
  { id: '37', TenDiaBan: 'Lào Cai' },
  { id: '38', TenDiaBan: 'Long An' },
  { id: '39', TenDiaBan: 'Nam Định' },
  { id: '40', TenDiaBan: 'Nghệ An' },
  { id: '41', TenDiaBan: 'Ninh Bình' },
  { id: '42', TenDiaBan: 'Ninh Thuận' },
  { id: '43', TenDiaBan: 'Phú Thọ' },
  { id: '44', TenDiaBan: 'Phú Yên' },
  { id: '45', TenDiaBan: 'Quảng Bình' },
  { id: '46', TenDiaBan: 'Quảng Nam' },
  { id: '47', TenDiaBan: 'Quảng Ngãi' },
  { id: '48', TenDiaBan: 'Quảng Ninh' },
  { id: '49', TenDiaBan: 'Quảng Trị' },
  { id: '50', TenDiaBan: 'Sóc Trăng' },
  { id: '51', TenDiaBan: 'Sơn La' },
  { id: '52', TenDiaBan: 'Tây Ninh' },
  { id: '53', TenDiaBan: 'Thái Bình' },
  { id: '54', TenDiaBan: 'Thái Nguyên' },
  { id: '55', TenDiaBan: 'Thanh Hóa' },
  { id: '56', TenDiaBan: 'Thừa Thiên Huế' },
  { id: '57', TenDiaBan: 'Tiền Giang' },
  { id: '58', TenDiaBan: 'TP Hồ Chí Minh' },
  { id: '59', TenDiaBan: 'Trà Vinh' },
  { id: '60', TenDiaBan: 'Tuyên Quang' },
  { id: '61', TenDiaBan: 'Vĩnh Long' },
  { id: '62', TenDiaBan: 'Vĩnh Phúc' },
  { id: '63', TenDiaBan: 'Yên Bái' },
];

const DealerSignupScreen: React.FC = () => {
  const navigation = useNavigation<DealerSignupScreenNavigationProp>();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showRePassword, setShowRePassword] = useState(false);
  const [selectedProvince, setSelectedProvince] = useState<string>('');
  const [showProvinceModal, setShowProvinceModal] = useState(false);
  const [provinceSearchKeyword, setProvinceSearchKeyword] = useState('');
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

  const filteredProvinces = PROVINCES.filter(province =>
    province.TenDiaBan.toLowerCase().includes(provinceSearchKeyword.toLowerCase())
  );

  const handleProvinceSelect = (province: string) => {
    setSelectedProvince(province);
    setValue('city', province);
  };

  const handleAddImage = async () => {
    try {
      const image = await ImagePicker.openCamera({
        width: 800,
        height: 600,
        cropping: true,
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
      }
    }
  };

  const handleRemoveImage = (index: number) => {
    const updatedImages = images.filter((_, i) => i !== index);
    setImages(updatedImages);
  };

  const onSubmit = async (data: DealerSignupFormData) => {
    // Validate images
    if (images.length < 2) {
      Alert.alert('Thông báo', 'Vui lòng tải lên ít nhất 2 hình ảnh');
      return;
    }

    // Validate terms
    if (!termsAccepted) {
      Alert.alert('Thông báo', 'Vui lòng đồng ý với điều khoản sử dụng');
      return;
    }

    try {
      setIsLoading(true);

      // TODO: Implement API call to signup
      console.log('Dealer Signup Data:', data);
      console.log('Images:', images);

      // Simulate API call
      await new Promise<void>((resolve) => setTimeout(() => resolve(), 2000));

      Alert.alert(
        'Đăng ký thành công',
        'Tài khoản đại lý của bạn đã được tạo thành công!',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Login'),
          },
        ]
      );
    } catch (error) {
      Alert.alert(
        'Đăng ký thất bại',
        error instanceof Error ? error.message : 'Đã có lỗi xảy ra. Vui lòng thử lại.'
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
            render={({ field: { value } }) => (
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>
                  Tỉnh thành <Text style={styles.required}>*</Text>
                </Text>
                <TouchableOpacity
                  style={[styles.input, styles.selectInput, errors.city && styles.inputError]}
                  onPress={() => setShowProvinceModal(true)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.selectInputText,
                      !selectedProvince && styles.selectPlaceholder,
                    ]}
                  >
                    {selectedProvince || 'Chọn tỉnh thành'}
                  </Text>
                  <Text style={styles.dropdownIcon}>▼</Text>
                </TouchableOpacity>
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
                  Số tài khoản <Text style={styles.required}>*</Text>
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
                  Tên tài khoản <Text style={styles.required}>*</Text>
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
            <Text style={styles.sectionSubtitle}>Tối thiểu 2 hình ảnh</Text>

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

      {/* Province Selection Modal */}
      <Modal
        visible={showProvinceModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setShowProvinceModal(false);
          setProvinceSearchKeyword('');
        }}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => {
              setShowProvinceModal(false);
              setProvinceSearchKeyword('');
            }}
          />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chọn tỉnh thành</Text>
              <TouchableOpacity
                onPress={() => {
                  setShowProvinceModal(false);
                  setProvinceSearchKeyword('');
                }}
              >
                <Text style={styles.modalCloseButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.searchInput}
              placeholder="Tìm kiếm tỉnh thành..."
              placeholderTextColor={COLORS.textSecondary}
              value={provinceSearchKeyword}
              onChangeText={setProvinceSearchKeyword}
            />

            <ScrollView style={styles.provinceList}>
              {filteredProvinces.length === 0 ? (
                <Text style={styles.noResultsText}>Không tìm thấy tỉnh thành</Text>
              ) : (
                filteredProvinces.map((province) => (
                  <TouchableOpacity
                    key={province.id}
                    style={[
                      styles.provinceOption,
                      selectedProvince === province.TenDiaBan &&
                      styles.provinceOptionActive,
                    ]}
                    onPress={() => {
                      handleProvinceSelect(province.TenDiaBan);
                      setShowProvinceModal(false);
                      setProvinceSearchKeyword('');
                    }}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.provinceOptionText,
                        selectedProvince === province.TenDiaBan &&
                        styles.provinceOptionTextActive,
                      ]}
                    >
                      {province.TenDiaBan}
                    </Text>
                    {selectedProvince === province.TenDiaBan && (
                      <Text style={styles.checkIcon}>✓</Text>
                    )}
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  selectInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectInputText: {
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  selectPlaceholder: {
    color: COLORS.textSecondary,
  },
  dropdownIcon: {
    fontSize: 12,
    color: COLORS.textSecondary,
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

  // Province Modal
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    maxHeight: '80%',
    paddingBottom: SPACING.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  modalCloseButton: {
    fontSize: 24,
    color: COLORS.textSecondary,
  },
  searchInput: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.gray300,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: 15,
    color: COLORS.textPrimary,
    margin: SPACING.lg,
  },
  provinceList: {
    paddingHorizontal: SPACING.lg,
  },
  provinceOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  provinceOptionActive: {
    backgroundColor: COLORS.primaryLight,
  },
  provinceOptionText: {
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  provinceOptionTextActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  checkIcon: {
    fontSize: 18,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  noResultsText: {
    textAlign: 'center',
    color: COLORS.textSecondary,
    paddingVertical: SPACING.xl,
  },
});

export default DealerSignupScreen;
