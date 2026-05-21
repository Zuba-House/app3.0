/**
 * Maps backend order documents (web API shape) to mobile display fields.
 */

export type RawOrder = Record<string, unknown>;

export function getOrderId(order: RawOrder): string {
  const id = order._id ?? order.id ?? order.orderId;
  return id != null ? String(id) : '';
}

export function getOrderNumber(order: RawOrder): string {
  const explicit = order.orderNumber ?? order.order_number;
  if (explicit != null && String(explicit).trim()) {
    return String(explicit).trim();
  }
  const id = getOrderId(order);
  if (!id) return '—';
  return id.slice(-6).toUpperCase();
}

export function getOrderTotal(order: RawOrder): number {
  const candidates = [
    order.totalAmt,
    order.total,
    order.totalAmount,
    order.amount,
    order.grandTotal,
  ];
  for (const value of candidates) {
    const n = Number(value);
    if (Number.isFinite(n) && n >= 0) return n;
  }
  const products = order.products;
  if (Array.isArray(products)) {
    return products.reduce((sum, item) => {
      const row = item as Record<string, unknown>;
      const price = Number(row.price ?? row.subTotal ?? 0);
      const qty = Number(row.quantity ?? 1);
      return sum + price * qty;
    }, 0);
  }
  return 0;
}

export function getOrderItemCount(order: RawOrder): number {
  const products = order.products;
  if (Array.isArray(products)) {
    return products.reduce((sum, item) => sum + Number((item as Record<string, unknown>).quantity ?? 1), 0);
  }
  const items = order.items ?? order.orderItems;
  if (Array.isArray(items)) {
    return items.reduce((sum, item) => sum + Number((item as Record<string, unknown>).quantity ?? 1), 0);
  }
  return 0;
}

export function getOrderStatusLabel(order: RawOrder): string {
  const status =
    order.status ??
    order.order_status ??
    order.payment_status ??
    order.paymentState ??
    'Pending';
  return String(status);
}

export interface OrderStatusBadgeColors {
  backgroundColor: string;
  textColor: string;
}

/** Pill badge colors for order fulfillment status (matches orders list). */
export function getOrderStatusBadgeColors(status: string): OrderStatusBadgeColors {
  const key = status.toLowerCase().trim();
  switch (key) {
    case 'shipped':
      return { backgroundColor: '#dbeafe', textColor: '#1d4ed8' };
    case 'delivered':
    case 'completed':
      return { backgroundColor: '#dcfce7', textColor: '#15803d' };
    case 'pending':
    case 'processing':
      return { backgroundColor: '#ffedd5', textColor: '#c2410c' };
    case 'cancelled':
    case 'canceled':
      return { backgroundColor: '#fee2e2', textColor: '#dc2626' };
    case 'received':
      return { backgroundColor: '#1a2332', textColor: '#ffffff' };
    default:
      return { backgroundColor: '#f3f4f6', textColor: '#374151' };
  }
}

export function getOrderPaymentMethod(order: RawOrder): string | null {
  const payment =
    order.payment && typeof order.payment === 'object'
      ? (order.payment as Record<string, unknown>)
      : undefined;
  const method = order.paymentMethod ?? order.payment_method ?? payment?.method;
  if (method == null || String(method).trim() === '') return null;
  const raw = String(method).toLowerCase();
  if (['stripe', 'card'].includes(raw)) return 'Card';
  if (raw.includes('apple')) return 'Apple Pay';
  if (raw.includes('google')) return 'Google Pay';
  if (['cod', 'cash', 'cash_on_delivery'].includes(raw)) return 'Cash on delivery';
  return String(method);
}

