/**
 * Cart Screen
 * Shopping cart screen
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { ActivityIndicator, Button, Card } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { Image } from 'expo-image';
import { cartService } from '../../services/cart.service';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { selectCartItems, selectCartTotal, setCart } from '../../store/slices/cartSlice';
import { CartItem } from '../../types/cart.types';

const CartScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();
  const cartItems = useAppSelector(selectCartItems);
  const total = useAppSelector(selectCartTotal);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      setLoading(true);
      const response = await cartService.getCart();
      if (response.success && response.data) {
        dispatch(setCart(response.data));
      }
    } catch (error) {
      console.error('Error loading cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadCart();
    setRefreshing(false);
  };

  const handleUpdateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      handleRemoveItem(itemId);
      return;
    }

    try {
      const response = await cartService.updateCartItem(itemId, newQuantity);
      if (response.success) {
        await loadCart();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update quantity');
    }
  };

  const handleRemoveItem = (itemId: string) => {
    Alert.alert('Remove Item', 'Are you sure you want to remove this item?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          try {
            const response = await cartService.removeFromCart(itemId);
            if (response.success) {
              await loadCart();
            }
          } catch (error) {
            Alert.alert('Error', 'Failed to remove item');
          }
        },
      },
    ]);
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      Alert.alert('Empty Cart', 'Your cart is empty');
      return;
    }
    // Navigate to checkout screen (to be implemented)
    Alert.alert('Checkout', 'Checkout screen coming soon');
  };

  const renderCartItem = ({ item }: { item: CartItem }) => {
    const product = typeof item.product === 'object' ? item.product : null;
    const productImage =
      product?.images?.[0] ||
      (typeof item.product === 'object' && (item.product as any)?.image) ||
      '';

    return (
      <Card style={styles.cartItem}>
        <View style={styles.itemContent}>
          {productImage ? (
            <Image
              source={{ uri: productImage }}
              style={styles.itemImage}
              contentFit="cover"
            />
          ) : (
            <View style={[styles.itemImage, styles.placeholderImage]}>
              <Text style={styles.placeholderText}>No Image</Text>
            </View>
          )}

          <View style={styles.itemDetails}>
            <Text style={styles.itemName} numberOfLines={2}>
              {product?.name || 'Product'}
            </Text>
            <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>

            <View style={styles.quantityContainer}>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => handleUpdateQuantity(item._id, item.quantity - 1)}
              >
                <Text style={styles.quantityButtonText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.quantity}>{item.quantity}</Text>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => handleUpdateQuantity(item._id, item.quantity + 1)}
              >
                <Text style={styles.quantityButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.itemActions}>
            <Text style={styles.subtotal}>${item.subtotal.toFixed(2)}</Text>
            <TouchableOpacity
              onPress={() => handleRemoveItem(item._id)}
              style={styles.removeButton}
            >
              <Text style={styles.removeButtonText}>Remove</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Card>
    );
  };

  if (loading && cartItems.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading cart...</Text>
      </View>
    );
  }

  if (cartItems.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>🛒</Text>
        <Text style={styles.emptyTitle}>Your cart is empty</Text>
        <Text style={styles.emptySubtitle}>
          Add some products to get started
        </Text>
        <Button
          mode="contained"
          onPress={() => navigation.navigate('Home')}
          style={styles.shopButton}
        >
          Start Shopping
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Shopping Cart</Text>
        <Text style={styles.itemCount}>{cartItems.length} items</Text>
      </View>

      <FlatList
        data={cartItems}
        renderItem={renderCartItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      />

      <View style={styles.footer}>
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total:</Text>
          <Text style={styles.totalAmount}>${total.toFixed(2)}</Text>
        </View>
        <Button
          mode="contained"
          onPress={handleCheckout}
          style={styles.checkoutButton}
        >
          Proceed to Checkout
        </Button>
      </View>
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#fff',
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
    textAlign: 'center',
  },
  shopButton: {
    paddingHorizontal: 32,
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
  itemCount: {
    fontSize: 14,
    color: '#666',
  },
  listContent: {
    padding: 16,
  },
  cartItem: {
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  itemContent: {
    flexDirection: 'row',
    padding: 12,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  placeholderImage: {
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#999',
    fontSize: 10,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: '#333',
  },
  itemPrice: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  quantityButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
  },
  quantityButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  quantity: {
    marginHorizontal: 16,
    fontSize: 16,
    fontWeight: '600',
    minWidth: 30,
    textAlign: 'center',
  },
  itemActions: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  subtotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginBottom: 8,
  },
  removeButton: {
    padding: 4,
  },
  removeButtonText: {
    color: '#e53935',
    fontSize: 12,
  },
  footer: {
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2e7d32',
  },
  checkoutButton: {
    paddingVertical: 8,
  },
});

export default CartScreen;
