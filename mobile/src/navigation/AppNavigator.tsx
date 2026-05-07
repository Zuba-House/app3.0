import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/colors';

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
import OrderDetailScreen from '../screens/Orders/OrderDetailScreen';

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

const Tab = createBottomTabNavigator<MainTabParamList>();
const MainStack = createNativeStackNavigator<MainStackParamList>();

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
const AppNavigator = () => {
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
      <MainStack.Screen
        name="OrderDetail"
        component={OrderDetailScreen}
        options={{ title: 'Order details', headerShown: true }}
      />
    </MainStack.Navigator>
  );
};

export default AppNavigator;
