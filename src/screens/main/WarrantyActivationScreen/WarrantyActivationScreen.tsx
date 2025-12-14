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
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../../config/theme';
import { warrantyService } from '../../../api/warrantyService';
import CustomHeader from '../../../components/CustomHeader';
import BarcodeScanner from '../../../components/BarcodeScanner';

// Validation Schema
const warrantyActivationSchema = z.object({
  serial: z.string().min(1, 'Số serial là bắt buộc'),
  customerName: z.string().min(1, 'Tên khách hàng là bắt buộc'),
  phone: z
    .string()
    .min(1, 'Số điện thoại là bắt buộc')
    .regex(/^[0-9]{9,11}$/, 'Số điện thoại không hợp lệ'),
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

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<WarrantyActivationFormData>({
    resolver: zodResolver(warrantyActivationSchema),
    defaultValues: {
      serial: '',
      customerName: '',
      phone: '',
      address: '',
      email: '',
    },
  });

  const handleScanQR = () => {
    setShowScanner(true);
  };

  const handleScanComplete = (data: string) => {
    setValue('serial', data);
    setShowScanner(false);
  };

  const handleActivate = async (data: WarrantyActivationFormData) => {
    try {
      setIsLoading(true);

      const response = await warrantyService.activate({
        serial: data.serial,
        customerName: data.customerName,
        phone: data.phone,
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
              // TODO: Navigate to warranty details or clear form
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
                    <Text style={styles.infoIcon}>ℹ️</Text>
                  </TouchableOpacity>
                </View>
                <View
                  style={[
                    styles.inputWrapper,
                    errors.serial && styles.inputWrapperError,
                  ]}
                >
                  <Text style={styles.inputIcon}>🔍</Text>
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
                    <Text style={styles.scanIcon}>⚡</Text>
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
                  <Text style={styles.inputIcon}>👤</Text>
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
                  <Text style={styles.inputIcon}>📞</Text>
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
                  <Text style={styles.inputIcon}>📍</Text>
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
                  <Text style={styles.inputIcon}>📧</Text>
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
          <View style={styles.infoBox}>
            <Text style={styles.infoBoxIcon}>ℹ️</Text>
            <Text style={styles.infoText}>
              Vui lòng điền đầy đủ thông tin để kích hoạt bảo hành. Thông tin
              này sẽ được sử dụng cho việc hỗ trợ và bảo hành sản phẩm.
            </Text>
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
    fontSize: 20,
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
  scanIcon: {
    fontSize: 24,
  },
  errorText: {
    fontSize: 12,
    color: COLORS.error,
    marginTop: SPACING.xs,
  },

  // Info Box
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.accent + '15',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.accent + '30',
    marginBottom: SPACING.lg,
  },
  infoBoxIcon: {
    fontSize: 18,
    marginRight: SPACING.sm,
    marginTop: 2,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
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
