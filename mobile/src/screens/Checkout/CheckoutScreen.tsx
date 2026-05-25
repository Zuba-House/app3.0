/**
 * Checkout Screen - TEMU Style
 * Multi-step checkout flow with address, shipping, and payment
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Platform,
  TextInput,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator } from 'react-native-paper';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { addressService } from '../../services/address.service';
import { checkoutService } from '../../services/checkout.service';
import { cartService } from '../../services/cart.service';
import { productService } from '../../services/product.service';
import { Address, ShippingMethod } from '../../types/address.types';
import { ApiResponse } from '../../types/api.types';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { selectCartItems, selectCartTotal, clearCart, setCart } from '../../store/slices/cartSlice';
import Colors from '../../constants/colors';
import { getDeliveryEstimateForMethod } from '../../constants/shipping';
import { analyticsService } from '../../services/analytics.service';
import { showError, showSuccess, showWarning } from '../../utils/toast';
import { useAuthState } from '../../core/auth/authGuards';
import { useAuthGate } from '../../core/auth/authGate';
import { authManager } from '../../core/auth/authManager';
import { buildCheckoutPayload } from '../../features/checkout/utils/buildCheckoutPayload';
import { createCheckoutOrder } from '../../features/checkout/api/createOrder';
import { checkoutStore } from '../../features/checkout/store/checkoutStore';
import { getOrderId, needsOnlineStripePayment, type RawOrder } from '../../utils/order.mappers';
import { useInAppStripePayment } from '../../hooks/useInAppStripePayment';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DELIVERY_NOTE_STORAGE_KEY = 'checkout_delivery_note_v1';
const ORDER_SOURCE_TAG = 'zuba_mobile_app';

type CheckoutStep = 'address' | 'shipping' | 'payment' | 'review';

const CheckoutScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();
  const cartItems = useAppSelector(selectCartItems);
  const cartTotal = useAppSelector(selectCartTotal);
  const { authStatus, user } = useAuthState();
  const isAuthenticated = authStatus === 'authenticated';
  const { openAuth } = useAuthGate();
  const shippingLocation = useAppSelector((state) => state.shippingLocation);

  // Checkout state
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('address');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  // Data state
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([]);
  const [selectedShipping, setSelectedShipping] = useState<ShippingMethod | null>(null);
  const paymentMethod = 'stripe' as const;
  const { payForOrder } = useInAppStripePayment();
  const [deliveryNote, setDeliveryNote] = useState('');
  const [savedDeliveryNote, setSavedDeliveryNote] = useState('');

  useEffect(() => {
    const loadSavedDeliveryNote = async () => {
      try {
        const saved = await AsyncStorage.getItem(DELIVERY_NOTE_STORAGE_KEY);
        if (saved) {
          setSavedDeliveryNote(saved);
          setDeliveryNote(saved);
        }
      } catch {
        // ignore restore error
      }
    };
    loadSavedDeliveryNote();
  }, []);

  useEffect(() => {
    const trimmed = deliveryNote.trim();
    if (!trimmed) return;
    setSavedDeliveryNote(trimmed);
    AsyncStorage.setItem(DELIVERY_NOTE_STORAGE_KEY, trimmed).catch(() => {});
  }, [deliveryNote]);

  // Coupon & Gift Card state
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number; type: string } | null>(null);
  const [giftCardCode, setGiftCardCode] = useState('');
  const [appliedGiftCard, setAppliedGiftCard] = useState<{ code: string; discount: number; balance: number } | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [giftCardLoading, setGiftCardLoading] = useState(false);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [giftCardDiscount, setGiftCardDiscount] = useState(0);

  // Calculated totals
  const [totals, setTotals] = useState({
    subtotal: 0,
    shippingCost: 0,
    couponDiscount: 0,
    giftCardDiscount: 0,
    discount: 0,
    total: 0,
  });

  const getEffectiveContact = () => {
    const addr: any = selectedAddress as any;
    const fullNameFromContactInfo = [
      addr?.contactInfo?.firstName,
      addr?.contactInfo?.lastName,
    ]
      .filter(Boolean)
      .join(' ')
      .trim();
    const effectiveName =
      (addr?.name ||
        fullNameFromContactInfo ||
        addr?.contactName ||
        (user as any)?.name ||
        'Customer') as string;
    const effectiveEmail = ((user as any)?.email || `${String((user as any)?._id || 'customer')}@zubahouse.local`) as string;
    const effectivePhone =
      (
        addr?.phone ||
        addr?.mobile ||
        addr?.contactInfo?.phone ||
        addr?.contact?.phone ||
        addr?.phoneNumber ||
        (user as any)?.mobile ||
        (user as any)?.phone ||
        ''
      ) as string;
    return { effectiveName, effectiveEmail, effectivePhone };
  };

  useEffect(() => {
    checkoutStore.setState({ mode: isAuthenticated ? 'authenticated' : 'guest' });
  }, [isAuthenticated]);

  useEffect(() => {
    const phone = String((selectedAddress as any)?.phone || (selectedAddress as any)?.mobile || (user as any)?.phone || (user as any)?.mobile || '');
    checkoutStore.setState({
      address: selectedAddress,
      shippingMethod: selectedShipping,
      deliveryNote,
      paymentMethod,
      customer: {
        name: String((selectedAddress as any)?.name || (user as any)?.name || 'Customer'),
        email: String((user as any)?.email || ''),
        phone,
      },
    });
  }, [selectedAddress, selectedShipping, deliveryNote, paymentMethod, user]);

  const toUserFriendlyOrderError = (message: string) => {
    const text = String(message || '').toLowerCase();
    if (text.includes('isguestorder') && text.includes('cast to boolean failed')) {
      return 'Your session state was inconsistent during checkout. Please try again now.';
    }
    if (text.includes('guestcustomer') || text.includes('order validation failed')) {
      return 'Please complete your contact information (name, email, and phone) before placing the order.';
    }
    if (text.includes('session expired')) {
      return 'Your session expired. Please sign in again and retry checkout.';
    }
    if (text.includes('timed out') || text.includes('network')) {
      return 'Network issue during checkout. Please check connection and try again.';
    }
    if (text.includes('shipping method is required')) {
      return 'Please choose a shipping method.';
    }
    if (text.includes('invalid address')) {
      return 'Please complete your shipping address before placing the order.';
    }
    if (text.includes('insufficient stock')) {
      return 'One or more items are out of stock. Please update your cart and try again.';
    }
    return message || 'We could not place your order right now. Please try again.';
  };

  useEffect(() => {
    // Allow guest checkout - load data even if not authenticated
    loadInitialData();
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (!isAuthenticated) return;
      let cancelled = false;
      cartService.getCart().then((r) => {
        if (cancelled) return;
        if (r.success && Array.isArray(r.data)) {
          dispatch(setCart(r.data));
        }
      });
      return () => {
        cancelled = true;
      };
    }, [isAuthenticated, dispatch])
  );

  useEffect(() => {
    // Recalculate totals when shipping or discount changes
    const shippingCost = selectedShipping?.price || 0;
    const newTotals = checkoutService.calculateTotals(cartTotal, shippingCost, couponDiscount, giftCardDiscount);
    setTotals(newTotals);
  }, [cartTotal, selectedShipping, couponDiscount, giftCardDiscount]);

  useEffect(() => {
    if (!appliedGiftCard?.code) return;
    const shippingCost = selectedShipping?.price || 0;
    const payableBeforeGift = Math.max(0, cartTotal + shippingCost - couponDiscount);
    let cancelled = false;
    (async () => {
      try {
        const response = await checkoutService.applyGiftCard(appliedGiftCard.code, payableBeforeGift);
        if (cancelled) return;
        if (response.success && response.data) {
          const discount = response.data.discount || 0;
          setGiftCardDiscount(discount);
          setAppliedGiftCard((prev) =>
            prev
              ? {
                  ...prev,
                  discount,
                  balance: response.data?.giftCard?.currentBalance ?? prev.balance,
                }
              : null
          );
        } else {
          setGiftCardDiscount(0);
          setAppliedGiftCard(null);
          setGiftCardCode('');
        }
      } catch {
        // keep previous gift discount on transient errors
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [couponDiscount, cartTotal, selectedShipping?.price, appliedGiftCard?.code]);

  const hasNavigatedToAddAddressRef = useRef(false);
  useEffect(() => {
    if (loading || currentStep !== 'address') return;
    if (addresses.length > 0) return;
    if (hasNavigatedToAddAddressRef.current) return;
    hasNavigatedToAddAddressRef.current = true;
    navigation.navigate('AddAddress', {
      isGuestCheckout: !isAuthenticated,
      onSave: (newAddress: Address) => {
        setAddresses([newAddress]);
        setSelectedAddress(newAddress);
        setCurrentStep('shipping');
      },
    });
  }, [loading, currentStep, addresses.length, isAuthenticated, navigation]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      // Load addresses only if authenticated
      const addressRes = isAuthenticated 
        ? await addressService.getAddresses()
        : { success: true, data: [] };
      
      let addressList: Address[] = [];
      if (addressRes.success && addressRes.data) {
        addressList = Array.isArray(addressRes.data) ? addressRes.data : [];
        setAddresses(addressList);
        // Auto-select default address
        const defaultAddr = addressList.find((a) => a.isDefault) || addressList[0];
        if (defaultAddr) {
          setSelectedAddress(defaultAddr);
        }
      }

      const cartPayload = cartItems.map((item: any) => ({
        productId: item.productId || item.product?._id || item._id,
        quantity: item.quantity || 1,
        product: item.product,
      }));
      const addrForRates =
        addressList.find((a) => a.isDefault) ||
        addressList[0] ||
        (shippingLocation.countryCode
          ? {
              addressLine1: '—',
              city: shippingLocation.city || '—',
              postalCode: '00000',
              country: shippingLocation.countryName || shippingLocation.countryCode,
              countryCode: shippingLocation.countryCode,
            }
          : null);

      const shippingRes = await checkoutService.getShippingRates(cartPayload, addrForRates);

      if (shippingRes.success && shippingRes.data) {
        const methods = Array.isArray(shippingRes.data) ? shippingRes.data : [];
        setShippingMethods(methods);
        if (methods.length > 0) setSelectedShipping(methods[0]);
      }
    } catch (error) {
      console.error('Error loading checkout data:', error);
      showError('Failed to load checkout information. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      showError('Please enter a coupon code');
      return;
    }
    
    try {
      setCouponLoading(true);
      const response = await checkoutService.applyCoupon(couponCode.trim(), cartItems, cartTotal);
      
      if (response.success && response.data) {
        const discount = response.data.discount || 0;
        setCouponDiscount(discount);
        setAppliedCoupon({
          code: couponCode.trim().toUpperCase(),
          discount,
          type: response.data.type || 'fixed'
        });
        showSuccess(`Coupon applied! You saved $${discount.toFixed(2)}`);
      } else {
        const errMsg = (response as any).error || (response as any).message;
        const code = (response as any).code;
        if (code === 'PLATFORM_MISMATCH') {
          showWarning('This coupon is only valid on our website.');
        } else {
          showWarning(errMsg || 'This coupon is not valid');
        }
      }
    } catch (error: any) {
      const code = error?.response?.data?.code || error?.code;
      if (code === 'PLATFORM_MISMATCH') {
        showWarning('This coupon is only valid on our website.');
      } else {
        showError(error.message || 'Failed to apply coupon');
      }
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponCode('');
    setCouponDiscount(0);
    setAppliedCoupon(null);
  };

  const handleApplyGiftCard = async () => {
    if (!giftCardCode.trim()) {
      showError('Please enter a gift card code');
      return;
    }
    
    try {
      setGiftCardLoading(true);
      const shippingCost = selectedShipping?.price || 0;
      const payableBeforeGift = Math.max(0, cartTotal + shippingCost - couponDiscount);
      const response = await checkoutService.applyGiftCard(giftCardCode.trim(), payableBeforeGift);
      
      if (response.success && response.data) {
        const discount = response.data.discount || 0;
        const giftCard = response.data.giftCard;
        setGiftCardDiscount(discount);
        setAppliedGiftCard({
          code: giftCardCode.trim().toUpperCase(),
          discount,
          balance: giftCard?.currentBalance || 0
        });
        showSuccess(`Gift card applied! $${discount.toFixed(2)} will be deducted`);
      } else {
        showWarning((response as any).error || 'This gift card is not valid');
      }
    } catch (error: any) {
      showError(error.message || 'Failed to apply gift card');
    } finally {
      setGiftCardLoading(false);
    }
  };

  const handleRemoveGiftCard = () => {
    setGiftCardCode('');
    setGiftCardDiscount(0);
    setAppliedGiftCard(null);
  };

  const handleAddAddress = () => {
    navigation.navigate('AddAddress', {
      onSave: (newAddress: Address) => {
        setAddresses([...addresses, newAddress]);
        setSelectedAddress(newAddress);
      },
    });
  };

  const handleNextStep = () => {
    if (currentStep === 'address') {
      if (!selectedAddress) {
        if (!isAuthenticated) {
          navigation.navigate('AddAddress', {
            isGuestCheckout: true,
            onSave: (newAddress: Address) => {
              setAddresses([newAddress]);
              setSelectedAddress(newAddress);
              setCurrentStep('shipping');
            },
          });
          return;
        }
        showWarning('Please select or add a shipping address');
        return;
      }
      setCurrentStep('shipping');
    } else if (currentStep === 'shipping') {
      if (!selectedShipping) {
        showWarning('Please select a shipping method');
        return;
      }
      setCurrentStep('payment');
    } else if (currentStep === 'payment') {
      setCurrentStep('review');
    }
  };

  const handlePreviousStep = () => {
    if (currentStep === 'shipping') setCurrentStep('address');
    else if (currentStep === 'payment') setCurrentStep('shipping');
    else if (currentStep === 'review') setCurrentStep('payment');
    else navigation.goBack();
  };

  const handlePlaceOrder = async () => {
    if (processing) return;

    if (!selectedAddress || !selectedShipping) {
      showError('Please complete all checkout steps');
      return;
    }
    // Guest checkout supported

    try {
      setProcessing(true);
      analyticsService.checkoutStart(totals.total, cartItems.length);

      // Pre-validate stock before attempting order creation, to avoid backend rejection at final step.
      const outOfStockTitles: string[] = [];
      for (const item of cartItems as any[]) {
        const productId = item.productId || item.product?._id;
        if (!productId) continue;
        try {
          const productRes = await productService.getProductById(productId);
          if (!productRes.success || !productRes.data) continue;
          const p: any = productRes.data;
          const qty = Number(item.quantity || 0);
          const resolvedVariationId = item.variationId || item.variation?._id || null;
          const isVariableLine =
            (item.productType === 'variable' || p?.productType === 'variable') &&
            Array.isArray(p?.variations) &&
            p.variations.length > 0;
          const productStockStatus = String(
            p?.inventory?.stockStatus || p?.stockStatus || ''
          ).toLowerCase();

          // Variation-level stock/status check if variation selected
          if (isVariableLine && resolvedVariationId) {
            const v = p.variations.find((vv: any) => String(vv?._id) === String(resolvedVariationId));
            if (v) {
              const vStatus = String(v?.stockStatus || '').toLowerCase();
              if (vStatus === 'out_of_stock') {
                outOfStockTitles.push(item.productTitle || item.product?.name || 'Product');
                continue;
              }
              if (!v?.endlessStock) {
                const vStockRaw = v?.stock;
                if (vStockRaw !== undefined && vStockRaw !== null && Number(vStockRaw) < qty) {
                  outOfStockTitles.push(item.productTitle || item.product?.name || 'Product');
                  continue;
                }
              }
            }
          } else if (isVariableLine) {
            // Variable product without explicit variation id:
            // allow checkout when at least one variation is currently purchasable.
            const hasSellableVariation = p.variations.some((v: any) => {
              if (!v) return false;
              const vStatus = String(v?.stockStatus || '').toLowerCase();
              if (vStatus === 'out_of_stock') return false;
              if (v?.endlessStock) return true;
              const vStockRaw = v?.stock;
              return vStockRaw !== undefined && vStockRaw !== null ? Number(vStockRaw) >= qty : false;
            });
            if (!hasSellableVariation) {
              outOfStockTitles.push(item.productTitle || item.product?.name || 'Product');
              continue;
            }
          } else {
            // Simple product stock/status check
            if (productStockStatus === 'out_of_stock') {
              outOfStockTitles.push(item.productTitle || item.product?.name || 'Product');
              continue;
            }
            const endless = !!p?.inventory?.endlessStock;
            const stockRaw = p?.inventory?.stock ?? p?.countInStock ?? p?.stock;
            if (!endless && stockRaw !== undefined && stockRaw !== null) {
              if (Number(stockRaw) < qty) {
                outOfStockTitles.push(item.productTitle || item.product?.name || 'Product');
                continue;
              }
            }
          }
        } catch {
          // Skip hard-failing on stock precheck network errors; backend still validates.
        }
      }

      if (outOfStockTitles.length > 0) {
        showError(
          `Please remove unavailable item(s) from cart: ${outOfStockTitles.join(', ')}`
        );
        setProcessing(false);
        return;
      }

      let addressId = selectedAddress._id;
      const isGuestAddress = !addressId || String(addressId).startsWith('guest-');
      if (isGuestAddress) {
        const payload = {
          contactInfo: {
            firstName: selectedAddress.name?.split(' ')[0] || '',
            lastName: selectedAddress.name?.split(' ').slice(1).join(' ') || '',
            phone: selectedAddress.phone || '',
          },
          address: {
            addressLine1: selectedAddress.addressLine1,
            addressLine2: selectedAddress.addressLine2 || '',
            city: selectedAddress.city,
            province: selectedAddress.state,
            provinceCode: selectedAddress.state?.slice(0, 2)?.toUpperCase() || '',
            postalCode: selectedAddress.postalCode,
            country: selectedAddress.country,
            countryCode: selectedAddress.countryCode || 'CA',
          },
        };
        const addRes = await addressService.addAddress(payload as any);
        if (addRes.success && addRes.data?._id) addressId = addRes.data._id;
      }

      const accessToken = authManager.getAccessToken();
      if (isAuthenticated && !accessToken) {
        const refreshed = await authManager.refreshSession();
        if (!refreshed) {
          showError('Please sign in again before placing your order.');
          setProcessing(false);
          openAuth({ target: { screen: 'Checkout' } });
          return;
        }
      }

      const idempotencyKey = `checkout_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
      const checkoutSnapshot = checkoutStore.getState();
      const payloadResult = buildCheckoutPayload({
        mode: checkoutSnapshot.mode,
        user,
        selectedAddress: { ...(checkoutSnapshot.address || selectedAddress), _id: addressId },
        selectedShipping: checkoutSnapshot.shippingMethod || selectedShipping,
        cartItems,
        totalAmt: totals.total,
        shippingCost: (checkoutSnapshot.shippingMethod || selectedShipping)?.price || 0,
        idempotencyKey,
        paymentMethod: checkoutSnapshot.paymentMethod || paymentMethod,
        couponCode: appliedCoupon?.code,
        giftCardCode: appliedGiftCard?.code,
        deliveryNote: checkoutSnapshot.deliveryNote || deliveryNote,
        sourceTag: ORDER_SOURCE_TAG,
      });

      if (!payloadResult.ok) {
        showWarning(payloadResult.errors[0]?.message || 'Please review checkout details.');
        setProcessing(false);
        return;
      }

      if (__DEV__) {
        console.info('[Checkout][submit]', {
          authStatus,
          isAuthenticated,
          hasAccessToken: Boolean(authManager.getAccessToken()),
          mode: payloadResult.data.diagnostics.mode,
          payloadDiagnostics: payloadResult.data.diagnostics,
          hasDeliveryNote: Boolean(deliveryNote.trim()),
        });
      }

      const orderResponse: ApiResponse<any> = await createCheckoutOrder(payloadResult.data.payload);

      if (orderResponse.success && orderResponse.data) {
        const orderRaw = orderResponse.data as RawOrder;
        const orderId = getOrderId(orderRaw) || String(orderResponse.data._id || orderResponse.data.orderId || '');

        const { effectiveName, effectiveEmail } = getEffectiveContact();

        const completeCheckoutSuccess = (paymentPending = false) => {
          analyticsService.purchase(
            orderId,
            totals.total,
            cartItems.map((item) => ({
              id: typeof item.product === 'object' ? item.product?._id : '',
              name: typeof item.product === 'object' ? item.product?.name || 'Unknown' : 'Unknown',
              price: item.price,
              quantity: item.quantity,
            }))
          );
          cartService.clearCart().catch(() => undefined);
          dispatch(clearCart());
          navigation.reset({
            index: 0,
            routes: [
              {
                name: 'OrderConfirmation',
                params: {
                  orderId,
                  total: totals.total,
                  paymentPending,
                  paymentAmount: totals.total,
                  paymentMethod,
                  customerEmail: effectiveEmail,
                  customerName: effectiveName,
                },
              },
            ],
          });
        };

        const requiresStripe =
          isAuthenticated && needsOnlineStripePayment(orderRaw, paymentMethod);

        if (requiresStripe && totals.total > 0) {
          const payResult = await payForOrder({
            orderId,
            amount: totals.total,
            customerEmail: effectiveEmail,
            customerName: effectiveName,
          });
          completeCheckoutSuccess(payResult.status !== 'paid');
        } else {
          completeCheckoutSuccess(false);
        }
      } else {
        showError(toUserFriendlyOrderError((orderResponse as any).message || ''));
      }
    } catch (error: any) {
      showError(toUserFriendlyOrderError(error.message || ''));
    } finally {
      setProcessing(false);
    }
  };

  const renderProgressSteps = () => {
    const steps = [
      { key: 'address', label: 'Address', icon: 'location-outline' },
      { key: 'shipping', label: 'Shipping', icon: 'car-outline' },
      { key: 'payment', label: 'Payment', icon: 'card-outline' },
      { key: 'review', label: 'Review', icon: 'checkmark-circle-outline' },
    ];

    const currentIndex = steps.findIndex((s) => s.key === currentStep);

    return (
      <View style={styles.progressContainer}>
        {steps.map((step, index) => {
          const isActive = index <= currentIndex;
          const isCurrent = step.key === currentStep;

          return (
            <React.Fragment key={step.key}>
              <View style={styles.stepItem}>
                <View
                  style={[
                    styles.stepCircle,
                    isActive && styles.stepCircleActive,
                    isCurrent && styles.stepCircleCurrent,
                  ]}
                >
                  <Ionicons
                    name={step.icon as any}
                    size={16}
                    color={isActive ? Colors.white : Colors.primary}
                  />
                </View>
                <Text
                  style={[styles.stepLabel, isActive && styles.stepLabelActive]}
                >
                  {step.label}
                </Text>
              </View>
              {index < steps.length - 1 && (
                <View
                  style={[
                    styles.stepConnector,
                    index < currentIndex && styles.stepConnectorActive,
                  ]}
                />
              )}
            </React.Fragment>
          );
        })}
      </View>
    );
  };

  const renderAddressStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Shipping Address</Text>

      {addresses.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="location-outline" size={48} color={Colors.secondary} />
          <Text style={styles.emptyText}>
            {isAuthenticated ? 'No addresses saved' : 'Add your shipping address'}
          </Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={isAuthenticated ? handleAddAddress : () => {
              navigation.navigate('AddAddress', {
                isGuestCheckout: true,
                onSave: (newAddress: Address) => {
                  setAddresses([newAddress]);
                  setSelectedAddress(newAddress);
                  setCurrentStep('shipping');
                },
              });
            }}
          >
            <Ionicons name="add" size={20} color={Colors.white} />
            <Text style={styles.addButtonText}>
              {isAuthenticated ? 'Add New Address' : 'Add Shipping Address'}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {addresses.map((address) => (
            <TouchableOpacity
              key={address._id}
              style={[
                styles.addressCard,
                selectedAddress?._id === address._id && styles.addressCardSelected,
              ]}
              onPress={() => setSelectedAddress(address)}
            >
              <View style={styles.addressRadio}>
                <View
                  style={[
                    styles.radioOuter,
                    selectedAddress?._id === address._id && styles.radioOuterSelected,
                  ]}
                >
                  {selectedAddress?._id === address._id && (
                    <View style={styles.radioInner} />
                  )}
                </View>
              </View>
              <View style={styles.addressContent}>
                <Text style={styles.addressName}>{address.name}</Text>
                <Text style={styles.addressPhone}>{address.phone}</Text>
                <Text style={styles.addressLine}>
                  {address.addressLine1}
                  {address.addressLine2 ? `, ${address.addressLine2}` : ''}
                </Text>
                <Text style={styles.addressLine}>
                  {address.city}, {address.state} {address.postalCode}
                </Text>
                <Text style={styles.addressLine}>{address.country}</Text>
                {address.isDefault && (
                  <View style={styles.defaultBadge}>
                    <Text style={styles.defaultBadgeText}>Default</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={styles.addAddressLink}
            onPress={isAuthenticated ? handleAddAddress : () => navigation.navigate('AddAddress', {
              isGuestCheckout: true,
              onSave: (newAddress: Address) => {
                setAddresses([...addresses, newAddress]);
                setSelectedAddress(newAddress);
              },
            })}
          >
            <Ionicons name="add-circle-outline" size={20} color={Colors.secondary} />
            <Text style={styles.addAddressText}>Add New Address</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );

  const renderShippingStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Shipping Method</Text>
      <Text style={styles.stepSubtitle}>
        Zuba House Regular & Express
      </Text>

      {shippingMethods.map((method) => (
        <TouchableOpacity
          key={method._id}
          style={[
            styles.shippingCard,
            selectedShipping?._id === method._id && styles.shippingCardSelected,
          ]}
          onPress={() => setSelectedShipping(method)}
        >
          <View style={styles.shippingRadio}>
            <View
              style={[
                styles.radioOuter,
                selectedShipping?._id === method._id && styles.radioOuterSelected,
              ]}
            >
              {selectedShipping?._id === method._id && (
                <View style={styles.radioInner} />
              )}
            </View>
          </View>
          <View style={styles.shippingContent}>
            <View style={styles.shippingHeader}>
              <Text style={styles.shippingName}>{method.name}</Text>
              <Text style={styles.shippingPrice}>${method.price.toFixed(2)}</Text>
            </View>
            <Text style={styles.shippingDescription}>{method.description}</Text>
            <View style={styles.shippingMeta}>
              <Ionicons name="time-outline" size={14} color={Colors.primary} />
              <Text style={styles.shippingEta}>
                {getDeliveryEstimateForMethod(method._id, shippingLocation.countryCode)}
              </Text>
              {method.carrier && (
                <>
                  <Text style={styles.shippingDivider}>•</Text>
                  <Text style={styles.shippingCarrier}>{method.carrier}</Text>
                </>
              )}
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderPaymentStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Payment</Text>
      <Text style={styles.stepSubtitle}>Pay securely with credit or debit card</Text>

      <View style={[styles.paymentCard, styles.paymentCardSelected]}>
        <View style={styles.paymentContent}>
          <Ionicons name="card" size={24} color={Colors.secondary} />
          <View style={styles.paymentInfo}>
            <Text style={styles.paymentName}>Credit / Debit Card</Text>
            <Text style={styles.paymentDescription}>
              You will enter your card on the next step — payment stays inside the app.
            </Text>
          </View>
          <View style={styles.paymentLogos}>
            <Text style={styles.cardBrand}>VISA</Text>
            <Text style={styles.cardBrand}>MC</Text>
          </View>
        </View>
      </View>

      {/* Coupon Code Section */}
      <View style={styles.discountSection}>
        <Text style={styles.discountSectionTitle}>Have a Coupon?</Text>
        {appliedCoupon ? (
          <View style={styles.appliedDiscountCard}>
            <View style={styles.appliedDiscountInfo}>
              <Ionicons name="pricetag" size={20} color="#4CAF50" />
              <View style={styles.appliedDiscountText}>
                <Text style={styles.appliedCode}>{appliedCoupon.code}</Text>
                <Text style={styles.appliedSavings}>
                  You save ${appliedCoupon.discount.toFixed(2)}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={handleRemoveCoupon} style={styles.removeButton}>
              <Ionicons name="close-circle" size={24} color="#E60012" />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.discountInputRow}>
            <TextInput
              style={styles.discountInput}
              placeholder="Enter coupon code"
              value={couponCode}
              onChangeText={setCouponCode}
              autoCapitalize="characters"
              placeholderTextColor={Colors.primary + '80'}
            />
            <TouchableOpacity 
              style={[styles.applyButton, couponLoading && styles.applyButtonDisabled]}
              onPress={handleApplyCoupon}
              disabled={couponLoading}
            >
              {couponLoading ? (
                <ActivityIndicator size="small" color={Colors.white} />
              ) : (
                <Text style={styles.applyButtonText}>Apply</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Gift Card Section */}
      <View style={styles.discountSection}>
        <Text style={styles.discountSectionTitle}>Have a Gift Card?</Text>
        {appliedGiftCard ? (
          <View style={styles.appliedDiscountCard}>
            <View style={styles.appliedDiscountInfo}>
              <Ionicons name="gift" size={20} color="#9C27B0" />
              <View style={styles.appliedDiscountText}>
                <Text style={styles.appliedCode}>{appliedGiftCard.code}</Text>
                <Text style={styles.appliedSavings}>
                  Applied: ${appliedGiftCard.discount.toFixed(2)} (Balance: ${appliedGiftCard.balance.toFixed(2)})
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={handleRemoveGiftCard} style={styles.removeButton}>
              <Ionicons name="close-circle" size={24} color="#E60012" />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.discountInputRow}>
            <TextInput
              style={styles.discountInput}
              placeholder="Enter gift card code"
              value={giftCardCode}
              onChangeText={setGiftCardCode}
              autoCapitalize="characters"
              placeholderTextColor={Colors.primary + '80'}
            />
            <TouchableOpacity 
              style={[styles.applyButton, styles.giftCardButton, giftCardLoading && styles.applyButtonDisabled]}
              onPress={handleApplyGiftCard}
              disabled={giftCardLoading}
            >
              {giftCardLoading ? (
                <ActivityIndicator size="small" color={Colors.white} />
              ) : (
                <Text style={styles.applyButtonText}>Apply</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.securityNote}>
        <Ionicons name="shield-checkmark" size={16} color={Colors.secondary} />
        <Text style={styles.securityText}>
          Your payment information is encrypted and secure
        </Text>
      </View>

    </View>
  );

  const renderReviewStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Order Review</Text>

      {/* Shipping Address Summary */}
      <View style={styles.reviewSection}>
        <View style={styles.reviewHeader}>
          <Text style={styles.reviewLabel}>Shipping Address</Text>
          <TouchableOpacity onPress={() => setCurrentStep('address')}>
            <Text style={styles.editLink}>Edit</Text>
          </TouchableOpacity>
        </View>
        {selectedAddress && (
          <View style={styles.reviewContent}>
            <Text style={styles.reviewText}>{selectedAddress.name}</Text>
            <Text style={styles.reviewText}>{selectedAddress.addressLine1}</Text>
            <Text style={styles.reviewText}>
              {selectedAddress.city}, {selectedAddress.state} {selectedAddress.postalCode}
            </Text>
          </View>
        )}
      </View>
      <View style={styles.reviewSection}>
        <Text style={styles.reviewLabel}>Delivery Note (Optional)</Text>
        <View style={{ marginTop: 8 }}>
          <TextInput
            style={styles.discountInput}
            placeholder="Add delivery instructions (optional)"
            value={deliveryNote}
            onChangeText={setDeliveryNote}
            placeholderTextColor={Colors.primary + '80'}
          />
        </View>
        <View style={styles.noteActionsRow}>
          <TouchableOpacity
            style={styles.noteActionButton}
            onPress={() => setDeliveryNote(savedDeliveryNote)}
            disabled={!savedDeliveryNote}
          >
            <Text style={[styles.noteActionText, !savedDeliveryNote && styles.noteActionTextDisabled]}>Use saved note</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.noteActionButton}
            onPress={() => setDeliveryNote('')}
            disabled={!deliveryNote}
          >
            <Text style={[styles.noteActionText, !deliveryNote && styles.noteActionTextDisabled]}>Clear</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Shipping Method Summary */}
      <View style={styles.reviewSection}>
        <View style={styles.reviewHeader}>
          <Text style={styles.reviewLabel}>Shipping Method</Text>
          <TouchableOpacity onPress={() => setCurrentStep('shipping')}>
            <Text style={styles.editLink}>Edit</Text>
          </TouchableOpacity>
        </View>
        {selectedShipping && (
          <View style={styles.reviewContent}>
            <Text style={styles.reviewText}>{selectedShipping.name}</Text>
            <Text style={styles.reviewSubtext}>
              {selectedShipping.estimatedDays} - ${selectedShipping.price.toFixed(2)}
            </Text>
          </View>
        )}
      </View>

      {/* Cart Items Summary */}
      <View style={styles.reviewSection}>
        <Text style={styles.reviewLabel}>Order Items ({cartItems.length})</Text>
        <View style={styles.itemsList}>
          {cartItems.slice(0, 3).map((item) => {
            const product = typeof item.product === 'object' ? item.product : null;
            return (
              <View key={item._id} style={styles.orderItem}>
                <Text style={styles.itemName} numberOfLines={1}>
                  {product?.name || 'Product'} x{item.quantity}
                </Text>
                <Text style={styles.itemPrice}>${item.subtotal.toFixed(2)}</Text>
              </View>
            );
          })}
          {cartItems.length > 3 && (
            <Text style={styles.moreItems}>
              +{cartItems.length - 3} more items
            </Text>
          )}
        </View>
      </View>

      {/* Order Totals */}
      <View style={styles.totalsSection}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Subtotal</Text>
          <Text style={styles.totalValue}>${totals.subtotal.toFixed(2)}</Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Shipping</Text>
          <Text style={styles.totalValue}>${totals.shippingCost.toFixed(2)}</Text>
        </View>
        {totals.couponDiscount > 0 && (
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Coupon ({appliedCoupon?.code})</Text>
            <Text style={[styles.totalValue, styles.discountValue]}>
              -${totals.couponDiscount.toFixed(2)}
            </Text>
          </View>
        )}
        {totals.giftCardDiscount > 0 && (
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Gift Card ({appliedGiftCard?.code})</Text>
            <Text style={[styles.totalValue, styles.discountValue]}>
              -${totals.giftCardDiscount.toFixed(2)}
            </Text>
          </View>
        )}
        <View style={[styles.totalRow, styles.grandTotalRow]}>
          <Text style={styles.grandTotalLabel}>Total</Text>
          <Text style={styles.grandTotalValue}>${totals.total.toFixed(2)}</Text>
        </View>
      </View>
    </View>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 'address':
        return renderAddressStep();
      case 'shipping':
        return renderShippingStep();
      case 'payment':
        return renderPaymentStep();
      case 'review':
        return renderReviewStep();
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.secondary} />
        <Text style={styles.loadingText}>Loading checkout...</Text>
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.stepTitle}>Sign in required</Text>
        <Text style={styles.stepSubtitle}>Please sign in to continue to checkout.</Text>
        <TouchableOpacity style={styles.actionButton} onPress={() => openAuth({ target: { screen: 'Checkout' } })}>
          <Text style={styles.actionButtonText}>Sign in to continue</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handlePreviousStep} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      {/* Progress Steps */}
      {renderProgressSteps()}

      {/* Step Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {renderStepContent()}
      </ScrollView>

      {/* Footer Action Button */}
      <View style={styles.footer}>
        {(() => {
          return (
        <TouchableOpacity
            style={[
              styles.actionButton,
              processing && styles.actionButtonDisabled,
            ]}
            onPress={currentStep === 'review' ? handlePlaceOrder : handleNextStep}
            disabled={processing}
        >
          {processing ? (
            <ActivityIndicator size="small" color={Colors.white} />
          ) : (
            <>
              <Text style={styles.actionButtonText}>
                {currentStep === 'review'
                  ? `Pay $${totals.total.toFixed(2)}`
                  : 'Continue'}
              </Text>
              <Ionicons name="arrow-forward" size={20} color={Colors.white} />
            </>
          )}
        </TouchableOpacity>
          );
        })()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.white,
  },
  loadingText: {
    marginTop: 16,
    color: Colors.primary,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 50 : 16,
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primary,
  },
  headerPlaceholder: {
    width: 40,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: Colors.white,
  },
  stepItem: {
    alignItems: 'center',
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  stepCircleActive: {
    backgroundColor: Colors.primary,
  },
  stepCircleCurrent: {
    backgroundColor: Colors.secondary,
  },
  stepLabel: {
    fontSize: 10,
    color: Colors.primary,
    opacity: 0.5,
    fontWeight: '500',
  },
  stepLabelActive: {
    opacity: 1,
    fontWeight: '600',
  },
  stepConnector: {
    width: 30,
    height: 2,
    backgroundColor: Colors.tertiary,
    marginHorizontal: 4,
    marginBottom: 20,
  },
  stepConnectorActive: {
    backgroundColor: Colors.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 13,
    color: Colors.primary,
    opacity: 0.7,
    marginBottom: 16,
  },
  authBlock: {
    marginBottom: 16,
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  authBlockTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 12,
  },
  authButtonsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  authButtonSecondary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.primary,
    backgroundColor: Colors.white,
  },
  authButtonPrimary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: Colors.primary,
  },
  authButtonSecondaryText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.primary,
  },
  authButtonPrimaryText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.white,
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: Colors.white,
    borderRadius: 16,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.primary,
    opacity: 0.7,
    marginTop: 12,
    marginBottom: 20,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
  },
  addButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  addressCard: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  addressCardSelected: {
    borderColor: Colors.secondary,
    backgroundColor: Colors.tertiary,
  },
  addressRadio: {
    marginRight: 12,
    paddingTop: 2,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.primary,
    opacity: 0.4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioOuterSelected: {
    borderColor: Colors.secondary,
    opacity: 1,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.secondary,
  },
  addressContent: {
    flex: 1,
  },
  addressName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 4,
  },
  addressPhone: {
    fontSize: 14,
    color: Colors.primary,
    opacity: 0.7,
    marginBottom: 8,
  },
  addressLine: {
    fontSize: 14,
    color: Colors.primary,
    opacity: 0.8,
    lineHeight: 20,
  },
  defaultBadge: {
    backgroundColor: Colors.secondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  defaultBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.primary,
  },
  addAddressLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  addAddressText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.secondary,
    marginLeft: 8,
  },
  shippingCard: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  shippingCardSelected: {
    borderColor: Colors.secondary,
    backgroundColor: Colors.tertiary,
  },
  shippingRadio: {
    marginRight: 12,
    paddingTop: 2,
  },
  shippingContent: {
    flex: 1,
  },
  shippingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  shippingName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
  },
  shippingPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.secondary,
  },
  shippingDescription: {
    fontSize: 14,
    color: Colors.primary,
    opacity: 0.7,
    marginBottom: 8,
  },
  shippingMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  shippingEta: {
    fontSize: 12,
    color: Colors.primary,
    marginLeft: 4,
  },
  shippingDivider: {
    marginHorizontal: 8,
    color: Colors.primary,
    opacity: 0.4,
  },
  shippingCarrier: {
    fontSize: 12,
    color: Colors.primary,
    opacity: 0.7,
  },
  paymentCard: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  paymentCardSelected: {
    borderColor: Colors.secondary,
    backgroundColor: Colors.tertiary,
  },
  paymentRadio: {
    marginRight: 12,
    paddingTop: 4,
  },
  paymentContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentInfo: {
    flex: 1,
    marginLeft: 12,
  },
  paymentName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
  },
  paymentDescription: {
    fontSize: 13,
    color: Colors.primary,
    opacity: 0.7,
  },
  paymentLogos: {
    flexDirection: 'row',
  },
  cardBrand: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.primary,
    backgroundColor: Colors.tertiary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 4,
  },
  futurePaymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 2,
    gap: 6,
  },
  futurePaymentText: {
    fontSize: 12,
    color: Colors.primary,
    opacity: 0.7,
    flex: 1,
  },
  inlineCardForm: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    marginTop: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primary,
  },
  cardPreview: {
    backgroundColor: Colors.tertiary,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardBrandBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.secondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 8,
  },
  cardBrandBadgeText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  cardPreviewNum: {
    color: Colors.primary,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 1,
  },
  modalInputSpacing: {
    marginTop: 10,
  },
  cardRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  labeledField: { marginTop: 8 },
  labeledFieldRow: { flex: 1 },
  label: {
    fontSize: 12,
    color: Colors.primary,
    opacity: 0.7,
    marginBottom: 6,
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    color: Colors.primary,
    backgroundColor: Colors.tertiary,
  },
  modalSaveButton: {
    marginTop: 14,
    height: 46,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalSaveButtonText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
  validationText: {
    fontSize: 12,
    color: '#E60012',
    marginTop: 2,
  },
  // Branded wallet buttons
  applePayButton: {
    height: 46,
    borderRadius: 10,
    backgroundColor: '#000000',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  applePayText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  googlePayButton: {
    height: 46,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#dadce0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  googlePayText: {
    color: '#202124',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  walletSection: {
    marginTop: 12,
    gap: 10,
  },
  walletSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 2,
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    padding: 12,
    backgroundColor: Colors.white,
    borderRadius: 8,
  },
  securityText: {
    fontSize: 12,
    color: Colors.primary,
    opacity: 0.7,
    marginLeft: 8,
  },
  reviewSection: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  editLink: {
    fontSize: 14,
    color: Colors.secondary,
    fontWeight: '600',
  },
  reviewContent: {
    marginTop: 4,
  },
  reviewText: {
    fontSize: 14,
    color: Colors.primary,
    lineHeight: 22,
  },
  reviewSubtext: {
    fontSize: 13,
    color: Colors.primary,
    opacity: 0.7,
  },
  itemsList: {
    marginTop: 8,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  itemName: {
    flex: 1,
    fontSize: 14,
    color: Colors.primary,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  moreItems: {
    fontSize: 12,
    color: Colors.secondary,
    marginTop: 8,
  },
  totalsSection: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  totalLabel: {
    fontSize: 14,
    color: Colors.primary,
    opacity: 0.8,
  },
  totalValue: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.primary,
  },
  discountValue: {
    color: '#4CAF50',
  },
  grandTotalRow: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    marginTop: 8,
    paddingTop: 16,
  },
  grandTotalLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primary,
  },
  grandTotalValue: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.secondary,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
  },
  actionButtonDisabled: {
    opacity: 0.6,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
    marginRight: 8,
  },
  // Coupon & Gift Card Styles
  discountSection: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  discountSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 12,
  },
  discountInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  discountInput: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    color: Colors.primary,
    backgroundColor: Colors.tertiary,
  },
  applyButton: {
    height: 44,
    paddingHorizontal: 20,
    backgroundColor: Colors.secondary,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 80,
  },
  giftCardButton: {
    backgroundColor: '#9C27B0',
  },
  applyButtonDisabled: {
    opacity: 0.6,
  },
  applyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.white,
  },
  appliedDiscountCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.tertiary,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#4CAF50',
    borderStyle: 'dashed',
  },
  appliedDiscountInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  appliedDiscountText: {
    marginLeft: 10,
    flex: 1,
  },
  appliedCode: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
  },
  appliedSavings: {
    fontSize: 12,
    color: '#4CAF50',
    marginTop: 2,
  },
  removeButton: {
    padding: 4,
  },
  noteActionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  noteActionButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.tertiary,
  },
  noteActionText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  noteActionTextDisabled: {
    opacity: 0.45,
  },
});

export default CheckoutScreen;
