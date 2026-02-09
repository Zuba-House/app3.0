/**
 * Search Screen - Temu Style
 * Search page with categories on left and products on right
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Platform,
} from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { productService } from '../../services/product.service';
import { categoryService, Category } from '../../services/category.service';
import { Product } from '../../types/product.types';
import ProductCard from '../../components/ProductCard';
import Colors from '../../constants/colors';
import SearchBar from '../../components/SearchBar';
import { API_URL } from '../../constants/config';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
// Responsive sidebar width - smaller on small screens
const CATEGORY_SIDEBAR_WIDTH = SCREEN_WIDTH < 375 ? 100 : SCREEN_WIDTH < 414 ? 110 : 120;
const PRODUCT_GRID_WIDTH = SCREEN_WIDTH - CATEGORY_SIDEBAR_WIDTH;
const CARD_WIDTH = (PRODUCT_GRID_WIDTH - 24) / 2; // 2 columns with padding

const SearchScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  useEffect(() => {
    loadCategories();
    loadAllProducts();
  }, []);

  const loadCategories = async () => {
    try {
      setCategoriesLoading(true);
      const response = await categoryService.getCategories();
      if (response.success && response.data) {
        const rawCats = Array.isArray(response.data) ? response.data : [];
        const cleanedCats = rawCats
          .filter((cat: any) => {
            if (!cat || typeof cat !== 'object') return false;
            if (!cat._id || typeof cat._id !== 'string') return false;
            if (!cat.name || typeof cat.name !== 'string') return false;
            return true;
          })
          .map((cat: any) => {
            const safe: any = {
              _id: String(cat._id),
              name: String(cat.name),
            };
            if (cat.slug && typeof cat.slug === 'string') safe.slug = cat.slug;
            if (cat.image && typeof cat.image === 'string') safe.image = cat.image;
            if (cat.icon && typeof cat.icon === 'string') safe.icon = cat.icon;
            return safe;
          })
          .filter((cat: any) => cat && cat._id && cat.name);
        setCategories(cleanedCats);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      setCategories([]);
    } finally {
      setCategoriesLoading(false);
    }
  };

  const loadAllProducts = async () => {
    try {
      setLoading(true);
      const response = await productService.getAllProducts({ limit: 50 });
      if (response.success && response.data) {
        const productArray = Array.isArray(response.data)
          ? response.data
          : (response.data as any).products || [];
        const productsWithReviews = productArray.map((product: any) => {
          let safeCategory: string = '';
          if (product.category) {
            if (typeof product.category === 'object' && product.category !== null) {
              safeCategory = product.category._id || '';
            } else if (typeof product.category === 'string') {
              safeCategory = product.category;
            }
          }
          return {
            ...product,
            category: safeCategory,
            rating: product.rating || Math.random() * 2 + 3.5,
            reviewCount: product.reviewCount || Math.floor(Math.random() * 5000) + 100,
          };
        });
        setProducts(productsWithReviews);
      }
    } catch (error) {
      console.error('Error loading products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    // Frontend-only search for now
    if (!query.trim()) {
      loadAllProducts();
      return;
    }
  };

  const handleCategorySelect = (categoryId: string | null) => {
    setSelectedCategory(categoryId);
    if (categoryId) {
      loadProductsByCategory(categoryId);
    } else {
      loadAllProducts();
    }
  };

  const loadProductsByCategory = async (categoryId: string) => {
    try {
      setLoading(true);
      const response = await productService.getProductsByCategory(categoryId, 1, 50);
      if (response.success && response.data) {
        const productArray = Array.isArray(response.data)
          ? response.data
          : (response.data as any).products || [];
        const productsWithReviews = productArray.map((product: any) => {
          let safeCategory: string = '';
          if (product.category) {
            if (typeof product.category === 'object' && product.category !== null) {
              safeCategory = product.category._id || '';
            } else if (typeof product.category === 'string') {
              safeCategory = product.category;
            }
          }
          return {
            ...product,
            category: safeCategory,
            rating: product.rating || Math.random() * 2 + 3.5,
            reviewCount: product.reviewCount || Math.floor(Math.random() * 5000) + 100,
          };
        });
        setProducts(productsWithReviews);
      }
    } catch (error) {
      console.error('Error loading products by category:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const renderCategoryItem = ({ item }: { item: Category }) => {
    const isSelected = selectedCategory === item._id;

    return (
      <TouchableOpacity
        style={[styles.categoryItem, isSelected && styles.categoryItemActive]}
        onPress={() => handleCategorySelect(item._id)}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.categoryItemText,
            isSelected && styles.categoryItemTextActive,
          ]}
          numberOfLines={2}
        >
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderProductItem = ({ item }: { item: Product }) => {
    const cardWidth = CARD_WIDTH;
    return (
      <ProductCard
        product={item}
        onPress={() => navigation.navigate('ProductDetail', { productId: item._id })}
        onAddToCart={() => {}}
        style={[styles.productCard, { width: cardWidth }]}
      />
    );
  };

  const filteredProducts = searchQuery.trim()
    ? products.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : products;

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <SearchBar
        onSearch={handleSearch}
        onCategorySelect={handleCategorySelect}
        placeholder="Search products..."
      />

      <View style={styles.contentContainer}>
        {/* Left Sidebar - Categories */}
        <View style={styles.categorySidebar}>
          <View style={styles.categoryHeader}>
            <Text style={styles.categoryHeaderText}>Featured</Text>
          </View>
          {categoriesLoading ? (
            <View style={styles.categoryLoading}>
              <ActivityIndicator size="small" color={Colors.secondary} />
            </View>
          ) : (
            <FlatList
              data={categories}
              renderItem={renderCategoryItem}
              keyExtractor={(item) => item._id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.categoryList}
              ListHeaderComponent={
                <TouchableOpacity
                  style={[
                    styles.categoryItem,
                    !selectedCategory && styles.categoryItemActive,
                  ]}
                  onPress={() => handleCategorySelect(null)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.categoryItemText,
                      !selectedCategory && styles.categoryItemTextActive,
                    ]}
                  >
                    All
                  </Text>
                </TouchableOpacity>
              }
            />
          )}
        </View>

        {/* Right Content - Products Grid */}
        <View style={styles.productsContainer}>
          <View style={styles.productsHeader}>
            <Text style={styles.productsHeaderText}>
              {selectedCategory
                ? categories.find((c) => c._id === selectedCategory)?.name || 'Products'
                : 'Shop by category'}
            </Text>
          </View>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.secondary} />
            </View>
          ) : (
            <FlatList
              data={filteredProducts}
              renderItem={renderProductItem}
              keyExtractor={(item) => item._id}
              numColumns={2}
              contentContainerStyle={styles.productsList}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyIcon}>🔍</Text>
                  <Text style={styles.emptyText}>
                    {searchQuery
                      ? `No products found for "${searchQuery}"`
                      : selectedCategory
                      ? 'No products in this category'
                      : 'No products found'}
                  </Text>
                </View>
              }
            />
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  contentContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  categorySidebar: {
    width: CATEGORY_SIDEBAR_WIDTH,
    backgroundColor: Colors.white,
    borderRightWidth: 1,
    borderRightColor: Colors.border,
    maxHeight: SCREEN_HEIGHT,
  },
  categoryHeader: {
    paddingHorizontal: SCREEN_WIDTH < 375 ? 8 : 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  categoryHeaderText: {
    fontSize: SCREEN_WIDTH < 375 ? 12 : 14,
    fontWeight: '700',
    color: Colors.primary,
  },
  categoryLoading: {
    padding: 20,
    alignItems: 'center',
  },
  categoryList: {
    paddingVertical: 8,
  },
  categoryItem: {
    paddingHorizontal: SCREEN_WIDTH < 375 ? 8 : 12,
    paddingVertical: SCREEN_WIDTH < 375 ? 12 : 14,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
    minHeight: 44,
    justifyContent: 'center',
  },
  categoryItemActive: {
    backgroundColor: Colors.tertiary,
    borderLeftWidth: 3,
    borderLeftColor: Colors.secondary,
  },
  categoryItemText: {
    fontSize: SCREEN_WIDTH < 375 ? 11 : 12,
    fontWeight: '500',
    color: Colors.primary,
    opacity: 0.7,
    lineHeight: SCREEN_WIDTH < 375 ? 14 : 16,
  },
  categoryItemTextActive: {
    color: Colors.primary,
    opacity: 1,
    fontWeight: '600',
  },
  productsContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  productsHeader: {
    paddingHorizontal: SCREEN_WIDTH < 375 ? 12 : 16,
    paddingVertical: SCREEN_WIDTH < 375 ? 12 : 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  productsHeaderText: {
    fontSize: SCREEN_WIDTH < 375 ? 14 : 16,
    fontWeight: '700',
    color: Colors.primary,
  },
  productsList: {
    padding: SCREEN_WIDTH < 375 ? 6 : 8,
  },
  productCard: {
    flex: 1,
    maxWidth: CARD_WIDTH,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 60,
    minHeight: 400,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
    textAlign: 'center',
    opacity: 0.7,
  },
});

export default SearchScreen;
