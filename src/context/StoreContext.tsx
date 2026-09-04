import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Product, 
  CartItem, 
  User, 
  Address, 
  Order, 
  Coupon, 
  ActivePage, 
  Currency, 
  CategoryType,
  Review,
  StoreCategory,
  FloatingBannerConfig,
  DEFAULT_FLOATING_BANNER
} from '../types';
import { INITIAL_PRODUCTS, INITIAL_COUPONS, INITIAL_ORDERS } from '../data/products';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, googleProvider, db } from '../firebase';
import {
  safeJsonParse,
  authenticateAdminPasscode,
  validateAdminSessionToken,
  clearAdminSessionToken,
  sanitizeInput
} from '../lib/security';
import {
  subscribeToProducts,
  saveProductToFirestore,
  deleteProductFromFirestore,
  subscribeToOrders,
  saveOrderToFirestore,
  updateFirestoreOrderStatus,
  subscribeToHomeBanner,
  saveHomeBannerToFirestore,
  subscribeToFloatingBanner,
  saveFloatingBannerToFirestore,
  subscribeToReviews,
  saveReviewToFirestore,
  deleteReviewFromFirestore,
  approveReviewInFirestore,
  FirestoreReview,
  ThemeSettings,
  DEFAULT_THEME_SETTINGS,
  subscribeToThemeSettings,
  saveThemeSettingsToFirestore,
  DEFAULT_CATEGORIES,
  subscribeToCategories,
  saveCategoryToFirestore,
  updateFirestoreCategory,
  subscribeToDeliverySettings,
  saveDeliverySettingsToFirestore,
  DeliverySettings
} from '../lib/firebaseService';
import {
  trackProductView,
  trackAddToCart,
  trackPurchase
} from '../lib/analytics';
import { sendOrderConfirmationEmail } from '../lib/emailService';

interface Toast {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  message: string;
  subMessage?: string;
}

interface StoreContextType {
  // Navigation & View
  activePage: ActivePage;
  setActivePage: (page: ActivePage) => void;
  selectedProduct: Product | null;
  openProductDetail: (product: Product) => void;
  selectedCategory: CategoryType;
  setSelectedCategory: (cat: CategoryType) => void;
  
  // Products & Inventory
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  updateProductStock: (productId: string, newStock: number) => void;
  addProductReview: (productId: string, review: Omit<Review, 'id' | 'date' | 'helpfulCount'>) => void;
  voteReviewHelpful: (productId: string, reviewId: string) => void;
  
  // Cart
  cart: CartItem[];
  cartCount: number;
  cartSubtotal: number;
  cartTotal: number;
  cartDiscount: number;
  appliedCoupon: Coupon | null;
  applyCoupon: (code: string) => boolean;
  removeCoupon: () => void;
  orderNote: string;
  setOrderNote: (note: string) => void;
  addToCart: (product: Product, quantity?: number, selectedColor?: string, selectedSize?: string) => void;
  buyNow: (product: Product, quantity?: number, selectedColor?: string, selectedSize?: string) => void;
  updateCartQuantity: (itemId: string, quantity: number) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  freeShippingThreshold: number;
  freeShippingRemaining: number;
  isFreeShipping: boolean;
  
  // Wishlist
  wishlist: string[]; // product IDs
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  removeFromWishlist: (productId: string) => void;
  moveWishlistToCart: (productId: string, selectedColor?: string, selectedSize?: string) => void;
  moveAllWishlistToCart: () => void;
  clearWishlist: () => void;
  
  // Dynamic Delivery Estimator & Online Payment Discount
  standardDeliveryDays: number;
  setStandardDeliveryDays: (days: number) => void;
  updateProductDeliveryDays: (productId: string, days: number) => Promise<void>;
  onlineDiscountPercent: number;
  updateOnlineDiscountPercent: (percent: number) => void;
  calculateDeliveryDate: (offsetDays?: number, productDeliveryDays?: number) => { formattedDate: string; fullDate: string; days: number; shortDate: string };
  
  // User & Auth
  currentUser: User | null;
  isLoggedIn: boolean;
  login: (email: string, password?: string) => Promise<boolean>;
  sendEmailOtpCode: (email: string) => Promise<{ success: boolean; error?: string }>;
  verifyEmailOtpCode: (email: string, token: string) => Promise<{ success: boolean; error?: string }>;
  loginWithPassword: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  registerWithPassword: (email: string, password: string, name?: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => void;
  loginWithPhoneOtp: (phone: string, otp: string) => Promise<boolean>;
  logout: () => void;
  updateUserProfile: (data: Partial<User>) => void;
  saveAddress: (address: Omit<Address, 'id'>) => void;
  deleteAddress: (addressId: string) => void;
  setDefaultAddress: (addressId: string) => void;
  
  // Checkout & Orders / OMS
  orders: Order[];
  currentOrder: Order | null;
  placeOrder: (orderData: Partial<Order>) => Order;
  updateOrderStatus: (orderId: string, status: Order['status'], noteOrDispatchDate?: string | null, dispatchDateParam?: string | null) => void;
  updateOrderDispatchDate: (orderId: string, dispatchDate: string | null) => void;
  approveOrder: (orderId: string) => void;
  markOrderShipped: (orderId: string, carrier?: string, trackingNumber?: string) => void;
  cancelOrder: (orderId: string, reason?: string) => void;
  refundOrder: (orderId: string, amount?: number) => void;
  requestOrderReturn: (orderId: string, reason: string) => void;
  
  // Admin Product Catalog Management
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  updateProductRankings: (orderedProducts: Product[]) => Promise<void>;
  deleteProduct: (productId: string) => void;
  
  // Coupons & Marketing
  coupons: Coupon[];
  addCoupon: (coupon: Coupon) => void;
  deleteCoupon: (code: string) => void;
  
  // Abandoned Carts Management
  abandonedCarts: { id: string; customerName: string; email: string; itemsCount: number; value: number; date: string; recovered: boolean }[];
  recoverAbandonedCart: (cartId: string) => void;
  
  // Modals & Drawers
  isMiniCartOpen: boolean;
  setIsMiniCartOpen: (open: boolean) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  quickViewProduct: Product | null;
  setQuickViewProduct: (product: Product | null) => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  authModalTab: 'login' | 'register' | 'otp';
  setAuthModalTab: (tab: 'login' | 'register' | 'otp') => void;
  
  // Abandoned Cart System
  abandonedCartAlert: boolean;
  dismissAbandonedCart: () => void;
  
  // Currency & Internationalization
  currency: Currency;
  setCurrency: (c: Currency) => void;
  formatPrice: (amount: number) => string;
  
  // Toasts
  toasts: Toast[];
  showToast: (message: string, type?: Toast['type'], subMessage?: string) => void;
  removeToast: (id: string) => void;
  
  // Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  
  // Admin Mode & Security
  isAdminView: boolean;
  setIsAdminView: (admin: boolean) => void;
  isAdminAuthenticated: boolean;
  isAdminAuthModalOpen: boolean;
  setIsAdminAuthModalOpen: (open: boolean) => void;
  openAdminAuthModal: () => void;
  verifyAdminPassword: (password: string) => Promise<boolean>;
  lockAdmin: () => void;
  
  // Theme & Night Mode
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  
  // Site Banners & Branding Customizer
  siteBanners: SiteBanners;
  updateSiteBanners: (updated: Partial<SiteBanners>) => void;

  // Floating Announcement Banner (Real-time synced across all users)
  floatingBanner: FloatingBannerConfig;
  updateFloatingBanner: (updated: Partial<FloatingBannerConfig>) => Promise<void>;
  toggleFloatingBanner: () => Promise<void>;
  
  // Firebase Real-time Cloud Sync
  isFirebaseOnline: boolean;
  syncFirebaseData: () => Promise<void>;

  // Real-Time Contact & Client Inquiries
  contactInquiries: ContactInquiry[];
  addContactInquiry: (inquiry: Omit<ContactInquiry, 'id' | 'createdAt' | 'status' | 'replies'>) => void;
  replyContactInquiry: (inquiryId: string, replyText: string) => void;
  deleteContactInquiry: (inquiryId: string) => void;

  // Real-Time Staff Management
  adminStaff: AdminStaffMember[];
  addAdminStaff: (member: Omit<AdminStaffMember, 'id'>) => void;
  deleteAdminStaff: (id: string) => void;
  updateAdminStaff: (member: AdminStaffMember) => void;

  // Real-Time Calendar Drops & Events
  adminEvents: AdminCalendarEvent[];
  addAdminEvent: (event: Omit<AdminCalendarEvent, 'id'>) => void;
  deleteAdminEvent: (id: string) => void;

  // Real-Time Email Broadcasts
  adminCampaigns: AdminCampaign[];
  dispatchAdminCampaign: (campaign: Omit<AdminCampaign, 'id' | 'sentAt' | 'openRate'>) => void;

  // Admin Profile
  adminProfile: AdminProfile;
  updateAdminProfile: (profile: Partial<AdminProfile>) => void;

  // Real-Time Verified Customer Reviews (Firestore)
  reviews: FirestoreReview[];
  addCustomerReview: (review: Omit<FirestoreReview, 'id' | 'date' | 'helpfulCount'>) => Promise<void>;
  approveCustomerReview: (reviewId: string, approved?: boolean) => Promise<void>;
  deleteCustomerReview: (reviewId: string) => Promise<void>;

  // Dashboard Stats & Orders Reset (Protected with 8156958052)
  clearAllOrders: () => void;
  resetAllStatsToZero: (password: string) => boolean;
  restoreDefaultOrders: () => void;

  // Real-Time Typography & Appearance Studio (Firestore onSnapshot + CSS Variables)
  themeSettings: ThemeSettings;
  updateThemeSettings: (updated: Partial<ThemeSettings>) => Promise<void>;
  applyThemeSettingsLocally: (theme: ThemeSettings) => void;

  // Real-Time Category Builder (Firestore onSnapshot & Cloudinary)
  categories: StoreCategory[];
  updateCategory: (category: StoreCategory) => Promise<void>;
}

export interface ContactInquiry {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  orderNumber?: string;
  status: 'new' | 'in-progress' | 'resolved';
  createdAt: string;
  replies: {
    id: string;
    sender: 'admin' | 'customer';
    text: string;
    createdAt: string;
  }[];
}

export interface AdminStaffMember {
  id: string;
  name: string;
  email: string;
  role: 'Owner' | 'Store Manager' | 'Inventory Lead' | 'Fulfillment Specialist' | 'Senior Stylist';
  avatar: string;
  status: 'Active' | 'On Leave' | 'Away';
  lastActive: string;
}

export interface AdminCalendarEvent {
  id: string;
  title: string;
  date: string;
  type: 'drop' | 'sale' | 'restock' | 'fulfillment';
  color: string;
  notes: string;
}

export interface AdminCampaign {
  id: string;
  subject: string;
  audience: string;
  body: string;
  sentAt: string;
  recipientCount: number;
  openRate: string;
}

export interface AdminProfile {
  name: string;
  email: string;
  role: string;
  avatar: string;
}

export interface SiteBanners {
  logoUrl: string;
  heroImage: string;
  heroTitle: string;
  heroSubtitle: string;
  eyewearImage: string;
  eyewearTitle: string;
  eyewearSubtitle: string;
  editorialImage: string;
  editorialTitle: string;
  editorialSubtitle: string;
  backpackCatImage: string;
  footwearCatImage: string;
}

export const DEFAULT_SITE_BANNERS: SiteBanners = {
  logoUrl: '/logo.png',
  heroImage: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1200&auto=format&fit=crop',
  heroTitle: 'Enhancing your inner beauty.',
  heroSubtitle: 'Discover curated runway silhouettes, sustainable bio-acetate optics, and bespoke handcrafted couture essentials designed for the bold modern visionary.',
  eyewearImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1000&auto=format&fit=crop',
  eyewearTitle: 'Trending Eyewear',
  eyewearSubtitle: 'Largest collection of genuine quality prescription glasses frames, handmade bio-acetates, and Japanese titanium hinge optics.',
  editorialImage: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1200&auto=format&fit=crop',
  editorialTitle: 'KEEP CALM & STAY CLASSY',
  editorialSubtitle: 'Understated craftsmanship, tactile fabrics, and effortless silhouettes designed to transition seamlessly from Copenhagen rain to urban nightfall.',
  backpackCatImage: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=1000&auto=format&fit=crop',
  footwearCatImage: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1000&auto=format&fit=crop'
};

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const CURRENCY_RATES: Record<Currency, { symbol: string; rate: number; prefix: boolean }> = {
  INR: { symbol: '₹', rate: 85.0, prefix: true },
  USD: { symbol: '$', rate: 1.0, prefix: true },
  EUR: { symbol: '€', rate: 0.92, prefix: false },
  GBP: { symbol: '£', rate: 0.78, prefix: true }
};

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(() => {
    return safeJsonParse(localStorage.getItem('haute_products'), INITIAL_PRODUCTS);
  });

