/**
 * Flash Sale Component - TEMU Style
 * Countdown timer with urgency indicators
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useCurrency } from '../context/CurrencyContext';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Product } from '../types/product.types';
import Colors from '../constants/colors';
import { filterPricedProducts, getSoldPercent, isAlmostGone } from '../utils/productDisplay';
import { getSaleInfo } from '../utils/productSaleInfo';
import { getProductPrimaryImageUrl } from '../utils/productImages';
import { navigateToProductDetail, navigateToProductList } from '../navigation/navigationHelpers';
import { FLATLIST_PERF_HORIZONTAL } from '../utils/flatListPerf';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.38;

interface FlashSaleProps {
  products: Product[];
  endTime?: Date;
  title?: string;
}

interface TimeLeft {
  hours: number;
  minutes: number;
  seconds: number;
}

const FlashSaleTimer: React.FC<{ endTime: Date }> = ({ endTime }) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ hours: 0, minutes: 0, seconds: 0 });
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = endTime.getTime() - Date.now();
      if (difference <= 0) {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      setTimeLeft({
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      });
    };

    calculateTimeLeft();
    timerRef.current = setInterval(calculateTimeLeft, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [endTime]);

  const formatNumber = (num: number) => num.toString().padStart(2, '0');

  return (
    <View style={styles.timerContainer}>
      <View style={styles.timerBox}>
        <Text style={styles.timerNumber}>{formatNumber(timeLeft.hours)}</Text>
      </View>
      <Text style={styles.timerSeparator}>:</Text>
      <View style={styles.timerBox}>
        <Text style={styles.timerNumber}>{formatNumber(timeLeft.minutes)}</Text>
      </View>
      <Text style={styles.timerSeparator}>:</Text>
      <View style={styles.timerBox}>
        <Text style={styles.timerNumber}>{formatNumber(timeLeft.seconds)}</Text>
      </View>
    </View>
  );
};

const FlashSaleCard: React.FC<{ product: Product; index: number }> = ({ product, index }) => {
  const { t } = useTranslation();
  const { formatPrice } = useCurrency();
  const navigation = useNavigation<any>();

  // Real discount only: supports salePrice/oldPrice/discount payload shapes.
  const saleInfo = getSaleInfo(product as any);
  const displayPrice = saleInfo.displayPrice;
  const discountPercent = saleInfo.discountPercent;
  const soldPercent = getSoldPercent(product);
  const originalPrice = saleInfo.originalPrice;

  const handlePress = () => {
    navigateToProductDetail(navigation, product._id);
  };

  const displayImage = getProductPrimaryImageUrl(product);

  return (
    <TouchableOpacity 
      style={styles.flashCard} 
      onPress={handlePress}
      activeOpacity={0.8}
    >
      {/* Discount Badge */}
      {discountPercent > 0 && (
        <View style={styles.discountBadge}>
          <Text style={styles.discountText}>-{discountPercent}%</Text>
        </View>
      )}

      {/* Product Image */}
      <View style={styles.imageContainer}>
        {displayImage ? (
          <Image
            source={{ uri: displayImage }}
            style={styles.productImage}
            contentFit="cover"
            transition={200}
          />
        ) : (
          <View style={[styles.productImage, styles.placeholderImage]}>
            <Ionicons name="cube-outline" size={32} color={Colors.primary} />
          </View>
        )}
      </View>

      {/* Price Section */}
      <View style={styles.priceSection}>
        <Text style={styles.salePrice}>{formatPrice(displayPrice)}</Text>
        {originalPrice !== null && (
          <Text style={styles.originalPrice}>{formatPrice(originalPrice)}</Text>
        )}
      </View>

      {/* Sold Progress Bar */}
      <View style={styles.soldContainer}>
        <View style={styles.soldBarBackground}>
          <View style={[styles.soldBarFill, { width: `${soldPercent}%` }]} />
        </View>
        <Text style={styles.soldText}>
          {soldPercent}% {t('home.sold')}
        </Text>
      </View>

      {/* Stock Warning */}
      {isAlmostGone(product) && (
        <View style={styles.stockWarning}>
          <Ionicons name="flame" size={12} color="#FF5722" />
          <Text style={styles.stockWarningText}>{t('home.almostGone')}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const FlashSale: React.FC<FlashSaleProps> = ({ 
  products, 
  endTime = new Date(Date.now() + 4 * 60 * 60 * 1000), // Default 4 hours from now
  title = "Flash Sale"
}) => {
  const navigation = useNavigation<any>();
  const priced = filterPricedProducts(products ?? []);
  if (!priced || priced.length === 0) return null;
  const [cycleEnd, setCycleEnd] = useState<Date>(endTime);
  const [cycleTick, setCycleTick] = useState(0);
  const [dealEnded, setDealEnded] = useState(false);

  // Only show truly discounted products in flash sale, sorted by highest discount first.
  const saleProducts = priced
    .filter((p) => getSaleInfo(p as any).isOnSale)
    .sort((a, b) => {
      const aDisc = getSaleInfo(a as any).discountPercent;
      const bDisc = getSaleInfo(b as any).discountPercent;
      return bDisc - aDisc;
    });

  // If on-sale items are not enough, fill with mixed products for a richer section.
  const restProducts = priced.filter((p) => !saleProducts.find((s) => s._id === p._id));
  const mixedPool = [...saleProducts, ...restProducts];
  if (mixedPool.length === 0) return null;

  const shuffle = <T,>(arr: T[]) => {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  const displayProducts = shuffle(mixedPool).slice(0, 16);
  const dataToRender = displayProducts.sort((a, b) => {
    const aInfo = getSaleInfo(a as any);
    const bInfo = getSaleInfo(b as any);
    // Keep discounted items first while still mixed.
    if (aInfo.isOnSale !== bInfo.isOnSale) return aInfo.isOnSale ? -1 : 1;
    return bInfo.discountPercent - aInfo.discountPercent;
  });

  useEffect(() => {
    const tick = setInterval(() => {
      if (Date.now() >= cycleEnd.getTime()) {
        setDealEnded(true);
      }
    }, 1000);
    return () => clearInterval(tick);
  }, [cycleEnd]);

  if (dealEnded) {
    return (
      <View style={[styles.container, styles.endedBox]}>
        <Text style={styles.endedText}>Flash sale ended — check back soon!</Text>
      </View>
    );
  }

  return (
    <View style={styles.container} key={`flash-cycle-${cycleTick}`}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Ionicons name="flash" size={24} color="#FF5722" />
          <Text style={styles.title}>{title}</Text>
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>LIVE</Text>
          </View>
        </View>
        <View style={styles.timerSection}>
          <Text style={styles.endsIn}>Ends in</Text>
          <FlashSaleTimer endTime={cycleEnd} />
        </View>
        <TouchableOpacity
          style={styles.viewAllBtn}
          onPress={() =>
            navigateToProductList(navigation, {
              filter: 'flash-sale',
              title: 'Flash Sale',
            })
          }
        >
          <Text style={styles.viewAllText}>View All</Text>
          <Ionicons name="chevron-forward" size={14} color={Colors.secondary} />
        </TouchableOpacity>
      </View>

      {/* Products List */}
      <FlatList
        {...FLATLIST_PERF_HORIZONTAL}
        data={dataToRender}
        renderItem={({ item, index }) => (
          <FlashSaleCard product={item} index={index} />
        )}
        keyExtractor={(item) => `flash-${item._id}`}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        onEndReachedThreshold={0.1}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
    backgroundColor: Colors.white,
    paddingVertical: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primary,
    marginLeft: 8,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FF5722',
    marginRight: 4,
  },
  liveText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FF5722',
  },
  timerSection: {
    alignItems: 'flex-end',
  },
  endsIn: {
    fontSize: 10,
    color: Colors.primary,
    opacity: 0.6,
    marginBottom: 4,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timerBox: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 4,
    minWidth: 28,
    alignItems: 'center',
  },
  timerNumber: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.white,
  },
  timerSeparator: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
    marginHorizontal: 2,
  },
  listContent: {
    paddingHorizontal: 12,
  },
  flashCard: {
    width: CARD_WIDTH,
    backgroundColor: Colors.white,
    borderRadius: 12,
    marginHorizontal: 4,
    padding: 8,
    borderWidth: 1,
    borderColor: Colors.tertiary,
    position: 'relative',
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#FF5722',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    zIndex: 1,
  },
  discountText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.white,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: Colors.tertiary,
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.5,
  },
  priceSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  salePrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FF5722',
  },
  originalPrice: {
    fontSize: 12,
    color: Colors.primary,
    opacity: 0.5,
    textDecorationLine: 'line-through',
    marginLeft: 6,
  },
  soldContainer: {
    marginTop: 8,
  },
  soldBarBackground: {
    height: 6,
    backgroundColor: '#FFE0B2',
    borderRadius: 3,
    overflow: 'hidden',
  },
  soldBarFill: {
    height: '100%',
    backgroundColor: '#FF5722',
    borderRadius: 3,
  },
  soldText: {
    fontSize: 10,
    color: '#FF5722',
    fontWeight: '600',
    marginTop: 4,
    textAlign: 'center',
  },
  stockWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  stockWarningText: {
    fontSize: 10,
    color: '#FF5722',
    fontWeight: '600',
    marginLeft: 4,
  },
  viewAllBtn: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  viewAllText: { fontSize: 12, color: Colors.secondary, fontWeight: '600', marginRight: 2 },
  endedBox: { alignItems: 'center', paddingVertical: 24 },
  endedText: { fontSize: 14, fontWeight: '600', color: '#6b7280' },
});

export default React.memo(FlashSale);
