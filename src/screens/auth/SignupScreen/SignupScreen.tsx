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
  ScrollView,
} from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../../../config/theme';

const SignupScreen = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1); // 1: Info, 2: Password, 3: Verification

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      // Submit signup
      console.log('Signup:', formData);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Background */}
        <View style={styles.backgroundGradient} />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Image
            source={require('../../../assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${(currentStep / 3) * 100}%` },
              ]}
            />
          </View>
          <Text style={styles.progressText}>Bước {currentStep}/3</Text>
        </View>

        {/* Signup Card */}
        <View style={styles.signupCard}>
          {/* Step 1: Personal Info */}
          {currentStep === 1 && (
            <>
              <View style={styles.cardHeader}>
                <Text style={styles.title}>Thông tin cá nhân</Text>
                <Text style={styles.subtitle}>
                  Nhập thông tin để tạo tài khoản mới
                </Text>
              </View>

              <View style={styles.formSection}>
                {/* Full Name */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Họ và tên *</Text>
                  <View
                    style={[
                      styles.inputWrapper,
                      focusedField === 'fullName' && styles.inputWrapperFocused,
                    ]}
                  >
                    <TextInput
                      style={styles.input}
                      placeholder="Nguyễn Văn A"
                      placeholderTextColor={COLORS.gray400}
                      value={formData.fullName}
                      onChangeText={(value) => updateField('fullName', value)}
                      onFocus={() => setFocusedField('fullName')}
                      onBlur={() => setFocusedField(null)}
                      autoCapitalize="words"
                    />
                  </View>
                </View>

                {/* Email */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Email *</Text>
                  <View
                    style={[
                      styles.inputWrapper,
                      focusedField === 'email' && styles.inputWrapperFocused,
                    ]}
                  >
                    <TextInput
                      style={styles.input}
                      placeholder="email@example.com"
                      placeholderTextColor={COLORS.gray400}
                      value={formData.email}
                      onChangeText={(value) => updateField('email', value)}
                      onFocus={() => setFocusedField('email')}
                      onBlur={() => setFocusedField(null)}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  </View>
                </View>

                {/* Phone */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Số điện thoại *</Text>
                  <View
                    style={[
                      styles.inputWrapper,
                      focusedField === 'phone' && styles.inputWrapperFocused,
                    ]}
                  >
                    <TextInput
                      style={styles.input}
                      placeholder="0901234567"
                      placeholderTextColor={COLORS.gray400}
                      value={formData.phone}
                      onChangeText={(value) => updateField('phone', value)}
                      onFocus={() => setFocusedField('phone')}
                      onBlur={() => setFocusedField(null)}
                      keyboardType="phone-pad"
                      maxLength={10}
                    />
                  </View>
                </View>
              </View>
            </>
          )}

          {/* Step 2: Password */}
          {currentStep === 2 && (
            <>
              <View style={styles.cardHeader}>
                <Text style={styles.title}>Tạo mật khẩu</Text>
                <Text style={styles.subtitle}>
                  Mật khẩu phải có ít nhất 6 ký tự
                </Text>
              </View>

              <View style={styles.formSection}>
                {/* Password */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Mật khẩu *</Text>
                  <View
                    style={[
                      styles.inputWrapper,
                      focusedField === 'password' && styles.inputWrapperFocused,
                    ]}
                  >
                    <TextInput
                      style={styles.input}
                      placeholder="Nhập mật khẩu"
                      placeholderTextColor={COLORS.gray400}
                      value={formData.password}
                      onChangeText={(value) => updateField('password', value)}
                      onFocus={() => setFocusedField('password')}
                      onBlur={() => setFocusedField(null)}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                    />
                    <TouchableOpacity
                      style={styles.eyeIcon}
                      onPress={() => setShowPassword(!showPassword)}
                    >
                      <Text style={styles.eyeIconText}>
                        {showPassword ? '👁️' : '👁️‍🗨️'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Confirm Password */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Xác nhận mật khẩu *</Text>
                  <View
                    style={[
                      styles.inputWrapper,
                      focusedField === 'confirmPassword' && styles.inputWrapperFocused,
                    ]}
                  >
                    <TextInput
                      style={styles.input}
                      placeholder="Nhập lại mật khẩu"
                      placeholderTextColor={COLORS.gray400}
                      value={formData.confirmPassword}
                      onChangeText={(value) => updateField('confirmPassword', value)}
                      onFocus={() => setFocusedField('confirmPassword')}
                      onBlur={() => setFocusedField(null)}
                      secureTextEntry={!showConfirmPassword}
                      autoCapitalize="none"
                    />
                    <TouchableOpacity
                      style={styles.eyeIcon}
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      <Text style={styles.eyeIconText}>
                        {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Password Strength Indicator */}
                <View style={styles.passwordStrengthContainer}>
                  <Text style={styles.passwordStrengthLabel}>Độ mạnh mật khẩu:</Text>
                  <View style={styles.passwordStrengthBars}>
                    <View style={[styles.strengthBar, styles.strengthBarWeak]} />
                    <View style={[styles.strengthBar, styles.strengthBarMedium]} />
                    <View style={[styles.strengthBar, styles.strengthBarStrong]} />
                  </View>
                </View>
              </View>
            </>
          )}

          {/* Step 3: Verification Info */}
          {currentStep === 3 && (
            <>
              <View style={styles.cardHeader}>
                <Text style={styles.title}>Xác thực tài khoản</Text>
                <Text style={styles.subtitle}>
                  Chọn phương thức nhận mã xác thực
                </Text>
              </View>

              <View style={styles.verificationOptions}>
                <TouchableOpacity style={styles.verificationOption}>
                  <View style={styles.verificationIcon}>
                    <Text style={styles.verificationIconText}>📧</Text>
                  </View>
                  <View style={styles.verificationContent}>
                    <Text style={styles.verificationTitle}>Gửi qua Email</Text>
                    <Text style={styles.verificationSubtitle}>
                      {formData.email}
                    </Text>
                  </View>
                  <View style={styles.radioButton}>
                    <View style={styles.radioButtonSelected} />
                  </View>
                </TouchableOpacity>

                <TouchableOpacity style={styles.verificationOption}>
                  <View style={styles.verificationIcon}>
                    <Text style={styles.verificationIconText}>📱</Text>
                  </View>
                  <View style={styles.verificationContent}>
                    <Text style={styles.verificationTitle}>Gửi qua SMS</Text>
                    <Text style={styles.verificationSubtitle}>
                      {formData.phone}
                    </Text>
                  </View>
                  <View style={styles.radioButton} />
                </TouchableOpacity>
              </View>

              {/* Terms and Conditions */}
              <View style={styles.termsContainer}>
                <View style={styles.checkbox}>
                  <Text style={styles.checkmark}>✓</Text>
                </View>
                <Text style={styles.termsText}>
                  Tôi đồng ý với{' '}
                  <Text style={styles.termsLink}>Điều khoản sử dụng</Text> và{' '}
                  <Text style={styles.termsLink}>Chính sách bảo mật</Text>
                </Text>
              </View>
            </>
          )}

          {/* Action Button */}
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleNextStep}
            activeOpacity={0.8}
          >
            <View style={styles.actionButtonGradient}>
              <Text style={styles.actionButtonText}>
                {currentStep === 3 ? 'Hoàn tất đăng ký' : 'Tiếp tục'}
              </Text>
            </View>
          </TouchableOpacity>

          {/* Login Link */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Đã có tài khoản? </Text>
            <TouchableOpacity>
              <Text style={styles.loginLink}>Đăng nhập ngay</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 300,
    backgroundColor: `${COLORS.accent}10`,
    opacity: 0.5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xl,
    marginBottom: SPACING.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  backIcon: {
    fontSize: 20,
    color: COLORS.textPrimary,
  },
  logo: {
    width: 120,
    height: 40,
    marginLeft: SPACING.md,
  },
  progressContainer: {
    marginBottom: SPACING.lg,
  },
  progressBar: {
    height: 4,
    backgroundColor: COLORS.gray200,
    borderRadius: BORDER_RADIUS.sm,
    overflow: 'hidden',
    marginBottom: SPACING.xs,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.sm,
  },
  progressText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    textAlign: 'right',
  },
  signupCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  cardHeader: {
    marginBottom: SPACING.lg,
  },
  title: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
  },
  formSection: {
    marginBottom: SPACING.md,
  },
  inputContainer: {
    marginBottom: SPACING.md,
  },
  inputLabel: {
    ...TYPOGRAPHY.label,
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
    height: 56,
  },
  inputWrapperFocused: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.white,
  },
  input: {
    flex: 1,
    ...TYPOGRAPHY.body,
    color: COLORS.textPrimary,
  },
  eyeIcon: {
    padding: SPACING.xs,
  },
  eyeIconText: {
    fontSize: 20,
  },
  passwordStrengthContainer: {
    marginTop: SPACING.sm,
  },
  passwordStrengthLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  passwordStrengthBars: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  strengthBar: {
    flex: 1,
    height: 4,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.gray200,
  },
  strengthBarWeak: {
    backgroundColor: COLORS.error,
  },
  strengthBarMedium: {
    backgroundColor: COLORS.warning,
  },
  strengthBarStrong: {
    backgroundColor: COLORS.gray200,
  },
  verificationOptions: {
    marginBottom: SPACING.lg,
  },
  verificationOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray50,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 2,
    borderColor: COLORS.gray200,
  },
  verificationIcon: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  verificationIconText: {
    fontSize: 24,
  },
  verificationContent: {
    flex: 1,
  },
  verificationTitle: {
    ...TYPOGRAPHY.body,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  verificationSubtitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 2,
    borderColor: COLORS.gray300,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonSelected: {
    width: 12,
    height: 12,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.primary,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 2,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
    marginTop: 2,
  },
  checkmark: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  termsText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    flex: 1,
    lineHeight: 18,
  },
  termsLink: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  actionButton: {
    marginBottom: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  actionButtonGradient: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
  },
  actionButtonText: {
    ...TYPOGRAPHY.button,
    color: COLORS.white,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
  },
  loginLink: {
    ...TYPOGRAPHY.body,
    color: COLORS.primary,
    fontWeight: '600',
  },
});

export default SignupScreen;
