/**
 * Filtered product listing (categories, flash sale, trending, etc.)
 */

import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
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
import { categoryService } from '../../services/category.service';
import type { ProductListParams } from '../../constants/routes';
import type { Product } from '../../types/product.types';
import ProductCard from '../../components/ProductCard';
import { FLATLIST_PERF } from '../../utils/flatListPerf';
import Colors from '../../constants/colors';
import { PAGINATION } from '../../constants/config';
import { applyListFilter, listNeedsCatalogScan } from '../../utils/productListFilters';
import { navigateToProductDetail, pressNavigate } from '../../navigation/navigationHelpers';

type RouteParams = { ProductList: ProductListParams };

const FILTER_MIN_ITEMS = 8;
const FILTER_MAX_PAGES = 8;

function mergeUniqueProducts(prev: Product[], next: Product[]): Product[] {
  const seen = new Set(prev.map((p) => p._id));
  return [...prev, ...next.filter((p) => !seen.has(p._id))];
}

const ProductListScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<RouteParams, 'ProductList'>>();
  const params = route.params ?? {};

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [resolvedCategoryId, setResolvedCategoryId] = useState<string | undefined>(
    params.categoryId
  );
  const catalogRawRef = useRef<Product[]>([]);

  const title = params.title || params.categoryName || params.categoryFilter || 'Products';

  useLayoutEffect(() => {
    navigation.setOptions({
      title,
      headerBackTitle: 'Home',
      headerBackTitleVisible: true,
    });
  }, [navigation, title]);

  const load = useCallback(
    async (page = 1, append = false) => {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      try {
        let categoryId = params.categoryId ?? resolvedCategoryId;
        if (!categoryId && (params.categoryName || params.categoryFilter)) {
          const cats = await categoryService.getCategories();
          const needle = (params.categoryName || params.categoryFilter || '').toLowerCase();
          const match = (cats.data ?? []).find((c) => c.name.toLowerCase() === needle);
          if (match) categoryId = match._id;
          setResolvedCategoryId(categoryId);
        }

        const scanCatalog = listNeedsCatalogScan({ ...params, categoryId });
        const listParams = { ...params, categoryId };
        let lastPage = page;
        let totalPages = 1;

        if (!append) {
          catalogRawRef.current = [];
        }

        const startPage = append ? page : 1;
        const endPage = !append && scanCatalog ? FILTER_MAX_PAGES : startPage;

        for (let p = startPage; p <= endPage; p++) {
          const response = await productService.getAllProducts({
            category: categoryId,
            sort:
              params.sortBy === 'newest' || params.filter === 'new-arrivals'
                ? 'newest'
                : undefined,
            page: p,
            limit: PAGINATION.LIST_PAGE_SIZE,
          });

          const payload = response.data;
          const raw = Array.isArray(payload)
            ? payload
            : payload &&
                typeof payload === 'object' &&
                Array.isArray((payload as { products?: Product[] }).products)
              ? (payload as { products: Product[] }).products
              : [];

          catalogRawRef.current = mergeUniqueProducts(catalogRawRef.current, raw);
          lastPage = p;
          totalPages =
            typeof response.totalPages === 'number' ? response.totalPages : totalPages;

          if (!scanCatalog || append) break;
          const filteredSoFar = applyListFilter(catalogRawRef.current, listParams);
          if (filteredSoFar.length >= FILTER_MIN_ITEMS || p >= totalPages) break;
        }

        setProducts(applyListFilter(catalogRawRef.current, listParams));

        setHasMore(
          typeof totalPages === 'number'
            ? lastPage < totalPages
            : catalogRawRef.current.length >= PAGINATION.LIST_PAGE_SIZE
        );
        setCurrentPage(lastPage);
      } catch {
        if (!append) setProducts([]);
        setHasMore(false);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [
      params.categoryId,
      params.categoryName,
      params.categoryFilter,
      params.filter,
      params.sortBy,
      resolvedCategoryId,
    ]
  );

  useEffect(() => {
    setCurrentPage(1);
    setHasMore(true);
    void load(1, false);
  }, [load]);

  const loadMore = useCallback(() => {
    if (loadingMore || !hasMore || loading) return;
    void load(currentPage + 1, true);
  }, [loadingMore, hasMore, loading, currentPage, load]);

  const subtitle = useMemo(() => {
    if (params.subtitle) return params.subtitle;
    return `${products.length} items`;
  }, [params.subtitle, products.length]);

  const renderItem = ({ item }: { item: Product }) => (
    <View style={styles.cardWrap}>
      <ProductCard
        product={item}
        onPress={() => navigateToProductDetail(navigation, item._id)}
        onAddToCart={() => navigateToProductDetail(navigation, item._id)}
      />
    </View>
  );

  const listFooter = useMemo(() => {
    if (!loadingMore) return <View style={styles.listFooter} />;
    return (
      <View style={styles.listFooter}>
        <ActivityIndicator size="small" color={Colors.secondary} />
        <Text style={styles.loadingMoreText}>Loading more…</Text>
      </View>
    );
  }, [loadingMore]);

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
          onEndReached={loadMore}
          onEndReachedThreshold={0.35}
          ListFooterComponent={listFooter}
          {...FLATLIST_PERF}
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
  listFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  loadingMoreText: { fontSize: 13, color: Colors.primary, opacity: 0.6 },
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
