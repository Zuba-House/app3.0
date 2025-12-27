/**
 * App Navigator
 * Main navigation structure
 */

import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants/config';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setCredentials } from '../store/slices/authSlice';
import { User } from '../types/user.types';

// Screens
import LoginScreen from '../screens/Auth/LoginScreen';
import RegisterScreen from '../screens/Auth/RegisterScreen';
import HomeScreen from '../screens/Home/HomeScreen';
import CartScreen from '../screens/Cart/CartScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';
import ProductDetailScreen from '../screens/Products/ProductDetailScreen';

// Navigation Types
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  ProductDetail: { productId: string };
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Cart: undefined;
  Profile: undefined;
};

const RootStack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();
const MainStack = createNativeStackNavigator();

// Auth Navigator
const AuthNavigator = () => {
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
    </AuthStack.Navigator>
  );
};

// Tab Navigator
const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#8E8E93',
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Cart" component={CartScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

// Main Navigator (Tabs + Product Detail)
const MainNavigator = () => {
  return (
    <MainStack.Navigator>
      <MainStack.Screen
        name="MainTabs"
        component={TabNavigator}
        options={{ headerShown: false }}
      />
      <MainStack.Screen
        name="ProductDetail"
        component={ProductDetailScreen}
        options={{ title: 'Product Details' }}
      />
    </MainStack.Navigator>
  );
};

// Root Navigator
const AppNavigator: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Check if user is logged in on app start
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
        const userJson = await AsyncStorage.getItem(STORAGE_KEYS.USER);

        if (token && userJson) {
          const user = JSON.parse(userJson) as User;
          dispatch(
            setCredentials({
              user,
              accessToken: token,
              refreshToken: (await AsyncStorage.getItem(
                STORAGE_KEYS.REFRESH_TOKEN
              )) || '',
            })
          );
        }
      } catch (error) {
        console.error('Error checking auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [dispatch]);

  if (isLoading) {
    // Show splash screen or loading indicator
    return null; // Replace with SplashScreen component
  }

  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <RootStack.Screen name="Main" component={MainNavigator} />
        ) : (
          <RootStack.Screen name="Auth" component={AuthNavigator} />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
