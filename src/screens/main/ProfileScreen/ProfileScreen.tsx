import React, { useState, useEffect } from 'react';
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
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Clipboard from '@react-native-clipboard/clipboard';
import ImagePicker from 'react-native-image-crop-picker';
import { COLORS, SPACING, BORDER_RADIUS } from '../../../config/theme';
import { commonStyles } from '../../../styles/commonStyles';
import CustomHeader from '../../../components/CustomHeader';
import Avatar from '../../../components/Avatar';
import { useAuthStore } from '../../../store/authStore';
import { ProfileStackParamList } from '../../../navigation/MainNavigator';
import { uploadService } from '../../../api/uploadService';
import { profileService } from '../../../api/profileService';
import { Icon } from '../../../components/common';

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


      // Upload to server using react-native-blob-util
      await uploadImageToServer(image.path);
    } catch (error: any) {
      if (error.code !== 'E_PICKER_CANCELLED') {
        Alert.alert('Lỗi', 'Không thể chụp ảnh. Vui lòng thử lại.');
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


      // Upload to server using react-native-blob-util
      await uploadImageToServer(image.path);
    } catch (error: any) {
      if (error.code !== 'E_PICKER_CANCELLED') {
        Alert.alert('Lỗi', 'Không thể chọn ảnh. Vui lòng thử lại.');
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
    }
  };

  const handleCopyCode = () => {
    if (user?.codenpp) {
      Clipboard.setString(user.codenpp);
      Alert.alert('Thành công', 'Đã sao chép mã đơn vị');
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
        <View style={commonStyles.cardWithMarginLarge}>
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

          {/* Parent Unit Code - Prominent Display */}
          {user?.codenpp && (
            <View style={styles.codeContainer}>
              <View style={styles.codeCard}>
                <View style={styles.codeContent}>
                  <Text style={styles.codeLabel}>Mã đơn vị</Text>
                  <Text style={styles.codeValue}>{user.codenpp}</Text>
                </View>
                <TouchableOpacity
                  style={styles.copyButton}
                  onPress={handleCopyCode}
                  activeOpacity={0.7}
                >
                  <Icon name="copy" size={20} color={COLORS.primary} />
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Profile Information Section */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => setShowProfileInfo(!showProfileInfo)}
            activeOpacity={0.7}
          >
            <View style={styles.sectionHeaderLeft}>
              <Icon name="profile-detail" size={20} color={COLORS.primary} />
              <Text style={commonStyles.sectionTitle}>Thông tin hồ sơ</Text>
            </View>
            <Text style={commonStyles.chevronIcon}>{showProfileInfo ? '▼' : '▶'}</Text>
          </TouchableOpacity>

          {showProfileInfo && (
            <View style={commonStyles.cardWithMarginLarge}>
              {/* Personal Information */}
              <View style={commonStyles.infoRow}>
                <View style={commonStyles.infoLabelContainer}>
                  <Icon name="phone" size={14} color={COLORS.textSecondary} />
                  <Text style={commonStyles.infoLabel}>Điện thoại</Text>
                </View>
                <Text style={commonStyles.infoValue}>{user?.phone || 'Chưa cập nhật'}</Text>
              </View>

              <View style={commonStyles.infoRow}>
                <View style={commonStyles.infoLabelContainer}>
                  <Icon name="mail" size={14} color={COLORS.textSecondary} />
                  <Text style={commonStyles.infoLabel}>Email</Text>
                </View>
                <Text style={commonStyles.infoValue}>{user?.email || 'Chưa cập nhật'}</Text>
              </View>

              <View style={commonStyles.infoRow}>
                <View style={commonStyles.infoLabelContainer}>
                  <Icon name="location" size={14} color={COLORS.textSecondary} />
                  <Text style={commonStyles.infoLabel}>Địa chỉ</Text>
                </View>
                <Text style={commonStyles.infoValue}>{user?.address || 'Chưa cập nhật'}</Text>
              </View>

              <View style={commonStyles.infoRow}>
                <View style={commonStyles.infoLabelContainer}>
                  <Icon name="city" size={14} color={COLORS.textSecondary} />
                  <Text style={commonStyles.infoLabel}>Tỉnh/Thành phố</Text>
                </View>
                <Text style={commonStyles.infoValue}>{user?.tinhthanh || 'Chưa cập nhật'}</Text>
              </View>

              <View style={commonStyles.infoRow}>
                <View style={commonStyles.infoLabelContainer}>
                  <Icon name="profile" size={14} color={COLORS.textSecondary} />
                  <Text style={commonStyles.infoLabel}>Mã số thuế/CCCD</Text>
                </View>
                <Text style={commonStyles.infoValue}>{user?.taxcode || 'Chưa cập nhật'}</Text>
              </View>

              {/* Bank Information */}
              <View style={styles.divider} />

              <View style={commonStyles.infoRow}>
                <View style={commonStyles.infoLabelContainer}>
                  <Icon name="bank" size={14} color={COLORS.textSecondary} />
                  <Text style={commonStyles.infoLabel}>Ngân hàng</Text>
                </View>
                <Text style={commonStyles.infoValue}>{user?.nganhang || 'Chưa cập nhật'}</Text>
              </View>

              <View style={commonStyles.infoRow}>
                <View style={commonStyles.infoLabelContainer}>
                  <Icon name="bank-account" size={14} color={COLORS.textSecondary} />
                  <Text style={commonStyles.infoLabel}>Số tài khoản</Text>
                </View>
                <Text style={commonStyles.infoValue}>{user?.sotaikhoan || 'Chưa cập nhật'}</Text>
              </View>

              <View style={commonStyles.infoRow}>
                <View style={commonStyles.infoLabelContainer}>
                  <Icon name="account-name" size={14} color={COLORS.textSecondary} />
                  <Text style={commonStyles.infoLabel}>Tên tài khoản</Text>
                </View>
                <Text style={commonStyles.infoValue}>{user?.tentaikhoan || 'Chưa cập nhật'}</Text>
              </View>

              <TouchableOpacity
                style={commonStyles.buttonPrimary}
                onPress={handleEditProfile}
                activeOpacity={0.7}
              >
                {/* <Icon name="menu" size={16} color={COLORS.white} /> */}
                <Text style={[commonStyles.buttonPrimaryText, styles.editButtonText]}>Chỉnh sửa</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Settings Section */}
        <View style={styles.section}>
          <View style={commonStyles.cardWithMarginLarge}>
            {/* Change Password */}
            <TouchableOpacity
              style={commonStyles.menuItem}
              onPress={handleChangePassword}
              activeOpacity={0.7}
            >
              <View style={commonStyles.menuItemLeft}>
                <View style={commonStyles.iconContainerSmall}>
                  <Icon name="lock" size={20} color={COLORS.primary} />
                </View>
                <Text style={commonStyles.menuItemLabel}>Đổi mật khẩu</Text>
              </View>
              <Text style={commonStyles.chevronIcon}>›</Text>
            </TouchableOpacity>

            {/* Notifications Toggle */}
            <View style={[commonStyles.menuItem, commonStyles.menuItemLast]}>
              <View style={commonStyles.menuItemLeft}>
                <View style={commonStyles.iconContainerSmall}>
                  <Icon name="notification" size={20} color={COLORS.primary} />
                </View>
                <Text style={commonStyles.menuItemLabel}>Thông báo</Text>
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
          <Icon name="logout" size={20} color={COLORS.error} />
          <Text style={styles.logoutButtonText}>Đăng xuất</Text>
        </TouchableOpacity>

        {/* App Version */}
        <Text style={styles.versionText}>Version 1.0.0</Text>

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
  avatarWrapper: {
    position: 'relative',
    marginBottom: SPACING.md,
    alignSelf: 'center',
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
  },
  cameraIcon: {
    fontSize: 18,
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  roleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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
  codeContainer: {
    marginTop: SPACING.lg,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray200,
    width: '100%',
  },
  codeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.primary + '08',
    borderWidth: 2,
    borderColor: COLORS.primary + '30',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    borderStyle: 'dashed',
  },
  codeContent: {
    flex: 1,
  },
  codeLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  codeValue: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
    letterSpacing: 1,
  },
  copyButton: {
    backgroundColor: COLORS.white,
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
  },
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
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: SPACING.sm,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.gray200,
    marginVertical: SPACING.md,
  },
  editButtonText: {
    marginLeft: SPACING.xs,
  },
  chevronIcon: {
    fontSize: 20,
    color: COLORS.gray400,
    fontWeight: '600',
  },
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
    gap: SPACING.sm,
  },
  logoutButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.error,
  },
  versionText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.lg,
  },
});

export default ProfileScreen;
