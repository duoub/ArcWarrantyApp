import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  Alert,
  Image,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../../config/theme';
import CustomHeader from '../../../components/CustomHeader';
import { Icon } from '../../../components/common';
import { paymentService } from '../../../api/paymentService';
import { PaymentDetail } from '../../../types/payment';

const PaymentDetailScreen = () => {
  const navigation = useNavigation<any>();

  const [payments, setPayments] = useState<PaymentDetail[]>([]);
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

  // Load payment list from API
  const loadPayments = async (page: number = 1, reset: boolean = false) => {
    try {
      if (reset) {
        setIsLoading(true);
        setPayments([]);
      } else {
        setIsLoadingMore(true);
      }

      const response = await paymentService.getPaymentList({
        upage: page,
      });

      if (reset) {
        setPayments(response.list);
      } else {
        setPayments((prev) => [...prev, ...response.list]);
      }

      setHasNextPage(response.nextpage);
      setCurrentPage(page);
    } catch (error) {
      Alert.alert(
        'Lỗi',
        error instanceof Error ? error.message : 'Không thể tải danh sách thanh toán'
      );
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadPayments(1, true);
  }, []);

  // Load more when scrolling near bottom
  const handleLoadMore = () => {
    if (hasNextPage && !isLoadingMore && !isLoading) {
      loadPayments(currentPage + 1, false);
    }
  };

  const handleImagePress = (uri: string) => {
    setSelectedImage(uri);
  };

  const renderPaymentCard = (item: PaymentDetail) => (
    <View key={item.id} style={styles.paymentCard}>
      {/* Header with Time */}
      <View style={styles.cardHeader}>
        <View style={styles.iconContainer}>
          <Icon name="calendar" size={20} color={COLORS.primary} />
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.timeLabel}>Thời gian</Text>
          <Text style={styles.timeValue}>{item.time}</Text>
        </View>
      </View>

      {/* Payment Info */}
      <View style={styles.cardBody}>
        {/* Amount */}
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Số tiền</Text>
          <Text style={styles.amountValue}>{item.amount}</Text>
        </View>

        {/* Payment Method */}
        {item.paymentMethod && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Phương thức</Text>
            <Text style={styles.infoValue}>{item.paymentMethod}</Text>
          </View>
        )}

        {/* Document Number */}
        {item.documentNumber && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Số chứng từ</Text>
            <Text style={styles.infoValue}>{item.documentNumber}</Text>
          </View>
        )}

        {/* Images */}
        {item.imageUrls && item.imageUrls.length > 0 && (
          <View style={styles.imageSection}>
            <Text style={styles.imageLabel}>Hình ảnh chứng từ</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.imageList}
            >
              {item.imageUrls.map((uri, index) => (
                <TouchableOpacity
                  key={`${item.id}-img-${index}`}
                  onPress={() => handleImagePress(uri)}
                  activeOpacity={0.8}
                >
                  <Image source={{ uri }} style={styles.imagePreview} />
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
        title="Chi tiết thanh toán"
        leftIcon={<Icon name="back" size={24} color={COLORS.white} />}
        onLeftPress={handleBack}
      />

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={payments}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => renderPaymentCard(item)}
          style={styles.scrollView}
          showsVerticalScrollIndicator={true}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="document" size={48} color={COLORS.gray300} />
              <Text style={styles.emptyText}>Chưa có lịch sử thanh toán</Text>
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
        <TouchableOpacity
          style={styles.imageModal}
          activeOpacity={1}
          onPress={() => setSelectedImage(null)}
        >
          <View style={styles.modalContent}>
            <Image source={{ uri: selectedImage }} style={styles.fullImage} resizeMode="contain" />
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setSelectedImage(null)}
            >
              <Icon name="close" size={24} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
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

  // Payment List
  paymentList: {
    paddingTop: SPACING.md,
  },
  paymentCard: {
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
    backgroundColor: COLORS.primary + '10',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  headerInfo: {
    flex: 1,
  },
  timeLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  timeValue: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },

  // Card Body
  cardBody: {
    padding: SPACING.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  infoLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: COLORS.textPrimary,
    fontWeight: '600',
    textAlign: 'right',
    flex: 1,
    marginLeft: SPACING.md,
  },
  amountValue: {
    fontSize: 16,
    color: COLORS.success,
    fontWeight: '700',
    textAlign: 'right',
    flex: 1,
    marginLeft: SPACING.md,
  },

  // Image Section
  imageSection: {
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray100,
  },
  imageLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginBottom: SPACING.sm,
  },
  imageList: {
    flexDirection: 'row',
  },
  imagePreview: {
    width: 100,
    height: 100,
    borderRadius: BORDER_RADIUS.md,
    marginRight: SPACING.sm,
    backgroundColor: COLORS.gray100,
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

  // Image Modal
  imageModal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: {
    width: '90%',
    height: '80%',
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
  },

  bottomSpacing: {
    height: SPACING.xl,
  },
});

export default PaymentDetailScreen;
