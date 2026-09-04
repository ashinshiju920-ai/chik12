import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { ProductCard } from '../shop/ProductCard';
import { 
  Star, 
  Heart, 
  ShoppingBag, 
  Zap, 
  Truck, 
  ShieldCheck, 
  RotateCcw, 
  ChevronDown, 
  ChevronUp, 
  Check, 
  MapPin, 
  ThumbsUp, 
  Camera, 
  Upload, 
  Share2, 
  CheckCircle2,
  AlertCircle,
  Play,
  Film,
  Sparkles,
  Flame
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ProductVideoEmbed } from './ProductVideoEmbed';

export const ProductDetailView: React.FC = () => {
  const { 
    selectedProduct, 
    products, 
    addToCart, 
    formatPrice, 
    toggleWishlist, 
    isInWishlist, 
    addProductReview, 
    voteReviewHelpful,
    standardDeliveryDays,
    onlineDiscountPercent,
    calculateDeliveryDate,
    setActivePage,
    showToast
  } = useStore();

  if (!selectedProduct) {
    return (
      <div className="py-24 text-center">
        <p className="text-gray-500">No product selected.</p>
        <button
          onClick={() => setActivePage('shop')}
          className="mt-4 bg-[#C85A32] text-white px-6 py-2 rounded-xs"
        >
          Return to Shop
        </button>
      </div>
    );
  }

  // Gallery state
  const [activeMediaType, setActiveMediaType] = useState<'image' | 'video'>('image');
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  // Variant selections
  const [selectedColor, setSelectedColor] = useState(
    selectedProduct.colors && selectedProduct.colors.length > 0
      ? selectedProduct.colors[0].name
      : ''
  );
  const [selectedSize, setSelectedSize] = useState(
    selectedProduct.sizes && selectedProduct.sizes.length > 0
      ? selectedProduct.sizes[0]
      : ''
  );
  const [quantity, setQuantity] = useState(1);

  // Accordion open states (Default: Description open)
  const [openAccordions, setOpenAccordions] = useState<{ [key: string]: boolean }>({
    description: true,
    additionalInfo: false,
    videoShowcase: true,
    reviews: false
  });

  const toggleAccordion = (key: string) => {
    setOpenAccordions((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Pincode / Postal validation state
  const [pincodeInput, setPincodeInput] = useState('');
  const [pincodeResult, setPincodeResult] = useState<{
    checked: boolean;
    valid: boolean;
    deliveryDate?: string;
    codEligible?: boolean;
    shippingCost?: string;
  } | null>(null);

  const handlePincodeCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pincodeInput.trim() || pincodeInput.trim().length < 3) {
      showToast('Please enter a valid postal/zip code', 'warning');
      return;
    }

    // Dynamic delivery calculation simulation
    const days = Math.floor(2 + (pincodeInput.charCodeAt(0) % 4));
    const estimatedDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });

    setPincodeResult({
      checked: true,
      valid: true,
      deliveryDate: estimatedDate,
      codEligible: true,
      shippingCost: 'Free on orders > $75 (Standard $5.00)'
    });
    showToast('Delivery options verified for ' + pincodeInput, 'success');
  };

  // Review filtering & form state
  const [reviewFilter, setReviewFilter] = useState<'all' | 'with-photos' | '5-stars'>('all');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReviewAuthor, setNewReviewAuthor] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewTitle, setNewReviewTitle] = useState('');
  const [newReviewComment, setNewReviewComment] = useState('');
  const [newReviewPhotoUrl, setNewReviewPhotoUrl] = useState('');

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewAuthor || !newReviewTitle || !newReviewComment) {
      showToast('Please fill out all required review fields', 'warning');
      return;
    }

    addProductReview(selectedProduct.id, {
      author: newReviewAuthor,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
      rating: newReviewRating,
      title: newReviewTitle,
      comment: newReviewComment,
      verified: true,
      images: newReviewPhotoUrl ? [newReviewPhotoUrl] : undefined
    });

    setShowReviewForm(false);
    setNewReviewAuthor('');
    setNewReviewTitle('');
    setNewReviewComment('');
    setNewReviewPhotoUrl('');
  };

  const isSaved = isInWishlist(selectedProduct.id);

  // Related products
  const relatedProducts = products
    .filter((p) => p.id !== selectedProduct.id && (p.category === selectedProduct.category || p.isFeatured))
    .slice(0, 4);

  // Filtered reviews
  const filteredReviews = selectedProduct.reviews.filter((r) => {
    if (reviewFilter === 'with-photos') return r.images && r.images.length > 0;
    if (reviewFilter === '5-stars') return r.rating === 5;
    return true;
  });

  const handleBuyNow = () => {
    addToCart(selectedProduct, quantity, selectedColor, selectedSize);
    setActivePage('checkout');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#F9F8F6] py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center space-x-2 text-xs text-[#8C8477] mb-8">
          <button onClick={() => setActivePage('home')} className="hover:text-[#C85A32] cursor-pointer">
            Home
          </button>
          <span>/</span>
          <button onClick={() => setActivePage('shop')} className="hover:text-[#C85A32] cursor-pointer capitalize">
            {selectedProduct.category}
          </button>
          <span>/</span>
          <span className="text-[#1F1F1F] font-medium truncate max-w-xs">{selectedProduct.name}</span>
        </nav>

        {/* Top Product Summary Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 bg-white p-6 sm:p-10 border border-[#EBE8E2] rounded-xs shadow-xs">
          
          {/* Left Column: Image Gallery & Thumbnails */}
          <div className="lg:col-span-7 flex flex-col-reverse sm:flex-row gap-4">
            
            {/* Thumbnails List with Photo and Video support */}
            <div className="flex sm:flex-col gap-3 overflow-x-auto sm:overflow-y-auto max-h-[500px] shrink-0">
              {selectedProduct.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setActiveMediaType('image');
                    setActiveImageIndex(idx);
                  }}
                  className={`w-16 h-16 sm:w-20 sm:h-20 bg-[#F5F3EF] rounded-xs overflow-hidden border-2 transition-all cursor-pointer ${
                    activeMediaType === 'image' && activeImageIndex === idx
                      ? 'border-[#C85A32] opacity-100 ring-2 ring-[#C85A32]/20'
                      : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}

              {/* Video Thumbnail Button if Product has YouTube URL */}
              {selectedProduct.youtubeUrl && (
                <button
                  id="pdp-video-thumb-btn"
                  onClick={() => setActiveMediaType('video')}
                  className={`w-16 h-16 sm:w-20 sm:h-20 bg-[#1F1F1F] text-white rounded-xs overflow-hidden border-2 transition-all cursor-pointer flex flex-col items-center justify-center p-2 text-center relative group ${
                    activeMediaType === 'video'
                      ? 'border-[#C85A32] ring-2 ring-[#C85A32]/20'
                      : 'border-transparent opacity-75 hover:opacity-100'
                  }`}
                  title="Watch Product Video"
                >
                  <div className="w-7 h-7 rounded-full bg-[#C85A32] flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                    <Play className="w-3.5 h-3.5 fill-white text-white ml-0.5" />
                  </div>
                  <span className="text-[9px] font-bold uppercase tracking-wider">Video</span>
                </button>
              )}
            </div>

            {/* Main Preview: Photo Gallery or Responsive Vertical Video Embed */}
            <div className={`flex-1 relative transition-all duration-300 rounded-xs overflow-hidden flex items-center justify-center ${
              activeMediaType === 'video' ? 'aspect-[9/16] max-h-[580px] bg-black shadow-xl border border-[#EAE6DE]' : 'aspect-square bg-[#F5F3EF] group'
            }`}>
              {/* Badges (Only shown on image gallery view) */}
              {activeMediaType === 'image' && (
                <div className="absolute top-4 left-4 z-10 flex flex-col gap-1.5 pointer-events-none">
                  {selectedProduct.isSoldOut && (
                    <span className="bg-[#D32F2F] text-white text-xs font-semibold px-3 py-1 rounded-xs uppercase tracking-wider shadow-sm">
                      Sold Out
                    </span>
                  )}
                  {selectedProduct.isSale && (
                    <span className="bg-[#C85A32] text-white text-xs font-semibold px-3 py-1 rounded-xs uppercase tracking-wider shadow-sm">
                      Sale
                    </span>
                  )}
                </div>
              )}

              {activeMediaType === 'video' && selectedProduct.youtubeUrl ? (
                <ProductVideoEmbed
                  youtubeUrl={selectedProduct.youtubeUrl}
                  productName={selectedProduct.name}
                  productId={selectedProduct.id}
                  className="w-full h-full"
                />
              ) : (
                <>
                  <img
                    src={selectedProduct.images[activeImageIndex] || selectedProduct.images[0]}
                    alt={selectedProduct.name}
                    onClick={() => setIsZoomed(!isZoomed)}
                    className={`w-full h-full object-cover object-center transition-transform duration-300 cursor-zoom-in ${
                      isZoomed ? 'scale-150' : 'group-hover:scale-105'
                    }`}
                  />

                  <div className="absolute bottom-3 right-3 bg-black/60 text-white text-[11px] px-2.5 py-1 rounded-xs backdrop-blur-xs pointer-events-none">
                    {isZoomed ? 'Click to reset' : 'Click to zoom'}
                  </div>
                </>
              )}
            </div>

          </div>

          {/* Right Column: Product Controls */}
          <div className="lg:col-span-5 flex flex-col space-y-6">
            
            {/* Header: SKU, Category & Wishlist */}
            <div className="flex items-center justify-between border-b border-[#F0ECE1] pb-3 text-xs text-[#8C8477]">
              <span>SKU: <strong className="text-[#1F1F1F] font-mono">{selectedProduct.sku}</strong></span>
              <button
                onClick={() => toggleWishlist(selectedProduct.id)}
                className="flex items-center gap-1.5 hover:text-[#C85A32] transition-colors cursor-pointer"
              >
                <Heart className={`w-4 h-4 ${isSaved ? 'fill-[#C85A32] text-[#C85A32]' : ''}`} />
                <span>{isSaved ? 'Saved to Wishlist' : 'Add to Wishlist'}</span>
              </button>
            </div>

            {/* Title & Tagline */}
            <div>
              <h1 
                style={{
                  fontFamily: selectedProduct.customFont || undefined,
                  fontSize: selectedProduct.customFontSize || undefined
                }}
                className="product-title font-product text-2xl sm:text-3xl font-semibold text-[#1F1F1F] leading-snug"
              >
                {selectedProduct.name}
              </h1>
              {selectedProduct.tagline && (
                <p className="text-xs sm:text-sm text-[#7A7264] mt-1 italic">
                  {selectedProduct.tagline}
                </p>
              )}
            </div>

            {/* Rating & Stock Status */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* Stars & Rating */}
              <div className="flex items-center gap-2">
                <div className="flex text-[#FBC02D]">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(selectedProduct.rating) ? 'fill-[#FBC02D]' : 'text-[#E0DDD5]'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs font-semibold text-[#1F1F1F]">
                  {selectedProduct.rating} / 5.0
                </span>
                <span className="text-xs text-[#8C8477]">
                  ({selectedProduct.reviewCount} reviews)
                </span>
              </div>

              {/* Social Proof Badge & Stock */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs bg-amber-50 text-amber-900 border border-amber-200 px-2.5 py-1 rounded-full font-semibold inline-flex items-center gap-1.5 shadow-2xs">
                  <Flame className="w-3.5 h-3.5 text-[#C85A32] fill-[#C85A32]" />
                  <span>{selectedProduct.recentPurchasesCount ?? Math.floor(24 + (selectedProduct.rating * 6))} bought in last 7 days</span>
                </span>

                {selectedProduct.isSoldOut || selectedProduct.stockQuantity <= 0 ? (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#D32F2F] bg-red-50 px-2.5 py-1 rounded-xs">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Out of Stock
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#1E5638] bg-[#EBF5EF] px-2.5 py-1 rounded-xs">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    In Stock ({selectedProduct.stockQuantity})
                  </span>
                )}
              </div>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 pt-2">
              <span className="text-3xl font-bold text-[#1F1F1F] tracking-tight">
                {formatPrice(selectedProduct.price)}
              </span>
              {selectedProduct.originalPrice && selectedProduct.originalPrice > selectedProduct.price && (
                <span className="text-base text-[#9E978C] line-through">
                  {formatPrice(selectedProduct.originalPrice)}
                </span>
              )}
              {selectedProduct.isSale && (
                <span className="text-xs text-[#C85A32] font-semibold bg-[#FAF1ED] px-2 py-0.5 rounded-xs">
                  Save {Math.round(((selectedProduct.originalPrice! - selectedProduct.price) / selectedProduct.originalPrice!) * 100)}%
                </span>
              )}
            </div>

            {/* Online vs COD Price Incentive Box */}
            <div className="bg-[#FAF9F6] border border-[#EAE6DE] p-3.5 rounded-xs space-y-2 text-xs text-[#555048]">
              <div className="flex justify-between items-center font-semibold text-[#1E5638] bg-[#EBF5EF] p-2.5 rounded-xs border border-[#1E5638]/20">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#1E5638]" />
                  <span>Pay Online (UPI, Cards, Netbanking):</span>
                </span>
                <span className="font-bold text-sm text-[#1E5638]">
                  {formatPrice(selectedProduct.price * (1 - (onlineDiscountPercent / 100)))} ({onlineDiscountPercent}% OFF)
                </span>
              </div>
              <div className="flex justify-between items-center px-1 text-[11px] text-[#7A7264]">
                <span>Cash on Delivery (COD Price):</span>
                <span className="font-bold text-[#1F1F1F]">{formatPrice(selectedProduct.price)} (Normal Price)</span>
              </div>
            </div>

            {/* Variant Selectors: Colors */}
            {selectedProduct.colors && selectedProduct.colors.length > 0 && (
              <div className="space-y-2 pt-2">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-[#1F1F1F]">
                    Color: <span className="font-normal text-[#6E685F]">{selectedColor}</span>
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  {selectedProduct.colors.map((c) => (
                    <button
                      key={c.name}
                      onClick={() => setSelectedColor(c.name)}
                      className={`w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all cursor-pointer ${
                        selectedColor === c.name ? 'border-[#C85A32] scale-110' : 'border-white hover:scale-105'
                      }`}
                      style={{ backgroundColor: c.hex }}
                      title={c.name}
                    >
                      {selectedColor === c.name && (
                        <Check className={`w-3.5 h-3.5 ${c.hex === '#FFFFFF' || c.hex === '#EAEAEA' ? 'text-black' : 'text-white'}`} />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Variant Selectors: Sizes */}
            {selectedProduct.sizes && selectedProduct.sizes.length > 0 && (
              <div className="space-y-2 pt-2">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-[#1F1F1F]">
                    Select Size: <span className="font-normal text-[#6E685F]">{selectedSize}</span>
                  </span>
                  <button 
                    onClick={() => showToast('Size Guide: Standard European & US tailoring specifications.', 'info')}
                    className="text-[#C85A32] underline hover:text-[#B34E2A] cursor-pointer"
                  >
                    Size Guide
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedProduct.sizes.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSelectedSize(s)}
                      className={`px-3.5 py-2 text-xs font-semibold rounded-xs border transition-all cursor-pointer ${
                        selectedSize === s
                          ? 'border-[#C85A32] bg-[#FAF1ED] text-[#C85A32]'
                          : 'border-[#E0DCD3] bg-white text-[#4A453C] hover:border-[#1F1F1F]'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity & Actions */}
            <div className="space-y-3 pt-4">
              <div className="flex items-center gap-3">
                {/* Qty Picker */}
                <div className="flex items-center border border-[#D5D0C5] rounded-xs bg-white h-12 px-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={selectedProduct.isSoldOut}
                    className="text-base text-[#6E685F] hover:text-[#1F1F1F] px-2 cursor-pointer disabled:opacity-30"
                  >
                    -
                  </button>
                  <span className="w-8 text-center text-sm font-semibold text-[#1F1F1F]">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(selectedProduct.stockQuantity || 10, quantity + 1))}
                    disabled={selectedProduct.isSoldOut}
                    className="text-base text-[#6E685F] hover:text-[#1F1F1F] px-2 cursor-pointer disabled:opacity-30"
                  >
                    +
                  </button>
                </div>

                {/* Add to Cart Button */}
                <button
                  id="pdp-add-to-cart-button"
                  onClick={() => addToCart(selectedProduct, quantity, selectedColor, selectedSize)}
                  disabled={selectedProduct.isSoldOut || selectedProduct.stockQuantity <= 0}
                  className="flex-1 bg-[#1F1F1F] hover:bg-[#C85A32] text-white text-xs font-semibold tracking-wider uppercase h-12 rounded-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>{selectedProduct.isSoldOut ? 'Sold Out' : 'Add to Cart'}</span>
                </button>
              </div>

              {/* Buy Now Button (Instant Checkout) with Real-Time Custom Color */}
              {!selectedProduct.isSoldOut && (
                <button
                  id="pdp-buy-now-button"
                  onClick={handleBuyNow}
                  style={{
                    backgroundColor: selectedProduct.buyNowButtonColor || undefined
                  }}
                  className="w-full btn-buynow text-white text-xs font-semibold tracking-wider uppercase h-12 rounded-xs transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-[0_2px_10px_rgba(220,38,38,0.25)] hover:shadow-[0_4px_16px_rgba(220,38,38,0.35)] active:scale-[0.99]"
                >
                  <Zap className="w-4 h-4 fill-white text-white" />
                  <span>Buy Now (Instant Checkout)</span>
                </button>
              )}
            </div>

            {/* Pincode / Postal Delivery Checker */}
            <div className="pt-4 border-t border-[#F0ECE1] space-y-3">
              {/* Dynamic Delivery Estimator Sync Banner */}
              <div className="flex items-center justify-between bg-[#FAF1ED] text-[#C85A32] px-3.5 py-2.5 rounded-xs text-xs">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-[#C85A32]" />
                  <span>
                    Standard Delivery: <strong>{calculateDeliveryDate(0, selectedProduct.deliveryDays).formattedDate}</strong>
                  </span>
                </div>
                <span className="text-[11px] font-semibold bg-white text-[#C85A32] px-2 py-0.5 rounded-xs shadow-2xs">
                  {selectedProduct.deliveryDays ?? standardDeliveryDays} Days Dispatch
                </span>
              </div>

              <div className="bg-[#FAF9F6] p-4 border border-[#EAE6DE] rounded-xs space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#1F1F1F]">
                  <MapPin className="w-4 h-4 text-[#C85A32]" />
                  <span>Check Postal Code Delivery & Cash on Delivery (COD)</span>
                </div>

                <form onSubmit={handlePincodeCheck} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter Postal / Zip Code (e.g. 94107)"
                    value={pincodeInput}
                    onChange={(e) => setPincodeInput(e.target.value)}
                    className="flex-1 px-3 py-2 text-xs bg-white border border-[#D5D0C5] rounded-xs focus:outline-none focus:border-[#C85A32]"
                  />
                  <button
                    type="submit"
                    className="bg-[#1F1F1F] hover:bg-[#C85A32] text-white text-xs font-semibold px-4 py-2 rounded-xs transition-colors cursor-pointer"
                  >
                    Check
                  </button>
                </form>

                {pincodeResult && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="text-xs space-y-1.5 pt-2 text-[#4A453C] border-t border-[#EAE6DE]"
                  >
                    <div className="flex items-center gap-1.5 text-[#1E5638] font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Estimated Delivery: {pincodeResult.deliveryDate}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-[#C85A32]" />
                      <span>Cash on Delivery (COD) Available</span>
                    </div>
                    <div className="text-[11px] text-[#7A7264]">
                      {pincodeResult.shippingCost}
                    </div>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Micro Trust Indicators */}
            <div className="grid grid-cols-3 gap-2 pt-2 text-[11px] text-[#736C61] border-t border-[#F0ECE1]">
              <div className="flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-[#C85A32]" />
                <span>Fast Dispatch</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#C85A32]" />
                <span>Original Nordic</span>
              </div>
              <div className="flex items-center gap-1.5">
                <RotateCcw className="w-3.5 h-3.5 text-[#C85A32]" />
                <span>7-Day Returns</span>
              </div>
            </div>

          </div>

        </div>

        {/* SECTION 2: PRODUCT DATA TABS (ACCORDION LAYOUT) */}
        <div className="mt-12 bg-white border border-[#EBE8E2] rounded-xs overflow-hidden shadow-xs">
          
          {/* TAB 1: DESCRIPTION */}
          <div className="border-b border-[#EBE8E2]">
            <button
              onClick={() => toggleAccordion('description')}
              className="w-full flex items-center justify-between p-6 text-left hover:bg-[#FAF9F6] transition-colors cursor-pointer"
            >
              <span className="text-base sm:text-lg font-semibold text-[#1F1F1F] font-editorial flex items-center gap-2">
                <span>01. Description & Craftsmanship</span>
              </span>
              {openAccordions['description'] ? (
                <ChevronUp className="w-5 h-5 text-[#C85A32]" />
              ) : (
                <ChevronDown className="w-5 h-5 text-[#8C8477]" />
              )}
            </button>

            <AnimatePresence>
              {openAccordions['description'] && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="px-6 pb-8 text-sm text-[#5C564C] leading-relaxed space-y-4"
                >
                  <p>{selectedProduct.description}</p>
                  
                  <div className="pt-2">
                    <h4 className="text-xs font-bold text-[#1F1F1F] uppercase tracking-wider mb-2">
                      Key Highlights & Functional Features
                    </h4>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-[#524B42]">
                      {selectedProduct.details.map((d, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#C85A32] mt-1.5 shrink-0"></span>
                          <span>{d}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* TAB 2: ADDITIONAL INFORMATION */}
          <div className="border-b border-[#EBE8E2]">
            <button
              onClick={() => toggleAccordion('additionalInfo')}
              className="w-full flex items-center justify-between p-6 text-left hover:bg-[#FAF9F6] transition-colors cursor-pointer"
            >
              <span className="text-base sm:text-lg font-semibold text-[#1F1F1F] font-editorial">
                02. Additional Information & Specifications
              </span>
              {openAccordions['additionalInfo'] ? (
                <ChevronUp className="w-5 h-5 text-[#C85A32]" />
              ) : (
                <ChevronDown className="w-5 h-5 text-[#8C8477]" />
              )}
            </button>

            <AnimatePresence>
              {openAccordions['additionalInfo'] && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="px-6 pb-8"
                >
                  <table className="w-full text-xs text-left border-collapse">
                    <tbody>
                      <tr className="border-b border-[#F0ECE1]">
                        <th className="py-3 px-4 font-semibold text-[#1F1F1F] bg-[#FAF9F6] w-1/3">Dimensions & Sizing</th>
                        <td className="py-3 px-4 text-[#524B42]">{selectedProduct.specifications.dimensions}</td>
                      </tr>
                      <tr className="border-b border-[#F0ECE1]">
                        <th className="py-3 px-4 font-semibold text-[#1F1F1F] bg-[#FAF9F6]">Materials & Finish</th>
                        <td className="py-3 px-4 text-[#524B42]">{selectedProduct.specifications.materials}</td>
                      </tr>
                      <tr className="border-b border-[#F0ECE1]">
                        <th className="py-3 px-4 font-semibold text-[#1F1F1F] bg-[#FAF9F6]">Item Weight</th>
                        <td className="py-3 px-4 text-[#524B42]">{selectedProduct.specifications.weight}</td>
                      </tr>
                      <tr className="border-b border-[#F0ECE1]">
                        <th className="py-3 px-4 font-semibold text-[#1F1F1F] bg-[#FAF9F6]">Country of Origin</th>
                        <td className="py-3 px-4 text-[#524B42]">{selectedProduct.specifications.origin}</td>
                      </tr>
                      <tr>
                        <th className="py-3 px-4 font-semibold text-[#1F1F1F] bg-[#FAF9F6]">Care Instructions</th>
                        <td className="py-3 px-4 text-[#524B42]">{selectedProduct.specifications.care}</td>
                      </tr>
                    </tbody>
                  </table>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* TAB 3: NATIVE VIDEO SHOWCASE (IF AVAILABLE) */}
          {selectedProduct.youtubeUrl && (
            <div className="border-b border-[#EBE8E2]">
              <button
                onClick={() => toggleAccordion('videoShowcase')}
                className="w-full flex items-center justify-between p-6 text-left hover:bg-[#FAF9F6] transition-colors cursor-pointer"
              >
                <span className="text-base sm:text-lg font-semibold text-[#1F1F1F] font-editorial flex items-center gap-2">
                  <span>03. Product Demonstration & Runway Video</span>
                  <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-white bg-[#C85A32] px-2 py-0.5 rounded-xs flex items-center gap-1">
                    <Play className="w-2.5 h-2.5 fill-white" />
                    HD Video
                  </span>
                </span>
                {openAccordions['videoShowcase'] ? (
                  <ChevronUp className="w-5 h-5 text-[#C85A32]" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-[#8C8477]" />
                )}
              </button>

              <AnimatePresence>
                {openAccordions['videoShowcase'] && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="px-6 pb-8 max-w-3xl"
                  >
                    <p className="text-xs text-[#6E685F] mb-4">
                      Stream official high-definition craftsmanship footage and styling guidelines for the {selectedProduct.name}.
                    </p>
                    <ProductVideoEmbed
                      youtubeUrl={selectedProduct.youtubeUrl}
                      productName={selectedProduct.name}
                      productId={selectedProduct.id}
                      showTelemetryBadge={true}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* TAB 4: CUSTOMER REVIEWS */}
          <div>
            <button
              onClick={() => toggleAccordion('reviews')}
              className="w-full flex items-center justify-between p-6 text-left hover:bg-[#FAF9F6] transition-colors cursor-pointer"
            >
              <span className="text-base sm:text-lg font-semibold text-[#1F1F1F] font-editorial flex items-center gap-2">
                <span>04. Customer Reviews</span>
                <span className="text-xs font-sans text-[#C85A32] bg-[#FAF1ED] px-2 py-0.5 rounded-full">
                  {selectedProduct.reviews.length} Verified
                </span>
              </span>
              {openAccordions['reviews'] ? (
                <ChevronUp className="w-5 h-5 text-[#C85A32]" />
              ) : (
                <ChevronDown className="w-5 h-5 text-[#8C8477]" />
              )}
            </button>

            <AnimatePresence>
              {openAccordions['reviews'] && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="px-6 pb-8 space-y-8"
                >
                  
                  {/* Reviews Aggregate Breakdown */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-8 p-6 bg-[#FAF9F6] border border-[#EAE6DE] rounded-xs">
                    
                    {/* Score summary */}
                    <div className="md:col-span-4 flex flex-col items-center justify-center text-center border-b md:border-b-0 md:border-r border-[#E5E0D8] pb-4 md:pb-0">
                      <div className="text-5xl font-bold text-[#1F1F1F]">{selectedProduct.rating}</div>
                      <div className="flex text-[#FBC02D] my-2">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.floor(selectedProduct.rating) ? 'fill-[#FBC02D]' : 'text-[#D5D0C5]'
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-[#7A7264]">
                        Based on {selectedProduct.reviews.length} buyer reviews
                      </p>
                    </div>

                    {/* Star Breakdown bars */}
                    <div className="md:col-span-5 space-y-1.5 flex flex-col justify-center text-xs">
                      {[5, 4, 3, 2, 1].map((star) => {
                        const count = selectedProduct.reviews.filter((r) => r.rating === star).length;
                        const pct = selectedProduct.reviews.length > 0 ? (count / selectedProduct.reviews.length) * 100 : 0;
                        return (
                          <div key={star} className="flex items-center gap-2">
                            <span className="w-12 text-[#6E685F]">{star} Stars</span>
                            <div className="flex-1 h-2 bg-[#E5E0D8] rounded-full overflow-hidden">
                              <div
                                className="h-full bg-[#C85A32] rounded-full"
                                style={{ width: `${pct}%` }}
                              ></div>
                            </div>
                            <span className="w-8 text-right text-[#8C8477]">{count}</span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Write Review Action */}
                    <div className="md:col-span-3 flex flex-col justify-center items-center text-center">
                      <button
                        onClick={() => setShowReviewForm(!showReviewForm)}
                        className="bg-[#1F1F1F] hover:bg-[#C85A32] text-white text-xs font-semibold px-5 py-3 rounded-xs uppercase tracking-wider transition-colors cursor-pointer shadow-xs"
                      >
                        {showReviewForm ? 'Close Form' : 'Write a Review'}
                      </button>
                    </div>

                  </div>

                  {/* Interactive Review Form */}
                  {showReviewForm && (
                    <motion.form
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      onSubmit={handleReviewSubmit}
                      className="p-6 bg-white border border-[#C85A32]/40 rounded-xs space-y-4 shadow-sm"
                    >
                      <h4 className="text-sm font-semibold text-[#1F1F1F] uppercase tracking-wider">
                        Submit Your Customer Review
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-[#4A453C] mb-1">Your Full Name *</label>
                          <input
                            type="text"
                            required
                            value={newReviewAuthor}
                            onChange={(e) => setNewReviewAuthor(e.target.value)}
                            placeholder="e.g. Sarah Jenkins"
                            className="w-full px-3 py-2 text-xs border border-[#D5D0C5] rounded-xs focus:outline-none focus:border-[#C85A32]"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-[#4A453C] mb-1">Rating *</label>
                          <div className="flex items-center gap-2 pt-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setNewReviewRating(star)}
                                className="cursor-pointer"
                              >
                                <Star
                                  className={`w-5 h-5 ${
                                    star <= newReviewRating
                                      ? 'fill-[#FBC02D] text-[#FBC02D]'
                                      : 'text-[#D5D0C5]'
                                  }`}
                                />
                              </button>
                            ))}
                            <span className="text-xs font-semibold text-[#1F1F1F] ml-2">
                              {newReviewRating} / 5 Stars
                            </span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-[#4A453C] mb-1">Review Headline *</label>
                        <input
                          type="text"
                          required
                          value={newReviewTitle}
                          onChange={(e) => setNewReviewTitle(e.target.value)}
                          placeholder="e.g. Exceptional quality and fast shipping!"
                          className="w-full px-3 py-2 text-xs border border-[#D5D0C5] rounded-xs focus:outline-none focus:border-[#C85A32]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-[#4A453C] mb-1">Detailed Review *</label>
                        <textarea
                          required
                          rows={3}
                          value={newReviewComment}
                          onChange={(e) => setNewReviewComment(e.target.value)}
                          placeholder="Share your experience regarding comfort, materials, fit, and aesthetic..."
                          className="w-full px-3 py-2 text-xs border border-[#D5D0C5] rounded-xs focus:outline-none focus:border-[#C85A32]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-[#4A453C] mb-1">Photo URL (Optional)</label>
                        <input
                          type="url"
                          value={newReviewPhotoUrl}
                          onChange={(e) => setNewReviewPhotoUrl(e.target.value)}
                          placeholder="https://images.unsplash.com/..."
                          className="w-full px-3 py-2 text-xs border border-[#D5D0C5] rounded-xs focus:outline-none focus:border-[#C85A32]"
                        />
                      </div>

                      <div className="flex justify-end gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => setShowReviewForm(false)}
                          className="px-4 py-2 text-xs text-[#7A7264] hover:text-[#1F1F1F]"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="bg-[#C85A32] hover:bg-[#B34E2A] text-white text-xs font-semibold px-6 py-2.5 rounded-xs uppercase tracking-wider transition-colors"
                        >
                          Submit Verified Review
                        </button>
                      </div>
                    </motion.form>
                  )}

                  {/* Filter Pills */}
                  <div className="flex items-center gap-2 pt-2">
                    <span className="text-xs font-semibold text-[#1F1F1F]">Filter Reviews:</span>
                    <button
                      onClick={() => setReviewFilter('all')}
                      className={`px-3 py-1 text-xs rounded-xs transition-colors cursor-pointer ${
                        reviewFilter === 'all'
                          ? 'bg-[#1F1F1F] text-white'
                          : 'bg-[#F0ECE1] text-[#555048] hover:bg-[#E2DDD2]'
                      }`}
                    >
                      All ({selectedProduct.reviews.length})
                    </button>
                    <button
                      onClick={() => setReviewFilter('with-photos')}
                      className={`px-3 py-1 text-xs rounded-xs transition-colors cursor-pointer flex items-center gap-1 ${
                        reviewFilter === 'with-photos'
                          ? 'bg-[#1F1F1F] text-white'
                          : 'bg-[#F0ECE1] text-[#555048] hover:bg-[#E2DDD2]'
                      }`}
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>With Photos</span>
                    </button>
                    <button
                      onClick={() => setReviewFilter('5-stars')}
                      className={`px-3 py-1 text-xs rounded-xs transition-colors cursor-pointer ${
                        reviewFilter === '5-stars'
                          ? 'bg-[#1F1F1F] text-white'
                          : 'bg-[#F0ECE1] text-[#555048] hover:bg-[#E2DDD2]'
                      }`}
                    >
                      5 Stars Only
                    </button>
                  </div>

                  {/* Reviews List */}
                  <div className="space-y-4 divide-y divide-[#F0ECE1]">
                    {filteredReviews.map((rev) => (
                      <div key={rev.id} className="pt-4 first:pt-0">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <img
                              src={rev.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop'}
                              alt={rev.author}
                              className="w-9 h-9 rounded-full object-cover border border-[#E5E0D8]"
                            />
                            <div>
                              <div className="flex items-center gap-2">
                                <h5 className="text-xs font-semibold text-[#1F1F1F]">{rev.author}</h5>
                                {rev.verified && (
                                  <span className="text-[10px] text-[#1E5638] bg-[#EBF5EF] px-1.5 py-0.2 rounded-xs font-medium">
                                    Verified Buyer
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-[#9A9285]">{rev.date}</div>
                            </div>
                          </div>

                          <div className="flex text-[#FBC02D]">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3.5 h-3.5 ${
                                  i < rev.rating ? 'fill-[#FBC02D]' : 'text-[#E0DDD5]'
                                }`}
                              />
                            ))}
                          </div>
                        </div>

                        <div className="mt-2.5">
                          <h6 className="text-xs font-semibold text-[#1F1F1F] mb-1">{rev.title}</h6>
                          <p className="text-xs text-[#5C564C] leading-relaxed">{rev.comment}</p>
                          
                          {/* Review Photo Attachment */}
                          {rev.images && rev.images.length > 0 && (
                            <div className="flex gap-2 mt-3">
                              {rev.images.map((img, idx) => (
                                <img
                                  key={idx}
                                  src={img}
                                  alt={`Customer photo ${idx}`}
                                  className="w-16 h-16 object-cover rounded-xs border border-[#E5E0D8]"
                                />
                              ))}
                            </div>
                          )}

                          <div className="flex items-center gap-4 mt-3 text-[11px] text-[#8C8477]">
                            <span>Was this review helpful?</span>
                            <button
                              onClick={() => voteReviewHelpful(selectedProduct.id, rev.id)}
                              className={`flex items-center gap-1 hover:text-[#C85A32] transition-colors cursor-pointer ${
                                rev.userVotedHelpful ? 'text-[#C85A32] font-semibold' : ''
                              }`}
                            >
                              <ThumbsUp className="w-3.5 h-3.5" />
                              <span>Helpful ({rev.helpfulCount})</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>

        {/* SECTION 3: RELATED PRODUCTS CAROUSEL */}
        <div className="mt-16 pt-12 border-t border-[#EAE6DE]">
          <div className="text-center mb-10">
            <h3 className="text-2xl sm:text-3xl font-semibold text-[#1F1F1F] font-editorial">
              Related Products
            </h3>
            <p className="text-xs text-[#8C8477] mt-1">
              You may also love these complementary Nordic lifestyle pieces.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>

      </div>

      {/* STICKY MOBILE BUY BAR (Fixed above bottom nav on mobile screens) */}
      <div className="fixed bottom-14 inset-x-0 z-30 bg-white/95 backdrop-blur-md border-t border-[#EAE6DE] px-4 py-2.5 shadow-lg md:hidden flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[10px] text-[#8C8477] truncate font-sans-clean font-medium">
            {selectedProduct.name}
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-[#1E5638] font-mono">
              {formatPrice(selectedProduct.price * (1 - (onlineDiscountPercent / 100)))}
            </span>
            <span className="text-[9px] text-[#8C8477] line-through">
              {formatPrice(selectedProduct.price)}
            </span>
            <span className="text-[8px] bg-green-100 text-[#1E5638] font-bold px-1 rounded-xs">
              {onlineDiscountPercent}% OFF
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => toggleWishlist(selectedProduct.id)}
            className={`w-9 h-9 rounded-xs border flex items-center justify-center transition-colors cursor-pointer ${
              isInWishlist(selectedProduct.id)
                ? 'bg-[#FAF1ED] border-[#C85A32] text-[#C85A32]'
                : 'border-[#E0DCD3] text-[#1F1F1F] bg-white'
            }`}
            aria-label="Wishlist"
          >
            <Heart className={`w-3.5 h-3.5 ${isInWishlist(selectedProduct.id) ? 'fill-[#C85A32]' : ''}`} />
          </button>

          <button
            onClick={() => addToCart(selectedProduct, quantity, selectedColor, selectedSize)}
            disabled={selectedProduct.isSoldOut || selectedProduct.stockQuantity <= 0}
            className="px-3 py-2 bg-[#1F1F1F] active:bg-[#333333] text-white text-[11px] font-semibold uppercase tracking-wider rounded-xs flex items-center gap-1.5 cursor-pointer disabled:bg-gray-300"
          >
            <ShoppingBag className="w-3 h-3" />
            <span>Bag</span>
          </button>

          <button
            onClick={handleBuyNow}
            disabled={selectedProduct.isSoldOut || selectedProduct.stockQuantity <= 0}
            className="px-3.5 py-2 bg-[#DC2626] active:bg-[#B91C1C] text-white text-[11px] font-semibold uppercase tracking-wider rounded-xs flex items-center gap-1.5 shadow-[0_2px_8px_rgba(220,38,38,0.25)] cursor-pointer disabled:bg-gray-300"
          >
            <Zap className="w-3 h-3 fill-white text-white" />
            <span>Buy Now</span>
          </button>
        </div>
      </div>
    </div>
  );
};
