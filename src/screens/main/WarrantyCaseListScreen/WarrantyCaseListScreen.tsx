import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Alert,
  Image,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../../config/theme';
import CustomHeader from '../../../components/CustomHeader';
import { Icon } from '../../../components/common';
import { warrantyCaseService } from '../../../api/warrantyCaseService';
import { WarrantyCase } from '../../../types/warrantyCase';
import { commonStyles } from '../../../styles/commonStyles';

const WarrantyCaseListScreen = () => {
  const navigation = useNavigation<any>();

  const [warrantyCases, setWarrantyCases] = useState<WarrantyCase[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Handle back button press
  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  // Load warranty cases from API
  const loadWarrantyCases = async (page: number = 1, reset: boolean = false) => {
    try {
      if (reset) {
        setIsLoading(true);
        setWarrantyCases([]);
      } else {
        setIsLoadingMore(true);
      }

      const response = await warrantyCaseService.getWarrantyCaseList({
        upage: page,
      });

      if (reset) {
        setWarrantyCases(response.list);
      } else {
        setWarrantyCases((prev) => [...prev, ...response.list]);
      }

      setHasNextPage(response.nextpage);
      setCurrentPage(page);
    } catch (error) {
      Alert.alert(
        'Lỗi',
        error instanceof Error ? error.message : 'Không thể tải danh sách ca bảo hành'
      );
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  // Load initial data
  useEffect(() => {
    loadWarrantyCases(1, true);
  }, []);

  // Load more when scrolling near bottom
  const handleLoadMore = () => {
    if (hasNextPage && !isLoadingMore && !isLoading) {
      loadWarrantyCases(currentPage + 1, false);
    }
  };

  // Handle image press
  const handleImagePress = (uri: string) => {
    setSelectedImage(uri);
  };

  const renderWarrantyCaseCard = (item: WarrantyCase, index: number) => (
    <View key={`${item.id}-${index}`} style={styles.caseCard}>
      {/* Card Header */}
      <View style={styles.cardHeader}>
        <View style={styles.headerLeft}>
          <Icon name="warranty-report" size={20} color={COLORS.primary} />
          <Text style={styles.caseNumber}>{item.caseNumber}</Text>
        </View>
        {item.processingStatus && (
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>{item.processingStatus}</Text>
          </View>
        )}
      </View>

      {/* Card Body */}
      <View style={styles.cardBody}>
        {/* Created Date */}
        {item.createdDate && (
          <View style={commonStyles.infoRow}>
            <View style={commonStyles.infoLabelContainer}>
              <Icon name="calendar" size={14} color={COLORS.textSecondary} />
              <Text style={commonStyles.infoLabel}>Ngày tạo:</Text>
            </View>
            <Text style={commonStyles.infoValue}>{item.createdDate}</Text>
          </View>
        )}

        {/* Serial */}
        {item.serial && (
          <View style={commonStyles.infoRow}>
            <View style={commonStyles.infoLabelContainer}>
              <Icon name="in-out" size={14} color={COLORS.textSecondary} />
              <Text style={commonStyles.infoLabel}>Serial:</Text>
            </View>
            <Text style={commonStyles.infoValue}>{item.serial}</Text>
          </View>
        )}

        {/* Issue Description */}
        {item.issueDescription && (
          <View style={styles.descriptionContainer}>
            <View style={commonStyles.infoLabelContainer}>
              <Icon name="document" size={14} color={COLORS.textSecondary} />
              <Text style={commonStyles.infoLabel}>Hiện tượng hư hỏng:</Text>
            </View>
            <Text style={styles.descriptionText}>{item.issueDescription}</Text>
          </View>
        )}

        {/* Processing Description */}
        {item.processingDescription && (
          <View style={styles.descriptionContainer}>
            <View style={commonStyles.infoLabelContainer}>
              <Icon name="document" size={14} color={COLORS.textSecondary} />
              <Text style={commonStyles.infoLabel}>Mô tả xử lý:</Text>
            </View>
            <Text style={styles.descriptionText}>{item.processingDescription}</Text>
          </View>
        )}

        {/* Images */}
        {item.imageUrls && item.imageUrls.length > 0 && (
          <View style={styles.imagesContainer}>
            <View style={commonStyles.infoLabelContainer}>
              <Icon name="image" size={14} color={COLORS.textSecondary} />
              <Text style={commonStyles.infoLabel}>Hình ảnh:</Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.imageScrollView}
            >
              {item.imageUrls.map((uri, imgIndex) => (
                <TouchableOpacity
                  key={`${item.id}-img-${imgIndex}`}
                  onPress={() => handleImagePress(uri)}
                  activeOpacity={0.8}
                >
                  <Image
                    source={{ uri }}
                    style={styles.imagePreview}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      <CustomHeader
        title="Tra cứu ca bảo hành"
        leftIcon={<Icon name="back" size={24} color={COLORS.white} />}
        onLeftPress={handleBack}
      />

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={warrantyCases}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          renderItem={({ item, index }) => renderWarrantyCaseCard(item, index)}
          style={styles.scrollView}
          showsVerticalScrollIndicator={true}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="warranty-report" size={48} color={COLORS.gray300} />
              <Text style={styles.emptyText}>Không có ca bảo hành nào</Text>
            </View>
          }
          ListFooterComponent={
            isLoadingMore ? (
              <View style={styles.loadingMoreContainer}>
                <ActivityIndicator size="small" color={COLORS.primary} />
                <Text style={styles.loadingMoreText}>Đang tải thêm...</Text>
              </View>
            ) : (
              <View style={styles.bottomSpacing} />
            )
          }
        />
      )}

      {/* Image Modal */}
      {selectedImage && (
        <Modal
          visible={!!selectedImage}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setSelectedImage(null)}
        >
          <TouchableOpacity
            style={styles.imageModal}
            activeOpacity={1}
            onPress={() => setSelectedImage(null)}
          >
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setSelectedImage(null)}
              activeOpacity={0.8}
            >
              <Icon name="close" size={24} color={COLORS.white} />
            </TouchableOpacity>
            <Image
              source={{ uri: selectedImage }}
              style={styles.fullImage}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </Modal>
      )}
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

  // Case List
  caseList: {
    paddingTop: SPACING.md,
  },
  caseCard: {
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
  caseNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.primary,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.white,
  },

  // Card Body
  cardBody: {
    padding: SPACING.md,
  },
  descriptionContainer: {
    marginTop: SPACING.xs,
  },
  descriptionText: {
    fontSize: 14,
    color: COLORS.textPrimary,
    lineHeight: 20,
    marginTop: SPACING.xs,
    marginLeft: SPACING.md + 14,
  },

  // Images
  imagesContainer: {
    marginTop: SPACING.sm,
  },
  imageScrollView: {
    marginTop: SPACING.xs,
    marginLeft: SPACING.md + 14,
  },
  imagePreview: {
    width: 100,
    height: 100,
    borderRadius: BORDER_RADIUS.md,
    marginRight: SPACING.sm,
    backgroundColor: COLORS.gray100,
  },

  // Image Modal
  imageModal: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: SPACING.lg,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  fullImage: {
    width: '90%',
    height: '80%',
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

export default WarrantyCaseListScreen;
