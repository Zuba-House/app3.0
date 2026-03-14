/**
 * Quick Add modal: select variation (size/color) then add to cart.
 * Used on Search and product grids when product has variations.
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Product } from '../types/product.types';
import { productService } from '../services/product.service';
import { cartService } from '../services/cart.service';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { selectIsAuthenticated } from '../store/slices/authSlice';
import { setCart, addItem } from '../store/slices/cartSlice';
import Colors from '../constants/colors';
import { API_URL } from '../constants/config';

interface QuickAddModalProps {
  visible: boolean;
  product: Product | null;
  onClose: () => void;
  onAdded?: () => void;
}

export default function QuickAddModal({ visible, product, onClose, onAdded }: QuickAddModalProps) {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const [fullProduct, setFullProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [selectedVariation, setSelectedVariation] = useState<any>(null);

  useEffect(() => {
    if (!visible || !product) {
      setFullProduct(null);
      setSelectedVariation(null);
      return;
    }
    const hasVariations = product.productType === 'variable' && product.variations?.length;
    if (hasVariations && product.variations?.length) {
      setFullProduct(product);
      setSelectedVariation(null);
      return;
    }
    if (hasVariations && !product.variations?.length) {
      setLoading(true);
      productService.getProductById(product._id).then((res) => {
        setLoading(false);
        if (res.success && res.data) setFullProduct(res.data as Product);
        else setFullProduct(product);
      }).catch(() => {
        setLoading(false);
        setFullProduct(product);
      });
    } else {
      setFullProduct(product);
    }
  }, [visible, product?._id]);

  const variations = fullProduct?.variations || [];
  const price = selectedVariation?.salePrice ?? selectedVariation?.price ?? fullProduct?.salePrice ?? fullProduct?.price ?? 0;

  const handleAddToCart = async () => {
    const p = fullProduct || product;
    if (!p) return;
    const isVariable = p.productType === 'variable' && variations.length > 0;
    if (isVariable && !selectedVariation) {
      Alert.alert('Select option', 'Please select a size or option.');
      return;
    }

    setAdding(true);
    try {
      if (isAuthenticated) {
        const response = await cartService.addToCart(
          p._id,
          1,
          selectedVariation?._id,
          selectedVariation
        );
        if (response.success) {
          const cartResponse = await cartService.getCart();
          if (cartResponse.success && cartResponse.data) dispatch(setCart(cartResponse.data));
          onAdded?.();
          onClose();
        } else {
          Alert.alert('Error', response.message || 'Failed to add to cart');
        }
      } else {
        const cartItem = {
          _id: `guest_${Date.now()}_${Math.random()}`,
          product: p,
          variation: selectedVariation,
          quantity: 1,
          price,
          subtotal: price,
        };
        dispatch(addItem(cartItem));
        onAdded?.();
        onClose();
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to add to cart');
    } finally {
      setAdding(false);
    }
  };

  if (!product) return null;

  const isVariable = fullProduct?.productType === 'variable' && variations.length > 0;
  const getImageUrl = () => {
    const img = fullProduct?.images?.[0] ?? product.images?.[0];
    if (typeof img === 'string') return img.startsWith('http') ? img : `${API_URL}${img}`;
    const url = (img as any)?.url ?? (product as any).featuredImage;
    return url && !url.startsWith('http') ? `${API_URL}${url}` : url;
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title} numberOfLines={1}>{fullProduct?.name ?? product.name}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={Colors.primary} />
            </TouchableOpacity>
          </View>
          {loading ? (
            <ActivityIndicator size="large" color={Colors.secondary} style={styles.loader} />
          ) : (
            <>
              <View style={styles.imageRow}>
                {getImageUrl() && (
                  <Image source={{ uri: getImageUrl() }} style={styles.thumb} contentFit="cover" />
                )}
                <Text style={styles.price}>${price.toFixed(2)}</Text>
              </View>
              {isVariable && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Select option</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.variationScroll}>
                    {variations.map((v: any) => {
                      const label = (v.attributes && Array.isArray(v.attributes))
                        ? (v.attributes as any[]).map((a: any) => a?.value ?? a?.label ?? '').filter(Boolean).join(' / ') || v.sku
                        : v.sku || `Option`;
                      const isSelected = selectedVariation?._id === v._id;
                      const inStock = (v.stock ?? 0) > 0;
                      return (
                        <TouchableOpacity
                          key={v._id}
                          style={[styles.variationChip, isSelected && styles.variationChipSelected, !inStock && styles.variationChipDisabled]}
                          onPress={() => inStock && setSelectedVariation(v)}
                          disabled={!inStock}
                        >
                          <Text style={[styles.variationChipText, !inStock && styles.variationChipTextDisabled]} numberOfLines={1}>{label}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>
              )}
              <TouchableOpacity
                style={[styles.addBtn, adding && styles.addBtnDisabled]}
                onPress={handleAddToCart}
                disabled={adding}
              >
                {adding ? <ActivityIndicator size="small" color={Colors.white} /> : <Text style={styles.addBtnText}>Add to Cart</Text>}
              </TouchableOpacity>
            </>
          )}
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  content: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  title: { flex: 1, fontSize: 16, fontWeight: '700', color: Colors.primary },
  closeBtn: { padding: 8 },
  loader: { padding: 24 },
  imageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  thumb: { width: 72, height: 72, borderRadius: 8 },
  price: { fontSize: 18, fontWeight: '700', color: Colors.primary },
  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 13, fontWeight: '600', color: Colors.primary, marginBottom: 8 },
  variationScroll: { flexGrow: 0 },
  variationChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: Colors.border,
    marginRight: 8,
  },
  variationChipSelected: {
    borderColor: Colors.secondary,
    backgroundColor: Colors.secondary + '20',
  },
  variationChipDisabled: { opacity: 0.5 },
  variationChipText: { fontSize: 14, color: Colors.primary },
  variationChipTextDisabled: { color: Colors.primary, opacity: 0.6 },
  addBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  addBtnDisabled: { opacity: 0.7 },
  addBtnText: { fontSize: 16, fontWeight: '600', color: Colors.white },
});
