import mongoose, { Schema, Document } from 'mongoose';

// User Schema
export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: 'customer' | 'admin';
  phone?: string;
  addresses: {
    fullName: string;
    phone: string;
    street: string;
    apartment?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    isDefault?: boolean;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
  phone: { type: String, default: '' },
  addresses: [
    {
      fullName: String,
      phone: String,
      street: String,
      apartment: String,
      city: String,
      state: String,
      postalCode: String,
      country: { type: String, default: 'India' },
      isDefault: { type: Boolean, default: false },
    },
  ],
}, { timestamps: true });

// Product Schema
export interface IProduct extends Document {
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  images: string[];
  categoryId: string;
  categoryName?: string;
  sku: string;
  stock: number;
  variants?: {
    id: string;
    name: string;
    stock: number;
    options: { [key: string]: string };
  }[];
  rating: number;
  reviewCount: number;
  featured?: boolean;
  isNewArrival?: boolean;
  bestSeller?: boolean;
  tags?: string[];
  specifications?: { [key: string]: string };
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  description: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  compareAtPrice: { type: Number, default: 0 },
  images: [{ type: String }],
  categoryId: { type: String, required: true, index: true },
  categoryName: { type: String, default: '' },
  sku: { type: String, required: true, unique: true },
  stock: { type: Number, required: true, default: 0, min: 0 },
  variants: [
    {
      id: String,
      name: String,
      stock: Number,
      options: Schema.Types.Mixed,
    },
  ],
  rating: { type: Number, default: 4.5, min: 0, max: 5 },
  reviewCount: { type: Number, default: 0 },
  featured: { type: Boolean, default: false },
  isNewArrival: { type: Boolean, default: false },
  bestSeller: { type: Boolean, default: false },
  tags: [{ type: String }],
  specifications: { type: Schema.Types.Mixed, default: {} },
  active: { type: Boolean, default: true, index: true },
}, { timestamps: true });

ProductSchema.index({ name: 'text', description: 'text', tags: 'text' });

// Category Schema
export interface ICategory extends Document {
  name: string;
  slug: string;
  description: string;
  image: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  description: { type: String, default: '' },
  image: { type: String, default: '' },
  active: { type: Boolean, default: true },
}, { timestamps: true });

// Cart Schema
export interface ICart extends Document {
  userId: string;
  items: {
    productId: string;
    name: string;
    price: number;
    image: string;
    quantity: number;
    variant?: {
      id: string;
      name: string;
      options: { [key: string]: string };
    };
  }[];
  updatedAt: Date;
}

const CartSchema = new Schema<ICart>({
  userId: { type: String, required: true, unique: true, index: true },
  items: [
    {
      productId: { type: String, required: true },
      name: { type: String, required: true },
      price: { type: Number, required: true },
      image: { type: String, required: true },
      quantity: { type: Number, required: true, min: 1 },
      variant: Schema.Types.Mixed,
    },
  ],
}, { timestamps: true });

// Wishlist Schema
export interface IWishlist extends Document {
  userId: string;
  productIds: string[];
  updatedAt: Date;
}

const WishlistSchema = new Schema<IWishlist>({
  userId: { type: String, required: true, unique: true, index: true },
  productIds: [{ type: String }],
}, { timestamps: true });

// Order Schema
export interface IOrder extends Document {
  orderNumber: string;
  userId: string;
  userEmail: string;
  userName: string;
  items: {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
    variant?: {
      id: string;
      name: string;
      options: { [key: string]: string };
    };
    lineTotal: number;
  }[];
  shippingAddress: {
    fullName: string;
    phone: string;
    street: string;
    apartment?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  subtotal: number;
  shippingCharges: number;
  discount: number;
  couponCode?: string;
  finalTotal: number;
  paymentMethod: string;
  paymentStatus: string;
  paymentDetails?: {
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    razorpaySignature?: string;
    transactionId?: string;
  };
  orderStatus: string;
  statusHistory?: {
    status: string;
    timestamp: Date;
    note?: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>({
  orderNumber: { type: String, required: true, unique: true, index: true },
  userId: { type: String, required: true, index: true },
  userEmail: { type: String, required: true },
  userName: { type: String, required: true },
  items: [
    {
      productId: String,
      name: String,
      price: Number,
      quantity: Number,
      image: String,
      variant: Schema.Types.Mixed,
      lineTotal: Number,
    },
  ],
  shippingAddress: {
    fullName: String,
    phone: String,
    street: String,
    apartment: String,
    city: String,
    state: String,
    postalCode: String,
    country: String,
  },
  subtotal: { type: Number, required: true },
  shippingCharges: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  couponCode: { type: String, default: '' },
  finalTotal: { type: Number, required: true },
  paymentMethod: { type: String, required: true },
  paymentStatus: { type: String, default: 'pending' },
  paymentDetails: Schema.Types.Mixed,
  orderStatus: { type: String, default: 'pending', index: true },
  statusHistory: [
    {
      status: String,
      timestamp: { type: Date, default: Date.now },
      note: String,
    },
  ],
}, { timestamps: true });

// Coupon Schema
export interface ICoupon extends Document {
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  active: boolean;
  description?: string;
}

const CouponSchema = new Schema<ICoupon>({
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  discountType: { type: String, enum: ['percentage', 'fixed'], required: true },
  discountValue: { type: Number, required: true },
  minOrderAmount: { type: Number, default: 0 },
  maxDiscountAmount: { type: Number, default: 0 },
  active: { type: Boolean, default: true },
  description: { type: String, default: '' },
});

// Newsletter & Contact Schemas
const NewsletterSchema = new Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  subscribedAt: { type: Date, default: Date.now },
  status: { type: String, default: 'active' },
});

const ContactMessageSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  subject: { type: String, default: '' },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const UserModel = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
export const ProductModel = mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);
export const CategoryModel = mongoose.models.Category || mongoose.model<ICategory>('Category', CategorySchema);
export const CartModel = mongoose.models.Cart || mongoose.model<ICart>('Cart', CartSchema);
export const WishlistModel = mongoose.models.Wishlist || mongoose.model<IWishlist>('Wishlist', WishlistSchema);
export const OrderModel = mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);
export const CouponModel = mongoose.models.Coupon || mongoose.model<ICoupon>('Coupon', CouponSchema);
export const NewsletterModel = mongoose.models.Newsletter || mongoose.model('Newsletter', NewsletterSchema);
export const ContactModel = mongoose.models.Contact || mongoose.model('Contact', ContactMessageSchema);