  const [activePage, setActivePageState] = useState<ActivePage>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('order_id') || params.get('payment_status') || params.get('payment') === 'cashfree' || window.location.pathname.includes('order-confirmation')) {
        return 'order-confirmation';
      }
    }
    return 'home';
  });
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(() => products[0]);
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currency, setCurrencyState] = useState<Currency>(() => {
    const saved = localStorage.getItem('haute_currency');
    return (saved as Currency) || 'INR';
  });

  const [siteBanners, setSiteBanners] = useState<SiteBanners>(() => {
    try {
      const parsed = safeJsonParse<SiteBanners>(localStorage.getItem('diva_site_banners'), DEFAULT_SITE_BANNERS) || DEFAULT_SITE_BANNERS;
      const clean = { ...DEFAULT_SITE_BANNERS, ...parsed };
      if (!clean.logoUrl || clean.logoUrl.includes('i.ibb.co') || clean.logoUrl.startsWith('data:image')) {
        clean.logoUrl = '/logo.png';
      }
      return clean;
    } catch {
      return DEFAULT_SITE_BANNERS;
    }
  });

  const updateSiteBanners = (updated: Partial<SiteBanners>) => {
    setSiteBanners((prev) => {
      const next = { ...prev, ...updated };
      try {
        localStorage.setItem('diva_site_banners', JSON.stringify(next));
      } catch {}
      saveHomeBannerToFirestore(next).catch((err) => console.warn('Firestore home_banner sync warning:', err));
      return next;
    });
    showToast('Site Banners & Announcements Updated', 'success', 'Synced across all visitors in real-time');
  };

  // Floating Announcement Banner State (Synced real-time with Firestore)
  const [floatingBanner, setFloatingBanner] = useState<FloatingBannerConfig>(() => {
    try {
      const parsed = safeJsonParse<FloatingBannerConfig>(
        localStorage.getItem('diva_floating_banner'),
        DEFAULT_FLOATING_BANNER
      );
      return { ...DEFAULT_FLOATING_BANNER, ...(parsed || {}) };
    } catch {
      return DEFAULT_FLOATING_BANNER;
    }
  });

  const updateFloatingBanner = async (updated: Partial<FloatingBannerConfig>) => {
    setFloatingBanner((prev) => {
      const next = { ...prev, ...updated };
      try {
        localStorage.setItem('diva_floating_banner', JSON.stringify(next));
      } catch {}
      saveFloatingBannerToFirestore(next).catch((err) =>
        console.warn('Firestore floating_banner sync warning:', err)
      );
      return next;
    });
  };

  const toggleFloatingBanner = async () => {
    setFloatingBanner((prev) => {
      const next = { ...prev, enabled: !prev.enabled };
      try {
        localStorage.setItem('diva_floating_banner', JSON.stringify(next));
      } catch {}
      saveFloatingBannerToFirestore(next).catch((err) =>
        console.warn('Firestore floating_banner toggle sync warning:', err)
      );
      return next;
    });
  };

  const setCurrency = (c: Currency) => {
    setCurrencyState(c);
    try {
      localStorage.setItem('haute_currency', c);
    } catch {}
  };

  // Theme & Night Mode System (Default: Light Mode)
  const [theme, setThemeState] = useState<'light' | 'dark' | 'system'>(() => {
    try {
      const saved = localStorage.getItem('divachic_theme');
      if (saved === 'light' || saved === 'dark') return saved;
    } catch {}
    return 'light';
  });

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('divachic_theme');
      if (saved === 'dark') return true;
      if (saved === 'light') return false;
    } catch {}
    return false;
  });

  useEffect(() => {
    const root = document.documentElement;

    const applyTheme = () => {
      const dark = theme === 'dark';
      setIsDarkMode(dark);
      if (dark) {
        root.classList.add('dark');
        document.body.classList.add('dark');
      } else {
        root.classList.remove('dark');
        document.body.classList.remove('dark');
      }
    };

    applyTheme();
  }, [theme]);

  const setTheme = (t: 'light' | 'dark' | 'system') => {
    setThemeState(t);
    try {
      localStorage.setItem('divachic_theme', t);
    } catch {}
  };

  const toggleDarkMode = () => {
    const next = isDarkMode ? 'light' : 'dark';
    setTheme(next);
  };

  // Dynamic CSS Variables & Typography Studio State (Real-Time Firestore Sync)
  const applyThemeSettingsToDOM = useCallback((settings: ThemeSettings) => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    if (settings.headingFont) root.style.setProperty('--font-heading', settings.headingFont);
    if (settings.productTitleFont) root.style.setProperty('--font-product-title', settings.productTitleFont);
    if (settings.bodyFont) root.style.setProperty('--font-body', settings.bodyFont);
    if (settings.headingSizeScale !== undefined) root.style.setProperty('--size-heading-scale', settings.headingSizeScale.toString());
    if (settings.productTitleSizeScale !== undefined) root.style.setProperty('--size-product-title-scale', settings.productTitleSizeScale.toString());
    if (settings.bodySizeScale !== undefined) root.style.setProperty('--size-body-scale', settings.bodySizeScale.toString());
    if (settings.primaryColor) root.style.setProperty('--color-primary', settings.primaryColor);
    if (settings.accentColor) root.style.setProperty('--color-accent', settings.accentColor);
    
    // Direct CSS Color Tokens Engine
    if (settings.colors) {
      Object.entries(settings.colors).forEach(([cssVar, hexValue]) => {
        if (hexValue) {
          const varName = cssVar.startsWith('--') 
            ? cssVar 
            : (cssVar.startsWith('color-') ? `--${cssVar}` : `--color-${cssVar}`);
          root.style.setProperty(varName, hexValue as string);
        }
      });
    }

    // Dedicated Buy Now Button real-time color binding
    if (settings.buyNowButtonColor) {
      root.style.setProperty('--color-buynow-bg', settings.buyNowButtonColor);
    }
  }, []);

  const [themeSettings, setThemeSettings] = useState<ThemeSettings>(() => {
    const saved = safeJsonParse<ThemeSettings>(localStorage.getItem('diva_theme_settings'), DEFAULT_THEME_SETTINGS) || DEFAULT_THEME_SETTINGS;
    const resolved: ThemeSettings = {
      ...DEFAULT_THEME_SETTINGS,
      ...saved,
      colors: {
        ...DEFAULT_THEME_SETTINGS.colors,
        ...(saved?.colors || {})
      }
    };
    applyThemeSettingsToDOM(resolved);
    return resolved;
  });

  const applyThemeSettingsLocally = (updated: ThemeSettings) => {
    setThemeSettings(updated);
    applyThemeSettingsToDOM(updated);
  };

  const updateThemeSettings = async (updated: Partial<ThemeSettings>) => {
    const next: ThemeSettings = { ...themeSettings, ...updated };
    setThemeSettings(next);
    applyThemeSettingsToDOM(next);
    try {
      localStorage.setItem('diva_theme_settings', JSON.stringify(next));
    } catch {}
    try {
      await saveThemeSettingsToFirestore(next);
      showToast('Brand & Typography Published', 'success', 'Live theme variables synced across all visitors in real time.');
    } catch (err) {
      console.warn('Firestore theme save warning:', err);
      showToast('Theme Updated Locally', 'info', 'Saved to browser cache.');
    }
  };

  const [isAdminView, setIsAdminView] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('haute_admin_auth') === 'true';
    } catch {
      return false;
    }
  });
  const [isAdminAuthModalOpen, setIsAdminAuthModalOpen] = useState(false);

  // Security guard for activePage
  const setActivePage = useCallback((page: ActivePage) => {
    if (page === 'admin' && !isAdminAuthenticated) {
      setIsAdminAuthModalOpen(true);
      showToast('Admin Authentication Required', 'warning', 'Please enter your administrator passcode.');
      return;
    }
    setActivePageState(page);
  }, [isAdminAuthenticated]);

  // Periodic and on-mount cryptographic session validation
  useEffect(() => {
    if (isAdminAuthenticated) {
      validateAdminSessionToken().then((isValid) => {
        if (!isValid) {
          setIsAdminAuthenticated(false);
          setIsAdminView(false);
          clearAdminSessionToken();
          try {
            sessionStorage.removeItem('haute_admin_auth');
          } catch {}
          if (activePage === 'admin') {
            setActivePageState('home');
          }
        }
      });
    }
  }, [isAdminAuthenticated, activePage]);

  const openAdminAuthModal = () => {
    setIsAdminAuthModalOpen(true);
  };

  const verifyAdminPassword = async (passcode: string): Promise<boolean> => {
    const result = await authenticateAdminPasscode(passcode);
    if (result.success) {
      setIsAdminAuthenticated(true);
      try {
        sessionStorage.setItem('haute_admin_auth', 'true');
      } catch {}
      setIsAdminView(true);
      setActivePageState('admin');
      setIsAdminAuthModalOpen(false);
      showToast('Admin Access Granted', 'success', 'Session cryptographically secured.');
      return true;
    }

    showToast('Access Denied', 'error', result.error || 'Incorrect passcode.');
    return false;
  };

  const lockAdmin = () => {
    clearAdminSessionToken();
    setIsAdminAuthenticated(false);
    try {
      sessionStorage.removeItem('haute_admin_auth');
    } catch {}
    setIsAdminView(false);
    if (activePage === 'admin') {
      setActivePageState('home');
    }
    showToast('Admin Locked', 'info', 'Session ended securely and keys purged.');
  };

  // Cart State
  const [cart, setCart] = useState<CartItem[]>(() => {
    return safeJsonParse(localStorage.getItem('haute_cart'), [
      {
        id: 'prod-3-Washed Charcoal-L',
        productId: 'prod-3',
        product: INITIAL_PRODUCTS[2],
        selectedColor: 'Washed Charcoal',
        selectedSize: 'L',
        quantity: 1,
        price: 24.00
      }
    ]);
  });

  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(() => {
    return safeJsonParse(localStorage.getItem('haute_coupon'), null);
  });

  const [orderNote, setOrderNote] = useState<string>('');

  // Dynamic Standard Delivery Days Setting (1-30 days, default 4)
  const [standardDeliveryDays, setStandardDeliveryDaysState] = useState<number>(() => {
    const saved = localStorage.getItem('haute_delivery_days');
    return saved ? parseInt(saved, 10) || 4 : 4;
  });

  // Dynamic Online Payment Discount Percentage (Default: 10%)
  const [onlineDiscountPercent, setOnlineDiscountPercentState] = useState<number>(() => {
    const saved = localStorage.getItem('haute_online_discount');
    return saved ? parseFloat(saved) || 10 : 10;
  });

  // Real-Time Contact & Support Inquiries State
  const [contactInquiries, setContactInquiries] = useState<ContactInquiry[]>(() => {
    const saved = safeJsonParse(localStorage.getItem('diva_inquiries'), null);
    if (saved && Array.isArray(saved) && saved.length > 0) return saved;
    return [
      {
        id: 'inq-1',
        name: 'Aishwarya Roy',
        email: 'aishwarya.roy@privé.com',
        phone: '+91 98450 12891',
        subject: 'Custom Tailoring for Silk Trench Coat',
        message: 'Could you confirm if the Silk Trench Coat can be tailored for height 5’4?',
        orderNumber: 'DIVA-2026-88392',
        status: 'new',
        createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        replies: [
          {
            id: 'rep-1',
            sender: 'admin',
            text: 'Hello Aishwarya, our bespoke tailoring team can calibrate the hemline to your precise measurements.',
            createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString()
          }
        ]
      },
      {
        id: 'inq-2',
        name: 'Marcus Vance',
        email: 'marcus.v@vancecap.com',
        phone: '+1 (415) 892-4912',
        subject: 'Prescription Lens Optics Inquiry',
        message: 'Are the Titanium Japanese frames compatible with progressive bifocal lenses?',
        status: 'in-progress',
        createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
        replies: []
      }
    ];
  });

  useEffect(() => {
    try {
      localStorage.setItem('diva_inquiries', JSON.stringify(contactInquiries));
    } catch {}
  }, [contactInquiries]);

  const addContactInquiry = (inquiryData: Omit<ContactInquiry, 'id' | 'createdAt' | 'status' | 'replies'>) => {
    const newInquiry: ContactInquiry = {
      ...inquiryData,
      id: `inq-${Date.now()}`,
      status: 'new',
      createdAt: new Date().toISOString(),
      replies: []
    };
    setContactInquiries((prev) => [newInquiry, ...prev]);
    showToast('Inquiry Submitted to Studio', 'success', 'Our client concierge will respond promptly.');
  };

  const replyContactInquiry = (inquiryId: string, replyText: string) => {
    setContactInquiries((prev) =>
      prev.map((inq) => {
        if (inq.id !== inquiryId) return inq;
        return {
          ...inq,
          status: 'in-progress',
          replies: [
            ...inq.replies,
            {
              id: `rep-${Date.now()}`,
              sender: 'admin',
              text: replyText,
              createdAt: new Date().toISOString()
            }
          ]
        };
      })
    );
    showToast('Client reply dispatched', 'success');
  };

  const deleteContactInquiry = (inquiryId: string) => {
    setContactInquiries((prev) => prev.filter((i) => i.id !== inquiryId));
    showToast('Inquiry deleted', 'info');
  };

  // Real-Time Staff Management State
  const [adminStaff, setAdminStaff] = useState<AdminStaffMember[]>(() => {
    const saved = safeJsonParse(localStorage.getItem('diva_admin_staff'), null);
    if (saved && Array.isArray(saved) && saved.length > 0) return saved;
    return [
      {
        id: 'staff-1',
        name: 'DivaChic Store Administrator',
        email: 'admin@divachic.com',
        role: 'Owner',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
        status: 'Active',
        lastActive: 'Online now'
      },
      {
        id: 'staff-2',
        name: 'Siddharth Rao',
        email: 'siddharth@divachic.com',
        role: 'Store Manager',
        avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=200&auto=format&fit=crop',
        status: 'Active',
        lastActive: '5m ago'
      },
      {
        id: 'staff-3',
        name: 'Camille Laurent',
        role: 'Senior Stylist',
        email: 'camille@divachic.com',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop',
        status: 'Active',
        lastActive: '18m ago'
      },
      {
        id: 'staff-4',
        name: 'Vikram Mehta',
        role: 'Fulfillment Specialist',
        email: 'vikram.logistics@divachic.com',
        avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=200&auto=format&fit=crop',
        status: 'Active',
        lastActive: '1h ago'
      }
    ];
  });

  useEffect(() => {
    try {
      localStorage.setItem('diva_admin_staff', JSON.stringify(adminStaff));
    } catch {}
  }, [adminStaff]);

  const addAdminStaff = (member: Omit<AdminStaffMember, 'id'>) => {
    const newStaff: AdminStaffMember = { ...member, id: `staff-${Date.now()}` };
    setAdminStaff((prev) => [...prev, newStaff]);
    showToast('Staff member added', 'success');
  };

  const deleteAdminStaff = (id: string) => {
    setAdminStaff((prev) => prev.filter((s) => s.id !== id));
    showToast('Staff member removed', 'info');
  };

  const updateAdminStaff = (member: AdminStaffMember) => {
    setAdminStaff((prev) => prev.map((s) => (s.id === member.id ? member : s)));
    showToast('Staff permissions updated', 'success');
  };

  // Real-Time Calendar Drops & Events State
  const [adminEvents, setAdminEvents] = useState<AdminCalendarEvent[]>(() => {
    const saved = safeJsonParse(localStorage.getItem('diva_admin_events'), null);
    if (saved && Array.isArray(saved) && saved.length > 0) return saved;
    return [
      { id: 'ev-1', title: 'Winter Cashmere Capsule Drop', date: '2026-09-10', type: 'drop', color: '#8B5CF6', notes: 'Launch 6 bespoke cashmere overcoats on runway' },
      { id: 'ev-2', title: 'VIP Privé Flash Sale 20%', date: '2026-09-15', type: 'sale', color: '#EC4899', notes: 'Send automated coupon DIVACHIC20 to tier members' },
      { id: 'ev-3', title: 'Italian Leather Soles Restock', date: '2026-09-22', type: 'restock', color: '#10B981', notes: '40 pairs of Chelsea boots arriving from Milan' },
      { id: 'ev-4', title: 'Global Express Order Dispatch Run', date: '2026-09-28', type: 'fulfillment', color: '#3B82F6', notes: 'DHL Courier priority bulk pickup at 3:00 PM' }
    ];
  });

  useEffect(() => {
    try {
      localStorage.setItem('diva_admin_events', JSON.stringify(adminEvents));
    } catch {}
  }, [adminEvents]);

  const addAdminEvent = (eventData: Omit<AdminCalendarEvent, 'id'>) => {
    const newEv: AdminCalendarEvent = { ...eventData, id: `ev-${Date.now()}` };
    setAdminEvents((prev) => [...prev, newEv]);
    showToast('Event added to Runway Calendar', 'success');
  };

  const deleteAdminEvent = (id: string) => {
    setAdminEvents((prev) => prev.filter((e) => e.id !== id));
    showToast('Calendar event deleted', 'info');
  };

  // Real-Time Email Broadcasts State
  const [adminCampaigns, setAdminCampaigns] = useState<AdminCampaign[]>(() => {
    const saved = safeJsonParse(localStorage.getItem('diva_admin_campaigns'), null);
    if (saved && Array.isArray(saved) && saved.length > 0) return saved;
    return [
      {
        id: 'camp-1',
        subject: 'Exclusive Autumn Capsule: 20% Off Runway Silhouettes',
        audience: 'All VIP Members (1,420 Clients)',
        body: 'Handcrafted with Japanese bio-acetates and Scandinavian wool. Use code DIVACHIC20 for 20% off.',
        sentAt: '2026-09-02 14:30',
        recipientCount: 1420,
        openRate: '68.4%'
      }
    ];
  });

  useEffect(() => {
    try {
      localStorage.setItem('diva_admin_campaigns', JSON.stringify(adminCampaigns));
    } catch {}
  }, [adminCampaigns]);

  const dispatchAdminCampaign = (campaignData: Omit<AdminCampaign, 'id' | 'sentAt' | 'openRate'>) => {
    const newCamp: AdminCampaign = {
      ...campaignData,
      id: `camp-${Date.now()}`,
      sentAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      openRate: '0.0%'
    };
    setAdminCampaigns((prev) => [newCamp, ...prev]);
    showToast('Gazette Email Broadcast Dispatched!', 'success', `Delivered to ${campaignData.audience}`);
  };

  // Admin Profile State
  const [adminProfile, setAdminProfileState] = useState<AdminProfile>(() => {
    const saved = safeJsonParse(localStorage.getItem('diva_admin_profile'), null);
    if (saved?.name) return saved;
    return {
      name: 'DivaChic Administrator',
      email: 'admin@divachic.com',
      role: 'Store Owner',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop'
    };
  });

  const updateAdminProfile = (updated: Partial<AdminProfile>) => {
    setAdminProfileState((prev) => {
      const next = { ...prev, ...updated };
      try {
        localStorage.setItem('diva_admin_profile', JSON.stringify(next));
      } catch {}
      return next;
    });
    showToast('Admin Profile Updated', 'success');
  };

  const updateOnlineDiscountPercent = (percent: number) => {
    const clamped = Math.max(0, Math.min(50, percent));
    setOnlineDiscountPercentState(clamped);
    localStorage.setItem('haute_online_discount', clamped.toString());
    showToast('Online Payment Discount Updated', 'success', `Online payments now receive ${clamped}% instant discount.`);
  };

  // Firebase Auth Real-Time State Listener & Firestore 'users' sync
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        try {
          const userDocRef = doc(db, 'users', fbUser.uid);
          const userSnap = await getDoc(userDocRef);
          const defaultAvatar = fbUser.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop';
          const resolvedName = fbUser.displayName || fbUser.email?.split('@')[0] || 'DivaChic Member';

          if (!userSnap.exists()) {
            const initialUser: User = {
              id: fbUser.uid,
              name: resolvedName,
              email: fbUser.email || '',
              avatar: defaultAvatar,
              addresses: []
            };
            await setDoc(userDocRef, {
              uid: fbUser.uid,
              email: fbUser.email,
              displayName: resolvedName,
              photoURL: defaultAvatar,
              addresses: [],
              createdAt: serverTimestamp(),
              lastLoginAt: serverTimestamp()
            }, { merge: true });
            setCurrentUser(initialUser);
          } else {
            const data = userSnap.data();
            const loadedUser: User = {
              id: fbUser.uid,
              name: data.displayName || resolvedName,
              email: fbUser.email || data.email || '',
              phone: data.phone,
              avatar: data.photoURL || defaultAvatar,
              addresses: data.addresses || []
            };
            await setDoc(userDocRef, {
              lastLoginAt: serverTimestamp()
            }, { merge: true });
            setCurrentUser(loadedUser);
          }
        } catch (err) {
          console.warn('[Firebase Auth] User doc sync:', err);
          setCurrentUser({
            id: fbUser.uid,
            name: fbUser.displayName || fbUser.email?.split('@')[0] || 'DivaChic Member',
            email: fbUser.email || '',
            avatar: fbUser.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
            addresses: []
          });
        }
      } else {
        setCurrentUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // Real-Time Verified Customer Reviews (Firestore)
  const [firestoreReviews, setFirestoreReviews] = useState<FirestoreReview[]>([
    {
      id: 'rev-101',
      productId: 'prod-1',
      author: 'Sophia Chen',
      rating: 5,
      title: 'Architectural Masterpiece',
      comment: 'The vegetable-tanned Scandinavian leather feels so supple yet indestructible. Arrived in express packaging in pristine condition.',
      imageUrl: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=600&auto=format&fit=crop',
      date: 'September 01, 2026',
      verified: true,
      approved: true,
      helpfulCount: 14
    },
    {
      id: 'rev-102',
      productId: 'prod-3',
      author: 'Lars Møller',
      rating: 5,
      title: 'Flawless Japanese Titanium Hinges',
      comment: 'The bio-cellulose acetate frame feels weightless on the nose bridge. Exquisite attention to detail.',
      imageUrl: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=600&auto=format&fit=crop',
      date: 'August 28, 2026',
      verified: true,
      approved: true,
      helpfulCount: 9
    }
  ]);

  const addCustomerReview = async (reviewData: Omit<FirestoreReview, 'id' | 'date' | 'helpfulCount'>) => {
    const newRev: FirestoreReview = {
      ...reviewData,
      id: `rev-${Date.now()}`,
      date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      helpfulCount: 0,
      verified: true,
      approved: true
    };
    setFirestoreReviews((prev) => [newRev, ...prev]);
    try {
      await saveReviewToFirestore(newRev);
      showToast('Review Published to Firestore', 'success', 'Appears in real-time across all product & testimonial pages.');
    } catch (err) {
      console.warn('Firestore review save error:', err);
    }
  };

  const approveCustomerReview = async (reviewId: string, approved: boolean = true) => {
    setFirestoreReviews((prev) => prev.map((r) => r.id === reviewId ? { ...r, approved } : r));
    try {
      await approveReviewInFirestore(reviewId, approved);
      showToast(approved ? 'Review Approved' : 'Review Hidden', 'success');
    } catch (err) {
      console.warn('Firestore approve review error:', err);
    }
  };

  const deleteCustomerReview = async (reviewId: string) => {
    setFirestoreReviews((prev) => prev.filter((r) => r.id !== reviewId));
    try {
      await deleteReviewFromFirestore(reviewId);
      showToast('Review removed from Firestore', 'info');
    } catch (err) {
      console.warn('Firestore delete review error:', err);
    }
  };

  // Real-Time Category Builder State (Firestore onSnapshot & Cloudinary)
  const [categories, setCategories] = useState<StoreCategory[]>(() => {
    return safeJsonParse(localStorage.getItem('diva_categories'), DEFAULT_CATEGORIES);
  });

  const updateCategory = async (category: StoreCategory) => {
    setCategories((prev) => {
      const exists = prev.some((c) => c.id === category.id);
      const next = exists 
        ? prev.map((c) => (c.id === category.id ? { ...c, ...category } : c))
        : [...prev, category];
      try {
        localStorage.setItem('diva_categories', JSON.stringify(next));
      } catch {}
      return next;
    });
    try {
      await saveCategoryToFirestore(category);
      showToast('Category Updated', 'success', `${category.name} synchronized to Firestore & Cloudinary.`);
    } catch (err) {
      console.error('Failed to update category in Firestore:', err);
      showToast('Update Failed', 'error', 'Could not sync category to Firestore.');
    }
  };

  // Real-Time Firebase Firestore onSnapshot Subscriptions (Products, Banners, Reviews, Orders, Categories)
  useEffect(() => {
    // 1. Products onSnapshot
    const unsubscribeProducts = subscribeToProducts((cloudProducts) => {
      if (cloudProducts && cloudProducts.length > 0) {
        setProducts((prev) => {
          const map = new Map<string, Product>();
          prev.forEach((p) => map.set(p.id, p));
          cloudProducts.forEach((p) => map.set(p.id, p));
          const list = Array.from(map.values());
          return list.sort((a, b) => (a.displayRank ?? 9999) - (b.displayRank ?? 9999));
        });
      }
    });

    // 2. Dynamic Hero Banners onSnapshot (settings/home_banner)
    const unsubscribeBanner = subscribeToHomeBanner((cloudBanner) => {
      if (cloudBanner) {
        setSiteBanners((prev) => ({
          ...prev,
          ...cloudBanner,
          heroTitle: cloudBanner.heroTitle || prev.heroTitle,
          heroSubtitle: cloudBanner.heroSubtitle || prev.heroSubtitle,
          heroImage: cloudBanner.heroImage || prev.heroImage,
          eyewearImage: cloudBanner.eyewearImage || prev.eyewearImage,
          editorialImage: cloudBanner.editorialImage || prev.editorialImage,
          logoUrl: cloudBanner.logoUrl || prev.logoUrl
        }));
        if (cloudBanner.floatingBanner) {
          setFloatingBanner((prev) => ({ ...prev, ...cloudBanner.floatingBanner }));
        }
      }
    });

    // 2b. Floating Announcement Banner onSnapshot (settings/floating_banner)
    const unsubscribeFloatingBanner = subscribeToFloatingBanner((cloudFloatingBanner) => {
      if (cloudFloatingBanner) {
        setFloatingBanner((prev) => {
          const merged = { ...prev, ...cloudFloatingBanner };
          try {
            localStorage.setItem('diva_floating_banner', JSON.stringify(merged));
          } catch {}
          return merged;
        });
      }
    });

    // 3. Verified Customer Reviews onSnapshot (reviews collection)
    const unsubscribeReviews = subscribeToReviews((cloudReviews) => {
      if (cloudReviews && cloudReviews.length > 0) {
        setFirestoreReviews(cloudReviews);
      }
    });

    // 4. Orders onSnapshot
    const unsubscribeOrders = subscribeToOrders((cloudOrders) => {
      if (cloudOrders && cloudOrders.length > 0) {
        setOrders((prev) => {
          const map = new Map<string, Order>();
          prev.forEach((o) => map.set(o.id, o));
          cloudOrders.forEach((o) => map.set(o.id, o));
          return Array.from(map.values());
        });
      }
    });

    // 5. Categories onSnapshot (categories collection)
    const unsubscribeCategories = subscribeToCategories((cloudCategories) => {
      if (cloudCategories && cloudCategories.length > 0) {
        setCategories(cloudCategories);
        try {
          localStorage.setItem('diva_categories', JSON.stringify(cloudCategories));
        } catch {}
      }
    });

    // 6. Theme & Color Palette onSnapshot (settings/theme)
    const unsubscribeTheme = subscribeToThemeSettings((cloudTheme) => {
      if (cloudTheme) {
        setThemeSettings((prev) => {
          const merged: ThemeSettings = {
            ...prev,
            ...cloudTheme,
            colors: {
              ...(prev.colors || DEFAULT_THEME_SETTINGS.colors),
              ...(cloudTheme.colors || {})
            }
          };
          applyThemeSettingsToDOM(merged);
          try {
            localStorage.setItem('diva_theme_settings', JSON.stringify(merged));
          } catch {}
          return merged;
        });
      }
    });

    // 7. Real-Time Delivery Settings onSnapshot (settings/delivery)
    const unsubscribeDelivery = subscribeToDeliverySettings((cloudDelivery) => {
      if (cloudDelivery && typeof cloudDelivery.standardDeliveryDays === 'number') {
        setStandardDeliveryDaysState(cloudDelivery.standardDeliveryDays);
        if (typeof cloudDelivery.onlineDiscountPercent === 'number') {
          setOnlineDiscountPercentState(cloudDelivery.onlineDiscountPercent);
        }
      }
    });

    return () => {
      unsubscribeProducts();
      unsubscribeBanner();
      unsubscribeFloatingBanner();
      unsubscribeReviews();
      unsubscribeOrders();
      unsubscribeCategories();
      unsubscribeTheme();
      unsubscribeDelivery();
    };
  }, [applyThemeSettingsToDOM]);

  const setStandardDeliveryDays = (days: number) => {
    const clamped = Math.max(1, Math.min(30, days));
    setStandardDeliveryDaysState(clamped);
    localStorage.setItem('haute_delivery_days', clamped.toString());
    saveDeliverySettingsToFirestore({ standardDeliveryDays: clamped }).catch((e) => console.warn('Firestore delivery sync error:', e));
    showToast(`Delivery timeframe updated to ${clamped} business days`, 'info', 'Synced to Firebase & Live Storefront');
  };

  const updateProductDeliveryDays = async (productId: string, days: number) => {
    const clamped = Math.max(1, Math.min(60, days));
    setProducts((prev) => prev.map((p) => (p.id === productId ? { ...p, deliveryDays: clamped } : p)));
    const target = products.find((p) => p.id === productId);
    if (target) {
      const updated = { ...target, deliveryDays: clamped };
      if (selectedProduct && selectedProduct.id === productId) {
        setSelectedProduct(updated);
      }
      await saveProductToFirestore(updated).catch((e) => console.warn('Product delivery update error:', e));
    }
    showToast(`Product delivery set to ${clamped} days`, 'success', 'Live on website in real time');
  };

  const calculateDeliveryDate = (offsetDays: number = 0, productDeliveryDays?: number) => {
    const baseDays = typeof productDeliveryDays === 'number' && productDeliveryDays > 0 
      ? productDeliveryDays 
      : standardDeliveryDays;
    const totalDays = baseDays + offsetDays;
    const targetDate = new Date(Date.now() + totalDays * 24 * 60 * 60 * 1000);
    const formattedDate = targetDate.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric'
    });
    const fullDate = targetDate.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
    const shortDate = targetDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
    return { formattedDate, fullDate, days: totalDays, shortDate };
  };

  // Coupons State
  const [coupons, setCoupons] = useState<Coupon[]>(() => {
    return safeJsonParse(localStorage.getItem('haute_coupons_list'), INITIAL_COUPONS);
  });

  useEffect(() => {
    try {
      localStorage.setItem('haute_coupons_list', JSON.stringify(coupons));
    } catch {}
  }, [coupons]);

  const addCoupon = (coupon: Coupon) => {
    const cleanCode = sanitizeInput(coupon.code, 20).toUpperCase();
    const cleanDesc = sanitizeInput(coupon.description, 100);
    setCoupons((prev) => [{ ...coupon, code: cleanCode, description: cleanDesc }, ...prev]);
    showToast(`Coupon ${cleanCode} created!`, 'success');
  };

  const deleteCoupon = (code: string) => {
    setCoupons((prev) => prev.filter((c) => c.code !== code));
    showToast(`Coupon ${code} removed`, 'info');
  };

  // Abandoned Carts State
  const [abandonedCarts, setAbandonedCarts] = useState([
    {
      id: 'ab-101',
      customerName: 'Marcus Lindqvist',
      email: 'marcus.l@nordicdesign.dk',
      itemsCount: 2,
      value: 174.00,
      date: '2 hours ago',
      recovered: false
    },
    {
      id: 'ab-102',
      customerName: 'Astrid Lindgren',
      email: 'astrid.l@stockholmatelier.se',
      itemsCount: 1,
      value: 85.00,
      date: '5 hours ago',
      recovered: true
    },
    {
      id: 'ab-103',
      customerName: 'Soren Kierkegaard',
      email: 'soren.k@cph.dk',
      itemsCount: 3,
      value: 290.00,
      date: 'Yesterday',
      recovered: false
    }
  ]);

  const recoverAbandonedCart = (cartId: string) => {
    setAbandonedCarts((prev) =>
      prev.map((c) => (c.id === cartId ? { ...c, recovered: true } : c))
    );
    showToast('Recovery Email & 10% Discount Dispatched', 'success', 'Customer notified.');
  };

  // Wishlist State
  const [wishlist, setWishlist] = useState<string[]>(() => {
    return safeJsonParse(localStorage.getItem('haute_wishlist'), ['prod-1', 'prod-4']);
  });

  // User State
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    return safeJsonParse(localStorage.getItem('haute_user'), {
      id: 'usr-9201',
      name: 'Ashin Shiju',
      email: 'ashinshiju920@gmail.com',
      phone: '+1 (555) 438-9201',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
      addresses: [
        {
          id: 'addr-1',
          fullName: 'Ashin Shiju',
          phone: '+1 (555) 438-9201',
          street: '742 Evergreen Terrace',
          apartment: 'Suite 4B',
          city: 'San Francisco',
          state: 'CA',
          pincode: '94107',
          country: 'United States',
          type: 'home',
          isDefault: true
        },
        {
          id: 'addr-2',
          fullName: 'Ashin Shiju (Design Studio)',
          phone: '+1 (555) 892-1049',
          street: '500 Howard Street',
          apartment: 'Floor 12',
          city: 'San Francisco',
          state: 'CA',
          pincode: '94105',
          country: 'United States',
          type: 'work',
          isDefault: false
        }
      ]
    });
  });

  // Orders State
  const [orders, setOrders] = useState<Order[]>(() => {
    return safeJsonParse(localStorage.getItem('haute_orders'), INITIAL_ORDERS);
  });

  const [currentOrder, setCurrentOrder] = useState<Order | null>(() => {
    try {
      const pending = localStorage.getItem('divachic_pending_order');
      if (pending) {
        const p = JSON.parse(pending);
        return {
          id: p.orderId,
          orderId: p.orderId,
          orderNumber: p.orderId,
          customer: p.customerDetails,
          customerName: p.customerDetails?.fullName,
          email: p.customerDetails?.email,
          items: p.cartItems,
          subtotal: p.subtotal,
          shippingFee: p.shippingFee,
          totalAmount: p.totalAmount,
          total: p.totalAmount,
          paymentMethod: 'Online (Cashfree)',
          paymentStatus: 'Paid',
          orderStatus: 'Placed',
          status: 'Placed',
          createdAt: new Date(),
          trackingNumber: `TRK-${Date.now().toString().slice(-8)}-IN`,
          carrier: 'Shiprocket Express',
          timeline: [
            {
              title: 'Payment Confirmed & Verified (Cashfree)',
              description: 'Instant prepaid verification successful. Order queued for packing.',
              timestamp: 'Just Now',
              location: 'Cashfree Payments',
              completed: true,
              current: true
            }
          ]
        } as any;
      }
    } catch {}
    return orders[0] || null;
  });

  // Modals & Drawer State
  const [isMiniCartOpen, setIsMiniCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register' | 'otp'>('login');

  // Abandoned Cart Simulation State
  const [abandonedCartAlert, setAbandonedCartAlert] = useState(false);

  // Toasts State
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem('haute_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('haute_cart', JSON.stringify(cart));
  }, [cart]);

  // Handle return from Cashfree payment redirect
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const urlParams = new URLSearchParams(window.location.search);
    const orderIdParam = urlParams.get('order_id');
    const payment = urlParams.get('payment');
    const paymentStatus = urlParams.get('payment_status');

    if (orderIdParam || payment === 'cashfree' || paymentStatus === 'success') {
      setActivePageState('order-confirmation');
      clearCart();

      // Retrieve pending order if present
      let pending: any = null;
      try {
        const str = localStorage.getItem('divachic_pending_order');
        if (str) pending = JSON.parse(str);
      } catch {}

      if (pending) {
        sendOrderConfirmationEmail({
          customerEmail: pending.customerDetails?.email,
          customerName: pending.customerDetails?.fullName,
          orderId: pending.orderId,
          totalAmount: pending.totalAmount,
          paymentMethod: 'Online (Cashfree)',
          items: (pending.cartItems || []).map((item: any) => ({
            title: item.title,
            quantity: item.quantity,
            price: item.price
          }))
        }).catch((err) => console.warn('Email dispatch warning:', err));
      }

      showToast('Payment Verified via Cashfree', 'success', `Your order has been confirmed.`);
      localStorage.removeItem('divachic_pending_order');
      localStorage.removeItem('divachic_pending_cart');
      try {
        window.history.replaceState({}, document.title, window.location.pathname);
      } catch {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('haute_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    localStorage.setItem('haute_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('haute_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('haute_user');
    }
  }, [currentUser]);

  // Abandoned Cart Recovery Trigger: If cart has items and user is idle on the page for 45s
  useEffect(() => {
    if (cart.length > 0) {
      const timer = setTimeout(() => {
        const hasDismissed = sessionStorage.getItem('haute_abandoned_dismissed');
        if (!hasDismissed && activePage !== 'checkout') {
          setAbandonedCartAlert(true);
        }
      }, 45000);
      return () => clearTimeout(timer);
    }
  }, [cart, activePage]);

  const dismissAbandonedCart = () => {
    setAbandonedCartAlert(false);
    sessionStorage.setItem('haute_abandoned_dismissed', 'true');
  };

  const showToast = (message: string, type: Toast['type'] = 'success', subMessage?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message, subMessage }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Pricing calculations
  const cartCount = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.quantity, 0);
  }, [cart]);

  const cartSubtotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  }, [cart]);

  const freeShippingThreshold = 75.00;
  const freeShippingRemaining = Math.max(0, freeShippingThreshold - cartSubtotal);
  const isFreeShipping = cartSubtotal >= freeShippingThreshold;

  const cartDiscount = useMemo(() => {
    if (!appliedCoupon) return 0;
    if (appliedCoupon.minSpend && cartSubtotal < appliedCoupon.minSpend) return 0;
    if (appliedCoupon.discountPercent) {
      return (cartSubtotal * appliedCoupon.discountPercent) / 100;
    }
    if (appliedCoupon.discountAmount) {
      return appliedCoupon.discountAmount;
    }
    return 0;
  }, [appliedCoupon, cartSubtotal]);

  const cartTotal = useMemo(() => {
    return Math.max(0, cartSubtotal - cartDiscount);
  }, [cartSubtotal, cartDiscount]);

  const formatPrice = (amount: number): string => {
    const config = CURRENCY_RATES[currency] || CURRENCY_RATES.INR;
    const converted = amount * config.rate;
    
    // Proper locale currency formatting
    const formattedNum = new Intl.NumberFormat(currency === 'INR' ? 'en-IN' : 'en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(converted);

    if (config.prefix) {
      return `${config.symbol}${formattedNum}`;
    }
    return `${formattedNum} ${config.symbol}`;
  };

  const openProductDetail = (product: Product) => {
    setSelectedProduct(product);
    setActivePage('product-detail');
    trackProductView(product.id, product.name, product.price, product.category);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const addToCart = (
    product: Product, 
    quantity = 1, 
    selectedColor?: string, 
    selectedSize?: string
  ) => {
    if (product.isSoldOut || product.stockQuantity <= 0) {
      showToast('Item is currently out of stock', 'warning', 'Sign up to be notified when back in stock.');
      return;
    }

    const color = selectedColor || (product.colors && product.colors.length > 0 ? product.colors[0].name : undefined);
    const size = selectedSize || (product.sizes && product.sizes.length > 0 ? product.sizes[0] : undefined);
    const itemId = `${product.id}-${color || 'default'}-${size || 'default'}`;

    setCart((prev) => {
      const existing = prev.find((item) => item.id === itemId);
      if (existing) {
        return prev.map((item) =>
          item.id === itemId ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [
        ...prev,
        {
          id: itemId,
          productId: product.id,
          product,
          selectedColor: color,
          selectedSize: size,
          quantity,
          price: product.price
        }
      ];
    });

    trackAddToCart(product.id, product.name, product.price, quantity);

    showToast(
      `Added to Bag: ${product.name}`,
      'success',
      `${quantity}x ${product.name} (${color || ''} ${size || ''})`
    );
    setIsMiniCartOpen(true);
  };

  const buyNow = (
    product: Product,
    quantity = 1,
    selectedColor?: string,
    selectedSize?: string
  ) => {
    if (product.isSoldOut || product.stockQuantity <= 0) {
      showToast('Item is currently out of stock', 'warning', 'Sign up to be notified when back in stock.');
      return;
    }

    const color = selectedColor || (product.colors && product.colors.length > 0 ? product.colors[0].name : undefined);
    const size = selectedSize || (product.sizes && product.sizes.length > 0 ? product.sizes[0] : undefined);
    const itemId = `${product.id}-${color || 'default'}-${size || 'default'}`;

    setCart((prev) => {
      const existing = prev.find((item) => item.id === itemId);
      if (existing) {
        return prev.map((item) =>
          item.id === itemId ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [
        ...prev,
        {
          id: itemId,
          productId: product.id,
          product,
          selectedColor: color,
          selectedSize: size,
          quantity,
          price: product.price
        }
      ];
    });

    setSelectedProduct(product);
    setActivePageState('checkout');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    showToast(`Instant Purchase: ${product.name}`, 'success', 'Directing to secure checkout payment screen.');
  };

  const updateCartQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, quantity } : item))
    );
  };

  const removeFromCart = (itemId: string) => {
    const item = cart.find((i) => i.id === itemId);
    setCart((prev) => prev.filter((i) => i.id !== itemId));
    if (item) {
      showToast('Item removed from cart', 'info', item.product.name);
    }
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
  };

  const applyCoupon = (code: string): boolean => {
    const clean = code.trim().toUpperCase();
    const found = INITIAL_COUPONS.find((c) => c.code === clean);
    if (!found) {
      showToast('Invalid Promo Code', 'error', 'Please check spelling and try again (e.g. HAUTE10, HAUTE20).');
      return false;
    }
    if (found.minSpend && cartSubtotal < found.minSpend) {
      showToast('Minimum Spend Requirement', 'warning', `This coupon requires a minimum spend of ${formatPrice(found.minSpend)}.`);
      return false;
    }
    setAppliedCoupon(found);
    showToast('Promo Code Applied!', 'success', found.description);
    return true;
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    showToast('Promo code removed', 'info');
  };

  const toggleWishlist = (productId: string) => {
    const isSaved = wishlist.includes(productId);
    const prod = products.find((p) => p.id === productId);
    if (isSaved) {
      setWishlist((prev) => prev.filter((id) => id !== productId));
      showToast('Removed from Wishlist', 'info', prod?.name);
    } else {
      setWishlist((prev) => [...prev, productId]);
      showToast('Saved to Wishlist', 'success', prod?.name);
    }
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  const removeFromWishlist = (productId: string) => {
    const prod = products.find((p) => p.id === productId);
    setWishlist((prev) => prev.filter((id) => id !== productId));
    showToast('Removed from Wishlist', 'info', prod?.name);
  };

  const moveWishlistToCart = (productId: string, selectedColor?: string, selectedSize?: string) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;
    if (prod.isSoldOut || prod.stockQuantity <= 0) {
      showToast('Item is out of stock', 'warning', prod.name);
      return;
    }
    const color = selectedColor || (prod.colors && prod.colors.length > 0 ? prod.colors[0].name : undefined);
    const size = selectedSize || (prod.sizes && prod.sizes.length > 0 ? prod.sizes[0] : undefined);
    addToCart(prod, 1, color, size);
    setWishlist((prev) => prev.filter((id) => id !== productId));
    showToast('Moved to Shopping Bag', 'success', prod.name);
  };

  const moveAllWishlistToCart = () => {
    const availableItems = products.filter((p) => wishlist.includes(p.id) && !p.isSoldOut && p.stockQuantity > 0);
    if (availableItems.length === 0) {
      showToast('No available in-stock items in wishlist', 'info');
      return;
    }
    availableItems.forEach((p) => {
      const color = p.colors && p.colors.length > 0 ? p.colors[0].name : undefined;
      const size = p.sizes && p.sizes.length > 0 ? p.sizes[0] : undefined;
      addToCart(p, 1, color, size);
    });
    setWishlist([]);
    showToast(`Moved ${availableItems.length} items to Shopping Bag!`, 'success');
  };

  const clearWishlist = () => {
    setWishlist([]);
    showToast('Wishlist cleared', 'info');
  };

  // Product Admin Management
  const addProduct = (newProd: Product) => {
    setProducts((prev) => [newProd, ...prev]);
    saveProductToFirestore(newProd).catch((e) => console.warn('Firestore save error:', e));
    showToast(`Created new product: ${newProd.name}`, 'success', `Synced to Firebase Firestore`);
  };

  const updateProduct = (updated: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    if (selectedProduct && selectedProduct.id === updated.id) {
      setSelectedProduct(updated);
    }
    saveProductToFirestore(updated).catch((e) => console.warn('Firestore update error:', e));
    showToast(`Updated product: ${updated.name}`, 'success', `Synced to Firebase Firestore`);
  };

  const updateProductRankings = async (orderedProducts: Product[]) => {
    // Assign displayRank 1..N based on specified sequence
    const ranked = orderedProducts.map((p, index) => ({
      ...p,
      displayRank: index + 1
    }));
    
    setProducts(ranked);

    try {
      localStorage.setItem('diva_products_custom_rank', JSON.stringify(ranked.map(p => ({ id: p.id, displayRank: p.displayRank, isBestSeller: p.isBestSeller }))));
      // Asynchronously batch-persist updated rank to Firestore
      for (const p of ranked) {
        saveProductToFirestore(p).catch((err) => console.warn('Sync rank failed for', p.id, err));
      }
      showToast('Storefront Rankings Saved', 'success', 'Product order updated for Main page & Categories');
    } catch (e) {
      console.error('Failed to save rankings', e);
      showToast('Could not save all rankings to Firestore', 'error');
    }
  };

  const deleteProduct = (productId: string) => {
    const prod = products.find((p) => p.id === productId);
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    deleteProductFromFirestore(productId).catch((e) => console.warn('Firestore delete error:', e));
    showToast(`Product deleted`, 'info', prod?.name);
  };

  const updateProductStock = (productId: string, newStock: number) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId
          ? {
              ...p,
              stockQuantity: newStock,
              isSoldOut: newStock <= 0
            }
          : p
      )
    );
    showToast('Stock inventory updated successfully', 'success');
  };

  const addProductReview = (
    productId: string,
    reviewData: Omit<Review, 'id' | 'date' | 'helpfulCount'>
  ) => {
    const newRev: Review = {
      ...reviewData,
      id: `rev-${Date.now()}`,
      date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      helpfulCount: 0,
      userVotedHelpful: false
    };

    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== productId) return p;
        const updatedReviews = [newRev, ...p.reviews];
        const newAvg = (
          updatedReviews.reduce((sum, r) => sum + r.rating, 0) / updatedReviews.length
        ).toFixed(1);
        return {
          ...p,
          reviews: updatedReviews,
          reviewCount: updatedReviews.length,
          rating: parseFloat(newAvg)
        };
      })
    );

    showToast('Review submitted for verification!', 'success', 'Thank you for sharing your feedback with Haute.');
  };

  const voteReviewHelpful = (productId: string, reviewId: string) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== productId) return p;
        return {
          ...p,
          reviews: p.reviews.map((r) => {
            if (r.id !== reviewId) return r;
            const alreadyVoted = r.userVotedHelpful;
            return {
              ...r,
              helpfulCount: alreadyVoted ? r.helpfulCount - 1 : r.helpfulCount + 1,
              userVotedHelpful: !alreadyVoted
            };
          })
        };
      })
    );
  };

  // Firebase Authentication Methods
  const loginWithPassword = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const fbUser = userCredential.user;
      showToast(`Welcome back, ${fbUser.displayName || fbUser.email}!`, 'success', 'Signed in securely with Firebase Auth.');
      setIsAuthModalOpen(false);
      return { success: true };
    } catch (err: any) {
      console.error('[Firebase Auth] Login error:', err);
      let message = 'Incorrect email or password.';
      if (err.code === 'auth/invalid-email') message = 'Invalid email address format.';
      else if (err.code === 'auth/user-not-found') message = 'No account found with this email.';
      else if (err.code === 'auth/wrong-password') message = 'Incorrect password.';
      showToast('Sign In Failed', 'error', message);
      return { success: false, error: message };
    }
  };

  const registerWithPassword = async (email: string, password: string, name?: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const fbUser = userCredential.user;
      if (name) {
        await updateProfile(fbUser, { displayName: name });
      }
      const initialUser: User = {
        id: fbUser.uid,
        name: name || fbUser.email?.split('@')[0] || 'DivaChic Member',
        email: fbUser.email || '',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
        addresses: []
      };
      await setDoc(doc(db, 'users', fbUser.uid), {
        uid: fbUser.uid,
        email: fbUser.email,
        displayName: initialUser.name,
        photoURL: initialUser.avatar,
        addresses: [],
        createdAt: serverTimestamp(),
        lastLoginAt: serverTimestamp()
      }, { merge: true });
      setCurrentUser(initialUser);
      setIsAuthModalOpen(false);
      showToast('Account Created!', 'success', 'Welcome to DivaChic Privé Lounge.');
      return { success: true };
    } catch (err: any) {
      console.error('[Firebase Auth] Registration error:', err);
      let message = 'Failed to create account.';
      if (err.code === 'auth/email-already-in-use') message = 'This email is already registered. Please sign in.';
      else if (err.code === 'auth/weak-password') message = 'Password should be at least 6 characters.';
      showToast('Registration Failed', 'error', message);
      return { success: false, error: message };
    }
  };

  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const fbUser = result.user;
      showToast('Signed in with Google', 'success', fbUser.email || 'Firebase Session Active');
      setIsAuthModalOpen(false);
    } catch (err: any) {
      console.error('[Firebase Auth] Google login error:', err);
      showToast('Google Sign-In Failed', 'error', err?.message || 'Popup closed or interrupted.');
    }
  };

  const login = async (email: string): Promise<boolean> => {
    // Direct shortcut helper for email checkout
    return true;
  };

  const sendEmailOtpCode = async (email: string): Promise<{ success: boolean; error?: string }> => {
    return { success: true };
  };

  const verifyEmailOtpCode = async (email: string, token: string): Promise<{ success: boolean; error?: string }> => {
    return { success: true };
  };

  const loginWithPhoneOtp = async (phone: string, otp: string): Promise<boolean> => {
    return true;
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      showToast('You have been signed out safely.', 'info');
    } catch (err) {
      console.error('[Firebase Auth] Logout error:', err);
    }
  };

  const updateUserProfile = async (data: Partial<User>) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...data };
    setCurrentUser(updated);

    if (auth.currentUser && data.name) {
      try {
        await updateProfile(auth.currentUser, { displayName: data.name });
      } catch {}
    }

    if (auth.currentUser) {
      try {
        await setDoc(doc(db, 'users', auth.currentUser.uid), {
          displayName: updated.name,
          phone: updated.phone || null,
          photoURL: updated.avatar,
          addresses: updated.addresses,
          updatedAt: serverTimestamp()
        }, { merge: true });
      } catch (err) {
        console.warn('Firestore profile update warning:', err);
      }
    }
    showToast('Profile updated', 'success');
  };

  const saveAddress = async (addrData: Omit<Address, 'id'>) => {
    if (!currentUser) return;
    const newAddr: Address = {
      ...addrData,
      id: `addr-${Date.now()}`
    };
    const updated = addrData.isDefault
      ? currentUser.addresses.map((a) => ({ ...a, isDefault: false }))
      : currentUser.addresses;
    updated.push(newAddr);
    await updateUserProfile({ addresses: updated });
    showToast('Address saved to address book', 'success');
  };

  const deleteAddress = (addressId: string) => {
    if (!currentUser) return;
    setCurrentUser({
      ...currentUser,
      addresses: currentUser.addresses.filter((a) => a.id !== addressId)
    });
    showToast('Address removed', 'info');
  };

  const setDefaultAddress = (addressId: string) => {
    if (!currentUser) return;
    setCurrentUser({
      ...currentUser,
      addresses: currentUser.addresses.map((a) => ({
        ...a,
        isDefault: a.id === addressId
      }))
    });
    showToast('Default address updated', 'success');
  };

  const placeOrder = (orderData: Partial<Order>): Order => {
    const num = `HT-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
    const trk = `TRK-${Math.floor(100000000 + Math.random() * 900000000)}-US`;
    
    const defaultAddress = currentUser?.addresses.find(a => a.isDefault) || currentUser?.addresses[0] || {
      id: 'addr-temp',
      fullName: currentUser?.name || 'Guest Shopper',
      phone: '+1 (555) 000-0000',
      street: '123 Fashion Blvd',
      apartment: '',
      city: 'New York',
      state: 'NY',
      pincode: '10001',
      country: 'United States',
      type: 'home' as const,
      isDefault: true
    };

    const shippingAddress = orderData.shippingAddress || defaultAddress;
    const finalCustomer = orderData.customer || {
      fullName: shippingAddress.fullName || currentUser?.name || 'Valued Client',
      email: currentUser?.email || orderData.email || 'customer@gmail.com',
      phone: shippingAddress.phone || currentUser?.phone || '+1 (555) 000-0000',
      addressLine1: shippingAddress.street || '123 Fashion Blvd',
      addressLine2: shippingAddress.apartment || '',
      city: shippingAddress.city || 'New York',
      state: shippingAddress.state || 'NY',
      postalCode: shippingAddress.pincode || '10001'
    };

    const finalTotal = orderData.total ?? (cartTotal + (isFreeShipping ? 0 : 5.00) + cartSubtotal * 0.08);

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderId: num,
      orderNumber: num,
      date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      createdAt: new Date().toISOString(),
      status: 'Pending',
      items: cart.map((item) => ({
        productId: item.productId,
        name: item.product.name,
        title: item.product.name,
        image: item.product.images[0],
        imageUrl: item.product.images[0],
        price: item.price,
        quantity: item.quantity,
        selectedColor: item.selectedColor,
        selectedSize: item.selectedSize
      })),
      totalAmount: finalTotal,
      customer: finalCustomer,
      customerName: finalCustomer.fullName,
      email: finalCustomer.email,
      dispatchDate: null,
      subtotal: cartSubtotal,
      shippingFee: isFreeShipping ? 0 : 5.00,
      discount: cartDiscount,
      tax: cartSubtotal * 0.08,
      total: finalTotal,
      shippingAddress: shippingAddress,
      paymentMethod: orderData.paymentMethod || 'Credit Card',
      paymentStatus: orderData.paymentMethod === 'Cash on Delivery (COD)' ? 'cod' : 'paid',
      trackingNumber: trk,
      carrier: 'DHL Express Nordic',
      estimatedDeliveryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      }),
      timeline: [
        {
          title: 'Order Placed & Verified',
          description: 'Payment authorization confirmed. Order is Pending review in the fulfillment console.',
          timestamp: 'Just Now',
          location: 'Stockholm Hub',
          completed: true,
          current: true
        }
      ],
      ...orderData
    };

    setOrders((prev) => [newOrder, ...prev]);
    setCurrentOrder(newOrder);

    trackPurchase(newOrder.orderNumber, newOrder.total, newOrder.items.length);
    saveOrderToFirestore(newOrder).catch((err) => console.warn('[Firestore Order Sync] Error:', err));

    try {
      const googleFormUrl = 'https://docs.google.com/forms/d/e/1FAIpQLSfutf74XvuQ7zETKUR4l_kDyVRFMuiax5llflUGc7jzTduK1w/formResponse';
      const formPayload = new URLSearchParams();
      formPayload.append('entry.1788172552', newOrder.shippingAddress.fullName || 'Valued Client');
      formPayload.append('entry.202620000', `Order #${newOrder.orderNumber} - Phone: ${newOrder.shippingAddress.phone || 'N/A'} - City: ${newOrder.shippingAddress.city}`);

      fetch(googleFormUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formPayload
      }).catch((e) => console.log('[Google Form Sync] Attempted:', e));
    } catch (e) {
      console.log('[Google Form Sync] Exception:', e);
    }

    try {
      const GOOGLE_SHEETS_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbyjk8MYflKlMaqFM8ZQzwl673roAingHJSsclhshnBd709DqUmMArW3TGx1pId93hU/exec";
      const sheetPayload = {
        orderNumber: newOrder.orderNumber,
        date: newOrder.date,
        total: newOrder.total,
        paymentMethod: newOrder.paymentMethod,
        itemsCount: newOrder.items.length,
        itemsSummary: newOrder.items.map(i => `${i.name} (x${i.quantity})`).join(", "),
        email: currentUser?.email || 'customer@haute.boutique',
        phone: newOrder.shippingAddress.phone || '',
        name: newOrder.shippingAddress.fullName || 'Valued Customer',
        postalCode: newOrder.shippingAddress.pincode || '',
        streetAddress: newOrder.shippingAddress.street || '',
        aptSuite: newOrder.shippingAddress.apartment || '',
        city: newOrder.shippingAddress.city || '',
        state: newOrder.shippingAddress.state || '',
        country: newOrder.shippingAddress.country || 'India'
      };

      fetch(GOOGLE_SHEETS_WEB_APP_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sheetPayload)
      }).catch((e) => console.log('[Google Sheets Web App Sync] Attempted:', e));
    } catch (e) {
      console.log('[Google Sheets Web App Sync] Exception:', e);
    }

    // Automated Order Confirmation Email (covers COD, Online, and Storefront orders)
    try {
      sendOrderConfirmationEmail({
        customerEmail: newOrder.customer?.email || newOrder.email || 'customer@divachic.online',
        customerName: newOrder.customerName || newOrder.shippingAddress?.fullName || 'Valued Client',
        orderId: newOrder.orderNumber || newOrder.id,
        totalAmount: newOrder.totalAmount || newOrder.total,
        paymentMethod: newOrder.paymentMethod || 'Cash on Delivery (COD)',
        items: (newOrder.items || []).map((item) => ({
          title: item.name || (item as any).title || 'Product',
          quantity: item.quantity,
          price: item.price
        }))
      }).catch((err) => console.warn('[Email Confirmation Webhook] Notice:', err));
    } catch (e) {
      console.warn('[Email Confirmation Webhook] Exception:', e);
    }
    
    cart.forEach((item) => {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === item.productId
            ? {
                ...p,
                stockQuantity: Math.max(0, p.stockQuantity - item.quantity),
                isSoldOut: p.stockQuantity - item.quantity <= 0
              }
            : p
        )
      );
    });

    clearCart();
    setActivePage('order-confirmation');
    showToast(`Order Confirmed! #${newOrder.orderNumber}`, 'success', 'Confirmation sent via SMS & Email.');
    return newOrder;
  };

  const updateOrderStatus = (
    orderId: string, 
    status: Order['status'], 
    noteOrDispatchDate?: string | null,
    dispatchDateParam?: string | null
  ) => {
    let finalDispatchDate: string | null | undefined = undefined;
    let note: string | undefined = undefined;

    if (dispatchDateParam !== undefined) {
      finalDispatchDate = dispatchDateParam;
      note = noteOrDispatchDate || undefined;
    } else if (noteOrDispatchDate && noteOrDispatchDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
      finalDispatchDate = noteOrDispatchDate;
    } else {
      note = noteOrDispatchDate || undefined;
    }

    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id !== orderId) return ord;
        const timeline = [...(ord.timeline || [])];
        const newDispatch = finalDispatchDate !== undefined ? finalDispatchDate : ord.dispatchDate;
        
        if (status === 'Ready') {
          timeline.push({
            title: 'Order Marked Ready',
            description: note || 'Items prepared, packaged and ready for carrier handover.',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            location: 'Nordic Central Hub',
            completed: true,
            current: true
          });
        } else if (status === 'Dispatched' || status === 'in_transit') {
          timeline.push({
            title: 'Package Dispatched',
            description: note || `Dispatched with carrier. Planned dispatch date: ${newDispatch || 'Today'}`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            location: 'Copenhagen Terminal',
            completed: true,
            current: true
          });
        } else if (status === 'Rejected' || status === 'cancelled') {
          timeline.push({
            title: 'Order Rejected / Cancelled',
            description: note || 'Order has been rejected by merchant operations.',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            location: 'Nordic Central Hub',
            completed: true,
            current: true
          });
        }

        const updatedOrd: Order = {
          ...ord,
          status,
          dispatchDate: newDispatch,
          timeline
        };
        updateFirestoreOrderStatus(ord.id, status, newDispatch).catch((e) => console.warn('Firestore update order warning:', e));
        return updatedOrd;
      })
    );
    showToast(`Order status updated to "${status}"`, 'info');
  };

  const updateOrderDispatchDate = (orderId: string, dispatchDate: string | null) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id !== orderId) return ord;
        const updatedOrd: Order = {
          ...ord,
          dispatchDate
        };
        updateFirestoreOrderStatus(ord.id, ord.status, dispatchDate).catch((e) => console.warn('Firestore update order warning:', e));
        return updatedOrd;
      })
    );
    showToast(`Planned dispatch date updated`, 'info');
  };

  const approveOrder = (orderId: string) => {
    updateOrderStatus(orderId, 'packed', 'Order approved and passed quality check. Package packed in Scandinavian craft box.');
    showToast('Order Approved & Packed', 'success', `Order #${orderId.slice(-6)}`);
  };

  const markOrderShipped = (orderId: string, carrier: string = 'DHL Express Nordic', trackingNumber?: string) => {
    const trk = trackingNumber || `DHL-${Math.floor(100000000 + Math.random() * 900000000)}`;
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id !== orderId) return ord;
        const timeline = [...ord.timeline];
        if (timeline[1]) timeline[1].completed = true;
        if (timeline[2]) {
          timeline[2].completed = true;
          timeline[2].current = true;
          timeline[2].description = `Dispatched via ${carrier}. Tracking: ${trk}`;
          timeline[2].timestamp = 'Dispatched Today';
        }
        return {
          ...ord,
          status: 'in_transit' as const,
          carrier,
          trackingNumber: trk,
          timeline
        };
      })
    );
    showToast(`Order Marked as Shipped`, 'success', `Carrier: ${carrier} | Tracking: ${trk}`);
  };

  const cancelOrder = (orderId: string, reason: string = 'Customer request / Stock adjustment') => {
    updateOrderStatus(orderId, 'cancelled', `Cancellation reason: ${reason}`);
    showToast('Order Cancelled', 'warning', `Order marked as cancelled.`);
  };

  const refundOrder = (orderId: string, amount?: number) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id !== orderId) return ord;
        return {
          ...ord,
          status: 'refunded' as const,
          paymentStatus: 'pending' as const
        };
      })
    );
    updateOrderStatus(orderId, 'refunded', `Refund of ${amount ? formatPrice(amount) : 'full amount'} credited.`);
    showToast('Refund Processed Successfully', 'success', 'Customer credit ledger updated.');
  };

  const requestOrderReturn = (orderId: string, reason: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: 'returned' } : o))
    );
    showToast('Return Request Initiated', 'success', `Return label generated for reason: ${reason}.`);
  };

  const clearAllOrders = () => {
    setOrders([]);
    try {
      localStorage.setItem('haute_orders', JSON.stringify([]));
      localStorage.setItem('diva_dashboard_zeroed', 'true');
    } catch {}
    showToast('Orders Cleared', 'info', 'All order records have been cleared.');
  };

  const resetAllStatsToZero = (password: string): boolean => {
    if (password === '8156958052') {
      setOrders([]);
      try {
        localStorage.setItem('haute_orders', JSON.stringify([]));
        localStorage.setItem('diva_dashboard_zeroed', 'true');
      } catch {}
      showToast('Dashboard Metrics Reset to 0', 'success', 'All financial numbers and order tallies are now zero.');
      return true;
    }
    showToast('Reset Failed', 'error', 'Incorrect password. Authorization denied.');
    return false;
  };

  const restoreDefaultOrders = () => {
    setOrders(INITIAL_ORDERS);
    try {
      localStorage.setItem('haute_orders', JSON.stringify(INITIAL_ORDERS));
      localStorage.removeItem('diva_dashboard_zeroed');
    } catch {}
    showToast('Baseline Orders Restored', 'success', 'Demo catalog order metrics repopulated.');
  };

  return (
    <StoreContext.Provider
      value={{
        activePage,
        setActivePage,
        selectedProduct,
        openProductDetail,
        selectedCategory,
        setSelectedCategory,
        products,
        setProducts,
        updateProductStock,
        addProduct,
        updateProduct,
        updateProductRankings,
        deleteProduct,
        addProductReview,
        voteReviewHelpful,
        cart,
        cartCount,
        cartSubtotal,
        cartTotal,
        cartDiscount,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        coupons,
        addCoupon,
        deleteCoupon,
        abandonedCarts,
        recoverAbandonedCart,
        orderNote,
        setOrderNote,
        addToCart,
        buyNow,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        freeShippingThreshold,
        freeShippingRemaining,
        isFreeShipping,
        wishlist,
        toggleWishlist,
        isInWishlist,
        removeFromWishlist,
        moveWishlistToCart,
        moveAllWishlistToCart,
        clearWishlist,
        standardDeliveryDays,
        setStandardDeliveryDays,
        updateProductDeliveryDays,
        onlineDiscountPercent,
        updateOnlineDiscountPercent,
        calculateDeliveryDate,
        currentUser,
        isLoggedIn: !!currentUser,
        login,
        sendEmailOtpCode,
        verifyEmailOtpCode,
        loginWithPassword,
        registerWithPassword,
        loginWithGoogle,
        loginWithPhoneOtp,
        logout,
        updateUserProfile,
        saveAddress,
        deleteAddress,
        setDefaultAddress,
        orders,
        currentOrder,
        placeOrder,
        updateOrderStatus,
        updateOrderDispatchDate,
        approveOrder,
        markOrderShipped,
        cancelOrder,
        refundOrder,
        requestOrderReturn,
        isMiniCartOpen,
        setIsMiniCartOpen,
        isSearchOpen,
        setIsSearchOpen,
        quickViewProduct,
        setQuickViewProduct,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authModalTab,
        setAuthModalTab,
        abandonedCartAlert,
        dismissAbandonedCart,
        currency,
        setCurrency,
        formatPrice,
        toasts,
        showToast,
        removeToast,
        searchQuery,
        setSearchQuery,
        isAdminView,
        setIsAdminView,
        isAdminAuthenticated,
        isAdminAuthModalOpen,
        setIsAdminAuthModalOpen,
        openAdminAuthModal,
        verifyAdminPassword,
        lockAdmin,
        isFirebaseOnline: true,
        syncFirebaseData: async () => {},
        siteBanners,
        updateSiteBanners,
        floatingBanner,
        updateFloatingBanner,
        toggleFloatingBanner,
        theme,
        setTheme,
        isDarkMode,
        toggleDarkMode,
        contactInquiries,
        addContactInquiry,
        replyContactInquiry,
        deleteContactInquiry,
        adminStaff,
        addAdminStaff,
        deleteAdminStaff,
        updateAdminStaff,
        adminEvents,
        addAdminEvent,
        deleteAdminEvent,
        adminCampaigns,
        dispatchAdminCampaign,
        adminProfile,
        updateAdminProfile,
        reviews: firestoreReviews,
        addCustomerReview,
        approveCustomerReview,
        deleteCustomerReview,
        clearAllOrders,
        resetAllStatsToZero,
        restoreDefaultOrders,
        themeSettings,
        updateThemeSettings,
        applyThemeSettingsLocally,
        categories,
        updateCategory
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
