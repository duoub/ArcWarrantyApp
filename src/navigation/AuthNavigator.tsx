import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../screens/auth/LoginScreen/LoginScreen';
import SignupScreen from '../screens/auth/SignupScreen/SignupScreen';
import DealerSignupScreen from '../screens/auth/SignupScreen/DealerSignupScreen';
import OTPScreen from '../screens/auth/OTPScreen/OTPScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen/ForgotPasswordScreen';

export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
  DealerSignup: undefined;
  OTP: { email: string; phone?: string };
  ForgotPassword: undefined;
};

const Stack = createStackNavigator<AuthStackParamList>();

const AuthNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#FFFFFF' },
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="DealerSignup" component={DealerSignupScreen} />
      <Stack.Screen name="OTP" component={OTPScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Stack.Navigator>
  );
};

export default AuthNavigator;
