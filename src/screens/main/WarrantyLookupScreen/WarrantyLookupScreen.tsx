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
import { warrantyLookupService } from '../../../api/warrantyLookupService';
import { WarrantyInfo, RepairInfo } from '../../../types/warrantyLookup';

const WarrantyLookupScreen = () => {
  const navigation = useNavigation();
  const [keyword, setKeyword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<WarrantyInfo[]>([]);
  const [repairResults, setRepairResults] = useState<RepairInfo[]>([]);
  const [showScanner, setShowScanner] = useState(false);

  const handleScanQR = () => {
    setShowScanner(true);
  };

  const handleScanComplete = (data: string) => {
    setKeyword(data);
    setShowScanner(false);
    // Auto search after scan
    setTimeout(() => {
      handleSearch();
    }, 100);
  };

  const handleSearch = async () => {
    if (!keyword.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập số serial hoặc thông tin khách hàng');
      return;
    }

    try {
      setIsLoading(true);
      setResults([]);
      setRepairResults([]);

      // Fetch both warranty and repair data in parallel
      const [warrantyResponse, repairResponse] = await Promise.all([
        warrantyLookupService.lookupWarranty({
          keyword: keyword.trim(),
        }),
        warrantyLookupService.lookupRepair({
          keyword: keyword.trim(),
        }),
      ]);

      const hasWarrantyData = warrantyResponse.data && warrantyResponse.data.length > 0;
      const hasRepairData = repairResponse.data && repairResponse.data.length > 0;

      if (hasWarrantyData || hasRepairData) {
        // Set all results
        if (hasWarrantyData) {
          setResults(warrantyResponse.data);
        }
        if (hasRepairData) {
          setRepairResults(repairResponse.data);
        }
      } else {
        Alert.alert(
          'Không tìm thấy',
          'Không tìm thấy thông tin bảo hành hoặc sửa chữa cho từ khóa này.'
        );
      }
    } catch (error) {
      Alert.alert(
        'Lỗi',
        error instanceof Error ? error.message : 'Không thể tra cứu thông tin. Vui lòng thử lại.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'active':
        return {
          text: 'Còn bảo hành',
          color: COLORS.success,
          bgColor: '#E8F5E9',
        };
      case 'expired':
        return {
          text: 'Hết hạn bảo hành',
          color: COLORS.error,
          bgColor: '#FFEBEE',
        };
      default:
        return {
          text: 'Không tìm thấy',
          color: COLORS.gray500,
          bgColor: COLORS.gray100,
        };
    }
  };

  const getRepairStatusInfo = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('hoàn thành') || statusLower.includes('hoàn tất')) {
      return {
        text: status,
        color: COLORS.success,
        bgColor: '#E8F5E9',
      };
    } else if (statusLower.includes('hủy') || statusLower.includes('huỷ')) {
      return {
        text: status,
        color: COLORS.error,
        bgColor: '#FFEBEE',
      };
    } else {
      return {
        text: status,
        color: COLORS.warning,
        bgColor: '#FFF3E0',
      };
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      <CustomHeader
        title="Tra cứu bảo hành"
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
            Tra cứu bảo hành sản phẩm
          </Text>
        </View>

        {/* Search Card */}
        <View style={styles.searchCard}>
          <Text style={styles.searchLabel}>
            Nhập thông tin tra cứu
          </Text>
          <View style={styles.searchWrapper}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Số Serial / SĐT"
              placeholderTextColor={COLORS.gray400}
              value={keyword}
              onChangeText={setKeyword}
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
              <Text style={styles.searchButtonText}>Tra cứu</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Warranty Result Cards */}
        {results.length > 0 && (
          <>
            {results.length > 1 && (
              <View style={styles.resultCountCard}>
                <Text style={styles.resultCountText}>
                  Tìm thấy {results.length} kết quả bảo hành
                </Text>
              </View>
            )}
            {results.map((result, index) => (
              <View key={`${result.serial}-${index}`} style={styles.resultCard}>
                <View style={styles.resultHeader}>
                  <Text style={styles.resultTitle}>
                    Thông tin bảo hành {results.length > 1 ? `(${index + 1}/${results.length})` : ''}
                  </Text>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusInfo(result.status).bgColor },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        { color: getStatusInfo(result.status).color },
                      ]}
                    >
                      {getStatusInfo(result.status).text}
                    </Text>
                  </View>
                </View>

                <View style={styles.resultBody}>
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
                    <Text style={styles.infoLabel}>Sản phẩm:</Text>
                    <Text style={styles.infoValue}>{result.namesp.trim() || result.name.trim()}</Text>
                  </View>

                  {/* Product Type */}
                  {result.type && (
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Chủng loại:</Text>
                      <Text style={styles.infoValue}>{result.type}</Text>
                    </View>
                  )}

                  {/* Customer Name */}
                  {result.customerName && (
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Khách hàng:</Text>
                      <Text style={styles.infoValue}>{result.customerName}</Text>
                    </View>
                  )}

                  {/* Phone - Mobile */}
                  {result.customerMobile && (
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Số điện thoại:</Text>
                      <Text style={styles.infoValue}>{result.customerMobile}</Text>
                    </View>
                  )}

                  {/* Phone - customerPhone */}
                  {result.customerPhone && result.customerPhone !== result.customerMobile && (
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Số điện thoại:</Text>
                      <Text style={styles.infoValue}>{result.customerPhone}</Text>
                    </View>
                  )}

                  {/* Address */}
                  {(result.formattedAddress || result.customerAddress) && (
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Địa chỉ:</Text>
                      <Text style={styles.infoValue}>{result.formattedAddress || result.customerAddress}</Text>
                    </View>
                  )}

                  {/* Divider */}
                  <View style={styles.divider} />

                  {/* Active Date */}
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Ngày kích hoạt:</Text>
                    <Text style={styles.infoValue}>{result.activeDate}</Text>
                  </View>

                  {/* Warranty Time */}
                  {result.warrantyTime && (
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Thời gian BH:</Text>
                      <Text style={styles.infoValue}>{result.warrantyTime}</Text>
                    </View>
                  )}

                  {/* Warranty Expiry */}
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Hết hạn BH:</Text>
                    <Text style={[styles.infoValue, styles.infoValueHighlight]}>
                      {result.expiryDate}
                    </Text>
                  </View>

                  {/* Note */}
                  {result.note && (
                    <>
                      <View style={styles.divider} />
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Ghi chú:</Text>
                        <Text style={styles.infoValue}>{result.note}</Text>
                      </View>
                    </>
                  )}
                </View>
              </View>
            ))}
          </>
        )}

        {/* Repair Result Cards */}
        {repairResults.length > 0 && (
          <>
            {repairResults.length > 1 && (
              <View style={styles.resultCountCard}>
                <Text style={styles.resultCountText}>
                  Tìm thấy {repairResults.length} kết quả sửa chữa
                </Text>
              </View>
            )}
            {repairResults.map((repair, index) => (
              <View key={`repair-${repair.ticketCode}-${index}`} style={styles.repairCard}>
                <View style={styles.repairHeader}>
                  <Text style={styles.repairTitle}>
                    Thông tin sửa chữa {repairResults.length > 1 ? `(${index + 1}/${repairResults.length})` : ''}
                  </Text>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getRepairStatusInfo(repair.status).bgColor },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        { color: getRepairStatusInfo(repair.status).color },
                      ]}
                    >
                      {getRepairStatusInfo(repair.status).text}
                    </Text>
                  </View>
                </View>

                <View style={styles.resultBody}>
                  {/* Ticket Code */}
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Mã phiếu:</Text>
                    <Text style={[styles.infoValue, styles.infoValueHighlight]}>{repair.ticketCode}</Text>
                  </View>

                  {/* Serial */}
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Số serial:</Text>
                    <Text style={styles.infoValue}>{repair.serial}</Text>
                  </View>

                  {/* Product Name */}
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Sản phẩm:</Text>
                    <Text style={styles.infoValue}>{repair.productName}</Text>
                  </View>

                  {/* Service Name */}
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Nhóm lỗi:</Text>
                    <Text style={styles.infoValue}>{repair.serviceName}</Text>
                  </View>

                  {/* Customer Name */}
                  {repair.customerName && (
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Khách hàng:</Text>
                      <Text style={styles.infoValue}>{repair.customerName}</Text>
                    </View>
                  )}

                  {/* Address */}
                  {repair.customerAddress && (
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Địa chỉ:</Text>
                      <Text style={styles.infoValue}>{repair.customerAddress}</Text>
                    </View>
                  )}

                  {/* Warranty Place */}
                  {repair.warrantyPlace && (
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Nơi bảo hành:</Text>
                      <Text style={styles.infoValue}>{repair.warrantyPlace}</Text>
                    </View>
                  )}

                  {/* Divider */}
                  <View style={styles.divider} />

                  {/* Create Date */}
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Ngày tạo:</Text>
                    <Text style={styles.infoValue}>{repair.createDate}</Text>
                  </View>

                  {/* Due Date */}
                  {repair.dueDate && (
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Ngày hẹn:</Text>
                      <Text style={styles.infoValue}>{repair.dueDate}</Text>
                    </View>
                  )}

                  {/* Update Date */}
                  {repair.updateDate && (
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Ngày cập nhật:</Text>
                      <Text style={styles.infoValue}>{repair.updateDate}</Text>
                    </View>
                  )}

                  {/* Return Date */}
                  {repair.returnDate && (
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Ngày trả:</Text>
                      <Text style={styles.infoValue}>{repair.returnDate}</Text>
                    </View>
                  )}

                  {/* Ticket Price */}
                  {repair.ticketPrice && repair.ticketPrice !== '0' && (
                    <>
                      <View style={styles.divider} />
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Chi phí:</Text>
                        <Text style={[styles.infoValue, styles.infoValueHighlight]}>
                          {repair.ticketPrice} đ
                        </Text>
                      </View>
                    </>
                  )}

                  {/* Assign Name */}
                  {repair.assignName && (
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Người xử lý:</Text>
                      <Text style={styles.infoValue}>{repair.assignName}</Text>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </>
        )}

        {/* Info Box */}
        <View style={[commonStyles.infoBox, styles.infoBoxMargin]}>
          <Text style={commonStyles.infoBoxIcon}>ℹ️</Text>
          <View style={commonStyles.infoBoxContent}>
            <Text style={commonStyles.infoBoxText}>
              Bạn có thể tra cứu thông tin bảo hành bằng số serial sản phẩm
              hoặc số điện thoại đã đăng ký.
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

  // Result Count Card
  resultCountCard: {
    backgroundColor: COLORS.primary + '15',
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
  },
  resultCountText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
    textAlign: 'center',
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
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    backgroundColor: COLORS.primary + '12',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  resultBody: {
    padding: SPACING.md,
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
  infoValueHighlight: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.gray200,
    marginVertical: SPACING.sm,
  },

  // Repair Card
  repairCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    ...SHADOWS.md,
  },
  repairHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    backgroundColor: COLORS.warning + '12',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  repairTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
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

export default WarrantyLookupScreen;
