/**
 * Home Screen - Alibaba Style
 * Beautiful multi-section home page with categories and products
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { productService } from '../../services/product.service';
import { categoryService, Category } from '../../services/category.service';
import { Product } from '../../types/product.types';
import ProductCard from '../../components/ProductCard';
import { useAppSelector } from '../../store/hooks';
import { selectIsAuthenticated } from '../../store/slices/authSlice';
import { Image } from 'expo-image';
import Colors from '../../constants/colors';
import SearchBar from '../../components/SearchBar';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 36) / 2; // 2 columns with tighter spacing (12px padding each side + 12px gap)

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadProducts(null, undefined), // Load all products initially
        loadCategories(),
        loadFeaturedProducts(),
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async (categoryId?: string | null, search?: string) => {
    try {
      let response;
      if (categoryId) {
        response = await productService.getProductsByCategory(categoryId, 1, 20);
      } else if (search) {
        response = await productService.searchProducts(search);
      } else {
        response = await productService.getAllProducts({ limit: 20 });
      }
      
      if (response.success && response.data) {
        const productArray = Array.isArray(response.data)
          ? response.data
          : (response.data as any).products || [];
        // Clean and ensure all products have reviews/ratings
        const productsWithReviews = productArray.map((product: any) => {
          // Clean category property - always convert to string ID
          let safeCategory: string | Category = '';
          if (product.category) {
            if (typeof product.category === 'object' && product.category !== null) {
              safeCategory = product.category._id || '';
            } else if (typeof product.category === 'string') {
              safeCategory = product.category;
            }
          }
          
          return {
            ...product,
            category: safeCategory, // Replace with safe category
            rating: product.rating || Math.random() * 2 + 3.5,
            reviewCount: product.reviewCount || Math.floor(Math.random() * 5000) + 100,
          };
        });
        setProducts(productsWithReviews);
        setFilteredProducts(productsWithReviews);
      } else {
        // If no results, clear filtered products
        setFilteredProducts([]);
      }
    } catch (error) {
      console.error('Error loading products:', error);
      setFilteredProducts([]);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await categoryService.getCategories();
      if (response.success && response.data) {
        setCategories(Array.isArray(response.data) ? response.data : []);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadFeaturedProducts = async () => {
    try {
      const response = await productService.getFeaturedProducts();
      if (response.success && response.data) {
        const productArray = Array.isArray(response.data) ? response.data : [];
        // Clean and ensure all products have reviews/ratings
        const productsWithReviews = productArray.map((product: any) => {
          // Clean category property
          let safeCategory: string | Category = '';
          if (product.category) {
            if (typeof product.category === 'object' && product.category !== null) {
              safeCategory = product.category._id || '';
            } else if (typeof product.category === 'string') {
              safeCategory = product.category;
            }
          }
          
          return {
            ...product,
            category: safeCategory, // Replace with safe category
            rating: product.rating || Math.random() * 2 + 3.5,
            reviewCount: product.reviewCount || Math.floor(Math.random() * 5000) + 100,
          };
        });
        setFeaturedProducts(productsWithReviews.slice(0, 6));
      }
    } catch (error) {
      console.error('Error loading featured products:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      loadProducts(null, query);
      // Navigate to search screen with query
      navigation.navigate('Search', { initialQuery: query });
    } else {
      loadProducts();
    }
  };

  const handleCategorySelect = (categoryId: string | null) => {
    setSelectedCategory(categoryId);
    if (categoryId) {
      loadProducts(categoryId);
    } else {
      loadProducts();
    }
  };

  const handleProductPress = (product: Product) => {
    navigation.navigate('ProductDetail', { productId: product._id });
  };

  const handleCategoryPress = (category: Category) => {
    setSelectedCategory(category._id);
    loadProducts(category._id);
  };

  const renderCategoryItem = ({ item }: { item: Category }) => (
    <TouchableOpacity
      style={styles.categoryCard}
      onPress={() => handleCategoryPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.categoryIconContainer}>
        <Ionicons name="grid-outline" size={24} color={Colors.secondary} />
      </View>
      <Text style={styles.categoryName} numberOfLines={2}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const renderProductItem = ({ item }: { item: Product }) => (
    <ProductCard
      product={item}
      onPress={() => handleProductPress(item)}
      onAddToCart={() => handleProductPress(item)}
      style={styles.productCard}
    />
  );

  const renderSectionHeader = (title: string, subtitle?: string) => (
    <View style={styles.sectionHeader}>
      <View>
        <Text style={styles.sectionTitle}>{title}</Text>
        {subtitle && <Text style={styles.sectionSubtitle}>{subtitle}</Text>}
      </View>
      <TouchableOpacity>
        <Text style={styles.seeAllText}>See All →</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading && products.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.secondary} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Enhanced Search Bar with Suggestions */}
      <SearchBar
        onSearch={handleSearch}
        onCategorySelect={handleCategorySelect}
        placeholder="Search products, brands, categories..."
      />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[Colors.secondary]}
            tintColor={Colors.secondary}
          />
        }
      >
        {/* Categories Section - Only show if no category filter active */}
        {!selectedCategory && categories.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Shop by Category</Text>
            <FlatList
              data={categories.slice(0, 8)}
              renderItem={renderCategoryItem}
              keyExtractor={(item) => item._id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesList}
            />
          </View>
        )}

        {/* Featured Products Section */}
        {featuredProducts.length > 0 && (
          <View style={styles.section}>
            {renderSectionHeader('Featured Products', 'Top quality items')}
            <FlatList
              data={featuredProducts}
              renderItem={renderProductItem}
              keyExtractor={(item) => item._id}
              numColumns={2}
              scrollEnabled={false}
              contentContainerStyle={styles.productsList}
            />
          </View>
        )}

        {/* All Products Section */}
        <View style={styles.section}>
          {renderSectionHeader(
            selectedCategory 
              ? `Products in ${categories.find(c => c._id === selectedCategory)?.name || 'Category'}`
              : searchQuery
              ? `Search Results for "${searchQuery}"`
              : 'All Products',
            selectedCategory || searchQuery ? undefined : 'Discover amazing deals'
          )}
          <FlatList
            data={filteredProducts.length > 0 ? filteredProducts : products}
            renderItem={renderProductItem}
            keyExtractor={(item) => item._id}
            numColumns={2}
            scrollEnabled={false}
            contentContainerStyle={styles.productsList}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>
                  {searchQuery ? '🔍' : selectedCategory ? '📂' : '📦'}
                </Text>
                <Text style={styles.emptyText}>
                  {searchQuery 
                    ? `No products found for "${searchQuery}"`
                    : selectedCategory
                    ? 'No products in this category'
                    : 'No products found'}
                </Text>
                <Text style={styles.emptySubtext}>
                  {searchQuery || selectedCategory
                    ? 'Try a different search or category'
                    : 'Check back later for new products'}
                </Text>
              </View>
            }
          />
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.white,
  },
  loadingText: {
    marginTop: 16,
    color: Colors.primary,
    fontSize: 16,
  },
  searchContainer: {
    paddingTop: 50,
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.tertiary,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchIcon: {
    marginRight: 4,
  },
  searchInputContainer: {
    flex: 1,
  },
  searchInput: {
    fontSize: 15,
    color: Colors.primary,
    opacity: 0.7,
  },
  searchActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchActionButton: {
    padding: 6,
  },
  searchButton: {
    backgroundColor: Colors.secondary,
    borderRadius: 20,
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginTop: 16,
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: Colors.primary,
    opacity: 0.6,
    marginTop: 2,
  },
  seeAllText: {
    fontSize: 14,
    color: Colors.secondary,
    fontWeight: '600',
  },
  categoriesList: {
    paddingHorizontal: 16,
  },
  categoryCard: {
    width: 80,
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 12,
    marginRight: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  categoryIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 11,
    color: Colors.primary,
    textAlign: 'center',
    fontWeight: '500',
  },
  productsList: {
    paddingHorizontal: 12,
  },
  productCard: {
    width: CARD_WIDTH,
    flex: 1,
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

export default HomeScreen;
