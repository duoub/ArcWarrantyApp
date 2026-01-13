import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { CommonActions } from '@react-navigation/native';
import { COLORS, SPACING, SHADOWS } from '../config/theme';
import { Icon } from '../components/common';
// import { DistributorType } from '../types/distributionSystem';
import HomeScreen from '../screens/main/HomeScreen/HomeScreen';
import MenuScreen from '../screens/main/MenuScreen/MenuScreen';
import WarrantyActivationScreen from '../screens/main/WarrantyActivationScreen/WarrantyActivationScreen';
import InOutScreen from '../screens/main/InOutScreen/InOutScreen';
import ProfileScreen from '../screens/main/ProfileScreen/ProfileScreen';
import EditProfileScreen from '../screens/main/ProfileScreen/EditProfileScreen';
import ChangePasswordScreen from '../screens/main/ChangePasswordScreen/ChangePasswordScreen';
import SalesProgramScreen from '../screens/main/SalesProgramScreen/SalesProgramScreen';
import InventoryScreen from '../screens/main/InventoryScreen/InventoryScreen';
import DealerListScreen from '../screens/main/DealerListScreen/DealerListScreen';
import DealerSignupScreen from '../screens/auth/SignupScreen/DealerSignupScreen';
import WarrantyStationListScreen from '../screens/main/WarrantyStationListScreen/WarrantyStationListScreen';
import WarrantyReportScreen from '../screens/main/WarrantyReportScreen/WarrantyReportScreen';
import WarrantyLookupScreen from '../screens/main/WarrantyLookupScreen/WarrantyLookupScreen';
import WarrantyCaseListScreen from '../screens/main/WarrantyCaseListScreen/WarrantyCaseListScreen';
import ErrorCodeListScreen from '../screens/main/ErrorCodeListScreen/ErrorCodeListScreen';
import ProductLookupScreen from '../screens/main/ProductLookupScreen/ProductLookupScreen';
import ProductScreen from '../screens/main/ProductScreen/ProductScreen';
import DistributionSystemScreen from '../screens/main/DistributionSystemScreen/DistributionSystemScreen';
import NotificationScreen from '../screens/main/NotificationScreen/NotificationScreen';
import NewsScreen from '../screens/main/NewsScreen/NewsScreen';
import ContactScreen from '../screens/main/ContactScreen/ContactScreen';
import PaymentDetailScreen from '../screens/main/PaymentDetailScreen/PaymentDetailScreen';
import RewardDetailScreen from '../screens/main/RewardDetailScreen/RewardDetailScreen';
import { UserType } from '../types/user';

export type MainTabParamList = {
  HomeStack: undefined;
  MenuStack: undefined;
  InOutStack: undefined;
  WarrantyActivation: undefined;
  ProfileStack: undefined;
};

export type HomeStackParamList = {
  Home: undefined;
  SalesProgram: undefined;
  Inventory: undefined;
  PaymentDetail: undefined;
  RewardDetail: undefined;
  DealerList: undefined;
  DealerSignup: undefined;
};

export type MenuStackParamList = {
  Menu: undefined;
  WarrantyActivation: undefined;
  WarrantyStationList: undefined;
  WarrantyReport: undefined;
  WarrantyLookup: undefined;
  WarrantyCaseList: undefined;
  ErrorCodeList: undefined;
  ProductLookup: undefined;
  Product: undefined;
  DistributionSystem: { type?: UserType } | undefined;
  Notification: undefined;
  News: undefined;
  Contact: undefined;
};

export type InOutStackParamList = {
  InOut: {
    selectedDealer?: {
      id: number;
      name: string;
      phone: string;
      address: string;
    };
  } | undefined;
  DealerList: undefined;
};

export type ProfileStackParamList = {
  Profile: undefined;
  EditProfile: undefined;
  ChangePassword: undefined;
};

