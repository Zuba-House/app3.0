/**
 * Shared sale / discount detection (home Flash Sale + product list filters).
 */

export type SaleInfo = {
  isOnSale: boolean;
  displayPrice: number;
  originalPrice: number | null;
  discountPercent: number;
};

export function getSaleInfo(p: {
  price?: number;
  salePrice?: number;
  oldPrice?: number;
  discount?: number;
}): SaleInfo {
  const basePrice = Number(p?.price ?? 0);
  const explicitSale = Number(p?.salePrice ?? 0);
  const oldPrice = Number(p?.oldPrice ?? 0);
  const explicitDiscount = Number(p?.discount ?? 0);

  if (explicitSale > 0 && basePrice > explicitSale) {
    return {
      isOnSale: true,
      displayPrice: explicitSale,
      originalPrice: basePrice,
      discountPercent: Math.round(((basePrice - explicitSale) / basePrice) * 100),
    };
  }

  if (oldPrice > 0 && basePrice > 0 && oldPrice > basePrice) {
    return {
      isOnSale: true,
      displayPrice: basePrice,
      originalPrice: oldPrice,
      discountPercent: Math.round(((oldPrice - basePrice) / oldPrice) * 100),
    };
  }

  if (explicitDiscount > 0 && basePrice > 0) {
    const original = basePrice / (1 - explicitDiscount / 100);
    return {
      isOnSale: true,
      displayPrice: basePrice,
      originalPrice: original,
      discountPercent: Math.round(explicitDiscount),
    };
  }

  return {
    isOnSale: false,
    displayPrice: basePrice,
    originalPrice: null,
    discountPercent: 0,
  };
}
