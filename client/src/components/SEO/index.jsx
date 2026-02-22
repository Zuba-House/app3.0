import React from 'react';
import { Helmet } from 'react-helmet-async';

const SITE_URL = 'https://zubahouse.com';
const DEFAULT_TITLE = 'Zuba House - African Fashion, Clothing & Accessories';
const DEFAULT_DESCRIPTION = 'Discover authentic African fashion at Zuba House. Shop our curated collection of traditional and modern African clothing, accessories, and handcrafted products.';
const DEFAULT_IMAGE = `${SITE_URL}/logo.jpg`;

/**
 * SEO Component - Handles all SEO meta tags for pages
 */
export const SEO = ({
  title,
  description = DEFAULT_DESCRIPTION,
  keywords = [],
  image = DEFAULT_IMAGE,
  url,
  type = 'website',
  noIndex = false,
  children
}) => {
  const fullTitle = title ? `${title} | Zuba House` : DEFAULT_TITLE;
  const pageUrl = url ? `${SITE_URL}${url}` : SITE_URL;
  
  const defaultKeywords = [
    'African fashion',
    'African clothing',
    'African accessories',
    'African dresses',
    'traditional African wear',
    'modern African fashion',
    'African prints',
    'Ankara fashion',
    'Zuba House'
  ];
  
  const allKeywords = [...new Set([...defaultKeywords, ...keywords])].join(', ');

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      <meta name="keywords" content={allKeywords} />
      
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
      {!noIndex && <meta name="robots" content="index, follow" />}
      
      {/* Canonical URL */}
      <link rel="canonical" href={pageUrl} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={pageUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="Zuba House" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={pageUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      
      {children}
    </Helmet>
  );
};

/**
 * ProductSEO - Specialized SEO component for product pages with JSON-LD
 */
export const ProductSEO = ({ product, url }) => {
  if (!product) return null;

  const productName = product.name || product.productTitle || 'Product';
  const productDescription = product.shortDescription || product.description?.substring(0, 160) || DEFAULT_DESCRIPTION;
  const productImage = (() => {
    if (product.images && product.images.length > 0) {
      const img = product.images[0];
      return typeof img === 'string' ? img : img.url || DEFAULT_IMAGE;
    }
    return product.featuredImage || DEFAULT_IMAGE;
  })();
  
  // Get the price
  const getPrice = () => {
    if (product.pricing?.price) return product.pricing.price;
    if (product.price) return product.price;
    if (product.priceRange?.min) return product.priceRange.min;
    return 0;
  };
  
  const getRegularPrice = () => {
    if (product.pricing?.regularPrice) return product.pricing.regularPrice;
    if (product.oldPrice) return product.oldPrice;
    return getPrice();
  };

  const price = getPrice();
  const regularPrice = getRegularPrice();
  const currency = product.pricing?.currency || product.currency || 'USD';
  
  // Determine availability
  const getAvailability = () => {
    if (product.productType === 'variable' && product.variations) {
      const hasStock = product.variations.some(v => 
        v.isActive !== false && (v.endlessStock || v.stock > 0 || v.stockStatus === 'in_stock')
      );
      return hasStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock';
    }
    if (product.inventory?.endlessStock) return 'https://schema.org/InStock';
    if (product.inventory?.stockStatus === 'in_stock' && product.inventory?.stock > 0) {
      return 'https://schema.org/InStock';
    }
    if (product.countInStock > 0) return 'https://schema.org/InStock';
    return 'https://schema.org/OutOfStock';
  };

  const pageUrl = `${SITE_URL}/product/${product._id}`;
  const keywords = [
    productName,
    product.brand,
    product.catName,
    product.subCat,
    ...(product.tags || [])
  ].filter(Boolean);

  // JSON-LD Product Schema - This is what shows products on Google!
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": productName,
    "description": productDescription,
    "image": productImage,
    "sku": product.sku || product._id,
    "mpn": product.barcode || product._id,
    "brand": {
      "@type": "Brand",
      "name": product.brand || "Zuba House"
    },
    "category": product.catName || product.category?.name || "Fashion",
    "offers": {
      "@type": "Offer",
      "url": pageUrl,
      "priceCurrency": currency,
      "price": price.toFixed(2),
      "priceValidUntil": new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      "availability": getAvailability(),
      "seller": {
        "@type": "Organization",
        "name": product.vendorShopName || "Zuba House"
      }
    }
  };

  // Add aggregate rating if available
  if (product.rating > 0 || product.ratingSummary?.count > 0) {
    productSchema.aggregateRating = {
      "@type": "AggregateRating",
      "ratingValue": (product.ratingSummary?.average || product.rating || 0).toFixed(1),
      "reviewCount": product.ratingSummary?.count || product.reviewsCount || 1,
      "bestRating": "5",
      "worstRating": "1"
    };
  }

  // Add sale price if on sale
  if (regularPrice > price) {
    productSchema.offers.priceSpecification = {
      "@type": "PriceSpecification",
      "price": price.toFixed(2),
      "priceCurrency": currency,
      "valueAddedTaxIncluded": true
    };
  }

  return (
    <SEO
      title={productName}
      description={productDescription}
      image={productImage}
      url={`/product/${product._id}`}
      type="product"
      keywords={keywords}
    >
      {/* JSON-LD Structured Data for Google Rich Results */}
      <script type="application/ld+json">
        {JSON.stringify(productSchema)}
      </script>
      
      {/* Product-specific Open Graph tags */}
      <meta property="product:price:amount" content={price.toFixed(2)} />
      <meta property="product:price:currency" content={currency} />
      <meta property="product:availability" content={getAvailability().includes('InStock') ? 'in stock' : 'out of stock'} />
      {product.brand && <meta property="product:brand" content={product.brand} />}
      {product.catName && <meta property="product:category" content={product.catName} />}
    </SEO>
  );
};

