import React from 'react';
import { Text, View, TouchableOpacity, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { COLORS, SPACING, SHADOWS } from '../config/theme';
import HomeScreen from '../screens/main/HomeScreen/HomeScreen';
import WarrantyActivationScreen from '../screens/main/WarrantyActivationScreen/WarrantyActivationScreen';
import InOutScreen from '../screens/main/InOutScreen/InOutScreen';

export type MainTabParamList = {
  Home: undefined;
  InOut: undefined;
  WarrantyActivation: undefined;
  // Add more screens later: Profile, etc.
};

const Tab = createBottomTabNavigator<MainTabParamList>();

// Custom Tab Button Component for Center Button
const CenterTabButton = ({ onPress, focused }: { onPress: () => void; focused: boolean }) => (
  <TouchableOpacity
    style={styles.centerButton}
    onPress={onPress}
    activeOpacity={0.8}
  >
    <View style={[styles.centerButtonInner, focused && styles.centerButtonFocused]}>
      <Text style={styles.centerButtonIcon}>📥</Text>
    </View>
  </TouchableOpacity>
);

const MainNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: COLORS.primary,
        },
        headerTintColor: COLORS.white,
        headerTitleStyle: {
          fontWeight: '700',
          fontSize: 18,
        },
        tabBarStyle: {
          backgroundColor: COLORS.white,
          borderTopWidth: 1,
          borderTopColor: COLORS.gray200,
          paddingTop: SPACING.xs,
          paddingBottom: SPACING.xs,
          height: 60,
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.gray500,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 4,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'Trang chủ',
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 24 }}>🏠</Text>
          ),
        }}
      />
      <Tab.Screen
        name="InOut"
        component={InOutScreen}
        options={{
          title: 'IN/OUT',
          headerShown: false,
          tabBarButton: (props) => (
            <CenterTabButton
              onPress={() => {
                if (props.onPress) {
                  props.onPress({} as any);
                }
              }}
              focused={props.accessibilityState?.selected || false}
            />
          ),
        }}
      />
      <Tab.Screen
        name="WarrantyActivation"
        component={WarrantyActivationScreen}
        options={{
          title: 'Kích hoạt',
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 24 }}>✅</Text>
          ),
        }}
      />
      {/* Add more tabs later */}
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  centerButton: {
    flex: 1,
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
  centerButtonFocused: {
    backgroundColor: COLORS.primaryDark,
    transform: [{ scale: 1.05 }],
  },
  centerButtonIcon: {
    fontSize: 36,
  },
});

export default MainNavigator;
