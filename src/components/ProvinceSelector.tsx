/**
 * ProvinceSelector Component
 * Reusable component for selecting province/city from API
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Pressable,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../config/theme';
import { provinceService } from '../api/provinceService';
import { Province } from '../types/province';
import { Icon } from './common';

interface ProvinceSelectorProps {
  selectedProvince: string;
  onProvinceChange: (provinceName: string, provinceCode: string) => void;
  label?: string;
  placeholder?: string;
}

const ProvinceSelector: React.FC<ProvinceSelectorProps> = ({
  selectedProvince,
  onProvinceChange,
  label = 'Tỉnh/Thành phố:',
  placeholder = 'Tỉnh thành',
}) => {
  const [showModal, setShowModal] = useState(false);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Load provinces from API
  useEffect(() => {
    loadProvinces();
  }, []);

  const loadProvinces = async () => {
    try {
      setIsLoading(true);
      const response = await provinceService.getProvinces();
      setProvinces(response.list);
    } catch (error) {
      Alert.alert(
        'Lỗi',
        error instanceof Error ? error.message : 'Không thể tải danh sách tỉnh thành'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Filter provinces based on search keyword
  const filteredProvinces = provinces.filter((province) =>
    province.TenDiaBan.toLowerCase().includes(searchKeyword.toLowerCase())
  );

  const handleSelectProvince = (province: Province) => {
    onProvinceChange(province.TenDiaBan, province.MaDiaBan);
    setShowModal(false);
    setSearchKeyword('');
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSearchKeyword('');
  };

  return (
    <>
      {/* Province Selector Button */}
      <TouchableOpacity
        style={styles.selector}
        onPress={() => setShowModal(true)}
        activeOpacity={0.7}
      >
        <View style={styles.selectorLeft}>
          <Text style={styles.selectorLabel}>{label}</Text>
          <Text style={styles.selectorText}>
            {selectedProvince || placeholder}
          </Text>
        </View>
        <Text style={styles.dropdownIcon}>›</Text>
      </TouchableOpacity>

      {/* Province Selection Modal */}
      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={handleCloseModal} />
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chọn tỉnh/thành phố</Text>
              <TouchableOpacity
                onPress={handleCloseModal}
                style={styles.modalCloseButton}
              >
                <Text style={styles.modalCloseIcon}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Modal Search */}
            <View style={styles.modalSearchContainer}>
              <Icon name="search" size={18} color={COLORS.gray500} style={styles.searchIcon} />
              <TextInput
                style={styles.modalSearchInput}
                placeholder="Tìm kiếm tỉnh/thành phố..."
                placeholderTextColor={COLORS.gray400}
                value={searchKeyword}
                onChangeText={setSearchKeyword}
                autoFocus
              />
              {searchKeyword !== '' && (
                <TouchableOpacity
                  onPress={() => setSearchKeyword('')}
                  style={styles.clearSearchButton}
                >
                  <Text style={styles.clearSearchIcon}>✕</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Province List */}
            <View style={styles.modalListWrapper}>
              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={COLORS.primary} />
                  <Text style={styles.loadingText}>Đang tải...</Text>
                </View>
              ) : (
                <ScrollView
                  style={styles.modalList}
                  showsVerticalScrollIndicator={true}
                  nestedScrollEnabled={true}
                >
                  {filteredProvinces.length === 0 ? (
                    <View style={styles.emptyModal}>
                      <Text style={styles.emptyModalText}>
                        Không tìm thấy tỉnh/thành phố
                      </Text>
                    </View>
                  ) : (
                    filteredProvinces.map((province, index) => (
                      <TouchableOpacity
                        key={province.MaDiaBan || index}
                        style={[
                          styles.provinceOption,
                          index === filteredProvinces.length - 1 &&
                            styles.provinceOptionLast,
                        ]}
                        onPress={() => handleSelectProvince(province)}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            styles.provinceOptionText,
                            selectedProvince === province.TenDiaBan &&
                              styles.provinceOptionTextActive,
                          ]}
                        >
                          {province.TenDiaBan}
                        </Text>
                        {selectedProvince === province.TenDiaBan && (
                          <Text style={styles.checkIcon}>✓</Text>
                        )}
                      </TouchableOpacity>
                    ))
                  )}
                </ScrollView>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
    borderWidth: 1,
    borderColor: COLORS.gray300,
    ...SHADOWS.sm,
  },
  selectorLeft: {
    flex: 1,
  },
  selectorLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  selectorText: {
    fontSize: 15,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  dropdownIcon: {
    fontSize: 24,
    color: COLORS.gray400,
    fontWeight: '300',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.overlay,
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    height: '80%',
    ...SHADOWS.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.gray100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseIcon: {
    fontSize: 18,
    color: COLORS.gray600,
    fontWeight: '600',
  },
  modalSearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray50,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  searchIcon: {
    fontSize: 20,
    marginRight: SPACING.sm,
  },
  modalSearchInput: {
    flex: 1,
    height: 44,
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  clearSearchButton: {
    padding: SPACING.xs,
  },
  clearSearchIcon: {
    fontSize: 16,
    color: COLORS.gray500,
  },
  modalListWrapper: {
    flex: 1,
    overflow: 'hidden',
  },
  modalList: {
    flex: 1,
  },
  loadingContainer: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.sm,
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  provinceOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  provinceOptionLast: {
    borderBottomWidth: 0,
  },
  provinceOptionText: {
    fontSize: 15,
    color: COLORS.textPrimary,
    flex: 1,
  },
  provinceOptionTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  checkIcon: {
    fontSize: 20,
    color: COLORS.primary,
    fontWeight: '700',
  },
  emptyModal: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  emptyModalText: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});

export default ProvinceSelector;
