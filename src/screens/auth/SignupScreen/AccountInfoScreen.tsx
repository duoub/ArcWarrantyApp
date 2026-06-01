import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Platform,
  Alert,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { COLORS, SPACING, BORDER_RADIUS } from '../../../config/theme';
import { AuthStackParamList } from '../../../navigation/PreLoginRootNavigator';
import CustomHeader from '../../../components/CustomHeader';
import { Icon } from '../../../components/common';

type AccountInfoNavigationProp = StackNavigationProp<AuthStackParamList, 'AccountInfo'>;
type AccountInfoRouteProp = RouteProp<AuthStackParamList, 'AccountInfo'>;

const accountInfoSchema = z
  .object({
    phone: z
      .string()
      .min(1, 'Số điện thoại là bắt buộc')
      .regex(/^[0-9]{10}$/, 'Số điện thoại không hợp lệ'),
    password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
    repassword: z.string().min(1, 'Vui lòng nhập lại mật khẩu'),
  })
  .refine((data) => data.password === data.repassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['repassword'],
  });

type AccountInfoFormData = z.infer<typeof accountInfoSchema>;

const AccountInfoScreen: React.FC = () => {
  const navigation = useNavigation<AccountInfoNavigationProp>();
  const route = useRoute<AccountInfoRouteProp>();
  const { target, title, subType } = route.params;

  const [showPassword, setShowPassword] = useState(false);
  const [showRePassword, setShowRePassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<AccountInfoFormData>({
    resolver: zodResolver(accountInfoSchema),
    defaultValues: {
      phone: '',
      password: '',
      repassword: '',
    },
  });

  const onContinue = (data: AccountInfoFormData) => {
    if (!termsAccepted) {
      Alert.alert('Thông báo', 'Vui lòng đồng ý với điều khoản sử dụng');
      return;
    }
    // Chuyển sang form chi tiết tương ứng, mang theo thông tin tài khoản + loại
    navigation.navigate(target, {
      phone: data.phone,
      password: data.password,
      repassword: data.repassword,
      subType,
      title,
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      <CustomHeader
        title={title || 'Đăng ký hội viên'}
        leftIcon={<Text style={styles.backIconHeader}>‹</Text>}
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
        <View style={styles.card}>
          {/* Header */}
          <Text style={styles.title}>THÔNG TIN TÀI KHOẢN</Text>
          <Text style={styles.subtitle}>
            Để ARC phục vụ quý hội viên tốt hơn, vui lòng nhập thông tin sau:
          </Text>

          {/* Số điện thoại */}
          <Controller
            control={control}
            name="phone"
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>
                  Số điện thoại <Text style={styles.required}>(*)</Text>
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="Nhập số điện thoại"
                  placeholderTextColor={COLORS.gray400}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  keyboardType="phone-pad"
                />
                <View style={styles.underline} />
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
                  Mật khẩu <Text style={styles.required}>(*)</Text>
                </Text>
                <View style={styles.passwordRow}>
                  <TextInput
                    style={[styles.input, styles.passwordInput]}
                    placeholder="Nhập mật khẩu"
                    placeholderTextColor={COLORS.gray400}
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
                <View style={styles.underline} />
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
                  Nhập lại mật khẩu <Text style={styles.required}>(*)</Text>
                </Text>
                <View style={styles.passwordRow}>
                  <TextInput
                    style={[styles.input, styles.passwordInput]}
                    placeholder="Nhập lại mật khẩu"
                    placeholderTextColor={COLORS.gray400}
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
                <View style={styles.underline} />
                {errors.repassword && (
                  <Text style={styles.errorText}>{errors.repassword.message}</Text>
                )}
              </View>
            )}
          />

          {/* Điều khoản */}
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
              <Text style={styles.termsLink}>Điều kiện và Điều khoản hội viên</Text>
            </Text>
          </TouchableOpacity>

          {/* Tiếp tục */}
          <TouchableOpacity
            style={styles.continueButton}
            onPress={handleSubmit(onContinue)}
            activeOpacity={0.85}
          >
            <Text style={styles.continueButtonText}>Tiếp tục</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAwareScrollView>
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
  scrollContent: {
    paddingBottom: SPACING.xl,
  },
  card: {
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.screen_lg,
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
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: SPACING.lg,
  },

  // Inputs
  inputContainer: {
    marginBottom: SPACING.lg,
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  required: {
    color: COLORS.error,
    fontWeight: '700',
  },
  input: {
    fontSize: 16,
    color: COLORS.textPrimary,
    paddingVertical: SPACING.sm,
    paddingHorizontal: 0,
  },
  underline: {
    height: 1,
    backgroundColor: COLORS.border,
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
  },
  eyeIcon: {
    padding: SPACING.xs,
  },
  errorText: {
    fontSize: 12,
    color: COLORS.error,
    marginTop: SPACING.xs,
  },

  // Terms
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.lg,
    marginTop: SPACING.xs,
  },
  checkbox: {
    width: 22,
    height: 22,
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
    lineHeight: 20,
  },
  termsLink: {
    color: COLORS.primary,
    fontWeight: '600',
  },

  // Button
  continueButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  continueButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
});

export default AccountInfoScreen;
