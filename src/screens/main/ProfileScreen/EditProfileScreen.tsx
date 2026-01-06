import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../../config/theme';
import CustomHeader from '../../../components/CustomHeader';
import ProvinceSelector from '../../../components/ProvinceSelector';
import { useAuthStore } from '../../../store/authStore';
import { profileService } from '../../../api/profileService';
import { authService } from '../../../api/authService';
import { API_CONFIG } from '../../../config/constants';

// Validation Schema for Profile Info (Combined)
const profileInfoSchema = z.object({
  // Personal Info
  name: z.string().min(1, 'Họ tên là bắt buộc'),
  phone: z.string().min(1, 'Số điện thoại là bắt buộc'),
  email: z.string().email('Email không hợp lệ').optional().or(z.literal('')),
  address: z.string().min(1, 'Địa chỉ là bắt buộc'),
  city: z.string().min(1, 'Tỉnh/Thành phố là bắt buộc'),
  cccd: z.string().optional(),
  taxCode: z.string().optional(),
  // Bank Info
  bankAccountNumber: z.string().min(1, 'Số tài khoản là bắt buộc'),
  bankAccountName: z.string().min(1, 'Tên tài khoản là bắt buộc'),
  bankName: z.string().min(1, 'Ngân hàng là bắt buộc'),
});

type ProfileInfoFormData = z.infer<typeof profileInfoSchema>;

