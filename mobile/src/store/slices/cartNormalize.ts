/**
 * Pure cart helpers (no Redux) — safe to unit test in Jest without RTK/immer.
 */

import { CartItem } from '../../types/cart.types';

export function normalizeCartItems(input: unknown): CartItem[] {
  if (!Array.isArray(input)) return [];
  return input.map((item: any) => {
    const price = Number(item?.price ?? 0);
    const quantity = Number(item?.quantity ?? 1);
    const subtotal = Number(item?.subtotal ?? item?.subTotal ?? price * quantity);
    const productObj =
      item?.product && typeof item.product === 'object'
        ? item.product
        : {
            _id: String(item?.productId ?? ''),
            name: String(item?.productTitle ?? 'Product'),
            images: item?.image ? [item.image] : [],
            featuredImage: item?.image || '',
          };
    const pid = item?.productId != null ? String(item.productId) : undefined;
    const vid =
      item?.variationId != null
        ? String(item.variationId)
        : item?.variation?._id != null
          ? String(item.variation._id)
          : undefined;
    return {
      _id: String(item?._id ?? `${item?.productId ?? 'item'}_${Math.random()}`),
      product: productObj,
      variation: item?.variation,
      quantity,
      price,
      subtotal,
      productId: pid,
      variationId: vid ?? null,
      productTitle: item?.productTitle ? String(item.productTitle) : undefined,
    } as CartItem;
  });
}

export function calculateTotals(items: CartItem[]) {
  const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
  const shipping = 0;
  const discount = 0;
  const total = subtotal + shipping - discount;
  return { subtotal, shipping, discount, total };
}

export function countCartQuantity(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

export function mergeCartLineItem(items: CartItem[], payload: CartItem): CartItem[] {
  const payloadPid =
    payload.productId ??
    (typeof payload.product === 'object' ? payload.product._id : null);
  const payloadVid =
    payload.variationId ??
    (typeof payload.variation === 'object' ? payload.variation?._id : null) ??
    null;

  const existingIndex = items.findIndex((item) => {
    if (item._id === payload._id) return true;
    const itemPid =
      item.productId ?? (typeof item.product === 'object' ? item.product._id : null);
    const itemVid =
      item.variationId ??
      (typeof item.variation === 'object' ? item.variation?._id : null) ??
      null;
    if (payloadPid && itemPid && String(payloadPid) === String(itemPid)) {
      return String(payloadVid ?? '') === String(itemVid ?? '');
    }
    return false;
  });

  const next = [...items];
  if (existingIndex >= 0) {
    const existingItem = { ...next[existingIndex] };
    existingItem.quantity += payload.quantity;
    existingItem.subtotal = existingItem.price * existingItem.quantity;
    next.splice(existingIndex, 1);
    next.unshift(existingItem);
  } else {
    next.unshift(payload);
  }
  return next;
}
