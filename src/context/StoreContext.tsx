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
  Review
} from '../types';
import { INITIAL_PRODUCTS, INITIAL_COUPONS, INITIAL_ORDERS } from '../data/products';
import {
  getSupabaseClient,
  isSupabaseConfigured,
  fetchProductsFromSupabase,
  insertProductToSupabase,
  fetchStoreSettingsFromSupabase,
  updateStoreSettingsInSupabase,
  fetchOrdersFromSupabase,
  insertOrderToSupabase,
  updateOrderStatusInSupabase,
  signInWithGoogle,
  signOutSupabase,
  sendEmailOtp,
  verifyEmailOtp,
  signUpWithPassword,
  signInWithPassword
} from '../lib/supabase';
import {
  safeJsonParse,
  authenticateAdminPasscode,
  validateAdminSessionToken,
  clearAdminSessionToken,
  sanitizeInput
} from '../lib/security';

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
  onlineDiscountPercent: number;
  updateOnlineDiscountPercent: (percent: number) => void;
  calculateDeliveryDate: (offsetDays?: number) => { formattedDate: string; fullDate: string; days: number; shortDate: string };
  
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
  updateOrderStatus: (orderId: string, status: Order['status'], note?: string) => void;
  approveOrder: (orderId: string) => void;
  markOrderShipped: (orderId: string, carrier?: string, trackingNumber?: string) => void;
  cancelOrder: (orderId: string, reason?: string) => void;
  refundOrder: (orderId: string, amount?: number) => void;
  requestOrderReturn: (orderId: string, reason: string) => void;
  
  // Admin Product Catalog Management
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
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
  
  // Site Banners & Branding Customizer
  siteBanners: SiteBanners;
  updateSiteBanners: (updated: Partial<SiteBanners>) => void;
  
  // Supabase Real-time Cloud Sync
  isSupabaseOnline: boolean;
  syncSupabaseData: () => Promise<void>;
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
  logoUrl: 'https://i.ibb.co/MymbxNmJ/image.png',
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

