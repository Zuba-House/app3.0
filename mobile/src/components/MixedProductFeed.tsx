/**
 * Mixed catalog feed — product grid rows, promo strips, mini horizontal rows.
 */

import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Dimensions,
  ActivityIndicator,
  Text,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Product } from '../types/product.types';
import ProductCard from './ProductCard';
import FeedPromoStrip from './FeedPromoStrip';
import Colors from '../constants/colors';
import { buildMixedFeedBlocks, daySeed } from '../utils/mixedProductFeed';
import { navigateToProductDetail } from '../navigation/navigationHelpers';
import { FLATLIST_PERF_HORIZONTAL } from '../utils/flatListPerf';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 36) / 2;

interface MixedProductFeedProps {
  products: Product[];
  loadingMore?: boolean;
  feedSeed?: number;
}

const MixedProductFeed: React.FC<MixedProductFeedProps> = ({
  products,
  loadingMore = false,
  feedSeed: feedSeedProp,
}) => {
  const navigation = useNavigation<any>();
  const [surpriseSeed, setSurpriseSeed] = useState(0);
  const feedSeed = (feedSeedProp ?? daySeed()) + surpriseSeed;

  const blocks = useMemo(
    () => buildMixedFeedBlocks(products, feedSeed),
    [products, feedSeed]
  );

  const handleSurprise = useCallback(() => {
    setSurpriseSeed((s) => s + 1);
  }, []);

  const handleProductPress = useCallback(
    (id: string) => navigateToProductDetail(navigation, id),
    [navigation]
  );

  const renderHorizontalItem = useCallback(
    ({ item }: { item: Product }) => (
      <View style={styles.hCard}>
        <ProductCard
          product={item}
          onPress={() => handleProductPress(item._id)}
          onAddToCart={() => handleProductPress(item._id)}
          style={styles.hCardInner}
        />
      </View>
    ),
    [handleProductPress]
  );

  if (blocks.length === 0) return null;

  return (
    <View style={styles.container}>
      {blocks.map((block) => {
        if (block.type === 'promo') {
          return (
            <FeedPromoStrip
              key={block.id}
              variant={block.variant}
              onSurprise={block.variant === 'surprise' ? handleSurprise : undefined}
            />
          );
        }

        if (block.type === 'horizontal') {
          return (
            <View key={block.id} style={styles.hSection}>
              <View style={styles.hHeader}>
                <Text style={styles.hTitle}>{block.title}</Text>
                <Text style={styles.hSub}>{block.subtitle}</Text>
              </View>
              <FlatList
                {...FLATLIST_PERF_HORIZONTAL}
                data={block.products}
                renderItem={renderHorizontalItem}
                keyExtractor={(item) => `h-${block.id}-${item._id}`}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.hList}
              />
            </View>
          );
        }

        return (
          <View key={block.id} style={styles.row}>
            {block.products.map((item) => (
              <View key={item._id} style={styles.cardWrap}>
                <ProductCard
                  product={item}
                  onPress={() => handleProductPress(item._id)}
                  onAddToCart={() => handleProductPress(item._id)}
                />
              </View>
            ))}
            {block.products.length === 1 ? <View style={styles.cardWrap} /> : null}
          </View>
        );
      })}
      {loadingMore ? (
        <View style={styles.footer}>
          <ActivityIndicator size="small" color={Colors.secondary} />
          <Text style={styles.footerText}>Loading more…</Text>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 24,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    marginBottom: 4,
  },
  cardWrap: {
    width: CARD_WIDTH,
    marginBottom: 8,
  },
  hSection: {
    marginTop: 4,
    marginBottom: 8,
  },
  hHeader: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  hTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
  },
  hSub: {
    fontSize: 12,
    color: Colors.primary,
    opacity: 0.55,
    marginTop: 2,
  },
  hList: {
    paddingHorizontal: 12,
    gap: 8,
  },
  hCard: {
    width: width * 0.42,
    marginRight: 8,
  },
  hCardInner: {
    width: '100%',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  footerText: {
    fontSize: 13,
    color: Colors.primary,
    opacity: 0.6,
  },
});

export default MixedProductFeed;
