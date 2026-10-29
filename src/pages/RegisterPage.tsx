import React, { useState } from 'react';
import { Lock, Mail, User as UserIcon, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.js';

interface RegisterPageProps {
  navigate: (path: string) => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ navigate }) => {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Password strength calculation
  const getPasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass) || /[^A-Za-z0-9]/.test(pass)) score += 1;
    return score;
  };

  const strength = getPasswordStrength(password);
  const strengthLabels = ['Too Weak', 'Weak', 'Fair', 'Strong'];
  const strengthColors = ['bg-rose-500', 'bg-amber-500', 'bg-sky-500', 'bg-emerald-500'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    const res = await register(name, email, password);
    setLoading(false);

    if (res.success) {
      navigate('/account');
    } else {
      setError(res.error || 'Registration failed.');
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 sm:py-24 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-slate-900 via-indigo-950 to-violet-900 text-white font-black text-xl mx-auto flex items-center justify-center shadow-md">
          VN
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 brand-font">
          Create Your Vibe-Nova Account
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Join our community for exclusive drops, order tracking, and member offers.
        </p>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1">Full Name</label>
          <div className="relative">
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Priyanshu Mehta"
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
            />
            <UserIcon className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>

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
          <label className="text-xs font-semibold text-slate-700 block mb-1">Password</label>
          <div className="relative">
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
            />
            <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>

          {/* Password strength meter */}
          {password && (
            <div className="mt-2 space-y-1">
              <div className="flex gap-1 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                {[1, 2, 3, 4].map(step => (
                  <div
                    key={step}
                    className={`flex-1 transition-all ${
                      strength >= step ? strengthColors[strength - 1] : 'bg-transparent'
                    }`}
                  />
                ))}
              </div>
              <p className="text-[10px] text-slate-500 text-right">
                Strength: <span className="font-semibold">{strengthLabels[strength - 1] || 'Too Weak'}</span>
              </p>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {loading ? 'Creating Account...' : 'Register'}
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </form>

      <div className="text-center text-xs text-slate-500">
        Already have an account?{' '}
        <button
          onClick={() => navigate('/login')}
          className="text-indigo-600 font-semibold hover:underline"
        >
          Sign In
        </button>
      </div>
    </div>
  );
};
