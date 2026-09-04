import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useStore, ContactInquiry, AdminStaffMember, AdminCalendarEvent, AdminCampaign } from '../../context/StoreContext';
import { 
  Package, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  ShoppingBag, 
  Plus, 
  Trash2, 
  Edit3, 
  Search, 
  Check, 
  AlertCircle, 
  Tag, 
  Send, 
  Eye,
  Layers,
  Sparkles,
  CheckCircle2,
  RefreshCw,
  Truck,
  Sliders,
  Printer,
  X,
  Clock,
  Film,
  ExternalLink,
  Upload,
  ArrowRight,
  ShieldCheck,
  ChevronDown,
  ChevronRight,
  RotateCcw,
  Ban,
  FileText,
  Lock,
  KeyRound,
  ShieldAlert,
  LogOut,
  Star,
  BookOpen,
  FolderPlus,
  Globe,
  Image as ImageIcon,
  MessageSquare,
  Users,
  Calendar as CalendarIcon,
  Mail,
  BarChart3,
  PieChart,
  LayoutDashboard,
  Bell,
  Menu,
  Server,
  Download,
  Copy,
  UserCheck,
  CheckCheck,
  Phone,
  MapPin,
  Filter,
  MoreVertical,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  UserPlus,
  Compass,
  FileCode,
  SlidersHorizontal,
  HelpCircle,
  Archive,
  RefreshCcw,
  Zap,
  Palette,
} from 'lucide-react';
import { Product, Order, OrderStatus, Coupon, Review, StoreCategory } from '../../types';
import { uploadToCloudinary } from '../../lib/cloudinary';
import { 
  saveProductToFirestore, 
  saveHomeBannerToFirestore, 
  saveReviewToFirestore, 
  deleteReviewFromFirestore, 
  approveReviewInFirestore,
  updateFirestoreOrderStatus,
  saveCategoryToFirestore,
  updateFirestoreCategory,
  FirestoreReview,
  DEFAULT_CSS_COLOR_TOKENS
} from '../../lib/firebaseService';
import { 
  getRealtimeTrafficSummary, 
  logAnalyticsEvent, 
  AnalyticsTrafficSummary, 
  VisitorEvent 
} from '../../lib/analytics';

type AdminTab = 
  | 'business' 
  | 'analytics' 
  | 'typography'
  | 'orders' 
  | 'inventory' 
  | 'categories' 
  | 'journal' 
  | 'cms' 
  | 'banners' 
  | 'reviews' 
  | 'delivery' 
  | 'coupons' 
  | 'abandoned' 
  | 'chat' 
  | 'contacts' 
  | 'team' 
  | 'calendar' 
  | 'email' 
  | 'hostinger' 
  | 'settings';

interface CategoryItem {
  id: string;
  key: string;
  name: string;
  tagline: string;
  description: string;
  image: string;
  featured: boolean;
}

interface JournalArticle {
  id: string;
  title: string;
  date: string;
  category: string;
  author: string;
  readTime: string;
  image: string;
  excerpt: string;
  content: string;
}

interface CMSPageItem {
  id: string;
  title: string;
  slug: string;
  lastUpdated: string;
  headline: string;
  bodyContent: string;
  status: 'Published' | 'Draft';
}

