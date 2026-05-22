/**
 * Full category grid — tap opens filtered product list.
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { categoryService, Category } from '../../services/category.service';
import Colors from '../../constants/colors';
import { API_URL } from '../../constants/config';
import { navigateToProductList, pressNavigate } from '../../navigation/navigationHelpers';
import { FLATLIST_PERF } from '../../utils/flatListPerf';

const CategoriesScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await categoryService.getCategories();
      setCategories(res.data ?? []);
    } catch {
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const imageUri = (cat: Category) => {
    const raw = cat.image?.trim();
    if (!raw) return null;
    if (raw.startsWith('http')) return raw;
    return `${API_URL}${raw.startsWith('/') ? '' : '/'}${raw}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>All Categories</Text>
        <View style={{ width: 24 }} />
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} size="large" color={Colors.secondary} />
      ) : (
        <FlatList
          {...FLATLIST_PERF}
          data={categories}
          keyExtractor={(item) => item._id}
          numColumns={2}
          contentContainerStyle={styles.list}
          columnWrapperStyle={styles.row}
          onEndReachedThreshold={0.1}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.85}
              onPress={() =>
                navigateToProductList(navigation, {
                  categoryId: item._id,
                  categoryName: item.name,
                  title: item.name,
                })
              }
            >
              {imageUri(item) ? (
                <Image source={{ uri: imageUri(item)! }} style={styles.image} contentFit="cover" />
              ) : (
                <View style={[styles.image, styles.placeholder]}>
                  <Ionicons name="grid-outline" size={32} color={Colors.secondary} />
                </View>
              )}
              <Text style={styles.name} numberOfLines={2}>
                {item.name}
              </Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <Text style={styles.empty}>No categories available.</Text>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 56 : 40,
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: Colors.white,
  },
  title: { fontSize: 18, fontWeight: '700', color: Colors.primary },
  list: { padding: 12, paddingBottom: 32 },
  row: { justifyContent: 'space-between' },
  card: {
    width: '48%',
    backgroundColor: Colors.white,
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 12,
  },
  image: { width: '100%', height: 120 },
  placeholder: { justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.tertiary },
  name: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.primary,
    padding: 12,
  },
  empty: { textAlign: 'center', color: '#6b7280', marginTop: 40 },
});

export default CategoriesScreen;
