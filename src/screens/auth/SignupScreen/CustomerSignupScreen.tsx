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
import { authService } from '../../../api/authService';
import { USER_TYPES } from '../../../types/user';

type CustomerSignupScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'CustomerSignup'>;

// Customer Signup Validation Schema
const customerSignupSchema = z.object({
  hoten: z.string().min(1, 'Họ và tên là bắt buộc'),
  ngaysinh: z.string().optional().or(z.literal('')).refine(
    (val) => !val || /^\d{2}\/\d{2}\/\d{4}$/.test(val),
    'Định dạng ngày sinh: DD/MM/YYYY'
  ),
  email: z.string().email('Email không hợp lệ').optional().or(z.literal('')),
  phone: z.string().min(1, 'Số điện thoại là bắt buộc').regex(/^[0-9]{10}$/, 'Số điện thoại không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
  repassword: z.string().min(1, 'Vui lòng nhập lại mật khẩu'),
}).refine((data) => data.password === data.repassword, {
  message: 'Mật khẩu xác nhận không khớp',
  path: ['repassword'],
});

type CustomerSignupFormData = z.infer<typeof customerSignupSchema>;

const CustomerSignupScreen: React.FC = () => {
  const navigation = useNavigation<CustomerSignupScreenNavigationProp>();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showRePassword, setShowRePassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CustomerSignupFormData>({
    resolver: zodResolver(customerSignupSchema),
    defaultValues: {
      hoten: '',
      ngaysinh: '',
      email: '',
      phone: '',
      password: '',
      repassword: '',
    },
  });

  const onSubmit = async (data: CustomerSignupFormData) => {
    // Validate terms
    if (!termsAccepted) {
      Alert.alert('Thông báo', 'Vui lòng đồng ý với điều khoản sử dụng');
      return;
    }

    try {
      setIsLoading(true);

      // Prepare signup request data
      const signupData = {
        hoten: data.hoten,
        birthday: data.ngaysinh || '',
        email: data.email || '',
        phone: data.phone,
        pasword: data.password,
        repassword: data.repassword,
        type: USER_TYPES.CUSTOMER
      };

      // Call customer signup API
      const response = await authService.customerSignup(signupData);

      Alert.alert(
        'Đăng ký thành công',
        response.message || 'Tài khoản của bạn đã được tạo thành công!',
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
        title="Đăng ký tài khoản khách hàng"
        leftIcon={<Text style={styles.backIconHeader}>‹</Text>}
        onLeftPress={() => navigation.goBack()}
      />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Customer Registration Form */}
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
                  autoCapitalize="words"
                />
                {errors.hoten && (
                  <Text style={styles.errorText}>{errors.hoten.message}</Text>
                )}
              </View>
            )}
          />

          {/* Ngày sinh */}
          <Controller
            control={control}
            name="ngaysinh"
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Ngày sinh</Text>
                <TextInput
                  style={[styles.input, errors.ngaysinh && styles.inputError]}
                  placeholder="DD/MM/YYYY - vd: 31/12/1990"
                  placeholderTextColor={COLORS.textSecondary}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  keyboardType="numeric"
                />
                {errors.ngaysinh && (
                  <Text style={styles.errorText}>{errors.ngaysinh.message}</Text>
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

          {/* Số điện thoại */}
          <Controller
            control={control}
            name="phone"
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>
                  Số điện thoại <Text style={styles.required}>*</Text>
                </Text>
                <Text style={styles.inputNote}>
                  (Số điện thoại sẽ được dùng làm tên đăng nhập)
                </Text>
                <TextInput
                  style={[styles.input, errors.phone && styles.inputError]}
                  placeholder="Nhập số điện thoại"
                  placeholderTextColor={COLORS.textSecondary}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  keyboardType="phone-pad"
                  maxLength={10}
                />
                {errors.phone && (
                  <Text style={styles.errorText}>{errors.phone.message}</Text>
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
          >
            {isLoading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.submitButtonText}>Đăng ký</Text>
            )}
          </TouchableOpacity>

          {/* Login Link */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Đã có tài khoản? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Đăng nhập</Text>
            </TouchableOpacity>
          </View>
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
  registrationCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    margin: SPACING.lg,
  },

  // Input styles
  inputContainer: {
    marginBottom: SPACING.md,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  inputNote: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
    fontStyle: 'italic',
  },
  required: {
    color: COLORS.error,
  },
  input: {
    backgroundColor: COLORS.gray50,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: 15,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.gray200,
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
    borderRadius: BORDER_RADIUS.md,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },

  // Login Link
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  loginText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  loginLink: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
});

export default CustomerSignupScreen;
