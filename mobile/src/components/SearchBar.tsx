/**
 * Temu-Style Search Bar Component
 * Clean white search bar with camera, cart and search icons
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Keyboard,
  Dimensions,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAppSelector } from '../store/hooks';
import { selectCartCount } from '../store/slices/cartSlice';
import Colors from '../constants/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface SearchBarProps {
  onSearch?: (query: string) => void;
  onCategorySelect?: (categoryId: string | null) => void;
  placeholder?: string;
  onFocus?: () => void;
  navigateToSearch?: boolean;
  showCart?: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  onCategorySelect,
  placeholder = 'Search products...',
  onFocus,
  navigateToSearch = false,
  showCart = true,
}) => {
  const navigation = useNavigation<any>();
  const cartCount = useAppSelector(selectCartCount);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
  };

  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      Keyboard.dismiss();
      onSearch?.(searchQuery);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    onCategorySelect?.(null);
    onSearch?.('');
    Keyboard.dismiss();
  };

  const handleCartPress = () => {
    navigation.navigate('Cart');
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        {/* Main Search Input - Temu Style */}
        <View 
          style={[
            styles.searchInputContainer,
            isFocused && styles.searchInputContainerFocused,
          ]}
        >
          <Ionicons name="search-outline" size={18} color="#999" style={styles.searchIcon} />
          <TextInput
            placeholder={placeholder}
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={handleSearchChange}
            onSubmitEditing={handleSearchSubmit}
            onFocus={() => {
              setIsFocused(true);
              if (navigateToSearch && onFocus) {
                onFocus();
              }
            }}
            onBlur={() => setIsFocused(false)}
            style={styles.searchInput}
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
          />
          
          {/* Clear Button - Only show when there's text */}
          {searchQuery.length > 0 && (
            <TouchableOpacity 
              onPress={clearSearch} 
              style={styles.clearButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons 
                name="close-circle" 
                size={18} 
                color="#999" 
              />
            </TouchableOpacity>
          )}
        </View>
        
        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          {/* Cart Button with Badge */}
          {showCart && (
            <TouchableOpacity 
              onPress={handleCartPress} 
              style={styles.cartButton}
              activeOpacity={0.7}
            >
              <Ionicons 
                name="cart-outline" 
                size={24} 
                color={Colors.primary} 
              />
              {cartCount > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>
                    {cartCount > 99 ? '99+' : cartCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    ...Platform.select({
      ios: {
        shadowColor: Colors.shadow,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SCREEN_WIDTH * 0.04,
    paddingTop: Platform.OS === 'ios' ? 50 : 12,
    paddingBottom: 12,
    gap: 10,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.tertiary,
    borderRadius: 24,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 10 : 8,
    minHeight: 44,
    maxHeight: 44,
  },
  searchInputContainerFocused: {
    borderWidth: 1.5,
    borderColor: Colors.secondary,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: SCREEN_WIDTH < 375 ? 14 : 15,
    color: Colors.primary,
    padding: 0,
    margin: 0,
    ...Platform.select({
      ios: {
        lineHeight: 20,
      },
      android: {
        textAlignVertical: 'center',
      },
    }),
  },
  clearButton: {
    padding: 4,
    marginLeft: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cartButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: Colors.secondary,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  cartBadgeText: {
    color: Colors.primary,
    fontSize: 10,
    fontWeight: '700',
  },
});

export default SearchBar;
