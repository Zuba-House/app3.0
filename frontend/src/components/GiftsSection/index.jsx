import React, { useState, useEffect, useContext } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, FreeMode } from "swiper/modules";
import { Link } from "react-router-dom";
import { fetchDataFromApi } from "../../utils/api";
import { MyContext } from "../../App";
import ProductItem from "../ProductItem";
import { FaGift, FaFemale, FaMale, FaChild, FaHeart, FaHome } from "react-icons/fa";
import { GiPartyPopper, GiDiamondRing } from "react-icons/gi";
import { MdCelebration } from "react-icons/md";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/free-mode";
import "./style.css";

const giftCategories = [
  { id: "her", label: "For Her", icon: <FaFemale />, color: "#FF69B4", emoji: "👩" },
  { id: "him", label: "For Him", icon: <FaMale />, color: "#4169E1", emoji: "👨" },
  { id: "kids", label: "For Kids", icon: <FaChild />, color: "#FFD700", emoji: "🧒" },
  { id: "couple", label: "Couples", icon: <FaHeart />, color: "#FF1493", emoji: "💑" },
  { id: "home", label: "Home", icon: <FaHome />, color: "#32CD32", emoji: "🏠" },
  { id: "luxury", label: "Luxury", icon: <GiDiamondRing />, color: "#9400D3", emoji: "💎" },
];

const GiftsSection = () => {
  const [activeCategory, setActiveCategory] = useState("her");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [animateCards, setAnimateCards] = useState(false);
  const context = useContext(MyContext);

  useEffect(() => {
    fetchGiftProducts();
  }, [activeCategory]);

  const fetchGiftProducts = async () => {
    setLoading(true);
    setAnimateCards(false);
    try {
      // Fetch random products - in production, you'd filter by gift category tags
      const response = await fetchDataFromApi("/api/product/getAllProducts?page=1&limit=12");
      if (response?.products) {
        // Shuffle products for "random picks" effect
        const shuffled = [...response.products].sort(() => Math.random() - 0.5);
        setProducts(shuffled.slice(0, 10));
      }
    } catch (error) {
      console.error("Error fetching gift products:", error);
    } finally {
      setLoading(false);
      setTimeout(() => setAnimateCards(true), 100);
    }
  };

  const activeGift = giftCategories.find(g => g.id === activeCategory);

  return (
    <div className="gifts-section">
      {/* Header with gift animation */}
      <div className="gifts-header">
        <div className="gifts-title-wrapper">
          <div className="gift-icon-animated">
            <FaGift className="gift-icon-main" />
            <div className="gift-sparkles">
              <span>✨</span>
              <span>✨</span>
              <span>✨</span>
            </div>
          </div>
          <div className="gifts-title-text">
            <h2>Perfect Gift Guide</h2>
            <p>Find the perfect gift for everyone special in your life!</p>
          </div>
        </div>
        <Link to="/products" className="view-all-gifts-btn">
          <GiPartyPopper /> Shop All Gifts
        </Link>
      </div>

      {/* Category Tabs */}
      <div className="gift-categories-wrapper">
        <div className="gift-categories">
          {giftCategories.map((category) => (
            <button
              key={category.id}
              className={`gift-category-btn ${activeCategory === category.id ? "active" : ""}`}
              onClick={() => setActiveCategory(category.id)}
              style={{
                "--category-color": category.color,
              }}
            >
              <span className="category-emoji">{category.emoji}</span>
              <span className="category-label">{category.label}</span>
              {activeCategory === category.id && (
                <span className="active-indicator"></span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Products Display */}
      <div className="gifts-products-container">
        <div 
          className="category-banner"
          style={{ background: `linear-gradient(135deg, ${activeGift?.color}20 0%, ${activeGift?.color}40 100%)` }}
        >
          <span className="banner-emoji">{activeGift?.emoji}</span>
          <span className="banner-text">Curated picks {activeGift?.label?.toLowerCase()}</span>
          <MdCelebration className="celebration-icon" />
        </div>

        {loading ? (
          <div className="gifts-loading">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="gift-skeleton">
                <div className="skeleton-image"></div>
                <div className="skeleton-text"></div>
                <div className="skeleton-text short"></div>
              </div>
            ))}
          </div>
        ) : (
          <Swiper
            slidesPerView={6}
            spaceBetween={15}
            navigation={context?.windowWidth > 768}
            freeMode={true}
            modules={[Navigation, FreeMode]}
            breakpoints={{
              250: { slidesPerView: 2, spaceBetween: 10 },
              400: { slidesPerView: 2.5, spaceBetween: 10 },
              600: { slidesPerView: 3, spaceBetween: 12 },
              768: { slidesPerView: 4, spaceBetween: 15 },
              1024: { slidesPerView: 5, spaceBetween: 15 },
              1200: { slidesPerView: 6, spaceBetween: 15 },
            }}
            className="gifts-swiper"
          >
            {products.map((product, index) => (
              <SwiperSlide key={product._id || index}>
                <div 
                  className={`gift-product-card ${animateCards ? "animate-in" : ""}`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="gift-ribbon">
                    <FaGift /> Gift Pick
                  </div>
                  <ProductItem item={product} />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        )}
      </div>

      {/* Quick Gift Ideas Banner */}
      <div className="quick-gift-ideas">
        <div className="idea-card" style={{ background: "linear-gradient(135deg, #FF6B6B, #FF8E8E)" }}>
          <span className="idea-emoji">🎁</span>
          <span className="idea-text">Under $25</span>
        </div>
        <div className="idea-card" style={{ background: "linear-gradient(135deg, #4ECDC4, #7EDDD6)" }}>
          <span className="idea-emoji">🌟</span>
          <span className="idea-text">Best Sellers</span>
        </div>
        <div className="idea-card" style={{ background: "linear-gradient(135deg, #A855F7, #C084FC)" }}>
          <span className="idea-emoji">💝</span>
          <span className="idea-text">Last Minute</span>
        </div>
        <div className="idea-card" style={{ background: "linear-gradient(135deg, #F59E0B, #FBBF24)" }}>
          <span className="idea-emoji">🏆</span>
          <span className="idea-text">Premium Picks</span>
        </div>
      </div>
    </div>
  );
};

export default GiftsSection;

