import React, { useEffect, useState } from 'react';
import { ArrowRight, Sparkles, TrendingUp, ShieldCheck, Tag, ShoppingBag, ArrowUpRight } from 'lucide-react';
import { Product, Category } from '../types/index.js';
import { api } from '../services/api.js';
import { ProductCard } from '../components/common/ProductCard.js';

interface HomePageProps {
  navigate: (path: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ navigate }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [trendingProducts, setTrendingProducts] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHomeData() {
      try {
        setLoading(true);
        const [catRes, trendRes, newRes, bestRes] = await Promise.all([
          api.getCategories(),
          api.getProducts({ featured: true, limit: 4 }),
          api.getProducts({ isNewArrival: true, limit: 4 }),
          api.getProducts({ bestSeller: true, limit: 4 }),
        ]);

        if (catRes.success) setCategories(catRes.categories);
        if (trendRes.success) setTrendingProducts(trendRes.products);
        if (newRes.success) setNewArrivals(newRes.products);
        if (bestRes.success) setBestSellers(bestRes.products);
      } catch (err) {
        console.error('Failed to load homepage data', err);
      } finally {
        setLoading(false);
      }
    }

    loadHomeData();
  }, []);

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 text-white">
        {/* Subtle background ambient gradients */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute -top-24 left-1/4 w-96 h-96 bg-violet-600 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-sky-600 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Copy */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-md text-xs font-semibold text-violet-200 border border-white/10">
                <Sparkles className="w-3.5 h-3.5 text-violet-300" />
                <span>The 2026 Collection Drop Is Live</span>
              </div>

              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.08] brand-font">
                Find Your <br />
                <span className="bg-gradient-to-r from-violet-200 via-indigo-200 to-sky-300 bg-clip-text text-transparent">
                  Next Vibe.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-300 max-w-xl font-normal leading-relaxed">
                Explore everyday essentials, standout styles, and smart picks curated for you. Built with premium materials, modern precision, and zero compromise.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={() => navigate('/products')}
                  className="px-6 py-3.5 bg-white text-slate-950 hover:bg-slate-100 font-bold text-sm rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2 group"
                >
                  <span>Shop Collection</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={() => navigate('/products?newArrival=true')}
                  className="px-6 py-3.5 bg-white/10 hover:bg-white/15 text-white font-semibold text-sm rounded-xl border border-white/20 backdrop-blur-sm transition-all"
                >
                  Explore New Arrivals
                </button>
              </div>

              {/* Quick Trust Badges */}
              <div className="pt-6 border-t border-white/10 grid grid-cols-3 gap-4 text-xs text-slate-300">
                <div>
                  <p className="font-bold text-white text-base">18+</p>
                  <p className="text-slate-400">Curated Lines</p>
                </div>
                <div>
                  <p className="font-bold text-white text-base">₹999+</p>
                  <p className="text-slate-400">Free Shipping</p>
                </div>
                <div>
                  <p className="font-bold text-white text-base">7-Day</p>
                  <p className="text-slate-400">Doorstep Returns</p>
                </div>
              </div>
            </div>

            {/* Right Editorial Visual Showcase */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/15 aspect-4/5 bg-slate-800">
                  <img
                    src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=80"
                    alt="NovaPulse ANC Wireless Headphones Showcase"
                    className="w-full h-full object-cover object-center"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex flex-col justify-end p-6">
                    <span className="text-[11px] font-bold text-violet-300 uppercase tracking-widest">
                      Featured Hardware
                    </span>
                    <h3 className="text-xl font-bold text-white mt-1">NovaPulse ANC Wireless</h3>
                    <p className="text-xs text-slate-300 mt-0.5">40mm titanium drivers · 45H battery</p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-lg font-extrabold text-white">₹4,999</span>
                      <button
                        onClick={() => navigate('/products/novapulse-anc-wireless-headphones')}
                        className="px-3.5 py-1.5 bg-white text-slate-900 text-xs font-bold rounded-lg hover:bg-slate-100 transition-colors"
                      >
                        Inspect
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Featured Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-600">
              Categories
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              Curated For Every Spectrum
            </h2>
          </div>
          <button
            onClick={() => navigate('/products')}
            className="text-xs sm:text-sm font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 group self-start sm:self-auto"
          >
            <span>Explore all categories</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
          {categories.map(cat => (
            <div
              key={cat._id || cat.slug}
              onClick={() => navigate(`/categories/${cat.slug}`)}
              className="group relative rounded-2xl overflow-hidden aspect-4/5 bg-slate-100 cursor-pointer shadow-sm hover:shadow-lg transition-all duration-300 border border-slate-200/60"
            >
              <img
                src={cat.image}
                alt={cat.name}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-transparent flex flex-col justify-end p-4">
                <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-indigo-200 transition-colors">
                  {cat.name}
                </h3>
                <p className="text-[11px] text-slate-300 line-clamp-1 mt-0.5">
                  {cat.description}
                </p>
                <div className="mt-2 text-[11px] font-semibold text-indigo-300 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>Browse catalog</span>
                  <ArrowUpRight className="w-3 h-3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Trending Products Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-indigo-600">
              <TrendingUp className="w-4 h-4" />
              <span>Trending Now</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              Top Picks Across India
            </h2>
          </div>
          <button
            onClick={() => navigate('/products?featured=true')}
            className="text-xs sm:text-sm font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 group self-start sm:self-auto"
          >
            <span>View all trending</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="bg-slate-100 animate-pulse rounded-2xl h-80" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {trendingProducts.map(p => (
              <ProductCard key={p._id || p.slug} product={p} navigate={navigate} />
            ))}
          </div>
        )}
      </section>

      {/* 4. Promotional Campaign Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center p-8 sm:p-12">
            <div className="md:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-violet-500/20 text-violet-300 border border-violet-500/30 rounded-md text-xs font-bold uppercase tracking-wider">
                <Tag className="w-3.5 h-3.5" />
                <span>Limited Campus Special</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white leading-tight brand-font">
                Upgrade Your Daily Workflow. <br className="hidden sm:block" />
                Take 20% Off With Code <span className="text-indigo-300">VIBE20</span>
              </h2>
              <p className="text-sm text-slate-300 max-w-xl">
                Valid on mechanical keyboards, acoustic gear, ergonomic lighting, and tactical carry bags. Applied instantly at checkout.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => navigate('/products')}
                  className="px-6 py-3 bg-white text-slate-900 hover:bg-slate-100 font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md flex items-center gap-2"
                >
                  <span>Shop The Drop</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="md:col-span-4 flex justify-center">
              <div className="w-full max-w-xs aspect-square rounded-2xl overflow-hidden border border-white/10 shadow-lg">
                <img
                  src="https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80"
                  alt="Apex 75% Mechanical Keyboard Banner"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. New Arrivals Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-violet-600">
              <Sparkles className="w-4 h-4" />
              <span>Just Arrived</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              Fresh Additions to the Catalog
            </h2>
          </div>
          <button
            onClick={() => navigate('/products?newArrival=true')}
            className="text-xs sm:text-sm font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 group self-start sm:self-auto"
          >
            <span>Explore all new arrivals</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {newArrivals.map(p => (
            <ProductCard key={p._id || p.slug} product={p} navigate={navigate} />
          ))}
        </div>
      </section>

      {/* 6. Best Sellers Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-600">
              Proven Favorites
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              Community Best Sellers
            </h2>
          </div>
          <button
            onClick={() => navigate('/products?bestSeller=true')}
            className="text-xs sm:text-sm font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 group self-start sm:self-auto"
          >
            <span>View all best sellers</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {bestSellers.map(p => (
            <ProductCard key={p._id || p.slug} product={p} navigate={navigate} />
          ))}
        </div>
      </section>
    </div>
  );
};
