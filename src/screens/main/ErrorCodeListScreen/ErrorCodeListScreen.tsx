import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  Alert,
  NativeSyntheticEvent,
  NativeScrollEvent,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../../config/theme';
import CustomHeader from '../../../components/CustomHeader';
import { Icon } from '../../../components/common';
import { errorCodeService } from '../../../api/errorCodeService';
import { ErrorCode } from '../../../types/errorCode';
import { commonStyles } from '../../../styles/commonStyles';

const ErrorCodeListScreen = () => {
  const navigation = useNavigation<any>();

  const [errorCodes, setErrorCodes] = useState<ErrorCode[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchInput, setSearchInput] = useState('');

  // Handle back button press
  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  // Load error codes from API
  const loadErrorCodes = async (page: number = 1, keyword: string = '', reset: boolean = false) => {
    try {
      if (reset) {
        setIsLoading(true);
        setErrorCodes([]);
      } else {
        setIsLoadingMore(true);
      }

      const response = await errorCodeService.getErrorCodeList({
        page: page,
        keyword: keyword,
      });

      if (reset) {
        setErrorCodes(response.list);
      } else {
        setErrorCodes((prev) => [...prev, ...response.list]);
      }

      setHasNextPage(response.nextpage);
      setCurrentPage(page);
    } catch (error) {
      Alert.alert(
        'Lỗi',
        error instanceof Error ? error.message : 'Không thể tải danh sách mã lỗi'
      );
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  // Load initial data
  useEffect(() => {
    loadErrorCodes(1, searchKeyword, true);
  }, [searchKeyword]);

  // Handle search
  const handleSearch = () => {
    setSearchKeyword(searchInput);
  };

  // Handle clear search
  const handleClearSearch = () => {
    setSearchInput('');
    setSearchKeyword('');
  };

  // Load more when scrolling near bottom
  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
      const paddingToBottom = 100;
      const isCloseToBottom =
        layoutMeasurement.height + contentOffset.y >=
        contentSize.height - paddingToBottom;

      if (isCloseToBottom && hasNextPage && !isLoadingMore && !isLoading) {
        loadErrorCodes(currentPage + 1, searchKeyword, false);
      }
    },
    [hasNextPage, isLoadingMore, isLoading, currentPage, searchKeyword]
  );

  const renderErrorCodeCard = (item: ErrorCode, index: number) => (
    <View key={`${item.id}-${index}`} style={styles.errorCard}>
      {/* Card Header */}
      <View style={styles.cardHeader}>
        <View style={styles.headerLeft}>
          <Icon name="error-code" size={20} color={COLORS.error} />
          <Text style={styles.errorCode}>{item.code}</Text>
        </View>
        {item.category && (
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{item.category}</Text>
          </View>
        )}
      </View>

      {/* Card Body */}
      <View style={styles.cardBody}>
        {/* Error Name */}
        {item.name && (
          <View style={styles.infoSection}>
            <Text style={styles.infoTitle}>Tên lỗi:</Text>
            <Text style={styles.infoText}>{item.name}</Text>
          </View>
        )}

        {/* Cause */}
        {item.cause && (
          <View style={styles.infoSection}>
            <View style={styles.infoTitleContainer}>
              <Icon name="document" size={14} color={COLORS.textSecondary} />
              <Text style={styles.infoTitle}>Nguyên nhân:</Text>
            </View>
            <Text style={styles.infoText}>{item.cause}</Text>
          </View>
        )}

        {/* Solution */}
        {item.solution && (
          <View style={styles.infoSection}>
            <View style={styles.infoTitleContainer}>
              <Icon name="check-circle" size={14} color={COLORS.success} />
              <Text style={styles.infoTitle}>Cách khắc phục:</Text>
            </View>
            <Text style={styles.infoText}>{item.solution}</Text>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      <CustomHeader
        title="Tra cứu mã lỗi bảo hành"
        leftIcon={<Icon name="back" size={24} color={COLORS.white} />}
        onLeftPress={handleBack}
      />

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Icon name="search" size={20} color={COLORS.gray500} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm mã lỗi..."
            placeholderTextColor={COLORS.gray400}
            value={searchInput}
            onChangeText={setSearchInput}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {searchInput.length > 0 && (
            <TouchableOpacity onPress={handleClearSearch} activeOpacity={0.7}>
              <Icon name="close" size={20} color={COLORS.gray500} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={styles.searchButton}
          onPress={handleSearch}
          activeOpacity={0.8}
        >
          <Text style={styles.searchButtonText}>Tìm kiếm</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={true}
        onScroll={handleScroll}
        scrollEventThrottle={400}
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : errorCodes.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="error-code" size={48} color={COLORS.gray300} />
            <Text style={styles.emptyText}>
              {searchKeyword ? 'Không tìm thấy mã lỗi phù hợp' : 'Không có mã lỗi nào'}
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.errorList}>
              {errorCodes.map((errorCode, index) =>
                renderErrorCodeCard(errorCode, index)
              )}
            </View>

            {/* Loading more indicator */}
            {isLoadingMore && (
              <View style={styles.loadingMoreContainer}>
                <ActivityIndicator size="small" color={COLORS.primary} />
                <Text style={styles.loadingMoreText}>Đang tải thêm...</Text>
              </View>
            )}
          </>
        )}

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

  // Search Container
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
    ...SHADOWS.sm,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray50,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    height: 44,
    gap: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: COLORS.textPrimary,
    padding: 0,
  },
  searchButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm + 2,
    borderRadius: BORDER_RADIUS.md,
    height: 44,
    justifyContent: 'center',
  },
  searchButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
  },

  // Error List
  errorList: {
    paddingTop: SPACING.md,
  },
  errorCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.md,
  },

  // Card Header
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.gray50,
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    flex: 1,
  },
  errorCode: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.error,
  },
  categoryBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.primary,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.white,
  },

  // Card Body
  cardBody: {
    padding: SPACING.md,
  },
  infoSection: {
    marginBottom: SPACING.sm,
  },
  infoTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  infoTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  infoText: {
    fontSize: 14,
    color: COLORS.textPrimary,
    lineHeight: 20,
  },

  // Loading & Empty States
  loadingContainer: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  loadingMoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.lg,
    gap: SPACING.sm,
  },
  loadingMoreText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  emptyContainer: {
    padding: SPACING.xl,
    alignItems: 'center',
    marginTop: SPACING.xl,
  },
  emptyText: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.md,
  },

  bottomSpacing: {
    height: SPACING.xl,
  },
});

export default ErrorCodeListScreen;
