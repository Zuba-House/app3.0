/**
 * Product Card Component
 * Reusable product card for displaying products
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Button } from 'react-native-paper';
import { Image } from 'expo-image';
import { Product } from '../types/product.types';
import { API_URL } from '../constants/config';
import Colors from '../constants/colors';

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
  const displayPrice = product.salePrice || product.price;
  const originalPrice = product.salePrice ? product.price : null;
  const discount = product.salePrice
    ? Math.round(((product.price - product.salePrice) / product.price) * 100)
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
    console.log('⚠️ No image found for product:', product.name, {
      hasImages: !!product.images,
      imagesLength: product.images?.length,
      hasImage: !!(product as any).image,
      hasImageUrl: !!(product as any).imageUrl,
      productKeys: Object.keys(product),
    });
  }

  // Calculate stock status for promotional banner
  const stockStatus = product.stock || 0;
  const showPromoBanner = discount > 0 && stockStatus > 0 && stockStatus <= 10;
  const promoText = stockStatus > 0 && stockStatus <= 5 
    ? `Last ${stockStatus} at promo price`
    : stockStatus <= 10 
    ? `Almost sold out`
    : null;

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
            placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
            transition={200}
            onError={(error) => {
              console.error('❌ Image load error for:', imageUrl, error);
            }}
          />
        ) : (
          <View style={[styles.image, styles.placeholderImage]}>
            <Text style={styles.placeholderText}>📦</Text>
            <Text style={styles.placeholderText}>No Image</Text>
          </View>
        )}
        {discount > 0 && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>-{discount}%</Text>
          </View>
        )}
        {showPromoBanner && promoText && (
          <View style={styles.promoBanner}>
            <Text style={styles.promoText}>{promoText}</Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={2}>
          {product.name}
        </Text>

        <View style={styles.priceContainer}>
          <Text style={styles.price}>${displayPrice.toFixed(2)}</Text>
          {originalPrice && (
            <Text style={styles.originalPrice}>${originalPrice.toFixed(2)}</Text>
          )}
        </View>

        {/* Rating and review count */}
        <View style={styles.metaContainer}>
          {product.rating && (
            <View style={styles.ratingContainer}>
              <Text style={styles.ratingText}>⭐ {product.rating.toFixed(1)}</Text>
            </View>
          )}
          {product.reviewCount && (
            <Text style={styles.soldText}>
              {product.reviewCount >= 1000 
                ? `${(product.reviewCount / 1000).toFixed(1)}K+ reviews`
                : `${product.reviewCount}+ reviews`}
            </Text>
          )}
          {(product as any).soldCount && !product.reviewCount && (
            <Text style={styles.soldText}>
              {((product as any).soldCount / 1000).toFixed(1)}K+ sold
            </Text>
          )}
        </View>

        {/* Stock status */}
        {product.stock !== undefined && (
          <View style={styles.stockContainer}>
            {product.stock === 0 ? (
              <Text style={styles.outOfStockText}>Out of Stock</Text>
            ) : product.stock <= 10 ? (
              <Text style={styles.lowStockText}>Only {product.stock} left</Text>
            ) : null}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    margin: 6,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: Colors.border,
    width: '100%',
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 160,
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
  discountBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: Colors.secondary,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    zIndex: 2,
  },
  discountText: {
    color: Colors.primary,
    fontSize: 11,
    fontWeight: 'bold',
  },
  promoBanner: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    zIndex: 2,
  },
  promoText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
  content: {
    padding: 10,
    paddingTop: 8,
  },
  name: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 6,
    color: Colors.primary,
    minHeight: 32,
    lineHeight: 16,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 4,
    gap: 6,
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.secondary,
  },
  originalPrice: {
    fontSize: 12,
    color: Colors.primary,
    opacity: 0.5,
    textDecorationLine: 'line-through',
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 11,
    color: Colors.primary,
    opacity: 0.7,
  },
  soldText: {
    fontSize: 11,
    color: Colors.primary,
    opacity: 0.7,
  },
  stockContainer: {
    marginTop: 4,
  },
  outOfStockText: {
    fontSize: 11,
    color: Colors.primary,
    opacity: 0.5,
    fontStyle: 'italic',
  },
  lowStockText: {
    fontSize: 11,
    color: Colors.secondary,
    fontWeight: '600',
  },
});

export default React.memo(ProductCard);
