import React, { useState, useEffect } from 'react';
import {
  ShieldCheck, CreditCard, Truck, Check, AlertCircle, ArrowRight,
  MapPin, User as UserIcon, Phone, Mail, Lock
} from 'lucide-react';
import { useCart } from '../contexts/CartContext.js';
import { useAuth } from '../contexts/AuthContext.js';
import { api } from '../services/api.js';
import { Address } from '../types/index.js';

interface CheckoutPageProps {
  navigate: (path: string) => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ navigate }) => {
  const { items, subtotal, shipping, discount, finalTotal, appliedCoupon, clearCart } = useCart();
  const { user, addAddress } = useAuth();

  const [paymentConfig, setPaymentConfig] = useState<{
    provider: string;
    isConfigured: boolean;
    mode: string;
    keyId: string | null;
  } | null>(null);

  // Address selection / form state
  const [selectedAddressIndex, setSelectedAddressIndex] = useState<number>(0);
  const [isAddingNewAddress, setIsAddingNewAddress] = useState<boolean>(!user || user.addresses?.length === 0);

  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    street: '',
    apartment: '',
    city: 'Bengaluru',
    state: 'Karnataka',
    postalCode: '560001',
    country: 'India',
  });

  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'cod' | 'demo_card'>('demo_card');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    api.getPaymentConfig()
      .then(res => {
        if (res.success) {
          setPaymentConfig(res);
          if (res.isConfigured) {
            setPaymentMethod('razorpay');
          }
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (user && user.addresses && user.addresses.length > 0) {
      const defaultIdx = user.addresses.findIndex(a => a.isDefault);
      setSelectedAddressIndex(defaultIdx !== -1 ? defaultIdx : 0);
      setIsAddingNewAddress(false);
    }
  }, [user]);

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Your cart is empty</h2>
        <p className="text-xs text-slate-500">Add products before proceeding to checkout.</p>
        <button
          onClick={() => navigate('/products')}
          className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-semibold"
        >
          Browse Products
        </button>
      </div>
    );
  }

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      // 1. Resolve shipping address
      let shippingAddress: Address;

      if (!isAddingNewAddress && user?.addresses && user.addresses[selectedAddressIndex]) {
        shippingAddress = user.addresses[selectedAddressIndex];
      } else {
        if (!formData.fullName || !formData.street || !formData.city || !formData.postalCode || !formData.phone) {
          throw new Error('Please fill in all required shipping address fields.');
        }

        shippingAddress = {
          fullName: formData.fullName,
          phone: formData.phone,
          street: formData.street,
          apartment: formData.apartment,
          city: formData.city,
          state: formData.state,
          postalCode: formData.postalCode,
          country: formData.country,
          isDefault: true,
        };

        // If user logged in, save address for convenience
        if (user) {
          await addAddress(shippingAddress);
        }
      }

      // 2. Handle Payment Processing
      let paymentDetails: any = {
        method: paymentMethod,
        status: paymentMethod === 'cod' ? 'pending' : 'paid',
      };

      if (paymentMethod === 'razorpay' && paymentConfig?.isConfigured) {
        // Create Razorpay server order
        const payOrderRes = await api.createPaymentOrder({
          amount: finalTotal,
          receipt: `rcpt_${Date.now()}`,
        });

        if (!payOrderRes.success) {
          throw new Error('Failed to initialize payment gateway.');
        }

        // Real Razorpay SDK Checkout Modal
        const isLoaded = await loadRazorpayScript();
        if (isLoaded && (window as any).Razorpay) {
          const rzpOptions = {
            key: paymentConfig.keyId,
            amount: payOrderRes.amount,
            currency: 'INR',
            name: 'Vibe-Nova Marketplace',
            description: `Order Payment (${items.length} items)`,
            order_id: payOrderRes.orderId,
            handler: async (response: any) => {
              // Verify on server
              const verifyRes = await api.verifyPayment(response);
              if (verifyRes.success) {
                paymentDetails = {
                  ...paymentDetails,
                  razorpayOrderId: response.razorpay_order_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpaySignature: response.razorpay_signature,
                  transactionId: verifyRes.transactionId,
                  status: 'paid',
                };
                await finalizeOrder(shippingAddress, paymentDetails);
              } else {
                setErrorMessage('Payment signature verification failed.');
                setIsSubmitting(false);
              }
            },
            prefill: {
              name: shippingAddress.fullName,
              email: formData.email || user?.email,
              contact: shippingAddress.phone,
            },
            theme: { color: '#4f46e5' },
          };

          const rzp = new (window as any).Razorpay(rzpOptions);
          rzp.open();
          return;
        }
      }

      // If COD or Demo Card mode
      if (paymentMethod === 'demo_card') {
        paymentDetails.transactionId = `TXN_SIMULATED_${Date.now()}`;
        paymentDetails.status = 'paid';
      }

      await finalizeOrder(shippingAddress, paymentDetails);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to place order.');
      setIsSubmitting(false);
    }
  };

  const finalizeOrder = async (shippingAddress: Address, paymentDetails: any) => {
    try {
      const res = await api.createOrder({
        items: items.map(it => ({
          productId: it.productId,
          name: it.name,
          quantity: it.quantity,
          variant: it.variant,
          image: it.image,
        })),
        shippingAddress,
        couponCode: appliedCoupon?.code,
        paymentMethod,
        paymentDetails,
      });

      if (res.success && res.order) {
        await clearCart();
        navigate(`/order-success?orderId=${res.order._id || res.order.id || res.order.orderNumber}`);
      } else {
        throw new Error('Order creation could not be completed.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error saving order.');
      setIsSubmitting(false);
    }
  };

  // Helper to load Razorpay script dynamically
  const loadRazorpayScript = () => {
    return new Promise(resolve => {
      if ((window as any).Razorpay) return resolve(true);
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 brand-font">
          Secure Checkout
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 flex items-center gap-1.5">
          <Lock className="w-3.5 h-3.5 text-emerald-600" />
          <span>256-Bit SSL Encrypted & Authenticated Transaction</span>
        </p>
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs sm:text-sm text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Contact, Address & Payment */}
        <div className="lg:col-span-7 space-y-6">
          {/* 1. Contact Information */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <UserIcon className="w-4 h-4 text-indigo-600" />
              <span>1. Contact Details</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="e.g. Aarav Sharma"
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  placeholder="name@domain.com"
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-slate-700 block mb-1">Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* 2. Shipping Address */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-indigo-600" />
                <span>2. Delivery Address</span>
              </h2>

              {user?.addresses && user.addresses.length > 0 && (
                <button
                  type="button"
                  onClick={() => setIsAddingNewAddress(!isAddingNewAddress)}
                  className="text-xs font-semibold text-indigo-600 hover:underline"
                >
                  {isAddingNewAddress ? 'Select Saved Address' : '+ New Address'}
                </button>
              )}
            </div>

            {/* Saved Addresses list */}
            {!isAddingNewAddress && user?.addresses && user.addresses.length > 0 ? (
              <div className="space-y-3">
                {user.addresses.map((addr, idx) => (
                  <label
                    key={addr.id || idx}
                    className={`block p-3.5 rounded-xl border cursor-pointer transition-all ${
                      selectedAddressIndex === idx
                        ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        name="savedAddress"
                        checked={selectedAddressIndex === idx}
                        onChange={() => setSelectedAddressIndex(idx)}
                        className="mt-1 text-indigo-600 focus:ring-indigo-500"
                      />
                      <div className="text-xs text-slate-600">
                        <p className="font-bold text-slate-900">{addr.fullName} · {addr.phone}</p>
                        <p className="mt-0.5">{addr.street} {addr.apartment ? `, ${addr.apartment}` : ''}</p>
                        <p>{addr.city}, {addr.state} - {addr.postalCode}</p>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Street Address *</label>
                  <input
                    type="text"
                    required
                    value={formData.street}
                    onChange={e => setFormData({ ...formData, street: e.target.value })}
                    placeholder="House / Flat no, Building, Street name"
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Apartment / Landmark</label>
                  <input
                    type="text"
                    value={formData.apartment}
                    onChange={e => setFormData({ ...formData, apartment: e.target.value })}
                    placeholder="Apartment, suite, or landmark (optional)"
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">City *</label>
                    <input
                      type="text"
                      required
                      value={formData.city}
                      onChange={e => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">State *</label>
                    <input
                      type="text"
                      required
                      value={formData.state}
                      onChange={e => setFormData({ ...formData, state: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Postal Code *</label>
                    <input
                      type="text"
                      required
                      value={formData.postalCode}
                      onChange={e => setFormData({ ...formData, postalCode: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 3. Payment Method */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-indigo-600" />
              <span>3. Payment Method</span>
            </h2>

            <div className="space-y-3">
              {/* Razorpay Test Mode */}
              <label
                className={`block p-4 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === 'razorpay'
                    ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'razorpay'}
                      onChange={() => setPaymentMethod('razorpay')}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    <div>
                      <p className="text-xs font-bold text-slate-900">
                        Razorpay Gateway (Cards, UPI, NetBanking)
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {paymentConfig?.isConfigured
                          ? 'Active in Razorpay Test Mode with verified web signature'
                          : 'Simulation mode available if environment keys are unset'}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-indigo-700 uppercase bg-indigo-100/80 px-2 py-0.5 rounded">
                    Test Mode
                  </span>
                </div>
              </label>

              {/* Instant Demo Card / UPI */}
              <label
                className={`block p-4 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === 'demo_card'
                    ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === 'demo_card'}
                    onChange={() => setPaymentMethod('demo_card')}
                    className="text-indigo-600 focus:ring-indigo-500"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-900">Instant Demo Simulation (One-Click Test)</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Instantly verifies and creates an authorized order without needing test cards.
                    </p>
                  </div>
                </div>
              </label>

              {/* Cash on Delivery */}
              <label
                className={`block p-4 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === 'cod'
                    ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                    className="text-indigo-600 focus:ring-indigo-500"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-900">Cash on Delivery (COD)</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Pay in cash or UPI at your doorstep upon delivery.</p>
                  </div>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Order Snapshot */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-5">
            <h2 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100">
              Order Items ({items.length})
            </h2>

            {/* Line items preview */}
            <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 pr-1">
              {items.map(item => (
                <div key={item.id} className="py-3 flex items-center gap-3">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-12 h-12 rounded-lg object-cover bg-slate-100 border border-slate-100 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-900 truncate">{item.name}</p>
                    <p className="text-[11px] text-slate-500">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-xs font-bold text-slate-900">
                    ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                  </p>
                </div>
              ))}
            </div>

            {/* Totals Recalculation */}
            <div className="space-y-2 text-xs text-slate-600 pt-3 border-t border-slate-200">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-900">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Discount ({appliedCoupon?.code})</span>
                  <span>-₹{discount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Express Shipping</span>
                <span className="font-semibold text-slate-900">
                  {shipping === 0 ? <strong className="text-emerald-600">FREE</strong> : `₹${shipping}`}
                </span>
              </div>
              <div className="pt-3 border-t border-slate-200 flex justify-between text-base font-black text-slate-900">
                <span>Total Due</span>
                <span className="text-indigo-600 text-lg">₹{finalTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isSubmitting ? (
                <span>Processing Order...</span>
              ) : (
                <>
                  <span>Confirm & Place Order (₹{finalTotal.toLocaleString('en-IN')})</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 space-y-2 text-xs text-slate-500">
            <p className="flex items-center gap-1.5 font-semibold text-slate-700">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Vibe-Nova Safe Purchase Promise</span>
            </p>
            <p className="leading-relaxed">
              Every purchase includes order tracking and a 7-day hassle-free replacement window.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
};
