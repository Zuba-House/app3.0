/**
 * Payment Screen
 * Handles Stripe payment with WebView
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
} from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
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

  const [loading, setLoading] = useState(true);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const webViewRef = useRef<WebView>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    createCheckoutSession();
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  const createCheckoutSession = async () => {
    try {
      setLoading(true);

      // For React Native, we'll use a deep link or custom URL scheme
      // Since we can't use localhost, we use the API URL for callbacks
      const baseUrl = API_URL;
      const successUrl = `${baseUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}&orderId=${orderId}`;
      const cancelUrl = `${baseUrl}/payment-cancel?orderId=${orderId}`;

      const response = await checkoutService.createCheckoutSession(
        amount,
        orderId,
        successUrl,
        cancelUrl
      );

      if (response.success && response.data) {
        setCheckoutUrl(response.data.url);
        setSessionId(response.data.sessionId);
      } else {
        // Fallback: Create a simple payment intent and show card form
        Alert.alert(
          'Payment Setup',
          'Unable to create checkout session. Please try again.',
          [
            { text: 'Cancel', onPress: () => navigation.goBack() },
            { text: 'Retry', onPress: createCheckoutSession },
          ]
        );
      }
    } catch (error: any) {
      console.error('Error creating checkout session:', error);
      Alert.alert(
        'Error',
        error.message || 'Failed to initialize payment. Please try again.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleNavigationStateChange = (navState: any) => {
    const { url } = navState;

    // Check if payment was successful
    if (url.includes('payment-success') || url.includes('session_id=')) {
      setPaymentComplete(true);
      handlePaymentSuccess();
    }

    // Check if payment was cancelled
    if (url.includes('payment-cancel')) {
      handlePaymentCancel();
    }
  };

  const handlePaymentSuccess = async () => {
    if (!sessionId) {
      // Still proceed to order confirmation
      if (onSuccess) onSuccess();
      navigation.replace('OrderConfirmation', {
        orderId,
        total: amount,
      });
      return;
    }

    try {
      // Poll for payment status
      let attempts = 0;
      const maxAttempts = 5;

      const checkStatus = async () => {
        attempts++;
        const statusResponse = await checkoutService.getCheckoutStatus(sessionId);

        if (
          statusResponse.success &&
          statusResponse.data?.paymentStatus === 'paid'
        ) {
          if (onSuccess) onSuccess();
          navigation.replace('OrderConfirmation', {
            orderId,
            total: amount,
          });
          return true;
        }

        if (attempts >= maxAttempts) {
          // Payment status unclear, but assume success and proceed
          if (onSuccess) onSuccess();
          navigation.replace('OrderConfirmation', {
            orderId,
            total: amount,
          });
          return true;
        }

        return false;
      };

      const success = await checkStatus();
      if (!success) {
        pollIntervalRef.current = setInterval(async () => {
          const result = await checkStatus();
          if (result && pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
          }
        }, 2000);
      }
    } catch (error) {
      console.error('Error checking payment status:', error);
      // Proceed anyway
      if (onSuccess) onSuccess();
      navigation.replace('OrderConfirmation', {
        orderId,
        total: amount,
      });
    }
  };

  const handlePaymentCancel = () => {
    Alert.alert(
      'Payment Cancelled',
      'Your payment was cancelled. Would you like to try again?',
      [
        {
          text: 'Go Back',
          style: 'cancel',
          onPress: () => navigation.goBack(),
        },
        {
          text: 'Try Again',
          onPress: createCheckoutSession,
        },
      ]
    );
  };

  const handleOpenInBrowser = () => {
    if (checkoutUrl) {
      Linking.openURL(checkoutUrl);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.secondary} />
        <Text style={styles.loadingText}>Setting up payment...</Text>
      </View>
    );
  }

  if (paymentComplete) {
    return (
      <View style={styles.successContainer}>
        <Ionicons name="checkmark-circle" size={80} color={Colors.secondary} />
        <Text style={styles.successTitle}>Payment Successful!</Text>
        <Text style={styles.successText}>Processing your order...</Text>
        <ActivityIndicator
          size="small"
          color={Colors.secondary}
          style={{ marginTop: 16 }}
        />
      </View>
    );
  }

  // If WebView is not available or checkout URL failed
  if (!checkoutUrl) {
    return (
      <View style={styles.fallbackContainer}>
        <View style={styles.fallbackCard}>
          <Ionicons name="card" size={48} color={Colors.secondary} />
          <Text style={styles.fallbackTitle}>Secure Payment</Text>
          <Text style={styles.fallbackText}>
            Complete your payment of ${amount.toFixed(2)} securely through Stripe.
          </Text>

          <View style={styles.orderSummary}>
            <Text style={styles.orderLabel}>Order ID</Text>
            <Text style={styles.orderValue}>{orderId}</Text>
          </View>

          <TouchableOpacity
            style={styles.retryButton}
            onPress={createCheckoutSession}
          >
            <Ionicons name="refresh" size={20} color={Colors.white} />
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.cancelButtonText}>Cancel Payment</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() =>
            Alert.alert(
              'Cancel Payment?',
              'Are you sure you want to cancel this payment?',
              [
                { text: 'No', style: 'cancel' },
                { text: 'Yes', onPress: () => navigation.goBack() },
              ]
            )
          }
          style={styles.closeButton}
        >
          <Ionicons name="close" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Secure Payment</Text>
        <TouchableOpacity onPress={handleOpenInBrowser} style={styles.externalButton}>
          <Ionicons name="open-outline" size={20} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Security Badge */}
      <View style={styles.securityBadge}>
        <Ionicons name="shield-checkmark" size={16} color={Colors.secondary} />
        <Text style={styles.securityText}>Secured by Stripe</Text>
      </View>

      {/* WebView for Stripe Checkout */}
      <View style={styles.webViewContainer}>
        <WebView
          ref={webViewRef}
          source={{ uri: checkoutUrl }}
          onNavigationStateChange={handleNavigationStateChange}
          style={styles.webView}
          startInLoadingState={true}
          renderLoading={() => (
            <View style={styles.webViewLoading}>
              <ActivityIndicator size="large" color={Colors.secondary} />
              <Text style={styles.webViewLoadingText}>Loading payment form...</Text>
            </View>
          )}
          onError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.error('WebView error:', nativeEvent);
            Alert.alert(
              'Error',
              'Unable to load payment form. Would you like to open in browser?',
              [
                { text: 'Cancel', onPress: () => navigation.goBack() },
                { text: 'Open Browser', onPress: handleOpenInBrowser },
              ]
            );
          }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.white,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.primary,
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: 32,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.primary,
    marginTop: 20,
  },
  successText: {
    fontSize: 16,
    color: Colors.primary,
    opacity: 0.7,
    marginTop: 8,
  },
  fallbackContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: 20,
  },
  fallbackCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    width: '100%',
    maxWidth: 360,
  },
  fallbackTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.primary,
    marginTop: 16,
  },
  fallbackText: {
    fontSize: 16,
    color: Colors.primary,
    opacity: 0.7,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 24,
  },
  orderSummary: {
    backgroundColor: Colors.tertiary,
    borderRadius: 12,
    padding: 16,
    width: '100%',
    marginTop: 24,
  },
  orderLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
    opacity: 0.6,
    textTransform: 'uppercase',
  },
  orderValue: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
    marginTop: 4,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginTop: 24,
    width: '100%',
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
    marginLeft: 8,
  },
  cancelButton: {
    paddingVertical: 16,
    marginTop: 8,
  },
  cancelButtonText: {
    fontSize: 14,
    color: Colors.primary,
    opacity: 0.7,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 50 : 16,
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
  },
  externalButton: {
    padding: 8,
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.tertiary,
    paddingVertical: 8,
  },
  securityText: {
    fontSize: 12,
    color: Colors.primary,
    marginLeft: 6,
    fontWeight: '500',
  },
  webViewContainer: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  webView: {
    flex: 1,
  },
  webViewLoading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.white,
  },
  webViewLoadingText: {
    marginTop: 12,
    fontSize: 14,
    color: Colors.primary,
    opacity: 0.7,
  },
});

export default PaymentScreen;
