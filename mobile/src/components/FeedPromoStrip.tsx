/**
 * Minimal promo strip for mixed home feed (Temu-style, on-brand).
 */

import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Colors from '../constants/colors';
import type { PromoVariant } from '../utils/mixedProductFeed';
import { navigateToProductList } from '../navigation/navigationHelpers';

const PROMO_META: Record<
  PromoVariant,
  { label: string; sub: string; icon: keyof typeof Ionicons.glyphMap; accent: string }
> = {
  surprise: {
    label: 'Surprise me',
    sub: 'Fresh picks every visit',
    icon: 'sparkles-outline',
    accent: Colors.secondary,
  },
  ai_picks: {
    label: 'Curated for you',
    sub: 'Smart matches from our catalog',
    icon: 'bulb-outline',
    accent: Colors.primary,
  },
  lightning: {
    label: 'Lightning deals',
    sub: 'Limited-time savings',
    icon: 'flash-outline',
    accent: Colors.secondary,
  },
  hidden_gems: {
    label: 'Hidden gems',
    sub: 'Under-the-radar finds',
    icon: 'diamond-outline',
    accent: Colors.primary,
  },
  best_value: {
    label: 'Best value',
    sub: 'Top discounts right now',
    icon: 'pricetag-outline',
    accent: Colors.secondary,
  },
  fresh_drop: {
    label: 'Fresh drops',
    sub: 'Newest additions',
    icon: 'leaf-outline',
    accent: Colors.primary,
  },
};

const FILTER_MAP: Partial<Record<PromoVariant, 'flash-sale' | 'new-arrivals' | 'trending' | 'featured'>> = {
  lightning: 'flash-sale',
  fresh_drop: 'new-arrivals',
  ai_picks: 'trending',
  best_value: 'flash-sale',
};

interface FeedPromoStripProps {
  variant: PromoVariant;
  onSurprise?: () => void;
}

const FeedPromoStrip: React.FC<FeedPromoStripProps> = ({ variant, onSurprise }) => {
  const navigation = useNavigation<any>();
  const meta = useMemo(() => PROMO_META[variant], [variant]);

  const handlePress = () => {
    if (variant === 'surprise' && onSurprise) {
      onSurprise();
      return;
    }
    const filter = FILTER_MAP[variant];
    navigateToProductList(navigation, {
      filter,
      title: meta.label,
      subtitle: meta.sub,
      sortBy: variant === 'fresh_drop' ? 'newest' : undefined,
    });
  };

  return (
    <TouchableOpacity style={styles.wrap} onPress={handlePress} activeOpacity={0.85}>
      <View style={[styles.iconCircle, { backgroundColor: meta.accent }]}>
        <Ionicons name={meta.icon} size={18} color={Colors.white} />
      </View>
      <View style={styles.textCol}>
        <Text style={styles.label}>{meta.label}</Text>
        <Text style={styles.sub}>{meta.sub}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={Colors.primary} style={{ opacity: 0.5 }} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
    marginVertical: 6,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: Colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textCol: { flex: 1 },
  label: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.primary,
  },
  sub: {
    fontSize: 12,
    color: Colors.primary,
    opacity: 0.55,
    marginTop: 2,
  },
});

export default FeedPromoStrip;
