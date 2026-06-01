import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Platform,
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  StatusBar,
  Linking,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
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
import { bannerService } from '../../../api/bannerService';
import { appInfoService } from '../../../api/appInfoService';
import { BannerItem } from '../../../types/banner';
import { commonStyles } from '../../../styles/commonStyles';
import PreLoginNavigator from '../../../navigation/PreLoginNavigator';

const { width } = Dimensions.get('window');
const BANNER_WIDTH = width;
const BANNER_HEIGHT = width;

// Fade-to-white overlay ở 2 đầu banner cho cảm giác liền mạch
const FADE_HEIGHT = 56;
const FADE_WHITE = 'rgba(255,255,255,1)';
const FADE_CLEAR = 'rgba(255,255,255,0)';

const DEFAULT_BANNER_IMAGE = require('../../../assets/images/banner.jpg');

type LoginScreenNavigationProp = StackNavigationProp<PreLoginRootStackParamList, 'Login'>;

// Gradient trắng → trong suốt mượt (LinearGradient thật, không bị banding)
const FadeEdge = ({ position }: { position: 'top' | 'bottom' }) => (
  <LinearGradient
    pointerEvents="none"
    colors={position === 'top' ? [FADE_WHITE, FADE_CLEAR] : [FADE_CLEAR, FADE_WHITE]}
    style={[styles.fadeEdge, position === 'top' ? { top: 0 } : { bottom: 0 }]}
  />
);

