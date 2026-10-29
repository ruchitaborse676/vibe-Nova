import React, { useState, useEffect } from 'react';
import {
  Star, Heart, ShoppingBag, Truck, RefreshCw, ShieldCheck, Check,
  Minus, Plus, ArrowLeft, Share2, AlertCircle, Sparkles
} from 'lucide-react';
import { Product } from '../types/index.js';
import { api } from '../services/api.js';
import { useCart } from '../contexts/CartContext.js';
import { useWishlist } from '../contexts/WishlistContext.js';
import { ProductCard } from '../components/common/ProductCard.js';

interface ProductDetailPageProps {
  productIdOrSlug: string;
  navigate: (path: string) => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ productIdOrSlug, navigate }) => {
  const { addToCart, setIsCartOpen } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    async function loadProduct() {
      setLoading(true);
      try {
        const res = await api.getProduct(productIdOrSlug);
        if (res.success && res.product) {
          setProduct(res.product);
          setSelectedImage(0);
          setQuantity(1);
          if (res.product.variants && res.product.variants.length > 0) {
            setSelectedVariant(res.product.variants[0]);
          }

          // Fetch related products in the same category
          api.getProducts({ category: res.product.categoryId, limit: 4 })
            .then(relRes => {
              if (relRes.success) {
                setRelatedProducts(relRes.products.filter(p => (p._id || p.id) !== (res.product._id || res.product.id)));
              }
            })
            .catch(() => {});
        }
      } catch (err) {
        console.error('Failed to load product details', err);
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [productIdOrSlug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-pulse">
          <div className="aspect-square bg-slate-200 rounded-3xl" />
          <div className="space-y-4">
            <div className="h-8 bg-slate-200 rounded w-3/4" />
            <div className="h-6 bg-slate-200 rounded w-1/4" />
            <div className="h-32 bg-slate-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-900 mb-2">Product Not Found</h2>
        <p className="text-sm text-slate-500 mb-6">
          The requested item may have been discontinued or moved.
        </p>
        <button
          onClick={() => navigate('/products')}
          className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-semibold"
        >
          Return to Catalog
        </button>
      </div>
    );
  }

  const isFavorited = isInWishlist(product._id || product.id || '');
  const discountPercent =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
      : null;

  const handleAddToCart = async () => {
    if (product.stock < quantity) {
      setActionFeedback(`Only ${product.stock} items currently in stock.`);
      return;
    }

    const res = await addToCart(product, quantity, selectedVariant);
    if (res.success) {
      setActionFeedback('Added to cart!');
      setTimeout(() => setActionFeedback(null), 3000);
    } else {
      setActionFeedback(res.error || 'Failed to add item');
    }
  };

  const handleBuyNow = async () => {
    if (product.stock < quantity) {
      setActionFeedback(`Only ${product.stock} items currently in stock.`);
      return;
    }

    const res = await addToCart(product, quantity, selectedVariant);
    if (res.success) {
      setIsCartOpen(false);
      navigate('/checkout');
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-16">
      {/* Back button & Breadcrumb */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/products')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Catalog</span>
        </button>

        <button
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-indigo-600 transition-colors"
        >
          <Share2 className="w-4 h-4" />
          <span>{copiedLink ? 'Link Copied!' : 'Share Product'}</span>
        </button>
      </div>

      {/* Main Product Info Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left: Gallery */}
        <div className="lg:col-span-6 space-y-4">
          <div className="relative aspect-square w-full rounded-3xl overflow-hidden bg-slate-100 border border-slate-200/80 shadow-md">
            <img
              src={product.images[selectedImage] || product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover object-center transition-all duration-300"
            />
            {discountPercent && (
              <div className="absolute top-4 left-4 bg-slate-900 text-white text-xs font-bold px-3 py-1 uppercase tracking-wider rounded-md">
                {discountPercent}% OFF
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${
                    selectedImage === idx ? 'border-indigo-600 ring-2 ring-indigo-600/20' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Details & Actions */}
        <div className="lg:col-span-6 space-y-6">
          {/* Category & Rating */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-medium text-slate-500">
              <span className="uppercase tracking-widest text-indigo-600 font-bold">
                {product.categoryName || 'Curated'}
              </span>
              <span className="text-slate-400">SKU: {product.sku}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 brand-font leading-tight">
              {product.name}
            </h1>

            <div className="flex items-center gap-3 pt-1">
              <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded text-xs font-bold text-amber-700">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{product.rating}</span>
              </div>
              <span className="text-xs text-slate-500">
                Based on <strong className="text-slate-700">{product.reviewCount}</strong> verified customer reviews
              </span>
            </div>
          </div>

          {/* Price & Stock Status */}
          <div className="py-4 border-y border-slate-200 flex items-baseline justify-between">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-black text-slate-900">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
              {product.compareAtPrice && product.compareAtPrice > product.price && (
                <span className="text-base text-slate-400 line-through">
                  ₹{product.compareAtPrice.toLocaleString('en-IN')}
                </span>
              )}
            </div>

            {/* Stock status indicator */}
            <div>
              {product.stock > 10 ? (
                <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  In Stock & Ready to Ship
                </span>
              ) : product.stock > 0 ? (
                <span className="text-xs font-bold text-amber-600 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  Only {product.stock} items remaining
                </span>
              ) : (
                <span className="text-xs font-bold text-rose-600">
                  Currently Out of Stock
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-slate-600 leading-relaxed">
            {product.description}
          </p>

          {/* Variants Selection (if any) */}
          {product.variants && product.variants.length > 0 && (
            <div className="space-y-3 pt-2">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                Select Edition / Variant
              </label>
              <div className="flex flex-wrap gap-2.5">
                {product.variants.map(variant => (
                  <button
                    key={variant.id}
                    onClick={() => setSelectedVariant(variant)}
                    className={`px-3.5 py-2 text-xs font-semibold rounded-xl border transition-all ${
                      selectedVariant?.id === variant.id
                        ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                    }`}
                  >
                    <span>{variant.name}</span>
                    <span className="text-slate-400 ml-1.5 text-[11px]">({variant.stock} left)</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity Selector & Action Buttons */}
          <div className="space-y-4 pt-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                <button
                  onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                  className="p-2.5 hover:bg-white text-slate-700 transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center text-sm font-bold text-slate-900">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(prev => Math.min(product.stock, prev + 1))}
                  className="p-2.5 hover:bg-white text-slate-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Add to Wishlist Toggle */}
              <button
                onClick={() => toggleWishlist(product._id || product.id || '')}
                className={`p-3 rounded-xl border transition-all flex items-center justify-center ${
                  isFavorited
                    ? 'border-rose-200 bg-rose-50 text-rose-600'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:text-rose-600'
                }`}
                title="Wishlist"
              >
                <Heart className={`w-5 h-5 ${isFavorited ? 'fill-rose-600' : ''}`} />
              </button>
            </div>

            {/* Main Primary Action CTAs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                className="py-3.5 px-6 rounded-xl font-bold text-xs sm:text-sm bg-white border border-slate-900 text-slate-900 hover:bg-slate-50 transition-all flex items-center justify-center gap-2 shadow-xs disabled:opacity-50"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add to Cart</span>
              </button>

              <button
                onClick={handleBuyNow}
                disabled={product.stock <= 0}
                className="py-3.5 px-6 rounded-xl font-bold text-xs sm:text-sm bg-slate-900 text-white hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-md shadow-slate-950/20 disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4 text-violet-300" />
                <span>Buy Now</span>
              </button>
            </div>

            {actionFeedback && (
              <p className="text-xs text-indigo-600 font-semibold animate-fade-in">
                {actionFeedback}
              </p>
            )}
          </div>

          {/* Shipping & Assurance Features */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 text-xs text-slate-600">
            <div className="flex items-center gap-3">
              <Truck className="w-4 h-4 text-indigo-600 flex-shrink-0" />
              <span><strong>Free Delivery:</strong> Dispatched in 24 hours. Delivered across India in 2-4 business days.</span>
            </div>
            <div className="flex items-center gap-3">
              <RefreshCw className="w-4 h-4 text-indigo-600 flex-shrink-0" />
              <span><strong>7-Day Returns:</strong> If you're not completely satisfied, exchange or return with zero fee.</span>
            </div>
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-4 h-4 text-indigo-600 flex-shrink-0" />
              <span><strong>Quality Inspected:</strong> Includes official 1-year Vibe-Nova assurance warranty.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Specifications Table */}
      {product.specifications && Object.keys(product.specifications).length > 0 && (
        <div className="pt-8 border-t border-slate-200 space-y-4">
          <h3 className="text-lg font-bold text-slate-900">Technical Specifications</h3>
          <div className="max-w-2xl bg-white rounded-2xl border border-slate-200 overflow-hidden divide-y divide-slate-100">
            {Object.entries(product.specifications).map(([key, value]) => (
              <div key={key} className="grid grid-cols-2 p-3.5 text-xs">
                <span className="font-semibold text-slate-600">{key}</span>
                <span className="text-slate-900 font-medium">{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <div className="pt-12 border-t border-slate-200 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-900">You May Also Like</h3>
            <button
              onClick={() => navigate('/products')}
              className="text-xs font-semibold text-indigo-600 hover:underline"
            >
              View all
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.map(rel => (
              <ProductCard key={rel._id || rel.slug} product={rel} navigate={navigate} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
