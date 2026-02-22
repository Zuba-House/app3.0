/**
 * Flash Sale Component - TEMU Style
 * Countdown timer with urgency indicators
 */

import React, { useState, useEffect, useCallback } from 'react';
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

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = endTime.getTime() - new Date().getTime();
      
      if (difference > 0) {
        setTimeLeft({
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
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
  const navigation = useNavigation<any>();
  
  // Calculate fake discount and sold percentage for demo
  const discountPercent = Math.floor(Math.random() * 40) + 30; // 30-70%
  const soldPercent = Math.floor(Math.random() * 60) + 30; // 30-90%
  const originalPrice = product.price * (1 + discountPercent / 100);

  const handlePress = () => {
    navigation.navigate('ProductDetail', { productId: product._id });
  };

  const imageUrl = product.images?.[0] || (product as any).featuredImage || '';
  const displayImage = typeof imageUrl === 'object' && imageUrl?.url ? imageUrl.url : imageUrl;

  return (
    <TouchableOpacity 
      style={styles.flashCard} 
      onPress={handlePress}
      activeOpacity={0.8}
    >
      {/* Discount Badge */}
      <View style={styles.discountBadge}>
        <Text style={styles.discountText}>-{discountPercent}%</Text>
      </View>

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
        <Text style={styles.salePrice}>${product.price.toFixed(2)}</Text>
        <Text style={styles.originalPrice}>${originalPrice.toFixed(2)}</Text>
      </View>

      {/* Sold Progress Bar */}
      <View style={styles.soldContainer}>
        <View style={styles.soldBarBackground}>
          <View style={[styles.soldBarFill, { width: `${soldPercent}%` }]} />
        </View>
        <Text style={styles.soldText}>{soldPercent}% sold</Text>
      </View>

      {/* Stock Warning */}
      {soldPercent > 70 && (
        <View style={styles.stockWarning}>
          <Ionicons name="flame" size={12} color="#FF5722" />
          <Text style={styles.stockWarningText}>Almost gone!</Text>
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
  if (!products || products.length === 0) return null;

  return (
    <View style={styles.container}>
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
          <FlashSaleTimer endTime={endTime} />
        </View>
      </View>

      {/* Products List */}
      <FlatList
        data={products.slice(0, 8)}
        renderItem={({ item, index }) => (
          <FlashSaleCard product={item} index={index} />
        )}
        keyExtractor={(item) => `flash-${item._id}`}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
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
});

export default FlashSale;
