/**
 * Enhanced Search Bar Component
 * Creative search with real-time suggestions and category filters
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Animated,
  Dimensions,
  Keyboard,
} from 'react-native';
import { Searchbar } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { productService } from '../services/product.service';
import { categoryService, Category } from '../services/category.service';
import { Product } from '../types/product.types';
import Colors from '../constants/colors';

const { width } = Dimensions.get('window');

interface SearchBarProps {
  onSearch?: (query: string) => void;
  onCategorySelect?: (categoryId: string | null) => void;
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  onCategorySelect,
  placeholder = 'Search products...',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (searchQuery.trim().length >= 2) {
      // Debounce search
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      searchTimeoutRef.current = setTimeout(() => {
        searchProducts(searchQuery);
      }, 300);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  useEffect(() => {
    // Animate suggestions dropdown
    Animated.timing(slideAnim, {
      toValue: showSuggestions ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [showSuggestions]);

  const loadCategories = async () => {
    try {
      setError(null);
      const response = await categoryService.getCategories();
      if (response.success && response.data) {
        const cats = Array.isArray(response.data) ? response.data : [];
        // Clean categories to remove any problematic properties
        const cleanedCats = cats
          .filter((cat: any) => cat && cat._id && cat.name) // Filter out invalid categories
          .map((cat: any) => {
            try {
              const cleaned: any = { _id: cat._id, name: cat.name };
              if (cat.slug) cleaned.slug = cat.slug;
              if (cat.description) cleaned.description = cat.description;
              if (cat.image) cleaned.image = cat.image;
              return cleaned;
            } catch (e) {
              console.warn('Error cleaning category:', e);
              return null;
            }
          })
          .filter((cat: any) => cat !== null); // Remove any null entries
        setCategories(cleanedCats.slice(0, 8)); // Show first 8 categories
      }
    } catch (error: any) {
      console.error('Error loading categories:', error);
      setError('Failed to load categories');
      setCategories([]); // Set empty array on error
    }
  };

  const searchProducts = async (query: string) => {
    try {
      setLoading(true);
      const response = await productService.searchProducts(query);
      
      if (response.success && response.data) {
        const products = Array.isArray(response.data) ? response.data : [];
        
        // Clean products to remove problematic category properties
        const cleanedProducts = products.map((product: any) => {
          const cleaned: any = {
            _id: product._id,
            name: product.name || '',
            price: product.price || 0,
            salePrice: product.salePrice,
            images: product.images || [],
            stock: product.stock || 0,
          };
          if (product.brand) cleaned.brand = product.brand;
          if (product.rating) cleaned.rating = product.rating;
          if (product.reviewCount) cleaned.reviewCount = product.reviewCount;
          
          // Safely handle category - convert to string ID if it's an object
          if (product.category) {
            if (typeof product.category === 'object' && product.category._id) {
              cleaned.category = product.category._id;
            } else if (typeof product.category === 'string') {
              cleaned.category = product.category;
            }
          }
          
          return cleaned;
        });
        
        // Get unique product names (first 5 suggestions)
        const uniqueProducts = cleanedProducts
          .filter((p, index, self) => 
            p.name && index === self.findIndex((t) => t.name === p.name)
          )
          .slice(0, 5);
        
        setSuggestions(uniqueProducts);
        setShowSuggestions(uniqueProducts.length > 0);
      }
    } catch (error) {
      console.error('Search suggestions error:', error);
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
  };

  const handleSuggestionPress = (product: Product) => {
    setSearchQuery(product.name);
    setShowSuggestions(false);
    Keyboard.dismiss();
    onSearch?.(product.name);
  };

  const handleCategoryPress = (categoryId: string | null) => {
    setSelectedCategory(categoryId);
    onCategorySelect?.(categoryId);
    setShowSuggestions(false);
  };

  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      Keyboard.dismiss();
      onSearch?.(searchQuery);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
    setSelectedCategory(null);
    onCategorySelect?.(null);
    onSearch?.('');
  };

  const suggestionHeight = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, Math.min(suggestions.length * 60 + 20, 300)],
  });

  return (
    <View style={styles.container}>
      {/* Main Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBarWrapper}>
          <Searchbar
            placeholder={placeholder}
            onChangeText={handleSearchChange}
            value={searchQuery}
            onSubmitEditing={handleSearchSubmit}
            onFocus={() => {
              if (suggestions.length > 0) {
                setShowSuggestions(true);
              }
            }}
            style={styles.searchbar}
            iconColor={Colors.primary}
            inputStyle={styles.searchInput}
            placeholderTextColor={Colors.primary}
            clearIcon={() => (
              searchQuery ? (
                <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
                  <Ionicons name="close-circle" size={20} color={Colors.primary} />
                </TouchableOpacity>
              ) : null
            )}
            right={() => (
              <TouchableOpacity onPress={handleSearchSubmit} style={styles.searchButton}>
                <Ionicons name="search" size={22} color={Colors.white} />
              </TouchableOpacity>
            )}
          />
        </View>
      </View>

      {/* Category Filters */}
      {categories.length > 0 && (
        <View style={styles.categoriesContainer}>
          <TouchableOpacity
            style={[
              styles.categoryChip,
              !selectedCategory && styles.categoryChipActive,
            ]}
            onPress={() => handleCategoryPress(null)}
          >
            <Text
              style={[
                styles.categoryChipText,
                !selectedCategory && styles.categoryChipTextActive,
              ]}
            >
              All
            </Text>
          </TouchableOpacity>
          {categories.map((category, index) => {
            // Safety check - ensure category has required properties
            if (!category || !category._id || !category.name) {
              return null;
            }
            return (
              <TouchableOpacity
                key={category._id}
                style={[
                  styles.categoryChip,
                  index > 0 && styles.categoryChipMargin,
                  selectedCategory === category._id && styles.categoryChipActive,
                ]}
                onPress={() => handleCategoryPress(category._id)}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    selectedCategory === category._id && styles.categoryChipTextActive,
                  ]}
                >
                  {category.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* Search Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <Animated.View
          style={[
            styles.suggestionsContainer,
            {
              maxHeight: suggestionHeight,
              opacity: slideAnim,
            },
          ]}
        >
          <FlatList
            data={suggestions}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => {
              // Safety check
              if (!item || !item._id || !item.name) {
                return null;
              }
              return (
                <TouchableOpacity
                  style={styles.suggestionItem}
                  onPress={() => handleSuggestionPress(item)}
                >
                  <Ionicons
                    name="search-outline"
                    size={18}
                    color={Colors.primary}
                    style={styles.suggestionIcon}
                  />
                  <Text style={styles.suggestionText} numberOfLines={1}>
                    {item.name}
                  </Text>
                  {item.brand && (
                    <Text style={styles.suggestionBrand}>{item.brand}</Text>
                  )}
                </TouchableOpacity>
              );
            }}
            scrollEnabled={suggestions.length > 3}
            keyboardShouldPersistTaps="handled"
          />
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  searchContainer: {
    paddingHorizontal: 12,
    paddingTop: 50,
    paddingBottom: 10,
  },
  searchBarWrapper: {
    position: 'relative',
  },
  searchbar: {
    backgroundColor: Colors.tertiary,
    borderRadius: 24,
    elevation: 0,
    height: 48,
  },
  searchInput: {
    fontSize: 15,
    color: Colors.primary,
  },
  clearButton: {
    padding: 4,
  },
  searchButton: {
    backgroundColor: Colors.secondary,
    borderRadius: 20,
    padding: 6,
    marginRight: 4,
  },
  categoriesContainer: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingBottom: 12,
    flexWrap: 'wrap',
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.tertiary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryChipActive: {
    backgroundColor: Colors.secondary,
    borderColor: Colors.secondary,
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.primary,
  },
  categoryChipTextActive: {
    color: Colors.primary,
    fontWeight: '600',
  },
  categoryChipMargin: {
    marginLeft: 8,
  },
  suggestionsContainer: {
    position: 'absolute',
    top: 108, // Below search bar and categories
    left: 12,
    right: 12,
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 1000,
    maxHeight: 300,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  suggestionIcon: {
    marginRight: 12,
  },
  suggestionText: {
    flex: 1,
    fontSize: 15,
    color: Colors.primary,
    fontWeight: '500',
  },
  suggestionBrand: {
    fontSize: 12,
    color: Colors.primary,
    opacity: 0.6,
    marginLeft: 8,
  },
});

export default SearchBar;
