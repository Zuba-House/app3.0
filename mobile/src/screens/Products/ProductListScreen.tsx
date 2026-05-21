/**
 * Filtered product listing (categories, flash sale, trending, etc.)
 */

import React, { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { productService } from '../../services/product.service';
import { categoryService, Category } from '../../services/category.service';
import type { ProductListParams } from '../../constants/routes';
import type { Product } from '../../types/product.types';
import ProductCard from '../../components/ProductCard';
import Colors from '../../constants/colors';
import { filterPricedProducts } from '../../utils/productDisplay';
import { navigateToProductDetail, pressNavigate } from '../../navigation/navigationHelpers';

type RouteParams = { ProductList: ProductListParams };

function getSaleInfo(p: Product) {
  const base = Number(p.price ?? 0);
  const sale = Number(p.salePrice ?? 0);
  const old = Number((p as unknown as Record<string, unknown>).oldPrice ?? 0);
  if (sale > 0 && base > sale) return true;
  if (old > base && base > 0) return true;
  return false;
}

function applyListFilter(products: Product[], params: ProductListParams): Product[] {
  let list = filterPricedProducts(products);
  const name = (params.categoryName || params.categoryFilter || '').trim().toLowerCase();

  if (params.categoryId) {
    list = list.filter((p) => {
      const cat = p.category;
      const id = typeof cat === 'object' ? (cat as Category)._id : String(cat ?? '');
      if (id === params.categoryId) return true;
      if (Array.isArray(p.categories)) {
        return p.categories.some((c) => String(c) === params.categoryId);
      }
      return false;
    });
  } else if (name) {
    list = list.filter((p) => {
      const cat = p.category;
      const catName =
        typeof cat === 'object' ? String((cat as Category).name ?? '').toLowerCase() : '';
      return catName.includes(name) || name.includes(catName);
    });
  }

  switch (params.filter) {
    case 'flash-sale':
    case 'sale':
      list = list.filter(getSaleInfo);
      break;
    case 'featured':
      list = list.filter((p) => Boolean(p.featured) || getSaleInfo(p));
      break;
    case 'new-arrivals':
      list = [...list].sort((a, b) => {
        const ta = new Date(a.createdAt ?? 0).getTime();
        const tb = new Date(b.createdAt ?? 0).getTime();
        return tb - ta;
      });
      break;
    case 'trending':
      list = [...list].sort((a, b) => {
        const score = (p: Product) => {
          const row = p as unknown as Record<string, unknown>;
          return (
            Number(row.wishlistCount ?? 0) * 2 +
            Number(row.totalSales ?? 0) * 3 +
            Number(row.views ?? 0)
          );
        };
        return score(b) - score(a);
      });
      break;
    default:
      break;
  }

  if (params.sortBy === 'newest') {
    list = [...list].sort(
      (a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()
    );
  }

  return list;
}

const ProductListScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<RouteParams, 'ProductList'>>();
  const params = route.params ?? {};

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [resolvedCategoryId, setResolvedCategoryId] = useState<string | undefined>(
    params.categoryId
  );

  const title = params.title || params.categoryName || params.categoryFilter || 'Products';

  useLayoutEffect(() => {
    navigation.setOptions({
      title,
      headerBackTitle: 'Home',
      headerBackTitleVisible: true,
    });
  }, [navigation, title]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      let categoryId = params.categoryId;
      if (!categoryId && (params.categoryName || params.categoryFilter)) {
        const cats = await categoryService.getCategories();
        const needle = (params.categoryName || params.categoryFilter || '').toLowerCase();
        const match = (cats.data ?? []).find((c) => c.name.toLowerCase() === needle);
        if (match) categoryId = match._id;
        setResolvedCategoryId(categoryId);
      }

      const response = await productService.getAllProducts({
        category: categoryId,
        sort: params.sortBy === 'newest' ? 'newest' : undefined,
        limit: 80,
      });

      const payload = response.data;
      const raw = Array.isArray(payload)
        ? payload
        : payload && typeof payload === 'object' && Array.isArray((payload as { products?: Product[] }).products)
          ? (payload as { products: Product[] }).products
          : [];

      const filtered = applyListFilter(raw, { ...params, categoryId });
      setProducts(filtered);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [params.categoryId, params.categoryName, params.categoryFilter, params.filter, params.sortBy]);

  useEffect(() => {
    void load();
  }, [load]);

  const subtitle = useMemo(() => {
    if (params.subtitle) return params.subtitle;
    if (resolvedCategoryId) return undefined;
    return `${products.length} items`;
  }, [params.subtitle, products.length, resolvedCategoryId]);

  const renderItem = ({ item }: { item: Product }) => (
    <View style={styles.cardWrap}>
      <ProductCard
        product={item}
        onPress={() => navigateToProductDetail(navigation, item._id)}
        onAddToCart={() => navigateToProductDetail(navigation, item._id)}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => void pressNavigate(navigation, 'MainTabs', { screen: 'Home' })}>
          <Ionicons name="chevron-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <View style={styles.topTitles}>
          <Text style={styles.screenTitle}>{title}</Text>
          {subtitle ? <Text style={styles.screenSubtitle}>{subtitle}</Text> : null}
        </View>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.secondary} />
          <Text style={styles.loadingText}>Loading products…</Text>
        </View>
      ) : products.length === 0 ? (
        <View style={styles.centered}>
          <Ionicons name="cube-outline" size={48} color={Colors.primary} style={{ opacity: 0.4 }} />
          <Text style={styles.emptyTitle}>No products found</Text>
          <Text style={styles.emptySub}>Try another category or check back later.</Text>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backBtnText}>Go back</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={products}
          renderItem={renderItem}
          keyExtractor={(item) => item._id}
          numColumns={2}
          contentContainerStyle={styles.list}
          columnWrapperStyle={styles.row}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 56 : 40,
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: Colors.white,
  },
  topTitles: { marginLeft: 8, flex: 1 },
  screenTitle: { fontSize: 20, fontWeight: '700', color: Colors.primary },
  screenSubtitle: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  list: { padding: 12, paddingBottom: 32 },
  row: { justifyContent: 'space-between' },
  cardWrap: { width: '48%', marginBottom: 12 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  loadingText: { marginTop: 12, color: '#6b7280' },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: Colors.primary, marginTop: 12 },
  emptySub: { fontSize: 14, color: '#6b7280', textAlign: 'center', marginTop: 8 },
  backBtn: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: Colors.secondary,
    borderRadius: 10,
  },
  backBtnText: { color: '#fff', fontWeight: '600' },
});

export default ProductListScreen;
