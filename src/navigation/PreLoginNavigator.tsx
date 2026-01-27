import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { COLORS, SPACING, SHADOWS } from '../config/theme';
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
    title: 'Tra cứu bảo hành',
    screen: 'WarrantyLookup',
  },
];

// Custom Tab Button Component for Center Button
const CenterTabButton = ({ onPress }: { onPress: () => void }) => (
  <TouchableOpacity
    style={styles.centerButton}
    onPress={onPress}
    activeOpacity={0.8}
  >
    <View style={styles.centerButtonInner}>
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
  // Center button
  centerButton: {
    flex: 0.8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -30,
  },
  centerButtonInner: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.lg,
    borderWidth: 5,
    borderColor: COLORS.white,
  },
});

export default PreLoginNavigator;
