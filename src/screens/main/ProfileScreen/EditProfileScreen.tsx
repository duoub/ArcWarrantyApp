import React, { useState } from 'react';
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

// Validation Schema for Personal Info
const personalInfoSchema = z.object({
  name: z.string().min(1, 'Họ tên là bắt buộc'),
  phone: z.string().min(1, 'Số điện thoại là bắt buộc'),
  email: z.string().email('Email không hợp lệ').optional().or(z.literal('')),
  address: z.string().min(1, 'Địa chỉ là bắt buộc'),
  city: z.string().min(1, 'Tỉnh/Thành phố là bắt buộc'),
  cccd: z.string().optional(),
  taxCode: z.string().optional(),
});

// Validation Schema for Bank Info
const bankInfoSchema = z.object({
  bankAccountNumber: z.string().min(1, 'Số tài khoản là bắt buộc'),
  bankAccountName: z.string().min(1, 'Tên tài khoản là bắt buộc'),
  bankName: z.string().min(1, 'Ngân hàng là bắt buộc'),
});

type PersonalInfoFormData = z.infer<typeof personalInfoSchema>;
type BankInfoFormData = z.infer<typeof bankInfoSchema>;

interface EditProfileScreenProps {
  route: {
    params: {
      section: 'personal' | 'bank';
    };
  };
}

