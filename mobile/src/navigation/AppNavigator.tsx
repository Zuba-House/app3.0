import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/colors';
import { lazyScreen } from './lazyScreen';

import HomeScreen from '../screens/Home/HomeScreen';
import type { ProductListParams } from '../constants/routes';

const SearchScreen = lazyScreen(() => import('../screens/Search/SearchScreen'));
const WishlistScreen = lazyScreen(() => import('../screens/Wishlist/WishlistScreen'));
const OrdersScreen = lazyScreen(() => import('../screens/Orders/OrdersScreen'));
const ProfileScreen = lazyScreen(() => import('../screens/Profile/ProfileScreen'));
const ProductDetailScreen = lazyScreen(() => import('../screens/Products/ProductDetailScreen'));
const OrderDetailScreen = lazyScreen(() => import('../screens/Orders/OrderDetailScreen'));
const ProductListScreen = lazyScreen(() => import('../screens/Products/ProductListScreen'));
const BrandsScreen = lazyScreen(() => import('../screens/Brands/BrandsScreen'));
const CategoriesScreen = lazyScreen(() => import('../screens/Categories/CategoriesScreen'));
const CartScreen = lazyScreen(() => import('../screens/Cart/CartScreen'));
const CheckoutScreen = lazyScreen(() => import('../screens/Checkout/CheckoutScreen'));
const PaymentScreen = lazyScreen(() => import('../screens/Checkout/PaymentScreen'));
const OrderConfirmationScreen = lazyScreen(() => import('../screens/Checkout/OrderConfirmationScreen'));
const AddAddressScreen = lazyScreen(() => import('../screens/Address/AddAddressScreen'));
const SelectLocationScreen = lazyScreen(() => import('../screens/Address/SelectLocationScreen'));
const HelpSupportScreen = lazyScreen(() => import('../screens/Support/HelpSupportScreen'));
const ReturnPolicyScreen = lazyScreen(() => import('../screens/Support/ReturnPolicyScreen'));
const SafePaymentsPrivacyScreen = lazyScreen(() => import('../screens/Support/SafePaymentsPrivacyScreen'));
const SettingsAboutScreen = lazyScreen(() => import('../screens/Settings/AboutScreen'));
const NotificationPreferencesScreen = lazyScreen(() => import('../screens/Settings/NotificationPreferencesScreen'));
const SettingsScreen = lazyScreen(() => import('../screens/Settings/SettingsScreen'));
const EditProfileScreen = lazyScreen(() => import('../screens/Settings/EditProfileScreen'));
const ChangePasswordScreen = lazyScreen(() => import('../screens/Settings/ChangePasswordScreen'));
const PrivacySettingsScreen = lazyScreen(() => import('../screens/Settings/PrivacySettingsScreen'));

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
  SettingsAbout: undefined;
  Notifications: undefined;
  NotificationPreferences: undefined;
  Settings: undefined;
  EditProfile: undefined;
  ChangePassword: undefined;
  PrivacySettings: undefined;
  ProductList: ProductListParams;
  Categories: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();
const MainStack = createNativeStackNavigator<MainStackParamList>();

