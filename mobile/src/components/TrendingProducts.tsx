/**
 * Trending Products Component - TEMU Style
 * Shows what's trending now
 */

import React from 'react';
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
const CARD_WIDTH = (SCREEN_WIDTH - 48) / 2;

interface TrendingProductsProps {
  products: Product[];
  title?: string;
}

const TrendingProducts: React.FC<TrendingProductsProps> = ({
  products,
  title = 'Trending Now',
}) => {
  const navigation = useNavigation<any>();

  if (!products || products.length === 0) return null;

  const handlePress = (productId: string) => {
    navigation.navigate('ProductDetail', { productId });
  };

  const renderProduct = ({ item, index }: { item: Product; index: number }) => {
    const imageUrl = item.images?.[0] || (item as any).featuredImage || '';
    const displayImage = typeof imageUrl === 'object' && (imageUrl as any)?.url
      ? (imageUrl as any).url
      : imageUrl;

    // Real trending data from product
    const viewCount = (item as any).views || 0;
    const wishlistCount = (item as any).wishlistCount || 0;
    const totalSales = (item as any).totalSales || 0;
    const trendingScore = (wishlistCount * 2) + (totalSales * 3) + viewCount;
    
    // Determine if trending up based on actual data
    const trendingUp = trendingScore > 10 || totalSales > 5;

    return (
      <TouchableOpacity
        style={styles.productCard}
        onPress={() => handlePress(item._id)}
        activeOpacity={0.8}
      >
        {/* Trending Badge */}
        <View style={styles.trendingBadge}>
          <Ionicons
            name={trendingUp ? 'trending-up' : 'flame'}
            size={12}
            color={Colors.white}
          />
          <Text style={styles.trendingText}>
            {trendingUp ? 'Hot' : 'Popular'}
          </Text>
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

        {/* Product Info */}
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>
            {item.name}
          </Text>
          <Text style={styles.productPrice}>${item.price.toFixed(2)}</Text>
          
          {/* Views */}
          <View style={styles.viewsContainer}>
            <Ionicons name="eye-outline" size={12} color={Colors.primary} />
            <Text style={styles.viewsText}>{viewCount.toLocaleString()} views</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Ionicons name="trending-up" size={22} color="#FF5722" />
          <Text style={styles.title}>{title}</Text>
        </View>
        <TouchableOpacity style={styles.seeAllButton}>
          <Text style={styles.seeAllText}>View All</Text>
          <Ionicons name="chevron-forward" size={16} color={Colors.secondary} />
        </TouchableOpacity>
      </View>

      {/* Products Grid */}
      <FlatList
        data={products.slice(0, 6)}
        renderItem={renderProduct}
        keyExtractor={(item) => `trending-${item._id}`}
        numColumns={2}
        scrollEnabled={false}
        contentContainerStyle={styles.gridContent}
        columnWrapperStyle={styles.columnWrapper}
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
    marginBottom: 16,
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
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAllText: {
    fontSize: 14,
    color: Colors.secondary,
    fontWeight: '500',
  },
  gridContent: {
    paddingHorizontal: 12,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  productCard: {
    width: CARD_WIDTH,
    backgroundColor: Colors.white,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.tertiary,
    position: 'relative',
  },
  trendingBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF5722',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 1,
  },
  trendingText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.white,
    marginLeft: 4,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1,
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
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.primary,
    lineHeight: 18,
    marginBottom: 6,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.secondary,
  },
  viewsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  viewsText: {
    fontSize: 11,
    color: Colors.primary,
    opacity: 0.6,
    marginLeft: 4,
  },
});

export default TrendingProducts;
