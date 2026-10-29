import React, { useState } from 'react';
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight, Tag, Check, Sparkles } from 'lucide-react';
import { useCart } from '../../contexts/CartContext.js';

interface CartDrawerProps {
  navigate: (path: string) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ navigate }) => {
  const {
    items,
    itemCount,
    subtotal,
    shipping,
    discount,
    finalTotal,
    appliedCoupon,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeItem,
    applyCoupon,
    removeCoupon,
  } = useCart();

  const [couponInput, setCouponInput] = useState('');
  const [couponFeedback, setCouponFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isApplying, setIsApplying] = useState(false);

  if (!isCartOpen) return null;

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;

    setIsApplying(true);
    setCouponFeedback(null);

    const res = await applyCoupon(couponInput.trim());
    setIsApplying(false);

    if (res.success) {
      setCouponFeedback({ type: 'success', message: res.message });
      setCouponInput('');
    } else {
      setCouponFeedback({ type: 'error', message: res.message });
    }
  };

  const freeShippingThreshold = 999;
  const freeShippingProgress = Math.min(100, (subtotal / freeShippingThreshold) * 100);
  const amountNeededForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/60">
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="w-5 h-5 text-indigo-600" />
              <h2 className="text-base font-bold text-slate-900">Your Cart ({itemCount})</h2>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Bar */}
          {items.length > 0 && (
            <div className="px-6 py-3 bg-indigo-50/70 border-b border-indigo-100">
              <div className="flex items-center justify-between text-xs text-indigo-900 font-medium mb-1.5">
                {amountNeededForFreeShipping > 0 ? (
                  <span>
                    Add <strong className="font-bold">₹{amountNeededForFreeShipping.toLocaleString('en-IN')}</strong> more for <strong className="text-indigo-700">FREE Shipping</strong>
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                    <Sparkles className="w-3.5 h-3.5" />
                    You unlocked FREE Express Delivery!
                  </span>
                )}
                <span className="text-[11px] font-bold">{Math.round(freeShippingProgress)}%</span>
              </div>
              <div className="w-full bg-indigo-200/60 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${freeShippingProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Items List */}
          <div className="flex-1 overflow-y-auto px-6 py-4 divide-y divide-slate-100">
            {items.length === 0 ? (
              <div className="py-16 text-center">
                <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center mb-4">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-1">Your cart is empty</h3>
                <p className="text-xs text-slate-500 mb-6 max-w-xs mx-auto">
                  Looks like you haven't added anything to your cart yet. Explore our curated collections!
                </p>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    navigate('/products');
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
                >
                  Start Shopping
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              items.map(item => (
                <div key={item.id} className="py-4 flex gap-4">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded-xl bg-slate-100 flex-shrink-0 border border-slate-100"
                  />
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4
                          onClick={() => {
                            setIsCartOpen(false);
                            navigate(`/products/${item.productId}`);
                          }}
                          className="text-xs sm:text-sm font-semibold text-slate-900 line-clamp-1 hover:text-indigo-600 cursor-pointer"
                        >
                          {item.name}
                        </h4>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {item.variant && (
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {Object.entries(item.variant.options || {})
                            .map(([k, v]) => `${k}: ${v}`)
                            .join(' · ')}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1 hover:bg-white text-slate-600 transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-center text-xs font-semibold text-slate-800">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1 hover:bg-white text-slate-600 transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="text-right">
                        <p className="text-xs sm:text-sm font-bold text-slate-900">
                          ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Order Summary */}
          {items.length > 0 && (
            <div className="border-t border-slate-200 px-6 py-4 bg-slate-50/80 space-y-3">
              {/* Coupon Form */}
              {appliedCoupon ? (
                <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs">
                  <div className="flex items-center gap-1.5 text-emerald-800 font-medium">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Coupon <strong>{appliedCoupon.code}</strong> applied (-₹{appliedCoupon.discount})</span>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-xs text-rose-600 hover:text-rose-700 font-semibold underline"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Coupon: VIBE20"
                      value={couponInput}
                      onChange={e => setCouponInput(e.target.value.toUpperCase())}
                      className="w-full pl-8 pr-3 py-2 text-xs bg-white border border-slate-300 rounded-lg uppercase tracking-wider focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isApplying}
                    className="px-3.5 py-2 text-xs font-semibold bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-60"
                  >
                    {isApplying ? 'Applying...' : 'Apply'}
                  </button>
                </form>
              )}

              {couponFeedback && (
                <p className={`text-[11px] ${couponFeedback.type === 'success' ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {couponFeedback.message}
                </p>
              )}

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs text-slate-600 pt-1">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-900">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Discount</span>
                    <span>-₹{discount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Estimated Shipping</span>
                  <span className="font-semibold text-slate-900">
                    {shipping === 0 ? <strong className="text-emerald-600">FREE</strong> : `₹${shipping}`}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-200">
                  <span>Total</span>
                  <span className="text-base text-indigo-600 font-extrabold">₹{finalTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 space-y-2">
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    navigate('/checkout');
                  }}
                  className="w-full py-3 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 hover:from-indigo-900 hover:to-slate-900 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 group"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    navigate('/cart');
                  }}
                  className="w-full py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 text-center transition-colors"
                >
                  View Full Cart & Edit Items
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
