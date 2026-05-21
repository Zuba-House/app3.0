/**
 * Search Screen — Advanced: smart suggestions, instant results, Lens, quick add
 * GET /api/search?q= with 300ms debounce; recent searches; category filters; empty state
 */

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Platform,
  ActivityIndicator,
  TextInput,
  Alert,
  Keyboard,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { productService } from '../../services/product.service';
import { categoryService, Category } from '../../services/category.service';
import { searchService, SearchSuggestion } from '../../services/search.service';
import { Product } from '../../types/product.types';
import ProductCard from '../../components/ProductCard';
import QuickAddModal from '../../components/QuickAddModal';
import Colors from '../../constants/colors';
import SearchBar from '../../components/SearchBar';
import { API_URL } from '../../constants/config';
import { STORAGE_KEYS } from '../../constants/config';
import { analyticsService } from '../../services/analytics.service';
import { showError, showSuccess, showWarning } from '../../utils/toast';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { setCart, addItem } from '../../store/slices/cartSlice';
import { cartService } from '../../services/cart.service';
import { isProductOutOfStock } from '../../utils/productStock';
import { useAuthState } from '../../core/auth/authGuards';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CATEGORY_SIDEBAR_WIDTH = SCREEN_WIDTH < 375 ? 100 : SCREEN_WIDTH < 414 ? 110 : 120;
const PRODUCT_GRID_WIDTH = SCREEN_WIDTH - CATEGORY_SIDEBAR_WIDTH;
const CARD_WIDTH = (PRODUCT_GRID_WIDTH - 24) / 2;
const DEBOUNCE_MS = 300;
const MAX_RECENT = 10;
const POPULAR_SUGGESTIONS = ['Sandals', 'African Fashion', 'Leather Shoes', 'Bags', 'Jewelry'];

const CATEGORY_ICONS: Record<string, string> = {
  fashion: 'shirt-outline',
  sandals: 'walk-outline',
  shoes: 'walk-outline',
  men: 'man-outline',
  women: 'woman-outline',
  beauty: 'sparkles-outline',
  jewelry: 'diamond-outline',
  bags: 'bag-handle-outline',
  electronics: 'phone-portrait-outline',
  home: 'home-outline',
  food: 'restaurant-outline',
  books: 'book-outline',
  sport: 'football-outline',
  default: 'grid-outline',
};

function getCategoryIconName(name: string): string {
  if (!name) return CATEGORY_ICONS.default;
  const lower = name.toLowerCase();
  for (const key of Object.keys(CATEGORY_ICONS)) {
    if (key !== 'default' && lower.includes(key)) return CATEGORY_ICONS[key];
  }
  return CATEGORY_ICONS.default;
}

