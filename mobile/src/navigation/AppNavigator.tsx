/**
 * App Navigator
 * Main navigation structure
 */

import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { STORAGE_KEYS, API_ENDPOINTS } from '../constants/config';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setCredentials } from '../store/slices/authSlice';
import { setShippingLocation } from '../store/slices/shippingLocationSlice';
import { User } from '../types/user.types';
import Colors from '../constants/colors';
import SplashScreen from '../components/SplashScreen';
import { notificationService } from '../services/notification.service';
import { analyticsService } from '../services/analytics.service';
import { locationService } from '../services/location.service';

// Screens
import LoginScreen from '../screens/Auth/LoginScreen';
import RegisterScreen from '../screens/Auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/Auth/ForgotPasswordScreen';
import VerifyOtpScreen from '../screens/Auth/VerifyOtpScreen';
import ResetPasswordScreen from '../screens/Auth/ResetPasswordScreen';
import HomeScreen from '../screens/Home/HomeScreen';
import SearchScreen from '../screens/Search/SearchScreen';
import WishlistScreen from '../screens/Wishlist/WishlistScreen';
import OrdersScreen from '../screens/Orders/OrdersScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';
import ProductDetailScreen from '../screens/Products/ProductDetailScreen';
import BrandsScreen from '../screens/Brands/BrandsScreen';
import CartScreen from '../screens/Cart/CartScreen';
import CheckoutScreen from '../screens/Checkout/CheckoutScreen';
import PaymentScreen from '../screens/Checkout/PaymentScreen';
import OrderConfirmationScreen from '../screens/Checkout/OrderConfirmationScreen';
import AddAddressScreen from '../screens/Address/AddAddressScreen';
import SelectLocationScreen from '../screens/Address/SelectLocationScreen';
import HelpSupportScreen from '../screens/Support/HelpSupportScreen';
import ReturnPolicyScreen from '../screens/Support/ReturnPolicyScreen';
import SafePaymentsPrivacyScreen from '../screens/Support/SafePaymentsPrivacyScreen';
import AboutScreen from '../screens/About/AboutScreen';
import NotificationsScreen from '../screens/Settings/NotificationsScreen';

// Navigation Types
export type RootStackParamList = {
  Auth: { screen?: 'Login' | 'Register' } | undefined;
  Main: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  VerifyOtp: { email: string; isEmailVerification?: boolean };
  ResetPassword: { email: string };
};

export type MainTabParamList = {
  Home: undefined;
  Search: undefined;
  Wishlist: undefined;
  Orders: undefined;
  Account: undefined;
};

export type MainStackParamList = {
  MainTabs: undefined;
  ProductDetail: { productId: string };
  Brands: { brandId?: string } | undefined;
  Cart: undefined;
  Checkout: undefined;
  Payment: { orderId: string; amount: number; onSuccess?: () => void };
  OrderConfirmation: { orderId: string; total: number };
  AddAddress: { onSave?: (address: any) => void; editAddress?: any };
  SelectLocation: undefined;
  OrderDetail: { orderId: string };
  HelpSupport: undefined;
  ReturnPolicy: undefined;
  SafePaymentsPrivacy: undefined;
  About: undefined;
  Notifications: undefined;
};

const RootStack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();
const MainStack = createNativeStackNavigator<MainStackParamList>();

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
      <AuthStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <AuthStack.Screen name="VerifyOtp" component={VerifyOtpScreen} />
      <AuthStack.Screen name="ResetPassword" component={ResetPasswordScreen} />
    </AuthStack.Navigator>
  );
};

// Tab Navigator
const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.secondary,
        tabBarInactiveTintColor: Colors.primary,
        tabBarStyle: {
          backgroundColor: Colors.white,
          borderTopWidth: 1,
          borderTopColor: Colors.border,
          height: 65,
          paddingBottom: 10,
          paddingTop: 8,
          elevation: 8,
          shadowColor: Colors.shadow,
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 4,
        },
        tabBarIconStyle: {
          marginTop: 4,
        },
      }}
      backBehavior="firstRoute"
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? 'home' : 'home-outline'} 
              size={24} 
              color={color} 
            />
          ),
        }}
      />
      <Tab.Screen 
        name="Search" 
        component={SearchScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? 'search' : 'search-outline'} 
              size={24} 
              color={color} 
            />
          ),
        }}
      />
      <Tab.Screen 
        name="Wishlist" 
        component={WishlistScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? 'heart' : 'heart-outline'} 
              size={24} 
              color={color} 
            />
          ),
        }}
      />
      <Tab.Screen 
        name="Orders" 
        component={OrdersScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? 'bag' : 'bag-outline'} 
              size={24} 
              color={color} 
            />
          ),
        }}
      />
      <Tab.Screen 
        name="Account" 
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? 'person' : 'person-outline'} 
              size={24} 
              color={color} 
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

