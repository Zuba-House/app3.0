import React, { useEffect, useRef, useState } from 'react';
import InnerImageZoom from "react-inner-image-zoom";
import "react-inner-image-zoom/lib/InnerImageZoom/styles.css";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import { Navigation } from "swiper/modules";
import { useParams } from 'react-router-dom';
import { fetchDataFromApi, postData } from '../../utils/api';
import { MdBrandingWatermark } from "react-icons/md";
import { BiSolidCategoryAlt } from "react-icons/bi";
import { MdFilterVintage } from "react-icons/md";
import { MdRateReview } from "react-icons/md";
import { BsPatchCheckFill } from "react-icons/bs";
import Rating from '@mui/material/Rating';
import CircularProgress from '@mui/material/CircularProgress';
// import VariationsManager from './VariationsManager'; // Removed - variations section disabled

// Admin Review Management Component
const AdminReviewManagement = ({ productId }) => {
    const [reviews, setReviews] = useState([]);
    const [statusCounts, setStatusCounts] = useState({});
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState('all');

    useEffect(() => {
        if (productId) {
            loadReviews();
        }
    }, [productId]);

    const loadReviews = async () => {
        setLoading(true);
        try {
            const res = await fetchDataFromApi(`/api/user/getProductReviewsAdmin/${productId}`);
            if (res?.success) {
                setReviews(res.reviews || []);
                setStatusCounts(res.statusCounts || {});
            }
        } catch (error) {
            console.error('Error loading reviews:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (reviewId) => {
        try {
            const res = await postData(`/api/user/reviews/${reviewId}/approve`, {});
            if (res.success) {
                alert('✅ Review approved!');
                loadReviews();
            } else {
                alert('❌ Failed to approve review');
            }
        } catch (error) {
            alert('❌ Failed to approve review');
        }
    };

    const handleReject = async (reviewId) => {
        const reason = prompt('Reason for rejection (optional):');
        try {
            const res = await postData(`/api/user/reviews/${reviewId}/reject`, { reason: reason || '' });
            if (res.success) {
                alert('✅ Review rejected');
                loadReviews();
            } else {
                alert('❌ Failed to reject review');
            }
        } catch (error) {
            alert('❌ Failed to reject review');
        }
    };

    const handleSpam = async (reviewId) => {
        if (!window.confirm('Mark this review as spam?')) return;
        try {
            const res = await postData(`/api/user/reviews/${reviewId}/spam`, {});
            if (res.success) {
                alert('✅ Marked as spam');
                loadReviews();
            } else {
                alert('❌ Failed to mark as spam');
            }
        } catch (error) {
            alert('❌ Failed to mark as spam');
        }
    };

    const renderStars = (rating) => {
        return '★'.repeat(rating) + '☆'.repeat(5 - rating);
    };

    const filteredReviews = activeFilter === 'all' 
        ? reviews 
        : reviews.filter(r => r.status === activeFilter);

    if (loading) {
        return (
            <div className="mt-8 bg-white rounded-lg shadow-md p-6">
                <div className="text-center py-8">Loading reviews...</div>
            </div>
        );
    }

    return (
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <MdRateReview className="text-[20px]" />
                Product Reviews Management ({statusCounts.all || 0})
            </h3>
            
            {/* Status Filter Tabs */}
            <div className="flex gap-2 mb-6 flex-wrap">
                {['all', 'pending', 'approved', 'rejected', 'spam'].map((status) => (
                    <button
                        key={status}
                        onClick={() => setActiveFilter(status)}
                        className={`px-4 py-2 rounded-lg font-medium transition ${
                            activeFilter === status
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                        {statusCounts[status] > 0 && (
                            <span className="ml-2 bg-white text-blue-600 px-2 py-0.5 rounded-full text-xs">
                                {statusCounts[status]}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Reviews List */}
            {filteredReviews.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                    No {activeFilter !== 'all' ? activeFilter : ''} reviews found
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredReviews.map((review) => (
                        <div
                            key={review._id}
                            className={`border rounded-lg p-4 ${
                                review.status === 'pending' ? 'bg-yellow-50 border-yellow-300' :
                                review.status === 'approved' ? 'bg-green-50 border-green-300' :
                                review.status === 'rejected' ? 'bg-red-50 border-red-300' :
                                'bg-gray-50 border-gray-300'
                            }`}
                        >
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <span className="font-semibold">{review.userName || review.customerName || 'Guest'}</span>
                                        <span className="text-yellow-500 text-lg">
                                            {renderStars(review.rating)}
                                        </span>
                                        {review.verifiedPurchase && (
                                            <span className="text-xs bg-green-500 text-white px-2 py-1 rounded">
                                                ✓ Verified
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        {review.customerEmail && <span>{review.customerEmail} • </span>}
                                        <span>{new Date(review.createdAt).toLocaleString()}</span>
                                    </div>
                                </div>
                                <span
                                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                                        review.status === 'approved' ? 'bg-green-500 text-white' :
                                        review.status === 'pending' ? 'bg-yellow-500 text-white' :
                                        review.status === 'rejected' ? 'bg-red-500 text-white' :
                                        'bg-gray-500 text-white'
                                    }`}
                                >
                                    {review.status.toUpperCase()}
                                </span>
                            </div>
                            <p className="text-gray-700 mb-4">{review.review}</p>
                            
                            {/* Action Buttons */}
                            <div className="flex gap-2 flex-wrap">
                                {review.status !== 'approved' && (
                                    <button
                                        onClick={() => handleApprove(review._id)}
                                        className="flex items-center gap-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition text-sm"
                                    >
                                        ✓ Approve
                                    </button>
                                )}
                                {review.status !== 'rejected' && (
                                    <button
                                        onClick={() => handleReject(review._id)}
                                        className="flex items-center gap-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition text-sm"
                                    >
                                        ✗ Reject
                                    </button>
                                )}
                                {review.status !== 'spam' && (
                                    <button
                                        onClick={() => handleSpam(review._id)}
                                        className="flex items-center gap-1 px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 transition text-sm"
                                    >
                                        ⚠ Spam
                                    </button>
                                )}
                            </div>
                            
                            {/* Admin Note (if rejected) */}
                            {review.rejectionReason && (
                                <div className="mt-3 p-3 bg-white border border-gray-300 rounded">
                                    <span className="text-sm font-medium text-gray-700">Admin Note:</span>
                                    <p className="text-sm text-gray-600">{review.rejectionReason}</p>
                                </div>
                            )}
                            
                            {/* Reviewed By Info */}
                            {review.approvedBy && (
                                <div className="mt-2 text-xs text-gray-500">
                                    Reviewed by {review.approvedBy?.name || 'Admin'} on {new Date(review.approvedAt).toLocaleString()}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const ProductDetails = () => {

    const [slideIndex, setSlideIndex] = useState(0);
    const [product, setProduct] = useState();
    const [reviewsData, setReviewsData] = useState([])
    const zoomSliderBig = useRef();
    const zoomSliderSml = useRef();

    const { id } = useParams();


    useEffect(() => {
        fetchDataFromApi(`/api/user/getReviews?productId=${id}`).then((res) => {
            if (res?.error === false) {
                setReviewsData(res.reviews)
            }
        })
    }, [])

    const goto = (index) => {
        setSlideIndex(index);
        zoomSliderSml.current.swiper.slideTo(index);
        zoomSliderBig.current.swiper.slideTo(index);
    }


    useEffect(() => {
        fetchDataFromApi(`/api/product/${id}`).then((res) => {
            if (res?.error === false) {
                // Normalize images - handle both string and object formats
                const normalizeImages = (images) => {
                    if (!images || images.length === 0) return [];
                    // If array of strings, return as is
                    if (typeof images[0] === 'string') return images;
                    // If array of objects, extract URLs
                    return images.map(img => {
                        if (typeof img === 'string') return img;
                        if (typeof img === 'object' && img.url) return img.url;
                        return null;
                    }).filter(img => img !== null);
                };

                const normalizedProduct = {
                    ...res?.product,
                    images: normalizeImages(res?.product?.images)
                };

                setTimeout(() => {
                    setProduct(normalizedProduct)
                }, 500);
            }
        })
    }, []);

    return (
        <>
            <div className="flex items-center justify-between px-2 py-0 mt-3">
                <h2 className="text-[18px] font-[600]">
                    Product Details
                </h2>
            </div>


            <br />

            {
                product?._id !== "" && product?._id !== undefined && product?._id !== null ?
                    <>
                        <div className="productDetails flex gap-8">
                            <div className='w-[40%]'>
                                {
                                    product?.images?.length !== 0 &&
                                    <div className="flex gap-3">
                                        <div className={`slider w-[15%]`}>
                                            <Swiper
                                                ref={zoomSliderSml}
                                                direction={"vertical"}
                                                slidesPerView={5}
                                                spaceBetween={10}
                                                navigation={true}
                                                modules={[Navigation]}
                                                className={`zoomProductSliderThumbs h-[400px] overflow-hidden ${product?.images?.length > 5 && 'space'}`}
                                            >
                                                {
                                                    product?.images?.map((item, index) => {
                                                        // Handle both string and object formats
                                                        const imageUrl = typeof item === 'string' ? item : (item?.url || item);
                                                        if (!imageUrl) return null;
                                                        
                                                        return (
                                                            <SwiperSlide key={index}>
                                                                <div className={`item rounded-md overflow-hidden cursor-pointer group ${slideIndex === index ? 'opacity-1' : 'opacity-30'}`} onClick={() => goto(index)}>
                                                                    <img
                                                                        src={imageUrl} 
                                                                        alt={`Product image ${index + 1}`}
                                                                        className="w-full transition-all group-hover:scale-105"
                                                                    />
                                                                </div>
                                                            </SwiperSlide>
                                                        )
                                                    }).filter(Boolean)
                                                }

                                            </Swiper>
                                        </div>

                                        <div className="zoomContainer w-[85%] overflow-hidden rounded-md">
                                            <Swiper
                                                ref={zoomSliderBig}
                                                slidesPerView={1}
                                                spaceBetween={0}
                                                navigation={false}
                                            >
                                                {
                                                    product?.images?.map((item, index) => {
                                                        // Handle both string and object formats
                                                        const imageUrl = typeof item === 'string' ? item : (item?.url || item);
                                                        if (!imageUrl) return null;
                                                        
                                                        return (
                                                            <SwiperSlide key={index}>
                                                                <InnerImageZoom
                                                                    zoomType="hover"
                                                                    zoomScale={1}
                                                                    src={imageUrl}
                                                                    alt={`Product image ${index + 1}`}
                                                                />
                                                            </SwiperSlide>
                                                        )
                                                    }).filter(Boolean)
                                                }



                                            </Swiper>
                                        </div>
                                    </div>
                                }

                            </div>


                            <div className='w-[60%]'>
                                <h1 className="text-[22px] font-[600] mb-4">{product?.name}</h1>


                                <div className="flex items-center py-1">
                                    <span className="w-[20%] font-[500] flex items-center gap-2 text-[14px]">
                                        <MdBrandingWatermark className="opacity-65" /> Brand : </span>
                                    <span className=" text-[14px]">{product?.brand}</span>
                                </div>

                                <div className="flex items-center py-1">
                                    <span className="w-[20%] font-[500] flex items-center gap-2  text-[14px]">
                                        <BiSolidCategoryAlt className="opacity-65" /> Category : </span>
                                    <span className=" text-[14px]">{product?.catName}</span>
                                </div>


                                {
                                    product?.productRam?.length !== 0 &&
                                    <div className="flex items-center py-1">
                                        <span className="w-[20%] font-[500] flex items-center gap-2  text-[14px]">
                                            <MdFilterVintage className="opacity-65" /> RAM : </span>

                                        <div className="flex items-center gap-2">
                                            {
                                                product?.productRam?.map((ram, index) => {
                                                    return (
                                                        <span className="inline-block p-1 shadow-sm bg-[#fff] text-[12px] font-[500]" key={index}>{ram}</span>
                                                    )
                                                })
                                            }

                                        </div>


                                    </div>
                                }



                                {
                                    product?.size?.length !== 0 &&
                                    <div className="flex items-center py-1">
                                        <span className="w-[20%] font-[500] flex items-center gap-2  text-[14px]">
                                            <MdFilterVintage className="opacity-65" /> SIZE : </span>

                                        <div className="flex items-center gap-2">
                                            {
                                                product?.size?.map((size, index) => {
                                                    return (
                                                        <span className="inline-block p-1 shadow-sm bg-[#fff] text-[12px] font-[500]" key={index}>{size}</span>
                                                    )
                                                })
                                            }

                                        </div>


                                    </div>
                                }



                                {
                                    product?.productWeight?.length !== 0 &&
                                    <div className="flex items-center py-1">
                                        <span className="w-[20%] font-[500] flex items-center gap-2  text-[14px]">
                                            <MdFilterVintage className="opacity-65" /> Weight : </span>

                                        <div className="flex items-center gap-2">
                                            {
                                                product?.productWeight?.map((weight, index) => {
                                                    return (
                                                        <span className="inline-block p-1 shadow-sm bg-[#fff] text-[12px] font-[500]" key={index}>{weight}</span>
                                                    )
                                                })
                                            }

                                        </div>


                                    </div>
                                }



                                <div className="flex items-center py-1">
                                    <span className="w-[20%] font-[500] flex items-center gap-2  text-[14px]">
                                        <MdRateReview className="opacity-65" /> Review : </span>
                                    <span className=" text-[14px]">({reviewsData?.length > 0 ? reviewsData?.length : 0}) Review</span>
                                </div>



                                <div className="flex items-center py-1">
                                    <span className="w-[20%] font-[500] flex items-center gap-2  text-[14px]">
                                        <BsPatchCheckFill className="opacity-65" /> Published : </span>
                                    <span className=" text-[14px]">{product?.createdAt?.split("T")[0]}</span>
                                </div>

                                <br />

                                <h2 className="text-[20px] font-[500] mb-3">Product Description</h2>
                                {
                                    product?.description && <p className="text-[14px] ">{product?.description}</p>
                                }


                            </div>
                        </div>

                        <br />

                        {/* Variations section removed - auto-generate not working */}
                        
                        {/* Admin Review Management Section */}
                        <AdminReviewManagement productId={id} />
                        
                        {
                            reviewsData?.length !== 0 &&
                            <h2 className="text-[18px] font-[500]">Customer Reviews</h2>
                        }



                        <div className="reviewsWrap mt-3">
                            {
                                reviewsData?.length !== 0 && reviewsData?.map((review, index) => {
                                    return (
                                        <div className="reviews w-full h-auto mb-3 p-4 bg-white rounded-sm shadow-md flex items-center justify-between">
                                            <div className="flex items-center gap-8">
                                                <div className="img w-[65px] h-[65px] rounded-full overflow-hidden">
                                                    {
                                                        review?.image !== "" && review?.image !== null ?
                                                            <img
                                                                src={review?.image}
                                                                className="w-full h-full object-cover"
                                                            />

                                                            :
                                                            <img
                                                                src={"/user.jpg"}
                                                                className="w-full h-full object-cover"
                                                            />
                                                    }

                                                </div>

                                                <div className="info w-[80%] ">
                                                    <div className="flex items-center justify-between">
                                                        <h4 className="text-[16px] font-[500]">{review?.userName}</h4>
                                                        <Rating name="read-only" value={review?.rating} readOnly size="small" />
                                                    </div>
                                                    <span className="text-[13px]">{review?.createdAt?.split("T")[0]}</span>
                                                    <p className="text-[13px] mt-2">{review?.review} </p>
                                                </div>

                                            </div>
                                        </div>
                                    )
                                })
                            }


                        </div>

                    </>


                    :


                    <div className='flex items-center justify-center h-96'>
                        <CircularProgress color="inherit" />
                    </div>


            }










        </>
    )
}


export default ProductDetails;