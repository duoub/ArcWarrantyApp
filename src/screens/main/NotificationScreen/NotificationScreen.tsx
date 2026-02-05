import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../../config/theme';
import CustomHeader from '../../../components/CustomHeader';
import { commonStyles } from '../../../styles/commonStyles';

interface Notification {
  id: string;
  content: string;
  createdate: string;
  isRead: boolean;
}

const NotificationScreen = () => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState<'0' | '1'>('0'); // 0: Chưa đọc, 1: Đã đọc
  const [refreshing, setRefreshing] = useState(false);

  // Mock data for notifications
  const allNotifications: Notification[] = [
    {
      id: '1',
      content: 'Chương trình khuyến mãi đặc biệt dành cho sản phẩm điều hòa ARC 12000BTU. Giảm giá lên đến 20% cho đơn hàng từ hôm nay đến hết tháng.',
      createdate: '15/12/2024 10:30',
      isRead: false,
    },
    {
      id: '2',
      content: 'Thông báo bảo trì hệ thống: Hệ thống sẽ được bảo trì vào 20/12/2024 từ 00:00 đến 02:00. Vui lòng hoàn tất các giao dịch trước thời gian này.',
      createdate: '14/12/2024 16:45',
      isRead: false,
    },
    {
      id: '3',
      content: 'Sản phẩm mới: Máy nước nóng ARC 40L đã có mặt tại hệ thống phân phối. Liên hệ ngay để được tư vấn chi tiết.',
      createdate: '13/12/2024 09:15',
      isRead: false,
    },
    {
      id: '4',
      content: 'Cảm ơn bạn đã kích hoạt bảo hành cho sản phẩm điều hòa ARC. Mã bảo hành của bạn là: BH123456789.',
      createdate: '12/12/2024 14:20',
      isRead: true,
    },
    {
      id: '5',
      content: 'Chính sách bảo hành mới đã được cập nhật. Xem chi tiết tại mục Chính sách bảo hành trong ứng dụng.',
      createdate: '10/12/2024 11:00',
      isRead: true,
    },
    {
      id: '6',
      content: 'Hệ thống điểm bảo hành mới đã được thêm tại khu vực Hà Nội. Kiểm tra danh sách trong menu Hệ thống điểm bảo hành.',
      createdate: '08/12/2024 13:30',
      isRead: true,
    },
  ];

  const filteredNotifications = allNotifications.filter((notif) =>
    activeTab === '0' ? !notif.isRead : notif.isRead
  );

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleRefresh = () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  };

  const handleNotificationPress = (notification: Notification) => {
    // Mark as read and navigate or show details
  };

  const renderNotificationCard = (notification: Notification, index: number) => (
    <TouchableOpacity
      key={notification.id}
      style={styles.notificationCard}
      onPress={() => handleNotificationPress(notification)}
      activeOpacity={0.7}
    >
      <View style={styles.cardContent}>
        <Text style={styles.notificationText}>{notification.content}</Text>
        <Text style={styles.notificationDate}>{notification.createdate}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      {/* Custom Header */}
      <CustomHeader
        title="Thông báo"
        leftIcon={<Text style={commonStyles.backIconMedium}>‹</Text>}
        onLeftPress={handleBackPress}
      />

      {/* Tabs */}
      <View style={commonStyles.tabsContainer}>
        <TouchableOpacity
          style={[commonStyles.tab, activeTab === '0' && commonStyles.tabActive]}
          onPress={() => setActiveTab('0')}
          activeOpacity={0.7}
        >
          <Text style={[commonStyles.tabText, activeTab === '0' && commonStyles.tabTextActive]}>
            Chưa đọc
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[commonStyles.tab, activeTab === '1' && commonStyles.tabActive]}
          onPress={() => setActiveTab('1')}
          activeOpacity={0.7}
        >
          <Text style={[commonStyles.tabText, activeTab === '1' && commonStyles.tabTextActive]}>
            Đã đọc
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {filteredNotifications.length > 0 ? (
          <View style={styles.notificationList}>
            {filteredNotifications.map((notification, index) =>
              renderNotificationCard(notification, index)
            )}
          </View>
        ) : (
          <View style={commonStyles.emptyContainer}>
            <Text style={commonStyles.emptyText}>
              {activeTab === '0' ? 'Không có thông báo chưa đọc' : 'Không có thông báo đã đọc'}
            </Text>
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

  // Notification List
  notificationList: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
  },
  notificationCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
    overflow: 'hidden',
    ...SHADOWS.md,
  },
  cardContent: {
    padding: SPACING.md,
  },
  notificationText: {
    fontSize: 15,
    color: COLORS.textPrimary,
    lineHeight: 22,
    marginBottom: SPACING.sm,
  },
  notificationDate: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
});

export default NotificationScreen;
