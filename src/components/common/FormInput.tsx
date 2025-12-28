/**
 * Reusable Form Input Component
 * Standardized input with label, error handling, and icons
 */

import React from 'react';
import { View, Text, TextInput, TextInputProps, StyleSheet } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../../config/theme';
import { Icon, IconName } from './Icon';

interface FormInputProps extends TextInputProps {
  label: string;
  error?: string;
  icon?: IconName;
  isFocused?: boolean;
  hasError?: boolean;
  rightElement?: React.ReactNode;
}

export const FormInput: React.FC<FormInputProps> = ({
  label,
  error,
  icon,
  isFocused = false,
  hasError = false,
  rightElement,
  ...textInputProps
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View
        style={[
          styles.inputWrapper,
          isFocused && styles.inputWrapperFocused,
          hasError && styles.inputWrapperError,
        ]}
      >
        {icon && <Icon name={icon} size={20} color={COLORS.gray500} style={styles.iconStyle} />}
        <TextInput
          style={styles.input}
          placeholderTextColor={COLORS.gray400}
          {...textInputProps}
        />
        {rightElement}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
  },
  label: {
    ...TYPOGRAPHY.label,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray50,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 2,
    borderColor: COLORS.gray200,
    paddingHorizontal: SPACING.md,
    height: 56,
  },
  inputWrapperFocused: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.white,
  },
  inputWrapperError: {
    borderColor: COLORS.error,
  },
  input: {
    flex: 1,
    ...TYPOGRAPHY.body,
    color: COLORS.textPrimary,
  },
  iconStyle: {
    marginRight: SPACING.sm,
  },
  errorText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.error,
    marginTop: SPACING.xs,
  },
});