const EditProfileScreen = () => {

  const navigation = useNavigation();
  const { user, setUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
  }, [user]);

  // Combined Profile Form
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileInfoFormData>({
    resolver: zodResolver(profileInfoSchema),
    defaultValues: {
      // Personal Info
      name: user?.name || '',
      phone: user?.phone || '',
      email: user?.email || '',
      address: user?.address || '',
      city: user?.tinhthanh || '',
      cccd: user?.cccd || '',
      taxCode: user?.taxcode || '',
      // Bank Info
      bankAccountNumber: user?.sotaikhoan || '',
      bankAccountName: user?.tentaikhoan || '',
      bankName: user?.nganhang || '',
    },
  });

  const handleSaveProfile = async (data: ProfileInfoFormData) => {
    try {
      setIsLoading(true);

      // Call API to update personal info
      await profileService.updateProfile({
        name: data.name,
        phone: data.phone,
        email: data.email || '',
        address: data.address,
        tinhthanh: data.city,
        taxcode: data.taxCode || '',
        sotaikhoan: data.bankAccountNumber,
        tentaikhoan: data.bankAccountName,
        nganhang: data.bankName
      });

      // Refresh user profile data from server
      if (user?.id) {
        const updatedProfile = await authService.getProfile(user.id, API_CONFIG.STORE_ID);

        // Update user in store with new data (merge with existing user data)
        setUser({
          ...user,
          ...updatedProfile,
        });
      }

      Alert.alert(
        'Cập nhật thành công',
        'Thông tin hồ sơ đã được cập nhật thành công!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      Alert.alert(
        'Cập nhật thất bại',
        error instanceof Error ? error.message : 'Đã có lỗi xảy ra. Vui lòng thử lại.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const renderProfileForm = () => (
    <View style={styles.formContainer}>
      {/* Personal Information Section */}
      <Text style={styles.sectionTitle}>Thông tin cá nhân</Text>

      {/* Name */}
      <Controller
        control={control}
        name="name"
        render={({ field: { onChange, onBlur, value } }) => (
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>
              Họ tên <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[
                styles.input,
                errors.name && styles.inputError,
              ]}
              placeholder="Nhập họ tên"
              placeholderTextColor={COLORS.gray400}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              editable={!isLoading}
            />
            {errors.name && (
              <Text style={styles.errorText}>{errors.name.message}</Text>
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
            <TextInput
              style={[
                styles.input,
                errors.phone && styles.inputError,
              ]}
              placeholder="Nhập số điện thoại"
              placeholderTextColor={COLORS.gray400}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              editable={!isLoading}
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
              style={[
                styles.input,
                errors.email && styles.inputError,
              ]}
              placeholder="Nhập email"
              placeholderTextColor={COLORS.gray400}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              editable={!isLoading}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {errors.email && (
              <Text style={styles.errorText}>{errors.email.message}</Text>
            )}
          </View>
        )}
      />

      {/* Address */}
      <Controller
        control={control}
        name="address"
        render={({ field: { onChange, onBlur, value } }) => (
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>
              Địa chỉ <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[
                styles.input,
                errors.address && styles.inputError,
              ]}
              placeholder="Nhập địa chỉ"
              placeholderTextColor={COLORS.gray400}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              editable={!isLoading}
            />
            {errors.address && (
              <Text style={styles.errorText}>{errors.address.message}</Text>
            )}
          </View>
        )}
      />

      {/* City - Province Selector */}
      <Controller
        control={control}
        name="city"
        render={({ field: { onChange, value } }) => (
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>
              Tỉnh/Thành phố <Text style={styles.required}>*</Text>
            </Text>
            <ProvinceSelector
              selectedProvince={value}
              onProvinceChange={onChange}
              placeholder="Chọn tỉnh/thành phố"
            />
            {errors.city && (
              <Text style={styles.errorText}>{errors.city.message}</Text>
            )}
          </View>
        )}
      />

      {/* Tax Code/ID */}
      <Controller
        control={control}
        name="taxCode"
        render={({ field: { onChange, onBlur, value } }) => (
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Mã số thuế/CCCD</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập mã số thuế/CCCD"
              placeholderTextColor={COLORS.gray400}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              editable={!isLoading}
            />
          </View>
        )}
      />

      {/* Divider */}
      <View style={styles.divider} />

      {/* Bank Information Section */}
      <Text style={styles.sectionTitle}>Thông tin ngân hàng</Text>

      {/* Bank Account Number */}
      <Controller
        control={control}
        name="bankAccountNumber"
        render={({ field: { onChange, onBlur, value } }) => (
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>
              Số tài khoản <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[
                styles.input,
                errors.bankAccountNumber && styles.inputError,
              ]}
              placeholder="Nhập số tài khoản"
              placeholderTextColor={COLORS.gray400}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              editable={!isLoading}
              keyboardType="number-pad"
            />
            {errors.bankAccountNumber && (
              <Text style={styles.errorText}>{errors.bankAccountNumber.message}</Text>
            )}
          </View>
        )}
      />

      {/* Bank Account Name */}
      <Controller
        control={control}
        name="bankAccountName"
        render={({ field: { onChange, onBlur, value } }) => (
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>
              Tên tài khoản <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[
                styles.input,
                errors.bankAccountName && styles.inputError,
              ]}
              placeholder="Nhập tên tài khoản"
              placeholderTextColor={COLORS.gray400}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              editable={!isLoading}
            />
            {errors.bankAccountName && (
              <Text style={styles.errorText}>{errors.bankAccountName.message}</Text>
            )}
          </View>
        )}
      />

      {/* Bank Name */}
      <Controller
        control={control}
        name="bankName"
        render={({ field: { onChange, onBlur, value } }) => (
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>
              Ngân hàng <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[
                styles.input,
                errors.bankName && styles.inputError,
              ]}
              placeholder="Nhập tên ngân hàng"
              placeholderTextColor={COLORS.gray400}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              editable={!isLoading}
            />
            {errors.bankName && (
              <Text style={styles.errorText}>{errors.bankName.message}</Text>
            )}
          </View>
        )}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      <CustomHeader
        title="Chỉnh sửa hồ sơ"
        leftIcon={<Text style={styles.backIcon}>‹</Text>}
        onLeftPress={() => navigation.goBack()}
      />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {renderProfileForm()}

        {/* Update Button */}
        <TouchableOpacity
          style={[
            styles.updateButton,
            isLoading && styles.updateButtonDisabled,
          ]}
          onPress={handleSubmit(handleSaveProfile)}
          activeOpacity={0.8}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={COLORS.white} size="small" />
          ) : (
            <Text style={styles.updateButtonText}>Cập nhật</Text>
          )}
        </TouchableOpacity>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  backIcon: {
    fontSize: 32,
    color: COLORS.white,
    fontWeight: '300',
  },

  // Form Container
  formContainer: {
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    ...SHADOWS.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
    marginTop: SPACING.xs,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.gray200,
    marginVertical: SPACING.lg,
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
    backgroundColor: COLORS.gray50,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 2,
    borderColor: COLORS.gray200,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: 15,
    color: COLORS.textPrimary,
    minHeight: 48,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  errorText: {
    fontSize: 12,
    color: COLORS.error,
    marginTop: SPACING.xs,
  },

  // Update Button
  updateButton: {
    backgroundColor: COLORS.primary,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
    paddingVertical: 0,
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderRadius: BORDER_RADIUS.md,
    ...SHADOWS.md,
  },
  updateButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
    letterSpacing: 0.5,
  },
  updateButtonDisabled: {
    opacity: 0.6,
  },

  bottomSpacing: {
    height: SPACING.xl,
  },
});

export default EditProfileScreen;
