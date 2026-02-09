import React, { useState, useEffect, useContext } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, FreeMode, Autoplay } from "swiper/modules";
import { Link } from "react-router-dom";
import { fetchDataFromApi } from "../../utils/api";
import { MyContext } from "../../App";
import ProductItem from "../ProductItem";
import { FaBolt, FaFire, FaClock, FaGift, FaDice, FaPercentage } from "react-icons/fa";
import { BsLightningChargeFill, BsAlarm } from "react-icons/bs";
import { GiFireworkRocket, GiPerspectiveDiceSixFacesRandom } from "react-icons/gi";
import { MdLocalOffer, MdTimer } from "react-icons/md";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/free-mode";
import "./style.css";

const FlashDeals = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState({
    hours: 5,
    minutes: 59,
    seconds: 59
  });
  const [luckyNumber, setLuckyNumber] = useState(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const context = useContext(MyContext);

  useEffect(() => {
    fetchFlashDeals();
    
    // Countdown timer
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let { hours, minutes, seconds } = prev;
        
        if (seconds > 0) {
          seconds--;
        } else if (minutes > 0) {
          minutes--;
          seconds = 59;
        } else if (hours > 0) {
          hours--;
          minutes = 59;
          seconds = 59;
        } else {
          // Reset timer when it hits 0
          return { hours: 5, minutes: 59, seconds: 59 };
        }
        
        return { hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const fetchFlashDeals = async () => {
    try {
      const response = await fetchDataFromApi("/api/product/getSaleProducts?limit=12");
      if (response?.products) {
        // Add random discount percentages and claimed amounts for display
        const enhanced = response.products.map(product => ({
          ...product,
          flashDiscount: Math.floor(Math.random() * 40) + 20, // 20-60%
          claimed: Math.floor(Math.random() * 80) + 10, // 10-90%
          stock: Math.floor(Math.random() * 20) + 1
        }));
        setProducts(enhanced);
      }
    } catch (error) {
      console.error("Error fetching flash deals:", error);
    } finally {
      setLoading(false);
    }
  };

  const spinLucky = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    
    // Simulate spinning animation
    let spins = 0;
    const spinInterval = setInterval(() => {
      setLuckyNumber(Math.floor(Math.random() * 100));
      spins++;
      if (spins > 20) {
        clearInterval(spinInterval);
        setLuckyNumber(Math.floor(Math.random() * 50) + 5); // Final discount 5-55%
        setIsSpinning(false);
      }
    }, 100);
  };

  const formatTime = (num) => num.toString().padStart(2, '0');

  return (
    <div className="flash-deals-section">
      {/* Lightning Background Effect */}
      <div className="lightning-bg">
        <span className="lightning-bolt">⚡</span>
        <span className="lightning-bolt">⚡</span>
        <span className="lightning-bolt">⚡</span>
      </div>

      {/* Header */}
      <div className="flash-header">
        <div className="flash-title-area">
          <div className="flash-icon-animated">
            <FaBolt className="bolt-icon" />
            <div className="flash-ring"></div>
          </div>
          <div className="flash-title-text">
            <h2>
              <BsLightningChargeFill className="title-bolt" />
              Flash Deals
              <FaFire className="fire-icon" />
            </h2>
            <p className="flash-subtitle">
              <GiFireworkRocket /> Grab before they're gone!
            </p>
          </div>
        </div>

        {/* Countdown Timer */}
        <div className="flash-countdown">
          <div className="countdown-label">
            <BsAlarm className="alarm-icon" />
            <span>Ends in</span>
          </div>
          <div className="countdown-timer">
            <div className="time-box">
              <span className="time-value">{formatTime(timeLeft.hours)}</span>
              <span className="time-label">HRS</span>
            </div>
            <span className="time-separator">:</span>
            <div className="time-box">
              <span className="time-value">{formatTime(timeLeft.minutes)}</span>
              <span className="time-label">MIN</span>
            </div>
            <span className="time-separator">:</span>
            <div className="time-box pulse">
              <span className="time-value">{formatTime(timeLeft.seconds)}</span>
              <span className="time-label">SEC</span>
            </div>
          </div>
        </div>

        <Link to="/products?sale=true" className="view-all-flash-btn">
          <MdLocalOffer /> All Deals
        </Link>
      </div>

      {/* Lucky Spin Banner */}
      <div className="lucky-spin-banner">
        <div className="lucky-content">
          <div className="lucky-icon">
            <GiPerspectiveDiceSixFacesRandom className={`dice-icon ${isSpinning ? 'spinning' : ''}`} />
          </div>
          <div className="lucky-text">
            <h3>🎲 Try Your Luck!</h3>
            <p>Spin for an extra discount on your next order</p>
          </div>
          <button 
            className={`spin-btn ${isSpinning ? 'spinning' : ''}`}
            onClick={spinLucky}
            disabled={isSpinning}
          >
            {isSpinning ? (
              <>
                <FaDice className="spinning-dice" />
                Spinning...
              </>
            ) : luckyNumber !== null ? (
              <>
                <FaGift /> You won {luckyNumber}% OFF!
              </>
            ) : (
              <>
                <FaDice /> Spin Now
              </>
            )}
          </button>
        </div>
        {luckyNumber !== null && !isSpinning && (
          <div className="lucky-result">
            <span className="confetti">🎉</span>
            <span className="discount-won">{luckyNumber}% OFF</span>
            <span className="confetti">🎊</span>
          </div>
        )}
      </div>

      {/* Products */}
      <div className="flash-products-container">
        {loading ? (
          <div className="flash-loading">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flash-skeleton">
                <div className="skeleton-badge"></div>
                <div className="skeleton-image"></div>
                <div className="skeleton-progress"></div>
                <div className="skeleton-text"></div>
              </div>
            ))}
          </div>
        ) : (
          <Swiper
            slidesPerView={6}
            spaceBetween={15}
            navigation={context?.windowWidth > 768}
            freeMode={true}
            autoplay={{
              delay: 3500,
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
            className="flash-swiper"
          >
            {products.map((product, index) => (
              <SwiperSlide key={product._id || index}>
                <div className="flash-product-card">
                  {/* Flash Badge */}
                  <div className="flash-badge">
                    <FaBolt />
                    <span>{product.flashDiscount}% OFF</span>
                  </div>

                  {/* Stock Warning */}
                  {product.stock <= 5 && (
                    <div className="stock-warning">
                      <FaFire /> Only {product.stock} left!
                    </div>
                  )}

                  <ProductItem item={product} />

                  {/* Progress Bar - Claimed */}
                  <div className="claimed-progress">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill"
                        style={{ width: `${product.claimed}%` }}
                      ></div>
                      <div className="progress-fire">🔥</div>
                    </div>
                    <span className="claimed-text">{product.claimed}% claimed</span>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        )}
      </div>

      {/* Bottom Urgency Banner */}
      <div className="urgency-banner">
        <div className="urgency-item">
          <MdTimer className="urgency-icon" />
          <span>Limited Time</span>
        </div>
        <div className="urgency-divider">|</div>
        <div className="urgency-item">
          <FaPercentage className="urgency-icon" />
          <span>Up to 70% OFF</span>
        </div>
        <div className="urgency-divider">|</div>
        <div className="urgency-item">
          <FaFire className="urgency-icon" />
          <span>Selling Fast</span>
        </div>
      </div>
    </div>
  );
};

export default FlashDeals;

