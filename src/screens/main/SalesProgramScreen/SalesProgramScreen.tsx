import React, { useState, useEffect } from 'react';
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
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../../config/theme';
import CustomHeader from '../../../components/CustomHeader';
import { useAuthStore } from '../../../store/authStore';

interface SalesProgram {
  id: string;
  name: string;
  tenchitieu: string;
  doanhsochitieu: string;
  doanhsodat: string;
  doanhsoconlai: string;
  limittime: string;
  tyledat: number;
  thamgia: 0 | 1;
  quyendangky: 0 | 1;
}

const SalesProgramScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuthStore();
  const [programs, setPrograms] = useState<SalesProgram[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [chophepdangkygoi, setChophepdangkygoi] = useState(1);

  // Mock data - replace with API call
  useEffect(() => {
    const mockData: SalesProgram[] = [
      {
        id: '1',
        name: 'Gói chương trình KPI Q1 2025',
        tenchitieu: 'DOANH SỐ CHỈ TIÊU Q1',
        doanhsochitieu: '500.000.000',
        doanhsodat: '320.000.000',
        doanhsoconlai: '180.000.000',
        limittime: '45 ngày',
        tyledat: 64,
        thamgia: 1,
        quyendangky: 1,
      },
      {
        id: '2',
        name: 'Gói boost doanh số tháng 3',
        tenchitieu: 'DOANH SỐ CHỈ TIÊU THÁNG 3',
        doanhsochitieu: '150.000.000',
        doanhsodat: '95.000.000',
        doanhsoconlai: '55.000.000',
        limittime: '12 ngày',
        tyledat: 63,
        thamgia: 1,
        quyendangky: 1,
      },
      {
        id: '3',
        name: 'Gói ưu đãi đại lý mới',
        tenchitieu: 'DOANH SỐ CHỈ TIÊU',
        doanhsochitieu: '100.000.000',
        doanhsodat: '0',
        doanhsoconlai: '0',
        limittime: '0 ngày',
        tyledat: 0,
        thamgia: 0,
        quyendangky: 1,
      },
    ];
    setPrograms(mockData);
  }, []);

  const formatCurrency = (amount: string) => {
    const num = parseFloat(amount.replace(/[,.]/g, ''));
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(num);
  };

  const handleRegisterProgram = (id: string, quyendangky: 0 | 1) => {
    if (quyendangky === 0) {
      Alert.alert('Thông báo', 'Bạn không có quyền đăng ký gói này');
      return;
    }
    Alert.alert(
      'Đăng ký gói chương trình',
      'Bạn có chắc chắn muốn đăng ký gói chương trình này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đăng ký',
          onPress: () => {
            Alert.alert('Thành công', 'Đăng ký gói chương trình thành công!');
            // TODO: Call API to register program
          },
        },
      ]
    );
  };

  const handleViewDetail = (id: string) => {
    Alert.alert('Xem chi tiết', `Chi tiết gói chương trình ID: ${id}`);
    // TODO: Navigate to detail screen or show modal
  };

  const renderProgram = (item: SalesProgram) => (
    <View key={item.id} style={styles.programCard}>
      {/* Header */}
      <View style={styles.programHeader}>
        <Text style={styles.programTitle}>{item.name}</Text>
        {item.thamgia === 1 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Đang tham gia</Text>
          </View>
        )}
      </View>

      {/* Body */}
      <View style={styles.programBody}>
        {/* Chỉ tiêu doanh số */}
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>{item.tenchitieu}</Text>
          <Text style={[styles.infoValue, styles.infoValuePrimary]}>
            {formatCurrency(item.doanhsochitieu)}
          </Text>
        </View>

        {/* Thông tin khi đã tham gia */}
        {item.thamgia === 1 && (
          <>
            {/* Doanh số thực đạt */}
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>DOANH SỐ THỰC ĐẠT</Text>
              <Text style={[styles.infoValue, styles.infoValueSuccess]}>
                {formatCurrency(item.doanhsodat)}
              </Text>
            </View>

            {/* Doanh số còn lại */}
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>DOANH SỐ CÒN LẠI</Text>
              <Text style={styles.infoValue}>
                {formatCurrency(item.doanhsoconlai)}
              </Text>
            </View>

            {/* Thời gian còn lại */}
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>THỜI GIAN CÒN LẠI</Text>
              <Text style={[styles.infoValue, styles.infoValueDanger]}>
                {item.limittime}
              </Text>
            </View>

            {/* Progress bar */}
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View
                  style={[styles.progressFill, { width: `${item.tyledat}%` }]}
                >
                  <Text style={styles.progressText}>{item.tyledat}%</Text>
                </View>
              </View>
            </View>
          </>
        )}

        {/* Action buttons */}
        <View style={styles.actions}>
          {item.thamgia === 0 ? (
            <>
              {chophepdangkygoi === 1 && (
                <TouchableOpacity
                  style={[styles.button, styles.buttonPrimary]}
                  onPress={() => handleRegisterProgram(item.id, item.quyendangky)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.buttonTextPrimary}>ĐĂNG KÝ</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[styles.button, styles.buttonSecondary]}
                onPress={() => handleViewDetail(item.id)}
                activeOpacity={0.8}
              >
                <Text style={styles.buttonTextSecondary}>XEM CHI TIẾT</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              style={[styles.button, styles.buttonPrimary, styles.buttonFull]}
              onPress={() => handleViewDetail(item.id)}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonTextPrimary}>XEM CHI TIẾT</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      <CustomHeader
        title="Chương trình bán hàng"
        leftIcon={<Text style={styles.backIcon}>‹</Text>}
        onLeftPress={() => navigation.goBack()}
      />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Page Title */}
        <View style={styles.pageHeader}>
          <Text style={styles.pageTitle}>
            Danh sách các gói chương trình bán hàng cho đại lý
          </Text>
        </View>

        {/* Programs List */}
        <View style={styles.programsList}>
          {programs.map((program) => renderProgram(program))}
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
    fontSize: 32,
    color: COLORS.white,
    fontWeight: '300',
  },

  // Page Header
  pageHeader: {
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.sm,
  },
  pageTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    textAlign: 'center',
    lineHeight: 22,
  },

  // Programs List
  programsList: {
    marginTop: SPACING.md,
  },

  // Program Card
  programCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    ...SHADOWS.md,
    borderWidth: 2,
    borderColor: COLORS.gray200,
  },
  programHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    paddingVertical: SPACING.md + 2,
    backgroundColor: COLORS.primary + '12',
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary + '20',
  },
  programTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    flex: 1,
    marginRight: SPACING.sm,
  },
  badge: {
    backgroundColor: COLORS.success,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.white,
  },

  // Program Body
  programBody: {
    padding: SPACING.md,
    paddingTop: SPACING.md + 2,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm + 2,
    paddingVertical: SPACING.xs,
  },
  infoLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'right',
  },
  infoValuePrimary: {
    color: COLORS.primary,
    fontSize: 15,
  },
  infoValueSuccess: {
    color: COLORS.success,
  },
  infoValueDanger: {
    color: COLORS.error,
  },

  // Progress Bar
  progressContainer: {
    marginTop: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  progressBar: {
    height: 36,
    backgroundColor: COLORS.gray200,
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.gray300,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.success,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 40,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.white,
  },

  // Actions
  actions: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.sm + 2,
  },
  button: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.sm,
  },
  buttonFull: {
    flex: 1,
  },
  buttonPrimary: {
    backgroundColor: COLORS.primary,
  },
  buttonSecondary: {
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  buttonTextPrimary: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.white,
    letterSpacing: 0.3,
  },
  buttonTextSecondary: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
    letterSpacing: 0.3,
  },

  bottomSpacing: {
    height: SPACING.xl,
  },
});

export default SalesProgramScreen;
