/**
 * Product Card Component
 * Reusable product card for displaying products
 */

import React, { memo } from 'react';
import { useCurrency } from '../context/CurrencyContext';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Button } from 'react-native-paper';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Product } from '../types/product.types';
import { API_URL } from '../constants/config';
import Colors from '../constants/colors';
import { getProductStock, isProductOutOfStock } from '../utils/productStock';

interface ProductCardProps {
  product: Product;
  onPress?: () => void;
  onAddToCart?: () => void;
  style?: any;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onPress,
  onAddToCart,
  style,
}) => {
  const { formatPrice } = useCurrency();
  // Resolve display price robustly:
  // some variable products have parent price=0 and valid variation prices.
  const parentSale = Number(product.salePrice ?? 0);
  const parentPrice = Number(product.price ?? 0);
  const variationPrices = Array.isArray(product.variations)
    ? product.variations
        .map((v: any) => Number(v?.salePrice ?? v?.price ?? 0))
        .filter((p: number) => Number.isFinite(p) && p > 0)
    : [];
  const minVariationPrice = variationPrices.length > 0 ? Math.min(...variationPrices) : 0;

  const displayPrice =
    parentSale > 0 ? parentSale :
    parentPrice > 0 ? parentPrice :
    minVariationPrice;

  const originalPrice =
    parentSale > 0 && parentPrice > parentSale ? parentPrice : null;

  const discount = originalPrice
    ? Math.round(((originalPrice - displayPrice) / originalPrice) * 100)
    : 0;

  // Get image URL - handle different formats from backend (including Cloudinary)
  const getImageUrl = (): string | null => {
    // Helper to fix relative URLs - handles undefined, null, and non-string values
    const fixUrl = (url: any): string | null => {
      // Check if url exists and is a string
      if (!url || typeof url !== 'string') {
        return null;
      }
      
      // Remove whitespace
      url = url.trim();
      
      // If empty after trim, return null
      if (!url) {
        return null;
      }

      // Some legacy payloads send Mongo ObjectId instead of image URL/path.
      // Avoid building invalid URLs like /<objectId> that always 404.
      if (/^[a-fA-F0-9]{24}$/.test(url)) {
        return null;
      }
      
      // Cloudinary URLs are already absolute, return as is
      if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
      }
      
      // Handle relative URLs
      if (url.startsWith('/')) {
        return `${API_URL}${url}`;
      }
      
      return `${API_URL}/${url}`;
    };

    // Try images array first - handle both string[] and object[] formats
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      const firstImage = product.images[0];
      
      // Handle object format: { url: string, alt?: string, ... }
      if (firstImage && typeof firstImage === 'object' && firstImage.url) {
        const imageUrl = fixUrl(firstImage.url);
        if (imageUrl) return imageUrl;
      }
      
      // Handle string format: string[]
      if (typeof firstImage === 'string') {
        const imageUrl = fixUrl(firstImage);
        if (imageUrl) return imageUrl;
      }
    }
    
    // Try featuredImage field (Cloudinary URL)
    const featuredImage = (product as any).featuredImage;
    if (featuredImage) {
      const imageUrl = fixUrl(featuredImage);
      if (imageUrl) return imageUrl;
    }
    
    // Try image (singular) field
    const image = (product as any).image;
    if (image) {
      // Handle object or string
      const imageUrl = fixUrl(typeof image === 'object' ? image.url : image);
      if (imageUrl) return imageUrl;
    }
    
    // Try imageUrl field
    const imageUrl = (product as any).imageUrl;
    if (imageUrl) {
      const fixedUrl = fixUrl(typeof imageUrl === 'object' ? imageUrl.url : imageUrl);
      if (fixedUrl) return fixedUrl;
    }
    
    // Try thumbnail field
    const thumbnail = (product as any).thumbnail;
    if (thumbnail) {
      const fixedUrl = fixUrl(typeof thumbnail === 'object' ? thumbnail.url : thumbnail);
      if (fixedUrl) return fixedUrl;
    }
    
    return null;
  };

  const imageUrl = getImageUrl();
  
  // Log for debugging
  if (!imageUrl) {
    // Logging disabled for production - uncomment for debugging
    // console.log('⚠️ No image found for product:', product.name, {
    //   hasImages: !!product.images,
    //   imagesLength: product.images?.length,
    //   hasImage: !!(product as any).image,
    //   hasImageUrl: !!(product as any).imageUrl,
    //   productKeys: Object.keys(product),
    // });
  }

  // Stock: same rules as web ProductItem — missing quantity ≠ out of stock
  const outOfStock = isProductOutOfStock(product);
  const numericStock = getProductStock(product);
  const showPromoBanner =
    !outOfStock &&
    numericStock !== null &&
    numericStock > 0 &&
    numericStock <= 10;
  const promoText = showPromoBanner
    ? `LAST ${numericStock} AT PROMO PRICE`
    : null;

  // Calculate sold count for display
  const soldCount = (product as any).soldCount || (product as any).totalSales || product.reviewCount || 0;
  const soldText = soldCount >= 1000 
    ? `${(soldCount / 1000).toFixed(1)}K+ sold`
    : soldCount > 0
    ? `${soldCount} sold`
    : '';

  // Star rating display
  const rating = product.rating || 0;
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  return (
    <TouchableOpacity
      style={[styles.card, style]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.imageContainer}>
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={styles.image}
            contentFit="cover"
            cachePolicy="memory-disk"
            placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
            transition={200}
            onError={() => {
              // Keep UI quiet for broken remote image URLs; fallback placeholder already handles it.
            }}
          />
        ) : (
          <View style={[styles.image, styles.placeholderImage]}>
            <Text style={styles.placeholderText}>📦</Text>
            <Text style={styles.placeholderText}>No Image</Text>
          </View>
        )}
        
        {/* Sale badge - only for products on sale */}
        {discount > 0 && (
          <View style={styles.badgesContainer}>
            <View style={styles.saleBadge}>
              <Text style={styles.saleBadgeText}>ON SALE</Text>
            </View>
          </View>
        )}

        {/* Promo Banner - Temu Style */}
        {showPromoBanner && promoText && (
          <View style={styles.promoBanner}>
            <Text style={styles.promoText}>{promoText}</Text>
          </View>
        )}
        {/* Out of Stock Ribbon */}
        {outOfStock && (
          <View style={[styles.promoBanner, { backgroundColor: 'rgba(220,38,38,0.9)' }]}>
            <Text style={[styles.promoText, { fontWeight: '800' }]}>OUT OF STOCK</Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        {/* Product Name */}
        <Text style={styles.name} numberOfLines={2}>
          {product.name}
        </Text>

        {/* Rating with Stars - Temu Style */}
        <View style={styles.ratingRow}>
          <View style={styles.starsContainer}>
            {[...Array(5)].map((_, i) => {
              if (i < fullStars) {
                return <Text key={i} style={styles.star}>★</Text>;
              } else if (i === fullStars && hasHalfStar) {
                return <Text key={i} style={styles.star}>☆</Text>;
              } else {
                return <Text key={i} style={styles.starEmpty}>☆</Text>;
              }
            })}
          </View>
          {soldCount > 0 && (
            <Text style={styles.soldText}>{soldText}</Text>
          )}
        </View>

        {/* Price Container - Temu Style */}
        <View style={styles.priceRow}>
          <View style={styles.priceContainer}>
            <Text style={styles.price}>{formatPrice(displayPrice)}</Text>
            {originalPrice && (
              <Text style={styles.originalPrice}>{formatPrice(originalPrice)}</Text>
            )}
          </View>
          
          {/* Add to Cart Button - Temu Style */}
          <TouchableOpacity 
            style={[styles.cartButton, outOfStock && { opacity: 0.4 }]}
            onPress={(e) => {
              e.stopPropagation();
              if (!outOfStock) {
                onAddToCart?.();
              }
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="add-circle" size={24} color={Colors.secondary} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 8,
    margin: 6,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
    width: '100%',
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 180,
    backgroundColor: Colors.tertiary,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: Colors.primary,
    opacity: 0.5,
    fontSize: 12,
  },
  badgesContainer: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    gap: 6,
    zIndex: 2,
  },
  saleBadge: {
    backgroundColor: '#E60012',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  saleBadgeText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  promoBanner: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingVertical: 6,
    paddingHorizontal: 8,
    zIndex: 2,
  },
  promoText: {
    color: Colors.white,
    fontSize: 9,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  content: {
    padding: 10,
    paddingTop: 8,
  },
  name: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 6,
    color: Colors.primary,
    minHeight: 32,
    lineHeight: 16,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 6,
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  star: {
    fontSize: 12,
    color: '#FFB800',
  },
  starEmpty: {
    fontSize: 12,
    color: '#E0E0E0',
  },
  soldText: {
    fontSize: 11,
    color: Colors.primary,
    opacity: 0.7,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    flex: 1,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  originalPrice: {
    fontSize: 11,
    color: Colors.primary,
    opacity: 0.5,
    textDecorationLine: 'line-through',
  },
  cartButton: {
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default React.memo(ProductCard);
