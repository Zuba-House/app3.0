import React, { useContext } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import 'swiper/css/free-mode';

import { Navigation,FreeMode } from "swiper/modules";
import { Link } from "react-router-dom";
import { MyContext } from "../../App";

const HomeCatSlider = (props) => {

  const context = useContext(MyContext);

  return (
    <div className="homeCatSlider pt-0 lg:pt-4 py-4 lg:py-8">
      <div className="container">
        <Swiper
          slidesPerView={8}
          spaceBetween={10}
          navigation={context?.windowWidth < 992 ? false : true}
          modules={[Navigation, FreeMode]}
          freeMode={true}
          breakpoints={{
            300: {
              slidesPerView: 3,
              spaceBetween: 8,
            },
            400: {
              slidesPerView: 4,
              spaceBetween: 8,
            },
            550: {
              slidesPerView: 5,
              spaceBetween: 10,
            },
            768: {
              slidesPerView: 6,
              spaceBetween: 10,
            },
            900: {
              slidesPerView: 6,
              spaceBetween: 10,
            },
            1100: {
              slidesPerView: 8,
              spaceBetween: 10,
            },
          }}
          className="mySwiper"
        >
          {
            props?.data?.map((cat, index) => {
              return (
                <SwiperSlide key={index}>
                  <Link to={`/products?catId=${cat?._id}`}>
                    <div className="item py-3 lg:py-7 px-2 lg:px-3 bg-white rounded-sm text-center flex items-center justify-center flex-col hover:bg-gray-50 transition-all min-h-[80px] lg:min-h-[120px]">
                      <div className="flex items-center justify-center mb-1 lg:mb-2">
                        <img
                          src={cat?.images?.[0]}
                          className="w-[35px] h-[35px] sm:w-[40px] sm:h-[40px] lg:w-[60px] lg:h-[60px] object-contain transition-all"
                          alt={cat?.name}
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/60?text=Category';
                          }}
                        />
                      </div>
                      <h3 className="text-[10px] sm:text-[11px] lg:text-[15px] font-[600] mt-1 lg:mt-2 text-gray-800 line-clamp-2">{cat?.name}</h3>
                    </div>
                  </Link>
                </SwiperSlide>
              )
            })
          }


        </Swiper>
      </div>
    </div>
  );
};

export default HomeCatSlider;
