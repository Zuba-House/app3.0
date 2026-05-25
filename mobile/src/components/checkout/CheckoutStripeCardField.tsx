import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CardField } from '@stripe/stripe-react-native';
import Colors from '../../constants/colors';
import { isStripeNativeModuleAvailable } from '../../lib/stripeNative';
import { isStripePublishableKeyConfigured } from '../../constants/config';

type Props = {
  onCardChange: (complete: boolean) => void;
};

export function CheckoutStripeCardField({ onCardChange }: Props) {
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
    <View style={styles.wrap}>
      <Text style={styles.label}>Card details</Text>
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
