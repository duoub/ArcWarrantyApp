import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ActivityIndicator,
  Alert,
  StatusBar,
  Image,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING } from '../../../config/theme';
import CustomHeader from '../../../components/CustomHeader';
import BarcodeScanner from '../../../components/BarcodeScanner/BarcodeScanner';
import { commonStyles } from '../../../styles/commonStyles';
import { productLookupService } from '../../../api/productLookupService';
import { ProductInfo } from '../../../types/productLookup';
import { Icon, IconName } from '../../../components/common';

const ProductLookupScreen = () => {
  const navigation = useNavigation();
  const [serial, setSerial] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ProductInfo | null>(null);
  const [showScanner, setShowScanner] = useState(false);

  const handleScanQR = () => {
    setShowScanner(true);
  };

  const handleScanComplete = (data: string) => {
    setSerial(data);
    setShowScanner(false);
    // Auto search after scan
    setTimeout(() => {
      handleSearch();
    }, 100);
  };

  const handleSearch = async () => {
    if (!serial.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập số serial sản phẩm');
      return;
    }

    try {
      setIsLoading(true);
      setResult(null);

      const response = await productLookupService.checkProduct({
        imeiserial: serial.trim(),
      });

      if (response.success && response.data) {
        setResult(response.data);
      } else {
        Alert.alert(
          'Không tìm thấy',
          response.message || 'Không tìm thấy thông tin sản phẩm này trong hệ thống.'
        );
      }
    } catch (error) {
      Alert.alert(
        'Lỗi',
        error instanceof Error ? error.message : 'Không thể tra cứu thông tin sản phẩm. Vui lòng thử lại.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'authentic':
        return {
          text: 'Sản phẩm chính hãng',
          icon: 'product-lookup',
          color: COLORS.success,
          bgColor: '#E8F5E9',
        };
      default:
        return {
          text: 'Không tìm thấy thông tin',
          icon: '?',
          color: COLORS.gray500,
          bgColor: COLORS.gray100,
        };
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      <CustomHeader
        title="Kiểm tra sản phẩm"
        leftIcon={<Icon name="back" size={24} color={COLORS.white} />}
        onLeftPress={() => navigation.goBack()}
      />

      <KeyboardAwareScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid={true}
        extraScrollHeight={Platform.OS === 'ios' ? 20 : 100}
        extraHeight={120}
      >
        {/* Page Title */}
        <View style={commonStyles.pageHeader}>
          <Text style={commonStyles.pageTitle}>
            Kiểm tra sản phẩm chính hãng
          </Text>
        </View>

        {/* Search Card */}
        <View style={commonStyles.cardWithMarginLarge}>
          <Text style={commonStyles.inputLabel}>
            Nhập số serial sản phẩm
          </Text>
          <View style={commonStyles.inputWrapper}>
            <Icon name="search" size={18} color={COLORS.gray500} style={commonStyles.inputIcon} />
            <TextInput
              style={commonStyles.input}
              placeholder="Serial"
              placeholderTextColor={COLORS.gray400}
              value={serial}
              onChangeText={setSerial}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
              editable={!isLoading}
            />
            <TouchableOpacity
              onPress={handleScanQR}
              style={commonStyles.scanButton}
              disabled={isLoading}
            >
              <Image
                source={require('../../../assets/images/scan_me.png')}
                style={commonStyles.scanImage}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[commonStyles.buttonPrimary, isLoading && commonStyles.buttonPrimaryDisabled]}
            onPress={handleSearch}
            activeOpacity={0.8}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={COLORS.white} size="small" />
            ) : (
              <Text style={commonStyles.buttonPrimaryText}>Kiểm tra</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Result Card */}
        {result && (
          <View style={commonStyles.cardWithMarginLarge}>
            {/* Status Header */}
            <View
              style={[
                styles.statusHeader,
                { backgroundColor: getStatusInfo(result.status).bgColor },
              ]}
            >
              <View style={styles.statusIconContainer}>
                {/* <Text style={styles.statusIconLarge}>
                  {getStatusInfo(result.status).icon}
                </Text> */}
                <Icon name={getStatusInfo(result.status).icon as IconName} size={80} color={COLORS.success} />
              </View>
              <Text
                style={[
                  styles.statusTitle,
                  { color: getStatusInfo(result.status).color },
                ]}
              >
                {getStatusInfo(result.status).text}
              </Text>
            </View>

            {/* Product Details */}
            {result.isAuthentic && (
              <View style={styles.resultBody}>
                <Text style={commonStyles.sectionTitle}>Thông tin sản phẩm</Text>

                {/* Serial */}
                <View style={commonStyles.infoRowHorizontal}>
                  <Text style={commonStyles.infoLabelFixed}>Số serial:</Text>
                  <Text style={commonStyles.infoValueFlex}>{result.serial}</Text>
                </View>

                {/* Product Code */}
                {result.code && (
                  <View style={commonStyles.infoRowHorizontal}>
                    <Text style={commonStyles.infoLabelFixed}>Mã sản phẩm:</Text>
                    <Text style={commonStyles.infoValueFlex}>{result.code}</Text>
                  </View>
                )}

                {/* Product Name */}
                <View style={commonStyles.infoRowHorizontal}>
                  <Text style={commonStyles.infoLabelFixed}>Tên sản phẩm:</Text>
                  <Text style={commonStyles.infoValueFlex}>{result.name}</Text>
                </View>

                {/* Warranty Time */}
                {result.warrantyTime && (
                  <View style={commonStyles.infoRowHorizontal}>
                    <Text style={commonStyles.infoLabelFixed}>Thời gian BH:</Text>
                    <Text style={commonStyles.infoValueFlex}>{result.warrantyTime}</Text>
                  </View>
                )}

                {/* Export Date */}
                {result.exportDate && (
                  <View style={commonStyles.infoRowHorizontal}>
                    <Text style={commonStyles.infoLabelFixed}>Ngày xuất kho:</Text>
                    <Text style={commonStyles.infoValueFlex}>{result.exportDate}</Text>
                  </View>
                )}

                {/* Seller */}
                {result.seller && (
                  <View style={commonStyles.infoRowHorizontal}>
                    <Text style={commonStyles.infoLabelFixed}>Nơi bán:</Text>
                    <Text style={commonStyles.infoValueFlex}>{result.seller}</Text>
                  </View>
                )}

                {/* Divider */}
                <View style={styles.divider} />

                {/* Authenticity Note */}
                <View style={styles.authenticNote}>
                  {/* <Icon name="product-lookup" size={22} color={COLORS.success} /> */}
                  <Text style={styles.authenticNoteText}>
                    Sản phẩm này đã được xác thực là hàng chính hãng của AKITO.
                    Quý khách được hưởng đầy đủ chính sách bảo hành theo quy định.
                  </Text>
                </View>
              </View>
            )}
          </View>
        )}

        {/* Info Box */}
        <View style={[commonStyles.infoBox, styles.infoBoxMargin]}>
          <Icon name="info" size={18} color={COLORS.accent} style={commonStyles.infoBoxIcon} />
          <View style={commonStyles.infoBoxContent}>
            <Text style={commonStyles.infoBoxText}>
              Nhập số serial trên tem sản phẩm hoặc quét mã QR để kiểm tra
              tính xác thực của sản phẩm AKITO.
            </Text>
          </View>
        </View>

        <View style={commonStyles.bottomSpacing} />
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
  statusHeader: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  statusIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  statusIconLarge: {
    fontSize: 48,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  resultBody: {
    padding: SPACING.lg,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.gray200,
    marginVertical: SPACING.md,
  },
  authenticNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    padding: SPACING.md,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.success,
  },
  authenticNoteIcon: {
    fontSize: 20,
    marginRight: SPACING.sm,
    marginTop: 2,
  },
  authenticNoteText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.success,
    lineHeight: 18,
    fontWeight: '500',
  },
  infoBoxMargin: {
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
  },
});

export default ProductLookupScreen;
