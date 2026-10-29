import React, { useState, useEffect } from 'react';
import { Filter, SlidersHorizontal, X, Search, ChevronDown, RefreshCw, Star } from 'lucide-react';
import { Product, Category } from '../types/index.js';
import { api } from '../services/api.js';
import { ProductCard } from '../components/common/ProductCard.js';

interface ProductsPageProps {
  navigate: (path: string) => void;
  searchParams?: URLSearchParams;
}

export const ProductsPage: React.FC<ProductsPageProps> = ({ navigate, searchParams }) => {
  const initialCategory = searchParams?.get('category') || 'all';
  const initialSearch = searchParams?.get('search') || searchParams?.get('q') || '';
  const initialNew = searchParams?.get('newArrival') === 'true';
  const initialBest = searchParams?.get('bestSeller') === 'true';
  const initialSort = searchParams?.get('sort') || 'featured';

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [minPrice, setMinPrice] = useState<number | ''>('');
  const [maxPrice, setMaxPrice] = useState<number | ''>('');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [minRating, setMinRating] = useState<number | ''>('');
  const [sortOption, setSortOption] = useState(initialSort);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Mobile filter drawer state
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  useEffect(() => {
    api.getCategories()
      .then(res => res.success && setCategories(res.categories))
      .catch(() => {});
  }, []);

  // Fetch products whenever filters or pagination change
  useEffect(() => {
    async function fetchCatalog() {
      setLoading(true);
      try {
        const res = await api.getProducts({
          category: selectedCategory !== 'all' ? selectedCategory : undefined,
          search: searchQuery.trim() || undefined,
          minPrice: minPrice !== '' ? Number(minPrice) : undefined,
          maxPrice: maxPrice !== '' ? Number(maxPrice) : undefined,
          inStock: inStockOnly,
          rating: minRating !== '' ? Number(minRating) : undefined,
          sort: sortOption,
          page: currentPage,
          limit: 12,
          isNewArrival: initialNew || undefined,
          bestSeller: initialBest || undefined,
        });

        if (res.success) {
          setProducts(res.products);
          setTotalPages(res.pagination.totalPages);
          setTotalCount(res.pagination.total);
        }
      } catch (err) {
        console.error('Error fetching catalog:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchCatalog();
  }, [
    selectedCategory,
    searchQuery,
    minPrice,
    maxPrice,
    inStockOnly,
    minRating,
    sortOption,
    currentPage,
    initialNew,
    initialBest,
  ]);

  const clearAllFilters = () => {
    setSelectedCategory('all');
    setSearchQuery('');
    setMinPrice('');
    setMaxPrice('');
    setInStockOnly(false);
    setMinRating('');
    setSortOption('featured');
    setCurrentPage(1);
  };

  const hasActiveFilters =
    selectedCategory !== 'all' ||
    searchQuery.trim() !== '' ||
    minPrice !== '' ||
    maxPrice !== '' ||
    inStockOnly ||
    minRating !== '' ||
    sortOption !== 'featured';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Page Title & Breadcrumb */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
          <button onClick={() => navigate('/')} className="hover:text-slate-900 transition-colors">
            Home
          </button>
          <span>/</span>
          <span className="text-slate-900 font-medium">Catalog</span>
          {selectedCategory !== 'all' && (
            <>
              <span>/</span>
              <span className="text-indigo-600 font-semibold capitalize">
                {categories.find(c => c.slug === selectedCategory)?.name || selectedCategory}
              </span>
            </>
          )}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 brand-font">
              {initialNew ? 'New Arrivals Drop' : initialBest ? 'Best Sellers Collection' : 'Curated Catalog'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Showing <span className="font-semibold text-slate-900">{totalCount}</span> items engineered for style and utility.
            </p>
          </div>

          {/* Sort Dropdown & Mobile Filter Button */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileFiltersOpen(true)}
              className="lg:hidden px-3.5 py-2 text-xs font-semibold bg-white border border-slate-300 rounded-lg flex items-center gap-1.5 text-slate-700 shadow-xs"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Filters {hasActiveFilters && '•'}</span>
            </button>

            <div className="flex items-center gap-2 bg-white border border-slate-300 rounded-lg px-3 py-1.5 shadow-xs">
              <span className="text-xs text-slate-500 hidden sm:inline">Sort:</span>
              <select
                value={sortOption}
                onChange={e => {
                  setSortOption(e.target.value);
                  setCurrentPage(1);
                }}
                className="text-xs font-semibold text-slate-800 bg-transparent border-0 focus:outline-none cursor-pointer"
              >
                <option value="featured">Featured Picks</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="newest">Newest Additions</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Desktop Filter Sidebar */}
        <div className="hidden lg:block lg:col-span-1 space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
                <span>Filters</span>
              </div>
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Search inside catalog */}
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                Search
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Keyword or tag..."
                  value={searchQuery}
                  onChange={e => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 transition-colors"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Categories */}
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                Category
              </label>
              <div className="space-y-1 text-xs">
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setCurrentPage(1);
                  }}
                  className={`w-full text-left py-1.5 px-2.5 rounded-lg font-medium transition-colors ${
                    selectedCategory === 'all'
                      ? 'bg-indigo-50 text-indigo-700 font-bold'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  All Categories
                </button>
                {categories.map(cat => (
                  <button
                    key={cat.slug}
                    onClick={() => {
                      setSelectedCategory(cat.slug);
                      setCurrentPage(1);
                    }}
                    className={`w-full text-left py-1.5 px-2.5 rounded-lg font-medium transition-colors ${
                      selectedCategory === cat.slug
                        ? 'bg-indigo-50 text-indigo-700 font-bold'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Filter */}
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                Price (₹)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Min ₹"
                  value={minPrice}
                  onChange={e => {
                    setMinPrice(e.target.value === '' ? '' : Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                />
                <input
                  type="number"
                  placeholder="Max ₹"
                  value={maxPrice}
                  onChange={e => {
                    setMaxPrice(e.target.value === '' ? '' : Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Availability */}
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                Availability
              </label>
              <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={e => {
                    setInStockOnly(e.target.checked);
                    setCurrentPage(1);
                  }}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span>In Stock Only</span>
              </label>
            </div>

            {/* Rating Filter */}
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                Customer Rating
              </label>
              <div className="space-y-1.5 text-xs">
                {[4, 3].map(stars => (
                  <label key={stars} className="flex items-center gap-2 text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="minRating"
                      checked={minRating === stars}
                      onChange={() => {
                        setMinRating(stars);
                        setCurrentPage(1);
                      }}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    <div className="flex items-center gap-1 text-slate-700">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{stars} Stars & Above</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Product Grid Area */}
        <div className="lg:col-span-3 space-y-6">
          {/* Active Filter Chips */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 p-3 bg-slate-100/70 rounded-xl text-xs">
              <span className="text-slate-500 font-medium">Active:</span>

              {selectedCategory !== 'all' && (
                <button
                  onClick={() => setSelectedCategory('all')}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-white rounded-md text-slate-800 border border-slate-200 shadow-2xs hover:bg-slate-50"
                >
                  <span>Category: {selectedCategory}</span>
                  <X className="w-3 h-3 text-slate-400" />
                </button>
              )}

              {searchQuery.trim() && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-white rounded-md text-slate-800 border border-slate-200 shadow-2xs hover:bg-slate-50"
                >
                  <span>"{searchQuery}"</span>
                  <X className="w-3 h-3 text-slate-400" />
                </button>
              )}

              {minPrice !== '' && (
                <button
                  onClick={() => setMinPrice('')}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-white rounded-md text-slate-800 border border-slate-200 shadow-2xs hover:bg-slate-50"
                >
                  <span>Min ₹{minPrice}</span>
                  <X className="w-3 h-3 text-slate-400" />
                </button>
              )}

              {maxPrice !== '' && (
                <button
                  onClick={() => setMaxPrice('')}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-white rounded-md text-slate-800 border border-slate-200 shadow-2xs hover:bg-slate-50"
                >
                  <span>Max ₹{maxPrice}</span>
                  <X className="w-3 h-3 text-slate-400" />
                </button>
              )}

              {inStockOnly && (
                <button
                  onClick={() => setInStockOnly(false)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-white rounded-md text-slate-800 border border-slate-200 shadow-2xs hover:bg-slate-50"
                >
                  <span>In Stock</span>
                  <X className="w-3 h-3 text-slate-400" />
                </button>
              )}

              {minRating !== '' && (
                <button
                  onClick={() => setMinRating('')}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-white rounded-md text-slate-800 border border-slate-200 shadow-2xs hover:bg-slate-50"
                >
                  <span>{minRating}★+</span>
                  <X className="w-3 h-3 text-slate-400" />
                </button>
              )}

              <button
                onClick={clearAllFilters}
                className="text-indigo-600 font-semibold hover:underline ml-1"
              >
                Clear all
              </button>
            </div>
          )}

          {/* Product Grid */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3 animate-pulse">
                  <div className="aspect-square bg-slate-200 rounded-xl" />
                  <div className="h-4 bg-slate-200 rounded-sm w-3/4" />
                  <div className="h-4 bg-slate-200 rounded-sm w-1/2" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-3">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">No products match your criteria</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mb-6">
                Try widening your price range or resetting active search filters to see all available products.
              </p>
              <button
                onClick={clearAllFilters}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
              {products.map(p => (
                <ProductCard key={p._id || p.slug} product={p} navigate={navigate} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pt-8 border-t border-slate-200 flex items-center justify-between">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3.5 py-2 text-xs font-semibold border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition-colors"
              >
                Previous
              </button>

              <span className="text-xs text-slate-600 font-medium">
                Page <strong className="text-slate-900">{currentPage}</strong> of <strong className="text-slate-900">{totalPages}</strong>
              </span>

              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-3.5 py-2 text-xs font-semibold border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filters Modal */}
      {isMobileFiltersOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="fixed inset-0 bg-slate-900/60" onClick={() => setIsMobileFiltersOpen(false)} />
          <div className="relative ml-auto w-full max-w-xs bg-white h-full p-6 shadow-xl flex flex-col justify-between overflow-y-auto">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <span className="text-base font-bold text-slate-900">Filter Products</span>
                <button onClick={() => setIsMobileFiltersOpen(false)} className="p-1 text-slate-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Categories */}
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">Category</label>
                <div className="space-y-1 text-xs">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`w-full text-left py-1.5 px-2 rounded-md ${selectedCategory === 'all' ? 'bg-indigo-50 font-bold text-indigo-700' : 'text-slate-600'}`}
                  >
                    All Categories
                  </button>
                  {categories.map(c => (
                    <button
                      key={c.slug}
                      onClick={() => setSelectedCategory(c.slug)}
                      className={`w-full text-left py-1.5 px-2 rounded-md ${selectedCategory === c.slug ? 'bg-indigo-50 font-bold text-indigo-700' : 'text-slate-600'}`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price */}
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">Price (₹)</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={e => setMinPrice(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={e => setMaxPrice(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md"
                  />
                </div>
              </div>

              {/* Availability */}
              <label className="flex items-center gap-2 text-xs text-slate-700">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={e => setInStockOnly(e.target.checked)}
                  className="rounded text-indigo-600"
                />
                <span>In Stock Only</span>
              </label>
            </div>

            <div className="pt-6 border-t border-slate-200 flex gap-2">
              <button
                onClick={clearAllFilters}
                className="flex-1 py-2 text-xs font-semibold border border-slate-300 rounded-lg text-slate-700"
              >
                Reset
              </button>
              <button
                onClick={() => setIsMobileFiltersOpen(false)}
                className="flex-1 py-2 text-xs font-semibold bg-slate-900 text-white rounded-lg"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
