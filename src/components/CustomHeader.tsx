import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { COLORS, SPACING, SHADOWS } from '../config/theme';

interface CustomHeaderProps {
  title: string;
  rightIcon?: React.ReactNode;
  onRightPress?: () => void;
  leftIcon?: React.ReactNode;
  onLeftPress?: () => void;
}

const CustomHeader: React.FC<CustomHeaderProps> = ({
  title,
  rightIcon,
  onRightPress,
  leftIcon,
  onLeftPress,
}) => {
  return (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        {/* Left Icon */}
        {leftIcon && onLeftPress ? (
          <TouchableOpacity onPress={onLeftPress} style={styles.leftButton}>
            {leftIcon}
          </TouchableOpacity>
        ) : (
          <View style={styles.leftButton} />
        )}

        {/* Title */}
        <Text style={styles.headerTitle}>{title}</Text>

        {/* Right Icon */}
        {rightIcon && onRightPress ? (
          <TouchableOpacity onPress={onRightPress} style={styles.rightButton}>
            {rightIcon}
          </TouchableOpacity>
        ) : (
          <View style={styles.rightButton} />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: COLORS.primary,
    paddingTop: Platform.OS === 'ios' ? 44 : 0, // Status bar height for iOS
    ...SHADOWS.md,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 56, // Standard header height
    paddingHorizontal: SPACING.md,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.white,
    flex: 1,
    textAlign: 'center',
  },
  leftButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default CustomHeader;
