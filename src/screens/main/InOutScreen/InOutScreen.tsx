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
  Platform,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
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

type TabMode = 'sell-in' | 'sell-out';

const InOutScreen = () => {
  const navigation = useNavigation<InOutScreenNavigationProp>();
  const route = useRoute<InOutScreenRouteProp>();
  const [isLoading, setIsLoading] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<TabMode>('sell-in');
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
      setActiveTab('sell-out');
    }
  }, [route.params?.selectedDealer]);

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

  const handleClearDealer = () => {
    setSelectedDealer(null);
  };

  const handleTabChange = (tab: TabMode) => {
    setActiveTab(tab);
    if (tab === 'sell-in') {
      setSelectedDealer(null);
    }
  };

  // Check if we're in sell-out mode with dealer selected
  const isSellOutMode = activeTab === 'sell-out';
  const hasDealerSelected = selectedDealer !== null;

  const submitLead = async (data: InOutFormData) => {
    try {
      setIsLoading(true);

      // Build customer info object
      const customerInfo = hasDealerSelected
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
    let title: string;
    let message: string;

    if (isSellOutMode) {
      // Sell Out mode
      title = 'Xác nhận Sell Out';
      message = hasDealerSelected
        ? `Bạn có chắc chắn muốn xuất kho cho đại lý "${selectedDealer?.name}"?\n\nSerial: ${data.serial}`
        : `Bạn có chắc chắn muốn Sell Out?\n\nSerial: ${data.serial}`;
    } else {
      // Sell In mode
      title = 'Xác nhận Sell In';
      message = `Bạn có chắc chắn muốn nhập kho?\n\nSerial: ${data.serial}`;
    }

    Alert.alert(
      title,
      message,
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

      <KeyboardAwareScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid={true}
        extraScrollHeight={Platform.OS === 'ios' ? 20 : 100}
        extraHeight={120}
      >
          {/* Tab Switcher */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'sell-in' && styles.tabActiveSellIn,
              ]}
              onPress={() => handleTabChange('sell-in')}
              activeOpacity={0.7}
            >
              <Icon
                name="sell-in"
                size={18}
                color={activeTab === 'sell-in' ? COLORS.white : COLORS.primary}
              />
              <Text style={[
                styles.tabText,
                activeTab === 'sell-in' && styles.tabTextActive,
              ]}>
                Sell In
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'sell-out' && styles.tabActiveSellOut,
              ]}
              onPress={() => handleTabChange('sell-out')}
              activeOpacity={0.7}
            >
              <Icon
                name="sell-out"
                size={18}
                color={activeTab === 'sell-out' ? COLORS.white : COLORS.secondary}
              />
              <Text style={[
                styles.tabText,
                styles.tabTextSellOut,
                activeTab === 'sell-out' && styles.tabTextActive,
              ]}>
                Sell Out
              </Text>
            </TouchableOpacity>
          </View>

          {/* Customer Info Card */}
          <View style={[
            styles.customerCard,
            isSellOutMode && styles.customerCardSellOut,
          ]}>
            {/* Sell In Mode - Show logged in user */}
            {!isSellOutMode && (
              <View style={styles.customerContent}>
                <Avatar
                  key={avatarKey}
                  uri={user?.avatar}
                  size={50}
                  style={styles.avatarContainer}
                />
                <View style={styles.customerInfo}>
                  <Text style={styles.customerLabel}>Nhập kho cho</Text>
                  <Text style={styles.customerName}>
                    {user ? user.name : 'Chưa đăng nhập'}
                  </Text>
                  {user?.phone && (
                    <Text style={styles.customerPhone}>SĐT: {user.phone}</Text>
                  )}
                </View>
              </View>
            )}

            {/* Sell Out Mode */}
            {isSellOutMode && (
              <>
                {/* Dealer Selection Option */}
                {!hasDealerSelected ? (
                  <View style={styles.sellOutOptions}>
                    <Text style={styles.sellOutLabel}>Chọn đại lý để Sell Out</Text>
                    <TouchableOpacity
                      style={styles.selectDealerButton}
                      onPress={handleSelectDealer}
                      activeOpacity={0.7}
                    >
                      <Icon name="store" size={24} color={COLORS.secondary} />
                      <View style={styles.selectDealerContent}>
                        <Text style={styles.selectDealerText}>Chọn đại lý cấp dưới</Text>
                        <Text style={styles.selectDealerHint}>
                          Nhấn để chọn đại lý từ danh sách
                        </Text>
                      </View>
                      <Text style={commonStyles.chevronIcon}>›</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.selectedDealerContainer}>
                    <View style={styles.customerContent}>
                      <View style={styles.dealerAvatarPlaceholder}>
                        <Icon name="store" size={24} color={COLORS.secondary} />
                      </View>
                      <View style={styles.customerInfo}>
                        <Text style={[styles.customerLabel, styles.customerLabelSellOut]}>
                          Sell Out cho
                        </Text>
                        <Text style={styles.customerName}>{selectedDealer.name}</Text>
                        {selectedDealer.phone && (
                          <Text style={styles.customerPhone}>
                            SĐT: {selectedDealer.phone}
                          </Text>
                        )}
                        {selectedDealer.address && (
                          <Text style={styles.customerAddress} numberOfLines={1}>
                            {selectedDealer.address}
                          </Text>
                        )}
                      </View>
                    </View>

                    <View style={styles.dealerActions}>
                      <TouchableOpacity
                        style={styles.changeDealerButton}
                        onPress={handleSelectDealer}
                        activeOpacity={0.7}
                      >
                        <Icon name="store" size={14} color={COLORS.secondary} />
                        <Text style={styles.changeDealerText}>Đổi đại lý</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.clearDealerButton}
                        onPress={handleClearDealer}
                        activeOpacity={0.7}
                      >
                        <Icon name="close" size={14} color={COLORS.gray500} />
                        <Text style={styles.clearDealerText}>Bỏ chọn</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </>
            )}
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
                      numberOfLines={4}
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
                  {isSellOutMode
                    ? 'Quét mã QR hoặc nhập serial để xuất kho cho đại lý'
                    : 'Quét mã QR hoặc nhập serial để nhập kho'
                  }
                </Text>
              </View>
            </View>

            {/* Save Button */}
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
                <>
                  <Icon
                    name={isSellOutMode ? 'sell-out' : 'sell-in'}
                    size={20}
                    color={COLORS.white}
                  />
                  <Text style={styles.saveButtonText}>
                    {isSellOutMode ? 'Sell Out' : 'Sell In'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Bottom Spacing */}
          <View style={styles.bottomSpacing} />
      </KeyboardAwareScrollView>

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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SPACING.xl,
  },

  // Tab Switcher
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: 4,
    ...SHADOWS.sm,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm + 2,
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.xs,
  },
  tabActiveSellIn: {
    backgroundColor: COLORS.primary,
  },
  tabActiveSellOut: {
    backgroundColor: COLORS.secondary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  tabTextSellOut: {
    color: COLORS.secondary,
  },
  tabTextActive: {
    color: COLORS.white,
  },

  // Customer Card
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
  customerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: SPACING.md,
  },
  customerInfo: {
    flex: 1,
  },
  customerLabel: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '500',
    marginBottom: 2,
  },
  customerLabelSellOut: {
    color: COLORS.secondary,
  },
  customerName: {
    fontSize: 16,
    color: COLORS.textPrimary,
    fontWeight: '700',
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

  // Sell Out Options
  sellOutOptions: {
    gap: SPACING.sm,
  },
  sellOutLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  selectDealerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.secondary,
    borderStyle: 'dashed',
    gap: SPACING.sm,
  },
  selectDealerContent: {
    flex: 1,
  },
  selectDealerText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.secondary,
  },
  selectDealerHint: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },

  // Selected Dealer
  selectedDealerContainer: {
    gap: SPACING.sm,
  },
  dealerAvatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.secondary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  dealerActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.xs,
  },
  changeDealerButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.secondary + '15',
    borderRadius: BORDER_RADIUS.md,
    gap: 6,
  },
  changeDealerText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.secondary,
  },
  clearDealerButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.gray100,
    borderRadius: BORDER_RADIUS.md,
    gap: 6,
  },
  clearDealerText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.gray500,
  },

  // Scan Card
  scanCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.xl,
    ...SHADOWS.md,
  },
  qrButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  qrImage: {
    width: 100,
    height: 100,
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
    padding: SPACING.sm,
    minHeight: 56,
  },
  inputWrapperError: {
    borderColor: COLORS.error,
  },
  textArea: {
    fontSize: 15,
    color: COLORS.textPrimary,
    minHeight: 70,
    padding: 0,
  },
  errorText: {
    fontSize: 12,
    color: COLORS.error,
    marginTop: SPACING.xs,
  },

  // Save Button
  saveButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderRadius: BORDER_RADIUS.md,
    marginTop: SPACING.md,
    gap: SPACING.sm,
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
