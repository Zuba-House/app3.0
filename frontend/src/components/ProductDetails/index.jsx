import React, { useContext, useEffect, useState } from "react";
import Button from "@mui/material/Button";
import { QtyBox } from "../QtyBox";
import Rating from "@mui/material/Rating";
import { MdOutlineShoppingCart } from "react-icons/md";
import { FaRegHeart } from "react-icons/fa";
import { MyContext } from "../../App";
import CircularProgress from '@mui/material/CircularProgress';
import { postData } from "../../utils/api";
import { FaCheckDouble } from "react-icons/fa";
import { IoMdHeart } from "react-icons/io";
import { formatCurrency } from "../../utils/currency";
import { normalizeProduct } from "../../utils/productNormalizer";
import ProductVariations from "../ProductVariations";
import { MdExpandMore, MdExpandLess } from "react-icons/md";
import Collapse from "@mui/material/Collapse";



export const ProductDetailsComponent = (props) => {
  // Normalize product data to ensure consistent structure
  const product = normalizeProduct(props?.item);
  
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [isAddedInMyList, setIsAddedInMyList] = useState(false);
  const [selectedVariation, setSelectedVariation] = useState(null);
  const [showMoreInfo, setShowMoreInfo] = useState(false);

  // Handle variation change from ProductVariations component
  const handleVariationChange = (variation) => {
    setSelectedVariation(variation);
    // Also notify parent if callback provided
    if (props.onVariationChange) {
      props.onVariationChange(variation);
    }
  };

  const context = useContext(MyContext);

  const handleSelecteQty = (qty) => {
    setQuantity(qty);
  }


  useEffect(() => {
    const cartItem = context?.cartData?.filter((cartItem) =>
      cartItem.productId.includes(product?._id)
    )

    if (cartItem?.length !== 0) {
      setIsAdded(true)
    } else {
      setIsAdded(false)
    }

  }, [isAdded, product?._id, context?.cartData])


  useEffect(() => {
    const myListItem = context?.myListData?.filter((listItem) =>
      listItem.productId.includes(product?._id)
    )


    if (myListItem?.length !== 0) {
      setIsAddedInMyList(true);
    } else {
      setIsAddedInMyList(false)
    }

  }, [context?.myListData, product?._id])

  // Helper function to check if stock is truly available (checks both quantity AND status)
  const isStockAvailable = (variation, prod) => {
    if (variation) {
      // Check variation stock status first (admin can mark as out_of_stock)
      if (variation.stockStatus === 'out_of_stock') return false;
      if (variation.isActive === false) return false;
      // Endless stock is always available
      if (variation.endlessStock) return true;
      // Check actual stock quantity
      return Number(variation.stock || 0) > 0;
    } else {
      // Check product stock status
      if (prod?.stockStatus === 'out_of_stock') return false;
      if (prod?.inventory?.stockStatus === 'out_of_stock') return false;
      // Endless stock is always available
      if (prod?.inventory?.endlessStock) return true;
      // Check actual stock quantity
      return Number(prod?.countInStock || prod?.stock || 0) > 0;
    }
  };

  // Helper to get current stock quantity
  const getStockQuantity = (variation, prod) => {
    if (variation) {
      if (variation.endlessStock) return null; // null = unlimited
      return Number(variation.stock || 0);
    } else {
      if (prod?.inventory?.endlessStock) return null;
      return Number(prod?.countInStock || prod?.stock || 0);
    }
  };

  const addToCart = (product, userId, quantity) => {
    // For variable products, require variation selection
    // Simplified check - only look at productType
    const isVariableProduct = product?.productType === 'variable' || product?.type === 'variable';
    
    if (isVariableProduct && !selectedVariation) {
      // Development mode logging
      if (process.env.NODE_ENV === 'development') {
        console.warn('⚠️ Add to Cart blocked: Variable product requires variation selection');
        console.log('Product:', product?.name);
        console.log('ProductType:', product?.productType);
        console.log('Selected Variation:', selectedVariation);
      }
      
      context?.alertBox(
        "error", 
        "Please select all product options (size, color, etc.) before adding to cart"
      );
      return false;
    }

    // Log successful add to cart in dev mode
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ Adding to cart:', {
        product: product?.name,
        isVariable: isVariableProduct,
        variation: selectedVariation,
        quantity: quantity
      });
    }

    // Determine price: use selected variation price if available, otherwise use product price
    const displayPrice = selectedVariation 
      ? (selectedVariation.salePrice || selectedVariation.regularPrice || selectedVariation.price)
      : (product?.salePrice || product?.oldPrice || product?.price);

    // Determine stock using helper (respects both quantity AND stockStatus)
    const stock = getStockQuantity(selectedVariation, product);

    // Check stock availability using helper (checks BOTH stockStatus AND quantity)
    if (!isStockAvailable(selectedVariation, product)) {
      context?.alertBox("error", "This product is out of stock");
      return false;
    }
    
    if (stock !== null && stock < quantity) {
      context?.alertBox("error", `Only ${stock} items available in stock`);
      return false;
    }

    // Normalize image URL (handle both string and object formats)
    const getImageUrl = (img) => {
      if (!img) return '';
      if (typeof img === 'string') return img;
      if (typeof img === 'object' && img.url) return img.url;
      if (typeof img === 'object' && img.secureUrl) return img.secureUrl;
      return '';
    };

    const productItem = {
      _id: selectedVariation?._id || product?._id,
      productId: product?._id,
      variationId: selectedVariation?._id || null,
      name: product?.name || '',
      image: getImageUrl(selectedVariation?.image) || getImageUrl(product?.images?.[0]) || getImageUrl(product?.featuredImage) || '',
      rating: product?.rating || 0,
      price: parseFloat(displayPrice) || 0,
      oldPrice: product?.oldPrice ? parseFloat(product.oldPrice) : null,
      discount: product?.discount || 0,
      countInStock: parseInt(stock) || 0,
      brand: product?.brand || '',
      productType: product?.productType || (product?.variations && product.variations.length > 0 ? 'variable' : 'simple'),
      variation: selectedVariation ? {
        _id: selectedVariation._id,
        attributes: selectedVariation.attributes || [],
        sku: selectedVariation.sku || '',
        image: getImageUrl(selectedVariation.image) || '',
        price: selectedVariation.price,
        salePrice: selectedVariation.salePrice,
        regularPrice: selectedVariation.regularPrice
      } : null
    }

    setIsLoading(true);
    
    // Use context.addToCart which handles both guest and logged-in users
    const result = context?.addToCart(productItem, context?.userData?._id, quantity);
    
    if (result !== false) {
        setTimeout(() => {
          setIsLoading(false);
        setIsAdded(true);
        }, 500);
      } else {
        setTimeout(() => {
          setIsLoading(false);
        }, 500);
      }
  }


  const handleAddToMyList = (item) => {
    if (context?.userData === null) {
      context?.alertBox("error", "you are not login please login first");
      return false
    }

    else {
      // Determine price: use salePrice if available, fallback to oldPrice, then price
      const displayPrice = product?.salePrice || product?.oldPrice || product?.price;

      const obj = {
        productId: product?._id,
        userId: context?.userData?._id,
        productTitle: product?.name,
        image: product?.images?.[0] || product?.featuredImage || '',
        rating: product?.rating,
        price: displayPrice,
        brand: product?.brand,
      }

      postData("/api/myList/add", obj).then((res) => {
        if (res?.error === false) {
          context?.alertBox("success", res?.message);
          setIsAddedInMyList(true);
          context?.getMyListData();
        } else {
          context?.alertBox("error", res?.message);
        }
      })

    }
  }


  return (
    <div className="product-details-wrapper">
      {/* Product Title */}
      <h1 className="text-[24px] sm:text-[28px] lg:text-[32px] font-[700] mb-3 text-gray-900">
        {product?.name}
      </h1>

      {/* Brand and Rating */}
      <div className="flex items-center flex-wrap gap-4 mb-4">
        {product?.brand && (
          <span className="text-gray-600 text-[14px]">
            <span className="font-[500] text-gray-800">Brand:</span> {product?.brand}
          </span>
        )}
        <div className="flex items-center gap-2">
          <Rating name="size-small" value={product?.rating || 0} size="small" readOnly />
          <span className="text-[13px] text-gray-600 cursor-pointer hover:text-primary transition" onClick={props.gotoReviews}>
            ({props.reviewsCount || 0} Reviews)
          </span>
        </div>
      </div>

      {/* Pricing */}
      <div className="mb-4">
        <div className="flex items-center gap-4 flex-wrap">
          {(() => {
            // Use variation price if selected, otherwise use product price
            let salePrice, regularPrice;
            
            if (selectedVariation) {
              salePrice = selectedVariation.salePrice;
              regularPrice = selectedVariation.regularPrice || selectedVariation.price;
            } else {
              salePrice = product?.salePrice;
              regularPrice = product?.oldPrice || product?.price;
            }
            
            if (salePrice && salePrice < regularPrice) {
              // Product is on sale - show regular price crossed out, sale price as current
              return (
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center gap-1">
                    <span className="oldPrice line-through text-gray-400 text-[20px] sm:text-[22px] font-[500]">
                      {formatCurrency(regularPrice)}
                    </span>
                    <span className="text-[12px] sm:text-[14px] text-gray-400 font-[400] line-through">USD</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="price text-primary text-[24px] sm:text-[28px] font-[700]">
                      {formatCurrency(salePrice)}
                    </span>
                    <span className="text-[14px] sm:text-[16px] text-gray-600 font-[500]">USD</span>
                  </div>
                </div>
              );
            } else {
              // No sale - show regular price only
              return (
                <div className="flex items-center gap-2">
                  <span className="price text-primary text-[24px] sm:text-[28px] font-[700]">
                    {formatCurrency(regularPrice)}
                  </span>
                  <span className="text-[14px] sm:text-[16px] text-gray-600 font-[500]">USD</span>
                </div>
              );
            }
          })()}
        </div>
      </div>

      {/* Short Description - Compact, visible without scrolling */}
      {product?.shortDescription && (
        <div className="mb-4 bg-blue-50 border-l-4 border-blue-600 p-3 sm:p-4 rounded">
          <p className="text-[13px] sm:text-[14px] text-gray-800 font-medium leading-relaxed line-clamp-3">
            {product?.shortDescription}
          </p>
        </div>
      )}

      {/* Product Variations - Moved up for visibility */}
      {(() => {
        // Show variations if product is variable OR has variations/attributes
        const shouldShowVariations = product?.productType === 'variable' || 
                                    (product?.variations && product.variations.length > 0) ||
                                    (product?.attributes && product.attributes.length > 0);

        if (shouldShowVariations) {
          return (
            <div className="mb-4">
              <ProductVariations 
                product={product} 
                onVariationSelect={handleVariationChange}
                selectedVariation={selectedVariation}
              />
            </div>
          );
        }
        
        return null;
      })()}

      {/* Stock display - Compact, moved up */}
      <div className="mb-4 p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[13px] sm:text-[14px] font-[600] text-gray-700">
            Availability:
          </span>
          <span className={`text-[13px] sm:text-[14px] font-bold ${
            isStockAvailable(selectedVariation, product) ? 'text-green-600' : 'text-red-600'
          }`}>
            {(() => {
              // Check if truly available (respects stockStatus)
              const available = isStockAvailable(selectedVariation, product);
              const stockQty = getStockQuantity(selectedVariation, product);
              
              if (!available) {
                return 'Out of Stock';
              }
              
              if (stockQty === null) {
                return 'Available (Unlimited)';
              }
              
              return `${stockQty} Items Available`;
            })()}
          </span>
        </div>
      </div>

      {/* Quantity and Add to Cart - Moved up, clearly visible */}
      <div className="mb-4">
        <div className="flex items-center gap-4 flex-wrap mb-3">
          <div className="qtyBoxWrapper">
            <label className="block text-[13px] font-[600] text-gray-700 mb-2">Quantity:</label>
            <QtyBox handleSelecteQty={handleSelecteQty} />
          </div>
        </div>
        
        <div className="mt-3">
          <Button 
            className="btn-org flex gap-2 !min-w-[200px] !py-3 !text-[15px] sm:!text-[16px] !font-[600]" 
            onClick={() => addToCart(product, context?.userData?._id, quantity)}
            disabled={isLoading || !isStockAvailable(selectedVariation, product)}
            fullWidth
            sx={{
              backgroundColor: '#efb291',
              color: '#0b2735',
              '&:hover': {
                backgroundColor: '#e5a080',
              },
              '&.Mui-disabled': {
                backgroundColor: '#d1d5db',
                color: '#9ca3af'
              }
            }}
          >
            {
              isLoading === true ? (
                <CircularProgress size={20} sx={{ color: '#0b2735' }} />
              ) : !isStockAvailable(selectedVariation, product) ? (
                <>Out of Stock</>
              ) : (
                <>
                  {
                    isAdded === true ? (
                      <>
                        <FaCheckDouble className="text-[18px] sm:text-[20px]" /> Added to Cart
                      </>
                    ) : (
                      <>
                        <MdOutlineShoppingCart className="text-[20px] sm:text-[22px]" /> Add to Cart
                      </>
                    )
                  }
                </>
              )
            }
          </Button>
        </div>
      </div>

      {/* Wishlist - Compact */}
      <div className="flex items-center gap-6 mb-4 pb-4 border-b border-gray-200">
        <span 
          className="flex items-center gap-2 text-[13px] sm:text-[14px] text-gray-700 cursor-pointer font-[500] hover:text-primary transition-colors" 
          onClick={() => handleAddToMyList(product)}
        >
          {
            isAddedInMyList === true ? (
              <IoMdHeart className="text-[18px] sm:text-[20px] text-primary" />
            ) : (
              <FaRegHeart className="text-[18px] sm:text-[20px]" />
            )
          }
          Add to Wishlist
        </span>
      </div>

      {/* More Info - Collapsible Section */}
      <div className="mt-4">
        <Button
          onClick={() => setShowMoreInfo(!showMoreInfo)}
          className="!text-gray-700 !font-[600] !text-[14px] !capitalize !justify-start !p-0 !min-h-0"
          endIcon={showMoreInfo ? <MdExpandLess /> : <MdExpandMore />}
        >
          {showMoreInfo ? 'Hide' : 'Show'} More Information
        </Button>
        
        <Collapse in={showMoreInfo}>
          <div className="mt-4 space-y-4">
            {/* Full Description */}
            {product?.description && (
              <div className="mb-4">
                <h3 className="text-[15px] font-[600] mb-2 text-gray-800">Full Description</h3>
                <p className="text-[13px] sm:text-[14px] text-gray-700 leading-relaxed whitespace-pre-line">
                  {product?.description}
                </p>
              </div>
            )}

            {/* Product Specifications - Check variation first, then product */}
            {(() => {
              // Get dimensions and weight from variation if selected, otherwise from product
              const dimensions = selectedVariation?.dimensions || 
                               product?.shipping?.dimensions || 
                               product?.dimensions ||
                               product?.inventory?.dimensions;
              const weight = selectedVariation?.weight || 
                           product?.shipping?.weight || 
                           product?.weight ||
                           product?.inventory?.weight;
              const weightUnit = selectedVariation?.weightUnit || 
                               product?.shipping?.weightUnit || 
                               product?.weightUnit ||
                               product?.inventory?.weightUnit ||
                               'kg';
              
              if (dimensions || weight) {
                return (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-[14px] font-[600] mb-3 text-gray-800">
                      Product Specifications
                      {selectedVariation && <span className="text-xs text-gray-500 ml-2 font-normal">(Selected Variation)</span>}
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[13px] sm:text-[14px]">
                      {dimensions && dimensions.length && dimensions.width && dimensions.height && (
                        <div>
                          <span className="text-gray-600">Dimensions:</span>
                          <span className="ml-2 font-medium text-gray-800">
                            {dimensions.length} × {dimensions.width} × {dimensions.height} {dimensions.unit || 'cm'}
                          </span>
                        </div>
                      )}
                      {weight && (
                        <div>
                          <span className="text-gray-600">Weight:</span>
                          <span className="ml-2 font-medium text-gray-800">
                            {weight} {weightUnit}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              }
              return null;
            })()}

            {/* Product Tags */}
            {product?.tags && product.tags.length > 0 && (
              <div>
                <h4 className="text-[14px] font-[600] mb-2 text-gray-800">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-block bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full hover:bg-blue-100 hover:text-blue-700 cursor-pointer transition"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Collapse>
      </div>
    </div>
  );
};
