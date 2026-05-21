/**
 * Profile Screen - TEMU Style
 * User profile with account options
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
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
import { useAuthState } from '../../core/auth/authGuards';
import Colors from '../../constants/colors';
import { useAuthGate } from '../../core/auth/authGate';
import { useAppSelector } from '../../store/hooks';
import { selectCartCount } from '../../store/slices/cartSlice';
import { pressNavigate } from '../../navigation/navigationHelpers';

interface MenuItem {
  icon: string;
  title: string;
  subtitle?: string;
  onPress: () => void;
  badge?: string | number;
  showArrow?: boolean;
}

const ProfileScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const { user, authStatus, logout } = useAuthState();
  const isAuthenticated = authStatus === 'authenticated';
  const { openAuth } = useAuthGate();
  const cartCount = useAppSelector(selectCartCount);

  const handleLogout = () => {
    Alert.alert(
      t('auth.logout'),
      t('account.logoutConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('auth.logout'),
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              console.error('Logout error:', error);
            }
          },
        },
      ]
    );
  };

  const orderMenuItems: MenuItem[] = [
    {
      icon: 'cube-outline',
      title: t('account.myOrders'),
      subtitle: t('account.orderHistory'),
      onPress: () => navigation.navigate('Orders'),
      showArrow: true,
    },
    {
      icon: 'heart-outline',
      title: t('account.wishlist'),
      subtitle: t('account.savedItems'),
      onPress: () => navigation.navigate('Wishlist'),
      showArrow: true,
    },
    {
      icon: 'location-outline',
      title: t('account.addresses'),
      subtitle: t('account.manageAddresses'),
      onPress: () => navigation.navigate('AddAddress'),
      showArrow: true,
    },
  ];

  const settingsMenuItems: MenuItem[] = [
    {
      icon: 'settings-outline',
      title: t('account.settings'),
      subtitle: t('account.appPreferences'),
      onPress: () => void pressNavigate(navigation, 'Settings'),
      showArrow: true,
    },
    {
      icon: 'notifications-outline',
      title: t('account.notifications'),
      subtitle: t('account.manageNotifications'),
      onPress: () => void pressNavigate(navigation, 'NotificationPreferences'),
      showArrow: true,
    },
    {
      icon: 'help-circle-outline',
      title: t('account.helpSupport'),
      subtitle: t('account.faqSupport'),
      onPress: () => navigation.navigate('HelpSupport'),
      showArrow: true,
    },
    {
      icon: 'information-circle-outline',
      title: t('account.aboutZuba'),
      onPress: () => navigation.navigate('About'),
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
          <Text style={styles.guestTitle}>{t('account.welcome')}</Text>
          <Text style={styles.guestSubtitle}>{t('account.signInPrompt')}</Text>
        </View>

        {/* Auth Buttons */}
        <View style={styles.authButtons}>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => openAuth()}
          >
            <Ionicons name="log-in-outline" size={20} color={Colors.white} />
            <Text style={styles.loginButtonText}>{t('auth.signIn')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.registerButton}
            onPress={() => openAuth()}
          >
            <Text style={styles.registerButtonText}>{t('auth.createAccount')}</Text>
          </TouchableOpacity>
        </View>

        {/* Guest Menu */}
        <View style={styles.menuSection}>
          <Text style={styles.menuSectionTitle}>{t('account.quickLinks')}</Text>
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
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => void pressNavigate(navigation, 'EditProfile')}
        >
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
          <View style={styles.profileCartIconWrap}>
            <Ionicons name="cart" size={24} color={Colors.secondary} />
            {cartCount > 0 && (
              <View style={styles.profileCartBadge}>
                <Text style={styles.profileCartBadgeText}>{cartCount > 99 ? '99+' : cartCount}</Text>
              </View>
            )}
          </View>
          <Text style={styles.statLabel}>Cart</Text>
        </TouchableOpacity>
      </View>

      {/* Order Section */}
      <View style={styles.menuSection}>
        <Text style={styles.menuSectionTitle}>{t('account.myAccountSection')}</Text>
        <View style={styles.menuCard}>
          {orderMenuItems.map((item, index) =>
            renderMenuItem(item, index, index === orderMenuItems.length - 1)
          )}
        </View>
      </View>

      {/* Settings Section */}
      <View style={styles.menuSection}>
        <Text style={styles.menuSectionTitle}>{t('account.settingsSupportSection')}</Text>
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
  profileCartIconWrap: {
    position: 'relative',
  },
  profileCartBadge: {
    position: 'absolute',
    top: -6,
    right: -10,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#E60012',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  profileCartBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
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
