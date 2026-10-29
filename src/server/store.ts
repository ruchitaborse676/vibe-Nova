import { SEED_CATEGORIES, SEED_PRODUCTS, SEED_COUPONS, getHashedDefaultPasswords } from './seedData.js';
import { isDbConnected } from './db.js';
import {
  UserModel, ProductModel, CategoryModel, CartModel,
  WishlistModel, OrderModel, CouponModel, NewsletterModel, ContactModel
} from './models.js';

// In-Memory Database collections
interface InMemoryData {
  users: any[];
  products: any[];
  categories: any[];
  carts: Map<string, any[]>;
  wishlists: Map<string, Set<string>>;
  orders: any[];
  coupons: any[];
  newsletters: Set<string>;
  contacts: any[];
}

const memoryDb: InMemoryData = {
  users: [],
  products: [],
  categories: [],
  carts: new Map(),
  wishlists: new Map(),
  orders: [],
  coupons: [],
  newsletters: new Set(),
  contacts: [],
};

let isInitialized = false;

export async function initStore() {
  if (isInitialized) return;

  const { adminPass, custPass } = await getHashedDefaultPasswords();

  // 1. Initialise memory DB
  memoryDb.categories = SEED_CATEGORIES.map(c => ({
    _id: c._id,
    id: c._id,
    name: c.name,
    slug: c.slug,
    description: c.description,
    image: c.image,
    active: c.active,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }));

  memoryDb.products = SEED_PRODUCTS.map((p, idx) => ({
    _id: `prod_${idx + 1}`,
    id: `prod_${idx + 1}`,
    ...p,
    createdAt: new Date(Date.now() - (18 - idx) * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  }));

  memoryDb.coupons = SEED_COUPONS.map(c => ({ ...c }));

  memoryDb.users = [
    {
      _id: 'user_admin',
      id: 'user_admin',
      name: 'Vibe-Nova Administrator',
      email: (process.env.ADMIN_EMAIL || 'admin@vibenova.com').toLowerCase(),
      passwordHash: adminPass,
      role: 'admin',
      phone: '+91 98765 43210',
      addresses: [
        {
          id: 'addr_1',
          fullName: 'Vibe-Nova HQ',
          phone: '+91 98765 43210',
          street: '404 Tech Park, Outer Ring Road',
          apartment: 'Suite 9A',
          city: 'Bengaluru',
          state: 'Karnataka',
          postalCode: '560103',
          country: 'India',
          isDefault: true,
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      _id: 'user_cust',
      id: 'user_cust',
      name: 'Aarav Sharma',
      email: 'customer@example.com',
      passwordHash: custPass,
      role: 'customer',
      phone: '+91 98112 33445',
      addresses: [
        {
          id: 'addr_2',
          fullName: 'Aarav Sharma',
          phone: '+91 98112 33445',
          street: 'Flat 302, Palm Heights, Indiranagar',
          apartment: 'Near Metro Station',
          city: 'Bengaluru',
          state: 'Karnataka',
          postalCode: '560038',
          country: 'India',
          isDefault: true,
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  // Seed sample initial orders for Aarav
  memoryDb.orders = [
    {
      _id: 'ord_1',
      id: 'ord_1',
      orderNumber: 'VN-2026-1001',
      userId: 'user_cust',
      userEmail: 'customer@example.com',
      userName: 'Aarav Sharma',
      items: [
        {
          productId: 'prod_1',
          name: 'NovaPulse ANC Wireless Headphones',
          price: 4999,
          quantity: 1,
          image: memoryDb.products[0].images[0],
          variant: { id: 'v1', name: 'Midnight Onyx', options: { Color: 'Midnight Onyx' } },
          lineTotal: 4999,
        },
      ],
      shippingAddress: memoryDb.users[1].addresses[0],
      subtotal: 4999,
      shippingCharges: 0,
      discount: 1000,
      couponCode: 'VIBE20',
      finalTotal: 3999,
      paymentMethod: 'demo_card',
      paymentStatus: 'paid',
      paymentDetails: { transactionId: 'TXN_DEMO_9881' },
      orderStatus: 'delivered',
      statusHistory: [
        { status: 'pending', timestamp: new Date(Date.now() - 3 * 86400000).toISOString(), note: 'Order placed' },
        { status: 'confirmed', timestamp: new Date(Date.now() - 3 * 86400000 + 3600000).toISOString() },
        { status: 'processing', timestamp: new Date(Date.now() - 2 * 86400000).toISOString() },
        { status: 'shipped', timestamp: new Date(Date.now() - 1 * 86400000).toISOString() },
        { status: 'delivered', timestamp: new Date().toISOString(), note: 'Handed to customer' },
      ],
      createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      _id: 'ord_2',
      id: 'ord_2',
      orderNumber: 'VN-2026-1002',
      userId: 'user_cust',
      userEmail: 'customer@example.com',
      userName: 'Aarav Sharma',
      items: [
        {
          productId: 'prod_2',
          name: 'AeroGlide Minimalist Casual Sneakers',
          price: 3299,
          quantity: 1,
          image: memoryDb.products[1].images[0],
          variant: { id: 'v1', name: 'Size 8 / Crimson & White', options: { Size: 'UK 8', Color: 'Crimson' } },
          lineTotal: 3299,
        },
      ],
      shippingAddress: memoryDb.users[1].addresses[0],
      subtotal: 3299,
      shippingCharges: 0,
      discount: 0,
      finalTotal: 3299,
      paymentMethod: 'cod',
      paymentStatus: 'pending',
      orderStatus: 'processing',
      statusHistory: [
        { status: 'pending', timestamp: new Date(Date.now() - 1 * 86400000).toISOString() },
        { status: 'confirmed', timestamp: new Date(Date.now() - 20 * 3600000).toISOString() },
        { status: 'processing', timestamp: new Date(Date.now() - 10 * 3600000).toISOString() },
      ],
      createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  // If MongoDB is connected, also seed MongoDB Atlas if empty
  if (isDbConnected()) {
    try {
      const prodCount = await ProductModel.countDocuments();
      if (prodCount === 0) {
        await CategoryModel.insertMany(memoryDb.categories);
        await ProductModel.insertMany(memoryDb.products);
        await CouponModel.insertMany(memoryDb.coupons);
        await UserModel.insertMany(memoryDb.users);
        await OrderModel.insertMany(memoryDb.orders);
        console.log('[Vibe-Nova DB] Seeded initial data into MongoDB Atlas successfully.');
      }
    } catch (err) {
      console.warn('[Vibe-Nova DB] MongoDB Atlas auto-seed check warning:', (err as Error).message);
    }
  }

  isInitialized = true;
}

// ---------------- PRODUCTS ----------------

export interface ProductFilters {
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  rating?: number;
  sort?: string; // 'price_asc' | 'price_desc' | 'newest' | 'rating' | 'featured'
  page?: number;
  limit?: number;
  featured?: boolean;
  isNewArrival?: boolean;
  bestSeller?: boolean;
}

export async function findProducts(filters: ProductFilters = {}) {
  await initStore();

  const {
    category,
    search,
    minPrice,
    maxPrice,
    inStock,
    rating,
    sort = 'featured',
    page = 1,
    limit = 12,
    featured,
    isNewArrival,
    bestSeller,
  } = filters;

  if (isDbConnected()) {
    try {
      const query: any = { active: true };
      if (category && category !== 'all') {
        const cat = await CategoryModel.findOne({ slug: category });
        if (cat) {
          query.categoryId = cat._id.toString();
        } else {
          query.categoryId = category;
        }
      }
      if (search && search.trim()) {
        const regex = new RegExp(search.trim(), 'i');
        query.$or = [{ name: regex }, { description: regex }, { tags: regex }, { categoryName: regex }];
      }
      if (minPrice !== undefined || maxPrice !== undefined) {
        query.price = {};
        if (minPrice !== undefined) query.price.$gte = Number(minPrice);
        if (maxPrice !== undefined) query.price.$lte = Number(maxPrice);
      }
      if (inStock) {
        query.stock = { $gt: 0 };
      }
      if (rating) {
        query.rating = { $gte: Number(rating) };
      }
      if (featured !== undefined) query.featured = featured;
      if (isNewArrival !== undefined) query.isNewArrival = isNewArrival;
      if (bestSeller !== undefined) query.bestSeller = bestSeller;

      let sortObj: any = { featured: -1, createdAt: -1 };
      if (sort === 'price_asc') sortObj = { price: 1 };
      else if (sort === 'price_desc') sortObj = { price: -1 };
      else if (sort === 'newest') sortObj = { createdAt: -1 };
      else if (sort === 'rating') sortObj = { rating: -1 };

      const total = await ProductModel.countDocuments(query);
      const items = await ProductModel.find(query)
        .sort(sortObj)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();

      return {
        products: items.map(p => ({ ...p, id: p._id.toString() })),
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / limit) || 1,
        },
      };
    } catch (e) {
      console.warn('Mongo product find error, falling back to memory:', (e as Error).message);
    }
  }

  // In-Memory store filtering
  let list = memoryDb.products.filter(p => p.active);

  if (category && category !== 'all') {
    const cat = memoryDb.categories.find(c => c.slug === category || c._id === category);
    if (cat) {
      list = list.filter(p => p.categoryId === cat._id);
    }
  }

  if (search && search.trim()) {
    const q = search.trim().toLowerCase();
    list = list.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.categoryName?.toLowerCase().includes(q) ||
      p.tags?.some((t: string) => t.toLowerCase().includes(q))
    );
  }

  if (minPrice !== undefined) {
    list = list.filter(p => p.price >= Number(minPrice));
  }
  if (maxPrice !== undefined) {
    list = list.filter(p => p.price <= Number(maxPrice));
  }
  if (inStock) {
    list = list.filter(p => p.stock > 0);
  }
  if (rating) {
    list = list.filter(p => p.rating >= Number(rating));
  }
  if (featured !== undefined) {
    list = list.filter(p => p.featured === featured);
  }
  if (isNewArrival !== undefined) {
    list = list.filter(p => p.isNewArrival === isNewArrival);
  }
  if (bestSeller !== undefined) {
    list = list.filter(p => p.bestSeller === bestSeller);
  }

  // Sort
  if (sort === 'price_asc') {
    list.sort((a, b) => a.price - b.price);
  } else if (sort === 'price_desc') {
    list.sort((a, b) => b.price - a.price);
  } else if (sort === 'newest') {
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } else if (sort === 'rating') {
    list.sort((a, b) => b.rating - a.rating);
  } else {
    list.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
  }

  const total = list.length;
  const start = (page - 1) * limit;
  const paginated = list.slice(start, start + limit);

  return {
    products: paginated,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
}

export async function findProductByIdOrSlug(idOrSlug: string) {
  await initStore();

  if (isDbConnected()) {
    try {
      const isObjectId = /^[0-9a-fA-F]{24}$/.test(idOrSlug);
      const query = isObjectId ? { $or: [{ _id: idOrSlug }, { slug: idOrSlug }] } : { slug: idOrSlug };
      const doc = await ProductModel.findOne(query).lean();
      if (doc) return { ...doc, id: (doc as any)._id.toString() };
    } catch {}
  }

  return memoryDb.products.find(p => p._id === idOrSlug || p.id === idOrSlug || p.slug === idOrSlug) || null;
}

export async function createProduct(data: any) {
  await initStore();
  const slug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const newProd = {
    _id: `prod_${Date.now()}`,
    id: `prod_${Date.now()}`,
    ...data,
    slug,
    stock: Number(data.stock) || 0,
    price: Number(data.price) || 0,
    compareAtPrice: Number(data.compareAtPrice) || 0,
    rating: Number(data.rating) || 4.5,
    reviewCount: Number(data.reviewCount) || 1,
    active: data.active !== undefined ? data.active : true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  memoryDb.products.unshift(newProd);

  if (isDbConnected()) {
    try {
      const doc = await ProductModel.create(newProd);
      return { ...doc.toObject(), id: doc._id.toString() };
    } catch (e) {
      console.warn('Mongo createProduct err:', e);
    }
  }

  return newProd;
}

export async function updateProduct(id: string, data: any) {
  await initStore();
  const idx = memoryDb.products.findIndex(p => p._id === id || p.id === id);
  if (idx !== -1) {
    memoryDb.products[idx] = {
      ...memoryDb.products[idx],
      ...data,
      updatedAt: new Date().toISOString(),
    };
  }

  if (isDbConnected()) {
    try {
      const doc = await ProductModel.findByIdAndUpdate(id, data, { new: true }).lean();
      if (doc) return { ...doc, id: (doc as any)._id.toString() };
    } catch {}
  }

  return idx !== -1 ? memoryDb.products[idx] : null;
}

export async function deleteProduct(id: string) {
  await initStore();
  const idx = memoryDb.products.findIndex(p => p._id === id || p.id === id);
  if (idx !== -1) {
    memoryDb.products.splice(idx, 1);
  }

  if (isDbConnected()) {
    try {
      await ProductModel.findByIdAndDelete(id);
    } catch {}
  }

  return true;
}

// ---------------- CATEGORIES ----------------

export async function findCategories() {
  await initStore();

  if (isDbConnected()) {
    try {
      const docs = await CategoryModel.find({ active: true }).lean();
      if (docs && docs.length > 0) {
        return docs.map(d => ({ ...d, id: (d as any)._id.toString() }));
      }
    } catch {}
  }

  return memoryDb.categories;
}

export async function createCategory(data: any) {
  await initStore();
  const slug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const cat = {
    _id: `cat_${Date.now()}`,
    id: `cat_${Date.now()}`,
    ...data,
    slug,
    active: true,
    createdAt: new Date().toISOString(),
  };
  memoryDb.categories.push(cat);

  if (isDbConnected()) {
    try {
      await CategoryModel.create(cat);
    } catch {}
  }

  return cat;
}

// ---------------- USERS & AUTH ----------------

export async function findUserByEmail(email: string) {
  await initStore();
  const normalized = email.toLowerCase().trim();

  if (isDbConnected()) {
    try {
      const doc = await UserModel.findOne({ email: normalized }).lean();
      if (doc) return { ...doc, id: (doc as any)._id.toString() };
    } catch {}
  }

  return memoryDb.users.find(u => u.email === normalized) || null;
}

export async function findUserById(id: string) {
  await initStore();

  if (isDbConnected()) {
    try {
      const doc = await UserModel.findById(id).lean();
      if (doc) return { ...doc, id: (doc as any)._id.toString() };
    } catch {}
  }

  return memoryDb.users.find(u => u._id === id || u.id === id) || null;
}

export async function createUser(data: { name: string; email: string; passwordHash: string; role?: 'customer' | 'admin' }) {
  await initStore();
  const user = {
    _id: `user_${Date.now()}`,
    id: `user_${Date.now()}`,
    name: data.name.trim(),
    email: data.email.toLowerCase().trim(),
    passwordHash: data.passwordHash,
    role: data.role || 'customer',
    addresses: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  memoryDb.users.push(user);

  if (isDbConnected()) {
    try {
      const doc = await UserModel.create(user);
      return { ...doc.toObject(), id: doc._id.toString() };
    } catch (e) {
      console.warn('Mongo createUser err:', e);
    }
  }

  return user;
}

export async function updateUser(id: string, updates: any) {
  await initStore();
  const idx = memoryDb.users.findIndex(u => u._id === id || u.id === id);
  if (idx !== -1) {
    memoryDb.users[idx] = {
      ...memoryDb.users[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
  }

  if (isDbConnected()) {
    try {
      const doc = await UserModel.findByIdAndUpdate(id, updates, { new: true }).lean();
      if (doc) return { ...doc, id: (doc as any)._id.toString() };
    } catch {}
  }

  return idx !== -1 ? memoryDb.users[idx] : null;
}

// ---------------- CART ----------------

export async function getCart(userId: string) {
  await initStore();
  if (isDbConnected()) {
    try {
      const cart = await CartModel.findOne({ userId }).lean();
      if (cart) return cart.items || [];
    } catch {}
  }
  return memoryDb.carts.get(userId) || [];
}

export async function saveCart(userId: string, items: any[]) {
  await initStore();
  memoryDb.carts.set(userId, items);

  if (isDbConnected()) {
    try {
      await CartModel.findOneAndUpdate(
        { userId },
        { userId, items, updatedAt: new Date() },
        { upsert: true, new: true }
      );
    } catch {}
  }
  return items;
}

export async function clearCart(userId: string) {
  await initStore();
  memoryDb.carts.delete(userId);
  if (isDbConnected()) {
    try {
      await CartModel.findOneAndDelete({ userId });
    } catch {}
  }
}

// ---------------- WISHLIST ----------------

export async function getWishlist(userId: string): Promise<string[]> {
  await initStore();
  if (isDbConnected()) {
    try {
      const doc = await WishlistModel.findOne({ userId }).lean();
      if (doc) return doc.productIds || [];
    } catch {}
  }
  const set = memoryDb.wishlists.get(userId);
  return set ? Array.from(set) : [];
}

export async function toggleWishlist(userId: string, productId: string): Promise<string[]> {
  await initStore();
  let set = memoryDb.wishlists.get(userId);
  if (!set) {
    set = new Set<string>();
    memoryDb.wishlists.set(userId, set);
  }

  if (set.has(productId)) {
    set.delete(productId);
  } else {
    set.add(productId);
  }

  const list = Array.from(set);

  if (isDbConnected()) {
    try {
      await WishlistModel.findOneAndUpdate(
        { userId },
        { userId, productIds: list },
        { upsert: true, new: true }
      );
    } catch {}
  }

  return list;
}

// ---------------- COUPONS ----------------

export async function validateCoupon(code: string, subtotal: number) {
  await initStore();
  const cleanCode = code.trim().toUpperCase();

  let coupon = memoryDb.coupons.find(c => c.code === cleanCode && c.active);

  if (isDbConnected() && !coupon) {
    try {
      const doc = await CouponModel.findOne({ code: cleanCode, active: true }).lean();
      if (doc) coupon = doc;
    } catch {}
  }

  if (!coupon) {
    return { valid: false, message: 'Invalid or expired coupon code.' };
  }

  if (coupon.minOrderAmount && subtotal < coupon.minOrderAmount) {
    return {
      valid: false,
      message: `Coupon requires a minimum order value of ₹${coupon.minOrderAmount}.`,
    };
  }

  let discount = 0;
  if (coupon.discountType === 'percentage') {
    discount = Math.round((subtotal * coupon.discountValue) / 100);
    if (coupon.maxDiscountAmount && discount > coupon.maxDiscountAmount) {
      discount = coupon.maxDiscountAmount;
    }
  } else {
    discount = Math.min(coupon.discountValue, subtotal);
  }

  return {
    valid: true,
    code: coupon.code,
    discount,
    discountType: coupon.discountType,
    discountValue: coupon.discountValue,
    description: coupon.description,
  };
}

// ---------------- ORDERS ----------------

export async function createOrder(data: {
  userId: string;
  userName: string;
  userEmail: string;
  items: any[];
  shippingAddress: any;
  couponCode?: string;
  paymentMethod: string;
  paymentDetails?: any;
}) {
  await initStore();

  // 1. Recalculate everything on the server
  let subtotal = 0;
  const verifiedItems: any[] = [];

  for (const item of data.items) {
    const product = await findProductByIdOrSlug(item.productId);
    if (!product) {
      throw new Error(`Product ${item.name || item.productId} no longer exists.`);
    }

    if (product.stock < item.quantity) {
      throw new Error(`Insufficient stock for "${product.name}". Only ${product.stock} left.`);
    }

    const price = product.price;
    const lineTotal = price * item.quantity;
    subtotal += lineTotal;

    verifiedItems.push({
      productId: product._id || product.id,
      name: product.name,
      price,
      quantity: item.quantity,
      image: product.images[0] || item.image,
      variant: item.variant,
      lineTotal,
    });
  }

  // 2. Validate coupon on server
  let discount = 0;
  let appliedCoupon = '';
  if (data.couponCode && data.couponCode.trim()) {
    const couponRes = await validateCoupon(data.couponCode, subtotal);
    if (couponRes.valid) {
      discount = couponRes.discount || 0;
      appliedCoupon = couponRes.code || '';
    }
  }

  // 3. Shipping charges (free above ₹999, else ₹99)
  const shippingCharges = subtotal >= 999 ? 0 : 99;
  const finalTotal = Math.max(0, subtotal - discount + shippingCharges);

  const orderNumber = `VN-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

  const order = {
    _id: `ord_${Date.now()}`,
    id: `ord_${Date.now()}`,
    orderNumber,
    userId: data.userId,
    userName: data.userName,
    userEmail: data.userEmail,
    items: verifiedItems,
    shippingAddress: data.shippingAddress,
    subtotal,
    shippingCharges,
    discount,
    couponCode: appliedCoupon,
    finalTotal,
    paymentMethod: data.paymentMethod,
    paymentStatus: data.paymentMethod === 'cod' ? 'pending' : (data.paymentDetails?.status || 'paid'),
    paymentDetails: data.paymentDetails || {},
    orderStatus: 'confirmed',
    statusHistory: [
      {
        status: 'confirmed',
        timestamp: new Date().toISOString(),
        note: 'Order confirmed and inventory reserved',
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // 4. Reserve stock atomically
  for (const item of verifiedItems) {
    const p = memoryDb.products.find(x => x._id === item.productId || x.id === item.productId);
    if (p) {
      p.stock = Math.max(0, p.stock - item.quantity);
    }
    if (isDbConnected()) {
      try {
        await ProductModel.findByIdAndUpdate(item.productId, {
          $inc: { stock: -item.quantity },
        });
      } catch {}
    }
  }

  // 5. Store order
  memoryDb.orders.unshift(order);

  if (isDbConnected()) {
    try {
      const doc = await OrderModel.create(order);
      return { ...doc.toObject(), id: doc._id.toString() };
    } catch (e) {
      console.warn('Mongo createOrder err:', e);
    }
  }

  return order;
}

export async function findOrders(userId?: string) {
  await initStore();

  if (isDbConnected()) {
    try {
      const query = userId ? { userId } : {};
      const docs = await OrderModel.find(query).sort({ createdAt: -1 }).lean();
      return docs.map(d => ({ ...d, id: (d as any)._id.toString() }));
    } catch {}
  }

  if (userId) {
    return memoryDb.orders.filter(o => o.userId === userId);
  }
  return memoryDb.orders;
}

export async function findOrderById(id: string) {
  await initStore();

  if (isDbConnected()) {
    try {
      const isObjectId = /^[0-9a-fA-F]{24}$/.test(id);
      const query = isObjectId ? { $or: [{ _id: id }, { orderNumber: id }] } : { orderNumber: id };
      const doc = await OrderModel.findOne(query).lean();
      if (doc) return { ...doc, id: (doc as any)._id.toString() };
    } catch {}
  }

  return memoryDb.orders.find(o => o._id === id || o.id === id || o.orderNumber === id) || null;
}

export async function updateOrderStatus(orderId: string, newStatus: string, note?: string) {
  await initStore();

  const order = memoryDb.orders.find(o => o._id === orderId || o.id === orderId || o.orderNumber === orderId);
  if (!order) return null;

  const validTransitions: { [key: string]: string[] } = {
    pending: ['confirmed', 'cancelled'],
    confirmed: ['processing', 'cancelled'],
    processing: ['shipped', 'cancelled'],
    shipped: ['delivered', 'cancelled'],
    delivered: [],
    cancelled: [],
  };

  const allowed = validTransitions[order.orderStatus] || [];
  if (!allowed.includes(newStatus)) {
    throw new Error(`Cannot transition order from '${order.orderStatus}' to '${newStatus}'.`);
  }

  // If cancelling: restore stock safely!
  if (newStatus === 'cancelled' && order.orderStatus !== 'cancelled') {
    for (const item of order.items) {
      const p = memoryDb.products.find((x: any) => x._id === item.productId || x.id === item.productId);
      if (p) {
        p.stock += item.quantity;
      }
      if (isDbConnected()) {
        try {
          await ProductModel.findByIdAndUpdate(item.productId, {
            $inc: { stock: item.quantity },
          });
        } catch {}
      }
    }
  }

  order.orderStatus = newStatus;
  order.updatedAt = new Date().toISOString();
  if (!order.statusHistory) order.statusHistory = [];
  order.statusHistory.push({
    status: newStatus,
    timestamp: new Date().toISOString(),
    note: note || `Status updated to ${newStatus}`,
  });

  if (isDbConnected()) {
    try {
      await OrderModel.findByIdAndUpdate(order._id, {
        orderStatus: newStatus,
        statusHistory: order.statusHistory,
        updatedAt: new Date(),
      });
    } catch {}
  }

  return order;
}

// ---------------- DASHBOARD METRICS ----------------

export async function getDashboardMetrics() {
  await initStore();

  let orders = memoryDb.orders;
  let products = memoryDb.products;
  let users = memoryDb.users;

  if (isDbConnected()) {
    try {
      orders = (await OrderModel.find().lean()) as any[];
      products = (await ProductModel.find().lean()) as any[];
      users = (await UserModel.find().lean()) as any[];
    } catch {}
  }

  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.orderStatus === 'pending' || o.orderStatus === 'confirmed' || o.orderStatus === 'processing').length;
  const totalCustomers = users.filter(u => u.role !== 'admin').length;
  const totalProducts = products.length;
  const totalRevenue = orders
    .filter(o => o.orderStatus !== 'cancelled')
    .reduce((sum, o) => sum + (o.finalTotal || 0), 0);

  const lowStockProducts = products.filter(p => p.stock <= 5);

  const categoryMap: { [key: string]: { count: number; revenue: number } } = {};
  for (const ord of orders) {
    if (ord.orderStatus === 'cancelled') continue;
    for (const item of ord.items || []) {
      const p = products.find((x: any) => (x._id || x.id) === item.productId);
      const cat = p?.categoryName || 'General';
      if (!categoryMap[cat]) categoryMap[cat] = { count: 0, revenue: 0 };
      categoryMap[cat].count += item.quantity;
      categoryMap[cat].revenue += item.lineTotal;
    }
  }

  const salesByCategory = Object.entries(categoryMap).map(([category, data]) => ({
    category,
    count: data.count,
    revenue: data.revenue,
  }));

  return {
    totalOrders,
    pendingOrders,
    totalCustomers,
    totalProducts,
    totalRevenue,
    recentOrders: orders.slice(0, 5),
    lowStockProducts,
    salesByCategory,
  };
}

// ---------------- NEWSLETTER & CONTACT ----------------

export async function subscribeNewsletter(email: string) {
  await initStore();
  const normalized = email.toLowerCase().trim();
  memoryDb.newsletters.add(normalized);

  if (isDbConnected()) {
    try {
      await NewsletterModel.findOneAndUpdate(
        { email: normalized },
        { email: normalized, subscribedAt: new Date() },
        { upsert: true }
      );
    } catch {}
  }
  return true;
}

export async function createContact(data: { name: string; email: string; subject?: string; message: string }) {
  await initStore();
  const item = {
    id: `msg_${Date.now()}`,
    ...data,
    createdAt: new Date().toISOString(),
  };
  memoryDb.contacts.push(item);

  if (isDbConnected()) {
    try {
      await ContactModel.create(item);
    } catch {}
  }
  return true;
}

export async function resetAndSeedStore() {
  isInitialized = false;
  memoryDb.products = [];
  memoryDb.categories = [];
  memoryDb.users = [];
  memoryDb.orders = [];
  memoryDb.carts.clear();
  memoryDb.wishlists.clear();
  await initStore();
  return { success: true, message: 'Store re-seeded successfully.' };
}
