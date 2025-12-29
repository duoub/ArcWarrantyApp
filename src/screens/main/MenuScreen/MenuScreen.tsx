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
import { commonStyles } from '../../../styles/commonStyles';

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
      style={[commonStyles.menuItem, isLast && commonStyles.menuItemLast]}
      onPress={item.onPress}
      activeOpacity={0.7}
    >
      <View style={commonStyles.menuItemLeft}>
        <View style={commonStyles.iconContainerSmall}>
          <Icon name={item.icon} size={22} color={COLORS.primary} />
        </View>
        <Text style={commonStyles.menuItemLabel}>{item.label}</Text>
      </View>
      <Text style={commonStyles.chevronIcon}>›</Text>
    </TouchableOpacity>
  );

  const renderSection = (section: MenuSection, index: number) => (
    <View key={section.title} style={styles.section}>
      <Text style={commonStyles.sectionTitleWithMargin}>{section.title}</Text>
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

  // Section
  section: {
    marginTop: SPACING.md,
  },
  sectionCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.md,
  },
});

export default MenuScreen;
