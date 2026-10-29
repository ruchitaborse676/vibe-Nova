import React from 'react';
import { Heart, Star, ShoppingBag, Check } from 'lucide-react';
import { Product } from '../../types/index.js';
import { useWishlist } from '../../contexts/WishlistContext.js';
import { useCart } from '../../contexts/CartContext.js';

interface ProductCardProps {
  product: Product;
  navigate: (path: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, navigate }) => {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [isAdding, setIsAdding] = React.useState(false);
  const [justAdded, setJustAdded] = React.useState(false);

  const isFavorited = isInWishlist(product._id || product.id || '');
  const discountPercent =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
      : null;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.stock <= 0) return;

    setIsAdding(true);
    // If it has multiple variants, navigate to detail page to let them choose
    if (product.variants && product.variants.length > 1) {
      navigate(`/products/${product.slug || product._id}`);
      setIsAdding(false);
      return;
    }

    const defaultVariant = product.variants && product.variants.length > 0 ? product.variants[0] : undefined;
    const res = await addToCart(product, 1, defaultVariant);
    setIsAdding(false);

    if (res.success) {
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 2000);
    }
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(product._id || product.id || '');
  };

  return (
    <div
      onClick={() => navigate(`/products/${product.slug || product._id}`)}
      className="group bg-white rounded-2xl border border-slate-200/80 hover:border-slate-300 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 flex flex-col overflow-hidden cursor-pointer"
    >
      {/* Product Image Container */}
      <div className="relative aspect-square w-full overflow-hidden bg-slate-100">
        <img
          src={product.images[0]}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
        />

        {/* Sale Tag - Minimal Rectangular Flag */}
        {discountPercent && (
          <div className="absolute top-3 left-3 bg-slate-900 text-white text-[10px] font-bold tracking-wider px-2 py-0.5 uppercase shadow-sm">
            {discountPercent}% OFF
          </div>
        )}

        {/* Wishlist Heart Button */}
        <button
          onClick={handleWishlist}
          className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
            isFavorited
              ? 'bg-rose-50 text-rose-600 shadow-sm'
              : 'bg-white/90 text-slate-500 hover:text-rose-600 hover:bg-white shadow-sm'
          }`}
          aria-label={isFavorited ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart className={`w-4 h-4 ${isFavorited ? 'fill-rose-600' : ''}`} />
        </button>

        {/* Stock Out Alert */}
        {product.stock <= 0 && (
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[1px] flex items-center justify-center">
            <span className="bg-white/95 text-slate-900 text-xs font-bold px-3 py-1 uppercase tracking-wider rounded-md">
              Sold Out
            </span>
          </div>
        )}
      </div>

      {/* Details Container */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Category & Rating - Zero Pill Discipline */}
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5 font-medium">
            <span className="tracking-wide uppercase text-[11px] text-indigo-600 font-semibold">
              {product.categoryName || 'Curated'}
            </span>
            <div className="flex items-center gap-1 text-slate-700">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="font-semibold text-xs">{product.rating}</span>
              <span className="text-slate-400 text-[11px]">({product.reviewCount})</span>
            </div>
          </div>

          {/* Product Name */}
          <h3 className="text-sm font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2 leading-snug">
            {product.name}
          </h3>
        </div>

        {/* Pricing and Action */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-bold text-slate-900">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
              {product.compareAtPrice && product.compareAtPrice > product.price && (
                <span className="text-xs text-slate-400 line-through">
                  ₹{product.compareAtPrice.toLocaleString('en-IN')}
                </span>
              )}
            </div>
            {product.stock > 0 && product.stock <= 5 && (
              <span className="text-[10px] text-amber-700 font-semibold mt-0.5">
                Only {product.stock} left in stock
              </span>
            )}
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={product.stock <= 0 || isAdding}
            className={`p-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1 ${
              justAdded
                ? 'bg-emerald-600 text-white'
                : product.stock <= 0
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-slate-900 hover:bg-indigo-600 text-white shadow-sm hover:shadow'
            }`}
            title="Add to cart"
          >
            {justAdded ? (
              <Check className="w-4 h-4" />
            ) : (
              <ShoppingBag className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
