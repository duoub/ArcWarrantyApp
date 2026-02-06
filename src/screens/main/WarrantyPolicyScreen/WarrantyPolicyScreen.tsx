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
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../../config/theme';
import CustomHeader from '../../../components/CustomHeader';
import { Icon } from '../../../components/common';
import { commonStyles } from '../../../styles/commonStyles';
import { newsService } from '../../../api/newsService';
import { NewsItem } from '../../../types/news';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const WarrantyPolicyScreen = () => {
  const navigation = useNavigation();
  const [keyword, setKeyword] = useState('');
  const [articles, setArticles] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const loadData = useCallback(async (pageNum: number = 1, searchKeyword: string = '', isRefresh: boolean = false) => {
    if (pageNum === 1) {
      if (!isRefresh) setIsLoading(true);
    } else {
      setIsLoadingMore(true);
    }

    const result = await newsService.getNewsList(pageNum, searchKeyword, 'chinh-sach-bao-hanh');

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
    loadData(1, '');
  }, [loadData]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadData(1, keyword);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [keyword, loadData]);

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadData(1, keyword, true);
  };

  const handleLoadMore = () => {
    if (hasNextPage && !isLoadingMore) {
      loadData(page + 1, keyword);
    }
  };

  const toggleExpand = (id: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId(prev => (prev === id ? null : id));
  };

  const renderArticleCard = ({ item }: { item: NewsItem }) => {
    const isExpanded = expandedId === item.id;

    return (
      <TouchableOpacity
        style={styles.articleCard}
        onPress={() => toggleExpand(item.id)}
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
          <Text style={styles.articleTitle} numberOfLines={isExpanded ? undefined : 2}>
            {item.title}
          </Text>

          <Text style={styles.articleDescription} numberOfLines={isExpanded ? undefined : 3}>
            {item.description}
          </Text>

          <View style={styles.articleFooter}>
            <View style={styles.dateContainer}>
              <Icon name="calendar" size={14} color={COLORS.textSecondary} style={styles.metaIcon} />
              <Text style={styles.metaText}>{item.createdate}</Text>
            </View>
            <View style={styles.expandIndicator}>
              <Text style={styles.readMore}>{isExpanded ? 'Thu gọn' : 'Xem chi tiết'}</Text>
              <Icon
                name="chevron-down"
                size={16}
                color={COLORS.primary}
                style={isExpanded ? styles.chevronUp : undefined}
              />
            </View>
          </View>

          {isExpanded && (
            <View style={styles.expandedContent}>
              <View style={styles.divider} />
              <Text style={styles.content}>{item.content}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

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
        <Text style={commonStyles.emptyText}>Không có dữ liệu</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      <CustomHeader
        title="Chính sách bảo hành"
        leftIcon={<Text style={commonStyles.backIconMedium}>‹</Text>}
        onLeftPress={handleBackPress}
      />

      <View style={commonStyles.searchContainer}>
        <View style={commonStyles.searchInputWrapper}>
          <Icon name="search" size={18} color={COLORS.gray500} style={commonStyles.searchIcon} />
          <TextInput
            style={commonStyles.searchInput}
            placeholder="Tìm kiếm"
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
  dateContainer: {
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
  expandIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  readMore: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
  chevronUp: {
    transform: [{ rotate: '180deg' }],
  },
  expandedContent: {
    marginTop: SPACING.md,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.gray200,
    marginBottom: SPACING.md,
  },
  content: {
    fontSize: 15,
    color: COLORS.textPrimary,
    lineHeight: 24,
  },
  loadingMore: {
    paddingVertical: SPACING.lg,
    alignItems: 'center',
  },
});

export default WarrantyPolicyScreen;
