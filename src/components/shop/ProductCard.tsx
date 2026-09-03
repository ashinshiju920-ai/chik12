import React, { useState } from 'react';
import { Product } from '../../types';
import { useStore } from '../../context/StoreContext';
import { Heart, Eye, ShoppingBag, Zap, Star } from 'lucide-react';
import { motion } from 'framer-motion';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { 
    openProductDetail, 
    formatPrice, 
    toggleWishlist, 
    isInWishlist, 
    addToCart, 
    buyNow,
    setQuickViewProduct 
  } = useStore();

  const isSaved = isInWishlist(product.id);
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);

  // Swatch colors (derived from product.colors or fallback curated palette)
  const swatches = product.colors && product.colors.length > 0
    ? product.colors
    : [
        { name: 'Onyx', hex: '#1F1F1F' },
        { name: 'Sand', hex: '#C8A97E' },
        { name: 'Olive', hex: '#4A5B44' }
      ];

  const displayImage = product.images[selectedColorIndex] || product.images[0] || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=800&auto=format&fit=crop';
  const hoverImage = product.images[1] || product.images[0];

  return (
    <div className="group relative flex flex-col bg-white border border-[#EFECE6] rounded-xs overflow-hidden transition-all duration-300 hover:shadow-md hover:border-[#D5D0C5] text-left">
      
      {/* Aspect-[3/4] Portrait Image Container */}
      <div className="relative w-full aspect-[3/4] bg-[#f7f7f7] overflow-hidden">
        
        {/* Floating Badges */}
        <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1 pointer-events-none">
          {product.isSoldOut ? (
            <span className="text-[10px] uppercase font-bold tracking-wider text-white bg-[#D32F2F] px-2 py-0.5 rounded-xs shadow-2xs">
              Sold Out
            </span>
          ) : product.isSale ? (
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#C85A32] bg-white/95 backdrop-blur-sm border border-[#C85A32]/20 px-2 py-0.5 rounded-xs shadow-2xs">
              Sale
            </span>
          ) : product.isNewArrival ? (
            <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-800 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-xs shadow-2xs">
              New Arrival
            </span>
          ) : product.categoryTag ? (
            <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-700 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-xs shadow-2xs">
              {product.categoryTag}
            </span>
          ) : null}
        </div>

        {/* Top-Right Floating Wishlist Heart */}
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          className={`absolute top-2.5 right-2.5 z-10 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all duration-200 shadow-xs cursor-pointer ${
            isSaved 
              ? 'bg-[#C85A32] text-white' 
              : 'bg-white/90 text-[#1F1F1F] hover:text-[#C85A32] hover:bg-white'
          }`}
          aria-label={isSaved ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isSaved ? 'fill-white' : ''}`} />
        </motion.button>

        {/* Product Images with Smooth 700ms Hover Zoom */}
        <div 
          onClick={() => openProductDetail(product)}
          className="w-full h-full cursor-pointer relative overflow-hidden"
        >
          <img
            src={displayImage}
            alt={product.name}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=800&auto=format&fit=crop';
            }}
            className="w-full h-full object-cover object-center transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
            loading="lazy"
          />

          {hoverImage && hoverImage !== displayImage && (
            <img
              src={hoverImage}
              alt={`${product.name} alternate angle`}
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = 'none';
              }}
              className="absolute inset-0 w-full h-full object-cover object-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
              loading="lazy"
            />
          )}
        </div>

        {/* Bottom Quick-Action Hover Bar with Glide Up */}
        <div className="absolute bottom-0 inset-x-0 p-2 sm:p-2.5 bg-gradient-to-t from-black/60 via-black/20 to-transparent translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] flex items-center justify-center gap-1.5 sm:gap-2">
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={(e) => {
              e.stopPropagation();
              setQuickViewProduct(product);
            }}
            className="flex-1 bg-white/95 hover:bg-white text-[#1F1F1F] hover:text-[#C85A32] text-[10px] sm:text-xs font-semibold py-1.5 sm:py-2 px-2 rounded-xs shadow-md transition-colors flex items-center justify-center gap-1 cursor-pointer"
            title="Quick View"
          >
            <Eye className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span className="hidden xs:inline">Quick View</span>
          </motion.button>

          {!product.isSoldOut && (
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={(e) => {
                e.stopPropagation();
                addToCart(product, 1);
              }}
              className="bg-[#1F1F1F] hover:bg-[#333333] text-white text-[10px] sm:text-xs font-semibold py-1.5 sm:py-2 px-2.5 sm:px-3 rounded-xs shadow-md transition-colors flex items-center justify-center gap-1 cursor-pointer"
              title="Add to Bag"
            >
              <ShoppingBag className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span className="hidden xs:inline">+ Bag</span>
            </motion.button>
          )}
        </div>
      </div>

      {/* Product Details & Editorial Typography */}
      <div className="p-3 sm:p-3.5 flex flex-col flex-1 justify-between gap-1.5">
        
        <div>
          {/* Swatch Dots */}
          <div className="flex items-center gap-1.5 mb-1.5">
            {swatches.slice(0, 4).map((color, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedColorIndex(idx % product.images.length);
                }}
                className={`w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full border border-black/10 transition-transform ${
                  selectedColorIndex === (idx % product.images.length)
                    ? 'ring-1 ring-offset-1 sm:ring-offset-2 ring-neutral-900 scale-110'
                    : 'hover:scale-105'
                }`}
                style={{ backgroundColor: color.hex || '#1F1F1F' }}
                title={color.name}
              />
            ))}
            {swatches.length > 4 && (
              <span className="text-[10px] text-neutral-400 font-mono">+{swatches.length - 4}</span>
            )}
          </div>

          {/* Title & Price Baseline Row */}
          <div className="flex items-baseline justify-between gap-2">
            <h3 
              onClick={() => openProductDetail(product)}
              style={{
                fontFamily: product.customFont || undefined,
                fontSize: product.customFontSize || undefined
              }}
              className="product-title text-xs sm:text-sm font-medium text-neutral-900 hover:text-[#C85A32] transition-colors cursor-pointer line-clamp-1 flex-1 font-heading"
            >
              {product.name}
            </h3>
            <div className="flex items-baseline gap-1 text-right shrink-0">
              <span className="text-xs sm:text-sm font-semibold text-neutral-900">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-[10px] sm:text-xs text-neutral-400 line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>
          </div>

          {/* Muted Variant / Fabric Line */}
          <p className="text-[11px] sm:text-xs text-neutral-500 mt-0.5 line-clamp-1 font-sans">
            {product.tagline || product.material || 'Artisanal Craftsmanship • Pure Organic Fiber'}
          </p>

          {/* Concise 1-Line Benefit Note */}
          <p className="text-[10px] sm:text-[11px] text-neutral-400 line-clamp-1 mt-0.5 italic">
            {product.description || 'Engineered for enduring Nordic luxury and all-day comfort.'}
          </p>
        </div>

        {/* Rating & Action Row */}
        <div className="pt-2 border-t border-neutral-100 flex items-center justify-between gap-2 mt-auto">
          {/* Rating */}
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 fill-[#FBC02D] text-[#FBC02D]" />
            <span className="text-[11px] font-semibold text-neutral-700">{product.rating || 5.0}</span>
            <span className="text-[10px] text-neutral-400">({product.reviewCount || 12})</span>
          </div>

          {/* Quick Buy CTA with Real-Time Custom Color Support */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (product.isSoldOut || product.stockQuantity <= 0) {
                openProductDetail(product);
              } else {
                buyNow(product, 1);
              }
            }}
            disabled={product.isSoldOut || product.stockQuantity <= 0}
            style={{
              backgroundColor: (product.isSoldOut || product.stockQuantity <= 0) 
                ? undefined 
                : (product.buyNowButtonColor || undefined)
            }}
            className={`px-2.5 py-1 rounded-xs text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer ${
              product.isSoldOut || product.stockQuantity <= 0
                ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                : 'btn-buynow shadow-2xs'
            }`}
          >
            <Zap className="w-2.5 h-2.5 fill-white text-white" />
            <span>{product.isSoldOut ? 'Sold Out' : 'Buy Now'}</span>
          </button>
        </div>

      </div>

    </div>
  );
};
