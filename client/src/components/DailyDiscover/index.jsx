import React, { useState, useEffect, useContext } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, FreeMode, Grid } from "swiper/modules";
import { Link } from "react-router-dom";
import { fetchDataFromApi } from "../../utils/api";
import { MyContext } from "../../App";
import ProductItem from "../ProductItem";
import { FaRandom, FaSyncAlt, FaRegLightbulb, FaRegEye, FaHeart, FaStar } from "react-icons/fa";
import { BsStars, BsArrowRepeat, BsEmojiSunglasses } from "react-icons/bs";
import { IoRefresh, IoSparkles, IoTrendingUp } from "react-icons/io5";
import { MdExplore, MdAutoAwesome } from "react-icons/md";
import { formatCurrency } from "../../utils/currency";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/free-mode";
import "swiper/css/grid";
import "./style.css";

const discoveryModes = [
  { id: "trending", label: "Trending Now", icon: <IoTrendingUp />, color: "#FF6B6B" },
  { id: "new", label: "New Arrivals", icon: <BsStars />, color: "#4ECDC4" },
  { id: "surprise", label: "Surprise Me", icon: <BsEmojiSunglasses />, color: "#A855F7" },
  { id: "popular", label: "Most Loved", icon: <FaHeart />, color: "#EC4899" },
];

