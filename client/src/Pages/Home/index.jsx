import { useContext, useEffect, useState, useMemo } from "react";
import ResponsiveHeroBanner from "../../components/ResponsiveHeroBanner";
import HomeCatSlider from "../../components/HomeCatSlider";
import { LiaShippingFastSolid } from "react-icons/lia";
import AdsBannerSlider from "../../components/AdsBannerSlider";
import AdsBannerSliderV2 from "../../components/AdsBannerSliderV2";
import SalesSection from "../../components/SalesSection";

// New Creative Components
import GiftsSection from "../../components/GiftsSection";
import PersonalizedRecommendations from "../../components/PersonalizedRecommendations";
import FlashDeals from "../../components/FlashDeals";
import DailyDiscover from "../../components/DailyDiscover";

import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import ProductsSlider from "../../components/ProductsSlider";

import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import 'swiper/css/free-mode';

import { Navigation, FreeMode } from "swiper/modules";
import BlogItem from "../../components/BlogItem";
import HomeBannerV2 from "../../components/HomeSliderV2";
import BannerBoxV2 from "../../components/bannerBoxV2";
import { fetchDataFromApi } from "../../utils/api";
import { MyContext } from "../../App";
import ProductLoading from "../../components/ProductLoading";
import { Button } from "@mui/material";
import { MdArrowRightAlt } from "react-icons/md";
import { Link } from "react-router-dom";
import NGOMAProducts from "../../components/NGOMAProducts";
import { SEO } from "../../components/SEO";

