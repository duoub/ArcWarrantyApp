import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StatusBar,
  Image,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../../config/theme';
import { warrantyService } from '../../../api/warrantyService';
import CustomHeader from '../../../components/CustomHeader';
import BarcodeScanner from '../../../components/BarcodeScanner';
import LocationSelector from '../../../components/LocationSelector';
import { commonStyles } from '../../../styles/commonStyles';
import { Location } from '../../../types/province';
import { Icon } from '../../../components/common';

// Validation Schema
const warrantyActivationSchema = z.object({
  serial: z.string().min(1, 'Số serial là bắt buộc'),
  customerName: z.string().min(1, 'Tên khách hàng là bắt buộc'),
  phone: z
    .string()
    .min(1, 'Số điện thoại là bắt buộc')
    .regex(/^[0-9]{9,11}$/, 'Số điện thoại không hợp lệ'),
  tinhthanh: z.string().min(1, 'Tỉnh thành là bắt buộc'),
  quanhuyen: z.string().min(1, 'Quận huyện là bắt buộc'),
  xaphuong: z.string().min(1, 'Xã phường là bắt buộc'),
  address: z.string().min(1, 'Địa chỉ là bắt buộc'),
  email: z
    .string()
    .email('Email không hợp lệ')
    .optional()
    .or(z.literal('')),
});

type WarrantyActivationFormData = z.infer<typeof warrantyActivationSchema>;

