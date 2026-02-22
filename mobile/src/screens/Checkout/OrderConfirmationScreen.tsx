/**
 * Order Confirmation Screen
 * Success screen after payment completion
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
  Share,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../constants/colors';

interface OrderConfirmationParams {
  orderId: string;
  total: number;
}

const OrderConfirmationScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { orderId, total } = route.params as OrderConfirmationParams;

  // Animation values
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    // Success animation sequence
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  const handleShareOrder = async () => {
    try {
      await Share.share({
        message: `I just placed an order on Zuba House! Order #${orderId.slice(-8).toUpperCase()}`,
        title: 'My Zuba House Order',
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleViewOrder = () => {
    navigation.reset({
      index: 1,
      routes: [
        { name: 'MainTabs', params: { screen: 'Orders' } },
        { name: 'OrderDetail', params: { orderId } },
      ],
    });
  };

  const handleContinueShopping = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'MainTabs', params: { screen: 'Home' } }],
    });
  };

  return (
    <View style={styles.container}>
      {/* Success Animation */}
      <Animated.View
        style={[
          styles.iconContainer,
          { transform: [{ scale: scaleAnim }] },
        ]}
      >
        <View style={styles.iconCircle}>
          <Ionicons name="checkmark" size={60} color={Colors.white} />
        </View>
      </Animated.View>

      {/* Content */}
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <Text style={styles.title}>Order Confirmed!</Text>
        <Text style={styles.subtitle}>
          Thank you for shopping with Zuba House
        </Text>

        {/* Order Details Card */}
        <View style={styles.orderCard}>
          <View style={styles.orderRow}>
            <Text style={styles.orderLabel}>Order Number</Text>
            <Text style={styles.orderValue}>
              #{orderId.slice(-8).toUpperCase()}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.orderRow}>
            <Text style={styles.orderLabel}>Total Paid</Text>
            <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.orderRow}>
            <Text style={styles.orderLabel}>Payment Status</Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>Paid</Text>
            </View>
          </View>
        </View>

        {/* Info Message */}
        <View style={styles.infoCard}>
          <Ionicons name="mail-outline" size={24} color={Colors.secondary} />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Confirmation Email Sent</Text>
            <Text style={styles.infoText}>
              We've sent you an email with your order details and tracking information.
            </Text>
          </View>
        </View>

        {/* Estimated Delivery */}
        <View style={styles.deliveryCard}>
          <Ionicons name="car-outline" size={24} color={Colors.secondary} />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Estimated Delivery</Text>
            <Text style={styles.infoText}>5-7 business days</Text>
          </View>
        </View>
      </Animated.View>

      {/* Actions */}
      <Animated.View style={[styles.actions, { opacity: fadeAnim }]}>
        <TouchableOpacity style={styles.primaryButton} onPress={handleContinueShopping}>
          <Ionicons name="home" size={20} color={Colors.white} />
          <Text style={styles.primaryButtonText}>Continue Shopping</Text>
        </TouchableOpacity>

        <View style={styles.secondaryActions}>
          <TouchableOpacity style={styles.secondaryButton} onPress={handleViewOrder}>
            <Ionicons name="receipt-outline" size={18} color={Colors.primary} />
            <Text style={styles.secondaryButtonText}>View Order</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton} onPress={handleShareOrder}>
            <Ionicons name="share-outline" size={18} color={Colors.primary} />
            <Text style={styles.secondaryButtonText}>Share</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingTop: Platform.OS === 'ios' ? 80 : 60,
    paddingHorizontal: 20,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.secondary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.primary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: Colors.primary,
    opacity: 0.7,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 32,
  },
  orderCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  orderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  orderLabel: {
    fontSize: 14,
    color: Colors.primary,
    opacity: 0.7,
  },
  orderValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.secondary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 4,
  },
  statusBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4CAF50',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  deliveryCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  infoText: {
    fontSize: 13,
    color: Colors.primary,
    opacity: 0.7,
    marginTop: 4,
    lineHeight: 20,
  },
  actions: {
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
    marginLeft: 8,
  },
  secondaryActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: Colors.white,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.primary,
    marginLeft: 6,
  },
});

export default OrderConfirmationScreen;
