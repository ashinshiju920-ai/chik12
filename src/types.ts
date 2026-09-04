export type CategoryType = 'all' | 'backpack' | 'shoes' | 'glasses' | 'hats' | 'apparel' | 'accessories';
export type ProductCategory = 'backpack' | 'shoes' | 'glasses' | 'hats' | 'apparel' | 'accessories';

export interface StoreCategory {
  id: string;
  key?: CategoryType | string;
  name: string;
  description: string;
  quote?: string;
  tagline?: string;
  image?: string;
  imageUrl: string;
  badgeText?: string;
  featured: boolean;
  orderIndex: number;
  updatedAt?: any;
}

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
  customFont?: string; // e.g. "'Playfair Display', serif" or custom font
  customFontSize?: string; // e.g. "1rem" or "1.25rem"
  buyNowButtonColor?: string; // Hex color override for Buy Now button
  displayRank?: number; // Manual priority rank set by admin (1 = top priority, 2, 3...)
  isBestSeller?: boolean; // Whether the product is tagged as a Best Seller
  deliveryDays?: number; // Delivery timeframe in days for this specific product (e.g. 2, 3, 5, 7)
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

export type CanonicalOrderStatus = 'Pending' | 'Accepted' | 'Yet to be Sent' | 'Ready' | 'Dispatched' | 'Rejected';
export type OrderStatus = CanonicalOrderStatus | 'placed' | 'packed' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'cancelled' | 'returned' | 'refunded';

export interface OrderCustomerInfo {
  fullName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  title?: string;
  image: string;
  imageUrl?: string;
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
  orderId?: string;
  orderNumber: string;
  date: string;
  createdAt?: any;
  updatedAt?: any;
  customerName?: string;
  email?: string;
  customer?: OrderCustomerInfo;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  discount: number;
  tax: number;
  total: number;
  totalAmount?: number;
  status: OrderStatus;
  dispatchDate?: string | null;
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

export type FloatingBannerFont =
  | 'Plus Jakarta Sans'
  | 'Playfair Display'
  | 'Bodoni Moda'
  | 'Cinzel'
  | 'Cormorant Garamond'
  | 'Inter'
  | 'Montserrat'
  | 'Prata'
  | 'Space Grotesk'
  | 'Tenor Sans';

export type FloatingBannerVariant = 'floating-pill' | 'editorial-strip' | 'marquee-ticker' | 'glass-glow';

export type FloatingBannerIcon =
  | 'sparkles'
  | 'flame'
  | 'gift'
  | 'zap'
  | 'tag'
  | 'truck'
  | 'star'
  | 'crown'
  | 'heart'
  | 'bell'
  | 'none';

export interface FloatingBannerConfig {
  enabled: boolean;
  text: string;
  badgeText: string;
  showBadge: boolean;
  linkText: string;
  linkUrl: string;
  iconName: FloatingBannerIcon;
  showCloseButton: boolean;

  // Typography
  fontFamily: FloatingBannerFont | string;
  fontSize: 'xs' | 'sm' | 'base' | 'lg';
  fontWeight: '400' | '500' | '600' | '700';
  letterSpacing: 'normal' | 'wide' | 'wider' | 'widest';
  textTransform: 'none' | 'uppercase' | 'capitalize';

  // Colors & Visual Styling
  bgStyle: 'solid' | 'gradient' | 'glass';
  bgColor: string;
  bgGradientEnd?: string;
  textColor: string;

  // Accents & Buttons
  badgeBg: string;
  badgeTextColor: string;
  btnBg: string;
  btnTextColor: string;
  borderColor: string;

  // Layout & Visual Effects
  designVariant: FloatingBannerVariant;
  pulseBadge: boolean;
  glowEffect: boolean;
  displayScope: 'home_only' | 'all_pages';
  paddingY?: 'compact' | 'comfortable' | 'spacious';
}

export const DEFAULT_FLOATING_BANNER: FloatingBannerConfig = {
  enabled: true,
  text: 'Complimentary Express Worldwide Shipping & Bespoke Gift Packaging on Orders Over ₹2,999',
  badgeText: 'AUTUMN DROP',
  showBadge: true,
  linkText: 'SHOP NOW',
  linkUrl: '/shop',
  iconName: 'sparkles',
  showCloseButton: true,
  fontFamily: 'Plus Jakarta Sans',
  fontSize: 'xs',
  fontWeight: '600',
  letterSpacing: 'wide',
  textTransform: 'uppercase',
  bgStyle: 'gradient',
  bgColor: '#C85A32',
  bgGradientEnd: '#8E381A',
  textColor: '#FFFFFF',
  badgeBg: '#FFFFFF',
  badgeTextColor: '#C85A32',
  btnBg: '#FFFFFF',
  btnTextColor: '#1F1F1F',
  borderColor: 'rgba(255, 255, 255, 0.25)',
  designVariant: 'floating-pill',
  pulseBadge: true,
  glowEffect: true,
  displayScope: 'home_only',
  paddingY: 'comfortable'
};