/**
 * CategorySEO - SEO component for category/listing pages
 */
export const CategorySEO = ({ category, subcategory, products = [], url }) => {
  const categoryName = subcategory || category || 'Products';
  const title = `${categoryName} - Shop African Fashion`;
  const description = `Browse our collection of ${categoryName.toLowerCase()}. Find the best African fashion, clothing, and accessories at Zuba House.`;
  
  const pageUrl = url || '/products';
  
  // ItemList schema for category pages
  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": categoryName,
    "description": description,
    "url": `${SITE_URL}${pageUrl}`,
    "numberOfItems": products.length,
    "itemListElement": products.slice(0, 10).map((product, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "Product",
        "name": product.name || product.productTitle,
        "url": `${SITE_URL}/product/${product._id}`,
        "image": (() => {
          if (product.images && product.images.length > 0) {
            const img = product.images[0];
            return typeof img === 'string' ? img : img.url;
          }
          return product.featuredImage;
        })(),
        "offers": {
          "@type": "Offer",
          "price": (product.pricing?.price || product.price || 0).toFixed(2),
          "priceCurrency": product.currency || "USD"
        }
      }
    }))
  };

  return (
    <SEO
      title={title}
      description={description}
      url={pageUrl}
      keywords={[categoryName, 'African fashion', 'shop online']}
    >
      <script type="application/ld+json">
        {JSON.stringify(itemListSchema)}
      </script>
    </SEO>
  );
};

/**
 * BreadcrumbSEO - Adds breadcrumb structured data
 */
export const BreadcrumbSEO = ({ items }) => {
  if (!items || items.length === 0) return null;

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url ? `${SITE_URL}${item.url}` : undefined
    }))
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(breadcrumbSchema)}
      </script>
    </Helmet>
  );
};

/**
 * FAQSeo - Adds FAQ structured data for pages with FAQs
 */
export const FAQSeo = ({ faqs }) => {
  if (!faqs || faqs.length === 0) return null;

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(faqSchema)}
      </script>
    </Helmet>
  );
};

export default SEO;

