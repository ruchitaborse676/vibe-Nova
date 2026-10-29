import React, { useState } from 'react';
import { Lock, Mail, ArrowRight, ShieldCheck, UserCheck, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.js';

interface LoginPageProps {
  navigate: (path: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ navigate }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      navigate('/account');
    } else {
      setError(res.error || 'Invalid email or password.');
    }
  };

  const fillCustomer = () => {
    setEmail('customer@example.com');
    setPassword('Customer@123');
    setError(null);
  };

  const fillAdmin = () => {
    setEmail('admin@vibenova.com');
    setPassword('AdminPassword@123');
    setError(null);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 sm:py-24 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-slate-900 via-indigo-950 to-violet-900 text-white font-black text-xl mx-auto flex items-center justify-center shadow-md">
          VN
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 brand-font">
          Sign In to Vibe-Nova
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Access your orders, saved addresses, and personal wishlist.
        </p>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Quick Fill Demo Accounts Banner */}
      <div className="p-3.5 rounded-xl bg-indigo-50/80 border border-indigo-200/60 text-xs space-y-2">
        <p className="font-bold text-indigo-900 flex items-center gap-1.5">
          <UserCheck className="w-4 h-4 text-indigo-600" />
          <span>Quick Evaluation Credentials:</span>
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={fillCustomer}
            className="flex-1 py-1.5 px-2 bg-white hover:bg-slate-50 text-indigo-900 border border-indigo-200 font-semibold rounded-md shadow-2xs transition-colors text-left"
          >
            <span className="block text-[11px] font-bold">Customer Demo</span>
            <span className="block text-[10px] text-slate-500 font-mono">customer@example.com</span>
          </button>
          <button
            type="button"
            onClick={fillAdmin}
            className="flex-1 py-1.5 px-2 bg-white hover:bg-slate-50 text-violet-900 border border-violet-200 font-semibold rounded-md shadow-2xs transition-colors text-left"
          >
            <span className="block text-[11px] font-bold text-violet-700">Admin Console Demo</span>
            <span className="block text-[10px] text-slate-500 font-mono">admin@vibenova.com</span>
          </button>
        </div>
      </div>

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1">Email Address</label>
          <div className="relative">
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@domain.com"
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
            />
            <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold text-slate-700">Password</label>
            <button
              type="button"
              onClick={() => navigate('/forgot-password')}
              className="text-[11px] text-indigo-600 hover:underline"
            >
              Forgot password?
            </button>
          </div>
          <div className="relative">
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
            />
            <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {loading ? 'Authenticating...' : 'Sign In'}
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </form>

      <div className="text-center text-xs text-slate-500">
        Don't have an account yet?{' '}
        <button
          onClick={() => navigate('/register')}
          className="text-indigo-600 font-semibold hover:underline"
        >
          Create an account
        </button>
      </div>
    </div>
  );
};
