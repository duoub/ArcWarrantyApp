/**
 * LocationSelector Component
 * Generic location selector for Province/District/Ward
 * Uses cascading API: /getdiaban?macha={parentCode}
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../config/theme';
import { provinceService } from '../api/provinceService';
import { Location } from '../types/province';

interface LocationSelectorProps {
  /**
   * Parent location code (MaDiaBan)
   * - Empty string '' for provinces
   * - Province MaDiaBan for districts
   * - District MaDiaBan for wards
   */
  parentCode?: string;

  /**
   * Currently selected location name (TenDiaBan)
   */
  selectedLocation: string;

  /**
   * Callback when location is selected
   * Returns the full Location object with MaDiaBan, TenDiaBan, MaDiaBanCha
   */
  onLocationChange: (location: Location | null) => void;

  /**
   * Label to display above selector
   */
  label?: string;

  /**
   * Placeholder text when no location selected
   */
  placeholder?: string;

  /**
   * Disable the selector
   */
  disabled?: boolean;
}

const LocationSelector: React.FC<LocationSelectorProps> = ({
  parentCode = '',
  selectedLocation,
  onLocationChange,
  label,
  placeholder = 'Chọn',
  disabled = false,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [locations, setLocations] = useState<Location[]>([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Load locations when modal opens or parentCode changes
  useEffect(() => {
    if (showModal) {
      loadLocations();
    }
  }, [showModal, parentCode]);

  const loadLocations = async () => {
    try {
      setIsLoading(true);

      // If parentCode is empty string, load provinces using getProvinces
      // Otherwise, load districts/wards using getLocations
      const response = await provinceService.getLocations(parentCode);

      setLocations(response.list);
    } catch (error) {
      Alert.alert(
        'Lỗi',
        error instanceof Error ? error.message : 'Không thể tải danh sách'
      );
      setLocations([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter locations by search keyword
  const filteredLocations = locations.filter((location) =>
    location.TenDiaBan.toLowerCase().includes(searchKeyword.toLowerCase())
  );

  const handleSelectLocation = (location: Location) => {
    onLocationChange(location);
    setShowModal(false);
    setSearchKeyword('');
  };

  const handleClearSelection = () => {
    onLocationChange(null);
  };

  const handleOpenModal = () => {
    if (!disabled) {
      setShowModal(true);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSearchKeyword('');
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}

      {/* Selector Button */}
      <TouchableOpacity
        style={[
          styles.selector,
          disabled && styles.selectorDisabled,
          !selectedLocation && styles.selectorEmpty,
        ]}
        onPress={handleOpenModal}
        activeOpacity={0.7}
        disabled={disabled}
      >
        <Text
          style={[
            styles.selectorText,
            !selectedLocation && styles.selectorPlaceholder,
            disabled && styles.selectorTextDisabled,
          ]}
          numberOfLines={1}
        >
          {selectedLocation || placeholder}
        </Text>
        <Text style={styles.dropdownIcon}>▼</Text>
      </TouchableOpacity>

      {/* Selection Modal */}
      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBackdrop} />
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{label || 'Chọn'}</Text>
              <TouchableOpacity
                onPress={handleCloseModal}
                style={styles.closeButton}
              >
                <Text style={styles.closeIcon}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Search Input */}
            <View style={styles.searchContainer}>
              <Text style={styles.searchIcon}>🔍</Text>
              <TextInput
                style={styles.searchInput}
                placeholder="Tìm kiếm..."
                placeholderTextColor={COLORS.gray400}
                value={searchKeyword}
                onChangeText={setSearchKeyword}
              />
              {searchKeyword !== '' && (
                <TouchableOpacity
                  onPress={() => setSearchKeyword('')}
                  style={styles.clearButton}
                >
                  <Text style={styles.clearIcon}>✕</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Location List */}
            <ScrollView
              style={styles.listContainer}
              showsVerticalScrollIndicator={true}
            >
              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={COLORS.primary} />
                  <Text style={styles.loadingText}>Đang tải...</Text>
                </View>
              ) : filteredLocations.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>Không tìm thấy kết quả (locations: {locations.length}, filtered: {filteredLocations.length})</Text>
                </View>
              ) : (
                filteredLocations.map((location, index) => (
                  <TouchableOpacity
                    key={location.MaDiaBan}
                    style={[
                      styles.listItem,
                      selectedLocation === location.TenDiaBan && styles.listItemSelected,
                      index === filteredLocations.length - 1 && styles.listItemLast,
                    ]}
                    onPress={() => handleSelectLocation(location)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.listItemText,
                        selectedLocation === location.TenDiaBan && styles.listItemTextSelected,
                      ]}
                    >
                      {location.TenDiaBan}
                    </Text>
                    {selectedLocation === location.TenDiaBan && (
                      <Text style={styles.checkIcon}>✓</Text>
                    )}
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.sm,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },

  // Selector
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.gray300,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    minHeight: 48,
  },
  selectorEmpty: {
    borderColor: COLORS.gray300,
  },
  selectorDisabled: {
    backgroundColor: COLORS.gray100,
    opacity: 0.6,
  },
  selectorText: {
    flex: 1,
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  selectorPlaceholder: {
    color: COLORS.gray400,
  },
  selectorTextDisabled: {
    color: COLORS.gray500,
  },
  dropdownIcon: {
    fontSize: 12,
    color: COLORS.gray500,
    marginLeft: SPACING.sm,
  },

  // Modal
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    maxHeight: '80%',
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
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.gray100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIcon: {
    fontSize: 18,
    color: COLORS.gray600,
    fontWeight: '600',
  },

  // Search
  searchContainer: {
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
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  clearButton: {
    padding: SPACING.xs,
  },
  clearIcon: {
    fontSize: 16,
    color: COLORS.gray500,
  },

  // List
  listContainer: {
    flex: 1,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  listItemLast: {
    borderBottomWidth: 0,
  },
  listItemSelected: {
    backgroundColor: COLORS.primary + '10',
  },
  listItemText: {
    flex: 1,
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  listItemTextSelected: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  checkIcon: {
    fontSize: 20,
    color: COLORS.primary,
    fontWeight: '700',
    marginLeft: SPACING.sm,
  },

  // Loading & Empty
  loadingContainer: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
  },
  emptyContainer: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});

export default LocationSelector;
