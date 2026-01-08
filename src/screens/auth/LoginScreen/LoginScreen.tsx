import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { COLORS, SPACING, BORDER_RADIUS } from '../../../config/theme';
import { PreLoginRootStackParamList } from '../../../navigation/PreLoginRootNavigator';
import { loginSchema, LoginFormData } from '../../../utils/validation';
import { Icon } from '../../../components/common';
import { authService } from '../../../api/authService';
import { useAuthStore } from '../../../store/authStore';
import PreLoginNavigator from '../../../navigation/PreLoginNavigator';

type LoginScreenNavigationProp = StackNavigationProp<PreLoginRootStackParamList, 'Login'>;

const LoginScreen = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const { login } = useAuthStore();

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCustomerAccount, setIsCustomerAccount] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const handleLogin = async (data: LoginFormData) => {
    try {
      setIsLoading(true);

      let response;
      if (isCustomerAccount) {
        // Customer login using store API
        response = await authService.customerLogin({
          email: data.username,
          pasword: data.password,
        });
      } else {
        // Other user types (NPP, DL, KTV) using default API
        response = await authService.login(data);
      }

      login(response.token, response.user);
      Alert.alert('Đăng nhập thành công', response.message || 'Chào mừng bạn trở lại!');
    } catch (error) {
      Alert.alert(
        'Đăng nhập thất bại',
        error instanceof Error ? error.message : 'Đã có lỗi xảy ra. Vui lòng thử lại.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            {/* Logo Section */}
            <View style={styles.logoSection}>
              <Image
                source={require('../../../assets/images/logo.png')}
                style={styles.logo}
                resizeMode="contain"
              />
              <Text style={styles.tagline}>Quản lý bảo hành chuyên nghiệp</Text>
            </View>

            {/* Login Card */}
            <View style={styles.loginCard}>
              {/* Card Header */}
              <Text style={styles.welcomeText}>Đăng nhập</Text>

              {/* Customer Account Checkbox */}
              <TouchableOpacity
                style={styles.checkboxContainer}
                onPress={() => setIsCustomerAccount(!isCustomerAccount)}
                activeOpacity={0.7}
                disabled={isLoading}
              >
                <View style={[styles.checkbox, isCustomerAccount && styles.checkboxChecked]}>
                  {isCustomerAccount && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.checkboxLabel}>Tài khoản khách hàng</Text>
              </TouchableOpacity>

              {/* Username Input */}
              <Controller
                control={control}
                name="username"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Tên đăng nhập</Text>
                    <View
                      style={[
                        styles.inputWrapper,
                        errors.username && styles.inputWrapperError,
                      ]}
                    >
                      <TextInput
                        style={styles.input}
                        placeholder="Nhập tên đăng nhập"
                        placeholderTextColor={COLORS.gray400}
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        autoCapitalize="none"
                        autoCorrect={false}
                        editable={!isLoading}
                      />
                    </View>
                    {errors.username && (
                      <Text style={styles.errorText}>{errors.username.message}</Text>
                    )}
                  </View>
                )}
              />

              {/* Password Input */}
              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Mật khẩu</Text>
                    <View
                      style={[
                        styles.inputWrapper,
                        errors.password && styles.inputWrapperError,
                      ]}
                    >
                      <TextInput
                        style={styles.input}
                        placeholder="Nhập mật khẩu"
                        placeholderTextColor={COLORS.gray400}
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        secureTextEntry={!showPassword}
                        autoCapitalize="none"
                        editable={!isLoading}
                      />
                      <TouchableOpacity
                        style={styles.eyeIcon}
                        onPress={() => setShowPassword(!showPassword)}
                        disabled={isLoading}
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

              {/* Forgot Password Link */}
              <TouchableOpacity
                style={styles.forgotPassword}
                onPress={() => navigation.navigate('ForgotPassword')}
                disabled={isLoading}
              >
                <Text style={styles.forgotPasswordText}>Quên mật khẩu?</Text>
              </TouchableOpacity>

              {/* Login Button */}
              <TouchableOpacity
                style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
                onPress={handleSubmit(handleLogin)}
                activeOpacity={0.8}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color={COLORS.white} size="small" />
                ) : (
                  <Text style={styles.loginButtonText}>Đăng nhập</Text>
                )}
              </TouchableOpacity>

              {/* Sign Up Link */}
              <View style={styles.signupContainer}>
                <Text style={styles.signupText}>Chưa có tài khoản? </Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate('Signup')}
                  disabled={isLoading}
                >
                  <Text style={styles.signupLink}>Đăng ký ngay</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Sản phẩm đẳng cấp từ <Text style={styles.signupLink}>MALAYSIA</Text></Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Pre-Login Bottom Navigation */}
      <PreLoginNavigator />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.lg,
    justifyContent: 'center',
  },

  // Logo Section
  logoSection: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  logo: {
    width: 140,
    height: 45,
    marginBottom: SPACING.xs,
  },
  tagline: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },

  // Login Card
  loginCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },

  // Card Header
  welcomeText: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },

  // Checkbox
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
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
  checkboxLabel: {
    fontSize: 14,
    color: COLORS.textPrimary,
    fontWeight: '500',
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
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray50,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 2,
    borderColor: COLORS.gray200,
    paddingHorizontal: SPACING.md,
    height: 52,
  },
  inputWrapperError: {
    borderColor: COLORS.error,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: COLORS.textPrimary,
    paddingVertical: 0,
    height: '100%',
  },
  eyeIcon: {
    padding: SPACING.xs,
    marginLeft: SPACING.xs,
  },
  errorText: {
    fontSize: 12,
    color: COLORS.error,
    marginTop: SPACING.xs,
  },

  // Forgot Password
  forgotPassword: {
    alignSelf: 'flex-end',
    paddingVertical: SPACING.xs,
    marginBottom: SPACING.md,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },

  // Login Button
  loginButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 0,
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderRadius: BORDER_RADIUS.md,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: SPACING.md,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
    letterSpacing: 0.5,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },

  // Signup Link
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  signupText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  signupLink: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },

  // Footer
  footer: {
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  footerText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
});

export default LoginScreen;