const CURRENCY_RATES: Record<Currency, { symbol: string; rate: number; prefix: boolean }> = {
  INR: { symbol: '₹', rate: 85.0, prefix: true },
  USD: { symbol: '$', rate: 1.0, prefix: true },
  EUR: { symbol: '€', rate: 0.92, prefix: false },
  GBP: { symbol: '£', rate: 0.78, prefix: true }
};

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(() => {
    return safeJsonParse(localStorage.getItem('haute_products'), INITIAL_PRODUCTS);
  });

  const [activePage, setActivePageState] = useState<ActivePage>('home');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(() => products[0]);
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currency, setCurrencyState] = useState<Currency>(() => {
    const saved = localStorage.getItem('haute_currency');
    return (saved as Currency) || 'INR';
  });

  const [siteBanners, setSiteBanners] = useState<SiteBanners>(() => {
    return safeJsonParse(localStorage.getItem('diva_site_banners'), DEFAULT_SITE_BANNERS);
  });

  const updateSiteBanners = (updated: Partial<SiteBanners>) => {
    setSiteBanners((prev) => {
      const next = { ...prev, ...updated };
      try {
        localStorage.setItem('diva_site_banners', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const setCurrency = (c: Currency) => {
    setCurrencyState(c);
    try {
      localStorage.setItem('haute_currency', c);
    } catch {}
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

  const updateOnlineDiscountPercent = (percent: number) => {
    const clamped = Math.max(0, Math.min(50, percent));
    setOnlineDiscountPercentState(clamped);
    localStorage.setItem('haute_online_discount', clamped.toString());
    showToast('Online Payment Discount Updated', 'success', `Online payments now receive ${clamped}% instant discount.`);
  };

  const [isSupabaseOnline, setIsSupabaseOnline] = useState<boolean>(false);

  const syncSupabaseData = useCallback(async () => {
    const client = getSupabaseClient();
    if (!client) {
      setIsSupabaseOnline(false);
      return;
    }

    try {
      // 1. Fetch Store Settings (Delivery Days)
      const settings = await fetchStoreSettingsFromSupabase();
      if (settings && settings.default_delivery_days) {
        setStandardDeliveryDaysState(settings.default_delivery_days);
        localStorage.setItem('haute_delivery_days', settings.default_delivery_days.toString());
      }

      // 2. Fetch Products
      const cloudProducts = await fetchProductsFromSupabase();
      if (cloudProducts && cloudProducts.length > 0) {
        setProducts((prev) => {
          // Merge custom created products
          const existingIds = new Set(cloudProducts.map((p) => p.id));
          const uniqueLocal = prev.filter((p) => !existingIds.has(p.id));
          return [...cloudProducts, ...uniqueLocal];
        });
      }

      // 3. Fetch Orders
      const cloudOrders = await fetchOrdersFromSupabase();
      if (cloudOrders && cloudOrders.length > 0) {
        setOrders((prev) => {
          const existingIds = new Set(cloudOrders.map((o) => o.id));
          const uniqueLocal = prev.filter((o) => !existingIds.has(o.id));
          return [...cloudOrders, ...uniqueLocal];
        });
      }

      setIsSupabaseOnline(true);
    } catch (err) {
      console.warn('[Supabase Sync] Warning during sync:', err);
      setIsSupabaseOnline(false);
    }
  }, []);

  // Initial Supabase Load & Auth check
  useEffect(() => {
    syncSupabaseData();

    const client = getSupabaseClient();
    if (client) {
      client.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          setCurrentUser({
            id: session.user.id,
            name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Member',
            email: session.user.email || '',
            avatar: session.user.user_metadata?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
            addresses: []
          });
        }
      });

      const { data: { subscription } } = client.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          setCurrentUser({
            id: session.user.id,
            name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Member',
            email: session.user.email || '',
            avatar: session.user.user_metadata?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
            addresses: []
          });
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [syncSupabaseData]);

  const setStandardDeliveryDays = (days: number) => {
    const clamped = Math.max(1, Math.min(30, days));
    setStandardDeliveryDaysState(clamped);
    localStorage.setItem('haute_delivery_days', clamped.toString());
    updateStoreSettingsInSupabase('default_delivery_days', clamped.toString());
    showToast(`Delivery timeframe updated to ${clamped} business days`, 'info');
  };

  const calculateDeliveryDate = (offsetDays: number = 0) => {
    const totalDays = standardDeliveryDays + offsetDays;
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

  const [currentOrder, setCurrentOrder] = useState<Order | null>(() => orders[0] || null);

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

  // Supabase Auth real-time listener
  useEffect(() => {
    const client = getSupabaseClient();
    if (!client) return;

    client.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const suUser = session.user;
        setCurrentUser((prev) => prev || {
          id: suUser.id,
          name: suUser.user_metadata?.full_name || suUser.email?.split('@')[0] || 'Member',
          email: suUser.email || '',
          phone: suUser.phone || '',
          avatar: suUser.user_metadata?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
          addresses: []
        });
      }
    });

    const { data: { subscription } } = client.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const suUser = session.user;
        setCurrentUser({
          id: suUser.id,
          name: suUser.user_metadata?.full_name || suUser.email?.split('@')[0] || 'Member',
          email: suUser.email || '',
          phone: suUser.phone || '',
          avatar: suUser.user_metadata?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
          addresses: []
        });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

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
    insertProductToSupabase({
      name: newProd.name,
      price: newProd.originalPrice || newProd.price,
      salePrice: newProd.originalPrice ? newProd.price : undefined,
      images: newProd.images,
      youtubeUrl: newProd.youtubeUrl,
      description: newProd.description,
      category: newProd.category,
      stockQuantity: newProd.stockQuantity,
      sku: newProd.sku
    });
    showToast(`Created new product: ${newProd.name}`, 'success', `SKU: ${newProd.sku}`);
  };

  const updateProduct = (updated: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    if (selectedProduct && selectedProduct.id === updated.id) {
      setSelectedProduct(updated);
    }
    showToast(`Updated product: ${updated.name}`, 'success');
  };

  const deleteProduct = (productId: string) => {
    const prod = products.find((p) => p.id === productId);
    setProducts((prev) => prev.filter((p) => p.id !== productId));
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

  // Auth methods
  const sendEmailOtpCode = async (email: string): Promise<{ success: boolean; error?: string }> => {
    const res = await sendEmailOtp(email);
    if (!res.success) {
      showToast('OTP Request Failed', 'error', res.error || 'Check email address and try again.');
    } else {
      showToast('OTP Code Sent!', 'info', `Check your email inbox (${email}) for your 6-digit verification code.`);
    }
    return res;
  };

  const verifyEmailOtpCode = async (email: string, token: string): Promise<{ success: boolean; error?: string }> => {
    const res = await verifyEmailOtp(email, token);
    if (!res.success) {
      showToast('Verification Failed', 'error', res.error || 'Invalid or expired OTP code.');
      return res;
    }

    const suUser = res.user;
    const user: User = {
      id: suUser?.id || `usr-${Date.now().toString().slice(-4)}`,
      name: suUser?.user_metadata?.full_name || email.split('@')[0] || 'Valued Member',
      email,
      phone: '',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
      addresses: []
    };

    setCurrentUser(user);
    setIsAuthModalOpen(false);
    showToast(`Welcome, ${user.name}!`, 'success', 'Authenticated with Supabase Email OTP.');
    return { success: true };
  };

  const loginWithPassword = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const res = await signInWithPassword(email, password);
    if (!res.success) {
      showToast('Sign In Failed', 'error', res.error || 'Incorrect email or password.');
      return res;
    }
    const suUser = res.user;
    const user: User = {
      id: suUser?.id || `usr-${Date.now().toString().slice(-4)}`,
      name: suUser?.user_metadata?.full_name || email.split('@')[0] || 'Valued Member',
      email,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
      addresses: []
    };
    setCurrentUser(user);
    setIsAuthModalOpen(false);
    showToast(`Welcome back, ${user.name}!`, 'success', 'Signed in via Supabase.');
    return { success: true };
  };

  const registerWithPassword = async (email: string, password: string, name?: string): Promise<{ success: boolean; error?: string }> => {
    const res = await signUpWithPassword(email, password, name);
    if (!res.success) {
      showToast('Registration Failed', 'error', res.error || 'Failed to create account.');
      return res;
    }
    const suUser = res.user;
    const user: User = {
      id: suUser?.id || `usr-${Date.now().toString().slice(-4)}`,
      name: name || email.split('@')[0] || 'New Member',
      email,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
      addresses: []
    };
    setCurrentUser(user);
    setIsAuthModalOpen(false);
    showToast('Account Created!', 'success', 'Welcome to Diva\'Chik Privé Lounge.');
    return { success: true };
  };

  const login = async (email: string): Promise<boolean> => {
    const res = await sendEmailOtpCode(email);
    if (res.success) {
      return true;
    }
    // Fallback demo member if offline
    const user: User = {
      id: `usr-${Date.now().toString().slice(-4)}`,
      name: email.split('@')[0].replace(/[^a-zA-Z]/g, ' ').trim() || 'Valued Member',
      email,
      phone: '+1 (555) 349-2910',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
      addresses: [
        {
          id: 'addr-1',
          fullName: email.split('@')[0],
          phone: '+1 (555) 349-2910',
          street: '100 Modernist Way',
          city: 'New York',
          state: 'NY',
          pincode: '10001',
          country: 'United States',
          type: 'home',
          isDefault: true
        }
      ]
    };
    setCurrentUser(user);
    setIsAuthModalOpen(false);
    showToast(`Welcome back, ${user.name}!`, 'success', 'Logged in securely.');
    return true;
  };

  const loginWithGoogle = async () => {
    try {
      if (isSupabaseConfigured()) {
        await signInWithGoogle();
        return;
      }
    } catch (err: any) {
      console.warn('[Supabase Google Auth] Fallback to demo member:', err.message);
    }
    
    const user: User = {
      id: 'usr-google-99',
      name: 'Elena Rostova',
      email: 'elena.rostova@gmail.com',
      phone: '+1 (555) 839-2041',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop',
      addresses: [
        {
          id: 'addr-google-1',
          fullName: 'Elena Rostova',
          phone: '+1 (555) 839-2041',
          street: '420 Madison Avenue',
          apartment: 'Apt 18C',
          city: 'New York',
          state: 'NY',
          pincode: '10017',
          country: 'United States',
          type: 'home',
          isDefault: true
        }
      ]
    };
    setCurrentUser(user);
    setIsAuthModalOpen(false);
    showToast('Signed in with Google Account', 'success', user.email);
  };

  const loginWithPhoneOtp = async (phone: string, otp: string): Promise<boolean> => {
    if (otp.length !== 6 && otp !== '123456') {
      showToast('Invalid verification code', 'error', 'Use code 123456 for demo authorization.');
      return false;
    }
    const user: User = {
      id: `usr-phone-${Date.now().toString().slice(-4)}`,
      name: 'Haute Member',
      email: 'member@haute.boutique',
      phone,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop',
      addresses: []
    };
    setCurrentUser(user);
    setIsAuthModalOpen(false);
    showToast('Phone Number Verified', 'success', 'Welcome to Haute Privé.');
    return true;
  };

  const logout = () => {
    signOutSupabase().catch((e) => console.warn('[Supabase SignOut]', e));
    setCurrentUser(null);
    showToast('You have been logged out safely.', 'info');
  };

  const updateUserProfile = (data: Partial<User>) => {
    if (!currentUser) return;
    setCurrentUser({ ...currentUser, ...data });
    showToast('Profile updated', 'success');
  };

  const saveAddress = (addrData: Omit<Address, 'id'>) => {
    if (!currentUser) return;
    const newAddr: Address = {
      ...addrData,
      id: `addr-${Date.now()}`
    };
    const updated = addrData.isDefault
      ? currentUser.addresses.map((a) => ({ ...a, isDefault: false }))
      : currentUser.addresses;

    setCurrentUser({
      ...currentUser,
      addresses: [...updated, newAddr]
    });
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
      city: 'New York',
      state: 'NY',
      pincode: '10001',
      country: 'United States',
      type: 'home' as const,
      isDefault: true
    };

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber: num,
      date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      items: cart.map((item) => ({
        productId: item.productId,
        name: item.product.name,
        image: item.product.images[0],
        price: item.price,
        quantity: item.quantity,
        selectedColor: item.selectedColor,
        selectedSize: item.selectedSize
      })),
      subtotal: cartSubtotal,
      shippingFee: isFreeShipping ? 0 : 5.00,
      discount: cartDiscount,
      tax: cartSubtotal * 0.08,
      total: cartTotal + (isFreeShipping ? 0 : 5.00) + cartSubtotal * 0.08,
      status: 'placed',
      shippingAddress: orderData.shippingAddress || defaultAddress,
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
          description: 'Payment authorization confirmed. Order dispatched to Nordic fulfillment hub.',
          timestamp: 'Just Now',
          location: 'Stockholm Hub',
          completed: true,
          current: true
        },
        {
          title: 'Quality Check & Packing',
          description: 'Garments and accessories carefully checked, wrapped in tissue paper and biodegradable box.',
          timestamp: 'Pending',
          location: 'Stockholm Hub',
          completed: false
        },
        {
          title: 'Handed to Carrier',
          description: 'Dispatched via DHL Express Nordic Priority Air.',
          timestamp: 'Pending',
          location: 'Copenhagen Terminal',
          completed: false
        },
        {
          title: 'Out for Delivery',
          description: 'Local courier in transit to your registered destination address.',
          timestamp: 'Pending',
          location: 'Local Destination',
          completed: false
        },
        {
          title: 'Delivered',
          description: 'Package successfully delivered.',
          timestamp: 'Pending',
          location: 'Local Destination',
          completed: false
        }
      ],
      ...orderData
    };

    setOrders((prev) => [newOrder, ...prev]);
    setCurrentOrder(newOrder);

    // Sync to Supabase Orders
    insertOrderToSupabase({
      customer_name: newOrder.shippingAddress.fullName || 'Valued Customer',
      customer_email: currentUser?.email || 'customer@haute.boutique',
      customer_phone: newOrder.shippingAddress.phone || '',
      delivery_address: `${newOrder.shippingAddress.street}${newOrder.shippingAddress.apartment ? ', ' + newOrder.shippingAddress.apartment : ''}, ${newOrder.shippingAddress.city}`,
      pincode: newOrder.shippingAddress.pincode,
      items: newOrder.items,
      total_price: newOrder.total,
      status: 'Placed'
    }).catch((err) => console.warn('[Supabase Order Sync] Error:', err));

    // Sync Order details to Google Form
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

    // Sync Customer Address & Form Data to Google Sheets Web App Excel
    try {
      const GOOGLE_SHEETS_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbyjk8MYflKlMaqFM8ZQzwl673roAingHJSsclhshnBd709DqUmMArW3TGx1pId93hU/exec";
      const sheetPayload = {
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
    
    // Decrement stock in catalog
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

  const updateOrderStatus = (orderId: string, status: Order['status'], note?: string) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id !== orderId) return ord;
        const timeline = [...ord.timeline];
        if (status === 'packed' && timeline[1]) {
          timeline[1].completed = true;
          timeline[1].current = true;
          timeline[0].current = false;
          if (note) timeline[1].description = note;
        } else if (status === 'in_transit' && timeline[2]) {
          timeline[1].completed = true;
          timeline[2].completed = true;
          timeline[2].current = true;
          timeline[1].current = false;
          if (note) timeline[2].description = note;
        } else if (status === 'delivered') {
          timeline.forEach((t) => {
            t.completed = true;
            t.current = false;
          });
          timeline[timeline.length - 1].current = true;
          if (note) timeline[timeline.length - 1].description = note;
        } else if (status === 'cancelled') {
          timeline.push({
            title: 'Order Cancelled',
            description: note || 'Order has been cancelled by merchant operations.',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            location: 'Nordic Central Hub',
            completed: true,
            current: true
          });
        } else if (status === 'refunded') {
          timeline.push({
            title: 'Refund Processed',
            description: note || 'Payment refunded in full back to customer account.',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            location: 'Payment Gateway',
            completed: true,
            current: true
          });
        }
        return {
          ...ord,
          status,
          timeline
        };
      })
    );
    updateOrderStatusInSupabase(orderId, status).catch((err) =>
      console.warn('[Supabase Order Status Sync] Error:', err)
    );
    showToast(`Order status updated to ${status.replace('_', ' ').toUpperCase()}`, 'info');
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
        isSupabaseOnline,
        syncSupabaseData,
        siteBanners,
        updateSiteBanners
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
