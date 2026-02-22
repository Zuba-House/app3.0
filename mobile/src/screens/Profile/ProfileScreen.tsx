/**
 * Profile Screen - TEMU Style
 * User profile with account options
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { selectUser, selectIsAuthenticated, logout } from '../../store/slices/authSlice';
import { authService } from '../../services/auth.service';
import Colors from '../../constants/colors';

interface MenuItem {
  icon: string;
  title: string;
  subtitle?: string;
  onPress: () => void;
  badge?: string | number;
  showArrow?: boolean;
}

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await authService.logout();
              dispatch(logout());
            } catch (error) {
              console.error('Logout error:', error);
              dispatch(logout());
            }
          },
        },
      ]
    );
  };

  const orderMenuItems: MenuItem[] = [
    {
      icon: 'cube-outline',
      title: 'My Orders',
      subtitle: 'View order history',
      onPress: () => navigation.navigate('Orders'),
      showArrow: true,
    },
    {
      icon: 'heart-outline',
      title: 'Wishlist',
      subtitle: 'Saved items',
      onPress: () => navigation.navigate('Wishlist'),
      showArrow: true,
    },
    {
      icon: 'location-outline',
      title: 'Addresses',
      subtitle: 'Manage shipping addresses',
      onPress: () => navigation.navigate('AddAddress'),
      showArrow: true,
    },
  ];

  const settingsMenuItems: MenuItem[] = [
    {
      icon: 'notifications-outline',
      title: 'Notifications',
      subtitle: 'Manage notifications',
      onPress: () => Alert.alert('Coming Soon', 'Notification settings coming soon'),
      showArrow: true,
    },
    {
      icon: 'help-circle-outline',
      title: 'Help & Support',
      subtitle: 'FAQs and customer support',
      onPress: () => Alert.alert('Coming Soon', 'Help center coming soon'),
      showArrow: true,
    },
    {
      icon: 'information-circle-outline',
      title: 'About Zuba House',
      onPress: () => Alert.alert('Zuba House', 'Version 1.0.0\n\nYour favorite African fashion marketplace'),
      showArrow: true,
    },
  ];

  const renderMenuItem = (item: MenuItem, index: number, isLast: boolean) => (
    <TouchableOpacity
      key={index}
      style={[styles.menuItem, !isLast && styles.menuItemBorder]}
      onPress={item.onPress}
      activeOpacity={0.7}
    >
      <View style={styles.menuItemLeft}>
        <View style={styles.menuIconContainer}>
          <Ionicons name={item.icon as any} size={22} color={Colors.primary} />
        </View>
        <View style={styles.menuItemText}>
          <Text style={styles.menuItemTitle}>{item.title}</Text>
          {item.subtitle && (
            <Text style={styles.menuItemSubtitle}>{item.subtitle}</Text>
          )}
        </View>
      </View>
      <View style={styles.menuItemRight}>
        {item.badge && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{item.badge}</Text>
          </View>
        )}
        {item.showArrow && (
          <Ionicons name="chevron-forward" size={20} color={Colors.primary} />
        )}
      </View>
    </TouchableOpacity>
  );

  if (!isAuthenticated) {
    return (
      <View style={styles.guestContainer}>
        {/* Guest Header */}
        <View style={styles.guestHeader}>
          <View style={styles.guestAvatarContainer}>
            <Ionicons name="person" size={48} color={Colors.white} />
          </View>
          <Text style={styles.guestTitle}>Welcome to Zuba House</Text>
          <Text style={styles.guestSubtitle}>
            Sign in to access your account, orders, and wishlist
          </Text>
        </View>

        {/* Auth Buttons */}
        <View style={styles.authButtons}>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => navigation.navigate('Auth', { screen: 'Login' })}
          >
            <Ionicons name="log-in-outline" size={20} color={Colors.white} />
            <Text style={styles.loginButtonText}>Sign In</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.registerButton}
            onPress={() => navigation.navigate('Auth', { screen: 'Register' })}
          >
            <Text style={styles.registerButtonText}>Create Account</Text>
          </TouchableOpacity>
        </View>

        {/* Guest Menu */}
        <View style={styles.menuSection}>
          <Text style={styles.menuSectionTitle}>Quick Links</Text>
          <View style={styles.menuCard}>
            {settingsMenuItems.map((item, index) =>
              renderMenuItem(item, index, index === settingsMenuItems.length - 1)
            )}
          </View>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Profile Header */}
      <View style={styles.header}>
        <View style={styles.profileInfo}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.name || 'User'}</Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.editButton}>
          <Ionicons name="create-outline" size={20} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <TouchableOpacity 
          style={styles.statItem}
          onPress={() => navigation.navigate('Orders')}
        >
          <Ionicons name="cube" size={24} color={Colors.secondary} />
          <Text style={styles.statLabel}>Orders</Text>
        </TouchableOpacity>
        <View style={styles.statDivider} />
        <TouchableOpacity 
          style={styles.statItem}
          onPress={() => navigation.navigate('Wishlist')}
        >
          <Ionicons name="heart" size={24} color={Colors.secondary} />
          <Text style={styles.statLabel}>Wishlist</Text>
        </TouchableOpacity>
        <View style={styles.statDivider} />
        <TouchableOpacity 
          style={styles.statItem}
          onPress={() => navigation.navigate('Cart')}
        >
          <Ionicons name="cart" size={24} color={Colors.secondary} />
          <Text style={styles.statLabel}>Cart</Text>
        </TouchableOpacity>
      </View>

      {/* Order Section */}
      <View style={styles.menuSection}>
        <Text style={styles.menuSectionTitle}>My Account</Text>
        <View style={styles.menuCard}>
          {orderMenuItems.map((item, index) =>
            renderMenuItem(item, index, index === orderMenuItems.length - 1)
          )}
        </View>
      </View>

      {/* Settings Section */}
      <View style={styles.menuSection}>
        <Text style={styles.menuSectionTitle}>Settings & Support</Text>
        <View style={styles.menuCard}>
          {settingsMenuItems.map((item, index) =>
            renderMenuItem(item, index, index === settingsMenuItems.length - 1)
          )}
        </View>
      </View>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color="#FF5252" />
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>

      {/* App Version */}
      <Text style={styles.versionText}>Zuba House v1.0.0</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  guestContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  guestHeader: {
    backgroundColor: Colors.primary,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 32,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  guestAvatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  guestTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: 8,
  },
  guestSubtitle: {
    fontSize: 14,
    color: Colors.white,
    opacity: 0.8,
    textAlign: 'center',
    lineHeight: 22,
  },
  authButtons: {
    padding: 20,
    gap: 12,
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
    marginLeft: 8,
  },
  registerButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  registerButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.primary,
  },
  userInfo: {
    marginLeft: 16,
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.primary,
  },
  userEmail: {
    fontSize: 14,
    color: Colors.primary,
    opacity: 0.7,
    marginTop: 2,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 16,
    padding: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.border,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.primary,
    marginTop: 6,
    fontWeight: '500',
  },
  menuSection: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  menuSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
    opacity: 0.6,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  menuCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuItemText: {
    marginLeft: 12,
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.primary,
  },
  menuItemSubtitle: {
    fontSize: 12,
    color: Colors.primary,
    opacity: 0.6,
    marginTop: 2,
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    backgroundColor: Colors.secondary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginRight: 8,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.primary,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    marginHorizontal: 20,
    marginTop: 24,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFE0E0',
  },
  logoutButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FF5252',
    marginLeft: 8,
  },
  versionText: {
    textAlign: 'center',
    fontSize: 12,
    color: Colors.primary,
    opacity: 0.4,
    marginTop: 24,
    marginBottom: 40,
  },
});

export default ProfileScreen;
