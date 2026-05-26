/**
 * Deal Of The Day Component - TEMU Style
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useCurrency } from '../context/CurrencyContext';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Product } from '../types/product.types';
import Colors from '../constants/colors';
import { getDisplayPrice, hasValidPrice } from '../utils/productDisplay';
import { navigateToProductDetail } from '../navigation/navigationHelpers';
import { getProductPrimaryImageUrl } from '../utils/productImages';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface DealOfTheDayProps {
  product: Product;
  endTime?: Date;
}

const DealOfTheDay: React.FC<DealOfTheDayProps> = ({
  product,
  endTime,
}) => {
  const { t } = useTranslation();
  const { formatPrice } = useCurrency();
  const navigation = useNavigation<any>();
  const [endsAt] = useState(() => {
    if (endTime) return endTime;
    const midnight = new Date();
    midnight.setHours(24, 0, 0, 0);
    return midnight.getTime() > Date.now()
      ? midnight
      : new Date(Date.now() + 12 * 60 * 60 * 1000);
  });
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [dealEnded, setDealEnded] = useState(false);

  useEffect(() => {
    const tick = () => {
      const diff = endsAt.getTime() - Date.now();
      if (diff <= 0) {
        setDealEnded(true);
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      setTimeLeft({
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [endsAt]);

  if (!hasValidPrice(product)) return null;

  const handleShopNow = () => {
    navigateToProductDetail(navigation, product._id);
  };

  const displayImage = getProductPrimaryImageUrl(product);

  const displayPrice = getDisplayPrice(product);
  const originalPrice = displayPrice * 1.4;
  const discountPercent = Math.round(((originalPrice - displayPrice) / originalPrice) * 100);
  const formatTime = (n: number) => n.toString().padStart(2, '0');

  if (dealEnded) {
    return (
      <View style={[styles.container, styles.endedWrap]}>
        <Text style={styles.endedText}>Deal ended — new deals tomorrow!</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <View style={styles.dealBadge}>
            <Ionicons name="pricetag" size={16} color={Colors.white} />
            <Text style={styles.dealBadgeText}>{t('home.dealOfTheDay').toUpperCase()}</Text>
          </View>
        </View>
        <View style={styles.timerContainer}>
          <Text style={styles.endsIn}>{t('home.endsIn')}</Text>
          <View style={styles.timer}>
            <View style={styles.timerBox}>
              <Text style={styles.timerNum}>{formatTime(timeLeft.hours)}</Text>
            </View>
            <Text style={styles.timerSep}>:</Text>
            <View style={styles.timerBox}>
              <Text style={styles.timerNum}>{formatTime(timeLeft.minutes)}</Text>
            </View>
            <Text style={styles.timerSep}>:</Text>
            <View style={styles.timerBox}>
              <Text style={styles.timerNum}>{formatTime(timeLeft.seconds)}</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.content}>
        <TouchableOpacity style={styles.imageContainer} onPress={handleShopNow} activeOpacity={0.9}>
          {displayImage ? (
            <Image source={{ uri: displayImage }} style={styles.productImage} contentFit="cover" />
          ) : (
            <View style={[styles.productImage, styles.placeholderImage]}>
              <Ionicons name="cube-outline" size={48} color={Colors.primary} />
            </View>
          )}
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>-{discountPercent}%</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.info}>
          <Text style={styles.productName} numberOfLines={2}>
            {product.name}
          </Text>
          <View style={styles.priceContainer}>
            <Text style={styles.salePrice}>{formatPrice(displayPrice)}</Text>
            <Text style={styles.originalPrice}>{formatPrice(originalPrice)}</Text>
          </View>
          <TouchableOpacity style={styles.shopButton} onPress={handleShopNow} activeOpacity={0.85}>
            <Text style={styles.shopButtonText}>{t('common.shopNow')}</Text>
            <Ionicons name="arrow-forward" size={16} color={Colors.white} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  endedWrap: { padding: 24, alignItems: 'center' },
  endedText: { fontSize: 15, fontWeight: '600', color: '#6b7280' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  titleContainer: { flexDirection: 'row', alignItems: 'center' },
  dealBadge: { flexDirection: 'row', alignItems: 'center' },
  dealBadgeText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.white,
    marginLeft: 8,
    letterSpacing: 1,
  },
  timerContainer: { alignItems: 'flex-end' },
  endsIn: { fontSize: 10, color: Colors.white, opacity: 0.8, marginBottom: 4 },
  timer: { flexDirection: 'row', alignItems: 'center' },
  timerBox: {
    backgroundColor: Colors.secondary,
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 4,
  },
  timerNum: { fontSize: 14, fontWeight: '700', color: Colors.primary },
  timerSep: { fontSize: 14, fontWeight: '700', color: Colors.white, marginHorizontal: 3 },
  content: { flexDirection: 'row', padding: 16 },
  imageContainer: {
    width: SCREEN_WIDTH * 0.35,
    aspectRatio: 1,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  productImage: { width: '100%', height: '100%', backgroundColor: Colors.tertiary },
  placeholderImage: { justifyContent: 'center', alignItems: 'center', opacity: 0.5 },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#FF5722',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  discountText: { fontSize: 12, fontWeight: '700', color: Colors.white },
  info: { flex: 1, marginLeft: 16, justifyContent: 'space-between' },
  productName: { fontSize: 16, fontWeight: '600', color: Colors.primary, lineHeight: 22 },
  priceContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  salePrice: { fontSize: 24, fontWeight: '700', color: '#FF5722' },
  originalPrice: {
    fontSize: 14,
    color: Colors.primary,
    opacity: 0.5,
    textDecorationLine: 'line-through',
    marginLeft: 8,
  },
  shopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.secondary,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  shopButtonText: { fontSize: 14, fontWeight: '700', color: Colors.white, marginRight: 6 },
});

export default DealOfTheDay;
