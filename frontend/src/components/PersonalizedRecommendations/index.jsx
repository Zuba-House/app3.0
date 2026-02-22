import React, { useState, useEffect, useContext } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, FreeMode, Autoplay } from "swiper/modules";
import { Link } from "react-router-dom";
import { fetchDataFromApi } from "../../utils/api";
import { MyContext } from "../../App";
import ProductItem from "../ProductItem";
import { FaBrain, FaRobot, FaMagic, FaEye, FaHeart, FaShoppingBag } from "react-icons/fa";
import { BsStars, BsLightningChargeFill } from "react-icons/bs";
import { IoSparkles } from "react-icons/io5";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/free-mode";
import "./style.css";

const PersonalizedRecommendations = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aiThinking, setAiThinking] = useState(true);
  const [activeReason, setActiveReason] = useState(0);
  const context = useContext(MyContext);

  // Simulated AI recommendation reasons
  const recommendationReasons = [
    { icon: <FaEye />, text: "Based on your browsing history", color: "#8B5CF6" },
    { icon: <FaHeart />, text: "Similar to items you loved", color: "#EC4899" },
    { icon: <FaShoppingBag />, text: "Trending in your area", color: "#F59E0B" },
    { icon: <BsStars />, text: "Picked just for you", color: "#10B981" },
  ];

  useEffect(() => {
    // Simulate AI "thinking" animation
    const thinkingTimer = setTimeout(() => {
      setAiThinking(false);
      fetchRecommendations();
    }, 1500);

    // Rotate through recommendation reasons
    const reasonInterval = setInterval(() => {
      setActiveReason(prev => (prev + 1) % recommendationReasons.length);
    }, 3000);

    return () => {
      clearTimeout(thinkingTimer);
      clearInterval(reasonInterval);
    };
  }, []);

  const fetchRecommendations = async () => {
    try {
      // In production, this would use actual AI/ML recommendations
      // For now, fetch products and simulate personalization
      const response = await fetchDataFromApi("/api/product/getAllProducts?page=1&limit=15");
      if (response?.products) {
        // Simulate AI scoring - shuffle and pick
        const shuffled = [...response.products].sort(() => Math.random() - 0.5);
        // Add simulated AI scores
        const withScores = shuffled.map(product => ({
          ...product,
          aiScore: Math.floor(Math.random() * 30) + 70, // 70-99% match
          aiReason: recommendationReasons[Math.floor(Math.random() * recommendationReasons.length)]
        }));
        setProducts(withScores.slice(0, 12));
      }
    } catch (error) {
      console.error("Error fetching recommendations:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-recommendations-section">
      {/* AI Header with Animation */}
      <div className="ai-header">
        <div className="ai-badge">
          <div className="ai-icon-wrapper">
            <FaBrain className={`ai-brain-icon ${aiThinking ? 'thinking' : ''}`} />
            <div className="ai-pulse-rings">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
          <div className="ai-text">
            <div className="ai-title">
              <IoSparkles className="sparkle-icon" />
              <span>AI-Powered Picks</span>
              <IoSparkles className="sparkle-icon" />
            </div>
            <p className="ai-subtitle">
              {aiThinking ? (
                <span className="thinking-text">
                  <FaRobot className="robot-icon" />
                  Analyzing your preferences...
                </span>
              ) : (
                <span className="ready-text">
                  <FaMagic className="magic-icon" />
                  Curated recommendations just for you
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="ai-stats">
          <div className="stat-item">
            <BsLightningChargeFill className="stat-icon" />
            <span className="stat-value">98%</span>
            <span className="stat-label">Match Rate</span>
          </div>
          <div className="stat-divider"></div>
          <Link to="/products" className="explore-btn">
            Explore All <IoSparkles />
          </Link>
        </div>
      </div>

      {/* Active Recommendation Reason */}
      <div className="recommendation-reason">
        <div 
          className="reason-badge"
          style={{ background: `linear-gradient(135deg, ${recommendationReasons[activeReason].color}20, ${recommendationReasons[activeReason].color}40)` }}
        >
          <span 
            className="reason-icon"
            style={{ color: recommendationReasons[activeReason].color }}
          >
            {recommendationReasons[activeReason].icon}
          </span>
          <span className="reason-text">{recommendationReasons[activeReason].text}</span>
        </div>
        <div className="reason-dots">
          {recommendationReasons.map((_, index) => (
            <span 
              key={index} 
              className={`dot ${index === activeReason ? 'active' : ''}`}
              style={{ background: index === activeReason ? recommendationReasons[index].color : '#ddd' }}
            ></span>
          ))}
        </div>
      </div>

      {/* Products Display */}
      <div className="ai-products-container">
        {loading || aiThinking ? (
          <div className="ai-loading">
            <div className="ai-scanning-animation">
              <div className="scan-line"></div>
              <div className="loading-products">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="ai-skeleton-card">
                    <div className="skeleton-shimmer"></div>
                  </div>
                ))}
              </div>
            </div>
            <p className="loading-text">
              <FaRobot /> AI is finding perfect matches for you...
            </p>
          </div>
        ) : (
          <Swiper
            slidesPerView={6}
            spaceBetween={15}
            navigation={context?.windowWidth > 768}
            freeMode={true}
            autoplay={{
              delay: 4000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            modules={[Navigation, FreeMode, Autoplay]}
            breakpoints={{
              250: { slidesPerView: 2, spaceBetween: 10 },
              400: { slidesPerView: 2.5, spaceBetween: 10 },
              600: { slidesPerView: 3, spaceBetween: 12 },
              768: { slidesPerView: 4, spaceBetween: 15 },
              1024: { slidesPerView: 5, spaceBetween: 15 },
              1200: { slidesPerView: 6, spaceBetween: 15 },
            }}
            className="ai-swiper"
          >
            {products.map((product, index) => (
              <SwiperSlide key={product._id || index}>
                <div className="ai-product-card">
                  {/* AI Match Score Badge */}
                  <div className="ai-score-badge">
                    <IoSparkles />
                    <span>{product.aiScore}% Match</span>
                  </div>
                  
                  {/* AI Reason Tag */}
                  <div 
                    className="ai-reason-tag"
                    style={{ 
                      background: product.aiReason?.color,
                      boxShadow: `0 2px 10px ${product.aiReason?.color}50`
                    }}
                  >
                    {product.aiReason?.icon}
                  </div>

                  <ProductItem item={product} />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        )}
      </div>

      {/* AI Feedback */}
      <div className="ai-feedback">
        <p>Help us improve your recommendations</p>
        <div className="feedback-buttons">
          <button className="feedback-btn like">
            <span>👍</span> More like this
          </button>
          <button className="feedback-btn dislike">
            <span>👎</span> Less like this
          </button>
        </div>
      </div>
    </div>
  );
};

export default PersonalizedRecommendations;