const Home = () => {
  const [value, setValue] = useState(0);
  // const [homeSlidesData, setHomeSlidesData] = useState([]); // Unused - kept for future use
  const [popularProductsData, setPopularProductsData] = useState([]);
  const [productsData, setAllProductsData] = useState([]);
  const [productsBanners, setProductsBanners] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [bannerV1Data, setBannerV1Data] = useState([]);
  const [bannerList2Data, setBannerList2Data] = useState([]);
  const [blogData, setBlogData] = useState([]);
  const [randomCatProducts, setRandomCatProducts] = useState([]);


  const context = useContext(MyContext);


  useEffect(() => {

    window.scrollTo(0, 0);

    // fetchDataFromApi("/api/homeSlides").then((res) => {
    //   setHomeSlidesData(res?.data)
    // })
    fetchDataFromApi("/api/product/getAllProducts?page=1&limit=12").then((res) => {
      setAllProductsData(res?.products)
    })

    // Fetch only products configured for home banner display (optimized endpoint)
    fetchDataFromApi("/api/product/getAllProductsBanners").then((res) => {
      setProductsBanners(res?.products)
    })

    
    fetchDataFromApi("/api/product/getAllFeaturedProducts").then((res) => {
      setFeaturedProducts(res?.products)
    })

    fetchDataFromApi("/api/bannerV1").then((res) => {
      setBannerV1Data(res?.data);
    });

    fetchDataFromApi("/api/bannerList2").then((res) => {
      setBannerList2Data(res?.data);
    });

    fetchDataFromApi("/api/blog").then((res) => {
      setBlogData(res?.blogs);
    });
  }, [])



  useEffect(() => {
    if (context?.catData?.length !== 0 && context?.catData[0]?._id) {

      fetchDataFromApi(`/api/product/getAllProductsByCatId/${context?.catData[0]?._id}`).then((res) => {
        if (res?.error === false) {
          setPopularProductsData(res?.products)
        }

      }).catch((error) => {
        console.error('Error fetching products by category:', error);
      })
    }

    const numbers = new Set();
    while (numbers.size < context?.catData?.length - 1) {

      const number = Math.floor(1 + Math.random() * 8);

      // Add the number to the set (automatically ensures uniqueness)
      numbers.add(number);
    }


    getRendomProducts(Array.from(numbers), context?.catData)

  }, [context?.catData])



  const getRendomProducts = (arr, catArr) => {

    const filterData = [];

    for (let i = 0; i < arr.length; i++) {
      let catId = catArr[arr[i]]?._id;

      // Only fetch if catId is valid
      if (catId && catId !== 'undefined' && catId !== 'null') {
        fetchDataFromApi(`/api/product/getAllProductsByCatId/${catId}`).then((res) => {
          if (res?.error === false && res?.products) {
            filterData.push({
              catName: catArr[arr[i]]?.name,
              data: res?.products
            });

            setRandomCatProducts([...filterData]);
          }
        }).catch((error) => {
          console.error(`Error fetching products for category ${catId}:`, error);
        });
      }
    }



  }

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  // Check if there are any products configured for home banner display
  const hasValidBannerProducts = useMemo(() => {
    return productsBanners?.some(item => 
      (item?.isDisplayOnHomeBanner === true || item?.isDisplayOnHomeBanner === "true") && 
      item?.bannerimages && 
      Array.isArray(item.bannerimages) && 
      item.bannerimages.length > 0
    ) || false;
  }, [productsBanners]);

  const filterByCatId = (id) => {
    if (!id || id === 'undefined' || id === 'null') {
      console.error('Invalid category ID:', id);
      return;
    }
    setPopularProductsData([])
    fetchDataFromApi(`/api/product/getAllProductsByCatId/${id}`).then((res) => {
      if (res?.error === false) {
        setPopularProductsData(res?.products || [])
      }

    }).catch((error) => {
      console.error('Error fetching products by category ID:', error);
    })
  }



  return (
    <>
      {/* SEO Meta Tags for Homepage */}
      <SEO 
        title="African Fashion, Clothing & Accessories - Shop Online"
        description="Discover authentic African fashion at Zuba House. Shop our curated collection of traditional and modern African clothing, dresses, accessories, and handcrafted products. Free shipping on orders over $50."
        url="/"
        keywords={['African fashion', 'African clothing', 'African dresses', 'Ankara', 'African accessories', 'traditional African wear', 'online shopping', 'African marketplace']}
      />

      {/* Responsive Hero Banner - supports mobile/desktop banners */}
      <ResponsiveHeroBanner />
      
      {/* Legacy Home Slider - kept for backward compatibility */}
      {/* Uncomment if you want to use the old slider instead:
      {
        homeSlidesData?.length === 0 && <BannerLoading />
      }

      {
        homeSlidesData?.lengtn !== 0 && <HomeSlider data={homeSlidesData} />
      }
      */}

      {
        context?.catData?.length !== 0 && <HomeCatSlider data={context?.catData} />
      }

      {/* NGOMA Products Section - Always at the top */}
      <NGOMAProducts />

      {/* Sales & Promotions Section */}
      <section className="container py-4">
        <SalesSection />
      </section>

      {/* ⚡ Flash Deals with Countdown Timer */}
      <section className="container py-4">
        <FlashDeals />
      </section>

      <section className="bg-white py-3 lg:py-8">
        <div className="container">
          <div className="flex items-center justify-between flex-col lg:flex-row">
            <div className="leftSec w-full lg:w-[40%]">
              <h2 className="text-[14px] sm:text-[14px] md:text-[16px] lg:text-[20px] font-[600]">Popular Products</h2>
              <p className="text-[12px] sm:text-[14px] md:text-[13px] lg:text-[14px] font-[400] mt-0 mb-0">
                Do not miss the current offers until the end of March.
              </p>
            </div>

            <div className="rightSec w-full lg:w-[60%]">
              <Tabs
                value={value}
                onChange={handleChange}
                variant="scrollable"
                scrollButtons="auto"
                aria-label="scrollable auto tabs example"
              >
                {
                  context?.catData?.length !== 0 && context?.catData?.map((cat, index) => {
                    return (
                      <Tab label={cat?.name} key={index} onClick={() => filterByCatId(cat?._id)} />
                    )
                  })
                }


              </Tabs>
            </div>
          </div>


          <div className="min-h-max lg:min-h-[60vh]">
            {
              popularProductsData?.length === 0 && <ProductLoading />
            }
            {
              popularProductsData?.length !== 0 && <ProductsSlider items={6} data={popularProductsData} />
            }
          </div>

        </div>
      </section>



      <section className="py-6 pt-0 bg-white">
        <div className="container flex flex-col lg:flex-row gap-5">
          {/* Product banner slider - only show if there are products with banners */}
          {hasValidBannerProducts && (
            <div className="part1 w-full lg:w-[70%]">
              <HomeBannerV2 data={productsBanners} />
            </div>
          )}

          {/* Side banners - adjust width when product banner is not shown */}
          {bannerV1Data?.length >= 2 && (
            <div className={`part2 scrollableBox w-full ${hasValidBannerProducts ? 'lg:w-[30%]' : 'lg:w-full'} flex items-center gap-5 justify-between flex-row ${hasValidBannerProducts ? 'lg:flex-col' : 'lg:flex-row'}`}>
              <BannerBoxV2 info={bannerV1Data[bannerV1Data?.length - 1]?.alignInfo} image={bannerV1Data[bannerV1Data?.length - 1]?.images[0]} item={bannerV1Data[bannerV1Data?.length - 1]} />

              <BannerBoxV2 info={bannerV1Data[bannerV1Data?.length - 2]?.alignInfo} image={bannerV1Data[bannerV1Data?.length - 2]?.images[0]} item={bannerV1Data[bannerV1Data?.length - 2]} />
            </div>
          )}
        </div>
      </section>





      <section className="py-0 lg:py-4 pt-0 lg:pt-8 pb-0 bg-white">
        <div className="container">
          <div className="freeShipping w-full md:w-[80%] m-auto py-4 p-4  border-2 border-[#eeb190] flex items-center justify-center lg:justify-between flex-col lg:flex-row rounded-md mb-7">
            <div className="col1 flex items-center gap-4">
              <LiaShippingFastSolid className="text-[30px] lg:text-[50px]" />
              <span className="text-[16px] lg:text-[20px] font-[600] uppercase">
                Free Shipping{" "}
              </span>
            </div>

            <div className="col2">
              <p className="mb-0 mt-0 font-[500] text-center">
                Free Delivery Now On Your First Order and over $200
              </p>
            </div>

            <p className="font-bold text-[20px] lg:text-[25px]">- Only $200*</p>
          </div>

          {
            bannerV1Data?.length !== 0 && <AdsBannerSliderV2 items={4} data={bannerV1Data} />
          }


        </div>
      </section>

      <section className="py-3 lg:py-2 pt-0 bg-white">
        <div className="container">
          <div className="flex items-center justify-between">
            <h2 className="text-[20px] font-[600]">Latest Products</h2>
            <Link to="/products">
              <Button className="!bg-gray-100 hover:!bg-gray-200 !text-gray-800 !capitalize !px-3 !border !border-[rgba(0,0,0,0.4)]" size="small" >View All <MdArrowRightAlt size={25} /></Button>
            </Link>
          </div>

          {
            productsData?.length === 0 && <ProductLoading />
          }

          {
            productsData?.length !== 0 && <ProductsSlider items={6} data={productsData} />
          }



        </div>
      </section>

      {/* 🎁 Perfect Gift Guide Section */}
      <section className="container py-4">
        <GiftsSection />
      </section>

      <section className="py-2 lg:py-0 pt-0 bg-white">
        <div className="container">
          <h2 className="text-[20px] font-[600]">Featured Products</h2>

          {
            featuredProducts?.length === 0 && <ProductLoading />
          }


          {
            featuredProducts?.length !== 0 && <ProductsSlider items={6} data={featuredProducts} />
          }

          {
            bannerList2Data?.length !== 0 && <AdsBannerSlider items={4} data={bannerList2Data} />
          }



        </div>
      </section>

      {/* 🧠 AI-Powered Personalized Recommendations */}
      <section className="container py-4">
        <PersonalizedRecommendations />
      </section>

      {/* 🔍 Daily Discover - Random Picks */}
      <section className="container py-4">
        <DailyDiscover />
      </section>

      {
        randomCatProducts?.length !== 0 && randomCatProducts?.map((productRow, index) => {
          if (productRow?.catName !== undefined && productRow?.data?.length !== 0)
            return (
              <section className="py-5 pt-0 bg-white" key={index}>
                <div className="container">
                  <div className="flex items-center justify-between">
                    <h2 className="text-[20px] font-[600]">{productRow?.catName}</h2>
                    {
                      productRow?.data?.length > 6 &&
                      <Link to={`/products?catId=${productRow?.data[0]?.catId || productRow?.data[0]?.category?._id || productRow?.data[0]?.category}`}>
                        <Button className="!bg-gray-100 hover:!bg-gray-200 !text-gray-800 !capitalize !px-3 !border !border-[rgba(0,0,0,0.4)]" size="small" >View All <MdArrowRightAlt size={25} /></Button>
                      </Link>
                    }

                  </div>




                  {
                    productRow?.data?.length === 0 && <ProductLoading />
                  }

                  {
                    productRow?.data?.length !== 0 && <ProductsSlider items={6} data={productRow?.data} />
                  }



                </div>
              </section>)
        })

      }


      {
        blogData?.length !== 0 &&
        <section className="py-5 pb-8 pt-0 bg-white blogSection">
          <div className="container">
            <h2 className="text-[20px] font-[600] mb-4">From The Blog</h2>
            <Swiper
              slidesPerView={4}
              spaceBetween={30}
              navigation={context?.windowWidth < 992 ? false : true}
              modules={[Navigation, FreeMode]}
              freeMode={true}
              breakpoints={{
                250: {
                  slidesPerView: 1,
                  spaceBetween: 10,
                },
                330: {
                  slidesPerView: 1,
                  spaceBetween: 10,
                },
                500: {
                  slidesPerView: 2,
                  spaceBetween: 20,
                },
                700: {
                  slidesPerView: 3,
                  spaceBetween: 20,
                },
                1100: {
                  slidesPerView: 4,
                  spaceBetween: 30,
                },
              }}
              className="blogSlider"
            >
              {
                blogData?.slice()?.reverse()?.map((item, index) => {
                  return (
                    <SwiperSlide key={index}>
                      <BlogItem item={item} />
                    </SwiperSlide>
                  )
                })
              }



            </Swiper>
          </div>
        </section>
      }



    </>
  );
};

export default Home;
