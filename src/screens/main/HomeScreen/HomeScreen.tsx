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
import CustomHeader from '../../../components/CustomHeader';
import Avatar from '../../../components/Avatar';
import { HomeStackParamList } from '../../../navigation/MainNavigator';
import { profileService } from '../../../api/profileService';
import { ProfileData } from '../../../types/profile';
import { NotificationService } from '../../../utils/notificationService';
import { commonStyles } from '../../../styles/commonStyles';

type HomeScreenNavigationProp = StackNavigationProp<HomeStackParamList, 'Home'>;

const { width } = Dimensions.get('window');
const BANNER_WIDTH = width - SPACING.lg * 2;
const BANNER_HEIGHT = BANNER_WIDTH * 0.5;

// Default banners if API doesn't return any
const DEFAULT_BANNERS = [
  require('../../../assets/images/banner.jpg'),
  require('../../../assets/images/banner.jpg'),
  require('../../../assets/images/banner.jpg'),
];

const HomeScreen = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { user, isAuthenticated } = useAuthStore();

  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const bannerListRef = useRef<FlatList>(null);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const banners = DEFAULT_BANNERS;

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

  // Auto-slide banners
  useEffect(() => {
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

  const handleBannerPress = (index: number) => {
    Alert.alert('Banner', `Clicked banner ${index + 1}`);
  };

  const handleSalesProgramPress = () => {
    // Navigate to SalesProgram screen within HomeStack
    navigation.navigate('SalesProgram');
  };

  const handleInventoryPress = () => {
    navigation.navigate('Inventory');
  };

  const renderBanner = ({ item, index }: { item: any; index: number }) => (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => handleBannerPress(index)}
      style={styles.bannerItem}
    >
      <Image
        source={item}
        style={styles.bannerImage}
        resizeMode="cover"
      />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      {/* Custom Header */}
      <CustomHeader title="Trang chủ" />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Banner Slider */}
        <View style={styles.bannerContainer}>
          <FlatList
            ref={bannerListRef}
            data={banners}
            renderItem={renderBanner}
            keyExtractor={(_, index) => `banner-${index}`}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(event) => {
              const index = Math.round(
                event.nativeEvent.contentOffset.x / BANNER_WIDTH
              );
              setCurrentBannerIndex(index);
            }}
          />

          {/* Pagination Dots */}
          <View style={commonStyles.paginationContainer}>
            {banners.map((_, index) => (
              <View
                key={`dot-${index}`}
                style={[
                  commonStyles.paginationDot,
                  index === currentBannerIndex && commonStyles.paginationDotActive,
                ]}
              />
            ))}
          </View>
        </View>

        {/* User Profile Section */}
        {isAuthenticated && user && (
          <View style={styles.userCard}>
            <View style={styles.userLeft}>
              <Avatar uri={user.avatar} size={48} />
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{user.name}</Text>
                <Text style={styles.userEmail}>{user.email}</Text>
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
            <Text style={commonStyles.sectionTitleWithMargin}>Tiền thưởng</Text>

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
                <Text style={commonStyles.tableLabel}>Chương trình sell in/out</Text>
                <Text style={commonStyles.tableValue}>
                  {profileData?.salesProgram || '0'}
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

              {/* Table Footer - Paid */}
              <View style={[commonStyles.tableRow, commonStyles.tableFooter]}>
                <Text style={commonStyles.tableFooterLabel}>Đã thanh toán</Text>
                <Text style={commonStyles.tableFooterValue}>
                  {profileData?.paid || '0'}
                </Text>
              </View>
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
    marginVertical: SPACING.md,
  },
  bannerItem: {
    width: BANNER_WIDTH,
    height: BANNER_HEIGHT,
    marginHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },

  // User Profile Card
  userCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.lg,
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
    marginHorizontal: SPACING.lg,
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
  tableCardWrapper: {
    marginHorizontal: SPACING.lg,
    ...SHADOWS.md,
  },
  tableColLeft: {
    flex: 1,
  },
  tableColRight: {
    width: 120,
    textAlign: 'right',
  },
});

export default HomeScreen;
