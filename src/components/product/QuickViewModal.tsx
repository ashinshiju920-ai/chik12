import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { X, Star, ShoppingBag, Zap, Heart, Check, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const QuickViewModal: React.FC = () => {
  const { 
    quickViewProduct, 
    setQuickViewProduct, 
    openProductDetail, 
    formatPrice, 
    addToCart, 
    buyNow,
    isInWishlist, 
    toggleWishlist,
    onlineDiscountPercent
  } = useStore();

  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  // Sync initial color/size when product changes
  React.useEffect(() => {
    if (quickViewProduct) {
      if (quickViewProduct.colors && quickViewProduct.colors.length > 0) {
        setSelectedColor(quickViewProduct.colors[0].name);
      } else {
        setSelectedColor('');
      }
      if (quickViewProduct.sizes && quickViewProduct.sizes.length > 0) {
        setSelectedSize(quickViewProduct.sizes[0]);
      } else {
        setSelectedSize('');
      }
      setActiveImageIndex(0);
      setQuantity(1);
    }
  }, [quickViewProduct]);

  const isSaved = quickViewProduct ? isInWishlist(quickViewProduct.id) : false;
  const isOutOfStock = quickViewProduct ? (quickViewProduct.isSoldOut || quickViewProduct.stockQuantity <= 0) : false;

  const handleClose = () => {
    setQuickViewProduct(null);
  };

  const handleDirectBuy = () => {
    if (quickViewProduct) {
      buyNow(quickViewProduct, quantity, selectedColor, selectedSize);
      handleClose();
    }
  };

  const handleAddBag = () => {
    if (quickViewProduct) {
      addToCart(quickViewProduct, quantity, selectedColor, selectedSize);
      handleClose();
    }
  };

  const handleFullDetail = () => {
    if (quickViewProduct) {
      handleClose();
      openProductDetail(quickViewProduct);
    }
  };

  return (
    <AnimatePresence>
      {quickViewProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={handleClose}
            className="fixed inset-0 bg-neutral-900/40 backdrop-blur-xs"
          />

          {/* Modal Container with Luxury Easing Scale */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="relative bg-white rounded-xl border border-[#EAE6DE] shadow-2xl w-full max-w-3xl overflow-y-auto max-h-[90vh] z-10 my-auto custom-scrollbar"
          >
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-3.5 right-3.5 z-20 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-[#1F1F1F] shadow-sm flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Gallery Column */}
            <div className="bg-[#FAF9F6] p-6 flex flex-col justify-between">
              <div className="relative aspect-square w-full bg-white rounded-xs overflow-hidden border border-[#EAE6DE]">
                <img
                  src={quickViewProduct.images[activeImageIndex] || quickViewProduct.images[0]}
                  alt={quickViewProduct.name}
                  className="w-full h-full object-cover object-center"
                />

                {/* Badges */}
                <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
                  {isOutOfStock ? (
                    <span className="bg-[#D32F2F] text-white text-[10px] font-bold px-2 py-0.5 rounded-xs uppercase">
                      Sold Out
                    </span>
                  ) : quickViewProduct.isSale ? (
                    <span className="bg-[#C85A32] text-white text-[10px] font-bold px-2 py-0.5 rounded-xs uppercase">
                      Sale
                    </span>
                  ) : null}
                </div>
              </div>

              {/* Thumbnails */}
              {quickViewProduct.images.length > 1 && (
                <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                  {quickViewProduct.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`w-14 h-14 rounded-xs border overflow-hidden shrink-0 cursor-pointer ${
                        activeImageIndex === idx ? 'border-[#C85A32] ring-1 ring-[#C85A32]' : 'border-[#EAE6DE]'
                      }`}
                    >
                      <img src={img} alt="thumb" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info & Purchase Column */}
            <div className="p-6 md:p-8 flex flex-col justify-between space-y-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#C85A32]">
                  {quickViewProduct.categoryTag || `#${quickViewProduct.category}`}
                </span>

                <h2 className="product-title font-product text-xl font-semibold text-[#1F1F1F] mt-1 leading-snug">
                  {quickViewProduct.name}
                </h2>

                {/* Rating */}
                <div className="flex items-center gap-1.5 mt-2">
                  <div className="flex text-[#FBC02D]">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < Math.floor(quickViewProduct.rating) ? 'fill-[#FBC02D]' : 'text-[#E0DDD5]'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-[#8C8477]">
                    {quickViewProduct.rating} ({quickViewProduct.reviewCount} reviews)
                  </span>
                </div>

                {/* Price */}
                <div className="flex flex-col gap-1 mt-3 bg-[#FAF9F6] p-2.5 rounded-xs border border-[#EAE6DE]">
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-bold text-[#1E5638] font-mono">
                      {formatPrice(quickViewProduct.price * (1 - (onlineDiscountPercent / 100)))}
                    </span>
                    <span className="text-[10px] bg-green-100 text-[#1E5638] font-bold px-1.5 py-0.5 rounded-xs uppercase">
                      {onlineDiscountPercent}% Instant Online OFF
                    </span>
                  </div>
                  <div className="text-[11px] text-[#7A7264] flex items-center gap-2">
                    <span>COD Price: <strong className="text-[#1F1F1F]">{formatPrice(quickViewProduct.price)}</strong></span>
                    {quickViewProduct.originalPrice && quickViewProduct.originalPrice > quickViewProduct.price && (
                      <span className="line-through text-[#9E978C]">
                        {formatPrice(quickViewProduct.originalPrice)}
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-xs text-[#6E685F] mt-3 line-clamp-3 leading-relaxed">
                  {quickViewProduct.description}
                </p>

                {/* Color Variants */}
                {quickViewProduct.colors && quickViewProduct.colors.length > 0 && (
                  <div className="mt-4">
                    <div className="text-[11px] font-semibold text-[#1F1F1F] mb-1.5">
                      Color: <span className="font-normal text-[#6E685F]">{selectedColor}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {quickViewProduct.colors.map((c) => (
                        <button
                          key={c.name}
                          onClick={() => setSelectedColor(c.name)}
                          className={`w-6 h-6 rounded-full border-2 transition-all cursor-pointer flex items-center justify-center ${
                            selectedColor === c.name ? 'border-[#1F1F1F] scale-110' : 'border-white ring-1 ring-black/10'
                          }`}
                          style={{ backgroundColor: c.hex }}
                          title={c.name}
                        >
                          {selectedColor === c.name && (
                            <Check className="w-3 h-3 text-white drop-shadow-xs" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Size Variants */}
                {quickViewProduct.sizes && quickViewProduct.sizes.length > 0 && (
                  <div className="mt-3">
                    <div className="text-[11px] font-semibold text-[#1F1F1F] mb-1.5">
                      Size: <span className="font-normal text-[#6E685F]">{selectedSize}</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {quickViewProduct.sizes.map((s) => (
                        <button
                          key={s}
                          onClick={() => setSelectedSize(s)}
                          className={`px-2.5 py-1 text-xs font-semibold rounded-xs border transition-all cursor-pointer ${
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
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2 border-t border-[#F0ECE1]">
                {/* CUSTOM RED MODERN BUY NOW BUTTON */}
                <button
                  id={`modal-buy-now-${quickViewProduct.id}`}
                  onClick={handleDirectBuy}
                  disabled={isOutOfStock}
                  className="w-full bg-[#DC2626] hover:bg-[#B91C1C] active:bg-[#991B1B] text-white text-xs font-semibold uppercase tracking-wider py-3 rounded-xs transition-all flex items-center justify-center gap-2 shadow-[0_2px_10px_rgba(220,38,38,0.25)] hover:shadow-[0_4px_16px_rgba(220,38,38,0.35)] cursor-pointer disabled:bg-gray-300 disabled:shadow-none"
                >
                  <Zap className="w-4 h-4 fill-white text-white" />
                  <span>{isOutOfStock ? 'Sold Out' : 'Buy Now (Instant Checkout)'}</span>
                </button>

                <div className="flex gap-2">
                  <button
                    onClick={handleAddBag}
                    disabled={isOutOfStock}
                    className="flex-1 bg-[#1F1F1F] hover:bg-[#333333] text-white text-xs font-semibold uppercase tracking-wider py-2.5 rounded-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:bg-gray-300"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Add to Bag</span>
                  </button>

                  <button
                    onClick={() => toggleWishlist(quickViewProduct.id)}
                    className={`w-10 h-10 rounded-xs border flex items-center justify-center transition-colors cursor-pointer ${
                      isSaved
                        ? 'bg-[#FAF1ED] border-[#C85A32] text-[#C85A32]'
                        : 'border-[#E0DCD3] text-[#1F1F1F] bg-white hover:border-[#1F1F1F]'
                    }`}
                    title={isSaved ? 'Remove from wishlist' : 'Save to wishlist'}
                  >
                    <Heart className={`w-4 h-4 ${isSaved ? 'fill-[#C85A32]' : ''}`} />
                  </button>
                </div>

                <button
                  onClick={handleFullDetail}
                  className="w-full text-center text-xs text-[#8C8477] hover:text-[#C85A32] underline pt-1 cursor-pointer flex items-center justify-center gap-1"
                >
                  <span>View Full Product Specifications</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
      )}
    </AnimatePresence>
  );
};
