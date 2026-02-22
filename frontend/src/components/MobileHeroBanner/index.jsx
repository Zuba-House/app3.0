import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchDataFromApi } from '../../utils/api';
import './MobileHeroBanner.css';

/**
 * Mobile-Only Hero Banner Component
 * - Endless loop auto-play banners
 * - Touch/swipe navigation
 * - Only displays on mobile devices (max-width: 768px)
 * - Integrates with existing banner API
 */
const MobileHeroBanner = () => {
  const [banners, setBanners] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  
  const intervalRef = useRef(null);
  const containerRef = useRef(null);
  const navigate = useNavigate();
  
  const minSwipeDistance = 50;
  const autoPlayInterval = 4000; // 4 seconds

  // Default fallback banner (Christmas theme like current design)
  const defaultBanner = {
    _id: 'default',
    title: 'Christmas Discount',
    subtitle: 'Starting Dec 1',
    ctaText: 'Shop Now',
    ctaLink: '/products',
    imageUrl: '',
    type: 'mobile',
    isActive: true
  };

  // Fetch mobile banners from API
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        setLoading(true);
        const response = await fetchDataFromApi('/api/banners/public?format=array');
        
        if (response?.success && response?.banners) {
          // Filter for mobile banners only and active ones
          let mobileBanners = [];
          
          if (Array.isArray(response.banners)) {
            mobileBanners = response.banners.filter(
              banner => banner.type === 'mobile' && banner.isActive !== false
            );
          } else if (response.banners.all && Array.isArray(response.banners.all)) {
            mobileBanners = response.banners.all.filter(
              banner => banner.type === 'mobile' && banner.isActive !== false
            );
          } else if (response.banners.mobile) {
            mobileBanners = [response.banners.mobile].filter(b => b && b.isActive !== false);
          }

          // Sort by order if available
          mobileBanners.sort((a, b) => (a.order || 0) - (b.order || 0));

          // Use default if no banners found
          if (mobileBanners.length === 0) {
            mobileBanners = [defaultBanner];
          }

          setBanners(mobileBanners);
        } else {
          // Fallback to default banner
          setBanners([defaultBanner]);
        }
      } catch (error) {
        console.error('Error fetching mobile banners:', error);
        setBanners([defaultBanner]);
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, []);

  // Auto-play functionality
  useEffect(() => {
    if (banners.length <= 1) {
      setIsPlaying(false);
      return;
    }

    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % banners.length);
      }, autoPlayInterval);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, banners.length]);

  // Navigation functions
  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  }, [banners.length]);

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  }, [banners.length]);

  const goToSlide = useCallback((index) => {
    setCurrentIndex(index);
  }, []);

  // Touch handlers for swipe
  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      goToNext();
    }
    if (isRightSwipe) {
      goToPrev();
    }
  };

  // Handle CTA click
  const handleCTAClick = (banner) => {
    if (banner.ctaLink) {
      if (banner.ctaLink.startsWith('http')) {
        window.open(banner.ctaLink, '_blank');
      } else {
        navigate(banner.ctaLink);
      }
    }
  };

  // Get image URL with fallback
  const getImageUrl = (banner) => {
    if (banner.imageUrl) {
      return banner.imageUrl;
    }
    if (banner.mobileImage) {
      return banner.mobileImage;
    }
    return '';
  };

  if (loading) {
    return (
      <div className="mobile-hero-banner-loading">
        <div className="loading-skeleton"></div>
      </div>
    );
  }

  if (banners.length === 0) {
    return null;
  }

  const currentBanner = banners[currentIndex] || banners[0];

  return (
    <div
      className="mobile-hero-banner-container"
      ref={containerRef}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <div
        className="mobile-hero-banner"
        style={{
          backgroundImage: currentBanner.imageUrl 
            ? `url(${getImageUrl(currentBanner)})` 
            : 'linear-gradient(135deg, #d4af37, #b8941f)',
          backgroundColor: currentBanner.backgroundColor || '#d4af37'
        }}
      >
        {/* Banner Image Overlay */}
        {getImageUrl(currentBanner) && (
          <div className="banner-image-overlay">
            <img
              src={getImageUrl(currentBanner)}
              alt={currentBanner.title || 'Banner'}
              className="banner-image"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
        )}

        {/* Gradient Overlay */}
        <div className="banner-gradient-overlay"></div>

        {/* Banner Content */}
        <div className="banner-content">
          {currentBanner.title && (
            <h1
              className="banner-title"
              style={{ color: currentBanner.textColor || '#2c3e50' }}
            >
              {currentBanner.title}
            </h1>
          )}

          {currentBanner.subtitle && (
            <p
              className="banner-subtitle"
              style={{ color: currentBanner.textColor || '#2c3e50' }}
            >
              {currentBanner.subtitle}
            </p>
          )}

          {currentBanner.ctaText && (
            <button
              className="banner-cta-button"
              onClick={() => handleCTAClick(currentBanner)}
              style={{
                backgroundColor: currentBanner.ctaColor || '#ff6b35',
                color: currentBanner.ctaTextColor || 'white'
              }}
            >
              {currentBanner.ctaText}
            </button>
          )}
        </div>

        {/* Navigation Dots (only if multiple banners) */}
        {banners.length > 1 && (
          <div className="banner-dots">
            {banners.map((_, index) => (
              <button
                key={index}
                className={`banner-dot ${index === currentIndex ? 'active' : ''}`}
                onClick={() => goToSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}

        {/* Navigation Arrows (only if multiple banners) */}
        {banners.length > 1 && (
          <>
            <button
              className="banner-arrow banner-arrow-prev"
              onClick={goToPrev}
              aria-label="Previous banner"
            >
              ‹
            </button>
            <button
              className="banner-arrow banner-arrow-next"
              onClick={goToNext}
              aria-label="Next banner"
            >
              ›
            </button>
          </>
        )}

        {/* Play/Pause Button (only if multiple banners) */}
        {banners.length > 1 && (
          <button
            className="banner-play-pause"
            onClick={() => setIsPlaying(!isPlaying)}
            aria-label={isPlaying ? 'Pause slideshow' : 'Play slideshow'}
          >
            {isPlaying ? '⏸' : '▶'}
          </button>
        )}

        {/* Progress Bar (only if playing and multiple banners) */}
        {banners.length > 1 && isPlaying && (
          <div className="banner-progress">
            <div
              className="progress-bar"
              style={{
                animation: `progress ${autoPlayInterval}ms linear infinite`
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileHeroBanner;