const HomeStack = createStackNavigator<HomeStackParamList>();
const MenuStack = createStackNavigator<MenuStackParamList>();
const InOutStack = createStackNavigator<InOutStackParamList>();
const ProfileStack = createStackNavigator<ProfileStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// Custom Tab Button Component for Center Button
const CenterTabButton = ({ onPress, focused }: { onPress: () => void; focused: boolean }) => (
  <TouchableOpacity
    style={styles.centerButton}
    onPress={onPress}
    activeOpacity={0.8}
  >
    <View style={[styles.centerButtonInner, focused && styles.centerButtonFocused]}>
      <Icon name="in-out" size={32} color={COLORS.white} />
    </View>
  </TouchableOpacity>
);

// Home Stack Navigator
const HomeStackNavigator = () => {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="Home" component={HomeScreen} />
      <HomeStack.Screen name="SalesProgram" component={SalesProgramScreen} />
      <HomeStack.Screen name="Inventory" component={InventoryScreen} />
      <HomeStack.Screen name="PaymentDetail" component={PaymentDetailScreen} />
      <HomeStack.Screen name="RewardDetail" component={RewardDetailScreen} />
      <HomeStack.Screen name="DealerList" component={DealerListScreen} />
      <HomeStack.Screen name="DealerSignup" component={DealerSignupScreen} />
    </HomeStack.Navigator>
  );
};

// Menu Stack Navigator
const MenuStackNavigator = () => {
  return (
    <MenuStack.Navigator screenOptions={{ headerShown: false }}>
      <MenuStack.Screen name="Menu" component={MenuScreen} />
      <MenuStack.Screen name="WarrantyActivation" component={WarrantyActivationScreen} />
      <MenuStack.Screen name="WarrantyStationList" component={WarrantyStationListScreen} />
      <MenuStack.Screen name="WarrantyReport" component={WarrantyReportScreen} />
      <MenuStack.Screen name="WarrantyLookup" component={WarrantyLookupScreen} />
      <MenuStack.Screen name="WarrantyCaseList" component={WarrantyCaseListScreen} />
      <MenuStack.Screen name="ErrorCodeList" component={ErrorCodeListScreen} />
      <MenuStack.Screen name="ProductLookup" component={ProductLookupScreen} />
      <MenuStack.Screen name="Product" component={ProductScreen} />
      <MenuStack.Screen name="DistributionSystem" component={DistributionSystemScreen} />
      <MenuStack.Screen name="Notification" component={NotificationScreen} />
      <MenuStack.Screen name="News" component={NewsScreen} />
      <MenuStack.Screen name="Contact" component={ContactScreen} />
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

// Profile Stack Navigator
const ProfileStackNavigator = () => {
  return (
    <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStack.Screen name="Profile" component={ProfileScreen} />
      <ProfileStack.Screen name="EditProfile" component={EditProfileScreen} />
      <ProfileStack.Screen name="ChangePassword" component={ChangePasswordScreen} />
    </ProfileStack.Navigator>
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
            <Icon name="home" size={24} color={color} />
          ),
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{ name: 'HomeStack' }],
              })
            );
          },
        })}
      />
      <Tab.Screen
        name="WarrantyActivation"
        component={WarrantyActivationScreen}
        options={{
          title: 'Kích hoạt',
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <Icon name="warranty-activation" size={24} color={color} />
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
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{ name: 'InOutStack' }],
              })
            );
          },
        })}
      />
      <Tab.Screen
        name="ProfileStack"
        component={ProfileStackNavigator}
        options={{
          title: 'Tài khoản',
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <Icon name="profile" size={24} color={color} />
          ),
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{ name: 'ProfileStack' }],
              })
            );
          },
        })}
      />
      <Tab.Screen
        name="MenuStack"
        component={MenuStackNavigator}
        options={{
          title: 'Menu',
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <Icon name="menu" size={24} color={color} />
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
});

export default MainNavigator;
