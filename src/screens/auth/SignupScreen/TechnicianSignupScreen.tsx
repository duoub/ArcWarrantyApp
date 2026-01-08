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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { COLORS, SPACING, BORDER_RADIUS } from '../../../config/theme';
import { AuthStackParamList } from '../../../navigation/PreLoginRootNavigator';
import CustomHeader from '../../../components/CustomHeader';
import { Icon } from '../../../components/common';
import ProvinceSelector from '../../../components/ProvinceSelector';
import { authService } from '../../../api/authService';
import { USER_TYPES } from '../../../types/user';

type TechnicianSignupScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'TechnicianSignup'>;

// Technician Signup Validation Schema
const technicianSignupSchema = z.object({
  hoten: z.string().min(1, 'Họ và tên là bắt buộc'),
  phone: z.string().min(1, 'Số điện thoại là bắt buộc').regex(/^[0-9]{10}$/, 'Số điện thoại không hợp lệ'),
  email: z.string().email('Email không hợp lệ').optional().or(z.literal('')),
  address: z.string().min(1, 'Địa chỉ là bắt buộc'),
  city: z.string().min(1, 'Tỉnh thành là bắt buộc'),
  tendangnhap: z.string().min(1, 'Tên đăng nhập là bắt buộc').regex(/^[a-z0-9]+$/, 'Tên đăng nhập viết liền không dấu'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
  repassword: z.string().min(1, 'Vui lòng nhập lại mật khẩu'),
}).refine((data) => data.password === data.repassword, {
  message: 'Mật khẩu xác nhận không khớp',
  path: ['repassword'],
});

type TechnicianSignupFormData = z.infer<typeof technicianSignupSchema>;

const TechnicianSignupScreen: React.FC = () => {
  const navigation = useNavigation<TechnicianSignupScreenNavigationProp>();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showRePassword, setShowRePassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [provinceCode, setProvinceCode] = useState('');

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<TechnicianSignupFormData>({
    resolver: zodResolver(technicianSignupSchema),
    defaultValues: {
      hoten: '',
      phone: '',
      email: '',
      address: '',
      city: '',
      tendangnhap: '',
      password: '',
      repassword: '',
    },
  });

  const onSubmit = async (data: TechnicianSignupFormData) => {
    // Validate terms
    if (!termsAccepted) {
      Alert.alert('Thông báo', 'Vui lòng đồng ý với điều khoản sử dụng');
      return;
    }

    try {
      setIsLoading(true);

      // Prepare signup request data
      const signupData = {
        tendangnhap: data.tendangnhap,
        pasword: data.password, // Note: API uses 'pasword' typo
        hoten: data.hoten,
        phone: data.phone,
        email: data.email || '',
        repassword: data.repassword,
        address: data.address,
        imgs: [], // No images for technician
        tendiaban: data.city,
        madiaban: provinceCode,
        sotaikhoan: '', // No bank info for technician
        nganhang: '',
        tentaikhoan: '',
        loai: USER_TYPES.TECHNICIAN
      };

      // Call signup API
      const response = await authService.signup(signupData);

      Alert.alert(
        'Đăng ký thành công',
        response.message || 'Tài khoản kỹ thuật viên của bạn đã được tạo thành công!',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Login'),
          },
        ]
      );
    } catch (error: any) {
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
        title="Đăng ký tài khoản kỹ thuật viên"
        leftIcon={<Text style={styles.backIconHeader}>‹</Text>}
        onLeftPress={() => navigation.goBack()}
      />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Technician Registration Form */}
        <View style={styles.registrationCard}>
          {/* Họ và tên */}
          <Controller
            control={control}
            name="hoten"
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>
                  Họ và tên <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={[styles.input, errors.hoten && styles.inputError]}
                  placeholder="Nhập họ và tên"
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
                  onProvinceChange={(provinceName, provinceCode) => {
                    onChange(provinceName);
                    setProvinceCode(provinceCode);
                  }}
                  placeholder="Chọn tỉnh thành"
                />
                {errors.city && (
                  <Text style={styles.errorText}>{errors.city.message}</Text>
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
                    <Icon
                      name={showPassword ? 'eye-off' : 'eye'}
                      size={20}
                      color={COLORS.gray500}
                    />
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
                    <Icon
                      name={showRePassword ? 'eye-off' : 'eye'}
                      size={20}
                      color={COLORS.gray500}
                    />
                  </TouchableOpacity>
                </View>
                {errors.repassword && (
                  <Text style={styles.errorText}>{errors.repassword.message}</Text>
                )}
              </View>
            )}
          />

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

  // Terms
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    marginTop: SPACING.sm,
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

export default TechnicianSignupScreen;
