import React, { useContext } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
// Import Swiper styles
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/navigation";
import "swiper/css/pagination";

// import required modules
import { EffectFade, Navigation, Pagination, Autoplay } from "swiper/modules";
import Button from "@mui/material/Button";
import { Link } from "react-router-dom";
import { MyContext } from "../../App";
import { formatCurrency } from "../../utils/currency";

const HomeBannerV2 = (props) => {

  const context = useContext(MyContext);

  // Filter products that have banner display enabled and have banner images
  const bannerProducts = props?.data?.filter(item => 
    // More robust check - handle both boolean true and truthy string "true"
    (item?.isDisplayOnHomeBanner === true || item?.isDisplayOnHomeBanner === "true") && 
    item?.bannerimages && 
    Array.isArray(item.bannerimages) && 
    item.bannerimages.length > 0
  ) || [];

  // Don't render anything if no valid banner products
  if (bannerProducts.length === 0) {
    return null;
  }

  return (
    <Swiper
      loop={bannerProducts.length > 1}
      slidesPerView={1}
      spaceBetween={30}
      effect="fade"
      navigation={context?.windowWidth < 992 ? false : true}
      pagination={{
        clickable: true,
      }}
      autoplay={{
        delay: 3000,
        disableOnInteraction: false,
        pauseOnMouseEnter: false,
      }}
      loopAdditionalSlides={1}
      speed={800}
      modules={[EffectFade, Navigation, Pagination, Autoplay]}
      className="homeSliderV2"
      allowTouchMove={true}
    >

      {
        bannerProducts.map((item, index) => {
          return (
            <SwiperSlide key={index}>

                <div className="item w-full rounded-md overflow-hidden relative">
                  <img src={item?.bannerimages[0]} className="w-full" />

                  <div className="info absolute top-0 -right-[100%] opacity-0 w-[50%] h-[100%] z-50 p-8 flex items-center flex-col justify-center transition-all duration-700">

                    <h4 className="text-[12px] lg:text-[18px] font-[500] w-full text-left mb-3 relative -right-[100%] opacity-0 hidden lg:block">
                      {item?.bannerTitleName}
                    </h4>
                    {
                      context?.windowWidth < 992 &&
                      <h2 className="text-[15px] lg:text-[30px] font-[700] w-full relative -right-[100%] opacity-0">
                        {item?.name?.length > 30 ? item?.name?.substr(0, 30) + '...' : item?.name}
                      </h2>
                    }
                    {
                      context?.windowWidth > 992 &&
                      <h2 className="text-[16px] sm:text-[20px] md:text-[25px] lg:text-[30px] font-[700] w-full relative -right-[100%] opacity-0">
                        {item?.name?.length > 70 ? item?.name?.substr(0, 70) + '...' : item?.name}
                      </h2>
                    }

                    <h3 className="flex items-center gap-0 lg:gap-3 text-[12px] lg:text-[18px] font-[500] w-full text-left mt-3 mb-0 lg:mb-3 relative -right-[100%] opacity-0 flex-col lg:flex-row">
                     <span className="w-full lg:w-max hidden lg:block">Starting At Only </span>{" "}
                      <span
                        className="text-primary text-[16px] lg:text-[30px] 
                        font-[700] block lg:inline w-full lg:w-max"
                      >
                        {(() => {
                          // For variable products, use price range minimum
                          if (item?.productType === 'variable' || item?.type === 'variable') {
                            if (item?.variations && Array.isArray(item.variations) && item.variations.length > 0) {
                              const validPrices = item.variations
                                .filter(v => v && (v.isActive !== false))
                                .map(v => {
                                  const salePrice = v.salePrice && v.salePrice > 0 ? v.salePrice : null;
                                  const regularPrice = v.regularPrice && v.regularPrice > 0 ? v.regularPrice : (v.price && v.price > 0 ? v.price : null);
                                  return salePrice && regularPrice && salePrice < regularPrice ? salePrice : regularPrice;
                                })
                                .filter(p => p && p > 0);
                              
                              if (validPrices.length > 0) {
                                return formatCurrency(Math.min(...validPrices));
                              }
                            }
                            // Fallback to priceRange if available
                            if (item?.priceRange?.min && item.priceRange.min > 0) {
                              return formatCurrency(item.priceRange.min);
                            }
                          }
                          // For simple products or fallback
                          const displayPrice = item?.price || item?.pricing?.price || item?.pricing?.regularPrice || 0;
                          return formatCurrency(displayPrice > 0 ? displayPrice : 0);
                        })()}
                      </span>
                    </h3>

                    <div className="w-full relative -right-[100%] opacity-0 btn_">
                      <Link to={item?.bannerLink || item?.bannerButtonLink || `/product/${item?._id}`}>
                        <Button className="btn btn-org">
                          {item?.bannerButtonText || item?.buttonText || 'SHOP NOW'}
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            );
        })
      }


    </Swiper>
  );
};

export default HomeBannerV2;
