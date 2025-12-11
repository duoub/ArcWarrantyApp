import React from 'react';
import { Text, View, TouchableOpacity, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { COLORS, SPACING, SHADOWS } from '../config/theme';
import HomeScreen from '../screens/main/HomeScreen/HomeScreen';
import MenuScreen from '../screens/main/MenuScreen/MenuScreen';
import WarrantyActivationScreen from '../screens/main/WarrantyActivationScreen/WarrantyActivationScreen';
import InOutScreen from '../screens/main/InOutScreen/InOutScreen';
import ProfileScreen from '../screens/main/ProfileScreen/ProfileScreen';
import SalesProgramScreen from '../screens/main/SalesProgramScreen/SalesProgramScreen';
import DealerListScreen from '../screens/main/DealerListScreen/DealerListScreen';
import WarrantyStationListScreen from '../screens/main/WarrantyStationListScreen/WarrantyStationListScreen';
import WarrantyReportScreen from '../screens/main/WarrantyReportScreen/WarrantyReportScreen';
import WarrantyLookupScreen from '../screens/main/WarrantyLookupScreen/WarrantyLookupScreen';
import ProductLookupScreen from '../screens/main/ProductLookupScreen/ProductLookupScreen';

export type MainTabParamList = {
  HomeStack: undefined;
  MenuStack: undefined;
  InOutStack: undefined;
  WarrantyActivation: undefined;
  Profile: undefined;
};

export type HomeStackParamList = {
  Home: undefined;
  SalesProgram: undefined;
};

export type MenuStackParamList = {
  Menu: undefined;
  WarrantyStationList: undefined;
  WarrantyReport: undefined;
  WarrantyLookup: undefined;
  ProductLookup: undefined;
};

export type InOutStackParamList = {
  InOut: undefined;
  DealerList: undefined;
};

const HomeStack = createStackNavigator<HomeStackParamList>();
const MenuStack = createStackNavigator<MenuStackParamList>();
const InOutStack = createStackNavigator<InOutStackParamList>();
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

// Home Stack Navigator
const HomeStackNavigator = () => {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="Home" component={HomeScreen} />
      <HomeStack.Screen name="SalesProgram" component={SalesProgramScreen} />
    </HomeStack.Navigator>
  );
};

// Menu Stack Navigator
const MenuStackNavigator = () => {
  return (
    <MenuStack.Navigator screenOptions={{ headerShown: false }}>
      <MenuStack.Screen name="Menu" component={MenuScreen} />
      <MenuStack.Screen name="WarrantyStationList" component={WarrantyStationListScreen} />
      <MenuStack.Screen name="WarrantyReport" component={WarrantyReportScreen} />
      <MenuStack.Screen name="WarrantyLookup" component={WarrantyLookupScreen} />
      <MenuStack.Screen name="ProductLookup" component={ProductLookupScreen} />
    </MenuStack.Navigator>
  );
};

// InOut Stack Navigator
const InOutStackNavigator = () => {
  return (
    <InOutStack.Navigator screenOptions={{ headerShown: false }}>
      <InOutStack.Screen name="InOut" component={InOutScreen} />
      <InOutStack.Screen name="DealerList" component={DealerListScreen} />
    </InOutStack.Navigator>
  );
};

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
        name="HomeStack"
        component={HomeStackNavigator}
        options={{
          title: 'Trang chủ',
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 24 }}>🏠</Text>
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
      <Tab.Screen
        name="InOutStack"
        component={InOutStackNavigator}
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
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Tài khoản',
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 24 }}>👤</Text>
          ),
        }}
      />
      <Tab.Screen
        name="MenuStack"
        component={MenuStackNavigator}
        options={{
          title: 'Menu',
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 24 }}>📋</Text>
          ),
        }}
      />
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
