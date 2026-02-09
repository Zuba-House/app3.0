/**
 * Temu-Style Search Bar Component
 * Clean white search bar with camera and search icons on the right
 */

import React, { useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Keyboard,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface SearchBarProps {
  onSearch?: (query: string) => void;
  onCategorySelect?: (categoryId: string | null) => void;
  placeholder?: string;
  onFocus?: () => void;
  navigateToSearch?: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  onCategorySelect,
  placeholder = 'Search products...',
  onFocus,
  navigateToSearch = false,
}) => {
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

  const handleCameraPress = () => {
    // Placeholder for image search functionality
    console.log('Camera search pressed');
    Keyboard.dismiss();
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
        
        {/* Action Buttons - Camera and Search (Temu Style) */}
        <View style={styles.actionButtonsContainer}>
          {/* Camera Button */}
          <TouchableOpacity 
            onPress={handleCameraPress} 
            style={styles.cameraButton}
            activeOpacity={0.7}
          >
            <Ionicons 
              name="camera-outline" 
              size={22} 
              color={Colors.primary} 
            />
          </TouchableOpacity>
          
          {/* Search Button - Circular */}
          <TouchableOpacity 
            onPress={handleSearchSubmit} 
            style={styles.searchButton}
            activeOpacity={0.7}
          >
            <Ionicons 
              name="search" 
              size={20} 
              color={Colors.white} 
            />
          </TouchableOpacity>
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
    gap: 8,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 10 : 8,
    minHeight: 44,
    maxHeight: 44,
    borderWidth: 0.5,
    borderColor: '#e0e0e0',
  },
  searchInputContainerFocused: {
    borderColor: Colors.secondary,
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
    gap: 8,
  },
  cameraButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22,
  },
  searchButton: {
    backgroundColor: Colors.primary,
    borderRadius: 22,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: Colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 3,
      },
      android: {
        elevation: 3,
      },
    }),
  },
});

export default SearchBar;
