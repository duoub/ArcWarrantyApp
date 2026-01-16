import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../../config/theme';
import CustomHeader from '../../../components/CustomHeader';
import BarcodeScanner from '../../../components/BarcodeScanner/BarcodeScanner';
import { HomeStackParamList } from '../../../navigation/MainNavigator';
import { inventoryService } from '../../../api/inventoryService';
import { InventoryItem } from '../../../types/inventory';
import { Icon } from '../../../components/common';
import { commonStyles } from '../../../styles/commonStyles';

type InventoryScreenNavigationProp = StackNavigationProp<HomeStackParamList, 'Inventory'>;

const InventoryScreen = () => {
  const navigation = useNavigation<InventoryScreenNavigationProp>();

  const [activeTab, setActiveTab] = useState<'1' | '2'>('1'); // 1: Còn trong kho, 2: Đã bán
  const [keyword, setKeyword] = useState('');
  const [searchKeyword, setSearchKeyword] = useState(''); // Debounced keyword
  const [showScanner, setShowScanner] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [inventoryList, setInventoryList] = useState<InventoryItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Debounce search keyword
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchKeyword(keyword);
      setCurrentPage(1); // Reset to page 1 when searching
    }, 800);

    return () => clearTimeout(timer);
  }, [keyword]);

  // Load inventory when tab or search keyword changes
  useEffect(() => {
    loadInventory(1, true);
  }, [activeTab, searchKeyword]);

  const loadInventory = async (page: number = 1, reset: boolean = false) => {
    try {
      if (reset) {
        setIsLoading(true);
        setInventoryList([]);
      } else {
        setIsLoadingMore(true);
      }

      const response = await inventoryService.getInventoryList({
        page,
        type: activeTab,
        keyword: searchKeyword,
      });

      if (reset) {
        setInventoryList(response.list);
      } else {
        setInventoryList(prev => [...prev, ...response.list]);
      }

      setTotalCount(response.count);
      setHasNextPage(response.nextpage);
      setCurrentPage(page);
    } catch (error) {
      Alert.alert(
        'Lỗi',
        error instanceof Error ? error.message : 'Không thể tải danh sách kho hàng'
      );
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    if (!isLoadingMore && hasNextPage && !isLoading) {
      loadInventory(currentPage + 1, false);
    }
  };

  const handleScanBarcode = () => {
    setShowScanner(true);
  };

  const handleScanComplete = (data: string) => {
    setKeyword(data);
    setShowScanner(false);
  };

  const handleAddInventory = () => {
    Alert.alert('Xuất kho serial', 'Chức năng đang phát triển');
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  const renderInventoryItem = (item: InventoryItem, index: number) => (
    <View key={index} style={styles.inventoryCard}>
      {/* Serial Header */}
      <View style={styles.cardHeader}>
        <Text style={[styles.serialText, { color: item.statuscolor }]}>
          {item.serial}
        </Text>
        <View style={styles.statusBadgeContainer}>
          {item.kichhoatbaohanh !== 2 && (
            <View style={[styles.statusBadge, { backgroundColor: COLORS.error }]}>
              <Text style={styles.statusBadgeText}>▶</Text>
            </View>
          )}
          <View style={[styles.statusBadge, { backgroundColor: item.statuscolor }]}>
            <Text style={styles.statusBadgeText}>{item.kichhoatbaohanhname}</Text>
          </View>
        </View>
      </View>

      {/* Product Details */}
      <View style={styles.cardBody}>
        <View style={commonStyles.infoRow}>
          <View style={commonStyles.infoLabelContainer}>
            <Icon name="factory" size={14} color={COLORS.textSecondary} />
            <Text style={commonStyles.infoLabel}>Hãng sản xuất:</Text>
          </View>
          <Text style={commonStyles.infoValue}>{item.tenhangsanxuat}</Text>
        </View>

        <View style={commonStyles.infoRow}>
          <View style={commonStyles.infoLabelContainer}>
            <Icon name="mobile" size={14} color={COLORS.textSecondary} />
            <Text style={commonStyles.infoLabel}>Model:</Text>
          </View>
          <Text style={commonStyles.infoValue}>{item.tenmodel}</Text>
        </View>

        <View style={commonStyles.infoRow}>
          <View style={commonStyles.infoLabelContainer}>
            <Icon name="warranty-activation" size={14} color={COLORS.textSecondary} />
            <Text style={commonStyles.infoLabel}>Thời gian bảo hành:</Text>
          </View>
          <Text style={commonStyles.infoValue}>{item.thoigianbaohanh}</Text>
        </View>

        <View style={commonStyles.infoRow}>
          <View style={commonStyles.infoLabelContainer}>
            <Icon name="package" size={14} color={COLORS.textSecondary} />
            <Text style={commonStyles.infoLabel}>Ngày xuất kho:</Text>
          </View>
          <Text style={commonStyles.infoValue}>{item.ngaynhapkho || 'Chưa cập nhật'}</Text>
        </View>

        {item.ngaymua && (
          <View style={commonStyles.infoRow}>
            <View style={commonStyles.infoLabelContainer}>
              <Icon name="sell-out" size={14} color={COLORS.textSecondary} />
              <Text style={commonStyles.infoLabel}>Ngày mua:</Text>
            </View>
            <Text style={commonStyles.infoValue}>{item.ngaymua}</Text>
          </View>
        )}

        <View style={commonStyles.infoRow}>
          <View style={commonStyles.infoLabelContainer}>
            <Icon name="list" size={14} color={COLORS.textSecondary} />
            <Text style={commonStyles.infoLabel}>Trạng thái gửi kích hoạt bảo hành:</Text>
          </View>
          <Text style={commonStyles.infoValue}>{item.kichhoatbaohanhname}</Text>
        </View>

        {item.ngaykichhoat && (
          <View style={commonStyles.infoRow}>
            <View style={commonStyles.infoLabelContainer}>
              <Icon name="warranty-activation" size={14} color={COLORS.textSecondary} />
              <Text style={commonStyles.infoLabel}>Ngày gửi kích hoạt bảo hành:</Text>
            </View>
            <Text style={commonStyles.infoValue}>{item.ngaykichhoat}</Text>
          </View>
        )}

        {item.hanbaohanh && (
          <View style={commonStyles.infoRow}>
            <View style={commonStyles.infoLabelContainer}>
              <Icon name="warranty-activation" size={14} color={COLORS.textSecondary} />
              <Text style={commonStyles.infoLabel}>Ngày hết hạn bảo hành:</Text>
            </View>
            <Text style={commonStyles.infoValue}>{item.hanbaohanh}</Text>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      {/* Custom Header */}
      <CustomHeader
        title="Kho hàng"
        leftIcon={<Icon name="back" size={24} color={COLORS.white} />}
        onLeftPress={handleBackPress}
      />

      {/* Tabs */}
      <View style={commonStyles.tabsContainer}>
        <TouchableOpacity
          style={[commonStyles.tab, activeTab === '1' && commonStyles.tabActive]}
          onPress={() => setActiveTab('1')}
          activeOpacity={0.7}
        >
          <Text style={[commonStyles.tabText, activeTab === '1' && commonStyles.tabTextActive]}>
            Còn trong kho
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[commonStyles.tab, activeTab === '2' && commonStyles.tabActive]}
          onPress={() => setActiveTab('2')}
          activeOpacity={0.7}
        >
          <Text style={[commonStyles.tabText, activeTab === '2' && commonStyles.tabTextActive]}>
            Đã xuất kho
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={commonStyles.searchContainer}>
        <View style={[commonStyles.searchInputWrapper, styles.searchInputWrapperCustom]}>
          <Icon name="search" size={20} color={COLORS.gray400} />
          <TextInput
            style={commonStyles.searchInput}
            placeholder="Từ khóa"
            placeholderTextColor={COLORS.gray400}
            value={keyword}
            onChangeText={setKeyword}
          />
          <TouchableOpacity
            style={commonStyles.scanButton}
            onPress={handleScanBarcode}
            activeOpacity={0.7}
          >
            <Image
              source={require('../../../assets/images/scan_me.png')}
              style={commonStyles.scanImage}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        onScroll={({ nativeEvent }) => {
          const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
          const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 100;
          if (isCloseToBottom) {
            handleLoadMore();
          }
        }}
        scrollEventThrottle={400}
      >
        {/* Total Count */}
        <View style={styles.totalCountCard}>
          <Text style={styles.totalCountText}>
            Tổng số: <Text style={styles.totalCountNumber}>{totalCount}</Text>
          </Text>
        </View>

        {/* Loading State */}
        {isLoading && (
          <View style={commonStyles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={commonStyles.loadingText}>Đang tải...</Text>
          </View>
        )}

        {/* Empty State */}
        {!isLoading && inventoryList.length === 0 && (
          <View style={commonStyles.emptyContainer}>
            <Icon name="package" size={64} color={COLORS.gray300} />
            <Text style={commonStyles.emptyText}>Không có sản phẩm nào</Text>
            <Text style={commonStyles.emptySubtext}>
              {keyword ? 'Thử tìm kiếm với từ khóa khác' : 'Chưa có sản phẩm trong danh mục này'}
            </Text>
          </View>
        )}

        {/* Inventory List */}
        {!isLoading && inventoryList.map((item, index) => renderInventoryItem(item, index))}

        {/* Load More Indicator */}
        {isLoadingMore && (
          <View style={styles.loadMoreContainer}>
            <ActivityIndicator size="small" color={COLORS.primary} />
            <Text style={styles.loadMoreText}>Đang tải thêm...</Text>
          </View>
        )}

        {/* Bottom Spacing */}
        <View style={commonStyles.bottomSpacingLarge} />
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={commonStyles.fab}
        onPress={handleAddInventory}
        activeOpacity={0.8}
      >
        <Text style={commonStyles.fabIcon}>+</Text>
      </TouchableOpacity>

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

  // Search Bar
  searchInputWrapperCustom: {
    gap: SPACING.sm,
  },

  // Total Count
  totalCountCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.sm,
  },
  totalCountText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  totalCountNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
  },

  // Inventory Card
  inventoryCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.md,
  },
  cardHeader: {
    backgroundColor: COLORS.gray50,
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  serialText: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: SPACING.sm,
  },
  statusBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.white,
  },
  cardBody: {
    padding: SPACING.md,
  },

  // Load More State
  loadMoreContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.lg,
  },
  loadMoreText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
  },
});

export default InventoryScreen;
