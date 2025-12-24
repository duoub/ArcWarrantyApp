import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  StatusBar,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../../config/theme';
import CustomHeader from '../../../components/CustomHeader';
import BarcodeScanner from '../../../components/BarcodeScanner';
import { commonStyles } from '../../../styles/commonStyles';
import { productLookupService } from '../../../api/productLookupService';
import { ProductInfo } from '../../../types/productLookup';

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
          icon: '✓',
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
        leftIcon={<Text style={styles.backIcon}>‹</Text>}
        onLeftPress={() => navigation.goBack()}
      />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Page Title */}
        <View style={styles.pageHeader}>
          <Text style={styles.pageTitle}>
            Kiểm tra sản phẩm chính hãng
          </Text>
        </View>

        {/* Search Card */}
        <View style={styles.searchCard}>
          <Text style={styles.searchLabel}>
            Nhập số serial sản phẩm
          </Text>
          <View style={styles.searchWrapper}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
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
              style={styles.scanButton}
              disabled={isLoading}
            >
              <Image
                source={require('../../../assets/images/scan_me.png')}
                style={styles.scanImage}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.searchButton, isLoading && styles.searchButtonDisabled]}
            onPress={handleSearch}
            activeOpacity={0.8}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={COLORS.white} size="small" />
            ) : (
              <Text style={styles.searchButtonText}>Kiểm tra</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Result Card */}
        {result && (
          <View style={styles.resultCard}>
            {/* Status Header */}
            <View
              style={[
                styles.statusHeader,
                { backgroundColor: getStatusInfo(result.status).bgColor },
              ]}
            >
              <View style={styles.statusIconContainer}>
                <Text style={styles.statusIconLarge}>
                  {getStatusInfo(result.status).icon}
                </Text>
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
                <Text style={styles.sectionTitle}>Thông tin sản phẩm</Text>

                {/* Serial */}
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Số serial:</Text>
                  <Text style={styles.infoValue}>{result.serial}</Text>
                </View>

                {/* Product Code */}
                {result.code && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Mã sản phẩm:</Text>
                    <Text style={styles.infoValue}>{result.code}</Text>
                  </View>
                )}

                {/* Product Name */}
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Tên sản phẩm:</Text>
                  <Text style={styles.infoValue}>{result.name}</Text>
                </View>

                {/* Warranty Time */}
                {result.warrantyTime && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Thời gian BH:</Text>
                    <Text style={styles.infoValue}>{result.warrantyTime}</Text>
                  </View>
                )}

                {/* Export Date */}
                {result.exportDate && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Ngày xuất kho:</Text>
                    <Text style={styles.infoValue}>{result.exportDate}</Text>
                  </View>
                )}

                {/* Seller */}
                {result.seller && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Nơi bán:</Text>
                    <Text style={styles.infoValue}>{result.seller}</Text>
                  </View>
                )}

                {/* Divider */}
                <View style={styles.divider} />

                {/* Authenticity Note */}
                <View style={styles.authenticNote}>
                  <Text style={styles.authenticNoteIcon}>✓</Text>
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
          <Text style={commonStyles.infoBoxIcon}>ℹ️</Text>
          <View style={commonStyles.infoBoxContent}>
            <Text style={commonStyles.infoBoxText}>
              Nhập số serial trên tem sản phẩm hoặc quét mã QR để kiểm tra
              tính xác thực của sản phẩm AKITO.
            </Text>
          </View>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

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
  backIcon: {
    fontSize: 32,
    color: COLORS.white,
    fontWeight: '300',
  },

  // Page Header
  pageHeader: {
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.sm,
  },
  pageTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },

  // Search Card
  searchCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    ...SHADOWS.md,
  },
  searchLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray50,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  searchIcon: {
    fontSize: 20,
    marginRight: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: COLORS.textPrimary,
    paddingVertical: SPACING.md,
  },
  scanButton: {
    padding: SPACING.xs,
    marginLeft: SPACING.xs,
  },
  scanIcon: {
    fontSize: 24,
  },
  scanImage: {
    width: 32,
    height: 32,
  },
  searchButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 0,
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: BORDER_RADIUS.md,
    ...SHADOWS.sm,
  },
  searchButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.white,
    letterSpacing: 0.5,
  },
  searchButtonDisabled: {
    opacity: 0.6,
  },

  // Result Card
  resultCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    ...SHADOWS.md,
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
    ...SHADOWS.md,
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: SPACING.sm,
  },
  infoLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '600',
    width: 120,
  },
  infoValue: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.gray200,
    marginVertical: SPACING.md,
  },

  // Authentic Note
  authenticNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#E8F5E9',
    borderRadius: BORDER_RADIUS.md,
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

  // Warning Box
  warningBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFEBEE',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.error,
  },
  warningIcon: {
    fontSize: 20,
    marginRight: SPACING.sm,
    marginTop: 2,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.error,
    lineHeight: 18,
    fontWeight: '500',
  },

  // Info Box
  infoBoxMargin: {
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
  },

  bottomSpacing: {
    height: SPACING.xl,
  },
});

export default ProductLookupScreen;
