import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../../config/theme';
import CustomHeader from '../../../components/CustomHeader';
import { Icon } from '../../../components/common';
import { rewardService } from '../../../api/rewardService';
import { RewardTransaction, RewardTransactionType } from '../../../types/reward';
import { commonStyles } from '../../../styles/commonStyles';

const RewardDetailScreen = () => {
  const navigation = useNavigation<any>();

  const [activeTab, setActiveTab] = useState<RewardTransactionType>('5'); // Default: Activated warranty
  const [transactions, setTransactions] = useState<RewardTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  // Handle back button press
  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  // Load transactions from API
  const loadTransactions = async (page: number = 1, reset: boolean = false) => {
    try {
      if (reset) {
        setIsLoading(true);
        setTransactions([]);
      } else {
        setIsLoadingMore(true);
      }

      const response = await rewardService.getRewardTransactions({
        upage: page,
        type: activeTab,
      });

      if (reset) {
        setTransactions(response.list);
      } else {
        setTransactions((prev) => [...prev, ...response.list]);
      }

      setTotalCount(response.count);
      setHasNextPage(response.nextpage);
      setCurrentPage(page);
    } catch (error) {
      Alert.alert(
        'Lỗi',
        error instanceof Error ? error.message : 'Không thể tải danh sách giao dịch'
      );
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  // Load transactions when tab changes
  useEffect(() => {
    loadTransactions(1, true);
  }, [activeTab]);

  // Load more when scrolling near bottom
  const handleLoadMore = () => {
    if (hasNextPage && !isLoadingMore && !isLoading) {
      loadTransactions(currentPage + 1, false);
    }
  };

  const getTabTitle = (type: RewardTransactionType) => {
    switch (type) {
      case '5':
        return 'Kích hoạt BH';
      case '3':
        return 'Sell Out';
      case '4':
        return 'Sell In';
      default:
        return '';
    }
  };

  const renderTransactionCard = (item: RewardTransaction, index: number) => (
    <View key={`${item.id}-${index}`} style={styles.transactionCard}>
      {/* Serial Header */}
      <View style={styles.cardHeader}>
        <Text style={[styles.serialText, { color: item.statusColor }]}>
          {item.serial}
        </Text>
        <View style={[styles.statusBadge, { backgroundColor: item.statusColor }]}>
          <Text style={styles.statusBadgeText}>{item.activationStatusName}</Text>
        </View>
      </View>

      {/* Product Details */}
      <View style={styles.cardBody}>
        <View style={commonStyles.infoRow}>
          <View style={commonStyles.infoLabelContainer}>
            <Icon name="factory" size={14} color={COLORS.textSecondary} />
            <Text style={commonStyles.infoLabel}>Hãng sản xuất:</Text>
          </View>
          <Text style={commonStyles.infoValue}>{item.manufacturer}</Text>
        </View>

        <View style={commonStyles.infoRow}>
          <View style={commonStyles.infoLabelContainer}>
            <Icon name="mobile" size={14} color={COLORS.textSecondary} />
            <Text style={commonStyles.infoLabel}>Model:</Text>
          </View>
          <Text style={commonStyles.infoValue}>{item.model}</Text>
        </View>

        {item.productName && (
          <View style={commonStyles.infoRow}>
            <View style={commonStyles.infoLabelContainer}>
              <Icon name="package" size={14} color={COLORS.textSecondary} />
              <Text style={commonStyles.infoLabel}>Sản phẩm:</Text>
            </View>
            <Text style={commonStyles.infoValue}>{item.productName}</Text>
          </View>
        )}

        <View style={commonStyles.infoRow}>
          <View style={commonStyles.infoLabelContainer}>
            <Icon name="warranty-activation" size={14} color={COLORS.textSecondary} />
            <Text style={commonStyles.infoLabel}>Bảo hành:</Text>
          </View>
          <Text style={commonStyles.infoValue}>{item.warrantyPeriod}</Text>
        </View>

        {item.warehouseDate && (
          <View style={commonStyles.infoRow}>
            <View style={commonStyles.infoLabelContainer}>
              <Icon name="calendar" size={14} color={COLORS.textSecondary} />
              <Text style={commonStyles.infoLabel}>Ngày nhập kho:</Text>
            </View>
            <Text style={commonStyles.infoValue}>{item.warehouseDate}</Text>
          </View>
        )}

        {item.purchaseDate && (
          <View style={commonStyles.infoRow}>
            <View style={commonStyles.infoLabelContainer}>
              <Icon name="calendar" size={14} color={COLORS.textSecondary} />
              <Text style={commonStyles.infoLabel}>Ngày bán:</Text>
            </View>
            <Text style={commonStyles.infoValue}>{item.purchaseDate}</Text>
          </View>
        )}

        {item.activationDate && (
          <View style={commonStyles.infoRow}>
            <View style={commonStyles.infoLabelContainer}>
              <Icon name="calendar" size={14} color={COLORS.textSecondary} />
              <Text style={commonStyles.infoLabel}>Ngày kích hoạt:</Text>
            </View>
            <Text style={commonStyles.infoValue}>{item.activationDate}</Text>
          </View>
        )}

        {item.warrantyExpiry && (
          <View style={commonStyles.infoRow}>
            <View style={commonStyles.infoLabelContainer}>
              <Icon name="calendar" size={14} color={COLORS.textSecondary} />
              <Text style={commonStyles.infoLabel}>Hạn bảo hành:</Text>
            </View>
            <Text style={commonStyles.infoValue}>{item.warrantyExpiry}</Text>
          </View>
        )}

        {item.distributorName && (
          <View style={commonStyles.infoRow}>
            <View style={commonStyles.infoLabelContainer}>
              <Icon name="distribution" size={14} color={COLORS.textSecondary} />
              <Text style={commonStyles.infoLabel}>Đại lý/NPP:</Text>
            </View>
            <Text style={commonStyles.infoValue}>{item.distributorName}</Text>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      <CustomHeader
        title="Chi tiết thưởng"
        leftIcon={<Icon name="back" size={24} color={COLORS.white} />}
        onLeftPress={handleBack}
      />

      {/* Tabs */}
      <View style={commonStyles.tabsContainer}>
        <TouchableOpacity
          style={[commonStyles.tab, activeTab === '5' && commonStyles.tabActive]}
          onPress={() => setActiveTab('5')}
          activeOpacity={0.7}
        >
          <Text style={[commonStyles.tabText, activeTab === '5' && commonStyles.tabTextActive]}>
            Kích hoạt BH
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[commonStyles.tab, activeTab === '3' && commonStyles.tabActive]}
          onPress={() => setActiveTab('3')}
          activeOpacity={0.7}
        >
          <Text style={[commonStyles.tabText, activeTab === '3' && commonStyles.tabTextActive]}>
            Sell Out
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[commonStyles.tab, activeTab === '4' && commonStyles.tabActive]}
          onPress={() => setActiveTab('4')}
          activeOpacity={0.7}
        >
          <Text style={[commonStyles.tabText, activeTab === '4' && commonStyles.tabTextActive]}>
            Sell In
          </Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={transactions}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          renderItem={({ item, index }) => renderTransactionCard(item, index)}
          style={styles.scrollView}
          showsVerticalScrollIndicator={true}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListHeaderComponent={
            <View style={styles.totalCountCard}>
              <Text style={styles.totalCountText}>
                Tổng số: <Text style={styles.totalCountNumber}>{totalCount}</Text>
              </Text>
            </View>
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="document" size={48} color={COLORS.gray300} />
              <Text style={styles.emptyText}>
                Không có giao dịch {getTabTitle(activeTab).toLowerCase()}
              </Text>
            </View>
          }
          ListFooterComponent={
            isLoadingMore ? (
              <View style={styles.loadingMoreContainer}>
                <ActivityIndicator size="small" color={COLORS.primary} />
                <Text style={styles.loadingMoreText}>Đang tải thêm...</Text>
              </View>
            ) : (
              <View style={styles.bottomSpacing} />
            )
          }
        />
      )}
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

  // Total Count Card
  totalCountCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.screen_lg,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    ...SHADOWS.sm,
  },
  totalCountText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  totalCountNumber: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '700',
  },

  // Transaction List
  transactionList: {
    paddingTop: SPACING.sm,
  },
  transactionCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.screen_lg,
    marginBottom: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.md,
  },

  // Card Header
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.gray50,
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  serialText: {
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.white,
  },

  // Card Body
  cardBody: {
    padding: SPACING.md,
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
    marginTop: SPACING.xl,
  },
  emptyText: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.md,
  },

  bottomSpacing: {
    height: SPACING.xl,
  },
});

export default RewardDetailScreen;
