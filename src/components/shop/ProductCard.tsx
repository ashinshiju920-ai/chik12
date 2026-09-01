import React from 'react';
import { Product } from '../../types';
import { useStore } from '../../context/StoreContext';
import { Heart, Star, Eye, ShoppingBag, Zap } from 'lucide-react';

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

  return (
    <div className="group relative flex flex-col bg-white border border-[#EFECE6] rounded-xs overflow-hidden transition-all duration-300 hover:shadow-md hover:border-[#D5D0C5]">
      {/* Image & Badges Container */}
      <div className="relative w-full aspect-square bg-[#F5F3EF] overflow-hidden">
        
        {/* Top-Left Status Badges */}
        <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1">
          {product.isSoldOut ? (
            <span className="bg-[#D32F2F] text-white text-[11px] font-semibold tracking-wider px-2.5 py-0.5 rounded-xs uppercase">
              Sold Out
            </span>
          ) : product.isSale ? (
            <span className="bg-[#C85A32] text-white text-[11px] font-semibold tracking-wider px-2.5 py-0.5 rounded-xs uppercase">
              Sale
            </span>
          ) : product.isNewArrival ? (
            <span className="bg-[#1F1F1F] text-white text-[11px] font-semibold tracking-wider px-2.5 py-0.5 rounded-xs uppercase">
              New
            </span>
          ) : null}
        </div>

        {/* Top-Right Floating Wishlist Heart */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          className={`absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 shadow-xs cursor-pointer ${
            isSaved 
              ? 'bg-[#C85A32] text-white' 
              : 'bg-white/90 text-[#1F1F1F] hover:text-[#C85A32] hover:bg-white'
          }`}
          aria-label={isSaved ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart className={`w-4 h-4 ${isSaved ? 'fill-white' : ''}`} />
        </button>

        {/* Product Image */}
        <div 
          onClick={() => openProductDetail(product)}
          className="w-full h-full cursor-pointer relative"
        >
          <img
            src={product.images[0]}
            alt={product.name}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=800&auto=format&fit=crop';
            }}
            className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />

          {/* Alternate Image on Hover if available */}
          {product.images[1] && (
            <img
              src={product.images[1]}
              alt={`${product.name} alternate view`}
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = 'none';
              }}
              className="absolute inset-0 w-full h-full object-cover object-center opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              loading="lazy"
            />
          )}
        </div>

        {/* Action Overlay Bar (Desktop hover + Mobile bottom tap) */}
        <div className="absolute bottom-0 inset-x-0 p-2 sm:p-3 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-1.5 sm:gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setQuickViewProduct(product);
            }}
            className="flex-1 bg-white/95 hover:bg-white text-[#1F1F1F] hover:text-[#C85A32] text-[11px] sm:text-xs font-semibold py-1.5 sm:py-2 px-2 sm:px-3 rounded-xs shadow-md transition-colors flex items-center justify-center gap-1 cursor-pointer"
            title="Quick View"
          >
            <Eye className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span className="hidden xs:inline">Quick View</span>
          </button>

          {!product.isSoldOut && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                addToCart(product, 1);
              }}
              className="bg-[#1F1F1F] hover:bg-[#333333] text-white text-[11px] sm:text-xs font-semibold py-1.5 px-2.5 sm:py-2 sm:px-3 rounded-xs shadow-md transition-colors flex items-center justify-center gap-1 cursor-pointer"
              title="Add to Bag"
            >
              <ShoppingBag className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span className="hidden xs:inline">+ Bag</span>
            </button>
          )}
        </div>
      </div>

      {/* Product Details */}
      <div className="p-4 flex flex-col flex-1 text-center">
        {/* Category Tag */}
        <span className="text-[11px] font-medium text-[#A0988A] uppercase tracking-wider mb-1">
          {product.categoryTag}
        </span>

        {/* Title */}
        <h3 
          onClick={() => openProductDetail(product)}
          className="text-sm font-medium text-[#1F1F1F] hover:text-[#C85A32] transition-colors cursor-pointer line-clamp-1 mb-1.5"
        >
          {product.name}
        </h3>

        {/* Rating Stars & Social Proof Badge */}
        <div className="flex flex-col items-center justify-center gap-1 mb-2">
          <div className="flex items-center justify-center gap-1">
            <div className="flex text-[#FBC02D]">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3.5 h-3.5 ${
                    i < Math.floor(product.rating || 5)
                      ? 'fill-[#FBC02D]'
                      : 'text-[#E0DDD5]'
                  }`}
                />
              ))}
            </div>
            <span className="text-[11px] text-[#8C8477] ml-0.5">({product.reviewCount || 0})</span>
          </div>

          <span className="text-[10px] bg-amber-50 text-amber-900 border border-amber-200/80 px-2 py-0.5 rounded-full font-medium inline-flex items-center gap-1">
            <span>🔥</span>
            <span>{product.recentPurchasesCount ?? Math.floor(18 + ((product.rating || 5) * 5))} bought in last 7 days</span>
          </span>
        </div>

        {/* Price Section */}
        <div className="mt-auto flex items-center justify-center gap-2 mb-3">
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-xs text-[#9E978C] line-through">
              {formatPrice(product.originalPrice)}
            </span>
          )}
          <span className="text-sm font-semibold text-[#1F1F1F]">
            {formatPrice(product.price)}
          </span>
        </div>

        {/* CUSTOM RED MODERN BUY NOW BUTTON */}
        <div className="w-full pt-1">
          <button
            id={`buy-now-${product.id}`}
            onClick={(e) => {
              e.stopPropagation();
              if (product.isSoldOut || product.stockQuantity <= 0) {
                openProductDetail(product);
              } else {
                buyNow(product, 1);
              }
            }}
            disabled={product.isSoldOut || product.stockQuantity <= 0}
            className={`w-full py-2.5 px-3 rounded-xs font-semibold text-xs uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 shadow-xs active:scale-[0.98] cursor-pointer ${
              product.isSoldOut || product.stockQuantity <= 0
                ? 'bg-[#E5E0D8] text-[#9E978C] cursor-not-allowed shadow-none'
                : 'bg-[#DC2626] hover:bg-[#B91C1C] text-white shadow-[0_2px_10px_rgba(220,38,38,0.25)] hover:shadow-[0_4px_16px_rgba(220,38,38,0.35)]'
            }`}
            aria-label={`Buy Now - ${product.name}`}
          >
            <Zap className="w-3.5 h-3.5 fill-white text-white shrink-0" />
            <span>{product.isSoldOut || product.stockQuantity <= 0 ? 'Sold Out' : 'Buy Now'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
