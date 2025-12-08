/**
 * Reusable Card Component
 * Standardized card container with shadow
 */

import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS } from '../../config/theme';

interface CardProps {
  children: React.ReactNode;
  size?: 'small' | 'large';
  style?: ViewStyle;
}

export const Card: React.FC<CardProps> = ({ children, size = 'large', style }) => {
  return (
    <View style={[size === 'large' ? styles.cardLarge : styles.cardSmall, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  cardLarge: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  cardSmall: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
});
