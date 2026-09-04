import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import { Search, X, ArrowRight, Sparkles, Star, ShoppingBag } from 'lucide-react';
import { Product } from '../../types';

export const SearchModal: React.FC = () => {
  const {
    isSearchOpen,
    setIsSearchOpen,
    products,
    formatPrice,
    setSelectedProduct,
    setActivePage,
    setSearchQuery: setGlobalSearchQuery,
    setSelectedCategory,
    addToCart
  } = useStore();

  const [searchTerm, setSearchTerm] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input whenever modal opens
  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 80);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setSearchTerm('');
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isSearchOpen]);

  // Handle Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false);
      }
      // Shortcut Ctrl+K or / to open
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && !isSearchOpen && (e.target as HTMLElement).tagName !== 'INPUT' && (e.target as HTMLElement).tagName !== 'TEXTAREA')) {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, setIsSearchOpen]);

  // Trending & Suggested Searches
  const trendingSearches = [
    { label: '⭐ Best Sellers', query: 'best seller' },
    { label: '🎒 Backpacks', query: 'backpack' },
    { label: '🕶️ Bio-Optics', query: 'glasses' },
    { label: '👟 Boots & Footwear', query: 'shoes' },
    { label: '🧥 Outerwear', query: 'apparel' },
    { label: '🧢 Headwear', query: 'hats' },
  ];

  // Filter products based on live search term
  const searchResults = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return [];

    return products.filter((p) => {
      if (q === 'best seller' || q === 'best sellers') {
        return p.isBestSeller || (p.recentPurchasesCount && p.recentPurchasesCount > 20);
      }
      const matchName = p.name.toLowerCase().includes(q);
      const matchTag = p.tagline?.toLowerCase().includes(q);
      const matchCategory = p.category.toLowerCase().includes(q);
      const matchDesc = p.description?.toLowerCase().includes(q);
      const matchSku = p.sku?.toLowerCase().includes(q);
      const matchDetails = p.details?.some((d) => d.toLowerCase().includes(q));
      return matchName || matchTag || matchCategory || matchDesc || matchSku || matchDetails;
    }).sort((a, b) => (a.displayRank ?? 9999) - (b.displayRank ?? 9999));
  }, [searchTerm, products]);

  if (!isSearchOpen) return null;

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setActivePage('product-detail');
    setIsSearchOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewAllResults = () => {
    setGlobalSearchQuery(searchTerm);
    setSelectedCategory('all');
    setActivePage('shop');
    setIsSearchOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectTrending = (query: string) => {
    setSearchTerm(query);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex flex-col bg-black/60 backdrop-blur-md transition-all duration-300 animate-fadeIn"
      onClick={() => setIsSearchOpen(false)}
    >
      <div 
        className="w-full max-w-3xl mx-auto mt-0 sm:mt-12 md:mt-16 bg-white dark:bg-[#1A1A1A] sm:rounded-2xl shadow-2xl border border-[#EAE6DE] dark:border-[#2C2C2C] flex flex-col max-h-[100vh] sm:max-h-[85vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header Bar */}
        <div className="p-4 sm:p-5 border-b border-[#F0ECE1] dark:border-[#2C2C2C] flex items-center gap-3 bg-[#FAF9F6] dark:bg-[#141414]">
          <div className="w-10 h-10 rounded-xl bg-[#FAF1ED] dark:bg-[#2A1E18] text-[#C85A32] flex items-center justify-center shrink-0">
            <Search className="w-5 h-5" />
          </div>
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search designer products, categories, collections..."
              className="w-full bg-transparent text-sm sm:text-base font-medium text-[#1F1F1F] dark:text-white placeholder:text-[#9EA4B0] focus:outline-none pr-8"
            />
            {searchTerm && (
              <button 
                onClick={() => { setSearchTerm(''); inputRef.current?.focus(); }}
                className="absolute right-0 top-1/2 -translate-y-1/2 p-1 text-[#8C8477] hover:text-[#1F1F1F] dark:hover:text-white cursor-pointer"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button
            onClick={() => setIsSearchOpen(false)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#8C8477] hover:text-[#1F1F1F] hover:bg-[#EFECE6] dark:hover:bg-[#262626] dark:hover:text-white transition-colors cursor-pointer"
          >
            ESC
          </button>
        </div>

        {/* Quick Trending Chips */}
        <div className="px-4 py-3 bg-white dark:bg-[#1A1A1A] border-b border-[#F0ECE1] dark:border-[#282828] flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-[11px] font-bold text-[#8C8275] dark:text-[#888] uppercase tracking-wider shrink-0 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#C85A32]" />
            Popular:
          </span>
          {trendingSearches.map((item) => (
            <button
              key={item.label}
              onClick={() => handleSelectTrending(item.query)}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer shrink-0 border ${
                searchTerm.toLowerCase() === item.query.toLowerCase()
                  ? 'bg-[#1F1F1F] dark:bg-white text-white dark:text-black border-transparent shadow-xs'
                  : 'bg-[#FAF9F6] dark:bg-[#222] text-[#555] dark:text-[#BBB] border-[#EAE6DE] dark:border-[#333] hover:border-[#C85A32] hover:text-[#C85A32]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Search Results Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
          {searchTerm.trim() === '' ? (
            /* Blank state: show top featured products */
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-[#8C8477] uppercase tracking-wider">
                  Featured & Best Sellers
                </span>
                <span className="text-[11px] text-[#8C8477]">
                  {products.length} items in collection
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {products
                  .filter((p) => p.isBestSeller || p.isFeatured)
                  .slice(0, 6)
                  .map((product) => (
                    <div
                      key={product.id}
                      onClick={() => handleSelectProduct(product)}
                      className="flex items-center gap-3 p-2.5 rounded-xl border border-[#EAE6DE] dark:border-[#2C2C2C] hover:border-[#C85A32] dark:hover:border-[#C85A32] bg-[#FAF9F6] dark:bg-[#222] transition-all cursor-pointer group"
                    >
                      <img
                        src={product.images?.[0] || 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=300'}
                        alt={product.name}
                        className="w-14 h-14 rounded-lg object-cover border border-[#EAE6DE] dark:border-[#333] shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold text-[#C85A32] uppercase tracking-wider">
                            {product.category}
                          </span>
                          {product.isBestSeller && (
                            <span className="text-[9px] bg-[#FAF1ED] text-[#C85A32] px-1.5 py-0.2 rounded-full font-bold">
                              Best Seller
                            </span>
                          )}
                        </div>
                        <h4 className="text-xs font-semibold text-[#1F1F1F] dark:text-white truncate group-hover:text-[#C85A32] transition-colors">
                          {product.name}
                        </h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs font-bold text-[#1F1F1F] dark:text-white">
                            {formatPrice(product.price)}
                          </span>
                          {product.originalPrice && product.originalPrice > product.price && (
                            <span className="text-[10px] line-through text-[#8C8477]">
                              {formatPrice(product.originalPrice)}
                            </span>
                          )}
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-[#8C8477] group-hover:text-[#C85A32] group-hover:translate-x-0.5 transition-all shrink-0" />
                    </div>
                  ))}
              </div>
            </div>
          ) : searchResults.length > 0 ? (
            /* Results found */
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-[#8C8477] uppercase tracking-wider">
                  Found {searchResults.length} Match{searchResults.length > 1 ? 'es' : ''} for "{searchTerm}"
                </span>
                <button
                  onClick={handleViewAllResults}
                  className="text-xs font-bold text-[#C85A32] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Open Full Catalog</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-2">
                {searchResults.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => handleSelectProduct(product)}
                    className="flex items-center gap-3.5 p-3 rounded-xl border border-[#EAE6DE] dark:border-[#2C2C2C] hover:border-[#C85A32] dark:hover:border-[#C85A32] bg-[#FAF9F6] dark:bg-[#222] transition-all cursor-pointer group"
                  >
                    <img
                      src={product.images?.[0] || 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=300'}
                      alt={product.name}
                      className="w-16 h-16 rounded-xl object-cover border border-[#EAE6DE] dark:border-[#333] shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <span className="text-[10px] font-bold text-[#8C8477] dark:text-[#AAA] uppercase tracking-wider">
                          {product.category}
                        </span>
                        {product.isBestSeller && (
                          <span className="text-[9px] bg-[#FAF1ED] text-[#C85A32] px-2 py-0.2 rounded-full font-bold">
                            ⭐ Best Seller
                          </span>
                        )}
                        {product.isNewArrival && (
                          <span className="text-[9px] bg-[#ECFDF5] text-[#059669] px-2 py-0.2 rounded-full font-bold">
                            New Arrival
                          </span>
                        )}
                        {product.displayRank && product.displayRank <= 5 && (
                          <span className="text-[9px] bg-[#FAF5FF] text-[#8B5CF6] px-1.5 py-0.2 rounded-full font-bold">
                            #{product.displayRank} Priority
                          </span>
                        )}
                      </div>

                      <h4 className="text-sm font-semibold text-[#1F1F1F] dark:text-white truncate group-hover:text-[#C85A32] transition-colors">
                        {product.name}
                      </h4>

                      <p className="text-[11px] text-[#8C8477] dark:text-[#888] truncate mt-0.5">
                        {product.tagline || product.description}
                      </p>

                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="text-xs font-bold text-[#1F1F1F] dark:text-white">
                          {formatPrice(product.price)}
                        </span>
                        {product.originalPrice && product.originalPrice > product.price && (
                          <span className="text-[10px] line-through text-[#8C8477]">
                            {formatPrice(product.originalPrice)}
                          </span>
                        )}
                        <div className="flex items-center text-[10px] text-amber-500 font-bold ml-auto">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400 mr-0.5" />
                          <span>{product.rating || 5.0}</span>
                          <span className="text-[#8C8477] ml-1">({product.reviewCount || 0})</span>
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-1.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(product, 1);
                        }}
                        className="p-2 rounded-lg bg-white dark:bg-[#333] border border-[#EAE6DE] dark:border-[#444] text-[#1F1F1F] dark:text-white hover:bg-[#C85A32] hover:text-white hover:border-[#C85A32] transition-colors cursor-pointer"
                        title="Add to Shopping Bag"
                      >
                        <ShoppingBag className="w-4 h-4" />
                      </button>
                      <div className="p-2 rounded-lg text-[#8C8477] group-hover:text-[#C85A32] transition-colors">
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* No results state */
            <div className="py-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#FAF1ED] text-[#C85A32] flex items-center justify-center mx-auto">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#1F1F1F] dark:text-white">
                No matching pieces found
              </h3>
              <p className="text-xs text-[#8C8477] max-w-sm mx-auto">
                We couldn't find any products matching "{searchTerm}". Try searching by category, materials, or browsing all collections.
              </p>
              <div className="pt-2">
                <button
                  onClick={handleViewAllResults}
                  className="px-4 py-2 bg-[#1F1F1F] dark:bg-white text-white dark:text-[#1F1F1F] text-xs font-bold rounded-lg hover:bg-[#C85A32] dark:hover:bg-[#C85A32] dark:hover:text-white transition-colors cursor-pointer inline-flex items-center gap-1.5"
                >
                  <span>Browse Full Catalog</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        {searchResults.length > 0 && (
          <div className="p-3 bg-[#FAF9F6] dark:bg-[#141414] border-t border-[#F0ECE1] dark:border-[#2C2C2C] flex items-center justify-between text-xs">
            <span className="text-[#8C8477] text-[11px]">
              Tip: Press <kbd className="px-1.5 py-0.5 bg-white dark:bg-[#222] border border-[#DDD] dark:border-[#333] rounded-xs font-mono text-[10px]">ESC</kbd> to exit search
            </span>
            <button
              onClick={handleViewAllResults}
              className="font-bold text-[#C85A32] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View all {searchResults.length} in Catalog</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
