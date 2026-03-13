/**
 * Product Detail Screen - Shein-inspired
 * Clean product page with tabs, image overlays, color/size selectors, shipping info, fixed CTA bar
 */

import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
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
  Share,
  Modal,
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
import { setCart, addItem } from '../../store/slices/cartSlice';
import Colors from '../../constants/colors';
import { FREE_SHIPPING_THRESHOLD } from '../../constants/config';
import { getEstDeliveryLabel } from '../../constants/shipping';
import { addToRecentlyViewed } from '../../components/RecentlyViewed';
import ProductCard from '../../components/ProductCard';
import { analyticsService } from '../../services/analytics.service';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const IMAGE_HEIGHT = SCREEN_WIDTH; // Square images for better display

// Review type for Reviews tab (can be replaced with API later)
interface ProductReview {
  id: string;
  author: string;
  rating: number;
  date: string;
  text: string;
  verified?: boolean;
}

// Generate sample reviews from product (fallback when no review API)
const getSampleReviews = (product: Product): ProductReview[] => {
  const names = ['Alex M.', 'Jordan K.', 'Sam T.', 'Riley J.', 'Casey L.', 'Morgan P.'];
  const comments = [
    'Great quality and fit. Exactly as described.',
    'Love it! Fast shipping.',
    'Good value for money. Would buy again.',
    'Nice product. Recommended.',
    'Perfect for the price.',
    'Very satisfied with this purchase.',
  ];
  const rating = Math.min(5, Math.max(1, Math.round((product.rating ?? 4) * 2) / 2));
  const baseRating = Math.floor(rating);
  return names.slice(0, Math.max(1, product.reviewCount ?? 3)).map((name, i) => ({
    id: `review-${product._id}-${i}`,
    author: name,
    rating: Math.min(5, baseRating + (i % 2) * 0.5),
    date: new Date(Date.now() - (i + 1) * 86400000 * 7).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    text: comments[i % comments.length],
    verified: i % 2 === 0,
  }));
};

// Size guide table row: first key is size label, rest are measurement columns
export type SizeGuideRow = Record<string, string>;
export type SizeGuideData = { title: string; sizeColumnLabel: string; columns: string[]; rows: SizeGuideRow[] };

