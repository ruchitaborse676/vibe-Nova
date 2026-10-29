import React, { useState, useEffect } from 'react';
import {
  ShieldCheck, Package, ShoppingBag, Users, DollarSign, Database,
  Plus, Edit, Trash2, RefreshCw, CheckCircle2, AlertCircle, Search, Filter, ArrowUpRight
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.js';
import { api } from '../services/api.js';
import { DashboardMetrics, Product, Order, Category } from '../types/index.js';

interface AdminDashboardPageProps {
  navigate: (path: string) => void;
  subtab?: 'overview' | 'products' | 'orders' | 'customers' | 'system';
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ navigate, subtab = 'overview' }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'customers' | 'system'>(subtab);

  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [dbInfo, setDbInfo] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Product edit/create modal state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [productForm, setProductForm] = useState({
    name: '',
    price: 999,
    compareAtPrice: 1499,
    stock: 20,
    categoryId: 'cat_electronics',
    categoryName: 'Electronics',
    description: '',
    sku: '',
    images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=80'],
  });

  // Action status message
  const [bannerMsg, setBannerMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    setActiveTab(subtab);
  }, [subtab]);

  // Authorization check
  if (!user || user.role !== 'admin') {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center space-y-4">
        <ShieldCheck className="w-12 h-12 text-rose-600 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">Access Restricted</h2>
        <p className="text-xs text-slate-500">
          Administrator privileges are required to view the management console.
        </p>
        <button
          onClick={() => navigate('/login')}
          className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-semibold"
        >
          Sign In with Admin Account
        </button>
      </div>
    );
  }

  const loadAllAdminData = async () => {
    setLoading(true);
    try {
      const [dashRes, prodRes, ordRes, catRes, custRes] = await Promise.all([
        api.getAdminDashboard(),
        api.getProducts({ limit: 100 }),
        api.getAdminOrders(),
        api.getCategories(),
        api.getAdminCustomers(),
      ]);

      if (dashRes.success) {
        setMetrics(dashRes.metrics);
        setDbInfo(dashRes.dbInfo);
      }
      if (prodRes.success) setProducts(prodRes.products);
      if (ordRes.success) setOrders(ordRes.orders);
      if (catRes.success) setCategories(catRes.categories);
      if (custRes.success) setCustomers(custRes.customers);
    } catch (err: any) {
      setBannerMsg({ type: 'error', text: err.message || 'Error loading admin data' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllAdminData();
  }, []);

  const handleOpenCreateProduct = () => {
    setEditingProductId(null);
    setProductForm({
      name: '',
      price: 1999,
      compareAtPrice: 2499,
      stock: 25,
      categoryId: categories[0]?.slug || 'cat_electronics',
      categoryName: categories[0]?.name || 'Electronics',
      description: '',
      sku: `VN-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=80'],
    });
    setIsProductModalOpen(true);
  };

  const handleOpenEditProduct = (prod: Product) => {
    setEditingProductId(prod._id || prod.id || '');
    setProductForm({
      name: prod.name,
      price: prod.price,
      compareAtPrice: prod.compareAtPrice || 0,
      stock: prod.stock,
      categoryId: prod.categoryId,
      categoryName: prod.categoryName || '',
      description: prod.description,
      sku: prod.sku,
      images: prod.images || [],
    });
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProductId) {
        const res = await api.updateAdminProduct(editingProductId, productForm);
        if (res.success) {
          setBannerMsg({ type: 'success', text: 'Product updated successfully.' });
        }
      } else {
        const res = await api.createAdminProduct(productForm);
        if (res.success) {
          setBannerMsg({ type: 'success', text: 'Product created and added to catalog.' });
        }
      }
      setIsProductModalOpen(false);
      loadAllAdminData();
    } catch (err: any) {
      setBannerMsg({ type: 'error', text: err.message || 'Product save failed.' });
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to permanently remove "${name}"?`)) return;
    try {
      await api.deleteAdminProduct(id);
      setBannerMsg({ type: 'success', text: `Product "${name}" deleted.` });
      loadAllAdminData();
    } catch (err: any) {
      setBannerMsg({ type: 'error', text: err.message || 'Delete failed.' });
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await api.updateAdminOrder(orderId, newStatus, `Updated by admin: ${user.name}`);
      if (res.success) {
        setBannerMsg({ type: 'success', text: `Order status set to ${newStatus}.` });
        loadAllAdminData();
      }
    } catch (err: any) {
      setBannerMsg({ type: 'error', text: err.message || 'Status transition failed.' });
    }
  };

  const handleResetSeed = async () => {
    if (!window.confirm('Reset and re-seed all sample products, categories, coupons, and orders?')) return;
    try {
      const res = await api.resetAdminSeed();
      setBannerMsg({ type: 'success', text: res.message });
      loadAllAdminData();
    } catch (err: any) {
      setBannerMsg({ type: 'error', text: err.message || 'Seed reset failed.' });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Top Banner & Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-violet-700 text-xs font-bold uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Administrator Control Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 brand-font">
            Vibe-Nova Marketplace Ops
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadAllAdminData}
            className="px-3.5 py-2 text-xs font-semibold bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1.5 text-slate-700"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
          <button
            onClick={handleOpenCreateProduct}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {bannerMsg && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center justify-between animate-fade-in ${
            bannerMsg.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {bannerMsg.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600" />
            )}
            <span>{bannerMsg.text}</span>
          </div>
          <button onClick={() => setBannerMsg(null)} className="text-xs font-bold underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Navigation Subtabs */}
      <div className="flex border-b border-slate-200 gap-8 text-xs sm:text-sm font-semibold overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'overview'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <span>Dashboard Overview</span>
        </button>

        <button
          onClick={() => setActiveTab('products')}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'products'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <span>Product Catalog ({products.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'orders'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <span>Orders Management ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('customers')}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'customers'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <span>Customers</span>
        </button>

        <button
          onClick={() => setActiveTab('system')}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'system'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <span>Database & Persistence</span>
        </button>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Key Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
              <span className="text-xs font-semibold text-slate-500">Gross Sales</span>
              <p className="text-2xl font-black text-slate-900">
                ₹{(metrics?.totalRevenue || 0).toLocaleString('en-IN')}
              </p>
              <span className="text-[10px] text-emerald-600 font-bold block pt-1">Calculated from verified orders</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
              <span className="text-xs font-semibold text-slate-500">Total Orders</span>
              <p className="text-2xl font-black text-slate-900">{metrics?.totalOrders || 0}</p>
              <span className="text-[10px] text-slate-500 font-medium block pt-1">All time orders</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
              <span className="text-xs font-semibold text-slate-500">Pending Fulfillment</span>
              <p className="text-2xl font-black text-amber-600">{metrics?.pendingOrders || 0}</p>
              <span className="text-[10px] text-amber-700 font-bold block pt-1">Needs packing / dispatch</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
              <span className="text-xs font-semibold text-slate-500">Catalog SKUs</span>
              <p className="text-2xl font-black text-slate-900">{metrics?.totalProducts || 0}</p>
              <span className="text-[10px] text-slate-500 font-medium block pt-1">Active products</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1 col-span-2 lg:col-span-1">
              <span className="text-xs font-semibold text-slate-500">Registered Customers</span>
              <p className="text-2xl font-black text-indigo-600">{metrics?.totalCustomers || 1}</p>
              <span className="text-[10px] text-slate-500 font-medium block pt-1">Accounts active</span>
            </div>
          </div>

          {/* Database Health Pill */}
          <div className="p-4 bg-slate-900 text-white rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Database className="w-5 h-5 text-indigo-400" />
              <div>
                <p className="text-xs font-bold text-slate-200">Database Engine State:</p>
                <p className="text-sm font-semibold text-white">{dbInfo?.engine || 'Active Data Engine'}</p>
              </div>
            </div>
            <div className="text-xs text-slate-300">
              <span className="text-slate-400">Connection string: </span>
              <span className="font-mono text-violet-300">{dbInfo?.maskedUri}</span>
            </div>
          </div>

          {/* Recent Orders Overview */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Recent Customer Orders</h3>
              <button
                onClick={() => setActiveTab('orders')}
                className="text-xs font-semibold text-indigo-600 hover:underline"
              >
                View all orders →
              </button>
            </div>

            <div className="divide-y divide-slate-100 overflow-x-auto">
              {(metrics?.recentOrders || []).map(ord => (
                <div key={ord._id || ord.id} className="py-3 flex items-center justify-between min-w-[500px] text-xs">
                  <div>
                    <span className="font-mono font-bold text-slate-900">{ord.orderNumber}</span>
                    <span className="text-slate-500 ml-2">by {ord.userName || ord.userEmail}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-black text-slate-900">₹{ord.finalTotal.toLocaleString('en-IN')}</span>
                    <span className="capitalize px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                      {ord.orderStatus}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Products Management */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Live Product Inventory</h2>
            <button
              onClick={handleOpenCreateProduct}
              className="px-3.5 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Create Product</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-x-auto">
            <table className="w-full text-left text-xs divide-y divide-slate-100 min-w-[700px]">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-4">Product</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Stock</th>
                  <th className="p-4">SKU</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map(p => (
                  <tr key={p._id || p.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-4 flex items-center gap-3">
                      <img src={p.images[0]} alt="" className="w-10 h-10 object-cover rounded-lg bg-slate-100" />
                      <div>
                        <p className="font-bold text-slate-900">{p.name}</p>
                        <p className="text-[11px] text-slate-500">Rating: {p.rating} ★ ({p.reviewCount})</p>
                      </div>
                    </td>
                    <td className="p-4 font-medium text-slate-600">{p.categoryName || p.categoryId}</td>
                    <td className="p-4 font-bold text-slate-900">₹{p.price.toLocaleString('en-IN')}</td>
                    <td className="p-4">
                      <span className={`font-semibold ${p.stock <= 5 ? 'text-rose-600' : 'text-slate-700'}`}>
                        {p.stock} units
                      </span>
                    </td>
                    <td className="p-4 font-mono text-[11px] text-slate-500">{p.sku}</td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEditProduct(p)}
                        className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(p._id || p.id || '', p.name)}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Orders Management */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          <h2 className="text-base font-bold text-slate-900">All Customer Orders ({orders.length})</h2>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-x-auto">
            <table className="w-full text-left text-xs divide-y divide-slate-100 min-w-[800px]">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-4">Order #</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Total</th>
                  <th className="p-4">Payment</th>
                  <th className="p-4">Status Transition</th>
                  <th className="p-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map(ord => (
                  <tr key={ord._id || ord.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-4 font-mono font-bold text-slate-900">{ord.orderNumber}</td>
                    <td className="p-4">
                      <p className="font-semibold text-slate-900">{ord.userName}</p>
                      <p className="text-[11px] text-slate-500">{ord.userEmail}</p>
                    </td>
                    <td className="p-4 font-black text-slate-900">₹{ord.finalTotal.toLocaleString('en-IN')}</td>
                    <td className="p-4">
                      <span className="uppercase font-bold text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                        {ord.paymentMethod}
                      </span>
                    </td>
                    <td className="p-4">
                      <select
                        value={ord.orderStatus}
                        onChange={e => handleUpdateOrderStatus(ord._id || ord.id || '', e.target.value)}
                        className="px-2.5 py-1 text-xs font-semibold bg-white border border-slate-300 rounded-md focus:outline-none cursor-pointer"
                      >
                        <option value="pending">pending</option>
                        <option value="confirmed">confirmed</option>
                        <option value="processing">processing</option>
                        <option value="shipped">shipped</option>
                        <option value="delivered">delivered</option>
                        <option value="cancelled">cancelled</option>
                      </select>
                    </td>
                    <td className="p-4 text-slate-500 text-[11px]">
                      {new Date(ord.createdAt).toLocaleDateString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Customers */}
      {activeTab === 'customers' && (
        <div className="space-y-6">
          <h2 className="text-base font-bold text-slate-900">Registered Customers</h2>
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs divide-y divide-slate-100 p-6">
            {customers.map(c => (
              <div key={c.id} className="py-4 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-slate-900 text-sm">{c.name}</p>
                  <p className="text-slate-500">{c.email}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-slate-900">{c.ordersCount} Orders Placed</p>
                  <p className="text-indigo-600 font-bold">Total Spent: ₹{c.totalSpent.toLocaleString('en-IN')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: System & Persistence */}
      {activeTab === 'system' && (
        <div className="max-w-2xl bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-6">
          <h2 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100">
            Database Configuration & Seeding
          </h2>

          <div className="space-y-3 text-xs text-slate-600">
            <p>
              Vibe-Nova is architected with dual-mode storage:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>MongoDB Atlas Mode:</strong> When <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">MONGODB_URI</code> is defined in the environment, all collections (Users, Products, Categories, Orders, Cart, Wishlist) persist automatically to MongoDB Atlas.
              </li>
              <li>
                <strong>Zero-Setup In-Memory Mode:</strong> When MONGODB_URI is absent, the system operates seamlessly with complete reactive in-memory state initialized with 18 realistic seeded products and verified categories.
              </li>
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <h4 className="text-xs font-bold text-slate-800">Restore / Re-Seed Database</h4>
            <p className="text-xs text-slate-500">
              Reset catalog inventory, restore initial products, and refresh demo customer accounts to default state.
            </p>
            <button
              onClick={handleResetSeed}
              className="mt-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition-colors"
            >
              Run Database Seed Reset
            </button>
          </div>
        </div>
      )}

      {/* Product Edit / Create Modal */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setIsProductModalOpen(false)} />
          <div className="relative bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 z-10 max-h-[90vh] overflow-y-auto space-y-4">
            <h3 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100">
              {editingProductId ? 'Edit Product' : 'Create New Product'}
            </h3>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  value={productForm.name}
                  onChange={e => setProductForm({ ...productForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={productForm.price}
                    onChange={e => setProductForm({ ...productForm, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Compare Price (₹)</label>
                  <input
                    type="number"
                    value={productForm.compareAtPrice}
                    onChange={e => setProductForm({ ...productForm, compareAtPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Stock Units</label>
                  <input
                    type="number"
                    required
                    value={productForm.stock}
                    onChange={e => setProductForm({ ...productForm, stock: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Category</label>
                <select
                  value={productForm.categoryId}
                  onChange={e => {
                    const matched = categories.find(c => c.slug === e.target.value || c._id === e.target.value);
                    setProductForm({
                      ...productForm,
                      categoryId: e.target.value,
                      categoryName: matched?.name || 'Curated',
                    });
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer"
                >
                  {categories.map(c => (
                    <option key={c.slug} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Image URL</label>
                <input
                  type="url"
                  required
                  value={productForm.images[0] || ''}
                  onChange={e => setProductForm({ ...productForm, images: [e.target.value] })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Description</label>
                <textarea
                  rows={3}
                  required
                  value={productForm.description}
                  onChange={e => setProductForm({ ...productForm, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 text-white rounded-lg font-bold"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
