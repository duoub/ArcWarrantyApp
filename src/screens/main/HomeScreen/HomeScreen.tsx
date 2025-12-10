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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../../config/theme';
import { useAuthStore } from '../../../store/authStore';
import CustomHeader from '../../../components/CustomHeader';
import { HomeStackParamList } from '../../../navigation/MainNavigator';

type HomeScreenNavigationProp = StackNavigationProp<HomeStackParamList, 'Home'>;

const { width } = Dimensions.get('window');
const BANNER_WIDTH = width - SPACING.lg * 2;
const BANNER_HEIGHT = BANNER_WIDTH * 0.5;

// Mock data for banners - replace with API call later
const MOCK_BANNERS = [
  'https://via.placeholder.com/800x400/E31E24/FFFFFF?text=AKITO+Banner+1',
  'https://via.placeholder.com/800x400/2D2D2D/FFFFFF?text=AKITO+Banner+2',
  'https://via.placeholder.com/800x400/4FC3F7/FFFFFF?text=AKITO+Banner+3',
];

// Mock reward data - replace with API call later
const MOCK_REWARDS = {
  salesProgram: 5000000,
  warrantyCommission: 2500000,
  total: 7500000,
  paid: 3000000,
};

const HomeScreen = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { user, isAuthenticated } = useAuthStore();

  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const bannerListRef = useRef<FlatList>(null);

  // Auto-slide banners
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBannerIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % MOCK_BANNERS.length;
        bannerListRef.current?.scrollToIndex({
          index: nextIndex,
          animated: true,
        });
        return nextIndex;
      });
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const handleBannerPress = (index: number) => {
    Alert.alert('Banner', `Clicked banner ${index + 1}`);
  };

  const handleSalesProgramPress = () => {
    // Navigate to SalesProgram screen within HomeStack
    navigation.navigate('SalesProgram');
  };

  const handleInventoryPress = () => {
    Alert.alert('Kho hàng', 'Chức năng đang phát triển');
  };

  const renderBanner = ({ item, index }: { item: string; index: number }) => (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => handleBannerPress(index)}
      style={styles.bannerItem}
    >
      <Image
        source={{ uri: item }}
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
        {/* <FlatList
          ref={bannerListRef}
          data={MOCK_BANNERS}
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
        /> */}

        {/* Pagination Dots */}
        {/* <View style={styles.paginationContainer}>
          {MOCK_BANNERS.map((_, index) => (
            <View
              key={`dot-${index}`}
              style={[
                styles.paginationDot,
                index === currentBannerIndex && styles.paginationDotActive,
              ]}
            />
          ))}
        </View> */}
      </View>

      {/* User Profile Section */}
      {isAuthenticated && user && (
        <View style={styles.userCard}>
          <View style={styles.userLeft}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarIcon}>👤</Text>
            </View>
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
            <Text style={styles.chevronIcon}>›</Text>
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
            <View style={styles.actionIconContainer}>
              <Text style={styles.actionIcon}>📦</Text>
            </View>
            <Text style={styles.actionLabel}>Kho hàng</Text>
          </View>
          <Text style={styles.chevronIcon}>›</Text>
        </TouchableOpacity>
      )}

      {/* Reward Summary Table */}
      {isAuthenticated && (
        <View style={styles.rewardSection}>
          <Text style={styles.sectionTitle}>Tiền thưởng</Text>

          <View style={styles.tableCard}>
            {/* Table Header */}
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, styles.tableColLeft]}>
                Mục thưởng
              </Text>
              <Text style={[styles.tableHeaderText, styles.tableColRight]}>
                Tiền thưởng
              </Text>
            </View>

            {/* Table Rows */}
            <View style={styles.tableRow}>
              <Text style={styles.tableLabel}>Chương trình sell in/out</Text>
              <Text style={styles.tableValue}>
                {formatCurrency(MOCK_REWARDS.salesProgram)}
              </Text>
            </View>

            <View style={styles.tableRow}>
              <Text style={styles.tableLabel}>Hoa hồng kích hoạt bảo hành</Text>
              <Text style={styles.tableValue}>
                {formatCurrency(MOCK_REWARDS.warrantyCommission)}
              </Text>
            </View>

            {/* Table Footer - Total */}
            <View style={[styles.tableRow, styles.tableFooter]}>
              <Text style={styles.tableFooterLabel}>Tổng cộng</Text>
              <Text style={styles.tableFooterValue}>
                {formatCurrency(MOCK_REWARDS.total)}
              </Text>
            </View>

            {/* Table Footer - Paid */}
            <View style={[styles.tableRow, styles.tableFooter]}>
              <Text style={styles.tableFooterLabel}>Đã thanh toán</Text>
              <Text style={styles.tableFooterValue}>
                {formatCurrency(MOCK_REWARDS.paid)}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Bottom Spacing */}
      <View style={styles.bottomSpacing} />
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
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.gray300,
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: COLORS.primary,
    width: 24,
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
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.gray100,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  avatarIcon: {
    fontSize: 24,
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
  chevronIcon: {
    fontSize: 24,
    color: COLORS.gray400,
    fontWeight: '300',
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
  actionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.gray50,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
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
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  tableCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.md,
  },

  // Table Header
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  tableHeaderText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.white,
  },
  tableColLeft: {
    flex: 1,
  },
  tableColRight: {
    width: 120,
    textAlign: 'right',
  },

  // Table Row
  tableRow: {
    flexDirection: 'row',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  tableLabel: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  tableValue: {
    width: 120,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    textAlign: 'right',
  },

  // Table Footer
  tableFooter: {
    backgroundColor: COLORS.gray50,
    borderBottomWidth: 0,
  },
  tableFooterLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  tableFooterValue: {
    width: 120,
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.primary,
    textAlign: 'right',
  },

  bottomSpacing: {
    height: SPACING.xl,
  },
});

export default HomeScreen;