export function formatOrderDate(value: unknown): string {
  if (!value) return '—';
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function parseOrdersListPayload(payload: unknown): RawOrder[] {
  if (Array.isArray(payload)) return payload as RawOrder[];
  if (payload && typeof payload === 'object') {
    const obj = payload as Record<string, unknown>;
    if (Array.isArray(obj.orders)) return obj.orders as RawOrder[];
    if (Array.isArray(obj.data)) return obj.data as RawOrder[];
  }
  return [];
}

export function needsOnlineStripePayment(order: RawOrder, paymentMethod?: string): boolean {
  const paymentStatus = String(order.payment_status ?? order.paymentState ?? '').toLowerCase();
  if (['paid', 'completed', 'success', 'succeeded'].includes(paymentStatus)) {
    return false;
  }
  const method = String(paymentMethod ?? order.paymentMethod ?? '').toLowerCase();
  if (['cod', 'cash', 'cash_on_delivery', 'offline'].includes(method)) {
    return false;
  }
  return ['stripe', 'apple_pay', 'google_pay', 'card', ''].includes(method) || !method;
}

export function isOrderPlacementComplete(order: RawOrder): boolean {
  const status = String(order.status ?? order.order_status ?? '').toLowerCase();
  return ['received', 'processing', 'shipped', 'delivered', 'completed'].includes(status);
}

export interface OrderLineItem {
  id: string;
  name: string;
  imageUrl: string | null;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export function getOrderLineItems(order: RawOrder): OrderLineItem[] {
  const products = order.products ?? order.items ?? order.orderItems;
  if (!Array.isArray(products)) return [];

  return products.map((item, index) => {
    const row = item as Record<string, unknown>;
    const product = (row.product ?? row.productId ?? row) as Record<string, unknown>;
    const qty = Math.max(1, Number(row.quantity ?? 1));
    const unitPrice = Number(row.price ?? row.unitPrice ?? product.price ?? 0);
    const subtotal = Number(row.subTotal ?? row.subtotal ?? unitPrice * qty);
    const imageCandidate =
      row.image ??
      row.thumbnail ??
      product.image ??
      product.thumbnail ??
      (Array.isArray(product.images) ? product.images[0] : null) ??
      product.imageUrl;
    const name =
      String(row.name ?? row.productName ?? product.name ?? product.title ?? 'Product').trim() ||
      'Product';

    return {
      id: String(row._id ?? row.id ?? product._id ?? index),
      name,
      imageUrl: imageCandidate != null ? String(imageCandidate) : null,
      quantity: qty,
      unitPrice: Number.isFinite(unitPrice) ? unitPrice : 0,
      subtotal: Number.isFinite(subtotal) ? subtotal : unitPrice * qty,
    };
  });
}

export function getOrderSubtotal(order: RawOrder): number {
  const explicit = order.subtotal ?? order.productsTotal ?? order.itemsTotal;
  const n = Number(explicit);
  if (Number.isFinite(n) && n >= 0) return n;
  return getOrderLineItems(order).reduce((sum, item) => sum + item.subtotal, 0);
}

export function getOrderShippingCost(order: RawOrder): number {
  const n = Number(order.shippingCost ?? order.shipping_cost ?? order.shippingRate ?? 0);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

export function getOrderTax(order: RawOrder): number {
  const n = Number(order.tax ?? order.taxAmount ?? order.tax_amount ?? 0);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

export function getOrderDiscount(order: RawOrder): number {
  const n = Number(order.discount ?? order.discountAmount ?? 0);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

export function getPaymentStatusLabel(order: RawOrder): 'Paid' | 'Pending' | 'Failed' {
  const payment =
    order.payment && typeof order.payment === 'object'
      ? (order.payment as Record<string, unknown>)
      : undefined;
  const raw = String(
    order.payment_status ?? order.paymentState ?? payment?.status ?? ''
  ).toLowerCase();
  if (['paid', 'completed', 'success', 'succeeded'].includes(raw)) return 'Paid';
  if (['failed', 'declined', 'cancelled', 'canceled'].includes(raw)) return 'Failed';
  return 'Pending';
}

export function formatShippingAddress(order: RawOrder): string {
  const addr =
    (order.shippingAddress as Record<string, unknown> | undefined) ??
    (order.delivery_address as Record<string, unknown> | undefined) ??
    (order.address as Record<string, unknown> | undefined);

  if (!addr || typeof addr !== 'object') {
    if (typeof order.delivery_address === 'string') return order.delivery_address;
    return '—';
  }

  const nested = (addr.address as Record<string, unknown> | undefined) ?? addr;
  const line1 = String(
    nested.addressLine1 ?? nested.street ?? nested.line1 ?? addr.addressLine1 ?? ''
  ).trim();
  const line2 = String(nested.addressLine2 ?? nested.line2 ?? '').trim();
  const city = String(nested.city ?? addr.city ?? '').trim();
  const province = String(nested.province ?? nested.state ?? '').trim();
  const postal = String(
    nested.postalCode ?? nested.postal_code ?? nested.zip ?? ''
  ).trim();
  const country = String(nested.country ?? addr.country ?? '').trim();

  return [line1, line2, [city, province].filter(Boolean).join(', '), postal, country]
    .filter(Boolean)
    .join('\n');
}

export interface OrderStatusStep {
  label: string;
  at?: string;
  active: boolean;
}

export function getOrderStatusTimeline(order: RawOrder): OrderStatusStep[] {
  const history = order.statusHistory ?? order.status_history ?? order.timeline;
  if (Array.isArray(history) && history.length > 0) {
    return history.map((entry, index) => {
      const row = entry as Record<string, unknown>;
      const label = String(row.status ?? row.label ?? row.state ?? 'Update');
      const at = row.at ?? row.date ?? row.createdAt;
      return {
        label,
        at: at != null ? String(at) : undefined,
        active: index === history.length - 1,
      };
    });
  }

  const current = getOrderStatusLabel(order);
  return [{ label: current, active: true }];
}
