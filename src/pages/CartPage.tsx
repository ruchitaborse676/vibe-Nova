import React, { useState } from 'react';
import { ShoppingBag, ArrowRight, Trash2, Plus, Minus, Tag, Check, ShieldCheck, ArrowLeft } from 'lucide-react';
import { useCart } from '../contexts/CartContext.js';

interface CartPageProps {
  navigate: (path: string) => void;
}

export const CartPage: React.FC<CartPageProps> = ({ navigate }) => {
  const {
    items,
    itemCount,
    subtotal,
    shipping,
    discount,
    finalTotal,
    appliedCoupon,
    updateQuantity,
    removeItem,
    clearCart,
    applyCoupon,
    removeCoupon,
  } = useCart();

  const [couponCode, setCouponCode] = useState('');
  const [feedback, setFeedback] = useState<{ success: boolean; message: string } | null>(null);
  const [applying, setApplying] = useState(false);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setApplying(true);
    setFeedback(null);
    const res = await applyCoupon(couponCode.trim());
    setApplying(false);
    setFeedback(res);
    if (res.success) setCouponCode('');
  };

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-20 h-20 rounded-3xl bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 brand-font">Your Shopping Cart is Empty</h1>
        <p className="text-sm text-slate-500 max-w-sm mx-auto">
          You haven't selected any items yet. Discover our fresh drops across electronics, fashion, and everyday essentials.
        </p>
        <div className="pt-4">
          <button
            onClick={() => navigate('/products')}
            className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-md transition-all inline-flex items-center gap-2"
          >
            <span>Explore Collection</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 brand-font">
            Shopping Cart ({itemCount} {itemCount === 1 ? 'item' : 'items'})
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Review your selected products and proceed to secure checkout.
          </p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs font-semibold text-rose-600 hover:underline"
        >
          Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Items Table */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/80 shadow-xs divide-y divide-slate-100 overflow-hidden">
          {items.map(item => (
            <div key={item.id} className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
              <div className="flex gap-4 items-center">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded-xl bg-slate-100 border border-slate-100 flex-shrink-0"
                />
                <div>
                  <h3
                    onClick={() => navigate(`/products/${item.productId}`)}
                    className="text-sm font-bold text-slate-900 hover:text-indigo-600 cursor-pointer"
                  >
                    {item.name}
                  </h3>
                  {item.variant && (
                    <p className="text-xs text-slate-500 mt-0.5">
                      {Object.entries(item.variant.options || {})
                        .map(([k, v]) => `${k}: ${v}`)
                        .join(' · ')}
                    </p>
                  )}
                  <p className="text-xs font-semibold text-indigo-600 sm:hidden mt-1">
                    ₹{item.price.toLocaleString('en-IN')}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-6 pt-2 sm:pt-0 border-t sm:border-0 border-slate-50">
                {/* Quantity */}
                <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="p-1.5 hover:bg-white text-slate-600 transition-colors"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-10 text-center text-xs font-bold text-slate-900">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="p-1.5 hover:bg-white text-slate-600 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Line Total */}
                <div className="text-right min-w-[90px]">
                  <p className="text-sm font-black text-slate-900">
                    ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                  </p>
                  <p className="text-[11px] text-slate-400 hidden sm:block">
                    ₹{item.price.toLocaleString('en-IN')} each
                  </p>
                </div>

                {/* Remove */}
                <button
                  onClick={() => removeItem(item.id)}
                  className="p-2 text-slate-400 hover:text-rose-600 transition-colors"
                  title="Remove from cart"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          <div className="p-4 bg-slate-50 flex items-center justify-between text-xs font-semibold text-slate-600">
            <button
              onClick={() => navigate('/products')}
              className="inline-flex items-center gap-1.5 hover:text-slate-900"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Continue Shopping</span>
            </button>
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-5">
            <h2 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100">
              Order Summary
            </h2>

            {/* Coupon Code Section */}
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                Promotional Coupon
              </label>
              {appliedCoupon ? (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-emerald-800 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      {appliedCoupon.code} (-₹{appliedCoupon.discount})
                    </p>
                    {appliedCoupon.description && (
                      <p className="text-[11px] text-emerald-600 mt-0.5">{appliedCoupon.description}</p>
                    )}
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-xs font-bold text-rose-600 hover:underline"
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
                      placeholder="e.g. VIBE20"
                      value={couponCode}
                      onChange={e => setCouponCode(e.target.value.toUpperCase())}
                      className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg uppercase tracking-wider focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={applying}
                    className="px-4 py-2 text-xs font-bold bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50"
                  >
                    {applying ? '...' : 'Apply'}
                  </button>
                </form>
              )}

              {feedback && (
                <p className={`text-xs mt-1.5 ${feedback.success ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {feedback.message}
                </p>
              )}
            </div>

            {/* Calculations */}
            <div className="space-y-2.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-bold text-slate-900">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Coupon Savings</span>
                  <span>-₹{discount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Estimated Shipping</span>
                <span className="font-bold text-slate-900">
                  {shipping === 0 ? <strong className="text-emerald-600">FREE</strong> : `₹${shipping}`}
                </span>
              </div>
              <div className="pt-3 border-t border-slate-200 flex justify-between text-base font-extrabold text-slate-900">
                <span>Total Amount</span>
                <span className="text-indigo-600 text-lg">₹{finalTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="p-4 rounded-xl bg-slate-100/70 border border-slate-200/60 text-xs text-slate-500 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>Guaranteed safe checkout powered by Razorpay test encryption.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
