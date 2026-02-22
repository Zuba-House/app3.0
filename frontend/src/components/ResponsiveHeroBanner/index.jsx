import React, { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import { Navigation, Autoplay } from "swiper/modules";
import { Link } from "react-router-dom";
import { fetchDataFromApi } from "../../utils/api";

/**
 * Responsive Hero Banner Component
 * Displays different banners for mobile and desktop
 * Fetches banners from /api/banners/public endpoint
 */
const ResponsiveHeroBanner = () => {
  const [allBanners, setAllBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    // Track window width for responsive display
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    
    // Fetch banners from API
    fetchBanners();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const response = await fetchDataFromApi('/api/banners/public');
      
      if (response?.success && response?.banners) {
        // Get all banners from the response
        let bannersList = [];
        
        if (response.banners.all && Array.isArray(response.banners.all)) {
          bannersList = response.banners.all;
        } else if (Array.isArray(response.banners)) {
          bannersList = response.banners;
        } else {
          // Fallback to desktop/mobile format
          if (response.banners.desktop) bannersList.push(response.banners.desktop);
          if (response.banners.mobile) bannersList.push(response.banners.mobile);
        }
        
        // Sort by order
        bannersList.sort((a, b) => (a.order || 0) - (b.order || 0));
        setAllBanners(bannersList);
      }
    } catch (error) {
      console.error('Error fetching banners:', error);
    } finally {
      setLoading(false);
    }
  };

  // Determine which banners to show based on screen size
  const isMobile = windowWidth <= 768;
  // Strict filtering - only show banners of the correct type (no fallback)
  const filteredBanners = allBanners.filter(banner => 
    isMobile ? banner.type === 'mobile' : banner.type === 'desktop'
  );

  // Get the first banner - NO FALLBACK to other type
  const displayBanner = filteredBanners.length > 0 ? filteredBanners[0] : null;

  if (loading) {
    return (
      <div className={`homeSlider pb-3 pt-4 lg:pb-5 lg:pt-5 relative z-[99] ${isMobile ? 'mt-[130px] lg:mt-0' : ''}`}>
        <div className="container">
          <div className="item rounded-[10px] overflow-hidden bg-gray-200 animate-pulse" style={{ height: isMobile ? '250px' : '400px' }}></div>
        </div>
      </div>
    );
  }

  // If no banners of the correct type, don't show anything
  if (filteredBanners.length === 0) {
    return null;
  }

  // If multiple banners, show slider
  if (filteredBanners.length > 1) {
    return (
      <div className={`homeSlider pb-3 pt-4 lg:pb-5 lg:pt-5 relative z-[99] ${isMobile ? 'mt-[130px] lg:mt-0' : ''}`}>
        <div className="container">
          <Swiper
            modules={[Navigation, Autoplay]}
            navigation={true}
            autoplay={{
              delay: 5000,
              disableOnInteraction: false,
            }}
            loop={true}
            className="rounded-[10px] overflow-hidden"
          >
            {filteredBanners.map((banner, index) => {
              const hasContent = banner.title || banner.subtitle || banner.ctaText;
              return (
                <SwiperSlide key={banner._id || banner.id || index}>
                  <div className="item rounded-[10px] overflow-hidden relative">
                    <img
                      src={banner.imageUrl}
                      alt={banner.title || "Banner"}
                      className={`w-full ${isMobile ? 'h-[250px]' : 'h-[400px]'} object-cover`}
                    />
                    {hasContent && (
                      <div className={`absolute inset-0 bg-black bg-opacity-40 flex items-center ${isMobile ? 'justify-center text-center' : 'justify-center text-center'} p-4 sm:p-6 lg:p-8 lg:p-12`}>
                        <div className={`text-white ${isMobile ? 'max-w-[90%]' : 'max-w-2xl'}`}>
                          {banner.title && (
                            <h1 className={`${isMobile ? 'text-xl sm:text-2xl' : 'text-3xl lg:text-5xl'} font-bold mb-2 lg:mb-4 leading-tight ${isMobile ? 'text-center' : 'text-center'}`}>
                              {banner.title}
                            </h1>
                          )}
                          {banner.subtitle && (
                            <p className={`${isMobile ? 'text-sm sm:text-base' : 'text-lg lg:text-xl'} mb-4 lg:mb-6 leading-relaxed ${isMobile ? 'text-center' : 'text-center'}`}>
                              {banner.subtitle}
                            </p>
                          )}
                          {banner.ctaText && banner.ctaLink && (
                            <div className="flex justify-center">
                              <Link
                                to={banner.ctaLink}
                                className={`inline-block bg-[#eeb190] hover:bg-[#d99a7a] text-white ${isMobile ? 'px-6 py-3 text-base' : 'px-6 py-3 text-base lg:text-lg'} rounded-lg font-semibold transition-colors shadow-lg hover:shadow-xl transform hover:scale-105`}
                              >
                                {banner.ctaText}
                              </Link>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </SwiperSlide>
              );
            })}
          </Swiper>
        </div>
      </div>
    );
  }

  // Single banner display
  if (!displayBanner || !displayBanner.imageUrl) {
    return null;
  }

  const hasContent = displayBanner.title || displayBanner.subtitle || displayBanner.ctaText;

  return (
    <div className={`homeSlider pb-3 pt-4 lg:pb-5 lg:pt-5 relative z-[99] ${isMobile ? 'mt-[130px] lg:mt-0' : ''}`}>
      <div className="container">
        <div className="item rounded-[10px] overflow-hidden relative">
          <img
            src={displayBanner.imageUrl}
            alt={displayBanner.title || "Banner"}
            className={`w-full ${isMobile ? 'h-[250px]' : 'h-[400px]'} object-cover`}
          />
          {hasContent && (
                <div className={`absolute inset-0 bg-black bg-opacity-40 flex items-center ${isMobile ? 'justify-center text-center' : 'justify-center text-center'} ${isMobile ? 'p-4 sm:p-6' : 'p-8 lg:p-12'}`}>
                  <div className={`text-white ${isMobile ? 'max-w-[90%]' : 'max-w-2xl'}`}>
                    {displayBanner.title && (
                      <h1 className={`${isMobile ? 'text-xl sm:text-2xl' : 'text-3xl lg:text-5xl'} font-bold mb-2 lg:mb-4 leading-tight ${isMobile ? 'text-center' : 'text-center'}`}>
                        {displayBanner.title}
                      </h1>
                    )}
                    {displayBanner.subtitle && (
                      <p className={`${isMobile ? 'text-sm sm:text-base' : 'text-lg lg:text-xl'} mb-4 lg:mb-6 leading-relaxed ${isMobile ? 'text-center' : 'text-center'}`}>
                        {displayBanner.subtitle}
                      </p>
                    )}
                    {displayBanner.ctaText && displayBanner.ctaLink && (
                      <div className="flex justify-center">
                        <Link
                          to={displayBanner.ctaLink}
                          className={`inline-block bg-[#eeb190] hover:bg-[#d99a7a] text-white ${isMobile ? 'px-6 py-3 text-base' : 'px-6 py-3 text-base lg:text-lg'} rounded-lg font-semibold transition-colors shadow-lg hover:shadow-xl transform hover:scale-105`}
                        >
                          {displayBanner.ctaText}
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              )}
        </div>
      </div>
    </div>
  );
};

export default ResponsiveHeroBanner;

