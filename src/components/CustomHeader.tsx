import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Image } from 'react-native';
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

        {/* Right Side - Logo or Icon */}
        {rightIcon && onRightPress ? (
          <TouchableOpacity onPress={onRightPress} style={styles.rightButton}>
            {rightIcon}
          </TouchableOpacity>
        ) : (
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Image
                source={require('../assets/images/logo.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
          </View>
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
  logoContainer: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
  },
  logo: {
    width: 28,
    height: 28,
  },
});

export default CustomHeader;
