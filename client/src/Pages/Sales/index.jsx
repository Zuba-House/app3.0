import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { FaFire, FaPercent, FaClock, FaTag, FaGift, FaFilter, FaTimes } from 'react-icons/fa';
import { MdLocalOffer, MdGridView, MdViewList } from 'react-icons/md';
import { fetchDataFromApi } from '../../utils/api';
import ProductItem from '../../components/ProductItem';
import ProductItemListView from '../../components/ProductItemListView';
import { MyContext } from '../../App';
import { SEO } from '../../components/SEO';
import { Helmet } from 'react-helmet-async';
import './Sales.css';

const Sales = () => {
  const [products, setProducts] = useState([]);
  const [promotions, setPromotions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('discount');
  const [copiedCode, setCopiedCode] = useState(null);

  const context = useContext(MyContext);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchData();
  }, [page, sortBy]);

  useEffect(() => {
    // Fetch promotions only once
    fetchDataFromApi('/api/product/getActivePromotions')
      .then(res => {
        if (res?.success && res?.promotions) {
          setPromotions(res.promotions);
        }
      })
      .catch(err => console.error('Error fetching promotions:', err));
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetchDataFromApi(`/api/product/getSaleProducts?page=${page}&limit=24`);
      
      if (res?.success && res?.products) {
        let sortedProducts = [...res.products];
        
        // Sort products based on selected option
        if (sortBy === 'discount') {
          sortedProducts.sort((a, b) => (b.discountPercentage || 0) - (a.discountPercentage || 0));
        } else if (sortBy === 'price-low') {
          sortedProducts.sort((a, b) => getProductPrice(a) - getProductPrice(b));
        } else if (sortBy === 'price-high') {
          sortedProducts.sort((a, b) => getProductPrice(b) - getProductPrice(a));
        } else if (sortBy === 'newest') {
          sortedProducts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }
        
        setProducts(sortedProducts);
        setTotalPages(res.totalPages || 1);
        setTotalProducts(res.totalProducts || 0);
      }
    } catch (error) {
      console.error('Error fetching sale products:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProductPrice = (product) => {
    if (product.pricing?.price) return product.pricing.price;
    if (product.price) return product.price;
    return 0;
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    context?.alertBox?.('success', `Promo code ${code} copied!`);
    setTimeout(() => setCopiedCode(null), 3000);
  };

  const formatDiscountText = (coupon) => {
    if (coupon.discountType === 'percentage') {
      return `${coupon.discountAmount}% OFF`;
    } else if (coupon.discountType === 'fixed_cart') {
      return `$${coupon.discountAmount} OFF`;
    }
    return `$${coupon.discountAmount} OFF per item`;
  };

  const getTimeRemaining = (endDate) => {
    if (!endDate) return null;
    const now = new Date();
    const end = new Date(endDate);
    const diff = end - now;
    
    if (diff <= 0) return 'Ending soon!';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h remaining`;
    if (hours > 0) return `${hours}h remaining`;
    return 'Ending soon!';
  };

  return (
    <>
      <SEO 
        title="🔥 SALE - Up to 50% OFF African Fashion | Zuba House"
        description="Huge savings on authentic African fashion! Shop dresses, jewelry, accessories & more. Use promo codes WELCOME10, FREESHIP for extra discounts. Free shipping over $75!"
        url="/sales"
        keywords={[
          'African fashion sale',
          'African clothing discount',
          'African dress sale',
          'Ankara sale',
          'African jewelry deals',
          'promo code African fashion',
          'Zuba House sale',
          'African accessories discount',
          'black Friday African fashion',
          'holiday sale African clothing',
          'cheap African fashion',
          'African fashion coupon code'
        ]}
      />
      
      {/* Structured Data for Google */}
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SaleEvent",
            "name": "Zuba House Holiday Sale",
            "description": "Up to 50% off on authentic African fashion, clothing, jewelry and accessories",
            "url": "https://zubahouse.com/sales",
            "startDate": "2024-12-01",
            "endDate": "2025-01-31",
            "offers": {
              "@type": "AggregateOffer",
              "priceCurrency": "USD",
              "lowPrice": "10",
              "highPrice": "500",
              "offerCount": totalProducts || 100
            },
            "location": {
              "@type": "VirtualLocation",
              "url": "https://zubahouse.com/sales"
            },
            "organizer": {
              "@type": "Organization",
              "name": "Zuba House",
              "url": "https://zubahouse.com"
            }
          })}
        </script>
      </Helmet>

      <div className="sales-page">
        {/* Hero Banner */}
        <div className="sales-hero">
          <div className="hero-content">
            <div className="hero-icon">
              <FaFire />
            </div>
            <h1>Hot Deals & Promotions</h1>
            <p>Save big on authentic African fashion - Up to 70% off!</p>
            <div className="hero-stats">
              <div className="stat">
                <span className="stat-number">{totalProducts}</span>
                <span className="stat-label">Items on Sale</span>
              </div>
              {promotions?.coupons?.length > 0 && (
                <div className="stat">
                  <span className="stat-number">{promotions.coupons.length}</span>
                  <span className="stat-label">Active Promo Codes</span>
                </div>
              )}
            </div>
          </div>
          <div className="hero-decoration">
            <span className="deco-tag">SALE</span>
            <span className="deco-percent">%</span>
          </div>
        </div>

        <div className="container sales-content">
          {/* Active Promo Codes */}
          {promotions?.coupons && promotions.coupons.length > 0 && (
            <section className="promo-codes-section">
              <h2>
                <MdLocalOffer /> Active Promo Codes
              </h2>
              <div className="promo-codes-grid">
                {promotions.coupons.map((coupon, index) => (
                  <div key={index} className="promo-card">
                    <div className="promo-card-header">
                      <span className="promo-type">
                        {coupon.discountType === 'percentage' ? <FaPercent /> : <FaTag />}
                        {formatDiscountText(coupon)}
                      </span>
                      {coupon.freeShipping && (
                        <span className="free-ship-badge">
                          <FaGift /> Free Ship
                        </span>
                      )}
                    </div>
                    <div className="promo-card-body">
                      <div className="promo-code-box">
                        <span className="code">{coupon.code}</span>
                        <button 
                          className={`copy-btn ${copiedCode === coupon.code ? 'copied' : ''}`}
                          onClick={() => copyCode(coupon.code)}
                        >
                          {copiedCode === coupon.code ? 'Copied!' : 'Copy'}
                        </button>
                      </div>
                      {coupon.description && (
                        <p className="promo-desc">{coupon.description}</p>
                      )}
                      <div className="promo-meta">
                        {coupon.minimumAmount > 0 && (
                          <span className="min-purchase">
                            Min. ${coupon.minimumAmount}
                          </span>
                        )}
                        {coupon.endsAt && (
                          <span className="time-left">
                            <FaClock /> {getTimeRemaining(coupon.endsAt)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Products Section */}
          <section className="sale-products-container">
            <div className="products-header">
              <h2>
                <FaPercent /> Sale Products
                <span className="count">({totalProducts} items)</span>
              </h2>
              <div className="products-controls">
                <div className="sort-control">
                  <label>Sort by:</label>
                  <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                    <option value="discount">Biggest Discount</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="newest">Newest First</option>
                  </select>
                </div>
                <div className="view-toggle">
                  <button 
                    className={viewMode === 'grid' ? 'active' : ''} 
                    onClick={() => setViewMode('grid')}
                    aria-label="Grid view"
                  >
                    <MdGridView />
                  </button>
                  <button 
                    className={viewMode === 'list' ? 'active' : ''} 
                    onClick={() => setViewMode('list')}
                    aria-label="List view"
                  >
                    <MdViewList />
                  </button>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading deals...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="no-products">
                <FaTag />
                <h3>No sales at the moment</h3>
                <p>Check back soon for amazing deals!</p>
                <Link to="/" className="btn-primary">
                  Browse All Products
                </Link>
              </div>
            ) : (
              <>
                <div className={`products-grid ${viewMode}`}>
                  {products.map((product) => (
                    <div key={product._id} className="sale-product-wrapper">
                      {product.discountPercentage > 0 && (
                        <div className="sale-badge">
                          <FaPercent />
                          <span>{product.discountPercentage}% OFF</span>
                        </div>
                      )}
                      {viewMode === 'grid' ? (
                        <ProductItem item={product} />
                      ) : (
                        <ProductItemListView item={product} />
                      )}
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="pagination">
                    <button 
                      disabled={page === 1}
                      onClick={() => setPage(p => p - 1)}
                      className="page-btn"
                    >
                      Previous
                    </button>
                    <span className="page-info">
                      Page {page} of {totalPages}
                    </span>
                    <button 
                      disabled={page === totalPages}
                      onClick={() => setPage(p => p + 1)}
                      className="page-btn"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      </div>
    </>
  );
};

export default Sales;

