/**
 * Brands Screen
 * Display all brands in circular format
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { productService } from '../../services/product.service';
import { Product } from '../../types/product.types';
import ProductCard from '../../components/ProductCard';
import Colors from '../../constants/colors';
import { InteractionManager } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BRAND_SIZE = (SCREEN_WIDTH - 64) / 3; // 3 columns with padding
const CARD_WIDTH = (SCREEN_WIDTH - 36) / 2;

// Brand interface
interface Brand {
  id: string;
  name: string;
  logo: any;
  verified: boolean;
}

// Extended brands list - duplicate existing ones
const ALL_BRANDS: Brand[] = [
  {
    id: 'NGOMA',
    name: 'NGOMA',
    logo: require('../../../assets/brands/ngoma.png'),
    verified: true,
  },
  {
    id: 'Afrolago',
    name: 'Afrolago',
    logo: require('../../../assets/brands/afrolago.jpg'),
    verified: true,
  },
  {
    id: 'KanyanaWorld',
    name: 'KanyanaWorld',
    logo: require('../../../assets/brands/KanyanaWorld.jpg'),
    verified: true,
  },
  {
    id: 'Kwesa',
    name: 'Kwesa',
    logo: require('../../../assets/brands/kwesa.jpg'),
    verified: true,
  },
  // Duplicate existing brands without names
  {
    id: 'NGOMA-2',
    name: '',
    logo: require('../../../assets/brands/ngoma.png'),
    verified: false,
  },
  {
    id: 'Afrolago-2',
    name: '',
    logo: require('../../../assets/brands/afrolago.jpg'),
    verified: false,
  },
  {
    id: 'KanyanaWorld-2',
    name: '',
    logo: require('../../../assets/brands/KanyanaWorld.jpg'),
    verified: false,
  },
  {
    id: 'Kwesa-2',
    name: '',
    logo: require('../../../assets/brands/kwesa.jpg'),
    verified: false,
  },
  {
    id: 'NGOMA-3',
    name: '',
    logo: require('../../../assets/brands/ngoma.png'),
    verified: false,
  },
  {
    id: 'Afrolago-3',
    name: '',
    logo: require('../../../assets/brands/afrolago.jpg'),
    verified: false,
  },
  {
    id: 'KanyanaWorld-3',
    name: '',
    logo: require('../../../assets/brands/KanyanaWorld.jpg'),
    verified: false,
  },
  {
    id: 'Kwesa-3',
    name: '',
    logo: require('../../../assets/brands/kwesa.jpg'),
    verified: false,
  },
  {
    id: 'NGOMA-4',
    name: '',
    logo: require('../../../assets/brands/ngoma.png'),
    verified: false,
  },
  {
    id: 'Afrolago-4',
    name: '',
    logo: require('../../../assets/brands/afrolago.jpg'),
    verified: false,
  },
  {
    id: 'KanyanaWorld-4',
    name: '',
    logo: require('../../../assets/brands/KanyanaWorld.jpg'),
    verified: false,
  },
  {
    id: 'Kwesa-4',
    name: '',
    logo: require('../../../assets/brands/kwesa.jpg'),
    verified: false,
  },
];

const BrandsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  // Check if brand was passed from route params
  useEffect(() => {
    if (route.params?.brandId) {
      handleBrandPress(route.params.brandId);
    }
  }, [route.params]);

  const loadProducts = async (brandId: string) => {
    try {
      setLoading(true);
      const response = await productService.getProductsByBrand(brandId, 1, 50);
      
      if (response.success && response.data) {
        const productArray = Array.isArray(response.data)
          ? response.data
          : (response.data as any).products || [];
        
        // Clean products and add ratings
        const productsWithReviews = productArray.map((product: any) => ({
          ...product,
          rating: product.rating || 0,
          reviewCount: product.reviewCount || 0,
        }));
        
        setProducts(productsWithReviews);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error('Error loading products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBrandPress = (brandId: string) => {
    setSelectedBrand(brandId);
    InteractionManager.runAfterInteractions(() => {
      loadProducts(brandId);
    });
  };

  const handleProductPress = useCallback((product: Product) => {
    navigation.navigate('ProductDetail', { productId: product._id });
  }, [navigation]);

  const handleBack = () => {
    if (selectedBrand) {
      setSelectedBrand(null);
      setProducts([]);
    } else {
      navigation.goBack();
    }
  };

  const renderBrandItem = ({ item }: { item: Brand }) => {
    const brandName = item.name || 'Brand';
    const isSelected = selectedBrand === item.id;

    return (
      <TouchableOpacity
        style={[
          styles.brandItem,
          isSelected && styles.brandItemSelected,
        ]}
        onPress={() => handleBrandPress(item.id)}
        activeOpacity={0.7}
      >
        <View style={styles.brandCircle}>
          <Image
            source={item.logo}
            style={styles.brandLogo}
            contentFit="contain"
            cachePolicy="memory-disk"
            transition={100}
          />
        </View>
        {item.name ? (
          <Text style={styles.brandName} numberOfLines={1}>
            {item.name}
          </Text>
        ) : null}
      </TouchableOpacity>
    );
  };

  const renderProductItem = useCallback(({ item }: { item: Product }) => (
    <ProductCard
      product={item}
      onPress={() => handleProductPress(item)}
      onAddToCart={() => handleProductPress(item)}
      style={styles.productCard}
    />
  ), [handleProductPress]);

  // Show products if brand is selected
  if (selectedBrand) {
    const brand = ALL_BRANDS.find(b => b.id === selectedBrand);
    const brandName = brand?.name || 'Brand';

    return (
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {brandName ? `${brandName} Products` : 'Brand Products'}
          </Text>
          <View style={styles.backButton} />
        </View>

        {/* Products Grid */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.secondary} />
            <Text style={styles.loadingText}>Loading products...</Text>
          </View>
        ) : products.length > 0 ? (
          <FlatList
            data={products}
            renderItem={renderProductItem}
            keyExtractor={(item) => item._id}
            numColumns={2}
            contentContainerStyle={styles.productsList}
            showsVerticalScrollIndicator={false}
            removeClippedSubviews={true}
            initialNumToRender={6}
            maxToRenderPerBatch={10}
            windowSize={10}
            getItemLayout={(data, index) => ({
              length: CARD_WIDTH + 12,
              offset: (CARD_WIDTH + 12) * Math.floor(index / 2),
              index,
            })}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>📦</Text>
                <Text style={styles.emptyText}>No products found</Text>
                <Text style={styles.emptySubtext}>Check back later for new products</Text>
              </View>
            }
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📦</Text>
            <Text style={styles.emptyText}>No products found</Text>
            <Text style={styles.emptySubtext}>This brand doesn't have any products yet</Text>
          </View>
        )}
      </View>
    );
  }

  // Show brands grid
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>All Brands</Text>
        <View style={styles.backButton} />
      </View>

      {/* Brands Grid */}
      <FlatList
        data={ALL_BRANDS}
        renderItem={renderBrandItem}
        keyExtractor={(item) => item.id}
        numColumns={3}
        contentContainerStyle={styles.brandsList}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
        initialNumToRender={9}
        maxToRenderPerBatch={6}
        windowSize={5}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
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
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primary,
    flex: 1,
    textAlign: 'center',
  },
  brandsList: {
    padding: 16,
    paddingBottom: 20,
  },
  brandItem: {
    width: BRAND_SIZE,
    alignItems: 'center',
    marginBottom: 24,
    marginHorizontal: 8,
  },
  brandItemSelected: {
    opacity: 0.7,
  },
  brandCircle: {
    width: BRAND_SIZE,
    height: BRAND_SIZE,
    borderRadius: BRAND_SIZE / 2,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 2,
    borderColor: Colors.border,
    overflow: 'hidden',
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
  brandLogo: {
    width: '85%',
    height: '85%',
    borderRadius: BRAND_SIZE / 2,
  },
  brandName: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
    textAlign: 'center',
    marginTop: 4,
  },
  productsList: {
    paddingHorizontal: 8,
    paddingBottom: 16,
  },
  productCard: {
    width: CARD_WIDTH,
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: Colors.primary,
    opacity: 0.7,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 60,
    minHeight: 300,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.primary,
    opacity: 0.7,
    textAlign: 'center',
  },
});

export default BrandsScreen;
