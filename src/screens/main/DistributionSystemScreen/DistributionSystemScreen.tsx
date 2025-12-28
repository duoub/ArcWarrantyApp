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
  RefreshControl,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../../config/theme';
import CustomHeader from '../../../components/CustomHeader';
import ProvinceSelector from '../../../components/ProvinceSelector';
import { distributionSystemService } from '../../../api/distributionSystemService';
import { Distributor } from '../../../types/distributionSystem';
import { openMapDirections } from '../../../utils/mapNavigation';
import { Icon } from '../../../components/common';
import { useAuthStore } from '../../../store/authStore';

const DistributionSystemScreen = () => {
  const navigation = useNavigation<any>();
  const { isAuthenticated } = useAuthStore();

  // Handle back button press
  const handleBack = () => {
    if (isAuthenticated) {
      // Nếu đã login, back về screen trước đó
      if (navigation.canGoBack()) {
        navigation.goBack();
      }
    } else {
      // Nếu chưa login, back về LoginScreen
      navigation.navigate('Login');
    }
  };
  const [distributors, setDistributors] = useState<Distributor[]>([]);
  const [keyword, setKeyword] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedProvince, setSelectedProvince] = useState<string>('Tỉnh thành');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);

  // Debounce timer
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Load distributors from API
  const loadDistributors = async (page: number = 1, reset: boolean = false) => {
    try {
      if (reset) {
        setIsLoading(true);
        setDistributors([]);
      } else {
        setIsLoadingMore(true);
      }

      const response = await distributionSystemService.getDistributors({
        page,
        tentinhthanh: selectedProvince,
        keyword: searchKeyword,
      });

      if (reset) {
        setDistributors(response.list);
      } else {
        setDistributors((prev) => [...prev, ...response.list]);
      }

      setHasNextPage(response.nextpage);
      setCurrentPage(page);
    } catch (error) {
      Alert.alert(
        'Lỗi',
        error instanceof Error ? error.message : 'Không thể tải danh sách nhà phân phối'
      );
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
      setIsRefreshing(false);
    }
  };

  // Initial load and when province or search keyword changes
  useEffect(() => {
    loadDistributors(1, true);
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
    loadDistributors(1, true);
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
        loadDistributors(currentPage + 1, false);
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

  const handleShowMap = (distributor: Distributor) => {
    openMapDirections(distributor.DiaChi, distributor.TenTram);
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
            <Icon name="phone" size={16} color={COLORS.gray500} />
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
            <Icon name="location" size={16} color={COLORS.gray500} />
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
          <Icon name="phone" size={18} color="#2E7D32" />
          <Text style={styles.buttonTextCall}>Gọi ngay</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.buttonMap]}
          onPress={() => handleShowMap(item)}
          activeOpacity={0.7}
        >
          <Icon name="location" size={18} color="#E65100" />
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
        leftIcon={<Icon name="back" size={24} color={COLORS.white} />}
        onLeftPress={handleBack}
      />

      <View style={styles.content}>
        {/* Search and Filter Section */}
        <View style={styles.filterSection}>
          {/* Search Input */}
          <View style={styles.searchContainer}>
            <Icon name="search" size={18} color={COLORS.gray500} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Tên nhà phân phối"
              placeholderTextColor={COLORS.gray400}
              value={keyword}
              onChangeText={setKeyword}
            />
          </View>

          {/* Province Selector */}
          <ProvinceSelector
            selectedProvince={selectedProvince}
            onProvinceChange={setSelectedProvince}
          />
        </View>

        {/* Distributors List */}
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
          ) : distributors.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Icon name="search" size={48} color={COLORS.gray300} style={styles.emptyIcon} />
              <Text style={styles.emptyText}>
                Không tìm thấy nhà phân phối
              </Text>
            </View>
          ) : (
            <>
              <View style={styles.distributorsList}>
                {distributors.map((distributor) => (
                  <React.Fragment key={distributor.id}>
                    {renderDistributor(distributor)}
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

export default DistributionSystemScreen;
