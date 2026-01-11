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
      const response = await productService.getProductById(productId);
      if (response.success && response.data) {
        setProduct(response.data as Product);
      }
    } catch (error) {
      console.error('Error loading product:', error);
      Alert.alert('Error', 'Failed to load product');
    } finally {
      setLoading(false);
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
        {product.images && product.images.length > 0 ? (
          <Image
            source={{ uri: product.images[selectedImageIndex] }}
            style={styles.mainImage}
            contentFit="contain"
          />
        ) : (
          <View style={[styles.mainImage, styles.placeholderImage]}>
            <Text>No Image</Text>
          </View>
        )}

        {product.images && product.images.length > 1 && (
          <ScrollView
            horizontal
            style={styles.thumbnailContainer}
            showsHorizontalScrollIndicator={false}
          >
            {product.images.map((image, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => setSelectedImageIndex(index)}
                style={[
                  styles.thumbnail,
                  selectedImageIndex === index && styles.selectedThumbnail,
                ]}
              >
                <Image
                  source={{ uri: image }}
                  style={styles.thumbnailImage}
                  contentFit="cover"
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
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
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#999',
    marginBottom: 20,
  },
  imageContainer: {
    backgroundColor: '#f5f5f5',
  },
  mainImage: {
    width: '100%',
    height: 400,
  },
  placeholderImage: {
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbnailContainer: {
    flexDirection: 'row',
    padding: 8,
  },
  thumbnail: {
    width: 60,
    height: 60,
    marginRight: 8,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedThumbnail: {
    borderColor: '#007AFF',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
    borderRadius: 4,
  },
  content: {
    padding: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  price: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginRight: 12,
  },
  originalPrice: {
    fontSize: 18,
    color: '#999',
    textDecorationLine: 'line-through',
    marginRight: 12,
  },
  discountBadge: {
    backgroundColor: '#e53935',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  discountText: {
    color: '#fff',
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
    color: '#333',
  },
  description: {
    fontSize: 14,
    color: '#666',
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
    color: '#333',
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
    color: '#666',
  },
  addButton: {
    paddingVertical: 8,
  },
});

export default ProductDetailScreen;
