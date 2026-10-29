import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {
  findProducts, findProductByIdOrSlug, createProduct, updateProduct, deleteProduct,
  findCategories, createCategory,
  findUserByEmail, findUserById, createUser, updateUser,
  getCart, saveCart, clearCart,
  getWishlist, toggleWishlist,
  validateCoupon,
  createOrder, findOrders, findOrderById, updateOrderStatus,
  getDashboardMetrics,
  subscribeNewsletter, createContact, resetAndSeedStore
} from './store.js';
import { getDbInfo } from './db.js';

export const apiRouter = Router();

const JWT_SECRET = process.env.JWT_SECRET || 'vibe_nova_default_jwt_secret_dev_2026';

// Helper to sign JWT token
function signToken(user: { id?: string; _id?: string; email: string; role: string; name: string }) {
  const userId = user.id || user._id;
  return jwt.sign(
    { id: userId, email: user.email, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// Auth Middleware: Extracts user from cookie or Authorization header
export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: 'customer' | 'admin';
    name: string;
  };
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  let token = '';

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;
  } catch (err) {
    // Expired or invalid token, ignore so req.user remains undefined
  }
  next();
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ success: false, error: 'Authentication required. Please log in.' });
  }
  next();
}

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ success: false, error: 'Access forbidden. Administrator privileges required.' });
  }
  next();
}

apiRouter.use(authMiddleware);

// ==========================================
// 1. AUTHENTICATION & PROFILE
// ==========================================

apiRouter.post('/auth/register', async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: 'Name, email, and password are required.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters.' });
    }

    const existing = await findUserByEmail(email);
    if (existing) {
      return res.status(409).json({ success: false, error: 'An account with this email address already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = await createUser({
      name,
      email,
      passwordHash,
      role: 'customer',
    });

    const token = signToken(newUser);
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const safeUser = {
      id: newUser.id || newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      phone: newUser.phone,
      addresses: newUser.addresses || [],
    };

    return res.status(201).json({ success: true, user: safeUser, token });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || 'Registration failed' });
  }
});

apiRouter.post('/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required.' });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid email or password.' });
    }

    const token = signToken(user);
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const safeUser = {
      id: user.id || user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      addresses: user.addresses || [],
    };

    return res.json({ success: true, user: safeUser, token });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || 'Login failed' });
  }
});

apiRouter.post('/auth/logout', (req: Request, res: Response) => {
  res.clearCookie('token');
  return res.json({ success: true, message: 'Logged out successfully.' });
});

apiRouter.get('/auth/me', async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.json({ success: true, user: null });
  }

  const user = await findUserById(req.user.id);
  if (!user) {
    return res.json({ success: true, user: null });
  }

  const safeUser = {
    id: user.id || user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone,
    addresses: user.addresses || [],
  };

  return res.json({ success: true, user: safeUser });
});