const stackHeaderOptions = {
  headerStyle: { backgroundColor: '#f5f0eb' },
  headerTintColor: '#1a2332',
  headerTitleStyle: { fontWeight: '700' as const, color: '#1a2332' },
  headerShadowVisible: false,
  headerBackTitleVisible: false,
};

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
            <Ionicons name={focused ? 'home' : 'home-outline'} size={24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'search' : 'search-outline'} size={24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Wishlist"
        component={WishlistScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'heart' : 'heart-outline'} size={24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Orders"
        component={OrdersScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'bag' : 'bag-outline'} size={24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Account"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'person' : 'person-outline'} size={24} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  return (
    <MainStack.Navigator screenOptions={stackHeaderOptions}>
      <MainStack.Screen
        name="MainTabs"
        component={TabNavigator}
        options={{ headerShown: false, title: 'Home' }}
      />
      <MainStack.Screen
        name="ProductDetail"
        component={ProductDetailScreen}
        options={{ headerShown: false, title: 'Product' }}
      />
      <MainStack.Screen
        name="Brands"
        component={BrandsScreen}
        options={{ title: 'All Brands', headerShown: false }}
      />
      <MainStack.Screen
        name="Cart"
        component={CartScreen}
        options={{ title: 'Cart', headerShown: false, headerBackTitle: 'Home' }}
      />
      <MainStack.Screen
        name="Checkout"
        component={CheckoutScreen}
        options={{ headerShown: false, title: 'Checkout', headerBackTitle: 'Cart' }}
      />
      <MainStack.Screen
        name="Payment"
        component={PaymentScreen}
        options={{ headerShown: false, title: 'Payment', headerBackTitle: 'Checkout' }}
      />
      <MainStack.Screen
        name="OrderConfirmation"
        component={OrderConfirmationScreen}
        options={{ headerShown: false, title: 'Confirmation', headerBackTitle: 'Home' }}
      />
      <MainStack.Screen
        name="AddAddress"
        component={AddAddressScreen}
        options={{ headerShown: false, title: 'Address', headerBackTitle: 'Account' }}
      />
      <MainStack.Screen
        name="SelectLocation"
        component={SelectLocationScreen}
        options={{ headerShown: false, title: 'Location', headerBackTitle: 'Checkout' }}
      />
      <MainStack.Screen
        name="HelpSupport"
        component={HelpSupportScreen}
        options={{ headerShown: false, title: 'Help', headerBackTitle: 'Account' }}
      />
      <MainStack.Screen
        name="ReturnPolicy"
        component={ReturnPolicyScreen}
        options={{ headerShown: false, title: 'Returns', headerBackTitle: 'Account' }}
      />
      <MainStack.Screen
        name="SafePaymentsPrivacy"
        component={SafePaymentsPrivacyScreen}
        options={{ headerShown: false, title: 'Privacy', headerBackTitle: 'Account' }}
      />
      <MainStack.Screen
        name="About"
        component={SettingsAboutScreen}
        options={{ headerShown: false, title: 'About', headerBackTitle: 'Account' }}
      />
      <MainStack.Screen
        name="SettingsAbout"
        component={SettingsAboutScreen}
        options={{ headerShown: false, title: 'About', headerBackTitle: 'Settings' }}
      />
      <MainStack.Screen
        name="Notifications"
        component={NotificationPreferencesScreen}
        options={{ headerShown: false, title: 'Notifications', headerBackTitle: 'Account' }}
      />
      <MainStack.Screen
        name="NotificationPreferences"
        component={NotificationPreferencesScreen}
        options={{ headerShown: false, title: 'Notifications', headerBackTitle: 'Settings' }}
      />
      <MainStack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ headerShown: false, title: 'Settings', headerBackTitle: 'Account' }}
      />
      <MainStack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{ headerShown: false, title: 'Edit Profile', headerBackTitle: 'Settings' }}
      />
      <MainStack.Screen
        name="ChangePassword"
        component={ChangePasswordScreen}
        options={{ headerShown: false, title: 'Change Password', headerBackTitle: 'Settings' }}
      />
      <MainStack.Screen
        name="PrivacySettings"
        component={PrivacySettingsScreen}
        options={{ headerShown: false, title: 'Privacy', headerBackTitle: 'Settings' }}
      />
      <MainStack.Screen
        name="ProductList"
        component={ProductListScreen}
        options={{
          title: 'Products',
          headerShown: true,
          headerBackTitle: 'Home',
          headerBackTitleVisible: true,
        }}
      />
      <MainStack.Screen
        name="Categories"
        component={CategoriesScreen}
        options={{ headerShown: false, title: 'Categories', headerBackTitle: 'Home' }}
      />
      <MainStack.Screen
        name="OrderDetail"
        component={OrderDetailScreen}
        options={{
          title: 'Order Details',
          headerShown: true,
          headerBackTitle: 'Orders',
          headerBackTitleVisible: true,
        }}
      />
    </MainStack.Navigator>
  );
};

export default AppNavigator;