const LoginScreen = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const { login } = useAuthStore();

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCustomerAccount, setIsCustomerAccount] = useState(false);

  // Banner state
  const [banners, setBanners] = useState<BannerItem[]>([]);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const bannerListRef = useRef<FlatList>(null);
  const [isBannerLoading, setIsBannerLoading] = useState(false);

  // Hotline cho "Quên mật khẩu?" (gọi tổng đài hỗ trợ)
  const hotlineRef = useRef<string | null>(null);
  useEffect(() => {
    appInfoService.getContactInfo().then((info) => {
      if (info?.hotline) hotlineRef.current = info.hotline;
    });
  }, []);

  const handleForgotPassword = useCallback(() => {
    const phone = hotlineRef.current;
    if (phone) {
      Linking.openURL(`tel:${phone.replace(/\s/g, '')}`);
    } else {
      Alert.alert(
        'Hỗ trợ',
        'Vui lòng liên hệ hotline để được hỗ trợ đặt lại mật khẩu.'
      );
    }
  }, []);

  // Load banners on mount (no userid for pre-login)
  useEffect(() => {
    const loadBanners = async () => {
      try {
        const response = await bannerService.getHomeBannerWithUserId('');
        if (response.status && response.banners.length > 0) {
          setBanners(response.banners);
        }
      } catch {
        // Keep empty banners on error
      }
    };
    loadBanners();
  }, []);

  // Auto-slide banners
  useEffect(() => {
    if (banners.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentBannerIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % banners.length;
        bannerListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
        return nextIndex;
      });
    }, 3500);

    return () => clearInterval(interval);
  }, [banners.length]);

  const handleBannerPress = async (banner: BannerItem) => {
    // Prevent multiple clicks
    if (isBannerLoading) return;

    // --- IGNORE ---
    // Check if banner has a valid link
    if (!banner.link || banner.link.trim() === '') {
      banner.link = 'https://arcjk.vn';
      // Alert.alert('Thông báo', 'Banner không có liên kết');
      // return;
    }

    try {
      setIsBannerLoading(true);

      // Check if link can be opened
      const canOpen = await Linking.canOpenURL(banner.link);
      if (canOpen) {
        await Linking.openURL(banner.link);
      } else {
        Alert.alert('Lỗi', 'Không thể mở liên kết này');
      }
    } catch (error) {
      Alert.alert(
        'Lỗi',
        error instanceof Error ? error.message : 'Không thể mở liên kết'
      );
    } finally {
      setIsBannerLoading(false);
    }
  };

  const renderBanner = ({ item }: { item: BannerItem }) => (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => handleBannerPress(item)}
      style={styles.bannerItem}
      disabled={isBannerLoading}
    >
      <Image
        source={{ uri: item.bannerurl }}
        style={styles.bannerImage}
        resizeMode="cover"
        defaultSource={DEFAULT_BANNER_IMAGE}
      />
      {isBannerLoading && (
        <View style={styles.bannerLoadingOverlay}>
          <ActivityIndicator size="large" color={COLORS.white} />
        </View>
      )}
    </TouchableOpacity>
  );

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
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <KeyboardAwareScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid={true}
        extraScrollHeight={Platform.OS === 'ios' ? 20 : 100}
        extraHeight={120}
        contentInsetAdjustmentBehavior="never"
      >
        {/* Banner Slider - full width, tràn cả safe area */}
        {banners.length > 0 && (
          <View style={styles.bannerContainer}>
            <FlatList
              ref={bannerListRef}
              data={banners}
              renderItem={renderBanner}
              keyExtractor={(item, index) => `banner-${item.id}-${index}`}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              style={{ height: BANNER_HEIGHT }}
              onMomentumScrollEnd={(event) => {
                const index = Math.round(
                  event.nativeEvent.contentOffset.x / BANNER_WIDTH
                );
                setCurrentBannerIndex(index);
              }}
            />

            {/* Mờ 2 đầu top/bottom cho liền mạch với nền trắng */}
            <FadeEdge position="top" />
            <FadeEdge position="bottom" />

            {/* Pagination Dots */}
            {banners.length > 1 && (
              <View style={commonStyles.paginationContainer}>
                {banners.map((banner, index) => (
                  <View
                    key={`dot-${banner.id}-${index}`}
                    style={[
                      commonStyles.paginationDot,
                      index === currentBannerIndex && commonStyles.paginationDotActive,
                    ]}
                  />
                ))}
              </View>
            )}
          </View>
        )}

        <View style={[styles.content, { paddingTop: SPACING.sm }]}>
          {/* Login Card */}
          <View style={styles.loginCard}>
            {/* Customer Account Checkbox */}
            {/* <TouchableOpacity
                style={styles.checkboxContainer}
                onPress={() => setIsCustomerAccount(!isCustomerAccount)}
                activeOpacity={0.7}
                disabled={isLoading}
              >
                <View style={[styles.checkbox, isCustomerAccount && styles.checkboxChecked]}>
                  {isCustomerAccount && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.checkboxLabel}>Tài khoản khách hàng</Text>
              </TouchableOpacity> */}

            {/* Username Input */}
            <Controller
              control={control}
              name="username"
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={styles.inputContainer}>
                  {/* <Text style={styles.inputLabel}>Tên đăng nhập</Text> */}
                  <View
                    style={[
                      styles.inputWrapper,
                      errors.username && styles.inputWrapperError,
                    ]}
                  >
                    <TextInput
                      style={styles.input}
                      placeholder="Tên đăng nhập"
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
                  {/* <Text style={styles.inputLabel}>Mật khẩu</Text> */}
                  <View
                    style={[
                      styles.inputWrapper,
                      errors.password && styles.inputWrapperError,
                    ]}
                  >
                    <TextInput
                      style={styles.input}
                      placeholder="Mật khẩu"
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

            {/* Forgot Password Link → gọi hotline hỗ trợ */}
            <TouchableOpacity
              style={styles.forgotPassword}
              onPress={handleForgotPassword}
              disabled={isLoading}
            >
              <Text style={styles.forgotPasswordText}>Quên mật khẩu?</Text>
            </TouchableOpacity>

            {/* Login Button - flat phẳng */}
            <TouchableOpacity
              style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
              onPress={handleSubmit(handleLogin)}
              activeOpacity={0.85}
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
          {/* <View style={styles.footer}>
            <Text style={styles.footerText}>Sản phẩm đẳng cấp từ <Text style={styles.signupLink}>MALAYSIA</Text></Text>
          </View> */}
        </View>
      </KeyboardAwareScrollView>

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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.screen_lg,
    paddingBottom: SPACING.lg,
    justifyContent: 'center',
  },

  // Banner Slider
  bannerContainer: {
    marginBottom: SPACING.sm,
  },
  bannerItem: {
    width: BANNER_WIDTH,
    height: BANNER_HEIGHT,
  },
  fadeEdge: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: FADE_HEIGHT,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  bannerLoadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Login Card
  loginCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    shadowColor: '#1B2B4B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 3,
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
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1.5,
    borderColor: '#D5DEEC',
    paddingHorizontal: SPACING.md,
    height: 54,
    // bóng nhẹ để input nổi khối, nét hơn trên nền trắng
    shadowColor: '#1B2B4B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 5,
    elevation: 1,
  },
  inputWrapperError: {
    borderColor: COLORS.error,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
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

  // Login Button - flat phẳng (màu đặc, không gradient/shadow)
  loginButton: {
    height: 54,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
    letterSpacing: 0.3,
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
