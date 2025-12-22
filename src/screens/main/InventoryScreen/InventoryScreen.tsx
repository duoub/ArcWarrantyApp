import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../../config/theme';
import CustomHeader from '../../../components/CustomHeader';
import BarcodeScanner from '../../../components/BarcodeScanner';
import { HomeStackParamList } from '../../../navigation/MainNavigator';

type InventoryScreenNavigationProp = StackNavigationProp<HomeStackParamList, 'Inventory'>;

// Mock data type
interface InventoryItem {
  serial: string;
  tenhangsanxuat: string;
  tenmodel: string;
  thoigianbaohanh: string;
  ngaynhapkho: string;
  ngaymua: string;
  kichhoatbaohanh: number;
  kichhoatbaohanhname: string;
  ngaykichhoat: string;
  hanbaohanh: string;
  statuscolor: string;
}

const InventoryScreen = () => {
  const navigation = useNavigation<InventoryScreenNavigationProp>();

  const [activeTab, setActiveTab] = useState<'1' | '2'>('1'); // 1: Còn trong kho, 2: Đã bán
  const [keyword, setKeyword] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [inventoryList, setInventoryList] = useState<InventoryItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);

  // Mock data - replace with API call later
  const MOCK_INVENTORY: InventoryItem[] = [
    {
      serial: 'AKT-2024-001-0001',
      tenhangsanxuat: 'AKITO',
      tenmodel: 'AKITO-12000BTU-INV',
      thoigianbaohanh: '24 tháng',
      ngaynhapkho: '15/12/2024',
      ngaymua: '',
      kichhoatbaohanh: 1,
      kichhoatbaohanhname: 'Chưa kích hoạt',
      ngaykichhoat: '',
      hanbaohanh: '',
      statuscolor: COLORS.warning,
    },
    {
      serial: 'AKT-2024-001-0002',
      tenhangsanxuat: 'AKITO',
      tenmodel: 'AKITO-18000BTU-INV',
      thoigianbaohanh: '24 tháng',
      ngaynhapkho: '14/12/2024',
      ngaymua: '',
      kichhoatbaohanh: 1,
      kichhoatbaohanhname: 'Chưa kích hoạt',
      ngaykichhoat: '',
      hanbaohanh: '',
      statuscolor: COLORS.warning,
    },
    {
      serial: 'AKT-2024-001-0003',
      tenhangsanxuat: 'AKITO',
      tenmodel: 'AKITO-9000BTU',
      thoigianbaohanh: '24 tháng',
      ngaynhapkho: '10/12/2024',
      ngaymua: '12/12/2024',
      kichhoatbaohanh: 2,
      kichhoatbaohanhname: 'Đã kích hoạt',
      ngaykichhoat: '12/12/2024',
      hanbaohanh: '12/12/2026',
      statuscolor: COLORS.success,
    },
  ];

  useEffect(() => {
    loadInventory();
  }, [activeTab, keyword]);

  const loadInventory = async () => {
    try {
      setIsLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      // Filter by tab and keyword
      let filtered = MOCK_INVENTORY.filter(item => {
        if (activeTab === '1') {
          return !item.ngaymua; // Còn trong kho (chưa bán)
        } else {
          return !!item.ngaymua; // Đã bán
        }
      });

      if (keyword) {
        filtered = filtered.filter(item =>
          item.serial.toLowerCase().includes(keyword.toLowerCase()) ||
          item.tenhangsanxuat.toLowerCase().includes(keyword.toLowerCase()) ||
          item.tenmodel.toLowerCase().includes(keyword.toLowerCase())
        );
      }

      setInventoryList(filtered);
      setTotalCount(filtered.length);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tải danh sách kho hàng');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadInventory();
    setIsRefreshing(false);
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
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>🏭 Hãng sản xuất:</Text>
          <Text style={styles.infoValue}>{item.tenhangsanxuat}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>📱 Model:</Text>
          <Text style={styles.infoValue}>{item.tenmodel}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>⏰ Thời gian bảo hành:</Text>
          <Text style={styles.infoValue}>{item.thoigianbaohanh}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>📦 Ngày xuất kho:</Text>
          <Text style={styles.infoValue}>{item.ngaynhapkho || 'Chưa cập nhật'}</Text>
        </View>

        {item.ngaymua && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>🛒 Ngày mua:</Text>
            <Text style={styles.infoValue}>{item.ngaymua}</Text>
          </View>
        )}

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>📋 Trạng thái gửi kích hoạt bảo hành:</Text>
          <Text style={styles.infoValue}>{item.kichhoatbaohanhname}</Text>
        </View>

        {item.ngaykichhoat && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>📅 Ngày gửi kích hoạt bảo hành:</Text>
            <Text style={styles.infoValue}>{item.ngaykichhoat}</Text>
          </View>
        )}

        {item.hanbaohanh && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>⏳ Ngày hết hạn bảo hành:</Text>
            <Text style={styles.infoValue}>{item.hanbaohanh}</Text>
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
        leftIcon={<Text style={styles.backIcon}>‹</Text>}
        onLeftPress={handleBackPress}
      />

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === '1' && styles.tabActive]}
          onPress={() => setActiveTab('1')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabText, activeTab === '1' && styles.tabTextActive]}>
            Còn trong kho
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === '2' && styles.tabActive]}
          onPress={() => setActiveTab('2')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabText, activeTab === '2' && styles.tabTextActive]}>
            Đã bán
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Từ khóa"
            placeholderTextColor={COLORS.gray400}
            value={keyword}
            onChangeText={setKeyword}
          />
          <TouchableOpacity
            style={styles.scanButton}
            onPress={handleScanBarcode}
            activeOpacity={0.7}
          >
            <Image
              source={require('../../../assets/images/scan_me.png')}
              style={styles.scanImage}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* Total Count */}
        <View style={styles.totalCountCard}>
          <Text style={styles.totalCountText}>
            Tổng số: <Text style={styles.totalCountNumber}>{totalCount}</Text>
          </Text>
        </View>

        {/* Loading State */}
        {isLoading && !isRefreshing && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Đang tải...</Text>
          </View>
        )}

        {/* Empty State */}
        {!isLoading && inventoryList.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📦</Text>
            <Text style={styles.emptyText}>Không có sản phẩm nào</Text>
            <Text style={styles.emptySubtext}>
              {keyword ? 'Thử tìm kiếm với từ khóa khác' : 'Chưa có sản phẩm trong danh mục này'}
            </Text>
          </View>
        )}

        {/* Inventory List */}
        {!isLoading && inventoryList.map((item, index) => renderInventoryItem(item, index))}

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={handleAddInventory}
        activeOpacity={0.8}
      >
        <Text style={styles.fabIcon}>+</Text>
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

  // Tabs
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  tabTextActive: {
    color: COLORS.primary,
  },

  // Search Bar
  searchContainer: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray50,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    paddingHorizontal: SPACING.md,
    height: 48,
  },
  searchIcon: {
    fontSize: 20,
    marginRight: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: COLORS.textPrimary,
    paddingVertical: 0,
  },
  scanButton: {
    padding: SPACING.xs,
    marginLeft: SPACING.xs,
  },
  scanImage: {
    width: 32,
    height: 32,
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
  infoRow: {
    marginBottom: SPACING.sm,
  },
  infoLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },

  // Loading State
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xxl,
  },
  loadingText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
  },

  // Empty State
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xxl,
    paddingHorizontal: SPACING.xl,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: SPACING.md,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },

  // Floating Action Button
  fab: {
    position: 'absolute',
    bottom: SPACING.xl,
    right: SPACING.xl,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.xl,
  },
  fabIcon: {
    fontSize: 32,
    color: COLORS.white,
    fontWeight: '300',
  },

  bottomSpacing: {
    height: 100,
  },

  // Back Icon
  backIcon: {
    fontSize: 28,
    color: COLORS.white,
    fontWeight: '400',
  },
});

export default InventoryScreen;
