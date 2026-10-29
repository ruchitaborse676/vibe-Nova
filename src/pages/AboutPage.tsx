import React from 'react';
import { ArrowRight, Sparkles, ShieldCheck, Heart, Compass } from 'lucide-react';

interface AboutPageProps {
  navigate: (path: string) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ navigate }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 space-y-12">
      {/* Editorial Header */}
      <div className="text-center space-y-4">
        <span className="text-xs font-bold uppercase tracking-widest text-indigo-600">
          Our Brand Identity
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 brand-font">
          Your Style. Your Vibe. Your Universe.
        </h1>
        <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Vibe-Nova was engineered as a vision for modern commerce: unencumbered by artificial clutter, driven by honest craftsmanship, and curated for curious urban thinkers.
        </p>
      </div>

      {/* Visual Banner */}
      <div className="rounded-3xl overflow-hidden aspect-21/9 bg-slate-900 relative shadow-xl">
        <img
          src="https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1400&q=80"
          alt="Vibe-Nova Living Space Showcase"
          className="w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-8">
          <p className="text-white text-base sm:text-lg font-bold">
            Curating precision hardware and enduring style across India.
          </p>
        </div>
      </div>

      {/* Core Principles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Aesthetic Precision</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Every product in our catalog meets strict visual and tactile standards. No unnecessary novelties, only timeless design.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center font-bold">
            <Compass className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Transparent Commerce</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            True inventory snapshots, authentic verified reviews, and honest delivery timelines without hidden charges.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Engineering Excellence</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Built as a full-stack software engineering project demonstrating modern React, TypeScript, Node.js, and MongoDB architectures.
          </p>
        </div>
      </div>

      {/* CTA Section */}
      <div className="p-8 rounded-3xl bg-slate-900 text-white text-center space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold brand-font">Ready to find your vibe?</h2>
        <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto">
          Explore our newly released spring drops across headphones, mechanical keys, and daily essentials.
        </p>
        <button
          onClick={() => navigate('/products')}
          className="px-6 py-3 bg-white text-slate-900 font-bold text-xs sm:text-sm rounded-xl hover:bg-slate-100 transition-colors inline-flex items-center gap-2"
        >
          <span>Explore Catalog</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
