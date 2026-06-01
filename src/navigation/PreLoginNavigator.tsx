import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { COLORS, SPACING, GRADIENTS } from '../config/theme';
import { Icon } from '../components/common';
import { PreLoginRootStackParamList } from './PreLoginRootNavigator';

type PreLoginNavigationProp = StackNavigationProp<PreLoginRootStackParamList, 'Login'>;

interface TabButton {
  icon: 'warranty-station' | 'warranty-activation' | 'warranty-lookup';
  title: string;
  screen: 'WarrantyStationList' | 'WarrantyActivation' | 'WarrantyLookup';
}

const tabButtons: TabButton[] = [
  {
    icon: 'warranty-station',
    title: 'Điểm bảo hành',
    screen: 'WarrantyStationList',
  },
  {
    icon: 'warranty-activation',
    title: 'Kích hoạt',
    screen: 'WarrantyActivation',
  },
  {
    icon: 'warranty-lookup',
    title: 'Tra cứu sản phẩm',
    screen: 'WarrantyLookup',
  },
];

// Custom Tab Button Component for Center Button
// Cùng cơ chế với nút IN/OUT ở MainNavigator: vòng tròn position:absolute nổi
// lên trên (không tham gia layout), một slot giữ chỗ đúng kích thước icon để
// label rơi đúng cao độ như 2 nút bên. Chạy đồng nhất iOS/Android.
const CenterTabButton = ({ onPress, label }: { onPress: () => void; label: string }) => (
  <TouchableOpacity
    style={styles.centerButton}
    onPress={onPress}
    activeOpacity={0.8}
  >
    {/* Slot giữ chỗ = icon thật ẩn (size 24) → cụm [icon+label] khớp 2 nút bên */}
    <Icon name="warranty-activation" size={24} color="transparent" />
    <Text style={styles.centerLabel}>{label}</Text>
    {/* Vòng tròn nổi tuyệt đối. Border + căn icon nằm trên VIEW (nhất quán
        iOS/Android, giống MainNavigator); gradient chỉ là lớp nền absolute. */}
    <View style={styles.centerButtonInner}>
      <LinearGradient
        colors={GRADIENTS.primaryDiagonal}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={styles.centerButtonGradient}
      />
      <Icon name="warranty-activation" size={32} color={COLORS.white} />
    </View>
  </TouchableOpacity>
);

const PreLoginNavigator = () => {
  const navigation = useNavigation<PreLoginNavigationProp>();

  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        {tabButtons.map((button, index) => {
          // Nút giữa - Center button (index 1)
          if (index === 1) {
            return (
              <CenterTabButton
                key={index}
                onPress={() => navigation.navigate(button.screen)}
                label={button.title}
              />
            );
          }

          // Nút 2 bên - Side buttons
          return (
            <TouchableOpacity
              key={index}
              style={styles.tabButton}
              onPress={() => navigation.navigate(button.screen)}
              activeOpacity={0.7}
            >
              <Icon name={button.icon} size={24} color={COLORS.primary} />
              <Text style={styles.tabLabel}>{button.title}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray200,
  },
  tabBar: {
    flexDirection: 'row',
    height: 60,
    paddingTop: SPACING.xs,
    paddingBottom: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    backgroundColor: COLORS.white,
    alignItems: 'center',
  },
  tabButton: {
    flex: 1.2,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.primary,
    marginTop: 4,
    textAlign: 'center',
  },
  // Center button: layout cụm [slot icon + label] căn giữa GIỐNG HỆT tabButton
  // → label thẳng hàng. Vòng tròn là lớp absolute nên không ảnh hưởng layout.
  centerButton: {
    flex: 1.2,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  // Vòng tròn nổi tuyệt đối, đẩy lên khỏi thanh tab. Border + căn icon đặt trên
  // VIEW này (nhất quán iOS/Android). Bo tròn + overflow hidden để gradient nền
  // không tràn ra ngoài viền.
  centerButtonInner: {
    position: 'absolute',
    top: -40,
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 4,
    borderColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    shadowColor: '#0653CC',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.55,
    shadowRadius: 9,
    elevation: 8,
  },
  // Lớp nền gradient phủ kín vòng tròn, tự bo tròn (không cần clip từ cha → giữ shadow)
  centerButtonGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 32,
  },
  // marginTop 4 GIỐNG tabLabel → cùng khoảng cách icon–label, label thẳng hàng
  centerLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.primary,
    marginTop: 4,
    textAlign: 'center',
  },
});

export default PreLoginNavigator;
