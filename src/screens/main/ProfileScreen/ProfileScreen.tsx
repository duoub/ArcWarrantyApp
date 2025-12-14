import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  Switch,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../../config/theme';
import CustomHeader from '../../../components/CustomHeader';
import Avatar from '../../../components/Avatar';
import { useAuthStore } from '../../../store/authStore';
import { ProfileStackParamList } from '../../../navigation/MainNavigator';

type ProfileScreenNavigationProp = StackNavigationProp<ProfileStackParamList, 'Profile'>;

const ProfileScreen = () => {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const { user, logout } = useAuthStore();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [showPersonalInfo, setShowPersonalInfo] = useState(true);
  const [showBankInfo, setShowBankInfo] = useState(false);

  const handleChangeAvatar = () => {
    Alert.alert('Đổi ảnh đại diện', 'Chức năng đang phát triển');
  };

  const handleEditPersonalInfo = () => {
    navigation.navigate('EditProfile', { section: 'personal' });
  };

  const handleEditBankInfo = () => {
    navigation.navigate('EditProfile', { section: 'bank' });
  };

  const handleChangePassword = () => {
    Alert.alert('Đổi mật khẩu', 'Chức năng đang phát triển');
  };

  const handleLogout = () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất?',
      [
        {
          text: 'Hủy',
          style: 'cancel',
        },
        {
          text: 'Đăng xuất',
          style: 'destructive',
          onPress: () => {
            logout();
            // Navigation to LoginScreen happens automatically via RootNavigator
            // when isAuthenticated changes to false
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      <CustomHeader title="Tài khoản" />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* User Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarWrapper}>
            <Avatar uri={user?.avatar} size={100} />
            <TouchableOpacity
              style={styles.changeAvatarButton}
              onPress={handleChangeAvatar}
              activeOpacity={0.8}
            >
              <Text style={styles.cameraIcon}>📷</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.userName}>{user?.name || 'Người dùng'}</Text>

          <View style={styles.roleContainer}>
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>
                {user?.role === 'admin' && 'Quản trị viên'}
                {user?.role === 'technician' && 'Kỹ thuật viên'}
                {user?.role === 'dealer' && 'Đại lý'}
                {user?.role === 'customer' && 'Khách hàng'}
              </Text>
            </View>
          </View>
        </View>

        {/* Personal Information Section */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => setShowPersonalInfo(!showPersonalInfo)}
            activeOpacity={0.7}
          >
            <View style={styles.sectionHeaderLeft}>
              <Text style={styles.sectionIcon}>👤</Text>
              <Text style={styles.sectionTitle}>Thông tin cá nhân</Text>
            </View>
            <Text style={styles.chevronIcon}>{showPersonalInfo ? '▼' : '▶'}</Text>
          </TouchableOpacity>

          {showPersonalInfo && (
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>📧 Email</Text>
                  <Text style={styles.infoValue}>{user?.email || 'Chưa cập nhật'}</Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>📱 Điện thoại</Text>
                  <Text style={styles.infoValue}>{user?.phone || 'Chưa cập nhật'}</Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>🆔 CCCD/CMND</Text>
                  <Text style={styles.infoValue}>{user?.cccd || 'Chưa cập nhật'}</Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>📍 Địa chỉ</Text>
                  <Text style={styles.infoValue}>{user?.address || 'Chưa cập nhật'}</Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>🏙️ Tỉnh/Thành phố</Text>
                  <Text style={styles.infoValue}>{user?.city || 'Chưa cập nhật'}</Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>🏷️ Mã số thuế</Text>
                  <Text style={styles.infoValue}>{user?.taxCode || 'Chưa cập nhật'}</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.editSectionButton}
                onPress={handleEditPersonalInfo}
                activeOpacity={0.7}
              >
                <Text style={styles.editSectionButtonText}>✏️ Chỉnh sửa</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Bank Information Section */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => setShowBankInfo(!showBankInfo)}
            activeOpacity={0.7}
          >
            <View style={styles.sectionHeaderLeft}>
              <Text style={styles.sectionIcon}>🏦</Text>
              <Text style={styles.sectionTitle}>Thông tin ngân hàng</Text>
            </View>
            <Text style={styles.chevronIcon}>{showBankInfo ? '▼' : '▶'}</Text>
          </TouchableOpacity>

          {showBankInfo && (
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>🏦 Ngân hàng</Text>
                  <Text style={styles.infoValue}>{user?.bankName || 'Chưa cập nhật'}</Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>💳 Số tài khoản</Text>
                  <Text style={styles.infoValue}>{user?.bankAccountNumber || 'Chưa cập nhật'}</Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>👤 Tên tài khoản</Text>
                  <Text style={styles.infoValue}>{user?.bankAccountName || 'Chưa cập nhật'}</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.editSectionButton}
                onPress={handleEditBankInfo}
                activeOpacity={0.7}
              >
                <Text style={styles.editSectionButtonText}>✏️ Chỉnh sửa</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cài đặt</Text>

          <View style={styles.settingsCard}>
            {/* Change Password */}
            <TouchableOpacity
              style={styles.settingItem}
              onPress={handleChangePassword}
              activeOpacity={0.7}
            >
              <View style={styles.settingLeft}>
                <View style={styles.settingIconContainer}>
                  <Text style={styles.settingIcon}>🔐</Text>
                </View>
                <Text style={styles.settingLabel}>Đổi mật khẩu</Text>
              </View>
              <Text style={styles.chevronIcon}>›</Text>
            </TouchableOpacity>

            {/* Notifications Toggle */}
            <View style={[styles.settingItem, styles.settingItemLast]}>
              <View style={styles.settingLeft}>
                <View style={styles.settingIconContainer}>
                  <Text style={styles.settingIcon}>🔔</Text>
                </View>
                <Text style={styles.settingLabel}>Thông báo</Text>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: COLORS.gray300, true: COLORS.primary }}
                thumbColor={COLORS.white}
              />
            </View>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Text style={styles.logoutIcon}>🚪</Text>
          <Text style={styles.logoutButtonText}>Đăng xuất</Text>
        </TouchableOpacity>

        {/* App Version */}
        <Text style={styles.versionText}>Version 1.0.0</Text>

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

  // Profile Card
  profileCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    alignItems: 'center',
    ...SHADOWS.md,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: SPACING.md,
  },
  changeAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: COLORS.white,
    ...SHADOWS.md,
  },
  cameraIcon: {
    fontSize: 18,
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  roleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roleBadge: {
    backgroundColor: COLORS.primary + '15',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  roleText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
  },

  // Section
  section: {
    marginTop: SPACING.md,
  },
  sectionHeader: {
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.lg,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...SHADOWS.sm,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sectionIcon: {
    fontSize: 22,
    marginRight: SPACING.sm,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },

  // Info Card
  infoCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.xs,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.sm,
  },
  infoRow: {
    marginBottom: SPACING.md,
  },
  infoItem: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 15,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  editSectionButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  editSectionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
  },

  // Settings Card
  settingsCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.md,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  settingItemLast: {
    borderBottomWidth: 0,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.gray50,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  settingIcon: {
    fontSize: 20,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  chevronIcon: {
    fontSize: 20,
    color: COLORS.gray400,
    fontWeight: '600',
  },

  // Logout Button
  logoutButton: {
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.error,
    ...SHADOWS.sm,
  },
  logoutIcon: {
    fontSize: 20,
    marginRight: SPACING.sm,
  },
  logoutButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.error,
  },

  // Version
  versionText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.lg,
  },

  bottomSpacing: {
    height: SPACING.xl,
  },
});

export default ProfileScreen;