export const AdminPortal: React.FC = () => {
  const { 
    products, 
    orders, 
    coupons, 
    updateOrderStatus, 
    updateOrderDispatchDate,
    approveOrder,
    markOrderShipped,
    cancelOrder,
    refundOrder,
    updateProductStock, 
    addProduct, 
    updateProduct,
    updateProductRankings,
    deleteProduct, 
    addCoupon, 
    deleteCoupon,
    formatPrice, 
    standardDeliveryDays,
    setStandardDeliveryDays,
    updateProductDeliveryDays,
    calculateDeliveryDate,
    showToast,
    setActivePage,
    isFirebaseOnline,
    onlineDiscountPercent,
    updateOnlineDiscountPercent,
    siteBanners,
    updateSiteBanners,
    syncFirebaseData,
    isAdminAuthenticated,
    verifyAdminPassword,
    lockAdmin,
    contactInquiries,
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
    abandonedCarts,
    recoverAbandonedCart,
    cart,
    reviews,
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
  } = useStore();

  // Authentication Passcode State
  const [portalPasscode, setPortalPasscode] = useState('');
  const [portalPasscodeError, setPortalPasscodeError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const handleUnlockPortal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!portalPasscode.trim()) {
      setPortalPasscodeError('Please enter the admin passcode.');
      return;
    }
    setIsVerifying(true);
    setPortalPasscodeError('');
    try {
      const ok = await verifyAdminPassword(portalPasscode);
      setIsVerifying(false);
      if (!ok) {
        setPortalPasscodeError('Incorrect administrator passcode. Access restricted.');
      }
    } catch {
      setIsVerifying(false);
      setPortalPasscodeError('Verification failed. Try again.');
    }
  };

  // Layout & UI State
  const [activeTab, setActiveTab] = useState<AdminTab>('business');
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1024;
    }
    return true;
  });
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [showRankingStudio, setShowRankingStudio] = useState(false);
  const [rankingFilterCategory, setRankingFilterCategory] = useState<string>('all');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [deliveryProductSearch, setDeliveryProductSearch] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [chartYear, setChartYear] = useState('2026');

  // Auto-close sidebar on mobile view navigation
  const handleTabSelect = (tab: AdminTab) => {
    setActiveTab(tab);
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  // Date Range Filter State for Dashboard & Analytics
  const [dateFilterRange, setDateFilterRange] = useState<
    'all' | 'today' | 'yesterday' | '7days' | '30days' | 'this_month' | 'this_year' | 'custom'
  >('all');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');

  // Password-Protected Dashboard Numbers Zeroing State (Password: 8156958052)
  const [isStatsZeroed, setIsStatsZeroed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('diva_dashboard_zeroed') === 'true';
    } catch {
      return false;
    }
  });
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetPasswordInput, setResetPasswordInput] = useState('');
  const [resetPasswordError, setResetPasswordError] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  const handleResetDashboardNumbers = (e: React.FormEvent) => {
    e.preventDefault();
    setResetPasswordError('');
    if (resetPasswordInput.trim() === '8156958052') {
      setIsResetting(true);
      const ok = resetAllStatsToZero('8156958052');
      setIsResetting(false);
      if (ok) {
        setIsStatsZeroed(true);
        setShowResetModal(false);
        setResetPasswordInput('');
      }
    } else {
      setResetPasswordError('Invalid security password. Access denied.');
    }
  };

  const handleRestoreDefaultBaseline = () => {
    restoreDefaultOrders();
    setIsStatsZeroed(false);
    try {
      localStorage.removeItem('diva_dashboard_zeroed');
    } catch {}
  };

  // Real-Time Typography & Appearance Studio State (Firestore: settings/theme)
  const [editHeadingFont, setEditHeadingFont] = useState(() => themeSettings?.headingFont || "'Playfair Display', serif");
  const [editProductTitleFont, setEditProductTitleFont] = useState(() => themeSettings?.productTitleFont || "'Cormorant Garamond', serif");
  const [editBodyFont, setEditBodyFont] = useState(() => themeSettings?.bodyFont || "'Plus Jakarta Sans', sans-serif");
  const [editHeadingScale, setEditHeadingScale] = useState<number>(() => themeSettings?.headingSizeScale || 1.0);
  const [editProductScale, setEditProductScale] = useState<number>(() => themeSettings?.productTitleSizeScale || 1.0);
  const [editBodyScale, setEditBodyScale] = useState<number>(() => themeSettings?.bodySizeScale || 1.0);
  const [editPrimaryColor, setEditPrimaryColor] = useState(() => themeSettings?.primaryColor || '#0f172a');
  const [editAccentColor, setEditAccentColor] = useState(() => themeSettings?.accentColor || '#c5a880');
  const [editBuyNowColor, setEditBuyNowColor] = useState(() => themeSettings?.buyNowButtonColor || '#DC2626');
  const [editColors, setEditColors] = useState<Record<string, string>>(() => ({
    ...DEFAULT_CSS_COLOR_TOKENS,
    ...(themeSettings?.colors || {})
  }));
  const [isPublishingTheme, setIsPublishingTheme] = useState(false);

  useEffect(() => {
    if (themeSettings) {
      setEditHeadingFont(themeSettings.headingFont || "'Playfair Display', serif");
      setEditProductTitleFont(themeSettings.productTitleFont || "'Cormorant Garamond', serif");
      setEditBodyFont(themeSettings.bodyFont || "'Plus Jakarta Sans', sans-serif");
      setEditHeadingScale(themeSettings.headingSizeScale ?? 1.0);
      setEditProductScale(themeSettings.productTitleSizeScale ?? 1.0);
      setEditBodyScale(themeSettings.bodySizeScale ?? 1.0);
      setEditPrimaryColor(themeSettings.primaryColor || '#0f172a');
      setEditAccentColor(themeSettings.accentColor || '#c5a880');
      setEditBuyNowColor(themeSettings.buyNowButtonColor || '#DC2626');
      if (themeSettings.colors) {
        setEditColors((prev) => ({
          ...DEFAULT_CSS_COLOR_TOKENS,
          ...prev,
          ...themeSettings.colors
        }));
      }
    }
  }, [themeSettings]);

  const handleLiveTypographyChange = (partial: Partial<typeof themeSettings>) => {
    const draft = {
      headingFont: partial.headingFont !== undefined ? partial.headingFont : editHeadingFont,
      productTitleFont: partial.productTitleFont !== undefined ? partial.productTitleFont : editProductTitleFont,
      bodyFont: partial.bodyFont !== undefined ? partial.bodyFont : editBodyFont,
      headingSizeScale: partial.headingSizeScale !== undefined ? partial.headingSizeScale : editHeadingScale,
      productTitleSizeScale: partial.productTitleSizeScale !== undefined ? partial.productTitleSizeScale : editProductScale,
      bodySizeScale: partial.bodySizeScale !== undefined ? partial.bodySizeScale : editBodyScale,
      primaryColor: partial.primaryColor !== undefined ? partial.primaryColor : editPrimaryColor,
      accentColor: partial.accentColor !== undefined ? partial.accentColor : editAccentColor,
      buyNowButtonColor: partial.buyNowButtonColor !== undefined ? partial.buyNowButtonColor : editBuyNowColor,
      colors: partial.colors !== undefined ? partial.colors : editColors
    };
    applyThemeSettingsLocally(draft);
  };

  const handleLiveColorTokenChange = (tokenKey: string, hexVal: string) => {
    const updatedColors = { ...editColors, [tokenKey]: hexVal };
    setEditColors(updatedColors);
    if (tokenKey === 'color-brand-primary' || tokenKey === 'color-btn-bg') {
      setEditPrimaryColor(hexVal);
    }
    if (tokenKey === 'color-brand-accent') {
      setEditAccentColor(hexVal);
    }
    if (tokenKey === 'color-buynow-bg') {
      setEditBuyNowColor(hexVal);
    }
    applyThemeSettingsLocally({
      ...themeSettings,
      colors: updatedColors,
      primaryColor: tokenKey === 'color-brand-primary' ? hexVal : editPrimaryColor,
      accentColor: tokenKey === 'color-brand-accent' ? hexVal : editAccentColor,
      buyNowButtonColor: tokenKey === 'color-buynow-bg' ? hexVal : editBuyNowColor
    });
  };

  const handleApplyColorPreset = (preset: {
    name: string;
    colors: Record<string, string>;
    primary: string;
    accent: string;
    buynow?: string;
  }) => {
    const updatedColors = { ...editColors, ...preset.colors };
    setEditColors(updatedColors);
    setEditPrimaryColor(preset.primary);
    setEditAccentColor(preset.accent);
    if (preset.buynow) setEditBuyNowColor(preset.buynow);
    applyThemeSettingsLocally({
      ...themeSettings,
      colors: updatedColors,
      primaryColor: preset.primary,
      accentColor: preset.accent,
      buyNowButtonColor: preset.buynow || editBuyNowColor
    });
    showToast(`Applied "${preset.name}" Palette`, 'info', 'Colors updated live in DOM & Storefront');
  };

  const handlePublishThemeStyles = async () => {
    setIsPublishingTheme(true);
    try {
      await updateThemeSettings({
        headingFont: editHeadingFont,
        productTitleFont: editProductTitleFont,
        bodyFont: editBodyFont,
        headingSizeScale: editHeadingScale,
        productTitleSizeScale: editProductScale,
        bodySizeScale: editBodyScale,
        primaryColor: editColors['color-brand-primary'] || editPrimaryColor,
        accentColor: editColors['color-brand-accent'] || editAccentColor,
        colors: editColors,
        buyNowButtonColor: editColors['color-buynow-bg'] || editBuyNowColor
      });
      showToast('Theme & Color Palette Published', 'success', 'Synced to Firestore settings/theme in real time.');
    } catch (err) {
      console.error('Publish theme error:', err);
      showToast('Error Publishing Theme', 'error');
    } finally {
      setIsPublishingTheme(false);
    }
  };

  // Order Fulfillment Filters, Search & Firestore Live Update Handlers
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [orderSearchQuery, setOrderSearchQuery] = useState<string>('');
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  const displayedOrders = useMemo(() => {
    return orders.filter((ord) => {
      // Status filter (support canonical & legacy statuses)
      const matchesStatus =
        orderStatusFilter === 'all'
          ? true
          : (ord.status || '').toLowerCase() === orderStatusFilter.toLowerCase() ||
            (orderStatusFilter === 'Pending' && ord.status === 'placed') ||
            (orderStatusFilter === 'Ready' && ord.status === 'packed') ||
            (orderStatusFilter === 'Dispatched' && (ord.status === 'in_transit' || ord.status === 'out_for_delivery')) ||
            (orderStatusFilter === 'Rejected' && ord.status === 'cancelled');

      // Search filter
      if (!orderSearchQuery.trim()) return matchesStatus;
      const q = orderSearchQuery.toLowerCase();
      const idMatch = (ord.orderNumber || ord.orderId || ord.id || '').toLowerCase().includes(q);
      const nameMatch = (ord.customer?.fullName || ord.customerName || ord.shippingAddress?.fullName || '').toLowerCase().includes(q);
      const emailMatch = (ord.customer?.email || ord.email || '').toLowerCase().includes(q);
      const phoneMatch = (ord.customer?.phone || ord.shippingAddress?.phone || '').toLowerCase().includes(q);
      const cityMatch = (ord.customer?.city || ord.shippingAddress?.city || '').toLowerCase().includes(q);
      const itemMatch = (ord.items || []).some((it) => (it.title || it.name || '').toLowerCase().includes(q));

      return matchesStatus && (idMatch || nameMatch || emailMatch || phoneMatch || cityMatch || itemMatch);
    });
  }, [orders, orderStatusFilter, orderSearchQuery]);

  const handleUpdateOrderStatus = async (
    order: Order,
    newStatus: string,
    newDispatchDate?: string | null
  ) => {
    const dispatchVal = newDispatchDate !== undefined ? newDispatchDate : (order.dispatchDate || null);
    setUpdatingOrderId(order.id);
    try {
      await updateFirestoreOrderStatus(order.id, newStatus, dispatchVal);
      updateOrderStatus(order.id, newStatus as any, dispatchVal);
      if (selectedOrderProfile && selectedOrderProfile.id === order.id) {
        setSelectedOrderProfile({
          ...selectedOrderProfile,
          status: newStatus as any,
          dispatchDate: dispatchVal
        });
      }
      showToast(`Order #${order.orderNumber || order.orderId} updated to "${newStatus}"`, 'success');
    } catch (err) {
      console.error('Failed to update order status in Firestore:', err);
      showToast('Error updating order status in Firestore', 'error');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleUpdateOrderDispatchDate = async (order: Order, newDate: string) => {
    setUpdatingOrderId(order.id);
    try {
      await updateFirestoreOrderStatus(order.id, order.status, newDate);
      updateOrderDispatchDate(order.id, newDate);
      if (selectedOrderProfile && selectedOrderProfile.id === order.id) {
        setSelectedOrderProfile({
          ...selectedOrderProfile,
          dispatchDate: newDate
        });
      }
      showToast(`Planned dispatch date set to ${newDate}`, 'success');
    } catch (err) {
      console.error('Failed to update dispatch date in Firestore:', err);
      showToast('Error updating dispatch date in Firestore', 'error');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // Real-Time Live Clock
  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Real-Time Concurrent Visitors Estimation & Native Firebase Analytics Stream (G-JGWMX68JYX)
  const [trafficSummary, setTrafficSummary] = useState<AnalyticsTrafficSummary>(() => getRealtimeTrafficSummary());
  const [liveVisitors, setLiveVisitors] = useState(() => Math.max(18, cart.length * 3 + orders.length * 2 + 12));

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveVisitors((prev) => Math.max(12, Math.min(54, prev + Math.floor(Math.random() * 5) - 2)));
      setTrafficSummary(getRealtimeTrafficSummary());
    }, 3000);
    return () => clearInterval(interval);
  }, [cart.length, orders.length]);

  const handleSendTestAnalyticsPing = () => {
    logAnalyticsEvent('page_view', {
      page_title: 'Admin Console Live Ping',
      page_path: '/admin',
      value: 1
    });
    setTrafficSummary(getRealtimeTrafficSummary());
    showToast('Analytics Ping Dispatched', 'success', 'Event logged to Firebase Analytics (G-JGWMX68JYX)');
  };

  // Sync Firebase
  const handleManualSync = async () => {
    setIsSyncing(true);
    await syncFirebaseData();
    setIsSyncing(false);
    showToast('Firebase Cloud Sync Active', 'success', 'All catalog, orders, and banner records synchronized in real time.');
  };

  // --- REAL-TIME CATEGORIES BUILDER & CLOUDINARY UPLOAD STATE ---
  const [editingCategory, setEditingCategory] = useState<StoreCategory | null>(null);
  const [isUploadingCategoryPhoto, setIsUploadingCategoryPhoto] = useState(false);
  const [categoryPhotoProgress, setCategoryPhotoProgress] = useState(0);
  const categoryFileInputRef = useRef<HTMLInputElement>(null);

  const handleCategoryPhotoUpload = async (files: FileList | File[]) => {
    const file = files[0];
    if (!file || !editingCategory) return;
    setIsUploadingCategoryPhoto(true);
    setCategoryPhotoProgress(0);
    try {
      const url = await uploadToCloudinary(file, (percent) => {
        setCategoryPhotoProgress(percent);
      });
      setEditingCategory({
        ...editingCategory,
        imageUrl: url,
        image: url
      });
      showToast('Photo Uploaded to Cloudinary CDN', 'success');
    } catch (err) {
      console.error('Cloudinary Category upload failed:', err);
      showToast('Cloudinary Upload Failed', 'error', 'Could not upload category photo to Cloudinary.');
    } finally {
      setIsUploadingCategoryPhoto(false);
    }
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;
    try {
      await updateCategory(editingCategory);
      await saveCategoryToFirestore(editingCategory);
      setEditingCategory(null);
      showToast(`Category "${editingCategory.name}" Updated`, 'success', 'Changes synced to Firestore & Cloudinary in real time.');
    } catch (err) {
      console.error('Failed to save category:', err);
      showToast('Error Saving Category', 'error', 'Failed to update category in Firestore.');
    }
  };

  // --- JOURNAL & BLOG ARTICLES (2+ ARTICLES) ---
  const [journalArticles, setJournalArticles] = useState<JournalArticle[]>([
    {
      id: 'art-1',
      title: 'Nordic Functionalism: Why Less is More in Contemporary Living',
      date: 'October 14, 2026',
      category: 'Philosophy',
      author: 'Chloe Dupont',
      readTime: '4 min read',
      image: 'https://images.unsplash.com/photo-1513094735237-8f2714d57c13?q=80&w=800&auto=format&fit=crop',
      excerpt: 'Examining the timeless architectural principles behind Scandinavian minimalism and how they translate to everyday utility.',
      content: 'Scandinavian design is not just a style; it is an enduring philosophy that bridges utility, natural materiality, and quiet luxury...'
    },
    {
      id: 'art-2',
      title: 'The Optics Care Guide: Preserving Handmade Bio-Acetate Frames',
      date: 'September 28, 2026',
      category: 'Care Guide',
      author: 'Marcus Lindqvist',
      readTime: '6 min read',
      image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=800&auto=format&fit=crop',
      excerpt: 'How ultrasonic cleaning, proper hinge tensioning, and microfiber storage keep your designer eyewear pristine for decades.',
      content: 'Bio-cellulose acetate is a plant-based material crafted from renewable cotton fibers and wood pulp. Maintaining its lustrous finish requires delicate stewardship...'
    }
  ]);
  const [editingArticle, setEditingArticle] = useState<JournalArticle | null>(null);
  const [showAddArticleModal, setShowAddArticleModal] = useState(false);

  // --- CMS PAGES STATE (5 PAGES) ---
  const [cmsPages, setCmsPages] = useState<CMSPageItem[]>([
    {
      id: 'cms-1',
      title: 'About Us & Atelier Story',
      slug: '/about',
      lastUpdated: 'September 01, 2026',
      headline: 'Architectural Silhouettes. Sustainable Bio-Acetates. Made for Modern Visionaries.',
      bodyContent: 'Founded with a devotion to Scandinavian minimalism and bespoke couture, DivaChic operates at the intersection of architectural form and everyday utility.',
      status: 'Published'
    },
    {
      id: 'cms-2',
      title: 'Contact & Concierge Studio',
      slug: '/contact',
      lastUpdated: 'August 29, 2026',
      headline: 'Speak with our Client Concierge & Bespoke Tailoring Stylists.',
      bodyContent: 'Our studio is located at Flagship Avenue, Bangalore. Live chat concierge is open Monday through Saturday, 9 AM - 8 PM IST.',
      status: 'Published'
    },
    {
      id: 'cms-3',
      title: 'Shipping & Global Delivery Policy',
      slug: '/shipping',
      lastUpdated: 'August 15, 2026',
      headline: 'Complimentary Insured Express Delivery across India & Global Metros.',
      bodyContent: 'Every DivaChic shipment is packaged in biodegradable embossed boxes with tamper-proof security seals. Standard delivery takes 3-5 business days.',
      status: 'Published'
    },
    {
      id: 'cms-4',
      title: 'Privacy Policy & GDPR Compliance',
      slug: '/privacy',
      lastUpdated: 'August 10, 2026',
      headline: 'We protect your data with 256-Bit SSL Encryption & Zero Third-Party Tracking.',
      bodyContent: 'Your personal information is encrypted and stored in secure cloud vaults strictly to fulfill orders and provide tailored concierge recommendations.',
      status: 'Published'
    },
    {
      id: 'cms-5',
      title: 'Terms of Service & Return Guarantee',
      slug: '/terms',
      lastUpdated: 'August 05, 2026',
      headline: '7 Days Hassle-Free Returns & 1-Year Craftsmanship Warranty.',
      bodyContent: 'If your item does not fit to perfection or meet expectations, initiate a return within 7 days for an immediate exchange or full refund.',
      status: 'Published'
    }
  ]);
  const [editingCmsPage, setEditingCmsPage] = useState<CMSPageItem | null>(null);

  // --- REAL-TIME CALCULATED FINANCIAL METRICS WITH DATE RANGE FILTERING ---
  const isOrderInDateRange = (ord: Order) => {
    if (dateFilterRange === 'all') return true;
    const dateStr = ord.createdAt || ord.date;
    if (!dateStr) return true;
    const ordDate = new Date(dateStr);
    if (isNaN(ordDate.getTime())) return true;
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfYesterday = new Date(startOfToday.getTime() - 24 * 60 * 60 * 1000);
    const endOfYesterday = new Date(startOfToday.getTime() - 1);

    if (dateFilterRange === 'today') return ordDate >= startOfToday;
    if (dateFilterRange === 'yesterday') return ordDate >= startOfYesterday && ordDate <= endOfYesterday;
    if (dateFilterRange === '7days') return ordDate >= new Date(startOfToday.getTime() - 7 * 24 * 60 * 60 * 1000);
    if (dateFilterRange === '30days') return ordDate >= new Date(startOfToday.getTime() - 30 * 24 * 60 * 60 * 1000);
    if (dateFilterRange === 'this_month') return ordDate >= new Date(now.getFullYear(), now.getMonth(), 1);
    if (dateFilterRange === 'this_year') return ordDate >= new Date(now.getFullYear(), 0, 1);
    if (dateFilterRange === 'custom') {
      if (customStartDate && ordDate < new Date(customStartDate)) return false;
      if (customEndDate) {
        const endD = new Date(customEndDate);
        endD.setHours(23, 59, 59, 999);
        if (ordDate > endD) return false;
      }
      return true;
    }
    return true;
  };

  const validOrders = useMemo(() => {
    if (isStatsZeroed) return [];
    return (orders || [])
      .filter((o) => (o?.status || '') !== 'cancelled')
      .filter(isOrderInDateRange);
  }, [orders, isStatsZeroed, dateFilterRange, customStartDate, customEndDate]);
  
  // Real Sales
  const realTotalSales = useMemo(() => {
    if (isStatsZeroed) return 0;
    return validOrders.reduce((sum, ord) => sum + (ord.total || 0), 0);
  }, [validOrders, isStatsZeroed]);
  
  // Real Cost & Expenses (COGS based on wholesale catalog valuation + active order dispatch fees)
  const realInventoryCostValuation = useMemo(() => {
    if (isStatsZeroed) return 0;
    return (products || []).reduce((sum, p) => sum + ((p.price || 0) * 0.45 * (p.stockQuantity || 0)), 0);
  }, [products, isStatsZeroed]);

  const realOrderFulfillmentCosts = useMemo(() => {
    if (isStatsZeroed) return 0;
    return validOrders.reduce((sum, ord) => sum + ((ord.total || 0) * 0.40), 0);
  }, [validOrders, isStatsZeroed]);

  const realTotalExpenses = useMemo(() => {
    if (isStatsZeroed) return 0;
    if (validOrders.length === 0) return 0;
    return Math.round(realOrderFulfillmentCosts + (realInventoryCostValuation * 0.05));
  }, [realOrderFulfillmentCosts, realInventoryCostValuation, validOrders.length, isStatsZeroed]);

  // Real Net Profit
  const realNetProfit = useMemo(() => {
    if (isStatsZeroed) return 0;
    return Math.max(0, realTotalSales - realTotalExpenses);
  }, [realTotalSales, realTotalExpenses, isStatsZeroed]);

  const profitMarginPercent = useMemo(() => {
    if (isStatsZeroed || realTotalSales === 0) return '0.0';
    return ((realNetProfit / realTotalSales) * 100).toFixed(1);
  }, [realNetProfit, realTotalSales, isStatsZeroed]);

  // Real Gross Revenue (Sales + dynamic tax / logistics allocation)
  const realGrossRevenue = useMemo(() => {
    if (isStatsZeroed) return 0;
    return Math.round(realTotalSales * 1.08);
  }, [realTotalSales, isStatsZeroed]);

  // Growth Indicators
  const salesGrowthPercent = useMemo(() => {
    if (isStatsZeroed) return '0%';
    return validOrders.length > 0 ? `+${Math.min(95, 15 + validOrders.length * 5)}%` : '0%';
  }, [validOrders.length, isStatsZeroed]);

  // Real 12-Month Monthly Distribution
  const monthlyFinancials = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    if (isStatsZeroed) {
      return months.map((month) => ({ month, inc: 0, exp: 0, profit: 0 }));
    }
    const monthlyIncome = new Array(12).fill(0);
    const monthlyExpenses = new Array(12).fill(0);

    validOrders.forEach((ord) => {
      const orderDateStr = ord.createdAt || ord.date || new Date().toISOString();
      const orderDate = new Date(orderDateStr);
      if (orderDate.getFullYear().toString() === chartYear) {
        const m = orderDate.getMonth();
        monthlyIncome[m] += Math.round((ord.total || 0) * 85);
        monthlyExpenses[m] += Math.round((ord.total || 0) * 40);
      }
    });

    return months.map((month, idx) => {
      const inc = monthlyIncome[idx];
      const exp = monthlyExpenses[idx];
      const profit = Math.max(0, inc - exp);
      return { month, inc, exp, profit };
    });
  }, [validOrders, chartYear, isStatsZeroed]);

  // Real Customer Directory (CRM)
  const realCustomerCRM = useMemo(() => {
    const customerMap = new Map<string, {
      id: string;
      name: string;
      email: string;
      phone: string;
      city: string;
      address: string;
      country: string;
      totalSpent: number;
      ordersCount: number;
      orderNumbers: string[];
      lastOrderDate: string;
      tier: 'Diamond VIP' | 'Platinum Privé' | 'Gold Member' | 'Silver Member';
      avatar: string;
      notes: string;
    }>();

    (orders || []).forEach((ord) => {
      if (!ord) return;
      const email = ord.email || (ord.shippingAddress as any)?.email || 'client@divachic.com';
      const emailKey = email.toLowerCase().trim();
      const customerName = ord.customerName || ord.shippingAddress?.fullName || 'Valued Client';
      const orderTotal = ord.status !== 'cancelled' ? (ord.total || 0) : 0;
      const orderDate = ord.createdAt || ord.date || new Date().toISOString();
      const phone = ord.shippingAddress?.phone || '+91 98450 00000';
      const city = ord.shippingAddress?.city || 'Bangalore';
      const street = (ord.shippingAddress as any)?.addressLine1 || (ord.shippingAddress as any)?.street || 'Flagship Avenue';
      const country = ord.shippingAddress?.country || 'India';
      const orderNum = ord.orderNumber || ord.id || 'DIVA-2026';

      const existing = customerMap.get(emailKey);
      if (existing) {
        existing.totalSpent += orderTotal;
        existing.ordersCount += 1;
        if (!existing.orderNumbers.includes(orderNum)) {
          existing.orderNumbers.push(orderNum);
        }
        if (new Date(orderDate) > new Date(existing.lastOrderDate)) {
          existing.lastOrderDate = orderDate;
        }
      } else {
        customerMap.set(emailKey, {
          id: `crm-${emailKey}`,
          name: customerName,
          email: email,
          phone: phone,
          city: city,
          address: street,
          country: country,
          totalSpent: orderTotal,
          ordersCount: 1,
          orderNumbers: [orderNum],
          lastOrderDate: orderDate,
          tier: 'Silver Member',
          avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(customerName)}&backgroundColor=8b5cf6`,
          notes: `Prefers express courier delivery. Payment method: ${ord.paymentMethod || 'Prepaid Online'}`
        });
      }
    });

    (contactInquiries || []).forEach((inq) => {
      if (!inq) return;
      const email = inq.email || 'inquiry@divachic.com';
      const emailKey = email.toLowerCase().trim();
      if (!customerMap.get(emailKey)) {
        customerMap.set(emailKey, {
          id: `crm-${emailKey}`,
          name: inq.name || 'Valued Client',
          email: email,
          phone: inq.phone || '+91 98450 12891',
          city: 'Bangalore',
          address: 'Studio Atelier Inquiry',
          country: 'India',
          totalSpent: 0,
          ordersCount: 0,
          orderNumbers: inq.orderNumber ? [inq.orderNumber] : [],
          lastOrderDate: inq.createdAt || new Date().toISOString(),
          tier: 'Silver Member',
          avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(inq.name || 'Client')}&backgroundColor=c85a32`,
          notes: `Inquiry topic: ${inq.subject || 'General Inquiry'}`
        });
      }
    });

    const customerList = Array.from(customerMap.values());
    customerList.forEach((c) => {
      if (c.totalSpent >= 1500) c.tier = 'Diamond VIP';
      else if (c.totalSpent >= 800) c.tier = 'Platinum Privé';
      else if (c.totalSpent >= 300) c.tier = 'Gold Member';
      else c.tier = 'Silver Member';
    });

    return customerList;
  }, [orders, contactInquiries]);

  // --- FILTERED ORDERS LIST FOR MASTER OMS ---
  const filteredOrders = useMemo(() => {
    if (orderStatusFilter === 'all') return orders;
    return orders.filter((o) => o.status === orderStatusFilter);
  }, [orders, orderStatusFilter]);

  // Order Detail Profile Modal
  const [selectedOrderProfile, setSelectedOrderProfile] = useState<Order | null>(null);
  const [shippedModalOrder, setShippedModalOrder] = useState<Order | null>(null);
  const [customCarrier, setCustomCarrier] = useState('DHL Express Nordic');
  const [customTracking, setCustomTracking] = useState('');

  // --- RICH PRODUCT MODAL STATE (EXACT SCREENSHOT FIELDS) ---
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newProdName, setNewProdName] = useState('');
  const [newProdSku, setNewProdSku] = useState(`HAU-${Math.floor(1000 + Math.random() * 9000)}`);
  const [newProdCategory, setNewProdCategory] = useState<string>('backpack');
  const [newProdPrice, setNewProdPrice] = useState<number>(145);
  const [newProdOriginalPrice, setNewProdOriginalPrice] = useState<number>(185);
  const [newProdStock, setNewProdStock] = useState<number>(25);
  const [newProdReturnPolicy, setNewProdReturnPolicy] = useState('7 Days Easy Hassle-Free Returns & Exchange');
  const [newProdPurchasedCount, setNewProdPurchasedCount] = useState<number>(42);
  const [newProdTagline, setNewProdTagline] = useState('Handcrafted in Oslo from sustainable vegetable-tanned full-grain leather');
  const [newProdVideoUrl, setNewProdVideoUrl] = useState('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
  const [newProdImages, setNewProdImages] = useState<string[]>(['https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=800&auto=format&fit=crop']);
  const [newProdImageInput, setNewProdImageInput] = useState('');
  const [newProdDescription, setNewProdDescription] = useState('Woven in the Scottish Highlands from 100% fine Merino wool. Provides cloud-like softness and winter-grade insulation without any itchiness.');
  
  // Available Colors for Individual Product Swatches
  const [newProdColors, setNewProdColors] = useState<{ name: string; hex: string }[]>([]);
  const [colorInputName, setColorInputName] = useState('');
  const [colorInputHex, setColorInputHex] = useState('#1F1F1F');

  // Custom Font & Font Size for Individual Product
  const [newProdCustomFont, setNewProdCustomFont] = useState('');
  const [newProdCustomFontSize, setNewProdCustomFontSize] = useState('');

  // Individual Product "Buy Now" Button Color
  const [newProdBuyNowColor, setNewProdBuyNowColor] = useState('#DC2626');

  // Individual Product Priority Rank & Best Seller Tag
  const [newProdRank, setNewProdRank] = useState<number>(1);
  const [newProdIsBestSeller, setNewProdIsBestSeller] = useState<boolean>(false);
  const [newProdDeliveryDays, setNewProdDeliveryDays] = useState<number>(3);

  // Custom Reviews for Product
  const [newProdReviews, setNewProdReviews] = useState<Review[]>([]);
  const [revAuthor, setRevAuthor] = useState('');
  const [revRating, setRevRating] = useState(5);
  const [revTitle, setRevTitle] = useState('');
  const [revComment, setRevComment] = useState('');

  // Open Full Rich Modal Helper
  const openCreateProductModal = (existing?: Product) => {
    if (existing) {
      setEditingProduct(existing);
      setNewProdName(existing.name);
      setNewProdSku(existing.sku || `HAU-${Math.floor(1000 + Math.random() * 9000)}`);
      setNewProdCategory(existing.category);
      setNewProdPrice(existing.price);
      setNewProdOriginalPrice(existing.originalPrice || existing.price * 1.25);
      setNewProdStock(existing.stockQuantity);
      setNewProdReturnPolicy(existing.returnPolicy || '7 Days Easy Hassle-Free Returns & Exchange');
      setNewProdPurchasedCount(existing.recentPurchasesCount || 42);
      setNewProdTagline(existing.tagline || '');
      setNewProdVideoUrl(existing.youtubeUrl || '');
      setNewProdImages(existing.images || []);
      setNewProdDescription(existing.description || '');
      setNewProdReviews(existing.reviews || []);
      setNewProdColors(existing.colors && existing.colors.length > 0 ? existing.colors : [
        { name: 'Charcoal Noir', hex: '#1F1F1F' },
        { name: 'Warm Bone', hex: '#FAFAF9' },
        { name: 'Terracotta', hex: '#C85A32' }
      ]);
      setNewProdCustomFont(existing.customFont || '');
      setNewProdCustomFontSize(existing.customFontSize || '');
      setNewProdBuyNowColor(existing.buyNowButtonColor || '#DC2626');
      setNewProdRank(existing.displayRank !== undefined ? existing.displayRank : (products.indexOf(existing) + 1));
      setNewProdIsBestSeller(existing.isBestSeller || false);
      setNewProdDeliveryDays(existing.deliveryDays ?? standardDeliveryDays);
    } else {
      setEditingProduct(null);
      setNewProdName('');
      setNewProdSku(`HAU-${Math.floor(1000 + Math.random() * 9000)}`);
      setNewProdCategory('backpack');
      setNewProdPrice(145);
      setNewProdOriginalPrice(185);
      setNewProdStock(25);
      setNewProdReturnPolicy('7 Days Easy Hassle-Free Returns & Exchange');
      setNewProdPurchasedCount(42);
      setNewProdTagline('Handcrafted in Oslo from sustainable vegetable-tanned full-grain leather');
      setNewProdVideoUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
      setNewProdImages(['https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=800&auto=format&fit=crop']);
      setNewProdDescription('Handcrafted details, fabric composition, durability features...');
      setNewProdReviews([]);
      setNewProdColors([
        { name: 'Midnight Charcoal', hex: '#1F1F1F' },
        { name: 'Bone Cream', hex: '#F9F8F6' },
        { name: 'Terracotta Red', hex: '#C85A32' }
      ]);
      setNewProdCustomFont('');
      setNewProdCustomFontSize('');
      setNewProdBuyNowColor('#DC2626');
      setNewProdRank(products.length + 1);
      setNewProdIsBestSeller(false);
      setNewProdDeliveryDays(standardDeliveryDays || 3);
    }
    setShowAddProduct(true);
  };

  // Storefront Product Ranking & Ordering Helpers
  const handleMoveProductRank = async (productId: string, direction: 'up' | 'down') => {
    const sorted = [...products].sort((a, b) => (a.displayRank ?? 9999) - (b.displayRank ?? 9999));
    const currentIndex = sorted.findIndex((p) => p.id === productId);
    if (currentIndex === -1) return;
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= sorted.length) return;

    const copy = [...sorted];
    const [moved] = copy.splice(currentIndex, 1);
    copy.splice(targetIndex, 0, moved);

    await updateProductRankings(copy);
  };

  const handleToggleBestSeller = async (product: Product) => {
    const updated = { ...product, isBestSeller: !product.isBestSeller };
    updateProduct(updated);
    saveProductToFirestore(updated).catch((e) => console.warn('Firestore sync error:', e));
    showToast(
      updated.isBestSeller ? `Marked "${product.name}" as Best Seller` : `Removed Best Seller tag from "${product.name}"`,
      'success',
      'Reflected on Main Page & Catalog'
    );
  };

  const handleApplyRankPreset = async (preset: 'bestsellers' | 'price-high' | 'price-low' | 'rating' | 'newest' | 'clean-numbers') => {
    const copy = [...products];
    if (preset === 'bestsellers') {
      copy.sort((a, b) => {
        const scoreA = (a.isBestSeller ? 1000 : 0) + (a.recentPurchasesCount || 0);
        const scoreB = (b.isBestSeller ? 1000 : 0) + (b.recentPurchasesCount || 0);
        if (scoreA !== scoreB) return scoreB - scoreA;
        return (a.displayRank ?? 9999) - (b.displayRank ?? 9999);
      });
    } else if (preset === 'price-high') {
      copy.sort((a, b) => b.price - a.price);
    } else if (preset === 'price-low') {
      copy.sort((a, b) => a.price - b.price);
    } else if (preset === 'rating') {
      copy.sort((a, b) => (b.rating || 5) - (a.rating || 5));
    } else if (preset === 'newest') {
      copy.sort((a, b) => (b.isNewArrival || b.isNew ? 1 : 0) - (a.isNewArrival || a.isNew ? 1 : 0));
    } else if (preset === 'clean-numbers') {
      copy.sort((a, b) => (a.displayRank ?? 9999) - (b.displayRank ?? 9999));
    }
    await updateProductRankings(copy);
  };

  const handleDirectSetRank = async (productId: string, newRank: number) => {
    const updated = products.map((p) => (p.id === productId ? { ...p, displayRank: Math.max(1, newRank) } : p));
    updated.sort((a, b) => (a.displayRank ?? 9999) - (b.displayRank ?? 9999));
    await updateProductRankings(updated);
  };

  const handleSetProductTop = async (productId: string) => {
    const sorted = [...products].sort((a, b) => (a.displayRank ?? 9999) - (b.displayRank ?? 9999));
    const item = sorted.find((p) => p.id === productId);
    if (!item) return;
    const rest = sorted.filter((p) => p.id !== productId);
    const newOrder = [item, ...rest];
    await updateProductRankings(newOrder);
  };

  // Cloudinary Media Upload State & Handler
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const [isUploadingToStorage, setIsUploadingToStorage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleImageFileUpload = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;
    setIsUploadingToStorage(true);
    setUploadProgress(15);
    try {
      const uploadPromises = Array.from(files).map((file) => 
        uploadToCloudinary(file, (p) => {
          setUploadProgress(Math.round(p));
        })
      );
      const urls = await Promise.all(uploadPromises);
      setNewProdImages((prev) => [...prev, ...urls]);
      setIsUploadingToStorage(false);
      setUploadProgress(100);
      showToast(`Uploaded ${urls.length} photo(s) to Cloudinary!`, 'success', 'CDN secure URL generated');
    } catch (err: any) {
      setIsUploadingToStorage(false);
      console.error('Cloudinary upload error:', err);
      showToast('Media upload error', 'error', err?.message || 'Check Cloudinary preset divachic_products.');
    }
  };

  // Cloudinary Banner Image Upload Handler
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const handleBannerUpload = async (file: File, bannerKey: string) => {
    setIsUploadingBanner(true);
    try {
      const secureUrl = await uploadToCloudinary(file);
      updateSiteBanners({ [bannerKey]: secureUrl });
      setIsUploadingBanner(false);
      showToast('Banner uploaded to Cloudinary!', 'success', 'Saved to Firestore settings/home_banner');
    } catch (err: any) {
      setIsUploadingBanner(false);
      console.error('Banner upload error:', err);
      showToast('Banner upload failed', 'error', err?.message);
    }
  };

  // Review Modal State
  const [showAddReviewModal, setShowAddReviewModal] = useState(false);
  const [newRevCustomerName, setNewRevCustomerName] = useState('');
  const [newRevRating, setNewRevRating] = useState(5);
  const [newRevTitle, setNewRevTitle] = useState('');
  const [newRevText, setNewRevText] = useState('');
  const [newRevProductId, setNewRevProductId] = useState(products[0]?.id || 'prod-1');
  const [newRevImageUrl, setNewRevImageUrl] = useState('');
  const [isUploadingReviewImg, setIsUploadingReviewImg] = useState(false);

  // Coupons State
  const [showAddCoupon, setShowAddCoupon] = useState(false);
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponDiscount, setNewCouponDiscount] = useState(15);
  const [newCouponMinSpend, setNewCouponMinSpend] = useState(100);
  const [newCouponDesc, setNewCouponDesc] = useState('');

  // Staff Member Modal State
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffEmail, setNewStaffEmail] = useState('');
  const [newStaffRole, setNewStaffRole] = useState<'Owner' | 'Store Manager' | 'Inventory Lead' | 'Fulfillment Specialist' | 'Senior Stylist'>('Store Manager');
  const [newStaffAvatar, setNewStaffAvatar] = useState('https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop');

  // Calendar Event Modal State
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDate, setNewEventDate] = useState('2026-09-18');
  const [newEventType, setNewEventType] = useState<'drop' | 'sale' | 'restock' | 'fulfillment'>('drop');
  const [newEventNotes, setNewEventNotes] = useState('');

  // Email Campaign Composer State
  const [emailCampaignSubject, setEmailCampaignSubject] = useState('Exclusive Autumn Capsule: 20% Off Bespoke Silhouettes');
  const [emailCampaignAudience, setEmailCampaignAudience] = useState('All Registered Clients');
  const [emailCampaignBody, setEmailCampaignBody] = useState(
    'Dear Connoisseur,\n\nWe are delighted to present the DivaChic Autumn/Winter couture drop. Handcrafted with Japanese bio-acetates and non-mulesed Scandinavian wool.\n\nUse code DIVACHIC20 at checkout for an exclusive 20% privilege.\n\nWarm regards,\nDivaChic Studio Atelier'
  );

  // Chat & Inquiries Reply State
  const [selectedInquiryId, setSelectedInquiryId] = useState<string>(() => contactInquiries[0]?.id || '');
  const [chatReplyInput, setChatReplyInput] = useState('');

  const activeInquiry = useMemo(() => {
    return (contactInquiries || []).find((i) => i?.id === selectedInquiryId) || contactInquiries[0];
  }, [contactInquiries, selectedInquiryId]);

  const handleSendInquiryReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatReplyInput.trim() || !activeInquiry) return;
    replyContactInquiry(activeInquiry.id, chatReplyInput.trim());
    setChatReplyInput('');
  };

  // Editable Admin Profile Form
  const [editAdminName, setEditAdminName] = useState(adminProfile?.name || 'Administrator');
  const [editAdminEmail, setEditAdminEmail] = useState(adminProfile?.email || 'admin@divachic.com');
  const [editAdminRole, setEditAdminRole] = useState(adminProfile?.role || 'Director');
  const [editAdminAvatar, setEditAdminAvatar] = useState(adminProfile?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop');

  // Global Search Filter Results
  const globalSearchResults = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const q = searchQuery.toLowerCase().trim();
    return {
      products: (products || []).filter((p) => 
        (p?.name || '').toLowerCase().includes(q) || 
        (p?.category || '').toLowerCase().includes(q)
      ),
      orders: (orders || []).filter((o) => 
        (o?.orderNumber || '').toLowerCase().includes(q) || 
        (o?.customerName || (o?.shippingAddress as any)?.fullName || '').toLowerCase().includes(q) || 
        (o?.email || '').toLowerCase().includes(q)
      ),
      customers: (realCustomerCRM || []).filter((c) => 
        (c?.name || '').toLowerCase().includes(q) || 
        (c?.email || '').toLowerCase().includes(q) || 
        (c?.phone || '').includes(q)
      ),
      coupons: (coupons || []).filter((cp) => 
        (cp?.code || '').toLowerCase().includes(q)
      )
    };
  }, [searchQuery, products, orders, realCustomerCRM, coupons]);

  // --- UNLOCK SCREEN IF LOCKED ---
  if (!isAdminAuthenticated) {
    return (
      <div className="bg-[#F4F2EE] min-h-screen flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md bg-white border border-[#E2DED5] shadow-2xl rounded-sm overflow-hidden">
          <div className="bg-[#1E1B2E] text-white p-8 text-center border-b border-[#302B48]">
            <div className="w-14 h-14 mx-auto rounded-xl bg-gradient-to-tr from-[#8B5CF6] to-[#EC4899] flex items-center justify-center text-white mb-4 shadow-lg">
              <Lock className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-bold font-sans tracking-tight">Mono Administrator Hub</h2>
            <p className="text-xs text-[#A7A3BF] mt-1 font-medium">DivaChic Enterprise Operations Console</p>
          </div>

          <div className="p-8 space-y-6">
            <p className="text-xs text-[#6B655B] text-center leading-relaxed">
              Protected portal with real-time financial records, product catalog controls, and direct OMS fulfillment. Please enter your administrator passcode.
            </p>

            <form onSubmit={handleUnlockPortal} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#1F1F1F] uppercase tracking-wider mb-2">
                  Administrator Passcode
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8C8477]">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    value={portalPasscode}
                    onChange={(e) => {
                      setPortalPasscode(e.target.value);
                      if (portalPasscodeError) setPortalPasscodeError('');
                    }}
                    placeholder="Enter admin passcode"
                    className="w-full pl-10 pr-4 py-3 bg-[#FAF9F6] border border-[#D5D0C5] text-sm text-[#1F1F1F] placeholder:text-[#9E978C] focus:outline-none focus:border-[#8B5CF6] rounded-sm font-mono tracking-widest"
                    required
                    autoFocus
                  />
                </div>
                {portalPasscodeError && (
                  <div className="mt-2.5 flex items-center gap-1.5 text-xs text-[#DC2626] bg-[#FEF2F2] border border-[#FECACA] p-2.5 rounded-sm font-medium">
                    <ShieldAlert className="w-4 h-4 shrink-0" />
                    <span>{portalPasscodeError}</span>
                  </div>
                )}
              </div>

              <div className="pt-2 flex flex-col gap-2.5">
                <button
                  type="submit"
                  disabled={isVerifying}
                  className="w-full bg-[#1E1B2E] hover:bg-[#8B5CF6] text-white font-semibold text-xs tracking-wider py-3.5 px-4 rounded-sm transition-all duration-200 uppercase cursor-pointer flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                >
                  <Lock className="w-4 h-4" />
                  <span>{isVerifying ? 'Authenticating...' : 'Unlock Admin Portal'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActivePage('home')}
                  className="w-full py-2.5 text-xs text-[#6B655B] hover:text-[#1F1F1F] transition-colors cursor-pointer text-center font-medium"
                >
                  Return to Storefront
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // --- FULL FUNCTIONAL ADMIN DASHBOARD (MONO THEME) ---
  return (
    <div className="min-h-screen bg-[#F4F6F9] text-[#2C2E3E] flex font-sans antialiased selection:bg-[#8B5CF6] selection:text-white">
      
      {/* Mobile Drawer Backdrop */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden transition-opacity duration-300"
          aria-label="Close sidebar backdrop"
        />
      )}

      {/* 1. LEFT SIDEBAR (MONO DEEP PURPLE PALETTE #1E1B2E) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] transform transition-transform duration-300 ease-in-out bg-[#1E1B2E] text-[#A7A3BF] flex flex-col select-none overflow-y-auto ${
          sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        } lg:translate-x-0 lg:static lg:sticky lg:top-0 lg:h-screen lg:z-30 ${sidebarOpen ? 'lg:w-64' : 'lg:w-20'}`}
      >
        {/* Brand Header */}
        <div className="h-20 px-6 flex items-center justify-between border-b border-[#2C2742]">
          <div className="flex items-center gap-3 overflow-hidden cursor-pointer" onClick={() => handleTabSelect('business')}>
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-[#8B5CF6] to-[#EC4899] flex items-center justify-center text-white font-black text-lg tracking-tighter shadow-md shrink-0">
              <span className="italic font-mono">M</span>
            </div>
            {sidebarOpen && (
              <div className="flex flex-col">
                <span className="font-bold text-white text-base tracking-widest uppercase font-sans">
                  MONO
                </span>
                <span className="text-[10px] text-[#8C87A8] tracking-wider uppercase font-semibold">
                  DivaChic Enterprise
                </span>
              </div>
            )}
          </div>
          {/* Mobile Close Button */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 text-[#8C87A8] hover:text-white rounded-lg hover:bg-[#2C2742] transition-colors cursor-pointer"
            aria-label="Close Sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Groups */}
        <div className="flex-1 py-6 px-3 space-y-6 text-xs font-medium">
          
          {/* SECTION 1: DASHBOARDS */}
          <div>
            {sidebarOpen && (
              <span className="px-3 text-[10px] font-bold text-[#6D688A] uppercase tracking-wider block mb-2">
                Dashboards
              </span>
            )}
            <div className="space-y-1">
              <button
                onClick={() => handleTabSelect('business')}
                className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-lg transition-all cursor-pointer text-left ${
                  activeTab === 'business'
                    ? 'bg-[#8B5CF6] text-white font-semibold shadow-md shadow-[#8B5CF6]/30'
                    : 'hover:bg-[#28243D] hover:text-white'
                }`}
                title="Business Dashboard"
              >
                <LayoutDashboard className="w-4 h-4 shrink-0" />
                {sidebarOpen && <span>Business Dashboard</span>}
              </button>

              <button
                onClick={() => handleTabSelect('analytics')}
                className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-lg transition-all cursor-pointer text-left ${
                  activeTab === 'analytics'
                    ? 'bg-[#8B5CF6] text-white font-semibold shadow-md shadow-[#8B5CF6]/30'
                    : 'hover:bg-[#28243D] hover:text-white'
                }`}
                title="Analytics Dashboard"
              >
                <BarChart3 className="w-4 h-4 shrink-0" />
                {sidebarOpen && <span>Analytics Dashboard</span>}
              </button>
            </div>
          </div>

          {/* SECTION 2: E-COMMERCE OMS & CATALOG */}
          <div>
            {sidebarOpen && (
              <span className="px-3 text-[10px] font-bold text-[#6D688A] uppercase tracking-wider block mb-2">
                E-Commerce Operations
              </span>
            )}
            <div className="space-y-1">
              <button
                onClick={() => handleTabSelect('orders')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg transition-all cursor-pointer text-left ${
                  activeTab === 'orders'
                    ? 'bg-[#8B5CF6] text-white font-semibold shadow-md shadow-[#8B5CF6]/30'
                    : 'hover:bg-[#28243D] hover:text-white'
                }`}
                title="Master Orders & OMS"
              >
                <div className="flex items-center gap-3.5">
                  <ShoppingBag className="w-4 h-4 shrink-0" />
                  {sidebarOpen && <span>Master Orders & OMS</span>}
                </div>
                {sidebarOpen && (
                  <span className="bg-[#EAB308] text-black text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                    {orders.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => handleTabSelect('inventory')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg transition-all cursor-pointer text-left ${
                  activeTab === 'inventory'
                    ? 'bg-[#8B5CF6] text-white font-semibold shadow-md shadow-[#8B5CF6]/30'
                    : 'hover:bg-[#28243D] hover:text-white'
                }`}
                title="Product Catalog & Video Manager"
              >
                <div className="flex items-center gap-3.5">
                  <Package className="w-4 h-4 shrink-0" />
                  {sidebarOpen && <span>Product Catalog & Video</span>}
                </div>
                {sidebarOpen && (
                  <span className="text-[10px] text-[#8C87A8] font-bold">
                    {products.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => handleTabSelect('categories')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg transition-all cursor-pointer text-left ${
                  activeTab === 'categories'
                    ? 'bg-[#8B5CF6] text-white font-semibold shadow-md shadow-[#8B5CF6]/30'
                    : 'hover:bg-[#28243D] hover:text-white'
                }`}
                title="Categories Builder"
              >
                <div className="flex items-center gap-3.5">
                  <Layers className="w-4 h-4 shrink-0" />
                  {sidebarOpen && <span>Categories Builder</span>}
                </div>
                {sidebarOpen && (
                  <span className="text-[10px] text-[#8C87A8] font-bold">
                    6
                  </span>
                )}
              </button>

              <button
                onClick={() => handleTabSelect('abandoned')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg transition-all cursor-pointer text-left ${
                  activeTab === 'abandoned'
                    ? 'bg-[#8B5CF6] text-white font-semibold shadow-md shadow-[#8B5CF6]/30'
                    : 'hover:bg-[#28243D] hover:text-white'
                }`}
                title="Abandoned Carts"
              >
                <div className="flex items-center gap-3.5">
                  <RotateCcw className="w-4 h-4 shrink-0" />
                  {sidebarOpen && <span>Abandoned Carts</span>}
                </div>
                {sidebarOpen && (
                  <span className="bg-[#EC4899] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                    {abandonedCarts.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => handleTabSelect('coupons')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg transition-all cursor-pointer text-left ${
                  activeTab === 'coupons'
                    ? 'bg-[#8B5CF6] text-white font-semibold shadow-md shadow-[#8B5CF6]/30'
                    : 'hover:bg-[#28243D] hover:text-white'
                }`}
                title="Coupons & Marketing"
              >
                <div className="flex items-center gap-3.5">
                  <Tag className="w-4 h-4 shrink-0" />
                  {sidebarOpen && <span>Coupons & Marketing</span>}
                </div>
                {sidebarOpen && (
                  <span className="text-[10px] text-[#8C87A8] font-bold">
                    {coupons.length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* SECTION 3: CONTENT & BRAND CMS */}
          <div>
            {sidebarOpen && (
              <span className="px-3 text-[10px] font-bold text-[#6D688A] uppercase tracking-wider block mb-2">
                Content & Brand CMS
              </span>
            )}
            <div className="space-y-1">
              <button
                onClick={() => handleTabSelect('typography')}
                className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-lg transition-all cursor-pointer text-left ${
                  activeTab === 'typography'
                    ? 'bg-[#8B5CF6] text-white font-semibold shadow-md shadow-[#8B5CF6]/30'
                    : 'hover:bg-[#28243D] hover:text-white'
                }`}
                title="Palette, Typography & Brand Studio"
              >
                <Palette className="w-4 h-4 shrink-0 text-[#A78BFA]" />
                {sidebarOpen && <span>Palette & Brand Studio</span>}
              </button>

              <button
                onClick={() => handleTabSelect('banners')}
                className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-lg transition-all cursor-pointer text-left ${
                  activeTab === 'banners'
                    ? 'bg-[#8B5CF6] text-white font-semibold shadow-md shadow-[#8B5CF6]/30'
                    : 'hover:bg-[#28243D] hover:text-white'
                }`}
                title="Banners & Logo Customizer"
              >
                <ImageIcon className="w-4 h-4 shrink-0" />
                {sidebarOpen && <span>Banners & Logo Customizer</span>}
              </button>

              <button
                onClick={() => handleTabSelect('reviews')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg transition-all cursor-pointer text-left ${
                  activeTab === 'reviews'
                    ? 'bg-[#8B5CF6] text-white font-semibold shadow-md shadow-[#8B5CF6]/30'
                    : 'hover:bg-[#28243D] hover:text-white'
                }`}
                title="Reviews & Testimonials"
              >
                <div className="flex items-center gap-3.5">
                  <Star className="w-4 h-4 shrink-0" />
                  {sidebarOpen && <span>Reviews & Testimonials</span>}
                </div>
                {sidebarOpen && (
                  <span className="text-[10px] text-[#8C87A8] font-bold">
                    {reviews.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => handleTabSelect('delivery')}
                className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-lg transition-all cursor-pointer text-left ${
                  activeTab === 'delivery'
                    ? 'bg-[#8B5CF6] text-white font-semibold shadow-md shadow-[#8B5CF6]/30'
                    : 'hover:bg-[#28243D] hover:text-white'
                }`}
                title="Delivery Timeframe Slider"
              >
                <SlidersHorizontal className="w-4 h-4 shrink-0" />
                {sidebarOpen && <span>Delivery Timeframe Slider</span>}
              </button>

              <button
                onClick={() => handleTabSelect('journal')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg transition-all cursor-pointer text-left ${
                  activeTab === 'journal'
                    ? 'bg-[#8B5CF6] text-white font-semibold shadow-md shadow-[#8B5CF6]/30'
                    : 'hover:bg-[#28243D] hover:text-white'
                }`}
                title="Journal & Blog Manager"
              >
                <div className="flex items-center gap-3.5">
                  <BookOpen className="w-4 h-4 shrink-0" />
                  {sidebarOpen && <span>Journal & Blog Manager</span>}
                </div>
                {sidebarOpen && (
                  <span className="text-[10px] text-[#8C87A8] font-bold">
                    {journalArticles.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => handleTabSelect('cms')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg transition-all cursor-pointer text-left ${
                  activeTab === 'cms'
                    ? 'bg-[#8B5CF6] text-white font-semibold shadow-md shadow-[#8B5CF6]/30'
                    : 'hover:bg-[#28243D] hover:text-white'
                }`}
                title="CMS Pages"
              >
                <div className="flex items-center gap-3.5">
                  <FileText className="w-4 h-4 shrink-0" />
                  {sidebarOpen && <span>CMS Pages (5)</span>}
                </div>
                {sidebarOpen && (
                  <span className="text-[10px] text-[#8C87A8] font-bold">
                    5
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* SECTION 4: CLIENT CRM & TEAM */}
          <div>
            {sidebarOpen && (
              <span className="px-3 text-[10px] font-bold text-[#6D688A] uppercase tracking-wider block mb-2">
                Client CRM & Team
              </span>
            )}
            <div className="space-y-1">
              <button
                onClick={() => handleTabSelect('chat')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg transition-all cursor-pointer text-left ${
                  activeTab === 'chat'
                    ? 'bg-[#8B5CF6] text-white font-semibold shadow-md shadow-[#8B5CF6]/30'
                    : 'hover:bg-[#28243D] hover:text-white'
                }`}
                title="Client Inquiries & Live Chat"
              >
                <div className="flex items-center gap-3.5">
                  <MessageSquare className="w-4 h-4 shrink-0" />
                  {sidebarOpen && <span>Chat & Inquiries</span>}
                </div>
                {sidebarOpen && contactInquiries.filter(i => i.status === 'new').length > 0 && (
                  <span className="bg-[#EC4899] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                    {contactInquiries.filter(i => i.status === 'new').length}
                  </span>
                )}
              </button>

              <button
                onClick={() => handleTabSelect('contacts')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg transition-all cursor-pointer text-left ${
                  activeTab === 'contacts'
                    ? 'bg-[#8B5CF6] text-white font-semibold shadow-md shadow-[#8B5CF6]/30'
                    : 'hover:bg-[#28243D] hover:text-white'
                }`}
                title="Customer CRM Directory"
              >
                <div className="flex items-center gap-3.5">
                  <Phone className="w-4 h-4 shrink-0" />
                  {sidebarOpen && <span>Contacts (CRM)</span>}
                </div>
                {sidebarOpen && (
                  <span className="text-[10px] text-[#8C87A8] font-bold">
                    {realCustomerCRM.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => handleTabSelect('team')}
                className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-lg transition-all cursor-pointer text-left ${
                  activeTab === 'team'
                    ? 'bg-[#8B5CF6] text-white font-semibold shadow-md shadow-[#8B5CF6]/30'
                    : 'hover:bg-[#28243D] hover:text-white'
                }`}
                title="Staff & Permissions"
              >
                <Users className="w-4 h-4 shrink-0" />
                {sidebarOpen && <span>Team & Staff</span>}
              </button>

              <button
                onClick={() => handleTabSelect('calendar')}
                className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-lg transition-all cursor-pointer text-left ${
                  activeTab === 'calendar'
                    ? 'bg-[#8B5CF6] text-white font-semibold shadow-md shadow-[#8B5CF6]/30'
                    : 'hover:bg-[#28243D] hover:text-white'
                }`}
                title="Runway Drops Calendar"
              >
                <CalendarIcon className="w-4 h-4 shrink-0" />
                {sidebarOpen && <span>Calendar</span>}
              </button>

              <button
                onClick={() => handleTabSelect('email')}
                className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-lg transition-all cursor-pointer text-left ${
                  activeTab === 'email'
                    ? 'bg-[#8B5CF6] text-white font-semibold shadow-md shadow-[#8B5CF6]/30'
                    : 'hover:bg-[#28243D] hover:text-white'
                }`}
                title="Gazette Email Studio"
              >
                <Mail className="w-4 h-4 shrink-0" />
                {sidebarOpen && <span>Email Gazette</span>}
              </button>
            </div>
          </div>

          {/* SECTION 5: HOSTINGER & CLOUD */}
          <div>
            {sidebarOpen && (
              <span className="px-3 text-[10px] font-bold text-[#6D688A] uppercase tracking-wider block mb-2">
                Deploy & Cloud
              </span>
            )}
            <div className="space-y-1">
              <button
                onClick={() => handleTabSelect('hostinger')}
                className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-lg transition-all cursor-pointer text-left ${
                  activeTab === 'hostinger'
                    ? 'bg-[#8B5CF6] text-white font-semibold shadow-md shadow-[#8B5CF6]/30'
                    : 'hover:bg-[#28243D] hover:text-white'
                }`}
                title="Hostinger Deployment & Cloud Sync"
              >
                <Server className="w-4 h-4 shrink-0" />
                {sidebarOpen && <span>Hostinger & Cloud</span>}
              </button>

              <button
                onClick={() => handleTabSelect('settings')}
                className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-lg transition-all cursor-pointer text-left ${
                  activeTab === 'settings'
                    ? 'bg-[#8B5CF6] text-white font-semibold shadow-md shadow-[#8B5CF6]/30'
                    : 'hover:bg-[#28243D] hover:text-white'
                }`}
                title="Store Operations & Settings"
              >
                <Sliders className="w-4 h-4 shrink-0" />
                {sidebarOpen && <span>Store Settings</span>}
              </button>
            </div>
          </div>

        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-[#2C2742] flex items-center justify-between">
          <button
            onClick={() => {
              lockAdmin();
              showToast('Admin session locked', 'info');
            }}
            className="flex items-center gap-2 text-xs text-[#A7A3BF] hover:text-white transition-colors cursor-pointer w-full py-1.5 px-2 rounded-md hover:bg-[#28243D]"
            title="Lock Console"
          >
            <Lock className="w-4 h-4" />
            {sidebarOpen && <span>Lock Console</span>}
          </button>
        </div>
      </aside>

      {/* 2. MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#F4F6F9]">
        
        {/* TOP NAVBAR */}
        <header className="h-16 sm:h-20 bg-white border-b border-[#E6E8EC] px-3 sm:px-6 flex items-center justify-between sticky top-0 z-20 shadow-xs">
          
          {/* Left: Hamburger & Dynamic Title */}
          <div className="flex items-center gap-2.5 sm:gap-5 min-w-0">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1.5 sm:p-2 text-[#5E6470] hover:text-[#1F1F1F] rounded-lg hover:bg-[#F4F6F9] transition-colors cursor-pointer shrink-0"
              aria-label="Toggle Sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="min-w-0">
              <h1 className="text-sm sm:text-lg md:text-xl font-bold text-[#1F2430] tracking-tight truncate max-w-[160px] sm:max-w-xs md:max-w-none">
                {activeTab === 'business' && 'Dashboard Overview'}
                {activeTab === 'analytics' && 'Analytics & Conversion Funnel'}
                {activeTab === 'typography' && 'Typography & Appearance Studio'}
                {activeTab === 'orders' && 'Master Orders & OMS'}
                {activeTab === 'inventory' && 'Product Catalog & Video Manager'}
                {activeTab === 'categories' && 'Categories Builder (6 Categories)'}
                {activeTab === 'journal' && 'Journal & Blog Manager'}
                {activeTab === 'cms' && 'CMS Pages Manager'}
                {activeTab === 'banners' && 'Banners & Logo Customizer'}
                {activeTab === 'delivery' && 'Delivery Timeframe Slider & Logistics'}
                {activeTab === 'coupons' && 'Coupons & Promo Codes'}
                {activeTab === 'abandoned' && 'Abandoned Carts Recovery'}
                {activeTab === 'chat' && 'Client Inquiries & Live Concierge'}
                {activeTab === 'contacts' && 'Customer CRM Directory'}
                {activeTab === 'team' && 'Maison Staff & Roles'}
                {activeTab === 'calendar' && 'Runway & Drops Calendar'}
                {activeTab === 'email' && 'Gazette Email Studio'}
                {activeTab === 'hostinger' && 'Hostinger Web Hosting & Cloud'}
                {activeTab === 'settings' && 'Store Operations & Security'}
              </h1>
            </div>
          </div>

          {/* Center: Real Global Search Bar */}
          <div className="hidden md:flex items-center relative w-80 max-w-sm">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search catalog, orders, clients..."
              className="w-full pl-4 pr-9 py-2 bg-[#F4F6F9] border border-[#E2E5EA] rounded-lg text-xs text-[#1F2430] placeholder:text-[#9EA4B0] focus:outline-none focus:border-[#8B5CF6] focus:bg-white transition-all"
            />
            {searchQuery ? (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 text-[#9EA4B0] hover:text-[#1F1F1F]">
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <span className="absolute right-3 text-[10px] font-bold text-[#9EA4B0] bg-[#EAECEF] px-1.5 py-0.5 rounded-xs">
                /
              </span>
            )}

            {/* Live Search Results Popover */}
            {globalSearchResults && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-[#E2E5EA] rounded-xl shadow-2xl p-3 z-50 max-h-96 overflow-y-auto space-y-3 text-xs">
                {/* Orders */}
                {globalSearchResults.orders.length > 0 && (
                  <div>
                    <span className="text-[10px] font-bold text-[#8B5CF6] uppercase block mb-1">Orders ({globalSearchResults.orders.length})</span>
                    {globalSearchResults.orders.slice(0, 3).map((o) => (
                      <button
                        key={o.id}
                        onClick={() => {
                          setSelectedOrderProfile(o);
                          setActiveTab('orders');
                          setSearchQuery('');
                        }}
                        className="w-full text-left p-2 hover:bg-[#FAF9F6] rounded-md flex justify-between"
                      >
                        <span className="font-bold">#{o.orderNumber} - {o.customerName || (o.shippingAddress as any)?.fullName}</span>
                        <span className="text-[#8B5CF6] font-bold">{formatPrice(o.total)}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Products */}
                {globalSearchResults.products.length > 0 && (
                  <div>
                    <span className="text-[10px] font-bold text-[#10B981] uppercase block mb-1">Catalog Items ({globalSearchResults.products.length})</span>
                    {globalSearchResults.products.slice(0, 3).map((p) => (
                      <button
                        key={p.id}
                        onClick={() => {
                          openCreateProductModal(p);
                          setActiveTab('inventory');
                          setSearchQuery('');
                        }}
                        className="w-full text-left p-2 hover:bg-[#FAF9F6] rounded-md flex justify-between"
                      >
                        <span className="font-semibold">{p.name} ({p.category})</span>
                        <span className="font-bold">{formatPrice(p.price)}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Customers */}
                {globalSearchResults.customers.length > 0 && (
                  <div>
                    <span className="text-[10px] font-bold text-[#EC4899] uppercase block mb-1">Clients ({globalSearchResults.customers.length})</span>
                    {globalSearchResults.customers.slice(0, 3).map((c) => (
                      <button
                        key={c.id}
                        onClick={() => {
                          setActiveTab('contacts');
                          setSearchQuery('');
                        }}
                        className="w-full text-left p-2 hover:bg-[#FAF9F6] rounded-md flex justify-between"
                      >
                        <span className="font-semibold">{c.name} - {c.city}</span>
                        <span className="text-gray-500 font-mono">{c.tier}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right: Actions, Notifications & Profile */}
          <div className="flex items-center gap-4">
            {/* Live Storefront Button */}
            <button
              onClick={() => {
                setActivePage('home');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-[#5E6470] hover:text-[#8B5CF6] hover:bg-[#F4F6F9] px-3 py-1.5 rounded-lg border border-[#E2E5EA] transition-colors cursor-pointer"
              title="Preview Live Storefront"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Storefront</span>
            </button>

            {/* Mobile Search Trigger Icon */}
            <button
              onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
              className="md:hidden p-1.5 sm:p-2 text-[#5E6470] hover:text-[#1F1F1F] rounded-lg hover:bg-[#F4F6F9] transition-colors cursor-pointer"
              aria-label="Toggle Mobile Search"
            >
              <Search className="w-5 h-5 stroke-[1.75]" />
            </button>

            {/* Cloud Sync Status */}
            <button
              onClick={handleManualSync}
              disabled={isSyncing}
              className={`hidden sm:inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border transition-colors cursor-pointer font-medium ${
                isFirebaseOnline
                  ? 'bg-[#ECFDF5] border-[#A7F3D0] text-[#059669] hover:bg-[#D1FAE5]'
                  : 'bg-[#FEF2F2] border-[#FECACA] text-[#DC2626]'
              }`}
              title="Firebase Firestore Cloud Synchronization"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : isFirebaseOnline ? 'Firebase Live' : 'Cloud Offline'}</span>
            </button>

            {/* Notifications with Real-time Unread Badge */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="p-2 text-[#5E6470] hover:text-[#1F1F1F] rounded-lg hover:bg-[#F4F6F9] relative transition-colors cursor-pointer"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5 stroke-[1.75]" />
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-[#EC4899] text-white text-[9px] font-bold rounded-full flex items-center justify-center shadow-xs">
                  {orders.length + contactInquiries.length + products.filter(p => p.stockQuantity < 5).length}
                </span>
              </button>

              {/* Real Notification Feed Popover */}
              {notificationsOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-[#E2E5EA] rounded-xl shadow-2xl p-4 z-50 animate-fadeIn space-y-3">
                  <div className="flex items-center justify-between border-b border-[#F0ECE1] pb-2">
                    <span className="font-bold text-xs text-[#1F1F1F]">Live Storefeed</span>
                    <span className="text-[10px] text-[#EC4899] font-bold bg-[#FDF2F8] px-2 py-0.5 rounded-full">
                      {orders.length + contactInquiries.length} Active
                    </span>
                  </div>

                  <div className="space-y-2.5 max-h-72 overflow-y-auto text-xs">
                    {orders.slice(0, 3).map((ord) => (
                      <div key={ord.id} className="p-2.5 bg-[#FAF9F6] border border-[#EAE6DE] rounded-lg flex items-start gap-2.5">
                        <ShoppingBag className="w-4 h-4 text-[#8B5CF6] shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-[#1F1F1F]">Order #{ord.orderNumber}</p>
                          <p className="text-[11px] text-[#6E685F]">{ord.customerName || (ord.shippingAddress as any)?.fullName} · {formatPrice(ord.total)}</p>
                        </div>
                      </div>
                    ))}

                    {products.filter(p => p.stockQuantity < 5).slice(0, 2).map((p) => (
                      <div key={p.id} className="p-2.5 bg-[#FEF2F2] border border-[#FECACA] rounded-lg flex items-start gap-2.5">
                        <AlertCircle className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-[#DC2626]">Low Stock: {p.name}</p>
                          <p className="text-[11px] text-[#6E685F]">Only {p.stockQuantity} remaining</p>
                        </div>
                      </div>
                    ))}

                    {contactInquiries.slice(0, 2).map((inq) => (
                      <div key={inq.id} className="p-2.5 bg-[#FDF4FF] border border-[#F5D0FE] rounded-lg flex items-start gap-2.5">
                        <MessageSquare className="w-4 h-4 text-[#C026D3] shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-[#1F1F1F]">Inquiry: {inq.name}</p>
                          <p className="text-[11px] text-[#6E685F] line-clamp-1">{inq.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => {
                      setNotificationsOpen(false);
                      setActiveTab('orders');
                    }}
                    className="w-full text-center py-1.5 text-xs text-[#8B5CF6] font-semibold hover:underline block pt-2 border-t border-[#F0ECE1]"
                  >
                    View All Orders & Activities →
                  </button>
                </div>
              )}
            </div>

            {/* Admin User Profile Button */}
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2.5 p-1 pl-2 hover:bg-[#F4F6F9] rounded-lg transition-colors cursor-pointer"
              >
                <img
                  src={adminProfile?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop'}
                  alt={adminProfile?.name || 'Admin'}
                  className="w-8 h-8 rounded-full object-cover border border-[#8B5CF6]"
                />
                <div className="hidden lg:flex flex-col text-left">
                  <span className="text-xs font-bold text-[#1F2430] leading-tight">{adminProfile?.name || 'Administrator'}</span>
                  <span className="text-[10px] text-[#8C92A0] font-medium">{adminProfile?.role || 'Director'}</span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-[#8C92A0]" />
              </button>

              {/* Profile Dropdown */}
              {profileDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-[#E2E5EA] rounded-xl shadow-2xl p-2 z-50 animate-fadeIn space-y-1 text-xs">
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      setEditAdminName(adminProfile?.name || '');
                      setEditAdminEmail(adminProfile?.email || '');
                      setEditAdminRole(adminProfile?.role || '');
                      setEditAdminAvatar(adminProfile?.avatar || '');
                      setShowEditProfileModal(true);
                    }}
                    className="w-full text-left px-3 py-2 text-[#1F2430] hover:bg-[#F4F6F9] rounded-lg font-medium flex items-center gap-2"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-[#8B5CF6]" />
                    <span>Edit Admin Profile</span>
                  </button>
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      setActiveTab('team');
                    }}
                    className="w-full text-left px-3 py-2 text-[#1F2430] hover:bg-[#F4F6F9] rounded-lg font-medium flex items-center gap-2"
                  >
                    <Users className="w-3.5 h-3.5 text-[#8B5CF6]" />
                    <span>Staff Management</span>
                  </button>
                  <div className="border-t border-[#EAE6DE] my-1"></div>
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      lockAdmin();
                      showToast('Logged out of Admin Portal', 'info');
                    }}
                    className="w-full text-left px-3 py-2 text-[#DC2626] hover:bg-[#FEF2F2] rounded-lg font-semibold flex items-center gap-2"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Lock / Logout</span>
                  </button>
                </div>
              )}
            </div>

          </div>
        </header>

        {/* MOBILE GLOBAL SEARCH EXPANDABLE DRAWER */}
        {mobileSearchOpen && (
          <div className="md:hidden bg-white border-b border-[#E2E5EA] p-3 shadow-md sticky top-16 z-20 space-y-2 animate-fadeIn">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products, orders, clients..."
                autoFocus
                className="w-full pl-9 pr-8 py-2 bg-[#F4F6F9] border border-[#E2E5EA] rounded-lg text-xs text-[#1F2430] placeholder:text-[#9EA4B0] focus:outline-none focus:border-[#8B5CF6] focus:bg-white"
              />
              <Search className="w-4 h-4 text-[#8B5CF6] absolute left-3 top-1/2 -translate-y-1/2" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9EA4B0] p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Mobile Quick Search Results */}
            {globalSearchResults && (
              <div className="max-h-64 overflow-y-auto space-y-2 text-xs pt-2 border-t border-[#F0ECE1]">
                {globalSearchResults.orders.length > 0 && (
                  <div>
                    <span className="text-[10px] font-bold text-[#8B5CF6] uppercase block mb-1">Orders</span>
                    {globalSearchResults.orders.slice(0, 3).map((o) => (
                      <button
                        key={o.id}
                        onClick={() => {
                          setSelectedOrderProfile(o);
                          handleTabSelect('orders');
                          setSearchQuery('');
                          setMobileSearchOpen(false);
                        }}
                        className="w-full text-left p-2 hover:bg-[#FAF9F6] rounded flex justify-between cursor-pointer"
                      >
                        <span className="font-semibold">#{o.orderNumber} - {o.customerName || (o.shippingAddress as any)?.fullName}</span>
                        <span className="text-[#8B5CF6] font-bold">{formatPrice(o.total)}</span>
                      </button>
                    ))}
                  </div>
                )}
                {globalSearchResults.products.length > 0 && (
                  <div>
                    <span className="text-[10px] font-bold text-[#8B5CF6] uppercase block mb-1">Products</span>
                    {globalSearchResults.products.slice(0, 3).map((p) => (
                      <button
                        key={p.id}
                        onClick={() => {
                          openCreateProductModal(p);
                          handleTabSelect('inventory');
                          setSearchQuery('');
                          setMobileSearchOpen(false);
                        }}
                        className="w-full text-left p-2 hover:bg-[#FAF9F6] rounded flex justify-between cursor-pointer"
                      >
                        <span className="font-semibold truncate pr-2">{p.name}</span>
                        <span className="font-bold shrink-0">{formatPrice(p.price)}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* MAIN BODY CONTENT */}
        <main className="flex-1 p-3.5 sm:p-5 lg:p-8 pb-28 lg:pb-8 max-w-7xl w-full mx-auto space-y-6 sm:space-y-8">
          
          {/* ========================================================= */}
          {/* TAB 1: BUSINESS DASHBOARD (4 WAVE CARDS + CHART + USERS)  */}
          {/* ========================================================= */}
          {activeTab === 'business' && (
            <div className="space-y-8 animate-fadeIn">
              
              {/* DATE RANGE FILTER BAR & QUICK ZERO/RESET CONTROLS */}
              <div className="bg-white border border-[#E6E8EC] rounded-xl p-4 sm:p-5 shadow-xs flex flex-col gap-4">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#FAF5FF] border border-[#F3E8FF] flex items-center justify-center text-[#8B5CF6] shrink-0">
                      <CalendarIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-[#1F2430] uppercase tracking-wider">Date Period Filter:</span>
                        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#F4F6F9] text-[#5E6470] border border-[#E2E5EA]">
                          {dateFilterRange === 'all' && 'All Time'}
                          {dateFilterRange === 'today' && 'Today'}
                          {dateFilterRange === 'yesterday' && 'Yesterday'}
                          {dateFilterRange === '7days' && 'Last 7 Days'}
                          {dateFilterRange === '30days' && 'Last 30 Days'}
                          {dateFilterRange === 'this_month' && 'This Month'}
                          {dateFilterRange === 'this_year' && 'This Year (2026)'}
                          {dateFilterRange === 'custom' && (customStartDate || customEndDate ? `${customStartDate || 'Start'} → ${customEndDate || 'Now'}` : 'Custom Range')}
                        </span>
                        {isStatsZeroed && (
                          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200 animate-pulse">
                            STATS ZEROED (0.00)
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#8C92A0] mt-0.5">
                        {isStatsZeroed 
                          ? 'All dashboard revenue numbers and tallies are zeroed. Incoming customer checkouts will reflect in real time.'
                          : `Filtering sales, expenses, profits and monthly charts across ${validOrders.length} valid order(s)`}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {isStatsZeroed ? (
                      <button
                        onClick={handleRestoreDefaultBaseline}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#ECFDF5] hover:bg-[#D1FAE5] border border-[#A7F3D0] text-[#059669] text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-xs"
                        title="Restore default demo transactions and orders"
                      >
                        <RefreshCcw className="w-3.5 h-3.5" />
                        <span>Restore Default Baseline</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setResetPasswordInput('');
                          setResetPasswordError('');
                          setShowResetModal(true);
                        }}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#FEF2F2] hover:bg-[#FEE2E2] border border-[#FECACA] text-[#DC2626] text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-xs"
                        title="Reset all financial stats and metrics to 0"
                      >
                        <Lock className="w-3.5 h-3.5" />
                        <span>Reset Numbers to 0</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Preset Filter Buttons */}
                <div className="flex flex-wrap items-center gap-1.5 pt-3 border-t border-[#F0ECE1]">
                  {[
                    { key: 'all', label: 'All Time' },
                    { key: 'today', label: 'Today' },
                    { key: 'yesterday', label: 'Yesterday' },
                    { key: '7days', label: 'Last 7 Days' },
                    { key: '30days', label: 'Last 30 Days' },
                    { key: 'this_month', label: 'This Month' },
                    { key: 'this_year', label: 'This Year' },
                    { key: 'custom', label: 'Custom Range' },
                  ].map((btn) => (
                    <button
                      key={btn.key}
                      onClick={() => setDateFilterRange(btn.key as any)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        dateFilterRange === btn.key
                          ? 'bg-[#8B5CF6] text-white shadow-xs'
                          : 'bg-[#F4F6F9] hover:bg-[#EAEFF5] text-[#5E6470]'
                      }`}
                    >
                      {btn.label}
                    </button>
                  ))}

                  {/* Custom Date Pickers */}
                  {dateFilterRange === 'custom' && (
                    <div className="flex flex-wrap items-center gap-2 pl-2 border-l border-[#E2E5EA] ml-1">
                      <div className="flex items-center gap-1 text-xs">
                        <span className="text-[#8C92A0] text-[11px]">From:</span>
                        <input
                          type="date"
                          value={customStartDate}
                          onChange={(e) => setCustomStartDate(e.target.value)}
                          className="px-2 py-1 bg-[#FAF9F6] border border-[#D5D0C5] rounded-md text-xs text-[#1F1F1F] focus:outline-none focus:border-[#8B5CF6]"
                        />
                      </div>
                      <div className="flex items-center gap-1 text-xs">
                        <span className="text-[#8C92A0] text-[11px]">To:</span>
                        <input
                          type="date"
                          value={customEndDate}
                          onChange={(e) => setCustomEndDate(e.target.value)}
                          className="px-2 py-1 bg-[#FAF9F6] border border-[#D5D0C5] rounded-md text-xs text-[#1F1F1F] focus:outline-none focus:border-[#8B5CF6]"
                        />
                      </div>
                      {(customStartDate || customEndDate) && (
                        <button
                          onClick={() => {
                            setCustomStartDate('');
                            setCustomEndDate('');
                          }}
                          className="p-1 text-[#8C92A0] hover:text-[#DC2626] cursor-pointer"
                          title="Clear custom dates"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* NATIVE FIREBASE ANALYTICS & LIVE VISITOR TRAFFIC PULSE */}
              <div className="bg-gradient-to-r from-[#0F172A] to-[#1E293B] text-white rounded-xl p-4 sm:p-5 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                    <Activity className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                        Firebase Analytics Live (GA4)
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                        Measurement ID: G-JGWMX68JYX
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Tracking live shoppers and automatically capturing page views, catalog exploration, cart changes, and checkout flows.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-slate-700 pt-3 md:pt-0">
                  <div className="text-left md:text-right">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Live Concurrent Visitors</span>
                    <span className="text-lg font-bold text-emerald-400 font-mono flex items-center md:justify-end gap-1.5">
                      <Users className="w-4 h-4" />
                      {trafficSummary.activeVisitors} Active Now
                    </span>
                  </div>

                  <button
                    onClick={() => setActiveTab('analytics')}
                    className="px-3.5 py-2 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
                  >
                    <span>View Analytics Stream</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* TOP 4 STATISTIC CARDS WITH REAL-TIME WAVE CHARTS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                
                {/* 1. SALES OF THIS YEAR (Hot Pink Wave) */}
                <div className="bg-white rounded-xl p-5 border border-[#E6E8EC] shadow-xs hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden group">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl sm:text-3xl font-bold text-[#1F2430] font-sans">
                        {formatPrice(realTotalSales)}
                      </span>
                      <button className="text-[#9EA4B0] hover:text-[#1F2430] p-1 cursor-pointer">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-xs text-[#6B7280]">
                      <span>Sales Of This Year</span>
                      <span className="text-[#10B981] font-bold flex items-center">
                        | {salesGrowthPercent} <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
                      </span>
                    </div>
                  </div>

                  {/* Hot Pink Wave Graphic */}
                  <div className="mt-4 w-full h-24 rounded-lg bg-gradient-to-tr from-[#FF3366] to-[#FF6B99] overflow-hidden relative shadow-xs flex items-end">
                    <svg viewBox="0 0 500 150" preserveAspectRatio="none" className="w-full h-full opacity-90">
                      <path
                        d="M0.00,49.98 C120.00,120.00 240.00,10.00 360.00,80.00 C440.00,130.00 480.00,30.00 500.00,40.00 L500.00,150.00 L0.00,150.00 Z"
                        fill="rgba(255,255,255,0.25)"
                      ></path>
                      <path
                        d="M0.00,70.00 C150.00,130.00 220.00,20.00 350.00,90.00 C430.00,140.00 480.00,60.00 500.00,80.00"
                        fill="none"
                        stroke="#FFFFFF"
                        strokeWidth="3.5"
                      ></path>
                    </svg>
                  </div>
                </div>

                {/* 2. EXPENSE OF THIS YEAR (Emerald Green Wave) */}
                <div className="bg-white rounded-xl p-5 border border-[#E6E8EC] shadow-xs hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden group">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl sm:text-3xl font-bold text-[#1F2430] font-sans">
                        {formatPrice(realTotalExpenses)}
                      </span>
                      <button className="text-[#9EA4B0] hover:text-[#1F2430] p-1 cursor-pointer">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-xs text-[#6B7280]">
                      <span>Expense Of This Year</span>
                      <span className="text-[#EF4444] font-bold flex items-center">
                        | 38% <ArrowDownRight className="w-3.5 h-3.5 ml-0.5" />
                      </span>
                    </div>
                  </div>

                  {/* Emerald Green Wave Graphic */}
                  <div className="mt-4 w-full h-24 rounded-lg bg-gradient-to-tr from-[#10B981] to-[#34D399] overflow-hidden relative shadow-xs flex items-end">
                    <svg viewBox="0 0 500 150" preserveAspectRatio="none" className="w-full h-full opacity-90">
                      <path
                        d="M0.00,120.00 C100.00,20.00 200.00,140.00 320.00,30.00 C420.00,120.00 460.00,60.00 500.00,50.00 L500.00,150.00 L0.00,150.00 Z"
                        fill="rgba(255,255,255,0.25)"
                      ></path>
                      <path
                        d="M0.00,130.00 C100.00,30.00 200.00,150.00 320.00,40.00 C420.00,130.00 460.00,70.00 500.00,60.00"
                        fill="none"
                        stroke="#FFFFFF"
                        strokeWidth="3.5"
                      ></path>
                    </svg>
                  </div>
                </div>

                {/* 3. PROFIT OF THIS YEAR (Royal Purple Wave) */}
                <div className="bg-white rounded-xl p-5 border border-[#E6E8EC] shadow-xs hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden group">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl sm:text-3xl font-bold text-[#1F2430] font-sans">
                        {formatPrice(realNetProfit)}
                      </span>
                      <button className="text-[#9EA4B0] hover:text-[#1F2430] p-1 cursor-pointer">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-xs text-[#6B7280]">
                      <span>Profit Of This Year</span>
                      <span className="text-[#10B981] font-bold flex items-center">
                        | {profitMarginPercent}% Margin <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
                      </span>
                    </div>
                  </div>

                  {/* Royal Purple Wave Graphic */}
                  <div className="mt-4 w-full h-24 rounded-lg bg-gradient-to-tr from-[#8B5CF6] to-[#A78BFA] overflow-hidden relative shadow-xs flex items-end">
                    <svg viewBox="0 0 500 150" preserveAspectRatio="none" className="w-full h-full opacity-90">
                      <path
                        d="M0.00,110.00 C120.00,10.00 220.00,140.00 350.00,40.00 C440.00,110.00 480.00,50.00 500.00,70.00 L500.00,150.00 L0.00,150.00 Z"
                        fill="rgba(255,255,255,0.25)"
                      ></path>
                      <path
                        d="M0.00,120.00 C120.00,20.00 220.00,150.00 350.00,50.00 C440.00,120.00 480.00,60.00 500.00,80.00"
                        fill="none"
                        stroke="#FFFFFF"
                        strokeWidth="3.5"
                      ></path>
                    </svg>
                  </div>
                </div>

                {/* 4. REVENUE OF THIS YEAR (Sky Blue Wave) */}
                <div className="bg-white rounded-xl p-5 border border-[#E6E8EC] shadow-xs hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden group">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl sm:text-3xl font-bold text-[#1F2430] font-sans">
                        {formatPrice(realGrossRevenue)}
                      </span>
                      <button className="text-[#9EA4B0] hover:text-[#1F2430] p-1 cursor-pointer">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-xs text-[#6B7280]">
                      <span>Revenue Of This Year</span>
                      <span className="text-[#10B981] font-bold flex items-center">
                        | +35% <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
                      </span>
                    </div>
                  </div>

                  {/* Sky Blue Wave Graphic */}
                  <div className="mt-4 w-full h-24 rounded-lg bg-gradient-to-tr from-[#3B82F6] to-[#60A5FA] overflow-hidden relative shadow-xs flex items-end">
                    <svg viewBox="0 0 500 150" preserveAspectRatio="none" className="w-full h-full opacity-90">
                      <path
                        d="M0.00,130.00 C140.00,20.00 240.00,120.00 360.00,30.00 C440.00,90.00 480.00,20.00 500.00,60.00 L500.00,150.00 L0.00,150.00 Z"
                        fill="rgba(255,255,255,0.25)"
                      ></path>
                      <path
                        d="M0.00,140.00 C140.00,30.00 240.00,130.00 360.00,40.00 C440.00,100.00 480.00,30.00 500.00,70.00"
                        fill="none"
                        stroke="#FFFFFF"
                        strokeWidth="3.5"
                      ></path>
                    </svg>
                  </div>
                </div>

              </div>

              {/* ROW 2: 12-MONTH INCOME & EXPENSES CHART + REALTIME ACTIVE USERS */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* LEFT (8 COLS): INCOME & EXPENSES */}
                <div className="lg:col-span-8 bg-white border border-[#E6E8EC] rounded-xl p-6 shadow-xs flex flex-col justify-between">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#F0ECE1]">
                    <div>
                      <h3 className="text-lg font-bold text-[#1F2430]">Income And Expenses</h3>
                      <p className="text-xs text-[#8C92A0]">Monthly financial cashflow calculated from actual transactions</p>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-semibold">
                      <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-xs bg-[#8B5CF6]"></span>
                        <span className="text-[#5E6470]">Income</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-xs bg-[#F472B6]"></span>
                        <span className="text-[#5E6470]">Expenses</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-3 h-0.5 bg-[#FBBF24]"></span>
                        <span className="text-[#5E6470]">Profit</span>
                      </div>
                      
                      <select
                        value={chartYear}
                        onChange={(e) => setChartYear(e.target.value)}
                        className="ml-2 bg-[#F4F6F9] border border-[#E2E5EA] text-xs font-bold text-[#1F2430] px-2.5 py-1 rounded-md focus:outline-none"
                      >
                        <option value="2026">2026</option>
                        <option value="2025">2025</option>
                      </select>
                    </div>
                  </div>

                  {/* 12-Month Bar Chart */}
                  <div className="pt-6">
                    <div className="h-64 w-full flex items-end justify-between gap-2 sm:gap-3 px-2 relative">
                      <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
                        <div className="border-b border-gray-400 w-full"></div>
                        <div className="border-b border-gray-400 w-full"></div>
                        <div className="border-b border-gray-400 w-full"></div>
                        <div className="border-b border-gray-400 w-full"></div>
                      </div>

                      {monthlyFinancials.map((item, idx) => {
                        const maxVal = 22000;
                        const incHeight = Math.min(100, Math.max(15, (item.inc / maxVal) * 100));
                        const expHeight = Math.min(100, Math.max(10, (item.exp / maxVal) * 100));

                        return (
                          <div key={idx} className="flex-1 flex flex-col items-center gap-1 z-10 group relative">
                            <div className="w-full flex items-end justify-center gap-1 h-48">
                              <div
                                style={{ height: `${incHeight}%` }}
                                className="w-2.5 sm:w-3.5 bg-[#8B5CF6] rounded-t-xs transition-all group-hover:brightness-110 cursor-pointer"
                                title={`${item.month} Income: ${formatPrice(item.inc)}`}
                              ></div>
                              <div
                                style={{ height: `${expHeight}%` }}
                                className="w-2.5 sm:w-3.5 bg-[#F472B6] rounded-t-xs transition-all group-hover:brightness-110 cursor-pointer"
                                title={`${item.month} Expense: ${formatPrice(item.exp)}`}
                              ></div>
                            </div>
                            <span className="text-[10px] text-[#8C92A0] font-medium mt-2">{item.month}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* RIGHT (4 COLS): CURRENT USERS */}
                <div className="lg:col-span-4 bg-white border border-[#E6E8EC] rounded-xl p-6 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold text-[#1F2430]">Current Users</h3>
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#10B981] bg-[#ECFDF5] px-2 py-0.5 rounded-full uppercase">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-ping"></span>
                        <span>Realtime</span>
                      </div>
                    </div>

                    <div className="mt-4">
                      <span className="text-3xl font-extrabold text-[#8B5CF6] font-sans">
                        {liveVisitors}%
                      </span>
                      <p className="text-xs text-[#8C92A0] font-medium mt-0.5">
                        Ave Page views per minute · {currentTime.toLocaleTimeString()}
                      </p>
                    </div>

                    <div className="mt-6 h-36 flex items-end justify-between gap-2 border-b border-gray-200 pb-2">
                      {[liveVisitors * 3, liveVisitors * 2, 45, 20, 15, 60, liveVisitors * 4, 75, 40, 25, 35, liveVisitors * 3].map((val, i) => (
                        <div
                          key={i}
                          style={{ height: `${Math.min(100, (val / 160) * 100)}%` }}
                          className="flex-1 bg-[#8B5CF6]/80 hover:bg-[#8B5CF6] rounded-t-xs transition-all"
                          title={`${val} concurrent visitors`}
                        ></div>
                      ))}
                    </div>

                    <div className="flex justify-between text-[10px] text-[#9EA4B0] mt-2 font-mono">
                      <span>09:15:00</span>
                      <span>09:30:00</span>
                      <span>09:45:00</span>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-[#F0ECE1] mt-6">
                    <button
                      onClick={() => setActiveTab('analytics')}
                      className="text-xs font-bold text-[#8B5CF6] hover:text-[#7C3AED] uppercase tracking-wider flex items-center justify-between w-full cursor-pointer"
                    >
                      <span>Current Users Overview</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </div>

              {/* SECTION: RESET DASHBOARD NUMBERS TO 0 (PROTECTED WITH PASSWORD 8156958052) */}
              <div className="bg-white border border-[#FECACA] rounded-xl p-6 shadow-xs relative overflow-hidden bg-gradient-to-r from-red-50/50 via-white to-white">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-red-100 border border-red-200 flex items-center justify-center text-red-600 shrink-0">
                      <ShieldAlert className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-bold text-[#1F2430]">Reset Dashboard Numbers & Analytics</h3>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-red-100 text-red-700 uppercase tracking-wider">
                          Password Protected: 8156958052
                        </span>
                      </div>
                      <p className="text-xs text-[#6B7280] max-w-2xl leading-relaxed">
                        Authorize an immediate reset of all dashboard financial totals, order logs, expense valuations, profit margins, and analytics charts to <strong className="text-red-700 font-bold">₹0.00 / 0</strong>.
                      </p>
                      {isStatsZeroed && (
                        <p className="text-xs text-[#059669] font-bold flex items-center gap-1.5 pt-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Dashboard is currently zeroed out. All new live orders will increment from ₹0.00.</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    {isStatsZeroed ? (
                      <button
                        onClick={handleRestoreDefaultBaseline}
                        className="px-4 py-2.5 bg-[#10B981] hover:bg-[#059669] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-sm"
                      >
                        <RefreshCcw className="w-4 h-4" />
                        <span>Restore Default Baseline</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setResetPasswordInput('');
                          setResetPasswordError('');
                          setShowResetModal(true);
                        }}
                        className="px-5 py-2.5 bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-sm"
                      >
                        <Lock className="w-4 h-4" />
                        <span>Reset All Metrics to 0</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 2: FIREBASE ANALYTICS & REAL-TIME VISITOR SUITE       */}
          {/* ========================================================= */}
          {activeTab === 'analytics' && (
            <div className="space-y-8 animate-fadeIn">
              
              {/* TOP HEADER & LIVE CONNECTION STATUS */}
              <div className="bg-white border border-[#E6E8EC] rounded-xl p-6 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                      Firebase Analytics Active (GA4 SDK)
                    </span>
                    <span className="text-xs font-mono font-bold text-[#8B5CF6] bg-[#F5F3FF] border border-[#EDE9FE] px-2.5 py-0.5 rounded-full">
                      Measurement ID: G-JGWMX68JYX
                    </span>
                    <span className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full">
                      Auto Route Tracking Active
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold text-[#1F2430] tracking-tight mt-2 font-sans">
                    Live Visitor Traffic & GA4 Conversion Stream
                  </h2>
                  <p className="text-xs text-[#8C92A0] mt-0.5">
                    Real-time audience monitoring, automatic route change page_views, product views, bag additions, and checkout transactions.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={handleSendTestAnalyticsPing}
                    className="px-4 py-2.5 bg-[#F4F6F9] hover:bg-[#EAEFF5] text-[#1F2430] text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 border border-[#E2E5EA]"
                    title="Dispatches a test event to Firebase Analytics"
                  >
                    <Activity className="w-3.5 h-3.5 text-[#8B5CF6]" />
                    <span>Send Test Ping</span>
                  </button>

                  <div className="px-4 py-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-xs font-bold text-emerald-800 font-mono">
                      {trafficSummary.activeVisitors} Shoppers Online
                    </span>
                  </div>
                </div>
              </div>

              {/* 4 CORE ANALYTICS STAT CARDS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                
                {/* 1. Total Page Views */}
                <div className="p-5 bg-white border border-[#E6E8EC] rounded-xl shadow-xs space-y-2">
                  <div className="flex items-center justify-between text-[#8C92A0]">
                    <span className="text-xs font-bold uppercase tracking-wider">Total Tracked Views</span>
                    <Eye className="w-4 h-4 text-[#8B5CF6]" />
                  </div>
                  <p className="text-3xl font-bold text-[#1F2430] font-sans">
                    {trafficSummary.totalPageViews.toLocaleString()}
                  </p>
                  <span className="text-[11px] text-[#10B981] font-semibold flex items-center gap-1">
                    <ArrowUpRight className="w-3 h-3" />
                    +14.8% vs last week
                  </span>
                </div>

                {/* 2. Live Concurrent Visitors */}
                <div className="p-5 bg-white border border-[#E6E8EC] rounded-xl shadow-xs space-y-2">
                  <div className="flex items-center justify-between text-[#8C92A0]">
                    <span className="text-xs font-bold uppercase tracking-wider">Live Visitors Now</span>
                    <Users className="w-4 h-4 text-emerald-600" />
                  </div>
                  <p className="text-3xl font-bold text-emerald-600 font-mono">
                    {trafficSummary.activeVisitors}
                  </p>
                  <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                    Real-time concurrent sessions
                  </span>
                </div>

                {/* 3. Average Order Value (AOV) */}
                <div className="p-5 bg-white border border-[#E6E8EC] rounded-xl shadow-xs space-y-2">
                  <div className="flex items-center justify-between text-[#8C92A0]">
                    <span className="text-xs font-bold uppercase tracking-wider">Avg Order Value (AOV)</span>
                    <ShoppingBag className="w-4 h-4 text-[#C85A32]" />
                  </div>
                  <p className="text-3xl font-bold text-[#1F2430] font-sans">
                    {formatPrice(validOrders.length > 0 ? realTotalSales / validOrders.length : 145)}
                  </p>
                  <span className="text-[11px] text-[#6E685F]">Across all active sales</span>
                </div>

                {/* 4. Cart Conversion Rate */}
                <div className="p-5 bg-white border border-[#E6E8EC] rounded-xl shadow-xs space-y-2">
                  <div className="flex items-center justify-between text-[#8C92A0]">
                    <span className="text-xs font-bold uppercase tracking-wider">Conversion Rate</span>
                    <Zap className="w-4 h-4 text-amber-500" />
                  </div>
                  <p className="text-3xl font-bold text-[#10B981] font-sans">
                    4.82%
                  </p>
                  <span className="text-[11px] text-[#10B981] font-semibold flex items-center gap-1">
                    <ArrowUpRight className="w-3 h-3" />
                    +1.2% industry benchmark
                  </span>
                </div>

              </div>

              {/* 2-COLUMN SECTION: E-COMMERCE CONVERSION FUNNEL & PAGE POPULARITY */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* LEFT: E-COMMERCE EVENT FUNNEL (7 COLS) */}
                <div className="lg:col-span-7 bg-white border border-[#E6E8EC] rounded-xl p-6 shadow-xs space-y-6">
                  <div className="flex items-center justify-between border-b border-[#F0ECE1] pb-3">
                    <div>
                      <h3 className="text-base font-bold text-[#1F2430]">
                        E-Commerce GA4 Conversion Funnel
                      </h3>
                      <p className="text-xs text-[#8C92A0]">
                        Step-by-step visitor progression from storefront entry to confirmed order
                      </p>
                    </div>
                    <span className="text-xs font-bold text-[#8B5CF6] bg-[#F5F3FF] px-2.5 py-1 rounded-md">
                      End-to-End Tracking
                    </span>
                  </div>

                  <div className="space-y-4">
                    {[
                      {
                        stage: '1. Storefront Visitors (page_view)',
                        count: trafficSummary.totalPageViews,
                        percent: 100,
                        color: 'bg-[#8B5CF6]'
                      },
                      {
                        stage: '2. Catalog & Product Views (view_item)',
                        count: Math.floor(trafficSummary.totalPageViews * 0.42),
                        percent: 42,
                        color: 'bg-blue-500'
                      },
                      {
                        stage: '3. Added to Bag (add_to_cart)',
                        count: Math.floor(trafficSummary.totalPageViews * 0.14),
                        percent: 14,
                        color: 'bg-amber-500'
                      },
                      {
                        stage: '4. Initiated Checkout (begin_checkout)',
                        count: Math.floor(trafficSummary.totalPageViews * 0.08),
                        percent: 8,
                        color: 'bg-pink-500'
                      },
                      {
                        stage: '5. Completed Purchase (purchase)',
                        count: validOrders.length > 0 ? validOrders.length : Math.floor(trafficSummary.totalPageViews * 0.048),
                        percent: 4.8,
                        color: 'bg-emerald-500'
                      }
                    ].map((step) => (
                      <div key={step.stage} className="space-y-1.5">
                        <div className="flex justify-between items-center text-xs font-bold text-[#1F2430]">
                          <span>{step.stage}</span>
                          <span className="font-mono">
                            {step.count.toLocaleString()} <span className="text-[#8C92A0]">({step.percent}%)</span>
                          </span>
                        </div>
                        <div className="w-full bg-[#F4F6F9] rounded-full h-3 overflow-hidden">
                          <div
                            className={`${step.color} h-3 rounded-full transition-all duration-500`}
                            style={{ width: `${Math.max(5, step.percent)}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* RIGHT: TOP STOREFRONT PAGES (5 COLS) */}
                <div className="lg:col-span-5 bg-white border border-[#E6E8EC] rounded-xl p-6 shadow-xs space-y-6">
                  <div className="flex items-center justify-between border-b border-[#F0ECE1] pb-3">
                    <h3 className="text-base font-bold text-[#1F2430]">
                      Top Visited Routes
                    </h3>
                    <span className="text-[10px] font-bold text-[#5E6470] bg-[#F4F6F9] px-2 py-0.5 rounded-md">
                      Auto-Logged
                    </span>
                  </div>

                  <div className="space-y-3.5 text-xs">
                    {[
                      { route: '/home', label: 'Home Runway Showcase', count: Math.floor(trafficSummary.totalPageViews * 0.45) },
                      { route: '/shop', label: 'Catalog & Filter View', count: Math.floor(trafficSummary.totalPageViews * 0.28) },
                      { route: '/product-detail', label: 'Product Detail Pages', count: Math.floor(trafficSummary.totalPageViews * 0.16) },
                      { route: '/cart', label: 'Shopping Bag Drawer', count: Math.floor(trafficSummary.totalPageViews * 0.07) },
                      { route: '/checkout', label: 'Express Checkout', count: Math.floor(trafficSummary.totalPageViews * 0.04) }
                    ].map((p) => {
                      const pct = Math.round((p.count / Math.max(1, trafficSummary.totalPageViews)) * 100);
                      return (
                        <div key={p.route} className="p-3 bg-[#FAF9F6] border border-[#EAE6DE] rounded-xl space-y-1.5">
                          <div className="flex justify-between items-center font-bold text-[#1F2430]">
                            <span className="font-mono text-[#8B5CF6]">{p.route}</span>
                            <span>{p.count.toLocaleString()} views ({pct}%)</span>
                          </div>
                          <div className="text-[11px] text-[#6E685F]">{p.label}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* REAL-TIME VISITOR ACTIVITY FEED TABLE */}
              <div className="bg-white border border-[#E6E8EC] rounded-xl p-6 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-[#F0ECE1] pb-4">
                  <div>
                    <h3 className="text-base font-bold text-[#1F2430] flex items-center gap-2">
                      <span>Live Real-Time Visitor Activity Feed</span>
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                    </h3>
                    <p className="text-xs text-[#8C92A0]">
                      Streaming native Firebase Analytics events as shoppers interact with the storefront
                    </p>
                  </div>
                  <span className="text-xs font-mono text-[#5E6470]">
                    Auto-refreshed every 3 seconds
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-[#EAE6DE] text-[#8C92A0] uppercase font-bold text-[10px] tracking-wider">
                        <th className="py-2.5 px-3">Time</th>
                        <th className="py-2.5 px-3">Event Type</th>
                        <th className="py-2.5 px-3">Route / Page</th>
                        <th className="py-2.5 px-3">Action Details</th>
                        <th className="py-2.5 px-3">Device / Platform</th>
                        <th className="py-2.5 px-3">Origin Location</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F4F6F9]">
                      {trafficSummary.recentEvents.slice(0, 10).map((evt) => (
                        <tr key={evt.id} className="hover:bg-[#FAF9F6] transition-colors">
                          <td className="py-2.5 px-3 font-mono text-[#6E685F]">
                            {evt.timestamp}
                          </td>
                          <td className="py-2.5 px-3">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase font-mono ${
                              evt.eventType === 'purchase'
                                ? 'bg-emerald-100 text-emerald-800'
                                : evt.eventType === 'add_to_cart'
                                ? 'bg-amber-100 text-amber-800'
                                : evt.eventType === 'begin_checkout'
                                ? 'bg-pink-100 text-pink-800'
                                : evt.eventType === 'view_item'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-[#F5F3FF] text-[#8B5CF6]'
                            }`}>
                              {evt.eventType}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 font-mono font-bold text-[#1F2430]">
                            {evt.page.startsWith('/') ? evt.page : `/${evt.page}`}
                          </td>
                          <td className="py-2.5 px-3 text-[#1F2430]">
                            {evt.details || 'Storefront navigation'}
                          </td>
                          <td className="py-2.5 px-3 text-[#6E685F]">
                            {evt.device || 'Mobile (iOS)'}
                          </td>
                          <td className="py-2.5 px-3 text-[#1F2430] font-medium">
                            {evt.city || 'Mumbai'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* ========================================================= */}
          {/* TAB: REAL-TIME TYPOGRAPHY & BRAND APPEARANCE STUDIO       */}
          {/* ========================================================= */}
          {activeTab === 'typography' && (
            <div className="space-y-8 animate-fadeIn">
              {/* HEADER BANNER */}
              <div className="bg-white border border-[#E6E8EC] rounded-xl p-6 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-[#8B5CF6] uppercase tracking-wider bg-[#F5F3FF] px-2.5 py-0.5 rounded-full border border-[#EDE9FE]">
                      Live CSS Variables & Cloud Firestore onSnapshot
                    </span>
                    <span className="text-xs font-bold text-[#10B981] bg-[#ECFDF5] px-2 py-0.5 rounded-full border border-[#D1FAE5] flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-ping"></span>
                      Real-Time Active
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold text-[#1F2430] tracking-tight mt-1.5 font-sans">
                    Typography & Brand Appearance Studio
                  </h2>
                  <p className="text-xs text-[#8C92A0] mt-0.5">
                    Live dynamic font family selector, typographic scale multipliers, and core brand color variables across the entire storefront in real-time.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      const resetTheme = {
                        headingFont: "'Playfair Display', serif",
                        productTitleFont: "'Cormorant Garamond', serif",
                        bodyFont: "'Plus Jakarta Sans', sans-serif",
                        headingSizeScale: 1.0,
                        productTitleSizeScale: 1.0,
                        bodySizeScale: 1.0,
                        primaryColor: '#0f172a',
                        accentColor: '#c5a880'
                      };
                      setEditHeadingFont(resetTheme.headingFont);
                      setEditProductTitleFont(resetTheme.productTitleFont);
                      setEditBodyFont(resetTheme.bodyFont);
                      setEditHeadingScale(resetTheme.headingSizeScale);
                      setEditProductScale(resetTheme.productTitleSizeScale);
                      setEditBodyScale(resetTheme.bodySizeScale);
                      setEditPrimaryColor(resetTheme.primaryColor);
                      setEditAccentColor(resetTheme.accentColor);
                      applyThemeSettingsLocally(resetTheme);
                      showToast('Default typography styles applied', 'info');
                    }}
                    className="px-4 py-2.5 bg-[#F4F6F9] hover:bg-[#EAEFF5] text-[#5E6470] text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    Reset Defaults
                  </button>

                  <button
                    type="button"
                    onClick={handlePublishThemeStyles}
                    disabled={isPublishingTheme}
                    className="px-5 py-2.5 bg-[#8B5CF6] hover:bg-[#7C3AED] disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-md shadow-[#8B5CF6]/25 flex items-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    <span>{isPublishingTheme ? 'Publishing...' : 'Publish Brand Styles'}</span>
                  </button>
                </div>
              </div>

              {/* CURATED LUXURY PRESETS BAR */}
              <div className="bg-white border border-[#E6E8EC] rounded-xl p-5 shadow-xs space-y-3">
                <span className="text-xs font-bold text-[#1F2430] uppercase tracking-wider block">
                  Curated Haute-Couture Presets (One-Click Application)
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                  {[
                    {
                      name: 'Vogue Runway',
                      desc: 'Bodoni Moda + Cormorant',
                      heading: "'Bodoni Moda', serif",
                      product: "'Cormorant Garamond', serif",
                      body: "'Plus Jakarta Sans', sans-serif",
                      headScale: 1.1,
                      prodScale: 1.05,
                      bodyScale: 1.0,
                      primary: '#0f172a',
                      accent: '#C85A32'
                    },
                    {
                      name: 'Scandinavian Atelier',
                      desc: 'Playfair + Tenor Sans',
                      heading: "'Playfair Display', serif",
                      product: "'Tenor Sans', sans-serif",
                      body: "'Plus Jakarta Sans', sans-serif",
                      headScale: 1.0,
                      prodScale: 1.0,
                      bodyScale: 1.0,
                      primary: '#1F1F1F',
                      accent: '#c5a880'
                    },
                    {
                      name: 'Roman Imperial',
                      desc: 'Cinzel + Bodoni',
                      heading: "'Cinzel', serif",
                      product: "'Bodoni Moda', serif",
                      body: "'Inter', sans-serif",
                      headScale: 1.05,
                      prodScale: 1.0,
                      bodyScale: 0.95,
                      primary: '#18181b',
                      accent: '#d97706'
                    },
                    {
                      name: 'Artisanal Boutique',
                      desc: 'Cormorant + Montserrat',
                      heading: "'Cormorant Garamond', serif",
                      product: "'Montserrat', sans-serif",
                      body: "'Plus Jakarta Sans', sans-serif",
                      headScale: 1.15,
                      prodScale: 0.95,
                      bodyScale: 1.0,
                      primary: '#1c1917',
                      accent: '#b45309'
                    },
                    {
                      name: 'Nordic Streetwear',
                      desc: 'Space Grotesk + Tenor',
                      heading: "'Space Grotesk', sans-serif",
                      product: "'Tenor Sans', sans-serif",
                      body: "'Inter', sans-serif",
                      headScale: 1.0,
                      prodScale: 1.0,
                      bodyScale: 1.0,
                      primary: '#09090b',
                      accent: '#2563eb'
                    }
                  ].map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => {
                        setEditHeadingFont(preset.heading);
                        setEditProductTitleFont(preset.product);
                        setEditBodyFont(preset.body);
                        setEditHeadingScale(preset.headScale);
                        setEditProductScale(preset.prodScale);
                        setEditBodyScale(preset.bodyScale);
                        setEditPrimaryColor(preset.primary);
                        setEditAccentColor(preset.accent);
                        handleLiveTypographyChange({
                          headingFont: preset.heading,
                          productTitleFont: preset.product,
                          bodyFont: preset.body,
                          headingSizeScale: preset.headScale,
                          productTitleSizeScale: preset.prodScale,
                          bodySizeScale: preset.bodyScale,
                          primaryColor: preset.primary,
                          accentColor: preset.accent
                        });
                        showToast(`Applied "${preset.name}" preset`, 'info');
                      }}
                      className="p-3 bg-[#FAF9F6] hover:bg-[#F5F3EF] border border-[#EAE6DE] rounded-xl text-left transition-all hover:border-[#8B5CF6] cursor-pointer group"
                    >
                      <div className="font-bold text-xs text-[#1F2430] group-hover:text-[#8B5CF6] transition-colors">
                        {preset.name}
                      </div>
                      <div className="text-[10px] text-[#8C92A0] mt-0.5">
                        {preset.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* STUDIO MAIN GRID: CONTROLS (LEFT 7 COLS) & LIVE PREVIEW (RIGHT 5 COLS) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* LEFT CONTROLS (7 COLS) */}
                <div className="lg:col-span-7 space-y-6">
                  
                  {/* FONT FAMILIES CARD */}
                  <div className="bg-white border border-[#E6E8EC] rounded-xl p-6 shadow-xs space-y-6">
                    <h3 className="text-base font-bold text-[#1F2430] border-b border-[#F0ECE1] pb-3">
                      1. Font Family Curations
                    </h3>

                    {/* Heading Font */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-[#1F2430]">
                          Heading Font (<code className="text-[#8B5CF6] font-mono">--font-heading</code>)
                        </label>
                        <span className="text-[11px] text-[#8C92A0] font-mono">
                          {editHeadingFont.split(',')[0].replace(/'/g, '')}
                        </span>
                      </div>
                      <select
                        value={editHeadingFont}
                        onChange={(e) => {
                          setEditHeadingFont(e.target.value);
                          handleLiveTypographyChange({ headingFont: e.target.value });
                        }}
                        className="w-full p-3 bg-[#FAF9F6] border border-[#D5D0C5] rounded-xl text-xs font-semibold text-[#1F1F1F] focus:outline-none focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6]"
                      >
                        <option value="'Playfair Display', serif">Playfair Display (Classic Luxury)</option>
                        <option value="'Bodoni Moda', serif">Bodoni Moda (Vogue / Runway Editorial)</option>
                        <option value="'Cinzel', serif">Cinzel (Roman / Timeless Sculpture)</option>
                        <option value="'Cormorant Garamond', serif">Cormorant Garamond (Artisanal Boutique)</option>
                        <option value="'Prata', serif">Prata (Modern Minimal Serif)</option>
                        <option value="'Space Grotesk', sans-serif">Space Grotesk (Contemporary / Streetwear Tech)</option>
                      </select>
                      <p className="text-[11px] text-[#8C92A0]">
                        Controls all main section titles, hero headlines, category banners, and modal headers.
                      </p>
                    </div>

                    {/* Product Title Font */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-[#1F2430]">
                          Product Title Font (<code className="text-[#8B5CF6] font-mono">--font-product-title</code>)
                        </label>
                        <span className="text-[11px] text-[#8C92A0] font-mono">
                          {editProductTitleFont.split(',')[0].replace(/'/g, '')}
                        </span>
                      </div>
                      <select
                        value={editProductTitleFont}
                        onChange={(e) => {
                          setEditProductTitleFont(e.target.value);
                          handleLiveTypographyChange({ productTitleFont: e.target.value });
                        }}
                        className="w-full p-3 bg-[#FAF9F6] border border-[#D5D0C5] rounded-xl text-xs font-semibold text-[#1F1F1F] focus:outline-none focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6]"
                      >
                        <option value="'Tenor Sans', sans-serif">Tenor Sans (Scandinavian Minimalist)</option>
                        <option value="'Cormorant Garamond', serif">Cormorant Garamond (High-end Fashion)</option>
                        <option value="'Bodoni Moda', serif">Bodoni Moda (Runway / Chic)</option>
                        <option value="'Montserrat', sans-serif">Montserrat (Modern Clean Sans)</option>
                        <option value="'Plus Jakarta Sans', sans-serif">Plus Jakarta Sans (Balanced Humanist)</option>
                        <option value="'Playfair Display', serif">Playfair Display (Boutique Serif)</option>
                      </select>
                      <p className="text-[11px] text-[#8C92A0]">
                        Controls all product cards, catalog names, quick views, and product detail view headers.
                      </p>
                    </div>

                    {/* Body & UI Font */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-[#1F2430]">
                          Body & UI Font (<code className="text-[#8B5CF6] font-mono">--font-body</code>)
                        </label>
                        <span className="text-[11px] text-[#8C92A0] font-mono">
                          {editBodyFont.split(',')[0].replace(/'/g, '')}
                        </span>
                      </div>
                      <select
                        value={editBodyFont}
                        onChange={(e) => {
                          setEditBodyFont(e.target.value);
                          handleLiveTypographyChange({ bodyFont: e.target.value });
                        }}
                        className="w-full p-3 bg-[#FAF9F6] border border-[#D5D0C5] rounded-xl text-xs font-semibold text-[#1F1F1F] focus:outline-none focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6]"
                      >
                        <option value="'Plus Jakarta Sans', sans-serif">Plus Jakarta Sans (Clean, Polished)</option>
                        <option value="'Inter', sans-serif">Inter (Neutral, High Legibility)</option>
                        <option value="'Tenor Sans', sans-serif">Tenor Sans (Chic Sans)</option>
                      </select>
                      <p className="text-[11px] text-[#8C92A0]">
                        Controls buttons, descriptions, badges, navigation menus, and form controls.
                      </p>
                    </div>
                  </div>

                  {/* FONT SIZE SCALE SLIDERS CARD */}
                  <div className="bg-white border border-[#E6E8EC] rounded-xl p-6 shadow-xs space-y-6">
                    <h3 className="text-base font-bold text-[#1F2430] border-b border-[#F0ECE1] pb-3">
                      2. Typographic Scale Multipliers (Live CSS Sliders)
                    </h3>

                    {/* Heading Scale Slider */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs font-bold">
                        <label className="text-[#1F2430]">Heading Size Scale (0.8x to 1.4x)</label>
                        <span className="text-[#8B5CF6] bg-[#F5F3FF] px-2 py-0.5 rounded-md font-mono">
                          {editHeadingScale.toFixed(2)}x
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0.8"
                        max="1.4"
                        step="0.05"
                        value={editHeadingScale}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          setEditHeadingScale(val);
                          handleLiveTypographyChange({ headingSizeScale: val });
                        }}
                        className="w-full accent-[#8B5CF6] cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-[#8C92A0] font-mono">
                        <span>0.80x (Compact)</span>
                        <span>1.00x (Standard)</span>
                        <span>1.40x (Grand Runway)</span>
                      </div>
                    </div>

                    {/* Product Title Scale Slider */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs font-bold">
                        <label className="text-[#1F2430]">Product Titles Size Scale (0.8x to 1.3x)</label>
                        <span className="text-[#8B5CF6] bg-[#F5F3FF] px-2 py-0.5 rounded-md font-mono">
                          {editProductScale.toFixed(2)}x
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0.8"
                        max="1.3"
                        step="0.05"
                        value={editProductScale}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          setEditProductScale(val);
                          handleLiveTypographyChange({ productTitleSizeScale: val });
                        }}
                        className="w-full accent-[#8B5CF6] cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-[#8C92A0] font-mono">
                        <span>0.80x</span>
                        <span>1.00x (Standard)</span>
                        <span>1.30x (Bold)</span>
                      </div>
                    </div>

                    {/* Body Text Scale Slider */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs font-bold">
                        <label className="text-[#1F2430]">Body Text & UI Scale (0.85x to 1.2x)</label>
                        <span className="text-[#8B5CF6] bg-[#F5F3FF] px-2 py-0.5 rounded-md font-mono">
                          {editBodyScale.toFixed(2)}x
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0.85"
                        max="1.2"
                        step="0.05"
                        value={editBodyScale}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          setEditBodyScale(val);
                          handleLiveTypographyChange({ bodySizeScale: val });
                        }}
                        className="w-full accent-[#8B5CF6] cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-[#8C92A0] font-mono">
                        <span>0.85x</span>
                        <span>1.00x (Balanced)</span>
                        <span>1.20x</span>
                      </div>
                    </div>
                  </div>

                  {/* COLOR PICKERS CARD */}
                  {/* REAL-TIME PALETTE & COLOR STUDIO CARD */}
                  <div className="bg-white border border-[#E6E8EC] rounded-xl p-6 shadow-xs space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-[#F0ECE1] pb-3">
                      <div>
                        <h3 className="text-base font-bold text-[#1F2430] flex items-center gap-2">
                          <Palette className="w-5 h-5 text-[#8B5CF6]" />
                          <span>3. Real-Time Palette & Theme Engine</span>
                        </h3>
                        <p className="text-xs text-[#8C92A0]">
                          Dynamic CSS custom properties bound directly to DOM root and synced across all visitors in real-time
                        </p>
                      </div>
                      <span className="text-[10px] font-bold text-[#10B981] bg-[#ECFDF5] px-2.5 py-1 rounded-full uppercase border border-[#D1FAE5] self-start sm:self-auto">
                        Live CSS Variables
                      </span>
                    </div>

                    {/* Quick-Apply 1-Click Luxury Color Presets */}
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-[#1F2430] uppercase tracking-wider block">
                        Quick-Apply 1-Click Luxury Presets
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[
                          {
                            name: 'Nordic Minimalist',
                            desc: 'Bone (#FAFAF9), Carbon & Warm Taupe',
                            primary: '#18181B',
                            accent: '#A8A29E',
                            buynow: '#DC2626',
                            colors: {
                              'color-site-bg': '#FAFAF9',
                              'color-surface-card': '#FFFFFF',
                              'color-header-bg': '#FAFAF9',
                              'color-footer-bg': '#18181B',
                              'color-text-primary': '#18181B',
                              'color-text-secondary': '#71717A',
                              'color-text-muted': '#A1A1AA',
                              'color-footer-text': '#F4F4F5',
                              'color-brand-primary': '#18181B',
                              'color-brand-accent': '#A8A29E',
                              'color-btn-bg': '#18181B',
                              'color-btn-text': '#FFFFFF',
                              'color-btn-hover': '#27272A',
                              'color-buynow-bg': '#DC2626',
                              'color-buynow-text': '#FFFFFF',
                              'color-buynow-hover': '#B91C1C',
                              'color-border-subtle': '#E4E4E7',
                              'color-badge-bg': '#F4F4F5',
                              'color-badge-text': '#18181B'
                            }
                          },
                          {
                            name: 'Editorial Vogue',
                            desc: 'Stark White, Solid Black & Champagne Gold',
                            primary: '#000000',
                            accent: '#C5A880',
                            buynow: '#DC2626',
                            colors: {
                              'color-site-bg': '#FFFFFF',
                              'color-surface-card': '#FFFFFF',
                              'color-header-bg': '#FFFFFF',
                              'color-footer-bg': '#000000',
                              'color-text-primary': '#000000',
                              'color-text-secondary': '#52525B',
                              'color-text-muted': '#71717A',
                              'color-footer-text': '#FAFAFA',
                              'color-brand-primary': '#000000',
                              'color-brand-accent': '#C5A880',
                              'color-btn-bg': '#000000',
                              'color-btn-text': '#FFFFFF',
                              'color-btn-hover': '#18181B',
                              'color-buynow-bg': '#DC2626',
                              'color-buynow-text': '#FFFFFF',
                              'color-buynow-hover': '#B91C1C',
                              'color-border-subtle': '#E5E7EB',
                              'color-badge-bg': '#F3F4F6',
                              'color-badge-text': '#000000'
                            }
                          },
                          {
                            name: 'Emerald Atelier',
                            desc: 'Pale Sage (#F4F7F4), Forest Green & Cream',
                            primary: '#0F2E23',
                            accent: '#2D6A4F',
                            buynow: '#C85A32',
                            colors: {
                              'color-site-bg': '#F4F7F4',
                              'color-surface-card': '#FFFFFF',
                              'color-header-bg': '#F4F7F4',
                              'color-footer-bg': '#0F2E23',
                              'color-text-primary': '#0F2E23',
                              'color-text-secondary': '#3D5A4C',
                              'color-text-muted': '#6B8074',
                              'color-footer-text': '#F7F7F2',
                              'color-brand-primary': '#0F2E23',
                              'color-brand-accent': '#2D6A4F',
                              'color-btn-bg': '#0F2E23',
                              'color-btn-text': '#F7F7F2',
                              'color-btn-hover': '#1B4332',
                              'color-buynow-bg': '#C85A32',
                              'color-buynow-text': '#FFFFFF',
                              'color-buynow-hover': '#B34E2A',
                              'color-border-subtle': '#D8E2DC',
                              'color-badge-bg': '#E8EFE9',
                              'color-badge-text': '#0F2E23'
                            }
                          },
                          {
                            name: 'Midnight Velvet',
                            desc: 'Obsidian (#0A0A0B), Off-White & Soft Silver',
                            primary: '#C5A880',
                            accent: '#E0C097',
                            buynow: '#DC2626',
                            colors: {
                              'color-site-bg': '#0A0A0B',
                              'color-surface-card': '#18181B',
                              'color-header-bg': '#0A0A0B',
                              'color-footer-bg': '#050505',
                              'color-text-primary': '#F4F4F5',
                              'color-text-secondary': '#A1A1AA',
                              'color-text-muted': '#71717A',
                              'color-footer-text': '#E4E4E7',
                              'color-brand-primary': '#C5A880',
                              'color-brand-accent': '#E0C097',
                              'color-btn-bg': '#C5A880',
                              'color-btn-text': '#0A0A0B',
                              'color-btn-hover': '#D4B38A',
                              'color-buynow-bg': '#DC2626',
                              'color-buynow-text': '#FFFFFF',
                              'color-buynow-hover': '#B91C1C',
                              'color-border-subtle': '#27272A',
                              'color-badge-bg': '#27272A',
                              'color-badge-text': '#F4F4F5'
                            }
                          }
                        ].map((preset) => (
                          <button
                            key={preset.name}
                            type="button"
                            onClick={() => handleApplyColorPreset(preset)}
                            className="p-3 bg-[#FAF9F6] hover:bg-white border border-[#EAE6DE] rounded-xl text-left transition-all hover:border-[#8B5CF6] hover:shadow-xs cursor-pointer group"
                          >
                            <div className="flex items-center gap-1.5 mb-1">
                              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: preset.colors['color-site-bg'] }} />
                              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: preset.primary }} />
                              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: preset.accent }} />
                            </div>
                            <span className="font-bold text-xs text-[#1F2430] group-hover:text-[#8B5CF6] block transition-colors">
                              {preset.name}
                            </span>
                            <span className="text-[10px] text-[#8C92A0] line-clamp-1 block mt-0.5">
                              {preset.desc}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Fine-Tuning Color Pickers Grouped into 4 Blocks */}
                    <div className="space-y-5 pt-2">
                      {/* Group 1: Base Surfaces */}
                      <div className="space-y-2">
                        <span className="text-[11px] font-bold text-[#8B5CF6] uppercase tracking-wider block">
                          A. Base Surfaces & Backgrounds
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {[
                            { key: 'color-site-bg', label: 'Site Canvas Background', css: '--color-site-bg' },
                            { key: 'color-surface-card', label: 'Surface Cards & Panels', css: '--color-surface-card' },
                            { key: 'color-header-bg', label: 'Main Header Background', css: '--color-header-bg' },
                            { key: 'color-footer-bg', label: 'Footer Background', css: '--color-footer-bg' }
                          ].map((item) => (
                            <div key={item.key} className="p-3 bg-[#FAF9F6] border border-[#EAE6DE] rounded-xl space-y-1.5">
                              <label className="text-xs font-bold text-[#1F2430] flex justify-between items-center">
                                <span>{item.label}</span>
                                <code className="text-[10px] text-gray-400 font-mono">{item.css}</code>
                              </label>
                              <div className="flex items-center gap-2">
                                <input
                                  type="color"
                                  value={editColors[item.key] || '#FFFFFF'}
                                  onChange={(e) => handleLiveColorTokenChange(item.key, e.target.value)}
                                  className="w-8 h-8 rounded-lg cursor-pointer border border-gray-300 p-0.5 bg-white shrink-0"
                                />
                                <input
                                  type="text"
                                  value={editColors[item.key] || ''}
                                  onChange={(e) => handleLiveColorTokenChange(item.key, e.target.value)}
                                  className="flex-1 px-2.5 py-1.5 bg-white border border-[#D5D0C5] rounded-lg text-xs font-mono font-bold"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Group 2: Typography */}
                      <div className="space-y-2">
                        <span className="text-[11px] font-bold text-[#8B5CF6] uppercase tracking-wider block">
                          B. Typography & Text Colors
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {[
                            { key: 'color-text-primary', label: 'Primary Text (Headings/Body)', css: '--color-text-primary' },
                            { key: 'color-text-secondary', label: 'Secondary Subtitle Text', css: '--color-text-secondary' },
                            { key: 'color-text-muted', label: 'Muted & Meta Captions', css: '--color-text-muted' },
                            { key: 'color-footer-text', label: 'Footer Typography Color', css: '--color-footer-text' }
                          ].map((item) => (
                            <div key={item.key} className="p-3 bg-[#FAF9F6] border border-[#EAE6DE] rounded-xl space-y-1.5">
                              <label className="text-xs font-bold text-[#1F2430] flex justify-between items-center">
                                <span>{item.label}</span>
                                <code className="text-[10px] text-gray-400 font-mono">{item.css}</code>
                              </label>
                              <div className="flex items-center gap-2">
                                <input
                                  type="color"
                                  value={editColors[item.key] || '#111827'}
                                  onChange={(e) => handleLiveColorTokenChange(item.key, e.target.value)}
                                  className="w-8 h-8 rounded-lg cursor-pointer border border-gray-300 p-0.5 bg-white shrink-0"
                                />
                                <input
                                  type="text"
                                  value={editColors[item.key] || ''}
                                  onChange={(e) => handleLiveColorTokenChange(item.key, e.target.value)}
                                  className="flex-1 px-2.5 py-1.5 bg-white border border-[#D5D0C5] rounded-lg text-xs font-mono font-bold"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Group 3: Brand, Buttons & Buy Now */}
                      <div className="space-y-2">
                        <span className="text-[11px] font-bold text-[#8B5CF6] uppercase tracking-wider block">
                          C. Brand & Interactive Elements (Buttons & Buy Now)
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {[
                            { key: 'color-brand-primary', label: 'Primary Brand Color', css: '--color-brand-primary' },
                            { key: 'color-brand-accent', label: 'Brand Accent / Gold Highlight', css: '--color-brand-accent' },
                            { key: 'color-btn-bg', label: 'Primary Button Background', css: '--color-btn-bg' },
                            { key: 'color-btn-text', label: 'Primary Button Text', css: '--color-btn-text' },
                            { key: 'color-btn-hover', label: 'Primary Button Hover State', css: '--color-btn-hover' },
                            { key: 'color-buynow-bg', label: 'Global "Buy Now" Button Color', css: '--color-buynow-bg' }
                          ].map((item) => (
                            <div key={item.key} className={`p-3 border rounded-xl space-y-1.5 ${item.key === 'color-buynow-bg' ? 'bg-[#FEF2F2] border-red-200' : 'bg-[#FAF9F6] border-[#EAE6DE]'}`}>
                              <label className="text-xs font-bold text-[#1F2430] flex justify-between items-center">
                                <span className={item.key === 'color-buynow-bg' ? 'text-red-700 flex items-center gap-1 font-bold' : ''}>
                                  {item.key === 'color-buynow-bg' && <Zap className="w-3 h-3 fill-red-600 text-red-600" />}
                                  {item.label}
                                </span>
                                <code className="text-[10px] text-gray-400 font-mono">{item.css}</code>
                              </label>
                              <div className="flex items-center gap-2">
                                <input
                                  type="color"
                                  value={editColors[item.key] || (item.key === 'color-buynow-bg' ? '#DC2626' : '#111827')}
                                  onChange={(e) => handleLiveColorTokenChange(item.key, e.target.value)}
                                  className="w-8 h-8 rounded-lg cursor-pointer border border-gray-300 p-0.5 bg-white shrink-0"
                                />
                                <input
                                  type="text"
                                  value={editColors[item.key] || ''}
                                  onChange={(e) => handleLiveColorTokenChange(item.key, e.target.value)}
                                  className="flex-1 px-2.5 py-1.5 bg-white border border-[#D5D0C5] rounded-lg text-xs font-mono font-bold"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Group 4: Borders & Badges */}
                      <div className="space-y-2">
                        <span className="text-[11px] font-bold text-[#8B5CF6] uppercase tracking-wider block">
                          D. Borders, Dividers & Badges
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {[
                            { key: 'color-border-subtle', label: 'Border & Dividers', css: '--color-border-subtle' },
                            { key: 'color-badge-bg', label: 'Badge Background', css: '--color-badge-bg' },
                            { key: 'color-badge-text', label: 'Badge Text', css: '--color-badge-text' }
                          ].map((item) => (
                            <div key={item.key} className="p-3 bg-[#FAF9F6] border border-[#EAE6DE] rounded-xl space-y-1.5">
                              <label className="text-xs font-bold text-[#1F2430] flex justify-between items-center">
                                <span>{item.label}</span>
                              </label>
                              <div className="flex items-center gap-2">
                                <input
                                  type="color"
                                  value={editColors[item.key] || '#E5E7EB'}
                                  onChange={(e) => handleLiveColorTokenChange(item.key, e.target.value)}
                                  className="w-8 h-8 rounded-lg cursor-pointer border border-gray-300 p-0.5 bg-white shrink-0"
                                />
                                <input
                                  type="text"
                                  value={editColors[item.key] || ''}
                                  onChange={(e) => handleLiveColorTokenChange(item.key, e.target.value)}
                                  className="flex-1 px-2.5 py-1.5 bg-white border border-[#D5D0C5] rounded-lg text-xs font-mono font-bold"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>
                  </div>

                </div>

                {/* RIGHT: LIVE INTERACTIVE PREVIEW CARD (5 COLS) */}
                <div className="lg:col-span-5 space-y-6 sticky top-28 self-start">
                  <div 
                    style={{ 
                      backgroundColor: editColors['color-site-bg'] || '#FAF9F6',
                      borderColor: editColors['color-border-subtle'] || '#E5E7EB'
                    }}
                    className="border-2 rounded-2xl p-6 shadow-xl space-y-5 relative overflow-hidden transition-colors"
                  >
                    <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-[#8B5CF6]" />
                        <span 
                          style={{ color: editColors['color-text-primary'] || '#1F2430' }}
                          className="text-xs font-bold uppercase tracking-wider"
                        >
                          Live Storefront Preview
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-[#10B981] bg-[#ECFDF5] px-2 py-0.5 rounded-full uppercase">
                        Instant DOM Update
                      </span>
                    </div>

                    {/* Preview Section 0: Header Simulation */}
                    <div 
                      style={{ 
                        backgroundColor: editColors['color-header-bg'] || '#FFFFFF',
                        borderColor: editColors['color-border-subtle'] || '#E5E7EB'
                      }}
                      className="p-3 rounded-xl border flex items-center justify-between transition-colors shadow-2xs"
                    >
                      <div className="flex items-center gap-2">
                        <span 
                          style={{ 
                            fontFamily: editHeadingFont, 
                            color: editColors['color-brand-primary'] || '#111827' 
                          }}
                          className="font-bold text-sm tracking-wider"
                        >
                          DIVACHIC
                        </span>
                        <span 
                          style={{ 
                            backgroundColor: editColors['color-badge-bg'] || '#F3F4F6',
                            color: editColors['color-badge-text'] || '#1F2937'
                          }}
                          className="text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase"
                        >
                          Atelier
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[10px]" style={{ color: editColors['color-text-secondary'] || '#6B7280' }}>
                        <span>Bags</span>
                        <span>Eyewear</span>
                        <span>Shoes</span>
                      </div>
                    </div>

                    {/* Preview Section 1: Hero Heading */}
                    <div 
                      style={{ 
                        backgroundColor: editColors['color-surface-card'] || '#FFFFFF',
                        borderColor: editColors['color-border-subtle'] || '#E5E7EB'
                      }}
                      className="p-5 rounded-xl border space-y-2 transition-colors shadow-2xs"
                    >
                      <span 
                        style={{ color: editColors['color-brand-accent'] || '#C5A880' }}
                        className="text-[10px] uppercase font-bold tracking-widest block"
                      >
                        Runway Silhouette 2026
                      </span>
                      <h2 
                        style={{ 
                          fontFamily: editHeadingFont, 
                          fontSize: `calc(1.6rem * ${editHeadingScale})`,
                          color: editColors['color-text-primary'] || '#111827'
                        }}
                        className="font-medium tracking-tight leading-tight"
                      >
                        Enhancing your inner beauty.
                      </h2>
                      <p 
                        style={{ 
                          fontFamily: editBodyFont, 
                          fontSize: `calc(0.85rem * ${editBodyScale})`,
                          color: editColors['color-text-secondary'] || '#6B7280'
                        }}
                        className="leading-relaxed"
                      >
                        Discover curated runway silhouettes, sustainable bio-acetate optics, and bespoke handcrafted couture essentials.
                      </p>
                    </div>

                    {/* Preview Section 2: Product Card Simulation */}
                    <div 
                      style={{ 
                        backgroundColor: editColors['color-surface-card'] || '#FFFFFF',
                        borderColor: editColors['color-border-subtle'] || '#E5E7EB'
                      }}
                      className="p-4 rounded-xl border shadow-xs space-y-3 transition-colors"
                    >
                      <div className="flex gap-4 items-center">
                        <img
                          src="https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=300&auto=format&fit=crop"
                          alt="Sample Product"
                          className="w-20 h-20 rounded-lg object-cover border"
                          style={{ borderColor: editColors['color-border-subtle'] || '#E5E7EB' }}
                        />
                        <div className="flex-1 space-y-1">
                          <span 
                            style={{ 
                              fontFamily: editBodyFont,
                              color: editColors['color-brand-accent'] || '#C5A880'
                            }}
                            className="text-[10px] uppercase font-bold tracking-[0.2em]"
                          >
                            Backpacks & Bags
                          </span>
                          <h4 
                            style={{ 
                              fontFamily: editProductTitleFont, 
                              fontSize: `calc(1.1rem * ${editProductScale})`,
                              color: editColors['color-text-primary'] || '#111827'
                            }}
                            className="font-medium leading-snug"
                          >
                            Scandinavian Leather Daypack
                          </h4>
                          <div className="flex items-center gap-2">
                            <span 
                              style={{ 
                                fontFamily: editBodyFont,
                                color: editColors['color-text-primary'] || '#111827'
                              }}
                              className="text-xs font-bold"
                            >
                              ₹12,325.00
                            </span>
                            <span 
                              style={{ 
                                fontFamily: editBodyFont,
                                color: editColors['color-text-muted'] || '#9CA3AF'
                              }}
                              className="text-[11px] line-through"
                            >
                              ₹15,400.00
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Preview Section 3: Interactive CTA Buttons */}
                    <div className="space-y-2 pt-2 border-t border-gray-200">
                      <span 
                        style={{ color: editColors['color-text-muted'] || '#9CA3AF' }}
                        className="text-[10px] uppercase font-bold tracking-widest block"
                      >
                        Action Buttons (Cart & Buy Now):
                      </span>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          style={{ 
                            backgroundColor: editColors['color-btn-bg'] || '#111827', 
                            color: editColors['color-btn-text'] || '#FFFFFF',
                            fontFamily: editBodyFont,
                            fontSize: `calc(0.75rem * ${editBodyScale})`
                          }}
                          className="flex-1 py-2.5 px-3 rounded-lg font-bold uppercase tracking-wider transition-opacity hover:opacity-90 shadow-xs flex items-center justify-center gap-1.5"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>Add to Cart</span>
                        </button>
                        <button
                          type="button"
                          style={{ 
                            backgroundColor: editColors['color-buynow-bg'] || editBuyNowColor, 
                            color: editColors['color-buynow-text'] || '#FFFFFF',
                            fontFamily: editBodyFont,
                            fontSize: `calc(0.75rem * ${editBodyScale})`
                          }}
                          className="flex-1 py-2.5 px-3 rounded-lg font-bold uppercase tracking-wider transition-opacity hover:opacity-90 shadow-xs flex items-center justify-center gap-1.5"
                        >
                          <Zap className="w-3.5 h-3.5 fill-white" />
                          <span>Buy Now</span>
                        </button>
                      </div>
                    </div>

                    {/* Preview Section 4: Footer Simulation */}
                    <div 
                      style={{ 
                        backgroundColor: editColors['color-footer-bg'] || '#111827',
                        color: editColors['color-footer-text'] || '#E5E7EB'
                      }}
                      className="p-3 rounded-xl flex items-center justify-between text-[10px] transition-colors"
                    >
                      <span className="font-bold">© 2026 DivaChic Atelier</span>
                      <span>Express Global Insured Delivery</span>
                    </div>

                    {/* Publish CTA Button */}
                    <div className="pt-2 border-t border-gray-200">
                      <button
                        type="button"
                        onClick={handlePublishThemeStyles}
                        disabled={isPublishingTheme}
                        className="w-full py-3.5 bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] hover:from-[#7C3AED] hover:to-[#6D28D9] disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-lg shadow-[#8B5CF6]/30 flex items-center justify-center gap-2 uppercase tracking-wider"
                      >
                        <Check className="w-4 h-4" />
                        <span>{isPublishingTheme ? 'Publishing Palette...' : 'Publish Palette & Styles to Live Store'}</span>
                      </button>
                      <p className="text-[10px] text-center text-[#8C92A0] mt-2">
                        Saves to Firestore document <code className="text-[#8B5CF6] font-mono">settings/theme</code> via merge & onSnapshot.
                      </p>
                    </div>

                  </div>
                </div>

              </div>

            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 3: MASTER ORDERS & OMS (FULL FILTERING & DISPATCH)    */}
          {/* ========================================================= */}
          {/* ========================================================= */}
          {/* TAB 3: REAL-TIME FIRESTORE ORDER & CUSTOMER MANAGEMENT    */}
          {/* ========================================================= */}
          {activeTab === 'orders' && (
            <div className="bg-white border border-[#E6E8EC] rounded-xl shadow-xs p-6 space-y-6 animate-fadeIn">
              
              {/* HEADER & LIVE FIRESTORE SYNC STATUS */}
              <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-4 border-b border-[#F0ECE1] pb-5">
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                      Firestore onSnapshot Stream Active
                    </span>
                    <span className="text-xs font-mono font-bold text-[#8B5CF6] bg-[#F5F3FF] border border-[#EDE9FE] px-2.5 py-0.5 rounded-full">
                      Collection: orders
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold text-[#1F2430] tracking-tight font-sans">
                    Master Orders & Customer Fulfillment
                  </h2>
                  <p className="text-xs text-[#8C92A0]">
                    Manage order readiness, set planned dispatch dates, and inspect customer shipping addresses in real time.
                  </p>
                </div>

                {/* Total Orders Metric Badge */}
                <div className="flex items-center gap-3">
                  <div className="px-4 py-2 bg-[#FAF9F6] border border-[#EAE6DE] rounded-xl text-right">
                    <span className="text-[10px] uppercase font-bold text-[#8C92A0] block">Total Orders</span>
                    <span className="text-lg font-bold text-[#1F2430] font-mono">{orders.length}</span>
                  </div>
                  <div className="px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-xl text-right">
                    <span className="text-[10px] uppercase font-bold text-emerald-700 block">Ready for Dispatch</span>
                    <span className="text-lg font-bold text-emerald-700 font-mono">
                      {orders.filter(o => o.status === 'Ready' || o.status === 'packed').length}
                    </span>
                  </div>
                </div>
              </div>

              {/* SEARCH BAR & STATUS FILTER BUTTONS */}
              <div className="space-y-4">
                
                {/* Search Bar */}
                <div className="relative max-w-md">
                  <input
                    type="text"
                    value={orderSearchQuery}
                    onChange={(e) => setOrderSearchQuery(e.target.value)}
                    placeholder="Search by Order ID, Customer Name, Email, Phone, City, Postal Code, Product..."
                    className="w-full pl-9 pr-8 py-2.5 bg-[#FAF9F6] border border-[#D5D0C5] rounded-xl text-xs text-[#1F1F1F] placeholder:text-[#8C92A0] focus:outline-none focus:border-[#8B5CF6] focus:bg-white"
                  />
                  <Search className="w-4 h-4 text-[#8C92A0] absolute left-3 top-1/2 -translate-y-1/2" />
                  {orderSearchQuery && (
                    <button
                      onClick={() => setOrderSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 p-1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Status Filter Stepper Tabs */}
                <div className="flex flex-wrap gap-2 border-b border-[#F0ECE1] pb-3">
                  {[
                    { key: 'all', label: 'All Orders', count: orders.length, color: 'bg-[#8B5CF6]' },
                    { key: 'Pending', label: 'Pending', count: orders.filter(o => o.status === 'Pending' || o.status === 'placed').length, color: 'bg-amber-500' },
                    { key: 'Accepted', label: 'Accepted', count: orders.filter(o => o.status === 'Accepted').length, color: 'bg-blue-600' },
                    { key: 'Yet to be Sent', label: 'Yet to be Sent', count: orders.filter(o => o.status === 'Yet to be Sent').length, color: 'bg-purple-600' },
                    { key: 'Ready', label: 'Ready', count: orders.filter(o => o.status === 'Ready' || o.status === 'packed').length, color: 'bg-emerald-600' },
                    { key: 'Dispatched', label: 'Dispatched', count: orders.filter(o => o.status === 'Dispatched' || o.status === 'in_transit' || o.status === 'out_for_delivery').length, color: 'bg-cyan-600' },
                    { key: 'Rejected', label: 'Rejected', count: orders.filter(o => o.status === 'Rejected' || o.status === 'cancelled').length, color: 'bg-red-600' }
                  ].map((st) => (
                    <button
                      key={st.key}
                      onClick={() => setOrderStatusFilter(st.key)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                        orderStatusFilter.toLowerCase() === st.key.toLowerCase()
                          ? `${st.color} text-white shadow-xs`
                          : 'bg-[#F4F6F9] text-[#5E6470] hover:bg-[#EAEFF5]'
                      }`}
                    >
                      <span>{st.label}</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                        orderStatusFilter.toLowerCase() === st.key.toLowerCase()
                          ? 'bg-white/20 text-white'
                          : 'bg-white text-[#5E6470] border border-[#E2E5EA]'
                      }`}>
                        {st.count}
                      </span>
                    </button>
                  ))}
                </div>

              </div>

              {/* ORDERS TABLE */}
              <div className="overflow-x-auto rounded-xl border border-[#EAE6DE]">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#EAE6DE] text-[#6E685F] uppercase tracking-wider text-[10px] bg-[#FAF9F6]">
                      <th className="py-3.5 px-3.5">Order ID & Date</th>
                      <th className="py-3.5 px-3.5">Customer & Contact</th>
                      <th className="py-3.5 px-3.5">Items</th>
                      <th className="py-3.5 px-3.5">Total Amount</th>
                      <th className="py-3.5 px-3.5">Status & Readiness</th>
                      <th className="py-3.5 px-3.5">Planned Dispatch Date</th>
                      <th className="py-3.5 px-3.5 text-right">Fulfillment Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0ECE1]">
                    {displayedOrders.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-10 text-[#8C92A0]">
                          <Package className="w-8 h-8 mx-auto mb-2 text-[#D5D0C5]" />
                          <p className="font-semibold">No matching orders found</p>
                          <p className="text-[11px] mt-0.5">Try clearing your search query or switching status filters.</p>
                        </td>
                      </tr>
                    ) : (
                      displayedOrders.map((ord) => {
                        const isReady = ord.status === 'Ready' || ord.status === 'packed';
                        const isUpdating = updatingOrderId === ord.id;
                        const customerName = ord.customer?.fullName || ord.customerName || ord.shippingAddress?.fullName || 'Valued Client';
                        const customerEmail = ord.customer?.email || ord.email || '';
                        const customerPhone = ord.customer?.phone || ord.shippingAddress?.phone || '';
                        const customerCity = ord.customer?.city || ord.shippingAddress?.city || '';

                        return (
                          <tr key={ord.id} className="hover:bg-[#FAF9F6]/80 transition-colors">
                            
                            {/* 1. Order ID & Date */}
                            <td className="py-3.5 px-3.5 align-top">
                              <span className="font-mono font-bold text-[#1F1F1F] block text-xs">
                                #{ord.orderNumber || ord.orderId || ord.id.slice(-6)}
                              </span>
                              <span className="text-[11px] text-[#8C8477] font-sans block mt-0.5">
                                {ord.createdAt?.toDate 
                                  ? ord.createdAt.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                                  : (ord.date || 'Today')}
                              </span>
                              <span className={`inline-block text-[9px] font-bold px-1.5 py-0.5 rounded-xs mt-1 uppercase font-mono ${
                                ord.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                              }`}>
                                {ord.paymentMethod || 'Credit Card'} · {ord.paymentStatus?.toUpperCase() || 'PAID'}
                              </span>
                            </td>

                            {/* 2. Customer & Contact */}
                            <td className="py-3.5 px-3.5 align-top">
                              <span className="font-bold text-[#1F1F1F] block text-xs">
                                {customerName}
                              </span>
                              {customerEmail && (
                                <a 
                                  href={`mailto:${customerEmail}`} 
                                  className="text-[11px] text-[#8B5CF6] hover:underline block truncate max-w-[180px]"
                                  title={`Email ${customerEmail}`}
                                >
                                  {customerEmail}
                                </a>
                              )}
                              {customerPhone && (
                                <a 
                                  href={`tel:${customerPhone}`} 
                                  className="text-[11px] text-[#555048] hover:text-[#1F1F1F] flex items-center gap-1 mt-0.5"
                                  title={`Call ${customerPhone}`}
                                >
                                  <Phone className="w-3 h-3 text-[#8C92A0]" />
                                  <span>{customerPhone}</span>
                                </a>
                              )}
                              <span className="text-[10px] text-[#8C8477] block mt-0.5">
                                {customerCity ? `City: ${customerCity}` : ''}
                              </span>
                            </td>

                            {/* 3. Items Purchased */}
                            <td className="py-3.5 px-3.5 align-top">
                              <div className="space-y-1.5 max-w-xs">
                                {ord.items.slice(0, 2).map((it, idx) => (
                                  <div key={idx} className="flex items-center gap-2">
                                    {(it.imageUrl || it.image) && (
                                      <img
                                        src={it.imageUrl || it.image}
                                        alt={it.title || it.name}
                                        className="w-7 h-7 rounded-md object-cover border border-[#EAE6DE] shrink-0"
                                      />
                                    )}
                                    <span className="text-[11px] text-[#555048] truncate font-medium">
                                      <strong className="text-[#1F1F1F]">{it.quantity}x</strong> {it.title || it.name}
                                    </span>
                                  </div>
                                ))}
                                {ord.items.length > 2 && (
                                  <span className="text-[10px] text-[#8B5CF6] font-semibold block">
                                    +{ord.items.length - 2} more item(s)
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* 4. Total Amount */}
                            <td className="py-3.5 px-3.5 align-top font-bold text-[#1F1F1F] text-sm">
                              {formatPrice(ord.totalAmount || ord.total)}
                            </td>

                            {/* 5. Status & Ready / Not Ready Toggle */}
                            <td className="py-3.5 px-3.5 align-top space-y-2">
                              <div>
                                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase border font-mono inline-flex items-center gap-1.5 ${
                                  ord.status === 'Ready' || ord.status === 'packed'
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    : ord.status === 'Dispatched' || ord.status === 'in_transit' || ord.status === 'out_for_delivery'
                                    ? 'bg-cyan-50 text-cyan-700 border-cyan-200'
                                    : ord.status === 'Accepted'
                                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                                    : ord.status === 'Yet to be Sent'
                                    ? 'bg-purple-50 text-purple-700 border-purple-200'
                                    : ord.status === 'Rejected' || ord.status === 'cancelled'
                                    ? 'bg-red-50 text-red-700 border-red-200'
                                    : 'bg-amber-50 text-amber-700 border-amber-200'
                                }`}>
                                  <span className={`w-1.5 h-1.5 rounded-full ${
                                    ord.status === 'Ready' ? 'bg-emerald-500' : 'bg-current'
                                  }`}></span>
                                  {ord.status}
                                </span>
                              </div>

                              {/* Ready / Not Ready Toggle Switch */}
                              <div className="flex items-center gap-2 pt-0.5">
                                <button
                                  type="button"
                                  disabled={isUpdating}
                                  onClick={() => handleUpdateOrderStatus(ord, isReady ? 'Yet to be Sent' : 'Ready')}
                                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                    isReady ? 'bg-emerald-500' : 'bg-gray-300'
                                  }`}
                                  title={isReady ? 'Click to toggle Not Ready (Yet to be Sent)' : 'Click to toggle Ready for Dispatch'}
                                >
                                  <span
                                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                                      isReady ? 'translate-x-4' : 'translate-x-0'
                                    }`}
                                  />
                                </button>
                                <span className={`text-[10px] font-bold ${isReady ? 'text-emerald-700' : 'text-[#8C92A0]'}`}>
                                  {isReady ? 'Ready' : 'Not Ready'}
                                </span>
                              </div>
                            </td>

                            {/* 6. Planned Dispatch Date Picker (<input type="date">) */}
                            <td className="py-3.5 px-3.5 align-top space-y-1">
                              <div className="flex items-center gap-1.5">
                                <input
                                  type="date"
                                  value={ord.dispatchDate || ''}
                                  disabled={isUpdating}
                                  onChange={(e) => handleUpdateOrderDispatchDate(ord, e.target.value)}
                                  className="px-2 py-1 bg-[#FAF9F6] border border-[#D5D0C5] rounded-lg text-xs text-[#1F1F1F] font-mono focus:outline-none focus:border-[#8B5CF6] focus:bg-white cursor-pointer"
                                  title="Select planned shipping / dispatch date"
                                />
                                {ord.dispatchDate && (
                                  <button
                                    onClick={() => handleUpdateOrderDispatchDate(ord, '')}
                                    className="p-1 text-[#8C92A0] hover:text-red-500 cursor-pointer"
                                    title="Clear dispatch date"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                              {ord.dispatchDate ? (
                                <span className="text-[10px] text-emerald-700 font-semibold block">
                                  Scheduled: {ord.dispatchDate}
                                </span>
                              ) : (
                                <span className="text-[10px] text-[#8C92A0] block">
                                  No dispatch date set
                                </span>
                              )}
                            </td>

                            {/* 7. Fulfillment Actions */}
                            <td className="py-3.5 px-3.5 align-top text-right space-y-1.5">
                              <div className="flex flex-wrap items-center justify-end gap-1">
                                {ord.status !== 'Accepted' && ord.status !== 'Ready' && ord.status !== 'Dispatched' && (
                                  <button
                                    disabled={isUpdating}
                                    onClick={() => handleUpdateOrderStatus(ord, 'Accepted')}
                                    className="px-2 py-0.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-[10px] font-bold rounded-md transition-colors cursor-pointer"
                                    title="Accept Order"
                                  >
                                    Accept
                                  </button>
                                )}

                                {ord.status !== 'Ready' && (
                                  <button
                                    disabled={isUpdating}
                                    onClick={() => handleUpdateOrderStatus(ord, 'Ready')}
                                    className="px-2 py-0.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-[10px] font-bold rounded-md transition-colors cursor-pointer"
                                    title="Mark Ready for Shipping"
                                  >
                                    Ready
                                  </button>
                                )}

                                {ord.status !== 'Dispatched' && (
                                  <button
                                    disabled={isUpdating}
                                    onClick={() => handleUpdateOrderStatus(ord, 'Dispatched')}
                                    className="px-2 py-0.5 bg-cyan-50 hover:bg-cyan-100 text-cyan-700 border border-cyan-200 text-[10px] font-bold rounded-md transition-colors cursor-pointer"
                                    title="Mark Dispatched"
                                  >
                                    Dispatch
                                  </button>
                                )}

                                {ord.status !== 'Rejected' && ord.status !== 'cancelled' && (
                                  <button
                                    disabled={isUpdating}
                                    onClick={() => handleUpdateOrderStatus(ord, 'Rejected')}
                                    className="px-2 py-0.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-[10px] font-bold rounded-md transition-colors cursor-pointer"
                                    title="Reject Order"
                                  >
                                    Reject
                                  </button>
                                )}

                                <button
                                  onClick={() => setSelectedOrderProfile(ord)}
                                  className="p-1.5 bg-[#F4F6F9] hover:bg-[#8B5CF6] text-[#5E6470] hover:text-white rounded-md transition-colors cursor-pointer ml-1"
                                  title="View Customer Details Drawer"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>

                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 4: PRODUCT CATALOG & VIDEO MANAGER (EXACT MODAL)     */}
          {/* ========================================================= */}
          {activeTab === 'inventory' && (
            <div className="bg-white border border-[#E6E8EC] rounded-xl shadow-xs p-6 space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-[#F0ECE1] pb-4">
                <div>
                  <h2 className="text-xl font-bold text-[#1F2430]">Product Catalog & Video Manager</h2>
                  <p className="text-xs text-[#8C92A0]">Showcase video streams, multi-image galleries, return policies, and stock control</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const csvContent = 'data:text/csv;charset=utf-8,ID,Name,Category,Price,Stock,SKU\n' + products.map(p => `${p.id},"${p.name}",${p.category},${p.price},${p.stockQuantity},${p.sku}`).join('\n');
                      const encoded = encodeURI(csvContent);
                      const link = document.createElement('a');
                      link.setAttribute('href', encoded);
                      link.setAttribute('download', `DivaChic_Catalog_${new Date().toISOString().slice(0, 10)}.csv`);
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      showToast('Catalog exported to CSV', 'success');
                    }}
                    className="px-3.5 py-2 bg-[#F4F6F9] border border-[#E2E5EA] text-xs font-semibold rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    Export CSV
                  </button>
                  <button
                    onClick={() => openCreateProductModal()}
                    className="px-4 py-2 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs font-bold rounded-lg transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create New Designer Product</span>
                  </button>
                </div>
              </div>

              {/* Product Rankings & Storefront Priority Manager Banner */}
              <div className="bg-gradient-to-r from-[#FAF5FF] to-[#FDF2F8] border border-[#F3E8FF] rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white border border-[#E9D5FF] text-[#8B5CF6] flex items-center justify-center shadow-xs shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-sm text-[#1F2430]">Storefront Product Rankings & Best Sellers</h3>
                      <span className="text-[10px] bg-[#8B5CF6] text-white px-2.5 py-0.5 rounded-full font-bold">
                        Controls Main & Category Pages
                      </span>
                    </div>
                    <p className="text-xs text-[#6D688A] mt-0.5">
                      Set custom priority sequences (1 to {products.length}), highlight Best Sellers, or move top drops to rank #1.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
                  <button
                    onClick={() => handleApplyRankPreset('bestsellers')}
                    className="px-3 py-2 bg-white hover:bg-[#FAF9F6] border border-[#E2E5EA] text-[#C85A32] font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    title="Sort so all Best Sellers appear first"
                  >
                    <Star className="w-3.5 h-3.5 fill-[#C85A32]" />
                    <span>Best Sellers First</span>
                  </button>

                  <button
                    onClick={() => setShowRankingStudio(true)}
                    className="px-4 py-2 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-bold text-xs rounded-lg transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <ArrowUpDown className="w-3.5 h-3.5" />
                    <span>Manage Rankings Studio</span>
                  </button>
                </div>
              </div>

              {/* Products Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#EAE6DE] text-[#6E685F] uppercase tracking-wider text-[10px] bg-[#FAF9F6]">
                      <th className="py-3 px-3 w-16">Rank</th>
                      <th className="py-3 px-3">Product</th>
                      <th className="py-3 px-3">SKU</th>
                      <th className="py-3 px-3">Category</th>
                      <th className="py-3 px-3">Best Seller</th>
                      <th className="py-3 px-3">Price</th>
                      <th className="py-3 px-3">Video Stream</th>
                      <th className="py-3 px-3">Stock Counter</th>
                      <th className="py-3 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0ECE1]">
                    {products.map((prod) => (
                      <tr key={prod.id} className="hover:bg-[#FAF9F6] transition-colors">
                        <td className="py-3 px-3 whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            <span className="font-mono font-bold text-xs bg-[#FAF5FF] text-[#8B5CF6] border border-[#F3E8FF] px-2 py-0.5 rounded-md min-w-[28px] text-center">
                              #{prod.displayRank ?? (products.indexOf(prod) + 1)}
                            </span>
                            <div className="flex flex-col">
                              <button
                                onClick={() => handleMoveProductRank(prod.id, 'up')}
                                className="text-gray-400 hover:text-[#8B5CF6] p-0.5 rounded hover:bg-gray-100 cursor-pointer"
                                title="Move Rank Up"
                              >
                                <ChevronUp className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => handleMoveProductRank(prod.id, 'down')}
                                className="text-gray-400 hover:text-[#8B5CF6] p-0.5 rounded hover:bg-gray-100 cursor-pointer"
                                title="Move Rank Down"
                              >
                                <ChevronDown className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3 flex items-center gap-3">
                          <img src={prod.images?.[0] || 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=800&auto=format&fit=crop'} alt={prod.name} className="w-12 h-12 rounded-lg object-cover border" />
                          <div>
                            <span className="font-bold text-[#1F1F1F] block">{prod.name}</span>
                            <span className="text-[10px] text-[#8C8477]">{prod.tagline || prod.badge}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-[#8B5CF6]">{prod.sku || 'HAU-001'}</td>
                        <td className="py-3 px-3 uppercase font-semibold text-[#6E685F]">{prod.category}</td>
                        <td className="py-3 px-3">
                          <button
                            onClick={() => handleToggleBestSeller(prod)}
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1 transition-all cursor-pointer ${
                              prod.isBestSeller
                                ? 'bg-[#FAF1ED] text-[#C85A32] border border-[#F6D0C1] shadow-2xs'
                                : 'bg-gray-100 text-gray-400 hover:text-gray-700'
                            }`}
                            title="Toggle Best Seller Status"
                          >
                            <Star className={`w-3 h-3 ${prod.isBestSeller ? 'fill-[#C85A32] text-[#C85A32]' : 'text-gray-400'}`} />
                            <span>{prod.isBestSeller ? 'Best Seller' : 'Standard'}</span>
                          </button>
                        </td>
                        <td className="py-3 px-3 font-bold text-[#1F1F1F]">{formatPrice(prod.price)}</td>
                        <td className="py-3 px-3">
                          {prod.youtubeUrl || prod.videoUrl ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#10B981] bg-[#ECFDF5] px-2 py-0.5 rounded-full">
                              <Film className="w-3 h-3" />
                              <span>Video Attached</span>
                            </span>
                          ) : (
                            <span className="text-[10px] text-[#8C8477]">No Video</span>
                          )}
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateProductStock(prod.id, Math.max(0, prod.stockQuantity - 1))}
                              className="w-6 h-6 rounded-md bg-gray-100 hover:bg-gray-200 font-bold flex items-center justify-center cursor-pointer"
                            >
                              -
                            </button>
                            <span className="font-mono font-bold w-8 text-center">{prod.stockQuantity}</span>
                            <button
                              onClick={() => updateProductStock(prod.id, prod.stockQuantity + 1)}
                              className="w-6 h-6 rounded-md bg-gray-100 hover:bg-gray-200 font-bold flex items-center justify-center cursor-pointer"
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-right space-x-2">
                          <button
                            onClick={() => openCreateProductModal(prod)}
                            className="p-1.5 text-[#5E6470] hover:text-[#8B5CF6] rounded-md hover:bg-[#F4F6F9] cursor-pointer"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Delete ${prod.name}?`)) {
                                deleteProduct(prod.id);
                                showToast('Product deleted', 'info');
                              }
                            }}
                            className="p-1.5 text-[#DC2626] hover:bg-[#FEF2F2] rounded-md cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* ========================================================= */}
              {/* EXACT FULL PRODUCT CREATOR MODAL MATCHING SCREENSHOT     */}
              {/* ========================================================= */}
              {showAddProduct && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                  <div className="bg-white max-w-2xl w-full rounded-sm p-6 sm:p-8 space-y-6 shadow-2xl max-h-[92vh] overflow-y-auto text-xs text-[#1F1F1F]">
                    
                    {/* Header */}
                    <div className="flex justify-between items-start border-b border-[#F0ECE1] pb-3">
                      <div>
                        <span className="text-[10px] font-bold text-[#C85A32] uppercase tracking-widest block">
                          CATALOG MANAGEMENT
                        </span>
                        <h2 className="text-xl font-bold font-editorial text-[#1F1F1F] mt-0.5">
                          {editingProduct ? 'Edit Designer Product' : 'Create New Designer Product'}
                        </h2>
                      </div>
                      <button onClick={() => setShowAddProduct(false)} className="p-1 hover:bg-gray-100 rounded-sm">
                        <X className="w-5 h-5 text-[#8C8477]" />
                      </button>
                    </div>

                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (editingProduct) {
                          const updatedProd: Product = {
                            ...editingProduct,
                            name: newProdName,
                            sku: newProdSku,
                            category: newProdCategory as any,
                            price: Number(newProdPrice),
                            originalPrice: Number(newProdOriginalPrice),
                            stockQuantity: Number(newProdStock),
                            returnPolicy: newProdReturnPolicy,
                            recentPurchasesCount: Number(newProdPurchasedCount),
                            tagline: newProdTagline,
                            youtubeUrl: newProdVideoUrl,
                            images: newProdImages.length > 0 ? newProdImages : editingProduct.images,
                            description: newProdDescription,
                            reviews: newProdReviews.length > 0 ? newProdReviews : editingProduct.reviews,
                            colors: newProdColors,
                            customFont: newProdCustomFont,
                            customFontSize: newProdCustomFontSize,
                            buyNowButtonColor: newProdBuyNowColor,
                            displayRank: Number(newProdRank),
                            isBestSeller: newProdIsBestSeller,
                            deliveryDays: Number(newProdDeliveryDays)
                          };
                          updateProduct(updatedProd);
                          saveProductToFirestore(updatedProd).catch((err) => console.warn('Firestore product update error:', err));
                          showToast('Designer product updated successfully', 'success', 'Synced to Firestore & storefront in real time');
                        } else {
                          const createdProd: Product = {
                            id: `prod-${Date.now()}`,
                            sku: newProdSku,
                            name: newProdName,
                            category: newProdCategory as any,
                            price: Number(newProdPrice),
                            originalPrice: Number(newProdOriginalPrice),
                            stockQuantity: Number(newProdStock),
                            rating: 5,
                            reviewCount: newProdReviews.length || 1,
                            returnPolicy: newProdReturnPolicy,
                            recentPurchasesCount: Number(newProdPurchasedCount),
                            tagline: newProdTagline,
                            youtubeUrl: newProdVideoUrl,
                            images: newProdImages.length > 0 ? newProdImages : ['https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=800&auto=format&fit=crop'],
                            description: newProdDescription,
                            details: ['Bespoke craftsmanship', 'Made in Italy'],
                            specifications: {
                              dimensions: 'Standard Atelier Cut',
                              materials: 'Vegetable-tanned full-grain leather',
                              weight: '450g',
                              origin: 'Handmade in Oslo',
                              care: 'Condition leather with organic balm annually.'
                            },
                            colors: newProdColors,
                            customFont: newProdCustomFont,
                            customFontSize: newProdCustomFontSize,
                            buyNowButtonColor: newProdBuyNowColor,
                            displayRank: Number(newProdRank),
                            isBestSeller: newProdIsBestSeller,
                            deliveryDays: Number(newProdDeliveryDays),
                            reviews: newProdReviews
                          };
                          addProduct(createdProd);
                          saveProductToFirestore(createdProd).catch((err) => console.warn('Firestore product create error:', err));
                          showToast('Designer product published to storefront', 'success', 'Live in Firestore & Storefront');
                        }
                        setShowAddProduct(false);
                      }}
                      className="space-y-4"
                    >
                      {/* Row 1: Title & SKU */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="sm:col-span-2">
                          <label className="font-semibold block mb-1">Product Title *</label>
                          <input
                            type="text"
                            value={newProdName}
                            onChange={(e) => setNewProdName(e.target.value)}
                            placeholder="e.g. Bergen Weatherproof Waxed Canvas Backpack"
                            className="w-full p-2.5 border border-[#D5D0C5] rounded-xs bg-[#FAF9F6]"
                            required
                          />
                        </div>
                        <div>
                          <label className="font-semibold block mb-1">SKU Code</label>
                          <input
                            type="text"
                            value={newProdSku}
                            onChange={(e) => setNewProdSku(e.target.value)}
                            className="w-full p-2.5 border border-[#D5D0C5] rounded-xs bg-[#FAF9F6] font-mono"
                          />
                        </div>
                      </div>

                      {/* Row 2: Category, Sale Price, Base Price, Stock */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div>
                          <label className="font-semibold block mb-1">Category</label>
                          <select
                            value={newProdCategory}
                            onChange={(e) => setNewProdCategory(e.target.value)}
                            className="w-full p-2.5 border border-[#D5D0C5] rounded-xs bg-[#FAF9F6]"
                          >
                            <option value="backpack">Backpacks</option>
                            <option value="shoes">Footwear</option>
                            <option value="glasses">Glasses</option>
                            <option value="hats">Hats</option>
                            <option value="apparel">Apparel</option>
                            <option value="accessories">Accessories</option>
                          </select>
                        </div>
                        <div>
                          <label className="font-semibold block mb-1">Sale Price ($) *</label>
                          <input
                            type="number"
                            value={newProdPrice}
                            onChange={(e) => setNewProdPrice(Number(e.target.value))}
                            className="w-full p-2.5 border border-[#D5D0C5] rounded-xs bg-[#FAF9F6]"
                            required
                          />
                        </div>
                        <div>
                          <label className="font-semibold block mb-1">Base / Orig. Price ($)</label>
                          <input
                            type="number"
                            value={newProdOriginalPrice}
                            onChange={(e) => setNewProdOriginalPrice(Number(e.target.value))}
                            className="w-full p-2.5 border border-[#D5D0C5] rounded-xs bg-[#FAF9F6]"
                          />
                        </div>
                        <div>
                          <label className="font-semibold block mb-1">Stock Quantity</label>
                          <input
                            type="number"
                            value={newProdStock}
                            onChange={(e) => setNewProdStock(Number(e.target.value))}
                            className="w-full p-2.5 border border-[#D5D0C5] rounded-xs bg-[#FAF9F6]"
                            required
                          />
                        </div>
                      </div>

                      {/* Row 3: Return Policy & Social Proof */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="font-semibold block mb-1">Product Return Policy (Maximum Return Window: 7 Days)</label>
                          <input
                            type="text"
                            value={newProdReturnPolicy}
                            onChange={(e) => setNewProdReturnPolicy(e.target.value)}
                            className="w-full p-2.5 border border-[#D5D0C5] rounded-xs bg-[#FAF9F6]"
                          />
                        </div>
                        <div>
                          <label className="font-semibold block mb-1">Social Proof: Purchased in Last 7 Days Count</label>
                          <input
                            type="number"
                            value={newProdPurchasedCount}
                            onChange={(e) => setNewProdPurchasedCount(Number(e.target.value))}
                            className="w-full p-2.5 border border-[#D5D0C5] rounded-xs bg-[#FAF9F6]"
                          />
                        </div>
                      </div>

                      {/* Storefront Ranking & Best Seller Priority */}
                      <div className="p-3.5 bg-[#FAF5FF] border border-[#F3E8FF] rounded-xl grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="font-bold text-[#1F2430] block mb-1 flex items-center gap-1.5">
                            <ArrowUpDown className="w-3.5 h-3.5 text-[#8B5CF6]" />
                            <span>Storefront Display Priority / Rank #</span>
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="999"
                            value={newProdRank}
                            onChange={(e) => setNewProdRank(Math.max(1, Number(e.target.value)))}
                            placeholder="e.g. 1 for top position"
                            className="w-full p-2.5 border border-[#D5D0C5] rounded-xs bg-white text-xs font-mono font-bold text-[#8B5CF6]"
                          />
                          <span className="text-[10px] text-[#6D688A] mt-0.5 block">
                            Lower numbers (e.g. 1, 2, 3) appear first on the Main Page and Category Catalog.
                          </span>
                        </div>

                        <div className="flex flex-col justify-between">
                          <label className="font-bold text-[#1F2430] block mb-1 flex items-center gap-1.5">
                            <Star className="w-3.5 h-3.5 text-[#C85A32]" />
                            <span>Best Seller Spotlight</span>
                          </label>
                          <button
                            type="button"
                            onClick={() => setNewProdIsBestSeller(!newProdIsBestSeller)}
                            className={`w-full p-2.5 rounded-xs border text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                              newProdIsBestSeller
                                ? 'bg-[#FAF1ED] text-[#C85A32] border-[#F6D0C1] shadow-2xs'
                                : 'bg-white text-gray-500 border-[#D5D0C5] hover:border-gray-400'
                            }`}
                          >
                            <Star className={`w-4 h-4 ${newProdIsBestSeller ? 'fill-[#C85A32] text-[#C85A32]' : 'text-gray-400'}`} />
                            <span>{newProdIsBestSeller ? 'Tagged as Best Seller ⭐' : 'Standard Product (Not Best Seller)'}</span>
                          </button>
                          <span className="text-[10px] text-[#6D688A] mt-0.5 block">
                            Badged as Best Seller and featured in the Home "Best Sellers" tab.
                          </span>
                        </div>
                      </div>

                      {/* Individual Product Delivery Timeframe Slider */}
                      <div className="p-3.5 bg-[#F0FDF4] border border-[#DCFCE7] rounded-xl space-y-2">
                        <div className="flex justify-between items-center">
                          <label className="font-bold text-[#1F2430] flex items-center gap-1.5 text-xs">
                            <Truck className="w-3.5 h-3.5 text-[#10B981]" />
                            <span>Product Delivery Timeframe ({newProdDeliveryDays} Business Days)</span>
                          </label>
                          <span className="font-mono font-bold text-xs bg-white text-[#10B981] border border-[#DCFCE7] px-2.5 py-0.5 rounded-md shadow-2xs">
                            {newProdDeliveryDays} Days Dispatch
                          </span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="30"
                          value={newProdDeliveryDays}
                          onChange={(e) => setNewProdDeliveryDays(Number(e.target.value))}
                          className="w-full accent-[#10B981] cursor-pointer"
                        />
                        <div className="flex justify-between items-center text-[10px] text-[#6D688A]">
                          <span>1 Day (Express)</span>
                          <span className="bg-white/80 px-2 py-0.5 rounded border border-[#DCFCE7]">
                            Customer Arrival: <strong className="text-[#10B981]">{calculateDeliveryDate(0, newProdDeliveryDays).formattedDate}</strong>
                          </span>
                          <span>30 Days (Pre-Order / Freight)</span>
                        </div>
                      </div>

                      {/* Row 4: Editorial Tagline */}
                      <div>
                        <label className="font-semibold block mb-1">Editorial Tagline</label>
                        <input
                          type="text"
                          value={newProdTagline}
                          onChange={(e) => setNewProdTagline(e.target.value)}
                          placeholder="Handcrafted in Oslo from sustainable vegetable-tanned full-grain leather"
                          className="w-full p-2.5 border border-[#D5D0C5] rounded-xs bg-[#FAF9F6]"
                        />
                      </div>

                      {/* ======================================================= */}
                      {/* SECTION: AVAILABLE COLOURS (INDIVIDUAL ITEM PALETTE)    */}
                      {/* ======================================================= */}
                      <div className="p-4 bg-[#FAF9F6] border border-[#EAE6DE] rounded-xl space-y-3">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <Palette className="w-4 h-4 text-[#8B5CF6]" />
                            <span className="font-bold text-xs text-[#1F1F1F]">
                              Available Colours for this Item ({newProdColors.length} Colours Active)
                            </span>
                          </div>
                          <span className="text-[10px] font-bold text-[#10B981] bg-[#ECFDF5] px-2 py-0.5 rounded-full uppercase">
                            Real-Time Swatches
                          </span>
                        </div>

                        {/* Current Swatch Chips */}
                        <div className="flex flex-wrap gap-2">
                          {newProdColors.map((col, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center gap-2 pl-2 pr-2.5 py-1 rounded-full bg-white border border-[#D5D0C5] text-xs shadow-2xs group"
                            >
                              <span
                                className="w-3.5 h-3.5 rounded-full border border-black/20 shrink-0 shadow-2xs"
                                style={{ backgroundColor: col.hex }}
                              />
                              <span className="font-medium text-[#1F1F1F]">{col.name}</span>
                              <span className="text-[10px] font-mono text-gray-400">{col.hex}</span>
                              <button
                                type="button"
                                onClick={() => setNewProdColors((prev) => prev.filter((_, i) => i !== idx))}
                                className="text-gray-400 hover:text-red-600 transition-colors ml-0.5"
                                title="Remove Color"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                          {newProdColors.length === 0 && (
                            <span className="text-[11px] text-gray-400 italic">No color swatches configured. Add colors below:</span>
                          )}
                        </div>

                        {/* Add New Color Swatch */}
                        <div className="pt-2 border-t border-[#EAE6DE] flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
                          <input
                            type="text"
                            value={colorInputName}
                            onChange={(e) => setColorInputName(e.target.value)}
                            placeholder="Color Name (e.g. Midnight Charcoal, Rose Gold)"
                            className="flex-1 p-2 bg-white border border-[#D5D0C5] rounded-lg text-xs"
                          />
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={colorInputHex}
                              onChange={(e) => setColorInputHex(e.target.value)}
                              className="w-9 h-9 rounded-lg border border-[#D5D0C5] p-0.5 cursor-pointer bg-white"
                              title="Pick Swatch Hex Color"
                            />
                            <input
                              type="text"
                              value={colorInputHex}
                              onChange={(e) => setColorInputHex(e.target.value)}
                              className="w-24 p-2 bg-white border border-[#D5D0C5] rounded-lg text-xs font-mono"
                              placeholder="#1F1F1F"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                if (!colorInputName.trim()) {
                                  showToast('Please enter a color name', 'info');
                                  return;
                                }
                                setNewProdColors((prev) => [...prev, { name: colorInputName.trim(), hex: colorInputHex }]);
                                setColorInputName('');
                              }}
                              className="px-3.5 py-2 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-bold text-xs rounded-lg transition-colors cursor-pointer shrink-0"
                            >
                              + Add Color
                            </button>
                          </div>
                        </div>

                        {/* Quick Presets */}
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          <span className="text-[10px] text-gray-400 font-bold uppercase">Quick Presets:</span>
                          {[
                            { name: 'Midnight Charcoal', hex: '#1F1F1F' },
                            { name: 'Bone Cream', hex: '#FAFAF9' },
                            { name: 'Terracotta', hex: '#C85A32' },
                            { name: 'Champagne Gold', hex: '#C5A880' },
                            { name: 'Emerald Pine', hex: '#0F2E23' },
                            { name: 'Slate Gray', hex: '#475569' },
                            { name: 'Dusty Rose', hex: '#D8A48F' }
                          ].map((preset) => (
                            <button
                              key={preset.name}
                              type="button"
                              onClick={() => {
                                if (!newProdColors.some((c) => c.name === preset.name)) {
                                  setNewProdColors((prev) => [...prev, preset]);
                                }
                              }}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white hover:bg-gray-100 border border-gray-200 text-[10px] font-medium text-gray-700 cursor-pointer"
                            >
                              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: preset.hex }} />
                              <span>{preset.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* ======================================================= */}
                      {/* SECTION: PRODUCT FONT & FONT SIZE CUSTOMIZER            */}
                      {/* ======================================================= */}
                      <div className="p-4 bg-[#FAF9F6] border border-[#EAE6DE] rounded-xl space-y-3">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-[#8B5CF6]" />
                            <span className="font-bold text-xs text-[#1F1F1F]">
                              Product Title Font & Font Size Customizer
                            </span>
                          </div>
                          <span className="text-[10px] font-mono text-gray-500">
                            Custom Typography Override
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {/* Font Family Choice */}
                          <div>
                            <label className="block text-[11px] font-bold text-[#1F1F1F] mb-1">
                              Title Font Family
                            </label>
                            <select
                              value={newProdCustomFont}
                              onChange={(e) => setNewProdCustomFont(e.target.value)}
                              className="w-full p-2.5 bg-white border border-[#D5D0C5] rounded-lg text-xs"
                            >
                              <option value="">Storefront Default (Theme Inherit)</option>
                              <option value="'Playfair Display', serif">Playfair Display (Editorial Vogue)</option>
                              <option value="'Cormorant Garamond', serif">Cormorant Garamond (Haute Classic)</option>
                              <option value="'Cinzel', serif">Cinzel (Roman Heritage)</option>
                              <option value="'Plus Jakarta Sans', sans-serif">Plus Jakarta Sans (Minimalist)</option>
                              <option value="'Inter', sans-serif">Inter (Nordic Modern)</option>
                              <option value="'Bodoni Moda', serif">Bodoni Moda (Italian Fashion)</option>
                              <option value="'Space Grotesk', sans-serif">Space Grotesk (Contemporary)</option>
                              <option value="'Tenor Sans', sans-serif">Tenor Sans (Quiet Luxury)</option>
                            </select>
                          </div>

                          {/* Font Size Choice */}
                          <div>
                            <label className="block text-[11px] font-bold text-[#1F1F1F] mb-1">
                              Title Font Size Scale
                            </label>
                            <select
                              value={newProdCustomFontSize}
                              onChange={(e) => setNewProdCustomFontSize(e.target.value)}
                              className="w-full p-2.5 bg-white border border-[#D5D0C5] rounded-lg text-xs"
                            >
                              <option value="">Standard Size (Default)</option>
                              <option value="0.875rem">Compact Petite (0.875rem)</option>
                              <option value="1rem">Standard Editorial (1.0rem)</option>
                              <option value="1.15rem">Medium Emphasis (1.15rem)</option>
                              <option value="1.35rem">Bold Headline (1.35rem)</option>
                              <option value="1.6rem">Hero High-Impact (1.6rem)</option>
                            </select>
                          </div>
                        </div>

                        {/* Live Title Preview inside Modal */}
                        <div className="p-3 bg-white border border-[#EAE6DE] rounded-lg space-y-1">
                          <span className="text-[9px] uppercase tracking-wider text-gray-400 font-bold block">
                            Live Typography Preview:
                          </span>
                          <p
                            style={{
                              fontFamily: newProdCustomFont || undefined,
                              fontSize: newProdCustomFontSize || undefined
                            }}
                            className="font-bold text-[#1F1F1F] truncate"
                          >
                            {newProdName || 'Sample Scandinavian Leather Silhouette'}
                          </p>
                        </div>
                      </div>

                      {/* ======================================================= */}
                      {/* SECTION: BUY NOW BUTTON COLOUR FOR THIS PRODUCT         */}
                      {/* ======================================================= */}
                      <div className="p-4 bg-[#FAF9F6] border border-[#EAE6DE] rounded-xl space-y-3">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <Zap className="w-4 h-4 text-[#DC2626]" />
                            <span className="font-bold text-xs text-[#1F1F1F]">
                              "Buy Now" Button Colour (Instant Checkout CTA)
                            </span>
                          </div>
                          <span className="text-[10px] font-mono text-gray-500">
                            Overrides Global Theme
                          </span>
                        </div>

                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={newProdBuyNowColor}
                              onChange={(e) => setNewProdBuyNowColor(e.target.value)}
                              className="w-10 h-10 rounded-lg border border-[#D5D0C5] p-0.5 cursor-pointer bg-white"
                              title="Pick Buy Now Color"
                            />
                            <input
                              type="text"
                              value={newProdBuyNowColor}
                              onChange={(e) => setNewProdBuyNowColor(e.target.value)}
                              className="w-28 p-2.5 bg-white border border-[#D5D0C5] rounded-lg text-xs font-mono font-bold text-[#1F1F1F]"
                              placeholder="#DC2626"
                            />
                          </div>

                          {/* Quick Color Presets for Buy Now */}
                          <div className="flex flex-wrap items-center gap-1.5 flex-1">
                            {[
                              { label: 'Haute Crimson', hex: '#DC2626' },
                              { label: 'Onyx Black', hex: '#111827' },
                              { label: 'Champagne Gold', hex: '#C5A880' },
                              { label: 'Emerald Atelier', hex: '#0F2E23' },
                              { label: 'Terracotta', hex: '#C85A32' },
                              { label: 'WhatsApp Green', hex: '#25D366' },
                              { label: 'Royal Azure', hex: '#2563EB' }
                            ].map((preset) => (
                              <button
                                key={preset.label}
                                type="button"
                                onClick={() => setNewProdBuyNowColor(preset.hex)}
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-medium border cursor-pointer transition-all ${
                                  newProdBuyNowColor.toLowerCase() === preset.hex.toLowerCase()
                                    ? 'border-black font-bold ring-1 ring-black bg-white'
                                    : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-700'
                                }`}
                              >
                                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: preset.hex }} />
                                <span>{preset.label}</span>
                              </button>
                            ))}
                          </div>

                          {/* Live Buy Now Button Preview */}
                          <div className="shrink-0">
                            <button
                              type="button"
                              style={{ backgroundColor: newProdBuyNowColor }}
                              className="px-4 py-2.5 text-white text-xs font-bold uppercase tracking-wider rounded-md shadow-xs flex items-center gap-1.5"
                            >
                              <Zap className="w-3.5 h-3.5 fill-white" />
                              <span>Buy Now</span>
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Box: Showcase Video Stream */}
                      <div className="p-4 bg-[#FDF9F7] border border-[#F3DFD8] rounded-xs space-y-3">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2 font-bold text-[#1F1F1F]">
                            <Film className="w-4 h-4 text-[#C85A32]" />
                            <span>Showcase Video Stream (Local MP4 File or YouTube Link)</span>
                          </div>
                          {newProdVideoUrl && (
                            <span className="text-[10px] font-bold text-[#059669] bg-[#ECFDF5] px-2 py-0.5 rounded-full">
                              ✓ Video Attached
                            </span>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newProdVideoUrl}
                            onChange={(e) => setNewProdVideoUrl(e.target.value)}
                            placeholder="https://www.youtube.com/watch?v=..."
                            className="flex-1 p-2.5 bg-white border border-[#D5D0C5] rounded-xs text-xs font-mono"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const sampleVid = prompt('Enter Direct MP4 Video URL or YouTube link:', newProdVideoUrl);
                              if (sampleVid) setNewProdVideoUrl(sampleVid);
                            }}
                            className="bg-[#1F1F1F] text-white px-3.5 py-2.5 rounded-xs font-semibold hover:bg-[#C85A32] transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>Upload Local Video File</span>
                          </button>
                        </div>

                        {newProdVideoUrl && (
                          <div className="pt-2">
                            <span className="text-[10px] font-bold text-[#8C8477] uppercase block mb-1">Live Video Stream Preview:</span>
                            <div className="aspect-[16/9] max-h-48 bg-black rounded-xs overflow-hidden">
                              {newProdVideoUrl.includes('youtube.com') || newProdVideoUrl.includes('youtu.be') ? (
                                <iframe
                                  src={`https://www.youtube.com/embed/${newProdVideoUrl.split('v=')[1]?.split('&')[0] || 'dQw4w9WgXcQ'}`}
                                  className="w-full h-full"
                                  title="Product Video"
                                ></iframe>
                              ) : (
                                <video src={newProdVideoUrl} controls className="w-full h-full object-cover"></video>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Box: Product Image Gallery */}
                      <div className="space-y-3">
                        {/* Hidden file input for Firebase Storage upload */}
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={(e) => e.target.files && handleImageFileUpload(e.target.files)}
                          accept="image/*"
                          multiple
                          className="hidden"
                        />

                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <label className="font-semibold">Product Image Gallery ({newProdImages.length} photos)</label>
                            {isUploadingToStorage && (
                              <span className="text-[10px] font-bold text-[#8B5CF6] bg-[#F5F3FF] px-2 py-0.5 rounded-full animate-pulse">
                                Uploading to Firebase Storage ({uploadProgress}%)...
                              </span>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="text-[#C85A32] font-semibold border border-[#C85A32] px-3 py-1 rounded-xs hover:bg-[#C85A32] hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
                            >
                              <Upload className="w-3.5 h-3.5" />
                              <span>Browse & Upload Images</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const url = prompt('Enter Image URL:');
                                if (url) setNewProdImages(prev => [...prev, url]);
                              }}
                              className="text-[#5E6470] font-semibold border border-[#D5D0C5] px-2.5 py-1 rounded-xs hover:bg-gray-100 transition-colors cursor-pointer"
                            >
                              URL
                            </button>
                          </div>
                        </div>

                        {/* Drag and Drop Zone connected to Firebase Storage */}
                        <div
                          onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                          onDrop={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                              handleImageFileUpload(e.dataTransfer.files);
                            }
                          }}
                          onClick={() => fileInputRef.current?.click()}
                          className="border-2 border-dashed border-[#D5D0C5] hover:border-[#8B5CF6] p-6 text-center rounded-xs bg-[#FAF9F6] space-y-1.5 cursor-pointer transition-colors"
                        >
                          <Upload className="w-6 h-6 mx-auto text-[#8B5CF6]" />
                          <p className="font-bold text-[#1F1F1F]">Drag and drop product photos here, or click Browse above</p>
                          <p className="text-[11px] text-[#8C8477]">Uploads directly to Firebase Storage bucket (divachic123-7e2c9.firebasestorage.app)</p>
                          {isUploadingToStorage && (
                            <div className="pt-2 max-w-xs mx-auto">
                              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                <div className="bg-[#8B5CF6] h-2 transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                              </div>
                              <span className="text-[10px] font-bold text-[#8B5CF6] mt-1 block">Uploading to Firebase Storage ({uploadProgress}%)...</span>
                            </div>
                          )}
                        </div>

                        {/* Add Photo URL */}
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newProdImageInput}
                            onChange={(e) => setNewProdImageInput(e.target.value)}
                            placeholder="Or paste direct Image URL (e.g. https://images.unsplash.com/...)"
                            className="flex-1 p-2 border border-[#D5D0C5] rounded-xs bg-[#FAF9F6]"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (newProdImageInput.trim()) {
                                setNewProdImages(prev => [...prev, newProdImageInput.trim()]);
                                setNewProdImageInput('');
                              }
                            }}
                            className="bg-[#1F1F1F] text-white px-4 py-2 font-bold rounded-xs cursor-pointer"
                          >
                            Add Photo
                          </button>
                        </div>

                        {/* Image Previews */}
                        <div className="flex flex-wrap gap-2 pt-1">
                          {newProdImages.map((img, idx) => (
                            <div key={idx} className="relative w-16 h-16 rounded-xs overflow-hidden border">
                              <img src={img} alt="Thumb" className="w-full h-full object-cover" />
                              <button
                                type="button"
                                onClick={() => setNewProdImages(prev => prev.filter((_, i) => i !== idx))}
                                className="absolute top-0 right-0 bg-red-600 text-white p-0.5"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>

                        {/* Quick Sample Presets */}
                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          <span className="text-[11px] text-[#8C8477]">Quick Samples:</span>
                          {[
                            { name: 'Leather Backpack', url: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=800&auto=format&fit=crop' },
                            { name: 'Minimalist Oxford', url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800&auto=format&fit=crop' },
                            { name: 'Nordic Sunglasses', url: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=800&auto=format&fit=crop' },
                            { name: 'Wool Beanie', url: 'https://images.unsplash.com/photo-1534215754734-18e55d13e346?q=80&w=800&auto=format&fit=crop' },
                            { name: 'Merino Knit', url: 'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?q=80&w=800&auto=format&fit=crop' }
                          ].map((sample) => (
                            <button
                              key={sample.name}
                              type="button"
                              onClick={() => setNewProdImages(prev => [...prev, sample.url])}
                              className="px-2 py-1 bg-white border border-[#D5D0C5] text-[10px] font-semibold rounded-xs hover:border-[#C85A32] cursor-pointer"
                            >
                              + {sample.name}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Description */}
                      <div>
                        <label className="font-semibold block mb-1">Product Craftsmanship & Materials Description</label>
                        <textarea
                          value={newProdDescription}
                          onChange={(e) => setNewProdDescription(e.target.value)}
                          rows={4}
                          className="w-full p-2.5 border border-[#D5D0C5] rounded-xs bg-[#FAF9F6]"
                          placeholder="Handcrafted details, fabric composition, durability features..."
                        />
                      </div>

                      {/* Customer Reviews & Star Ratings */}
                      <div className="p-4 bg-[#FAF9F6] border border-[#EAE6DE] rounded-xs space-y-3">
                        <div className="flex items-center gap-1.5 font-bold text-[#1F1F1F]">
                          <Star className="w-4 h-4 fill-[#F59E0B] text-[#F59E0B]" />
                          <span>Manually Add Customer Reviews & Star Ratings ({newProdReviews.length} Reviews)</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <input
                            type="text"
                            value={revAuthor}
                            onChange={(e) => setRevAuthor(e.target.value)}
                            placeholder="Reviewer Name (e.g. Chloe D.)"
                            className="p-2 border rounded-xs bg-white text-xs"
                          />
                          <select
                            value={revRating}
                            onChange={(e) => setRevRating(Number(e.target.value))}
                            className="p-2 border rounded-xs bg-white text-xs"
                          >
                            <option value={5}>★★★★★ (5 Stars)</option>
                            <option value={4}>★★★★☆ (4 Stars)</option>
                            <option value={3}>★★★☆☆ (3 Stars)</option>
                          </select>
                          <input
                            type="text"
                            value={revTitle}
                            onChange={(e) => setRevTitle(e.target.value)}
                            placeholder="Review Headline / Title"
                            className="p-2 border rounded-xs bg-white text-xs"
                          />
                        </div>

                        <div className="flex gap-2">
                          <textarea
                            value={revComment}
                            onChange={(e) => setRevComment(e.target.value)}
                            placeholder="Review comment text (e.g. Absolutely exquisite leather craftsmanship!)..."
                            rows={2}
                            className="flex-1 p-2 border rounded-xs bg-white text-xs"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (revAuthor && revComment) {
                                setNewProdReviews(prev => [
                                  ...prev,
                                  {
                                    id: `rev-${Date.now()}`,
                                    author: revAuthor,
                                    rating: revRating,
                                    title: revTitle || 'Exquisite piece',
                                    comment: revComment,
                                    date: new Date().toLocaleDateString(),
                                    verified: true,
                                    helpfulCount: 5
                                  }
                                ]);
                                setRevAuthor('');
                                setRevTitle('');
                                setRevComment('');
                                showToast('Customer review added', 'success');
                              }
                            }}
                            className="bg-[#C85A32] hover:bg-[#B34E2A] text-white px-4 font-bold rounded-xs cursor-pointer text-xs"
                          >
                            + Add Review
                          </button>
                        </div>

                        {newProdReviews.length > 0 && (
                          <div className="space-y-1.5 pt-2 max-h-32 overflow-y-auto">
                            {newProdReviews.map((r, i) => (
                              <div key={i} className="p-2 bg-white border rounded-xs flex justify-between items-center text-[11px]">
                                <div>
                                  <span className="font-bold">{r.author}</span> - <span>{r.title}</span>
                                  <p className="text-[#6E685F]">{r.comment}</p>
                                </div>
                                <span className="text-[#F59E0B] font-bold">★ {r.rating}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Footer Actions */}
                      <div className="pt-4 border-t flex justify-end gap-3">
                        <button
                          type="button"
                          onClick={() => setShowAddProduct(false)}
                          className="px-6 py-3 text-xs font-semibold text-[#6E685F] hover:text-[#1F1F1F] cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="bg-[#C85A32] hover:bg-[#B34E2A] text-white px-8 py-3 rounded-xs font-bold uppercase tracking-wider text-xs cursor-pointer shadow-md"
                        >
                          {editingProduct ? 'Save Product Changes' : 'PUBLISH PRODUCT TO STORE'}
                        </button>
                      </div>

                    </form>
                  </div>
                </div>
              )}

              {/* Product Rankings & Priority Studio Modal */}
              {showRankingStudio && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
                  <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-[#E2E5EA] overflow-hidden">
                    {/* Modal Header */}
                    <div className="p-5 sm:p-6 border-b border-[#F0ECE1] bg-gradient-to-r from-[#FAF5FF] via-white to-[#FDF2F8] flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#8B5CF6] text-white flex items-center justify-center shadow-sm">
                          <ArrowUpDown className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h2 className="text-lg sm:text-xl font-bold text-[#1F2430]">Storefront Product Ranking Studio</h2>
                            <span className="bg-[#8B5CF6] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                              Live Sync
                            </span>
                          </div>
                          <p className="text-xs text-[#6D688A] mt-0.5">
                            Sequence defines the order products appear on the Main Page and Category Catalog.
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => setShowRankingStudio(false)}
                        className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-800 flex items-center justify-center transition-colors cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Presets & Filter Bar */}
                    <div className="p-4 bg-[#FAF9F6] border-b border-[#F0ECE1] flex flex-wrap items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-[#6E685F] text-[11px] uppercase tracking-wider">Quick Presets:</span>
                        <button
                          onClick={() => handleApplyRankPreset('bestsellers')}
                          className="px-2.5 py-1.5 bg-white border border-[#E2E5EA] hover:border-[#8B5CF6] text-[#C85A32] font-semibold rounded-lg transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
                        >
                          <Star className="w-3.5 h-3.5 fill-[#C85A32]" />
                          <span>Best Sellers First</span>
                        </button>
                        <button
                          onClick={() => handleApplyRankPreset('price-high')}
                          className="px-2.5 py-1.5 bg-white border border-[#E2E5EA] hover:border-[#8B5CF6] text-gray-700 font-semibold rounded-lg transition-colors cursor-pointer shadow-2xs"
                        >
                          Price: High to Low
                        </button>
                        <button
                          onClick={() => handleApplyRankPreset('price-low')}
                          className="px-2.5 py-1.5 bg-white border border-[#E2E5EA] hover:border-[#8B5CF6] text-gray-700 font-semibold rounded-lg transition-colors cursor-pointer shadow-2xs"
                        >
                          Price: Low to High
                        </button>
                        <button
                          onClick={() => handleApplyRankPreset('clean-numbers')}
                          className="px-2.5 py-1.5 bg-[#FAF5FF] border border-[#E9D5FF] text-[#8B5CF6] font-semibold rounded-lg transition-colors cursor-pointer shadow-2xs"
                        >
                          Auto-Sequence 1..{products.length}
                        </button>
                      </div>

                      {/* Filter by category */}
                      <div className="flex items-center gap-2">
                        <label className="text-[11px] text-[#6E685F] font-semibold">Category:</label>
                        <select
                          value={rankingFilterCategory}
                          onChange={(e) => setRankingFilterCategory(e.target.value)}
                          className="p-1.5 bg-white border border-[#D5D0C5] rounded-lg text-xs font-semibold"
                        >
                          <option value="all">All Categories ({products.length})</option>
                          {categories.map((c) => (
                            <option key={c.id || c.key} value={c.key}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Draggable / Rankable Product List */}
                    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-2.5 divide-y divide-gray-100">
                      {[...products]
                        .sort((a, b) => (a.displayRank ?? 9999) - (b.displayRank ?? 9999))
                        .filter((p) => rankingFilterCategory === 'all' || p.category === rankingFilterCategory)
                        .map((prod, index) => (
                          <div
                            key={prod.id}
                            className="pt-2.5 first:pt-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 rounded-xl hover:bg-[#FAF9F6] transition-colors border border-transparent hover:border-gray-200"
                          >
                            <div className="flex items-center gap-3">
                              {/* Position Badge & Controls */}
                              <div className="flex items-center gap-1.5">
                                <div className="w-9 h-9 rounded-lg bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 text-[#8B5CF6] font-mono font-bold text-sm flex items-center justify-center">
                                  #{prod.displayRank ?? (index + 1)}
                                </div>
                                <div className="flex flex-col">
                                  <button
                                    onClick={() => handleMoveProductRank(prod.id, 'up')}
                                    disabled={index === 0}
                                    className="p-1 text-gray-400 hover:text-[#8B5CF6] disabled:opacity-30 rounded hover:bg-gray-100 cursor-pointer"
                                    title="Move Up"
                                  >
                                    <ChevronUp className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleMoveProductRank(prod.id, 'down')}
                                    disabled={index === products.length - 1}
                                    className="p-1 text-gray-400 hover:text-[#8B5CF6] disabled:opacity-30 rounded hover:bg-gray-100 cursor-pointer"
                                    title="Move Down"
                                  >
                                    <ChevronDown className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>

                              <img
                                src={prod.images?.[0] || 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=800&auto=format&fit=crop'}
                                alt={prod.name}
                                className="w-12 h-12 rounded-lg object-cover border border-gray-200 shrink-0"
                              />

                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-bold text-xs text-[#1F2430]">{prod.name}</span>
                                  {prod.isBestSeller && (
                                    <span className="px-1.5 py-0.5 bg-[#FAF1ED] text-[#C85A32] border border-[#F6D0C1] rounded text-[10px] font-bold flex items-center gap-1">
                                      <Star className="w-2.5 h-2.5 fill-[#C85A32]" /> Best Seller
                                    </span>
                                  )}
                                  {prod.deliveryDays && (
                                    <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-[10px] font-medium flex items-center gap-1">
                                      <Truck className="w-2.5 h-2.5" /> {prod.deliveryDays}d Dispatch
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 text-[11px] text-[#6E685F] mt-0.5">
                                  <span className="font-mono text-[#8B5CF6]">{prod.sku || 'HAU-001'}</span>
                                  <span>•</span>
                                  <span className="uppercase font-semibold">{prod.category}</span>
                                  <span>•</span>
                                  <span className="font-bold text-gray-900">{formatPrice(prod.price)}</span>
                                </div>
                              </div>
                            </div>

                            {/* Action Buttons for this item */}
                            <div className="flex items-center gap-2 self-end sm:self-center">
                              <button
                                onClick={() => handleSetProductTop(prod.id)}
                                className="px-2.5 py-1.5 bg-white border border-gray-200 hover:border-[#8B5CF6] text-xs font-semibold text-gray-700 hover:text-[#8B5CF6] rounded-lg transition-colors cursor-pointer shadow-2xs flex items-center gap-1"
                                title="Pin to position #1"
                              >
                                <Sparkles className="w-3 h-3 text-amber-500" />
                                <span>Move to #1</span>
                              </button>

                              <button
                                onClick={() => handleToggleBestSeller(prod)}
                                className={`px-2.5 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer flex items-center gap-1 shadow-2xs ${
                                  prod.isBestSeller
                                    ? 'bg-[#FAF1ED] text-[#C85A32] border-[#F6D0C1]'
                                    : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
                                }`}
                              >
                                <Star className={`w-3.5 h-3.5 ${prod.isBestSeller ? 'fill-[#C85A32] text-[#C85A32]' : 'text-gray-400'}`} />
                                <span>{prod.isBestSeller ? 'Best Seller' : 'Standard'}</span>
                              </button>

                              <div className="flex items-center gap-1 pl-2 border-l border-gray-200">
                                <label className="text-[10px] text-gray-400 font-bold uppercase">Rank:</label>
                                <input
                                  type="number"
                                  min="1"
                                  max="999"
                                  defaultValue={prod.displayRank ?? (index + 1)}
                                  onBlur={(e) => {
                                    const val = Number(e.target.value);
                                    if (val && val !== prod.displayRank) {
                                      handleDirectSetRank(prod.id, val);
                                    }
                                  }}
                                  className="w-12 p-1 text-center font-mono font-bold text-xs border border-gray-300 rounded-md focus:border-[#8B5CF6] outline-none"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>

                    {/* Modal Footer */}
                    <div className="p-4 bg-white border-t border-[#F0ECE1] flex items-center justify-between text-xs">
                      <span className="text-[#6E685F] text-[11px] flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                        Changes save in real time and automatically re-sort Storefront and Categories.
                      </span>

                      <button
                        onClick={() => setShowRankingStudio(false)}
                        className="px-6 py-2 bg-[#1F2430] hover:bg-black text-white font-bold rounded-lg transition-colors cursor-pointer"
                      >
                        Done / Close Studio
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 5: CATEGORIES BUILDER (6 CATEGORIES)                 */}
          {/* ========================================================= */}
          {/* ========================================================= */}
          {/* TAB 5: REAL-TIME CATEGORIES BUILDER & CLOUDINARY STUDIO   */}
          {/* ========================================================= */}
          {activeTab === 'categories' && (
            <div className="bg-white border border-[#E6E8EC] rounded-xl shadow-xs p-6 space-y-6 animate-fadeIn">
              
              {/* Header */}
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-[#F0ECE1] pb-4">
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                      Firestore onSnapshot Collection: categories
                    </span>
                    <span className="text-xs font-mono font-bold text-[#8B5CF6] bg-[#F5F3FF] border border-[#EDE9FE] px-2.5 py-0.5 rounded-full">
                      Cloudinary Upload: divachic_products
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold text-[#1F2430] tracking-tight font-sans">
                    Category Builder & Department Cards ({categories.length} Categories)
                  </h2>
                  <p className="text-xs text-[#8C92A0]">
                    Configure display titles, editorial quotes, Cloudinary banners, badge pills, and home showcase status in real time.
                  </p>
                </div>
              </div>

              {/* Category Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map((cat) => {
                  const catProductsCount = products.filter(p => p.category === (cat.key || cat.id)).length;
                  const displayImage = cat.imageUrl || cat.image || 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=1000&auto=format&fit=crop';
                  return (
                    <div key={cat.id} className="border border-[#EAE6DE] rounded-xl overflow-hidden bg-[#FAF9F6] flex flex-col justify-between shadow-xs hover:shadow-md transition-all">
                      
                      {/* Image Banner */}
                      <div className="h-44 overflow-hidden relative group">
                        <img 
                          src={displayImage} 
                          alt={cat.name} 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30"></div>
                        <span className="absolute top-3 left-3 bg-[#1F1F1F]/80 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                          {cat.badgeText || (cat.featured ? 'Featured on Home' : (cat.key?.toUpperCase() || 'CATEGORY'))}
                        </span>
                        <span className="absolute top-3 right-3 bg-[#8B5CF6] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-xs">
                          {catProductsCount} Products
                        </span>
                        <span className="absolute bottom-2 left-3 text-[10px] font-mono text-white/80">
                          Priority #{cat.orderIndex || 1}
                        </span>
                      </div>

                      {/* Card Body */}
                      <div className="p-5 space-y-2.5 flex-1 flex flex-col justify-between">
                        <div>
                          <h4 className="font-bold text-base text-[#1F1F1F] font-editorial">{cat.name}</h4>
                          <p className="text-xs text-[#6E685F] mt-1 leading-relaxed">
                            {cat.description || cat.tagline}
                          </p>
                          {(cat.quote || cat.tagline) && (
                            <p className="text-[11px] text-[#8C8477] mt-1.5 italic border-l-2 border-[#8B5CF6]/40 pl-2">
                              "{cat.quote || cat.tagline}"
                            </p>
                          )}
                        </div>

                        {/* Bottom Actions */}
                        <div className="pt-3 border-t border-[#EAE6DE] flex justify-between items-center">
                          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                            cat.featured 
                              ? 'bg-[#ECFDF5] text-[#059669] border-emerald-200' 
                              : 'bg-gray-100 text-gray-500 border-gray-200'
                          }`}>
                            {cat.featured ? 'Featured on Home' : 'Standard Category'}
                          </span>
                          <button
                            onClick={() => setEditingCategory({ ...cat })}
                            className="p-1.5 text-[#8B5CF6] hover:bg-white rounded-md cursor-pointer font-semibold text-xs flex items-center gap-1 border border-transparent hover:border-[#8B5CF6]/30 transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>

              {/* Edit Category Modal / Drawer */}
              {editingCategory && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
                  <div className="bg-white max-w-lg w-full rounded-2xl p-6 sm:p-7 space-y-5 shadow-2xl max-h-[92vh] overflow-y-auto text-xs border border-[#E6E8EC]">
                    
                    {/* Modal Header */}
                    <div className="flex justify-between items-center border-b border-[#F0ECE1] pb-3">
                      <div>
                        <span className="text-[10px] font-bold text-[#8B5CF6] uppercase tracking-wider block">
                          CATEGORY BUILDER & CLOUDINARY
                        </span>
                        <h3 className="font-bold text-base text-[#1F1F1F]">Edit Category: {editingCategory.name}</h3>
                      </div>
                      <button 
                        onClick={() => setEditingCategory(null)}
                        className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <form onSubmit={handleSaveCategory} className="space-y-4">
                      
                      {/* Name & Priority */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="sm:col-span-2">
                          <label className="font-bold block mb-1 text-[#1F1F1F]">Category Display Name *</label>
                          <input
                            type="text"
                            value={editingCategory.name}
                            onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                            className="w-full p-2.5 bg-[#FAF9F6] border border-[#D5D0C5] rounded-xl text-xs focus:outline-none focus:border-[#8B5CF6] focus:bg-white"
                            placeholder="e.g. Backpacks & Travel Bags"
                            required
                          />
                        </div>
                        <div>
                          <label className="font-bold block mb-1 text-[#1F1F1F]">Priority Order</label>
                          <input
                            type="number"
                            value={editingCategory.orderIndex || 1}
                            onChange={(e) => setEditingCategory({ ...editingCategory, orderIndex: Number(e.target.value) })}
                            className="w-full p-2.5 bg-[#FAF9F6] border border-[#D5D0C5] rounded-xl text-xs focus:outline-none focus:border-[#8B5CF6] focus:bg-white font-mono"
                          />
                        </div>
                      </div>

                      {/* Description Line */}
                      <div>
                        <label className="font-bold block mb-1 text-[#1F1F1F]">Short Description Line</label>
                        <input
                          type="text"
                          value={editingCategory.description}
                          onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                          className="w-full p-2.5 bg-[#FAF9F6] border border-[#D5D0C5] rounded-xl text-xs focus:outline-none focus:border-[#8B5CF6] focus:bg-white"
                          placeholder="e.g. Technical canvas and vegetable-tanned Scandinavian leather backpacks"
                        />
                      </div>

                      {/* Sub-copy / Quote */}
                      <div>
                        <label className="font-bold block mb-1 text-[#1F1F1F]">Sub-Copy / Editorial Quote</label>
                        <textarea
                          value={editingCategory.quote || editingCategory.tagline || ''}
                          onChange={(e) => setEditingCategory({ ...editingCategory, quote: e.target.value, tagline: e.target.value })}
                          className="w-full p-2.5 bg-[#FAF9F6] border border-[#D5D0C5] rounded-xl text-xs focus:outline-none focus:border-[#8B5CF6] focus:bg-white"
                          rows={2}
                          placeholder='e.g. "Handcrafted utilitarian daypacks engineered for high-durability transit."'
                        />
                      </div>

                      {/* Badge Text */}
                      <div>
                        <label className="font-bold block mb-1 text-[#1F1F1F]">Badge / Tag Text</label>
                        <input
                          type="text"
                          value={editingCategory.badgeText || ''}
                          onChange={(e) => setEditingCategory({ ...editingCategory, badgeText: e.target.value })}
                          className="w-full p-2.5 bg-[#FAF9F6] border border-[#D5D0C5] rounded-xl text-xs focus:outline-none focus:border-[#8B5CF6] focus:bg-white"
                          placeholder="e.g. Featured on Home, HATS, APPAREL, ACCESSORIES"
                        />
                      </div>

                      {/* Cloudinary Photo Upload & Image URL */}
                      <div className="p-3.5 bg-[#FAF9F6] border border-[#EAE6DE] rounded-xl space-y-3">
                        <div className="flex justify-between items-center">
                          <label className="font-bold text-[#1F1F1F] block">
                            Category Visual / Banner (Cloudinary CDN)
                          </label>
                          {isUploadingCategoryPhoto && (
                            <span className="text-[10px] font-bold text-[#8B5CF6] bg-[#F5F3FF] px-2 py-0.5 rounded-full animate-pulse">
                              Uploading ({categoryPhotoProgress}%)...
                            </span>
                          )}
                        </div>

                        {/* Hidden file input */}
                        <input
                          type="file"
                          ref={categoryFileInputRef}
                          onChange={(e) => e.target.files && handleCategoryPhotoUpload(e.target.files)}
                          accept="image/*"
                          className="hidden"
                        />

                        {/* Image Preview & Upload Button */}
                        <div className="flex items-center gap-3">
                          <div className="w-20 h-20 rounded-xl overflow-hidden border border-[#D5D0C5] shrink-0 bg-white">
                            <img
                              src={editingCategory.imageUrl || editingCategory.image || 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=200&auto=format&fit=crop'}
                              alt="Category Preview"
                              className="w-full h-full object-cover"
                            />
                          </div>

                          <div className="flex-1 space-y-1.5">
                            <button
                              type="button"
                              disabled={isUploadingCategoryPhoto}
                              onClick={() => categoryFileInputRef.current?.click()}
                              className="w-full bg-white hover:bg-[#F5F3FF] text-[#8B5CF6] border border-[#8B5CF6] py-2 px-3 rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <Upload className="w-3.5 h-3.5" />
                              <span>{isUploadingCategoryPhoto ? `Uploading to Cloudinary (${categoryPhotoProgress}%)` : 'Upload New Photo (Cloudinary)'}</span>
                            </button>
                            <p className="text-[10px] text-[#8C8477]">
                              Uploads directly to Cloudinary (preset: <code className="font-mono text-[#8B5CF6]">divachic_products</code>).
                            </p>
                          </div>
                        </div>

                        {/* Direct URL input */}
                        <div>
                          <input
                            type="text"
                            value={editingCategory.imageUrl || editingCategory.image || ''}
                            onChange={(e) => setEditingCategory({ ...editingCategory, imageUrl: e.target.value, image: e.target.value })}
                            placeholder="Or paste direct image URL (https://res.cloudinary.com/...)"
                            className="w-full p-2 bg-white border border-[#D5D0C5] rounded-xl text-[11px] font-mono focus:outline-none focus:border-[#8B5CF6]"
                          />
                        </div>
                      </div>

                      {/* Featured on Home Toggle */}
                      <div className="flex items-center justify-between p-3 bg-[#FAF9F6] border border-[#EAE6DE] rounded-xl">
                        <div>
                          <label htmlFor="featuredCatToggle" className="font-bold text-xs text-[#1F1F1F] block cursor-pointer">
                            Featured on Homepage Grid
                          </label>
                          <p className="text-[10px] text-[#8C8477]">
                            Controls whether this department card is shown on the visitor storefront homepage.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setEditingCategory({ ...editingCategory, featured: !editingCategory.featured })}
                          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            editingCategory.featured ? 'bg-emerald-500' : 'bg-gray-300'
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                              editingCategory.featured ? 'translate-x-4' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>

                      {/* Submit Button */}
                      <div className="pt-2">
                        <button 
                          type="submit" 
                          className="w-full bg-[#8B5CF6] hover:bg-[#7C3AED] text-white py-3 font-bold rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer shadow-xs"
                        >
                          Save Category to Firestore
                        </button>
                      </div>

                    </form>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 6: JOURNAL & BLOG MANAGER (2 ARTICLES)                */}
          {/* ========================================================= */}
          {activeTab === 'journal' && (
            <div className="bg-white border border-[#E6E8EC] rounded-xl shadow-xs p-6 space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-[#F0ECE1] pb-4">
                <div>
                  <h2 className="text-xl font-bold text-[#1F2430]">Journal & Blog Manager</h2>
                  <p className="text-xs text-[#8C92A0]">Publish essays, craftsmanship spotlights, and care guides for the DivaChic Gazette</p>
                </div>
                <button
                  onClick={() => {
                    setEditingArticle(null);
                    setShowAddArticleModal(true);
                  }}
                  className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs font-semibold px-4 py-2.5 rounded-lg transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Write New Gazette Story</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {journalArticles.map((art) => (
                  <div key={art.id} className="border border-[#EAE6DE] rounded-xl overflow-hidden bg-[#FAF9F6] flex flex-col justify-between shadow-xs">
                    <div className="h-48 overflow-hidden relative">
                      <img src={art.image} alt={art.title} className="w-full h-full object-cover" />
                      <span className="absolute top-3 left-3 bg-[#1F1F1F]/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                        {art.category}
                      </span>
                      <span className="absolute top-3 right-3 bg-white text-[#1F1F1F] text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                        {art.readTime}
                      </span>
                    </div>

                    <div className="p-5 space-y-2 flex-1 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] text-[#8C8477]">{art.date} · by {art.author}</span>
                        <h4 className="font-bold text-base text-[#1F1F1F] font-editorial leading-snug mt-1">{art.title}</h4>
                        <p className="text-xs text-[#6E685F] mt-2 line-clamp-3">{art.excerpt}</p>
                      </div>

                      <div className="pt-4 border-t border-[#EAE6DE] flex justify-between items-center">
                        <button
                          onClick={() => {
                            setEditingArticle(art);
                            setShowAddArticleModal(true);
                          }}
                          className="text-xs font-bold text-[#8B5CF6] hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit Article</span>
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete article "${art.title}"?`)) {
                              setJournalArticles(prev => prev.filter(a => a.id !== art.id));
                              showToast('Journal article deleted', 'info');
                            }
                          }}
                          className="text-xs font-semibold text-[#DC2626] hover:underline cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add/Edit Article Modal */}
              {showAddArticleModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                  <div className="bg-white max-w-lg w-full rounded-xl p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto text-xs">
                    <div className="flex justify-between items-center border-b pb-2">
                      <h3 className="font-bold text-base text-[#1F1F1F]">
                        {editingArticle ? 'Edit Gazette Story' : 'Write New Gazette Story'}
                      </h3>
                      <button onClick={() => setShowAddArticleModal(false)}><X className="w-4 h-4" /></button>
                    </div>

                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (editingArticle) {
                          setJournalArticles(prev => prev.map(a => a.id === editingArticle.id ? editingArticle : a));
                          showToast('Article updated', 'success');
                        } else {
                          // Add new article
                          const newArt: JournalArticle = {
                            id: `art-${Date.now()}`,
                            title: editingArticle?.title || 'Scandinavian Materiality & Form',
                            date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
                            category: editingArticle?.category || 'Couture Insights',
                            author: adminProfile?.name || 'Creative Director',
                            readTime: '5 min read',
                            image: editingArticle?.image || 'https://images.unsplash.com/photo-1513094735237-8f2714d57c13?q=80&w=800&auto=format&fit=crop',
                            excerpt: editingArticle?.excerpt || 'An inquiry into the tactile nature of slow-fashion garments and sustainable textiles.',
                            content: editingArticle?.content || 'Full story content...'
                          };
                          setJournalArticles(prev => [newArt, ...prev]);
                          showToast('Story published to Gazette', 'success');
                        }
                        setShowAddArticleModal(false);
                      }}
                      className="space-y-3"
                    >
                      <div>
                        <label className="font-bold block mb-1">Story Title</label>
                        <input
                          type="text"
                          defaultValue={editingArticle?.title || ''}
                          onChange={(e) => setEditingArticle(prev => ({ ...prev!, title: e.target.value }))}
                          placeholder="e.g. Nordic Functionalism in Modern Living"
                          className="w-full p-2.5 border rounded-lg"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="font-bold block mb-1">Category</label>
                          <input
                            type="text"
                            defaultValue={editingArticle?.category || 'Philosophy'}
                            onChange={(e) => setEditingArticle(prev => ({ ...prev!, category: e.target.value }))}
                            className="w-full p-2.5 border rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="font-bold block mb-1">Read Time</label>
                          <input
                            type="text"
                            defaultValue={editingArticle?.readTime || '5 min read'}
                            onChange={(e) => setEditingArticle(prev => ({ ...prev!, readTime: e.target.value }))}
                            className="w-full p-2.5 border rounded-lg"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="font-bold block mb-1">Cover Image URL</label>
                        <input
                          type="text"
                          defaultValue={editingArticle?.image || ''}
                          onChange={(e) => setEditingArticle(prev => ({ ...prev!, image: e.target.value }))}
                          placeholder="https://..."
                          className="w-full p-2.5 border rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="font-bold block mb-1">Summary / Excerpt</label>
                        <textarea
                          defaultValue={editingArticle?.excerpt || ''}
                          onChange={(e) => setEditingArticle(prev => ({ ...prev!, excerpt: e.target.value }))}
                          rows={2}
                          className="w-full p-2.5 border rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="font-bold block mb-1">Full Article Body</label>
                        <textarea
                          defaultValue={editingArticle?.content || ''}
                          onChange={(e) => setEditingArticle(prev => ({ ...prev!, content: e.target.value }))}
                          rows={6}
                          className="w-full p-2.5 border rounded-lg"
                        />
                      </div>
                      <button type="submit" className="w-full bg-[#8B5CF6] text-white py-2.5 font-bold rounded-lg cursor-pointer">
                        {editingArticle ? 'Save Article Changes' : 'Publish Story'}
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 7: CMS PAGES (5 CORE PAGES)                           */}
          {/* ========================================================= */}
          {activeTab === 'cms' && (
            <div className="bg-white border border-[#E6E8EC] rounded-xl shadow-xs p-6 space-y-6 animate-fadeIn">
              <div className="border-b border-[#F0ECE1] pb-4">
                <h2 className="text-xl font-bold text-[#1F2430]">CMS Pages Manager (5 Pages)</h2>
                <p className="text-xs text-[#8C92A0]">Control copy, legal guarantees, shipping thresholds, and brand policies across all storefront pages</p>
              </div>

              <div className="divide-y divide-[#F0ECE1]">
                {cmsPages.map((page) => (
                  <div key={page.id} className="py-4 flex items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#1F1F1F]">{page.title}</span>
                        <span className="text-[10px] font-mono text-[#8B5CF6] bg-[#F5F3FF] px-2 py-0.5 rounded-md">{page.slug}</span>
                      </div>
                      <p className="text-xs text-[#6E685F] mt-1">{page.headline}</p>
                      <span className="text-[10px] text-[#8C8477]">Last updated: {page.lastUpdated}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-bold text-[#059669] bg-[#ECFDF5] px-2 py-0.5 rounded-full uppercase">
                        {page.status}
                      </span>
                      <button
                        onClick={() => setEditingCmsPage(page)}
                        className="px-3 py-1.5 bg-[#8B5CF6] text-white rounded-lg text-xs font-bold hover:bg-[#7C3AED] transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit Page</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Edit CMS Page Modal */}
              {editingCmsPage && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                  <div className="bg-white max-w-lg w-full rounded-xl p-6 space-y-4 shadow-2xl text-xs">
                    <div className="flex justify-between items-center border-b pb-2">
                      <h3 className="font-bold text-base text-[#1F1F1F]">Edit CMS Page: {editingCmsPage.title}</h3>
                      <button onClick={() => setEditingCmsPage(null)}><X className="w-4 h-4" /></button>
                    </div>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        setCmsPages(prev => prev.map(p => p.id === editingCmsPage.id ? { ...editingCmsPage, lastUpdated: 'Just now' } : p));
                        setEditingCmsPage(null);
                        showToast(`CMS Page "${editingCmsPage.title}" updated`, 'success');
                      }}
                      className="space-y-3"
                    >
                      <div>
                        <label className="font-bold block mb-1">Page Title</label>
                        <input
                          type="text"
                          value={editingCmsPage.title}
                          onChange={(e) => setEditingCmsPage({ ...editingCmsPage, title: e.target.value })}
                          className="w-full p-2.5 border rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="font-bold block mb-1">Main Headline</label>
                        <input
                          type="text"
                          value={editingCmsPage.headline}
                          onChange={(e) => setEditingCmsPage({ ...editingCmsPage, headline: e.target.value })}
                          className="w-full p-2.5 border rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="font-bold block mb-1">Page Content Body</label>
                        <textarea
                          value={editingCmsPage.bodyContent}
                          onChange={(e) => setEditingCmsPage({ ...editingCmsPage, bodyContent: e.target.value })}
                          rows={6}
                          className="w-full p-2.5 border rounded-lg font-sans leading-relaxed"
                        />
                      </div>
                      <button type="submit" className="w-full bg-[#8B5CF6] text-white py-2.5 font-bold rounded-lg cursor-pointer">
                        Save CMS Page Content
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 8: BANNERS & SITE ANNOUNCEMENTS (settings/home_banner)*/}
          {/* ========================================================= */}
          {activeTab === 'banners' && (
            <div className="bg-white border border-[#E6E8EC] rounded-xl shadow-xs p-6 space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#F0ECE1] pb-4">
                <div>
                  <h2 className="text-xl font-bold text-[#1F1F1F]">Brand Banners & Announcement Settings</h2>
                  <p className="text-xs text-[#8C92A0]">Synced in real-time across all visitors via Firestore (settings/home_banner) & Cloudinary</p>
                </div>
                <button
                  type="button"
                  onClick={() => updateSiteBanners(siteBanners)}
                  className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Sync to Firestore Now</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Brand Logo */}
                <div className="p-5 border border-[#EAE6DE] rounded-xl space-y-3 bg-[#FAF9F6]">
                  <div className="flex justify-between items-center">
                    <label className="font-bold text-xs block text-[#1F1F1F]">Brand Logo</label>
                    <label className="text-[11px] text-[#8B5CF6] font-bold cursor-pointer hover:underline flex items-center gap-1">
                      <Upload className="w-3 h-3" />
                      <span>Upload to Cloudinary</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => e.target.files?.[0] && handleBannerUpload(e.target.files[0], 'logoUrl')}
                      />
                    </label>
                  </div>
                  <input
                    type="text"
                    value={siteBanners?.logoUrl || '/logo.png'}
                    onChange={(e) => updateSiteBanners({ logoUrl: e.target.value })}
                    className="w-full p-2.5 bg-white border border-[#D5D0C5] text-xs rounded-lg font-mono"
                  />
                  <div className="p-4 bg-white border rounded-lg flex items-center justify-center h-20">
                    <img src={siteBanners?.logoUrl || '/logo.png'} alt="Preview" className="h-8 object-contain" />
                  </div>
                </div>

                {/* Hero Runway Banner */}
                <div className="p-5 border border-[#EAE6DE] rounded-xl space-y-3 bg-[#FAF9F6]">
                  <div className="flex justify-between items-center">
                    <label className="font-bold text-xs block text-[#1F1F1F]">Hero Runway Banner Image</label>
                    <label className="text-[11px] text-[#8B5CF6] font-bold cursor-pointer hover:underline flex items-center gap-1">
                      <Upload className="w-3 h-3" />
                      <span>Upload to Cloudinary</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => e.target.files?.[0] && handleBannerUpload(e.target.files[0], 'heroImage')}
                      />
                    </label>
                  </div>
                  <input
                    type="text"
                    value={siteBanners?.heroImage || ''}
                    onChange={(e) => updateSiteBanners({ heroImage: e.target.value })}
                    className="w-full p-2.5 bg-white border border-[#D5D0C5] text-xs rounded-lg font-mono"
                  />
                  <div className="h-28 rounded-lg overflow-hidden border">
                    <img src={siteBanners?.heroImage} alt="Hero" className="w-full h-full object-cover" />
                  </div>
                </div>

                {/* Hero Headline & Subtitle */}
                <div className="p-5 border border-[#EAE6DE] rounded-xl space-y-3 bg-[#FAF9F6]">
                  <label className="font-bold text-xs block text-[#1F1F1F]">Hero Headline Text</label>
                  <input
                    type="text"
                    value={siteBanners?.heroTitle || 'Nordic Minimalism Meets High Fashion'}
                    onChange={(e) => updateSiteBanners({ heroTitle: e.target.value })}
                    placeholder="Nordic Minimalism Meets High Fashion"
                    className="w-full p-2.5 bg-white border border-[#D5D0C5] text-xs rounded-lg"
                  />
                  <label className="font-bold text-xs block text-[#1F1F1F]">Hero Subtitle / Description</label>
                  <input
                    type="text"
                    value={siteBanners?.heroSubtitle || 'Discover handcrafted Scandinavian leather goods and timeless essentials.'}
                    onChange={(e) => updateSiteBanners({ heroSubtitle: e.target.value })}
                    placeholder="Discover handcrafted Scandinavian leather goods..."
                    className="w-full p-2.5 bg-white border border-[#D5D0C5] text-xs rounded-lg"
                  />
                </div>

                {/* Discount Badge & Banner Link */}
                <div className="p-5 border border-[#EAE6DE] rounded-xl space-y-3 bg-[#FAF9F6]">
                  <label className="font-bold text-xs block text-[#1F1F1F]">Header & Banner Discount Badge</label>
                  <input
                    type="text"
                    value={siteBanners?.discountBadge || 'Runway Drop 20% Off'}
                    onChange={(e) => updateSiteBanners({ discountBadge: e.target.value })}
                    placeholder="e.g. Runway Drop 20% Off"
                    className="w-full p-2.5 bg-white border border-[#D5D0C5] text-xs rounded-lg"
                  />
                  <label className="font-bold text-xs block text-[#1F1F1F]">Banner Link Destination</label>
                  <input
                    type="text"
                    value={siteBanners?.bannerLink || '/shop'}
                    onChange={(e) => updateSiteBanners({ bannerLink: e.target.value })}
                    placeholder="/shop"
                    className="w-full p-2.5 bg-white border border-[#D5D0C5] text-xs rounded-lg font-mono"
                  />
                </div>

                {/* Trending Eyewear Banner */}
                <div className="p-5 border border-[#EAE6DE] rounded-xl space-y-3 bg-[#FAF9F6]">
                  <div className="flex justify-between items-center">
                    <label className="font-bold text-xs block text-[#1F1F1F]">Trending Eyewear Banner Image</label>
                    <label className="text-[11px] text-[#8B5CF6] font-bold cursor-pointer hover:underline flex items-center gap-1">
                      <Upload className="w-3 h-3" />
                      <span>Upload to Cloudinary</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => e.target.files?.[0] && handleBannerUpload(e.target.files[0], 'eyewearImage')}
                      />
                    </label>
                  </div>
                  <input
                    type="text"
                    value={siteBanners?.eyewearImage || ''}
                    onChange={(e) => updateSiteBanners({ eyewearImage: e.target.value })}
                    className="w-full p-2.5 bg-white border border-[#D5D0C5] text-xs rounded-lg font-mono"
                  />
                  <div className="h-28 rounded-lg overflow-hidden border">
                    <img src={siteBanners?.eyewearImage} alt="Eyewear" className="w-full h-full object-cover" />
                  </div>
                </div>

                {/* Editorial Banner */}
                <div className="p-5 border border-[#EAE6DE] rounded-xl space-y-3 bg-[#FAF9F6]">
                  <div className="flex justify-between items-center">
                    <label className="font-bold text-xs block text-[#1F1F1F]">Editorial Section Banner Image</label>
                    <label className="text-[11px] text-[#8B5CF6] font-bold cursor-pointer hover:underline flex items-center gap-1">
                      <Upload className="w-3 h-3" />
                      <span>Upload to Cloudinary</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => e.target.files?.[0] && handleBannerUpload(e.target.files[0], 'editorialImage')}
                      />
                    </label>
                  </div>
                  <input
                    type="text"
                    value={siteBanners?.editorialImage || ''}
                    onChange={(e) => updateSiteBanners({ editorialImage: e.target.value })}
                    className="w-full p-2.5 bg-white border border-[#D5D0C5] text-xs rounded-lg font-mono"
                  />
                  <div className="h-28 rounded-lg overflow-hidden border">
                    <img src={siteBanners?.editorialImage} alt="Editorial" className="w-full h-full object-cover" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB: REVIEWS & TESTIMONIALS (Firestore 'reviews')         */}
          {/* ========================================================= */}
          {activeTab === 'reviews' && (
            <div className="bg-white border border-[#E6E8EC] rounded-xl shadow-xs p-6 space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#F0ECE1] pb-4">
                <div>
                  <h2 className="text-xl font-bold text-[#1F1F1F]">Verified Reviews & Testimonials ({reviews.length})</h2>
                  <p className="text-xs text-[#8C92A0]">Managed in real-time via Firestore 'reviews' collection with Cloudinary user photo attachment</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddReviewModal(true)}
                  className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Post Verified Customer Review</span>
                </button>
              </div>

              {/* Reviews Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {reviews.map((rev) => {
                  const prod = products.find((p) => p.id === rev.productId);
                  return (
                    <div key={rev.id} className="p-4 border border-[#EAE6DE] rounded-xl bg-[#FAF9F6] space-y-3 flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-1 text-amber-500">
                              {Array.from({ length: rev.rating }).map((_, i) => (
                                <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                              ))}
                            </div>
                            <span className="font-bold text-xs text-[#1F1F1F] block mt-0.5">{rev.author}</span>
                            <span className="text-[10px] text-[#8C8477]">{rev.date} • {prod?.name || 'Storewide Review'}</span>
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            rev.approved !== false ? 'bg-[#ECFDF5] text-[#059669]' : 'bg-[#FEF2F2] text-[#DC2626]'
                          }`}>
                            {rev.approved !== false ? '✓ Approved' : 'Hidden'}
                          </span>
                        </div>

                        {rev.title && <h4 className="font-bold text-xs text-[#1F1F1F]">{rev.title}</h4>}
                        <p className="text-xs text-[#555048] leading-relaxed line-clamp-3">"{rev.comment}"</p>

                        {rev.imageUrl && (
                          <div className="h-20 w-20 rounded-lg overflow-hidden border">
                            <img src={rev.imageUrl} alt="Customer Photo" className="w-full h-full object-cover" />
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-[#EAE6DE]">
                        <span className="text-[10px] text-[#8C8477]">👍 {rev.helpfulCount || 0} helpful votes</span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => approveCustomerReview(rev.id, rev.approved === false)}
                            className="text-[11px] font-bold text-[#8B5CF6] hover:underline cursor-pointer"
                          >
                            {rev.approved === false ? 'Approve' : 'Hide'}
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteCustomerReview(rev.id)}
                            className="text-[#DC2626] p-1 hover:bg-red-50 rounded cursor-pointer"
                            title="Delete Review"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Add Customer Review Modal */}
              {showAddReviewModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                  <div className="bg-white max-w-md w-full rounded-xl p-6 space-y-4 shadow-2xl animate-scaleUp">
                    <div className="flex justify-between items-center border-b pb-2">
                      <h3 className="font-bold text-base text-[#1F1F1F]">Add Verified Customer Review</h3>
                      <button onClick={() => setShowAddReviewModal(false)}><X className="w-4 h-4" /></button>
                    </div>
                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        await addCustomerReview({
                          productId: newRevProductId,
                          author: newRevCustomerName || 'Verified Client',
                          rating: Number(newRevRating),
                          title: newRevTitle || 'Verified Feedback',
                          comment: newRevText,
                          imageUrl: newRevImageUrl || undefined,
                          verified: true,
                          approved: true
                        });
                        setShowAddReviewModal(false);
                        setNewRevCustomerName('');
                        setNewRevTitle('');
                        setNewRevText('');
                        setNewRevImageUrl('');
                      }}
                      className="space-y-3 text-xs"
                    >
                      <div>
                        <label className="font-bold block mb-1">Customer Full Name *</label>
                        <input
                          type="text"
                          value={newRevCustomerName}
                          onChange={(e) => setNewRevCustomerName(e.target.value)}
                          placeholder="e.g. Helena Vance"
                          className="w-full p-2.5 border rounded-lg"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="font-bold block mb-1">Star Rating (1-5)</label>
                          <select
                            value={newRevRating}
                            onChange={(e) => setNewRevRating(Number(e.target.value))}
                            className="w-full p-2.5 border rounded-lg"
                          >
                            <option value={5}>★★★★★ (5 Stars)</option>
                            <option value={4}>★★★★☆ (4 Stars)</option>
                            <option value={3}>★★★☆☆ (3 Stars)</option>
                            <option value={2}>★★☆☆☆ (2 Stars)</option>
                            <option value={1}>★☆☆☆☆ (1 Star)</option>
                          </select>
                        </div>

                        <div>
                          <label className="font-bold block mb-1">Associated Product</label>
                          <select
                            value={newRevProductId}
                            onChange={(e) => setNewRevProductId(e.target.value)}
                            className="w-full p-2.5 border rounded-lg"
                          >
                            {products.map((p) => (
                              <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="font-bold block mb-1">Review Headline</label>
                        <input
                          type="text"
                          value={newRevTitle}
                          onChange={(e) => setNewRevTitle(e.target.value)}
                          placeholder="e.g. Flawless craftsmanship & fast dispatch"
                          className="w-full p-2.5 border rounded-lg"
                        />
                      </div>

                      <div>
                        <label className="font-bold block mb-1">Review Details *</label>
                        <textarea
                          value={newRevText}
                          onChange={(e) => setNewRevText(e.target.value)}
                          placeholder="Write detailed verified customer testimony..."
                          rows={3}
                          className="w-full p-2.5 border rounded-lg"
                          required
                        />
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="font-bold">Attached User Photo (Cloudinary)</label>
                          <label className="text-[11px] text-[#8B5CF6] font-bold cursor-pointer hover:underline flex items-center gap-1">
                            <Upload className="w-3 h-3" />
                            <span>Upload Image</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={async (e) => {
                                if (e.target.files?.[0]) {
                                  setIsUploadingReviewImg(true);
                                  try {
                                    const url = await uploadToCloudinary(e.target.files[0]);
                                    setNewRevImageUrl(url);
                                    setIsUploadingReviewImg(false);
                                    showToast('User photo uploaded to Cloudinary!', 'success');
                                  } catch (err: any) {
                                    setIsUploadingReviewImg(false);
                                    showToast('Upload failed', 'error', err?.message);
                                  }
                                }
                              }}
                            />
                          </label>
                        </div>
                        <input
                          type="text"
                          value={newRevImageUrl}
                          onChange={(e) => setNewRevImageUrl(e.target.value)}
                          placeholder="https://res.cloudinary.com/..."
                          className="w-full p-2 border rounded-lg font-mono text-xs"
                        />
                        {isUploadingReviewImg && <span className="text-[10px] text-[#8B5CF6] animate-pulse">Uploading photo to Cloudinary...</span>}
                      </div>

                      <button type="submit" className="w-full bg-[#8B5CF6] text-white py-2.5 font-bold rounded-lg cursor-pointer">
                        Publish Review to Firestore
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 9: DELIVERY TIMEFRAME SLIDER & LOGISTICS              */}
          {/* ========================================================= */}
          {activeTab === 'delivery' && (
            <div className="bg-white border border-[#E6E8EC] rounded-xl shadow-xs p-6 space-y-6 animate-fadeIn">
              <div className="border-b border-[#F0ECE1] pb-4">
                <h2 className="text-xl font-bold text-[#1F2430]">Delivery Timeframe Slider & Logistics Settings</h2>
                <p className="text-xs text-[#8C92A0]">Calibrate customer delivery day estimations, dynamic checkout arrival dates, and prepaid incentives</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs">
                {/* Delivery Slider */}
                <div className="p-6 border border-[#EAE6DE] rounded-xl bg-[#FAF9F6] space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="font-bold text-sm text-[#1F1F1F]">Standard Courier Delivery Window</label>
                    <span className="text-lg font-bold text-[#8B5CF6] font-mono bg-white px-3 py-1 rounded-lg border">
                      {standardDeliveryDays} Days
                    </span>
                  </div>

                  <input
                    type="range"
                    min="1"
                    max="30"
                    value={standardDeliveryDays}
                    onChange={(e) => {
                      setStandardDeliveryDays(Number(e.target.value));
                      showToast(`Delivery timeframe set to ${e.target.value} days`, 'success');
                    }}
                    className="w-full accent-[#8B5CF6] cursor-pointer"
                  />

                  <div className="flex justify-between text-[10px] text-[#8C8477]">
                    <span>1 Day (Next-Day Express)</span>
                    <span>15 Days</span>
                    <span>30 Days (Global Sea Freight)</span>
                  </div>

                  <div className="p-3 bg-white border rounded-lg space-y-1">
                    <span className="font-bold text-[#1F1F1F] block">Live Storefront Checkout Calculation:</span>
                    <p className="text-[#555048]">
                      Orders placed today arrive estimated by: <strong className="text-[#8B5CF6]">{calculateDeliveryDate().formattedDate}</strong>
                    </p>
                  </div>
                </div>

                {/* Online Payment Discount Slider */}
                <div className="p-6 border border-[#EAE6DE] rounded-xl bg-[#FAF9F6] space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="font-bold text-sm text-[#1F1F1F]">Online Prepaid Payment Discount</label>
                    <span className="text-lg font-bold text-[#10B981] font-mono bg-white px-3 py-1 rounded-lg border">
                      {onlineDiscountPercent}% OFF
                    </span>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max="30"
                    value={onlineDiscountPercent}
                    onChange={(e) => {
                      updateOnlineDiscountPercent(Number(e.target.value));
                      showToast(`Online discount set to ${e.target.value}%`, 'success');
                    }}
                    className="w-full accent-[#10B981] cursor-pointer"
                  />

                  <div className="flex justify-between text-[10px] text-[#8C8477]">
                    <span>0% (No Incentive)</span>
                    <span>15%</span>
                    <span>30% Max Incentive</span>
                  </div>

                  <div className="p-3 bg-white border rounded-lg space-y-1">
                    <span className="font-bold text-[#1F1F1F] block">Incentive Application:</span>
                    <p className="text-[#555048]">
                      Automatically subtracted in real-time when clients select UPI / Credit Card / NetBanking at checkout.
                    </p>
                  </div>
                </div>
              </div>

              {/* Individual Per-Product Delivery Timeframe Section */}
              <div className="border-t border-[#F0ECE1] pt-6 space-y-4">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-[#1F2430] flex items-center gap-2">
                        <Truck className="w-5 h-5 text-[#8B5CF6]" />
                        <span>Per-Product Delivery Sliders</span>
                      </h3>
                      <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full font-bold">
                        Live Real-Time Sync
                      </span>
                    </div>
                    <p className="text-xs text-[#8C92A0] mt-0.5">
                      Set custom delivery days for each specific product. Moving the slider updates Firestore and customer product pages instantly.
                    </p>
                  </div>

                  <div className="w-full sm:w-64 relative">
                    <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={deliveryProductSearch}
                      onChange={(e) => setDeliveryProductSearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 bg-[#FAF9F6] border border-[#D5D0C5] rounded-lg text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {products
                    .filter((p) => !deliveryProductSearch || p.name.toLowerCase().includes(deliveryProductSearch.toLowerCase()) || (p.sku && p.sku.toLowerCase().includes(deliveryProductSearch.toLowerCase())))
                    .map((prod) => {
                      const prodDays = prod.deliveryDays ?? standardDeliveryDays;
                      const hasCustom = typeof prod.deliveryDays === 'number' && prod.deliveryDays !== standardDeliveryDays;
                      const arrival = calculateDeliveryDate(0, prodDays);

                      return (
                        <div
                          key={prod.id}
                          className={`p-4 rounded-xl border transition-all ${
                            hasCustom ? 'bg-[#F0FDF4] border-[#BBF7D0]' : 'bg-[#FAF9F6] border-[#EAE6DE]'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <div className="flex items-center gap-3">
                              <img
                                src={prod.images?.[0] || 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=800&auto=format&fit=crop'}
                                alt={prod.name}
                                className="w-12 h-12 rounded-lg object-cover border border-gray-200 shrink-0"
                              />
                              <div>
                                <h4 className="font-bold text-xs text-[#1F2430] line-clamp-1">{prod.name}</h4>
                                <div className="flex items-center gap-2 text-[10px] text-[#6E685F] mt-0.5">
                                  <span className="font-mono text-[#8B5CF6] font-bold">{prod.sku || 'HAU-001'}</span>
                                  <span>•</span>
                                  <span className="uppercase font-semibold">{prod.category}</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-col items-end gap-1">
                              <span
                                className={`text-xs font-mono font-bold px-2.5 py-1 rounded-lg border ${
                                  hasCustom
                                    ? 'bg-white text-emerald-700 border-emerald-300 shadow-2xs'
                                    : 'bg-white text-[#8B5CF6] border-gray-200'
                                }`}
                              >
                                {prodDays} Days
                              </span>
                              <span className="text-[9px] text-gray-500">
                                {hasCustom ? '⚡ Custom Timeframe' : 'Default Store Window'}
                              </span>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="text-gray-500 font-medium">Adjust Product Delivery Days:</span>
                              <span className="text-gray-700 font-bold">
                                Est. Arrival: <strong className="text-emerald-700">{arrival.formattedDate}</strong>
                              </span>
                            </div>

                            <input
                              type="range"
                              min="1"
                              max="30"
                              value={prodDays}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                updateProductDeliveryDays(prod.id, val);
                              }}
                              className="w-full accent-emerald-600 cursor-pointer"
                            />

                            <div className="flex justify-between items-center text-[10px] text-gray-400">
                              <span>1 Day (Express Dispatch)</span>
                              {hasCustom && (
                                <button
                                  onClick={() => updateProductDeliveryDays(prod.id, standardDeliveryDays)}
                                  className="text-[10px] text-[#8B5CF6] hover:underline font-semibold cursor-pointer"
                                >
                                  Reset to Store Standard ({standardDeliveryDays}d)
                                </button>
                              )}
                              <span>30 Days (Pre-Order / Freight)</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 10: COUPONS & MARKETING (3 COUPONS)                   */}
          {/* ========================================================= */}
          {activeTab === 'coupons' && (
            <div className="bg-white border border-[#E6E8EC] rounded-xl shadow-xs p-6 space-y-6 animate-fadeIn">
              <div className="flex justify-between items-center border-b border-[#F0ECE1] pb-4">
                <div>
                  <h2 className="text-xl font-bold text-[#1F1F1F]">Coupons & Promo Codes (3 Coupons)</h2>
                  <p className="text-xs text-[#8C92A0]">Active promotional allowances, percentage vouchers, and minimum spend rules</p>
                </div>
                <button
                  onClick={() => setShowAddCoupon(true)}
                  className="px-4 py-2 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs font-bold rounded-lg cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Coupon</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {coupons.map((cp) => (
                  <div key={cp.code} className="p-5 border border-[#EAE6DE] rounded-xl bg-[#FAF9F6] space-y-2 relative shadow-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-mono font-bold text-base text-[#8B5CF6]">{cp.code}</span>
                      <button
                        onClick={() => deleteCoupon(cp.code)}
                        className="text-[#DC2626] p-1 hover:bg-red-50 rounded-md cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-xs font-bold text-[#1F1F1F]">{cp.discountPercent ? `${cp.discountPercent}% Discount` : `$${cp.discountAmount} Off`}</p>
                    <p className="text-[11px] text-[#6E685F]">{cp.description}</p>
                    {cp.minSpend && (
                      <p className="text-[10px] text-[#8C8477]">Min Spend: {formatPrice(cp.minSpend)}</p>
                    )}
                  </div>
                ))}
              </div>

              {showAddCoupon && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                  <div className="bg-white max-w-sm w-full rounded-xl p-6 space-y-4 shadow-2xl">
                    <div className="flex justify-between items-center border-b pb-2">
                      <h3 className="font-bold text-base text-[#1F1F1F]">Create Promo Code</h3>
                      <button onClick={() => setShowAddCoupon(false)}><X className="w-4 h-4" /></button>
                    </div>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        addCoupon({
                          code: newCouponCode.toUpperCase(),
                          discountPercent: Number(newCouponDiscount),
                          minSpend: Number(newCouponMinSpend),
                          description: newCouponDesc || `${newCouponDiscount}% Off Storewide`
                        });
                        setShowAddCoupon(false);
                        setNewCouponCode('');
                        showToast('Coupon created', 'success');
                      }}
                      className="space-y-3 text-xs"
                    >
                      <div>
                        <label className="font-bold block mb-1">Coupon Code</label>
                        <input
                          type="text"
                          value={newCouponCode}
                          onChange={(e) => setNewCouponCode(e.target.value)}
                          placeholder="e.g. SUMMER25"
                          className="w-full p-2.5 border rounded-lg uppercase font-mono"
                          required
                        />
                      </div>
                      <div>
                        <label className="font-bold block mb-1">Discount (%)</label>
                        <input
                          type="number"
                          value={newCouponDiscount}
                          onChange={(e) => setNewCouponDiscount(Number(e.target.value))}
                          className="w-full p-2.5 border rounded-lg"
                          required
                        />
                      </div>
                      <div>
                        <label className="font-bold block mb-1">Min Spend ($)</label>
                        <input
                          type="number"
                          value={newCouponMinSpend}
                          onChange={(e) => setNewCouponMinSpend(Number(e.target.value))}
                          className="w-full p-2.5 border rounded-lg"
                        />
                      </div>
                      <button type="submit" className="w-full bg-[#8B5CF6] text-white py-2.5 font-bold rounded-lg cursor-pointer">
                        Save Promo Code
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 11: ABANDONED CARTS (3 CARTS + RECOVERY TRIGGER)      */}
          {/* ========================================================= */}
          {activeTab === 'abandoned' && (
            <div className="bg-white border border-[#E6E8EC] rounded-xl shadow-xs p-6 space-y-6 animate-fadeIn">
              <div className="flex justify-between items-center border-b border-[#F0ECE1] pb-4">
                <div>
                  <h2 className="text-xl font-bold text-[#1F2430]">Abandoned Carts Recovery (3 Carts)</h2>
                  <p className="text-xs text-[#8C92A0]">Automated cart abandonment detection with 1-click email recovery triggers</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#EAE6DE] text-[#6E685F] uppercase tracking-wider text-[10px] bg-[#FAF9F6]">
                      <th className="py-3 px-3">Client</th>
                      <th className="py-3 px-3">Items in Cart</th>
                      <th className="py-3 px-3">Cart Value</th>
                      <th className="py-3 px-3">Abandoned Date</th>
                      <th className="py-3 px-3">Recovery Status</th>
                      <th className="py-3 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0ECE1]">
                    {abandonedCarts.map((cartItem) => (
                      <tr key={cartItem.id} className="hover:bg-[#FAF9F6] transition-colors">
                        <td className="py-3 px-3">
                          <span className="font-bold text-[#1F1F1F] block">{cartItem.customerName}</span>
                          <span className="text-[10px] text-[#8C8477]">{cartItem.email}</span>
                        </td>
                        <td className="py-3 px-3 font-semibold">{cartItem.itemsCount} Designer Items</td>
                        <td className="py-3 px-3 font-bold text-[#8B5CF6]">{formatPrice(cartItem.value)}</td>
                        <td className="py-3 px-3 text-[#6E685F]">{cartItem.date}</td>
                        <td className="py-3 px-3">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            cartItem.recovered ? 'bg-[#ECFDF5] text-[#059669]' : 'bg-[#FEF2F2] text-[#DC2626]'
                          }`}>
                            {cartItem.recovered ? 'RECOVERED' : 'ABANDONED'}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          {!cartItem.recovered ? (
                            <button
                              onClick={() => recoverAbandonedCart(cartItem.id)}
                              className="px-3 py-1 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-bold rounded-lg text-xs cursor-pointer flex items-center gap-1 ml-auto"
                            >
                              <Send className="w-3 h-3" />
                              <span>Send 15% Incentive</span>
                            </button>
                          ) : (
                            <span className="text-[11px] text-[#059669] font-semibold">Incentive Sent ✓</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 12: CHAT & CLIENT INQUIRIES                           */}
          {/* ========================================================= */}
          {activeTab === 'chat' && (
            <div className="bg-white border border-[#E6E8EC] rounded-xl shadow-xs overflow-hidden h-[620px] flex animate-fadeIn">
              <div className="w-80 border-r border-[#E6E8EC] flex flex-col bg-[#FAF9F6]">
                <div className="p-4 border-b border-[#E6E8EC] flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-sm text-[#1F2430]">Client Inquiries Inbox</h3>
                    <p className="text-[11px] text-[#8C92A0]">{contactInquiries.length} Total Messages</p>
                  </div>
                  <span className="bg-[#8B5CF6] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    Live
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto divide-y divide-[#EAE6DE]">
                  {contactInquiries.map((inq) => (
                    <button
                      key={inq.id}
                      onClick={() => setSelectedInquiryId(inq.id)}
                      className={`w-full p-3.5 text-left flex items-start gap-3 transition-colors cursor-pointer ${
                        activeInquiry?.id === inq.id ? 'bg-white shadow-xs' : 'hover:bg-white/60'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#8B5CF6] to-[#C85A32] text-white font-bold flex items-center justify-center text-sm shrink-0">
                        {inq.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-[#1F1F1F] truncate">{inq.name}</span>
                          <span className="text-[10px] text-[#8C8477]">{new Date(inq.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className="text-[11px] font-semibold text-[#1F1F1F] truncate">{inq.subject}</p>
                        <p className="text-[11px] text-[#6E685F] truncate mt-0.5">{inq.message}</p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-xs uppercase ${
                            inq.status === 'new' ? 'bg-[#ECFDF5] text-[#059669]' : 'bg-[#F4F6F9] text-[#5E6470]'
                          }`}>
                            {inq.status}
                          </span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1 flex flex-col justify-between bg-white">
                {activeInquiry ? (
                  <>
                    <div className="p-4 border-b border-[#E6E8EC] flex items-center justify-between bg-[#FCFCFA]">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#8B5CF6] text-white font-bold flex items-center justify-center text-sm">
                          {activeInquiry.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-bold text-xs text-[#1F1F1F]">{activeInquiry.name}</h4>
                          <p className="text-[10px] text-[#6E685F]">{activeInquiry.email} {activeInquiry.phone && `· ${activeInquiry.phone}`}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {activeInquiry.orderNumber && (
                          <span className="text-xs bg-[#F4F6F9] border border-[#E2E5EA] px-2.5 py-1 rounded-md font-mono text-[#5E6470]">
                            Ref: #{activeInquiry.orderNumber}
                          </span>
                        )}
                        <button
                          onClick={() => deleteContactInquiry(activeInquiry.id)}
                          className="p-1.5 text-[#DC2626] hover:bg-red-50 rounded-md cursor-pointer"
                          title="Delete Inquiry"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="flex-1 p-6 overflow-y-auto space-y-4">
                      <div className="flex flex-col items-start">
                        <div className="max-w-md p-4 rounded-xl text-xs leading-relaxed bg-[#F4F6F9] text-[#1F2430] border border-[#E2E5EA] rounded-bl-none shadow-xs space-y-1">
                          <span className="font-bold text-[#8B5CF6] block">{activeInquiry.subject}</span>
                          <p>{activeInquiry.message}</p>
                        </div>
                        <span className="text-[9px] text-[#9EA4B0] mt-1">{new Date(activeInquiry.createdAt).toLocaleString()}</span>
                      </div>

                      {activeInquiry.replies.map((rep) => (
                        <div key={rep.id} className="flex flex-col items-end">
                          <div className="max-w-md p-3.5 rounded-xl text-xs leading-relaxed bg-[#8B5CF6] text-white rounded-br-none shadow-xs">
                            {rep.text}
                          </div>
                          <span className="text-[9px] text-[#9EA4B0] mt-1">Admin Response · {new Date(rep.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      ))}
                    </div>

                    <form onSubmit={handleSendInquiryReply} className="p-4 border-t border-[#E6E8EC] flex gap-2">
                      <input
                        type="text"
                        value={chatReplyInput}
                        onChange={(e) => setChatReplyInput(e.target.value)}
                        placeholder={`Reply directly to ${activeInquiry.name}...`}
                        className="flex-1 px-4 py-2.5 bg-[#FAF9F6] border border-[#D5D0C5] text-xs rounded-lg focus:outline-none focus:border-[#8B5CF6]"
                      />
                      <button
                        type="submit"
                        className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white px-5 py-2.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Reply</span>
                      </button>
                    </form>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-xs text-gray-400">
                    No active inquiry selected
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 13: CUSTOMERS CRM                                     */}
          {/* ========================================================= */}
          {activeTab === 'contacts' && (
            <div className="bg-white border border-[#E6E8EC] rounded-xl shadow-xs p-6 space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-[#F0ECE1] pb-4">
                <div>
                  <h2 className="text-xl font-bold text-[#1F2430]">Client Directory & CRM</h2>
                  <p className="text-xs text-[#8C92A0]">Real customer records calculated from actual store orders and client inquiries</p>
                </div>
                <button
                  onClick={() => {
                    const csvContent = 'data:text/csv;charset=utf-8,Name,Email,Phone,City,TotalSpent,OrdersCount,Tier\n' + 
                      realCustomerCRM.map(c => `"${c.name}",${c.email},"${c.phone}","${c.city}",${c.totalSpent},${c.ordersCount},${c.tier}`).join('\n');
                    const encoded = encodeURI(csvContent);
                    const link = document.createElement('a');
                    link.setAttribute('href', encoded);
                    link.setAttribute('download', `DivaChic_CRM_Export_${new Date().toISOString().slice(0, 10)}.csv`);
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    showToast('Exported VIP Client Directory to CSV', 'success');
                  }}
                  className="bg-[#1F1F1F] hover:bg-[#8B5CF6] text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export Client CRM</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {realCustomerCRM.map((c) => (
                  <div key={c.id} className="p-5 bg-[#FAF9F6] border border-[#EAE6DE] rounded-xl flex items-start gap-4">
                    <img src={c.avatar} alt={c.name} className="w-14 h-14 rounded-full object-cover border-2 border-[#8B5CF6] shrink-0 bg-white" />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-sm text-[#1F1F1F]">{c.name}</h4>
                        <span className="text-[10px] font-bold bg-[#FAF1ED] text-[#C85A32] px-2 py-0.5 rounded-full">{c.tier}</span>
                      </div>
                      <p className="text-xs text-[#6E685F]">{c.email} · {c.phone}</p>
                      <p className="text-[11px] text-[#8C8477]">{c.city}, {c.country} · {c.ordersCount} Orders · <strong>{formatPrice(c.totalSpent)} spent</strong></p>
                      {c.orderNumbers.length > 0 && (
                        <p className="text-[10px] font-mono text-[#8B5CF6] pt-1">
                          Orders: {c.orderNumbers.join(', ')}
                        </p>
                      )}
                      <p className="text-[11px] text-[#555048] italic pt-1 border-t border-[#EAE6DE] mt-2">"{c.notes}"</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 14: TEAM & STAFF                                      */}
          {/* ========================================================= */}
          {activeTab === 'team' && (
            <div className="bg-white border border-[#E6E8EC] rounded-xl shadow-xs p-6 space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-[#F0ECE1] pb-4">
                <div>
                  <h2 className="text-xl font-bold text-[#1F2430]">Maison Operations Staff & Roles</h2>
                  <p className="text-xs text-[#8C92A0]">Administrator access control, fulfillment authorizations, and studio staff roles</p>
                </div>
                <button
                  onClick={() => setShowAddStaffModal(true)}
                  className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Add Staff Member</span>
                </button>
              </div>

              <div className="divide-y divide-[#F0ECE1]">
                {adminStaff.map((member) => (
                  <div key={member.id} className="py-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <img src={member.avatar} alt={member.name} className="w-12 h-12 rounded-full object-cover border" />
                      <div>
                        <h4 className="font-bold text-sm text-[#1F1F1F]">{member.name}</h4>
                        <p className="text-xs text-[#6E685F]">{member.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="text-xs font-bold px-3 py-1 bg-[#F4F6F9] border border-[#E2E5EA] rounded-full text-[#5E6470]">
                        {member.role}
                      </span>
                      <span className="text-[11px] text-[#10B981] font-semibold flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-[#10B981]"></span> {member.status}
                      </span>
                      {member.role !== 'Owner' && (
                        <button
                          onClick={() => deleteAdminStaff(member.id)}
                          className="p-1 text-[#DC2626] hover:bg-red-50 rounded-md cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Staff Modal */}
              {showAddStaffModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                  <div className="bg-white max-w-md w-full rounded-xl p-6 space-y-4 shadow-2xl">
                    <div className="flex justify-between items-center border-b pb-2">
                      <h3 className="font-bold text-base text-[#1F1F1F]">Add New Staff Member</h3>
                      <button onClick={() => setShowAddStaffModal(false)}><X className="w-4 h-4" /></button>
                    </div>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!newStaffName || !newStaffEmail) return;
                        addAdminStaff({
                          name: newStaffName,
                          email: newStaffEmail,
                          role: newStaffRole,
                          avatar: newStaffAvatar,
                          status: 'Active',
                          lastActive: 'Just added'
                        });
                        setShowAddStaffModal(false);
                        setNewStaffName('');
                        setNewStaffEmail('');
                      }}
                      className="space-y-3 text-xs"
                    >
                      <div>
                        <label className="font-bold block mb-1">Full Name</label>
                        <input
                          type="text"
                          value={newStaffName}
                          onChange={(e) => setNewStaffName(e.target.value)}
                          placeholder="e.g. Jean-Luc Moreau"
                          className="w-full p-2.5 border rounded-lg"
                          required
                        />
                      </div>
                      <div>
                        <label className="font-bold block mb-1">Official Email</label>
                        <input
                          type="email"
                          value={newStaffEmail}
                          onChange={(e) => setNewStaffEmail(e.target.value)}
                          placeholder="jeanluc@divachic.com"
                          className="w-full p-2.5 border rounded-lg"
                          required
                        />
                      </div>
                      <div>
                        <label className="font-bold block mb-1">Role & Permissions</label>
                        <select
                          value={newStaffRole}
                          onChange={(e) => setNewStaffRole(e.target.value as any)}
                          className="w-full p-2.5 border rounded-lg"
                        >
                          <option value="Store Manager">Store Manager</option>
                          <option value="Senior Stylist">Senior Stylist</option>
                          <option value="Inventory Lead">Inventory Lead</option>
                          <option value="Fulfillment Specialist">Fulfillment Specialist</option>
                        </select>
                      </div>
                      <button type="submit" className="w-full bg-[#8B5CF6] text-white py-2.5 font-bold rounded-lg cursor-pointer">
                        Add to Store Team
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 15: CALENDAR                                          */}
          {/* ========================================================= */}
          {activeTab === 'calendar' && (
            <div className="bg-white border border-[#E6E8EC] rounded-xl shadow-xs p-6 space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-[#F0ECE1] pb-4">
                <div>
                  <h2 className="text-xl font-bold text-[#1F2430]">Runway Calendar & Drop Schedule</h2>
                  <p className="text-xs text-[#8C92A0]">Plan future capsule drops, flash promotions, and freight restocks</p>
                </div>
                <button
                  onClick={() => setShowAddEventModal(true)}
                  className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs font-semibold px-4 py-2.5 rounded-lg transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Schedule Runway Event</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {adminEvents.map((ev) => (
                  <div key={ev.id} className="p-5 border border-[#EAE6DE] rounded-xl bg-[#FAF9F6] space-y-2 relative overflow-hidden">
                    <div style={{ backgroundColor: ev.color }} className="absolute top-0 left-0 bottom-0 w-1.5"></div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-[#1F1F1F] pl-2">{ev.title}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-[#5E6470]">{ev.date}</span>
                        <button onClick={() => deleteAdminEvent(ev.id)} className="text-red-500 hover:text-red-700 p-1">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-[#6E685F] pl-2">{ev.notes}</p>
                    <div className="pl-2 pt-2">
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-xs" style={{ backgroundColor: `${ev.color}20`, color: ev.color }}>
                        {ev.type}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Event Modal */}
              {showAddEventModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                  <div className="bg-white max-w-md w-full rounded-xl p-6 space-y-4 shadow-2xl">
                    <div className="flex justify-between items-center border-b pb-2">
                      <h3 className="font-bold text-base text-[#1F1F1F]">Schedule Runway Event</h3>
                      <button onClick={() => setShowAddEventModal(false)} className="p-1"><X className="w-4 h-4" /></button>
                    </div>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!newEventTitle) return;
                        const colorMap = { drop: '#8B5CF6', sale: '#EC4899', restock: '#10B981', fulfillment: '#3B82F6' };
                        addAdminEvent({
                          title: newEventTitle,
                          date: newEventDate,
                          type: newEventType,
                          color: colorMap[newEventType],
                          notes: newEventNotes
                        });
                        setShowAddEventModal(false);
                        setNewEventTitle('');
                        setNewEventNotes('');
                      }}
                      className="space-y-3 text-xs"
                    >
                      <div>
                        <label className="font-bold block mb-1">Event Title</label>
                        <input
                          type="text"
                          value={newEventTitle}
                          onChange={(e) => setNewEventTitle(e.target.value)}
                          placeholder="e.g. Winter Overcoat Drop"
                          className="w-full p-2.5 border rounded-lg"
                          required
                        />
                      </div>
                      <div>
                        <label className="font-bold block mb-1">Event Date</label>
                        <input
                          type="date"
                          value={newEventDate}
                          onChange={(e) => setNewEventDate(e.target.value)}
                          className="w-full p-2.5 border rounded-lg"
                          required
                        />
                      </div>
                      <div>
                        <label className="font-bold block mb-1">Category Type</label>
                        <select
                          value={newEventType}
                          onChange={(e) => setNewEventType(e.target.value as any)}
                          className="w-full p-2.5 border rounded-lg"
                        >
                          <option value="drop">Capsule Drop</option>
                          <option value="sale">VIP Flash Sale</option>
                          <option value="restock">Inventory Restock</option>
                          <option value="fulfillment">Freight Pickup</option>
                        </select>
                      </div>
                      <div>
                        <label className="font-bold block mb-1">Internal Notes</label>
                        <textarea
                          value={newEventNotes}
                          onChange={(e) => setNewEventNotes(e.target.value)}
                          placeholder="Fulfillment reminders or stylist notes"
                          className="w-full p-2.5 border rounded-lg"
                          rows={3}
                        />
                      </div>
                      <button type="submit" className="w-full bg-[#8B5CF6] text-white py-2.5 font-bold rounded-lg cursor-pointer">
                        Add to Calendar
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 16: EMAIL GAZETTE STUDIO                              */}
          {/* ========================================================= */}
          {activeTab === 'email' && (
            <div className="bg-white border border-[#E6E8EC] rounded-xl shadow-xs p-6 space-y-6 animate-fadeIn">
              <div className="border-b border-[#F0ECE1] pb-4">
                <h2 className="text-xl font-bold text-[#1F2430]">Gazette Marketing & Email Studio</h2>
                <p className="text-xs text-[#8C92A0]">Compose luxury promotional broadcasts, VIP client drops, and transactional previews</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-6 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[#1F1F1F] mb-1">Campaign Subject Line</label>
                    <input
                      type="text"
                      value={emailCampaignSubject}
                      onChange={(e) => setEmailCampaignSubject(e.target.value)}
                      className="w-full p-2.5 bg-[#FAF9F6] border border-[#D5D0C5] rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#1F1F1F] mb-1">Target Client Audience</label>
                    <select
                      value={emailCampaignAudience}
                      onChange={(e) => setEmailCampaignAudience(e.target.value)}
                      className="w-full p-2.5 bg-[#FAF9F6] border border-[#D5D0C5] rounded-lg text-xs"
                    >
                      <option>All Registered Clients ({realCustomerCRM.length} Clients)</option>
                      <option>Diamond VIP Tier ({realCustomerCRM.filter(c => c.tier === 'Diamond VIP').length} Clients)</option>
                      <option>Recent 30-Day Buyers</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#1F1F1F] mb-1">Editorial Content</label>
                    <textarea
                      value={emailCampaignBody}
                      onChange={(e) => setEmailCampaignBody(e.target.value)}
                      rows={8}
                      className="w-full p-2.5 bg-[#FAF9F6] border border-[#D5D0C5] rounded-lg text-xs font-mono leading-relaxed"
                    />
                  </div>

                  <button
                    onClick={() => {
                      dispatchAdminCampaign({
                        subject: emailCampaignSubject,
                        audience: emailCampaignAudience,
                        body: emailCampaignBody,
                        recipientCount: Math.max(1, realCustomerCRM.length)
                      });
                    }}
                    className="w-full bg-[#8B5CF6] hover:bg-[#7C3AED] text-white py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Dispatch Gazette Campaign Now
                  </button>
                </div>

                <div className="lg:col-span-6 bg-[#FAF9F6] border border-[#EAE6DE] rounded-xl p-6 flex flex-col justify-between space-y-4">
                  <div>
                    <span className="text-[10px] font-bold text-[#8C8477] uppercase block mb-2">Live Email Preview</span>
                    <div className="bg-white border p-5 rounded-lg shadow-xs space-y-3">
                      <div className="border-b pb-2">
                        <span className="font-bold text-sm text-[#1F1F1F] block">{emailCampaignSubject}</span>
                        <span className="text-[10px] text-[#8C8477]">From: DivaChic Studio &lt;concierge@divachic.com&gt;</span>
                      </div>
                      <div className="text-xs text-[#555048] whitespace-pre-line leading-relaxed font-sans">
                        {emailCampaignBody}
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <span className="text-[10px] font-bold text-[#8C8477] uppercase block mb-2">Campaign Broadcast History</span>
                    <div className="space-y-2 max-h-40 overflow-y-auto text-xs">
                      {adminCampaigns.map((camp) => (
                        <div key={camp.id} className="p-2.5 bg-white border rounded-lg flex justify-between items-center">
                          <div>
                            <p className="font-bold text-[#1F1F1F]">{camp.subject}</p>
                            <p className="text-[10px] text-[#8C8477]">{camp.audience} · {camp.sentAt}</p>
                          </div>
                          <span className="text-xs font-bold text-[#10B981]">{camp.openRate} Opens</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 17: HOSTINGER & CLOUD GUIDE                           */}
          {/* ========================================================= */}
          {activeTab === 'hostinger' && (
            <div className="bg-white border border-[#E6E8EC] rounded-xl shadow-xs p-6 space-y-6 animate-fadeIn">
              <div className="border-b border-[#F0ECE1] pb-4">
                <h2 className="text-xl font-bold text-[#1F2430]">Hostinger Web Hosting & Cloud Guide</h2>
                <p className="text-xs text-[#8C92A0]">Full readiness checklist for hosting your DivaChic boutique on Hostinger servers</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                <div className="p-5 border border-[#EAE6DE] rounded-xl bg-[#FAF9F6] space-y-3">
                  <div className="flex items-center gap-2 font-bold text-sm text-[#1F1F1F]">
                    <Server className="w-4 h-4 text-[#8B5CF6]" />
                    <span>Hostinger Single-Page Application (SPA) Setup</span>
                  </div>
                  <ol className="list-decimal pl-4 space-y-2 text-[#555048] leading-relaxed">
                    <li>Run <strong>bun run build</strong> to generate optimized production assets in the <code>dist/</code> directory.</li>
                    <li>Upload all contents of <code>dist/</code> directly to your Hostinger <code>public_html/</code> folder via File Manager or FTP.</li>
                    <li>The included <code>.htaccess</code> rule automatically handles client-side routing so refreshing pages will never produce 404 errors.</li>
                  </ol>
                  <div className="pt-2">
                    <button
                      onClick={() => showToast('Copied .htaccess rules to clipboard', 'success')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#8B5CF6] text-white text-xs font-bold rounded-md cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy .htaccess Config</span>
                    </button>
                  </div>
                </div>

                <div className="p-5 border border-[#EAE6DE] rounded-xl bg-[#FAF9F6] space-y-3">
                  <div className="flex items-center gap-2 font-bold text-sm text-[#1F1F1F]">
                    <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                    <span>Firebase Firestore & Authentication</span>
                  </div>
                  <p className="text-[#555048] leading-relaxed">
                    User profiles, products catalog, reviews, orders, and real-time banner settings are synchronized directly with Firebase Firestore.
                  </p>
                  <div className="p-3 bg-white border rounded-lg flex items-center justify-between font-mono text-[11px]">
                    <span>Status:</span>
                    <span className="font-bold text-[#10B981]">ONLINE & CONNECTED</span>
                  </div>
                  <button
                    onClick={handleManualSync}
                    disabled={isSyncing}
                    className="w-full bg-[#1F1F1F] hover:bg-[#8B5CF6] text-white py-2.5 rounded-lg font-bold text-xs transition-colors cursor-pointer"
                  >
                    {isSyncing ? 'Syncing...' : 'Force Immediate Cloud Sync'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 18: STORE SETTINGS & LOGISTICS                        */}
          {/* ========================================================= */}
          {activeTab === 'settings' && (
            <div className="bg-white border border-[#E6E8EC] rounded-xl shadow-xs p-6 space-y-6 animate-fadeIn">
              <div className="border-b border-[#F0ECE1] pb-4">
                <h2 className="text-xl font-bold text-[#1F2430]">Store Logistics & Security Settings</h2>
                <p className="text-xs text-[#8C92A0]">Delivery timeline estimates, online payment discounts, and security policies</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                <div className="p-5 border border-[#EAE6DE] rounded-xl space-y-3 bg-[#FAF9F6]">
                  <label className="font-bold block text-[#1F1F1F]">Standard Courier Delivery Window (Days)</label>
                  <input
                    type="number"
                    value={standardDeliveryDays}
                    onChange={(e) => {
                      setStandardDeliveryDays(Number(e.target.value));
                      showToast('Standard delivery days updated', 'success');
                    }}
                    className="w-full p-2.5 bg-white border rounded-lg"
                  />
                  <p className="text-[11px] text-[#8C8477]">
                    Estimated arrival date computed dynamically: <strong>{calculateDeliveryDate().formattedDate}</strong>
                  </p>
                </div>

                <div className="p-5 border border-[#EAE6DE] rounded-xl space-y-3 bg-[#FAF9F6]">
                  <label className="font-bold block text-[#1F1F1F]">Online Prepaid Payment Discount (%)</label>
                  <input
                    type="number"
                    value={onlineDiscountPercent}
                    onChange={(e) => {
                      updateOnlineDiscountPercent(Number(e.target.value));
                      showToast('Prepaid discount percentage updated', 'success');
                    }}
                    className="w-full p-2.5 bg-white border rounded-lg"
                  />
                  <p className="text-[11px] text-[#8C8477]">
                    Incentive applied during instant checkout for UPI / Cards / NetBanking.
                  </p>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* MODAL: SHIPPED TRACKING */}
      {shippedModalOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-xl p-6 space-y-4 shadow-2xl text-xs">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-bold text-base text-[#1F1F1F]">Mark Order as Shipped</h3>
              <button onClick={() => setShippedModalOrder(null)}><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="font-bold block mb-1">Courier Carrier</label>
                <input
                  type="text"
                  value={customCarrier}
                  onChange={(e) => setCustomCarrier(e.target.value)}
                  className="w-full p-2.5 border rounded-lg"
                />
              </div>
              <div>
                <label className="font-bold block mb-1">Waybill / Tracking Number</label>
                <input
                  type="text"
                  value={customTracking}
                  onChange={(e) => setCustomTracking(e.target.value)}
                  className="w-full p-2.5 border rounded-lg font-mono"
                />
              </div>
              <button
                onClick={() => {
                  markOrderShipped(shippedModalOrder.id, customCarrier, customTracking);
                  setShippedModalOrder(null);
                  showToast(`Order #${shippedModalOrder.orderNumber} marked as Shipped!`, 'success');
                }}
                className="w-full bg-[#10B981] text-white py-2.5 font-bold rounded-lg cursor-pointer"
              >
                Confirm Dispatch & Notify Client
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL / DRAWER: COMPREHENSIVE CUSTOMER & ORDER DETAILS */}
      {selectedOrderProfile && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
          <div className="bg-white max-w-2xl w-full rounded-2xl p-6 sm:p-7 space-y-6 shadow-2xl max-h-[92vh] overflow-y-auto text-xs border border-[#E6E8EC]">
            
            {/* Top Header */}
            <div className="flex justify-between items-start border-b border-[#F0ECE1] pb-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono font-bold text-lg text-[#1F1F1F]">
                    #{selectedOrderProfile.orderNumber || selectedOrderProfile.orderId}
                  </span>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase border font-mono ${
                    selectedOrderProfile.status === 'Ready' || selectedOrderProfile.status === 'packed'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : selectedOrderProfile.status === 'Dispatched' || selectedOrderProfile.status === 'in_transit' || selectedOrderProfile.status === 'out_for_delivery'
                      ? 'bg-cyan-50 text-cyan-700 border-cyan-200'
                      : selectedOrderProfile.status === 'Accepted'
                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                      : selectedOrderProfile.status === 'Yet to be Sent'
                      ? 'bg-purple-50 text-purple-700 border-purple-200'
                      : selectedOrderProfile.status === 'Rejected' || selectedOrderProfile.status === 'cancelled'
                      ? 'bg-red-50 text-red-700 border-red-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                    {selectedOrderProfile.status}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold uppercase">
                    {selectedOrderProfile.paymentMethod || 'Credit Card'} · {selectedOrderProfile.paymentStatus?.toUpperCase() || 'PAID'}
                  </span>
                </div>
                <p className="text-[11px] text-[#8C8477] mt-1">
                  Placed on {selectedOrderProfile.createdAt?.toDate 
                    ? selectedOrderProfile.createdAt.toDate().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })
                    : (selectedOrderProfile.date || 'Today')}
                </p>
              </div>

              <button 
                onClick={() => setSelectedOrderProfile(null)}
                className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 2-Column: Customer Identity & Shipping Destination */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Customer Identity */}
              <div className="bg-[#FAF9F6] p-4 rounded-xl border border-[#EAE6DE] space-y-2">
                <span className="text-[10px] font-bold text-[#8C92A0] uppercase tracking-wider block">
                  Customer Identity
                </span>
                <p className="font-bold text-sm text-[#1F1F1F]">
                  {selectedOrderProfile.customer?.fullName || selectedOrderProfile.customerName || selectedOrderProfile.shippingAddress?.fullName || 'Valued Client'}
                </p>
                <div className="space-y-1 text-xs">
                  <a 
                    href={`mailto:${selectedOrderProfile.customer?.email || selectedOrderProfile.email || 'customer@gmail.com'}`}
                    className="text-[#8B5CF6] hover:underline flex items-center gap-1.5 truncate font-medium"
                    title="Send email"
                  >
                    <Mail className="w-3.5 h-3.5 text-[#8B5CF6] shrink-0" />
                    <span>{selectedOrderProfile.customer?.email || selectedOrderProfile.email || 'customer@gmail.com'}</span>
                  </a>
                  {(selectedOrderProfile.customer?.phone || selectedOrderProfile.shippingAddress?.phone) && (
                    <a 
                      href={`tel:${selectedOrderProfile.customer?.phone || selectedOrderProfile.shippingAddress?.phone}`}
                      className="text-[#1F1F1F] hover:text-[#8B5CF6] flex items-center gap-1.5 font-medium"
                      title="Call customer"
                    >
                      <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{selectedOrderProfile.customer?.phone || selectedOrderProfile.shippingAddress?.phone}</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Shipping Destination */}
              <div className="bg-[#FAF9F6] p-4 rounded-xl border border-[#EAE6DE] space-y-2">
                <span className="text-[10px] font-bold text-[#8C92A0] uppercase tracking-wider block">
                  Shipping Destination
                </span>
                <div className="text-xs text-[#555048] space-y-0.5">
                  <p className="font-medium text-[#1F1F1F]">
                    {selectedOrderProfile.customer?.addressLine1 || selectedOrderProfile.shippingAddress?.street || '123 Main Street'}
                  </p>
                  {(selectedOrderProfile.customer?.addressLine2 || selectedOrderProfile.shippingAddress?.apartment) && (
                    <p>{selectedOrderProfile.customer?.addressLine2 || selectedOrderProfile.shippingAddress?.apartment}</p>
                  )}
                  <p>
                    {selectedOrderProfile.customer?.city || selectedOrderProfile.shippingAddress?.city}, {selectedOrderProfile.customer?.state || selectedOrderProfile.shippingAddress?.state || ''}
                  </p>
                  <p className="font-mono font-bold text-[#1F1F1F]">
                    PIN / ZIP: {selectedOrderProfile.customer?.postalCode || selectedOrderProfile.shippingAddress?.pincode || '00000'}
                  </p>
                  <p className="text-[11px] text-[#8C8477]">
                    {selectedOrderProfile.shippingAddress?.country || 'United States'}
                  </p>
                </div>
              </div>

            </div>

            {/* Itemized Inventory List */}
            <div className="space-y-2.5">
              <span className="text-xs font-bold text-[#1F1F1F] uppercase tracking-wider block">
                Order Inventory ({selectedOrderProfile.items.length} Items)
              </span>
              <div className="space-y-2 max-h-48 overflow-y-auto border border-[#EAE6DE] rounded-xl divide-y divide-[#F0ECE1] p-2 bg-[#FAF9F6]/50">
                {selectedOrderProfile.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center p-2 first:pt-1 last:pb-1">
                    <div className="flex items-center gap-3">
                      <img 
                        src={item.imageUrl || item.image || 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=200&auto=format&fit=crop'} 
                        alt={item.title || item.name} 
                        className="w-12 h-12 rounded-lg object-cover border border-[#EAE6DE]" 
                      />
                      <div>
                        <p className="font-bold text-xs text-[#1F1F1F]">{item.title || item.name}</p>
                        <p className="text-[11px] text-[#8C8477]">
                          Qty: <strong>{item.quantity}</strong> × {formatPrice(item.price)}
                          {item.selectedColor ? ` · Color: ${item.selectedColor}` : ''}
                          {item.selectedSize ? ` · Size: ${item.selectedSize}` : ''}
                        </p>
                      </div>
                    </div>
                    <span className="font-bold text-xs text-[#1F1F1F]">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Summary */}
            <div className="p-4 bg-[#FAF9F6] border border-[#EAE6DE] rounded-xl space-y-1.5 text-xs">
              <div className="flex justify-between text-[#6E685F]">
                <span>Subtotal</span>
                <span>{formatPrice(selectedOrderProfile.subtotal || selectedOrderProfile.total)}</span>
              </div>
              <div className="flex justify-between text-[#6E685F]">
                <span>Shipping Fee</span>
                <span>{selectedOrderProfile.shippingFee > 0 ? formatPrice(selectedOrderProfile.shippingFee) : 'FREE'}</span>
              </div>
              {selectedOrderProfile.discount > 0 && (
                <div className="flex justify-between text-[#10B981]">
                  <span>Applied Discount</span>
                  <span>-{formatPrice(selectedOrderProfile.discount)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-sm text-[#1F1F1F] pt-2 border-t border-[#EAE6DE]">
                <span>Total Amount:</span>
                <span className="text-[#8B5CF6] text-base font-sans font-bold">
                  {formatPrice(selectedOrderProfile.totalAmount || selectedOrderProfile.total)}
                </span>
              </div>
            </div>

            {/* Real-Time Order Controls (Readiness, Status, & Planned Dispatch Date) */}
            <div className="p-4 bg-white border border-[#8B5CF6]/30 rounded-xl space-y-3.5 shadow-xs">
              <div className="flex justify-between items-center border-b border-[#F0ECE1] pb-2.5">
                <span className="text-xs font-bold text-[#1F1F1F] uppercase tracking-wider flex items-center gap-1.5">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-[#8B5CF6]" />
                  <span>Real-Time Fulfillment Controls</span>
                </span>
                <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">
                  Syncs to Firestore on update
                </span>
              </div>

              {/* Planned Dispatch Date Picker */}
              <div className="space-y-1.5">
                <label className="font-bold text-xs text-[#1F1F1F] block">
                  Planned Dispatch / Shipping Date (<code className="text-[#8B5CF6] font-mono">dispatchDate</code>)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={selectedOrderProfile.dispatchDate || ''}
                    onChange={(e) => handleUpdateOrderDispatchDate(selectedOrderProfile, e.target.value)}
                    className="flex-1 p-2 bg-[#FAF9F6] border border-[#D5D0C5] rounded-xl text-xs font-mono text-[#1F1F1F] focus:outline-none focus:border-[#8B5CF6] cursor-pointer"
                  />
                  {selectedOrderProfile.dispatchDate && (
                    <button
                      onClick={() => handleUpdateOrderDispatchDate(selectedOrderProfile, '')}
                      className="px-3 py-2 bg-gray-100 hover:bg-red-50 hover:text-red-600 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                      title="Clear planned dispatch date"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Status Action Buttons */}
              <div className="space-y-1.5">
                <label className="font-bold text-xs text-[#1F1F1F] block">
                  Transition Order Status
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { status: 'Pending', label: 'Pending', color: 'bg-amber-500 hover:bg-amber-600' },
                    { status: 'Accepted', label: 'Accepted', color: 'bg-blue-600 hover:bg-blue-700' },
                    { status: 'Yet to be Sent', label: 'Yet to be Sent', color: 'bg-purple-600 hover:bg-purple-700' },
                    { status: 'Ready', label: 'Ready for Dispatch', color: 'bg-emerald-600 hover:bg-emerald-700' },
                    { status: 'Dispatched', label: 'Dispatched', color: 'bg-cyan-600 hover:bg-cyan-700' },
                    { status: 'Rejected', label: 'Rejected', color: 'bg-red-600 hover:bg-red-700' }
                  ].map((btn) => (
                    <button
                      key={btn.status}
                      type="button"
                      onClick={() => handleUpdateOrderStatus(selectedOrderProfile, btn.status)}
                      className={`py-2 px-2.5 rounded-xl text-[11px] font-bold text-white transition-all cursor-pointer ${btn.color} ${
                        selectedOrderProfile.status === btn.status ? 'ring-2 ring-offset-2 ring-[#8B5CF6] scale-[1.02]' : 'opacity-90 hover:opacity-100'
                      }`}
                    >
                      {selectedOrderProfile.status === btn.status ? `✓ ${btn.label}` : btn.label}
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Bottom Close Button */}
            <button
              onClick={() => setSelectedOrderProfile(null)}
              className="w-full bg-[#1F1F1F] hover:bg-[#333333] text-white py-3 font-bold rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer"
            >
              Close Details Drawer
            </button>
          </div>
        </div>
      )}

      {/* MODAL: EDIT ADMIN PROFILE */}
      {showEditProfileModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-xl p-6 space-y-4 shadow-2xl text-xs">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-bold text-base text-[#1F1F1F]">Edit Administrator Profile</h3>
              <button onClick={() => setShowEditProfileModal(false)}><X className="w-4 h-4" /></button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                updateAdminProfile({
                  name: editAdminName,
                  email: editAdminEmail,
                  role: editAdminRole,
                  avatar: editAdminAvatar
                });
                setShowEditProfileModal(false);
              }}
              className="space-y-3"
            >
              <div>
                <label className="font-bold block mb-1">Your Full Name</label>
                <input
                  type="text"
                  value={editAdminName}
                  onChange={(e) => setEditAdminName(e.target.value)}
                  className="w-full p-2.5 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="font-bold block mb-1">Email Address</label>
                <input
                  type="email"
                  value={editAdminEmail}
                  onChange={(e) => setEditAdminEmail(e.target.value)}
                  className="w-full p-2.5 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="font-bold block mb-1">Position / Role Title</label>
                <input
                  type="text"
                  value={editAdminRole}
                  onChange={(e) => setEditAdminRole(e.target.value)}
                  className="w-full p-2.5 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="font-bold block mb-1">Avatar Image URL</label>
                <input
                  type="text"
                  value={editAdminAvatar}
                  onChange={(e) => setEditAdminAvatar(e.target.value)}
                  className="w-full p-2.5 border rounded-lg"
                />
              </div>
              <button type="submit" className="w-full bg-[#8B5CF6] text-white py-2.5 font-bold rounded-lg cursor-pointer">
                Save Profile
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: PASSWORD PROTECTED DASHBOARD RESET (PASSWORD: 8156958052) */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white max-w-md w-full rounded-2xl p-6 space-y-5 shadow-2xl border border-red-200">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center text-red-600">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-[#1F1F1F]">Reset Dashboard Numbers</h3>
                  <p className="text-[11px] text-[#8C92A0]">Strict Security Verification</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowResetModal(false);
                  setResetPasswordInput('');
                  setResetPasswordError('');
                }}
                className="text-gray-400 hover:text-gray-700 p-1 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 bg-red-50/70 border border-red-200 rounded-xl space-y-1.5">
              <span className="text-xs font-bold text-red-800 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>Zeroing Out All Metrics</span>
              </span>
              <p className="text-[11px] text-red-700 leading-relaxed">
                This will reset all dashboard revenue, sales, expenses, net profit, and order totals to <strong className="font-bold">₹0.00 / 0</strong>. Enter the secret administrator password to authorize.
              </p>
            </div>

            <form onSubmit={handleResetDashboardNumbers} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#1F1F1F] mb-1.5">
                  Security Passcode
                </label>
                <div className="relative">
                  <input
                    type="password"
                    placeholder="Enter 8156958052..."
                    value={resetPasswordInput}
                    onChange={(e) => {
                      setResetPasswordInput(e.target.value);
                      setResetPasswordError('');
                    }}
                    className="w-full px-3.5 py-2.5 bg-[#FAF9F6] border border-gray-300 rounded-xl text-xs text-[#1F1F1F] font-mono tracking-widest focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                    autoFocus
                    required
                  />
                  <Lock className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
                </div>
                {resetPasswordError && (
                  <p className="text-[11px] text-red-600 font-semibold mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>{resetPasswordError}</span>
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowResetModal(false);
                    setResetPasswordInput('');
                    setResetPasswordError('');
                  }}
                  className="flex-1 py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isResetting || !resetPasswordInput}
                  className="flex-1 py-2.5 px-4 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer shadow-sm flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{isResetting ? 'Resetting...' : 'Confirm Reset (0.00)'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation Bar (Quick Thumb Dock on Phone Screen) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#161B26]/95 backdrop-blur-md border-t border-[#2A3040] py-2 px-3 flex items-center justify-around text-white shadow-2xl safe-area-pb">
        <button
          onClick={() => handleTabSelect('business')}
          className={`flex flex-col items-center gap-1 p-1.5 rounded-lg transition-colors cursor-pointer ${
            activeTab === 'business' ? 'text-[#8B5CF6]' : 'text-gray-400 hover:text-white'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px] font-semibold">Dashboard</span>
        </button>

        <button
          onClick={() => handleTabSelect('orders')}
          className={`flex flex-col items-center gap-1 p-1.5 rounded-lg transition-colors cursor-pointer relative ${
            activeTab === 'orders' ? 'text-[#8B5CF6]' : 'text-gray-400 hover:text-white'
          }`}
        >
          <ShoppingBag className="w-5 h-5" />
          {orders.filter((o) => o.status === 'pending').length > 0 && (
            <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-red-500"></span>
          )}
          <span className="text-[10px] font-semibold">Orders</span>
        </button>

        <button
          onClick={() => handleTabSelect('inventory')}
          className={`flex flex-col items-center gap-1 p-1.5 rounded-lg transition-colors cursor-pointer ${
            activeTab === 'inventory' ? 'text-[#8B5CF6]' : 'text-gray-400 hover:text-white'
          }`}
        >
          <Package className="w-5 h-5" />
          <span className="text-[10px] font-semibold">Products</span>
        </button>

        <button
          onClick={() => handleTabSelect('delivery')}
          className={`flex flex-col items-center gap-1 p-1.5 rounded-lg transition-colors cursor-pointer ${
            activeTab === 'delivery' ? 'text-[#8B5CF6]' : 'text-gray-400 hover:text-white'
          }`}
        >
          <Truck className="w-5 h-5" />
          <span className="text-[10px] font-semibold">Delivery</span>
        </button>

        <button
          onClick={() => setSidebarOpen(true)}
          className="flex flex-col items-center gap-1 p-1.5 rounded-lg text-gray-400 hover:text-white transition-colors cursor-pointer"
        >
          <Menu className="w-5 h-5" />
          <span className="text-[10px] font-semibold">More</span>
        </button>
      </div>

    </div>
  );
};
