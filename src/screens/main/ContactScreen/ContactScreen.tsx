import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Image,
  Linking,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../../config/theme';
import CustomHeader from '../../../components/CustomHeader';
import { Icon } from '../../../components/common';
import { appInfoService } from '../../../api/appInfoService';
import { AppInfo } from '../../../types/appInfo';
import { openMapDirections } from '../../../utils/mapNavigation';

interface ContactInfo {
  icon: 'location' | 'phone' | 'mobile' | 'website';
  label: string;
  value: string;
  link?: string;
  type?: 'phone' | 'email' | 'website' | 'address';
}

const ContactScreen = () => {
  const navigation = useNavigation();
  const [appInfo, setAppInfo] = useState<AppInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAppInfo();
  }, []);

  const fetchAppInfo = async () => {
    try {
      setIsLoading(true);
      const response = await appInfoService.getInfoApp();
      if (response.status && response.info) {
        setAppInfo(response.info);
      }
    } catch (error) {
      // Keep default values on error
    } finally {
      setIsLoading(false);
    }
  };

  const formatPhoneLink = (phone: string): string => {
    return 'tel:' + phone.replace(/\s/g, '');
  };

  const contactInfos: ContactInfo[] = appInfo
    ? [
        {
          icon: 'location',
          label: 'Địa chỉ:',
          value: appInfo.address,
          link: 'map',
          type: 'address',
        },
        {
          icon: 'phone',
          label: 'Điện thoại:',
          value: appInfo.phone,
          link: formatPhoneLink(appInfo.phone),
          type: 'phone',
        },
        {
          icon: 'mobile',
          label: 'Hotline:',
          value: appInfo.hotline,
          link: formatPhoneLink(appInfo.hotline),
          type: 'phone',
        },
        {
          icon: 'website',
          label: 'Website:',
          value: appInfo.website,
          link: appInfo.website,
          type: 'website',
        },
      ]
    : [];

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleContactPress = (item: ContactInfo) => {
    if (item.type === 'address' && appInfo?.address) {
      openMapDirections(appInfo.address, 'ARC');
      return;
    }

    if (item.type === 'phone' && item.link) {
      Linking.openURL(item.link).catch(() => {
        Alert.alert('Lỗi', 'Không thể thực hiện cuộc gọi');
      });
      return;
    }

    if (item.link) {
      Linking.canOpenURL(item.link)
        .then((supported) => {
          if (supported) {
            Linking.openURL(item.link!);
          } else {
            Alert.alert('Lỗi', `Không thể mở: ${item.link}`);
          }
        })
        .catch(() => { });
    }
  };

  const renderContactItem = (item: ContactInfo, index: number) => {
    const isLast = index === contactInfos.length - 1;

    return (
      <TouchableOpacity
        key={index}
        style={[styles.contactItem, isLast && styles.contactItemLast]}
        onPress={() => handleContactPress(item)}
        activeOpacity={item.link ? 0.7 : 1}
        disabled={!item.link}
      >
        <View style={styles.iconContainer}>
          <Icon name={item.icon} size={24} color={COLORS.primary} />
        </View>
        <View style={styles.contactTextContainer}>
          <Text style={styles.contactLabel}>{item.label}</Text>
          <Text
            style={[
              styles.contactValue,
              item.link && styles.contactValueLink,
            ]}
            numberOfLines={item.type === 'address' ? 2 : 1}
          >
            {item.value}
          </Text>
        </View>
        {item.link && (
          <Text style={styles.chevronIcon}>›</Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      {/* Custom Header */}
      <CustomHeader
        title="Liên hệ"
        leftIcon={<Icon name="back" size={24} color={COLORS.white} />}
        onLeftPress={handleBackPress}
      />

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Đang tải thông tin...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Image */}
          <View style={styles.headerImageContainer}>
            <Image
              source={require('../../../assets/images/logo.png')}
              style={styles.headerImage}
              resizeMode="contain"
            />
          </View>

          {/* Description */}
          <View style={styles.descriptionContainer}>
            <Text style={styles.descriptionText}>
              {appInfo?.titleApp || 'ARC APP là ứng dụng quản lý bảo hành và chăm sóc khách hàng của ARC.'}
            </Text>
          </View>

          {/* Contact Information Card */}
          <View style={styles.contactCard}>
            {contactInfos.map((item, index) => renderContactItem(item, index))}
          </View>

          {/* Bottom Spacing */}
          <View style={styles.bottomSpacing} />
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  scrollView: {
    flex: 1,
  },

  // Header Image
  headerImageContainer: {
    backgroundColor: COLORS.white,
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.screen_lg,
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  headerImage: {
    width: 200,
    height: 80,
  },

  // Description
  descriptionContainer: {
    backgroundColor: COLORS.white,
    marginTop: SPACING.md,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.screen_lg,
    ...SHADOWS.sm,
  },
  descriptionText: {
    fontSize: 15,
    color: COLORS.textPrimary,
    lineHeight: 22,
    textAlign: 'center',
    fontWeight: '500',
  },

  // Contact Card
  contactCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.screen_lg,
    marginTop: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.md,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  contactItemLast: {
    borderBottomWidth: 0,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.gray50,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  contactTextContainer: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 4,
    fontWeight: '600',
  },
  contactValue: {
    fontSize: 15,
    color: COLORS.textPrimary,
    lineHeight: 20,
  },
  contactValueLink: {
    color: COLORS.primary,
    fontWeight: '500',
  },
  chevronIcon: {
    fontSize: 28,
    color: COLORS.gray400,
    fontWeight: '300',
    marginLeft: SPACING.sm,
  },

  bottomSpacing: {
    height: SPACING.xl,
  },
});

export default ContactScreen;
