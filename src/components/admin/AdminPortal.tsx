import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { 
  Package, 
  DollarSign, 
  TrendingUp, 
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
  Image as ImageIcon
} from 'lucide-react';
import { Product, Order, OrderStatus, Coupon, Review } from '../../types';
import { extractYouTubeVideoId, ProductVideoEmbed } from '../product/ProductVideoEmbed';

export const AdminPortal: React.FC = () => {
  const { 
    products, 
    orders, 
    coupons, 
    updateOrderStatus, 
    approveOrder,
    markOrderShipped,
    cancelOrder,
    refundOrder,
    updateProductStock, 
    addProduct, 
    updateProduct,
    deleteProduct, 
    addCoupon, 
    deleteCoupon,
    formatPrice, 
    abandonedCarts, 
    recoverAbandonedCart,
    standardDeliveryDays,
    setStandardDeliveryDays,
    calculateDeliveryDate,
    showToast,
    setActivePage,
    openProductDetail,
    isSupabaseOnline,
    onlineDiscountPercent,
    updateOnlineDiscountPercent,
    siteBanners,
    updateSiteBanners,
    syncSupabaseData,
    isAdminAuthenticated,
    verifyAdminPassword,
    lockAdmin
  } = useStore();

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

  const [isSyncing, setIsSyncing] = useState(false);

  const handleManualSync = async () => {
    setIsSyncing(true);
    await syncSupabaseData();
    setIsSyncing(false);
    showToast('Supabase Cloud Sync Complete', 'success', 'Products, settings, and orders synchronized.');
  };

  const [adminTab, setAdminTab] = useState<'orders' | 'inventory' | 'categories' | 'journal' | 'pages' | 'banners' | 'settings' | 'coupons' | 'abandoned'>('orders');

  // Stats calculation
  const totalRevenue = orders.reduce((sum, ord) => sum + ord.total, 0);
  const totalItemsSold = orders.reduce((sum, ord) => sum + ord.items.reduce((s, i) => s + i.quantity, 0), 0);
  const averageOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;
  const lowStockCount = products.filter((p) => p.stockQuantity < 5).length;
  const pendingFulfillmentCount = orders.filter((o) => o.status === 'pending' || o.status === 'processing' || o.status === 'packed').length;

  // Selected Order for Detailed Profile Modal
  const [selectedOrderProfile, setSelectedOrderProfile] = useState<Order | null>(null);
  
  // Shipping Label Print Modal
  const [shippingLabelOrder, setShippingLabelOrder] = useState<Order | null>(null);

  // Mark Shipped Modal
  const [shippedModalOrder, setShippedModalOrder] = useState<Order | null>(null);
  const [customCarrier, setCustomCarrier] = useState('DHL Express Nordic');
  const [customTracking, setCustomTracking] = useState('');

  // Cancel / Refund Prompt
  const [cancelModalOrder, setCancelModalOrder] = useState<Order | null>(null);
  const [cancelReason, setCancelReason] = useState('Customer requested order change');

  // Bulk Selection & Edit Product State
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [taxInvoiceOrder, setTaxInvoiceOrder] = useState<Order | null>(null);

  // Add Product Modal & State
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [newProdName, setNewProdName] = useState('');
  const [newProdCategory, setNewProdCategory] = useState<'backpack' | 'shoes' | 'glasses' | 'hats' | 'apparel' | 'accessories' | string>('backpack');
  const [newProdPrice, setNewProdPrice] = useState<number>(145);
  const [newProdOriginalPrice, setNewProdOriginalPrice] = useState<number>(185);
  const [newProdStock, setNewProdStock] = useState<number>(25);
  const [newProdSku, setNewProdSku] = useState(`HAU-${Math.floor(1000 + Math.random() * 9000)}`);
  const [newProdReturnPolicy, setNewProdReturnPolicy] = useState('7 Days Easy Hassle-Free Returns & Exchange');
  const [newProdRecentPurchases, setNewProdRecentPurchases] = useState<number>(42);
  const [newProdSizes, setNewProdSizes] = useState<string[]>(['S', 'M', 'L', 'XL']);
  const [newProdColors, setNewProdColors] = useState<{ name: string; hex: string }[]>([
    { name: 'Onyx Black', hex: '#1F1F1F' },
    { name: 'Terracotta', hex: '#C85A32' }
  ]);
  const [newProdImages, setNewProdImages] = useState<string[]>([
    'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=800&auto=format&fit=crop'
  ]);
  const [newProdImageUrlInput, setNewProdImageUrlInput] = useState('');
  const [newProdYoutubeUrl, setNewProdYoutubeUrl] = useState('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
  const [newProdDesc, setNewProdDesc] = useState('');
  const [newProdTagline, setNewProdTagline] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);

  // CATEGORY MANAGEMENT STATE
  const [customCategories, setCustomCategories] = useState<{ id: string; name: string; description: string }[]>([
    { id: 'backpack', name: 'Backpacks & Leatherware', description: 'Handcrafted weatherproof canvas & full-grain leather bags' },
    { id: 'shoes', name: 'Footwear & Oxford Shoes', description: 'Italian leather loafers, sneakers and classic footwear' },
    { id: 'glasses', name: 'Eyewear & Sunglasses', description: 'Nordic titanium frames & UV400 protective polarized lenses' },
    { id: 'hats', name: 'Headwear & Merino Knits', description: 'Organic wool beanies, felt fedoras and winter caps' },
    { id: 'apparel', name: 'Bespoke Apparel', description: 'Minimalist knitwear, coats and tailored outerwear' },
    { id: 'accessories', name: 'Luxe Accessories', description: 'Wallets, belts, keychains and lifestyle accoutrements' }
  ]);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [newCatNameInput, setNewCatNameInput] = useState('');
  const [newCatDescInput, setNewCatDescInput] = useState('');
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editCatNameInput, setEditCatNameInput] = useState('');

  // JOURNAL & BLOG MANAGER STATE
  const [journalArticles, setJournalArticles] = useState<{
    id: string;
    title: string;
    category: string;
    date: string;
    author: string;
    image: string;
    excerpt: string;
    content: string;
  }[]>([
    {
      id: 'art-101',
      title: 'Scandinavian Minimalist Tailoring: Autumn 26 Lookbook',
      category: 'Couture Insights',
      date: 'Aug 28, 2026',
      author: 'Diva\'Chik Editorial Atelier',
      image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800&auto=format&fit=crop',
      excerpt: 'Exploring structured wool silhouettes and vegetable-tanned leather accents designed for longevity and effortless elegance.',
      content: 'True luxury lies in restraint. Our autumn collection merges raw Nordic textures with precise Italian tailoring...'
    },
    {
      id: 'art-102',
      title: 'The Art of Handcrafted Full-Grain Leatherwork',
      category: 'Craftsmanship',
      date: 'Aug 14, 2026',
      author: 'Master Leather Artisan Henrik',
      image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=800&auto=format&fit=crop',
      excerpt: 'Inside our Copenhagen workshop where each bag is hand-stitched with waxed linen thread and reinforced brass hardware.',
      content: 'We source only top-grade hides vegetable-tanned using organic oak bark extracts...'
    }
  ]);
  const [showAddJournalModal, setShowAddJournalModal] = useState(false);
  const [newJournalTitle, setNewJournalTitle] = useState('');
  const [newJournalCategory, setNewJournalCategory] = useState('Couture Insights');
  const [newJournalAuthor, setNewJournalAuthor] = useState('Diva\'Chik Studio');
  const [newJournalImage, setNewJournalImage] = useState('https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800&auto=format&fit=crop');
  const [newJournalExcerpt, setNewJournalExcerpt] = useState('');
  const [newJournalContent, setNewJournalContent] = useState('');

  // CMS PAGES MANAGER STATE
  const [cmsPages, setCmsPages] = useState<{ id: string; title: string; slug: string; lastUpdated: string; status: 'Published' | 'Draft' }[]>([
    { id: 'pg-1', title: 'About Diva\'Chik Studio', slug: '/about', lastUpdated: 'Aug 30, 2026', status: 'Published' },
    { id: 'pg-2', title: 'Bespoke Atelier & Tailoring', slug: '/bespoke', lastUpdated: 'Aug 25, 2026', status: 'Published' },
    { id: 'pg-3', title: 'Return & Exchange Policy (7 Days)', slug: '/returns', lastUpdated: 'Sep 01, 2026', status: 'Published' },
    { id: 'pg-4', title: 'Privacy Policy & Data Security', slug: '/privacy', lastUpdated: 'Jul 12, 2026', status: 'Published' },
    { id: 'pg-5', title: 'Terms of Service', slug: '/terms', lastUpdated: 'Jul 12, 2026', status: 'Published' }
  ]);
  const [showAddCmsPageModal, setShowAddCmsPageModal] = useState(false);
  const [newCmsTitle, setNewCmsTitle] = useState('');
  const [newCmsSlug, setNewCmsSlug] = useState('');

  // Manual Customer Review Posting State (Add Modal)
  const [newProdReviews, setNewProdReviews] = useState<Review[]>([]);
  const [revAuthor, setRevAuthor] = useState('');
  const [revRating, setRevRating] = useState<number>(5);
  const [revTitle, setRevTitle] = useState('');
  const [revComment, setRevComment] = useState('');

  // Manual Customer Review Posting State (Edit Modal)
  const [editRevAuthor, setEditRevAuthor] = useState('');
  const [editRevRating, setEditRevRating] = useState<number>(5);
  const [editRevTitle, setEditRevTitle] = useState('');
  const [editRevComment, setEditRevComment] = useState('');

  // Helper to recalculate average star rating and review count
  const calculateRatingStats = (reviewsList: Review[]) => {
    if (!reviewsList || reviewsList.length === 0) return { rating: 5.0, count: 0 };
    const totalStars = reviewsList.reduce((acc, r) => acc + (r.rating || 5), 0);
    const avg = Number((totalStars / reviewsList.length).toFixed(1));
    return { rating: avg, count: reviewsList.length };
  };

  const handleAddReviewToNewProduct = () => {
    if (!revAuthor.trim() || !revComment.trim()) {
      showToast('Please provide reviewer name and comment', 'warning');
      return;
    }

    const newRev: Review = {
      id: `rev-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      author: revAuthor.trim(),
      rating: Number(revRating),
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      title: revTitle.trim() || 'Verified Purchase Review',
      comment: revComment.trim(),
      verified: true,
      helpfulCount: Math.floor(Math.random() * 8) + 1
    };

    setNewProdReviews((prev) => [...prev, newRev]);
    setRevAuthor('');
    setRevTitle('');
    setRevComment('');
    setRevRating(5);
    showToast(`Added review from ${newRev.author} (${newRev.rating} Stars)`, 'success');
  };

  const handleRemoveReviewFromNewProduct = (id: string) => {
    setNewProdReviews((prev) => prev.filter((r) => r.id !== id));
  };

  const handleAddReviewToEditingProduct = () => {
    if (!editingProduct) return;
    if (!editRevAuthor.trim() || !editRevComment.trim()) {
      showToast('Please provide reviewer name and comment', 'warning');
      return;
    }

    const newRev: Review = {
      id: `rev-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      author: editRevAuthor.trim(),
      rating: Number(editRevRating),
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      title: editRevTitle.trim() || 'Verified Purchase Review',
      comment: editRevComment.trim(),
      verified: true,
      helpfulCount: Math.floor(Math.random() * 8) + 1
    };

    const updatedReviews = [...(editingProduct.reviews || []), newRev];
    const stats = calculateRatingStats(updatedReviews);

    setEditingProduct({
      ...editingProduct,
      reviews: updatedReviews,
      rating: stats.rating,
      reviewCount: stats.count
    });

    setEditRevAuthor('');
    setEditRevTitle('');
    setEditRevComment('');
    setEditRevRating(5);
    showToast(`Posted review from ${newRev.author} (${newRev.rating} Stars)`, 'success');
  };

  const handleRemoveReviewFromEditingProduct = (id: string) => {
    if (!editingProduct) return;
    const updatedReviews = (editingProduct.reviews || []).filter((r) => r.id !== id);
    const stats = calculateRatingStats(updatedReviews);

    setEditingProduct({
      ...editingProduct,
      reviews: updatedReviews,
      rating: stats.rating,
      reviewCount: stats.count
    });
  };

  // File Upload Handlers (Images & Videos)
  const processImageFiles = (files: FileList | File[], appendTo: 'new' | 'edit') => {
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) {
        showToast('Please select valid image files (PNG, JPG, WebP)', 'warning');
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        if (dataUrl) {
          if (appendTo === 'new') {
            setNewProdImages((prev) => [...prev, dataUrl]);
          } else if (editingProduct) {
            setEditingProduct((prev) => prev ? { ...prev, images: [...prev.images, dataUrl] } : null);
          }
          showToast(`Photo "${file.name}" uploaded successfully!`, 'success');
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const processVideoFile = (file: File, target: 'new' | 'edit') => {
    if (!file.type.startsWith('video/')) {
      showToast('Please select a valid video file (MP4, WebM, MOV)', 'warning');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (dataUrl) {
        if (target === 'new') {
          setNewProdYoutubeUrl(dataUrl);
        } else if (editingProduct) {
          setEditingProduct((prev) => prev ? { ...prev, youtubeUrl: dataUrl } : null);
        }
        showToast(`Video "${file.name}" uploaded successfully!`, 'success', 'Live stream ready');
      }
    };
    reader.readAsDataURL(file);
  };

  // Bulk Operations Handlers
  const toggleSelectAllProducts = () => {
    if (selectedProductIds.length === products.length) {
      setSelectedProductIds([]);
    } else {
      setSelectedProductIds(products.map((p) => p.id));
    }
  };

  const toggleSelectProduct = (id: string) => {
    setSelectedProductIds((prev) => 
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleBulkAddStock = (amount: number) => {
    selectedProductIds.forEach((id) => {
      const prod = products.find((p) => p.id === id);
      if (prod) {
        updateProductStock(id, prod.stockQuantity + amount);
      }
    });
    showToast(`Replenished stock by +${amount} for ${selectedProductIds.length} items`, 'success');
  };

  const handleBulkMarkOutStock = () => {
    selectedProductIds.forEach((id) => {
      updateProductStock(id, 0);
    });
    showToast(`Marked ${selectedProductIds.length} items as Out of Stock`, 'warning');
  };

  const handleBulkDelete = () => {
    if (!window.confirm(`Are you sure you want to delete ${selectedProductIds.length} selected products?`)) return;
    selectedProductIds.forEach((id) => {
      deleteProduct(id);
    });
    setSelectedProductIds([]);
    showToast(`Deleted ${selectedProductIds.length} catalog items`, 'info');
  };

  const handleBulkExportCSV = () => {
    const itemsToExport = selectedProductIds.length > 0 
      ? products.filter((p) => selectedProductIds.includes(p.id))
      : products;

    const headers = ['ID', 'SKU', 'Title', 'Category', 'Price ($)', 'Original Price ($)', 'Stock', 'Rating', 'Reviews'];
    const rows = itemsToExport.map((p) => [
      p.id,
      p.sku,
      `"${p.name.replace(/"/g, '""')}"`,
      p.category,
      p.price,
      p.originalPrice || p.price,
      p.stockQuantity,
      p.rating,
      p.reviewCount
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `DivaChik_Inventory_Export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Exported ${itemsToExport.length} catalog items to CSV`, 'success');
  };

  // New Coupon Modal
  const [showAddCoupon, setShowAddCoupon] = useState(false);
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponDiscount, setNewCouponDiscount] = useState(15);
  const [newCouponMin, setNewCouponMin] = useState(50);
  const [newCouponDesc, setNewCouponDesc] = useState('');

  // Search & Filters
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [inventorySearch, setInventorySearch] = useState('');

  // Sample Image Presets for rapid testing
  const sampleImagePresets = [
    { label: 'Leather Backpack', url: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=800&auto=format&fit=crop' },
    { label: 'Minimalist Oxford', url: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=800&auto=format&fit=crop' },
    { label: 'Nordic Sunglasses', url: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=800&auto=format&fit=crop' },
    { label: 'Wool Beanie', url: 'https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?q=80&w=800&auto=format&fit=crop' },
    { label: 'Merino Knit', url: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=800&auto=format&fit=crop' }
  ];

  const handleAddImageUrl = () => {
    if (newProdImageUrlInput.trim()) {
      setNewProdImages((prev) => [...prev, newProdImageUrlInput.trim()]);
      setNewProdImageUrlInput('');
    }
  };

  const handleRemoveImage = (index: number) => {
    setNewProdImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName) {
      showToast('Please provide product name', 'warning');
      return;
    }

    const stats = calculateRatingStats(newProdReviews);

    const created: Product = {
      id: `prod-admin-${Date.now()}`,
      sku: newProdSku || `HAU-${Math.floor(1000 + Math.random() * 9000)}`,
      name: newProdName,
      tagline: newProdTagline || 'Nordic Handcrafted Craftsmanship',
      category: newProdCategory,
      price: Number(newProdPrice),
      originalPrice: newProdOriginalPrice ? Number(newProdOriginalPrice) : undefined,
      isSale: newProdOriginalPrice ? Number(newProdOriginalPrice) > Number(newProdPrice) : false,
      youtubeUrl: newProdYoutubeUrl.trim() || undefined,
      images: newProdImages.length > 0 ? newProdImages : ['https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=800&auto=format&fit=crop'],
      rating: stats.rating,
      reviewCount: stats.count,
      stockQuantity: Number(newProdStock),
      isSoldOut: Number(newProdStock) <= 0,
      isNew: true,
      description: newProdDesc || 'Designed in Copenhagen with durable materials and timeless aesthetics.',
      details: ['Handmade assembly', 'Sustainable materials', 'Water-resistant treatment'],
      specifications: {
        dimensions: 'Standard fit',
        materials: 'Organic cotton & recycled composite',
        weight: '450g',
        origin: 'Copenhagen, Denmark',
        care: 'Spot clean only'
      },
      colors: newProdColors,
      sizes: newProdSizes,
      recentPurchasesCount: Number(newProdRecentPurchases) || 42,
      returnPolicy: newProdReturnPolicy || '7 Days Easy Hassle-Free Returns & Exchange',
      reviews: newProdReviews
    };

    addProduct(created);
    setShowAddProduct(false);
    setNewProdName('');
    setNewProdDesc('');
    setNewProdTagline('');
    setNewProdReviews([]);
    setNewProdSku(`DIVA-${Math.floor(1000 + Math.random() * 9000)}`);
  };

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode) return;

    addCoupon({
      id: `cpn-${Date.now()}`,
      code: newCouponCode.toUpperCase(),
      discountPercentage: Number(newCouponDiscount),
      minOrderAmount: Number(newCouponMin),
      description: newCouponDesc || `${newCouponDiscount}% off on orders over ${newCouponMin}`,
      isActive: true
    });

    setShowAddCoupon(false);
    setNewCouponCode('');
  };

  const filteredOrders = orders.filter((o) => {
    const matchesSearch = 
      o.orderNumber.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.shippingAddress.fullName.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.shippingAddress.postalCode.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.shippingAddress.city.toLowerCase().includes(orderSearch.toLowerCase());
    
    const matchesStatus = orderStatusFilter === 'all' || o.status === orderStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(inventorySearch.toLowerCase()) ||
      p.sku.toLowerCase().includes(inventorySearch.toLowerCase())
  );

  if (!isAdminAuthenticated) {
    return (
      <div className="bg-[#F9F8F6] min-h-[75vh] flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md bg-white border border-[#EAE6DE] shadow-xl rounded-xs overflow-hidden">
          <div className="bg-[#1F1F1F] text-white p-6 text-center border-b border-[#333]">
            <div className="w-12 h-12 mx-auto rounded-full bg-[#C85A32]/20 border border-[#C85A32]/50 flex items-center justify-center text-[#C85A32] mb-3">
              <Lock className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold font-editorial">Administrator Authentication</h2>
            <p className="text-xs text-[#A8A8A8] mt-1">Diva'Chik Merchant Operations Console</p>
          </div>

          <div className="p-6">
            <p className="text-xs text-[#6E685F] text-center mb-6 leading-relaxed">
              This area contains proprietary financial records, catalog modifications, and live order fulfillment controls. Please enter your administrator passcode.
            </p>

            <form onSubmit={handleUnlockPortal} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#1F1F1F] uppercase tracking-wider mb-2">
                  Admin Passcode
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#9E978C]">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    value={portalPasscode}
                    onChange={(e) => {
                      setPortalPasscode(e.target.value);
                      if (portalPasscodeError) setPortalPasscodeError('');
                    }}
                    placeholder="Enter 10-digit passcode"
                    className="w-full pl-9 pr-4 py-2.5 bg-white border border-[#D5D0C5] text-sm text-[#1F1F1F] placeholder:text-[#9E978C] focus:outline-none focus:border-[#1F1F1F] rounded-xs font-mono tracking-widest"
                    required
                    autoFocus
                  />
                </div>
                {portalPasscodeError && (
                  <div className="mt-2 flex items-center gap-1.5 text-xs text-[#C85A32] bg-[#FDF2EE] border border-[#F6D0C1] p-2 rounded-xs">
                    <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                    <span>{portalPasscodeError}</span>
                  </div>
                )}
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="submit"
                  disabled={isVerifying}
                  className="w-full bg-[#1F1F1F] hover:bg-[#C85A32] text-white font-medium text-xs tracking-wider py-3 px-4 rounded-xs transition-colors uppercase cursor-pointer flex items-center justify-center gap-2"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>{isVerifying ? 'Verifying...' : 'Unlock Admin Portal'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActivePage('shop')}
                  className="w-full py-2 text-xs text-[#8C8477] hover:text-[#1F1F1F] transition-colors cursor-pointer text-center"
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

  return (
    <div className="bg-[#F9F8F6] min-h-screen py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header Bar */}
        <div className="bg-[#1F1F1F] text-white p-6 sm:p-8 rounded-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold tracking-widest text-[#C85A32] uppercase">
                Merchant Operations
              </span>
              <span className="bg-[#C85A32] text-white text-[10px] px-2 py-0.5 rounded-full uppercase font-bold">
                Admin Console
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-semibold font-editorial mt-1">
              Diva'Chik Boutique Operations & OMS Portal
            </h1>
            <p className="text-xs text-white/70 mt-1">
              Real-time fulfillment control, dynamic delivery estimator, video product catalog, and comprehensive order lifecycle management.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleManualSync}
              disabled={isSyncing}
              className={`text-xs px-3 py-2 rounded-xs border transition-colors cursor-pointer inline-flex items-center gap-1.5 ${
                isSupabaseOnline 
                  ? 'bg-[#1E5638]/20 border-[#1E5638]/40 text-[#4ade80] hover:bg-[#1E5638]/30'
                  : 'bg-white/10 border-white/20 text-white/90 hover:bg-white/20'
              }`}
              title="Sync Products, Orders, and Settings with Supabase Cloud"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-[#C85A32]' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : isSupabaseOnline ? 'Supabase Connected' : 'Sync Supabase'}</span>
            </button>

            <button
              onClick={() => setActivePage('shop')}
              className="bg-white/10 hover:bg-white/20 text-white text-xs px-4 py-2 rounded-xs transition-colors cursor-pointer inline-flex items-center gap-1.5"
            >
              <span>Storefront</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => {
                lockAdmin();
                showToast('Admin Console Locked', 'info', 'Password authentication required to re-enter.');
              }}
              className="bg-[#D32F2F] hover:bg-[#B71C1C] text-white text-xs font-semibold px-3 py-2 rounded-xs uppercase tracking-wider transition-colors inline-flex items-center gap-1.5 cursor-pointer"
              title="Lock Admin Session Immediately"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Lock Console</span>
            </button>

            <button
              onClick={lockAdmin}
              className="bg-[#C85A32]/20 hover:bg-[#C85A32] text-white border border-[#C85A32]/40 text-xs px-3 py-2 rounded-xs transition-colors cursor-pointer inline-flex items-center gap-1.5"
              title="Lock Admin Portal and End Session"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Lock Portal</span>
            </button>
          </div>
        </div>

        {/* Metric Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="bg-white p-5 border border-[#EAE6DE] rounded-xs shadow-xs space-y-1">
            <div className="flex justify-between items-center text-[#8C8477] text-xs">
              <span>Gross Sales</span>
              <DollarSign className="w-4 h-4 text-[#C85A32]" />
            </div>
            <div className="text-2xl font-bold text-[#1F1F1F] font-sans">
              {formatPrice(totalRevenue)}
            </div>
            <p className="text-[11px] text-[#1E5638] font-medium">+14.8% vs last month</p>
          </div>

          <div className="bg-white p-5 border border-[#EAE6DE] rounded-xs shadow-xs space-y-1">
            <div className="flex justify-between items-center text-[#8C8477] text-xs">
              <span>Pending Fulfillment</span>
              <ShoppingBag className="w-4 h-4 text-[#C85A32]" />
            </div>
            <div className="text-2xl font-bold text-[#1F1F1F] font-sans">
              {pendingFulfillmentCount} Orders
            </div>
            <p className="text-[11px] text-[#7A7264]">{orders.length} total lifetime orders</p>
          </div>

          <div className="bg-white p-5 border border-[#EAE6DE] rounded-xs shadow-xs space-y-1">
            <div className="flex justify-between items-center text-[#8C8477] text-xs">
              <span>Standard Delivery Setting</span>
              <Truck className="w-4 h-4 text-[#C85A32]" />
            </div>
            <div className="text-2xl font-bold text-[#1F1F1F] font-sans">
              {standardDeliveryDays} Days
            </div>
            <p className="text-[11px] text-[#C85A32] font-medium">
              Arrival: {calculateDeliveryDate().shortDate}
            </p>
          </div>

          <div className="bg-white p-5 border border-[#EAE6DE] rounded-xs shadow-xs space-y-1">
            <div className="flex justify-between items-center text-[#8C8477] text-xs">
              <span>Catalog SKUs</span>
              <Package className="w-4 h-4 text-[#C85A32]" />
            </div>
            <div className="text-2xl font-bold text-[#1F1F1F] font-sans">
              {products.length} Products
            </div>
            <p className="text-[11px] text-[#D32F2F] font-medium">
              {lowStockCount} low stock alerts
            </p>
          </div>

        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-[#EAE6DE] gap-4 text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => setAdminTab('orders')}
            className={`pb-3 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              adminTab === 'orders' ? 'border-b-2 border-[#C85A32] text-[#C85A32]' : 'text-[#6E685F]'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Master Orders & OMS ({orders.length})</span>
          </button>
          <button
            onClick={() => setAdminTab('inventory')}
            className={`pb-3 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              adminTab === 'inventory' ? 'border-b-2 border-[#C85A32] text-[#C85A32]' : 'text-[#6E685F]'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Product Catalog & Video Manager ({products.length})</span>
          </button>
          <button
            onClick={() => setAdminTab('categories')}
            className={`pb-3 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              adminTab === 'categories' ? 'border-b-2 border-[#C85A32] text-[#C85A32]' : 'text-[#6E685F]'
            }`}
          >
            <FolderPlus className="w-3.5 h-3.5" />
            <span>Categories Builder ({customCategories.length})</span>
          </button>
          <button
            onClick={() => setAdminTab('journal')}
            className={`pb-3 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              adminTab === 'journal' ? 'border-b-2 border-[#C85A32] text-[#C85A32]' : 'text-[#6E685F]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Journal & Blog Manager ({journalArticles.length})</span>
          </button>
          <button
            onClick={() => setAdminTab('pages')}
            className={`pb-3 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              adminTab === 'pages' ? 'border-b-2 border-[#C85A32] text-[#C85A32]' : 'text-[#6E685F]'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>CMS Pages ({cmsPages.length})</span>
          </button>
          <button
            onClick={() => setAdminTab('banners')}
            className={`pb-3 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              adminTab === 'banners' ? 'border-b-2 border-[#C85A32] text-[#C85A32]' : 'text-[#6E685F]'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Banners & Logo Customizer</span>
          </button>
          <button
            onClick={() => setAdminTab('settings')}
            className={`pb-3 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              adminTab === 'settings' ? 'border-b-2 border-[#C85A32] text-[#C85A32]' : 'text-[#6E685F]'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Delivery Timeframe Slider</span>
          </button>
          <button
            onClick={() => setAdminTab('coupons')}
            className={`pb-3 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              adminTab === 'coupons' ? 'border-b-2 border-[#C85A32] text-[#C85A32]' : 'text-[#6E685F]'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>Coupons & Marketing ({coupons.length})</span>
          </button>
          <button
            onClick={() => setAdminTab('abandoned')}
            className={`pb-3 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              adminTab === 'abandoned' ? 'border-b-2 border-[#C85A32] text-[#C85A32]' : 'text-[#6E685F]'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Abandoned Carts ({abandonedCarts.length})</span>
          </button>
        </div>

        {/* TAB 1: MASTER ORDERS MANAGEMENT SYSTEM (OMS) */}
        {adminTab === 'orders' && (
          <div className="bg-white border border-[#EAE6DE] rounded-xs shadow-xs p-6 space-y-5">
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
              <div>
                <h2 className="text-base font-semibold text-[#1F1F1F]">
                  Master Orders Dashboard
                </h2>
                <p className="text-xs text-[#7A7264]">
                  Click on any row to open the full order profile with financial breakdown, customer details, and fulfillment action hub.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                {/* Status Filter */}
                <select
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                  className="px-3 py-1.5 text-xs border border-[#D5D0C5] rounded-xs bg-white text-[#4A453C] focus:outline-none focus:border-[#C85A32]"
                >
                  <option value="all">All Statuses ({orders.length})</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="packed">Packed</option>
                  <option value="in_transit">In Transit</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="refunded">Refunded</option>
                </select>

                {/* Search Bar */}
                <div className="relative flex-1 md:w-64">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    placeholder="Search #, customer, zip..."
                    className="w-full pl-9 pr-3 py-1.5 text-xs border border-[#D5D0C5] rounded-xs focus:outline-none focus:border-[#C85A32]"
                  />
                </div>
              </div>
            </div>

            {/* Orders Data Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-[#FAF9F6] border-b border-[#EAE6DE] text-[#6E685F] uppercase text-[10px]">
                    <th className="p-3">Order #</th>
                    <th className="p-3">Date</th>
                    <th className="p-3">Customer & Pincode</th>
                    <th className="p-3">Items & Qty</th>
                    <th className="p-3">Financial Total</th>
                    <th className="p-3">Payment</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Action Hub</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0ECE1]">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-[#8C8477] text-xs">
                        No orders matching the specified filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((ord) => (
                      <tr 
                        key={ord.id} 
                        className="hover:bg-[#FAF1ED]/30 cursor-pointer transition-colors group"
                        onClick={() => setSelectedOrderProfile(ord)}
                      >
                        <td className="p-3 font-mono font-bold text-[#1F1F1F] group-hover:text-[#C85A32]">
                          #{ord.orderNumber}
                        </td>
                        <td className="p-3 text-[#7A7264] whitespace-nowrap">
                          {new Date(ord.createdAt).toLocaleDateString()}
                        </td>
                        <td className="p-3">
                          <div className="font-semibold text-[#1F1F1F]">{ord.shippingAddress.fullName}</div>
                          <div className="text-[11px] text-[#8C8477]">
                            {ord.shippingAddress.city}, <span className="font-mono text-[#1F1F1F] font-medium">{ord.shippingAddress.postalCode}</span>
                          </div>
                        </td>
                        <td className="p-3 text-[#524B42]">
                          <span className="font-medium text-[#1F1F1F]">{ord.items.reduce((s, i) => s + i.quantity, 0)} units</span> ({ord.items.length} SKUs)
                        </td>
                        <td className="p-3 font-bold text-[#1F1F1F]">
                          {formatPrice(ord.total)}
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            ord.paymentStatus === 'paid' ? 'bg-[#EBF5EF] text-[#1E5638]' : 'bg-amber-50 text-amber-700'
                          }`}>
                            {ord.paymentStatus.toUpperCase()}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className={`px-2.5 py-1 rounded-xs text-[10px] font-bold uppercase tracking-wider ${
                            ord.status === 'delivered' ? 'bg-[#EBF5EF] text-[#1E5638]' :
                            ord.status === 'in_transit' ? 'bg-blue-50 text-blue-800' :
                            ord.status === 'packed' ? 'bg-indigo-50 text-indigo-800' :
                            ord.status === 'processing' ? 'bg-amber-50 text-amber-800' :
                            ord.status === 'cancelled' || ord.status === 'refunded' ? 'bg-red-50 text-[#D32F2F]' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {ord.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="p-3 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setSelectedOrderProfile(ord)}
                              className="px-2.5 py-1 bg-[#1F1F1F] text-white hover:bg-[#C85A32] text-[11px] font-semibold rounded-xs transition-colors cursor-pointer"
                            >
                              Profile
                            </button>
                            <button
                              onClick={() => setShippingLabelOrder(ord)}
                              className="p-1 text-[#6E685F] hover:text-[#C85A32] border border-[#D5D0C5] rounded-xs transition-colors cursor-pointer"
                              title="Print Shipping Label"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* TAB 2: INVENTORY & PRODUCT MEDIA MANAGER (WITH YOUTUBE INTEGRATION) */}
        {adminTab === 'inventory' && (
          <div className="space-y-6">
            
            <div className="bg-white border border-[#EAE6DE] rounded-xs shadow-xs p-6 space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h2 className="text-base font-semibold text-[#1F1F1F]">
                    Amazon & Flipkart Level Advanced Catalog & Media Center
                  </h2>
                  <p className="text-xs text-[#7A7264]">
                    Bulk batch operations, multi-angle local image uploads, MP4/WebM video stream linking, and real-time inventory management.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-56">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-gray-400" />
                    <input
                      type="text"
                      value={inventorySearch}
                      onChange={(e) => setInventorySearch(e.target.value)}
                      placeholder="Search SKU, title, category..."
                      className="w-full pl-9 pr-3 py-1.5 text-xs border border-[#D5D0C5] rounded-xs"
                    />
                  </div>

                  <button
                    onClick={handleBulkExportCSV}
                    className="bg-[#1F1F1F] hover:bg-[#333] text-white text-xs font-semibold px-3 py-2 rounded-xs uppercase tracking-wider transition-colors inline-flex items-center gap-1.5 cursor-pointer shrink-0"
                    title="Export Catalog to CSV"
                  >
                    <FileText className="w-4 h-4 text-[#C85A32]" />
                    <span>Export CSV</span>
                  </button>

                  <button
                    id="admin-add-product-btn"
                    onClick={() => setShowAddProduct(true)}
                    className="bg-[#C85A32] hover:bg-[#B34E2A] text-white text-xs font-semibold px-4 py-2 rounded-xs uppercase tracking-wider transition-colors inline-flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Product</span>
                  </button>
                </div>
              </div>

              {/* Bulk Operations Toolbar (Appears when items are selected) */}
              {selectedProductIds.length > 0 && (
                <div className="bg-[#FAF1ED] border border-[#C85A32]/40 p-3 rounded-xs flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 font-semibold text-[#1F1F1F]">
                    <CheckCircle2 className="w-4 h-4 text-[#C85A32]" />
                    <span>{selectedProductIds.length} Products Selected</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => handleBulkAddStock(10)}
                      className="bg-white border border-[#D5D0C5] hover:border-[#1F1F1F] text-[#1F1F1F] text-[11px] font-semibold px-2.5 py-1 rounded-xs cursor-pointer"
                    >
                      +10 Stock
                    </button>
                    <button
                      onClick={() => handleBulkAddStock(50)}
                      className="bg-white border border-[#D5D0C5] hover:border-[#1F1F1F] text-[#1F1F1F] text-[11px] font-semibold px-2.5 py-1 rounded-xs cursor-pointer"
                    >
                      +50 Stock
                    </button>
                    <button
                      onClick={handleBulkMarkOutStock}
                      className="bg-white border border-[#D32F2F] text-[#D32F2F] text-[11px] font-semibold px-2.5 py-1 rounded-xs cursor-pointer"
                    >
                      Mark Out of Stock
                    </button>
                    <button
                      onClick={handleBulkExportCSV}
                      className="bg-[#1F1F1F] text-white text-[11px] font-semibold px-2.5 py-1 rounded-xs cursor-pointer"
                    >
                      Export Selected CSV
                    </button>
                    <button
                      onClick={handleBulkDelete}
                      className="bg-[#D32F2F] text-white text-[11px] font-semibold px-2.5 py-1 rounded-xs cursor-pointer"
                    >
                      Delete Selected ({selectedProductIds.length})
                    </button>
                  </div>
                </div>
              )}

              {/* Products Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-[#FAF9F6] border-b border-[#EAE6DE] text-[#6E685F] uppercase text-[10px]">
                      <th className="p-3 w-8">
                        <input
                          type="checkbox"
                          checked={selectedProductIds.length === products.length && products.length > 0}
                          onChange={toggleSelectAllProducts}
                          className="rounded-xs cursor-pointer"
                        />
                      </th>
                      <th className="p-3">Preview</th>
                      <th className="p-3">Product Name & SKU</th>
                      <th className="p-3">Category</th>
                      <th className="p-3">Base / Sale Price</th>
                      <th className="p-3">Video Stream</th>
                      <th className="p-3">Stock Units</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0ECE1]">
                    {filteredProducts.map((prod) => (
                      <tr 
                        key={prod.id} 
                        className={`hover:bg-[#FAF9F6]/50 ${selectedProductIds.includes(prod.id) ? 'bg-[#FAF1ED]/30' : ''}`}
                      >
                        <td className="p-3">
                          <input
                            type="checkbox"
                            checked={selectedProductIds.includes(prod.id)}
                            onChange={() => toggleSelectProduct(prod.id)}
                            className="rounded-xs cursor-pointer"
                          />
                        </td>
                        <td className="p-3">
                          <img
                            src={prod.images[0]}
                            alt={prod.name}
                            onClick={() => openProductDetail(prod)}
                            className="w-10 h-10 object-cover rounded-xs border border-[#EAE6DE] cursor-pointer hover:opacity-80"
                          />
                        </td>
                        <td className="p-3">
                          <div 
                            onClick={() => openProductDetail(prod)}
                            className="font-semibold text-[#1F1F1F] hover:text-[#C85A32] cursor-pointer"
                          >
                            {prod.name}
                          </div>
                          <div className="text-[10px] font-mono text-[#8C8477]">{prod.sku}</div>
                        </td>
                        <td className="p-3 capitalize text-[#555048]">{prod.category}</td>
                        <td className="p-3">
                          <span className="font-semibold text-[#1F1F1F]">{formatPrice(prod.price)}</span>
                          {prod.originalPrice && (
                            <span className="text-[10px] text-[#9E978C] line-through ml-1.5">
                              {formatPrice(prod.originalPrice)}
                            </span>
                          )}
                        </td>
                        <td className="p-3">
                          {prod.youtubeUrl ? (
                            <span className="inline-flex items-center gap-1 bg-[#FAF1ED] text-[#C85A32] text-[10px] font-bold px-2 py-0.5 rounded-xs">
                              <Film className="w-3 h-3" />
                              <span>Active</span>
                            </span>
                          ) : (
                            <span className="text-[10px] text-[#8C8477]">None</span>
                          )}
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              min="0"
                              value={prod.stockQuantity}
                              onChange={(e) => updateProductStock(prod.id, parseInt(e.target.value) || 0)}
                              className="w-14 px-1.5 py-1 text-xs border border-[#D5D0C5] rounded-xs bg-white focus:outline-none focus:border-[#C85A32]"
                            />
                            <span className="text-[10px] text-[#8C8477]">qty</span>
                          </div>
                        </td>
                        <td className="p-3">
                          {prod.isSoldOut || prod.stockQuantity <= 0 ? (
                            <span className="bg-red-50 text-[#D32F2F] text-[10px] font-bold px-2 py-0.5 rounded-xs">
                              SOLD OUT
                            </span>
                          ) : prod.stockQuantity < 5 ? (
                            <span className="bg-amber-50 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-xs">
                              LOW ({prod.stockQuantity})
                            </span>
                          ) : (
                            <span className="bg-[#EBF5EF] text-[#1E5638] text-[10px] font-bold px-2 py-0.5 rounded-xs">
                              IN STOCK
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setEditingProduct(prod)}
                              className="text-[#1F1F1F] hover:text-[#C85A32] p-1 transition-colors cursor-pointer"
                              title="Edit Product Details & Media"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => openProductDetail(prod)}
                              className="text-[#6E685F] hover:text-[#C85A32] p-1 transition-colors cursor-pointer"
                              title="Preview on Store"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => deleteProduct(prod.id)}
                              className="text-[#A0988A] hover:text-[#D32F2F] p-1 transition-colors cursor-pointer"
                              title="Delete Product"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>

          </div>
        )}

        {/* TAB: CATEGORIES BUILDER & TAXONOMY */}
        {adminTab === 'categories' && (
          <div className="bg-white border border-[#EAE6DE] rounded-xs shadow-xs p-6 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-[#F0ECE1] pb-4">
              <div>
                <h2 className="text-base font-semibold text-[#1F1F1F]">
                  Category Taxonomy & Collections Builder
                </h2>
                <p className="text-xs text-[#7A7264]">
                  Create, rename, or delete catalog categories. Modifications reflect instantly in store filters and site navigation.
                </p>
              </div>

              <button
                onClick={() => setShowAddCategoryModal(true)}
                className="bg-[#C85A32] hover:bg-[#B34E2A] text-white text-xs font-semibold px-4 py-2 rounded-xs uppercase tracking-wider transition-colors inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Build New Category</span>
              </button>
            </div>

            {/* Categories List Table */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {customCategories.map((cat) => (
                <div key={cat.id} className="p-4 border border-[#EAE6DE] rounded-xs bg-[#FAF9F6] space-y-3 relative group">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-mono text-[10px] font-bold text-[#C85A32] uppercase bg-white px-2 py-0.5 border border-[#C85A32]/30 rounded-xs">
                        #{cat.id}
                      </span>
                      <h3 className="font-semibold text-sm text-[#1F1F1F] mt-1.5 font-editorial">
                        {editingCatId === cat.id ? (
                          <input
                            type="text"
                            value={editCatNameInput}
                            onChange={(e) => setEditCatNameInput(e.target.value)}
                            className="px-2 py-1 text-xs border border-[#C85A32] rounded-xs"
                          />
                        ) : (
                          cat.name
                        )}
                      </h3>
                    </div>

                    <div className="flex items-center gap-1">
                      {editingCatId === cat.id ? (
                        <button
                          onClick={() => {
                            if (editCatNameInput.trim()) {
                              setCustomCategories((prev) =>
                                prev.map((c) => (c.id === cat.id ? { ...c, name: editCatNameInput.trim() } : c))
                              );
                              setEditingCatId(null);
                              showToast(`Renamed category to "${editCatNameInput.trim()}"`, 'success');
                            }
                          }}
                          className="text-green-700 bg-green-100 hover:bg-green-200 text-xs px-2 py-1 rounded-xs font-semibold"
                        >
                          Save
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setEditingCatId(cat.id);
                            setEditCatNameInput(cat.name);
                          }}
                          className="text-[#6E685F] hover:text-[#C85A32] p-1 cursor-pointer"
                          title="Rename Category"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      )}

                      <button
                        onClick={() => {
                          if (window.confirm(`Delete category "${cat.name}"?`)) {
                            setCustomCategories((prev) => prev.filter((c) => c.id !== cat.id));
                            showToast(`Deleted category "${cat.name}"`, 'info');
                          }
                        }}
                        className="text-[#A0988A] hover:text-[#D32F2F] p-1 cursor-pointer"
                        title="Delete Category"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-[#7A7264]">{cat.description}</p>
                </div>
              ))}
            </div>

            {/* Add Category Modal */}
            {showAddCategoryModal && (
              <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
                <div className="bg-white max-w-md w-full p-6 rounded-xs shadow-2xl border border-[#EAE6DE] space-y-4">
                  <div className="flex justify-between items-center border-b border-[#F0ECE1] pb-2">
                    <h3 className="text-base font-semibold text-[#1F1F1F]">Build New Category</h3>
                    <button onClick={() => setShowAddCategoryModal(false)} className="text-gray-400 hover:text-black">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block text-[#4A453C] mb-1 font-medium">Category Name *</label>
                      <input
                        type="text"
                        value={newCatNameInput}
                        onChange={(e) => setNewCatNameInput(e.target.value)}
                        placeholder="e.g. Bespoke Jewelry & Pearls"
                        className="w-full px-3 py-2 border border-[#D5D0C5] rounded-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[#4A453C] mb-1 font-medium">Description</label>
                      <input
                        type="text"
                        value={newCatDescInput}
                        onChange={(e) => setNewCatDescInput(e.target.value)}
                        placeholder="e.g. Fine handcrafted pearls and gold accoutrements"
                        className="w-full px-3 py-2 border border-[#D5D0C5] rounded-xs"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button onClick={() => setShowAddCategoryModal(false)} className="px-4 py-2 text-xs text-[#7A7264]">
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        if (!newCatNameInput.trim()) return;
                        const id = newCatNameInput.toLowerCase().replace(/[^a-z0-9]/g, '-');
                        setCustomCategories((prev) => [
                          ...prev,
                          { id, name: newCatNameInput.trim(), description: newCatDescInput.trim() || 'Custom collection' }
                        ]);
                        setNewCatNameInput('');
                        setNewCatDescInput('');
                        setShowAddCategoryModal(false);
                        showToast(`Created category "${newCatNameInput}"`, 'success');
                      }}
                      className="bg-[#C85A32] text-white text-xs font-semibold px-5 py-2 rounded-xs"
                    >
                      Build Category
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB: JOURNAL & BLOG MANAGER */}
        {adminTab === 'journal' && (
          <div className="bg-white border border-[#EAE6DE] rounded-xs shadow-xs p-6 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-[#F0ECE1] pb-4">
              <div>
                <h2 className="text-base font-semibold text-[#1F1F1F]">
                  The Diva'Chik Gazette & Journal Manager
                </h2>
                <p className="text-xs text-[#7A7264]">
                  Publish editorial essays, couture lookbooks, and studio stories with pictures.
                </p>
              </div>

              <button
                onClick={() => setShowAddJournalModal(true)}
                className="bg-[#C85A32] hover:bg-[#B34E2A] text-white text-xs font-semibold px-4 py-2 rounded-xs uppercase tracking-wider transition-colors inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Post New Journal Essay</span>
              </button>
            </div>

            {/* Articles Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {journalArticles.map((art) => (
                <div key={art.id} className="border border-[#EAE6DE] rounded-xs overflow-hidden bg-[#FAF9F6] flex flex-col justify-between">
                  <div className="aspect-video relative overflow-hidden bg-black/10">
                    <img src={art.image} alt={art.title} className="w-full h-full object-cover" />
                    <span className="absolute top-2 left-2 bg-[#1F1F1F] text-white text-[10px] font-bold px-2 py-0.5 rounded-xs uppercase">
                      {art.category}
                    </span>
                  </div>

                  <div className="p-4 space-y-2 flex-1">
                    <div className="flex justify-between items-center text-[10px] text-[#8C8477]">
                      <span>By {art.author}</span>
                      <span>{art.date}</span>
                    </div>
                    <h3 className="font-semibold text-sm text-[#1F1F1F] font-editorial leading-snug">{art.title}</h3>
                    <p className="text-xs text-[#6E685F] line-clamp-2">{art.excerpt}</p>
                  </div>

                  <div className="p-4 border-t border-[#EAE6DE] bg-white flex justify-end gap-2">
                    <button
                      onClick={() => {
                        if (window.confirm(`Delete article "${art.title}"?`)) {
                          setJournalArticles((prev) => prev.filter((a) => a.id !== art.id));
                          showToast('Article deleted', 'info');
                        }
                      }}
                      className="text-red-600 hover:text-red-800 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Journal Modal */}
            {showAddJournalModal && (
              <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!newJournalTitle) return;
                    const created = {
                      id: `art-${Date.now()}`,
                      title: newJournalTitle,
                      category: newJournalCategory,
                      author: newJournalAuthor,
                      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                      image: newJournalImage || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800&auto=format&fit=crop',
                      excerpt: newJournalExcerpt,
                      content: newJournalContent
                    };
                    setJournalArticles((prev) => [created, ...prev]);
                    setShowAddJournalModal(false);
                    setNewJournalTitle('');
                    setNewJournalExcerpt('');
                    setNewJournalContent('');
                    showToast('Published new journal essay!', 'success');
                  }}
                  className="bg-white max-w-xl w-full p-6 rounded-xs shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto border border-[#EAE6DE]"
                >
                  <div className="flex justify-between items-center border-b border-[#F0ECE1] pb-2">
                    <h3 className="text-base font-semibold text-[#1F1F1F]">Post New Journal Essay</h3>
                    <button type="button" onClick={() => setShowAddJournalModal(false)} className="text-gray-400 hover:text-black">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block text-[#4A453C] mb-1 font-medium">Article Title *</label>
                      <input
                        type="text"
                        required
                        value={newJournalTitle}
                        onChange={(e) => setNewJournalTitle(e.target.value)}
                        placeholder="e.g. The Craft of Handcrafted Silk Embroidery"
                        className="w-full px-3 py-2 border border-[#D5D0C5] rounded-xs"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[#4A453C] mb-1 font-medium">Category</label>
                        <input
                          type="text"
                          value={newJournalCategory}
                          onChange={(e) => setNewJournalCategory(e.target.value)}
                          className="w-full px-3 py-2 border border-[#D5D0C5] rounded-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[#4A453C] mb-1 font-medium">Author</label>
                        <input
                          type="text"
                          value={newJournalAuthor}
                          onChange={(e) => setNewJournalAuthor(e.target.value)}
                          className="w-full px-3 py-2 border border-[#D5D0C5] rounded-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[#4A453C] mb-1 font-medium">Picture Image URL / Data URL</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newJournalImage}
                          onChange={(e) => setNewJournalImage(e.target.value)}
                          className="flex-1 px-3 py-2 border border-[#D5D0C5] rounded-xs"
                        />
                        <input
                          type="file"
                          id="journal-img-file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const r = new FileReader();
                              r.onload = (ex) => setNewJournalImage(ex.target?.result as string);
                              r.readAsDataURL(file);
                            }
                          }}
                          className="hidden"
                        />
                        <label htmlFor="journal-img-file" className="px-3 py-2 bg-[#1F1F1F] text-white text-xs font-semibold rounded-xs cursor-pointer">
                          Browse
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[#4A453C] mb-1 font-medium">Excerpt Summary</label>
                      <textarea
                        rows={2}
                        value={newJournalExcerpt}
                        onChange={(e) => setNewJournalExcerpt(e.target.value)}
                        placeholder="Short teaser paragraph for the journal page..."
                        className="w-full px-3 py-2 border border-[#D5D0C5] rounded-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[#4A453C] mb-1 font-medium">Full Article Content</label>
                      <textarea
                        rows={5}
                        value={newJournalContent}
                        onChange={(e) => setNewJournalContent(e.target.value)}
                        placeholder="Write essay content..."
                        className="w-full px-3 py-2 border border-[#D5D0C5] rounded-xs font-serif"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-[#F0ECE1]">
                    <button type="button" onClick={() => setShowAddJournalModal(false)} className="px-4 py-2 text-xs text-[#7A7264]">
                      Cancel
                    </button>
                    <button type="submit" className="bg-[#C85A32] text-white text-xs font-semibold px-5 py-2 rounded-xs uppercase">
                      Publish Article
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {/* TAB: CMS PAGES MANAGER */}
        {adminTab === 'pages' && (
          <div className="bg-white border border-[#EAE6DE] rounded-xs shadow-xs p-6 space-y-6">
            <div className="flex justify-between items-center border-b border-[#F0ECE1] pb-4">
              <div>
                <h2 className="text-base font-semibold text-[#1F1F1F]">
                  CMS Custom Site Pages & Legal Policy Manager
                </h2>
                <p className="text-xs text-[#7A7264]">
                  Manage store policy pages including 7-day return guarantee, privacy, and studio history.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {cmsPages.map((pg) => (
                <div key={pg.id} className="p-4 border border-[#EAE6DE] rounded-xs bg-[#FAF9F6] flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-sm text-[#1F1F1F]">{pg.title}</h3>
                    <div className="text-[11px] text-[#8C8477] font-mono">{pg.slug} — Last updated: {pg.lastUpdated}</div>
                  </div>

                  <span className="bg-green-100 text-green-800 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase">
                    {pg.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: BANNERS & LOGO MEDIA CUSTOMIZER */}
        {adminTab === 'banners' && (
          <div className="bg-white border border-[#EAE6DE] rounded-xs shadow-xs p-6 space-y-8">
            <div className="border-b border-[#F0ECE1] pb-4">
              <h2 className="text-base font-semibold text-[#1F1F1F]">
                Storefront Media Assets, Banners & Brand Logo Manager
              </h2>
              <p className="text-xs text-[#7A7264]">
                Upload custom local photos or paste image URLs to change brand logos, hero model banners, and category feature cards live on the website.
              </p>
            </div>

            {/* SECTION 1: BRAND LOGO MANAGER */}
            <div className="p-5 border border-[#EAE6DE] bg-[#FAF9F6] rounded-xs space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-sm text-[#1F1F1F] uppercase tracking-wider flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-[#C85A32]" />
                  <span>Site Brand Logo Image</span>
                </h3>
                <span className="text-[10px] text-[#1E5638] bg-green-100 font-bold px-2 py-0.5 rounded-xs">
                  Active Logo Rendered Live
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                <div className="md:col-span-8 space-y-2">
                  <label className="block text-xs font-medium text-[#4A453C]">Brand Logo Image URL / Data URL</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={siteBanners?.logoUrl || 'https://i.ibb.co/MymbxNmJ/image.png'}
                      onChange={(e) => updateSiteBanners({ logoUrl: e.target.value })}
                      placeholder="Paste image URL (e.g. https://i.ibb.co/MymbxNmJ/image.png)"
                      className="flex-1 px-3 py-2 text-xs border border-[#D5D0C5] rounded-xs bg-white"
                    />
                    <input
                      type="file"
                      id="logo-asset-file-input"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const r = new FileReader();
                          r.onload = (ex) => {
                            updateSiteBanners({ logoUrl: ex.target?.result as string });
                            showToast('Brand logo updated', 'success');
                          };
                          r.readAsDataURL(file);
                        }
                      }}
                      className="hidden"
                    />
                    <label htmlFor="logo-asset-file-input" className="px-3.5 py-2 bg-[#1F1F1F] hover:bg-[#C85A32] text-white text-xs font-semibold rounded-xs transition-colors cursor-pointer shrink-0">
                      Upload File
                    </label>
                  </div>
                </div>

                <div className="md:col-span-4 p-4 bg-white border border-[#EAE6DE] rounded-xs flex flex-col items-center justify-center">
                  <span className="text-[10px] text-[#8C8477] uppercase font-bold mb-2">Live Logo Preview:</span>
                  <div className="p-3 bg-[#1F1F1F] rounded-xs w-full flex items-center justify-center">
                    <img
                      src={siteBanners?.logoUrl || 'https://i.ibb.co/MymbxNmJ/image.png'}
                      alt="Brand Logo Live Preview"
                      className="h-10 object-contain"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 2: HERO BANNER (FORM & STAY MODEL PHOTO & COPY) */}
            <div className="p-5 border border-[#EAE6DE] bg-[#FAF9F6] rounded-xs space-y-4">
              <h3 className="font-bold text-sm text-[#1F1F1F] uppercase tracking-wider flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#C85A32]" />
                <span>Main Hero Banner ("Enhancing your inner beauty")</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-[#4A453C] mb-1 font-medium">Hero Image URL</label>
                    <input
                      type="text"
                      value={siteBanners?.heroImage || ''}
                      onChange={(e) => updateSiteBanners({ heroImage: e.target.value })}
                      className="w-full px-3 py-2 border border-[#D5D0C5] rounded-xs bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[#4A453C] mb-1 font-medium">Hero Headline Title</label>
                    <input
                      type="text"
                      value={siteBanners?.heroTitle || ''}
                      onChange={(e) => updateSiteBanners({ heroTitle: e.target.value })}
                      className="w-full px-3 py-2 border border-[#D5D0C5] rounded-xs bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[#4A453C] mb-1 font-medium">Hero Subtitle Paragraph</label>
                    <textarea
                      rows={2}
                      value={siteBanners?.heroSubtitle || ''}
                      onChange={(e) => updateSiteBanners({ heroSubtitle: e.target.value })}
                      className="w-full px-3 py-2 border border-[#D5D0C5] rounded-xs bg-white"
                    />
                  </div>
                </div>

                <div className="aspect-video relative overflow-hidden bg-black/10 border border-[#EAE6DE] rounded-xs">
                  <img
                    src={siteBanners?.heroImage || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1200&auto=format&fit=crop'}
                    alt="Hero Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 p-4 text-white flex flex-col justify-end">
                    <span className="text-xs font-bold font-editorial">{siteBanners?.heroTitle}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 3: TRENDING EYEWEAR BANNER */}
            <div className="p-5 border border-[#EAE6DE] bg-[#FAF9F6] rounded-xs space-y-4">
              <h3 className="font-bold text-sm text-[#1F1F1F] uppercase tracking-wider flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-[#C85A32]" />
                <span>Trending Eyewear Model Banner</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-[#4A453C] mb-1 font-medium">Eyewear Banner Model Photo URL</label>
                    <input
                      type="text"
                      value={siteBanners?.eyewearImage || ''}
                      onChange={(e) => updateSiteBanners({ eyewearImage: e.target.value })}
                      className="w-full px-3 py-2 border border-[#D5D0C5] rounded-xs bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[#4A453C] mb-1 font-medium">Eyewear Title</label>
                    <input
                      type="text"
                      value={siteBanners?.eyewearTitle || ''}
                      onChange={(e) => updateSiteBanners({ eyewearTitle: e.target.value })}
                      className="w-full px-3 py-2 border border-[#D5D0C5] rounded-xs bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[#4A453C] mb-1 font-medium">Eyewear Subtitle Description</label>
                    <textarea
                      rows={2}
                      value={siteBanners?.eyewearSubtitle || ''}
                      onChange={(e) => updateSiteBanners({ eyewearSubtitle: e.target.value })}
                      className="w-full px-3 py-2 border border-[#D5D0C5] rounded-xs bg-white"
                    />
                  </div>
                </div>

                <div className="aspect-video relative overflow-hidden bg-black/10 border border-[#EAE6DE] rounded-xs">
                  <img
                    src={siteBanners?.eyewearImage || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1000&auto=format&fit=crop'}
                    alt="Eyewear Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 p-4 text-white flex flex-col justify-end">
                    <span className="text-xs font-bold font-editorial">{siteBanners?.eyewearTitle}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 4: EDITORIAL "KEEP CALM & STAY CLASSY" BANNER */}
            <div className="p-5 border border-[#EAE6DE] bg-[#FAF9F6] rounded-xs space-y-4">
              <h3 className="font-bold text-sm text-[#1F1F1F] uppercase tracking-wider flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#C85A32]" />
                <span>Editorial "KEEP CALM & STAY CLASSY" Split Banner</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-[#4A453C] mb-1 font-medium">Editorial Image URL</label>
                    <input
                      type="text"
                      value={siteBanners?.editorialImage || ''}
                      onChange={(e) => updateSiteBanners({ editorialImage: e.target.value })}
                      className="w-full px-3 py-2 border border-[#D5D0C5] rounded-xs bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[#4A453C] mb-1 font-medium">Editorial Headline</label>
                    <input
                      type="text"
                      value={siteBanners?.editorialTitle || ''}
                      onChange={(e) => updateSiteBanners({ editorialTitle: e.target.value })}
                      className="w-full px-3 py-2 border border-[#D5D0C5] rounded-xs bg-white"
                    />
                  </div>
                </div>

                <div className="aspect-video relative overflow-hidden bg-black/10 border border-[#EAE6DE] rounded-xs">
                  <img
                    src={siteBanners?.editorialImage || 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1200&auto=format&fit=crop'}
                    alt="Editorial Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 5: FEATURED CATEGORIES CARDS (LEATHER & FOOTWEAR) */}
            <div className="p-5 border border-[#EAE6DE] bg-[#FAF9F6] rounded-xs space-y-4">
              <h3 className="font-bold text-sm text-[#1F1F1F] uppercase tracking-wider flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-[#C85A32]" />
                <span>Featured Category Department Cards</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-[#4A453C] mb-1 font-medium">Leather & Canvas Backpack Card Image</label>
                  <input
                    type="text"
                    value={siteBanners?.backpackCatImage || ''}
                    onChange={(e) => updateSiteBanners({ backpackCatImage: e.target.value })}
                    className="w-full px-3 py-2 border border-[#D5D0C5] rounded-xs bg-white"
                  />
                  <div className="mt-2 aspect-video overflow-hidden rounded-xs border border-[#EAE6DE]">
                    <img src={siteBanners?.backpackCatImage} alt="Backpack Card" className="w-full h-full object-cover" />
                  </div>
                </div>

                <div>
                  <label className="block text-[#4A453C] mb-1 font-medium">Heritage Craft Footwear Card Image</label>
                  <input
                    type="text"
                    value={siteBanners?.footwearCatImage || ''}
                    onChange={(e) => updateSiteBanners({ footwearCatImage: e.target.value })}
                    className="w-full px-3 py-2 border border-[#D5D0C5] rounded-xs bg-white"
                  />
                  <div className="mt-2 aspect-video overflow-hidden rounded-xs border border-[#EAE6DE]">
                    <img src={siteBanners?.footwearCatImage} alt="Footwear Card" className="w-full h-full object-cover" />
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* TAB 3: DYNAMIC DELIVERY TIMEFRAME ESTIMATOR SLIDER */}
        {adminTab === 'settings' && (
          <div className="bg-white border border-[#EAE6DE] rounded-xs shadow-xs p-6 sm:p-8 space-y-8">
            
            <div className="max-w-3xl space-y-2">
              <div className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-wider text-[#C85A32] uppercase">
                <Sliders className="w-3.5 h-3.5" />
                <span>Live Frontend Delivery Synchronizer</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-semibold font-editorial text-[#1F1F1F]">
                Standard Fulfillment & Delivery Time Estimator
              </h2>
              <p className="text-xs text-[#7A7264] leading-relaxed">
                Adjust the slider below to dynamically set the standard business days delivery timeframe (1 to 30 days). The updated delivery date automatically updates the live database state, synchronizing instantaneously with customer Product Detail Pages (PDP), Cart drawers, and Checkout pages.
              </p>
            </div>

            {/* Slider Control Box */}
            <div className="bg-[#FAF9F6] border border-[#EAE6DE] p-6 sm:p-8 rounded-xs space-y-6 max-w-3xl">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <label htmlFor="delivery-days-slider" className="text-sm font-semibold text-[#1F1F1F] block">
                    Current Standard Delivery Window
                  </label>
                  <span className="text-xs text-[#7A7264]">
                    Dispatched from Copenhagen central logistics depot
                  </span>
                </div>

                <div className="flex items-center gap-2 bg-white px-4 py-2 border border-[#C85A32]/40 rounded-xs shadow-2xs">
                  <Truck className="w-4 h-4 text-[#C85A32]" />
                  <span className="text-lg font-bold text-[#1F1F1F] font-mono">
                    {standardDeliveryDays}
                  </span>
                  <span className="text-xs font-semibold text-[#6E685F]">Business Days</span>
                </div>
              </div>

              {/* Range Slider */}
              <div className="space-y-3">
                <input
                  id="delivery-days-slider"
                  type="range"
                  min="1"
                  max="30"
                  step="1"
                  value={standardDeliveryDays}
                  onChange={(e) => setStandardDeliveryDays(parseInt(e.target.value, 10))}
                  className="w-full h-2 bg-[#EBE8E2] rounded-lg appearance-none cursor-pointer accent-[#C85A32]"
                />

                <div className="flex justify-between text-[11px] font-semibold text-[#8C8477]">
                  <span>1 Day (Next Day)</span>
                  <span>7 Days (1 Week)</span>
                  <span>14 Days (2 Weeks)</span>
                  <span>21 Days</span>
                  <span>30 Days (Pre-order / Bespoke)</span>
                </div>
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#EBE8E2]">
                <span className="text-[11px] font-semibold text-[#6E685F]">Quick Presets:</span>
                {[
                  { label: 'Express (2 Days)', val: 2 },
                  { label: 'Standard (4 Days)', val: 4 },
                  { label: 'Nordic Regional (7 Days)', val: 7 },
                  { label: 'International (10 Days)', val: 10 },
                  { label: 'Custom Workshop (18 Days)', val: 18 }
                ].map((preset) => (
                  <button
                    key={preset.val}
                    onClick={() => setStandardDeliveryDays(preset.val)}
                    className={`px-3 py-1 text-xs rounded-xs font-medium transition-colors cursor-pointer border ${
                      standardDeliveryDays === preset.val
                        ? 'bg-[#C85A32] text-white border-[#C85A32]'
                        : 'bg-white text-[#4A453C] border-[#D5D0C5] hover:border-[#1F1F1F]'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Online Payment Discount Setting Box */}
            <div className="bg-[#FAF9F6] border border-[#EAE6DE] p-6 sm:p-8 rounded-xs space-y-6 max-w-3xl">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-[#1F1F1F]">
                    Online Payment Instant Discount % (COD vs Online Pricing Incentive)
                  </h3>
                  <p className="text-xs text-[#7A7264] mt-0.5">
                    Customers choosing UPI, Card, Netbanking, or Apple Pay get an instant discount to convert faster, while COD is charged normal price.
                  </p>
                </div>

                <div className="flex items-center gap-2 bg-white px-4 py-2 border border-green-600/40 rounded-xs shadow-2xs">
                  <Sparkles className="w-4 h-4 text-[#1E5638]" />
                  <span className="text-lg font-bold text-[#1E5638] font-mono">
                    {onlineDiscountPercent}%
                  </span>
                  <span className="text-xs font-semibold text-[#6E685F]">OFF</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-[#4A453C]">Set Online Discount Percentage (0% to 50%):</label>
                <div className="flex gap-3 items-center">
                  <input
                    type="number"
                    min={0}
                    max={50}
                    value={onlineDiscountPercent}
                    onChange={(e) => updateOnlineDiscountPercent(parseFloat(e.target.value) || 0)}
                    className="w-32 px-3.5 py-2 text-xs font-bold font-mono border border-[#D5D0C5] rounded-xs bg-white"
                  />
                  <span className="text-xs text-[#7A7264]">Percent Instant Discount for Online Payments</span>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  <span className="text-[11px] font-semibold text-[#6E685F]">Presets:</span>
                  {[5, 10, 12, 15, 20].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => updateOnlineDiscountPercent(pct)}
                      className={`px-3 py-1 text-xs rounded-xs font-medium border cursor-pointer ${
                        onlineDiscountPercent === pct
                          ? 'bg-[#1E5638] text-white border-[#1E5638]'
                          : 'bg-white text-[#4A453C] border-[#D5D0C5]'
                      }`}
                    >
                      {pct}% OFF
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Live Customer Preview Simulation */}
            <div className="max-w-3xl space-y-3">
              <h3 className="text-xs font-bold uppercase text-[#1F1F1F] tracking-wider">
                Live Customer-Facing PDP Simulation
              </h3>
              
              <div className="p-4 bg-[#FAF1ED] border border-[#C85A32]/30 rounded-xs space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#C85A32]">
                  <Truck className="w-4 h-4" />
                  <span>Calculated Estimated Delivery:</span>
                </div>
                <div className="text-sm font-bold text-[#1F1F1F]">
                  Order today, expected delivery by <span className="text-[#C85A32] underline decoration-1 underline-offset-2">{calculateDeliveryDate().fullDate}</span>
                </div>
                <p className="text-[11px] text-[#7A7264]">
                  This banner appears on every product page above the "Add to Bag" button and inside the Checkout delivery section.
                </p>
              </div>
            </div>

          </div>
        )}

        {/* TAB 4: COUPONS & PROMOS */}
        {adminTab === 'coupons' && (
          <div className="bg-white border border-[#EAE6DE] rounded-xs shadow-xs p-6 space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-base font-semibold text-[#1F1F1F]">
                  Promotional Vouchers & Discount Engine
                </h2>
                <p className="text-xs text-[#7A7264]">Configure discount codes redeemable during checkout.</p>
              </div>

              <button
                onClick={() => setShowAddCoupon(true)}
                className="bg-[#C85A32] hover:bg-[#B34E2A] text-white text-xs font-semibold px-4 py-2 rounded-xs uppercase tracking-wider transition-colors inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Create Coupon</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {coupons.map((cpn) => (
                <div key={cpn.id} className="p-4 border border-[#EAE6DE] rounded-xs bg-[#FAF9F6] space-y-2 relative group">
                  <div className="flex justify-between items-center">
                    <span className="font-mono font-bold text-sm text-[#C85A32] bg-white px-2 py-0.5 border border-[#C85A32]/30 rounded-xs">
                      {cpn.code}
                    </span>
                    <span className="text-[10px] bg-[#EBF5EF] text-[#1E5638] px-2 py-0.5 rounded-full font-semibold">
                      {cpn.isActive ? 'Active' : 'Expired'}
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-[#1F1F1F]">
                    {cpn.discountPercentage}% Discount
                  </div>
                  <p className="text-[11px] text-[#6E685F]">{cpn.description}</p>
                  <div className="text-[10px] text-[#8C8477] pt-1 flex justify-between items-center">
                    <span>Min. Order: {formatPrice(cpn.minOrderAmount)}</span>
                    <button
                      onClick={() => deleteCoupon(cpn.code)}
                      className="text-[#A0988A] hover:text-[#D32F2F] transition-colors p-1"
                      title="Delete Coupon"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Coupon Modal */}
            {showAddCoupon && (
              <form onSubmit={handleCreateCoupon} className="p-5 border border-[#C85A32]/40 rounded-xs bg-[#FAF1ED]/30 space-y-3">
                <h4 className="text-xs font-bold uppercase text-[#1F1F1F]">New Coupon Voucher</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] text-[#4A453C] mb-1">Coupon Code (e.g. FLASH25)</label>
                    <input
                      type="text"
                      required
                      value={newCouponCode}
                      onChange={(e) => setNewCouponCode(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs border border-[#D5D0C5] rounded-xs uppercase bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#4A453C] mb-1">Discount %</label>
                    <input
                      type="number"
                      required
                      value={newCouponDiscount}
                      onChange={(e) => setNewCouponDiscount(Number(e.target.value))}
                      className="w-full px-3 py-1.5 text-xs border border-[#D5D0C5] rounded-xs bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#4A453C] mb-1">Min Order Amount ($)</label>
                    <input
                      type="number"
                      value={newCouponMin}
                      onChange={(e) => setNewCouponMin(Number(e.target.value))}
                      className="w-full px-3 py-1.5 text-xs border border-[#D5D0C5] rounded-xs bg-white"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddCoupon(false)}
                    className="px-3 py-1.5 text-xs text-[#7A7264]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-[#C85A32] text-white text-xs font-semibold px-4 py-1.5 rounded-xs"
                  >
                    Activate Coupon
                  </button>
                </div>
              </form>
            )}

          </div>
        )}

        {/* TAB 5: ABANDONED CART RECOVERY */}
        {adminTab === 'abandoned' && (
          <div className="bg-white border border-[#EAE6DE] rounded-xs shadow-xs p-6 space-y-4">
            <div>
              <h2 className="text-base font-semibold text-[#1F1F1F]">
                Abandoned Checkout Recovery Center
              </h2>
              <p className="text-xs text-[#7A7264]">
                Automatically re-engage shoppers with customized recovery discounts and SMS triggers.
              </p>
            </div>

            <div className="divide-y divide-[#F0ECE1]">
              {abandonedCarts.map((item) => (
                <div key={item.id} className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
                  <div>
                    <div className="font-semibold text-[#1F1F1F]">{item.customerName} ({item.email})</div>
                    <div className="text-[11px] text-[#8C8477]">
                      Abandoned {item.date} | Cart Value: <strong>{formatPrice(item.value)}</strong> ({item.itemsCount} items)
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {item.recovered ? (
                      <span className="text-xs text-[#1E5638] bg-[#EBF5EF] px-3 py-1 rounded-xs font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Recovery Email Dispatched
                      </span>
                    ) : (
                      <button
                        onClick={() => recoverAbandonedCart(item.id)}
                        className="bg-[#1F1F1F] hover:bg-[#C85A32] text-white text-xs font-semibold px-4 py-2 rounded-xs uppercase tracking-wider transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Send 10% Recovery Voucher</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* ========================================================================= */}
      {/* DETAILED ORDER PROFILE MODAL WITH ACTION HUB (OMS) */}
      {/* ========================================================================= */}
      {selectedOrderProfile && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white max-w-3xl w-full rounded-xs shadow-2xl overflow-hidden my-8 border border-[#EAE6DE] flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-6 bg-[#1F1F1F] text-white flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold tracking-widest uppercase text-[#C85A32]">
                    Order Profile
                  </span>
                  <span className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded-full ${
                    selectedOrderProfile.status === 'delivered' ? 'bg-green-600 text-white' :
                    selectedOrderProfile.status === 'cancelled' || selectedOrderProfile.status === 'refunded' ? 'bg-red-600 text-white' :
                    'bg-[#C85A32] text-white'
                  }`}>
                    {selectedOrderProfile.status.replace('_', ' ')}
                  </span>
                </div>
                <h3 className="text-xl font-bold font-editorial mt-1">
                  Order #{selectedOrderProfile.orderNumber}
                </h3>
                <p className="text-xs text-white/70">
                  Placed on {new Date(selectedOrderProfile.createdAt).toLocaleString()} | Tracking: {selectedOrderProfile.trackingNumber}
                </p>
              </div>

              <button
                onClick={() => setSelectedOrderProfile(null)}
                className="p-1 text-white/70 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              
              {/* Order Action Hub (Top Actions Bar) */}
              <div className="p-4 bg-[#FAF9F6] border border-[#EAE6DE] rounded-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#1F1F1F] uppercase tracking-wider text-[11px]">
                    Fulfillment Action Hub
                  </span>
                  <span className="text-[11px] text-[#8C8477]">
                    Carrier: <strong>{selectedOrderProfile.carrier}</strong>
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {/* Approve */}
                  <button
                    onClick={() => {
                      approveOrder(selectedOrderProfile.id);
                      setSelectedOrderProfile(null);
                    }}
                    className="px-3.5 py-2 bg-[#1E5638] hover:bg-[#16432A] text-white font-semibold rounded-xs transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Approve Order</span>
                  </button>

                  {/* Generate Shipping Label */}
                  <button
                    onClick={() => setShippingLabelOrder(selectedOrderProfile)}
                    className="px-3.5 py-2 bg-[#1F1F1F] hover:bg-[#C85A32] text-white font-semibold rounded-xs transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Generate Shipping Label</span>
                  </button>

                  {/* Mark as Shipped */}
                  <button
                    onClick={() => {
                      setShippedModalOrder(selectedOrderProfile);
                      setCustomTracking(`DHL-${Math.floor(100000000 + Math.random() * 900000000)}`);
                    }}
                    className="px-3.5 py-2 border border-[#C85A32] text-[#C85A32] hover:bg-[#C85A32] hover:text-white font-semibold rounded-xs transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Truck className="w-3.5 h-3.5" />
                    <span>Mark as Shipped</span>
                  </button>

                  {/* Cancel Order */}
                  <button
                    onClick={() => setCancelModalOrder(selectedOrderProfile)}
                    className="px-3 py-2 border border-gray-300 text-gray-700 hover:text-red-600 hover:border-red-400 font-semibold rounded-xs transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Ban className="w-3.5 h-3.5" />
                    <span>Cancel</span>
                  </button>

                  {/* Process Refund */}
                  <button
                    onClick={() => {
                      if (confirm(`Process full refund of ${formatPrice(selectedOrderProfile.total)} for Order #${selectedOrderProfile.orderNumber}?`)) {
                        refundOrder(selectedOrderProfile.id, selectedOrderProfile.total);
                        setSelectedOrderProfile(null);
                      }
                    }}
                    className="px-3 py-2 border border-red-200 text-red-600 hover:bg-red-50 font-semibold rounded-xs transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Process Refund</span>
                  </button>
                </div>
              </div>

              {/* Itemized Order Details */}
              <div className="space-y-3">
                <h4 className="font-bold text-[#1F1F1F] uppercase tracking-wider text-[11px]">
                  1. Itemized SKU Order Breakdown
                </h4>
                <div className="border border-[#EAE6DE] rounded-xs divide-y divide-[#F0ECE1]">
                  {selectedOrderProfile.items.map((item) => (
                    <div key={item.id} className="p-3 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-12 h-12 object-cover rounded-xs border border-[#EAE6DE]"
                        />
                        <div>
                          <div className="font-semibold text-[#1F1F1F]">{item.name}</div>
                          <div className="text-[11px] text-[#8C8477]">
                            SKU: <span className="font-mono">{item.sku}</span> | Variation: {item.selectedColor || 'Default'} {item.selectedSize ? `/ ${item.selectedSize}` : ''}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-semibold text-[#1F1F1F]">
                          {formatPrice(item.price)} × {item.quantity}
                        </div>
                        <div className="font-bold text-[#C85A32]">
                          {formatPrice(item.price * item.quantity)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 2-Column: Customer Data & Delivery Address + Financial Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Comprehensive Customer Data with Pincode */}
                <div className="p-4 border border-[#EAE6DE] rounded-xs bg-[#FAF9F6] space-y-2.5">
                  <h4 className="font-bold text-[#1F1F1F] uppercase tracking-wider text-[11px]">
                    2. Customer Profile & Delivery Address
                  </h4>
                  
                  <div className="space-y-1 text-[#4A453C]">
                    <div className="font-semibold text-[#1F1F1F] text-sm">
                      {selectedOrderProfile.shippingAddress.fullName}
                    </div>
                    <div>Email: {selectedOrderProfile.shippingAddress.email || 'customer@hauteboutique.com'}</div>
                    <div>Phone: {selectedOrderProfile.shippingAddress.phone || '+45 20 12 34 56'}</div>
                    <div className="pt-2 border-t border-[#EBE8E2]">
                      <div>{selectedOrderProfile.shippingAddress.streetAddress}</div>
                      <div>{selectedOrderProfile.shippingAddress.city}, {selectedOrderProfile.shippingAddress.state}</div>
                      <div className="font-semibold text-[#1F1F1F] flex items-center gap-1 mt-0.5">
                        <span>Pincode / Postal:</span>
                        <span className="font-mono bg-white px-2 py-0.5 border border-[#D5D0C5] rounded-xs text-[#C85A32]">
                          {selectedOrderProfile.shippingAddress.postalCode}
                        </span>
                      </div>
                      <div>{selectedOrderProfile.shippingAddress.country}</div>
                    </div>
                  </div>
                </div>

                {/* Complete Financial Breakdown */}
                <div className="p-4 border border-[#EAE6DE] rounded-xs bg-[#FAF9F6] space-y-2.5">
                  <h4 className="font-bold text-[#1F1F1F] uppercase tracking-wider text-[11px]">
                    3. Financial Statement & Ledgers
                  </h4>

                  <div className="space-y-1.5 text-[#4A453C]">
                    <div className="flex justify-between">
                      <span>Items Subtotal:</span>
                      <span className="font-medium">{formatPrice(selectedOrderProfile.subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping Fee:</span>
                      <span className="font-medium">
                        {selectedOrderProfile.shippingCost === 0 ? 'FREE' : formatPrice(selectedOrderProfile.shippingCost)}
                      </span>
                    </div>
                    {selectedOrderProfile.discount > 0 && (
                      <div className="flex justify-between text-[#1E5638]">
                        <span>Applied Discount:</span>
                        <span className="font-medium">-{formatPrice(selectedOrderProfile.discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Estimated Tax (8%):</span>
                      <span className="font-medium">{formatPrice(selectedOrderProfile.tax)}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-[#EBE8E2] text-sm font-bold text-[#1F1F1F]">
                      <span>Total Order Amount:</span>
                      <span className="text-[#C85A32]">{formatPrice(selectedOrderProfile.total)}</span>
                    </div>
                    <div className="pt-2 text-[10px] text-[#8C8477]">
                      Payment Method: <strong>{selectedOrderProfile.paymentMethod.toUpperCase()}</strong> | Status: <strong>{selectedOrderProfile.paymentStatus.toUpperCase()}</strong>
                    </div>
                  </div>
                </div>

              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-[#FAF9F6] border-t border-[#EAE6DE] flex justify-end">
              <button
                onClick={() => setSelectedOrderProfile(null)}
                className="px-6 py-2 bg-[#1F1F1F] text-white rounded-xs text-xs font-semibold hover:bg-[#C85A32] transition-colors cursor-pointer"
              >
                Close Order Profile
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PRINTABLE SHIPPING LABEL MODAL */}
      {/* ========================================================================= */}
      {shippingLabelOrder && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full p-6 rounded-xs shadow-2xl border-2 border-[#1F1F1F] space-y-4">
            <div className="flex justify-between items-center border-b border-[#1F1F1F] pb-3">
              <div className="flex items-center gap-1.5 font-bold font-editorial text-lg text-[#1F1F1F]">
                <span>HAUTE BOUTIQUE</span>
                <span className="text-[10px] font-sans font-normal border border-black px-1.5 py-0.5">EXPRESS</span>
              </div>
              <button
                onClick={() => setShippingLabelOrder(null)}
                className="p-1 text-gray-500 hover:text-black cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Label Body */}
            <div className="border border-black p-4 space-y-4 text-xs font-mono">
              <div className="flex justify-between border-b border-black pb-2 text-[11px]">
                <div>
                  <div className="font-bold text-black">SHIP FROM:</div>
                  <div>Haute Logistics Depot</div>
                  <div>Kronprinsensgade 12</div>
                  <div>Copenhagen, 1114 DK</div>
                </div>
                <div className="text-right">
                  <div className="font-bold">WEIGHT: 1.25 KG</div>
                  <div>DATE: {new Date().toLocaleDateString()}</div>
                </div>
              </div>

              <div className="border-b border-black pb-3">
                <div className="text-[10px] text-gray-600 uppercase font-bold">SHIP TO:</div>
                <div className="text-sm font-bold text-black mt-1">
                  {shippingLabelOrder.shippingAddress.fullName}
                </div>
                <div>{shippingLabelOrder.shippingAddress.streetAddress}</div>
                <div>{shippingLabelOrder.shippingAddress.city}, {shippingLabelOrder.shippingAddress.state}</div>
                <div className="text-base font-black tracking-widest mt-1">
                  POSTAL: {shippingLabelOrder.shippingAddress.postalCode}
                </div>
                <div>{shippingLabelOrder.shippingAddress.country}</div>
              </div>

              {/* Barcode & Tracking */}
              <div className="text-center space-y-2 pt-2">
                <div className="text-lg font-black tracking-wider bg-black text-white py-1">
                  CARRIER: {shippingLabelOrder.carrier.toUpperCase()}
                </div>
                
                {/* Mock Barcode */}
                <div className="h-12 w-full bg-[repeating-linear-gradient(90deg,#000,#000_2px,#fff_2px,#fff_4px,#000_4px,#000_7px,#fff_7px,#fff_8px)]" />
                <div className="font-bold tracking-widest text-xs">
                  {shippingLabelOrder.trackingNumber}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShippingLabelOrder(null)}
                className="px-4 py-2 text-xs text-[#7A7264] border border-[#D5D0C5] rounded-xs cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  window.print();
                  showToast('Shipping Label Sent to Printer', 'success');
                  setShippingLabelOrder(null);
                }}
                className="px-5 py-2 bg-[#1F1F1F] hover:bg-[#C85A32] text-white text-xs font-semibold rounded-xs inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Physical Label</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MARK AS SHIPPED PROMPT MODAL */}
      {/* ========================================================================= */}
      {shippedModalOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full p-6 rounded-xs shadow-2xl border border-[#EAE6DE] space-y-4">
            <h3 className="text-base font-semibold text-[#1F1F1F]">
              Mark Order #{shippedModalOrder.orderNumber} as Shipped
            </h3>
            
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[#4A453C] mb-1 font-medium">Logistics Carrier</label>
                <input
                  type="text"
                  value={customCarrier}
                  onChange={(e) => setCustomCarrier(e.target.value)}
                  className="w-full px-3 py-2 border border-[#D5D0C5] rounded-xs"
                />
              </div>

              <div>
                <label className="block text-[#4A453C] mb-1 font-medium">Tracking Number</label>
                <input
                  type="text"
                  value={customTracking}
                  onChange={(e) => setCustomTracking(e.target.value)}
                  className="w-full px-3 py-2 border border-[#D5D0C5] rounded-xs font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShippedModalOrder(null)}
                className="px-4 py-2 text-xs text-[#7A7264]"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  markOrderShipped(shippedModalOrder.id, customCarrier, customTracking);
                  setShippedModalOrder(null);
                  if (selectedOrderProfile) setSelectedOrderProfile(null);
                }}
                className="bg-[#C85A32] text-white text-xs font-semibold px-5 py-2 rounded-xs"
              >
                Confirm Dispatch
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CANCEL ORDER PROMPT MODAL */}
      {/* ========================================================================= */}
      {cancelModalOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full p-6 rounded-xs shadow-2xl border border-[#EAE6DE] space-y-4">
            <h3 className="text-base font-semibold text-[#D32F2F]">
              Cancel Order #{cancelModalOrder.orderNumber}
            </h3>
            
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[#4A453C] mb-1 font-medium">Reason for Cancellation</label>
                <select
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full px-3 py-2 border border-[#D5D0C5] rounded-xs bg-white"
                >
                  <option value="Customer requested cancellation">Customer requested cancellation</option>
                  <option value="Inventory shortage / Out of stock">Inventory shortage / Out of stock</option>
                  <option value="Delivery address deliverability issue">Delivery address deliverability issue</option>
                  <option value="Suspected fraudulent transaction">Suspected fraudulent transaction</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setCancelModalOrder(null)}
                className="px-4 py-2 text-xs text-[#7A7264]"
              >
                Back
              </button>
              <button
                onClick={() => {
                  cancelOrder(cancelModalOrder.id, cancelReason);
                  setCancelModalOrder(null);
                  if (selectedOrderProfile) setSelectedOrderProfile(null);
                }}
                className="bg-[#D32F2F] text-white text-xs font-semibold px-5 py-2 rounded-xs"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ADD PRODUCT MODAL (WITH LOCAL FILE UPLOADS + YOUTUBE/MP4 VIDEO STREAM) */}
      {/* ========================================================================= */}
      {showAddProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <form
            onSubmit={handleCreateProduct}
            className="bg-white max-w-2xl w-full p-6 sm:p-8 rounded-xs shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto border border-[#EAE6DE] my-8"
          >
            <div className="flex justify-between items-start border-b border-[#F0ECE1] pb-3">
              <div>
                <span className="text-[10px] font-bold tracking-widest text-[#C85A32] uppercase">
                  Catalog Management
                </span>
                <h3 className="text-lg font-semibold text-[#1F1F1F] font-editorial">
                  Create New Designer Product
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddProduct(false)}
                className="text-gray-400 hover:text-black cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Product Name & SKU */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-[#4A453C] mb-1">Product Title *</label>
                <input
                  type="text"
                  required
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  placeholder="e.g. Bergen Weatherproof Waxed Canvas Backpack"
                  className="w-full px-3 py-2 text-xs border border-[#D5D0C5] rounded-xs focus:outline-none focus:border-[#C85A32]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#4A453C] mb-1">SKU Code</label>
                <input
                  type="text"
                  value={newProdSku}
                  onChange={(e) => setNewProdSku(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-[#D5D0C5] rounded-xs font-mono uppercase bg-[#FAF9F6]"
                />
              </div>
            </div>

            {/* Pricing (Base & Sale) + Category + Stock */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-medium text-[#4A453C] mb-1">Category</label>
                <select
                  value={newProdCategory}
                  onChange={(e) => setNewProdCategory(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs border border-[#D5D0C5] rounded-xs bg-white capitalize"
                >
                  <option value="backpack">Backpacks</option>
                  <option value="shoes">Footwear / Shoes</option>
                  <option value="glasses">Eyewear / Glasses</option>
                  <option value="hats">Headwear / Hats</option>
                  <option value="apparel">Apparel / Knits</option>
                  <option value="accessories">Accessories</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#4A453C] mb-1">Sale Price ($) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={newProdPrice}
                  onChange={(e) => setNewProdPrice(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs border border-[#D5D0C5] rounded-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#4A453C] mb-1">Base / Orig. Price ($)</label>
                <input
                  type="number"
                  min="1"
                  value={newProdOriginalPrice}
                  onChange={(e) => setNewProdOriginalPrice(Number(e.target.value))}
                  placeholder="Optional regular"
                  className="w-full px-3 py-2 text-xs border border-[#D5D0C5] rounded-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#4A453C] mb-1">Stock Quantity</label>
                <input
                  type="number"
                  min="0"
                  value={newProdStock}
                  onChange={(e) => setNewProdStock(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs border border-[#D5D0C5] rounded-xs"
                />
              </div>
            </div>

            {/* Return Policy (Max 7 Days) & Social Proof Purchases Count */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[#4A453C] mb-1">
                  Product Return Policy (Maximum Return Window: 7 Days)
                </label>
                <input
                  type="text"
                  value={newProdReturnPolicy}
                  onChange={(e) => setNewProdReturnPolicy(e.target.value)}
                  placeholder="e.g. 7 Days Easy Hassle-Free Returns & Exchange"
                  className="w-full px-3 py-2 text-xs border border-[#D5D0C5] rounded-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#4A453C] mb-1">
                  Social Proof: Purchased in Last 7 Days Count (Displays near Stars)
                </label>
                <input
                  type="number"
                  min="0"
                  value={newProdRecentPurchases}
                  onChange={(e) => setNewProdRecentPurchases(Number(e.target.value))}
                  placeholder="e.g. 42"
                  className="w-full px-3 py-2 text-xs border border-[#D5D0C5] rounded-xs"
                />
              </div>
            </div>

            {/* Tagline */}
            <div>
              <label className="block text-xs font-medium text-[#4A453C] mb-1">Editorial Tagline</label>
              <input
                type="text"
                value={newProdTagline}
                onChange={(e) => setNewProdTagline(e.target.value)}
                placeholder="Handcrafted in Oslo from sustainable vegetable-tanned full-grain leather"
                className="w-full px-3 py-2 text-xs border border-[#D5D0C5] rounded-xs"
              />
            </div>

            {/* NATIVE VIDEO INTEGRATION: LOCAL MP4/WEBM UPLOAD OR YOUTUBE VIDEO LINK */}
            <div className="bg-[#FAF1ED]/40 p-4 border border-[#C85A32]/30 rounded-xs space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#1F1F1F] flex items-center gap-1.5">
                  <Film className="w-3.5 h-3.5 text-[#C85A32]" />
                  <span>Showcase Video Stream (Local MP4 File or YouTube Link)</span>
                </label>
                {newProdYoutubeUrl && (
                  <span className="text-[10px] bg-green-100 text-green-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Check className="w-2.5 h-2.5" />
                    Video Attached
                  </span>
                )}
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={newProdYoutubeUrl}
                  onChange={(e) => setNewProdYoutubeUrl(e.target.value)}
                  placeholder="Paste YouTube Link (or upload local MP4 video file)"
                  className="flex-1 px-3 py-2 text-xs border border-[#D5D0C5] rounded-xs bg-white focus:outline-none focus:border-[#C85A32]"
                />
                <input
                  type="file"
                  id="add-video-file-input"
                  accept="video/mp4,video/webm,video/ogg,video/*"
                  onChange={(e) => e.target.files?.[0] && processVideoFile(e.target.files[0], 'new')}
                  className="hidden"
                />
                <label
                  htmlFor="add-video-file-input"
                  className="px-3 py-2 bg-[#1F1F1F] hover:bg-[#C85A32] text-white text-xs font-semibold rounded-xs transition-colors cursor-pointer inline-flex items-center justify-center gap-1.5 shrink-0"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Local Video File</span>
                </label>
              </div>

              {/* Video Live Preview */}
              {newProdYoutubeUrl && (
                <div className="pt-1">
                  <span className="text-[10px] font-bold text-[#8C8477] uppercase block mb-1">Live Video Stream Preview:</span>
                  <ProductVideoEmbed
                    youtubeUrl={newProdYoutubeUrl}
                    productName={newProdName || 'New Product'}
                    productId="preview-new"
                    showTelemetryBadge={false}
                    className="max-w-md"
                  />
                </div>
              )}
            </div>

            {/* Image Gallery Uploads & Drag & Drop Area */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="block text-xs font-medium text-[#4A453C]">
                  Product Image Gallery ({newProdImages.length} photos)
                </label>

                <input
                  type="file"
                  id="add-images-file-input"
                  accept="image/*"
                  multiple
                  onChange={(e) => e.target.files && processImageFiles(e.target.files, 'new')}
                  className="hidden"
                />
                <label
                  htmlFor="add-images-file-input"
                  className="px-3 py-1.5 bg-[#FAF1ED] border border-[#C85A32]/40 text-[#C85A32] hover:bg-[#C85A32] hover:text-white text-xs font-semibold rounded-xs transition-colors cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Browse & Upload Images</span>
                </label>
              </div>

              {/* Drag and Drop Zone */}
              <div 
                onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragOver(false);
                  if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                    processImageFiles(e.dataTransfer.files, 'new');
                  }
                }}
                className={`p-5 border-2 border-dashed rounded-xs text-center transition-colors ${
                  isDragOver ? 'border-[#C85A32] bg-[#FAF1ED]' : 'border-[#D5D0C5] bg-[#FAF9F6]'
                }`}
              >
                <Upload className="w-6 h-6 mx-auto mb-2 text-[#C85A32]" />
                <div className="text-xs font-semibold text-[#1F1F1F]">
                  Drag and drop product photos here, or click Browse above
                </div>
                <div className="text-[11px] text-[#7A7264] mt-0.5">
                  Local PNG, JPG, or WebP photography auto-converted & embedded
                </div>
              </div>

              {/* URL Input & Add */}
              <div className="flex gap-2">
                <input
                  type="url"
                  value={newProdImageUrlInput}
                  onChange={(e) => setNewProdImageUrlInput(e.target.value)}
                  placeholder="Or paste direct Image URL (e.g. https://images.unsplash.com/...)"
                  className="flex-1 px-3 py-2 text-xs border border-[#D5D0C5] rounded-xs"
                />
                <button
                  type="button"
                  onClick={handleAddImageUrl}
                  className="px-4 py-2 bg-[#1F1F1F] text-white text-xs font-semibold rounded-xs hover:bg-[#C85A32] transition-colors cursor-pointer"
                >
                  Add Photo
                </button>
              </div>

              {/* Image Previews Thumbnails List */}
              {newProdImages.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {newProdImages.map((img, idx) => (
                    <div key={idx} className="relative w-16 h-16 rounded-xs overflow-hidden border border-[#EAE6DE] group">
                      <img src={img} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute inset-0 bg-red-600/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Remove Photo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Quick Sample Image Presets */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[10px] font-semibold text-[#8C8477]">Quick Samples:</span>
                {sampleImagePresets.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => setNewProdImages((prev) => [...prev, preset.url])}
                    className="px-2 py-0.5 bg-white border border-[#EAE6DE] text-[10px] text-[#4A453C] rounded-xs hover:border-[#C85A32] cursor-pointer"
                  >
                    + {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-medium text-[#4A453C] mb-1">Product Craftsmanship & Materials Description</label>
              <textarea
                rows={3}
                value={newProdDesc}
                onChange={(e) => setNewProdDesc(e.target.value)}
                placeholder="Handcrafted details, fabric composition, durability features..."
                className="w-full px-3 py-2 text-xs border border-[#D5D0C5] rounded-xs"
              />
            </div>

            {/* MANUAL CUSTOMER REVIEWS & STAR RATINGS MANAGER */}
            <div className="bg-[#FAF9F6] p-4 border border-[#EAE6DE] rounded-xs space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-[#1F1F1F] flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span>Manually Add Customer Reviews & Star Ratings ({newProdReviews.length} Reviews)</span>
                </label>
                {newProdReviews.length > 0 && (
                  <span className="text-[11px] font-semibold text-[#C85A32] bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                    Calculated Rating: {calculateRatingStats(newProdReviews).rating} ⭐ ({newProdReviews.length} reviews)
                  </span>
                )}
              </div>

              {/* Review Inputs Form */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 bg-white p-3 border border-[#EAE6DE] rounded-xs">
                <input
                  type="text"
                  placeholder="Reviewer Name (e.g. Sophia Vance)"
                  value={revAuthor}
                  onChange={(e) => setRevAuthor(e.target.value)}
                  className="px-2.5 py-1.5 text-xs border border-[#D5D0C5] rounded-xs"
                />
                <select
                  value={revRating}
                  onChange={(e) => setRevRating(Number(e.target.value))}
                  className="px-2.5 py-1.5 text-xs border border-[#D5D0C5] rounded-xs bg-white font-semibold text-amber-600"
                >
                  <option value={5}>⭐⭐⭐⭐⭐ (5 Stars)</option>
                  <option value={4}>⭐⭐⭐⭐ (4 Stars)</option>
                  <option value={3}>⭐⭐⭐ (3 Stars)</option>
                  <option value={2}>⭐⭐ (2 Stars)</option>
                  <option value={1}>⭐ (1 Star)</option>
                </select>
                <input
                  type="text"
                  placeholder="Review Headline / Title"
                  value={revTitle}
                  onChange={(e) => setRevTitle(e.target.value)}
                  className="px-2.5 py-1.5 text-xs border border-[#D5D0C5] rounded-xs sm:col-span-2"
                />
                <textarea
                  placeholder="Review comment text (e.g. Absolutely exquisite leather craftsmanship!)..."
                  value={revComment}
                  onChange={(e) => setRevComment(e.target.value)}
                  rows={2}
                  className="px-2.5 py-1.5 text-xs border border-[#D5D0C5] rounded-xs sm:col-span-3"
                />
                <button
                  type="button"
                  onClick={handleAddReviewToNewProduct}
                  className="bg-[#C85A32] hover:bg-[#B34E2A] text-white text-xs font-semibold px-3 py-1.5 rounded-xs transition-colors cursor-pointer self-end h-full"
                >
                  + Add Review
                </button>
              </div>

              {/* List of Staged Reviews */}
              {newProdReviews.length > 0 && (
                <div className="space-y-2 max-h-40 overflow-y-auto pt-1">
                  {newProdReviews.map((rev) => (
                    <div key={rev.id} className="p-2.5 bg-white border border-[#EAE6DE] rounded-xs flex justify-between items-start gap-2 text-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-[#1F1F1F]">{rev.author}</span>
                          <span className="text-amber-500 font-bold">{'★'.repeat(rev.rating)}</span>
                          <span className="text-[10px] bg-green-50 text-green-700 px-1.5 py-0.2 rounded-xs font-semibold">Verified</span>
                        </div>
                        <div className="font-medium text-[#4A453C] mt-0.5">{rev.title}</div>
                        <p className="text-[11px] text-[#7A7264] mt-0.5">{rev.comment}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveReviewFromNewProduct(rev.id)}
                        className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-[#F0ECE1]">
              <button
                type="button"
                onClick={() => setShowAddProduct(false)}
                className="px-4 py-2 text-xs text-[#7A7264] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-[#C85A32] hover:bg-[#B34E2A] text-white text-xs font-semibold px-6 py-2.5 rounded-xs cursor-pointer uppercase tracking-wider"
              >
                Publish Product to Store
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* EDIT PRODUCT MODAL (FULL AMAZON/FLIPKART CATALOG EDITOR) */}
      {/* ========================================================================= */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (editingProduct) {
                updateProduct(editingProduct);
                setEditingProduct(null);
                showToast(`Saved changes to ${editingProduct.name}`, 'success');
              }
            }}
            className="bg-white max-w-2xl w-full p-6 sm:p-8 rounded-xs shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto border border-[#EAE6DE] my-8"
          >
            <div className="flex justify-between items-start border-b border-[#F0ECE1] pb-3">
              <div>
                <span className="text-[10px] font-bold tracking-widest text-[#C85A32] uppercase">
                  Product Editor
                </span>
                <h3 className="text-lg font-semibold text-[#1F1F1F] font-editorial">
                  Edit Product: {editingProduct.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                className="text-gray-400 hover:text-black cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Product Name & SKU */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-[#4A453C] mb-1">Product Title *</label>
                <input
                  type="text"
                  required
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-[#D5D0C5] rounded-xs focus:outline-none focus:border-[#C85A32]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#4A453C] mb-1">SKU Code</label>
                <input
                  type="text"
                  value={editingProduct.sku}
                  onChange={(e) => setEditingProduct({ ...editingProduct, sku: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-[#D5D0C5] rounded-xs font-mono uppercase bg-[#FAF9F6]"
                />
              </div>
            </div>

            {/* Pricing + Category + Stock */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-medium text-[#4A453C] mb-1">Category</label>
                <select
                  value={editingProduct.category}
                  onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value as any })}
                  className="w-full px-3 py-2 text-xs border border-[#D5D0C5] rounded-xs bg-white capitalize"
                >
                  <option value="backpack">Backpacks</option>
                  <option value="shoes">Footwear / Shoes</option>
                  <option value="glasses">Eyewear / Glasses</option>
                  <option value="hats">Headwear / Hats</option>
                  <option value="apparel">Apparel / Knits</option>
                  <option value="accessories">Accessories</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#4A453C] mb-1">Current Price ($) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={editingProduct.price}
                  onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-xs border border-[#D5D0C5] rounded-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#4A453C] mb-1">Original Price ($)</label>
                <input
                  type="number"
                  min="1"
                  value={editingProduct.originalPrice || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, originalPrice: e.target.value ? Number(e.target.value) : undefined })}
                  className="w-full px-3 py-2 text-xs border border-[#D5D0C5] rounded-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#4A453C] mb-1">Stock Quantity</label>
                <input
                  type="number"
                  min="0"
                  value={editingProduct.stockQuantity}
                  onChange={(e) => {
                    const qty = Number(e.target.value);
                    setEditingProduct({
                      ...editingProduct,
                      stockQuantity: qty,
                      isSoldOut: qty <= 0
                    });
                  }}
                  className="w-full px-3 py-2 text-xs border border-[#D5D0C5] rounded-xs"
                />
              </div>
            </div>

            {/* Return Policy (Max 7 Days) & Social Proof Purchases Count */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[#4A453C] mb-1">
                  Product Return Policy (Maximum Return Window: 7 Days)
                </label>
                <input
                  type="text"
                  value={editingProduct.returnPolicy || '7 Days Easy Hassle-Free Returns & Exchange'}
                  onChange={(e) => setEditingProduct({ ...editingProduct, returnPolicy: e.target.value })}
                  placeholder="e.g. 7 Days Easy Hassle-Free Returns & Exchange"
                  className="w-full px-3 py-2 text-xs border border-[#D5D0C5] rounded-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#4A453C] mb-1">
                  Social Proof: Purchased in Last 7 Days Count (Displays near Stars)
                </label>
                <input
                  type="number"
                  min="0"
                  value={editingProduct.recentPurchasesCount ?? 42}
                  onChange={(e) => setEditingProduct({ ...editingProduct, recentPurchasesCount: Number(e.target.value) })}
                  placeholder="e.g. 42"
                  className="w-full px-3 py-2 text-xs border border-[#D5D0C5] rounded-xs"
                />
              </div>
            </div>
            <div className="bg-[#FAF1ED]/40 p-4 border border-[#C85A32]/30 rounded-xs space-y-3">
              <label className="text-xs font-bold text-[#1F1F1F] flex items-center gap-1.5">
                <Film className="w-3.5 h-3.5 text-[#C85A32]" />
                <span>Showcase Video Stream (Local MP4 Upload or YouTube Link)</span>
              </label>

              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={editingProduct.youtubeUrl || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, youtubeUrl: e.target.value })}
                  placeholder="YouTube URL or local video Data URL"
                  className="flex-1 px-3 py-2 text-xs border border-[#D5D0C5] rounded-xs bg-white"
                />
                <input
                  type="file"
                  id="edit-video-file-input"
                  accept="video/mp4,video/webm,video/ogg,video/*"
                  onChange={(e) => e.target.files?.[0] && processVideoFile(e.target.files[0], 'edit')}
                  className="hidden"
                />
                <label
                  htmlFor="edit-video-file-input"
                  className="px-3 py-2 bg-[#1F1F1F] hover:bg-[#C85A32] text-white text-xs font-semibold rounded-xs transition-colors cursor-pointer inline-flex items-center justify-center gap-1.5 shrink-0"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Local Video</span>
                </label>
              </div>

              {editingProduct.youtubeUrl && (
                <div className="pt-1">
                  <span className="text-[10px] font-bold text-[#8C8477] uppercase block mb-1">Live Video Stream Preview:</span>
                  <ProductVideoEmbed
                    youtubeUrl={editingProduct.youtubeUrl}
                    productName={editingProduct.name}
                    productId={editingProduct.id}
                    showTelemetryBadge={false}
                    className="max-w-md"
                  />
                </div>
              )}
            </div>

            {/* Images */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="block text-xs font-medium text-[#4A453C]">
                  Image Gallery ({editingProduct.images.length} photos)
                </label>

                <input
                  type="file"
                  id="edit-images-file-input"
                  accept="image/*"
                  multiple
                  onChange={(e) => e.target.files && processImageFiles(e.target.files, 'edit')}
                  className="hidden"
                />
                <label
                  htmlFor="edit-images-file-input"
                  className="px-3 py-1.5 bg-[#FAF1ED] border border-[#C85A32]/40 text-[#C85A32] hover:bg-[#C85A32] hover:text-white text-xs font-semibold rounded-xs transition-colors cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload New Photos</span>
                </label>
              </div>

              <div className="flex flex-wrap gap-2">
                {editingProduct.images.map((img, idx) => (
                  <div key={idx} className="relative w-16 h-16 rounded-xs overflow-hidden border border-[#EAE6DE] group">
                    <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setEditingProduct({ ...editingProduct, images: editingProduct.images.filter((_, i) => i !== idx) })}
                      className="absolute inset-0 bg-red-600/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-medium text-[#4A453C] mb-1">Description</label>
              <textarea
                rows={3}
                value={editingProduct.description}
                onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-[#D5D0C5] rounded-xs"
              />
            </div>

            {/* MANUAL CUSTOMER REVIEWS & STAR RATINGS MANAGER */}
            <div className="bg-[#FAF9F6] p-4 border border-[#EAE6DE] rounded-xs space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-[#1F1F1F] flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span>Customer Reviews & Ratings Manager ({(editingProduct.reviews || []).length} Reviews)</span>
                </label>
                <span className="text-[11px] font-semibold text-[#C85A32] bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  Rating: {editingProduct.rating || 5.0} ⭐ ({(editingProduct.reviews || []).length} reviews)
                </span>
              </div>

              {/* Add New Review Form */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 bg-white p-3 border border-[#EAE6DE] rounded-xs">
                <input
                  type="text"
                  placeholder="Reviewer Name (e.g. Eleanor Vance)"
                  value={editRevAuthor}
                  onChange={(e) => setEditRevAuthor(e.target.value)}
                  className="px-2.5 py-1.5 text-xs border border-[#D5D0C5] rounded-xs"
                />
                <select
                  value={editRevRating}
                  onChange={(e) => setEditRevRating(Number(e.target.value))}
                  className="px-2.5 py-1.5 text-xs border border-[#D5D0C5] rounded-xs bg-white font-semibold text-amber-600"
                >
                  <option value={5}>⭐⭐⭐⭐⭐ (5 Stars)</option>
                  <option value={4}>⭐⭐⭐⭐ (4 Stars)</option>
                  <option value={3}>⭐⭐⭐ (3 Stars)</option>
                  <option value={2}>⭐⭐ (2 Stars)</option>
                  <option value={1}>⭐ (1 Star)</option>
                </select>
                <input
                  type="text"
                  placeholder="Review Headline / Title"
                  value={editRevTitle}
                  onChange={(e) => setEditRevTitle(e.target.value)}
                  className="px-2.5 py-1.5 text-xs border border-[#D5D0C5] rounded-xs sm:col-span-2"
                />
                <textarea
                  placeholder="Review comment text..."
                  value={editRevComment}
                  onChange={(e) => setEditRevComment(e.target.value)}
                  rows={2}
                  className="px-2.5 py-1.5 text-xs border border-[#D5D0C5] rounded-xs sm:col-span-3"
                />
                <button
                  type="button"
                  onClick={handleAddReviewToEditingProduct}
                  className="bg-[#1F1F1F] hover:bg-[#C85A32] text-white text-xs font-semibold px-3 py-1.5 rounded-xs transition-colors cursor-pointer self-end h-full"
                >
                  + Add Review
                </button>
              </div>

              {/* List of Existing Reviews */}
              {(editingProduct.reviews || []).length > 0 ? (
                <div className="space-y-2 max-h-48 overflow-y-auto pt-1">
                  {editingProduct.reviews!.map((rev) => (
                    <div key={rev.id} className="p-2.5 bg-white border border-[#EAE6DE] rounded-xs flex justify-between items-start gap-2 text-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-[#1F1F1F]">{rev.author}</span>
                          <span className="text-amber-500 font-bold">{'★'.repeat(rev.rating)}</span>
                          <span className="text-[10px] bg-green-50 text-green-700 px-1.5 py-0.2 rounded-xs font-semibold">Verified</span>
                        </div>
                        <div className="font-medium text-[#4A453C] mt-0.5">{rev.title}</div>
                        <p className="text-[11px] text-[#7A7264] mt-0.5">{rev.comment}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveReviewFromEditingProduct(rev.id)}
                        className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
                        title="Delete Review"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#8C8477] italic text-center py-2">No reviews posted for this product yet. Add one above!</p>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-[#F0ECE1]">
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                className="px-4 py-2 text-xs text-[#7A7264] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-[#1F1F1F] hover:bg-[#C85A32] text-white text-xs font-semibold px-6 py-2.5 rounded-xs cursor-pointer uppercase tracking-wider"
              >
                Save Product Changes
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};

