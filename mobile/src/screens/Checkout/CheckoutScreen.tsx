/**
 * Checkout Screen - TEMU Style
 * Multi-step checkout flow with address, shipping, and payment
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
  Platform,
  TextInput,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { addressService } from '../../services/address.service';
import { checkoutService, CreateOrderData } from '../../services/checkout.service';
import { cartService } from '../../services/cart.service';
import { productService } from '../../services/product.service';
import { Address, ShippingMethod } from '../../types/address.types';
import { ApiResponse } from '../../types/api.types';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { selectCartItems, selectCartTotal, clearCart } from '../../store/slices/cartSlice';
import { selectIsAuthenticated, selectUser } from '../../store/slices/authSlice';
import Colors from '../../constants/colors';
import { getDeliveryEstimateForMethod } from '../../constants/shipping';
import { analyticsService } from '../../services/analytics.service';
import { showError } from '../../utils/toast';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SAVED_CARDS_STORAGE_KEY = 'checkout_saved_cards_v1';
const SELECTED_PAYMENT_STORAGE_KEY = 'checkout_selected_payment_v1';

type CheckoutStep = 'address' | 'shipping' | 'payment' | 'review';

const CheckoutScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();
  const cartItems = useAppSelector(selectCartItems);
  const cartTotal = useAppSelector(selectCartTotal);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectUser);
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
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'apple_pay' | 'google_pay'>('stripe');
  const [savedCards, setSavedCards] = useState<Array<{
    id: string;
    brand: string;
    last4: string;
    name: string;
    expMonth: string;
    expYear: string;
  }>>([]);
  const [selectedPaymentId, setSelectedPaymentId] = useState<string>('new-card');
  const [showCardForm, setShowCardForm] = useState(false);
  const [cardForm, setCardForm] = useState({
    number: '',
    name: '',
    expMonth: '',
    expYear: '',
    cvc: '',
  });

  useEffect(() => {
    const loadSavedPaymentMethods = async () => {
      try {
        const rawCards = await AsyncStorage.getItem(SAVED_CARDS_STORAGE_KEY);
        if (rawCards) {
          const parsed = JSON.parse(rawCards);
          if (Array.isArray(parsed)) {
            setSavedCards(parsed);
          }
        }
        const selected = await AsyncStorage.getItem(SELECTED_PAYMENT_STORAGE_KEY);
        if (selected) {
          setSelectedPaymentId(selected);
          if (selected === 'apple_pay' || selected === 'google_pay') {
            setPaymentMethod(selected);
          } else if (selected !== 'new-card') {
            setPaymentMethod('stripe');
          }
        }
      } catch {
        // ignore persisted payment restore errors
      }
    };
    loadSavedPaymentMethods();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(SAVED_CARDS_STORAGE_KEY, JSON.stringify(savedCards)).catch(() => {});
  }, [savedCards]);

  useEffect(() => {
    AsyncStorage.setItem(SELECTED_PAYMENT_STORAGE_KEY, selectedPaymentId).catch(() => {});
  }, [selectedPaymentId]);
  // Guest checkout contact
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');

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
    const effectiveName =
      (guestName?.trim() ||
        selectedAddress?.name ||
        (user as any)?.name ||
        '') as string;
    const effectiveEmail = (guestEmail?.trim() || (user as any)?.email || '') as string;
    const effectivePhone =
      (guestPhone?.trim() || selectedAddress?.phone || '') as string;
    return { effectiveName, effectiveEmail, effectivePhone };
  };

  const isValidEmail = (email: string) =>
    !!email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isValidPhone = (phone: string) =>
    !!phone && phone.replace(/\D/g, '').length >= 7;

  useEffect(() => {
    // Allow guest checkout - load data even if not authenticated
    loadInitialData();
  }, []);

  useEffect(() => {
    // Recalculate totals when shipping or discount changes
    const shippingCost = selectedShipping?.price || 0;
    const newTotals = checkoutService.calculateTotals(cartTotal, shippingCost, couponDiscount, giftCardDiscount);
    setTotals(newTotals);
  }, [cartTotal, selectedShipping, couponDiscount, giftCardDiscount]);

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
          if (!isAuthenticated) {
            setGuestName(defaultAddr.name || '');
            setGuestPhone(defaultAddr.phone || '');
          }
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
      Alert.alert('Error', 'Please enter a coupon code');
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
        Alert.alert('Success', `Coupon applied! You saved $${discount.toFixed(2)}`);
      } else {
        Alert.alert('Invalid Coupon', (response as any).error || 'This coupon is not valid');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to apply coupon');
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
      Alert.alert('Error', 'Please enter a gift card code');
      return;
    }
    
    try {
      setGiftCardLoading(true);
      const response = await checkoutService.applyGiftCard(giftCardCode.trim(), cartTotal);
      
      if (response.success && response.data) {
        const discount = response.data.discount || 0;
        const giftCard = response.data.giftCard;
        setGiftCardDiscount(discount);
        setAppliedGiftCard({
          code: giftCardCode.trim().toUpperCase(),
          discount,
          balance: giftCard?.currentBalance || 0
        });
        Alert.alert('Success', `Gift card applied! $${discount.toFixed(2)} will be deducted`);
      } else {
        Alert.alert('Invalid Gift Card', (response as any).error || 'This gift card is not valid');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to apply gift card');
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
        Alert.alert('Address Required', 'Please select or add a shipping address');
        return;
      }
      setCurrentStep('shipping');
    } else if (currentStep === 'shipping') {
      if (!selectedShipping) {
        Alert.alert('Shipping Required', 'Please select a shipping method');
        return;
      }
      setCurrentStep('payment');
    } else if (currentStep === 'payment') {
      const hasSavedCard = savedCards.some((c) => c.id === selectedPaymentId);
      if (!hasSavedCard) {
        setShowCardForm(true);
        return;
      }
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
      Alert.alert('Error', 'Please complete all checkout steps');
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
          const productStockStatus = String(
            p?.inventory?.stockStatus || p?.stockStatus || ''
          ).toLowerCase();

          // Variation-level stock/status check if variation selected
          if (item.variationId && Array.isArray(p?.variations)) {
            const v = p.variations.find((vv: any) => String(vv?._id) === String(item.variationId));
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
        Alert.alert(
          'Out of stock',
          `Please remove unavailable item(s) from cart:\n\n${outOfStockTitles.join('\n')}`
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

      const idempotencyKey = `checkout_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
      const fallbackGuestCustomer = {
        name: (guestName?.trim() || selectedAddress?.name || user?.name || '').trim(),
        email: (guestEmail?.trim() || (user as any)?.email || '').trim(),
        phone: (guestPhone?.trim() || selectedAddress?.phone || '').trim(),
      };
      const normalizedProducts = cartItems.map((item: any) => ({
        productId: item.productId || item.product?._id,
        productTitle: item.productTitle || item.product?.name || 'Product',
        quantity: item.quantity,
        price: item.price,
        subTotal: item.subtotal || item.price * item.quantity,
        image: item.image || item.product?.images?.[0] || '',
        productType: item.productType || (item.variationId ? 'variable' : 'simple'),
        variationId: item.variationId || item.variation?._id || null,
        variation: item.variation || null,
      }));

      const orderData: CreateOrderData = {
        shippingAddressId: addressId,
        shippingMethodId: selectedShipping._id,
        paymentMethod: paymentMethod,
        idempotencyKey,
        products: normalizedProducts,
        totalAmt: totals.total,
        shippingCost: selectedShipping.price || 0,
        shippingRate: selectedShipping,
        shippingAddress: selectedAddress,
        delivery_address: selectedAddress._id,
        payment_status: paymentMethod === 'cod' ? 'pending' : 'pending',
        // Include guestCustomer fallback for compatibility when backend resolves request as guest.
        guestCustomer:
          fallbackGuestCustomer.name &&
          fallbackGuestCustomer.email &&
          fallbackGuestCustomer.phone
            ? fallbackGuestCustomer
            : undefined,
        couponCode: appliedCoupon?.code || undefined,
        giftCardCode: appliedGiftCard?.code || undefined,
      };
      let orderResponse: ApiResponse<any>;
      if (isAuthenticated) {
        orderResponse = await checkoutService.createOrder(orderData);
      } else {
        // Validate guest info
        const gName = guestName?.trim() || selectedAddress?.name || '';
        const gEmail = guestEmail?.trim();
        const gPhone = guestPhone?.trim() || selectedAddress?.phone || '';
        if (!gName || !gEmail || !gPhone) {
          Alert.alert('Error', 'Please enter your name, email, and phone to place order.');
          setProcessing(false);
          return;
        }
        orderResponse = await checkoutService.createGuestOrder({
          products: normalizedProducts as any,
          shippingAddress: selectedAddress,
          guestCustomer: { name: gName, email: gEmail, phone: gPhone },
          totalAmt: totals.total,
          shippingCost: selectedShipping.price || 0,
          shippingRate: selectedShipping._id,
        });
      }

      // Fallback: if authenticated flow fails with guestCustomer validation, retry as guest payload.
      if (
        (!orderResponse.success || !orderResponse.data) &&
        isAuthenticated &&
        typeof (orderResponse as any)?.message === 'string' &&
        (orderResponse as any).message.includes('guestCustomer')
      ) {
        if (
          fallbackGuestCustomer.name &&
          fallbackGuestCustomer.email &&
          fallbackGuestCustomer.phone
        ) {
          orderResponse = await checkoutService.createGuestOrder({
            products: normalizedProducts as any,
            shippingAddress: selectedAddress,
            guestCustomer: fallbackGuestCustomer,
            totalAmt: totals.total,
            shippingCost: selectedShipping.price || 0,
            shippingRate: selectedShipping._id,
          });
        }
      }

      if (orderResponse.success && orderResponse.data) {
        const orderId = orderResponse.data._id || orderResponse.data.orderId;
        if (isAuthenticated) {
          // Real payment screen (can be sample too)
          navigation.navigate('Payment', {
            orderId,
            amount: totals.total,
            paymentMethod,
            onSuccess: () => {
              analyticsService.purchase(
                orderId,
                totals.total,
                cartItems.map(item => ({
                  id: typeof item.product === 'object' ? item.product?._id : '',
                  name: typeof item.product === 'object' ? item.product?.name || 'Unknown' : 'Unknown',
                  price: item.price,
                  quantity: item.quantity,
                }))
              );
              dispatch(clearCart());
              navigation.navigate('OrderConfirmation', {
                orderId,
                total: totals.total,
              });
            },
          });
        } else {
          // Sample order: skip Stripe, go straight to confirmation
          analyticsService.purchase(
            orderId,
            totals.total,
            cartItems.map(item => ({
              id: typeof item.product === 'object' ? item.product?._id : '',
              name: typeof item.product === 'object' ? item.product?.name || 'Unknown' : 'Unknown',
              price: item.price,
              quantity: item.quantity,
            }))
          );
          dispatch(clearCart());
          navigation.navigate('OrderConfirmation', {
            orderId,
            total: totals.total,
          });
        }
      } else {
        Alert.alert('Error', (orderResponse as any).message || 'Failed to create order');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to place order');
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

  const formatCardNumber = (input: string) => {
    const digits = input.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
  };

  const inferCardBrand = (num: string) => {
    const digits = num.replace(/\s/g, '');
    if (/^4/.test(digits)) return 'VISA';
    if (/^5[1-5]/.test(digits)) return 'MC';
    if (/^3[47]/.test(digits)) return 'AMEX';
    return 'CARD';
  };

  const resetCardForm = () => {
    setCardForm({ number: '', name: '', expMonth: '', expYear: '', cvc: '' });
  };

  const isCardFormValid = () => {
    const digits = cardForm.number.replace(/\D/g, '');
    const month = Number(cardForm.expMonth);
    const year = Number(cardForm.expYear);
    const validNumber = digits.length >= 13;
    const validName = !!cardForm.name.trim();
    const validExp = !!month && month >= 1 && month <= 12 && !!year && cardForm.expYear.length === 2;
    const validCvc = cardForm.cvc.replace(/\D/g, '').length >= 3;
    return validNumber && validName && validExp && validCvc;
  };

  const handleSaveCard = () => {
    const digits = cardForm.number.replace(/\D/g, '');
    if (digits.length < 13) {
      Alert.alert('Invalid Card', 'Please enter a valid card number.');
      return;
    }
    if (!cardForm.name.trim()) {
      Alert.alert('Invalid Name', 'Please enter cardholder name.');
      return;
    }
    const month = Number(cardForm.expMonth);
    const year = Number(cardForm.expYear);
    if (!month || month < 1 || month > 12 || !year || cardForm.expYear.length !== 2) {
      Alert.alert('Invalid Expiry', 'Enter expiry as MM / YY.');
      return;
    }
    if (cardForm.cvc.replace(/\D/g, '').length < 3) {
      Alert.alert('Invalid CVC', 'Please enter a valid CVC.');
      return;
    }

    const newCard = {
      id: `card_${Date.now()}`,
      brand: inferCardBrand(cardForm.number),
      last4: digits.slice(-4),
      name: cardForm.name.trim(),
      expMonth: cardForm.expMonth,
      expYear: cardForm.expYear,
    };
    setSavedCards((prev) => [newCard, ...prev]);
    setSelectedPaymentId(newCard.id);
    setShowCardForm(false);
    resetCardForm();
    Alert.alert('Card Added', 'Your test card has been saved for this checkout.');
  };

  const renderPaymentStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Payment Method</Text>
      <Text style={styles.stepSubtitle}>Choose your preferred method</Text>

      {savedCards.map((card) => {
        const selected = selectedPaymentId === card.id;
        return (
          <TouchableOpacity
            key={card.id}
            style={[styles.paymentCard, selected && styles.paymentCardSelected]}
            onPress={() => {
              setSelectedPaymentId(card.id);
              setPaymentMethod('stripe');
              setShowCardForm(false);
            }}
          >
            <View style={styles.paymentRadio}>
              <View style={[styles.radioOuter, selected && styles.radioOuterSelected]}>
                {selected && <View style={styles.radioInner} />}
              </View>
            </View>
            <View style={styles.paymentContent}>
              <Ionicons name="card" size={24} color={Colors.secondary} />
              <View style={styles.paymentInfo}>
                <Text style={styles.paymentName}>{card.brand} •••• {card.last4}</Text>
                <Text style={styles.paymentDescription}>
                  {card.name}  •  Expires {card.expMonth}/{card.expYear}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        );
      })}

      <TouchableOpacity
        style={[styles.paymentCard, selectedPaymentId === 'new-card' && styles.paymentCardSelected]}
        onPress={() => {
          setSelectedPaymentId('new-card');
          setPaymentMethod('stripe');
          setShowCardForm(true);
        }}
      >
        <View style={styles.paymentRadio}>
          <View style={[styles.radioOuter, selectedPaymentId === 'new-card' && styles.radioOuterSelected]}>
            {selectedPaymentId === 'new-card' && <View style={styles.radioInner} />}
          </View>
        </View>
        <View style={styles.paymentContent}>
          <Ionicons name="add-circle-outline" size={24} color={Colors.secondary} />
          <View style={styles.paymentInfo}>
            <Text style={styles.paymentName}>Add Credit/Debit Card</Text>
            <Text style={styles.paymentDescription}>
              Add test card now. More payment methods can be added later.
            </Text>
          </View>
          <View style={styles.paymentLogos}>
            <Text style={styles.cardBrand}>VISA</Text>
            <Text style={styles.cardBrand}>MC</Text>
          </View>
        </View>
      </TouchableOpacity>

      {showCardForm && (
        <View style={styles.inlineCardForm}>
          <View style={styles.cardModalHeader}>
            <Text style={styles.cardModalTitle}>Add Card</Text>
          </View>

          {/* Card preview */}
          <View style={styles.cardPreview}>
            <View style={styles.cardBrandBadge}>
              <Text style={styles.cardBrandBadgeText}>{inferCardBrand(cardForm.number)}</Text>
            </View>
            <Text style={styles.cardPreviewNum}>
              {cardForm.number || '•••• •••• •••• ••••'}
            </Text>
          </View>

          {/* Labeled inputs */}
          <View style={styles.labeledField}>
            <Text style={styles.label}>Card Number</Text>
            <TextInput
              style={styles.input}
              placeholder="1234 5678 9012 3456"
              keyboardType="number-pad"
              value={cardForm.number}
              onChangeText={(v) => setCardForm((prev) => ({ ...prev, number: formatCardNumber(v) }))}
              placeholderTextColor={Colors.primary + '66'}
            />
          </View>
          <View style={styles.labeledField}>
            <Text style={styles.label}>Cardholder Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Full name on card"
              value={cardForm.name}
              onChangeText={(v) => setCardForm((prev) => ({ ...prev, name: v }))}
              placeholderTextColor={Colors.primary + '66'}
              autoCapitalize="words"
            />
          </View>
          <View style={[styles.cardRow, styles.modalInputSpacing]}>
            <View style={styles.labeledFieldRow}>
              <Text style={styles.label}>MM</Text>
              <TextInput
                style={styles.input}
                placeholder="MM"
                keyboardType="number-pad"
                value={cardForm.expMonth}
                onChangeText={(v) => setCardForm((prev) => ({ ...prev, expMonth: v.replace(/\D/g, '').slice(0, 2) }))}
                placeholderTextColor={Colors.primary + '66'}
              />
            </View>
            <View style={styles.labeledFieldRow}>
              <Text style={styles.label}>YY</Text>
              <TextInput
                style={styles.input}
                placeholder="YY"
                keyboardType="number-pad"
                value={cardForm.expYear}
                onChangeText={(v) => setCardForm((prev) => ({ ...prev, expYear: v.replace(/\D/g, '').slice(0, 2) }))}
                placeholderTextColor={Colors.primary + '66'}
              />
            </View>
            <View style={styles.labeledFieldRow}>
              <Text style={styles.label}>CVC</Text>
              <TextInput
                style={styles.input}
                placeholder="CVC"
                keyboardType="number-pad"
                value={cardForm.cvc}
                onChangeText={(v) => setCardForm((prev) => ({ ...prev, cvc: v.replace(/\D/g, '').slice(0, 4) }))}
                placeholderTextColor={Colors.primary + '66'}
              />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.modalSaveButton, !isCardFormValid() && styles.actionButtonDisabled]}
            onPress={handleSaveCard}
            disabled={!isCardFormValid()}
            activeOpacity={0.8}
          >
            <Text style={styles.modalSaveButtonText}>Save Card</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Branded Wallet Buttons (second after card) */}
      <View style={styles.walletSection}>
        <Text style={styles.walletSectionTitle}>Pay With</Text>
        {Platform.OS === 'ios' && (
          <TouchableOpacity
            style={styles.applePayButton}
            activeOpacity={0.85}
            onPress={() => {
              setPaymentMethod('apple_pay');
              setShowCardForm(false);
            }}
          >
            <Ionicons name="logo-apple" size={18} color="#FFFFFF" />
            <Text style={styles.applePayText}>Apple Pay</Text>
          </TouchableOpacity>
        )}

        {Platform.OS === 'android' && (
          <TouchableOpacity
            style={styles.googlePayButton}
            activeOpacity={0.85}
            onPress={() => {
              setPaymentMethod('google_pay');
              setShowCardForm(false);
            }}
          >
            <Ionicons name="logo-google" size={18} color="#4285F4" />
            <Text style={styles.googlePayText}>G Pay</Text>
          </TouchableOpacity>
        )}
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

      {(!isAuthenticated || !(user as any)?.email || !(user as any)?.name) && (
        <View style={styles.authBlock}>
          <Text style={styles.authBlockTitle}>Contact Information</Text>
          <Text style={{ color: Colors.primary, opacity: 0.7, marginTop: 4 }}>
            Enter your contact so we can confirm your order.
          </Text>
        </View>
      )}

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
      {/* Contact info (guest or missing profile fields) */}
      {(!isAuthenticated || !(user as any)?.email || !(user as any)?.name) && (
        <View style={styles.reviewSection}>
          <Text style={styles.stepTitle}>Contact Information</Text>
          <View style={{ gap: 10, marginTop: 8 }}>
            <TextInput
              style={styles.discountInput}
              placeholder="Full Name"
              value={guestName}
              onChangeText={setGuestName}
              placeholderTextColor={Colors.primary + '80'}
            />
            <TextInput
              style={styles.discountInput}
              placeholder="Email"
              keyboardType="email-address"
              autoCapitalize="none"
              value={guestEmail}
              onChangeText={setGuestEmail}
              placeholderTextColor={Colors.primary + '80'}
            />
            <TextInput
              style={styles.discountInput}
              placeholder="Phone"
              keyboardType="phone-pad"
              value={guestPhone}
              onChangeText={setGuestPhone}
              placeholderTextColor={Colors.primary + '80'}
            />
            {/* Inline validation hints */}
            {(() => {
              const { effectiveName, effectiveEmail, effectivePhone } = getEffectiveContact();
              const nameOk = !!effectiveName;
              const emailOk = isValidEmail(effectiveEmail);
              const phoneOk = isValidPhone(effectivePhone);
              if (nameOk && emailOk && phoneOk) return null;
              return (
                <View style={{ marginTop: 6 }}>
                  {!nameOk && (
                    <Text style={styles.validationText}>Full name is required.</Text>
                  )}
                  {!emailOk && (
                    <Text style={styles.validationText}>Valid email is required.</Text>
                  )}
                  {!phoneOk && (
                    <Text style={styles.validationText}>Valid phone is required.</Text>
                  )}
                </View>
              );
            })()}
          </View>
        </View>
      )}

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
          const { effectiveName, effectiveEmail, effectivePhone } = getEffectiveContact();
          const contactValid = !!effectiveName && isValidEmail(effectiveEmail) && isValidPhone(effectivePhone);
          const shouldBlock =
            currentStep === 'review' &&
            (!isAuthenticated || !(user as any)?.email || !(user as any)?.name) &&
            !contactValid;
          return (
        <TouchableOpacity
            style={[
              styles.actionButton,
              (processing || shouldBlock) && styles.actionButtonDisabled,
            ]}
            onPress={currentStep === 'review' ? handlePlaceOrder : handleNextStep}
            disabled={processing || shouldBlock}
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
});

export default CheckoutScreen;
