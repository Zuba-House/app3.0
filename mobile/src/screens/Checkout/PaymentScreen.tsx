/**
 * Payment Screen — in-app Stripe Payment Sheet (no external browser)
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { orderService } from '../../services/order.service';
import Colors from '../../constants/colors';
import { needsOnlineStripePayment, type RawOrder } from '../../utils/order.mappers';
import { cartService } from '../../services/cart.service';
import { useAppDispatch } from '../../store/hooks';
import { clearCart } from '../../store/slices/cartSlice';
import { showError } from '../../utils/toast';
import { useInAppStripePayment } from '../../hooks/useInAppStripePayment';

interface PaymentScreenParams {
  orderId: string;
  amount: number;
  customerEmail?: string;
  customerName?: string;
  onSuccess?: () => void;
}

const PaymentScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const dispatch = useAppDispatch();
  const {
    orderId,
    amount,
    customerEmail,
    customerName,
    onSuccess,
  } = route.params as PaymentScreenParams;

  const { payForOrder, isStripeConfigured } = useInAppStripePayment();
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [orderAlreadyComplete, setOrderAlreadyComplete] = useState(false);
  const hasAutoPresented = useRef(false);

  const finishPaymentSuccess = useCallback(() => {
    cartService.clearCart().catch(() => undefined);
    dispatch(clearCart());
    if (onSuccess) {
      onSuccess();
      return;
    }
    navigation.replace('OrderConfirmation', {
      orderId,
      total: amount,
      paymentPending: false,
    });
  }, [amount, dispatch, navigation, onSuccess, orderId]);

  const runPayment = useCallback(async () => {
    if (!isStripeConfigured) {
      showError('Card payments are not configured for this build.');
      return;
    }
    setPaying(true);
    try {
      const result = await payForOrder({
        orderId,
        amount,
        customerEmail,
        customerName,
      });
      if (result.status === 'paid') {
        finishPaymentSuccess();
      } else if (result.status === 'failed') {
        // Toast already shown in hook
      }
    } finally {
      setPaying(false);
    }
  }, [
    amount,
    customerEmail,
    customerName,
    finishPaymentSuccess,
    isStripeConfigured,
    orderId,
    payForOrder,
  ]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await orderService.getOrderById(orderId);
        if (cancelled || !res.data) return;
        const raw = res.data as unknown as RawOrder;
        if (!needsOnlineStripePayment(raw, 'stripe')) {
          setOrderAlreadyComplete(true);
          finishPaymentSuccess();
          return;
        }
      } catch {
        // User can still attempt payment.
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [finishPaymentSuccess, orderId]);

  useEffect(() => {
    if (loading || orderAlreadyComplete || paying || hasAutoPresented.current) return;
    if (!isStripeConfigured) return;
    hasAutoPresented.current = true;
    runPayment();
  }, [loading, orderAlreadyComplete, paying, isStripeConfigured, runPayment]);

  const handleCancel = () => {
    Alert.alert(
      'Leave payment?',
      'Your order is saved. You can pay later from order confirmation.',
      [
        { text: 'Stay', style: 'cancel' },
        {
          text: 'Leave',
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };

  const busy = loading || paying;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel} style={styles.closeButton}>
          <Ionicons name="close" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Secure Payment</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <View style={styles.content}>
        <View style={styles.paymentCard}>
          <View style={styles.cardIcon}>
            <Ionicons name="card" size={48} color={Colors.secondary} />
          </View>

          <Text style={styles.title}>
            {orderAlreadyComplete ? 'Payment complete' : 'Pay with card'}
          </Text>
          <Text style={styles.subtitle}>
            {orderAlreadyComplete
              ? 'Your order is already paid. Opening confirmation…'
              : 'Enter your card in the secure form below — you stay in the Zuba House app.'}
          </Text>

          <View style={styles.summaryBox}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Order ID</Text>
              <Text style={styles.summaryValue}>#{orderId.slice(-8).toUpperCase()}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Amount</Text>
              <Text style={styles.totalAmount}>${amount.toFixed(2)}</Text>
            </View>
          </View>

          {!orderAlreadyComplete && (
            <TouchableOpacity
              style={[styles.payButton, busy && styles.payButtonDisabled]}
              onPress={runPayment}
              disabled={busy}
            >
              {busy ? (
                <ActivityIndicator size="small" color={Colors.white} />
              ) : (
                <>
                  <Ionicons name="lock-closed" size={20} color={Colors.white} />
                  <Text style={styles.payButtonText}>Pay ${amount.toFixed(2)}</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.securityNote}>
          <Ionicons name="shield-checkmark" size={20} color={Colors.secondary} />
          <View style={styles.securityTextContainer}>
            <Text style={styles.securityTitle}>Secure Payment</Text>
            <Text style={styles.securityText}>
              Payments are processed by Stripe. Card details are never stored on our servers.
            </Text>
          </View>
        </View>

        <View style={styles.paymentMethods}>
          <Text style={styles.paymentMethodsTitle}>Accepted cards</Text>
          <View style={styles.methodsRow}>
            <View style={styles.methodBadge}>
              <Text style={styles.methodText}>VISA</Text>
            </View>
            <View style={styles.methodBadge}>
              <Text style={styles.methodText}>Mastercard</Text>
            </View>
            <View style={styles.methodBadge}>
              <Text style={styles.methodText}>AMEX</Text>
            </View>
          </View>
        </View>
      </View>
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
    paddingTop: Platform.OS === 'ios' ? 50 : 16,
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.primary,
  },
  headerPlaceholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  paymentCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  cardIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.primary,
    opacity: 0.7,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  summaryBox: {
    width: '100%',
    backgroundColor: Colors.tertiary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: Colors.primary,
    opacity: 0.7,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.secondary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 4,
  },
  payButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
  },
  payButtonDisabled: {
    opacity: 0.6,
  },
  payButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
    marginLeft: 10,
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
  },
  securityTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  securityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 4,
  },
  securityText: {
    fontSize: 13,
    color: Colors.primary,
    opacity: 0.7,
    lineHeight: 18,
  },
  paymentMethods: {
    marginTop: 20,
    alignItems: 'center',
  },
  paymentMethodsTitle: {
    fontSize: 12,
    color: Colors.primary,
    opacity: 0.6,
    marginBottom: 12,
  },
  methodsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  methodBadge: {
    backgroundColor: Colors.white,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  methodText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.primary,
  },
});

export default PaymentScreen;
