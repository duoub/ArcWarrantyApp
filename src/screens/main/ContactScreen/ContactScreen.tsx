import React from 'react';
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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../../config/theme';
import CustomHeader from '../../../components/CustomHeader';
import { Icon } from '../../../components/common';

interface ContactInfo {
  icon: 'location' | 'phone' | 'mobile' | 'website';
  label: string;
  value: string;
  link?: string;
  type?: 'phone' | 'email' | 'website' | 'address';
}

const ContactScreen = () => {
  const navigation = useNavigation();

  const contactInfos: ContactInfo[] = [
    {
      icon: 'location',
      label: 'Địa chỉ:',
      value: 'Khu Công Nghiệp Hapro, Lệ Chi, Gia Lâm, TP Hà Nội',
      type: 'address',
    },
    {
      icon: 'phone',
      label: 'Điện thoại:',
      value: '1800 646778',
      link: 'tel:1800646778',
      type: 'phone',
    },
    {
      icon: 'mobile',
      label: 'Hotline:',
      value: '03592.33333',
      link: 'tel:0359233333',
      type: 'phone',
    },
    {
      icon: 'website',
      label: 'Website:',
      value: 'https://akito.vn/',
      link: 'https://akito.vn/',
      type: 'website',
    },
  ];

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleContactPress = (item: ContactInfo) => {
    if (item.link) {
      Linking.canOpenURL(item.link)
        .then((supported) => {
          if (supported) {
            Linking.openURL(item.link!);
          } else {
            Alert.alert('Lỗi', `Không thể mở: ${item.link}`);
          }
        })
        .catch((err) => console.error('Error opening URL:', err));
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
            AKITO APP là ứng dụng quản lý bảo hành và chăm sóc khách hàng của AKITO.
          </Text>
        </View>

        {/* Contact Information Card */}
        <View style={styles.contactCard}>
          {contactInfos.map((item, index) => renderContactItem(item, index))}
        </View>

        {/* Additional Info */}
        <View style={styles.additionalInfoContainer}>
          <Text style={styles.additionalInfoTitle}>Về AKITO</Text>
          <Text style={styles.additionalInfoText}>
            AKITO là thương hiệu điện máy gia dụng uy tín hàng đầu Việt Nam,
            chuyên cung cấp các sản phẩm điều hòa, máy nước nóng, quạt và các
            thiết bị điện gia dụng chất lượng cao.
          </Text>
          <Text style={styles.additionalInfoText}>
            Với phương châm "Chất lượng - Uy tín - Bền vững", AKITO cam kết
            mang đến cho khách hàng những sản phẩm tốt nhất với dịch vụ chăm
            sóc khách hàng tận tâm.
          </Text>
        </View>

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

  // Header Image
  headerImageContainer: {
    backgroundColor: COLORS.white,
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.lg,
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
    paddingHorizontal: SPACING.lg,
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
    marginHorizontal: SPACING.lg,
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

  // Additional Info
  additionalInfoContainer: {
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.md,
  },
  additionalInfoTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  additionalInfoText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: SPACING.sm,
  },

  bottomSpacing: {
    height: SPACING.xl,
  },
});

export default ContactScreen;
