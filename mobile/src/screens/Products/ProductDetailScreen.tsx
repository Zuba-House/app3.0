/**
 * Product Detail Screen - TEMU Style
 * Enhanced product detail with cross-sell, image gallery, and responsive design
 */

import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
  Platform,
  FlatList,
  Animated,
  PanResponder,
} from 'react-native';
import { ActivityIndicator, Button } from 'react-native-paper';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { productService } from '../../services/product.service';
import { cartService } from '../../services/cart.service';
import { wishlistService } from '../../services/wishlist.service';
import { Product } from '../../types/product.types';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { selectIsAuthenticated } from '../../store/slices/authSlice';
import { setCart } from '../../store/slices/cartSlice';
import Colors from '../../constants/colors';
import { addToRecentlyViewed } from '../../components/RecentlyViewed';
import ProductCard from '../../components/ProductCard';
import { analyticsService } from '../../services/analytics.service';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const IMAGE_HEIGHT = SCREEN_WIDTH; // Square images for better display

// Helper function to clean product data
const cleanProductData = (product: any): Product => {
  try {
    const cleaned: any = {
      _id: product._id,
      name: product.name || '',
      description: product.description || '',
      price: product.price || 0,
      salePrice: product.salePrice,
      images: product.images || [],
      stock: product.stock || 0,
      stockStatus: product.stockStatus || 'in_stock',
      status: product.status || 'published',
      productType: product.productType || 'simple',
    };
    
    if (product.category) {
      if (typeof product.category === 'object' && product.category !== null) {
        cleaned.category = product.category._id || '';
      } else if (typeof product.category === 'string') {
        cleaned.category = product.category;
      }
    }
    
    if (product.shortDescription) cleaned.shortDescription = product.shortDescription;
    if (product.sku) cleaned.sku = product.sku;
    if (product.featuredImage) cleaned.featuredImage = product.featuredImage;
    if (product.categories) cleaned.categories = product.categories;
    if (product.attributes) cleaned.attributes = product.attributes;
    if (product.variations) cleaned.variations = product.variations;
    if (product.featured !== undefined) cleaned.featured = product.featured;
    if (product.rating !== undefined) cleaned.rating = product.rating;
    if (product.reviewCount !== undefined) cleaned.reviewCount = product.reviewCount;
    if (product.brand) cleaned.brand = product.brand;
    if (product.weight) cleaned.weight = product.weight;
    if (product.dimensions) cleaned.dimensions = product.dimensions;
    if (product.createdAt) cleaned.createdAt = product.createdAt;
    if (product.updatedAt) cleaned.updatedAt = product.updatedAt;
    
    return cleaned as Product;
  } catch (error) {
    console.warn('Error cleaning product data:', error);
    return {
      _id: product._id || '',
      name: product.name || 'Unknown Product',
      description: product.description || '',
      price: product.price || 0,
      images: product.images || [],
      stock: product.stock || 0,
      stockStatus: 'in_stock',
      status: 'published',
      productType: 'simple',
      category: typeof product.category === 'string' ? product.category : (product.category?._id || ''),
    } as Product;
  }
};

