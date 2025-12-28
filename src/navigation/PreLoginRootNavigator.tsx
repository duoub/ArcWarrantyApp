import React from 'react';
import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';
import LoginScreen from '../screens/auth/LoginScreen/LoginScreen';
import SignupScreen from '../screens/auth/SignupScreen/SignupScreen';
import DealerSignupScreen from '../screens/auth/SignupScreen/DealerSignupScreen';
import OTPScreen from '../screens/auth/OTPScreen/OTPScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen/ForgotPasswordScreen';
import WarrantyStationListScreen from '../screens/main/WarrantyStationListScreen/WarrantyStationListScreen';
import WarrantyActivationScreen from '../screens/main/WarrantyActivationScreen/WarrantyActivationScreen';
import DistributionSystemScreen from '../screens/main/DistributionSystemScreen/DistributionSystemScreen';

export type PreLoginRootStackParamList = {
  Login: undefined;
  Signup: undefined;
  DealerSignup: undefined;
  OTP: { email: string; phone?: string };
  ForgotPassword: undefined;
  WarrantyStationList: undefined;
  WarrantyActivation: undefined;
  DistributionSystem: undefined;
};

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
      <Stack.Screen name="DealerSignup" component={DealerSignupScreen} />
      <Stack.Screen name="OTP" component={OTPScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="WarrantyStationList" component={WarrantyStationListScreen} />
      <Stack.Screen name="WarrantyActivation" component={WarrantyActivationScreen} />
      <Stack.Screen name="DistributionSystem" component={DistributionSystemScreen} />
    </Stack.Navigator>
  );
};

export default PreLoginRootNavigator;
