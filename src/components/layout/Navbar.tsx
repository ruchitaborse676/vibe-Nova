import React, { useState, useEffect, useRef } from 'react';
import {
  ShoppingBag, Heart, User as UserIcon, Search, Menu, X,
  ChevronDown, ShieldCheck, Package, LogOut, ArrowRight, Sparkles
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext.js';
import { useCart } from '../../contexts/CartContext.js';
import { useWishlist } from '../../contexts/WishlistContext.js';
import { api } from '../../services/api.js';
import { Product, Category } from '../../types/index.js';

interface NavbarProps {
  currentPath: string;
  navigate: (path: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPath, navigate }) => {
  const { user, logout } = useAuth();
  const { itemCount, setIsCartOpen } = useCart();
  const { wishlistCount } = useWishlist();

  const [categories, setCategories] = useState<Category[]>([]);
  const [isCatDropdownOpen, setIsCatDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.getCategories()
      .then(res => res.success && setCategories(res.categories))
      .catch(() => {});
  }, []);

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(() => {
      setIsSearching(true);
      api.getProducts({ search: searchQuery.trim(), limit: 5 })
        .then(res => {
          if (res.success) setSearchResults(res.products);
        })
        .finally(() => setIsSearching(false));
    }, 280);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside listener for search & dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearchOpen(false);
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const navLinkClass = (path: string) =>
    `text-sm font-medium transition-colors hover:text-indigo-600 ${
      currentPath === path ? 'text-indigo-600 font-semibold' : 'text-slate-700'
    }`;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-all">
      {/* Top Announcement Bar */}
      <div className="bg-slate-900 text-slate-200 text-xs py-2 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-violet-400 animate-pulse"></span>
            <p className="font-normal tracking-wide">
              <span>Find your vibe · Use code <strong className="text-violet-300 font-semibold">VIBE20</strong> for 20% off</span>
              <span className="hidden sm:inline"> · Free shipping above ₹999</span>
            </p>
          </div>
          <div className="hidden md:flex items-center gap-4 text-slate-400 text-xs">
            <button onClick={() => navigate('/about')} className="hover:text-white transition-colors">
              About
            </button>
            <span>·</span>
            <button onClick={() => navigate('/contact')} className="hover:text-white transition-colors">
              Support
            </button>
            {user?.role === 'admin' && (
              <>
                <span>·</span>
                <button
                  onClick={() => navigate('/admin')}
                  className="text-violet-400 hover:text-violet-300 font-semibold flex items-center gap-1"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Admin Console
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          {/* Mobile Menu Button */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 -ml-2 text-slate-700 hover:text-slate-900 focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Brand Logo */}
          <div className="flex items-center gap-8">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2.5 group focus:outline-none text-left"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-slate-900 via-indigo-950 to-violet-900 flex items-center justify-center text-white font-bold tracking-tighter shadow-md shadow-indigo-950/20 group-hover:scale-105 transition-transform">
                <span className="text-lg font-black bg-gradient-to-r from-violet-200 via-indigo-100 to-sky-300 bg-clip-text text-transparent">
                  VN
                </span>
              </div>
              <div className="flex flex-col">
                <span className="brand-font text-xl font-bold tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors">
                  Vibe-Nova
                </span>
                <span className="text-[10px] uppercase tracking-widest text-slate-500 font-medium -mt-1 hidden sm:block">
                  Marketplace
                </span>
              </div>
            </button>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-7">
              <button onClick={() => navigate('/')} className={navLinkClass('/')}>
                Home
              </button>
              <button onClick={() => navigate('/products')} className={navLinkClass('/products')}>
                Shop All
              </button>

              {/* Categories Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setIsCatDropdownOpen(true)}
                onMouseLeave={() => setIsCatDropdownOpen(false)}
              >
                <button
                  onClick={() => setIsCatDropdownOpen(!isCatDropdownOpen)}
                  className={`flex items-center gap-1.5 ${navLinkClass('/categories')}`}
                >
                  <span>Categories</span>
                  <ChevronDown className="w-4 h-4" />
                </button>

                {isCatDropdownOpen && (
                  <div className="absolute top-full left-0 w-64 pt-2 z-50">
                    <div className="bg-white rounded-xl shadow-xl border border-slate-200/90 py-2 animate-fade-in">
                      {categories.map(cat => (
                        <button
                          key={cat._id || cat.slug}
                          onClick={() => {
                            setIsCatDropdownOpen(false);
                            navigate(`/categories/${cat.slug}`);
                          }}
                          className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-indigo-600 flex items-center justify-between group"
                        >
                          <span className="font-medium">{cat.name}</span>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-transform" />
                        </button>
                      ))}
                      <div className="border-t border-slate-100 mt-1 pt-1">
                        <button
                          onClick={() => {
                            setIsCatDropdownOpen(false);
                            navigate('/products');
                          }}
                          className="w-full text-left px-4 py-2 text-xs font-semibold text-indigo-600 hover:bg-indigo-50/60"
                        >
                          View All Categories →
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={() => navigate('/products?newArrival=true')}
                className={`flex items-center gap-1.5 ${navLinkClass('/new-arrivals')}`}
              >
                <Sparkles className="w-3.5 h-3.5 text-violet-600" />
                <span>New Arrivals</span>
              </button>

              <button
                onClick={() => navigate('/products?bestSeller=true')}
                className={navLinkClass('/best-sellers')}
              >
                Best Sellers
              </button>
            </nav>
          </div>

          {/* Search, Wishlist, Cart & Account Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Search Bar (Desktop with Quick Results) */}
            <div className="relative hidden md:block" ref={searchRef}>
              <form onSubmit={handleSearchSubmit} className="relative">
                <input
                  type="text"
                  placeholder="Search audio, sneakers, decor..."
                  value={searchQuery}
                  onChange={e => {
                    setSearchQuery(e.target.value);
                    setIsSearchOpen(true);
                  }}
                  onFocus={() => setIsSearchOpen(true)}
                  className="w-48 xl:w-72 pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-100 hover:bg-slate-100/80 focus:bg-white text-slate-800 rounded-lg border border-transparent focus:border-indigo-500 focus:outline-none transition-all placeholder:text-slate-400"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </form>

              {/* Instant Search Results Dropdown */}
              {isSearchOpen && searchQuery.trim() && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-fade-in">
                  <div className="p-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500 font-medium">
                    <span>Products for "{searchQuery}"</span>
                    {isSearching && <span className="text-indigo-600">Searching...</span>}
                  </div>
                  <div className="max-h-72 overflow-y-auto">
                    {searchResults.length > 0 ? (
                      searchResults.map(p => (
                        <button
                          key={p._id || p.slug}
                          onClick={() => {
                            setIsSearchOpen(false);
                            setSearchQuery('');
                            navigate(`/products/${p.slug || p._id}`);
                          }}
                          className="w-full p-3 text-left hover:bg-slate-50 flex items-center gap-3 border-b border-slate-50 last:border-0 transition-colors"
                        >
                          <img
                            src={p.images[0]}
                            alt={p.name}
                            className="w-10 h-10 object-cover rounded-md bg-slate-100 flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-slate-900 truncate">{p.name}</p>
                            <p className="text-xs text-indigo-600 font-bold mt-0.5">₹{p.price.toLocaleString('en-IN')}</p>
                          </div>
                        </button>
                      ))
                    ) : (
                      !isSearching && (
                        <div className="p-4 text-center text-xs text-slate-500">
                          No products found matching "{searchQuery}".
                        </div>
                      )
                    )}
                  </div>
                  <button
                    onClick={handleSearchSubmit}
                    className="w-full py-2.5 bg-slate-50 hover:bg-indigo-50 text-indigo-600 text-xs font-semibold text-center border-t border-slate-100 transition-colors"
                  >
                    View all matching results →
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Search Icon Button */}
            <button
              onClick={() => navigate('/search')}
              className="md:hidden p-2 text-slate-700 hover:text-slate-900 focus:outline-none"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Wishlist Icon */}
            <button
              onClick={() => navigate('/account/wishlist')}
              className="relative p-2 text-slate-700 hover:text-rose-600 transition-colors focus:outline-none"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-rose-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Cart Icon with Live Count */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-slate-700 hover:text-indigo-600 transition-colors focus:outline-none"
              aria-label="Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-indigo-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </button>

            {/* User Account Dropdown */}
            <div className="relative">
              {user ? (
                <div>
                  <button
                    onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                    className="flex items-center gap-2 p-1 rounded-lg hover:bg-slate-100 transition-colors focus:outline-none"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 text-white font-bold text-xs flex items-center justify-center shadow-sm">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden xl:inline text-xs font-medium text-slate-800 max-w-[90px] truncate">
                      {user.name.split(' ')[0]}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
                  </button>

                  {isUserDropdownOpen && (
                    <div
                      className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-fade-in"
                      onMouseLeave={() => setIsUserDropdownOpen(false)}
                    >
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="text-xs font-semibold text-slate-900 truncate">{user.name}</p>
                        <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                      </div>

                      {user.role === 'admin' && (
                        <button
                          onClick={() => {
                            setIsUserDropdownOpen(false);
                            navigate('/admin');
                          }}
                          className="w-full text-left px-4 py-2 text-xs font-semibold text-violet-700 hover:bg-violet-50 flex items-center gap-2"
                        >
                          <ShieldCheck className="w-4 h-4 text-violet-600" />
                          Admin Console
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setIsUserDropdownOpen(false);
                          navigate('/account');
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                      >
                        <UserIcon className="w-4 h-4 text-slate-400" />
                        My Profile
                      </button>

                      <button
                        onClick={() => {
                          setIsUserDropdownOpen(false);
                          navigate('/account/orders');
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                      >
                        <Package className="w-4 h-4 text-slate-400" />
                        My Orders
                      </button>

                      <button
                        onClick={() => {
                          setIsUserDropdownOpen(false);
                          navigate('/account/wishlist');
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                      >
                        <Heart className="w-4 h-4 text-slate-400" />
                        Saved Wishlist
                      </button>

                      <div className="border-t border-slate-100 my-1"></div>

                      <button
                        onClick={async () => {
                          setIsUserDropdownOpen(false);
                          await logout();
                          navigate('/');
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-medium"
                      >
                        <LogOut className="w-4 h-4 text-rose-500" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigate('/login')}
                    className="text-xs font-semibold text-slate-700 hover:text-indigo-600 px-3 py-2 transition-colors"
                  >
                    Log In
                  </button>
                  <button
                    onClick={() => navigate('/register')}
                    className="hidden sm:inline-flex items-center justify-center text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 px-3.5 py-2 rounded-lg transition-colors shadow-sm"
                  >
                    Register
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-3 animate-fade-in shadow-lg">
          <div className="space-y-1">
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                navigate('/');
              }}
              className="w-full text-left py-2 text-sm font-semibold text-slate-900"
            >
              Home
            </button>
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                navigate('/products');
              }}
              className="w-full text-left py-2 text-sm font-medium text-slate-700"
            >
              Shop All Products
            </button>
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                navigate('/products?newArrival=true');
              }}
              className="w-full text-left py-2 text-sm font-medium text-slate-700"
            >
              New Arrivals
            </button>
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                navigate('/products?bestSeller=true');
              }}
              className="w-full text-left py-2 text-sm font-medium text-slate-700"
            >
              Best Sellers
            </button>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">Categories</p>
            <div className="grid grid-cols-2 gap-2">
              {categories.map(c => (
                <button
                  key={c.slug}
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    navigate(`/categories/${c.slug}`);
                  }}
                  className="text-left text-xs text-slate-600 hover:text-indigo-600 py-1"
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          {!user && (
            <div className="pt-3 border-t border-slate-100 flex gap-2">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  navigate('/login');
                }}
                className="flex-1 py-2 text-xs font-semibold text-slate-900 border border-slate-200 rounded-lg text-center"
              >
                Log In
              </button>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  navigate('/register');
                }}
                className="flex-1 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg text-center"
              >
                Register
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
