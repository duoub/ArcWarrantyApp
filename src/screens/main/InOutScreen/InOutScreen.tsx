import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  StatusBar,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../../config/theme';
import CustomHeader from '../../../components/CustomHeader';
import Avatar from '../../../components/Avatar';
import BarcodeScanner from '../../../components/BarcodeScanner';
import { useAuthStore } from '../../../store/authStore';
import { InOutStackParamList } from '../../../navigation/MainNavigator';

type InOutScreenNavigationProp = StackNavigationProp<InOutStackParamList, 'InOut'>;

// Validation Schema
const inOutSchema = z.object({
  serial: z.string().min(1, 'Số serial là bắt buộc'),
});

type InOutFormData = z.infer<typeof inOutSchema>;

const InOutScreen = () => {
  const navigation = useNavigation<InOutScreenNavigationProp>();
  const [isLoading, setIsLoading] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const { user } = useAuthStore();
  const [customerInfo] = useState({
    id: 0,
    name: '',
    phone: '',
    address: '',
  });

  // Log user info khi component mount để debug
  useEffect(() => {
    console.log('📋 InOutScreen - Current User:', user);
    if (user) {
      console.log('  - ID:', user.id);
      console.log('  - Name:', user.name);
      console.log('  - Email:', user.email);
      console.log('  - Phone:', user.phone);
      console.log('  - Role:', user.role);
    }
  }, [user]);

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<InOutFormData>({
    resolver: zodResolver(inOutSchema),
    defaultValues: {
      serial: '',
    },
  });

  const handleScanQR = () => {
    setShowScanner(true);
  };

  const handleScanComplete = (data: string) => {
    setValue('serial', data);
    setShowScanner(false);
  };

  const handleSelectDealer = () => {
    navigation.navigate('DealerList');
  };

  const handleSaveInfo = async (data: InOutFormData) => {
    try {
      setIsLoading(true);

      // TODO: Implement API call to save IN/OUT information
      await new Promise((resolve) => setTimeout(resolve, 1500));

      Alert.alert(
        'Lưu thành công',
        `Thông tin serial ${data.serial} đã được lưu thành công!`,
        [
          {
            text: 'OK',
            onPress: () => {
              setValue('serial', '');
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert(
        'Lưu thất bại',
        error instanceof Error ? error.message : 'Đã có lỗi xảy ra. Vui lòng thử lại.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      <CustomHeader title="Quét IN/OUT" />

      <View style={styles.contentContainer}>
        {/* Customer Info Card - Hiển thị thông tin user đã login hoặc dealer được chọn */}
        <View style={styles.customerCard}>
          <View style={styles.customerHeader}>
            <Avatar uri={user?.avatar} size={50} style={styles.avatarContainer} />
            <View style={styles.customerInfo}>
              <Text style={styles.customerName}>
                {customerInfo.name || (user ? user.name : 'Chưa chọn đại lý')}
              </Text>
              {(customerInfo.phone || user?.phone) && (
                <Text style={styles.customerPhone}>
                  SĐT: {customerInfo.phone || user?.phone}
                </Text>
              )}
              {(customerInfo.address) && (
                <Text style={styles.customerAddress} numberOfLines={1}>
                  {customerInfo.address}
                </Text>
              )}
            </View>
          </View>

          <TouchableOpacity
            style={styles.selectDealerButton}
            onPress={handleSelectDealer}
            activeOpacity={0.7}
          >
            <Text style={styles.selectDealerText}>Chọn sell out cho đại lý</Text>
          </TouchableOpacity>
        </View>

        {/* Scan Card */}
        <View style={styles.scanCard}>
          {/* QR Scan Button */}
          <TouchableOpacity
            style={styles.qrButton}
            onPress={handleScanQR}
            activeOpacity={0.8}
          >
            <Image
              source={require('../../../assets/images/scan_me.png')}
              style={styles.qrImage}
              resizeMode="contain"
            />
          </TouchableOpacity>

          {/* Serial Input */}
          <Controller
            control={control}
            name="serial"
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>
                  Số serial <Text style={styles.required}>*</Text>
                </Text>
                <View
                  style={[
                    styles.inputWrapper,
                    errors.serial && styles.inputWrapperError,
                  ]}
                >
                  <TextInput
                    style={styles.textArea}
                    placeholder="Nhập hoặc quét mã serial"
                    placeholderTextColor={COLORS.gray400}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    editable={!isLoading}
                    multiline
                    numberOfLines={2}
                    textAlignVertical="top"
                  />
                </View>
                {errors.serial && (
                  <Text style={styles.errorText}>{errors.serial.message}</Text>
                )}
              </View>
            )}
          />

          {/* Info hint */}
          <View style={styles.infoBox}>
            <Text style={styles.infoIcon}>ℹ️</Text>
            <Text style={styles.infoText}>
              Vui lòng quét mã QR hoặc nhập số serial để lưu thông tin
            </Text>
          </View>

          {/* Save Button - Inside card for seamless look */}
          <TouchableOpacity
            style={[
              styles.saveButton,
              isLoading && styles.saveButtonDisabled,
            ]}
            onPress={handleSubmit(handleSaveInfo)}
            activeOpacity={0.8}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={COLORS.white} size="small" />
            ) : (
              <Text style={styles.saveButtonText}>Lưu thông tin</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </View>

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
  contentContainer: {
    flex: 1,
    paddingBottom: SPACING.md,
  },

  // Customer Card - Compact
  customerCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.md,
  },
  customerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  avatarContainer: {
    marginRight: SPACING.md,
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 15,
    color: COLORS.textPrimary,
    fontWeight: '600',
    marginBottom: 2,
  },
  customerPhone: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  customerAddress: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  selectDealerButton: {
    backgroundColor: COLORS.secondary,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  selectDealerText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '600',
  },

  // Scan Card
  scanCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    ...SHADOWS.md,
  },
  qrButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    marginBottom: SPACING.sm,
  },
  qrImage: {
    width: 140,
    height: 140,
  },

  // Input Fields
  inputContainer: {
    marginTop: SPACING.xs,
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
  inputWrapper: {
    backgroundColor: COLORS.gray50,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 2,
    borderColor: COLORS.gray200,
    padding: SPACING.md,
    minHeight: 70,
  },
  inputWrapperError: {
    borderColor: COLORS.error,
  },
  textArea: {
    fontSize: 15,
    color: COLORS.textPrimary,
    minHeight: 50,
    padding: 0,
  },
  errorText: {
    fontSize: 12,
    color: COLORS.error,
    marginTop: SPACING.xs,
  },

  // Info Box (similar to WarrantyActivationScreen)
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.accent + '15',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.accent + '30',
    marginTop: SPACING.md,
    marginBottom: SPACING.md,
  },
  infoIcon: {
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

  // Save Button (matching WarrantyActivationScreen style)
  saveButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 0,
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderRadius: BORDER_RADIUS.md,
    marginTop: SPACING.md,
    ...SHADOWS.md,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
    letterSpacing: 0.5,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },

  bottomSpacing: {
    height: SPACING.xl,
  },
});

export default InOutScreen;
