/**
 * Stock helpers aligned with web client/src/components/ProductItem (listing cards).
 * API payloads often omit numeric stock while still selling — missing quantities must not imply 0.
 */

export function getProductStock(product: any): number | null {
  if (!product) return 1;

  if (product.inventory?.endlessStock) return null;

  if (product.productType === 'variable' || product.type === 'variable') {
    if (Array.isArray(product.variations) && product.variations.length > 0) {
      const hasEndlessStock = product.variations.some(
        (v: any) => v && v.endlessStock && v.isActive !== false
      );
      if (hasEndlessStock) return null;

      return product.variations
        .filter((v: any) => v && v.isActive !== false)
        .reduce((total: number, v: any) => total + Number(v.stock || 0), 0);
    }
  }

  if (product.countInStock !== undefined && product.countInStock !== null) {
    return Number(product.countInStock);
  }
  if (product.stock !== undefined && product.stock !== null) {
    return Number(product.stock);
  }
  if (product.inventory?.stock !== undefined && product.inventory?.stock !== null) {
    return Number(product.inventory.stock);
  }
  return 1;
}

export function isProductOutOfStock(product: any): boolean {
  if (!product) return true;

  if (product.inventory?.endlessStock) return false;

  const stockStatus = product.stockStatus || product.inventory?.stockStatus;
  if (stockStatus === 'out_of_stock') return true;
  if (stockStatus === 'in_stock') return false;

  if (product.productType === 'variable' || product.type === 'variable') {
    if (product.variations && Array.isArray(product.variations) && product.variations.length > 0) {
      const hasInStockVariation = product.variations.some((v: any) => {
        if (!v || v.isActive === false) return false;
        if (v.endlessStock) return true;
        const vStock = Number(v.stock || 0);
        const vStockStatus =
          v.stockStatus || (vStock > 0 ? 'in_stock' : 'out_of_stock');
        return vStockStatus === 'in_stock' || vStock > 0;
      });
      return !hasInStockVariation;
    }
    return false;
  }

  const stock = getProductStock(product);
  if (stock === null) return false;
  return stock <= 0;
}

/**
 * Whether a variable-product variation is purchasable (matches backend / cart rules).
 */
export function isVariationInStock(variation: any): boolean {
  if (!variation || variation.isActive === false) return false;
  if (variation.endlessStock) return true;
  if (variation.stockStatus === 'out_of_stock') return false;
  if (variation.stockStatus === 'in_stock') return true;
  return Number(variation.stock || 0) > 0;
}
