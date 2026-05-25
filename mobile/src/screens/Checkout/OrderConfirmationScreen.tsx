/**
 * Order Confirmation Screen
 * Success screen after checkout / payment
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
  Share,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../constants/colors';
import { orderService } from '../../services/order.service';
import { needsOnlineStripePayment, type RawOrder } from '../../utils/order.mappers';

interface OrderConfirmationParams {
  orderId: string;
  total: number;
  paymentPending?: boolean;
  paymentAmount?: number;
  paymentMethod?: 'stripe';
  customerEmail?: string;
  customerName?: string;
}

const OrderConfirmationScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const insets = useSafeAreaInsets();
  const {
    orderId,
    total,
    paymentPending = false,
    paymentAmount = total,
    paymentMethod = 'stripe',
    customerEmail,
    customerName,
  } = route.params as OrderConfirmationParams;

  const [isPaymentPending, setIsPaymentPending] = useState(paymentPending);
  const [checkingPayment, setCheckingPayment] = useState(Boolean(orderId && paymentPending));

  const orderRef = orderId ? `#${orderId.slice(-8).toUpperCase()}` : '#—';

  useEffect(() => {
    if (!orderId) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await orderService.getOrderById(orderId);
        if (cancelled || !res.data) return;
        const raw = res.data as unknown as RawOrder;
        const stillNeedsPayment = needsOnlineStripePayment(raw, paymentMethod);
        setIsPaymentPending(stillNeedsPayment);
      } catch {
        setIsPaymentPending(paymentPending);
      } finally {
        if (!cancelled) setCheckingPayment(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [orderId, paymentMethod, paymentPending]);

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 48,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 380,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 380,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  const handleShareOrder = async () => {
    try {
      await Share.share({
        message: `I just placed an order on Zuba House! Order ${orderRef}`,
        title: 'My Zuba House Order',
      });
    } catch {
      /* ignore */
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

  const handlePayNow = () => {
    navigation.navigate('Payment', {
      orderId,
      amount: paymentAmount,
      customerEmail,
      customerName,
      onSuccess: () => {
        setIsPaymentPending(false);
        navigation.reset({
          index: 0,
          routes: [
            {
              name: 'OrderConfirmation',
              params: {
                orderId,
                total,
                paymentPending: false,
                paymentAmount,
                customerEmail,
                customerName,
              },
            },
          ],
        });
      },
    });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <Animated.View
          style={[
            styles.hero,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <Animated.View style={[styles.iconWrap, { transform: [{ scale: scaleAnim }] }]}>
            <View style={styles.iconRing}>
              <View style={styles.iconCircle}>
                <Ionicons name="checkmark" size={52} color={Colors.white} />
              </View>
            </View>
          </Animated.View>

          <Text style={styles.title}>Order placed!</Text>
          <Text style={styles.subtitle}>
            {isPaymentPending
              ? 'We saved your order. Pay when you’re ready to confirm it.'
              : 'Thank you for shopping with Zuba House.'}
          </Text>
        </Animated.View>

        <Animated.View
          style={[
            styles.body,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>ORDER SUMMARY</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.rowLabel}>Order number</Text>
              <View style={styles.orderPill}>
                <Text style={styles.orderPillText}>{orderRef}</Text>
              </View>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryRow}>
              <Text style={styles.rowLabel}>
                {isPaymentPending ? 'Amount due' : 'Total paid'}
              </Text>
              <Text style={styles.totalAmount}>${total.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryRow}>
              <Text style={styles.rowLabel}>Status</Text>
              <View
                style={[
                  styles.statusPill,
                  isPaymentPending ? styles.statusPending : styles.statusPaid,
                ]}
              >
                <View
                  style={[
                    styles.statusDot,
                    isPaymentPending ? styles.dotPending : styles.dotPaid,
                  ]}
                />
                <Text
                  style={[
                    styles.statusText,
                    isPaymentPending ? styles.statusTextPending : styles.statusTextPaid,
                  ]}
                >
                  {checkingPayment
                    ? 'Checking…'
                    : isPaymentPending
                    ? 'Payment pending'
                    : 'Paid'}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.infoStack}>
            <View style={styles.infoRow}>
              <View style={[styles.infoIconBox, styles.infoIconEmail]}>
                <Ionicons name="mail-outline" size={20} color={Colors.primary} />
              </View>
              <View style={styles.infoTextBlock}>
                <Text style={styles.infoTitle}>Confirmation email</Text>
                <Text style={styles.infoDesc}>
                  Order details and tracking updates will be sent to your inbox.
                </Text>
              </View>
            </View>
            <View style={styles.infoRowDivider} />
            <View style={styles.infoRow}>
              <View style={[styles.infoIconBox, styles.infoIconDelivery]}>
                <Ionicons name="cube-outline" size={20} color={Colors.primary} />
              </View>
              <View style={styles.infoTextBlock}>
                <Text style={styles.infoTitle}>Estimated delivery</Text>
                <Text style={styles.infoDesc}>5–7 business days</Text>
              </View>
            </View>
          </View>
        </Animated.View>
      </ScrollView>

      <Animated.View
        style={[
          styles.footer,
          { paddingBottom: Math.max(insets.bottom, 16), opacity: fadeAnim },
        ]}
      >
        {isPaymentPending && !checkingPayment ? (
          <TouchableOpacity
            style={styles.ctaPay}
            onPress={handlePayNow}
            activeOpacity={0.88}
          >
            <Ionicons name="card-outline" size={22} color={Colors.white} />
            <Text style={styles.ctaPayText}>Complete payment</Text>
          </TouchableOpacity>
        ) : null}

        <TouchableOpacity
          style={isPaymentPending ? styles.ctaSecondary : styles.ctaPrimary}
          onPress={handleContinueShopping}
          activeOpacity={0.88}
        >
          <Ionicons
            name="bag-handle-outline"
            size={20}
            color={isPaymentPending ? Colors.primary : Colors.white}
          />
          <Text
            style={
              isPaymentPending ? styles.ctaSecondaryText : styles.ctaPrimaryText
            }
          >
            Continue shopping
          </Text>
        </TouchableOpacity>

        <View style={styles.footerLinks}>
          <TouchableOpacity
            style={styles.linkButton}
            onPress={handleViewOrder}
            activeOpacity={0.7}
          >
            <Ionicons name="receipt-outline" size={18} color={Colors.primary} />
            <Text style={styles.linkButtonText}>View order</Text>
          </TouchableOpacity>
          <View style={styles.linkDivider} />
          <TouchableOpacity
            style={styles.linkButton}
            onPress={handleShareOrder}
            activeOpacity={0.7}
          >
            <Ionicons name="share-social-outline" size={18} color={Colors.primary} />
            <Text style={styles.linkButtonText}>Share</Text>
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
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  hero: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 8,
  },
  iconWrap: {
    marginBottom: 20,
  },
  iconRing: {
    padding: 6,
    borderRadius: 72,
    backgroundColor: 'rgba(239, 178, 145, 0.25)',
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.primary,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.primary,
    opacity: 0.65,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
    paddingHorizontal: 8,
    maxWidth: 320,
  },
  body: {
    marginTop: 8,
  },
  summaryCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
    marginBottom: 14,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: Colors.primary,
    opacity: 0.45,
    marginBottom: 14,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 36,
  },
  rowLabel: {
    fontSize: 14,
    color: Colors.primary,
    opacity: 0.7,
  },
  orderPill: {
    backgroundColor: Colors.background,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  orderPillText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  totalAmount: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.secondary,
  },
  summaryDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(11, 39, 53, 0.12)',
    marginVertical: 2,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  statusPending: {
    backgroundColor: '#FFF4E8',
  },
  statusPaid: {
    backgroundColor: '#E8F5E9',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dotPending: {
    backgroundColor: '#E65100',
  },
  dotPaid: {
    backgroundColor: '#2E7D32',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  statusTextPending: {
    color: '#C45A00',
  },
  statusTextPaid: {
    color: '#2E7D32',
  },
  infoStack: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 4,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    gap: 14,
  },
  infoRowDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(11, 39, 53, 0.08)',
    marginHorizontal: 16,
  },
  infoIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoIconEmail: {
    backgroundColor: 'rgba(239, 178, 145, 0.35)',
  },
  infoIconDelivery: {
    backgroundColor: 'rgba(11, 39, 53, 0.08)',
  },
  infoTextBlock: {
    flex: 1,
    paddingTop: 2,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.primary,
  },
  infoDesc: {
    fontSize: 13,
    color: Colors.primary,
    opacity: 0.65,
    marginTop: 4,
    lineHeight: 19,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: Colors.background,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(11, 39, 53, 0.1)',
  },
  ctaPay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 14,
    gap: 10,
    marginBottom: 10,
  },
  ctaPayText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
  },
  ctaPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 14,
    gap: 10,
  },
  ctaPrimaryText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
  },
  ctaSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    paddingVertical: 16,
    borderRadius: 14,
    gap: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(11, 39, 53, 0.15)',
  },
  ctaSecondaryText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
  },
  footerLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  linkDivider: {
    width: 1,
    height: 20,
    backgroundColor: 'rgba(11, 39, 53, 0.15)',
  },
  linkButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
});

export default OrderConfirmationScreen;
