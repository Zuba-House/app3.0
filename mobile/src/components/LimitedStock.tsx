/**
 * Limited Stock Indicator - TEMU Style
 * Shows stock urgency with visual indicator
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/colors';

interface LimitedStockProps {
  stock: number;
  threshold?: number;
}

const LimitedStock: React.FC<LimitedStockProps> = ({
  stock,
  threshold = 10,
}) => {
  if (stock > threshold) return null;

  const isUrgent = stock <= 3;
  const isLow = stock <= 5;

  return (
    <View style={[styles.container, isUrgent && styles.containerUrgent]}>
      <Ionicons
        name={isUrgent ? 'flame' : 'alert-circle'}
        size={14}
        color={isUrgent ? '#FF5722' : '#FF9800'}
      />
      <Text style={[styles.text, isUrgent && styles.textUrgent]}>
        {isUrgent
          ? `Only ${stock} left!`
          : isLow
          ? `Low stock - ${stock} left`
          : `${stock} left in stock`}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  containerUrgent: {
    backgroundColor: '#FFEBEE',
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FF9800',
    marginLeft: 4,
  },
  textUrgent: {
    color: '#FF5722',
  },
});

export default LimitedStock;
