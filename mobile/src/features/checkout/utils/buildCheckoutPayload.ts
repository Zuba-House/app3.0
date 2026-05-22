import { CreateOrderData } from '../../../services/checkout.service';
import { validateCheckoutCustomer } from '../validators/checkout.validators';
import { CheckoutMode, CheckoutValidationIssue } from '../types/checkout.types';
import { resolveImageUrl } from '../../../utils/productImages';

interface BuildCheckoutPayloadInput {
  mode: CheckoutMode;
  user: any;
  selectedAddress: any;
  selectedShipping: any;
  cartItems: any[];
  totalAmt: number;
  shippingCost: number;
  idempotencyKey: string;
  paymentMethod: string;
  couponCode?: string;
  giftCardCode?: string;
  deliveryNote?: string;
  sourceTag: string;
}

export interface BuiltCheckoutPayload {
  payload: CreateOrderData;
  diagnostics: {
    mode: CheckoutMode;
    hasGuestCustomer: boolean;
    hasProducts: boolean;
    hasAddressId: boolean;
    hasShippingMethod: boolean;
  };
}

const normalizePhone = (phone: unknown): string => {
  if (phone == null) return '';
  const value = typeof phone === 'string' ? phone : typeof phone === 'number' ? String(phone) : '';
  return value.trim();
};

export function buildCheckoutPayload(input: BuildCheckoutPayloadInput): { ok: true; data: BuiltCheckoutPayload } | { ok: false; errors: CheckoutValidationIssue[] } {
  const errors: CheckoutValidationIssue[] = [];
  const address = input.selectedAddress;
  if (!address) errors.push({ field: 'address', message: 'Please select a shipping address.' });
  if (!input.selectedShipping?._id) errors.push({ field: 'shipping', message: 'Please select a shipping method.' });
  if (!Array.isArray(input.cartItems) || input.cartItems.length === 0) {
    errors.push({ field: 'cart', message: 'Your cart is empty.' });
  }

  const fullName = String(address?.name || input.user?.name || 'Customer').trim();
  const email = String(input.user?.email || '').trim();
  const phoneRaw =
    address?.phone ??
    address?.mobile ??
    address?.contactInfo?.phone ??
    input.user?.mobile ??
    input.user?.phone ??
    '';
  const phone = normalizePhone(phoneRaw);
  const safePhone = phone.replace(/\D/g, '').length >= 7 ? phone : '0000000000';

  errors.push(
    ...validateCheckoutCustomer(input.mode, {
      name: fullName,
      email,
      phone: safePhone,
    })
  );

  if (errors.length > 0) return { ok: false, errors };

  const normalizedProducts = input.cartItems.map((item: any) => {
    const firstImage = item.product?.images?.[0];
    const imageCandidate =
      item.image ||
      (typeof firstImage === 'object' ? firstImage?.url : firstImage) ||
      item.product?.featuredImage;
    return {
      productId: String(item.productId || item.product?._id || '').trim(),
      productTitle: item.productTitle || item.product?.name || 'Product',
      quantity: item.quantity,
      price: item.price,
      subTotal: item.subtotal || item.price * item.quantity,
      image: resolveImageUrl(imageCandidate) || '',
      productType: item.productType || (item.variationId ? 'variable' : 'simple'),
      variationId: item.variationId || item.variation?._id || null,
      variation: item.variation || null,
    };
  }).filter((p) => p.productId);

  const isAuthenticated = input.mode === 'authenticated';
  const userId = input.user?._id || input.user?.id;

  const payload: CreateOrderData = {
    shippingAddressId: address?._id || '',
    shippingMethodId: input.selectedShipping._id,
    paymentMethod: input.paymentMethod,
    idempotencyKey: input.idempotencyKey,
    products: normalizedProducts,
    totalAmt: input.totalAmt,
    shippingCost: input.shippingCost,
    shippingRate: input.selectedShipping,
    shippingAddress: address,
    delivery_address: address?._id,
    payment_status: 'pending',
    isGuestOrder: !isAuthenticated,
    customerName: fullName,
    phone: safePhone,
    deliveryNote: String(input.deliveryNote || '').trim() || undefined,
    notes: `[SOURCE:${input.sourceTag}]`,
    couponCode: input.couponCode || undefined,
    giftCardCode: input.giftCardCode || undefined,
  };

  if (isAuthenticated && userId) {
    payload.userId = String(userId);
    payload.isGuestOrder = false;
  } else {
    payload.guestCustomer = {
      name: fullName,
      email,
      phone: safePhone,
    };
  }

  return {
    ok: true,
    data: {
      payload,
      diagnostics: {
        mode: input.mode,
        hasGuestCustomer: Boolean(payload.guestCustomer),
        hasProducts: normalizedProducts.length > 0,
        hasAddressId: Boolean(payload.shippingAddressId),
        hasShippingMethod: Boolean(payload.shippingMethodId),
      },
    },
  };
}

