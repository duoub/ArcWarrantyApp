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
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../../config/theme';
import CustomHeader from '../../../components/CustomHeader';
import Avatar from '../../../components/Avatar';
import BarcodeScanner from '../../../components/BarcodeScanner/BarcodeScanner';
import { useAuthStore } from '../../../store/authStore';
import { InOutStackParamList } from '../../../navigation/MainNavigator';
import { commonStyles } from '../../../styles/commonStyles';
import { Icon } from '../../../components/common';
import { inOutService } from '../../../api/inOutService';

type InOutScreenNavigationProp = StackNavigationProp<InOutStackParamList, 'InOut'>;
type InOutScreenRouteProp = RouteProp<InOutStackParamList, 'InOut'>;

// Validation Schema
const inOutSchema = z.object({
  serial: z.string().min(1, 'Số serial là bắt buộc'),
});

type InOutFormData = z.infer<typeof inOutSchema>;

const InOutScreen = () => {
  const navigation = useNavigation<InOutScreenNavigationProp>();
  const route = useRoute<InOutScreenRouteProp>();
  const [isLoading, setIsLoading] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const { user } = useAuthStore();
  const [selectedDealer, setSelectedDealer] = useState<{
    id: number;
    name: string;
    phone: string;
    address: string;
  } | null>(null);
  const [avatarKey, setAvatarKey] = useState(0);

  // Handle dealer selection from navigation params
  useEffect(() => {
    if (route.params?.selectedDealer) {
      setSelectedDealer(route.params.selectedDealer);
    }
  }, [route.params?.selectedDealer]);

  // Log user info khi component mount để debug
  useEffect(() => {
  }, [user]);

  // Log when user avatar changes to debug re-render
  useEffect(() => {
    // Force Avatar component to re-render by changing key
    setAvatarKey(prev => prev + 1);
  }, [user?.avatar]);

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    getValues,
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
    const currentSerial = getValues('serial');
    const newSerial = currentSerial ? `${currentSerial};${data}` : data;
    setValue('serial', newSerial);
    setShowScanner(false);
  };

  const handleSelectDealer = () => {
    navigation.navigate('DealerList', { fromInOut: true });
  };

  const handleResetToSellIn = () => {
    setSelectedDealer(null);
  };

  // Check if we're in sell-out mode
  const isSellOutMode = selectedDealer !== null;

  const submitLead = async (data: InOutFormData) => {
    try {
      setIsLoading(true);

      // Build customer info object
      const customerInfo = isSellOutMode
        ? {
            id: selectedDealer!.id,
            name: selectedDealer!.name,
            phone: selectedDealer!.phone,
            address: selectedDealer!.address,
          }
        : {
            id: user?.id || '',
            name: user?.name || '',
            phone: user?.phone || '',
            address: user?.address || '',
          };

      // Build lead info object
      const leadInfo = {
        title: data.serial,
        mota: '',
        step: { name: '', id: '' },
        stepid: '',
      };

      const response = await inOutService.sendLead({
        customer: customerInfo,
        lead: leadInfo,
        sellout: isSellOutMode ? 1 : 0,
      });

      if (response.status) {
        Alert.alert(
          'Lưu thành công',
          response.message || `Thông tin serial đã được lưu thành công!`,
          [
            {
              text: 'OK',
              onPress: () => {
                setValue('serial', '');
              },
            },
          ]
        );
      } else {
        Alert.alert(
          'Lưu thất bại',
          response.strError || response.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.'
        );
      }
    } catch (error) {
      Alert.alert(
        'Lưu thất bại',
        error instanceof Error ? error.message : 'Đã có lỗi xảy ra. Vui lòng thử lại.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveInfo = (data: InOutFormData) => {
    const modeText = isSellOutMode ? 'Sell Out' : 'Sell In';
    const customerName = isSellOutMode ? selectedDealer?.name : user?.name;

    Alert.alert(
      `Xác nhận ${modeText}`,
      `Bạn có chắc chắn muốn ${modeText} cho "${customerName}"?\n\nSerial: ${data.serial}`,
      [
        {
          text: 'Hủy',
          style: 'cancel',
        },
        {
          text: 'Xác nhận',
          onPress: () => submitLead(data),
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      <CustomHeader title="Quét IN/OUT" />

      <View style={styles.contentContainer}>
        {/* Customer Info Card - Hiển thị thông tin user đã login hoặc dealer được chọn */}
        <View style={[
          styles.customerCard,
          isSellOutMode && styles.customerCardSellOut,
        ]}>
          {/* Mode Indicator Badge */}
          <View style={[
            styles.modeBadge,
            isSellOutMode ? styles.modeBadgeSellOut : styles.modeBadgeSellIn,
          ]}>
            <View style={styles.modeBadgeContent}>
              <Icon
                name={isSellOutMode ? 'sell-out' : 'sell-in'}
                size={14}
                color={COLORS.textPrimary}
              />
              <Text style={styles.modeBadgeText}>
                {isSellOutMode ? 'SELL OUT' : 'SELL IN'}
              </Text>
            </View>
          </View>

          <View style={styles.customerHeader}>
            <Avatar
              key={avatarKey}
              uri={isSellOutMode ? undefined : user?.avatar}
              size={50}
              style={styles.avatarContainer}
            />
            <View style={styles.customerInfo}>
              <Text style={styles.customerName}>
                {isSellOutMode
                  ? selectedDealer?.name
                  : (user ? user.name : 'Chưa đăng nhập')
                }
              </Text>
              {(isSellOutMode ? selectedDealer?.phone : user?.phone) && (
                <Text style={styles.customerPhone}>
                  SĐT: {isSellOutMode ? selectedDealer?.phone : user?.phone}
                </Text>
              )}
              {isSellOutMode && selectedDealer?.address && (
                <Text style={styles.customerAddress} numberOfLines={1}>
                  {selectedDealer.address}
                </Text>
              )}
            </View>
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[
                styles.dealerActionButton,
                isSellOutMode && styles.dealerActionButtonSecondary,
              ]}
              onPress={handleSelectDealer}
              activeOpacity={0.7}
            >
              <View style={styles.buttonContent}>
                <Icon
                  name="sell-out"
                  size={16}
                  color={isSellOutMode ? COLORS.secondary : COLORS.white}
                />
                <Text style={[
                  styles.dealerActionButtonText,
                  isSellOutMode && styles.dealerActionButtonTextSecondary,
                ]}>
                  {isSellOutMode ? 'Đổi đại lý' : 'Chọn sell out'}
                </Text>
              </View>
            </TouchableOpacity>

            {isSellOutMode && (
              <TouchableOpacity
                style={styles.resetButton}
                onPress={handleResetToSellIn}
                activeOpacity={0.7}
              >
                <View style={styles.buttonContent}>
                  <Icon name="back" size={16} color={COLORS.white} />
                  <Text style={styles.resetButtonText}>Về Sell In</Text>
                </View>
              </TouchableOpacity>
            )}
          </View>
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
          <View style={commonStyles.infoBox}>
            <Icon name="info" size={20} color={COLORS.info} />
            <View style={commonStyles.infoBoxContent}>
              <Text style={commonStyles.infoBoxText}>
                Vui lòng quét mã QR hoặc nhập số serial để lưu thông tin
              </Text>
            </View>
          </View>

          {/* Save Button - Inside card for seamless look */}
          <TouchableOpacity
            style={[
              styles.saveButton,
              isSellOutMode && styles.saveButtonSellOut,
              isLoading && styles.saveButtonDisabled,
            ]}
            onPress={handleSubmit(handleSaveInfo)}
            activeOpacity={0.8}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={COLORS.white} size="small" />
            ) : (
              <Text style={styles.saveButtonText}>
                {isSellOutMode ? 'Sell Out' : 'Sell In'}
              </Text>
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
  customerCardSellOut: {
    backgroundColor: '#FFF8F0',
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

  // Mode Badge
  modeBadge: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
    zIndex: 1,
  },
  modeBadgeSellIn: {
    backgroundColor: COLORS.primary + '20',
  },
  modeBadgeSellOut: {
    backgroundColor: COLORS.secondary + '30',
  },
  modeBadgeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  modeBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },

  // Button Row
  buttonRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dealerActionButton: {
    flex: 1,
    backgroundColor: COLORS.secondary,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dealerActionButtonSecondary: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.secondary,
  },
  dealerActionButtonText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '600',
    textAlignVertical: 'center',
  },
  dealerActionButtonTextSecondary: {
    color: COLORS.secondary,
  },
  resetButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetButtonText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '600',
    textAlignVertical: 'center',
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
  saveButtonSellOut: {
    backgroundColor: COLORS.secondary,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },

  bottomSpacing: {
    height: SPACING.xl,
  },
});

export default InOutScreen;
