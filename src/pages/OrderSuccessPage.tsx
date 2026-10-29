import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { CheckCircle2, Package, ArrowRight, Truck, MapPin, Calendar, Clock } from 'lucide-react';
import { api } from '../services/api.js';
import { Order } from '../types/index.js';

interface OrderSuccessPageProps {
  navigate: (path: string) => void;
  searchParams?: URLSearchParams;
}

export const OrderSuccessPage: React.FC<OrderSuccessPageProps> = ({ navigate, searchParams }) => {
  const orderId = searchParams?.get('orderId') || '';
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Launch celebratory confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#6366f1', '#a855f7', '#38bdf8', '#10b981'],
      });
    } catch {}

    if (orderId) {
      api.getOrder(orderId)
        .then(res => {
          if (res.success && res.order) setOrder(res.order);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [orderId]);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-8 animate-fade-in">
      {/* Top Banner */}
      <div className="text-center space-y-3">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-xs">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 brand-font">
          Thank You! Your Order is Confirmed
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
          We received your order and have reserved your inventory. A confirmation receipt and tracking updates will follow shortly.
        </p>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center animate-pulse">
          <div className="h-6 bg-slate-200 rounded w-1/3 mx-auto mb-4" />
          <div className="h-24 bg-slate-100 rounded" />
        </div>
      ) : order ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          {/* Order Header Summary */}
          <div className="p-6 bg-slate-50/80 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs text-slate-500 font-medium">Order Number</p>
              <p className="text-base font-extrabold text-slate-900 font-mono mt-0.5">{order.orderNumber}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold capitalize bg-emerald-100 text-emerald-800">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                {order.orderStatus}
              </span>
              <span className="text-xs text-slate-500">
                {new Date(order.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
            </div>
          </div>

          {/* Items breakdown */}
          <div className="p-6 divide-y divide-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
              Ordered Items
            </h3>
            {order.items.map((item, idx) => (
              <div key={idx} className="py-3 flex items-center gap-4">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-14 h-14 object-cover rounded-xl bg-slate-100 border border-slate-100 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-semibold text-slate-900 truncate">{item.name}</p>
                  {item.variant && (
                    <p className="text-[11px] text-slate-500">
                      {Object.entries(item.variant.options || {})
                        .map(([k, v]) => `${k}: ${v}`)
                        .join(' · ')}
                    </p>
                  )}
                  <p className="text-xs text-slate-500 mt-0.5">Quantity: {item.quantity}</p>
                </div>
                <p className="text-xs sm:text-sm font-bold text-slate-900">
                  ₹{item.lineTotal.toLocaleString('en-IN')}
                </p>
              </div>
            ))}
          </div>

          {/* Address & Payment summary */}
          <div className="p-6 bg-slate-50/50 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs text-slate-600">
            <div>
              <h4 className="font-bold text-slate-900 flex items-center gap-1.5 mb-2">
                <MapPin className="w-4 h-4 text-indigo-600" />
                <span>Shipping Address</span>
              </h4>
              <p className="font-semibold text-slate-800">{order.shippingAddress.fullName}</p>
              <p>{order.shippingAddress.street} {order.shippingAddress.apartment}</p>
              <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.postalCode}</p>
              <p className="text-slate-500 mt-1">Phone: {order.shippingAddress.phone}</p>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 flex items-center gap-1.5 mb-2">
                <Truck className="w-4 h-4 text-indigo-600" />
                <span>Payment & Delivery</span>
              </h4>
              <p>Payment: <strong className="uppercase text-slate-800">{order.paymentMethod}</strong> ({order.paymentStatus})</p>
              <p className="mt-1 text-slate-500">Estimated Delivery: 2-4 Business Days via Express courier.</p>
              <div className="mt-3 pt-2 border-t border-slate-200 flex justify-between font-bold text-sm text-slate-900">
                <span>Final Paid Total:</span>
                <span className="text-indigo-600 font-black">₹{order.finalTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
        <button
          onClick={() => navigate('/account/orders')}
          className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
        >
          <Package className="w-4 h-4" />
          <span>View In Order History</span>
        </button>

        <button
          onClick={() => navigate('/products')}
          className="px-6 py-3 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold text-xs sm:text-sm rounded-xl transition-all flex items-center justify-center gap-2"
        >
          <span>Continue Shopping</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
