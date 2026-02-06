import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Image,
  RefreshControl,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../../config/theme';
import CustomHeader from '../../../components/CustomHeader';
import { Icon } from '../../../components/common';
import { commonStyles } from '../../../styles/commonStyles';
import { newsService } from '../../../api/newsService';
import { NewsItem } from '../../../types/news';
import { MenuStackParamList } from '../../../navigation/MainNavigator';

type NavigationProp = StackNavigationProp<MenuStackParamList, 'News'>;

const NewsScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [keyword, setKeyword] = useState('');
  const [articles, setArticles] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const loadNews = useCallback(async (pageNum: number = 1, searchKeyword: string = '', isRefresh: boolean = false) => {
    if (pageNum === 1) {
      if (!isRefresh) {
        setIsLoading(true);
      }
    } else {
      setIsLoadingMore(true);
    }

    const result = await newsService.getNewsList(pageNum, searchKeyword);

    if (result.status) {
      if (pageNum === 1) {
        setArticles(result.list);
      } else {
        setArticles(prev => [...prev, ...result.list]);
      }
      setHasNextPage(result.nextpage);
      setPage(pageNum);
    }

    setIsLoading(false);
    setRefreshing(false);
    setIsLoadingMore(false);
  }, []);

  useEffect(() => {
    loadNews(1, '');
  }, [loadNews]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadNews(1, keyword);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [keyword, loadNews]);

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadNews(1, keyword, true);
  };

  const handleLoadMore = () => {
    if (hasNextPage && !isLoadingMore) {
      loadNews(page + 1, keyword);
    }
  };

  const handleArticlePress = (article: NewsItem) => {
    navigation.navigate('NewsDetail', { article });
  };

  const renderArticleCard = ({ item }: { item: NewsItem }) => (
    <TouchableOpacity
      style={styles.articleCard}
      onPress={() => handleArticlePress(item)}
      activeOpacity={0.7}
    >
      {item.imgurl ? (
        <Image
          source={{ uri: item.imgurl }}
          style={styles.articleImage}
          resizeMode="cover"
        />
      ) : null}

      <View style={styles.articleContent}>
        <Text style={styles.articleTitle} numberOfLines={2}>
          {item.title}
        </Text>

        <Text style={styles.articleDescription} numberOfLines={3}>
          {item.description}
        </Text>

        <View style={styles.articleFooter}>
          <View style={styles.metaContainer}>
            <View style={styles.dateContainer}>
              <Icon name="calendar" size={14} color={COLORS.textSecondary} style={styles.metaIcon} />
              <Text style={styles.metaText}>{item.createdate}</Text>
            </View>
            <View style={styles.viewContainer}>
              <Icon name="eye" size={14} color={COLORS.textSecondary} style={styles.metaIcon} />
              <Text style={styles.metaText}>{item.luotview}</Text>
            </View>
          </View>
          <Text style={styles.readMore}>Xem chi tiết →</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderFooter = () => {
    if (!isLoadingMore) return null;
    return (
      <View style={styles.loadingMore}>
        <ActivityIndicator size="small" color={COLORS.primary} />
      </View>
    );
  };

  const renderEmpty = () => {
    if (isLoading) return null;
    return (
      <View style={commonStyles.emptyContainer}>
        <Text style={commonStyles.emptyText}>Không tìm thấy tin tức phù hợp</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      <CustomHeader
        title="Tin tức"
        leftIcon={<Text style={commonStyles.backIconMedium}>‹</Text>}
        onLeftPress={handleBackPress}
      />

      <View style={commonStyles.searchContainer}>
        <View style={commonStyles.searchInputWrapper}>
          <Icon name="search" size={18} color={COLORS.gray500} style={commonStyles.searchIcon} />
          <TextInput
            style={commonStyles.searchInput}
            placeholder="Tìm kiếm tin tức"
            placeholderTextColor={COLORS.gray400}
            value={keyword}
            onChangeText={setKeyword}
          />
        </View>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={articles}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderArticleCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={renderEmpty}
        />
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
  listContent: {
    paddingHorizontal: SPACING.screen_lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xxl,
    gap: SPACING.lg,
  },
  articleCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.md,
  },
  articleImage: {
    width: '100%',
    height: 180,
    backgroundColor: COLORS.gray200,
  },
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
  articleFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaIcon: {
    marginRight: SPACING.xs,
  },
  metaText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  readMore: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
  loadingMore: {
    paddingVertical: SPACING.lg,
    alignItems: 'center',
  },
});

export default NewsScreen;
