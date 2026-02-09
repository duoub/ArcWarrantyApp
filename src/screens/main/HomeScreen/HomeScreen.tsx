import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  FlatList,
  Alert,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../../config/theme';
import { useAuthStore } from '../../../store/authStore';
import Avatar from '../../../components/Avatar';
import { HomeStackParamList } from '../../../navigation/MainNavigator';
import { profileService } from '../../../api/profileService';
import { ProfileData } from '../../../types/profile';
import { bannerService } from '../../../api/bannerService';
import { BannerItem } from '../../../types/banner';
import { salesProgramService } from '../../../api/salesProgramService';
import { Icon } from '../../../components/common';
import { NotificationService } from '../../../utils/notificationService';
import { commonStyles } from '../../../styles/commonStyles';

type HomeScreenNavigationProp = StackNavigationProp<HomeStackParamList, 'Home'>;

const { width } = Dimensions.get('window');
const BANNER_WIDTH = width;
const BANNER_HEIGHT = width;

// Default banner image if API doesn't return any
const DEFAULT_BANNER_IMAGE = require('../../../assets/images/banner.jpg');

const HomeScreen = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { user, isAuthenticated } = useAuthStore();

  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const bannerListRef = useRef<FlatList>(null);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [banners, setBanners] = useState<BannerItem[]>([]);
  const [isBannerLoading, setIsBannerLoading] = useState(false);

  // Initialize Firebase Cloud Messaging
  useEffect(() => {
    const initializeNotifications = async () => {
      // Request permission
      const hasPermission = await NotificationService.requestUserPermission();

      if (hasPermission) {
        // Get FCM token
        const token = await NotificationService.getToken();

        if (token) {
          // You can send this token to your backend server to store it
          // Optional: Subscribe to a topic
          // await NotificationService.subscribeToTopic('warranty_updates');
        }
      }

      // Setup notification listeners
      const unsubscribe = NotificationService.setupNotificationListeners();

      return unsubscribe;
    };

    const unsubscribe = initializeNotifications();

    return () => {
      unsubscribe.then(unsub => {
        if (unsub && typeof unsub === 'function') {
          unsub();
        }
      });
    };
  }, []);

  // Load profile data from API
  useEffect(() => {
    if (isAuthenticated) {
      loadProfileData();
    }
  }, [isAuthenticated]);

  // Load banners from API
  useEffect(() => {
    loadBanners();
  }, []);

  const loadBanners = async () => {
    try {
      const response = await bannerService.getHomeBanner();
      if (response.status && response.banners.length > 0) {
        setBanners(response.banners);
      }
    } catch (error) {
      // Keep empty banners on error
    }
  };

  // Log when user avatar changes to debug re-render
  useEffect(() => {
  }, [user?.avatar]);

  const loadProfileData = async () => {
    try {
      setIsLoading(true);

      const response = await profileService.getProfile({
        typeget: 5,
      });

      if (response.status && response.data) {
        setProfileData(response.data);
      }
    } catch (error) {
      // Keep using default banners and zero rewards on error
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-slide banners - only run when there are banners
  useEffect(() => {
    if (banners.length <= 1) {
      return;
    }

    const interval = setInterval(() => {
      setCurrentBannerIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % banners.length;
        bannerListRef.current?.scrollToIndex({
          index: nextIndex,
          animated: true,
        });
        return nextIndex;
      });
    }, 3500);

    return () => clearInterval(interval);
  }, [banners.length]);

  const handleBannerPress = async (banner: BannerItem) => {
    // Prevent multiple clicks
    if (isBannerLoading) return;

    try {
      setIsBannerLoading(true);

      // Call API to get program detail
      const response = await salesProgramService.getSalesProgramDetail({
        typeget: 1,
        idct: banner.id.toString(),
      });

      if (response.status && response.data) {
        // Navigate to detail screen with HTML content
        navigation.navigate('SalesProgramDetail', {
          programName: response.data.name || banner.title,
          htmlContent: response.data.noidungchitiet,
        });
      } else {
        Alert.alert('Thông báo', response.message || 'Không tìm thấy thông tin chương trình');
      }
    } catch (error) {
      Alert.alert(
        'Lỗi',
        error instanceof Error ? error.message : 'Không thể tải thông tin chương trình'
      );
    } finally {
      setIsBannerLoading(false);
    }
  };

  const handleSalesProgramPress = () => {
    // Navigate to SalesProgram screen within HomeStack
    navigation.navigate('SalesProgram');
  };

  const handleInventoryPress = () => {
    navigation.navigate('Inventory');
  };

  const handlePaymentDetailPress = () => {
    navigation.navigate('PaymentDetail');
  };

  const handleRewardDetailPress = () => {
    navigation.navigate('RewardDetail');
  };

  const handleDealerListPress = () => {
    navigation.navigate('DealerList');
  };

  const handleRankingPress = () => {
    navigation.navigate('Ranking');
  };

  const renderBanner = ({ item }: { item: BannerItem }) => (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => handleBannerPress(item)}
      style={styles.bannerItem}
      disabled={isBannerLoading}
    >
      <Image
        source={{ uri: item.bannerurl }}
        style={styles.bannerImage}
        resizeMode="cover"
        defaultSource={DEFAULT_BANNER_IMAGE}
      />
      {isBannerLoading && (
        <View style={styles.bannerLoadingOverlay}>
          <ActivityIndicator size="large" color={COLORS.white} />
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="never"
      >
        {/* Banner Slider - Only show when there are banners, tràn cả safe area */}
        {banners.length > 0 && (
          <View style={styles.bannerContainer}>
            <FlatList
              ref={bannerListRef}
              data={banners}
              renderItem={renderBanner}
              keyExtractor={(item, index) => `banner-${item.id}-${index}`}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              style={{ height: BANNER_HEIGHT }}
              onMomentumScrollEnd={(event) => {
                const index = Math.round(
                  event.nativeEvent.contentOffset.x / BANNER_WIDTH
                );
                setCurrentBannerIndex(index);
              }}
            />

            {/* Pagination Dots - Only show when more than 1 banner */}
            {banners.length > 1 && (
              <View style={commonStyles.paginationContainer}>
                {banners.map((banner, index) => (
                  <View
                    key={`dot-${banner.id}-${index}`}
                    style={[
                      commonStyles.paginationDot,
                      index === currentBannerIndex && commonStyles.paginationDotActive,
                    ]}
                  />
                ))}
              </View>
            )}
          </View>
        )}

        {/* User Profile Section */}
        {isAuthenticated && user && (
          <View style={styles.userCard}>
            <View style={styles.userLeft}>
              <Avatar uri={user.avatar} size={48} />
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{user.name}</Text>
                <Text style={styles.userEmail}>
                  Điểm tích lũy: {profileData?.rewardPoints || 0}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.programButton}
              onPress={handleSalesProgramPress}
              activeOpacity={0.7}
            >
              <Text style={styles.programButtonText}>
                Gói chương trình sale
              </Text>
              <Text style={commonStyles.chevronIcon}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.programButton}
              onPress={handleDealerListPress}
              activeOpacity={0.7}
            >
              <Text style={styles.programButtonText}>
                Đại lý cấp dưới
              </Text>
              <Text style={commonStyles.chevronIcon}>›</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Quick Action - Inventory */}
        {isAuthenticated && (
          <TouchableOpacity
            style={styles.actionCard}
            onPress={handleInventoryPress}
            activeOpacity={0.7}
          >
            <View style={styles.actionLeft}>
              <View style={commonStyles.iconContainerSmall}>
                <Text style={styles.actionIcon}>📦</Text>
              </View>
              <Text style={styles.actionLabel}>Kho hàng</Text>
            </View>
            <Text style={commonStyles.chevronIcon}>›</Text>
          </TouchableOpacity>
        )}

        {/* Reward Summary Table */}
        {isAuthenticated && (
          <View style={styles.rewardSection}>
            <View style={styles.rewardHeader}>
              {/* <Text style={styles.rewardTitle}>Tiền thưởng</Text> */}
              {/* <TouchableOpacity
                style={styles.rankingButton}
                onPress={handleRankingPress}
                activeOpacity={0.7}
              >
                <Icon name="trophy" size={16} color={COLORS.warning} />
                <Text style={styles.rankingButtonText}>Bảng xếp hạng</Text>
              </TouchableOpacity> */}
            </View>

            <View style={[commonStyles.tableCard, styles.tableCardWrapper]}>
              {/* Table Header */}
              <View style={commonStyles.tableHeader}>
                <Text style={[commonStyles.tableHeaderText, styles.tableColLeft]}>
                  Mục thưởng
                </Text>
                <Text style={[commonStyles.tableHeaderText, styles.tableColRight]}>
                  Tiền thưởng
                </Text>
              </View>

              {/* Table Rows */}
              <View style={commonStyles.tableRow}>
                <Text style={commonStyles.tableLabel}>Chương trình sell in</Text>
                <Text style={commonStyles.tableValue}>
                  {profileData?.sellInCommission || '0'}
                </Text>
              </View>

              <View style={commonStyles.tableRow}>
                <Text style={commonStyles.tableLabel}>Chương trình sell out</Text>
                <Text style={commonStyles.tableValue}>
                  {profileData?.sellOutCommission || '0'}
                </Text>
              </View>

              <View style={commonStyles.tableRow}>
                <Text style={commonStyles.tableLabel}>Hoa hồng kích hoạt bảo hành</Text>
                <Text style={commonStyles.tableValue}>
                  {profileData?.warrantyCommission || '0'}
                </Text>
              </View>

              {/* Table Footer - Total */}
              <View style={[commonStyles.tableRow, commonStyles.tableFooter]}>
                <Text style={commonStyles.tableFooterLabel}>Tổng cộng</Text>
                <Text style={commonStyles.tableFooterValue}>
                  {profileData?.total || '0'}
                </Text>
              </View>

              {/* Reward Detail Button */}
              <TouchableOpacity
                style={styles.detailButton}
                onPress={handleRewardDetailPress}
                activeOpacity={0.7}
              >
                <Text style={styles.detailButtonText}>Xem chi tiết thưởng</Text>
                <Text style={[commonStyles.chevronIcon, styles.detailChevron]}>›</Text>
              </TouchableOpacity>

              {/* Table Footer - Paid */}
              <View style={[commonStyles.tableRow, commonStyles.tableFooter]}>
                <Text style={commonStyles.tableFooterLabel}>Đã thanh toán</Text>
                <Text style={commonStyles.tableFooterValue}>
                  {profileData?.paid || '0'}
                </Text>
              </View>

              {/* Payment Detail Button */}
              <TouchableOpacity
                style={styles.detailButton}
                onPress={handlePaymentDetailPress}
                activeOpacity={0.7}
              >
                <Text style={styles.detailButtonText}>Xem chi tiết thanh toán</Text>
                <Text style={[commonStyles.chevronIcon, styles.detailChevron]}>›</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Bottom Spacing */}
        <View style={commonStyles.bottomSpacing} />
      </ScrollView>
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

  // Banner Slider
  bannerContainer: {
    marginBottom: SPACING.md,
  },
  bannerItem: {
    width: BANNER_WIDTH,
    height: BANNER_HEIGHT,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  bannerLoadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // User Profile Card
  userCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.screen_lg,
    marginBottom: SPACING.md,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.md,
  },
  userLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    gap: SPACING.md,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  programButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.gray50,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  programButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
    flex: 1,
  },

  // Action Card
  actionCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.screen_lg,
    marginBottom: SPACING.md,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...SHADOWS.md,
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  actionIcon: {
    fontSize: 20,
  },
  actionLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },

  // Reward Section
  rewardSection: {
    marginBottom: SPACING.md,
  },
  rewardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: SPACING.screen_lg,
    marginBottom: SPACING.sm,
  },
  rankingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.warning,
  },
  rankingButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.warning,
  },
  rewardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  tableCardWrapper: {
    marginHorizontal: SPACING.screen_lg,
    ...SHADOWS.md,
  },
  tableColLeft: {
    flex: 1,
  },
  tableColRight: {
    width: 120,
    textAlign: 'right',
  },

  // Detail Button
  detailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.gray50,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray200,
  },
  detailButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  detailChevron: {
    color: COLORS.primary,
  },
});

export default HomeScreen;
