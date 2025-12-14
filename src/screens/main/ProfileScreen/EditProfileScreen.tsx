import React, { useState, useEffect } from 'react';
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
  Modal,
  Pressable,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../../config/theme';
import CustomHeader from '../../../components/CustomHeader';
import { useAuthStore } from '../../../store/authStore';

interface Province {
  id: string;
  TenDiaBan: string;
}

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
  const [showProvinceModal, setShowProvinceModal] = useState(false);
  const [provinceSearchKeyword, setProvinceSearchKeyword] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('');

  const isPersonalSection = section === 'personal';

  // Province list - same as WarrantyStationListScreen
  const provinces: Province[] = [
    { id: '1', TenDiaBan: 'Hà Nội' },
    { id: '2', TenDiaBan: 'TP. Hồ Chí Minh' },
    { id: '3', TenDiaBan: 'Đà Nẵng' },
    { id: '4', TenDiaBan: 'Hải Phòng' },
    { id: '5', TenDiaBan: 'Cần Thơ' },
    { id: '6', TenDiaBan: 'An Giang' },
    { id: '7', TenDiaBan: 'Bà Rịa - Vũng Tàu' },
    { id: '8', TenDiaBan: 'Bắc Giang' },
    { id: '9', TenDiaBan: 'Bắc Kạn' },
    { id: '10', TenDiaBan: 'Bạc Liêu' },
    { id: '11', TenDiaBan: 'Bắc Ninh' },
    { id: '12', TenDiaBan: 'Bến Tre' },
    { id: '13', TenDiaBan: 'Bình Định' },
    { id: '14', TenDiaBan: 'Bình Dương' },
    { id: '15', TenDiaBan: 'Bình Phước' },
    { id: '16', TenDiaBan: 'Bình Thuận' },
    { id: '17', TenDiaBan: 'Cà Mau' },
    { id: '18', TenDiaBan: 'Cao Bằng' },
    { id: '19', TenDiaBan: 'Đắk Lắk' },
    { id: '20', TenDiaBan: 'Đắk Nông' },
    { id: '21', TenDiaBan: 'Điện Biên' },
    { id: '22', TenDiaBan: 'Đồng Nai' },
    { id: '23', TenDiaBan: 'Đồng Tháp' },
    { id: '24', TenDiaBan: 'Gia Lai' },
    { id: '25', TenDiaBan: 'Hà Giang' },
    { id: '26', TenDiaBan: 'Hà Nam' },
    { id: '27', TenDiaBan: 'Hà Tĩnh' },
    { id: '28', TenDiaBan: 'Hải Dương' },
    { id: '29', TenDiaBan: 'Hậu Giang' },
    { id: '30', TenDiaBan: 'Hòa Bình' },
    { id: '31', TenDiaBan: 'Hưng Yên' },
    { id: '32', TenDiaBan: 'Khánh Hòa' },
    { id: '33', TenDiaBan: 'Kiên Giang' },
    { id: '34', TenDiaBan: 'Kon Tum' },
    { id: '35', TenDiaBan: 'Lai Châu' },
    { id: '36', TenDiaBan: 'Lâm Đồng' },
    { id: '37', TenDiaBan: 'Lạng Sơn' },
    { id: '38', TenDiaBan: 'Lào Cai' },
    { id: '39', TenDiaBan: 'Long An' },
    { id: '40', TenDiaBan: 'Nam Định' },
    { id: '41', TenDiaBan: 'Nghệ An' },
    { id: '42', TenDiaBan: 'Ninh Bình' },
    { id: '43', TenDiaBan: 'Ninh Thuận' },
    { id: '44', TenDiaBan: 'Phú Thọ' },
    { id: '45', TenDiaBan: 'Phú Yên' },
    { id: '46', TenDiaBan: 'Quảng Bình' },
    { id: '47', TenDiaBan: 'Quảng Nam' },
    { id: '48', TenDiaBan: 'Quảng Ngãi' },
    { id: '49', TenDiaBan: 'Quảng Ninh' },
    { id: '50', TenDiaBan: 'Quảng Trị' },
    { id: '51', TenDiaBan: 'Sóc Trăng' },
    { id: '52', TenDiaBan: 'Sơn La' },
    { id: '53', TenDiaBan: 'Tây Ninh' },
    { id: '54', TenDiaBan: 'Thái Bình' },
    { id: '55', TenDiaBan: 'Thái Nguyên' },
    { id: '56', TenDiaBan: 'Thanh Hóa' },
    { id: '57', TenDiaBan: 'Thừa Thiên Huế' },
    { id: '58', TenDiaBan: 'Tiền Giang' },
    { id: '59', TenDiaBan: 'Trà Vinh' },
    { id: '60', TenDiaBan: 'Tuyên Quang' },
    { id: '61', TenDiaBan: 'Vĩnh Long' },
    { id: '62', TenDiaBan: 'Vĩnh Phúc' },
    { id: '63', TenDiaBan: 'Yên Bái' },
  ];

  // Filter provinces based on search keyword
  const filteredProvinces = provinces.filter((province) =>
    province.TenDiaBan.toLowerCase().includes(provinceSearchKeyword.toLowerCase())
  );

  // Initialize selectedProvince from user data
  useEffect(() => {
    if (user?.city) {
      setSelectedProvince(user.city);
    }
  }, [user]);

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
        render={({ field: { onChange, value } }) => {
          // Sync value with selectedProvince
          React.useEffect(() => {
            if (selectedProvince && selectedProvince !== value) {
              onChange(selectedProvince);
            }
          }, [selectedProvince]);

          return (
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>
                Tỉnh/Thành phố <Text style={styles.required}>*</Text>
              </Text>
              <TouchableOpacity
                style={[
                  styles.provinceSelector,
                  personalErrors.city && styles.inputError,
                ]}
                onPress={() => setShowProvinceModal(true)}
                activeOpacity={0.7}
                disabled={isLoading}
              >
                <Text
                  style={[
                    styles.provinceSelectorText,
                    !value && styles.placeholderText,
                  ]}
                >
                  {value || 'Chọn tỉnh/thành phố'}
                </Text>
                <Text style={styles.dropdownIcon}>›</Text>
              </TouchableOpacity>
              {personalErrors.city && (
                <Text style={styles.errorText}>{personalErrors.city.message}</Text>
              )}
            </View>
          );
        }}
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
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chọn tỉnh/thành phố</Text>
              <TouchableOpacity
                onPress={() => {
                  setShowProvinceModal(false);
                  setProvinceSearchKeyword('');
                }}
                style={styles.modalCloseButton}
              >
                <Text style={styles.modalCloseIcon}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Modal Search */}
            <View style={styles.modalSearchContainer}>
              <Text style={styles.searchIcon}>🔍</Text>
              <TextInput
                style={styles.modalSearchInput}
                placeholder="Tìm kiếm tỉnh/thành phố..."
                placeholderTextColor={COLORS.gray400}
                value={provinceSearchKeyword}
                onChangeText={setProvinceSearchKeyword}
                autoFocus
              />
              {provinceSearchKeyword !== '' && (
                <TouchableOpacity
                  onPress={() => setProvinceSearchKeyword('')}
                  style={styles.clearSearchButton}
                >
                  <Text style={styles.clearSearchIcon}>✕</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Province List */}
            <View style={styles.modalListWrapper}>
              <ScrollView
                style={styles.modalList}
                showsVerticalScrollIndicator={true}
                nestedScrollEnabled={true}
              >
                {filteredProvinces.length === 0 ? (
                  <View style={styles.emptyModal}>
                    <Text style={styles.emptyModalText}>
                      Không tìm thấy tỉnh/thành phố
                    </Text>
                  </View>
                ) : (
                  filteredProvinces.map((province, index) => (
                    <TouchableOpacity
                      key={province.id}
                      style={[
                        styles.provinceOption,
                        index === filteredProvinces.length - 1 && styles.provinceOptionLast,
                      ]}
                      onPress={() => {
                        // Update form value
                        personalControl._formValues.city = province.TenDiaBan;
                        setSelectedProvince(province.TenDiaBan);
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
        </View>
      </Modal>

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

  // Province Selector
  provinceSelector: {
    backgroundColor: COLORS.gray50,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 2,
    borderColor: COLORS.gray200,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 48,
  },
  provinceSelectorText: {
    fontSize: 15,
    color: COLORS.textPrimary,
    flex: 1,
  },
  placeholderText: {
    color: COLORS.gray400,
  },
  dropdownIcon: {
    fontSize: 24,
    color: COLORS.gray400,
    fontWeight: '300',
  },

  // Modal Styles
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
    backgroundColor: COLORS.overlay,
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    height: '80%',
    ...SHADOWS.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.gray100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseIcon: {
    fontSize: 18,
    color: COLORS.gray600,
    fontWeight: '600',
  },
  modalSearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray50,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  searchIcon: {
    fontSize: 20,
    marginRight: SPACING.sm,
  },
  modalSearchInput: {
    flex: 1,
    height: 44,
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  clearSearchButton: {
    padding: SPACING.xs,
  },
  clearSearchIcon: {
    fontSize: 16,
    color: COLORS.gray500,
  },
  modalListWrapper: {
    flex: 1,
    overflow: 'hidden',
  },
  modalList: {
    flex: 1,
  },
  provinceOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  provinceOptionLast: {
    borderBottomWidth: 0,
  },
  provinceOptionText: {
    fontSize: 15,
    color: COLORS.textPrimary,
    flex: 1,
  },
  provinceOptionTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  checkIcon: {
    fontSize: 20,
    color: COLORS.primary,
    fontWeight: '700',
  },
  emptyModal: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  emptyModalText: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
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
