import React, { useState } from 'react';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface CartPageProps {
  items: CartItem[];
  checkoutAction: () => void;
  removeItemAction: (id: string) => void;
  applyCouponAction: (code: string) => void;
}

export function CartPage({ items, checkoutAction, removeItemAction, applyCouponAction }: CartPageProps) {
  const [coupon, setCoupon] = useState('HACKATHON10');
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <section className="panel cart-page" aria-labelledby="cart-title">
      <div className="panel-heading">
        <p className="eyebrow">Frontend action extraction</p>
        <h2 id="cart-title">Customer cart</h2>
      </div>

      <div className="cart-list">
        {items.length === 0 ? (
          <p className="muted">The cart is empty. Add a product from the catalog.</p>
        ) : items.map(item => (
          <div key={item.id} className="cart-item">
            <div>
              <strong>{item.name}</strong>
              <span>{item.quantity} x ${item.price.toFixed(2)}</span>
            </div>
            {/* MCPify extracts: removeItemFromCart */}
            <button className="button ghost" onClick={() => removeItemAction(item.id)}>
              Remove item
            </button>
          </div>
        ))}
      </div>

      <div className="coupon-section">
        <input
          name="couponCode"
          value={coupon}
          onChange={event => setCoupon(event.target.value)}
          placeholder="Coupon code"
        />
        {/* MCPify extracts: applyDiscountCode */}
        <button className="button secondary" onClick={() => applyCouponAction(coupon)}>
          Apply coupon
        </button>
      </div>

      <div className="cart-total">
        <span>Total</span>
        <strong>${total.toFixed(2)}</strong>
      </div>

      {/* MCPify extracts: checkoutCart */}
      <button onClick={checkoutAction} className="button primary">
        Checkout
      </button>
    </section>
  );
}
