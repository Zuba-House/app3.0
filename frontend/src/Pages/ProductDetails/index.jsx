import React, { useEffect, useRef, useState } from "react";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import { Link, useParams } from "react-router-dom";
import { ProductZoom } from "../../components/ProductZoom";
import ProductsSlider from '../../components/ProductsSlider';
import { ProductDetailsComponent } from "../../components/ProductDetails";

import { fetchDataFromApi } from "../../utils/api";
import CircularProgress from '@mui/material/CircularProgress';
import { Reviews } from "./reviews";
import { normalizeProduct } from "../../utils/productNormalizer";
import { isInStock } from "../../utils/productUtils";
import { ProductSEO, BreadcrumbSEO } from "../../components/SEO";

export const ProductDetails = () => {

  const [activeTab, setActiveTab] = useState(0);
  const [productData, setProductData] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [reviewsCount, setReviewsCount] = useState(0);
  const [relatedProductData, setRelatedProductData] = useState([]);
  const [selectedVariation, setSelectedVariation] = useState(null);

  const { id } = useParams();

  const reviewSec = useRef();

  useEffect(() => {
    fetchDataFromApi(`/api/user/getReviews?productId=${id}`).then((res) => {
      if (res?.error === false) {
        setReviewsCount(res.reviews.length)
      }
    })

  }, [reviewsCount])

  useEffect(() => {
    setIsLoading(true);
    fetchDataFromApi(`/api/product/${id}`).then((res) => {
      if (res?.error === false) {
        // Debug: Log raw product data from API
        console.log('ProductDetails - Raw product from API:', {
          id: res?.product?._id,
          name: res?.product?.name,
          productType: res?.product?.productType,
          hasVariations: !!res?.product?.variations,
          variationsCount: res?.product?.variations?.length || 0,
          hasAttributes: !!res?.product?.attributes,
          attributesCount: res?.product?.attributes?.length || 0,
          variations: res?.product?.variations,
          attributes: res?.product?.attributes
        });

        // Normalize product data to handle both old and new formats
        const normalizedProduct = normalizeProduct(res?.product);
        
        // Debug: Log normalized product data
        console.log('ProductDetails - Normalized product:', {
          id: normalizedProduct?._id,
          name: normalizedProduct?.name,
          productType: normalizedProduct?.productType,
          hasVariations: !!normalizedProduct?.variations,
          variationsCount: normalizedProduct?.variations?.length || 0,
          hasAttributes: !!normalizedProduct?.attributes,
          attributesCount: normalizedProduct?.attributes?.length || 0,
          variations: normalizedProduct?.variations,
          attributes: normalizedProduct?.attributes
        });
        
        setProductData(normalizedProduct);

        fetchDataFromApi(`/api/product/getAllProductsBySubCatId/${res?.product?.subCatId}`).then((res) => {
          if (res?.error === false) {
           const filteredData = res?.products?.filter((item) => item._id !== id);
            setRelatedProductData(filteredData)
          }
        })

        setTimeout(() => {
          setIsLoading(false);
        }, 700);
      }
    })


    window.scrollTo(0, 0)
  }, [id])


  const gotoReviews = () => {
    window.scrollTo({
      top: reviewSec?.current.offsetTop - 170,
      behavior: 'smooth',
    })

    setActiveTab(1)

  }

  return (
    <>
      {/* SEO Meta Tags and JSON-LD Structured Data */}
      {productData && (
        <>
          <ProductSEO product={productData} url={`/product/${id}`} />
          <BreadcrumbSEO items={[
            { name: 'Home', url: '/' },
            { name: productData.catName || 'Products', url: '/products' },
            { name: productData.name }
          ]} />
        </>
      )}

      <div className="py-5 hidden">
        <div className="container">
          <Breadcrumbs aria-label="breadcrumb">
            <Link
              underline="hover"
              color="inherit"
              to="/"
              className="link transition !text-[14px]"
            >
              Home
            </Link>
            <Link
              underline="hover"
              color="inherit"
              to="/"
              className="link transition !text-[14px]"
            >
              Fashion
            </Link>

            <Link
              underline="hover"
              color="inherit"
              className="link transition !text-[14px]"
            >
              Cropped Satin Bomber Jacket
            </Link>
          </Breadcrumbs>
        </div>
      </div>



      <section className="bg-white py-5">
        {
          isLoading === true ?
            <div className="flex items-center justify-center min-h-[300px]">
              <CircularProgress />
            </div>


            :


            <>
              <div className="container">
                <div className="flex gap-8 flex-col lg:flex-row items-start lg:items-start">
                  {/* Product Images - Left Side */}
                  <div className="productZoomContainer w-full lg:w-[45%] lg:sticky lg:top-20">
                    <ProductZoom 
                      images={(() => {
                        // If variation has images, use them
                        if (selectedVariation) {
                          // Check for images array first (new format)
                          if (selectedVariation.images && Array.isArray(selectedVariation.images) && selectedVariation.images.length > 0) {
                            const variationImages = selectedVariation.images.map(img => 
                              typeof img === 'string' ? img : (img.url || img)
                            ).filter(Boolean);
                            // Add product images that aren't already in variation images
                            const productImages = (productData?.images || []).filter(img => {
                              const imgUrl = typeof img === 'string' ? img : (img.url || img);
                              return !variationImages.includes(imgUrl);
                            });
                            return [...variationImages, ...productImages];
                          }
                          // Fallback to legacy single image field
                          if (selectedVariation.image) {
                            const variationImage = typeof selectedVariation.image === 'string' 
                              ? selectedVariation.image 
                              : selectedVariation.image.url || selectedVariation.image;
                            // Put variation image first, then product images
                            const productImages = (productData?.images || []).filter(img => {
                              const imgUrl = typeof img === 'string' ? img : img.url || img;
                              return imgUrl !== variationImage; // Remove duplicate
                            });
                            return [variationImage, ...productImages];
                          }
                        }
                        // Otherwise use product images
                        return productData?.images || [];
                      })()}
                    />
                  </div>

                  {/* Product Details - Right Side */}
                  <div className="productContent w-full lg:w-[55%] pr-2 pl-2 lg:pr-8 lg:pl-8">
                    <ProductDetailsComponent 
                      item={productData} 
                      reviewsCount={reviewsCount} 
                      gotoReviews={gotoReviews}
                      onVariationChange={setSelectedVariation}
                    />
                  </div>
                </div>
              </div>

              <div className="container pt-10">
                <div className="flex items-center gap-8 mb-5">
                  <span
                    className={`link text-[17px] cursor-pointer font-[500] ${activeTab === 0 && "text-primary"
                      }`}
                    onClick={() => setActiveTab(0)}
                  >
                    Description
                  </span>


                  <span
                    className={`link text-[17px] cursor-pointer font-[500] ${activeTab === 1 && "text-primary"
                      }`}
                    onClick={() => setActiveTab(1)}
                    ref={reviewSec}
                  >
                    Reviews ({reviewsCount})
                  </span>
                </div>

                {activeTab === 0 && (
                  <div className="shadow-md w-full py-5 px-8 rounded-md">
                    {/* Short Description */}
                    {productData?.shortDescription && (
                      <div className="mb-6 bg-blue-50 border-l-4 border-blue-600 p-4 rounded">
                        <h3 className="font-semibold text-lg mb-2 text-blue-900">Quick Overview</h3>
                        <p className="text-[14px] text-gray-800 leading-relaxed">
                          {productData.shortDescription}
                        </p>
                      </div>
                    )}

                    {/* Full Description */}
                    {productData?.description && (
                      <div className="mb-6">
                        <h3 className="font-semibold text-lg mb-3 text-gray-900">Full Description</h3>
                        <div className="text-[14px] text-gray-700 leading-relaxed whitespace-pre-line">
                          {productData.description}
                        </div>
                      </div>
                    )}

                    {/* Product Specifications */}
                    <div className="mb-6">
                      <h3 className="font-semibold text-lg mb-3 text-gray-900">Specifications</h3>
                      <table className="w-full border-collapse">
                        <tbody>
                          {/* Brand */}
                          {productData?.brand && (
                            <tr className="border-b">
                              <td className="py-3 px-4 bg-gray-50 font-medium text-gray-700 w-1/3">Brand</td>
                              <td className="py-3 px-4 text-gray-800">{productData.brand}</td>
                            </tr>
                          )}
                          {/* Category */}
                          {productData?.category?.name && (
                            <tr className="border-b">
                              <td className="py-3 px-4 bg-gray-50 font-medium text-gray-700">Category</td>
                              <td className="py-3 px-4 text-gray-800">{productData.category.name}</td>
                            </tr>
                          )}
                          {/* Dimensions - Check variation first, then product */}
                          {(() => {
                            const dimensions = selectedVariation?.dimensions || 
                                             productData?.shipping?.dimensions || 
                                             productData?.dimensions ||
                                             productData?.inventory?.dimensions;
                            if (dimensions && dimensions.length && dimensions.width && dimensions.height) {
                              return (
                                <tr className="border-b">
                                  <td className="py-3 px-4 bg-gray-50 font-medium text-gray-700">
                                    Dimensions (L×W×H)
                                    {selectedVariation && <span className="text-xs text-gray-500 ml-2">(Selected Variation)</span>}
                                  </td>
                                  <td className="py-3 px-4 text-gray-800">
                                    {dimensions.length} × {dimensions.width} × {dimensions.height} {dimensions.unit || 'cm'}
                                  </td>
                                </tr>
                              );
                            }
                            return null;
                          })()}
                          {/* Weight - Check variation first, then product */}
                          {(() => {
                            const weight = selectedVariation?.weight || 
                                         productData?.shipping?.weight || 
                                         productData?.weight ||
                                         productData?.inventory?.weight;
                            const weightUnit = selectedVariation?.weightUnit || 
                                             productData?.shipping?.weightUnit || 
                                             productData?.weightUnit ||
                                             productData?.inventory?.weightUnit ||
                                             'kg';
                            if (weight) {
                              return (
                                <tr className="border-b">
                                  <td className="py-3 px-4 bg-gray-50 font-medium text-gray-700">
                                    Weight
                                    {selectedVariation && <span className="text-xs text-gray-500 ml-2">(Selected Variation)</span>}
                                  </td>
                                  <td className="py-3 px-4 text-gray-800">
                                    {weight} {weightUnit}
                                  </td>
                                </tr>
                              );
                            }
                            return null;
                          })()}
                          {/* Tags */}
                          {productData?.tags && productData.tags.length > 0 && (
                            <tr className="border-b">
                              <td className="py-3 px-4 bg-gray-50 font-medium text-gray-700">Tags</td>
                              <td className="py-3 px-4">
                                <div className="flex flex-wrap gap-2">
                                  {productData.tags.map((tag, index) => (
                                    <span
                                      key={index}
                                      className="inline-block bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded"
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              </td>
                            </tr>
                          )}
                          {/* Stock Status */}
                          <tr className="border-b">
                            <td className="py-3 px-4 bg-gray-50 font-medium text-gray-700">Availability</td>
                            <td className="py-3 px-4">
                              {(() => {
                                // Check actual stock status
                                let isAvailable = false;
                                let displayText = 'Out of Stock';
                                let statusClass = 'bg-red-100 text-red-800';
                                
                                // If variation is selected, check variation stock
                                if (selectedVariation) {
                                  if (selectedVariation.endlessStock) {
                                    isAvailable = true;
                                    displayText = 'Available (Unlimited)';
                                    statusClass = 'bg-green-100 text-green-800';
                                  } else {
                                    const stock = Number(selectedVariation.stock || 0);
                                    const stockStatus = selectedVariation.stockStatus || (stock > 0 ? 'in_stock' : 'out_of_stock');
                                    isAvailable = stockStatus === 'in_stock' && stock > 0 && (selectedVariation.isActive !== false);
                                    displayText = isAvailable ? `In Stock (${stock} available)` : 'Out of Stock';
                                    statusClass = isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
                                  }
                                } else {
                                  // Use the utility function to check stock
                                  isAvailable = isInStock(productData);
                                  
                                  // Check for endless stock
                                  if (productData?.inventory?.endlessStock) {
                                    displayText = 'Available (Unlimited)';
                                    statusClass = 'bg-green-100 text-green-800';
                                  } else if (productData?.productType === 'variable' || productData?.type === 'variable') {
                                    // For variable products, check if any variation is in stock
                                    if (Array.isArray(productData.variations) && productData.variations.length > 0) {
                                      const hasInStock = productData.variations.some(v => {
                                        if (!v || v.isActive === false) return false;
                                        if (v.endlessStock) return true;
                                        const stock = Number(v.stock || 0);
                                        const stockStatus = v.stockStatus || (stock > 0 ? 'in_stock' : 'out_of_stock');
                                        return stockStatus === 'in_stock' && stock > 0;
                                      });
                                      displayText = hasInStock ? 'In Stock' : 'Out of Stock';
                                      statusClass = hasInStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
                                    } else {
                                      displayText = 'Out of Stock';
                                      statusClass = 'bg-red-100 text-red-800';
                                    }
                                  } else {
                                    // Simple product
                                    const stock = productData?.countInStock || productData?.stock || productData?.inventory?.stock || 0;
                                    displayText = isAvailable ? (stock > 0 ? `In Stock (${stock} available)` : 'In Stock') : 'Out of Stock';
                                    statusClass = isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
                                  }
                                }
                                
                                return (
                                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${statusClass}`}>
                                    {displayText}
                                  </span>
                                );
                              })()}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}


                {activeTab === 1 && (
                  <div className="shadow-none lg:shadow-md w-full sm:w-[80%] py-0  lg:py-5 px-0 lg:px-8 rounded-md">
                    {
                      productData?.length !== 0 && <Reviews productId={productData?._id} setReviewsCount={setReviewsCount} />
                    }

                  </div>
                )}
              </div>

              {
                relatedProductData?.length !== 0 &&
                <div className="container pt-8">
                  <h2 className="text-[20px] font-[600] pb-0">Related Products</h2>
                  <ProductsSlider items={6} data={relatedProductData}/>
                </div>
              }


            </>

        }




      </section>
    </>
  );
};
