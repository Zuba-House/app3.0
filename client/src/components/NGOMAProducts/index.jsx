import React, { useContext, useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import 'swiper/css/free-mode';
import { Navigation, FreeMode, Pagination as SwiperPagination } from "swiper/modules";
import "swiper/css/pagination";
import ProductItem from "../ProductItem";
import { MyContext } from "../../App";
import ProductLoading from "../ProductLoading";
import { postData } from "../../utils/api";
import Pagination from "@mui/material/Pagination";
import { Button } from "@mui/material";
import { MdArrowRightAlt } from "react-icons/md";
import { Link } from "react-router-dom";

const NGOMAProducts = () => {
  const [ngomaProducts, setNgomaProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const context = useContext(MyContext);
  const isMobile = context?.windowWidth < 992;

  useEffect(() => {
    fetchNGOMAProducts(1);
  }, []);

  const fetchNGOMAProducts = async (pageNum = 1) => {
    setIsLoading(true);
    try {
      const response = await postData('/api/product/filters', {
        brand: ['NGOMA'],
        page: pageNum,
        limit: isMobile ? 12 : 24 // Show more on desktop
      });

      if (response?.error === false && response?.products) {
        setNgomaProducts(response.products);
        setTotalPages(response.totalPages || 1);
        setTotalProducts(response.total || 0);
        setPage(pageNum);
      } else {
        setNgomaProducts([]);
        setTotalPages(1);
      }
    } catch (error) {
      console.error('Error fetching NGOMA products:', error);
      setNgomaProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (event, value) => {
    fetchNGOMAProducts(value);
    // Scroll to top of section on mobile
    if (isMobile) {
      const section = document.getElementById('ngoma-products-section');
      if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  if (isLoading && ngomaProducts.length === 0) {
    return (
      <section id="ngoma-products-section" className="bg-white py-3 lg:py-8">
        <div className="container">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-[18px] sm:text-[20px] md:text-[22px] lg:text-[24px] font-[700] text-[#0b2735]">
                NGOMA Products
              </h2>
              <p className="text-[12px] sm:text-[14px] text-gray-600 mt-1">
                Discover our exclusive NGOMA collection
              </p>
            </div>
            {totalProducts > (isMobile ? 12 : 24) && (
              <Link to="/ngoma">
                <Button className="!bg-gray-100 hover:!bg-gray-200 !text-gray-800 !capitalize !px-3 !border !border-[rgba(0,0,0,0.4)]" size="small">
                  View All <MdArrowRightAlt size={25} />
                </Button>
              </Link>
            )}
          </div>
          <ProductLoading />
        </div>
      </section>
    );
  }

  if (ngomaProducts.length === 0 && !isLoading) {
    return null; // Don't show section if no NGOMA products
  }

  return (
    <section id="ngoma-products-section" className="bg-white py-3 lg:py-8">
      <div className="container">
        <div className="flex items-center justify-between mb-4 flex-col sm:flex-row gap-3">
          <div>
            <h2 className="text-[18px] sm:text-[20px] md:text-[22px] lg:text-[24px] font-[700] text-[#0b2735]">
              NGOMA Products
            </h2>
            <p className="text-[12px] sm:text-[14px] text-gray-600 mt-1">
              Discover our exclusive NGOMA collection
            </p>
          </div>
          {totalProducts > (isMobile ? 12 : 24) && (
            <Link to="/products?brand=NGOMA">
              <Button className="!bg-gray-100 hover:!bg-gray-200 !text-gray-800 !capitalize !px-3 !border !border-[rgba(0,0,0,0.4)]" size="small">
                View All <MdArrowRightAlt size={25} />
              </Button>
            </Link>
          )}
        </div>

        {/* Desktop: Swiper Slider */}
        {!isMobile && (
          <div className="ngomaProductsSlider pt-1 lg:pt-3 pb-0">
            {isLoading ? (
              <ProductLoading />
            ) : (
              <Swiper
                slidesPerView={6}
                spaceBetween={10}
                slidesPerGroup={4}
                navigation={true}
                modules={[Navigation, FreeMode]}
                freeMode={true}
                breakpoints={{
                  250: {
                    slidesPerView: 1,
                    spaceBetween: 10,
                  },
                  330: {
                    slidesPerView: 2,
                    spaceBetween: 10,
                  },
                  500: {
                    slidesPerView: 3,
                    spaceBetween: 10,
                  },
                  1100: {
                    slidesPerView: 6,
                    spaceBetween: 10,
                  },
                }}
                className="mySwiper"
              >
                {ngomaProducts.map((item, index) => (
                  <SwiperSlide key={item._id || index}>
                    <ProductItem item={item} />
                  </SwiperSlide>
                ))}
              </Swiper>
            )}
          </div>
        )}

        {/* Mobile: Grid with Pagination */}
        {isMobile && (
          <div className="ngomaProductsGrid">
            {isLoading ? (
              <ProductLoading />
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {ngomaProducts.map((item, index) => (
                    <ProductItem key={item._id || index} item={item} />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-center mt-6">
                    <Pagination
                      count={totalPages}
                      page={page}
                      onChange={handlePageChange}
                      color="primary"
                      size="large"
                      showFirstButton
                      showLastButton
                    />
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default NGOMAProducts;

