import React from 'react';

interface PolicyProps {
  navigate: (path: string) => void;
}

export const PrivacyPage: React.FC<PolicyProps> = ({ navigate }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-8">
      <div className="space-y-2">
        <span className="text-xs font-bold uppercase tracking-widest text-indigo-600">Compliance & Privacy</span>
        <h1 className="text-3xl font-extrabold text-slate-900 brand-font">Privacy Policy</h1>
        <p className="text-xs text-slate-500">Effective Date: October 2026 · Vibe-Nova Engineering Project</p>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-xs space-y-6 text-xs sm:text-sm text-slate-600 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">1. Information We Collect</h2>
          <p>
            Vibe-Nova collects customer name, email address, phone number, and delivery address exclusively for order processing, account management, and notification dispatch. Plaintext passwords are never stored; all credentials are cryptographic salt-and-hashed using bcrypt.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">2. Payment Security</h2>
          <p>
            Payment transactions are processed through authenticated gateways (such as Razorpay in Test Mode). Vibe-Nova never directly handles, transmits, or stores sensitive credit/debit card numbers or CVVs on application servers.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">3. Cookies and Session Management</h2>
          <p>
            We use secure HTTP-only session cookies and authorization headers solely for user authentication state. We do not sell user data to advertising networks.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">4. College Demonstration Disclaimer</h2>
          <p>
            This application is constructed as an academic college engineering showcase. User data registered in demo environments may be periodically cleared during test cycles.
          </p>
        </section>
      </div>
    </div>
  );
};
