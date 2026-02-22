import React, { useContext, useEffect, useState } from "react";

import Button from "@mui/material/Button";
import { BsFillBagCheckFill } from "react-icons/bs";
import { CircularProgress } from "@mui/material";
import CartItems from "./cartItems";
import { MyContext } from "../../App";
import { fetchDataFromApi, postData } from "../../utils/api";
import { Link, useNavigate } from "react-router-dom";
import { formatCurrency } from "../../utils/currency";
import ShippingAddressInput from "../../components/ShippingAddressInput/ShippingAddressInput";
import DiscountInput from "../../components/DiscountInput/DiscountInput";

const CartPage = () => {

  const context = useContext(MyContext);
  const history = useNavigate();
  const [shippingAddress, setShippingAddress] = useState({
    postal_code: '',
    city: '',
    province: '',
    country: 'Canada',
    countryCode: 'CA',
    coordinates: null,
    addressLine1: '',
    addressLine2: ''
  });
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [selectedShippingRate, setSelectedShippingRate] = useState(null);
  const [shippingOptions, setShippingOptions] = useState([]);
  const [loadingShipping, setLoadingShipping] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  const [discounts, setDiscounts] = useState(null);

  // New customer info fields
  const [customerName, setCustomerName] = useState('');
  const [apartmentNumber, setApartmentNumber] = useState('');
  const [deliveryNote, setDeliveryNote] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
    // Pre-fill address if user has one
    if (context?.userData?.address_details?.[0]) {
      const addr = context.userData.address_details[0];
      setShippingAddress({
        postal_code: addr.address?.postalCode || addr.postalCode || addr.postal_code || '',
        city: addr.address?.city || addr.city || '',
        province: addr.address?.provinceCode || addr.provinceCode || addr.province || '',
        country: addr.address?.country || addr.country || 'Canada',
        countryCode: addr.address?.countryCode || addr.countryCode || 'CA',
        addressLine1: addr.address?.addressLine1 || addr.address_line1 || '',
        addressLine2: addr.address?.addressLine2 || addr.address_line2 || '',
        coordinates: addr.googlePlaces?.coordinates || null
      });
      // Pre-fill phone if available
      if (addr?.contactInfo?.phone) {
        setPhone(addr.contactInfo.phone);
      }
      // Pre-fill customer name from contact info
      if (addr?.contactInfo?.firstName || addr?.contactInfo?.lastName) {
        setCustomerName(`${addr.contactInfo.firstName || ''} ${addr.contactInfo.lastName || ''}`.trim());
      }
    }
    // Pre-fill customer name from user data if not set from address
    if (context?.userData?.name && !customerName) {
      setCustomerName(context.userData.name);
    }
  }, [context?.userData]);

  // Calculate shipping when address and phone are available
  useEffect(() => {
    if (shippingAddress?.city && shippingAddress?.countryCode && phone && context?.cartData?.length > 0) {
      const timer = setTimeout(() => {
        calculateShipping();
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setShippingOptions([]);
      setSelectedShippingRate(null);
    }
  }, [shippingAddress?.city, shippingAddress?.countryCode, shippingAddress?.province, shippingAddress?.postal_code, phone, context?.cartData?.length]);

  // Calculate shipping rates
  const calculateShipping = async () => {
    if (!shippingAddress?.city || !shippingAddress?.countryCode || !phone || !context?.cartData?.length) {
      return;
    }

    setLoadingShipping(true);
    
    try {
      // Prepare cart items with product data
      const cartItemsWithProducts = await Promise.all(
        context.cartData.map(async (item) => {
          try {
            let productData = item.product;
            if (!productData && item.productId) {
              const productResponse = await fetchDataFromApi(`/api/product/${item.productId}`);
              productData = productResponse?.product || productResponse;
            }
            
            return {
              product: productData || {},
              productId: item.productId,
              quantity: item.quantity || 1,
              price: item.price
            };
          } catch (error) {
            console.warn('Error fetching product data:', error);
            return {
              product: {},
              productId: item.productId,
              quantity: item.quantity || 1,
              price: item.price
            };
          }
        })
      );

      // Prepare shipping address
      const addressForCalc = {
        ...shippingAddress,
        phone: phone
      };

      const response = await postData('/api/shipping/calculate', {
        cartItems: cartItemsWithProducts,
        shippingAddress: addressForCalc
      });

      if (response?.success && response?.options && response.options.length > 0) {
        setShippingOptions(response.options);
        // Auto-select first option (usually standard)
        const selectedOption = {
          ...response.options[0],
          cost: response.options[0].price
        };
        setSelectedShippingRate(selectedOption);
      } else {
        setShippingOptions([]);
        setSelectedShippingRate(null);
      }
    } catch (error) {
      console.error('Shipping calculation error:', error);
      setShippingOptions([]);
      setSelectedShippingRate(null);
    } finally {
      setLoadingShipping(false);
    }
  };

  // Validate phone number
  const validatePhone = async (phoneNumber) => {
    if (!phoneNumber || phoneNumber.trim() === '') {
      setPhoneError('Phone number is required');
      return false;
    }

    try {
      const response = await postData('/api/shipping/validate-phone', {
        phone: phoneNumber,
        country: shippingAddress.countryCode || 'CA'
      });

      if (response?.success && response?.valid) {
        setPhone(response.formatted || phoneNumber);
        setPhoneError('');
        return true;
      } else {
        setPhoneError(response?.message || 'Invalid phone number format');
        return false;
      }
    } catch (error) {
      console.error('Phone validation error:', error);
      setPhoneError('Failed to validate phone number');
      return false;
    }
  };

  // Save address to user account
  const saveAddress = async (silent = false) => {
    if (!shippingAddress.city || !shippingAddress.countryCode) {
      context?.alertBox("error", "Please enter a complete address (city and country required)");
      return;
    }

    if (!phone || phone.trim() === '') {
      context?.alertBox("error", "Please enter a phone number");
      return;
    }

    // Validate phone first
    const isValidPhone = await validatePhone(phone);
    if (!isValidPhone) {
      return;
    }

    setSavingAddress(true);

    try {
      const addressData = {
        label: 'Home',
        addressType: 'home',
        contactInfo: {
          firstName: context?.userData?.name?.split(' ')[0] || '',
          lastName: context?.userData?.name?.split(' ').slice(1).join(' ') || '',
          phone: phone
        },
        address: {
          addressLine1: shippingAddress.addressLine1 || shippingAddress.city,
          addressLine2: shippingAddress.addressLine2 || '',
          city: shippingAddress.city,
          provinceCode: shippingAddress.province,
          postalCode: shippingAddress.postal_code,
          country: shippingAddress.country || (shippingAddress.countryCode === 'CA' ? 'Canada' : ''),
          countryCode: shippingAddress.countryCode
        },
        googlePlaces: shippingAddress.coordinates ? {
          coordinates: shippingAddress.coordinates
        } : undefined,
        userId: context?.userData?._id
      };

      const response = await postData('/api/address/add', addressData);

      if (response?.error !== true) {
        if (!silent) {
          context?.alertBox("success", "Address saved successfully");
        }
        // Refresh user data
        await context?.getUserDetails();
        return true;
      } else {
        if (!silent) {
          context?.alertBox("error", response?.message || "Failed to save address");
        }
        return false;
      }
    } catch (error) {
      console.error('Error saving address:', error);
      if (!silent) {
        context?.alertBox("error", "Failed to save address. Please try again.");
      }
      return false;
    } finally {
      setSavingAddress(false);
    }
  };

  // Helper to get variation display info (backward compatible)
  const getVariationDisplay = (item) => {
    // New variation system
    if (item?.variation && item.variation.attributes && item.variation.attributes.length > 0) {
      return item.variation.attributes.map(attr => `${attr.name}: ${attr.value}`).join(', ');
    }
    
    // Old system (backward compatibility)
    if (item?.size) return item.size;
    if (item?.weight) return item.weight;
    if (item?.ram) return item.ram;
    
    return null;
  }


  return (
    <section className="section py-4 lg:py-8 pb-10">
      <div className="container w-[80%] max-w-[80%] flex gap-5 flex-col lg:flex-row">
        <div className="leftPart w-full lg:w-[70%]">
          <div className="shadow-md rounded-md bg-white">
            <div className="py-5 px-3 border-b border-[rgba(0,0,0,0.1)]">
              <h2>Your Cart</h2>
              <p className="mt-0 mb-0">
                There are <span className="font-bold text-primary">{context?.cartData?.length}</span>{" "}
                products in your cart
              </p>
            </div>

            {

              context?.cartData?.length !== 0 ? context?.cartData?.map((item, index) => {
                return (
                  <CartItems qty={item?.quantity} item={item} key={index} />
                )
              })

                :



                <>
                  <>
                    <div className="flex items-center justify-center flex-col py-10 gap-5">
                      <img src="/empty-cart.png" className="w-[150px]" />
                      <h4>Your Cart is currently empty</h4>
                      <Link to="/"><Button className="btn-org">Continue Shopping</Button></Link>
                    </div>
                  </>

                </>
            }

          </div>
        </div>

        <div className="rightPart w-full lg:w-[30%]">
          <div className="shadow-md rounded-md bg-white p-5 sticky top-[155px] z-[90]">
            <h3 className="pb-3">Cart Totals</h3>
            <hr />

            <p className="flex items-center justify-between">
              <span className="text-[14px] font-[500]">Subtotal</span>
              <div className="flex items-center gap-1">
                <span className="text-primary font-bold">
                  {formatCurrency(
                    (context.cartData?.length !== 0 ?
                      context.cartData?.map(item => parseFloat(item.price || 0) * (item.quantity || 0))
                        .reduce((total, value) => total + value, 0) : 0)
                  )}
                </span>
                <span className="text-[11px] text-gray-600 font-[500]">USD</span>
              </div>
            </p>

            {/* Shipping Address Input with Google Maps Autocomplete */}
            <div className="mt-4 mb-4">
              <ShippingAddressInput
                onAddressChange={(newAddress) => {
                  setShippingAddress({
                    ...shippingAddress,
                    postal_code: newAddress.postal_code,
                    city: newAddress.city,
                    province: newAddress.province,
                    country: newAddress.country,
                    countryCode: newAddress.countryCode,
                    coordinates: newAddress.coordinates,
                    addressLine1: newAddress.addressLine1 || '',
                    addressLine2: newAddress.addressLine2 || ''
                  });
                }}
                onPhoneChange={(phoneValue) => {
                  setPhone(phoneValue || '');
                  setPhoneError('');
                }}
                onCustomerInfoChange={(info) => {
                  if (info.customerName !== undefined) setCustomerName(info.customerName);
                  if (info.apartmentNumber !== undefined) setApartmentNumber(info.apartmentNumber);
                  if (info.deliveryNote !== undefined) setDeliveryNote(info.deliveryNote);
                }}
                initialAddress={shippingAddress}
                initialPhone={phone}
                initialCustomerName={customerName}
                initialApartmentNumber={apartmentNumber}
                initialDeliveryNote={deliveryNote}
              />
            </div>

            {/* Shipping Options */}
            {context.cartData?.length > 0 && shippingAddress?.city && shippingAddress?.countryCode && phone && (
              <div className="mt-4 mb-4">
                <h4 className="text-[14px] font-[600] mb-3">Shipping Method</h4>
                
                {loadingShipping ? (
                  <div className="flex items-center justify-center py-4">
                    <CircularProgress size={20} />
                    <span className="ml-2 text-[13px] text-gray-600">Calculating shipping...</span>
                  </div>
                ) : shippingOptions.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    {shippingOptions.map((option) => (
                      <div
                        key={option.id}
                        onClick={() => {
                          setSelectedShippingRate({
                            ...option,
                            cost: option.price
                          });
                        }}
                        className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                          selectedShippingRate?.id === option.id
                            ? 'border-primary bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[16px]">{option.icon || '📦'}</span>
                              <strong className="text-[14px] font-[600]">{option.name}</strong>
                            </div>
                            <p className="text-[12px] text-gray-600 mb-1">{option.description || option.estimatedDelivery}</p>
                            <p className="text-[11px] text-green-600 font-[500] mb-1">
                              Est: {option.estimatedDelivery || option.deliveryDays}
                            </p>
                            {option.deliveryDays && (
                              <p className="text-[11px] text-gray-500">{option.deliveryDays}</p>
                            )}
                          </div>
                          <div className="text-right ml-3">
                            <strong className="text-[16px] font-[700] text-primary">
                              {formatCurrency(option.price)}
                            </strong>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                    <p className="text-[13px] text-yellow-800">
                      No shipping options available. Please check your address and phone number.
                    </p>
                  </div>
                )}
              </div>
            )}

            <hr className="my-4" />

            {/* Discount Input Section */}
            {context.cartData?.length > 0 && (
              <div className="mb-4">
                <DiscountInput
                  cartItems={context.cartData.map(item => ({
                    productId: item.productId,
                    quantity: item.quantity,
                    price: parseFloat(item.price || 0),
                    product: item.product || {}
                  }))}
                  cartTotal={
                    context.cartData?.length !== 0 ?
                      context.cartData?.map(item => parseFloat(item.price || 0) * (item.quantity || 0))
                        .reduce((total, value) => total + value, 0) : 0
                  }
                  shippingCost={selectedShippingRate ? (selectedShippingRate.cost || 0) : 0}
                  onDiscountsCalculated={(calculatedDiscounts) => {
                    setDiscounts(calculatedDiscounts);
                  }}
                />
              </div>
            )}

            <hr className="my-4" />

            <p className="flex items-center justify-between">
              <span className="text-[14px] font-[500]">Shipping</span>
              <span className="font-bold">
                {selectedShippingRate ? (
                  discounts?.freeShipping ? (
                    <span className="text-green-600">FREE</span>
                  ) : (
                    formatCurrency(selectedShippingRate.cost)
                  )
                ) : (
                  <span className="text-gray-400">Enter address</span>
                )}
              </span>
            </p>

            {/* Discount Breakdown */}
            {discounts && discounts.totalDiscount > 0 && (
              <>
                {discounts.couponDiscount > 0 && (
                  <p className="flex items-center justify-between text-green-600">
                    <span className="text-[14px] font-[500]">Coupon Discount ({discounts.coupon?.code})</span>
                    <span className="font-bold">-{formatCurrency(discounts.couponDiscount)}</span>
                  </p>
                )}
                {discounts.giftCardDiscount > 0 && (
                  <p className="flex items-center justify-between text-green-600">
                    <span className="text-[14px] font-[500]">Gift Card</span>
                    <span className="font-bold">-{formatCurrency(discounts.giftCardDiscount)}</span>
                  </p>
                )}
                {discounts.automaticDiscounts?.length > 0 && discounts.automaticDiscounts.reduce((sum, d) => sum + d.discount, 0) > 0 && (
                  <p className="flex items-center justify-between text-green-600">
                    <span className="text-[14px] font-[500]">Automatic Discounts</span>
                    <span className="font-bold">
                      -{formatCurrency(discounts.automaticDiscounts.reduce((sum, d) => sum + d.discount, 0))}
                    </span>
                  </p>
                )}
              </>
            )}

            <p className="flex items-center justify-between pt-2 border-t border-[rgba(0,0,0,0.1)]">
              <span className="text-[16px] font-[700]">Total</span>
              <div className="flex items-center gap-1">
                <span className="text-primary font-bold text-[16px]">
                  {formatCurrency(
                    discounts?.finalTotal !== undefined 
                      ? discounts.finalTotal 
                      : ((context.cartData?.length !== 0 ?
                          context.cartData?.map(item => parseFloat(item.price || 0) * (item.quantity || 0))
                            .reduce((total, value) => total + value, 0) : 0) +
                        (selectedShippingRate && !discounts?.freeShipping ? (selectedShippingRate.cost || 0) : 0))
                  )}
                </span>
                <span className="text-[11px] text-gray-600 font-[500]">USD</span>
              </div>
            </p>

            <br />

            {/* Save Address Button */}
            {shippingAddress?.city && shippingAddress?.countryCode && phone && (
              <Button
                className="btn-outline w-full mb-3"
                onClick={saveAddress}
                disabled={savingAddress}
              >
                {savingAddress ? 'Saving...' : '💾 Save Address'}
              </Button>
            )}

            {/* Validate address, phone, and shipping rate before allowing checkout */}
            {(() => {
              // Address validation - all required fields must be filled
              const hasValidAddress = shippingAddress && 
                                     shippingAddress.city && 
                                     shippingAddress.city.trim() !== '' &&
                                     shippingAddress.countryCode && 
                                     shippingAddress.countryCode.trim() !== '' &&
                                     shippingAddress.postal_code &&
                                     shippingAddress.postal_code.trim() !== '' &&
                                     shippingAddress.province &&
                                     shippingAddress.province.trim() !== '';
              
              // Phone validation - check if phone has at least 10 digits
              const phoneDigits = phone ? phone.replace(/\D/g, '') : '';
              const hasPhone = phone && 
                              phone.trim() !== '' && 
                              !phoneError &&
                              phoneDigits.length >= 10;
              
              // Shipping rate validation
              const hasShippingRate = selectedShippingRate && 
                                     (selectedShippingRate.cost || selectedShippingRate.price) &&
                                     (selectedShippingRate.cost > 0 || selectedShippingRate.price > 0);
              
              const handleCheckoutClick = async () => {
                // Validate customer name - REQUIRED
                if (!customerName || customerName.trim() === '') {
                  context?.alertBox("error", "Please enter your full name for delivery");
                  return;
                }
                
                // Validate address - REQUIRED
                if (!hasValidAddress) {
                  if (!shippingAddress?.city || shippingAddress.city.trim() === '') {
                    context?.alertBox("error", "Please enter your city");
                  } else if (!shippingAddress?.countryCode || shippingAddress.countryCode.trim() === '') {
                    context?.alertBox("error", "Please select your country");
                  } else if (!shippingAddress?.postal_code || shippingAddress.postal_code.trim() === '') {
                    context?.alertBox("error", "Please enter your postal/zip code");
                  } else if (!shippingAddress?.province || shippingAddress.province.trim() === '') {
                    context?.alertBox("error", "Please enter your state/province");
                  } else {
                    context?.alertBox("error", "Please enter a complete shipping address");
                  }
                  return;
                }
                
                // Validate phone - REQUIRED
                if (!hasPhone) {
                  if (!phone || phone.trim() === '') {
                    context?.alertBox("error", "Please enter your phone number");
                  } else if (phoneError) {
                    context?.alertBox("error", `Invalid phone number: ${phoneError}`);
                  } else {
                    context?.alertBox("error", "Please enter a valid phone number (at least 10 digits)");
                  }
                  return;
                }
                
                // Validate shipping rate
                if (!hasShippingRate) {
                  context?.alertBox("error", "Please wait for shipping rates to calculate. Make sure your address and phone number are complete.");
                  return;
                }
                
                // All validations passed - proceed
                // Save address silently before proceeding
                if (shippingAddress?.city && phone && !savingAddress) {
                  await saveAddress(true); // Save silently
                }
                // Navigate to checkout with all customer info
                history("/checkout", { 
                  state: { 
                    selectedShippingRate, 
                    shippingAddress,
                    phone: phone,
                    customerName: customerName.trim(),
                    apartmentNumber: apartmentNumber.trim(),
                    deliveryNote: deliveryNote.trim(),
                    discounts: discounts // Pass discount information
                  }
                });
              };
              
              // Check if user is logged in
              const isLoggedIn = context?.isLogin && context?.userData;
              
              // Check if customer name is provided
              const hasCustomerName = customerName && customerName.trim() !== '';
              
              // If not logged in, show login prompt
              if (!isLoggedIn) {
                return (
                  <div className="flex flex-col gap-3">
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-md text-center">
                      <p className="text-[13px] text-blue-800 mb-2">
                        🔐 Please login or create an account to proceed to checkout
                      </p>
                    </div>
                    <Link to="/login">
                      <Button className="btn-org btn-lg w-full flex gap-2">
                        <BsFillBagCheckFill className="text-[20px]" /> Login to Checkout
                      </Button>
                    </Link>
                    <p className="text-center text-[12px] text-gray-600">
                      Don't have an account? <Link to="/register" className="text-primary font-[600]">Sign Up</Link>
                    </p>
                  </div>
                );
              }
              
              // Disable checkout if required fields are missing
              if (!hasCustomerName || !hasValidAddress || !hasPhone) {
                return (
                  <Button 
                    className="btn-org btn-lg w-full flex gap-2" 
                    disabled={true}
                    onClick={handleCheckoutClick}
                    style={{ opacity: 0.6, cursor: 'not-allowed' }}
                  >
                    <BsFillBagCheckFill className="text-[20px]" /> 
                    {!hasCustomerName ? "⚠️ Full Name Required" : !hasValidAddress ? "⚠️ Complete Shipping Address Required" : !hasPhone ? "⚠️ Phone Number Required" : "⚠️ Complete Required Fields"}
                  </Button>
                );
              }
              
              return (
                <Button 
                  className="btn-org btn-lg w-full flex gap-2"
                  onClick={handleCheckoutClick}
                >
                  <BsFillBagCheckFill className="text-[20px]" /> Proceed to Checkout
                </Button>
              );
            })()}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CartPage;