const WarrantyActivationScreen = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [province, setProvince] = useState<Location | null>(null);
  const [district, setDistrict] = useState<Location | null>(null);
  const [ward, setWard] = useState<Location | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    getValues,
    reset,
  } = useForm<WarrantyActivationFormData>({
    resolver: zodResolver(warrantyActivationSchema),
    defaultValues: {
      serial: '',
      customerName: '',
      phone: '',
      tinhthanh: '',
      quanhuyen: '',
      xaphuong: '',
      address: '',
      email: '',
    },
  });

  const handleScanQR = () => {
    setShowScanner(true);
  };

  const handleScanComplete = (data: string) => {
    const currentSerial = getValues('serial');
    const newSerial = currentSerial ? `${currentSerial};${data}` : data;
    setValue('serial', newSerial);
    setShowScanner(false);
  };

  const handleActivate = async (data: WarrantyActivationFormData) => {
    try {
      setIsLoading(true);

      const response = await warrantyService.activate({
        serial: data.serial,
        customerName: data.customerName,
        phone: data.phone,
        tinhthanh: data.tinhthanh,
        quanhuyen: data.quanhuyen,
        xaphuong: data.xaphuong,
        address: data.address,
        email: data.email,
      });

      Alert.alert(
        'Kích hoạt thành công',
        response.message || `Bảo hành cho serial ${data.serial} đã được kích hoạt thành công!`,
        [
          {
            text: 'OK',
            onPress: () => {
              // Reset form and location states
              reset();
              setProvince(null);
              setDistrict(null);
              setWard(null);
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert(
        'Kích hoạt thất bại',
        error instanceof Error ? error.message : 'Đã có lỗi xảy ra. Vui lòng thử lại.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleHelp = () => {
    Alert.alert(
      'Thông tin trợ giúp',
      'Vui lòng quét mã QR trên sản phẩm hoặc nhập số serial thủ công.\n\n' +
      'Số serial thường được in trên tem bảo hành hoặc hộp sản phẩm.',
      [{ text: 'Đã hiểu' }]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      {/* Custom Header */}
      <CustomHeader
        title="Kích hoạt bảo hành"
      />

      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >

          {/* Form Card */}
          <View style={styles.formCard}>
            {/* Serial Number */}
            <Controller
              control={control}
              name="serial"
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={styles.inputContainer}>
                  <View style={styles.labelRow}>
                    <Text style={styles.inputLabel}>
                      Số serial <Text style={styles.required}>*</Text>
                    </Text>
                    <TouchableOpacity
                      style={styles.infoButton}
                      onPress={handleHelp}
                      activeOpacity={0.7}
                    >
                      <Icon name="question" size={22} color={COLORS.accent} />
                    </TouchableOpacity>
                  </View>
                  <View
                    style={[
                      styles.inputWrapper,
                      errors.serial && styles.inputWrapperError,
                    ]}
                  >
                    <Icon name="search" size={18} color={COLORS.gray500} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Nhập số serial"
                      placeholderTextColor={COLORS.gray400}
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      editable={!isLoading}
                      multiline
                      numberOfLines={2}
                    />
                    <TouchableOpacity
                      style={styles.scanButton}
                      onPress={handleScanQR}
                      disabled={isLoading}
                    >
                      <Image
                        source={require('../../../assets/images/scan_me.png')}
                        style={styles.scanImage}
                        resizeMode="contain"
                      />
                    </TouchableOpacity>
                  </View>
                  {errors.serial && (
                    <Text style={styles.errorText}>{errors.serial.message}</Text>
                  )}
                </View>
              )}
            />

            {/* Customer Name */}
            <Controller
              control={control}
              name="customerName"
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>
                    Tên khách hàng <Text style={styles.required}>*</Text>
                  </Text>
                  <View
                    style={[
                      styles.inputWrapper,
                      errors.customerName && styles.inputWrapperError,
                    ]}
                  >
                    <Icon name="user" size={20} color={COLORS.gray400} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Nhập họ tên"
                      placeholderTextColor={COLORS.gray400}
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      editable={!isLoading}
                    />
                  </View>
                  {errors.customerName && (
                    <Text style={styles.errorText}>
                      {errors.customerName.message}
                    </Text>
                  )}
                </View>
              )}
            />

            {/* Phone Number */}
            <Controller
              control={control}
              name="phone"
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>
                    Số điện thoại <Text style={styles.required}>*</Text>
                  </Text>
                  <View
                    style={[
                      styles.inputWrapper,
                      errors.phone && styles.inputWrapperError,
                    ]}
                  >
                    <Icon name="phone" size={20} color={COLORS.gray400} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Nhập số điện thoại"
                      placeholderTextColor={COLORS.gray400}
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      keyboardType="phone-pad"
                      editable={!isLoading}
                    />
                  </View>
                  {errors.phone && (
                    <Text style={styles.errorText}>{errors.phone.message}</Text>
                  )}
                </View>
              )}
            />

            {/* Province */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>
                Tỉnh thành <Text style={styles.required}>*</Text>
              </Text>
              <LocationSelector
                parentCode=""
                selectedLocation={province?.TenDiaBan || ''}
                onLocationChange={(location) => {
                  setProvince(location);
                  setValue('tinhthanh', location?.TenDiaBan || '');
                  setDistrict(null);
                  setWard(null);
                  setValue('quanhuyen', '');
                  setValue('xaphuong', '');
                }}
                placeholder="Chọn tỉnh thành"
              />
              {errors.tinhthanh && (
                <Text style={styles.errorText}>{errors.tinhthanh.message}</Text>
              )}
            </View>

            {/* District */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>
                Quận huyện <Text style={styles.required}>*</Text>
              </Text>
              <LocationSelector
                parentCode={province?.MaDiaBan || ''}
                selectedLocation={district?.TenDiaBan || ''}
                onLocationChange={(location) => {
                  setDistrict(location);
                  setValue('quanhuyen', location?.TenDiaBan || '');
                  setWard(null);
                  setValue('xaphuong', '');
                }}
                placeholder="Chọn quận huyện"
                disabled={!province}
              />
              {errors.quanhuyen && (
                <Text style={styles.errorText}>{errors.quanhuyen.message}</Text>
              )}
            </View>

            {/* Ward */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>
                Xã phường <Text style={styles.required}>*</Text>
              </Text>
              <LocationSelector
                parentCode={district?.MaDiaBan || ''}
                selectedLocation={ward?.TenDiaBan || ''}
                onLocationChange={(location) => {
                  setWard(location);
                  setValue('xaphuong', location?.TenDiaBan || '');
                }}
                placeholder="Chọn xã phường"
                disabled={!district}
              />
              {errors.xaphuong && (
                <Text style={styles.errorText}>{errors.xaphuong.message}</Text>
              )}
            </View>

            {/* Address */}
            <Controller
              control={control}
              name="address"
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>
                    Địa chỉ <Text style={styles.required}>*</Text>
                  </Text>
                  <View
                    style={[
                      styles.inputWrapper,
                      errors.address && styles.inputWrapperError,
                    ]}
                  >
                    <Icon name="location" size={18} color={COLORS.gray500} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Nhập địa chỉ"
                      placeholderTextColor={COLORS.gray400}
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      editable={!isLoading}
                      multiline
                      numberOfLines={2}
                    />
                  </View>
                  {errors.address && (
                    <Text style={styles.errorText}>{errors.address.message}</Text>
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
                  <View
                    style={[
                      styles.inputWrapper,
                      errors.email && styles.inputWrapperError,
                    ]}
                  >
                    <Icon name="mail" size={18} color={COLORS.gray500} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Nhập email (không bắt buộc)"
                      placeholderTextColor={COLORS.gray400}
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      editable={!isLoading}
                    />
                  </View>
                  {errors.email && (
                    <Text style={styles.errorText}>{errors.email.message}</Text>
                  )}
                </View>
              )}
            />

            {/* Info Box */}
            <View style={commonStyles.infoBox}>
              <Icon name="info" size={18} color={COLORS.accent} style={commonStyles.infoBoxIcon} />
              <View style={commonStyles.infoBoxContent}>
                <Text style={commonStyles.infoBoxText}>
                  Vui lòng điền đầy đủ thông tin để kích hoạt bảo hành. Thông tin
                  này sẽ được sử dụng cho việc hỗ trợ và bảo hành sản phẩm.
                </Text>
              </View>
            </View>

            {/* Activate Button */}
            <TouchableOpacity
              style={[
                styles.activateButton,
                isLoading && styles.activateButtonDisabled,
              ]}
              onPress={handleSubmit(handleActivate)}
              activeOpacity={0.8}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={COLORS.white} size="small" />
              ) : (
                <Text style={styles.activateButtonText}>Kích hoạt</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Bottom Spacing */}
          <View style={styles.bottomSpacing} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Barcode Scanner Modal */}
      <BarcodeScanner
        visible={showScanner}
        onClose={() => setShowScanner(false)}
        onScan={handleScanComplete}
        title="Quét mã sản phẩm"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },

  // Help Icon
  helpIcon: {
    fontSize: 20,
    color: COLORS.white,
  },

  // Form Card
  formCard: {
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
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  infoButton: {
    padding: 4,
  },
  infoIcon: {
    fontSize: 18,
  },
  required: {
    color: COLORS.error,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray50,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 2,
    borderColor: COLORS.gray200,
    paddingHorizontal: SPACING.md,
    minHeight: 52,
  },
  inputWrapperError: {
    borderColor: COLORS.error,
  },
  inputIcon: {
    marginRight: SPACING.sm,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: COLORS.textPrimary,
    paddingVertical: SPACING.sm,
  },
  scanButton: {
    padding: SPACING.xs,
    marginLeft: SPACING.xs,
  },
  scanImage: {
    width: 32,
    height: 32,
  },
  errorText: {
    fontSize: 12,
    color: COLORS.error,
    marginTop: SPACING.xs,
  },

  // Activate Button
  activateButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 0,
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderRadius: BORDER_RADIUS.md,
    ...SHADOWS.md,
  },
  activateButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
    letterSpacing: 0.5,
  },
  activateButtonDisabled: {
    opacity: 0.6,
  },

  bottomSpacing: {
    height: SPACING.xl,
  },
});

export default WarrantyActivationScreen;
