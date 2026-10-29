import React, { useState, useEffect } from 'react';
import {
  User as UserIcon, Package, MapPin, Heart, LogOut, Plus, Trash2,
  CheckCircle2, Clock, Truck, ShieldAlert, ArrowRight, ExternalLink, X
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.js';
import { useWishlist } from '../contexts/WishlistContext.js';
import { useCart } from '../contexts/CartContext.js';
import { api } from '../services/api.js';
import { Order, Product, Address } from '../types/index.js';
import { ProductCard } from '../components/common/ProductCard.js';

interface AccountPageProps {
  navigate: (path: string) => void;
  tab?: 'profile' | 'orders' | 'addresses' | 'wishlist';
  orderId?: string;
}

export const AccountPage: React.FC<AccountPageProps> = ({ navigate, tab = 'profile', orderId }) => {
  const { user, logout, updateProfile, addAddress, deleteAddress } = useAuth();
  const { wishlistIds } = useWishlist();
  const { addToCart } = useCart();

  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'addresses' | 'wishlist'>(tab);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadingWishlist, setLoadingWishlist] = useState(false);

  // Profile edit state
  const [editName, setEditName] = useState(user?.name || '');
  const [editPhone, setEditPhone] = useState(user?.phone || '');
  const [profileMsg, setProfileMsg] = useState<string | null>(null);

  // New address state
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [newAddr, setNewAddr] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '',
    street: '',
    apartment: '',
    city: 'Bengaluru',
    state: 'Karnataka',
    postalCode: '',
    country: 'India',
    isDefault: false,
  });

  useEffect(() => {
    setActiveTab(tab);
  }, [tab]);

  useEffect(() => {
    if (user) {
      setEditName(user.name);
      setEditPhone(user.phone || '');
    }
  }, [user]);

  // Load orders
  useEffect(() => {
    if (activeTab === 'orders' || orderId) {
      setLoadingOrders(true);
      api.getOrders()
        .then(res => {
          if (res.success) {
            setOrders(res.orders);
            if (orderId) {
              const matched = res.orders.find(o => (o._id || o.id || o.orderNumber) === orderId);
              if (matched) setSelectedOrder(matched);
            }
          }
        })
        .finally(() => setLoadingOrders(false));
    }
  }, [activeTab, orderId]);

  // Load wishlist products
  useEffect(() => {
    if (activeTab === 'wishlist' && wishlistIds.length > 0) {
      setLoadingWishlist(true);
      Promise.all(wishlistIds.map(id => api.getProduct(id).then(r => r.product).catch(() => null)))
        .then(prods => {
          setWishlistProducts(prods.filter(Boolean) as Product[]);
        })
        .finally(() => setLoadingWishlist(false));
    } else if (wishlistIds.length === 0) {
      setWishlistProducts([]);
    }
  }, [activeTab, wishlistIds]);

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Sign In Required</h2>
        <p className="text-xs text-slate-500">Please log in to manage your profile and view past orders.</p>
        <button
          onClick={() => navigate('/login')}
          className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-semibold"
        >
          Sign In
        </button>
      </div>
    );
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await updateProfile(editName, editPhone);
    if (res.success) {
      setProfileMsg('Profile updated successfully!');
      setTimeout(() => setProfileMsg(null), 3000);
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddr.fullName || !newAddr.street || !newAddr.city || !newAddr.postalCode) return;
    await addAddress(newAddr);
    setIsAddingAddress(false);
    setNewAddr({
      fullName: user.name,
      phone: user.phone || '',
      street: '',
      apartment: '',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '',
      country: 'India',
      isDefault: false,
    });
  };

  const handleCancelOrder = async (id: string) => {
    if (!window.confirm('Are you sure you want to cancel this order? Stock will be restored.')) return;
    try {
      const res = await api.cancelOrder(id);
      if (res.success && res.order) {
        setOrders(prev => prev.map(o => ((o._id || o.id) === id ? res.order : o)));
        if (selectedOrder && (selectedOrder._id || selectedOrder.id) === id) {
          setSelectedOrder(res.order);
        }
      }
    } catch (err: any) {
      alert(err.message || 'Cannot cancel order.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Account Header */}
      <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-600 text-white font-black text-2xl flex items-center justify-center shadow-lg">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold brand-font">{user.name}</h1>
            <p className="text-xs text-slate-300 font-mono mt-0.5">{user.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {user.role === 'admin' && (
            <button
              onClick={() => navigate('/admin')}
              className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold rounded-xl transition-colors shadow-sm"
            >
              Open Admin Console
            </button>
          )}
          <button
            onClick={async () => {
              await logout();
              navigate('/');
            }}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Account Navigation Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto gap-8 text-xs sm:text-sm font-semibold">
        <button
          onClick={() => {
            setActiveTab('profile');
            setSelectedOrder(null);
          }}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'profile'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <UserIcon className="w-4 h-4" />
          <span>Profile Details</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('orders');
            setSelectedOrder(null);
          }}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'orders'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>My Orders</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('addresses');
            setSelectedOrder(null);
          }}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'addresses'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Saved Addresses</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('wishlist');
            setSelectedOrder(null);
          }}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'wishlist'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Heart className="w-4 h-4" />
          <span>Wishlist ({wishlistIds.length})</span>
        </button>
      </div>

      {/* Tab 1: Profile */}
      {activeTab === 'profile' && (
        <div className="max-w-xl bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100">
            Edit Personal Profile
          </h2>

          {profileMsg && (
            <div className="p-3 bg-emerald-50 text-emerald-700 text-xs rounded-lg flex items-center gap-1.5 font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              <span>{profileMsg}</span>
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Full Name</label>
              <input
                type="text"
                value={editName}
                onChange={e => setEditName(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Email Address (Read-only)</label>
              <input
                type="email"
                disabled
                value={user.email}
                className="w-full px-3.5 py-2 text-xs bg-slate-100 border border-slate-200 rounded-lg text-slate-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Phone Number</label>
              <input
                type="tel"
                value={editPhone}
                onChange={e => setEditPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
              />
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
            >
              Save Profile Changes
            </button>
          </form>
        </div>
      )}

      {/* Tab 2: Orders */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          {selectedOrder ? (
            /* Individual Order Detail View */
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <div>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="text-xs font-semibold text-indigo-600 hover:underline mb-1 block"
                  >
                    ← Back to all orders
                  </button>
                  <h2 className="text-lg font-bold text-slate-900 font-mono">
                    Order {selectedOrder.orderNumber}
                  </h2>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 rounded-full text-xs font-bold capitalize bg-indigo-50 text-indigo-700">
                    Status: {selectedOrder.orderStatus}
                  </span>
                  {['pending', 'confirmed', 'processing'].includes(selectedOrder.orderStatus) && (
                    <button
                      onClick={() => handleCancelOrder(selectedOrder._id || selectedOrder.id || '')}
                      className="text-xs text-rose-600 font-semibold hover:underline"
                    >
                      Cancel Order
                    </button>
                  )}
                </div>
              </div>

              {/* Status Timeline */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3">
                  Order Timeline
                </h4>
                <div className="space-y-3">
                  {(selectedOrder.statusHistory || []).map((h, idx) => (
                    <div key={idx} className="flex items-start gap-3 text-xs">
                      <div className="w-2 h-2 rounded-full bg-indigo-600 mt-1.5" />
                      <div>
                        <p className="font-bold text-slate-900 capitalize">{h.status}</p>
                        <p className="text-[11px] text-slate-500">
                          {new Date(h.timestamp).toLocaleString('en-IN')} {h.note ? `· ${h.note}` : ''}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Items List */}
              <div className="divide-y divide-slate-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Items</h3>
                {selectedOrder.items.map((it, idx) => (
                  <div key={idx} className="py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img src={it.image} alt="" className="w-12 h-12 object-cover rounded-lg bg-slate-100" />
                      <div>
                        <p className="text-xs font-semibold text-slate-900">{it.name}</p>
                        <p className="text-[11px] text-slate-500">Qty: {it.quantity} × ₹{it.price.toLocaleString('en-IN')}</p>
                      </div>
                    </div>
                    <p className="text-xs font-bold text-slate-900">₹{it.lineTotal.toLocaleString('en-IN')}</p>
                  </div>
                ))}
              </div>

              {/* Cost summary */}
              <div className="pt-4 border-t border-slate-200 flex justify-between items-center text-sm">
                <span className="text-slate-600">Total Paid Amount:</span>
                <span className="font-black text-indigo-600 text-lg">₹{selectedOrder.finalTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>
          ) : (
            /* Orders Table */
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
              {loadingOrders ? (
                <div className="p-8 text-center text-xs text-slate-500 animate-pulse">Loading order history...</div>
              ) : orders.length === 0 ? (
                <div className="p-12 text-center space-y-3">
                  <Package className="w-10 h-10 text-slate-400 mx-auto" />
                  <p className="text-sm font-bold text-slate-900">No orders placed yet</p>
                  <p className="text-xs text-slate-500">When you place orders, they will appear here with live tracking.</p>
                  <button
                    onClick={() => navigate('/products')}
                    className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold mt-2"
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {orders.map(o => (
                    <div
                      key={o._id || o.id}
                      onClick={() => setSelectedOrder(o)}
                      className="p-4 sm:p-6 hover:bg-slate-50/80 transition-colors cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                    >
                      <div className="flex gap-4 items-center">
                        <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0 font-bold">
                          <Package className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900 font-mono">{o.orderNumber}</p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {new Date(o.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}{' '}
                            · {o.items.length} {o.items.length === 1 ? 'item' : 'items'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 self-end sm:self-auto">
                        <div className="text-right">
                          <p className="text-sm font-black text-slate-900">₹{o.finalTotal.toLocaleString('en-IN')}</p>
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                            o.orderStatus === 'cancelled'
                              ? 'bg-rose-50 text-rose-700'
                              : o.orderStatus === 'delivered'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-indigo-50 text-indigo-700'
                          }`}>
                            {o.orderStatus}
                          </span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Addresses */}
      {activeTab === 'addresses' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Your Delivery Addresses</h2>
            <button
              onClick={() => setIsAddingAddress(!isAddingAddress)}
              className="px-3.5 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New Address</span>
            </button>
          </div>

          {/* New address form */}
          {isAddingAddress && (
            <form onSubmit={handleAddAddress} className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4 max-w-xl">
              <h3 className="text-sm font-bold text-slate-900">New Address Information</h3>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  required
                  placeholder="Recipient Name"
                  value={newAddr.fullName}
                  onChange={e => setNewAddr({ ...newAddr, fullName: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                />
                <input
                  type="tel"
                  required
                  placeholder="Phone"
                  value={newAddr.phone}
                  onChange={e => setNewAddr({ ...newAddr, phone: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>
              <input
                type="text"
                required
                placeholder="Street address / House no"
                value={newAddr.street}
                onChange={e => setNewAddr({ ...newAddr, street: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
              />
              <input
                type="text"
                placeholder="Apartment / Landmark"
                value={newAddr.apartment}
                onChange={e => setNewAddr({ ...newAddr, apartment: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
              />
              <div className="grid grid-cols-3 gap-3">
                <input
                  type="text"
                  required
                  placeholder="City"
                  value={newAddr.city}
                  onChange={e => setNewAddr({ ...newAddr, city: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                />
                <input
                  type="text"
                  required
                  placeholder="State"
                  value={newAddr.state}
                  onChange={e => setNewAddr({ ...newAddr, state: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                />
                <input
                  type="text"
                  required
                  placeholder="Postal Code"
                  value={newAddr.postalCode}
                  onChange={e => setNewAddr({ ...newAddr, postalCode: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold"
                >
                  Save Address
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddingAddress(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg text-xs"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* List addresses */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {user.addresses?.map((addr, idx) => (
              <div key={addr.id || idx} className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm text-slate-900">{addr.fullName}</span>
                    {addr.isDefault && (
                      <span className="text-[10px] font-bold text-indigo-600 uppercase bg-indigo-50 px-2 py-0.5 rounded">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {addr.street} {addr.apartment ? `, ${addr.apartment}` : ''}
                    <br />
                    {addr.city}, {addr.state} - {addr.postalCode}
                    <br />
                    Phone: {addr.phone}
                  </p>
                </div>
                <div className="pt-4 mt-2 border-t border-slate-100 flex justify-end">
                  <button
                    onClick={() => deleteAddress(addr.id || '')}
                    className="text-xs text-rose-600 hover:underline flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Wishlist */}
      {activeTab === 'wishlist' && (
        <div className="space-y-6">
          <h2 className="text-base font-bold text-slate-900">Saved Wishlist Items</h2>
          {loadingWishlist ? (
            <div className="p-8 text-center text-xs text-slate-500 animate-pulse">Loading wishlist items...</div>
          ) : wishlistProducts.length === 0 ? (
            <div className="p-12 bg-white rounded-2xl border border-slate-200 text-center space-y-3">
              <Heart className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-900">Your wishlist is empty</p>
              <p className="text-xs text-slate-500">Tap the heart icon on any product to save it here for later.</p>
              <button
                onClick={() => navigate('/products')}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold"
              >
                Browse Catalog
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
              {wishlistProducts.map(p => (
                <ProductCard key={p._id || p.slug} product={p} navigate={navigate} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
