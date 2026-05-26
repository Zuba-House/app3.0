import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CardField } from '@stripe/stripe-react-native';
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
          <Text style={styles.label}>Card details</Text>
          <Text style={styles.hint}>Enter your card number, expiry, CVC, and postal code.</Text>
        </>
      ) : null}
      <View style={styles.fieldShell}>
        <CardField
          postalCodeEnabled
          placeholders={{
            number: '1234 5678 9012 3456',
            expiration: 'MM / YY',
            cvc: 'CVC',
            postalCode: 'Postal code',
          }}
          cardStyle={{
            backgroundColor: '#FFFFFF',
            textColor: '#0B1220',
            borderColor: '#94A3B8',
            borderWidth: 1,
            borderRadius: 12,
            fontSize: 20,
            placeholderColor: '#475569',
            cursorColor: '#0B1220',
          }}
          style={styles.cardField}
          onCardChange={(details) => {
            onCardChange(Boolean(details.complete));
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 4,
    marginBottom: 12,
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
  label: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 4,
  },
  hint: {
    fontSize: 13,
    color: Colors.primary,
    opacity: 0.7,
    marginBottom: 10,
    lineHeight: 18,
  },
  fieldShell: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 4,
    paddingVertical: 6,
    minHeight: 56,
    justifyContent: 'center',
  },
  cardField: {
    width: '100%',
    height: 50,
    marginVertical: 0,
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
