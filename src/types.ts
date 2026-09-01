export type CategoryType = 'all' | 'backpack' | 'shoes' | 'glasses' | 'hats' | 'apparel' | 'accessories';
export type ProductCategory = 'backpack' | 'shoes' | 'glasses' | 'hats' | 'apparel' | 'accessories';

export interface ProductVariant {
  id: string;
  name: string;
  sku: string;
  colorName?: string;
  colorHex?: string;
  size?: string;
  price: number;
  originalPrice?: number;
  stock: number;
  image?: string;
}

export interface Review {
  id: string;
  author: string;
  avatar?: string;
  rating: number;
  date: string;
  title: string;
  comment: string;
  verified: boolean;
  helpfulCount: number;
  userVotedHelpful?: boolean;
  images?: string[];
}

export interface Product {
  id: string;
  slug?: string;
  name: string;
  tagline?: string;
  description: string;
  details: string[];
  category: CategoryType;
  categoryTag?: string; // e.g. '#backpack'
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  isSoldOut?: boolean;
  isSale?: boolean;
  isNew?: boolean;
  isNewArrival?: boolean;
  isFeatured?: boolean;
  isTrendingEyewear?: boolean;
  sku: string;
  stockQuantity: number;
  youtubeUrl?: string;
  images: string[];
  colors?: { name: string; hex: string }[];
  sizes?: string[];
  specifications: {
    dimensions: string;
    materials: string;
    weight: string;
    origin: string;
    care: string;
  };
  recentPurchasesCount?: number; // e.g. 42 bought in last 7 days
  returnPolicy?: string; // e.g. "7 Days Easy Hassle-Free Returns & Exchange"
  reviews: Review[];
}

export interface CartItem {
  id: string; // unique item id (product.id + variant)
  productId: string;
  product: Product;
  selectedColor?: string;
  selectedSize?: string;
  quantity: number;
  price: number;
}

export interface Address {
  id: string;
  fullName: string;
  phone: string;
  street: string;
  apartment?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isDefault?: boolean;
  type: 'home' | 'work' | 'other';
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  addresses: Address[];
}

export type OrderStatus = 'placed' | 'packed' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'cancelled' | 'returned' | 'refunded';

export interface OrderItem {
  productId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
}

export interface OrderTrackingEvent {
  title: string;
  description: string;
  timestamp: string;
  location: string;
  completed: boolean;
  current?: boolean;
}

export interface Order {
  id: string;
  orderNumber: string;
  date: string;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  discount: number;
  tax: number;
  total: number;
  status: OrderStatus;
  shippingAddress: Address;
  paymentMethod: string;
  paymentStatus: 'paid' | 'pending' | 'cod';
  trackingNumber: string;
  carrier: string;
  estimatedDeliveryDate: string;
  timeline: OrderTrackingEvent[];
}

export interface Coupon {
  code: string;
  discountPercent?: number;
  discountAmount?: number;
  minSpend?: number;
  description: string;
}

export type ActivePage = 
  | 'home'
  | 'shop'
  | 'product-detail'
  | 'cart'
  | 'wishlist'
  | 'checkout'
  | 'order-confirmation'
  | 'account'
  | 'about'
  | 'contact'
  | 'blog'
  | 'lookbook'
  | 'tracking'
  | 'admin';

export type Currency = 'INR' | 'USD' | 'EUR' | 'GBP';
