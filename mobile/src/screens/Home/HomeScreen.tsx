/**
 * Home Screen
 * Main product browsing screen
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { ActivityIndicator, Searchbar } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { productService } from '../../services/product.service';
import { Product } from '../../types/product.types';
import ProductCard from '../../components/ProductCard';
import { useAppSelector } from '../../store/hooks';
import { selectIsAuthenticated } from '../../store/slices/authSlice';

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await productService.getAllProducts({ limit: 20 });
      if (response.success && response.data) {
        const productArray = Array.isArray(response.data)
          ? response.data
          : (response.data as any).products || [];
        setProducts(productArray);
      }
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadProducts();
    setRefreshing(false);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadProducts();
      return;
    }

    try {
      setLoading(true);
      const response = await productService.searchProducts(searchQuery);
      if (response.success && response.data) {
        setProducts(Array.isArray(response.data) ? response.data : []);
      }
    } catch (error) {
      console.error('Error searching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProductPress = (product: Product) => {
    // Navigate to ProductDetail - it's in the same MainStack
    (navigation as any).navigate('ProductDetail', { productId: product._id });
  };

  const handleAddToCart = async (product: Product) => {
    if (!isAuthenticated) {
      // This will be handled by root navigator
      return;
    }

    // Navigate to product detail to add to cart
    handleProductPress(product);
  };

  if (loading && products.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading products...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Zuba</Text>
        <TouchableOpacity
          onPress={() => (navigation as any).navigate('Cart')}
          style={styles.cartButton}
        >
          <Text style={styles.cartIcon}>🛒</Text>
        </TouchableOpacity>
      </View>

      <Searchbar
        placeholder="Search products..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        onSubmitEditing={handleSearch}
        style={styles.searchbar}
      />

      <FlatList
        data={products}
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            onPress={() => handleProductPress(item)}
            onAddToCart={() => handleAddToCart(item)}
            style={styles.productCard}
          />
        )}
        keyExtractor={(item) => item._id}
        numColumns={2}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No products found</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  cartButton: {
    padding: 8,
  },
  cartIcon: {
    fontSize: 24,
  },
  searchbar: {
    margin: 16,
    marginBottom: 8,
  },
  listContent: {
    padding: 8,
  },
  productCard: {
    flex: 1,
    maxWidth: '48%',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
});

export default HomeScreen;