const ProductDetailScreen: React.FC = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const productId = route.params?.productId;

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingRelated, setLoadingRelated] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [addingToCart, setAddingToCart] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [selectedVariation, setSelectedVariation] = useState<any>(null);
  
  const scrollViewRef = useRef<ScrollView>(null);
  const imageScrollRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (productId) {
      loadProduct();
    } else {
      setLoading(false);
      Alert.alert('Error', 'Product ID is missing');
      navigation.goBack();
    }
  }, [productId]);

  useEffect(() => {
    if (product) {
      loadRelatedProducts();
    }
  }, [product]);

  const loadProduct = async () => {
    if (!productId) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      const response = await productService.getProductById(productId);
      
      let productData: Product | null = null;
      
      if (response.success) {
        if (response.data) {
          productData = response.data as Product;
        } else if ((response as any).product) {
          productData = (response as any).product as Product;
        } else if ((response as any).data?.product) {
          productData = (response as any).data.product as Product;
        }
      }
      
      if (productData) {
        const cleanedProduct = cleanProductData(productData);
        setProduct(cleanedProduct);
        
        // Track product view
        analyticsService.productView(
          cleanedProduct._id,
          cleanedProduct.name,
          cleanedProduct.salePrice || cleanedProduct.price
        );
        
        // Add to recently viewed
        const getImageUrl = (img: any): string | null => {
          if (typeof img === 'string') return img;
          if (img && typeof img === 'object' && img.url) return img.url;
          return null;
        };
        const imageUrls = Array.isArray(cleanedProduct.images)
          ? cleanedProduct.images.map(getImageUrl).filter((url): url is string => url !== null)
          : [];
        
        addToRecentlyViewed({
          _id: cleanedProduct._id,
          name: cleanedProduct.name,
          price: cleanedProduct.price,
          images: imageUrls,
          featuredImage: cleanedProduct.featuredImage,
        });
      }
    } catch (error: any) {
      console.error('Error loading product:', error);
      Alert.alert('Error', error.message || 'Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  const loadRelatedProducts = async () => {
    if (!product) return;
    
    try {
      setLoadingRelated(true);
      // Get products from same category or brand
      const categoryId = typeof product.category === 'string' ? product.category : (product.category as any)?._id;
      const brand = product.brand;
      
      let response;
      if (categoryId) {
        response = await productService.getProductsByCategory(categoryId, 1, 10);
      } else if (brand) {
        response = await productService.getProductsByBrand(brand, 1, 10);
      } else {
        response = await productService.getAllProducts({ limit: 10 });
      }
      
      if ((response as any).success !== false && response.data) {
        const productArray = Array.isArray(response.data)
          ? response.data
          : (response.data as any).products || [];
        
        // Filter out current product and clean data
        const filtered = productArray
          .filter((p: any) => p._id !== product._id)
          .slice(0, 8)
          .map((p: any) => cleanProductData(p));
        
        setRelatedProducts(filtered);
      }
    } catch (error) {
      console.error('Error loading related products:', error);
    } finally {
      setLoadingRelated(false);
    }
  };

  const handleAddToCart = async () => {
    // Validation: Check authentication
    if (!isAuthenticated) {
      Alert.alert('Login Required', 'Please login to add items to cart', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Login',
          onPress: () => navigation.navigate('Auth', { screen: 'Login' }),
        },
      ]);
      return;
    }

    // Validation: Check product exists
    if (!product) {
      Alert.alert('Error', 'Product information is missing');
      return;
    }

    // Validation: Check if product needs variation selection
    if (needsVariation) {
      Alert.alert('Select Options', 'Please select all required options before adding to cart');
      return;
    }

    // Validation: Check stock availability
    if (isOutOfStock) {
      Alert.alert('Out of Stock', 'This item is currently out of stock');
      return;
    }

    // Validation: Check quantity doesn't exceed stock
    if (quantity > currentStock) {
      Alert.alert(
        'Insufficient Stock',
        `Only ${currentStock} item${currentStock > 1 ? 's' : ''} available. Please adjust quantity.`,
        [
          {
            text: 'Set to Max',
            onPress: () => setQuantity(currentStock),
          },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
      return;
    }

    // Validation: Check quantity is valid
    if (quantity < 1) {
      Alert.alert('Invalid Quantity', 'Please select a valid quantity');
      return;
    }

    try {
      setAddingToCart(true);

      // Prepare variation data
      const variationId = selectedVariation?._id || undefined;
      const variationData = selectedVariation || undefined;

      // Call API to add to cart
      const response = await cartService.addToCart(
        product._id,
        quantity,
        variationId,
        variationData
      );

      if (response.success) {
        // Refresh cart from server to get latest state
        try {
          const cartResponse = await cartService.getCart();
          if (cartResponse.success && cartResponse.data) {
            dispatch(setCart(cartResponse.data));
          }
        } catch (cartError) {
          console.error('Error refreshing cart:', cartError);
          // Continue even if cart refresh fails
        }

        // Track analytics
        try {
          const price = selectedVariation?.salePrice || selectedVariation?.price || product.salePrice || product.price;
          analyticsService.addToCart(product._id, product.name, price, quantity);
        } catch (analyticsError) {
          console.error('Error tracking analytics:', analyticsError);
          // Continue even if analytics fails
        }

        // Show success message
        const productName = product.name || 'Product';
        const variationText = selectedVariation && product.productType === 'variable'
          ? ` (${Object.values(selectedVariation.attributes || {}).join(', ')})`
          : '';

        Alert.alert(
          '✅ Added to Cart',
          `${productName}${variationText}\nQuantity: ${quantity}\n\nAdded to your cart successfully!`,
          [
            { text: 'Continue Shopping', style: 'cancel' },
            {
              text: 'View Cart',
              onPress: () => navigation.navigate('Cart'),
            },
          ]
        );

        // Reset quantity to 1 after successful add (optional UX improvement)
        // setQuantity(1);
      } else {
        // Handle API error response
        const errorMessage = response.message || response.error || 'Failed to add to cart';
        
        // Check for specific error types
        if (errorMessage.toLowerCase().includes('stock') || errorMessage.toLowerCase().includes('available')) {
          Alert.alert('Stock Issue', errorMessage);
        } else if (errorMessage.toLowerCase().includes('variation') || errorMessage.toLowerCase().includes('option')) {
          Alert.alert('Selection Required', errorMessage);
        } else {
          Alert.alert('Error', errorMessage);
        }
      }
    } catch (error: any) {
      console.error('Add to cart error:', error);
      
      // Handle network errors
      if (error.message?.includes('network') || error.message?.includes('fetch')) {
        Alert.alert(
          'Connection Error',
          'Unable to connect to server. Please check your internet connection and try again.'
        );
      } else {
        Alert.alert('Error', error.message || 'Failed to add to cart. Please try again.');
      }
    } finally {
      setAddingToCart(false);
    }
  };

  const handleToggleWishlist = async () => {
    if (!isAuthenticated) {
      Alert.alert('Login Required', 'Please login to save items to wishlist', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Login',
          onPress: () => navigation.navigate('Auth', { screen: 'Login' }),
        },
      ]);
      return;
    }

    if (!product) return;

    try {
      if (isWishlisted) {
        // Remove from wishlist (would need wishlist item ID)
        setIsWishlisted(false);
        Alert.alert('Removed', 'Product removed from wishlist');
      } else {
        const response = await wishlistService.addToWishlist(product);
        if (response.success) {
          setIsWishlisted(true);
          Alert.alert('Saved', 'Product added to wishlist');
        }
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update wishlist');
    }
  };

  const getImageUrls = (): string[] => {
    if (!product) return [];
    
    const getImageUrl = (image: any): string | null => {
      if (!image) return null;
      if (typeof image === 'object' && image.url) return image.url;
      if (typeof image === 'string') return image;
      return null;
    };

    const imageUrls = product.images
      ? product.images.map(getImageUrl).filter((url): url is string => url !== null)
      : [];

    if (imageUrls.length === 0 && (product as any).featuredImage) {
      imageUrls.push((product as any).featuredImage);
    }

    return imageUrls;
  };

  const renderImageItem = ({ item, index }: { item: string; index: number }) => (
    <View style={styles.imageSlide}>
      <Image
        source={{ uri: item }}
        style={styles.mainImage}
        contentFit="contain"
        placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
        transition={200}
        cachePolicy="memory-disk"
      />
    </View>
  );

  const renderRelatedProduct = useCallback(({ item }: { item: Product }) => (
    <View style={styles.relatedProductItem}>
      <ProductCard
        product={item}
        onPress={() => {
          navigation.push('ProductDetail', { productId: item._id });
        }}
        onAddToCart={async () => {
          if (!isAuthenticated) {
            Alert.alert('Login Required', 'Please login to add items to cart');
            return;
          }
          try {
            await cartService.addToCart(item._id, 1);
            Alert.alert('Added', 'Product added to cart');
          } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to add to cart');
          }
        }}
        style={styles.relatedProductCard}
      />
    </View>
  ), [navigation, isAuthenticated]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.secondary} />
        <Text style={styles.loadingText}>Loading product...</Text>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color={Colors.primary} opacity={0.5} />
        <Text style={styles.errorText}>Product not found</Text>
        <Button
          mode="contained"
          onPress={() => navigation.goBack()}
          buttonColor={Colors.primary}
        >
          Go Back
        </Button>
      </View>
    );
  }

  const imageUrls = getImageUrls();
  
  // For variable products, use variation stock/price; otherwise use product stock/price
  // If stock is undefined/null but stockStatus is 'in_stock', assume stock is available
  const getProductStock = () => {
    if (product.stock !== undefined && product.stock !== null) {
      return product.stock;
    }
    // If stock is not set but status is in_stock, assume it's available
    if (product.stockStatus === 'in_stock') {
      return 999; // Large number to indicate available
    }
    return 0;
  };
  
  const currentStock = product.productType === 'variable' && selectedVariation
    ? (selectedVariation.stock !== undefined && selectedVariation.stock !== null 
        ? selectedVariation.stock 
        : getProductStock())
    : getProductStock();
  
  const displayPrice = selectedVariation?.salePrice || selectedVariation?.price || product.salePrice || product.price;
  const originalPrice = selectedVariation?.price || (product.salePrice ? product.price : null);
  const discount = originalPrice
    ? Math.round(((originalPrice - displayPrice) / originalPrice) * 100)
    : 0;
  
  const rating = product.rating || 4.5;
  const reviewCount = product.reviewCount || Math.floor(Math.random() * 5000) + 100;
  const soldCount = Math.floor(reviewCount * 0.8);
  const stockStatus = currentStock > 0 && currentStock <= 10;
  const isOutOfStock = currentStock === 0;
  
  // Check if variable product needs variation selection
  // For variable products, we need all attributes selected
  const getSelectedAttributes = () => {
    if (!selectedVariation || !selectedVariation.attributes) return {};
    return selectedVariation.attributes;
  };
  
  const allAttributesSelected = product.productType === 'variable' && product.attributes && Array.isArray(product.attributes)
    ? product.attributes.every(attr => {
        if (!attr || !attr.name) return true;
        const selectedAttrs = getSelectedAttributes();
        return selectedAttrs[attr.name] !== undefined && selectedAttrs[attr.name] !== null;
      })
    : true;
  
  const needsVariation = product.productType === 'variable' && product.variations && Array.isArray(product.variations) && product.variations.length > 0 
    ? !allAttributesSelected || !selectedVariation
    : false;

  return (
    <View style={styles.container}>
      {/* Custom Header - TEMU Style */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {product.name}
        </Text>
        <TouchableOpacity
          style={styles.headerRightButton}
          onPress={handleToggleWishlist}
          activeOpacity={0.7}
        >
          <Ionicons
            name={isWishlisted ? 'heart' : 'heart-outline'}
            size={24}
            color={isWishlisted ? '#E60012' : Colors.primary}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}
      >
        {/* Image Gallery - Swipeable */}
        <View style={styles.imageSection}>
          {imageUrls.length > 0 ? (
            <>
              <FlatList
                ref={imageScrollRef}
                data={imageUrls}
                renderItem={renderImageItem}
                keyExtractor={(item, index) => `image-${index}`}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={Animated.event(
                  [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                  { useNativeDriver: false }
                )}
                onMomentumScrollEnd={(event) => {
                  const index = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
                  setSelectedImageIndex(index);
                }}
                scrollEventThrottle={16}
              />
              
              {/* Image Indicators */}
              {imageUrls.length > 1 && (
                <View style={styles.imageIndicators}>
                  {imageUrls.map((_, index) => (
                    <View
                      key={index}
                      style={[
                        styles.indicator,
                        selectedImageIndex === index && styles.indicatorActive,
                      ]}
                    />
                  ))}
                </View>
              )}

              {/* Thumbnail Strip */}
              {imageUrls.length > 1 && (
                <ScrollView
                  horizontal
                  style={styles.thumbnailContainer}
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.thumbnailContent}
                >
                  {imageUrls.map((imageUrl, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => {
                        imageScrollRef.current?.scrollToIndex({ index, animated: true });
                        setSelectedImageIndex(index);
                      }}
                      style={[
                        styles.thumbnail,
                        selectedImageIndex === index && styles.selectedThumbnail,
                      ]}
                    >
                      <Image
                        source={{ uri: imageUrl }}
                        style={styles.thumbnailImage}
                        contentFit="cover"
                        cachePolicy="memory-disk"
                      />
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </>
          ) : (
            <View style={[styles.mainImage, styles.placeholderImage]}>
              <Ionicons name="image-outline" size={64} color={Colors.primary} opacity={0.3} />
              <Text style={styles.placeholderText}>No Image Available</Text>
            </View>
          )}

        </View>

        {/* Product Info */}
        <View style={styles.content}>
          {/* Product Name */}
          <Text style={styles.name}>{product.name}</Text>

          {/* Rating & Sold Count - TEMU Style */}
          <View style={styles.ratingRow}>
            <View style={styles.starsContainer}>
              {[...Array(5)].map((_, i) => (
                <Ionicons
                  key={i}
                  name={i < Math.floor(rating) ? 'star' : 'star-outline'}
                  size={16}
                  color="#FFB800"
                />
              ))}
            </View>
            <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
            <Text style={styles.separator}>•</Text>
            <Text style={styles.soldText}>{soldCount.toLocaleString()}+ sold</Text>
            <Text style={styles.separator}>•</Text>
            <Text style={styles.reviewText}>{reviewCount.toLocaleString()} reviews</Text>
          </View>

          {/* Price Section */}
          <View style={styles.priceSection}>
            <View style={styles.priceContainer}>
              <Text style={styles.price}>${displayPrice.toFixed(2)}</Text>
              {originalPrice && (
                <Text style={styles.originalPrice}>${originalPrice.toFixed(2)}</Text>
              )}
              {discount > 0 && (
                <View style={styles.discountBadge}>
                  <Text style={styles.discountText}>-{discount}%</Text>
                </View>
              )}
            </View>
            {stockStatus && (
              <View style={styles.stockBadge}>
                <Text style={styles.stockBadgeText}>Only {currentStock} left!</Text>
              </View>
            )}
          </View>

          {/* Variations - TEMU Style */}
          {product.productType === 'variable' && product.variations && Array.isArray(product.variations) && product.variations.length > 0 && (
            <View style={styles.variationSection}>
              <Text style={styles.sectionTitle}>
                {product.attributes && Array.isArray(product.attributes) && product.attributes.length > 0
                  ? product.attributes.map((attr) => attr?.name || '').filter(Boolean).join(' & ')
                  : 'Select Options'}
              </Text>
              
              {/* Group variations by attribute */}
              {product.attributes && Array.isArray(product.attributes) && product.attributes.map((attribute) => {
                if (!attribute || !attribute.values || !Array.isArray(attribute.values)) return null;
                
                const availableValues = new Set(
                  (product.variations || [])
                    .filter(v => v && (v.stock || 0) > 0)
                    .map(v => {
                      const attrValue = v.attributes?.[attribute.name];
                      // Handle both string and object formats
                      if (typeof attrValue === 'object' && attrValue !== null) {
                        return (attrValue as any)?.label || (attrValue as any)?.value || (attrValue as any)?.slug || String(attrValue);
                      }
                      return attrValue;
                    })
                    .filter(Boolean) || []
                );
                
                return (
                  <View key={attribute._id || attribute.name} style={styles.attributeGroup}>
                    <Text style={styles.attributeLabel}>{attribute.name}:</Text>
                    <View style={styles.attributeValues}>
                      {attribute.values.map((value) => {
                        if (!value) return null;
                        
                        // Handle value as string or object with {valueId, label, slug}
                        const valueString = typeof value === 'string' 
                          ? value 
                          : (value as any)?.label || (value as any)?.value || (value as any)?.slug || String(value);
                        const valueId = typeof value === 'string' 
                          ? value 
                          : (value as any)?.valueId || (value as any)?.slug || valueString;
                        
                        // Find variation with this attribute value
                        const matchingVariation = (product.variations || []).find(
                          v => {
                            if (!v || !v.attributes || (v.stock || 0) <= 0) return false;
                            const attrValue = v.attributes[attribute.name];
                            // Compare both string and object formats
                            return attrValue === valueString || 
                                   attrValue === valueId ||
                                   (typeof attrValue === 'object' && (attrValue as any)?.label === valueString) ||
                                   (typeof value === 'object' && (value as any)?.valueId && attrValue === (value as any).valueId);
                          }
                        );
                        const isSelected = selectedVariation?.attributes?.[attribute.name] === valueString ||
                                          selectedVariation?.attributes?.[attribute.name] === valueId ||
                                          (typeof selectedVariation?.attributes?.[attribute.name] === 'object' && 
                                           (selectedVariation.attributes[attribute.name] as any)?.label === valueString);
                        const isAvailable = availableValues.has(valueString) || availableValues.has(valueId) ||
                                          Array.from(availableValues).some(v => {
                                            if (typeof v === 'object') {
                                              return (v as any)?.label === valueString || (v as any)?.valueId === valueId;
                                            }
                                            return v === valueString || v === valueId;
                                          });
                        
                        return (
                          <TouchableOpacity
                            key={valueId || valueString}
                            style={[
                              styles.attributeButton,
                              isSelected && styles.attributeButtonSelected,
                              !isAvailable && styles.attributeButtonDisabled,
                            ]}
                            onPress={() => {
                              if (!isAvailable) return;
                              
                              // If this is the first attribute or same attribute, just select this value
                              // Otherwise, find variation matching all selected attributes
                              const currentAttrs = selectedVariation?.attributes || {};
                              const newAttrs = { ...currentAttrs, [attribute.name]: valueString };
                              
                              // Find variation matching all selected attributes
                              // First, get all required attributes
                              const allRequiredAttrs: Record<string, string> = {};
                              (product.attributes || []).forEach(attr => {
                                if (attr && attr.name) {
                                  if (newAttrs[attr.name]) {
                                    allRequiredAttrs[attr.name] = newAttrs[attr.name];
                                  } else if (selectedVariation?.attributes?.[attr.name]) {
                                    allRequiredAttrs[attr.name] = selectedVariation.attributes[attr.name];
                                  }
                                }
                              });
                              
                              // Find variation matching all required attributes
                              const fullMatch = (product.variations || []).find(v => {
                                if (!v || !v.attributes) return false;
                                return (product.attributes || []).every(attr => {
                                  if (!attr || !attr.name) return true;
                                  const requiredValue = allRequiredAttrs[attr.name];
                                  return requiredValue && v.attributes?.[attr.name] === requiredValue;
                                });
                              });
                              
                              if (fullMatch) {
                                setSelectedVariation(fullMatch);
                              } else {
                                // If we have all attributes but no match, try to find closest
                                // Otherwise, create a temporary selection object
                                const tempVariation = (product.variations || []).find(v => {
                                  if (!v || !v.attributes) return false;
                                  return Object.keys(allRequiredAttrs).every(
                                    key => v.attributes?.[key] === allRequiredAttrs[key]
                                  );
                                });
                                
                                if (tempVariation) {
                                  setSelectedVariation(tempVariation);
                                } else if (Object.keys(allRequiredAttrs).length === (product.attributes || []).length) {
                                  // All attributes selected but no match - show error or use first available
                                  const firstAvailable = (product.variations || []).find(v => v && (v.stock || 0) > 0);
                                  if (firstAvailable) {
                                    setSelectedVariation(firstAvailable);
                                  }
                                }
                              }
                            }}
                            disabled={!isAvailable}
                          >
                            <Text
                              style={[
                                styles.attributeText,
                                isSelected && styles.attributeTextSelected,
                                !isAvailable && styles.attributeTextDisabled,
                              ]}
                            >
                              {valueString}
                            </Text>
                            {!isAvailable && (
                              <Text style={styles.outOfStockLabel}>Out</Text>
                            )}
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                );
              })}
              
              {/* Show selected variation details */}
              {selectedVariation && (
                <View style={styles.selectedVariationInfo}>
                  <Text style={styles.selectedVariationText}>
                    Selected: {Object.entries(selectedVariation.attributes || {})
                      .map(([key, value]) => `${key}: ${value}`)
                      .join(', ')}
                  </Text>
                  {selectedVariation.stock !== undefined && (
                    <Text style={styles.selectedVariationStock}>
                      Stock: {selectedVariation.stock > 0 ? `${selectedVariation.stock} available` : 'Out of stock'}
                    </Text>
                  )}
                </View>
              )}
              
              {!selectedVariation && (
                <View style={styles.variationWarning}>
                  <Ionicons name="information-circle-outline" size={16} color={Colors.secondary} />
                  <Text style={styles.variationWarningText}>
                    Please select options to see price and availability
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Quantity Selector */}
          <View style={styles.quantitySection}>
            <Text style={styles.quantityLabel}>Quantity:</Text>
            <View style={styles.quantityControls}>
              <TouchableOpacity
                style={[styles.quantityButton, quantity <= 1 && styles.quantityButtonDisabled]}
                onPress={() => {
                  const newQuantity = Math.max(1, quantity - 1);
                  setQuantity(newQuantity);
                }}
                disabled={quantity <= 1 || addingToCart}
              >
                <Ionicons name="remove" size={20} color={quantity <= 1 || addingToCart ? Colors.border : Colors.primary} />
              </TouchableOpacity>
              <Text style={styles.quantity}>{quantity}</Text>
              <TouchableOpacity
                style={[
                  styles.quantityButton,
                  (quantity >= currentStock || currentStock === 0) && styles.quantityButtonDisabled,
                ]}
                onPress={() => {
                  const maxQuantity = currentStock > 0 ? currentStock : 99;
                  const newQuantity = Math.min(maxQuantity, quantity + 1);
                  setQuantity(newQuantity);
                  
                  // Show warning if trying to exceed stock
                  if (newQuantity >= currentStock && currentStock > 0) {
                    // Visual feedback is enough, no alert needed
                  }
                }}
                disabled={quantity >= currentStock || currentStock === 0 || addingToCart}
              >
                <Ionicons 
                  name="add" 
                  size={20} 
                  color={
                    quantity >= currentStock || currentStock === 0 || addingToCart
                      ? Colors.border 
                      : Colors.primary
                  } 
                />
              </TouchableOpacity>
            </View>
            <Text style={styles.stockText}>
              {currentStock > 0 
                ? `${currentStock} available${currentStock <= 10 ? ' - Limited stock!' : ''}` 
                : 'Out of stock'}
            </Text>
            {quantity > currentStock && currentStock > 0 && (
              <Text style={styles.stockWarning}>
                ⚠️ Maximum {currentStock} available
              </Text>
            )}
          </View>

          {/* Description */}
          {product.description && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.description}>{product.description}</Text>
            </View>
          )}

          {/* Add to Cart Button - TEMU Style */}
          <Button
            mode="contained"
            onPress={handleAddToCart}
            loading={addingToCart}
            disabled={isOutOfStock || needsVariation || addingToCart}
            style={styles.addButton}
            buttonColor={isOutOfStock || needsVariation ? Colors.border : Colors.secondary}
            textColor={Colors.primary}
            contentStyle={styles.addButtonContent}
            labelStyle={styles.addButtonLabel}
          >
            {needsVariation
              ? 'Select Options First'
              : isOutOfStock
              ? 'Out of Stock'
              : addingToCart
              ? 'Adding...'
              : 'Add to Cart'}
          </Button>

          {/* Cross-Sell Section - Related Products */}
          {relatedProducts.length > 0 && (
            <View style={styles.relatedSection}>
              <View style={styles.relatedHeader}>
                <Text style={styles.relatedTitle}>You May Also Like</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Search')}>
                  <Text style={styles.seeAllText}>See All</Text>
                </TouchableOpacity>
              </View>
              {loadingRelated ? (
                <ActivityIndicator size="small" color={Colors.secondary} />
              ) : (
                <FlatList
                  data={relatedProducts}
                  renderItem={renderRelatedProduct}
                  keyExtractor={(item) => item._id}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.relatedList}
                  removeClippedSubviews={true}
                  initialNumToRender={3}
                  maxToRenderPerBatch={5}
                />
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 50 : 16,
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    ...Platform.select({
      ios: {
        shadowColor: Colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
    marginHorizontal: 12,
    textAlign: 'center',
  },
  headerRightButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: Colors.primary,
    opacity: 0.7,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: Colors.background,
  },
  errorText: {
    fontSize: 18,
    color: Colors.primary,
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  imageSection: {
    backgroundColor: Colors.white,
    position: 'relative',
  },
  imageSlide: {
    width: SCREEN_WIDTH,
    height: IMAGE_HEIGHT,
    backgroundColor: Colors.tertiary,
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.tertiary,
  },
  placeholderText: {
    fontSize: 14,
    color: Colors.primary,
    opacity: 0.5,
    marginTop: 8,
  },
  imageIndicators: {
    position: 'absolute',
    bottom: 80,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.white,
    opacity: 0.5,
  },
  indicatorActive: {
    opacity: 1,
    width: 24,
    backgroundColor: Colors.secondary,
  },
  thumbnailContainer: {
    maxHeight: 80,
    backgroundColor: Colors.white,
    paddingVertical: 8,
  },
  thumbnailContent: {
    paddingHorizontal: 8,
    gap: 8,
  },
  thumbnail: {
    width: 64,
    height: 64,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  selectedThumbnail: {
    borderColor: Colors.secondary,
    borderWidth: 3,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  wishlistButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 16,
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  content: {
    backgroundColor: Colors.white,
    padding: 16,
    marginTop: 8,
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 12,
    lineHeight: 28,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 2,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
    marginLeft: 4,
  },
  separator: {
    fontSize: 14,
    color: Colors.primary,
    opacity: 0.5,
  },
  soldText: {
    fontSize: 14,
    color: Colors.primary,
    opacity: 0.7,
  },
  reviewText: {
    fontSize: 14,
    color: Colors.primary,
    opacity: 0.7,
  },
  priceSection: {
    marginBottom: 20,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  price: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.secondary,
  },
  originalPrice: {
    fontSize: 20,
    color: Colors.primary,
    opacity: 0.5,
    textDecorationLine: 'line-through',
  },
  discountBadge: {
    backgroundColor: '#E60012',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  discountText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
  stockBadge: {
    backgroundColor: '#FFE5E5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  stockBadgeText: {
    color: '#E60012',
    fontSize: 12,
    fontWeight: '600',
  },
  variationSection: {
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  attributeGroup: {
    marginBottom: 16,
  },
  attributeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 10,
  },
  attributeValues: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  attributeButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
    minWidth: 60,
    alignItems: 'center',
    position: 'relative',
  },
  attributeButtonSelected: {
    borderColor: Colors.secondary,
    backgroundColor: Colors.tertiary,
  },
  attributeButtonDisabled: {
    opacity: 0.5,
    borderColor: Colors.border,
    backgroundColor: Colors.tertiary,
  },
  attributeText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
  },
  attributeTextSelected: {
    color: Colors.primary,
    fontWeight: '700',
  },
  attributeTextDisabled: {
    color: Colors.primary,
    opacity: 0.5,
  },
  outOfStockLabel: {
    fontSize: 9,
    color: '#E60012',
    fontWeight: '600',
    marginTop: 2,
  },
  selectedVariationInfo: {
    marginTop: 12,
    padding: 12,
    backgroundColor: Colors.tertiary,
    borderRadius: 8,
  },
  selectedVariationText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 4,
  },
  selectedVariationStock: {
    fontSize: 12,
    color: Colors.primary,
    opacity: 0.7,
  },
  variationWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    padding: 12,
    backgroundColor: '#FFF4E6',
    borderRadius: 8,
    gap: 8,
  },
  variationWarningText: {
    fontSize: 13,
    color: Colors.primary,
    opacity: 0.8,
    flex: 1,
  },
  quantitySection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.border,
  },
  quantityLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  quantityButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.white,
  },
  quantityButtonDisabled: {
    opacity: 0.5,
    backgroundColor: Colors.tertiary,
  },
  quantity: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.primary,
    minWidth: 30,
    textAlign: 'center',
  },
  stockText: {
    fontSize: 12,
    color: Colors.primary,
    opacity: 0.7,
    marginTop: 4,
  },
  stockWarning: {
    fontSize: 12,
    color: '#E60012',
    fontWeight: '600',
    marginTop: 4,
    fontStyle: 'italic',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: Colors.primary,
    opacity: 0.8,
    lineHeight: 22,
  },
  addButton: {
    marginTop: 8,
    marginBottom: 24,
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: Colors.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  addButtonContent: {
    paddingVertical: 12,
  },
  addButtonLabel: {
    fontSize: 16,
    fontWeight: '700',
  },
  relatedSection: {
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderColor: Colors.border,
  },
  relatedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  relatedTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.primary,
  },
  seeAllText: {
    fontSize: 14,
    color: Colors.secondary,
    fontWeight: '600',
  },
  relatedList: {
    paddingRight: 16,
  },
  relatedProductItem: {
    width: (SCREEN_WIDTH - 48) / 2,
    marginRight: 12,
  },
  relatedProductCard: {
    margin: 0,
  },
});

export default ProductDetailScreen;
