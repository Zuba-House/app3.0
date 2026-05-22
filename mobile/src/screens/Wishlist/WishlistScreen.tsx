/**
 * Wishlist Screen
 * User's saved products
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { wishlistService } from '../../services/wishlist.service';
import { Product } from '../../types/product.types';
import ProductCard from '../../components/ProductCard';
import Colors from '../../constants/colors';
import { useAuthState } from '../../core/auth/authGuards';
import { useAuthGate } from '../../core/auth/authGate';
import { FLATLIST_PERF } from '../../utils/flatListPerf';

const WishlistScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { authStatus } = useAuthState();
  const isAuthenticated = authStatus === 'authenticated';
  const { openAuth } = useAuthGate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadWishlist();
  }, [isAuthenticated]);

  const loadWishlist = async () => {
    try {
      setLoading(true);
      if (isAuthenticated) {
        const response = await wishlistService.getWishlist();
        if (response.success && response.data) {
          const productArray = Array.isArray(response.data) ? response.data : [];
          setProducts(productArray);
        }
      } else {
        const local = await wishlistService.getLocalWishlist();
        setProducts(local);
      }
    } catch {
      // Wishlist load failed silently
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadWishlist();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Wishlist</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.secondary} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Wishlist</Text>
        <Text style={styles.headerSubtitle}>{products.length} items</Text>
      </View>
      {!isAuthenticated && (
        <View style={{ paddingHorizontal: 16, paddingVertical: 10 }}>
          <TouchableOpacity style={{ backgroundColor: Colors.white, borderRadius: 10, padding: 12 }} onPress={() => openAuth({ target: { screen: 'MainTabs', params: { screen: 'Wishlist' } } })}>
            <Text style={{ color: Colors.primary, fontWeight: '600' }}>Sign in to sync your wishlist across devices</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        {...FLATLIST_PERF}
        data={products}
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            onPress={() => navigation.navigate('ProductDetail', { productId: (item as any).productId || item._id })}
            onAddToCart={() => {}}
            style={styles.productCard}
          />
        )}
        keyExtractor={(item, index) => String((item as any).wishlistItemId || item._id || index)}
        numColumns={2}
        columnWrapperStyle={styles.row}
        refreshing={refreshing}
        onRefresh={onRefresh}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>❤️</Text>
            <Text style={styles.emptyText}>Your wishlist is empty</Text>
            <Text style={styles.emptySubtext}>Start adding products you love!</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.primary,
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.white,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.white,
    opacity: 0.8,
    marginTop: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: 8,
    paddingBottom: 24,
    paddingTop: 8,
    flexGrow: 1,
  },
  row: {
    justifyContent: 'space-between',
  },
  productCard: {
    width: '48%',
    margin: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.primary,
    opacity: 0.7,
    textAlign: 'center',
  },
});

export default WishlistScreen;
