import {
  normalizeCartItems,
  calculateTotals,
  mergeCartLineItem,
  countCartQuantity,
} from './cartNormalize';

describe('cartNormalize', () => {
  it('normalizeCartItems maps API-shaped line items', () => {
    const items = normalizeCartItems([
      {
        _id: 'cart1',
        productId: 'p1',
        productTitle: 'Test Product',
        image: '/img.jpg',
        price: 10,
        quantity: 2,
        subTotal: 20,
      },
    ]);
    expect(items).toHaveLength(1);
    expect(items[0].quantity).toBe(2);
    expect(items[0].subtotal).toBe(20);
    const totals = calculateTotals(items);
    expect(totals.total).toBe(20);
    expect(countCartQuantity(items)).toBe(2);
  });

  it('mergeCartLineItem merges guest lines with same product and variation', () => {
    const line = {
      _id: 'guest_p1_simple',
      productId: 'p1',
      variationId: null,
      product: { _id: 'p1', name: 'A' } as any,
      quantity: 1,
      price: 5,
      subtotal: 5,
    };
    let items = mergeCartLineItem([], line);
    items = mergeCartLineItem(items, { ...line, quantity: 1, subtotal: 5 });
    expect(items).toHaveLength(1);
    expect(items[0].quantity).toBe(2);
    expect(calculateTotals(items).total).toBe(10);
  });
});
