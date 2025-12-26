import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  Switch,
  Platform,
  PermissionsAndroid,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import ImagePicker from 'react-native-image-crop-picker';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../../config/theme';
import CustomHeader from '../../../components/CustomHeader';
import Avatar from '../../../components/Avatar';
import { useAuthStore } from '../../../store/authStore';
import { ProfileStackParamList } from '../../../navigation/MainNavigator';
import { uploadService } from '../../../api/uploadService';
import { profileService } from '../../../api/profileService';
import { authService } from '../../../api/authService';
import { API_CONFIG } from '../../../config/constants';

type ProfileScreenNavigationProp = StackNavigationProp<ProfileStackParamList, 'Profile'>;

const ProfileScreen = () => {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const { user, logout, updateAvatar, setUser } = useAuthStore();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [showProfileInfo, setShowProfileInfo] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [avatarKey, setAvatarKey] = useState(0);

  // Refresh user profile when screen is focused
  // useFocusEffect(
  //   useCallback(() => {
  //     const refreshUserProfile = async () => {
  //       if (user?.id) {
  //         try {
  //           console.log('🔄 Refreshing user profile...');
  //           const updatedProfile = await authService.getProfile(user.id, API_CONFIG.STORE_ID);

  //           // Update user in store with fresh data
  //           setUser({
  //             ...user,
  //             ...updatedProfile,
  //           });

  //           console.log('✅ Profile refreshed successfully');
  //         } catch (error) {
  //           console.error('❌ Failed to refresh profile:', error);
  //         }
  //       }
  //     };

  //     refreshUserProfile();
  //   }, [user?.id])
  // );

  // Log when user avatar changes to debug re-render
  useEffect(() => {
    console.log('🔄 ProfileScreen - user.avatar changed:', user?.avatar);
    // Force Avatar component to re-render by changing key
    setAvatarKey(prev => prev + 1);
  }, [user?.avatar]);

  const uploadImageToServer = async (imagePath: string) => {
    try {
      setIsUploading(true);

      // Upload image to server
      const response = await uploadService.uploadAvatar(imagePath);

      // Update local avatar with the server response URL
      const avatarUrl = response.data || imagePath;
      updateAvatar(avatarUrl);

      Alert.alert('Thành công', 'Ảnh đại diện đã được cập nhật!');
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Không thể upload ảnh. Vui lòng thử lại.');
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleChangeAvatar = () => {
    if (isUploading) {
      Alert.alert('Thông báo', 'Đang upload ảnh, vui lòng đợi...');
      return;
    }

    Alert.alert(
      'Đổi ảnh đại diện',
      'Chọn nguồn ảnh',
      [
        {
          text: 'Chụp ảnh',
          onPress: () => handleTakePhoto(),
        },
        {
          text: 'Thư viện',
          onPress: () => handlePickFromLibrary(),
        },
        {
          text: 'Hủy',
          style: 'cancel',
        },
      ],
      { cancelable: true }
    );
  };

  const handleTakePhoto = async () => {
    try {
      // Request camera permission for Android
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Quyền truy cập Camera',
            message: 'Ứng dụng cần quyền truy cập camera để chụp ảnh.',
            buttonNeutral: 'Hỏi sau',
            buttonNegative: 'Từ chối',
            buttonPositive: 'Đồng ý',
          }
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert('Lỗi', 'Bạn cần cấp quyền truy cập camera để tiếp tục.');
          return;
        }
      }

      const image = await ImagePicker.openCamera({
        width: 400,
        height: 400,
        cropping: true,
        cropperCircleOverlay: true,
        enableRotationGesture: true,
        freeStyleCropEnabled: false,
        mediaType: 'photo',
        compressImageQuality: 0.8,
      });

      console.log('📸 Image selected:', {
        path: image.path,
        size: image.size,
        width: image.width,
        height: image.height,
        mime: image.mime,
      });

      // Upload to server using react-native-blob-util
      await uploadImageToServer(image.path);
    } catch (error: any) {
      if (error.code !== 'E_PICKER_CANCELLED') {
        Alert.alert('Lỗi', 'Không thể chụp ảnh. Vui lòng thử lại.');
        console.error('Camera error:', error);
      }
    }
  };

  const handlePickFromLibrary = async () => {
    try {
      const image = await ImagePicker.openPicker({
        width: 400,
        height: 400,
        cropping: true,
        cropperCircleOverlay: true,
        enableRotationGesture: true,
        freeStyleCropEnabled: false,
        mediaType: 'photo',
        compressImageQuality: 0.8,
      });

      console.log('📸 Image selected:', {
        path: image.path,
        size: image.size,
        width: image.width,
        height: image.height,
        mime: image.mime,
      });

      // Upload to server using react-native-blob-util
      await uploadImageToServer(image.path);
    } catch (error: any) {
      if (error.code !== 'E_PICKER_CANCELLED') {
        Alert.alert('Lỗi', 'Không thể chọn ảnh. Vui lòng thử lại.');
        console.error('Image picker error:', error);
      }
    }
  };

  const handleEditProfile = () => {
    navigation.navigate('EditProfile');
  };

  const handleChangePassword = () => {
    navigation.navigate('ChangePassword');
  };

  const handleToggleNotification = async (value: boolean) => {
    try {
      setNotificationsEnabled(value);
      await profileService.editNotification(value);
      Alert.alert('Thành công', `Đã ${value ? 'bật' : 'tắt'} thông báo`);
    } catch (error: any) {
      // Revert on error
      setNotificationsEnabled(!value);
      Alert.alert('Lỗi', error.message || 'Không thể cập nhật cài đặt thông báo');
      console.error('Toggle notification error:', error);
    }
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
            <Avatar key={avatarKey} uri={user?.avatar} size={100} />
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
                {user?.role}
              </Text>
            </View>
          </View>
        </View>

        {/* Profile Information Section */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => setShowProfileInfo(!showProfileInfo)}
            activeOpacity={0.7}
          >
            <View style={styles.sectionHeaderLeft}>
              <Text style={styles.sectionIcon}>👤</Text>
              <Text style={styles.sectionTitle}>Thông tin hồ sơ</Text>
            </View>
            <Text style={styles.chevronIcon}>{showProfileInfo ? '▼' : '▶'}</Text>
          </TouchableOpacity>

          {showProfileInfo && (
            <View style={styles.infoCard}>
              {/* Personal Information */}
              <View style={styles.infoRow}>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>📞 Điện thoại</Text>
                  <Text style={styles.infoValue}>{user?.phone || 'Chưa cập nhật'}</Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>📧 Email</Text>
                  <Text style={styles.infoValue}>{user?.email || 'Chưa cập nhật'}</Text>
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
                  <Text style={styles.infoValue}>{user?.tinhthanh || 'Chưa cập nhật'}</Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>🏷️ Mã số thuế/CCCD</Text>
                  <Text style={styles.infoValue}>{user?.taxcode || 'Chưa cập nhật'}</Text>
                </View>
              </View>

              {/* Bank Information */}
              <View style={styles.divider} />

              <View style={styles.infoRow}>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>🏦 Ngân hàng</Text>
                  <Text style={styles.infoValue}>{user?.nganhang || 'Chưa cập nhật'}</Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>💳 Số tài khoản</Text>
                  <Text style={styles.infoValue}>{user?.sotaikhoan || 'Chưa cập nhật'}</Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>👤 Tên tài khoản</Text>
                  <Text style={styles.infoValue}>{user?.tentaikhoan || 'Chưa cập nhật'}</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.editSectionButton}
                onPress={handleEditProfile}
                activeOpacity={0.7}
              >
                <Text style={styles.editSectionButtonText}>✏️ Chỉnh sửa</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Settings Section */}
        <View style={styles.section}>
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
                onValueChange={handleToggleNotification}
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
  divider: {
    height: 1,
    backgroundColor: COLORS.gray200,
    marginVertical: SPACING.md,
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

  // Settings Section Title
  settingsTitleContainer: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.sm,
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
