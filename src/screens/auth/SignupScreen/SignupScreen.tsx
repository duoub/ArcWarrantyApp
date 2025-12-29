import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../../config/theme';
import { AuthStackParamList } from '../../../navigation/PreLoginRootNavigator';
import CustomHeader from '../../../components/CustomHeader';
import { commonStyles } from '../../../styles/commonStyles';
import { Icon } from '../../../components/common';

type SignupScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Signup'>;

const SignupScreen: React.FC = () => {
  const navigation = useNavigation<SignupScreenNavigationProp>();

  const handleNotBuildForNow = (message: string) => {
    Alert.alert('Thông báo', message);
  };

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
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header Section */}
        <View style={styles.headerSection}>
          <Text style={styles.headerTitle}>Chào mừng đến với Akito</Text>
          <Text style={styles.headerSubtitle}>
            Vui lòng chọn loại hội viên để đăng ký
          </Text>
        </View>

        {/* Member Type Selection Grid */}
        <View style={styles.memberGrid}>
          {/* Nhà phân phối */}
          <TouchableOpacity
            style={styles.memberCard}
            onPress={() => handleNotBuildForNow('Liên hệ chúng tôi để tạo tài khoản cho Nhà phân phối')}
            activeOpacity={0.8}
          >
            <View style={styles.iconContainer}>
              <Text style={styles.memberIcon}>🚚</Text>
            </View>
            <Text style={styles.memberLabel}>Nhà phân phối</Text>
            <Text style={styles.memberDescription}>Phân phối sản phẩm Akito</Text>
          </TouchableOpacity>

          {/* Đại lý */}
          <TouchableOpacity
            style={styles.memberCard}
            onPress={() => navigation.navigate('DealerSignup')}
            activeOpacity={0.8}
          >
            <View style={styles.iconContainer}>
              <Text style={styles.memberIcon}>🏪</Text>
            </View>
            <Text style={styles.memberLabel}>Đại lý</Text>
            <Text style={styles.memberDescription}>Kinh doanh sản phẩm Akito</Text>
          </TouchableOpacity>

          {/* Thợ */}
          <TouchableOpacity
            style={styles.memberCard}
            onPress={() => handleNotBuildForNow('Chức năng đăng ký cho Thợ đang được phát triển')}
            activeOpacity={0.8}
          >
            <View style={styles.iconContainer}>
              <Text style={styles.memberIcon}>👷</Text>
            </View>
            <Text style={styles.memberLabel}>Thợ</Text>
            <Text style={styles.memberDescription}>Kỹ thuật viên sửa chữa</Text>
          </TouchableOpacity>

          {/* Người tiêu dùng */}
          <TouchableOpacity
            style={styles.memberCard}
            onPress={() => handleNotBuildForNow('Chức năng đăng ký cho Người tiêu dùng đang được phát triển')}
            activeOpacity={0.8}
          >
            <View style={styles.iconContainer}>
              <Text style={styles.memberIcon}>👥</Text>
            </View>
            <Text style={styles.memberLabel}>Người tiêu dùng</Text>
            <Text style={styles.memberDescription}>Khách hàng sử dụng</Text>
          </TouchableOpacity>
        </View>

        {/* Info Box */}
        <View style={[commonStyles.infoBox, styles.infoBoxMargin]}>
          <Icon name="info" size={18} color={COLORS.accent} style={commonStyles.infoBoxIcon} />
          <View style={commonStyles.infoBoxContent}>
            <Text style={commonStyles.infoBoxText}>
              Trở thành hội viên Akito để nhận nhiều ưu đãi và quyền lợi đặc biệt
            </Text>
            <TouchableOpacity activeOpacity={0.7}>
              <Text style={commonStyles.infoBoxLink}>Tìm hiểu thêm →</Text>
            </TouchableOpacity>
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
  backIconHeader: {
    fontSize: 32,
    color: COLORS.white,
    fontWeight: '300',
  },
  scrollView: {
    flex: 1,
  },

  // Header Section
  headerSection: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
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
    textAlign: 'center',
    lineHeight: 22,
  },

  // Member Grid
  memberGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.lg,
    justifyContent: 'space-between',
    marginTop: SPACING.md,
  },
  memberCard: {
    width: '48%',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
    height: 150,
    ...SHADOWS.md,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.gray50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  memberIcon: {
    fontSize: 32,
  },
  memberLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  memberDescription: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
  },

  // Info Box
  infoBoxMargin: {
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
  },

  // Bottom Spacing
  bottomSpacing: {
    height: SPACING.xl * 2,
  },
});

export default SignupScreen;