const EditProfileScreen: React.FC<EditProfileScreenProps> = ({ route }) => {
  const navigation = useNavigation();
  const { user } = useAuthStore();
  const { section } = route.params;
  const [isLoading, setIsLoading] = useState(false);

  const isPersonalSection = section === 'personal';

  // Personal Info Form
  const {
    control: personalControl,
    handleSubmit: handlePersonalSubmit,
    formState: { errors: personalErrors },
  } = useForm<PersonalInfoFormData>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      name: user?.name || '',
      phone: user?.phone || '',
      email: user?.email || '',
      address: user?.address || '',
      city: user?.city || '',
      cccd: user?.cccd || '',
      taxCode: user?.taxCode || '',
    },
  });

  // Bank Info Form
  const {
    control: bankControl,
    handleSubmit: handleBankSubmit,
    formState: { errors: bankErrors },
  } = useForm<BankInfoFormData>({
    resolver: zodResolver(bankInfoSchema),
    defaultValues: {
      bankAccountNumber: user?.bankAccountNumber || '',
      bankAccountName: user?.bankAccountName || '',
      bankName: user?.bankName || '',
    },
  });

  const handleSavePersonalInfo = async (data: PersonalInfoFormData) => {
    try {
      setIsLoading(true);

      // TODO: Implement API call to update personal info
      console.log('Updating personal info:', data);
      await new Promise((resolve) => setTimeout(resolve, 1500));

      Alert.alert(
        'Cập nhật thành công',
        'Thông tin cá nhân đã được cập nhật thành công!',
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

  const handleSaveBankInfo = async (data: BankInfoFormData) => {
    try {
      setIsLoading(true);

      // TODO: Implement API call to update bank info
      console.log('Updating bank info:', data);
      await new Promise((resolve) => setTimeout(resolve, 1500));

      Alert.alert(
        'Cập nhật thành công',
        'Thông tin ngân hàng đã được cập nhật thành công!',
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

  const renderPersonalInfoForm = () => (
    <View style={styles.formContainer}>
      {/* Name */}
      <Controller
        control={personalControl}
        name="name"
        render={({ field: { onChange, onBlur, value } }) => (
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>
              Họ tên <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[
                styles.input,
                personalErrors.name && styles.inputError,
              ]}
              placeholder="Nhập họ tên"
              placeholderTextColor={COLORS.gray400}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              editable={!isLoading}
            />
            {personalErrors.name && (
              <Text style={styles.errorText}>{personalErrors.name.message}</Text>
            )}
          </View>
        )}
      />

      {/* Phone */}
      <Controller
        control={personalControl}
        name="phone"
        render={({ field: { onChange, onBlur, value } }) => (
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>
              Số điện thoại <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[
                styles.input,
                personalErrors.phone && styles.inputError,
              ]}
              placeholder="Nhập số điện thoại"
              placeholderTextColor={COLORS.gray400}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              editable={!isLoading}
              keyboardType="phone-pad"
            />
            {personalErrors.phone && (
              <Text style={styles.errorText}>{personalErrors.phone.message}</Text>
            )}
          </View>
        )}
      />

      {/* Email */}
      <Controller
        control={personalControl}
        name="email"
        render={({ field: { onChange, onBlur, value } }) => (
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={[
                styles.input,
                personalErrors.email && styles.inputError,
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
            {personalErrors.email && (
              <Text style={styles.errorText}>{personalErrors.email.message}</Text>
            )}
          </View>
        )}
      />

      {/* Address */}
      <Controller
        control={personalControl}
        name="address"
        render={({ field: { onChange, onBlur, value } }) => (
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>
              Địa chỉ <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[
                styles.input,
                personalErrors.address && styles.inputError,
              ]}
              placeholder="Nhập địa chỉ"
              placeholderTextColor={COLORS.gray400}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              editable={!isLoading}
            />
            {personalErrors.address && (
              <Text style={styles.errorText}>{personalErrors.address.message}</Text>
            )}
          </View>
        )}
      />

      {/* City - Province Selector */}
      <Controller
        control={personalControl}
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
            {personalErrors.city && (
              <Text style={styles.errorText}>{personalErrors.city.message}</Text>
            )}
          </View>
        )}
      />

      {/* CCCD */}
      <Controller
        control={personalControl}
        name="cccd"
        render={({ field: { onChange, onBlur, value } }) => (
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>CCCD/CMND</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập số CCCD/CMND"
              placeholderTextColor={COLORS.gray400}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              editable={!isLoading}
              keyboardType="number-pad"
            />
          </View>
        )}
      />

      {/* Tax Code */}
      <Controller
        control={personalControl}
        name="taxCode"
        render={({ field: { onChange, onBlur, value } }) => (
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Mã số thuế</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập mã số thuế"
              placeholderTextColor={COLORS.gray400}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              editable={!isLoading}
            />
          </View>
        )}
      />
    </View>
  );

  const renderBankInfoForm = () => (
    <View style={styles.formContainer}>
      {/* Bank Account Number */}
      <Controller
        control={bankControl}
        name="bankAccountNumber"
        render={({ field: { onChange, onBlur, value } }) => (
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>
              Số tài khoản <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[
                styles.input,
                bankErrors.bankAccountNumber && styles.inputError,
              ]}
              placeholder="Nhập số tài khoản"
              placeholderTextColor={COLORS.gray400}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              editable={!isLoading}
              keyboardType="number-pad"
            />
            {bankErrors.bankAccountNumber && (
              <Text style={styles.errorText}>{bankErrors.bankAccountNumber.message}</Text>
            )}
          </View>
        )}
      />

      {/* Bank Account Name */}
      <Controller
        control={bankControl}
        name="bankAccountName"
        render={({ field: { onChange, onBlur, value } }) => (
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>
              Tên tài khoản <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[
                styles.input,
                bankErrors.bankAccountName && styles.inputError,
              ]}
              placeholder="Nhập tên tài khoản"
              placeholderTextColor={COLORS.gray400}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              editable={!isLoading}
            />
            {bankErrors.bankAccountName && (
              <Text style={styles.errorText}>{bankErrors.bankAccountName.message}</Text>
            )}
          </View>
        )}
      />

      {/* Bank Name */}
      <Controller
        control={bankControl}
        name="bankName"
        render={({ field: { onChange, onBlur, value } }) => (
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>
              Ngân hàng <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[
                styles.input,
                bankErrors.bankName && styles.inputError,
              ]}
              placeholder="Nhập tên ngân hàng"
              placeholderTextColor={COLORS.gray400}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              editable={!isLoading}
            />
            {bankErrors.bankName && (
              <Text style={styles.errorText}>{bankErrors.bankName.message}</Text>
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
        title={isPersonalSection ? 'Chỉnh sửa thông tin cá nhân' : 'Chỉnh sửa thông tin ngân hàng'}
        leftIcon={<Text style={styles.backIcon}>‹</Text>}
        onLeftPress={() => navigation.goBack()}
      />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {isPersonalSection ? renderPersonalInfoForm() : renderBankInfoForm()}

        {/* Update Button */}
        <TouchableOpacity
          style={[
            styles.updateButton,
            isLoading && styles.updateButtonDisabled,
          ]}
          onPress={isPersonalSection ? handlePersonalSubmit(handleSavePersonalInfo) : handleBankSubmit(handleSaveBankInfo)}
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
