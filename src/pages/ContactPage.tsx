import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2, MessageSquare, Clock } from 'lucide-react';
import { api } from '../services/api.js';

interface ContactPageProps {
  navigate: (path: string) => void;
}

export const ContactPage: React.FC<ContactPageProps> = ({ navigate }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(null);
    setErrorMsg(null);
    setLoading(true);

    try {
      const res = await api.sendContactMessage(formData);
      if (res.success) {
        setSuccessMsg(res.message);
        setFormData({ name: '', email: '', subject: '', message: '' });
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit inquiry.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
      <div className="text-center space-y-3">
        <span className="text-xs font-bold uppercase tracking-widest text-indigo-600">
          Support & Inquiries
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 brand-font">
          We're Here For Your Vibe
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
          Have questions regarding an order, variant availability, or a custom collaboration? Our team is at your service.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Contact Info Cards */}
        <div className="md:col-span-5 space-y-4">
          <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Direct Channels
            </h3>

            <div className="space-y-4 text-xs text-slate-600">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">Email Desk</p>
                  <p className="text-slate-500">support@vibenova.com</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Average reply in 24 hours</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">Phone Support</p>
                  <p className="text-slate-500">+91 (080) 4123-8890</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Mon-Sat, 9:00 AM - 8:00 PM IST</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">Experience Studio</p>
                  <p className="text-slate-500">404 Innovation Hub, Outer Ring Road</p>
                  <p className="text-slate-500">Bengaluru, Karnataka 560103, India</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-xs text-indigo-900 space-y-1.5">
            <p className="font-bold">Academic Project Disclaimer</p>
            <p className="leading-relaxed text-indigo-800">
              Vibe-Nova is built as an educational full-stack software engineering project. All messages submitted are stored in the application database for demonstration purposes.
            </p>
          </div>
        </div>

        {/* Contact Form */}
        <div className="md:col-span-7 bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
          <h2 className="text-base font-bold text-slate-900 mb-4">Send a Message</h2>

          {successMsg && (
            <div className="mb-4 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Your Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Aarav Sharma"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  placeholder="name@domain.com"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Subject</label>
              <input
                type="text"
                value={formData.subject}
                onChange={e => setFormData({ ...formData, subject: e.target.value })}
                placeholder="Order tracking, product question, or feedback"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Message *</label>
              <textarea
                required
                rows={5}
                value={formData.message}
                onChange={e => setFormData({ ...formData, message: e.target.value })}
                placeholder="How can we assist you today?"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <span>{loading ? 'Submitting...' : 'Send Message'}</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
