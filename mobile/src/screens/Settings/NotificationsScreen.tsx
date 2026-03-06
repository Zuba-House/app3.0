/**
 * Notifications Settings Screen
 * Manage push notification preferences
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Platform,
  Alert,
  Linking,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../constants/colors';
import { notificationService } from '../../services/notification.service';
import * as Notifications from 'expo-notifications';

const NotificationsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [pushEnabled, setPushEnabled] = useState(false);
  const [orderUpdates, setOrderUpdates] = useState(true);
  const [promotions, setPromotions] = useState(true);
  const [cartReminders, setCartReminders] = useState(false);
  const [priceDrops, setPriceDrops] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotificationSettings();
  }, []);

  const loadNotificationSettings = async () => {
    try {
      // Check if notifications are enabled
      const { status } = await Notifications.getPermissionsAsync();
      setPushEnabled(status === 'granted');
    } catch (error) {
      console.error('Error loading notification settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePush = async (value: boolean) => {
    if (value) {
      // Request permissions
      try {
        const { status } = await Notifications.requestPermissionsAsync();
        if (status === 'granted') {
          setPushEnabled(true);
          // Initialize notifications
          await notificationService.initialize();
        } else {
          Alert.alert(
            'Permission Required',
            'Please enable notifications in your device settings to receive updates.',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Open Settings', onPress: () => {
                // On iOS, this will open app settings
                if (Platform.OS === 'ios') {
                  Linking.openURL('app-settings:');
                }
              }},
            ]
          );
        }
      } catch (error) {
        console.error('Error enabling notifications:', error);
        Alert.alert('Error', 'Failed to enable notifications');
      }
    } else {
      setPushEnabled(false);
      // Note: Can't disable system-level permissions, but can stop using them
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Push Notifications Toggle */}
        <View style={styles.section}>
          <View style={styles.settingCard}>
            <View style={styles.settingContent}>
              <Ionicons name="notifications-outline" size={24} color={Colors.secondary} />
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>Push Notifications</Text>
                <Text style={styles.settingSubtitle}>
                  {pushEnabled ? 'Enabled' : 'Disabled'}
                </Text>
              </View>
            </View>
            <Switch
              value={pushEnabled}
              onValueChange={handleTogglePush}
              trackColor={{ false: Colors.border, true: Colors.secondary }}
              thumbColor={Colors.white}
            />
          </View>

          {!pushEnabled && (
            <View style={styles.infoBox}>
              <Ionicons name="information-circle-outline" size={20} color={Colors.secondary} />
              <Text style={styles.infoText}>
                Enable push notifications to receive order updates, promotions, and important alerts.
              </Text>
            </View>
          )}
        </View>

        {/* Notification Types */}
        {pushEnabled && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notification Types</Text>
            <Text style={styles.sectionSubtitle}>Choose what notifications you want to receive</Text>

            <View style={styles.settingCard}>
              <View style={styles.settingContent}>
                <Ionicons name="cube-outline" size={24} color={Colors.secondary} />
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Order Updates</Text>
                  <Text style={styles.settingSubtitle}>Track your orders in real-time</Text>
                </View>
              </View>
              <Switch
                value={orderUpdates}
                onValueChange={setOrderUpdates}
                trackColor={{ false: Colors.border, true: Colors.secondary }}
                thumbColor={Colors.white}
              />
            </View>

            <View style={styles.settingCard}>
              <View style={styles.settingContent}>
                <Ionicons name="pricetag-outline" size={24} color={Colors.secondary} />
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Promotions & Deals</Text>
                  <Text style={styles.settingSubtitle}>Get notified about sales and offers</Text>
                </View>
              </View>
              <Switch
                value={promotions}
                onValueChange={setPromotions}
                trackColor={{ false: Colors.border, true: Colors.secondary }}
                thumbColor={Colors.white}
              />
            </View>

            <View style={styles.settingCard}>
              <View style={styles.settingContent}>
                <Ionicons name="cart-outline" size={24} color={Colors.secondary} />
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Cart Reminders</Text>
                  <Text style={styles.settingSubtitle}>Reminders about items in your cart</Text>
                </View>
              </View>
              <Switch
                value={cartReminders}
                onValueChange={setCartReminders}
                trackColor={{ false: Colors.border, true: Colors.secondary }}
                thumbColor={Colors.white}
              />
            </View>

            <View style={styles.settingCard}>
              <View style={styles.settingContent}>
                <Ionicons name="trending-down-outline" size={24} color={Colors.secondary} />
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Price Drops</Text>
                  <Text style={styles.settingSubtitle}>Alerts when wishlist items go on sale</Text>
                </View>
              </View>
              <Switch
                value={priceDrops}
                onValueChange={setPriceDrops}
                trackColor={{ false: Colors.border, true: Colors.secondary }}
                thumbColor={Colors.white}
              />
            </View>
          </View>
        )}

        {/* Info Section */}
        <View style={styles.section}>
          <View style={styles.infoCard}>
            <Ionicons name="bulb-outline" size={24} color={Colors.secondary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Why Enable Notifications?</Text>
              <Text style={styles.infoText}>
                Stay updated on your orders, never miss a deal, and get instant alerts about 
                price drops on items you love.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 16,
    paddingHorizontal: 20,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.primary,
  },
  headerPlaceholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: 20,
    paddingBottom: 0,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: Colors.primary,
    opacity: 0.7,
    marginBottom: 16,
  },
  settingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: Colors.shadow,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: 12,
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 4,
  },
  settingSubtitle: {
    fontSize: 14,
    color: Colors.primary,
    opacity: 0.7,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: Colors.tertiary,
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: Colors.shadow,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: Colors.primary,
    opacity: 0.8,
    lineHeight: 20,
  },
});

export default NotificationsScreen;
