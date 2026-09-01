import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { 
  Heart, 
  ShoppingBag, 
  Trash2, 
  ArrowRight, 
  Share2, 
  Sparkles, 
  Check, 
  AlertCircle,
  Truck,
  ShieldCheck,
  RotateCcw,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Product } from '../../types';

export const WishlistView: React.FC = () => {
  const { 
    wishlist, 
    products, 
    formatPrice, 
    removeFromWishlist, 
    moveWishlistToCart, 
    moveAllWishlistToCart, 
    clearWishlist,
    openProductDetail, 
    setActivePage, 
    setSelectedCategory,
    showToast,
    buyNow
  } = useStore();

  // Track variant selections per product card in wishlist
  const [selectedVariants, setSelectedVariants] = useState<{
    [productId: string]: { color?: string; size?: string };
  }>({});

  const wishlistProducts = products.filter((p) => wishlist.includes(p.id));

  const handleSelectColor = (productId: string, color: string) => {
    setSelectedVariants((prev) => ({
      ...prev,
      [productId]: { ...prev[productId], color }
    }));
  };

  const handleSelectSize = (productId: string, size: string) => {
    setSelectedVariants((prev) => ({
      ...prev,
      [productId]: { ...prev[productId], size }
    }));
  };

  const handleShareWishlist = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast('Wishlist link copied to clipboard!', 'success', 'Share your curated Haute boutique wishlist.');
    } else {
      showToast('Wishlist URL ready to share!', 'info');
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F8F6] py-8 sm:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb Header */}
        <nav className="flex items-center space-x-2 text-xs text-[#8C8477] mb-6">
          <button 
            onClick={() => setActivePage('home')} 
            className="hover:text-[#C85A32] transition-colors cursor-pointer"
          >
            Home
          </button>
          <span>/</span>
          <button 
            onClick={() => setActivePage('shop')} 
            className="hover:text-[#C85A32] transition-colors cursor-pointer"
          >
            Catalog
          </button>
          <span>/</span>
          <span className="text-[#1F1F1F] font-semibold">Saved Wishlist</span>
        </nav>

        {/* Wishlist Header Bar */}
        <div className="bg-white border border-[#EBE8E2] rounded-xs p-6 sm:p-8 mb-8 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold tracking-widest text-[#C85A32] uppercase">
                Curated Collection
              </span>
              <span className="bg-[#FAF1ED] text-[#C85A32] text-[10px] font-bold px-2 py-0.5 rounded-full">
                {wishlistProducts.length} {wishlistProducts.length === 1 ? 'Item' : 'Items'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-[#1F1F1F] font-editorial mt-1">
              Your Personal Wishlist
            </h1>
            <p className="text-xs text-[#7A7264] mt-1">
              Items saved here are reserved across your browsing session. Move items directly to your shopping bag when ready.
            </p>
          </div>

          {wishlistProducts.length > 0 && (
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <button
                id="wishlist-share-btn"
                onClick={handleShareWishlist}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-[#D5D0C5] hover:border-[#1F1F1F] text-xs font-semibold text-[#4A453C] rounded-xs transition-colors cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share List</span>
              </button>

              <button
                id="wishlist-clear-btn"
                onClick={clearWishlist}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-[#EAE6DE] hover:border-[#D32F2F] text-xs font-semibold text-[#8C8477] hover:text-[#D32F2F] rounded-xs transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All</span>
              </button>

              <button
                id="wishlist-move-all-btn"
                onClick={moveAllWishlistToCart}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#C85A32] hover:bg-[#B34E2A] text-white text-xs font-semibold uppercase tracking-wider rounded-xs transition-colors cursor-pointer shadow-xs"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Move All to Bag</span>
              </button>
            </div>
          )}
        </div>

        {/* Empty State */}
        {wishlistProducts.length === 0 ? (
          <div className="bg-white border border-[#EBE8E2] rounded-xs p-12 sm:p-16 text-center space-y-6 shadow-xs max-w-2xl mx-auto">
            <div className="w-16 h-16 bg-[#FAF1ED] text-[#C85A32] rounded-full flex items-center justify-center mx-auto">
              <Heart className="w-8 h-8 stroke-[1.5]" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-[#1F1F1F] font-editorial">
                Your Wishlist is Empty
              </h2>
              <p className="text-xs text-[#7A7264] max-w-md mx-auto leading-relaxed">
                You haven't saved any items yet. Explore our handcrafted Scandinavian collections and tap the heart icon on any product to save it here.
              </p>
            </div>

            {/* Category Quick Links */}
            <div className="pt-4 border-t border-[#F0ECE1] space-y-3">
              <span className="text-[11px] font-bold text-[#8C8275] uppercase tracking-wider block">
                Explore Popular Categories
              </span>
              <div className="flex flex-wrap justify-center gap-2">
                {[
                  { label: 'Backpacks', cat: 'backpack' },
                  { label: 'Footwear', cat: 'shoes' },
                  { label: 'Eyewear', cat: 'glasses' },
                  { label: 'Headwear', cat: 'hats' },
                  { label: 'Apparel', cat: 'apparel' }
                ].map((item) => (
                  <button
                    key={item.cat}
                    onClick={() => {
                      setSelectedCategory(item.cat as any);
                      setActivePage('shop');
                    }}
                    className="px-3.5 py-1.5 bg-[#FAF9F6] hover:bg-[#FAF1ED] hover:text-[#C85A32] border border-[#EAE6DE] text-xs font-medium rounded-xs transition-colors cursor-pointer"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setActivePage('shop')}
                className="bg-[#1F1F1F] hover:bg-[#C85A32] text-white text-xs font-semibold tracking-wider uppercase px-8 py-3 rounded-xs transition-colors inline-flex items-center gap-2 cursor-pointer"
              >
                <span>Browse Full Catalog</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          /* Wishlist Items Grid */
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <AnimatePresence>
                {wishlistProducts.map((prod) => {
                  const currentVariant = selectedVariants[prod.id] || {};
                  const activeColor = currentVariant.color || (prod.colors && prod.colors.length > 0 ? prod.colors[0].name : undefined);
                  const activeSize = currentVariant.size || (prod.sizes && prod.sizes.length > 0 ? prod.sizes[0] : undefined);
                  const isOutOfStock = prod.isSoldOut || prod.stockQuantity <= 0;

                  return (
                    <motion.div
                      key={prod.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="bg-white border border-[#EBE8E2] rounded-xs overflow-hidden shadow-xs flex flex-col justify-between group hover:border-[#C85A32]/50 transition-all duration-200"
                    >
                      {/* Product Thumbnail & Overlay Actions */}
                      <div className="relative aspect-square bg-[#F5F3EF] overflow-hidden">
                        <img
                          src={prod.images[0]}
                          alt={prod.name}
                          onClick={() => openProductDetail(prod)}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                        />

                        {/* Top Badges */}
                        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
                          {isOutOfStock ? (
                            <span className="bg-[#D32F2F] text-white text-[10px] font-bold px-2 py-0.5 rounded-xs uppercase tracking-wider">
                              Sold Out
                            </span>
                          ) : prod.isSale ? (
                            <span className="bg-[#C85A32] text-white text-[10px] font-bold px-2 py-0.5 rounded-xs uppercase tracking-wider">
                              Sale
                            </span>
                          ) : prod.isNew ? (
                            <span className="bg-[#1F1F1F] text-white text-[10px] font-bold px-2 py-0.5 rounded-xs uppercase tracking-wider">
                              New
                            </span>
                          ) : null}
                        </div>

                        {/* Remove Button */}
                        <button
                          id={`wishlist-remove-${prod.id}`}
                          onClick={() => removeFromWishlist(prod.id)}
                          className="absolute top-2.5 right-2.5 w-8 h-8 bg-white/90 hover:bg-white text-[#8C8477] hover:text-[#D32F2F] rounded-full shadow-sm flex items-center justify-center transition-colors cursor-pointer z-10"
                          title="Remove from wishlist"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Details & Selectors */}
                      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-[11px] text-[#8C8477]">
                            <span className="capitalize">{prod.category}</span>
                            <span className="font-mono text-[10px]">{prod.sku}</span>
                          </div>

                          <h3 
                            onClick={() => openProductDetail(prod)}
                            className="text-sm font-semibold text-[#1F1F1F] hover:text-[#C85A32] transition-colors cursor-pointer line-clamp-1"
                          >
                            {prod.name}
                          </h3>

                          {/* Price Display */}
                          <div className="flex items-baseline gap-2 pt-0.5">
                            <span className="text-base font-bold text-[#1F1F1F]">
                              {formatPrice(prod.price)}
                            </span>
                            {prod.originalPrice && prod.originalPrice > prod.price && (
                              <span className="text-xs text-[#9E978C] line-through">
                                {formatPrice(prod.originalPrice)}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Color Selector */}
                        {prod.colors && prod.colors.length > 0 && (
                          <div className="space-y-1.5 pt-1 border-t border-[#F5F3EF]">
                            <div className="flex justify-between text-[11px]">
                              <span className="text-[#8C8477]">Color:</span>
                              <span className="font-medium text-[#1F1F1F]">{activeColor}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              {prod.colors.map((c) => (
                                <button
                                  key={c.name}
                                  onClick={() => handleSelectColor(prod.id, c.name)}
                                  className={`w-5 h-5 rounded-full border transition-all cursor-pointer flex items-center justify-center ${
                                    activeColor === c.name ? 'border-[#C85A32] scale-110' : 'border-gray-300'
                                  }`}
                                  style={{ backgroundColor: c.hex }}
                                  title={c.name}
                                >
                                  {activeColor === c.name && (
                                    <Check className={`w-2.5 h-2.5 ${c.hex === '#FFFFFF' || c.hex === '#EAEAEA' ? 'text-black' : 'text-white'}`} />
                                  )}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Size Selector */}
                        {prod.sizes && prod.sizes.length > 0 && (
                          <div className="space-y-1.5 pt-1 border-t border-[#F5F3EF]">
                            <div className="flex justify-between text-[11px]">
                              <span className="text-[#8C8477]">Size:</span>
                              <span className="font-medium text-[#1F1F1F]">{activeSize}</span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {prod.sizes.map((s) => (
                                <button
                                  key={s}
                                  onClick={() => handleSelectSize(prod.id, s)}
                                  className={`px-2 py-0.5 text-[10px] font-semibold rounded-xs border transition-all cursor-pointer ${
                                    activeSize === s
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

                        {/* Actions: Buy Now & Move to Cart */}
                        <div className="pt-2 space-y-2">
                          <button
                            id={`wishlist-buy-now-${prod.id}`}
                            onClick={() => buyNow(prod, 1, activeColor, activeSize)}
                            disabled={isOutOfStock}
                            className="w-full bg-[#DC2626] hover:bg-[#B91C1C] active:bg-[#991B1B] text-white text-xs font-semibold uppercase tracking-wider py-2.5 rounded-xs transition-all flex items-center justify-center gap-1.5 shadow-[0_2px_8px_rgba(220,38,38,0.25)] hover:shadow-[0_4px_12px_rgba(220,38,38,0.35)] cursor-pointer disabled:bg-gray-300 disabled:shadow-none disabled:cursor-not-allowed"
                          >
                            <Zap className="w-3.5 h-3.5 fill-white text-white" />
                            <span>{isOutOfStock ? 'Sold Out' : 'Buy Now'}</span>
                          </button>

                          <button
                            id={`wishlist-move-to-cart-${prod.id}`}
                            onClick={() => moveWishlistToCart(prod.id, activeColor, activeSize)}
                            disabled={isOutOfStock}
                            className="w-full bg-[#FAF9F6] hover:bg-[#1F1F1F] hover:text-white text-[#1F1F1F] border border-[#EAE6DE] text-xs font-semibold uppercase tracking-wider py-2 rounded-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            <ShoppingBag className="w-3.5 h-3.5" />
                            <span>{isOutOfStock ? 'Out of Stock' : 'Move to Bag'}</span>
                          </button>
                        </div>

                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* Service & Guarantee Trust Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-[#EBE8E2]">
              <div className="bg-white p-4 border border-[#EAE6DE] rounded-xs flex items-center gap-3 text-xs">
                <Truck className="w-5 h-5 text-[#C85A32] shrink-0" />
                <div>
                  <div className="font-semibold text-[#1F1F1F]">Free Carbon-Neutral Shipping</div>
                  <div className="text-[11px] text-[#7A7264]">On all orders over $75.00 worldwide</div>
                </div>
              </div>
              <div className="bg-white p-4 border border-[#EAE6DE] rounded-xs flex items-center gap-3 text-xs">
                <ShieldCheck className="w-5 h-5 text-[#C85A32] shrink-0" />
                <div>
                  <div className="font-semibold text-[#1F1F1F]">2-Year Craftsmanship Warranty</div>
                  <div className="text-[11px] text-[#7A7264]">Every item guaranteed for longevity</div>
                </div>
              </div>
              <div className="bg-white p-4 border border-[#EAE6DE] rounded-xs flex items-center gap-3 text-xs">
                <RotateCcw className="w-5 h-5 text-[#C85A32] shrink-0" />
                <div>
                  <div className="font-semibold text-[#1F1F1F]">7-Day Easy Returns</div>
                  <div className="text-[11px] text-[#7A7264]">Hassle-free return & exchange window</div>
                </div>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
