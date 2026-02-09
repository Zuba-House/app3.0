/**
 * Product Data Normalizer
 * Handles backward compatibility between old and new product model structures
 */

export const normalizeProduct = (product) => {
  if (!product) return null;

  // Normalize images (handle both string array and object array)
  const getImages = () => {
    if (!product.images || product.images.length === 0) {
      return product.bannerimages || [];
    }
    
    // Filter out any null/undefined entries
    const validImages = product.images.filter(img => img != null);
    
    if (validImages.length === 0) {
      return product.bannerimages || [];
    }
    
    // If images is array of strings (old format)
    if (typeof validImages[0] === 'string') {
      return validImages;
    }
    
    // If images is array of objects (new format)
    return validImages.map(img => {
      if (typeof img === 'string') return img;
      if (typeof img === 'object' && img.url) return img.url;
      return '';
    }).filter(url => url !== '');
  };

  // Get featured image
  const getFeaturedImage = () => {
    // If featuredImage is explicitly set (even if empty string), use it
    if (product.featuredImage !== undefined && product.featuredImage !== null) {
      return product.featuredImage || '';
    }
    
    // Check if there's a featured image in the images array
    if (product.images && product.images.length > 0) {
      const featuredImg = product.images.find(img => 
        (typeof img === 'object' && img.isFeatured) || 
        (typeof img === 'object' && img.position === 0)
      );
      if (featuredImg) {
        return typeof featuredImg === 'string' ? featuredImg : featuredImg.url;
      }
    }
    
    const images = getImages();
    if (images.length > 0) {
      return typeof images[0] === 'string' ? images[0] : (images[0]?.url || '');
    }
    return '';
  };

  // Normalize pricing
  const getPrice = () => {
    // New structure
    if (product.pricing) {
      return product.pricing.price || product.pricing.regularPrice || 0;
    }
    // Old structure
    return product.price || 0;
  };

  const getOldPrice = () => {
    // New structure
    if (product.pricing) {
      return product.pricing.regularPrice || product.pricing.price || 0;
    }
    // Old structure
    return product.oldPrice || product.price || 0;
  };

  const getSalePrice = () => {
    // New structure
    if (product.pricing && product.pricing.salePrice) {
      return product.pricing.salePrice;
    }
    // Old structure - if price < oldPrice, price is sale price
    if (product.oldPrice && product.price < product.oldPrice) {
      return product.price;
    }
    return null;
  };

  const isOnSale = () => {
    // New structure
    if (product.pricing) {
      return product.pricing.onSale || false;
    }
    // Old structure
    return product.oldPrice && product.price < product.oldPrice;
  };

  // Normalize stock
  const getStock = () => {
    // Check multiple possible locations for stock
    if (product.inventory?.stock !== undefined) {
      return product.inventory.stock;
    }
    if (product.countInStock !== undefined) {
      return product.countInStock;
    }
    if (product.stock !== undefined) {
      return product.stock;
    }
    // Default to 1 if no stock info (assume in stock)
    return 1;
  };

  const getStockStatus = () => {
    // Check inventory stockStatus
    if (product.inventory?.stockStatus) {
      return product.inventory.stockStatus;
    }
    // Check top-level stockStatus
    if (product.stockStatus) {
      return product.stockStatus;
    }
    // Infer from stock count
    const stock = getStock();
    return stock > 0 ? 'in_stock' : 'out_of_stock';
  };

  // Normalize categories
  const getCategories = () => {
    if (product.categories && product.categories.length > 0) {
      return product.categories;
    }
    if (product.category) {
      return [product.category];
    }
    return [];
  };

  return {
    ...product,
    // Images
    images: getImages(),
    featuredImage: getFeaturedImage(),
    // Pricing
    price: getPrice(),
    oldPrice: getOldPrice(),
    salePrice: getSalePrice(),
    isOnSale: isOnSale(),
    // Stock
    countInStock: getStock(),
    stock: getStock(),
    stockStatus: getStockStatus(),
    // Categories
    categories: getCategories(),
    // SEO
    slug: product.seo?.slug || product.slug || null,
    // Status
    status: product.status || 'published',
    visibility: product.visibility || 'visible',
    // Product type
    productType: product.productType || 'simple',
    // Variations & Attributes (preserve for variable products)
    variations: product.variations || [],
    attributes: product.attributes || [],
    // Rating
    rating: product.rating || product.ratingSummary?.average || 0,
    reviewsCount: product.reviewsCount || 0
  };
};

export const normalizeProductList = (products) => {
  if (!products || !Array.isArray(products)) return [];
  return products.map(normalizeProduct);
};

