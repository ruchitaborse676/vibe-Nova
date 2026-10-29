import React from 'react';

interface PolicyProps {
  navigate: (path: string) => void;
}

export const TermsPage: React.FC<PolicyProps> = ({ navigate }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-8">
      <div className="space-y-2">
        <span className="text-xs font-bold uppercase tracking-widest text-indigo-600">Legal Agreement</span>
        <h1 className="text-3xl font-extrabold text-slate-900 brand-font">Terms & Conditions</h1>
        <p className="text-xs text-slate-500">Effective Date: October 2026 · Vibe-Nova Terms of Service</p>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-xs space-y-6 text-xs sm:text-sm text-slate-600 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">1. Acceptance of Terms</h2>
          <p>
            By accessing and ordering on Vibe-Nova ("the platform"), you acknowledge that this is a simulated and functional academic marketplace built to demonstrate full-stack software engineering practices.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">2. Orders and Inventory Reservation</h2>
          <p>
            Placing an order triggers atomic stock reservation on the server. If an order is cancelled prior to shipment dispatch, stock is consistently restored to the inventory pool.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">3. Pricing and Promotions</h2>
          <p>
            All prices are denominated in Indian Rupees (₹). Promotional coupon codes (such as VIBE20) are verified exclusively by the server to prevent tamper attempts.
          </p>
        </section>
      </div>
    </div>
  );
};

export const ShippingPolicyPage: React.FC<PolicyProps> = ({ navigate }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-8">
      <div className="space-y-2">
        <span className="text-xs font-bold uppercase tracking-widest text-indigo-600">Logistics & Delivery</span>
        <h1 className="text-3xl font-extrabold text-slate-900 brand-font">Shipping Policy</h1>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-xs space-y-6 text-xs sm:text-sm text-slate-600 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">Dispatch & Delivery Timeline</h2>
          <p>
            Orders placed on Vibe-Nova are packed and dispatched within 24 hours from our fulfillment hub. Metro cities typically receive shipments within 2-3 business days; rest of India within 4-5 business days.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">Shipping Rates</h2>
          <p>
            Orders exceeding ₹999 qualify for <strong>FREE Express Standard Delivery</strong>. For orders below ₹999, a nominal flat rate of ₹99 is applied at checkout.
          </p>
        </section>
      </div>
    </div>
  );
};

export const ReturnsPolicyPage: React.FC<PolicyProps> = ({ navigate }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-8">
      <div className="space-y-2">
        <span className="text-xs font-bold uppercase tracking-widest text-indigo-600">Satisfaction Assurance</span>
        <h1 className="text-3xl font-extrabold text-slate-900 brand-font">Return & Refund Policy</h1>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-xs space-y-6 text-xs sm:text-sm text-slate-600 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">7-Day Return Window</h2>
          <p>
            If you are not delighted with your purchase, you may initiate a return or exchange within 7 calendar days of receipt. Products must remain in their original condition with tags and packaging intact.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">Refund Processing</h2>
          <p>
            Upon inspection at our center, refunds are credited back to the original payment source within 3-5 business days. Cash on delivery orders are refunded via direct bank transfer (NEFT/UPI).
          </p>
        </section>
      </div>
    </div>
  );
};
