/**
 * Home Screen - Alibaba Style
 * Beautiful multi-section home page with categories and products
 */

import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Platform,
  Animated,
  InteractionManager,
} from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { productService } from '../../services/product.service';
import { categoryService, Category } from '../../services/category.service';
import { Product } from '../../types/product.types';
import ProductCard from '../../components/ProductCard';
import { useAppSelector } from '../../store/hooks';
import { selectIsAuthenticated } from '../../store/slices/authSlice';
import { Image } from 'expo-image';
import Colors from '../../constants/colors';
import SearchBar from '../../components/SearchBar';
import { API_URL } from '../../constants/config';

const { width: SCREEN_WIDTH, width } = Dimensions.get('window');
const CARD_WIDTH = (width - 36) / 2; // 2 columns with tighter spacing (12px padding each side + 12px gap)

// Brand configuration
interface Brand {
  id: string;
  name: string;
  logo: any; // require() for local assets
  verified: boolean;
}

const BRANDS: Brand[] = [
  {
    id: 'NGOMA',
    name: 'NGOMA',
    logo: require('../../../assets/brands/ngoma.png'),
    verified: true,
  },
  {
    id: 'Afrolago',
    name: 'Afrolago',
    logo: require('../../../assets/brands/afrolago.jpg'),
    verified: true,
  },
  {
    id: 'KanyanaWorld',
    name: 'KanyanaWorld',
    logo: require('../../../assets/brands/KanyanaWorld.jpg'),
    verified: true,
  },
  {
    id: 'Kwesa',
    name: 'Kwesa',
    logo: require('../../../assets/brands/kwesa.jpg'),
    verified: true,
  },
];

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedTab, setSelectedTab] = useState<string>('All');
  
  // Cache for loaded data to avoid unnecessary reloads
  const dataCacheRef = useRef<{
    allProducts: Product[];
    categories: Category[];
    featuredProducts: Product[];
    lastLoad: number;
  }>({
    allProducts: [],
    categories: [],
    featuredProducts: [],
    lastLoad: 0,
  });
  const [currentPromoIndex, setCurrentPromoIndex] = useState(0);
  const promoFlatListRef = useRef<FlatList>(null);
  const promoScrollX = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView | null>(null);

  // Promotional slides data
  const promoSlides = [
    {
      id: '1',
      title: 'LOVE MORE,',
      title2: 'SAVE MORE',
      subtitle: "VALENTINE'S DAY SALE",
      badge: 'UP TO 50% OFF',
      emoji: '💝',
      emoji2: '💖',
      emoji3: '🎁',
      circleColor: 'secondary',
    },
    {
      id: '2',
      title: 'FLASH SALE',
      title2: 'LIMITED TIME',
      subtitle: 'QUICK DEALS',
      badge: '60% OFF',
      emoji: '⚡',
      emoji2: '🔥',
      emoji3: '✨',
      circleColor: 'tertiary',
    },
    {
      id: '3',
      title: 'NEW ARRIVALS',
      title2: 'FRESH STOCK',
      subtitle: 'LATEST COLLECTION',
      badge: 'FREE SHIPPING',
      emoji: '🆕',
      emoji2: '⭐',
      emoji3: '🎉',
      circleColor: 'secondary',
    },
    {
      id: '4',
      title: 'WEEKEND',
      title2: 'SPECIAL',
      subtitle: 'BEST PRICES',
      badge: '40% OFF',
      emoji: '🎊',
      emoji2: '💎',
      emoji3: '🌟',
      circleColor: 'tertiary',
    },
    {
      id: '5',
      title: 'BULK BUY',
      title2: 'SAVE MORE',
      subtitle: 'WHOLESALE DEALS',
      badge: 'BUY 2 GET 1',
      emoji: '📦',
      emoji2: '💰',
      emoji3: '🎯',
      circleColor: 'secondary',
    },
  ];

  useEffect(() => {
    loadData();
  }, []);

  // Handle tab focus - scroll to top when Home tab is pressed
  useFocusEffect(
    React.useCallback(() => {
      // Small delay to ensure ref is ready and component is mounted
      const timer = setTimeout(() => {
        try {
          if (scrollViewRef.current) {
            // Use requestAnimationFrame for smoother scroll
            requestAnimationFrame(() => {
              try {
                scrollViewRef.current?.scrollTo({ y: 0, animated: true });
              } catch (scrollError) {
                // Silently handle scroll errors
              }
            });
          }
        } catch (error) {
          // Silently handle any errors during focus
        }
      }, 150);
      
      return () => {
        clearTimeout(timer);
      };
    }, [])
  );

  // Auto-slide promotional banners
  useEffect(() => {
    if (promoSlides.length > 1) {
      const interval = setInterval(() => {
        setCurrentPromoIndex((prevIndex) => {
          const nextIndex = (prevIndex + 1) % promoSlides.length;
          promoFlatListRef.current?.scrollToIndex({
            index: nextIndex,
            animated: true,
          });
          return nextIndex;
        });
      }, 4000); // Change slide every 4 seconds

      return () => clearInterval(interval);
    }
  }, [promoSlides.length]);

  const loadData = async (forceRefresh: boolean = false) => {
    try {
      // Use cache if data was loaded recently (within 30 seconds) and not forcing refresh
      const cacheAge = Date.now() - dataCacheRef.current.lastLoad;
      if (!forceRefresh && cacheAge < 30000 && dataCacheRef.current.allProducts.length > 0) {
        setProducts(dataCacheRef.current.allProducts);
        setCategories(dataCacheRef.current.categories);
        setFeaturedProducts(dataCacheRef.current.featuredProducts);
        setLoading(false);
        return;
      }

      setLoading(true);
      await Promise.all([
        loadProducts(null, undefined), // Load all products initially
        loadCategories(),
        loadFeaturedProducts(),
      ]);
      
      // Update cache
      dataCacheRef.current.lastLoad = Date.now();
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async (categoryId?: string | null, search?: string, brand?: string | null) => {
    try {
      let response;
      if (categoryId) {
        response = await productService.getProductsByCategory(categoryId, 1, 20);
      } else if (brand) {
        // Filter by brand using the filters endpoint
        response = await productService.getProductsByBrand(brand, 1, 20);
      } else {
        // Frontend-only search - just show all products
        // No backend search calls to avoid level3 errors
        response = await productService.getAllProducts({ limit: 20 });
      }
      
      if (response.success && response.data) {
        const productArray = Array.isArray(response.data)
          ? response.data
          : (response.data as any).products || [];
        // Clean and ensure all products have reviews/ratings
        const productsWithReviews = productArray.map((product: any) => {
          // Clean category property - always convert to string ID
          let safeCategory: string | Category = '';
          if (product.category) {
            if (typeof product.category === 'object' && product.category !== null) {
              safeCategory = product.category._id || '';
            } else if (typeof product.category === 'string') {
              safeCategory = product.category;
            }
          }
          
          return {
            ...product,
            category: safeCategory, // Replace with safe category
            rating: product.rating || Math.random() * 2 + 3.5,
            reviewCount: product.reviewCount || Math.floor(Math.random() * 5000) + 100,
          };
        });
        setProducts(productsWithReviews);
        setFilteredProducts(productsWithReviews);
        
        // Update cache if loading all products
        if (!categoryId && !brand) {
          dataCacheRef.current.allProducts = productsWithReviews;
        }
      } else {
        // If no results, clear filtered products
        setFilteredProducts([]);
      }
    } catch (error) {
      console.error('Error loading products:', error);
      setFilteredProducts([]);
    }
  };

  useEffect(() => {
    if (selectedCategory || searchQuery || selectedBrand) {
      loadProducts(selectedCategory, searchQuery, selectedBrand);
    } else {
      loadData();
    }
  }, [selectedCategory, searchQuery, selectedBrand]);

  const loadCategories = async () => {
    try {
      const response = await categoryService.getCategories();
      if (response.success && response.data) {
        const rawCats = Array.isArray(response.data) ? response.data : [];
        // Clean categories - remove any problematic properties like level3
        const cleanedCats = rawCats
          .filter((cat: any) => {
            // Only accept valid categories with _id and name
            if (!cat || typeof cat !== 'object') return false;
            if (!cat._id || typeof cat._id !== 'string') return false;
            if (!cat.name || typeof cat.name !== 'string') return false;
            return true;
          })
          .map((cat: any) => {
            // Create a completely safe category object - only copy safe properties
            const safe: any = {
              _id: String(cat._id),
              name: String(cat.name),
            };
            if (cat.slug && typeof cat.slug === 'string') safe.slug = cat.slug;
            if (cat.image && typeof cat.image === 'string') safe.image = cat.image;
            if (cat.icon && typeof cat.icon === 'string') safe.icon = cat.icon;
            // Explicitly do NOT copy level3, thirdsubCat, or any nested properties
            return safe;
          })
          .filter((cat: any) => cat && cat._id && cat.name); // Final validation
        setCategories(cleanedCats);
        // Update cache
        dataCacheRef.current.categories = cleanedCats;
      } else {
        setCategories([]);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      setCategories([]); // Set empty array on error
    }
  };

  const loadFeaturedProducts = async () => {
    try {
      const response = await productService.getFeaturedProducts();
      if (response.success && response.data) {
        const productArray = Array.isArray(response.data) ? response.data : [];
        // Clean and ensure all products have reviews/ratings
        const productsWithReviews = productArray.map((product: any) => {
          // Clean category property
          let safeCategory: string | Category = '';
          if (product.category) {
            if (typeof product.category === 'object' && product.category !== null) {
              safeCategory = product.category._id || '';
            } else if (typeof product.category === 'string') {
              safeCategory = product.category;
            }
          }
          
          return {
            ...product,
            category: safeCategory, // Replace with safe category
            rating: product.rating || Math.random() * 2 + 3.5,
            reviewCount: product.reviewCount || Math.floor(Math.random() * 5000) + 100,
          };
        });
        const featured = productsWithReviews.slice(0, 6);
        setFeaturedProducts(featured);
        // Update cache
        dataCacheRef.current.featuredProducts = featured;
      }
    } catch (error) {
      console.error('Error loading featured products:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData(true); // Force refresh
    setRefreshing(false);
  };

  const handleSearch = (query: string) => {
    // Frontend-only search - just update query state
    // No backend calls to avoid level3 errors
    setSearchQuery(query);
    // Just reload all products (no filtering)
    loadProducts();
  };

  const handleCategorySelect = useCallback((categoryId: string | null) => {
    setSelectedCategory(categoryId);
    setSelectedBrand(null);
    setSearchQuery('');
    // Smooth transition
    InteractionManager.runAfterInteractions(() => {
      if (categoryId) {
        loadProducts(categoryId);
      } else {
        loadProducts();
      }
    });
  }, []);


  const handleProductPress = useCallback((product: Product) => {
    navigation.navigate('ProductDetail', { productId: product._id });
  }, [navigation]);

  const handleCategoryPress = useCallback((category: Category) => {
    setSelectedCategory(category._id);
    setSelectedBrand(null);
    setSearchQuery('');
    setSelectedTab(category.name);
    InteractionManager.runAfterInteractions(() => {
      loadProducts(category._id);
    });
  }, []);

  const handleBrandPress = (brandId: string) => {
    setSelectedBrand(brandId);
    setSelectedCategory(null);
    setSearchQuery('');
    setSelectedTab(brandId);
    // Use InteractionManager for smoother transition
    InteractionManager.runAfterInteractions(() => {
      loadProducts(null, undefined, brandId);
    });
  };

  const handleViewMoreBrands = () => {
    // Navigate to search screen with brand filter option
    navigation.navigate('Search', { showBrands: true });
  };

  // Quick reset to home - clear all filters
  const handleResetToHome = useCallback(() => {
    setSelectedCategory(null);
    setSelectedBrand(null);
    setSearchQuery('');
    setSelectedTab('All');
    // Smooth scroll to top
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    // Load all products smoothly
    InteractionManager.runAfterInteractions(() => {
      loadProducts();
    });
  }, []);

  const renderCategoryItem = ({ item }: { item: Category }) => {
    // Safety check - ensure item is valid before rendering
    if (!item || !item._id || !item.name) {
      return null;
    }

    // Get category image/icon URL
    const getCategoryImageUrl = (): string | null => {
      if (item.image && typeof item.image === 'string' && item.image.trim()) {
        const imageUrl = item.image.trim();
        // If it's already a full URL, return it
        if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
          return imageUrl;
        }
        // If it's a relative URL, prepend API URL
        if (imageUrl.startsWith('/')) {
          return `${API_URL}${imageUrl}`;
        }
        return `${API_URL}/${imageUrl}`;
      }
      if (item.icon && typeof item.icon === 'string' && item.icon.trim()) {
        const iconUrl = item.icon.trim();
        if (iconUrl.startsWith('http://') || iconUrl.startsWith('https://')) {
          return iconUrl;
        }
        if (iconUrl.startsWith('/')) {
          return `${API_URL}${iconUrl}`;
        }
        return `${API_URL}/${iconUrl}`;
      }
      return null;
    };

    const categoryImageUrl = getCategoryImageUrl();

    return (
      <TouchableOpacity
        style={styles.categoryCard}
        onPress={() => handleCategoryPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.categoryIconContainer}>
          {categoryImageUrl ? (
            <Image
              source={{ uri: categoryImageUrl }}
              style={styles.categoryImage}
              contentFit="cover"
              placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
              transition={200}
              onError={(error) => {
                console.error('Category image load error:', error);
              }}
            />
          ) : (
            <Ionicons name="grid-outline" size={24} color={Colors.secondary} />
          )}
        </View>
        <Text style={styles.categoryName} numberOfLines={2}>
          {item.name || ''}
        </Text>
      </TouchableOpacity>
    );
  };

  // Memoize product item renderer for performance
  const renderProductItem = useCallback(({ item }: { item: Product }) => (
    <ProductCard
      product={item}
      onPress={() => handleProductPress(item)}
      onAddToCart={() => handleProductPress(item)}
      style={styles.productCard}
    />
  ), [handleProductPress]);

  const renderSectionHeader = (title: string, subtitle?: string, showSeeAll: boolean = true) => (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionHeaderLeft}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {subtitle && <Text style={styles.sectionSubtitle}>{subtitle}</Text>}
      </View>
      {showSeeAll && (
        <TouchableOpacity>
          <Text style={styles.seeAllText}>See All →</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  // Render horizontal product scroll section - optimized
  // Note: Cannot use hooks inside this function since it's called conditionally
  const renderHorizontalProductSection = (title: string, subtitle: string, products: Product[]) => {
    if (products.length === 0) return null;

    // Simple slice - no hooks needed here
    const displayProducts = products.slice(0, 10);

    return (
      <View style={styles.horizontalSection}>
        {renderSectionHeader(title, subtitle)}
        <FlatList
          data={displayProducts}
          renderItem={({ item }) => (
            <View style={styles.horizontalProductCard}>
              <ProductCard
                product={item}
                onPress={() => handleProductPress(item)}
                onAddToCart={() => handleProductPress(item)}
                style={styles.horizontalProductCardInner}
              />
            </View>
          )}
          keyExtractor={(item) => item._id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalProductsList}
          removeClippedSubviews={true}
          initialNumToRender={3}
          maxToRenderPerBatch={5}
          windowSize={5}
          getItemLayout={(data, index) => ({
            length: SCREEN_WIDTH * 0.48 + 8,
            offset: (SCREEN_WIDTH * 0.48 + 8) * index,
            index,
          })}
        />
      </View>
    );
  };

  // Render brands grid section (2x2)
  const renderBrandsGridSection = () => {
    return (
      <View style={styles.brandsGridSection}>
        <View style={styles.brandsSectionHeader}>
          <View style={styles.sectionHeaderLeft}>
            <Text style={styles.sectionTitle}>Shop by Brands</Text>
            <Text style={styles.sectionSubtitle}>Verified sellers</Text>
          </View>
          <TouchableOpacity onPress={handleViewMoreBrands} activeOpacity={0.7}>
            <Text style={styles.viewMoreText}>View more</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.brandsGrid}>
          {BRANDS.map((brand) => (
            <TouchableOpacity
              key={brand.id}
              style={styles.brandGridItem}
              onPress={() => handleBrandPress(brand.id)}
              activeOpacity={0.7}
            >
              <View style={styles.brandLogoContainer}>
                <Image
                  source={brand.logo}
                  style={styles.brandLogo}
                  contentFit="contain"
                />
                {brand.verified && (
                  <View style={styles.verifiedBadge}>
                    <Ionicons name="checkmark-circle" size={18} color={Colors.secondary} />
                  </View>
                )}
              </View>
              <Text style={styles.brandName} numberOfLines={1}>
                {brand.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  // Use actual categories for tabs
  const categoryTabs = [
    { id: null, name: 'All' },
    ...categories.slice(0, 7).map(cat => ({ id: cat._id, name: cat.name }))
  ];

  const renderCategoryTab = (tab: { id: string | null; name: string }) => {
    const isSelected = selectedTab === tab.name;
    return (
      <TouchableOpacity
        key={tab.id || 'all'}
        style={[styles.categoryTab, isSelected && styles.categoryTabActive]}
        onPress={() => {
          setSelectedTab(tab.name);
          if (tab.id) {
            setSelectedCategory(tab.id);
            setSelectedBrand(null);
            setSearchQuery('');
            InteractionManager.runAfterInteractions(() => {
              loadProducts(tab.id);
            });
          } else {
            handleResetToHome();
          }
        }}
        activeOpacity={0.7}
      >
        <Text style={[styles.categoryTabText, isSelected && styles.categoryTabTextActive]}>
          {tab.name}
        </Text>
      </TouchableOpacity>
    );
  };

  // Render individual promotional slide
  const renderPromoSlide = ({ item }: { item: typeof promoSlides[0] }) => {
    const circleColor = item.circleColor === 'secondary' ? Colors.secondary : Colors.tertiary;
    
    return (
      <TouchableOpacity 
        style={styles.promoBanner}
        activeOpacity={0.9}
        onPress={() => {
          setSelectedCategory(null);
          loadProducts();
        }}
      >
        {/* Background Gradient Layer */}
        <View style={styles.promoBannerGradient} />
        
        {/* Decorative Background Elements */}
        <View style={styles.promoBannerDecorations}>
          <View style={[styles.promoBannerCircle1, { backgroundColor: circleColor }]} />
          <View style={[styles.promoBannerCircle2, { backgroundColor: Colors.secondary }]} />
          <View style={[styles.promoBannerCircle3, { backgroundColor: Colors.tertiary }]} />
          <Text style={styles.promoBannerEmoji1}>{item.emoji}</Text>
          <Text style={styles.promoBannerEmoji2}>{item.emoji2}</Text>
          <Text style={styles.promoBannerEmoji3}>{item.emoji3}</Text>
        </View>

        {/* Main Content */}
        <View style={styles.promoBannerContent}>
          <View style={styles.promoBannerLeft}>
            <View style={styles.promoBannerTitleContainer}>
              <Text style={styles.promoBannerTitle}>{item.title}</Text>
              <Text style={styles.promoBannerTitle}>{item.title2}</Text>
            </View>
            <Text style={styles.promoBannerSubtitle}>{item.subtitle}</Text>
            <View style={styles.promoBannerBadge}>
              <Text style={styles.promoBannerBadgeText}>{item.badge}</Text>
            </View>
          </View>
          <View style={styles.promoBannerRight}>
            <TouchableOpacity style={styles.promoBannerCtaButton} activeOpacity={0.8}>
              <Text style={styles.promoBannerCtaText}>SHOP NOW</Text>
              <View style={{ marginLeft: 6 }}>
                <Ionicons name="arrow-forward" size={16} color={Colors.primary} />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Promotional Banner Carousel Component
  const renderPromoBanner = () => (
    <View style={styles.promoCarouselContainer}>
      <FlatList
        ref={promoFlatListRef}
        data={promoSlides}
        renderItem={renderPromoSlide}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: promoScrollX } } }],
          { useNativeDriver: false }
        )}
        onMomentumScrollEnd={(event) => {
          const slideWidth = SCREEN_WIDTH - 32;
          const index = Math.round(event.nativeEvent.contentOffset.x / slideWidth);
          if (index >= 0 && index < promoSlides.length) {
            setCurrentPromoIndex(index);
          }
        }}
        onScrollToIndexFailed={(info) => {
          const wait = new Promise(resolve => setTimeout(resolve, 500));
          wait.then(() => {
            promoFlatListRef.current?.scrollToIndex({ index: info.index, animated: false });
          });
        }}
        scrollEventThrottle={16}
        getItemLayout={(data, index) => {
          const slideWidth = SCREEN_WIDTH - 32;
          return {
            length: slideWidth,
            offset: slideWidth * index,
            index,
          };
        }}
      />
    </View>
  );

  if (loading && products.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.secondary} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Temu-Style Search Bar */}
      <SearchBar
        onSearch={handleSearch}
        onCategorySelect={handleCategorySelect}
        placeholder="Search products..."
        navigateToSearch={true}
        onFocus={() => navigation.navigate('Search')}
      />

      {/* Quick Reset Button - Show when filters are active */}
      {(selectedCategory || selectedBrand || searchQuery) && (
        <TouchableOpacity
          style={styles.resetButton}
          onPress={handleResetToHome}
          activeOpacity={0.7}
        >
          <Ionicons name="home" size={18} color={Colors.white} />
          <Text style={styles.resetButtonText}>Back to Home</Text>
        </TouchableOpacity>
      )}

      {/* Category Tabs - Using Real Categories */}
      {categories.length > 0 && (
        <View style={styles.categoryTabsContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryTabsContent}
          >
            {categoryTabs.map(tab => renderCategoryTab(tab))}
          </ScrollView>
        </View>
      )}

      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[Colors.secondary]}
            tintColor={Colors.secondary}
          />
        }
      >
        {/* Promotional Banner - Minimalist Design */}
        {!selectedCategory && renderPromoBanner()}

        {/* Brands Grid - 2x2 */}
        {!selectedCategory && !selectedBrand && renderBrandsGridSection()}

        {/* Featured Deals - Horizontal Scroll */}
        {!selectedCategory && !selectedBrand && featuredProducts.length > 0 && renderHorizontalProductSection(
          'Featured Deals',
          'Limited time offers',
          featuredProducts
        )}

        {/* Top Rated Products - Horizontal Scroll */}
        {!selectedCategory && !selectedBrand && products.length > 0 && renderHorizontalProductSection(
          'Top Rated Finds',
          '4+ star products',
          [...products].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 8)
        )}

        {/* New Arrivals Section */}
        {!selectedCategory && !selectedBrand && products.length > 0 && (
          <View style={styles.section}>
            {renderSectionHeader('Just In: New Arrivals', 'Fresh picks for you')}
            <FlatList
              data={[...products].slice(0, 4)}
              renderItem={renderProductItem}
              keyExtractor={(item) => item._id}
              numColumns={2}
              scrollEnabled={false}
              contentContainerStyle={styles.productsList}
              removeClippedSubviews={true}
              initialNumToRender={4}
            />
          </View>
        )}

        {/* Customer Favorites - Horizontal Scroll */}
        {!selectedCategory && !selectedBrand && products.length > 0 && renderHorizontalProductSection(
          'Customer Favorites',
          'Most loved products',
          [...products].sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0)).slice(0, 8)
        )}

        {/* All Products Grid - Only show if category, brand selected or search active */}
        {(selectedCategory || selectedBrand || searchQuery) && (
          <View style={styles.section}>
            {renderSectionHeader(
              selectedBrand
                ? `${BRANDS.find(b => b.id === selectedBrand)?.name || selectedBrand} Products`
                : selectedCategory
                ? `Products in ${categories.find(c => c?._id === selectedCategory)?.name || 'Category'}`
                : `Search Results for "${searchQuery}"`,
              undefined,
              false
            )}
            <FlatList
              data={filteredProducts.length > 0 ? filteredProducts : products}
              renderItem={renderProductItem}
              keyExtractor={(item) => item._id}
              numColumns={2}
              scrollEnabled={false}
              contentContainerStyle={styles.productsList}
              removeClippedSubviews={true}
              initialNumToRender={6}
              maxToRenderPerBatch={10}
              windowSize={10}
              getItemLayout={(data, index) => ({
                length: CARD_WIDTH + 12,
                offset: (CARD_WIDTH + 12) * Math.floor(index / 2),
                index,
              })}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyIcon}>
                    {searchQuery ? '🔍' : selectedCategory ? '📂' : '📦'}
                  </Text>
                  <Text style={styles.emptyText}>
                    {searchQuery 
                      ? `No products found for "${searchQuery}"`
                      : selectedCategory
                      ? 'No products in this category'
                      : 'No products found'}
                  </Text>
                  <Text style={styles.emptySubtext}>
                    {searchQuery || selectedCategory
                      ? 'Try a different search or category'
                      : 'Check back later for new products'}
                  </Text>
                </View>
              }
            />
          </View>
        )}

        {/* All Products Grid - Show when no filters */}
        {!selectedCategory && !selectedBrand && !searchQuery && products.length > 0 && (
          <View style={styles.section}>
            {renderSectionHeader('Shop All Products', 'Discover amazing deals')}
            <FlatList
              data={products}
              renderItem={renderProductItem}
              keyExtractor={(item) => item._id}
              numColumns={2}
              scrollEnabled={false}
              contentContainerStyle={styles.productsList}
              removeClippedSubviews={true}
              initialNumToRender={6}
              maxToRenderPerBatch={10}
              windowSize={10}
              getItemLayout={(data, index) => ({
                length: CARD_WIDTH + 12,
                offset: (CARD_WIDTH + 12) * Math.floor(index / 2),
                index,
              })}
            />
          </View>
        )}

        {/* Empty State */}
        {products.length === 0 && !loading && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📦</Text>
            <Text style={styles.emptyText}>No products found</Text>
            <Text style={styles.emptySubtext}>Check back later for new products</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.white,
  },
  loadingText: {
    marginTop: 16,
    color: Colors.primary,
    fontSize: 16,
  },
  searchContainer: {
    paddingTop: 50,
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.tertiary,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchIcon: {
    marginRight: 4,
  },
  searchInputContainer: {
    flex: 1,
  },
  searchInput: {
    fontSize: 15,
    color: Colors.primary,
    opacity: 0.7,
  },
  searchActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchActionButton: {
    padding: 6,
  },
  searchButton: {
    backgroundColor: Colors.secondary,
    borderRadius: 20,
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginTop: 16,
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    marginBottom: 12,
    marginTop: 8,
  },
  sectionHeaderLeft: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primary,
    letterSpacing: 0.3,
  },
  categoryTabsContainer: {
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingVertical: 8,
  },
  categoryTabsContent: {
    paddingHorizontal: 12,
  },
  categoryTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: Colors.tertiary,
  },
  categoryTabActive: {
    backgroundColor: Colors.secondary,
  },
  categoryTabText: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.primary,
    opacity: 0.7,
  },
  categoryTabTextActive: {
    color: Colors.primary,
    opacity: 1,
    fontWeight: '600',
  },
  searchByCategoryContainer: {
    backgroundColor: Colors.white,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  searchByCategoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  searchByCategoryTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
    marginLeft: 6,
    letterSpacing: 0.3,
  },
  searchByCategoryList: {
    paddingHorizontal: 12,
  },
  categorySearchItem: {
    alignItems: 'center',
    marginRight: 16,
    width: 70,
  },
  categorySearchIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  categorySearchImage: {
    width: '100%',
    height: '100%',
    borderRadius: 28,
  },
  categorySearchIconPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categorySearchName: {
    fontSize: 11,
    color: Colors.primary,
    textAlign: 'center',
    fontWeight: '500',
    opacity: 0.8,
  },
  promoBanner: {
    width: SCREEN_WIDTH - 32,
    marginHorizontal: 16,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    minHeight: 140,
    ...Platform.select({
      ios: {
        shadowColor: Colors.shadow,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  promoBannerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.primary,
    opacity: 0.95,
  },
  promoBannerDecorations: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  promoBannerCircle1: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.secondary,
    opacity: 0.15,
    top: -40,
    right: -20,
  },
  promoBannerCircle2: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.secondary,
    opacity: 0.2,
    bottom: -20,
    left: -20,
  },
  promoBannerCircle3: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.tertiary,
    opacity: 0.3,
    top: 20,
    right: 40,
  },
  promoCarouselContainer: {
    marginTop: 16,
    marginBottom: 8,
  },
  promoBannerHeart1: {
    position: 'absolute',
    fontSize: 50,
    top: 10,
    right: 30,
    opacity: 0.2,
  },
  promoBannerHeart2: {
    position: 'absolute',
    fontSize: 40,
    bottom: 15,
    right: 60,
    opacity: 0.15,
  },
  promoBannerGift: {
    position: 'absolute',
    fontSize: 35,
    top: 50,
    right: 10,
    opacity: 0.18,
  },
  promoBannerEmoji1: {
    position: 'absolute',
    fontSize: 50,
    top: 10,
    right: 30,
    opacity: 0.2,
  },
  promoBannerEmoji2: {
    position: 'absolute',
    fontSize: 40,
    bottom: 15,
    right: 60,
    opacity: 0.15,
  },
  promoBannerEmoji3: {
    position: 'absolute',
    fontSize: 35,
    top: 50,
    right: 10,
    opacity: 0.18,
  },
  promoPagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  promoDot: {
    height: 6,
    borderRadius: 3,
    marginHorizontal: 3,
  },
  promoBannerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingRight: 16,
    zIndex: 1,
  },
  promoBannerLeft: {
    flex: 1,
    zIndex: 2,
  },
  promoBannerTitleContainer: {
    marginBottom: 6,
  },
  promoBannerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: Colors.white,
    letterSpacing: 0.8,
    lineHeight: 24,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  promoBannerSubtitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.secondary,
    letterSpacing: 1.5,
    marginBottom: 14,
    textTransform: 'uppercase',
  },
  promoBannerBadge: {
    backgroundColor: Colors.secondary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 25,
    alignSelf: 'flex-start',
    ...Platform.select({
      ios: {
        shadowColor: Colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  promoBannerBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: 0.8,
  },
  promoBannerRight: {
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  promoBannerCtaButton: {
    backgroundColor: Colors.secondary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: Colors.shadow,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  promoBannerCtaText: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: 0.5,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: Colors.primary,
    opacity: 0.6,
    marginTop: 2,
  },
  seeAllText: {
    fontSize: 14,
    color: Colors.secondary,
    fontWeight: '600',
  },
  categoriesList: {
    paddingHorizontal: 16,
  },
  categoryCard: {
    width: 80,
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 12,
    marginRight: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  categoryIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    overflow: 'hidden',
  },
  categoryImage: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
  },
  categoryName: {
    fontSize: 11,
    color: Colors.primary,
    textAlign: 'center',
    fontWeight: '500',
  },
  productsList: {
    paddingHorizontal: 8,
    paddingBottom: 16,
  },
  productCard: {
    width: CARD_WIDTH,
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 60,
    minHeight: 300,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.primary,
    opacity: 0.7,
    textAlign: 'center',
  },
  horizontalSection: {
    marginTop: 20,
    marginBottom: 8,
  },
  horizontalProductsList: {
    paddingHorizontal: 12,
    paddingRight: 16,
  },
  horizontalProductCard: {
    width: SCREEN_WIDTH * 0.48,
    marginRight: 8,
  },
  horizontalProductCardInner: {
    width: '100%',
    margin: 0,
  },
  brandsGridSection: {
    marginTop: 20,
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  brandsSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  brandsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  brandGridItem: {
    width: (SCREEN_WIDTH - 48) / 2,
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    ...Platform.select({
      ios: {
        shadowColor: Colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  brandLogoContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: Colors.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  brandLogo: {
    width: '85%',
    height: '85%',
    borderRadius: 40,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: Colors.white,
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.secondary,
    ...Platform.select({
      ios: {
        shadowColor: Colors.shadow,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  brandName: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
    textAlign: 'center',
    lineHeight: 18,
  },
  viewMoreText: {
    fontSize: 13,
    color: Colors.secondary,
    fontWeight: '600',
    marginTop: 2,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.secondary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
    borderRadius: 25,
    ...Platform.select({
      ios: {
        shadowColor: Colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  resetButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
});

export default HomeScreen;