apiRouter.put('/auth/profile', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { name, phone } = req.body;
    const updated = await updateUser(req.user!.id, { name, phone });
    return res.json({
      success: true,
      user: {
        id: updated.id || updated._id,
        name: updated.name,
        email: updated.email,
        role: updated.role,
        phone: updated.phone,
        addresses: updated.addresses || [],
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.post('/auth/addresses', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const user = await findUserById(req.user!.id);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });

    const newAddr = {
      id: `addr_${Date.now()}`,
      fullName: req.body.fullName,
      phone: req.body.phone,
      street: req.body.street,
      apartment: req.body.apartment || '',
      city: req.body.city,
      state: req.body.state,
      postalCode: req.body.postalCode,
      country: req.body.country || 'India',
      isDefault: Boolean(req.body.isDefault),
    };

    let addresses = user.addresses || [];
    if (newAddr.isDefault) {
      addresses = addresses.map((a: any) => ({ ...a, isDefault: false }));
    }
    addresses.push(newAddr);

    const updated = await updateUser(req.user!.id, { addresses });
    return res.json({ success: true, addresses: updated.addresses });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.delete('/auth/addresses/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const user = await findUserById(req.user!.id);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });

    const addresses = (user.addresses || []).filter((a: any) => (a.id || a._id) !== req.params.id);
    const updated = await updateUser(req.user!.id, { addresses });
    return res.json({ success: true, addresses: updated.addresses });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 2. PRODUCTS & CATEGORIES
// ==========================================

apiRouter.get('/products', async (req: Request, res: Response) => {
  try {
    const { category, search, minPrice, maxPrice, inStock, rating, sort, page, limit, featured, isNewArrival, bestSeller } = req.query;

    const result = await findProducts({
      category: category as string,
      search: search as string,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      inStock: inStock === 'true',
      rating: rating ? Number(rating) : undefined,
      sort: sort as string,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 12,
      featured: featured !== undefined ? featured === 'true' : undefined,
      isNewArrival: isNewArrival !== undefined ? isNewArrival === 'true' : undefined,
      bestSeller: bestSeller !== undefined ? bestSeller === 'true' : undefined,
    });

    return res.json({ success: true, ...result });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.get('/products/:idOrSlug', async (req: Request, res: Response) => {
  try {
    const product = await findProductByIdOrSlug(req.params.idOrSlug);
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }
    return res.json({ success: true, product });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.get('/categories', async (req: Request, res: Response) => {
  try {
    const categories = await findCategories();
    return res.json({ success: true, categories });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 3. CART
// ==========================================

apiRouter.get('/cart', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const items = await getCart(req.user!.id);
    return res.json({ success: true, items });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.post('/cart/sync', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const guestItems = req.body.items || [];
    const serverItems = await getCart(req.user!.id);

    // Merge without duplicates based on productId + variantId
    const mergedMap = new Map<string, any>();

    for (const item of serverItems) {
      const key = `${item.productId}_${item.variant?.id || 'base'}`;
      mergedMap.set(key, item);
    }

    for (const item of guestItems) {
      const key = `${item.productId}_${item.variant?.id || 'base'}`;
      if (mergedMap.has(key)) {
        const existing = mergedMap.get(key);
        existing.quantity += item.quantity;
      } else {
        mergedMap.set(key, item);
      }
    }

    const mergedList = Array.from(mergedMap.values());
    await saveCart(req.user!.id, mergedList);

    return res.json({ success: true, items: mergedList });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.post('/cart/items', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { productId, quantity = 1, variant } = req.body;
    const product = await findProductByIdOrSlug(productId);
    if (!product) return res.status(404).json({ success: false, error: 'Product not found' });

    if (product.stock < quantity) {
      return res.status(400).json({ success: false, error: `Only ${product.stock} items left in stock.` });
    }

    const items = await getCart(req.user!.id);
    const itemKey = `${productId}_${variant?.id || 'base'}`;

    const existingIdx = items.findIndex(
      (it: any) => `${it.productId}_${it.variant?.id || 'base'}` === itemKey
    );

    if (existingIdx !== -1) {
      items[existingIdx].quantity += quantity;
    } else {
      items.push({
        id: `cart_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        productId: product._id || product.id,
        name: product.name,
        price: product.price,
        image: product.images[0],
        quantity,
        variant,
        maxStock: product.stock,
      });
    }

    await saveCart(req.user!.id, items);
    return res.json({ success: true, items });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.patch('/cart/items/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { quantity } = req.body;
    const items = await getCart(req.user!.id);
    const idx = items.findIndex((it: any) => it.id === req.params.id);

    if (idx === -1) {
      return res.status(404).json({ success: false, error: 'Cart item not found' });
    }

    if (quantity <= 0) {
      items.splice(idx, 1);
    } else {
      items[idx].quantity = quantity;
    }

    await saveCart(req.user!.id, items);
    return res.json({ success: true, items });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.delete('/cart/items/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    let items = await getCart(req.user!.id);
    items = items.filter((it: any) => it.id !== req.params.id);
    await saveCart(req.user!.id, items);
    return res.json({ success: true, items });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.delete('/cart/clear', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    await clearCart(req.user!.id);
    return res.json({ success: true, items: [] });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 4. WISHLIST
// ==========================================

apiRouter.get('/wishlist', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const productIds = await getWishlist(req.user!.id);
    return res.json({ success: true, productIds });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.post('/wishlist/toggle', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { productId } = req.body;
    if (!productId) return res.status(400).json({ success: false, error: 'Product ID required' });
    const productIds = await toggleWishlist(req.user!.id, productId);
    return res.json({ success: true, productIds });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 5. COUPONS
// ==========================================

apiRouter.post('/coupons/validate', async (req: Request, res: Response) => {
  try {
    const { code, subtotal } = req.body;
    if (!code) return res.status(400).json({ success: false, message: 'Coupon code required' });
    const result = await validateCoupon(code, Number(subtotal) || 0);
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================
// 6. ORDERS
// ==========================================

apiRouter.post('/orders', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { items, shippingAddress, couponCode, paymentMethod, paymentDetails } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, error: 'Cart is empty. Cannot create order.' });
    }
    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.street || !shippingAddress.city) {
      return res.status(400).json({ success: false, error: 'Complete shipping address is required.' });
    }

    const order = await createOrder({
      userId: req.user!.id,
      userName: req.user!.name || shippingAddress.fullName,
      userEmail: req.user!.email,
      items,
      shippingAddress,
      couponCode,
      paymentMethod: paymentMethod || 'cod',
      paymentDetails,
    });

    // Clear cart on successful order
    await clearCart(req.user!.id);

    return res.status(201).json({ success: true, order });
  } catch (err: any) {
    return res.status(400).json({ success: false, error: err.message });
  }
});

apiRouter.get('/orders', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const orders = await findOrders(req.user!.id);
    return res.json({ success: true, orders });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.get('/orders/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const order = await findOrderById(req.params.id);
    if (!order) return res.status(404).json({ success: false, error: 'Order not found' });

    // Authorization check: customer can only view their own order
    if (req.user!.role !== 'admin' && order.userId !== req.user!.id) {
      return res.status(403).json({ success: false, error: 'Unauthorized to view this order.' });
    }

    return res.json({ success: true, order });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.post('/orders/:id/cancel', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const order = await findOrderById(req.params.id);
    if (!order) return res.status(404).json({ success: false, error: 'Order not found' });

    if (req.user!.role !== 'admin' && order.userId !== req.user!.id) {
      return res.status(403).json({ success: false, error: 'Unauthorized to cancel this order.' });
    }

    const updated = await updateOrderStatus(req.params.id, 'cancelled', 'Cancelled by customer');
    return res.json({ success: true, order: updated });
  } catch (err: any) {
    return res.status(400).json({ success: false, error: err.message });
  }
});

// ==========================================
// 7. PAYMENTS (RAZORPAY TEST MODE & DEMO CHECKOUT)
// ==========================================

apiRouter.get('/payments/config', (req: Request, res: Response) => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const isConfigured = Boolean(keyId && keyId.trim().length > 0);
  return res.json({
    success: true,
    provider: 'razorpay',
    isConfigured,
    keyId: isConfigured ? keyId : null,
    mode: isConfigured ? 'test' : 'simulated_demo',
    message: isConfigured
      ? 'Razorpay Test Mode is active'
      : 'Razorpay keys not configured in environment. Using high-fidelity Demo Checkout & Cash-on-Delivery.',
  });
});

apiRouter.post('/payments/create-order', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { amount, receipt } = req.body;
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (keyId && keySecret) {
      // Connect to Razorpay API in test mode
      const authHeader = 'Basic ' + Buffer.from(`${keyId}:${keySecret}`).toString('base64');
      const response = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: authHeader,
        },
        body: JSON.stringify({
          amount: Math.round(Number(amount) * 100), // in paise
          currency: 'INR',
          receipt: receipt || `receipt_${Date.now()}`,
        }),
      });

      const rzpOrder = await response.json();
      if (!response.ok) {
        throw new Error(rzpOrder.error?.description || 'Razorpay order creation failed');
      }

      return res.json({
        success: true,
        provider: 'razorpay',
        orderId: rzpOrder.id,
        amount: rzpOrder.amount,
        currency: rzpOrder.currency,
        keyId,
      });
    }

    // Demo Simulated Order
    const demoOrderId = `order_demo_${Date.now()}`;
    return res.json({
      success: true,
      provider: 'simulated_demo',
      orderId: demoOrderId,
      amount: Math.round(Number(amount) * 100),
      currency: 'INR',
      keyId: 'rzp_test_simulated_key',
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.post('/payments/verify', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (keySecret && razorpay_signature) {
      const crypto = await import('crypto');
      const body = razorpay_order_id + '|' + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac('sha256', keySecret)
        .update(body.toString())
        .digest('hex');

      if (expectedSignature !== razorpay_signature) {
        return res.status(400).json({ success: false, error: 'Payment signature verification failed.' });
      }
    }

    return res.json({
      success: true,
      verified: true,
      transactionId: razorpay_payment_id || `TXN_${Date.now()}`,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 8. ADMIN DASHBOARD & MANAGEMENT (RBAC Protected)
// ==========================================

apiRouter.get('/admin/dashboard', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const metrics = await getDashboardMetrics();
    const dbInfo = getDbInfo();
    return res.json({ success: true, metrics, dbInfo });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.get('/admin/db-status', requireAdmin, (req: AuthRequest, res: Response) => {
  return res.json({ success: true, dbInfo: getDbInfo() });
});

apiRouter.post('/admin/reset-seed', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const result = await resetAndSeedStore();
    return res.json({ ...result });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.post('/admin/products', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const product = await createProduct(req.body);
    return res.status(201).json({ success: true, product });
  } catch (err: any) {
    return res.status(400).json({ success: false, error: err.message });
  }
});

apiRouter.patch('/admin/products/:id', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const product = await updateProduct(req.params.id, req.body);
    if (!product) return res.status(404).json({ success: false, error: 'Product not found' });
    return res.json({ success: true, product });
  } catch (err: any) {
    return res.status(400).json({ success: false, error: err.message });
  }
});

apiRouter.delete('/admin/products/:id', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    await deleteProduct(req.params.id);
    return res.json({ success: true, message: 'Product deleted successfully.' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.get('/admin/orders', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const orders = await findOrders();
    return res.json({ success: true, orders });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.patch('/admin/orders/:id', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { status, note } = req.body;
    const order = await updateOrderStatus(req.params.id, status, note);
    return res.json({ success: true, order });
  } catch (err: any) {
    return res.status(400).json({ success: false, error: err.message });
  }
});

apiRouter.get('/admin/customers', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    return res.json({
      success: true,
      customers: [
        {
          id: 'user_cust',
          name: 'Aarav Sharma',
          email: 'customer@example.com',
          role: 'customer',
          ordersCount: 2,
          totalSpent: 7298,
          createdAt: '2026-10-15T10:00:00Z',
        },
      ],
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 9. NEWSLETTER & CONTACT
// ==========================================

apiRouter.post('/newsletter/subscribe', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email || !email.includes('@')) {
      return res.status(400).json({ success: false, error: 'Valid email address required.' });
    }
    await subscribeNewsletter(email);
    return res.json({ success: true, message: 'Thank you for subscribing to Vibe-Nova drops!' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.post('/contact', async (req: Request, res: Response) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ success: false, error: 'Please provide name, email, and your message.' });
    }
    await createContact({ name, email, subject, message });
    return res.json({ success: true, message: 'Message received! Our team will respond within 24 hours.' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});