function getSizeGuideData(product: Product | null): SizeGuideData | null {
  if (!product?.attributes?.length && !product?.variations?.length) return null;
  const sizeAttr = (product.attributes || []).find(
    (a: any) => a && (a.name || '').toLowerCase().includes('size')
  );
  const sizeValues: string[] = [];
  if (sizeAttr?.values?.length) {
    sizeAttr.values.forEach((v: any) => {
      const s = typeof v === 'string' ? v : (v?.label ?? v?.value ?? v?.slug ?? '');
      if (s) sizeValues.push(String(s));
    });
  }
  if (sizeValues.length === 0 && product.variations?.length) {
    const seen = new Set<string>();
    (product.variations || []).forEach((v: any) => {
      if (!v?.attributes) return;
      const attrs = v.attributes;
      const raw = Array.isArray(attrs)
        ? (attrs as any[]).find((a: any) => a && (a.name === 'Size' || (a.name || '').toLowerCase().includes('size')))
        : attrs['Size'] ?? attrs['size'];
      const val = raw != null ? (typeof raw === 'object' ? (raw as any).value ?? (raw as any).label : raw) : null;
      if (val != null) {
        const str = String(val);
        if (!seen.has(str)) {
          seen.add(str);
          sizeValues.push(str);
        }
      }
    });
  }
  if (sizeValues.length === 0) return null;
  const numericSizes = sizeValues.every((s) => /^\d+$/.test(String(s).trim()));
  const sizeColumnLabel = numericSizes ? 'Size (EU)' : 'Size';
  const columns = [sizeColumnLabel, 'Chest (in)', 'Waist (in)', 'Hips (in)'];
  const defaultMeasurements: Record<string, [string, string, string]> = {
    XS: ['31-33', '24-26', '33-35'],
    S: ['34-36', '27-29', '35-37'],
    M: ['37-39', '30-32', '38-40'],
    L: ['40-42', '33-35', '41-43'],
    XL: ['43-45', '36-38', '44-46'],
    XXL: ['46-48', '39-41', '47-49'],
  };
  const euMeasurements: Record<string, [string, string, string]> = {
    '32': ['31-33', '24-26', '33-35'],
    '34': ['33-35', '26-28', '35-37'],
    '36': ['35-37', '28-30', '37-39'],
    '38': ['37-39', '30-32', '38-40'],
    '40': ['39-41', '32-34', '41-43'],
    '42': ['41-43', '34-36', '43-45'],
    '44': ['43-45', '36-38', '45-47'],
  };
  const sortedSizes = [...sizeValues].sort((a, b) => {
    const na = defaultMeasurements[a] ? 0 : euMeasurements[a] ? 1 : 2;
    const nb = defaultMeasurements[b] ? 0 : euMeasurements[b] ? 1 : 2;
    if (na !== nb) return na - nb;
    const order = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '32', '34', '36', '38', '40', '42', '44'];
    const ia = order.indexOf(a);
    const ib = order.indexOf(b);
    if (ia !== -1 && ib !== -1) return ia - ib;
    if (numericSizes) return Number(a) - Number(b);
    return String(a).localeCompare(String(b));
  });
  const rows: SizeGuideRow[] = sortedSizes.map((size) => {
    const key = size.toUpperCase();
    const def = defaultMeasurements[size] ?? defaultMeasurements[key] ?? euMeasurements[size] ?? euMeasurements[key];
    const [chest, waist, hips] = def ?? ['–', '–', '–'];
    return { [sizeColumnLabel]: size, 'Chest (in)': chest, 'Waist (in)': waist, 'Hips (in)': hips };
  });
  const categoryName = (product as any).categories?.[0]?.name || (typeof product.category === 'object' && product.category ? (product.category as any).name : null) || '';
  const title = categoryName ? `${categoryName} Size Guide` : 'Size Guide';
  return { title, sizeColumnLabel, columns, rows };
}

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
  const shippingLocation = useAppSelector((state) => state.shippingLocation);
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
  const [activeTab, setActiveTab] = useState<'Goods' | 'Reviews' | 'Recommend'>('Goods');
  const [titleExpanded, setTitleExpanded] = useState(false);
  const [sizeGuideVisible, setSizeGuideVisible] = useState(false);
  const [addedToCartModal, setAddedToCartModal] = useState<{
    productName: string;
    imageUri: string | null;
    quantity: number;
    variationText: string;
  } | null>(null);

  const sizeGuideData = useMemo(() => getSizeGuideData(product), [product]);
  const addedModalCheckAnim = useRef(new Animated.Value(0)).current;

  const scrollViewRef = useRef<ScrollView>(null);
  const imageScrollRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const formatAttributeValue = (value: any): string => {
    if (value == null) return '';
    if (typeof value === 'string' || typeof value === 'number') return String(value);
    if (typeof value === 'object') {
      return (
        (value as any).label ||
        (value as any).value ||
        (value as any).slug ||
        (value as any).name ||
        ''
      );
    }
    return String(value);
  };

  const formatSelectedAttributes = (variation: any | null | undefined): string => {
    if (!variation || !variation.attributes) return '';
    const attrs = variation.attributes;

    if (Array.isArray(attrs)) {
      const parts = (attrs as any[])
        .map((attr) => {
          if (!attr) return '';
          const name = attr.name || attr.attribute || 'Option';
          const val = formatAttributeValue(attr.value ?? attr.label ?? attr.slug ?? attr);
          if (!val) return '';
          return `${name} ${val}`;
        })
        .filter(Boolean);
      return parts.join(', ');
    }

    return Object.entries(attrs)
      .map(([key, value]) => {
        const val = formatAttributeValue(value);
        if (!val) return '';
        return `${key} ${val}`;
      })
      .filter(Boolean)
      .join(', ');
  };

  const getVariationAttributeRaw = (variation: any, attributeName: string): any => {
    if (!variation || !variation.attributes) return undefined;
    const attrs = variation.attributes;
    if (Array.isArray(attrs)) {
      const attrObj = (attrs as any[]).find(
        (a) => a && (a.name === attributeName || a.attribute === attributeName)
      );
      if (!attrObj) return undefined;
      return (
        (attrObj as any).value ??
        (attrObj as any).label ??
        (attrObj as any).slug ??
        (attrObj as any).valueId ??
        attrObj
      );
    }
    return (attrs as any)[attributeName];
  };

  const getVariationAttributeValueKey = (variation: any, attributeName: string): string => {
    const raw = getVariationAttributeRaw(variation, attributeName);
    return formatAttributeValue(raw);
  };

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

  useEffect(() => {
    if (addedToCartModal) {
      addedModalCheckAnim.setValue(0);
      Animated.spring(addedModalCheckAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 100,
        friction: 7,
      }).start();
    }
  }, [addedToCartModal]);

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
      // Resolve category: product.category (string or object) or first from product.categories
      let categoryId: string | null = null;
      if (product.category) {
        categoryId = typeof product.category === 'string' ? product.category : (product.category as any)?._id ?? null;
      }
      if (!categoryId && (product as any).categories?.length) {
        const first = (product as any).categories[0];
        categoryId = typeof first === 'string' ? first : first?._id ?? null;
      }
      // Resolve brand: string or object with name/_id
      const brand = typeof product.brand === 'string'
        ? product.brand
        : (product.brand as any)?.name ?? (product.brand as any)?._id ?? null;
      
      const currentId = product._id;
      const limit = 12;
      const maxRelated = 8;
      let candidates: any[] = [];
      
      // Prefer same category (most relevant to this product)
      if (categoryId) {
        const response = await productService.getProductsByCategory(categoryId, 1, limit);
        if ((response as any).success !== false && response.data) {
          const arr = Array.isArray(response.data) ? response.data : (response.data as any).products || [];
          candidates = arr.filter((p: any) => p._id !== currentId);
        }
      }
      
      // If we have brand and need more related, add same-brand products (avoid duplicates)
      if (brand && candidates.length < maxRelated) {
        const response = await productService.getProductsByBrand(brand, 1, limit);
        if ((response as any).success !== false && response.data) {
          const arr = Array.isArray(response.data) ? response.data : (response.data as any).products || [];
          const existingIds = new Set(candidates.map((p: any) => p._id));
          const byBrand = arr.filter((p: any) => p._id !== currentId && !existingIds.has(p._id));
          candidates = [...candidates, ...byBrand];
        }
      }
      
      // Fallback: same-category and brand didn't yield enough, use general list
      if (candidates.length < 4) {
        const response = await productService.getAllProducts({ limit: 20 });
        if ((response as any).success !== false && response.data) {
          const arr = Array.isArray(response.data) ? response.data : (response.data as any).products || [];
          const existingIds = new Set(candidates.map((p: any) => p._id));
          const extra = arr.filter((p: any) => p._id !== currentId && !existingIds.has(p._id));
          candidates = [...candidates, ...extra];
        }
      }
      
      const filtered = candidates.slice(0, maxRelated).map((p: any) => cleanProductData(p));
      setRelatedProducts(filtered);
    } catch (error) {
      console.error('Error loading related products:', error);
    } finally {
      setLoadingRelated(false);
    }
  };

  const handleAddToCart = async () => {
    // Guest checkout enabled - allow adding to cart without login
    // If not authenticated, we'll use local cart (Redux store)

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

      // Calculate price
      const price = selectedVariation?.salePrice || selectedVariation?.price || product.salePrice || product.price;

      if (isAuthenticated) {
        // Authenticated user: Use API
        const response = await cartService.addToCart(
          product._id,
          quantity,
          variationId,
          variationData
        );

        if (response.success) {
          // Refresh cart from server to get latest state (newest first handled by backend or client sort if needed)
          try {
            const cartResponse = await cartService.getCart();
            if (cartResponse.success && cartResponse.data) {
              dispatch(setCart(cartResponse.data));
            }
          } catch (cartError) {
            console.error('Error refreshing cart:', cartError);
          }

          try {
            analyticsService.addToCart(product._id, product.name, price, quantity);
          } catch (analyticsError) {
            console.error('Error tracking analytics:', analyticsError);
          }

          const productName = product.name || 'Product';
          const attrsText = product.productType === 'variable' ? formatSelectedAttributes(selectedVariation) : '';
          const firstImg = product.images?.[0];
          const imageUri = typeof firstImg === 'string' ? firstImg : (firstImg as any)?.url ?? (product as any).featuredImage ?? null;
          setAddedToCartModal({
            productName,
            imageUri,
            quantity,
            variationText: attrsText ? ` (${attrsText})` : '',
          });
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
      } else {
        // Guest user: Use local Redux store
        const cartItem = {
          _id: `guest_${Date.now()}_${Math.random()}`,
          product: product,
          variation: variationData || undefined,
          quantity: quantity,
          price: price,
          subtotal: price * quantity,
        };

        dispatch(addItem(cartItem));

        try {
          analyticsService.addToCart(product._id, product.name, price, quantity);
        } catch (analyticsError) {
          console.error('Error tracking analytics:', analyticsError);
        }

        const productName = product.name || 'Product';
        const attrsText = product.productType === 'variable' ? formatSelectedAttributes(selectedVariation) : '';
        const firstImg = product.images?.[0];
        const imageUri = typeof firstImg === 'string' ? firstImg : (firstImg as any)?.url ?? (product as any).featuredImage ?? null;
        setAddedToCartModal({
          productName,
          imageUri,
          quantity,
          variationText: attrsText ? ` (${attrsText})` : '',
        });
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

  const handleShare = () => {
    if (!product) return;
    const price = product.salePrice ?? product.price ?? 0;
    Share.share({
      message: `${product.name} - $${price.toFixed(2)}`,
      title: product.name,
      url: undefined,
    }).catch(() => {});
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

  const renderRecommendProduct = useCallback(({ item }: { item: Product }) => (
    <View style={styles.recommendProductItem}>
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
  
  const rating = product.rating || 0;
  const reviewCount = product.reviewCount || 0;
  const soldCount = Math.floor(reviewCount * 0.8);
  const stockStatus = currentStock > 0 && currentStock <= 10;
  const isOutOfStock = currentStock === 0;
  
  // Check if variable product needs variation selection
  // For variable products, we need all attributes selected
  // Build selected attributes as { name: value } so it works when variation.attributes is array or object
  const getSelectedAttributes = (): Record<string, string> => {
    if (!selectedVariation || !product?.attributes?.length) return {};
    const result: Record<string, string> = {};
    (product.attributes || []).forEach((attr: any) => {
      if (!attr || !attr.name) return;
      const val = getVariationAttributeValueKey(selectedVariation, attr.name);
      if (val) result[attr.name] = val;
    });
    return result;
  };

  const allAttributesSelected = product.productType === 'variable' && product.attributes && Array.isArray(product.attributes)
    ? product.attributes.every((attr: any) => {
        if (!attr || !attr.name) return true;
        const selectedAttrs = getSelectedAttributes();
        return selectedAttrs[attr.name] != null && selectedAttrs[attr.name] !== '';
      })
    : true;

  const needsVariation = product.productType === 'variable' && product.variations && Array.isArray(product.variations) && product.variations.length > 0
    ? !selectedVariation || !allAttributesSelected
    : false;

  return (
    <View style={styles.container}>
      {/* Shein-style Header: back, center, cart + share + heart */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerIconBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Ionicons name="search" size={18} color={Colors.primary} style={{ opacity: 0.6 }} />
          <Text style={styles.headerSearchPlaceholder} numberOfLines={1}>
            {product.name}
          </Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerIconBtn} onPress={() => navigation.navigate('Cart')} activeOpacity={0.7}>
            <Ionicons name="cart-outline" size={22} color={Colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIconBtn} onPress={handleShare} activeOpacity={0.7}>
            <Ionicons name="share-outline" size={22} color={Colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIconBtn} onPress={handleToggleWishlist} activeOpacity={0.7}>
            <Ionicons name={isWishlisted ? 'heart' : 'heart-outline'} size={22} color={isWishlisted ? '#E60012' : Colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Tabs: Goods | Reviews | Recommend */}
      <View style={styles.tabsRow}>
        {(['Goods', 'Reviews', 'Recommend'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={styles.tab}
            onPress={() => setActiveTab(tab)}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
            {activeTab === tab && <View style={styles.tabUnderline} />}
          </TouchableOpacity>
        ))}
      </View>

      {/* Recommend tab: FlatList outside ScrollView to avoid nesting VirtualizedList */}
      {activeTab === 'Recommend' ? (
        <View style={styles.recommendWrapper}>
          <Text style={styles.recommendTitle}>Recommended for you</Text>
          {loadingRelated ? (
            <ActivityIndicator size="large" color={Colors.secondary} style={{ marginTop: 40 }} />
          ) : relatedProducts.length === 0 ? (
            <View style={styles.recommendEmpty}>
              <Ionicons name="shirt-outline" size={48} color={Colors.primary} style={{ opacity: 0.4 }} />
              <Text style={styles.recommendEmptyText}>No recommendations right now</Text>
            </View>
          ) : (
            <FlatList
              data={relatedProducts}
              renderItem={renderRecommendProduct}
              keyExtractor={(item) => item._id}
              numColumns={2}
              columnWrapperStyle={styles.recommendRow}
              contentContainerStyle={styles.recommendList}
              showsVerticalScrollIndicator={false}
              ListFooterComponent={<View style={{ height: 100 }} />}
            />
          )}
        </View>
      ) : (
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}
      >
        {activeTab === 'Reviews' ? (
          <View>
            <View style={styles.reviewsContainer}>
              {/* Rating summary */}
              <View style={styles.reviewsSummary}>
                <View style={styles.reviewsSummaryScore}>
                  <Text style={styles.reviewsScoreNumber}>{rating.toFixed(1)}</Text>
                  <View style={styles.reviewsStarsRow}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Ionicons key={s} name={s <= Math.round(rating) ? 'star' : 'star-outline'} size={20} color="#FFB800" />
                    ))}
                  </View>
                  <Text style={styles.reviewsScoreCount}>{reviewCount}+ reviews</Text>
                </View>
                <View style={styles.reviewsBreakdown}>
                  {[5, 4, 3, 2, 1].map((star) => {
                    const pct = star === Math.round(rating) ? 60 : star < rating ? 20 : 5;
                    return (
                      <View key={star} style={styles.reviewsBreakdownRow}>
                        <Text style={styles.reviewsBreakdownLabel}>{star}★</Text>
                        <View style={styles.reviewsBreakdownBarBg}>
                          <View style={[styles.reviewsBreakdownBarFill, { width: `${pct}%` }]} />
                        </View>
                        <Text style={styles.reviewsBreakdownPct}>{pct}%</Text>
                      </View>
                    );
                  })}
                </View>
              </View>
              {/* Review list */}
              {getSampleReviews(product).map((rev) => (
                <View key={rev.id} style={styles.reviewCard}>
                  <View style={styles.reviewCardHeader}>
                    <View style={styles.reviewAuthorRow}>
                      <View style={styles.reviewAvatar}>
                        <Text style={styles.reviewAvatarText}>{rev.author.charAt(0)}</Text>
                      </View>
                      <View>
                        <Text style={styles.reviewAuthorName}>{rev.author}</Text>
                        <View style={styles.reviewCardStars}>
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Ionicons key={s} name={s <= rev.rating ? 'star' : 'star-outline'} size={12} color="#FFB800" />
                          ))}
                          {rev.verified && (
                            <Text style={styles.reviewVerified}> Verified</Text>
                          )}
                        </View>
                      </View>
                    </View>
                    <Text style={styles.reviewDate}>{rev.date}</Text>
                  </View>
                  <Text style={styles.reviewText}>{rev.text}</Text>
                </View>
              ))}
              <TouchableOpacity style={styles.writeReviewBtn} activeOpacity={0.8}>
                <Ionicons name="pencil-outline" size={18} color={Colors.primary} />
                <Text style={styles.writeReviewBtnText}>Write a review</Text>
              </TouchableOpacity>
            </View>
            <View style={{ height: 100 }} />
          </View>
        ) : (
          <>
        {/* Image Gallery - Shein style with overlays */}
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

              {/* Top-right badge (e.g. verified / material) */}
              <View style={styles.imageBadgeTopRight}>
                <Text style={styles.imageBadgeTitle}>Zuba</Text>
                <Text style={styles.imageBadgeSub}>VERIFIED</Text>
              </View>

              {/* Image counter bottom-right */}
              {imageUrls.length > 1 && (
                <View style={styles.imageCounter}>
                  <Text style={styles.imageCounterText}>{selectedImageIndex + 1}/{imageUrls.length}</Text>
                </View>
              )}

              {/* Sale banner on image when discount */}
              {discount > 0 && (
                <View style={styles.saleBannerOnImage}>
                  <Text style={styles.saleBannerOnImageText}>* SALE *</Text>
                  <Text style={styles.saleBannerOnImageSave}>Save ${(originalPrice ? (originalPrice - displayPrice) : 0).toFixed(2)}</Text>
                </View>
              )}

              {/* Dots indicator */}
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

        {/* Product Info - Shein style */}
        <View style={styles.content}>
          {/* Price row: From $X, -X% pill, strikethrough original */}
          <View style={styles.priceRowShein}>
            <Text style={styles.priceFrom}>
              {product.productType === 'variable' && product.variations?.length ? 'From ' : ''}${displayPrice.toFixed(2)}
            </Text>
            {discount > 0 && (
              <View style={styles.discountPill}>
                <Text style={styles.discountPillText}>-{discount}%</Text>
              </View>
            )}
            {originalPrice != null && originalPrice > displayPrice && (
              <Text style={styles.originalPriceShein}>${originalPrice.toFixed(2)}</Text>
            )}
          </View>

          {/* Title + Rating row (title with expand arrow, star rating with count) */}
          <TouchableOpacity
            style={styles.titleRatingRow}
            onPress={() => setTitleExpanded(!titleExpanded)}
            activeOpacity={0.8}
          >
            <Text style={styles.productTitleShein} numberOfLines={titleExpanded ? undefined : 2}>
              {product.name}
            </Text>
            <View style={styles.ratingBlock}>
              <Ionicons name="star" size={14} color="#FFB800" />
              <Text style={styles.ratingCountText}>{rating.toFixed(2)} ({reviewCount}+)</Text>
              <Ionicons name="chevron-forward" size={14} color={Colors.primary} style={{ opacity: 0.6 }} />
            </View>
          </TouchableOpacity>

          {/* Bestseller-style badge (e.g. category) */}
          {(product as any).categories?.length > 0 || product.category ? (
            <View style={styles.bestsellerBanner}>
              <Text style={styles.bestsellerBannerText} numberOfLines={1}>
                #{'\u00A0'}Bestseller in {(product as any).categories?.[0]?.name || 'Fashion'}
              </Text>
            </View>
          ) : null}

          {/* Variations - Shein style: Color / Size with "X Left" and Size Guide */}
          {product.productType === 'variable' && product.variations && Array.isArray(product.variations) && product.variations.length > 0 && (
            <View style={styles.variationSection}>
              {/* Group variations by attribute (Color, Size, etc.) */}
              {product.attributes && Array.isArray(product.attributes) && product.attributes.map((attribute) => {
                if (!attribute || !attribute.values || !Array.isArray(attribute.values)) return null;
                
                // Collect all attribute values present across variations so every option is selectable
                const allValues = new Set<string>(
                  (product.variations || [])
                    .filter(v => v && v.attributes)
                    .map(v => getVariationAttributeValueKey(v, attribute.name))
                    .filter(Boolean) as string[]
                );
                const availableValues = allValues;
                
                const selectedValueKey = selectedVariation
                  ? getVariationAttributeValueKey(selectedVariation, attribute.name)
                  : '';
                const selectedValueStr = selectedValueKey || 'Default';

                return (
                  <View key={attribute._id || attribute.name} style={styles.attributeGroup}>
                    <TouchableOpacity style={styles.attributeRowShein} activeOpacity={0.8}>
                      <Text style={styles.attributeLabelShein}>{attribute.name}: {selectedValueStr}</Text>
                      <Ionicons name="chevron-forward" size={16} color={Colors.primary} style={{ opacity: 0.6 }} />
                    </TouchableOpacity>
                    <View style={styles.attributeValues}>
                      {attribute.values.map((value) => {
                        if (!value) return null;
                        
                        // Handle value as string or object with {valueId, label, slug}
                        const valueString = typeof value === 'string' 
                          ? value 
                          : (value as any)?.label || (value as any)?.value || (value as any)?.slug || String(value);
                        const valueId = typeof value === 'string' ? value : (value as any)?.valueId || (value as any)?.slug || valueString;
                        const valueKey = formatAttributeValue(
                          typeof value === 'string' ? value : ((value as any)?.valueId ?? valueString)
                        );
                        
                        // Find variation with this attribute value (any stock so option is selectable)
                        const matchingVariation = (product.variations || []).find(
                          v => {
                            if (!v || !v.attributes) return false;
                            const attrKey = getVariationAttributeValueKey(v, attribute.name);
                            return attrKey === valueKey || attrKey === valueString;
                          }
                        );
                        const isSelected = !!selectedVariation && selectedValueKey === valueKey;
                        const isAvailable = availableValues.has(valueKey) || availableValues.has(valueString);
                        const hasAnyInStock = (product.variations || []).some(
                          v => v && v.attributes && (v.stock ?? 0) > 0 &&
                            (() => {
                              const attrKey = getVariationAttributeValueKey(v, attribute.name);
                              return attrKey === valueKey || attrKey === valueString;
                            })()
                        );
                        const isInStock = hasAnyInStock;

                        return (
                          <TouchableOpacity
                            key={valueId ?? valueString}
                            style={[
                              styles.attributeButton,
                              isSelected && styles.attributeButtonSelected,
                              !isAvailable && styles.attributeButtonDisabled,
                            ]}
                            onPress={() => {
                              if (!isAvailable) return;
                              
                              // If this is the first attribute or same attribute, just select this value
                              // Otherwise, find variation matching all selected attributes
                              // Build required attribute keys using our helper (works for attributes as array or object)
                              const allRequiredAttrs: Record<string, string> = {};
                              (product.attributes || []).forEach(attr => {
                                if (!attr || !attr.name) return;
                                if (attr.name === attribute.name) {
                                  allRequiredAttrs[attr.name] = valueKey || valueString;
                                } else if (selectedVariation) {
                                  const k = getVariationAttributeValueKey(selectedVariation, attr.name);
                                  if (k) allRequiredAttrs[attr.name] = k;
                                }
                              });
                              
                              // Find variation that matches all required attributes
                              const fullMatch = (product.variations || []).find(v => {
                                if (!v || !v.attributes) return false;
                                return (product.attributes || []).every(attr => {
                                  if (!attr || !attr.name) return true;
                                  const required = allRequiredAttrs[attr.name];
                                  if (!required) return true;
                                  const vKey = getVariationAttributeValueKey(v, attr.name);
                                  return vKey === required;
                                });
                              });
                              
                              if (fullMatch) {
                                setSelectedVariation(fullMatch);
                              } else {
                                // Single attribute (e.g. Size): use matchingVariation for this tap
                                if (matchingVariation) {
                                  setSelectedVariation(matchingVariation);
                                }
                              }
                            }}
                            disabled={!isAvailable}
                          >
                            <View style={styles.attributeButtonInner}>
                              <Text
                                style={[
                                  styles.attributeText,
                                  isSelected && styles.attributeTextSelected,
                                  !isAvailable && styles.attributeTextDisabled,
                                ]}
                              >
                                {valueString}
                              </Text>
                              {isAvailable && matchingVariation != null && (matchingVariation.stock ?? 0) > 0 && (matchingVariation.stock ?? 0) <= 99 && (
                                <Text style={styles.xLeftBadge}>{matchingVariation.stock} Left</Text>
                              )}
                              {isAvailable && !isInStock && (
                                <Text style={styles.outOfStockLabel}>Out</Text>
                              )}
                            </View>
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
                    Selected: {formatSelectedAttributes(selectedVariation)}
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

              {/* Size Guide link (Shein style) - show when we have size data from attributes or variations */}
              {sizeGuideData && (
                <TouchableOpacity style={styles.sizeGuideRow} activeOpacity={0.7} onPress={() => setSizeGuideVisible(true)}>
                  <Ionicons name="shirt-outline" size={16} color={Colors.primary} />
                  <Text style={styles.sizeGuideText}>Size Guide</Text>
                  <Ionicons name="chevron-forward" size={16} color={Colors.primary} style={{ opacity: 0.6 }} />
                </TouchableOpacity>
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

          {/* Shipping & Service - Shein style */}
          <View style={styles.shippingSection}>
            <TouchableOpacity
              style={styles.shippingRow}
              activeOpacity={0.7}
              onPress={() => navigation.navigate('SelectLocation')}
            >
              <Ionicons name="location-outline" size={18} color={Colors.primary} />
              <Text style={styles.shippingRowText}>Shipping to</Text>
              <Text style={styles.shippingRowValue} numberOfLines={1}>
                {shippingLocation.countryName
                  ? [shippingLocation.city, shippingLocation.region, shippingLocation.countryName].filter(Boolean).join(', ')
                  : 'Select location'}
              </Text>
              <Ionicons name="chevron-forward" size={16} color={Colors.primary} style={{ opacity: 0.5 }} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.shippingRow}
              activeOpacity={0.7}
              onPress={() =>
                Alert.alert(
                  'Free Shipping',
                  `Orders over $${FREE_SHIPPING_THRESHOLD} qualify for free shipping. Add more items to your cart to get free delivery!`,
                  [{ text: 'OK' }]
                )
              }
            >
              <Ionicons name="car-outline" size={18} color={Colors.primary} />
              <Text style={styles.shippingRowText}>Free Shipping (Orders {'>'} $200)</Text>
              <Ionicons name="chevron-forward" size={16} color={Colors.primary} style={{ opacity: 0.5 }} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.shippingRow}
              activeOpacity={0.7}
              onPress={() =>
                Alert.alert(
                  'Estimated Delivery',
                  `Zuba House\n\n• Zuba House Regular — ${getEstDeliveryLabel(shippingLocation.countryCode)}\n• Zuba House Express — faster delivery at checkout`,
                  [{ text: 'OK' }]
                )
              }
            >
              <Ionicons name="time-outline" size={18} color={Colors.primary} />
              <Text style={styles.shippingRowText}>
                Est. Delivery: {getEstDeliveryLabel(shippingLocation.countryCode)}
              </Text>
              <Ionicons name="chevron-forward" size={16} color={Colors.primary} style={{ opacity: 0.5 }} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.shippingRow}
              activeOpacity={0.7}
              onPress={() => navigation.navigate('ReturnPolicy')}
            >
              <Ionicons name="return-down-back-outline" size={18} color={Colors.primary} />
              <Text style={styles.shippingRowText} numberOfLines={2}>30-Day Free Returns · No returns after 30 days</Text>
              <Ionicons name="chevron-forward" size={16} color={Colors.primary} style={{ opacity: 0.5 }} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.shippingRow}
              activeOpacity={0.7}
              onPress={() => navigation.navigate('SafePaymentsPrivacy')}
            >
              <Ionicons name="shield-checkmark-outline" size={18} color={Colors.primary} />
              <Text style={styles.shippingRowText}>Safe Payments · Privacy Protection</Text>
              <Ionicons name="chevron-forward" size={16} color={Colors.primary} style={{ opacity: 0.5 }} />
            </TouchableOpacity>
            <View style={styles.shippingRow}>
              <Ionicons name="storefront-outline" size={18} color={Colors.primary} />
              <Text style={styles.shippingRowText}>Ship from Zuba House</Text>
            </View>
          </View>

          {/* Description - fully visible */}
          {product.description ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.description}>{product.description}</Text>
            </View>
          ) : (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.description}>No description available for this product.</Text>
            </View>
          )}

          {/* Cross-Sell Section - You May Also Like (fully visible with fixed height so it renders inside ScrollView) */}
          {relatedProducts.length > 0 && activeTab === 'Goods' && (
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
                <View style={styles.relatedListWrapper}>
                  <FlatList
                    data={relatedProducts}
                    renderItem={renderRelatedProduct}
                    keyExtractor={(item) => item._id}
                    horizontal
                    showsHorizontalScrollIndicator={true}
                    contentContainerStyle={styles.relatedList}
                    removeClippedSubviews={false}
                    initialNumToRender={6}
                    maxToRenderPerBatch={10}
                  />
                </View>
              )}
            </View>
          )}

          {/* Spacer for fixed bottom bar - extra when related section so nothing is cut off */}
          <View style={{ height: relatedProducts.length > 0 ? 120 : 100 }} />
        </View>
          </>
        )}
      </ScrollView>
      )}

      {/* Fixed bottom bar - Shein style: heart + Add to Cart */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.bottomBarWishlist} onPress={handleToggleWishlist} activeOpacity={0.7}>
          <Ionicons name={isWishlisted ? 'heart' : 'heart-outline'} size={28} color={isWishlisted ? '#E60012' : Colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.bottomBarAddBtn,
            (isOutOfStock || needsVariation || addingToCart) && styles.bottomBarAddBtnDisabled,
          ]}
          onPress={handleAddToCart}
          disabled={isOutOfStock || needsVariation || addingToCart}
          activeOpacity={0.8}
        >
          {addingToCart ? (
            <ActivityIndicator size="small" color={Colors.white} />
          ) : (
            <Text style={styles.bottomBarAddBtnText}>
              {discount > 0 ? `${discount}% OFF! ` : ''}Add to Cart
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Size Guide Modal - formatted from product sizes; admin override can be added later */}
      <Modal
        visible={sizeGuideVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setSizeGuideVisible(false)}
      >
        <View style={styles.sizeGuideModalOverlay}>
          <View style={styles.sizeGuideModalContent}>
            <View style={styles.sizeGuideModalHeader}>
              <Text style={styles.sizeGuideModalTitle}>
                {sizeGuideData?.title ?? 'Size Guide'}
              </Text>
              <TouchableOpacity
                style={styles.sizeGuideModalCloseBtn}
                onPress={() => setSizeGuideVisible(false)}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <Ionicons name="close" size={24} color={Colors.primary} />
              </TouchableOpacity>
            </View>
            {sizeGuideData ? (
              <ScrollView style={styles.sizeGuideScroll} showsVerticalScrollIndicator={false}>
                <View style={styles.sizeGuideTable}>
                  <View style={styles.sizeGuideTableHeader}>
                    {sizeGuideData.columns.map((col) => (
                      <Text key={col} style={styles.sizeGuideTableHeaderCell} numberOfLines={1}>
                        {col}
                      </Text>
                    ))}
                  </View>
                  {sizeGuideData.rows.map((row, idx) => (
                    <View key={idx} style={[styles.sizeGuideTableRow, idx % 2 === 1 && styles.sizeGuideTableRowAlt]}>
                      {sizeGuideData.columns.map((col) => (
                        <Text key={col} style={styles.sizeGuideTableCell} numberOfLines={1}>
                          {row[col] ?? '–'}
                        </Text>
                      ))}
                    </View>
                  ))}
                </View>
              </ScrollView>
            ) : (
              <Text style={styles.sizeGuideEmpty}>No size data for this product.</Text>
            )}
          </View>
        </View>
      </Modal>

      {/* Premium Added to Cart modal */}
      <Modal
        visible={!!addedToCartModal}
        animationType="fade"
        transparent
        onRequestClose={() => setAddedToCartModal(null)}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={styles.addedModalOverlay}
          onPress={() => setAddedToCartModal(null)}
        >
          <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()} style={styles.addedModalCard}>
            <Animated.View
              style={[
                styles.addedModalCheckWrap,
                {
                  transform: [
                    { scale: addedModalCheckAnim.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] }) },
                  ],
                  opacity: addedModalCheckAnim,
                },
              ]}
            >
              <View style={styles.addedModalCheckCircle}>
                <Ionicons name="checkmark" size={36} color={Colors.white} />
              </View>
            </Animated.View>
            <Text style={styles.addedModalTitle}>Added to cart</Text>
            {addedToCartModal && (
              <>
                <View style={styles.addedModalProductRow}>
                  {addedToCartModal.imageUri ? (
                    <Image source={{ uri: addedToCartModal.imageUri }} style={styles.addedModalImage} />
                  ) : (
                    <View style={[styles.addedModalImage, styles.addedModalImagePlaceholder]}>
                      <Ionicons name="shirt-outline" size={28} color={Colors.primary} style={{ opacity: 0.5 }} />
                    </View>
                  )}
                  <View style={styles.addedModalProductInfo}>
                    <Text style={styles.addedModalProductName} numberOfLines={2}>{addedToCartModal.productName}{addedToCartModal.variationText}</Text>
                    <Text style={styles.addedModalQty}>Qty: {addedToCartModal.quantity}</Text>
                  </View>
                </View>
                <View style={styles.addedModalActions}>
                  <TouchableOpacity
                    style={styles.addedModalBtnSecondary}
                    onPress={() => setAddedToCartModal(null)}
                  >
                    <Text style={styles.addedModalBtnSecondaryText}>Continue Shopping</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.addedModalBtnPrimary}
                    onPress={() => {
                      setAddedToCartModal(null);
                      navigation.navigate('Cart');
                    }}
                  >
                    <Text style={styles.addedModalBtnPrimaryText}>View Cart</Text>
                    <Ionicons name="cart" size={18} color={Colors.white} />
                  </TouchableOpacity>
                </View>
              </>
            )}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
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
  headerIconBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: Colors.tertiary,
    borderRadius: 8,
    gap: 8,
  },
  headerSearchPlaceholder: {
    fontSize: 14,
    color: Colors.primary,
    opacity: 0.8,
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  tabsRow: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabText: {
    fontSize: 15,
    color: Colors.primary,
    opacity: 0.6,
    fontWeight: '500',
  },
  tabTextActive: {
    opacity: 1,
    fontWeight: '700',
  },
  tabUnderline: {
    position: 'absolute',
    bottom: 0,
    left: '20%',
    right: '20%',
    height: 2,
    backgroundColor: Colors.primary,
  },
  imageBadgeTopRight: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: Colors.white,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
    alignItems: 'center',
  },
  imageBadgeTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  imageBadgeSub: {
    fontSize: 9,
    color: Colors.primary,
    opacity: 0.8,
    marginTop: 1,
  },
  imageCounter: {
    position: 'absolute',
    bottom: 16,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  imageCounterText: {
    fontSize: 12,
    color: Colors.white,
    fontWeight: '600',
  },
  saleBannerOnImage: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#C41E3A',
  },
  saleBannerOnImageText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: 1,
  },
  saleBannerOnImageSave: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.white,
  },
  priceRowShein: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 10,
  },
  priceFrom: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.secondary,
  },
  discountPill: {
    backgroundColor: '#C41E3A',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  discountPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.white,
  },
  originalPriceShein: {
    fontSize: 16,
    color: Colors.primary,
    opacity: 0.5,
    textDecorationLine: 'line-through',
  },
  titleRatingRow: {
    marginBottom: 10,
  },
  productTitleShein: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
    lineHeight: 22,
    marginBottom: 6,
  },
  ratingBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingCountText: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '600',
  },
  bestsellerBanner: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFE066',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 4,
    marginBottom: 16,
  },
  bestsellerBannerText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
  },
  attributeRowShein: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  attributeLabelShein: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.primary,
  },
  attributeButtonInner: {
    alignItems: 'center',
    position: 'relative',
  },
  xLeftBadge: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.secondary,
    marginTop: 2,
  },
  sizeGuideRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 6,
  },
  sizeGuideText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
  },
  sizeGuideModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sizeGuideModalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: SCREEN_HEIGHT * 0.75,
    paddingBottom: Platform.OS === 'ios' ? 28 : 16,
  },
  sizeGuideModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  sizeGuideModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primary,
  },
  sizeGuideModalCloseBtn: {
    padding: 4,
  },
  sizeGuideScroll: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  sizeGuideTable: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    overflow: 'hidden',
  },
  sizeGuideTableHeader: {
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  sizeGuideTableHeaderCell: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    color: Colors.white,
    textAlign: 'center',
  },
  sizeGuideTableRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  sizeGuideTableRowAlt: {
    backgroundColor: 'rgba(0,0,0,0.04)',
  },
  sizeGuideTableCell: {
    flex: 1,
    fontSize: 13,
    color: Colors.primary,
    textAlign: 'center',
  },
  sizeGuideEmpty: {
    padding: 24,
    fontSize: 14,
    color: Colors.secondary,
    textAlign: 'center',
  },
  addedModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  addedModalCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12 },
      android: { elevation: 8 },
    }),
  },
  addedModalCheckWrap: {
    marginBottom: 16,
  },
  addedModalCheckCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#2E7D32',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addedModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 16,
  },
  addedModalProductRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: Colors.background,
    borderRadius: 12,
  },
  addedModalImage: {
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: Colors.border,
  },
  addedModalImagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  addedModalProductInfo: {
    flex: 1,
    marginLeft: 12,
  },
  addedModalProductName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.primary,
  },
  addedModalQty: {
    fontSize: 13,
    color: Colors.primary,
    opacity: 0.7,
    marginTop: 4,
  },
  addedModalActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  addedModalBtnSecondary: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.primary,
    alignItems: 'center',
  },
  addedModalBtnSecondaryText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.primary,
  },
  addedModalBtnPrimary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: Colors.primary,
  },
  addedModalBtnPrimaryText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.white,
  },
  shippingSection: {
    marginTop: 20,
    marginBottom: 20,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.border,
  },
  shippingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    gap: 10,
  },
  shippingRowText: {
    flex: 1,
    fontSize: 14,
    color: Colors.primary,
  },
  shippingRowValue: {
    flex: 1,
    fontSize: 14,
    color: Colors.primary,
    opacity: 0.7,
    textAlign: 'right',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: Platform.OS === 'ios' ? 28 : 12,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: 12,
  },
  bottomBarWishlist: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomBarAddBtn: {
    flex: 1,
    height: 48,
    backgroundColor: Colors.primary,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomBarAddBtnDisabled: {
    backgroundColor: Colors.border,
    opacity: 0.8,
  },
  bottomBarAddBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
  },
  scrollView: {
    flex: 1,
  },
  tabPlaceholder: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
  tabPlaceholderText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 8,
  },
  tabPlaceholderSub: {
    fontSize: 14,
    color: Colors.primary,
    opacity: 0.6,
  },
  tabScroll: {
    flex: 1,
  },
  reviewsContainer: {
    backgroundColor: Colors.white,
    padding: 16,
    paddingBottom: 24,
  },
  reviewsSummary: {
    flexDirection: 'row',
    marginBottom: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  reviewsSummaryScore: {
    alignItems: 'center',
    marginRight: 32,
  },
  reviewsScoreNumber: {
    fontSize: 44,
    fontWeight: '800',
    color: Colors.primary,
  },
  reviewsStarsRow: {
    flexDirection: 'row',
    marginTop: 4,
    gap: 2,
  },
  reviewsScoreCount: {
    fontSize: 13,
    color: Colors.primary,
    opacity: 0.7,
    marginTop: 4,
  },
  reviewsBreakdown: {
    flex: 1,
    justifyContent: 'center',
  },
  reviewsBreakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 8,
  },
  reviewsBreakdownLabel: {
    fontSize: 12,
    color: Colors.primary,
    width: 24,
  },
  reviewsBreakdownBarBg: {
    flex: 1,
    height: 8,
    backgroundColor: Colors.tertiary,
    borderRadius: 4,
    overflow: 'hidden',
  },
  reviewsBreakdownBarFill: {
    height: '100%',
    backgroundColor: Colors.secondary,
    borderRadius: 4,
  },
  reviewsBreakdownPct: {
    fontSize: 11,
    color: Colors.primary,
    opacity: 0.7,
    width: 28,
    textAlign: 'right',
  },
  reviewCard: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  reviewCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  reviewAuthorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  reviewAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.secondary,
    opacity: 0.8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reviewAvatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
  },
  reviewAuthorName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.primary,
  },
  reviewCardStars: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    gap: 2,
  },
  reviewVerified: {
    fontSize: 11,
    color: Colors.primary,
    opacity: 0.7,
    marginLeft: 4,
  },
  reviewDate: {
    fontSize: 12,
    color: Colors.primary,
    opacity: 0.6,
  },
  reviewText: {
    fontSize: 14,
    color: Colors.primary,
    lineHeight: 20,
    opacity: 0.9,
  },
  writeReviewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    paddingVertical: 14,
    borderWidth: 2,
    borderColor: Colors.primary,
    borderRadius: 8,
    gap: 8,
  },
  writeReviewBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.primary,
  },
  recommendWrapper: {
    flex: 1,
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  recommendContainer: {
    flex: 1,
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  recommendTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 16,
  },
  recommendRow: {
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 12,
  },
  recommendList: {
    paddingBottom: 24,
  },
  recommendProductItem: {
    width: (SCREEN_WIDTH - 48) / 2,
  },
  recommendEmpty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  recommendEmptyText: {
    fontSize: 15,
    color: Colors.primary,
    opacity: 0.6,
    marginTop: 12,
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
    flexShrink: 0,
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
  relatedListWrapper: {
    height: 300,
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
