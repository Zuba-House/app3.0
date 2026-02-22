/**
 * Recently Viewed Component - TEMU Style
 * Shows recently viewed products for quick access
 */

import React, { useState, useEffect } from 'react';
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import Colors from '../constants/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_SIZE = 80;

interface RecentProduct {
  _id: string;
  name: string;
  price: number;
  image: string;
  viewedAt: number;
}

interface RecentlyViewedProps {
  maxItems?: number;
}

const RecentlyViewed: React.FC<RecentlyViewedProps> = ({ maxItems = 10 }) => {
  const navigation = useNavigation<any>();
  const [recentProducts, setRecentProducts] = useState<RecentProduct[]>([]);

  useEffect(() => {
    loadRecentProducts();
  }, []);

  const loadRecentProducts = async () => {
    try {
      const stored = await AsyncStorage.getItem('recentlyViewed');
      if (stored) {
        const products: RecentProduct[] = JSON.parse(stored);
        // Sort by most recent and limit
        const sorted = products
          .sort((a, b) => b.viewedAt - a.viewedAt)
          .slice(0, maxItems);
        setRecentProducts(sorted);
      }
    } catch (error) {
      console.error('Error loading recent products:', error);
    }
  };

  const handlePress = (productId: string) => {
    navigation.navigate('ProductDetail', { productId });
  };

  const handleClearAll = async () => {
    try {
      await AsyncStorage.removeItem('recentlyViewed');
      setRecentProducts([]);
    } catch (error) {
      console.error('Error clearing recent products:', error);
    }
  };

  if (recentProducts.length === 0) return null;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Ionicons name="time-outline" size={20} color={Colors.primary} />
          <Text style={styles.title}>Recently Viewed</Text>
        </View>
        <TouchableOpacity onPress={handleClearAll}>
          <Text style={styles.clearText}>Clear All</Text>
        </TouchableOpacity>
      </View>

      {/* Products List */}
      <FlatList
        data={recentProducts}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.productCard}
            onPress={() => handlePress(item._id)}
            activeOpacity={0.8}
          >
            {item.image ? (
              <Image
                source={{ uri: item.image }}
                style={styles.productImage}
                contentFit="cover"
                transition={200}
              />
            ) : (
              <View style={[styles.productImage, styles.placeholderImage]}>
                <Ionicons name="cube-outline" size={24} color={Colors.primary} />
              </View>
            )}
            <Text style={styles.productPrice}>${item.price.toFixed(0)}</Text>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => `recent-${item._id}`}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

// Utility function to add product to recently viewed
export const addToRecentlyViewed = async (product: {
  _id: string;
  name: string;
  price: number;
  images?: string[];
  featuredImage?: string | { url: string };
}) => {
  try {
    const stored = await AsyncStorage.getItem('recentlyViewed');
    let products: RecentProduct[] = stored ? JSON.parse(stored) : [];

    // Get image URL
    let imageUrl = '';
    if (product.images?.[0]) {
      const img = product.images[0];
      imageUrl = typeof img === 'object' && (img as any)?.url ? (img as any).url : String(img);
    } else if (product.featuredImage) {
      const img = product.featuredImage;
      imageUrl = typeof img === 'object' && (img as any)?.url ? (img as any).url : String(img);
    }

    // Remove if already exists
    products = products.filter((p) => p._id !== product._id);

    // Add to beginning
    products.unshift({
      _id: product._id,
      name: product.name,
      price: product.price,
      image: imageUrl,
      viewedAt: Date.now(),
    });

    // Limit to 20 items
    products = products.slice(0, 20);

    await AsyncStorage.setItem('recentlyViewed', JSON.stringify(products));
  } catch (error) {
    console.error('Error saving to recently viewed:', error);
  }
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
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
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
    marginLeft: 8,
  },
  clearText: {
    fontSize: 13,
    color: Colors.secondary,
    fontWeight: '500',
  },
  listContent: {
    paddingHorizontal: 12,
  },
  productCard: {
    width: CARD_SIZE,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  productImage: {
    width: CARD_SIZE,
    height: CARD_SIZE,
    borderRadius: 12,
    backgroundColor: Colors.tertiary,
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.5,
  },
  productPrice: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.secondary,
    marginTop: 6,
  },
});

export default RecentlyViewed;
