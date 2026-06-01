import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS, SPACING, BORDER_RADIUS } from '../../../config/theme';
import { AuthStackParamList, SignupSubType } from '../../../navigation/PreLoginRootNavigator';
import CustomHeader from '../../../components/CustomHeader';

// Import images
const dealerImage = require('../../../assets/images/dealer.png');
const technicianImage = require('../../../assets/images/technician.png');
const shopImage = require('../../../assets/images/shop.png');
const enterpriseImage = require('../../../assets/images/enterprise.png');

type SignupScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Signup'>;

interface MemberOption {
  key: string;
  label: string;
  image: any;
  onPress: () => void;
}

const SignupScreen: React.FC = () => {
  const navigation = useNavigation<SignupScreenNavigationProp>();

  // Mở form "Thông tin tài khoản" (bước 1) trước khi vào form chi tiết
  const openAccountInfo = (
    target: 'DealerSignup' | 'TechnicianSignup',
    title: string,
    subType: SignupSubType,
  ) => navigation.navigate('AccountInfo', { target, title, subType });

  // Title chung cho header bước nhập thông tin + form chi tiết
  const TITLE_C2 = 'Tạo mới tài khoản hội viên C2';
  const TITLE_C3 = 'Tạo mới tài khoản hội viên C3';

  // C2: Đại lý bán buôn/bán sỉ
  const wholesaleOptions: MemberOption[] = [
    {
      key: 'business',
      label: 'Doanh nghiệp',
      image: enterpriseImage,
      onPress: () => openAccountInfo('DealerSignup', TITLE_C2, 'enterprise'),
    },
    {
      key: 'household',
      label: 'Hộ kinh doanh',
      image: dealerImage,
      onPress: () => openAccountInfo('DealerSignup', TITLE_C2, 'household'),
    },
  ];

  // C3: Thợ / Kỹ thuật viên / Nhà bán lẻ
  const retailOptions: MemberOption[] = [
    {
      key: 'individual-no-shop',
      label: 'Cá nhân không có cửa hàng',
      image: technicianImage,
      onPress: () => openAccountInfo('TechnicianSignup', TITLE_C3, 'individual-no-shop'),
    },
    {
      key: 'individual-shop',
      label: 'Cá nhân có cửa hàng',
      image: shopImage,
      onPress: () => openAccountInfo('TechnicianSignup', TITLE_C3, 'individual-shop'),
    },
    {
      key: 'business',
      label: 'Doanh nghiệp',
      image: enterpriseImage,
      // Doanh nghiệp ở C3 dùng chung luồng/form với C2 (DealerSignup, subType 'enterprise')
      onPress: () => openAccountInfo('DealerSignup', TITLE_C3, 'enterprise'),
    },
    {
      key: 'household',
      label: 'Hộ kinh doanh',
      image: dealerImage,
      // Hộ kinh doanh ở C3 dùng chung luồng/form với C2 (DealerSignup, subType 'household')
      onPress: () => openAccountInfo('DealerSignup', TITLE_C3, 'household'),
    },
  ];

  const renderCard = (option: MemberOption) => (
    <TouchableOpacity
      key={option.key}
      style={styles.card}
      onPress={option.onPress}
      activeOpacity={0.85}
    >
      {/* Lớp đáy: gradient viền phủ kín card */}
      <LinearGradient
        colors={['#7FB5F8', '#1877F2']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.cardBorder}
      />
      {/* Lớp nền: gradient trắng, thụt vào 1.5px đều 4 cạnh để lộ viền */}
      <LinearGradient
        colors={['#FFFFFF', '#EAF3FE']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.cardFill}
      />
      {/* Content căn chính giữa */}
      <View style={styles.cardContent}>
        <Image source={option.image} style={styles.memberImage} resizeMode="contain" />
        <Text style={styles.memberLabel} numberOfLines={2}>{option.label}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      {/* Custom Header */}
      <CustomHeader
        title="Đăng ký hội viên"
        leftIcon={<Text style={styles.backIconHeader}>‹</Text>}
        onLeftPress={() => navigation.goBack()}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Registration Card */}
        <View style={styles.registrationCard}>
          {/* Header Section */}
          <View style={styles.headerSection}>
            <Text style={styles.headerTitle}>ĐĂNG KÝ HỘI VIÊN</Text>
            <Text style={styles.headerSubtitle}>
              Bạn vui lòng chọn loại hội viên để đăng ký
            </Text>
          </View>

          {/* C2 Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>C2: Đại lý bán buôn/bán lẻ</Text>
            <View style={styles.memberGrid}>
              {wholesaleOptions.map((o) => renderCard(o))}
            </View>
          </View>

          {/* C3 Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>C3: Thợ/Kỹ thuật viên/Nhà bán lẻ</Text>
            <View style={styles.memberGrid}>
              {retailOptions.map((o) => renderCard(o))}
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  backIconHeader: {
    fontSize: 32,
    color: COLORS.white,
    fontWeight: '300',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SPACING.xl,
  },

  // Registration Card
  registrationCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.screen_lg,
    marginTop: SPACING.md,
    marginBottom: SPACING.xl,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },

  // Header Section
  headerSection: {
    paddingBottom: SPACING.md,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 15,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    lineHeight: 22,
  },

  // Section
  section: {
    marginTop: SPACING.md,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },

  // Member Grid
  memberGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    height: 150,
    marginBottom: SPACING.md,
    borderRadius: 16,
  },
  // Lớp đáy: gradient viền phủ kín card
  cardBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 16,
  },
  // Lớp nền: thụt 1.5px đều 4 cạnh → để lộ viền gradient đều quanh mép
  cardFill: {
    position: 'absolute',
    top: 1.5,
    left: 1.5,
    right: 1.5,
    bottom: 1.5,
    borderRadius: 14.5,
  },
  // Content căn giữa, phủ toàn card
  cardContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.sm,
    gap: SPACING.sm,
  },
  memberImage: {
    width: 56,
    height: 56,
  },
  memberLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
});

export default SignupScreen;