// Main Navigator (Tabs + Product Detail + Checkout)
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
        options={{ 
          headerShown: false,
          title: '',
        }}
      />
      <MainStack.Screen
        name="Brands"
        component={BrandsScreen}
        options={{ title: 'All Brands', headerShown: false }}
      />
      <MainStack.Screen
        name="Cart"
        component={CartScreen}
        options={{ title: 'Shopping Cart', headerShown: false }}
      />
      <MainStack.Screen
        name="Checkout"
        component={CheckoutScreen}
        options={{ headerShown: false }}
      />
      <MainStack.Screen
        name="Payment"
        component={PaymentScreen}
        options={{ headerShown: false }}
      />
      <MainStack.Screen
        name="OrderConfirmation"
        component={OrderConfirmationScreen}
        options={{ headerShown: false }}
      />
      <MainStack.Screen
        name="AddAddress"
        component={AddAddressScreen}
        options={{ headerShown: false }}
      />
      <MainStack.Screen
        name="SelectLocation"
        component={SelectLocationScreen}
        options={{ headerShown: false }}
      />
      <MainStack.Screen
        name="HelpSupport"
        component={HelpSupportScreen}
        options={{ headerShown: false }}
      />
      <MainStack.Screen
        name="ReturnPolicy"
        component={ReturnPolicyScreen}
        options={{ headerShown: false }}
      />
      <MainStack.Screen
        name="SafePaymentsPrivacy"
        component={SafePaymentsPrivacyScreen}
        options={{ headerShown: false }}
      />
      <MainStack.Screen
        name="About"
        component={AboutScreen}
        options={{ headerShown: false }}
      />
      <MainStack.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{ headerShown: false }}
      />
    </MainStack.Navigator>
  );
};

// Root Navigator
const AppNavigator: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Auth rehydration: restore session from AsyncStorage on app launch
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
        const refreshToken = await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
        const userJson = await AsyncStorage.getItem(STORAGE_KEYS.USER);

        if (token) {
          let user: User | null = null;
          if (userJson) {
            try {
              const parsed = JSON.parse(userJson) as User;
              if (parsed && parsed._id && parsed.email) user = parsed;
            } catch {
              // invalid JSON
            }
          }
          if (!user) {
            try {
              const { fetchDataFromApi } = await import('../services/api');
              const userResponse = await fetchDataFromApi<User>(API_ENDPOINTS.GET_CURRENT_USER);
              if (userResponse.success && userResponse.data) {
                user = userResponse.data;
                await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
              }
            } catch {
              // token may be expired; keep storage, will 401 on first request and refresh
            }
          }
          if (user) {
            dispatch(
              setCredentials({
                user,
                accessToken: token,
                refreshToken: refreshToken || '',
              })
            );
            analyticsService.initialize(user._id);
          }
        }
      } catch (error) {
        console.error('Error checking auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
    
    // Initialize push notifications (silently - errors are handled in service)
    const initNotifications = async () => {
      try {
        const token = await notificationService.initialize();
        if (token) {
          // Token registered - will be sent to backend on login
        }
        // If no token, that's fine - notifications are optional
      } catch (error) {
        // Errors are already handled gracefully in notificationService
        // No need to log or show to user
      }
    };
    
    initNotifications();
    
    // Initialize analytics
    analyticsService.initialize();
  }, [dispatch]);

  // Load or auto-detect shipping location (non-blocking)
  useEffect(() => {
    const initShippingLocation = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEYS.SHIPPING_LOCATION);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed?.countryCode) {
            dispatch(setShippingLocation(parsed));
            return;
          }
        }
        const loc = await locationService.getLocationFromIP();
        if (loc) {
          const state = {
            countryCode: loc.countryCode,
            countryName: loc.countryName,
            region: loc.region ?? null,
            city: loc.city ?? null,
          };
          dispatch(setShippingLocation(state));
          await AsyncStorage.setItem(STORAGE_KEYS.SHIPPING_LOCATION, JSON.stringify(state));
        }
      } catch {
        // ignore
      }
    };
    initShippingLocation();
  }, [dispatch]);

  // Show beautiful animated splash screen
  if (showSplash) {
    return (
      <SplashScreen
        onFinish={() => setShowSplash(false)}
        duration={2500}
      />
    );
  }

  if (isLoading) {
    // Brief loading state after splash
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: Colors.primary }}>Zuba House</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {/* Always show Main (Home) first - Better UX, allow browsing without login */}
        <RootStack.Screen name="Main" component={MainNavigator} />
        {/* Auth screens accessible as modal when user wants to login/register */}
        <RootStack.Screen 
          name="Auth" 
          component={AuthNavigator}
          options={{ presentation: 'modal' }}
        />
      </RootStack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
