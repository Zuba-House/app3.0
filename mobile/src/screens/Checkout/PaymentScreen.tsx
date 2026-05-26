/**
 * Payment Screen — in-app Zuba House card form (no Stripe Payment Sheet modal)
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Platform,
  ScrollView,
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
import { CheckoutStripeCardField } from '../../components/checkout/CheckoutStripeCardField';

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
    onSuccess,
  } = route.params as PaymentScreenParams;

  const { payForOrder, isStripeConfigured, isStripeNativeAvailable } = useInAppStripePayment();
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [orderAlreadyComplete, setOrderAlreadyComplete] = useState(false);
  const [cardDetailsComplete, setCardDetailsComplete] = useState(false);
  const [saveCard, setSaveCard] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

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
    if (!isStripeNativeAvailable) {
      showError(
        'Install the latest Zuba House dev build (with Stripe). From mobile/: eas build --profile development-store --platform ios'
      );
      return;
    }
    if (!isStripeConfigured) {
      showError(
        'Card payments are not configured in this build. Set EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY in mobile/eas.json (production), rebuild, and reinstall from TestFlight.'
      );
      return;
    }
    if (!cardDetailsComplete) {
      setPaymentError('Please enter your full card details before paying.');
      return;
    }
    setPaying(true);
    try {
      const result = await payForOrder({
        orderId,
        amount,
        customerEmail: route.params?.customerEmail,
        customerName: route.params?.customerName,
        saveCard,
      });
      if (result.status === 'paid') {
        setPaymentError(null);
        finishPaymentSuccess();
      } else if (result.status !== 'cancelled') {
        setPaymentError(
          result.errorMessage || 'Payment was not completed. Please check your card details and try again.'
        );
      } else {
        setPaymentError(result.errorMessage || 'Payment was cancelled before completion.');
      }
    } finally {
      setPaying(false);
    }
  }, [
    amount,
    cardDetailsComplete,
    finishPaymentSuccess,
    isStripeConfigured,
    isStripeNativeAvailable,
    orderId,
    payForOrder,
    route.params?.customerEmail,
    route.params?.customerName,
    saveCard,
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

      <ScrollView style={styles.content} contentContainerStyle={styles.contentInner}>
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
              : 'Complete your Zuba House order — card entry stays inside the app.'}
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

          {!orderAlreadyComplete && isStripeConfigured ? (
            <>
              <CheckoutStripeCardField
                onCardChange={(complete) => {
                  setCardDetailsComplete(complete);
                  if (complete && paymentError) setPaymentError(null);
                }}
                showSaveCardOption
                saveCard={saveCard}
                onSaveCardChange={setSaveCard}
              />
              {paymentError ? <Text style={styles.inlinePaymentError}>{paymentError}</Text> : null}
            </>
          ) : null}

          {!orderAlreadyComplete && (
            <TouchableOpacity
              style={[styles.payButton, (busy || !cardDetailsComplete) && styles.payButtonDisabled]}
              onPress={runPayment}
              disabled={busy || !cardDetailsComplete}
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
            <Text style={styles.securityTitle}>Zuba House secure checkout</Text>
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
  },
  contentInner: {
    padding: 20,
    paddingBottom: 40,
  },
  paymentCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 24,
    alignItems: 'stretch',
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
    alignSelf: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 8,
    textAlign: 'center',
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
    marginBottom: 8,
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
    marginTop: 16,
  },
  payButtonDisabled: {
    opacity: 0.6,
  },
  inlinePaymentError: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 18,
    color: '#B91C1C',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
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
