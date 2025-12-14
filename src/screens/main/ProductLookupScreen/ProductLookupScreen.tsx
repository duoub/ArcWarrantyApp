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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../../config/theme';
import CustomHeader from '../../../components/CustomHeader';
import BarcodeScanner from '../../../components/BarcodeScanner';

interface ProductInfo {
  serial: string;
  productName: string;
  model: string;
  manufacturer: string;
  productionDate: string;
  isAuthentic: boolean;
  status: 'authentic' | 'fake' | 'not_found';
}

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

      // TODO: Replace with actual API call
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock data
      const mockResult: ProductInfo = {
        serial: serial,
        productName: 'Điều hòa AKITO Inverter 12000 BTU',
        model: 'AKT-12INV',
        manufacturer: 'AKITO Vietnam',
        productionDate: '15/01/2024',
        isAuthentic: true,
        status: 'authentic',
      };

      setResult(mockResult);
    } catch (error) {
      Alert.alert(
        'Lỗi',
        'Không thể tra cứu thông tin sản phẩm. Vui lòng thử lại.'
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
      case 'fake':
        return {
          text: 'Sản phẩm không chính hãng',
          icon: '✕',
          color: COLORS.error,
          bgColor: '#FFEBEE',
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
              <Text style={styles.scanIcon}>⚡</Text>
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

                {/* Product Name */}
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Tên sản phẩm:</Text>
                  <Text style={styles.infoValue}>{result.productName}</Text>
                </View>

                {/* Model */}
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Model:</Text>
                  <Text style={styles.infoValue}>{result.model}</Text>
                </View>

                {/* Manufacturer */}
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Nhà sản xuất:</Text>
                  <Text style={styles.infoValue}>{result.manufacturer}</Text>
                </View>

                {/* Production Date */}
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Ngày sản xuất:</Text>
                  <Text style={styles.infoValue}>{result.productionDate}</Text>
                </View>

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

            {/* Fake Product Warning */}
            {result.status === 'fake' && (
              <View style={styles.resultBody}>
                <View style={styles.warningBox}>
                  <Text style={styles.warningIcon}>⚠️</Text>
                  <Text style={styles.warningText}>
                    Sản phẩm này không phải là hàng chính hãng của AKITO.
                    Vui lòng liên hệ hotline để được hỗ trợ và tư vấn.
                  </Text>
                </View>
              </View>
            )}
          </View>
        )}

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Text style={styles.infoBoxIcon}>ℹ️</Text>
          <Text style={styles.infoText}>
            Nhập số serial trên tem sản phẩm hoặc quét mã QR để kiểm tra
            tính xác thực của sản phẩm AKITO.
          </Text>
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
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.accent + '15',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.accent + '30',
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
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

  bottomSpacing: {
    height: SPACING.xl,
  },
});

export default ProductLookupScreen;
