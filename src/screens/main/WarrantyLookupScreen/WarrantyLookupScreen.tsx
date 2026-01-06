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
import { COLORS, SPACING } from '../../../config/theme';
import CustomHeader from '../../../components/CustomHeader';
import BarcodeScanner from '../../../components/BarcodeScanner/BarcodeScanner';
import { commonStyles } from '../../../styles/commonStyles';
import { warrantyLookupService } from '../../../api/warrantyLookupService';
import { WarrantyInfo, RepairInfo } from '../../../types/warrantyLookup';
import { Icon } from '../../../components/common';

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
        return { text: 'Còn bảo hành', color: COLORS.success, bgColor: '#E8F5E9' };
      case 'expired':
        return { text: 'Hết hạn bảo hành', color: COLORS.error, bgColor: '#FFEBEE' };
      default:
        return { text: 'Không tìm thấy', color: COLORS.gray500, bgColor: COLORS.gray100 };
    }
  };

  const getRepairStatusInfo = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('hoàn thành') || statusLower.includes('hoàn tất')) {
      return { text: status, color: COLORS.success, bgColor: '#E8F5E9' };
    } else if (statusLower.includes('hủy') || statusLower.includes('huỷ')) {
      return { text: status, color: COLORS.error, bgColor: '#FFEBEE' };
    } else {
      return { text: status, color: COLORS.warning, bgColor: '#FFF3E0' };
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      <CustomHeader
        title="Tra cứu bảo hành"
        leftIcon={<Icon name="back" size={24} color={COLORS.white} />}
        onLeftPress={() => navigation.goBack()}
      />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Page Title */}
        <View style={commonStyles.pageHeader}>
          <Text style={commonStyles.pageTitle}>
            Tra cứu bảo hành sản phẩm
          </Text>
        </View>

        {/* Search Card */}
        <View style={commonStyles.cardWithMarginLarge}>
          <Text style={commonStyles.inputLabel}>
            Nhập thông tin tra cứu
          </Text>
          <View style={commonStyles.inputWrapper}>
            <Icon name="search" size={18} color={COLORS.gray500} style={commonStyles.inputIcon} />
            <TextInput
              style={commonStyles.input}
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
              <Text style={commonStyles.buttonPrimaryText}>Tra cứu</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Warranty Result Cards */}
        {results.length > 0 && (
          <>
            {results.length > 1 && (
              <View style={[commonStyles.infoBox, styles.resultCountCard]}>
                <Text style={styles.resultCountText}>
                  Tìm thấy {results.length} kết quả bảo hành
                </Text>
              </View>
            )}
            {results.map((result, index) => (
              <View key={`${result.serial}-${index}`} style={commonStyles.cardWithMarginLarge}>
                <View style={styles.resultHeader}>
                  <Text style={commonStyles.sectionTitle}>
                    Thông tin bảo hành {results.length > 1 ? `(${index + 1}/${results.length})` : ''}
                  </Text>
                  <View
                    style={[
                      commonStyles.badge,
                      { backgroundColor: getStatusInfo(result.status).bgColor },
                    ]}
                  >
                    <Text
                      style={[
                        commonStyles.badgeText,
                        { color: getStatusInfo(result.status).color },
                      ]}
                    >
                      {getStatusInfo(result.status).text}
                    </Text>
                  </View>
                </View>

                <View style={styles.resultBody}>
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
                    <Text style={commonStyles.infoLabelFixed}>Sản phẩm:</Text>
                    <Text style={commonStyles.infoValueFlex}>{result.namesp.trim() || result.name.trim()}</Text>
                  </View>

                  {/* Product Type */}
                  {result.type && (
                    <View style={commonStyles.infoRowHorizontal}>
                      <Text style={commonStyles.infoLabelFixed}>Chủng loại:</Text>
                      <Text style={commonStyles.infoValueFlex}>{result.type}</Text>
                    </View>
                  )}

                  {/* Customer Name */}
                  {result.customerName && (
                    <View style={commonStyles.infoRowHorizontal}>
                      <Text style={commonStyles.infoLabelFixed}>Khách hàng:</Text>
                      <Text style={commonStyles.infoValueFlex}>{result.customerName}</Text>
                    </View>
                  )}

                  {/* Phone - Mobile */}
                  {result.customerMobile && (
                    <View style={commonStyles.infoRowHorizontal}>
                      <Text style={commonStyles.infoLabelFixed}>Số điện thoại:</Text>
                      <Text style={commonStyles.infoValueFlex}>{result.customerMobile}</Text>
                    </View>
                  )}

                  {/* Phone - customerPhone */}
                  {result.customerPhone && result.customerPhone !== result.customerMobile && (
                    <View style={commonStyles.infoRowHorizontal}>
                      <Text style={commonStyles.infoLabelFixed}>Số điện thoại:</Text>
                      <Text style={commonStyles.infoValueFlex}>{result.customerPhone}</Text>
                    </View>
                  )}

                  {/* Address */}
                  {(result.formattedAddress || result.customerAddress) && (
                    <View style={commonStyles.infoRowHorizontal}>
                      <Text style={commonStyles.infoLabelFixed}>Địa chỉ:</Text>
                      <Text style={commonStyles.infoValueFlex}>{result.formattedAddress || result.customerAddress}</Text>
                    </View>
                  )}

                  {/* Divider */}
                  <View style={styles.divider} />

                  {/* Active Date */}
                  <View style={commonStyles.infoRowHorizontal}>
                    <Text style={commonStyles.infoLabelFixed}>Ngày kích hoạt:</Text>
                    <Text style={commonStyles.infoValueFlex}>{result.activeDate}</Text>
                  </View>

                  {/* Warranty Time */}
                  {result.warrantyTime && (
                    <View style={commonStyles.infoRowHorizontal}>
                      <Text style={commonStyles.infoLabelFixed}>Thời gian BH:</Text>
                      <Text style={commonStyles.infoValueFlex}>{result.warrantyTime}</Text>
                    </View>
                  )}

                  {/* Warranty Expiry */}
                  <View style={commonStyles.infoRowHorizontal}>
                    <Text style={commonStyles.infoLabelFixed}>Hết hạn BH:</Text>
                    <Text style={[commonStyles.infoValueFlex, commonStyles.infoValueHighlight]}>
                      {result.expiryDate}
                    </Text>
                  </View>

                  {/* Note */}
                  {result.note && (
                    <>
                      <View style={styles.divider} />
                      <View style={commonStyles.infoRowHorizontal}>
                        <Text style={commonStyles.infoLabelFixed}>Ghi chú:</Text>
                        <Text style={commonStyles.infoValueFlex}>{result.note}</Text>
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
              <View style={[commonStyles.infoBox, styles.resultCountCard]}>
                <Text style={styles.resultCountText}>
                  Tìm thấy {repairResults.length} kết quả sửa chữa
                </Text>
              </View>
            )}
            {repairResults.map((repair, index) => (
              <View key={`repair-${repair.ticketCode}-${index}`} style={commonStyles.cardWithMarginLarge}>
                <View style={styles.repairHeader}>
                  <Text style={commonStyles.sectionTitle}>
                    Thông tin sửa chữa {repairResults.length > 1 ? `(${index + 1}/${repairResults.length})` : ''}
                  </Text>
                  <View
                    style={[
                      commonStyles.badge,
                      { backgroundColor: getRepairStatusInfo(repair.status).bgColor },
                    ]}
                  >
                    <Text
                      style={[
                        commonStyles.badgeText,
                        { color: getRepairStatusInfo(repair.status).color },
                      ]}
                    >
                      {getRepairStatusInfo(repair.status).text}
                    </Text>
                  </View>
                </View>

                <View style={styles.resultBody}>
                  {/* Ticket Code */}
                  <View style={commonStyles.infoRowHorizontal}>
                    <Text style={commonStyles.infoLabelFixed}>Mã phiếu:</Text>
                    <Text style={[commonStyles.infoValueFlex, commonStyles.infoValueHighlight]}>{repair.ticketCode}</Text>
                  </View>

                  {/* Serial */}
                  <View style={commonStyles.infoRowHorizontal}>
                    <Text style={commonStyles.infoLabelFixed}>Số serial:</Text>
                    <Text style={commonStyles.infoValueFlex}>{repair.serial}</Text>
                  </View>

                  {/* Product Name */}
                  <View style={commonStyles.infoRowHorizontal}>
                    <Text style={commonStyles.infoLabelFixed}>Sản phẩm:</Text>
                    <Text style={commonStyles.infoValueFlex}>{repair.productName}</Text>
                  </View>

                  {/* Service Name */}
                  <View style={commonStyles.infoRowHorizontal}>
                    <Text style={commonStyles.infoLabelFixed}>Nhóm lỗi:</Text>
                    <Text style={commonStyles.infoValueFlex}>{repair.serviceName}</Text>
                  </View>

                  {/* Customer Name */}
                  {repair.customerName && (
                    <View style={commonStyles.infoRowHorizontal}>
                      <Text style={commonStyles.infoLabelFixed}>Khách hàng:</Text>
                      <Text style={commonStyles.infoValueFlex}>{repair.customerName}</Text>
                    </View>
                  )}

                  {/* Address */}
                  {repair.customerAddress && (
                    <View style={commonStyles.infoRowHorizontal}>
                      <Text style={commonStyles.infoLabelFixed}>Địa chỉ:</Text>
                      <Text style={commonStyles.infoValueFlex}>{repair.customerAddress}</Text>
                    </View>
                  )}

                  {/* Warranty Place */}
                  {repair.warrantyPlace && (
                    <View style={commonStyles.infoRowHorizontal}>
                      <Text style={commonStyles.infoLabelFixed}>Nơi bảo hành:</Text>
                      <Text style={commonStyles.infoValueFlex}>{repair.warrantyPlace}</Text>
                    </View>
                  )}

                  {/* Divider */}
                  <View style={styles.divider} />

                  {/* Create Date */}
                  <View style={commonStyles.infoRowHorizontal}>
                    <Text style={commonStyles.infoLabelFixed}>Ngày tạo:</Text>
                    <Text style={commonStyles.infoValueFlex}>{repair.createDate}</Text>
                  </View>

                  {/* Due Date */}
                  {repair.dueDate && (
                    <View style={commonStyles.infoRowHorizontal}>
                      <Text style={commonStyles.infoLabelFixed}>Ngày hẹn:</Text>
                      <Text style={commonStyles.infoValueFlex}>{repair.dueDate}</Text>
                    </View>
                  )}

                  {/* Update Date */}
                  {repair.updateDate && (
                    <View style={commonStyles.infoRowHorizontal}>
                      <Text style={commonStyles.infoLabelFixed}>Ngày cập nhật:</Text>
                      <Text style={commonStyles.infoValueFlex}>{repair.updateDate}</Text>
                    </View>
                  )}

                  {/* Return Date */}
                  {repair.returnDate && (
                    <View style={commonStyles.infoRowHorizontal}>
                      <Text style={commonStyles.infoLabelFixed}>Ngày trả:</Text>
                      <Text style={commonStyles.infoValueFlex}>{repair.returnDate}</Text>
                    </View>
                  )}

                  {/* Ticket Price */}
                  {repair.ticketPrice && repair.ticketPrice !== '0' && (
                    <>
                      <View style={styles.divider} />
                      <View style={commonStyles.infoRowHorizontal}>
                        <Text style={commonStyles.infoLabelFixed}>Chi phí:</Text>
                        <Text style={[commonStyles.infoValueFlex, commonStyles.infoValueHighlight]}>
                          {repair.ticketPrice} đ
                        </Text>
                      </View>
                    </>
                  )}

                  {/* Assign Name */}
                  {repair.assignName && (
                    <View style={commonStyles.infoRowHorizontal}>
                      <Text style={commonStyles.infoLabelFixed}>Người xử lý:</Text>
                      <Text style={commonStyles.infoValueFlex}>{repair.assignName}</Text>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </>
        )}

        {/* Info Box */}
        <View style={[commonStyles.infoBox, styles.infoBoxMargin]}>
          <Icon name="info" size={18} color={COLORS.accent} style={commonStyles.infoBoxIcon} />
          <View style={commonStyles.infoBoxContent}>
            <Text style={commonStyles.infoBoxText}>
              Bạn có thể tra cứu thông tin bảo hành bằng số serial sản phẩm
              hoặc số điện thoại đã đăng ký.
            </Text>
          </View>
        </View>

        <View style={commonStyles.bottomSpacing} />
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
  resultCountCard: {
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
  },
  resultCountText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
    textAlign: 'center',
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
  resultBody: {
    padding: SPACING.md,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.gray200,
    marginVertical: SPACING.sm,
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
  infoBoxMargin: {
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
  },
});

export default WarrantyLookupScreen;
