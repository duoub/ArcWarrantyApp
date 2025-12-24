import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  RefreshControl,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../../config/theme';
import CustomHeader from '../../../components/CustomHeader';
import { warrantyStationService } from '../../../api/warrantyStationService';
import { WarrantyStation, Province } from '../../../types/warrantyStation';

const WarrantyStationListScreen = () => {
  const navigation = useNavigation();
  const [stations, setStations] = useState<WarrantyStation[]>([]);
  const [keyword, setKeyword] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedProvince, setSelectedProvince] = useState<string>('Tỉnh thành');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showProvinceModal, setShowProvinceModal] = useState(false);
  const [provinceSearchKeyword, setProvinceSearchKeyword] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  // Debounce timer
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Mock data for provinces - replace with API call later
  const provinces: Province[] = [
    { id: '0', TenDiaBan: 'Tỉnh thành' },
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
    { id: '21', TenDiaBan: 'Điện Biên' },
    { id: '22', TenDiaBan: 'Đồng Nai' },
    { id: '23', TenDiaBan: 'Đồng Tháp' },
    { id: '24', TenDiaBan: 'Gia Lai' },
    { id: '25', TenDiaBan: 'Hà Giang' },
    { id: '26', TenDiaBan: 'Hà Nam' },
    { id: '27', TenDiaBan: 'Hà Tĩnh' },
    { id: '28', TenDiaBan: 'Hải Dương' },
    { id: '29', TenDiaBan: 'Hậu Giang' },
    { id: '30', TenDiaBan: 'Hòa Bình' },
    { id: '31', TenDiaBan: 'Hưng Yên' },
    { id: '32', TenDiaBan: 'Khánh Hòa' },
    { id: '33', TenDiaBan: 'Kiên Giang' },
    { id: '34', TenDiaBan: 'Kon Tum' },
    { id: '35', TenDiaBan: 'Lai Châu' },
    { id: '36', TenDiaBan: 'Lâm Đồng' },
    { id: '37', TenDiaBan: 'Lạng Sơn' },
    { id: '38', TenDiaBan: 'Lào Cai' },
    { id: '39', TenDiaBan: 'Long An' },
    { id: '40', TenDiaBan: 'Nam Định' },
    { id: '41', TenDiaBan: 'Nghệ An' },
    { id: '42', TenDiaBan: 'Ninh Bình' },
    { id: '43', TenDiaBan: 'Ninh Thuận' },
    { id: '44', TenDiaBan: 'Phú Thọ' },
    { id: '45', TenDiaBan: 'Phú Yên' },
    { id: '46', TenDiaBan: 'Quảng Bình' },
    { id: '47', TenDiaBan: 'Quảng Nam' },
    { id: '48', TenDiaBan: 'Quảng Ngãi' },
    { id: '49', TenDiaBan: 'Quảng Ninh' },
    { id: '50', TenDiaBan: 'Quảng Trị' },
    { id: '51', TenDiaBan: 'Sóc Trăng' },
    { id: '52', TenDiaBan: 'Sơn La' },
    { id: '53', TenDiaBan: 'Tây Ninh' },
    { id: '54', TenDiaBan: 'Thái Bình' },
    { id: '55', TenDiaBan: 'Thái Nguyên' },
    { id: '56', TenDiaBan: 'Thanh Hóa' },
    { id: '57', TenDiaBan: 'Thừa Thiên Huế' },
    { id: '58', TenDiaBan: 'Tiền Giang' },
    { id: '59', TenDiaBan: 'Trà Vinh' },
    { id: '60', TenDiaBan: 'Tuyên Quang' },
    { id: '61', TenDiaBan: 'Vĩnh Long' },
    { id: '62', TenDiaBan: 'Vĩnh Phúc' },
    { id: '63', TenDiaBan: 'Yên Bái' },
  ];

  // Filter provinces based on search keyword
  const filteredProvinces = provinces.filter((province) =>
    province.TenDiaBan.toLowerCase().includes(provinceSearchKeyword.toLowerCase())
  );

  // Load warranty stations from API
  const loadWarrantyStations = async (page: number = 1, reset: boolean = false) => {
    try {
      if (reset) {
        setIsLoading(true);
        setStations([]);
      } else {
        setIsLoadingMore(true);
      }

      const response = await warrantyStationService.getWarrantyStations({
        page,
        tentinhthanh: selectedProvince,
        keyword: searchKeyword,
      });

      if (reset) {
        setStations(response.list);
      } else {
        setStations((prev) => [...prev, ...response.list]);
      }

      setTotalCount(response.count);
      setHasNextPage(response.nextpage);
      setCurrentPage(page);
    } catch (error) {
      Alert.alert(
        'Lỗi',
        error instanceof Error ? error.message : 'Không thể tải danh sách trạm bảo hành'
      );
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
      setIsRefreshing(false);
    }
  };

  // Initial load and when province or search keyword changes
  useEffect(() => {
    loadWarrantyStations(1, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProvince, searchKeyword]);

  // Debounce search input
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      setSearchKeyword(keyword);
    }, 800);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [keyword]);

  // Pull to refresh handler
  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    loadWarrantyStations(1, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load more when scrolling near bottom
  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
      const paddingToBottom = 20;
      const isCloseToBottom =
        layoutMeasurement.height + contentOffset.y >=
        contentSize.height - paddingToBottom;

      if (isCloseToBottom && hasNextPage && !isLoadingMore && !isLoading) {
        loadWarrantyStations(currentPage + 1, false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [hasNextPage, isLoadingMore, isLoading, currentPage]
  );

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

  const handleShowMap = (station: WarrantyStation) => {
    // TODO: Implement map navigation
    Alert.alert('Chỉ đường', `Chỉ đường đến ${station.TenTram}`);
  };

  const renderStation = (item: WarrantyStation) => (
    <View style={styles.stationCard}>
      {/* Header */}
      <View style={styles.stationHeader}>
        <Text style={styles.stationName}>{item.TenTram}</Text>
      </View>

      {/* Info */}
      <View style={styles.stationInfo}>
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
        title="Hệ thống điểm bảo hành"
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
              placeholder="Tên trạm"
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
                <Text style={styles.modalTitle}>Chọn tỉnh/thành phố</Text>
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

        {/* Page Title */}
        <View style={styles.pageHeader}>
          <Text style={styles.pageTitle}>
            Danh sách trạm bảo hành toàn quốc
          </Text>
        </View>

        {/* Stations List */}
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={true}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
          onScroll={handleScroll}
          scrollEventThrottle={400}
        >
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
          ) : stations.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🔍</Text>
              <Text style={styles.emptyText}>
                Không tìm thấy trạm bảo hành
              </Text>
            </View>
          ) : (
            <>
              <View style={styles.stationsList}>
                {stations.map((station) => (
                  <React.Fragment key={station.id}>
                    {renderStation(station)}
                  </React.Fragment>
                ))}
              </View>

              {/* Loading more indicator */}
              {isLoadingMore && (
                <View style={styles.loadingMoreContainer}>
                  <ActivityIndicator size="small" color={COLORS.primary} />
                  <Text style={styles.loadingMoreText}>Đang tải thêm...</Text>
                </View>
              )}
            </>
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

  // Stations List
  scrollView: {
    flex: 1,
  },
  stationsList: {
    marginTop: SPACING.md,
  },
  stationCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.md,
  },
  stationHeader: {
    backgroundColor: COLORS.primary + '15',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  stationName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },

  // Station Info
  stationInfo: {
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
  loadingMoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.lg,
    gap: SPACING.sm,
  },
  loadingMoreText: {
    fontSize: 14,
    color: COLORS.textSecondary,
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

export default WarrantyStationListScreen;
