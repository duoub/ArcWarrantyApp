import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  useWindowDimensions,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import RenderHtml from 'react-native-render-html';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../../config/theme';
import CustomHeader from '../../../components/CustomHeader';
import { HomeStackParamList } from '../../../navigation/MainNavigator';

type SalesProgramDetailRouteProp = RouteProp<
  HomeStackParamList,
  'SalesProgramDetail'
>;

const SalesProgramDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<SalesProgramDetailRouteProp>();
  const { width } = useWindowDimensions();

  const { programName, htmlContent } = route.params;

  // Decode HTML entities if needed
  const decodeHtml = (html: string) => {
    return html
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'");
  };

  // Mock data for testing (remove when API returns real HTML)
  const mockHtmlContent = `
    <h1>Chương trình khuyến mãi đặc biệt</h1>

    <img src="https://picsum.photos/600/300" alt="Banner chương trình" style="width: 100%; border-radius: 8px; margin-bottom: 16px;" />

    <h2>Thông tin chương trình</h2>
    <p><strong>Thời gian:</strong> 01/02/2026 - 28/02/2026</p>
    <p><strong>Đối tượng:</strong> Tất cả các đại lý của ARC</p>

    <h2>Nội dung khuyến mãi</h2>
    <p>Chương trình áp dụng cho các đại lý đạt chỉ tiêu doanh số trong tháng với các ưu đãi hấp dẫn:</p>

    <ul>
      <li>Tặng thêm <strong>5%</strong> hoa hồng cho đơn hàng trên 100 triệu</li>
      <li>Tặng thêm <strong>7%</strong> hoa hồng cho đơn hàng trên 200 triệu</li>
      <li>Tặng thêm <strong>10%</strong> hoa hồng cho đơn hàng trên 500 triệu</li>
      <li>Quà tặng đặc biệt cho top 10 đại lý xuất sắc</li>
    </ul>

    <img src="https://picsum.photos/600/400" alt="Quà tặng" style="width: 100%; border-radius: 8px; margin: 16px 0;" />

    <h2>Điều kiện tham gia</h2>
    <ol>
      <li>Là đại lý chính thức của ARC</li>
      <li>Đăng ký tham gia chương trình trước ngày 05/02/2026</li>
      <li>Đạt chỉ tiêu doanh số tối thiểu trong tháng</li>
      <li>Không có nợ quá hạn với công ty</li>
    </ol>

    <h2>Lưu ý quan trọng</h2>
    <p style="color: #E31E24; font-weight: bold;">
      ⚠️ Chương trình có thể kết thúc sớm nếu đạt giới hạn ngân sách. Vui lòng đăng ký sớm để không bỏ lỡ cơ hội!
    </p>

    <p><em>Mọi thắc mắc vui lòng liên hệ bộ phận chăm sóc khách hàng để được hỗ trợ.</em></p>
  `;

  const decodedHtml = decodeHtml(htmlContent || mockHtmlContent);

  // Custom styles for HTML rendering
  const tagsStyles = {
    body: {
      color: COLORS.textPrimary,
      fontSize: 14,
      lineHeight: 22,
    },
    h1: {
      color: COLORS.textPrimary,
      fontSize: 20,
      fontWeight: '700' as const,
      marginBottom: SPACING.sm,
    },
    h2: {
      color: COLORS.textPrimary,
      fontSize: 18,
      fontWeight: '700' as const,
      marginBottom: SPACING.sm,
    },
    h3: {
      color: COLORS.textPrimary,
      fontSize: 16,
      fontWeight: '600' as const,
      marginBottom: SPACING.sm,
    },
    p: {
      marginBottom: SPACING.sm,
      lineHeight: 22,
    },
    ul: {
      marginBottom: SPACING.sm,
    },
    ol: {
      marginBottom: SPACING.sm,
    },
    li: {
      marginBottom: SPACING.xs,
      lineHeight: 22,
    },
    strong: {
      fontWeight: '700' as const,
      color: COLORS.textPrimary,
    },
    em: {
      fontStyle: 'italic' as const,
    },
    a: {
      color: COLORS.primary,
      textDecorationLine: 'underline' as const,
    },
    table: {
      marginBottom: SPACING.md,
    },
    th: {
      fontWeight: '700' as const,
      backgroundColor: COLORS.gray100,
      padding: SPACING.sm,
    },
    td: {
      padding: SPACING.sm,
      borderWidth: 1,
      borderColor: COLORS.gray300,
    },
    img: {
      borderRadius: 8,
      marginVertical: SPACING.sm,
    },
  };

  const classesStyles = {
    'text-center': {
      textAlign: 'center' as const,
    },
    'text-right': {
      textAlign: 'right' as const,
    },
    'text-bold': {
      fontWeight: '700' as const,
    },
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      <CustomHeader
        title={programName}
        leftIcon={<Text style={styles.backIcon}>‹</Text>}
        onLeftPress={() => navigation.goBack()}
      />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.contentCard}>
          <RenderHtml
            contentWidth={width - SPACING.screen_lg * 2 - SPACING.lg * 2}
            source={{ html: decodedHtml }}
            tagsStyles={tagsStyles}
            classesStyles={classesStyles}
          />
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
  scrollContent: {
    paddingTop: SPACING.md,
  },
  backIcon: {
    fontSize: 32,
    color: COLORS.white,
    fontWeight: '300',
  },

  // Content Card
  contentCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.screen_lg,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.sm,
  },

  bottomSpacing: {
    height: SPACING.xl,
  },
});

export default SalesProgramDetailScreen;
