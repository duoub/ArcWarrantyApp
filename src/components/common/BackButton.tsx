/**
 * Reusable Back Button Component
 * Standardized navigation back button
 */

import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, BORDER_RADIUS } from '../../config/theme';
import { Icon } from './Icon';

interface BackButtonProps {
  onPress: () => void;
  disabled?: boolean;
}

export const BackButton: React.FC<BackButtonProps> = ({
  onPress,
  disabled = false,
}) => {
  return (
    <TouchableOpacity
      style={styles.button}
      onPress={onPress}
      disabled={disabled}
    >
      <Icon name="back" size={20} color={COLORS.textPrimary} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
});
