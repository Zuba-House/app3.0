/**
 * Free Shipping Banner - TEMU Style
 * Progress bar showing how much more to spend for free shipping
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Colors from '../constants/colors';
import { FREE_SHIPPING_THRESHOLD } from '../constants/config';

interface FreeShippingBannerProps {
  currentTotal: number;
  threshold?: number;
}

const FreeShippingBanner: React.FC<FreeShippingBannerProps> = ({
  currentTotal,
  threshold = FREE_SHIPPING_THRESHOLD,
}) => {
  const navigation = useNavigation<any>();
  const progress = Math.min((currentTotal / threshold) * 100, 100);
  const remaining = Math.max(threshold - currentTotal, 0);
  const isQualified = currentTotal >= threshold;

  const handlePress = () => {
    navigation.navigate('MainTabs', { screen: 'Home' });
  };

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={handlePress}
      activeOpacity={0.9}
    >
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons
            name={isQualified ? 'checkmark-circle' : 'car'}
            size={24}
            color={isQualified ? '#4CAF50' : Colors.secondary}
          />
        </View>
        <View style={styles.textContainer}>
          {isQualified ? (
            <Text style={styles.qualifiedText}>
              You qualify for FREE shipping!
            </Text>
          ) : (
            <>
              <Text style={styles.mainText}>
                Add <Text style={styles.amountText}>${remaining.toFixed(2)}</Text> more for{' '}
                <Text style={styles.freeText}>FREE shipping</Text>
              </Text>
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${progress}%` }]} />
                </View>
                <Text style={styles.progressText}>{Math.round(progress)}%</Text>
              </View>
            </>
          )}
        </View>
        <Ionicons name="chevron-forward" size={20} color={Colors.primary} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.tertiary,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.secondary,
    borderStyle: 'dashed',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  mainText: {
    fontSize: 13,
    color: Colors.primary,
  },
  amountText: {
    fontWeight: '700',
    color: Colors.secondary,
  },
  freeText: {
    fontWeight: '700',
    color: '#4CAF50',
  },
  qualifiedText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: Colors.white,
    borderRadius: 3,
    overflow: 'hidden',
    marginRight: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.secondary,
    borderRadius: 3,
  },
  progressText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.secondary,
    minWidth: 32,
  },
});

export default FreeShippingBanner;
