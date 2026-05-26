import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { CardField } from '@stripe/stripe-react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../constants/colors';
import { isStripeNativeModuleAvailable } from '../../lib/stripeNative';
import { isStripePublishableKeyConfigured } from '../../constants/config';

type Props = {
  onCardChange: (complete: boolean) => void;
  /** Hide labels when the parent renders its own section header. */
  hideHeader?: boolean;
  saveCard?: boolean;
  onSaveCardChange?: (value: boolean) => void;
  showSaveCardOption?: boolean;
};

export function CheckoutStripeCardField({
  onCardChange,
  hideHeader = false,
  saveCard = false,
  onSaveCardChange,
  showSaveCardOption = false,
}: Props) {
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
      {!hideHeader ? (
        <>
          <Text style={styles.label}>Card number</Text>
          <Text style={styles.hint}>
            Visa, Mastercard, Amex, and international cards where Stripe is supported.
          </Text>
        </>
      ) : null}
      <View style={styles.fieldShell}>
        <CardField
          postalCodeEnabled
          placeholders={{
            number: '1234 1234 1234 1234',
            expiration: 'MM / YY',
            cvc: 'CVC',
            postalCode: 'Postal / ZIP',
          }}
          cardStyle={{
            backgroundColor: '#FFFFFF',
            textColor: '#0B1220',
            borderColor: '#E2E8F0',
            borderWidth: 0,
            borderRadius: 8,
            fontSize: 16,
            placeholderColor: '#94A3B8',
            cursorColor: '#0B1220',
          }}
          style={styles.cardField}
          onCardChange={(details) => {
            onCardChange(Boolean(details.complete));
          }}
        />
      </View>

      {showSaveCardOption && onSaveCardChange ? (
        <TouchableOpacity
          style={styles.saveRow}
          onPress={() => onSaveCardChange(!saveCard)}
          activeOpacity={0.8}
        >
          <View style={[styles.saveCheckbox, saveCard && styles.saveCheckboxChecked]}>
            {saveCard ? <Ionicons name="checkmark" size={14} color={Colors.white} /> : null}
          </View>
          <Text style={styles.saveLabel}>Save card for future purchases</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 2,
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 4,
  },
  hint: {
    fontSize: 12,
    color: Colors.primary,
    opacity: 0.65,
    marginBottom: 8,
    lineHeight: 16,
  },
  fieldShell: {
    backgroundColor: Colors.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 8,
    paddingVertical: 2,
    minHeight: 44,
    justifyContent: 'center',
  },
  cardField: {
    width: '100%',
    height: 44,
    marginVertical: 0,
  },
  saveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  saveCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#94A3B8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  saveCheckboxChecked: {
    backgroundColor: Colors.secondary,
    borderColor: Colors.secondary,
  },
  saveLabel: {
    fontSize: 13,
    color: Colors.primary,
    flex: 1,
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
