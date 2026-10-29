import React, { useState } from 'react';
import { Send, CheckCircle2, ShieldCheck, Truck, RefreshCw, Headphones } from 'lucide-react';
import { api } from '../../services/api.js';

interface FooterProps {
  navigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ navigate }) => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setStatus('error');
      setMessage('Please enter a valid email address.');
      return;
    }

    setStatus('loading');
    try {
      const res = await api.subscribeNewsletter(email);
      if (res.success) {
        setStatus('success');
        setMessage(res.message);
        setEmail('');
      }
    } catch (err: any) {
      setStatus('error');
      setMessage(err.message || 'Subscription failed.');
    }
  };

  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-800/80 pt-16 pb-12">
      {/* Trust Pillars */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 border-b border-slate-800">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-indigo-950/80 border border-indigo-800/40 text-indigo-400 flex items-center justify-center flex-shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Express Delivery</h4>
              <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">Free Pan-India shipping on all orders over ₹999.</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-violet-950/80 border border-violet-800/40 text-violet-400 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">100% Authentic</h4>
              <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">Curated and quality inspected directly from certified makers.</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-sky-950/80 border border-sky-800/40 text-sky-400 flex items-center justify-center flex-shrink-0">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">7-Day Easy Returns</h4>
              <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">Hassle-free doorstep exchanges or full refunds.</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-emerald-950/80 border border-emerald-800/40 text-emerald-400 flex items-center justify-center flex-shrink-0">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Dedicated Support</h4>
              <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">Available Monday to Saturday, 9 AM to 8 PM IST.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links & Newsletter */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center text-white font-black text-base shadow-lg shadow-indigo-500/20">
                VN
              </div>
              <span className="brand-font text-xl font-bold tracking-tight text-white">
                Vibe-Nova
              </span>
            </div>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              Your Style. Your Vibe. Your Universe. Next-generation curated marketplace for contemporary fashion, minimalist desk gear, and daily lifestyle essentials.
            </p>

            {/* Newsletter Input */}
            <div className="pt-2">
              <p className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-2">
                Stay Ahead Of The Drop
              </p>
              <form onSubmit={handleNewsletter} className="flex gap-2 max-w-md">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="flex-1 px-3.5 py-2.5 text-xs sm:text-sm bg-slate-900 border border-slate-800 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="px-4 py-2.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors flex items-center gap-1.5 flex-shrink-0 disabled:opacity-60"
                >
                  {status === 'loading' ? 'Subscribing...' : 'Join'}
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
              {status === 'success' && (
                <p className="text-xs text-emerald-400 mt-2 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {message}
                </p>
              )}
              {status === 'error' && (
                <p className="text-xs text-rose-400 mt-2">{message}</p>
              )}
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4">Shop Collections</h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <button onClick={() => navigate('/products')} className="text-slate-400 hover:text-white transition-colors">
                  All Catalog
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/categories/electronics')} className="text-slate-400 hover:text-white transition-colors">
                  Electronics & Audio
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/categories/fashion')} className="text-slate-400 hover:text-white transition-colors">
                  Apparel & Footwear
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/categories/home-living')} className="text-slate-400 hover:text-white transition-colors">
                  Home & Desk Living
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/categories/accessories')} className="text-slate-400 hover:text-white transition-colors">
                  Urban Accessories
                </button>
              </li>
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4">Customer Care</h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <button onClick={() => navigate('/contact')} className="text-slate-400 hover:text-white transition-colors">
                  Help Center & FAQs
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/account/orders')} className="text-slate-400 hover:text-white transition-colors">
                  Track Your Order
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/shipping-policy')} className="text-slate-400 hover:text-white transition-colors">
                  Shipping Policy
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/returns-policy')} className="text-slate-400 hover:text-white transition-colors">
                  Returns & Exchanges
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/about')} className="text-slate-400 hover:text-white transition-colors">
                  About Vibe-Nova
                </button>
              </li>
            </ul>
          </div>

          {/* Legal & Compliance */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4">Policies & Project</h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <button onClick={() => navigate('/privacy')} className="text-slate-400 hover:text-white transition-colors">
                  Privacy Policy
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/terms')} className="text-slate-400 hover:text-white transition-colors">
                  Terms of Service
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/admin')} className="text-slate-400 hover:text-white transition-colors flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-violet-400" />
                  Admin Portal
                </button>
              </li>
            </ul>
            <div className="mt-4 p-3 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
              <strong className="text-slate-200 block mb-0.5">Academic Project Notice:</strong>
              Vibe-Nova is built as a complete college engineering full-stack e-commerce project demonstration.
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <p>© {new Date().getFullYear()} Vibe-Nova Inc. All rights reserved. Your Style. Your Vibe. Your Universe.</p>
        <div className="flex items-center gap-4 text-[11px]">
          <span>Razorpay Test Verified</span>
          <span>·</span>
          <span>MongoDB Atlas Ready</span>
          <span>·</span>
          <span>Vercel Deployable</span>
        </div>
      </div>
    </footer>
  );
};
