/**
 * Category Deals Component - TEMU Style
 * Shows deals organized by category
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Colors from '../constants/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface CategoryDeal {
  id: string;
  name: string;
  image: string;
  discount: string;
  itemCount: number;
}

interface CategoryDealsProps {
  categories?: CategoryDeal[];
}

const DEFAULT_CATEGORIES: CategoryDeal[] = [
  {
    id: '1',
    name: 'Women',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400',
    discount: 'Up to 60%',
    itemCount: 500,
  },
  {
    id: '2',
    name: 'Men',
    image: 'https://images.unsplash.com/photo-1516257984-b1b4d707412e?w=400',
    discount: 'Up to 50%',
    itemCount: 350,
  },
  {
    id: '3',
    name: 'Kids',
    image: 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=400',
    discount: 'Up to 70%',
    itemCount: 280,
  },
  {
    id: '4',
    name: 'Accessories',
    image: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400',
    discount: 'Up to 55%',
    itemCount: 420,
  },
];

const CategoryDeals: React.FC<CategoryDealsProps> = ({
  categories = DEFAULT_CATEGORIES,
}) => {
  const navigation = useNavigation<any>();

  const handlePress = (category: CategoryDeal) => {
    navigation.navigate('MainTabs', {
      screen: 'Search',
      params: { categoryId: category.id },
    });
  };

  const renderCategory = ({ item }: { item: CategoryDeal }) => (
    <TouchableOpacity
      style={styles.categoryCard}
      onPress={() => handlePress(item)}
      activeOpacity={0.8}
    >
      <Image
        source={{ uri: item.image }}
        style={styles.categoryImage}
        contentFit="cover"
        transition={200}
      />
      <View style={styles.overlay} />
      <View style={styles.categoryContent}>
        <Text style={styles.categoryName}>{item.name}</Text>
        <View style={styles.discountBadge}>
          <Text style={styles.discountText}>{item.discount}</Text>
        </View>
        <Text style={styles.itemCount}>{item.itemCount}+ items</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Ionicons name="grid" size={20} color={Colors.primary} />
          <Text style={styles.title}>Shop by Category</Text>
        </View>
        <TouchableOpacity style={styles.seeAllButton}>
          <Text style={styles.seeAllText}>See All</Text>
          <Ionicons name="chevron-forward" size={16} color={Colors.secondary} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={categories}
        renderItem={renderCategory}
        keyExtractor={(item) => `cat-deal-${item.id}`}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primary,
    marginLeft: 8,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAllText: {
    fontSize: 14,
    color: Colors.secondary,
    fontWeight: '500',
  },
  listContent: {
    paddingHorizontal: 12,
  },
  categoryCard: {
    width: SCREEN_WIDTH * 0.42,
    height: SCREEN_WIDTH * 0.5,
    marginHorizontal: 4,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  categoryImage: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  categoryContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  categoryName: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: 8,
  },
  discountBadge: {
    backgroundColor: Colors.secondary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  discountText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  itemCount: {
    fontSize: 12,
    color: Colors.white,
    opacity: 0.9,
  },
});

export default CategoryDeals;
