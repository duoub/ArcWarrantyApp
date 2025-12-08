/**
 * Reusable Info Box Component
 * Standardized informational message box
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../../config/theme';

interface InfoBoxProps {
  message: string;
  icon?: string;
  type?: 'info' | 'warning' | 'error' | 'success';
}

export const InfoBox: React.FC<InfoBoxProps> = ({
  message,
  icon = 'ℹ️',
  type = 'info',
}) => {
  const getColorForType = () => {
    switch (type) {
      case 'warning':
        return COLORS.warning;
      case 'error':
        return COLORS.error;
      case 'success':
        return COLORS.success;
      default:
        return COLORS.info;
    }
  };

  const color = getColorForType();

  return (
    <View style={[styles.container, { backgroundColor: `${color}08`, borderLeftColor: color }]}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={[styles.text, { color }]}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    borderLeftWidth: 3,
  },
  icon: {
    fontSize: 16,
    marginRight: SPACING.sm,
  },
  text: {
    ...TYPOGRAPHY.caption,
    flex: 1,
    lineHeight: 18,
  },
});
