import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../config/theme';
import { warrantyLookupService } from '../api/warrantyLookupService';
import { WarrantyInfo } from '../types/warrantyLookup';

interface CustomerLookupModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectCustomer: (customer: WarrantyInfo) => void;
}

const CustomerLookupModal: React.FC<CustomerLookupModalProps> = ({
  visible,
  onClose,
  onSelectCustomer,
}) => {
  const [keyword, setKeyword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<WarrantyInfo[]>([]);

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

  const handleSearch = async () => {
    if (!keyword.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập tên hoặc số điện thoại khách hàng');
      return;
    }

    try {
      setIsLoading(true);
      setResults([]);

      const response = await warrantyLookupService.lookupWarranty({
        keyword: keyword.trim(),
      });

      if (response.data && response.data.length > 0) {
        setResults(response.data);
      } else {
        Alert.alert(
          'Không tìm thấy',
          'Không tìm thấy thông tin khách hàng cho từ khóa này.'
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

  const handleSelectCustomer = (customer: WarrantyInfo) => {
    onSelectCustomer(customer);
    // Reset state
    setKeyword('');
    setResults([]);
    onClose();
  };

  const handleClose = () => {
    setKeyword('');
    setResults([]);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Tìm theo Số điện thoại</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Text style={styles.closeIcon}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Search Section */}
          <View style={styles.searchSection}>
            <Text style={styles.searchLabel}>Nhập số điện thoại</Text>
            <View style={styles.searchWrapper}>
              <Text style={styles.searchIcon}>🔍</Text>
              <TextInput
                style={styles.searchInput}
                placeholder="Số điện thoại"
                placeholderTextColor={COLORS.gray400}
                value={keyword}
                onChangeText={setKeyword}
                onSubmitEditing={handleSearch}
                returnKeyType="search"
                editable={!isLoading}
                autoFocus
              />
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
                <Text style={styles.searchButtonText}>Tìm kiếm</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Results List */}
          <ScrollView
            style={styles.resultsList}
            showsVerticalScrollIndicator={false}
          >
            {results.length > 0 && (
              <View style={styles.resultsContainer}>
                <Text style={styles.resultsCount}>
                  Tìm thấy {results.length} kết quả
                </Text>
                {results.map((result, index) => (
                  <TouchableOpacity
                    key={`${result.serial}-${index}`}
                    style={styles.resultCard}
                    onPress={() => handleSelectCustomer(result)}
                    activeOpacity={0.7}
                  >
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

                      {/* Customer Name */}
                      {result.customerName && (
                        <View style={styles.infoRow}>
                          <Text style={styles.infoLabel}>Khách hàng:</Text>
                          <Text style={styles.infoValue}>{result.customerName}</Text>
                        </View>
                      )}

                      {/* Phone - Mobile */}
                      {result.customerPhone && (
                        <View style={styles.infoRow}>
                          <Text style={styles.infoLabel}>Số điện thoại:</Text>
                          <Text style={styles.infoValue}>{result.customerPhone}</Text>
                        </View>
                      )}

                      {/* Address */}
                      {(result.formattedAddress || result.customerAddress) && (
                        <View style={styles.infoRow}>
                          <Text style={styles.infoLabel}>Địa chỉ:</Text>
                          <Text style={styles.infoValue} numberOfLines={2}>
                            {result.formattedAddress || result.customerAddress}
                          </Text>
                        </View>
                      )}

                      {/* Divider */}
                      <View style={styles.divider} />

                      {/* Active Date */}
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Ngày kích hoạt:</Text>
                        <Text style={styles.infoValue}>{result.activeDate}</Text>
                      </View>

                      {/* Warranty Expiry */}
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Hết hạn BH:</Text>
                        <Text style={[styles.infoValue, styles.infoValueHighlight]}>
                          {result.expiryDate}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.selectPrompt}>
                      <Text style={styles.selectPromptText}>Nhấn để chọn</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    height: '90%',
    ...SHADOWS.lg,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  closeButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.gray100,
  },
  closeIcon: {
    fontSize: 20,
    color: COLORS.textSecondary,
  },

  // Search Section
  searchSection: {
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
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

  // Results List
  resultsList: {
    flex: 1,
  },
  resultsContainer: {
    padding: SPACING.lg,
  },
  resultsCount: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },

  // Result Card
  resultCard: {
    backgroundColor: COLORS.white,
    marginBottom: SPACING.md,
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
  selectPrompt: {
    backgroundColor: COLORS.primary + '08',
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.gray200,
  },
  selectPromptText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
  },
});

export default CustomerLookupModal;
