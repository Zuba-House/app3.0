import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../features/auth/LoginScreen';
import RegisterScreen from '../features/auth/RegisterScreen';
import ForgotPasswordScreen from '../features/auth/ForgotPasswordScreen';
import VerifyOtpScreen from '../features/auth/VerifyOtpScreen';
import ResetPasswordScreen from '../features/auth/ResetPasswordScreen';

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  VerifyOtp: undefined;
  ResetPassword: undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

const AuthNavigator: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="VerifyOtp" component={VerifyOtpScreen} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
    </Stack.Navigator>
  );
};

export default AuthNavigator;
