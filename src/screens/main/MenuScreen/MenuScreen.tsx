import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../../config/theme';
import CustomHeader from '../../../components/CustomHeader';
import { MenuStackParamList, MainTabParamList } from '../../../navigation/MainNavigator';
import { Icon, IconName } from '../../../components/common';

type MenuScreenNavigationProp = CompositeNavigationProp<
  StackNavigationProp<MenuStackParamList, 'Menu'>,
  BottomTabNavigationProp<MainTabParamList>
>;

interface MenuItem {
  icon: IconName;
  label: string;
  onPress: () => void;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

const MenuScreen = () => {
  const navigation = useNavigation<MenuScreenNavigationProp>();

  // Menu sections with items
  const menuSections: MenuSection[] = [
    {
      title: 'Bán hàng',
      items: [
        {
          icon: 'product-info',
          label: 'Thông tin sản phẩm',
          onPress: () => navigation.navigate('Product'),
        },
        {
          icon: 'sales-policy',
          label: 'Chính sách bán hàng',
          onPress: () => Alert.alert('Chính sách bán hàng', 'Chức năng đang phát triển'),
        },
        {
          icon: 'distribution',
          label: 'Hệ thống phân phối',
          onPress: () => navigation.navigate('DistributionSystem'),
        },
      ],
    },
    {
      title: 'Bảo hành điện tử',
      items: [
        {
          icon: 'warranty-activation',
          label: 'Kích hoạt bảo hành',
          onPress: () => navigation.navigate('WarrantyActivation'),
        },
        {
          icon: 'warranty-lookup',
          label: 'Tra cứu bảo hành',
          onPress: () => navigation.navigate('WarrantyLookup'),
        },
        {
          icon: 'warranty-report',
          label: 'Báo ca bảo hành',
          onPress: () => navigation.navigate('WarrantyReport'),
        },
        {
          icon: 'product-lookup',
          label: 'Tra cứu sản phẩm chính hãng',
          onPress: () => navigation.navigate('ProductLookup'),
        },
        {
          icon: 'warranty-policy',
          label: 'Chính sách bảo hành',
          onPress: () => Alert.alert('Chính sách bảo hành', 'Chức năng đang phát triển'),
        },
        {
          icon: 'warranty-station',
          label: 'Hệ thống điểm bảo hành',
          onPress: () => navigation.navigate('WarrantyStationList'),
        },
      ],
    },
    {
      title: 'Khác',
      items: [
        {
          icon: 'notification',
          label: 'Thông báo',
          onPress: () => navigation.navigate('Notification'),
        },
        {
          icon: 'news',
          label: 'Tin tức',
          onPress: () => navigation.navigate('News'),
        },
        {
          icon: 'contact',
          label: 'Liên hệ',
          onPress: () => navigation.navigate('Contact'),
        },
      ],
    },
  ];

  const renderMenuItem = (item: MenuItem, isLast: boolean) => (
    <TouchableOpacity
      key={item.label}
      style={[styles.menuItem, isLast && styles.menuItemLast]}
      onPress={item.onPress}
      activeOpacity={0.7}
    >
      <View style={styles.menuItemLeft}>
        <View style={styles.iconContainer}>
          <Icon name={item.icon} size={22} color={COLORS.primary} />
        </View>
        <Text style={styles.menuItemLabel}>{item.label}</Text>
      </View>
      <Text style={styles.chevronIcon}>›</Text>
    </TouchableOpacity>
  );

  const renderSection = (section: MenuSection, index: number) => (
    <View key={section.title} style={styles.section}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
      <View style={styles.sectionCard}>
        {section.items.map((item, itemIndex) =>
          renderMenuItem(item, itemIndex === section.items.length - 1)
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      <CustomHeader title="Menu" />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {menuSections.map((section, index) => renderSection(section, index))}

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

  // Section
  section: {
    marginTop: SPACING.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
    marginHorizontal: SPACING.lg,
  },
  sectionCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.md,
  },

  // Menu Item
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.gray50,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  menuItemLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.textPrimary,
    flex: 1,
  },
  chevronIcon: {
    fontSize: 28,
    color: COLORS.gray400,
    fontWeight: '300',
  },

  bottomSpacing: {
    height: SPACING.xl,
  },
});

export default MenuScreen;
