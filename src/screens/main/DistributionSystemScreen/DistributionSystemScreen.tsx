import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  TextInput,
  Linking,
  Alert,
  ActivityIndicator,
  Modal,
  Pressable,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../../config/theme';
import CustomHeader from '../../../components/CustomHeader';

interface Distributor {
  id: string;
  TenTram: string;
  SoDienThoai: string;
  DiaChi: string;
  TinhThanh: string;
}

interface Province {
  id: string;
  TenDiaBan: string;
}

const DistributionSystemScreen = () => {
  const navigation = useNavigation();
  const [distributors, setDistributors] = useState<Distributor[]>([]);
  const [filteredDistributors, setFilteredDistributors] = useState<Distributor[]>([]);
  const [keyword, setKeyword] = useState('');
  const [selectedProvince, setSelectedProvince] = useState<string>('Tất cả');
  const [isLoading, setIsLoading] = useState(false);
  const [showProvinceModal, setShowProvinceModal] = useState(false);
  const [provinceSearchKeyword, setProvinceSearchKeyword] = useState('');

  // Mock data for provinces
  const provinces: Province[] = [
    { id: '0', TenDiaBan: 'Tất cả' },
    { id: '1', TenDiaBan: 'Hà Nội' },
    { id: '2', TenDiaBan: 'TP. Hồ Chí Minh' },
    { id: '3', TenDiaBan: 'Đà Nẵng' },
    { id: '4', TenDiaBan: 'Hải Phòng' },
    { id: '5', TenDiaBan: 'Cần Thơ' },
    { id: '6', TenDiaBan: 'An Giang' },
    { id: '7', TenDiaBan: 'Bà Rịa - Vũng Tàu' },
    { id: '8', TenDiaBan: 'Bắc Giang' },
    { id: '9', TenDiaBan: 'Bắc Kạn' },
    { id: '10', TenDiaBan: 'Bạc Liêu' },
    { id: '11', TenDiaBan: 'Bắc Ninh' },
    { id: '12', TenDiaBan: 'Bến Tre' },
    { id: '13', TenDiaBan: 'Bình Định' },
    { id: '14', TenDiaBan: 'Bình Dương' },
    { id: '15', TenDiaBan: 'Bình Phước' },
    { id: '16', TenDiaBan: 'Bình Thuận' },
    { id: '17', TenDiaBan: 'Cà Mau' },
    { id: '18', TenDiaBan: 'Cao Bằng' },
    { id: '19', TenDiaBan: 'Đắk Lắk' },
    { id: '20', TenDiaBan: 'Đắk Nông' },
  ];

  // Filter provinces based on search keyword
  const filteredProvinces = provinces.filter((province) =>
    province.TenDiaBan.toLowerCase().includes(provinceSearchKeyword.toLowerCase())
  );

  // Mock data for distributors
  useEffect(() => {
    const mockDistributors: Distributor[] = [
      {
        id: '1',
        TenTram: 'Nhà phân phối AKITO Hà Nội',
        SoDienThoai: '024 3666 7777',
        DiaChi: '88 Đường Láng, Quận Đống Đa, Hà Nội',
        TinhThanh: 'Hà Nội',
      },
      {
        id: '2',
        TenTram: 'Nhà phân phối AKITO TP.HCM',
        SoDienThoai: '028 3999 8888',
        DiaChi: '234 Điện Biên Phủ, Quận 3, TP. Hồ Chí Minh',
        TinhThanh: 'TP. Hồ Chí Minh',
      },
      {
        id: '3',
        TenTram: 'Nhà phân phối AKITO Đà Nẵng',
        SoDienThoai: '0236 3888 9999',
        DiaChi: '99 Nguyễn Văn Linh, Quận Thanh Khê, Đà Nẵng',
        TinhThanh: 'Đà Nẵng',
      },
      {
        id: '4',
        TenTram: 'Đại lý AKITO Long Biên',
        SoDienThoai: '024 3777 8888',
        DiaChi: '456 Nguyễn Văn Cừ, Quận Long Biên, Hà Nội',
        TinhThanh: 'Hà Nội',
      },
      {
        id: '5',
        TenTram: 'Đại lý AKITO Bình Thạnh',
        SoDienThoai: '028 3888 7777',
        DiaChi: '789 Xô Viết Nghệ Tĩnh, Quận Bình Thạnh, TP. Hồ Chí Minh',
        TinhThanh: 'TP. Hồ Chí Minh',
      },
    ];
    setDistributors(mockDistributors);
    setFilteredDistributors(mockDistributors);
  }, []);

  // Filter distributors based on keyword and province
  useEffect(() => {
    let filtered = distributors;

    // Filter by province
    if (selectedProvince !== 'Tất cả') {
      filtered = filtered.filter(
        (distributor) => distributor.TinhThanh === selectedProvince
      );
    }

    // Filter by keyword
    if (keyword.trim()) {
      filtered = filtered.filter((distributor) =>
        distributor.TenTram.toLowerCase().includes(keyword.toLowerCase())
      );
    }

    setFilteredDistributors(filtered);
  }, [keyword, selectedProvince, distributors]);

  const handleCallPhone = (phoneNumber: string) => {
    const url = `tel:${phoneNumber}`;
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(url);
        } else {
          Alert.alert('Lỗi', 'Không thể thực hiện cuộc gọi');
        }
      })
      .catch((err) => Alert.alert('Lỗi', 'Không thể thực hiện cuộc gọi'));
  };

  const handleShowMap = (distributor: Distributor) => {
    Alert.alert('Chỉ đường', `Chỉ đường đến ${distributor.TenTram}`);
  };

  const renderDistributor = (item: Distributor) => (
    <View key={item.id} style={styles.distributorCard}>
      {/* Header */}
      <View style={styles.distributorHeader}>
        <Text style={styles.distributorName}>{item.TenTram}</Text>
      </View>

      {/* Info */}
      <View style={styles.distributorInfo}>
        {/* Phone */}
        <View style={styles.infoRow}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>📞</Text>
          </View>
          <View style={styles.infoDetail}>
            <Text style={styles.infoLabel}>Điện thoại</Text>
            <TouchableOpacity onPress={() => handleCallPhone(item.SoDienThoai)}>
              <Text style={styles.phoneValue}>{item.SoDienThoai}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Address */}
        <View style={styles.infoRow}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>📍</Text>
          </View>
          <View style={styles.infoDetail}>
            <Text style={styles.infoLabel}>Địa chỉ</Text>
            <Text style={styles.infoValue}>{item.DiaChi}</Text>
          </View>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.button, styles.buttonCall]}
          onPress={() => handleCallPhone(item.SoDienThoai)}
          activeOpacity={0.7}
        >
          <Text style={styles.buttonIcon}>📞</Text>
          <Text style={styles.buttonTextCall}>Gọi ngay</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.buttonMap]}
          onPress={() => handleShowMap(item)}
          activeOpacity={0.7}
        >
          <Text style={styles.buttonIcon}>🧭</Text>
          <Text style={styles.buttonTextMap}>Chỉ đường</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      <CustomHeader
        title="Hệ thống phân phối"
        leftIcon={<Text style={styles.backIcon}>‹</Text>}
        onLeftPress={() => navigation.goBack()}
      />

      <View style={styles.content}>
        {/* Search and Filter Section */}
        <View style={styles.filterSection}>
          {/* Search Input */}
          <View style={styles.searchContainer}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Tên nhà phân phối"
              placeholderTextColor={COLORS.gray400}
              value={keyword}
              onChangeText={setKeyword}
            />
          </View>

          {/* Province Selector */}
          <TouchableOpacity
            style={styles.provinceSelector}
            onPress={() => setShowProvinceModal(true)}
            activeOpacity={0.7}
          >
            <View style={styles.provinceSelectorLeft}>
              <Text style={styles.provinceSelectorLabel}>Tỉnh/Thành phố:</Text>
              <Text style={styles.provinceSelectorText}>{selectedProvince}</Text>
            </View>
            <Text style={styles.dropdownIcon}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Province Selection Modal */}
        <Modal
          visible={showProvinceModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => {
            setShowProvinceModal(false);
            setProvinceSearchKeyword('');
          }}
        >
          <View style={styles.modalOverlay}>
            <Pressable
              style={styles.modalBackdrop}
              onPress={() => {
                setShowProvinceModal(false);
                setProvinceSearchKeyword('');
              }}
            />
            <View style={styles.modalContent}>
              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Tìm theo tỉnh thành</Text>
                <TouchableOpacity
                  onPress={() => {
                    setShowProvinceModal(false);
                    setProvinceSearchKeyword('');
                  }}
                  style={styles.modalCloseButton}
                >
                  <Text style={styles.modalCloseIcon}>✕</Text>
                </TouchableOpacity>
              </View>

              {/* Modal Search */}
              <View style={styles.modalSearchContainer}>
                <Text style={styles.searchIcon}>🔍</Text>
                <TextInput
                  style={styles.modalSearchInput}
                  placeholder="Tìm kiếm tỉnh/thành phố..."
                  placeholderTextColor={COLORS.gray400}
                  value={provinceSearchKeyword}
                  onChangeText={setProvinceSearchKeyword}
                  autoFocus
                />
                {provinceSearchKeyword !== '' && (
                  <TouchableOpacity
                    onPress={() => setProvinceSearchKeyword('')}
                    style={styles.clearSearchButton}
                  >
                    <Text style={styles.clearSearchIcon}>✕</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Province List */}
              <View style={styles.modalListWrapper}>
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
                        key={province.id}
                        style={[
                          styles.provinceOption,
                          index === filteredProvinces.length - 1 && styles.provinceOptionLast,
                        ]}
                        onPress={() => {
                          setSelectedProvince(province.TenDiaBan);
                          setShowProvinceModal(false);
                          setProvinceSearchKeyword('');
                        }}
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
              </View>
            </View>
          </View>
        </Modal>

        {/* Distributors List */}
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
          ) : filteredDistributors.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🔍</Text>
              <Text style={styles.emptyText}>
                Không tìm thấy nhà phân phối
              </Text>
            </View>
          ) : (
            <View style={styles.distributorsList}>
              {filteredDistributors.map((distributor) => renderDistributor(distributor))}
            </View>
          )}

          {/* Bottom Spacing */}
          <View style={styles.bottomSpacing} />
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
  },
  backIcon: {
    fontSize: 32,
    color: COLORS.white,
    fontWeight: '300',
  },

  // Filter Section
  filterSection: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    ...SHADOWS.sm,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray50,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
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
  provinceSelector: {
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
  provinceSelectorLeft: {
    flex: 1,
  },
  provinceSelectorLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  provinceSelectorText: {
    fontSize: 15,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  dropdownIcon: {
    fontSize: 24,
    color: COLORS.gray400,
    fontWeight: '300',
  },

  // Modal Styles (similar to WarrantyStationListScreen)
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

  // Distributors List
  scrollView: {
    flex: 1,
  },
  distributorsList: {
    marginTop: SPACING.md,
  },
  distributorCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.md,
  },
  distributorHeader: {
    backgroundColor: COLORS.primary + '15',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  distributorName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },

  // Distributor Info
  distributorInfo: {
    padding: SPACING.md,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.gray50,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  icon: {
    fontSize: 16,
  },
  infoDetail: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    color: COLORS.textPrimary,
    lineHeight: 20,
  },
  phoneValue: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },

  // Actions
  actions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: COLORS.gray200,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    gap: SPACING.xs,
  },
  buttonCall: {
    backgroundColor: '#E8F5E9',
    borderRightWidth: 1,
    borderRightColor: COLORS.gray200,
  },
  buttonMap: {
    backgroundColor: '#FFF3E0',
  },
  buttonIcon: {
    fontSize: 18,
  },
  buttonTextCall: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2E7D32',
  },
  buttonTextMap: {
    fontSize: 14,
    fontWeight: '700',
    color: '#E65100',
  },

  // Loading & Empty States
  loadingContainer: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  emptyContainer: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: SPACING.md,
  },
  emptyText: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },

  bottomSpacing: {
    height: SPACING.xl,
  },
});

export default DistributionSystemScreen;
