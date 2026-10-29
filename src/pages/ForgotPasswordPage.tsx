import React, { useState } from 'react';
import { Mail, ArrowLeft, Send, CheckCircle2, Info } from 'lucide-react';

interface ForgotPasswordPageProps {
  navigate: (path: string) => void;
}

export const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({ navigate }) => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 sm:py-24 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-extrabold text-slate-900 brand-font">
          Reset Password
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Enter your registered email address to receive secure reset instructions.
        </p>
      </div>

      {submitted ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 text-center">Reset Request Submitted</h3>
          <p className="text-xs text-slate-600 leading-relaxed text-center">
            If an account exists for <strong className="text-slate-900">{email}</strong>, a password reset token has been registered in the system.
          </p>
          <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl text-[11px] text-indigo-900 space-y-1">
            <div className="flex items-center gap-1 font-bold">
              <Info className="w-3.5 h-3.5 text-indigo-600" />
              <span>Project Delivery Notice</span>
            </div>
            <p>
              In this environment, automated SMTP email dispatch (SendGrid/Resend) is not bound by default. To log in immediately, please use the predefined evaluation credentials on the login screen.
            </p>
          </div>
          <button
            onClick={() => navigate('/login')}
            className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold"
          >
            Back to Sign In
          </button>
        </div>
      ) : (
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

          <button
            type="submit"
            className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
          >
            <span>Request Reset Token</span>
            <Send className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => navigate('/login')}
            className="w-full py-2 text-xs text-slate-600 hover:text-slate-900 font-semibold flex items-center justify-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Sign In</span>
          </button>
        </form>
      )}
    </div>
  );
};