export default function SearchScreen() {
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();
  const { authStatus } = useAuthState();
  const isAuthenticated = authStatus === 'authenticated';
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [quickAddProduct, setQuickAddProduct] = useState<Product | null>(null);
  const [lensLoading, setLensLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const topTabs = useMemo(() => {
    const preferred = ['Women', 'Curve', 'Kids', 'Men', 'Home', 'Beauty'];
    const byName = new Map(categories.map((c) => [c.name.toLowerCase(), c]));
    const picked: Category[] = [];
    preferred.forEach((p) => {
      const c = byName.get(p.toLowerCase());
      if (c) picked.push(c);
    });
    const rest = categories.filter((c) => !picked.find((p) => p._id === c._id)).slice(0, 4);
    return [...picked, ...rest];
  }, [categories]);

  const normalizeProduct = (p: any): Product => ({
    ...p,
    category: typeof p.category === 'object' ? p.category?._id : p.category,
    rating: p.rating ?? 0,
    reviewCount: p.reviewCount ?? 0,
  });

  const getProductCategoryIds = (p: any): string[] => {
    const ids: string[] = [];
    if (p?.category) {
      ids.push(typeof p.category === 'object' ? String(p.category?._id || '') : String(p.category));
    }
    if (Array.isArray(p?.categories)) {
      p.categories.forEach((c: any) => {
        ids.push(typeof c === 'object' ? String(c?._id || '') : String(c));
      });
    }
    return ids.filter(Boolean);
  };

  const loadCategories = useCallback(async (_sourceProducts: Product[]) => {
    try {
      setCategoriesLoading(true);
      const response = await categoryService.getCategories();
      if (response.success && response.data) {
        const raw = Array.isArray(response.data) ? response.data : [];
        const cleanedBase = raw
          .filter((c: any) => c?._id && c?.name)
          .map((c: any) => ({ _id: String(c._id), name: String(c.name), slug: c.slug, image: c.image, icon: c.icon }));

        // Show all categories as requested.
        setCategories(cleanedBase as Category[]);
      }
    } catch (e) {
      setCategories([]);
    } finally {
      setCategoriesLoading(false);
    }
  }, []);

  const loadRecentSearches = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEYS.RECENT_SEARCHES);
      const list = raw ? JSON.parse(raw) : [];
      setRecentSearches(Array.isArray(list) ? list.slice(0, MAX_RECENT) : []);
    } catch {
      setRecentSearches([]);
    }
  }, []);

  const saveRecentSearch = useCallback(async (query: string) => {
    const q = query.trim();
    if (!q) return;
    const next = [q, ...recentSearches.filter((s) => s.toLowerCase() !== q.toLowerCase())].slice(0, MAX_RECENT);
    setRecentSearches(next);
    await AsyncStorage.setItem(STORAGE_KEYS.RECENT_SEARCHES, JSON.stringify(next));
  }, [recentSearches]);

  const clearRecentSearches = useCallback(async () => {
    setRecentSearches([]);
    await AsyncStorage.setItem(STORAGE_KEYS.RECENT_SEARCHES, '[]');
  }, []);

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        await loadRecentSearches();
        const res = await productService.getAllProducts({ limit: 100 });
        if ((res as any).success !== false && res.data) {
          const arr = Array.isArray(res.data) ? res.data : (res.data as any).products || [];
          const normalized = arr.map(normalizeProduct);
          setAllProducts(normalized);
          setProducts(normalized);
          await loadCategories(normalized);
        } else {
          setAllProducts([]);
          setProducts([]);
          await loadCategories([]);
        }
      } catch {
        setAllProducts([]);
        setProducts([]);
        await loadCategories([]);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [loadCategories, loadRecentSearches]);

  const runSearch = useCallback(async (query: string) => {
    const q = query.trim();
    if (!q) {
      setSuggestions([]);
      if (!selectedCategory) {
        setProducts(allProducts);
      } else {
        const filtered = allProducts.filter((p: any) => getProductCategoryIds(p).includes(selectedCategory));
        setProducts(filtered);
      }
      return;
    }
    setLoading(true);
    try {
      const data = await searchService.search(q, 50);
      setProducts(data.products || []);
      setSuggestions(data.suggestions || []);
      setShowSuggestions(true);
      if (q) analyticsService.search(q, (data.products || []).length);
    } catch {
      try {
        const response = await productService.searchProducts(q);
        let list: Product[] = [];
        if (response.success && response.data) list = Array.isArray(response.data) ? response.data : (response.data as any).products || [];
        setProducts(list);
        setSuggestions(list.slice(0, 5).map((p) => ({ type: 'product' as const, text: p.name, id: p._id })));
      } catch {
        setProducts([]);
      }
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, allProducts]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!searchQuery.trim()) {
      setSuggestions([]);
      if (!selectedCategory) {
        setProducts(allProducts);
      }
      return;
    }
    debounceRef.current = setTimeout(() => runSearch(searchQuery), DEBOUNCE_MS);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [searchQuery, selectedCategory, allProducts, runSearch]);

  const handleSearchSubmit = useCallback((query: string) => {
    Keyboard.dismiss();
    setShowSuggestions(false);
    if (query.trim()) {
      saveRecentSearch(query);
      runSearch(query);
    } else if (!selectedCategory) {
      setProducts(allProducts);
    }
  }, [runSearch, saveRecentSearch, selectedCategory, allProducts]);

  const handleCategorySelect = useCallback((categoryId: string | null) => {
    setSelectedCategory(categoryId);
    if (categoryId) {
      const filtered = allProducts.filter((p: any) => getProductCategoryIds(p).includes(categoryId));
      setProducts(filtered);
    } else {
      setProducts(allProducts);
    }
  }, [allProducts]);

  const handleLensPress = useCallback(async () => {
    const options = ['Take photo', 'Choose from library', 'Cancel'];
    Alert.alert('Search by image', 'Take or upload a photo to find similar products', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Take photo',
        onPress: async () => {
          const { status } = await ImagePicker.requestCameraPermissionsAsync();
          if (status !== 'granted') {
            showError('Camera permission is required');
            return;
          }
          const result = await ImagePicker.launchCameraAsync({ base64: true, quality: 0.6 });
          if (result.canceled || !result.assets?.[0]?.base64) return;
          setLensLoading(true);
          try {
            const data = await searchService.searchByImage(result.assets[0].base64);
            setProducts(data.products || []);
            setSearchQuery(data.detected?.[0] || '');
            setShowSuggestions(false);
          } catch (e) {
            showError('Image search failed. Try text search.');
          } finally {
            setLensLoading(false);
          }
        },
      },
      {
        text: 'Choose from library',
        onPress: async () => {
          const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (status !== 'granted') {
            showError('Photo library permission is required');
            return;
          }
          const result = await ImagePicker.launchImageLibraryAsync({ base64: true, quality: 0.6 });
          if (result.canceled || !result.assets?.[0]?.base64) return;
          setLensLoading(true);
          try {
            const data = await searchService.searchByImage(result.assets[0].base64);
            setProducts(data.products || []);
            setSearchQuery(data.detected?.[0] || '');
            setShowSuggestions(false);
          } catch (e) {
            showError('Image search failed. Try text search.');
          } finally {
            setLensLoading(false);
          }
        },
      },
    ]);
  }, []);

  const handleSuggestionSelect = (s: SearchSuggestion) => {
    setSearchQuery(s.text);
    setShowSuggestions(false);
    saveRecentSearch(s.text);
    runSearch(s.text);
  };

  const handleQuickAdd = useCallback(async (product: Product) => {
    const isVariable = product.productType === 'variable' && (product.variations?.length ?? 0) > 0;
    if (isVariable) {
      setQuickAddProduct(product);
      return;
    }
    if (isProductOutOfStock(product)) {
      showError('This item is out of stock');
      return;
    }
    const price = product.salePrice ?? product.price ?? 0;
    if (!isAuthenticated) {
      const cartItem = {
        _id: `guest_${Date.now()}_${Math.random()}`,
        product,
        quantity: 1,
        price,
        subtotal: price,
      };
      dispatch(addItem(cartItem));
      showSuccess('Added to cart');
      return;
    }
    try {
      const res = await cartService.addToCart(product._id, 1, undefined, undefined, product);
      if (res.success) {
        const cartRes = await cartService.getCart();
        if (cartRes.success) dispatch(setCart(cartRes.data));
        showSuccess('Added to cart');
      } else showError(res.message || 'Failed to add');
    } catch (e: any) {
      showError(e?.message || 'Failed to add');
    }
  }, [dispatch, isAuthenticated]);

  const renderCategoryItem = ({ item }: { item: Category }) => {
    const isSelected = selectedCategory === item._id;
    return (
      <TouchableOpacity
        style={[styles.categoryItem, isSelected && styles.categoryItemActive]}
        onPress={() => handleCategorySelect(item._id)}
        activeOpacity={0.7}
      >
        {item.image ? (
          <Image source={{ uri: item.image }} style={styles.categoryImageIcon} contentFit="cover" />
        ) : (
          <Ionicons name={getCategoryIconName(item.name) as any} size={18} color={isSelected ? Colors.secondary : Colors.primary} />
        )}
        <Text style={[styles.categoryItemText, isSelected && styles.categoryItemTextActive]} numberOfLines={2}>{item.name}</Text>
      </TouchableOpacity>
    );
  };

  const renderProductItem = ({ item }: { item: Product }) => (
    <ProductCard
      product={item}
      onPress={() => navigation.navigate('ProductDetail', { productId: item._id })}
      onAddToCart={() => {
        if (item.productType === 'variable' && (item.variations?.length ?? 0) > 0) {
          setQuickAddProduct(item);
        } else {
          if (!isAuthenticated) {
            showWarning('Please login to add items to cart');
            return;
          }
          cartService.addToCart(item._id, 1, undefined, undefined, item)
            .then(async (res) => {
              if (res.success) {
                const cr = await cartService.getCart();
                if (cr.success) dispatch(setCart(cr.data));
                showSuccess('Added to cart');
              } else {
                showError(res.message || 'Failed');
              }
            })
            .catch((e) => showError(e.message || 'Failed'));
        }
      }}
      style={[styles.productCard, { width: CARD_WIDTH }]}
    />
  );

  const displayProducts = products;
  const isEmpty = !loading && displayProducts.length === 0;
  const showRecent = !searchQuery.trim() && recentSearches.length > 0;
  const showSuggestionsPanel = suggestions.length > 0 || showRecent;

  return (
    <View style={styles.container}>
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        onSearch={handleSearchSubmit}
        onCategorySelect={handleCategorySelect}
        placeholder="Search products..."
        onLensPress={handleLensPress}
      />
      {lensLoading && (
        <View style={styles.lensLoading}>
          <ActivityIndicator size="large" color={Colors.secondary} />
          <Text style={styles.lensLoadingText}>Searching by image...</Text>
        </View>
      )}
      {showSuggestionsPanel && (
        <View style={styles.suggestionsBox}>
          {showRecent && (
            <View style={styles.suggestionsSection}>
              <View style={styles.suggestionsSectionHeader}>
                <Text style={styles.suggestionsSectionTitle}>Recent</Text>
                <TouchableOpacity onPress={clearRecentSearches}><Text style={styles.suggestionsClear}>Clear</Text></TouchableOpacity>
              </View>
              {recentSearches.map((s) => (
                <TouchableOpacity key={s} style={styles.suggestionRow} onPress={() => handleSuggestionSelect({ type: 'product', text: s })}>
                  <Ionicons name="time-outline" size={18} color={Colors.primary} />
                  <Text style={styles.suggestionRowText}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
          {suggestions.length > 0 && (
            <View style={styles.suggestionsSection}>
              <Text style={styles.suggestionsSectionTitle}>Suggestions</Text>
              {suggestions.map((s, i) => (
                <TouchableOpacity key={`${s.text}-${i}`} style={styles.suggestionRow} onPress={() => handleSuggestionSelect(s)}>
                  <Ionicons name={s.type === 'category' ? 'pricetag-outline' : 'search-outline'} size={18} color={Colors.primary} />
                  <Text style={styles.suggestionRowText}>{s.text}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      )}

      <View style={styles.topTabsWrap}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.topTabsContent}>
          <TouchableOpacity
            style={[styles.topTabItem, !selectedCategory && styles.topTabItemActive]}
            onPress={() => handleCategorySelect(null)}
            activeOpacity={0.8}
          >
            <Text style={[styles.topTabText, !selectedCategory && styles.topTabTextActive]}>All</Text>
          </TouchableOpacity>
          {topTabs.map((tab) => {
            const active = selectedCategory === tab._id;
            return (
              <TouchableOpacity
                key={tab._id}
                style={[styles.topTabItem, active && styles.topTabItemActive]}
                onPress={() => handleCategorySelect(tab._id)}
                activeOpacity={0.8}
              >
                <Text style={[styles.topTabText, active && styles.topTabTextActive]}>{tab.name}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.categorySidebar}>
          <View style={styles.categoryHeader}>
            <Text style={styles.categoryHeaderText}>Categories</Text>
          </View>
          {categoriesLoading ? (
            <ActivityIndicator size="small" color={Colors.secondary} style={styles.categoryLoading} />
          ) : (
            <FlatList
              data={categories}
              renderItem={renderCategoryItem}
              keyExtractor={(item) => item._id}
              scrollEnabled={true}
              nestedScrollEnabled={true}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.categoryList}
              ListHeaderComponent={
                <TouchableOpacity
                  style={[styles.categoryItem, !selectedCategory && styles.categoryItemActive]}
                  onPress={() => handleCategorySelect(null)}
                >
                  <Text style={[styles.categoryItemText, !selectedCategory && styles.categoryItemTextActive]}>All</Text>
                </TouchableOpacity>
              }
            />
          )}
        </View>
        <View style={styles.productsContainer}>
          <View style={styles.productsHeader}>
            <Text style={styles.productsHeaderText}>
              {selectedCategory ? categories.find((c) => c._id === selectedCategory)?.name || 'Picks for You' : searchQuery.trim() ? `Results for "${searchQuery}"` : 'Picks for You'}
            </Text>
          </View>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.secondary} />
            </View>
          ) : (
            <FlatList
              data={displayProducts}
              renderItem={renderProductItem}
              keyExtractor={(item) => item._id}
              numColumns={2}
              scrollEnabled={true}
              nestedScrollEnabled={true}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.productsList}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                isEmpty ? (
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyIcon}>🔍</Text>
                    <Text style={styles.emptyTitle}>No results found</Text>
                    <Text style={styles.emptySub}>Try searching for:</Text>
                    {POPULAR_SUGGESTIONS.map((s) => (
                      <TouchableOpacity key={s} style={styles.emptyChip} onPress={() => { setSearchQuery(s); runSearch(s); }}>
                        <Text style={styles.emptyChipText}>{s}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                ) : null
              }
            />
          )}
        </View>
      </View>

      <QuickAddModal
        visible={!!quickAddProduct}
        product={quickAddProduct}
        onClose={() => setQuickAddProduct(null)}
        onAdded={() => showSuccess('Added to cart')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  lensLoading: {
    padding: 16,
    alignItems: 'center',
    backgroundColor: Colors.white,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  lensLoadingText: { fontSize: 14, color: Colors.primary },
  suggestionsBox: {
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingHorizontal: 16,
    paddingBottom: 12,
    maxHeight: 280,
  },
  suggestionsSection: { marginTop: 12 },
  suggestionsSectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  suggestionsSectionTitle: { fontSize: 13, fontWeight: '700', color: Colors.primary },
  suggestionsClear: { fontSize: 13, color: Colors.secondary },
  suggestionRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: 10 },
  suggestionRowText: { fontSize: 15, color: Colors.primary, flex: 1 },
  topTabsWrap: {
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  topTabsContent: {
    paddingHorizontal: 8,
    alignItems: 'center',
    minHeight: 44,
  },
  topTabItem: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    marginHorizontal: 4,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  topTabItemActive: {
    borderBottomColor: Colors.primary,
  },
  topTabText: {
    fontSize: 15,
    color: Colors.primary,
    opacity: 0.75,
    fontWeight: '600',
  },
  topTabTextActive: {
    opacity: 1,
    fontWeight: '700',
  },
  contentContainer: { flex: 1, flexDirection: 'row' },
  categorySidebar: {
    width: CATEGORY_SIDEBAR_WIDTH,
    backgroundColor: Colors.white,
    borderRightWidth: 1,
    borderRightColor: Colors.border,
  },
  categoryHeader: {
    paddingHorizontal: 8,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  categoryHeaderText: { fontSize: 13, fontWeight: '700', color: Colors.primary },
  categoryLoading: { padding: 20, alignItems: 'center' },
  categoryList: { paddingVertical: 8 },
  categoryItem: {
    paddingHorizontal: 8,
    paddingVertical: 12,
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
  categoryIcon: { fontSize: 18, marginBottom: 2 },
  categoryImageIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginBottom: 4,
    backgroundColor: Colors.tertiary,
  },
  categoryItemText: { fontSize: 11, fontWeight: '500', color: Colors.primary, opacity: 0.8 },
  categoryItemTextActive: { color: Colors.primary, opacity: 1, fontWeight: '600' },
  productsContainer: { flex: 1, backgroundColor: Colors.background },
  productsHeader: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  productsHeaderText: { fontSize: 15, fontWeight: '700', color: Colors.primary },
  productsList: { padding: 8 },
  productCard: { flex: 1, maxWidth: CARD_WIDTH },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', minHeight: 200 },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    minHeight: 320,
  },
  emptyIcon: { fontSize: 56, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: Colors.primary, marginBottom: 8 },
  emptySub: { fontSize: 14, color: Colors.primary, opacity: 0.8, marginBottom: 12 },
  emptyChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.tertiary,
    marginVertical: 4,
  },
  emptyChipText: { fontSize: 14, color: Colors.primary },
});
