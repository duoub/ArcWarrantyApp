import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { useAuthStore } from '../store/authStore';
import { COLORS } from '../config/theme';
import PreLoginRootNavigator from './PreLoginRootNavigator';
import MainNavigator from './MainNavigator';

const RootNavigator = () => {
  const { isAuthenticated, isLoading, initialize } = useAuthStore();

  // Initialize auth state from storage on app start
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Show loading screen while initializing
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <MainNavigator /> : <PreLoginRootNavigator />}
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
});

export default RootNavigator;
