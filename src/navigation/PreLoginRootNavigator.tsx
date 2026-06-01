import React from 'react';
import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';
import LoginScreen from '../screens/auth/LoginScreen/LoginScreen';
import SignupScreen from '../screens/auth/SignupScreen/SignupScreen';
import AccountInfoScreen from '../screens/auth/SignupScreen/AccountInfoScreen';
import DealerSignupScreen from '../screens/auth/SignupScreen/DealerSignupScreen';
import TechnicianSignupScreen from '../screens/auth/SignupScreen/TechnicianSignupScreen';
import CustomerSignupScreen from '../screens/auth/SignupScreen/CustomerSignupScreen';
import OTPScreen from '../screens/auth/OTPScreen/OTPScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen/ForgotPasswordScreen';
import WarrantyStationListScreen from '../screens/main/WarrantyStationListScreen/WarrantyStationListScreen';
import WarrantyActivationScreen from '../screens/main/WarrantyActivationScreen/WarrantyActivationScreen';
import DistributionSystemScreen from '../screens/main/DistributionSystemScreen/DistributionSystemScreen';
import WarrantyLookupScreen from '../screens/main/WarrantyLookupScreen/WarrantyLookupScreen';

// Loại hội viên chi tiết được chọn ở SignupScreen (C2/C3)
export type SignupSubType =
  | 'enterprise'        // Doanh nghiệp (C2 & C3 - dùng chung luồng DealerSignup)
  | 'household'         // Hộ kinh doanh (C2 & C3 - dùng chung luồng DealerSignup)
  | 'individual-no-shop' // C3 - Cá nhân không có cửa hàng
  | 'individual-shop';  // C3 - Cá nhân có cửa hàng

// Thông tin tài khoản nhập ở bước 1 (form ngắn), truyền sang form chi tiết
export type AccountInfoPrefill = {
  phone: string;
  password: string;
  repassword: string;
  subType?: SignupSubType;
  title?: string; // Tiêu đề header (C2/C3) truyền từ AccountInfo sang form chi tiết
};

export type PreLoginRootStackParamList = {
  Login: undefined;
  Signup: undefined;
  AccountInfo: {
    target: 'DealerSignup' | 'TechnicianSignup';
    title: string;
    subType: SignupSubType;
  };
  DealerSignup: AccountInfoPrefill | undefined;
  TechnicianSignup: AccountInfoPrefill | undefined;
  CustomerSignup: undefined;
  OTP: { email: string; phone?: string };
  ForgotPassword: undefined;
  WarrantyStationList: undefined;
  WarrantyActivation: undefined;
  WarrantyLookup: undefined;
  DistributionSystem: undefined;
};

// Alias for backwards compatibility with screens using AuthStackParamList
export type AuthStackParamList = PreLoginRootStackParamList;

const Stack = createStackNavigator<PreLoginRootStackParamList>();

const PreLoginRootNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#FFFFFF' },
        cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="AccountInfo" component={AccountInfoScreen} />
      <Stack.Screen name="DealerSignup" component={DealerSignupScreen} />
      <Stack.Screen name="TechnicianSignup" component={TechnicianSignupScreen} />
      <Stack.Screen name="CustomerSignup" component={CustomerSignupScreen} />
      <Stack.Screen name="OTP" component={OTPScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="WarrantyStationList" component={WarrantyStationListScreen} />
      <Stack.Screen name="WarrantyActivation" component={WarrantyActivationScreen} />
      <Stack.Screen name="WarrantyLookup" component={WarrantyLookupScreen} />
      <Stack.Screen name="DistributionSystem" component={DistributionSystemScreen} />
    </Stack.Navigator>
  );
};

export default PreLoginRootNavigator;
