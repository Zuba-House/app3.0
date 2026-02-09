import React, { useState, useEffect, memo } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import { FaArrowRight } from 'react-icons/fa';
import { fetchDataFromApi } from '../../utils/api';
import ProductItem from '../ProductItem';
import './SalesSection.css';

import 'swiper/css';
import 'swiper/css/navigation';

const SalesSection = memo(() => {
  const [saleProducts, setSaleProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetchDataFromApi('/api/product/getSaleProducts?limit=12');
        if (res?.success && res?.products) {
          setSaleProducts(res.products);
        }
      } catch (error) {
        console.error('Error fetching sales data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Don't render if no sales
  if (!loading && saleProducts.length === 0) {
    return null;
  }

  if (loading) {
    return null; // Don't show loading spinner, just wait
  }

  return (
    <section className="sales-section">
      <div className="sale-products-section">
        <div className="section-header">
          <div className="title-wrapper">
            <h2>🏷️ On Sale</h2>
            <p className="subtitle">Limited time offers</p>
          </div>
          <Link to="/sales" className="view-all-btn">
            View All <FaArrowRight />
          </Link>
        </div>

        <div className="sale-products-slider">
          <Swiper
            modules={[Navigation]}
            spaceBetween={12}
            slidesPerView={2}
            navigation
            breakpoints={{
              480: { slidesPerView: 2, spaceBetween: 12 },
              640: { slidesPerView: 3, spaceBetween: 12 },
              768: { slidesPerView: 4, spaceBetween: 14 },
              1024: { slidesPerView: 5, spaceBetween: 16 },
              1280: { slidesPerView: 6, spaceBetween: 16 }
            }}
          >
            {saleProducts.map((product) => (
              <SwiperSlide key={product._id}>
                <ProductItem item={product} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
});

export default SalesSection;
