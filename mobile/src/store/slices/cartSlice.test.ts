import cartReducer, { addItem, setCart, selectCartCount } from './cartSlice';

describe('cartSlice', () => {
  it('setCart normalizes API-shaped line items', () => {
    const state = cartReducer(
      undefined,
      setCart([
        {
          _id: 'cart1',
          productId: 'p1',
          productTitle: 'Test Product',
          image: '/img.jpg',
          price: 10,
          quantity: 2,
          subTotal: 20,
        },
      ])
    );
    expect(state.items).toHaveLength(1);
    expect(state.items[0].quantity).toBe(2);
    expect(state.total).toBe(20);
    expect(selectCartCount({ cart: state })).toBe(2);
  });

  it('addItem merges guest lines with same product and variation', () => {
    let state = cartReducer(
      undefined,
      addItem({
        _id: 'guest_p1_simple',
        productId: 'p1',
        variationId: null,
        product: { _id: 'p1', name: 'A' } as any,
        quantity: 1,
        price: 5,
        subtotal: 5,
      })
    );
    state = cartReducer(
      state,
      addItem({
        _id: 'guest_p1_simple',
        productId: 'p1',
        variationId: null,
        product: { _id: 'p1', name: 'A' } as any,
        quantity: 1,
        price: 5,
        subtotal: 5,
      })
    );
    expect(state.items).toHaveLength(1);
    expect(state.items[0].quantity).toBe(2);
    expect(state.total).toBe(10);
  });
});
