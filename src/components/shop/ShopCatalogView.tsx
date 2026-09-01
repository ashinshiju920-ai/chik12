import React, { useState, useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import { ProductCard } from './ProductCard';
import { 
  Filter, 
  Grid, 
  List, 
  X, 
  ChevronDown, 
  SlidersHorizontal,
  Sparkles,
  ShoppingBag,
  Zap
} from 'lucide-react';
import { ProductCategory } from '../../types';

export const ShopCatalogView: React.FC = () => {
  const { 
    products, 
    selectedCategory, 
    setSelectedCategory, 
    searchQuery, 
    setSearchQuery,
    formatPrice,
    openProductDetail,
    addToCart,
    buyNow
  } = useStore();

  const [priceMax, setPriceMax] = useState<number>(250);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'featured' | 'price-low' | 'price-high' | 'rating' | 'newest'>('featured');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const categories: { id: ProductCategory | 'all'; label: string; count: number }[] = [
    { id: 'all', label: 'All Collections', count: products.length },
    { id: 'backpack', label: 'Backpacks & Rucksacks', count: products.filter((p) => p.category === 'backpack').length },
    { id: 'shoes', label: 'Handcrafted Footwear', count: products.filter((p) => p.category === 'shoes').length },
    { id: 'glasses', label: 'Eyewear & Optics', count: products.filter((p) => p.category === 'glasses').length },
    { id: 'hats', label: 'Caps & Beanies', count: products.filter((p) => p.category === 'hats').length },
    { id: 'apparel', label: 'Merino & Apparel', count: products.filter((p) => p.category === 'apparel').length },
    { id: 'accessories', label: 'Leather Goods', count: products.filter((p) => p.category === 'accessories').length },
  ];

  // Filtered & Sorted products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Category filter
        if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;
        // Search query
        if (searchQuery) {
          const matchName = p.name.toLowerCase().includes(searchQuery.toLowerCase());
          const matchTag = p.tagline?.toLowerCase().includes(searchQuery.toLowerCase());
          const matchCat = p.category.toLowerCase().includes(searchQuery.toLowerCase());
          if (!matchName && !matchTag && !matchCat) return false;
        }
        // Price filter
        if (p.price > priceMax) return false;
        // Stock filter
        if (inStockOnly && (p.isSoldOut || p.stockQuantity <= 0)) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-low') return a.price - b.price;
        if (sortBy === 'price-high') return b.price - a.price;
        if (sortBy === 'rating') return b.rating - a.rating;
        if (sortBy === 'newest') return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
        return 0; // 'featured' keeps standard order
      });
  }, [products, selectedCategory, searchQuery, priceMax, inStockOnly, sortBy]);

  const handleResetFilters = () => {
    setSelectedCategory('all');
    setSearchQuery('');
    setPriceMax(250);
    setInStockOnly(false);
    setSortBy('featured');
  };

  return (
    <div className="bg-[#F9F8F6] min-h-screen py-10 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Title */}
        <div className="border-b border-[#EAE6DE] pb-6 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-bold text-[#C85A32] uppercase tracking-widest">
              Nordic Lifestyle Boutique
            </span>
            <h1 className="text-3xl sm:text-4xl font-semibold text-[#1F1F1F] font-editorial mt-1">
              {selectedCategory === 'all' ? 'All Collections' : categories.find((c) => c.id === selectedCategory)?.label}
            </h1>
            <p className="text-xs text-[#827A6D] mt-1">
              Showing {filteredProducts.length} of {products.length} design-forward pieces
            </p>
          </div>

          {/* Controls: View mode & Sort */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between">
            <button
              onClick={() => setIsMobileFilterOpen(true)}
              className="lg:hidden bg-white border border-[#D5D0C5] text-xs font-semibold px-3 py-2 rounded-xs flex items-center gap-1.5"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Filters</span>
            </button>

            <div className="flex items-center gap-3">
              {/* Sort By Dropdown */}
              <div className="flex items-center gap-1.5 text-xs text-[#6E685F]">
                <span className="hidden sm:inline">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-white border border-[#D5D0C5] rounded-xs px-3 py-1.5 text-xs text-[#1F1F1F] focus:outline-none focus:border-[#C85A32]"
                >
                  <option value="featured">Featured Curations</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                  <option value="newest">New Arrivals</option>
                </select>
              </div>

              {/* Grid / List toggle */}
              <div className="hidden sm:flex border border-[#D5D0C5] rounded-xs bg-white overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 transition-colors ${viewMode === 'grid' ? 'bg-[#FAF1ED] text-[#C85A32]' : 'text-gray-400 hover:text-black'}`}
                  aria-label="Grid view"
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 transition-colors ${viewMode === 'list' ? 'bg-[#FAF1ED] text-[#C85A32]' : 'text-gray-400 hover:text-black'}`}
                  aria-label="List view"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Active Filter Chips */}
        {(selectedCategory !== 'all' || searchQuery || inStockOnly || priceMax < 250) && (
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <span className="text-xs font-semibold text-[#1F1F1F]">Active Filters:</span>

            {selectedCategory !== 'all' && (
              <span className="inline-flex items-center gap-1 text-xs bg-white border border-[#E0DCD3] px-2.5 py-1 rounded-xs">
                <span>Category: {selectedCategory}</span>
                <button onClick={() => setSelectedCategory('all')} className="text-gray-400 hover:text-black">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {searchQuery && (
              <span className="inline-flex items-center gap-1 text-xs bg-white border border-[#E0DCD3] px-2.5 py-1 rounded-xs">
                <span>Search: "{searchQuery}"</span>
                <button onClick={() => setSearchQuery('')} className="text-gray-400 hover:text-black">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {inStockOnly && (
              <span className="inline-flex items-center gap-1 text-xs bg-white border border-[#E0DCD3] px-2.5 py-1 rounded-xs">
                <span>In Stock Only</span>
                <button onClick={() => setInStockOnly(false)} className="text-gray-400 hover:text-black">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {priceMax < 250 && (
              <span className="inline-flex items-center gap-1 text-xs bg-white border border-[#E0DCD3] px-2.5 py-1 rounded-xs">
                <span>Under ${priceMax}</span>
                <button onClick={() => setPriceMax(250)} className="text-gray-400 hover:text-black">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            <button
              onClick={handleResetFilters}
              className="text-xs text-[#C85A32] underline hover:text-[#B34E2A] ml-2 cursor-pointer font-medium"
            >
              Reset All
            </button>
          </div>
        )}

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Desktop Filter Sidebar */}
          <div className="hidden lg:block lg:col-span-3 space-y-6">
            
            {/* Category Filter */}
            <div className="bg-white border border-[#EAE6DE] p-5 rounded-xs space-y-3 shadow-xs">
              <h3 className="text-xs font-bold text-[#1F1F1F] uppercase tracking-wider">
                Categories
              </h3>
              <div className="space-y-1">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`w-full flex items-center justify-between text-xs py-2 px-2.5 rounded-xs transition-colors cursor-pointer text-left ${
                      selectedCategory === cat.id
                        ? 'bg-[#FAF1ED] text-[#C85A32] font-semibold'
                        : 'text-[#555048] hover:bg-[#FAF9F6]'
                    }`}
                  >
                    <span>{cat.label}</span>
                    <span className="text-[10px] text-[#9A9285]">({cat.count})</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Price Slider */}
            <div className="bg-white border border-[#EAE6DE] p-5 rounded-xs space-y-3 shadow-xs">
              <div className="flex justify-between items-center text-xs font-bold text-[#1F1F1F] uppercase tracking-wider">
                <span>Max Price</span>
                <span className="text-[#C85A32] font-mono">${priceMax}</span>
              </div>
              <input
                type="range"
                min="20"
                max="250"
                step="5"
                value={priceMax}
                onChange={(e) => setPriceMax(Number(e.target.value))}
                className="w-full accent-[#C85A32] cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-[#8C8477]">
                <span>$20</span>
                <span>$250+</span>
              </div>
            </div>

            {/* Stock Availability */}
            <div className="bg-white border border-[#EAE6DE] p-5 rounded-xs shadow-xs">
              <label className="flex items-center gap-2.5 text-xs text-[#1F1F1F] cursor-pointer">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="rounded-xs text-[#C85A32] focus:ring-[#C85A32]"
                />
                <span className="font-medium">In Stock Items Only</span>
              </label>
            </div>

          </div>

          {/* Product Grid / List Results */}
          <div className="lg:col-span-9">
            {filteredProducts.length === 0 ? (
              <div className="bg-white border border-[#EAE6DE] rounded-xs p-16 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#F5F3EF] flex items-center justify-center text-[#8C8477] mx-auto">
                  <ShoppingBag className="w-8 h-8 stroke-[1.2]" />
                </div>
                <h3 className="text-xl font-semibold text-[#1F1F1F] font-editorial">
                  No products matched your criteria
                </h3>
                <p className="text-xs text-[#7A7264] max-w-sm mx-auto">
                  Try adjusting your price filter, search terms, or clearing your active filters.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="bg-[#C85A32] text-white text-xs font-semibold px-6 py-2.5 rounded-xs"
                >
                  Clear Filters
                </button>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((prod) => (
                  <ProductCard key={prod.id} product={prod} />
                ))}
              </div>
            ) : (
              /* List Mode */
              <div className="space-y-4">
                {filteredProducts.map((prod) => (
                  <div
                    key={prod.id}
                    className="bg-white border border-[#EAE6DE] rounded-xs p-4 flex flex-col sm:flex-row gap-5 items-start sm:items-center hover:border-[#C85A32] transition-all shadow-xs"
                  >
                    <img
                      src={prod.images[0]}
                      alt={prod.name}
                      onClick={() => openProductDetail(prod)}
                      className="w-full sm:w-36 h-36 object-cover rounded-xs bg-[#F5F3EF] cursor-pointer"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] uppercase font-bold text-[#C85A32] tracking-wider">
                        {prod.category}
                      </div>
                      <h3
                        onClick={() => openProductDetail(prod)}
                        className="text-base font-semibold text-[#1F1F1F] font-editorial hover:text-[#C85A32] cursor-pointer"
                      >
                        {prod.name}
                      </h3>
                      <p className="text-xs text-[#6E685F] line-clamp-2 mt-1">
                        {prod.description}
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-xs">
                        <span className="font-bold text-sm text-[#1F1F1F]">{formatPrice(prod.price)}</span>
                        {prod.originalPrice && (
                          <span className="text-gray-400 line-through">{formatPrice(prod.originalPrice)}</span>
                        )}
                        <span className="text-[11px] text-amber-600">★ {prod.rating}</span>
                      </div>
                    </div>

                    <div className="w-full sm:w-auto flex flex-row sm:flex-col gap-2 shrink-0">
                      <button
                        onClick={() => buyNow(prod, 1)}
                        disabled={prod.isSoldOut || prod.stockQuantity <= 0}
                        className="flex-1 sm:flex-initial bg-[#DC2626] hover:bg-[#B91C1C] active:bg-[#991B1B] text-white text-xs font-semibold px-5 py-2.5 rounded-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-[0_2px_8px_rgba(220,38,38,0.25)] hover:shadow-[0_4px_12px_rgba(220,38,38,0.35)] disabled:bg-gray-300 disabled:shadow-none cursor-pointer"
                      >
                        <Zap className="w-3.5 h-3.5 fill-white text-white" />
                        <span>{prod.isSoldOut ? 'Sold Out' : 'Buy Now'}</span>
                      </button>

                      <button
                        onClick={() => addToCart(prod, 1)}
                        disabled={prod.isSoldOut || prod.stockQuantity <= 0}
                        className="flex-1 sm:flex-initial bg-white border border-[#1F1F1F] hover:bg-[#1F1F1F] hover:text-white text-[#1F1F1F] text-xs font-semibold px-5 py-2 rounded-xs uppercase tracking-wider transition-colors disabled:opacity-30 cursor-pointer"
                      >
                        {prod.isSoldOut ? 'Unavailable' : '+ Bag'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
