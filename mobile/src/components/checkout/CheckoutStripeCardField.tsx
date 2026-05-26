import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CardField } from '@stripe/stripe-react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../constants/colors';
import { isStripeNativeModuleAvailable } from '../../lib/stripeNative';
import { isStripePublishableKeyConfigured } from '../../constants/config';

type Props = {
  onCardChange: (complete: boolean) => void;
  /** Keep mounted off-screen so Stripe retains card data on later steps (Review → Pay). */
  preserveMount?: boolean;
};

export function CheckoutStripeCardField({ onCardChange, preserveMount = false }: Props) {
  if (!isStripeNativeModuleAvailable() || !isStripePublishableKeyConfigured()) {
    return (
      <View style={styles.placeholder}>
        <Text style={styles.placeholderText}>
          Card entry will be available after you install the latest app update from TestFlight.
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.wrap, preserveMount && styles.preserveMount]}>
      {!preserveMount ? (
        <>
          <View style={styles.brandRow}>
            <View style={styles.brandIcon}>
              <Ionicons name="home" size={18} color={Colors.secondary} />
            </View>
            <View style={styles.brandTextBlock}>
              <Text style={styles.brandTitle}>Zuba House checkout</Text>
              <Text style={styles.brandSubtitle}>Secure in-app card payment</Text>
            </View>
            <Ionicons name="lock-closed" size={16} color={Colors.secondary} />
          </View>
          <Text style={styles.label}>Card details</Text>
        </>
      ) : null}
      <CardField
        postalCodeEnabled
        placeholders={{ number: '1234 5678 9012 3456' }}
        cardStyle={{
          backgroundColor: '#FFFFFF',
          textColor: Colors.primary,
          borderColor: Colors.border,
          borderWidth: 1,
          borderRadius: 12,
          fontSize: 16,
          placeholderColor: '#9AA5B1',
        }}
        style={styles.cardField}
        onCardChange={(details) => {
          onCardChange(Boolean(details.complete));
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 12,
    marginBottom: 8,
  },
  preserveMount: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 1,
    height: 1,
    opacity: 0,
    overflow: 'hidden',
    margin: 0,
    zIndex: -1,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.tertiary,
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
    gap: 10,
  },
  brandIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTextBlock: {
    flex: 1,
  },
  brandTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.primary,
  },
  brandSubtitle: {
    fontSize: 12,
    color: Colors.primary,
    opacity: 0.65,
    marginTop: 2,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 8,
  },
  cardField: {
    width: '100%',
    height: 52,
    marginVertical: 4,
  },
  placeholder: {
    padding: 12,
    backgroundColor: '#FFF8E1',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFE082',
  },
  placeholderText: {
    fontSize: 13,
    color: '#5D4037',
    lineHeight: 18,
  },
});
