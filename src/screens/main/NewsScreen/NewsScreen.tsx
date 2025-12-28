import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Image,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../../config/theme';
import CustomHeader from '../../../components/CustomHeader';
import { Icon } from '../../../components/common';

interface NewsArticle {
  id: string;
  title: string;
  description: string;
  imgurl180_120: string;
  createdate: string;
  isVideo?: boolean;
}

const NewsScreen = () => {
  const navigation = useNavigation();
  const [keyword, setKeyword] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Mock data for news articles
  const allArticles: NewsArticle[] = [
    {
      id: '1',
      title: 'Ra mắt dòng sản phẩm điều hòa AKITO Inverter tiết kiệm điện',
      description:
        'AKITO chính thức giới thiệu dòng sản phẩm điều hòa Inverter mới với công nghệ tiết kiệm điện vượt trội, giúp tiết kiệm đến 60% chi phí điện năng.',
      imgurl180_120: 'https://via.placeholder.com/180x120/E31E24/FFFFFF?text=AKITO+AC',
      createdate: '15/12/2024',
      isVideo: false,
    },
    {
      id: '2',
      title: 'Hướng dẫn bảo dưỡng điều hòa mùa hè hiệu quả',
      description:
        'Cách vệ sinh và bảo dưỡng điều hòa đúng cách giúp máy hoạt động bền bỉ, tiết kiệm điện và đảm bảo sức khỏe cho gia đình.',
      imgurl180_120: 'https://via.placeholder.com/180x120/E31E24/FFFFFF?text=Guide',
      createdate: '14/12/2024',
      isVideo: true,
    },
    {
      id: '3',
      title: 'Chính sách bảo hành mới - Nâng cấp 5 năm cho toàn bộ sản phẩm',
      description:
        'AKITO cam kết chất lượng với chương trình bảo hành 5 năm cho tất cả sản phẩm điều hòa, máy nước nóng được mua từ 01/01/2025.',
      imgurl180_120: 'https://via.placeholder.com/180x120/E31E24/FFFFFF?text=Warranty',
      createdate: '13/12/2024',
      isVideo: false,
    },
    {
      id: '4',
      title: 'Tư vấn chọn công suất điều hòa phù hợp với diện tích phòng',
      description:
        'Hướng dẫn chi tiết cách chọn công suất điều hòa phù hợp, giúp tối ưu hiệu suất làm lạnh và tiết kiệm chi phí điện năng.',
      imgurl180_120: 'https://via.placeholder.com/180x120/E31E24/FFFFFF?text=Tips',
      createdate: '12/12/2024',
      isVideo: false,
    },
    {
      id: '5',
      title: 'Khai trương showroom AKITO tại TP.HCM',
      description:
        'Showroom AKITO chính hãng tại TP.HCM đã chính thức khai trương với nhiều ưu đãi hấp dẫn dành cho khách hàng trong tháng đầu tiên.',
      imgurl180_120: 'https://via.placeholder.com/180x120/E31E24/FFFFFF?text=Showroom',
      createdate: '10/12/2024',
      isVideo: false,
    },
    {
      id: '6',
      title: 'AKITO đạt chứng nhận tiết kiệm năng lượng 5 sao',
      description:
        'Sản phẩm điều hòa AKITO Inverter chính thức nhận chứng nhận tiết kiệm năng lượng 5 sao từ Bộ Công Thương.',
      imgurl180_120: 'https://via.placeholder.com/180x120/E31E24/FFFFFF?text=Award',
      createdate: '08/12/2024',
      isVideo: true,
    },
  ];

  const filteredArticles = allArticles.filter(
    (article) =>
      keyword === '' ||
      article.title.toLowerCase().includes(keyword.toLowerCase()) ||
      article.description.toLowerCase().includes(keyword.toLowerCase())
  );

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  };

  const handleArticlePress = (article: NewsArticle) => {
    console.log('Article pressed:', article.id);
  };

  const renderArticleCard = (article: NewsArticle, index: number) => (
    <TouchableOpacity
      key={article.id}
      style={styles.articleCard}
      onPress={() => handleArticlePress(article)}
      activeOpacity={0.7}
    >
      <View style={styles.articleContent}>
        <Text style={styles.articleTitle} numberOfLines={2}>
          {article.title}
        </Text>

        <Text style={styles.articleDescription} numberOfLines={3}>
          {article.description}
        </Text>

        <View style={styles.articleFooter}>
          <View style={styles.dateContainer}>
            <Text style={styles.dateIcon}>📅</Text>
            <Text style={styles.dateText}>{article.createdate}</Text>
          </View>
          <Text style={styles.readMore}>Xem chi tiết →</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      <CustomHeader
        title="Tin tức"
        leftIcon={<Text style={styles.backIcon}>‹</Text>}
        onLeftPress={handleBackPress}
      />

      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
          <Icon name="search" size={18} color={COLORS.gray500} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm tin tức"
            placeholderTextColor={COLORS.gray400}
            value={keyword}
            onChangeText={setKeyword}
          />
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {filteredArticles.length > 0 ? (
          <View style={styles.articleList}>
            {filteredArticles.map((article, index) =>
              renderArticleCard(article, index)
            )}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Không tìm thấy tin tức phù hợp</Text>
          </View>
        )}

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

  // Search
  searchContainer: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.md,
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

  // Article List
  articleList: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    gap: SPACING.lg,
  },
  articleCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.md,
  },

  // Thumbnail
  thumbnailContainer: {
    width: '100%',
    height: 180,
    backgroundColor: COLORS.gray100,
    position: 'relative',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  placeholderContainer: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.gray100,
  },
  placeholderIcon: {
    fontSize: 48,
    opacity: 0.5,
  },

  // Article Content
  articleContent: {
    padding: SPACING.md,
  },
  articleTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.textPrimary,
    lineHeight: 24,
    marginBottom: SPACING.sm,
  },
  articleDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: SPACING.md,
  },

  // Article Footer
  articleFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateIcon: {
    fontSize: 14,
    marginRight: SPACING.xs,
  },
  dateText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  readMore: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },

  // Empty State
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xl * 3,
  },
  emptyText: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },

  // Bottom Spacing - EXACT COPY from NotificationScreen
  bottomSpacing: {
    height: SPACING.xl,
  },
});

export default NewsScreen;
