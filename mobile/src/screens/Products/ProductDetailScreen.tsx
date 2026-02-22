/**
 * Product Detail Screen
 * Shows detailed product information
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { ActivityIndicator, Button } from 'react-native-paper';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Image } from 'expo-image';
import { productService } from '../../services/product.service';
import { cartService } from '../../services/cart.service';
import { Product } from '../../types/product.types';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { selectIsAuthenticated } from '../../store/slices/authSlice';
import { setCart } from '../../store/slices/cartSlice';
import Colors from '../../constants/colors';
import { addToRecentlyViewed } from '../../components/RecentlyViewed';
import LimitedStock from '../../components/LimitedStock';

// Helper function to clean product data and remove problematic category properties
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
    
    // Safely handle category - convert to string ID if it's an object
    if (product.category) {
      if (typeof product.category === 'object' && product.category !== null) {
        // If category has _id, use it; otherwise try to extract safe properties
        if (product.category._id) {
          cleaned.category = product.category._id;
        } else {
          cleaned.category = null;
        }
      } else if (typeof product.category === 'string') {
        cleaned.category = product.category;
      }
    }
    
    // Copy other optional fields safely
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
    // Return a minimal safe product
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
  const { productId } = route.params;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    loadProduct();
  }, [productId]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading product detail for ID:', productId);
      const response = await productService.getProductById(productId);
      
      console.log('📦 Product detail response:', JSON.stringify(response, null, 2));
      console.log('✅ Response success:', response.success);
      console.log('📊 Response data:', response.data);
      console.log('📊 Response product:', (response as any).product);
      
      // Backend returns product in "product" field, not "data"
      let productData: Product | null = null;
      
      if (response.success) {
        // Try different response formats
        if (response.data) {
          productData = response.data as Product;
        } else if ((response as any).product) {
          productData = (response as any).product as Product;
        } else if ((response as any).data?.product) {
          productData = (response as any).data.product as Product;
        }
      }
      
      if (productData) {
        // Clean product data to remove problematic category properties
        const cleanedProduct = cleanProductData(productData);
        console.log('✅ Product loaded:', cleanedProduct.name);
        console.log('🖼️ Product images:', cleanedProduct.images);
        setProduct(cleanedProduct);
      } else {
        console.warn('⚠️ Product not found or response not successful:', {
          success: response.success,
          hasData: !!response.data,
          hasProduct: !!(response as any).product,
          message: (response as any).message,
          responseKeys: Object.keys(response || {}),
        });
      }
    } catch (error: any) {
      console.error('❌ Error loading product:', error);
      console.error('❌ Error message:', error.message);
      console.error('❌ Error stack:', error.stack);
      Alert.alert('Error', error.message || 'Failed to load product');
    } finally {
      setLoading(false);
      console.log('✅ Loading complete');
    }
  };

  const handleAddToCart = async () => {
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

    if (!product) return;

    try {
      setAddingToCart(true);
      const response = await cartService.addToCart(
        product._id,
        quantity,
        undefined,
        product.variations?.[0]
      );

      if (response.success) {
        // Refresh cart
        const cartResponse = await cartService.getCart();
        if (cartResponse.success && cartResponse.data) {
          dispatch(setCart(cartResponse.data));
        }

        Alert.alert('Success', 'Product added to cart');
      } else {
        Alert.alert('Error', response.message || 'Failed to add to cart');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to add to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Product not found</Text>
        <Button onPress={() => navigation.goBack()}>Go Back</Button>
      </View>
    );
  }

  const displayPrice = product.salePrice || product.price;
  const originalPrice = product.salePrice ? product.price : null;
  const discount = product.salePrice
    ? Math.round(((product.price - product.salePrice) / product.price) * 100)
    : 0;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.imageContainer}>
        {(() => {
          // Helper to get image URL - handle both string[] and object[] formats
          const getImageUrl = (image: any): string | null => {
            if (!image) return null;
            // Handle object format: { url: string, alt?: string, ... }
            if (typeof image === 'object' && image.url) {
              return image.url;
            }
            // Handle string format
            if (typeof image === 'string') {
              return image;
            }
            return null;
          };

          // Get all image URLs
          const imageUrls = product.images
            ? product.images.map(getImageUrl).filter((url): url is string => url !== null)
            : [];

          // Try featuredImage if no images
          if (imageUrls.length === 0 && (product as any).featuredImage) {
            imageUrls.push((product as any).featuredImage);
          }

          if (imageUrls.length > 0) {
            return (
              <>
                <Image
                  source={{ uri: imageUrls[selectedImageIndex] || imageUrls[0] }}
                  style={styles.mainImage}
                  contentFit="contain"
                  placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
                  transition={200}
                  onError={(error) => {
                    console.error('❌ Image load error:', imageUrls[selectedImageIndex], error);
                  }}
                />
                {imageUrls.length > 1 && (
                  <ScrollView
                    horizontal
                    style={styles.thumbnailContainer}
                    showsHorizontalScrollIndicator={false}
                  >
                    {imageUrls.map((imageUrl, index) => (
                      <TouchableOpacity
                        key={index}
                        onPress={() => setSelectedImageIndex(index)}
                        style={[
                          styles.thumbnail,
                          selectedImageIndex === index && styles.selectedThumbnail,
                        ]}
                      >
                        <Image
                          source={{ uri: imageUrl }}
                          style={styles.thumbnailImage}
                          contentFit="cover"
                        />
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}
              </>
            );
          }

          return (
            <View style={[styles.mainImage, styles.placeholderImage]}>
              <Text style={styles.placeholderText}>📦</Text>
              <Text style={styles.placeholderText}>No Image</Text>
            </View>
          );
        })()}
      </View>

      <View style={styles.content}>
        <Text style={styles.name}>{product.name}</Text>

        <View style={styles.priceContainer}>
          <Text style={styles.price}>${displayPrice.toFixed(2)}</Text>
          {originalPrice && (
            <Text style={styles.originalPrice}>
              ${originalPrice.toFixed(2)}
            </Text>
          )}
          {discount > 0 && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>Save {discount}%</Text>
            </View>
          )}
        </View>

        {product.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{product.description}</Text>
          </View>
        )}

        <View style={styles.quantityContainer}>
          <Text style={styles.quantityLabel}>Quantity:</Text>
          <View style={styles.quantityControls}>
            <Button
              mode="outlined"
              onPress={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
            >
              -
            </Button>
            <Text style={styles.quantity}>{quantity}</Text>
            <Button
              mode="outlined"
              onPress={() =>
                setQuantity(Math.min(product.stock || 99, quantity + 1))
              }
              disabled={quantity >= (product.stock || 99)}
            >
              +
            </Button>
          </View>
        </View>

        <View style={styles.stockInfo}>
          <Text style={styles.stockText}>
            {product.stock > 0
              ? `${product.stock} in stock`
              : 'Out of stock'}
          </Text>
        </View>

        <Button
          mode="contained"
          onPress={handleAddToCart}
          loading={addingToCart}
          disabled={product.stock === 0 || addingToCart}
          style={styles.addButton}
          buttonColor={Colors.primary}
          textColor={Colors.white}
        >
          {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.white,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: Colors.background,
  },
  errorText: {
    fontSize: 16,
    color: Colors.primary,
    opacity: 0.7,
    marginBottom: 20,
  },
  imageContainer: {
    backgroundColor: Colors.tertiary,
  },
  mainImage: {
    width: '100%',
    height: 400,
  },
  placeholderImage: {
    backgroundColor: Colors.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 48,
    marginBottom: 8,
    color: Colors.primary,
    opacity: 0.5,
  },
  thumbnailContainer: {
    flexDirection: 'row',
    padding: 8,
    backgroundColor: Colors.white,
  },
  thumbnail: {
    width: 60,
    height: 60,
    marginRight: 8,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  selectedThumbnail: {
    borderColor: Colors.secondary,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
    borderRadius: 4,
  },
  content: {
    padding: 16,
    backgroundColor: Colors.white,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    color: Colors.primary,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  price: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.secondary,
    marginRight: 12,
  },
  originalPrice: {
    fontSize: 18,
    color: Colors.primary,
    opacity: 0.5,
    textDecorationLine: 'line-through',
    marginRight: 12,
  },
  discountBadge: {
    backgroundColor: Colors.secondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  discountText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: Colors.primary,
  },
  description: {
    fontSize: 14,
    color: Colors.primary,
    opacity: 0.8,
    lineHeight: 20,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  quantityLabel: {
    fontSize: 16,
    marginRight: 16,
    color: Colors.primary,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantity: {
    fontSize: 18,
    fontWeight: '600',
    marginHorizontal: 16,
    minWidth: 30,
    textAlign: 'center',
  },
  stockInfo: {
    marginBottom: 20,
  },
  stockText: {
    fontSize: 14,
    color: Colors.primary,
    opacity: 0.8,
  },
  addButton: {
    paddingVertical: 8,
  },
});

export default ProductDetailScreen;
