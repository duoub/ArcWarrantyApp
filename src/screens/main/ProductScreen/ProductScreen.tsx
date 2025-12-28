import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Image,
  Dimensions,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../../config/theme';
import CustomHeader from '../../../components/CustomHeader';
import { Icon } from '../../../components/common';

const { width } = Dimensions.get('window');
const PRODUCT_CARD_WIDTH = (width - SPACING.lg * 3) / 2;

interface Product {
  id: string;
  title: string;
  groupname: string;
  imgurl: string;
  priceformat: string;
  originalpriceformat: string;
}

interface ProductCategory {
  id: string;
  code: string;
  title: string;
  iconurl: string;
}

const ProductScreen = () => {
  const navigation = useNavigation();

  const [keyword, setKeyword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Mock data for categories
  const categories: ProductCategory[] = [
    {
      id: '1',
      code: 'dieu-hoa',
      title: 'Điều hòa',
      iconurl: 'https://via.placeholder.com/60x60/E31E24/FFFFFF?text=AC',
    },
    {
      id: '2',
      code: 'may-nuoc-nong',
      title: 'Máy nước nóng',
      iconurl: 'https://via.placeholder.com/60x60/E31E24/FFFFFF?text=WH',
    },
    {
      id: '3',
      code: 'quat',
      title: 'Quạt',
      iconurl: 'https://via.placeholder.com/60x60/E31E24/FFFFFF?text=FAN',
    },
  ];

  // Mock data for best-selling products
  const bestSellingProducts: Product[] = [
    {
      id: '1',
      title: 'AKITO 12000BTU Inverter',
      groupname: 'Điều hòa',
      imgurl: 'https://via.placeholder.com/200x200/FFFFFF/E31E24?text=AKITO+12K',
      priceformat: '8.500.000đ',
      originalpriceformat: '10.000.000đ',
    },
    {
      id: '2',
      title: 'AKITO 18000BTU Inverter',
      groupname: 'Điều hòa',
      imgurl: 'https://via.placeholder.com/200x200/FFFFFF/E31E24?text=AKITO+18K',
      priceformat: '12.500.000đ',
      originalpriceformat: '14.000.000đ',
    },
    {
      id: '3',
      title: 'AKITO 9000BTU',
      groupname: 'Điều hòa',
      imgurl: 'https://via.placeholder.com/200x200/FFFFFF/E31E24?text=AKITO+9K',
      priceformat: '6.500.000đ',
      originalpriceformat: '7.500.000đ',
    },
  ];

  // Mock data for new products
  const newProducts: Product[] = [
    {
      id: '4',
      title: 'AKITO 24000BTU Inverter',
      groupname: 'Điều hòa',
      imgurl: 'https://via.placeholder.com/200x200/FFFFFF/E31E24?text=AKITO+24K',
      priceformat: '15.500.000đ',
      originalpriceformat: '17.000.000đ',
    },
    {
      id: '5',
      title: 'Máy nước nóng AKITO 20L',
      groupname: 'Máy nước nóng',
      imgurl: 'https://via.placeholder.com/200x200/FFFFFF/E31E24?text=WH+20L',
      priceformat: '3.200.000đ',
      originalpriceformat: '3.800.000đ',
    },
    {
      id: '6',
      title: 'Máy nước nóng AKITO 30L',
      groupname: 'Máy nước nóng',
      imgurl: 'https://via.placeholder.com/200x200/FFFFFF/E31E24?text=WH+30L',
      priceformat: '4.500.000đ',
      originalpriceformat: '5.200.000đ',
    },
  ];

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleProductPress = (product: Product) => {
    Alert.alert('Chi tiết sản phẩm', `Xem chi tiết: ${product.title}`);
  };

  const handleCategoryPress = (category: ProductCategory) => {
    setSelectedCategory(category.code);
    Alert.alert('Danh mục', `Xem sản phẩm: ${category.title}`);
  };

  const renderProductCard = (product: Product) => (
    <TouchableOpacity
      key={product.id}
      style={styles.productCard}
      onPress={() => handleProductPress(product)}
      activeOpacity={0.8}
    >
      <View style={styles.productImageContainer}>
        <Image
          source={{ uri: product.imgurl }}
          style={styles.productImage}
          resizeMode="contain"
        />
      </View>

      <View style={styles.productInfo}>
        <Text style={styles.productCategory}>{product.groupname}</Text>
        <Text style={styles.productTitle} numberOfLines={2}>
          {product.title}
        </Text>

        <View style={styles.priceBox}>
          <Text style={styles.productPrice}>{product.priceformat}</Text>
          {product.priceformat !== product.originalpriceformat && (
            <Text style={styles.productOriginalPrice}>
              {product.originalpriceformat}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      {/* Custom Header */}
      <CustomHeader
        title="Sản phẩm"
        leftIcon={<Text style={styles.backIcon}>‹</Text>}
        onLeftPress={handleBackPress}
      />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputWrapper}>
            <Icon name="search" size={18} color={COLORS.gray500} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm kiếm"
              placeholderTextColor={COLORS.gray400}
              value={keyword}
              onChangeText={setKeyword}
            />
          </View>
        </View>

        {/* Categories */}
        <View style={styles.categoriesSection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesScrollContent}
          >
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryItem,
                  selectedCategory === category.code && styles.categoryItemActive,
                ]}
                onPress={() => handleCategoryPress(category)}
                activeOpacity={0.7}
              >
                <View style={styles.categoryIconContainer}>
                  <Image
                    source={{ uri: category.iconurl }}
                    style={styles.categoryIcon}
                    resizeMode="contain"
                  />
                </View>
                <Text style={styles.categoryTitle}>{category.title}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Best Selling Products Section */}
        <View style={styles.productSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Sản phẩm bán chạy</Text>
          </View>

          <View style={styles.productGrid}>
            {bestSellingProducts.map((product) => renderProductCard(product))}
          </View>
        </View>

        {/* New Products Section */}
        <View style={styles.productSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Sản phẩm mới</Text>
          </View>

          <View style={styles.productGrid}>
            {newProducts.map((product) => renderProductCard(product))}
          </View>
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
  backIcon: {
    fontSize: 28,
    color: COLORS.white,
    fontWeight: '400',
  },

  // Search Bar
  searchContainer: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    ...SHADOWS.sm,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray50,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    paddingHorizontal: SPACING.md,
    height: 48,
  },
  searchIcon: {
    fontSize: 20,
    marginRight: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: COLORS.textPrimary,
    paddingVertical: 0,
  },

  // Categories
  categoriesSection: {
    backgroundColor: COLORS.white,
    paddingVertical: SPACING.md,
    marginBottom: SPACING.xs,
    ...SHADOWS.sm,
  },
  categoriesScrollContent: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md,
  },
  categoryItem: {
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.gray50,
    minWidth: 100,
  },
  categoryItemActive: {
    backgroundColor: COLORS.primary + '15',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  categoryIconContainer: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xs,
    ...SHADOWS.sm,
  },
  categoryIcon: {
    width: 36,
    height: 36,
  },
  categoryTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },

  // Product Section
  productSection: {
    marginTop: SPACING.md,
  },
  sectionHeader: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    marginBottom: SPACING.sm,
    ...SHADOWS.sm,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },

  // Product Grid
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md,
  },

  // Product Card
  productCard: {
    width: PRODUCT_CARD_WIDTH,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.md,
    marginBottom: SPACING.md,
  },
  productImageContainer: {
    width: '100%',
    height: PRODUCT_CARD_WIDTH * 0.8,
    backgroundColor: COLORS.gray50,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.sm,
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  productInfo: {
    padding: SPACING.sm,
  },
  productCategory: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginBottom: 4,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  productTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
    minHeight: 36,
  },
  priceBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginTop: SPACING.xs,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
  },
  productOriginalPrice: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textDecorationLine: 'line-through',
  },

  bottomSpacing: {
    height: SPACING.xl,
  },
});

export default ProductScreen;
