/**
 * Payment Screen
 * Handles Stripe payment with external browser
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Platform,
  Linking,
  AppState,
  AppStateStatus,
} from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { checkoutService } from '../../services/checkout.service';
import { API_URL } from '../../constants/config';
import Colors from '../../constants/colors';

interface PaymentScreenParams {
  orderId: string;
  amount: number;
  onSuccess?: () => void;
}

const PaymentScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { orderId, amount, onSuccess } = route.params as PaymentScreenParams;

  const [loading, setLoading] = useState(false);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [waitingForPayment, setWaitingForPayment] = useState(false);
  const appState = useRef(AppState.currentState);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Listen for app state changes to detect when user returns from browser
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    return () => {
      subscription.remove();
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [sessionId]);

  const handleAppStateChange = (nextAppState: AppStateStatus) => {
    // When app comes back to foreground from background (after browser)
    if (
      appState.current.match(/inactive|background/) &&
      nextAppState === 'active' &&
      waitingForPayment &&
      sessionId
    ) {
      // User returned from browser, check payment status
      checkPaymentStatus();
    }
    appState.current = nextAppState;
  };

  const createCheckoutSession = async () => {
    try {
      setLoading(true);

      // Use API URL for callbacks
      const successUrl = `${API_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}&orderId=${orderId}`;
      const cancelUrl = `${API_URL}/payment-cancel?orderId=${orderId}`;

      const response = await checkoutService.createCheckoutSession(
        amount,
        orderId,
        successUrl,
        cancelUrl
      );

      if (response.success && response.data) {
        setCheckoutUrl(response.data.url);
        setSessionId(response.data.sessionId);
        return response.data;
      } else {
        Alert.alert('Error', 'Unable to create payment session. Please try again.');
        return null;
      }
    } catch (error: any) {
      console.error('Error creating checkout session:', error);
      Alert.alert('Error', error.message || 'Failed to initialize payment.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handlePayNow = async () => {
    let url = checkoutUrl;
    
    if (!url) {
      const session = await createCheckoutSession();
      if (!session) return;
      url = session.url;
    }

    if (url) {
      setWaitingForPayment(true);
      try {
        const canOpen = await Linking.canOpenURL(url);
        if (canOpen) {
          await Linking.openURL(url);
        } else {
          Alert.alert('Error', 'Unable to open payment page. Please try again.');
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to open payment page.');
      }
    }
  };

  const checkPaymentStatus = async () => {
    if (!sessionId) return;

    try {
      setLoading(true);
      let attempts = 0;
      const maxAttempts = 5;

      const pollStatus = async (): Promise<boolean> => {
        attempts++;
        
        try {
          const response = await checkoutService.getCheckoutStatus(sessionId);
          
          if (response.success && response.data) {
            if (response.data.paymentStatus === 'paid') {
              // Payment successful
              setWaitingForPayment(false);
              if (onSuccess) onSuccess();
              navigation.replace('OrderConfirmation', {
                orderId,
                total: amount,
              });
              return true;
            }
            
            if (response.data.status === 'expired') {
              Alert.alert('Session Expired', 'Your payment session has expired. Please try again.');
              setWaitingForPayment(false);
              setCheckoutUrl(null);
              setSessionId(null);
              return true;
            }
          }
          
          if (attempts >= maxAttempts) {
            // Max attempts reached, ask user
            Alert.alert(
              'Payment Status',
              'Unable to confirm payment status. Did you complete the payment?',
              [
                {
                  text: 'No, Try Again',
                  onPress: () => {
                    setWaitingForPayment(false);
                    setCheckoutUrl(null);
                    setSessionId(null);
                  },
                },
                {
                  text: 'Yes, Continue',
                  onPress: () => {
                    if (onSuccess) onSuccess();
                    navigation.replace('OrderConfirmation', {
                      orderId,
                      total: amount,
                    });
                  },
                },
              ]
            );
            return true;
          }
          
          return false;
        } catch (error) {
          console.error('Error checking status:', error);
          return false;
        }
      };

      const success = await pollStatus();
      if (!success) {
        // Start polling
        pollIntervalRef.current = setInterval(async () => {
          const result = await pollStatus();
          if (result && pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
          }
        }, 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    Alert.alert(
      'Cancel Payment?',
      'Are you sure you want to cancel this payment?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          onPress: () => {
            if (pollIntervalRef.current) {
              clearInterval(pollIntervalRef.current);
            }
            navigation.goBack();
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel} style={styles.closeButton}>
          <Ionicons name="close" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Secure Payment</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <View style={styles.content}>
        {/* Payment Card */}
        <View style={styles.paymentCard}>
          <View style={styles.cardIcon}>
            <Ionicons name="card" size={48} color={Colors.secondary} />
          </View>
          
          <Text style={styles.title}>Complete Your Payment</Text>
          <Text style={styles.subtitle}>
            You'll be redirected to Stripe's secure checkout page
          </Text>

          {/* Order Summary */}
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

          {/* Payment Button */}
          <TouchableOpacity
            style={[styles.payButton, loading && styles.payButtonDisabled]}
            onPress={handlePayNow}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color={Colors.white} />
            ) : (
              <>
                <Ionicons name="lock-closed" size={20} color={Colors.white} />
                <Text style={styles.payButtonText}>
                  {waitingForPayment ? 'Check Payment Status' : 'Pay Now'}
                </Text>
              </>
            )}
          </TouchableOpacity>

          {waitingForPayment && (
            <TouchableOpacity
              style={styles.retryButton}
              onPress={checkPaymentStatus}
              disabled={loading}
            >
              <Ionicons name="refresh" size={18} color={Colors.secondary} />
              <Text style={styles.retryButtonText}>I've completed payment</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Security Note */}
        <View style={styles.securityNote}>
          <Ionicons name="shield-checkmark" size={20} color={Colors.secondary} />
          <View style={styles.securityTextContainer}>
            <Text style={styles.securityTitle}>Secure Payment</Text>
            <Text style={styles.securityText}>
              Your payment is processed securely by Stripe. We never store your card details.
            </Text>
          </View>
        </View>

        {/* Payment Methods */}
        <View style={styles.paymentMethods}>
          <Text style={styles.paymentMethodsTitle}>Accepted Payment Methods</Text>
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
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    marginTop: 12,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.secondary,
    marginLeft: 8,
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