const DailyDiscover = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeMode, setActiveMode] = useState("trending");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshCount, setRefreshCount] = useState(0);
  const [featuredPick, setFeaturedPick] = useState(null);
  const context = useContext(MyContext);

  useEffect(() => {
    fetchDiscoveries();
  }, [activeMode]);

  const fetchDiscoveries = async () => {
    setLoading(true);
    try {
      const response = await fetchDataFromApi("/api/product/getAllProducts?page=1&limit=20");
      if (response?.products) {
        let filtered = [...response.products];
        
        // Shuffle for randomness
        filtered.sort(() => Math.random() - 0.5);
        
        // Set featured pick
        if (filtered.length > 0) {
          setFeaturedPick(filtered[0]);
          filtered = filtered.slice(1);
        }
        
        setProducts(filtered.slice(0, 12));
      }
    } catch (error) {
      console.error("Error fetching discoveries:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setRefreshCount(prev => prev + 1);
    fetchDiscoveries().finally(() => {
      setTimeout(() => setIsRefreshing(false), 500);
    });
  };

  const handleModeChange = (modeId) => {
    setActiveMode(modeId);
    setRefreshCount(0);
  };

  const currentMode = discoveryModes.find(m => m.id === activeMode);

  return (
    <div className="daily-discover-section">
      {/* Decorative Elements */}
      <div className="discover-decorations">
        <span className="deco-star">⭐</span>
        <span className="deco-star">✨</span>
        <span className="deco-star">💫</span>
      </div>

      {/* Header */}
      <div className="discover-header">
        <div className="discover-title-area">
          <div className="discover-icon-wrapper">
            <MdExplore className="explore-icon" />
            <div className="discover-glow"></div>
          </div>
          <div className="discover-title-text">
            <h2>
              <IoSparkles className="title-sparkle" />
              Daily Discover
              <MdAutoAwesome className="auto-icon" />
            </h2>
            <p className="discover-subtitle">
              <FaRegLightbulb /> Explore new finds curated for you
            </p>
          </div>
        </div>

        {/* Refresh Button */}
        <button 
          className={`refresh-btn ${isRefreshing ? 'refreshing' : ''}`}
          onClick={handleRefresh}
        >
          <IoRefresh className="refresh-icon" />
          <span>Refresh</span>
          {refreshCount > 0 && (
            <span className="refresh-badge">{refreshCount}</span>
          )}
        </button>
      </div>

      {/* Discovery Mode Tabs */}
      <div className="discovery-modes">
        {discoveryModes.map((mode) => (
          <button
            key={mode.id}
            className={`mode-btn ${activeMode === mode.id ? 'active' : ''}`}
            onClick={() => handleModeChange(mode.id)}
            style={{ '--mode-color': mode.color }}
          >
            <span className="mode-icon">{mode.icon}</span>
            <span className="mode-label">{mode.label}</span>
            {activeMode === mode.id && <span className="mode-active-dot"></span>}
          </button>
        ))}
      </div>

      {/* Featured Pick of the Day */}
      {featuredPick && !loading && (
        <div className="featured-pick" style={{ '--featured-color': currentMode?.color }}>
          <div className="featured-badge">
            <FaStar /> Pick of the Day
          </div>
          <div className="featured-content">
            <div className="featured-image-wrapper">
              <img 
                src={featuredPick?.images?.[0]?.url || featuredPick?.images?.[0] || '/placeholder.jpg'} 
                alt={featuredPick?.name}
                className="featured-image"
              />
              <div className="featured-overlay">
                <Link to={`/product/${featuredPick?._id}`} className="featured-cta">
                  <FaRegEye /> Quick View
                </Link>
              </div>
            </div>
            <div className="featured-info">
              <span className="featured-tag">
                <IoSparkles /> Editor's Choice
              </span>
              <h3 className="featured-name">{featuredPick?.name}</h3>
              <p className="featured-desc">
                {featuredPick?.shortDescription || featuredPick?.description?.substring(0, 100)}...
              </p>
              <div className="featured-price">
                <span className="current-price">
                  {formatCurrency(featuredPick?.pricing?.price || featuredPick?.price || 0)}
                </span>
                {featuredPick?.pricing?.regularPrice > featuredPick?.pricing?.price && (
                  <span className="original-price">
                    {formatCurrency(featuredPick?.pricing?.regularPrice)}
                  </span>
                )}
              </div>
              <Link to={`/product/${featuredPick?._id}`} className="shop-featured-btn">
                Shop Now <BsStars />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Products Grid */}
      <div className="discover-products-container">
        <div 
          className="mode-indicator"
          style={{ background: `linear-gradient(135deg, ${currentMode?.color}20, ${currentMode?.color}40)` }}
        >
          <span className="mode-indicator-icon" style={{ color: currentMode?.color }}>
            {currentMode?.icon}
          </span>
          <span className="mode-indicator-text">{currentMode?.label}</span>
          <span className="mode-indicator-count">{products.length} items</span>
        </div>

        {loading ? (
          <div className="discover-loading">
            <div className="loading-spinner">
              <BsArrowRepeat className="spinner-icon" />
            </div>
            <p>Discovering amazing finds...</p>
          </div>
        ) : (
          <Swiper
            slidesPerView={6}
            spaceBetween={15}
            navigation={context?.windowWidth > 768}
            freeMode={true}
            modules={[Navigation, FreeMode, Grid]}
            breakpoints={{
              250: { slidesPerView: 2, spaceBetween: 10 },
              400: { slidesPerView: 2.5, spaceBetween: 10 },
              600: { slidesPerView: 3, spaceBetween: 12 },
              768: { slidesPerView: 4, spaceBetween: 15 },
              1024: { slidesPerView: 5, spaceBetween: 15 },
              1200: { slidesPerView: 6, spaceBetween: 15 },
            }}
            className="discover-swiper"
          >
            {products.map((product, index) => (
              <SwiperSlide key={product._id || index}>
                <div className="discover-product-card" style={{ animationDelay: `${index * 0.1}s` }}>
                  <div 
                    className="discover-rank"
                    style={{ 
                      background: index < 3 
                        ? 'linear-gradient(135deg, #FFD700, #FFA500)' 
                        : 'linear-gradient(135deg, #a0a0a0, #808080)' 
                    }}
                  >
                    #{index + 1}
                  </div>
                  <ProductItem item={product} />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        )}
      </div>

      {/* Bottom Action Bar */}
      <div className="discover-action-bar">
        <Link to="/products" className="explore-more-btn">
          <MdExplore /> Explore More
        </Link>
        <div className="action-divider"></div>
        <button className="shuffle-btn" onClick={handleRefresh}>
          <FaRandom /> Shuffle Picks
        </button>
      </div>
    </div>
  );
};

export default DailyDiscover;

