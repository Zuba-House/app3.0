import React, { useContext, useRef, useState, useEffect } from "react";
import InnerImageZoom from "react-inner-image-zoom";
import "react-inner-image-zoom/lib/InnerImageZoom/styles.css";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import { Navigation } from "swiper/modules";
import { MyContext } from "../../App";

export const ProductZoom = (props) => {

  const [slideIndex, setSlideIndex] = useState(0);
  const zoomSliderBig = useRef();
  const zoomSliderSml = useRef();

  const context = useContext(MyContext);

  const goto = (index) => {
    setSlideIndex(index);
    if (zoomSliderSml.current?.swiper) {
      zoomSliderSml.current.swiper.slideTo(index);
    }
    if (zoomSliderBig.current?.swiper) {
      zoomSliderBig.current.swiper.slideTo(index);
    }
  }

  // Reset to first image when images change (e.g., variation selected)
  useEffect(() => {
    setSlideIndex(0);
    if (zoomSliderSml.current?.swiper) {
      zoomSliderSml.current.swiper.slideTo(0);
    }
    if (zoomSliderBig.current?.swiper) {
      zoomSliderBig.current.swiper.slideTo(0);
    }
  }, [props?.images]);

  // Filter and normalize images
  const normalizedImages = (props?.images || [])
    .map(item => {
      const imageUrl = typeof item === 'string' ? item : (item?.url || item);
      return imageUrl;
    })
    .filter(Boolean);

  if (normalizedImages.length === 0) {
    return (
      <div className="w-full h-[400px] bg-gray-100 rounded-lg flex items-center justify-center">
        <span className="text-gray-400">No images available</span>
      </div>
    );
  }

  return (
    <div className="product-images-container">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Thumbnail Slider - Left Side (Desktop) */}
        {normalizedImages.length > 1 && (
          <div className="slider w-full lg:w-[15%] order-2 lg:order-1">
            <Swiper
              ref={zoomSliderSml}
              direction={context?.windowWidth < 992 ? "horizontal" : "vertical"}
              slidesPerView={normalizedImages.length > 4 ? 4 : normalizedImages.length}
              spaceBetween={8}
              navigation={context?.windowWidth < 992 ? false : true}
              modules={[Navigation]}
              className="zoomProductSliderThumbs h-auto lg:h-[500px]"
            >
              {normalizedImages.map((imageUrl, index) => (
                <SwiperSlide key={index}>
                  <div 
                    className={`item rounded-md overflow-hidden cursor-pointer border-2 transition-all ${
                      slideIndex === index 
                        ? 'border-primary opacity-100' 
                        : 'border-transparent opacity-50 hover:opacity-75'
                    }`} 
                    onClick={() => goto(index)}
                  >
                    <img
                      src={imageUrl}
                      alt={`Product thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        )}

        {/* Main Image - Right Side (Desktop) - 4:5 Aspect Ratio */}
        <div className={`zoomContainer ${normalizedImages.length > 1 ? 'w-full lg:w-[85%]' : 'w-full'} product-detail-image-container overflow-hidden rounded-lg bg-gray-50 order-1 lg:order-2`}>
          <Swiper
            ref={zoomSliderBig}
            slidesPerView={1}
            spaceBetween={0}
            navigation={false}
            className="h-full"
          >
            {normalizedImages.map((imageUrl, index) => (
              <SwiperSlide key={index} className="h-full">
                <div className="w-full h-full flex items-center justify-center bg-white rounded-lg">
                  <InnerImageZoom
                    zoomType="hover"
                    zoomScale={2}
                    src={imageUrl}
                    alt={`Product image ${index + 1}`}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </div>
  );
};
