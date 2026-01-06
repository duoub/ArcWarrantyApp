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
import { useNavigation } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { COLORS, SPACING } from '../../../config/theme';
import { warrantyService } from '../../../api/warrantyService';
import CustomHeader from '../../../components/CustomHeader';
import BarcodeScanner from '../../../components/BarcodeScanner/BarcodeScanner';
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
  const navigation = useNavigation<any>();
  const [isLoading, setIsLoading] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [province, setProvince] = useState<Location | null>(null);
  const [district, setDistrict] = useState<Location | null>(null);
  const [ward, setWard] = useState<Location | null>(null);

  // Handle back button press
  const handleBack = () => {
    // Luôn dùng goBack() để có animation đúng (left to right)
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

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
        leftIcon={<Icon name="back" size={24} color={COLORS.white} />}
        onLeftPress={handleBack}
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
          <View style={commonStyles.cardWithMarginLarge}>
            {/* Serial Number */}
            <Controller
              control={control}
              name="serial"
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={commonStyles.inputContainer}>
                  <View style={styles.labelRow}>
                    <Text style={commonStyles.inputLabel}>
                      Số serial <Text style={commonStyles.required}>*</Text>
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
                      commonStyles.inputWrapper,
                      errors.serial && commonStyles.inputWrapperError,
                    ]}
                  >
                    <Icon name="search" size={18} color={COLORS.gray500} style={commonStyles.inputIcon} />
                    <TextInput
                      style={commonStyles.input}
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
                      style={commonStyles.scanButton}
                      onPress={handleScanQR}
                      disabled={isLoading}
                    >
                      <Image
                        source={require('../../../assets/images/scan_me.png')}
                        style={commonStyles.scanImage}
                        resizeMode="contain"
                      />
                    </TouchableOpacity>
                  </View>
                  {errors.serial && (
                    <Text style={commonStyles.errorText}>{errors.serial.message}</Text>
                  )}
                </View>
              )}
            />

            {/* Customer Name */}
            <Controller
              control={control}
              name="customerName"
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={commonStyles.inputContainer}>
                  <Text style={commonStyles.inputLabel}>
                    Tên khách hàng <Text style={commonStyles.required}>*</Text>
                  </Text>
                  <View
                    style={[
                      commonStyles.inputWrapper,
                      errors.customerName && commonStyles.inputWrapperError,
                    ]}
                  >
                    <Icon name="user" size={20} color={COLORS.gray400} style={commonStyles.inputIcon} />
                    <TextInput
                      style={commonStyles.input}
                      placeholder="Nhập họ tên"
                      placeholderTextColor={COLORS.gray400}
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      editable={!isLoading}
                    />
                  </View>
                  {errors.customerName && (
                    <Text style={commonStyles.errorText}>
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
                <View style={commonStyles.inputContainer}>
                  <Text style={commonStyles.inputLabel}>
                    Số điện thoại <Text style={commonStyles.required}>*</Text>
                  </Text>
                  <View
                    style={[
                      commonStyles.inputWrapper,
                      errors.phone && commonStyles.inputWrapperError,
                    ]}
                  >
                    <Icon name="phone" size={20} color={COLORS.gray400} style={commonStyles.inputIcon} />
                    <TextInput
                      style={commonStyles.input}
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
                    <Text style={commonStyles.errorText}>{errors.phone.message}</Text>
                  )}
                </View>
              )}
            />

            {/* Province */}
            <View style={commonStyles.inputContainer}>
              <Text style={commonStyles.inputLabel}>
                Tỉnh thành <Text style={commonStyles.required}>*</Text>
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
                <Text style={commonStyles.errorText}>{errors.tinhthanh.message}</Text>
              )}
            </View>

            {/* District */}
            <View style={commonStyles.inputContainer}>
              <Text style={commonStyles.inputLabel}>
                Quận huyện <Text style={commonStyles.required}>*</Text>
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
                <Text style={commonStyles.errorText}>{errors.quanhuyen.message}</Text>
              )}
            </View>

            {/* Ward */}
            <View style={commonStyles.inputContainer}>
              <Text style={commonStyles.inputLabel}>
                Xã phường <Text style={commonStyles.required}>*</Text>
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
                <Text style={commonStyles.errorText}>{errors.xaphuong.message}</Text>
              )}
            </View>

            {/* Address */}
            <Controller
              control={control}
              name="address"
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={commonStyles.inputContainer}>
                  <Text style={commonStyles.inputLabel}>
                    Địa chỉ <Text style={commonStyles.required}>*</Text>
                  </Text>
                  <View
                    style={[
                      commonStyles.inputWrapper,
                      errors.address && commonStyles.inputWrapperError,
                    ]}
                  >
                    <Icon name="location" size={18} color={COLORS.gray500} style={commonStyles.inputIcon} />
                    <TextInput
                      style={commonStyles.input}
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
                    <Text style={commonStyles.errorText}>{errors.address.message}</Text>
                  )}
                </View>
              )}
            />

            {/* Email */}
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={commonStyles.inputContainer}>
                  <Text style={commonStyles.inputLabel}>Email</Text>
                  <View
                    style={[
                      commonStyles.inputWrapper,
                      errors.email && commonStyles.inputWrapperError,
                    ]}
                  >
                    <Icon name="mail" size={18} color={COLORS.gray500} style={commonStyles.inputIcon} />
                    <TextInput
                      style={commonStyles.input}
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
                    <Text style={commonStyles.errorText}>{errors.email.message}</Text>
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
                commonStyles.buttonPrimary,
                isLoading && commonStyles.buttonPrimaryDisabled,
              ]}
              onPress={handleSubmit(handleActivate)}
              activeOpacity={0.8}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={COLORS.white} size="small" />
              ) : (
                <Text style={commonStyles.buttonPrimaryText}>Kích hoạt</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Bottom Spacing */}
          <View style={commonStyles.bottomSpacing} />
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
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  infoButton: {
    padding: 4,
  },
});

export default WarrantyActivationScreen;
