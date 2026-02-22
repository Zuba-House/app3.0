

import React, { useContext, useEffect, useState } from "react";
import { Button } from "@mui/material";
import { MyContext } from '../../App';
import { Link } from "react-router-dom";
import { fetchDataFromApi, postData, deleteData } from "../../utils/api";
import axios from 'axios';
import { useNavigate, useLocation } from "react-router-dom";
import CircularProgress from '@mui/material/CircularProgress';
import StripeCheckout from "../../components/StripeCheckout.jsx";
import { formatCurrency } from "../../utils/currency";

const VITE_API_URL = import.meta.env.VITE_API_URL;

const Checkout = () => {

  const [userData, setUserData] = useState(null);
  // numeric total for server payloads
  const [totalAmount, setTotalAmount] = useState(0);
  const [showStripeForm, setShowStripeForm] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [isProcessingOrder, setIsProcessingOrder] = useState(false); // Prevent double-click on order creation
  const [selectedShippingRate, setSelectedShippingRate] = useState(null);
  const [shippingAddress, setShippingAddress] = useState(null);
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  // New customer info fields
  const [customerName, setCustomerName] = useState('');
  const [apartmentNumber, setApartmentNumber] = useState('');
  const [deliveryNote, setDeliveryNote] = useState('');
  const [discounts, setDiscounts] = useState(null);
  const context = useContext(MyContext);

  const history = useNavigate();
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Check if user is logged in - redirect to login if not
    if (!context?.isLogin || !context?.userData) {
      context?.alertBox("error", "Please login to proceed with checkout");
      history("/login");
      return;
    }
    
    setUserData(context?.userData);
    
    // Get address, phone, and shipping rate from location state (passed from Cart page)
    if (location.state?.shippingAddress) {
      setShippingAddress(location.state.shippingAddress);
    }
    
    if (location.state?.phone) {
      setPhone(location.state.phone);
      setPhoneError('');
    }
    
    if (location.state?.selectedShippingRate) {
      setSelectedShippingRate(location.state.selectedShippingRate);
    }
    
    // Get new customer info fields from location state
    if (location.state?.customerName) {
      setCustomerName(location.state.customerName);
    }
    if (location.state?.apartmentNumber) {
      setApartmentNumber(location.state.apartmentNumber);
    }
    if (location.state?.deliveryNote) {
      setDeliveryNote(location.state.deliveryNote);
    }
    if (location.state?.discounts) {
      setDiscounts(location.state.discounts);
    }
    
    // If no data from cart, redirect back to cart
    if (!location.state?.shippingAddress || !location.state?.phone || !location.state?.selectedShippingRate || !location.state?.customerName) {
      context?.alertBox("error", "Please complete your shipping information in the cart first");
      setTimeout(() => {
        history("/cart");
      }, 2000);
    }
  }, [location.state, context?.isLogin, context?.userData]);



  useEffect(() => {
    const subtotal = context.cartData?.length !== 0 ?
      context.cartData?.map(item => parseFloat(item.price || 0) * (item.quantity || 0))
        .reduce((sum, value) => sum + value, 0) : 0;
    
    const shippingCost = selectedShippingRate ? (selectedShippingRate.cost || selectedShippingRate.price || 0) : 0;
    
    // Calculate total with discounts
    let total = subtotal + shippingCost;
    if (discounts) {
      total = discounts.finalTotal !== undefined ? discounts.finalTotal : total;
    }
    
    // keep numeric for backend; format only when rendering
    setTotalAmount(total);
  }, [context.cartData, selectedShippingRate, discounts])





  // Removed PayPal integration

  // Validate phone number
  const validatePhone = async (phoneNumber) => {
    if (!phoneNumber || phoneNumber.trim() === '') {
      setPhoneError('Phone number is required');
      return false;
    }

    try {
      const response = await postData('/api/shipping/validate-phone', {
        phone: phoneNumber,
        country: shippingAddress?.countryCode || 'CA'
      });

      if (response?.success && response?.valid) {
        setPhoneError('');
        if (response?.formatted) {
          setPhone(response.formatted);
        }
        return true;
      } else {
        setPhoneError(response?.message || 'Invalid phone number format');
        return false;
      }
    } catch (error) {
      console.error('Phone validation error:', error);
      setPhoneError('Unable to validate phone number');
      return false;
    }
  };



  // Removed Razorpay integration

  // Validate cart before checkout
  const validateCartStock = () => {
    // Check if cart is empty
    if (!context.cartData || context.cartData.length === 0) {
      context?.alertBox("error", "Your cart is empty");
      return false;
    }
    
    // Check for out-of-stock items
    const outOfStockItems = context.cartData.filter(item => item.isOutOfStock);
    if (outOfStockItems.length > 0) {
      const itemNames = outOfStockItems.map(item => item.productTitle).join(', ');
      context?.alertBox(
        "error",
        `Cannot proceed. The following items are out of stock: ${itemNames}. Please remove them from your cart.`
      );
      return false;
    }
    
    // Check if quantities exceed stock
    const exceededStock = context.cartData.filter(item => item.quantity > (item.currentStock || item.countInStock));
    if (exceededStock.length > 0) {
      context?.alertBox(
        "error",
        "Some items in your cart exceed available stock. Please adjust quantities."
      );
      return false;
    }
    
    return true;
  };


  const handleStripeSuccess = async (paymentIntent) => {
    // Prevent double-click / multiple submissions
    if (isProcessingOrder) {
      console.log('⚠️ Order is already being processed, please wait...');
      return;
    }

    // Validate cart before proceeding
    if (!validateCartStock()) {
      return;
    }

    // Validate shipping address and rate
    if (!selectedShippingRate || (!selectedShippingRate.cost && !selectedShippingRate.price)) {
      context?.alertBox("error", "Please select a shipping method");
      return;
    }

    // Validate phone number
    if (!phone || phone.trim() === '') {
      context?.alertBox("error", "Phone number is required for shipping");
      setPhoneError('Phone number is required');
      return;
    }

    const phoneValid = await validatePhone(phone);
    if (!phoneValid) {
      context?.alertBox("error", "Please enter a valid phone number");
      return;
    }

    const user = context?.userData;
    if (!shippingAddress || !shippingAddress.city || !shippingAddress.countryCode) {
      context.alertBox("error", "Shipping address is required. Please go back to cart and enter your address.");
      history("/cart");
      return;
    }

    // Set processing state to prevent double-click
    setIsProcessingOrder(true);

    // Calculate total amount including shipping and discounts
    const subtotal = context.cartData?.length > 0
      ? context.cartData.map(item => parseFloat(item.price || 0) * (item.quantity || 0)).reduce((a, b) => a + b, 0)
      : 0;
    const shippingCost = discounts?.freeShipping ? 0 : (selectedShippingRate ? (selectedShippingRate.cost || selectedShippingRate.price || 0) : 0);
    const finalTotal = discounts?.finalTotal !== undefined ? discounts.finalTotal : (subtotal + shippingCost);
    
    console.log('Order creation - Amounts:', {
      subtotal,
      shippingCost,
      finalTotal,
      paymentIntentAmount: paymentIntent?.amount ? paymentIntent.amount / 100 : 0,
      totalAmountState: totalAmount
    });

    // Find or create address ID from shippingAddress
    let addressId = null;
    if (shippingAddress && context?.userData?.address_details) {
      // Try to find existing address
      const existingAddress = context.userData.address_details.find(addr => 
        addr.address?.city === shippingAddress.city &&
        addr.address?.postalCode === shippingAddress.postal_code
      );
      addressId = existingAddress?._id || null;
    }

    const payLoad = {
      userId: user?._id,
      products: context?.cartData,
      paymentId: paymentIntent?.id || '',
      payment_status: "COMPLETED",
      delivery_address: addressId, // Use address ID if found, otherwise will be created
      totalAmt: finalTotal, // Use calculated total with shipping and discounts
      shippingCost: shippingCost,
      shippingRate: selectedShippingRate,
      phone: phone, // Include phone number
      shippingAddress: shippingAddress, // Include full address data
      // New customer info fields
      customerName: customerName, // Customer's full name for delivery
      apartmentNumber: apartmentNumber, // Apartment/Office/Unit number (optional)
      deliveryNote: deliveryNote, // Special delivery instructions (optional)
      // Discount information
      discounts: discounts ? {
        couponCode: discounts.coupon?.code || null,
        couponDiscount: discounts.couponDiscount || 0,
        giftCardCode: discounts.giftCard?.code || null,
        giftCardDiscount: discounts.giftCardDiscount || 0,
        automaticDiscounts: discounts.automaticDiscounts || [],
        totalDiscount: discounts.totalDiscount || 0,
        freeShipping: discounts.freeShipping || false,
        subtotal: subtotal,
        finalTotal: finalTotal
      } : null,
      date: new Date().toLocaleString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      }),
    };

    try {
      console.log('📦 Creating order after successful payment...');
      console.log('📦 Payment Intent ID:', paymentIntent?.id);
      console.log('📦 Order payload:', { 
        userId: user?._id, 
        productCount: context?.cartData?.length,
        totalAmt: finalTotal 
      });
      
      const res = await postData(`/api/order/create`, payLoad);
      
      console.log('📦 Order creation response:', res);
      console.log('📦 Response error field:', res?.error);
      console.log('📦 Response success field:', res?.success);
      
      // Check multiple response formats for compatibility
      const isSuccess = res?.error === false || res?.success === true || res?.orderId || (res && !res.error);
      
      if (isSuccess) {
        console.log('✅ Order created successfully!');
        
        // Record discount usage
        if (discounts && (discounts.couponDiscount > 0 || discounts.giftCardDiscount > 0)) {
          try {
            await postData('/api/discounts/record-usage', {
              orderId: res?.orderId || res?._id || res?.order?._id,
              couponCode: discounts.coupon?.code,
              giftCardCode: discounts.giftCard?.code,
              couponDiscount: discounts.couponDiscount,
              giftCardDiscount: discounts.giftCardDiscount
            }).catch(err => {
              console.warn('⚠️ Discount usage recording failed (non-critical):', err);
            });
          } catch (err) {
            console.warn('⚠️ Discount usage recording error (non-critical):', err);
          }
        }
        
        // Clear cart in background (don't wait for it)
        try {
          deleteData(`/api/cart/emptyCart/${user?._id}`).catch(err => {
            console.warn('⚠️ Cart clear failed (non-critical):', err);
          });
        } catch {
          // ignore cart empty errors but still proceed
        }
        
        context?.getCartItems();
        
        // IMMEDIATE redirect - don't wait for alertBox or other UI updates
        console.log('✅ Order created! Redirecting immediately to success page...');
        
        // Redirect immediately - don't wait for alertBox
        window.location.href = "/order/success";
        
        // If redirect somehow doesn't work, force it after 100ms
        setTimeout(() => {
          if (window.location.pathname !== '/order/success') {
            console.warn('⚠️ Redirect did not happen, forcing redirect...');
            window.location.replace("/order/success");
          }
        }, 100);
      } else {
        console.error('❌ Order creation failed:', res);
        console.error('❌ Response details:', JSON.stringify(res, null, 2));
        context.alertBox("error", res?.message || "Failed to create order");
        setIsProcessingOrder(false); // Re-enable on error
        setTimeout(() => {
          window.location.href = "/order/failed";
        }, 500);
      }
    } catch (error) {
      console.error('❌ Error creating order:', error);
      console.error('❌ Error details:', {
        message: error.message,
        stack: error.stack,
        paymentIntentId: paymentIntent?.id
      });
      
      // Even if order creation fails, payment succeeded - check if we should still redirect to success
      // This is a fallback: payment succeeded, so we should at least show success page
      console.warn('⚠️ Order creation error, but payment succeeded. Checking if order was created anyway...');
      
      // Try to redirect to success anyway since payment succeeded
      // The order might have been created but response was malformed
      context.alertBox("warning", "Payment succeeded. If you don't see your order, please contact support with payment ID: " + (paymentIntent?.id || 'N/A'));
      setIsProcessingOrder(false); // Re-enable on error
      
      // Redirect to success since payment succeeded
      setTimeout(() => {
        window.location.href = "/order/success";
      }, 1000);
    }
  }

  const handleStripeFailed = async (error) => {
    const user = context?.userData;
    if (!shippingAddress) {
      return;
    }
    const fail = error || {};
    const pi = fail?.payment_intent || fail?.paymentIntent || {};
    const lastErr = pi?.last_payment_error || {};
    
    // Find address ID
    let addressId = null;
    if (shippingAddress && context?.userData?.address_details) {
      const existingAddress = context.userData.address_details.find(addr => 
        addr.address?.city === shippingAddress.city &&
        addr.address?.postalCode === shippingAddress.postal_code
      );
      addressId = existingAddress?._id || null;
    }
    
    const payLoad = {
      userId: user?._id,
      products: context?.cartData,
      paymentId: pi?.id || '',
      payment_status: "FAILED",
      delivery_address: addressId,
      totalAmt: totalAmount,
      shippingAddress: shippingAddress,
      phone: phone,
      // New customer info fields
      customerName: customerName,
      apartmentNumber: apartmentNumber,
      deliveryNote: deliveryNote,
      date: new Date().toLocaleString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      }),
      failReason: lastErr?.message || fail?.message || 'Stripe payment failed',
      failCode: fail?.code || lastErr?.code || '',
      failType: fail?.type || lastErr?.type || '',
      failDeclineCode: fail?.decline_code || lastErr?.decline_code || ''
    };

    try {
      await postData(`/api/order/create`, payLoad);
    } catch {
      /* ignore */
    }
  }

  return (
    <section className="py-3 lg:py-10 px-3">
      <div>
        <div className="w-full lg:w-[70%] m-auto flex flex-col md:flex-row gap-5">
          <div className="leftCol w-full md:w-[60%]">
            <div className="card bg-white shadow-md p-5 rounded-md w-full">
              <h2>Delivery Information</h2>
              <br />

              {/* Display Customer Info */}
              {customerName && (
                <div className="mb-4 p-4 border border-gray-200 rounded-md bg-gray-50">
                  <h3 className="text-[14px] font-[600] mb-2">Customer Information</h3>
                  <p className="text-[14px] text-gray-700 mb-1">
                    <strong>Name:</strong> {customerName}
                  </p>
                  {phone && (
                    <p className="text-[14px] text-gray-700 mb-1">
                      <strong>Phone:</strong> {phone}
                    </p>
                  )}
                </div>
              )}

              {/* Display Shipping Address */}
              {shippingAddress && (
                <div className="mb-4 p-4 border border-gray-200 rounded-md bg-gray-50">
                  <h3 className="text-[14px] font-[600] mb-2">Shipping Address</h3>
                  <p className="text-[14px] text-gray-700 mb-1">
                    {shippingAddress.addressLine1 || shippingAddress.city}
                    {shippingAddress.addressLine2 && `, ${shippingAddress.addressLine2}`}
                  </p>
                  {apartmentNumber && (
                    <p className="text-[14px] text-gray-700 mb-1">
                      <strong>Apt/Unit:</strong> {apartmentNumber}
                    </p>
                  )}
                  <p className="text-[14px] text-gray-700 mb-1">
                    {shippingAddress.city}, {shippingAddress.province} {shippingAddress.postal_code}
                  </p>
                  <p className="text-[14px] text-gray-700">
                    {shippingAddress.country}
                  </p>
                  <Link to="/cart">
                    <Button variant="outlined" size="small" className="mt-2">
                      Change Address
                    </Button>
                  </Link>
                </div>
              )}

              {/* Display Delivery Note */}
              {deliveryNote && (
                <div className="mb-4 p-4 border border-yellow-200 rounded-md bg-yellow-50">
                  <h3 className="text-[14px] font-[600] mb-2">📝 Delivery Instructions</h3>
                  <p className="text-[14px] text-gray-700">
                    {deliveryNote}
                  </p>
                </div>
              )}

              {/* Display Selected Shipping Method */}
              {selectedShippingRate && (
                <div className="mb-4 p-4 border border-gray-200 rounded-md bg-gray-50">
                  <h3 className="text-[14px] font-[600] mb-2">Shipping Method</h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[14px] font-[500]">{selectedShippingRate.name || selectedShippingRate.service}</p>
                      {selectedShippingRate.estimatedDelivery && (
                        <p className="text-[12px] text-gray-600">
                          Estimated: {selectedShippingRate.estimatedDelivery}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <strong className="text-[16px] font-[700] text-primary">
                        {formatCurrency(selectedShippingRate.cost || selectedShippingRate.price || 0)}
                      </strong>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>

          <div className="rightCol w-full  md:w-[40%]">
            <div className="card shadow-md bg-white p-5 rounded-md">
              <h2 className="mb-4">Your Order</h2>

              <div className="flex items-center justify-between py-3 border-t border-b border-[rgba(0,0,0,0.1)]">
                <span className="text-[14px] font-[600]">Product</span>
                <span className="text-[14px] font-[600]">Subtotal</span>
              </div>

              <div className="mb-5 scroll max-h-[250px] overflow-y-scroll overflow-x-hidden pr-2">

                {
                  context?.cartData?.length !== 0 && context?.cartData?.map((item, index) => {
                    return (
                      <div className="flex items-center justify-between py-2" key={index}>
                        <div className="part1 flex items-center gap-3">
                          <div className="img w-[50px] h-[50px] object-cover overflow-hidden rounded-md group cursor-pointer">
                            <img
                              src={item?.image}
                              className="w-full transition-all group-hover:scale-105"
                            />
                          </div>

                          <div className="info">
                            <h4 className="text-[14px]" title={item?.productTitle}>{item?.productTitle?.substr(0, 20) + '...'} </h4>
                            <span className="text-[13px]">Qty : {item?.quantity}</span>
                          </div>
                        </div>

                        <span className="text-[14px] font-[500]">{formatCurrency(item?.quantity * item?.price)}</span>
                      </div>
                    )
                  })
                }



              </div>

              {/* Order Summary Totals */}
              <div className="border-t border-[rgba(0,0,0,0.1)] pt-3 mt-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[14px] font-[500]">Subtotal</span>
                  <div className="flex items-center gap-1">
                    <span className="text-[14px] font-[600]">
                      {formatCurrency(
                        context.cartData?.length !== 0 ?
                          context.cartData?.map(item => parseFloat(item.price || 0) * (item.quantity || 0))
                            .reduce((total, value) => total + value, 0) : 0
                      )}
                    </span>
                    <span className="text-[11px] text-gray-600 font-[500]">USD</span>
                  </div>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[14px] font-[500]">Shipping</span>
                  <span className="text-[14px] font-[600]">
                    {selectedShippingRate ? (
                      discounts?.freeShipping ? (
                        <span className="text-green-600">FREE</span>
                      ) : (
                        formatCurrency(selectedShippingRate.cost || selectedShippingRate.price || 0)
                      )
                    ) : (
                      <span className="text-gray-400">Select address</span>
                    )}
                  </span>
                </div>
                {/* Discount Breakdown */}
                {discounts && discounts.totalDiscount > 0 && (
                  <>
                    {discounts.couponDiscount > 0 && (
                      <div className="flex items-center justify-between mb-2 text-green-600">
                        <span className="text-[14px] font-[500]">Coupon ({discounts.coupon?.code})</span>
                        <span className="text-[14px] font-[600]">-{formatCurrency(discounts.couponDiscount)}</span>
                      </div>
                    )}
                    {discounts.giftCardDiscount > 0 && (
                      <div className="flex items-center justify-between mb-2 text-green-600">
                        <span className="text-[14px] font-[500]">Gift Card</span>
                        <span className="text-[14px] font-[600]">-{formatCurrency(discounts.giftCardDiscount)}</span>
                      </div>
                    )}
                    {discounts.automaticDiscounts?.length > 0 && discounts.automaticDiscounts.reduce((sum, d) => sum + d.discount, 0) > 0 && (
                      <div className="flex items-center justify-between mb-2 text-green-600">
                        <span className="text-[14px] font-[500]">Automatic Discounts</span>
                        <span className="text-[14px] font-[600]">
                          -{formatCurrency(discounts.automaticDiscounts.reduce((sum, d) => sum + d.discount, 0))}
                        </span>
                      </div>
                    )}
                  </>
                )}
                <div className="flex items-center justify-between pt-2 border-t border-[rgba(0,0,0,0.1)]">
                  <span className="text-[16px] font-[700]">Total</span>
                  <div className="flex items-center gap-1">
                    <span className="text-[16px] font-[700] text-primary">
                      {formatCurrency(totalAmount)}
                    </span>
                    <span className="text-[12px] text-gray-600 font-[500]">USD</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center flex-col gap-3 mb-2">
                <div className="flex flex-col w-full items-center gap-3 mt-3">
                  <Button
                    className="btn-org btn-lg w-full flex gap-2 items-center"
                    onClick={() => {
                      setShowStripeForm((prev) => !prev);
                      setTimeout(() => {
                        const el = document.getElementById("stripe-payment-box");
                        if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
                      }, 600);
                    }}
                    disabled={isPaying}
                  >
                    {showStripeForm ? "Hide Card Form" : "Place Order (Card)"}
                  </Button>

                  {showStripeForm && (
                    <div
                      id="stripe-payment-box"
                      className="w-full p-4 mt-2 bg-[#f9f9f9] border border-gray-200 rounded-md shadow-sm"
                    >
                      <StripeCheckout
                        amount={
                          (() => {
                            try {
                              // Use discounted total if available
                              if (discounts?.finalTotal !== undefined) {
                                return parseFloat(discounts.finalTotal.toFixed(2)) || 0;
                              }
                              // Otherwise calculate normally
                              const subtotal = context.cartData?.length > 0
                                ? context.cartData
                                  .map((item) => (item.price || 0) * (item.quantity || 0))
                                  .reduce((a, b) => a + b, 0)
                                : 0;
                              const shippingCost = discounts?.freeShipping ? 0 : (selectedShippingRate ? (selectedShippingRate.cost || selectedShippingRate.price || 0) : 0);
                              const total = subtotal + shippingCost;
                              const amount = parseFloat(total?.toFixed(2)) || 0;
                              return amount > 0 ? amount : 0;
                            } catch (e) {
                              console.error("Error calculating cart total:", e);
                              return 0;
                            }
                          })()
                        }
                        onPaid={(paymentIntent) => handleStripeSuccess(paymentIntent)}
                        onFailed={(err) => handleStripeFailed(err)}
                        onProcessingChange={setIsPaying}
                        onReady={() => {
                          const el = document.getElementById("stripe-payment-box");
                          if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
                        }}
                      />

                      <p className="text-[13px] text-center mt-3 text-gray-600">
                        💳 All payments are securely processed by Stripe.
                      </p>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Checkout;
