import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useStore } from '../../context/StoreContext';
import { ProductCard } from './ProductCard';
import { 
  SlidersHorizontal, 
  X, 
  ChevronRight, 
  ShoppingBag, 
  ChevronDown, 
  Check, 
  ArrowLeft, 
  ArrowRight,
  Sparkles,
  Search,
  Grid,
  List
} from 'lucide-react';
import { ProductCategory, CategoryType } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';

const gridContainerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.02
    }
  }
};

const gridItemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: [0.16, 1, 0.3, 1]
    }
  }
};

export const ShopCatalogView: React.FC = () => {
  const { 
    products, 
    categories: storeCategories,
    selectedCategory, 
    setSelectedCategory, 
    searchQuery, 
    setSearchQuery,
    formatPrice,
    setActivePage
  } = useStore();

  const [priceMax, setPriceMax] = useState<number>(300);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [onSaleOnly, setOnSaleOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'featured' | 'bestsellers' | 'price-low' | 'price-high' | 'rating' | 'newest'>('featured');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 12;

  const catalogTopRef = useRef<HTMLDivElement>(null);

  // Departments List with Dynamic Live Firestore Categories Fallback
  const departments = useMemo(() => {
    const list = [
      { id: 'all' as CategoryType, name: 'All Collections', count: products.length },
      { id: 'backpack' as CategoryType, name: 'Backpacks & Bags', count: products.filter((p) => p.category === 'backpack').length },
      { id: 'shoes' as CategoryType, name: 'Footwear & Boots', count: products.filter((p) => p.category === 'shoes').length },
      { id: 'glasses' as CategoryType, name: 'Eyewear & Bio-Optics', count: products.filter((p) => p.category === 'glasses').length },
      { id: 'hats' as CategoryType, name: 'Headwear & Caps', count: products.filter((p) => p.category === 'hats').length },
      { id: 'apparel' as CategoryType, name: 'Apparel & Outerwear', count: products.filter((p) => p.category === 'apparel').length },
      { id: 'accessories' as CategoryType, name: 'Accessories & Knitwear', count: products.filter((p) => p.category === 'accessories').length },
    ];

    // Merge any custom categories from Firestore if present
    storeCategories.forEach((sc) => {
      const key = sc.key || sc.id;
      if (!list.some((d) => d.id === key)) {
        list.push({
          id: key as CategoryType,
          name: sc.name,
          count: products.filter((p) => p.category === key).length
        });
      }
    });

    return list;
  }, [products, storeCategories]);

  // Current Active Category Name
  const activeCategoryName = useMemo(() => {
    if (selectedCategory === 'all') return 'All Collections';
    const found = departments.find((d) => d.id === selectedCategory);
    return found ? found.name : 'Curated Collection';
  }, [selectedCategory, departments]);

  // Reset page when category or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchQuery, priceMax, inStockOnly, onSaleOnly, sortBy]);

  // Filtered & Sorted Products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Category filter
        if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;
        // Search query
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          const matchName = p.name.toLowerCase().includes(q);
          const matchTag = p.tagline?.toLowerCase().includes(q);
          const matchCat = p.category.toLowerCase().includes(q);
          const matchDesc = p.description?.toLowerCase().includes(q);
          if (!matchName && !matchTag && !matchCat && !matchDesc) return false;
        }
        // Price filter
        if (p.price > priceMax) return false;
        // Stock filter
        if (inStockOnly && (p.isSoldOut || p.stockQuantity <= 0)) return false;
        // On sale filter
        if (onSaleOnly && !p.isSale && (!p.originalPrice || p.originalPrice <= p.price)) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-low') return a.price - b.price;
        if (sortBy === 'price-high') return b.price - a.price;
        if (sortBy === 'rating') return (b.rating || 5) - (a.rating || 5);
        if (sortBy === 'newest') return (b.isNew || b.isNewArrival ? 1 : 0) - (a.isNew || a.isNewArrival ? 1 : 0);
        if (sortBy === 'bestsellers') {
          const scoreA = (a.isBestSeller ? 1000 : 0) + (a.recentPurchasesCount || 0);
          const scoreB = (b.isBestSeller ? 1000 : 0) + (b.recentPurchasesCount || 0);
          if (scoreA !== scoreB) return scoreB - scoreA;
          return (a.displayRank ?? 9999) - (b.displayRank ?? 9999);
        }
        // 'featured' / default: strictly honors admin custom displayRank order
        const rankA = typeof a.displayRank === 'number' ? a.displayRank : 9999;
        const rankB = typeof b.displayRank === 'number' ? b.displayRank : 9999;
        if (rankA !== rankB) return rankA - rankB;
        return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
      });
  }, [products, selectedCategory, searchQuery, priceMax, inStockOnly, onSaleOnly, sortBy]);

  // Pagination Calculations
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  const paginatedProducts = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * itemsPerPage;
    return filteredProducts.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredProducts, safeCurrentPage, itemsPerPage]);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    if (catalogTopRef.current) {
      catalogTopRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: 120, behavior: 'smooth' });
    }
  };

  const handleResetFilters = () => {
    setSelectedCategory('all');
    setSearchQuery('');
    setPriceMax(300);
    setInStockOnly(false);
    setOnSaleOnly(false);
    setSortBy('featured');
    setCurrentPage(1);
    setIsMobileFilterOpen(false);
  };

  const activeFiltersCount = (selectedCategory !== 'all' ? 1 : 0) +
    (searchQuery ? 1 : 0) +
    (priceMax < 300 ? 1 : 0) +
    (inStockOnly ? 1 : 0) +
    (onSaleOnly ? 1 : 0);

  // Generate luxury pagination page numbers with smart ellipsis
  const paginationRange = useMemo(() => {
    const range: (number | string)[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) range.push(i);
    } else {
      range.push(1);
      if (safeCurrentPage > 3) range.push('...');
      const start = Math.max(2, safeCurrentPage - 1);
      const end = Math.min(totalPages - 1, safeCurrentPage + 1);
      for (let i = start; i <= end; i++) {
        range.push(i);
      }
      if (safeCurrentPage < totalPages - 2) range.push('...');
      range.push(totalPages);
    }
    return range;
  }, [totalPages, safeCurrentPage]);

  return (
    <div ref={catalogTopRef} className="bg-[#F9F8F6] dark:bg-[#0D0D0D] min-h-screen pb-20">
      
      {/* ========================================================= */}
      {/* 1. HEADER & SUB-CATEGORY PILL BAR                         */}
      {/* ========================================================= */}
      <div className="border-b border-[#EAE6DE] dark:border-[#282828] bg-white/60 dark:bg-[#141414]/80 backdrop-blur-md sticky top-16 z-30 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          
          {/* Breadcrumbs */}
          <nav className="text-xs text-neutral-400 dark:text-[#8C8477] tracking-wide font-sans mb-1.5 flex items-center gap-1.5 flex-wrap">
            <button 
              onClick={() => setActivePage('home')} 
              className="hover:text-neutral-900 dark:hover:text-[#F5F3EF] transition-colors cursor-pointer"
            >
              Home
            </button>
            <span className="text-neutral-300 dark:text-neutral-600">/</span>
            <button 
              onClick={() => setSelectedCategory('all')} 
              className="hover:text-neutral-900 dark:hover:text-[#F5F3EF] transition-colors cursor-pointer"
            >
              Collections
            </button>
            <span className="text-neutral-300 dark:text-neutral-600">/</span>
            <span className="text-neutral-900 dark:text-[#F5F3EF] font-medium">{activeCategoryName}</span>
          </nav>

          {/* Title & Count Row */}
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 mb-3">
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-neutral-900 dark:text-[#F5F3EF] font-heading font-serif antialiased">
              {activeCategoryName}
            </h1>
            <span className="text-xs text-neutral-500 dark:text-[#A8A29E] font-sans">
              Showing <span className="font-semibold text-neutral-900 dark:text-[#F5F3EF]">{filteredProducts.length}</span> curated pieces
            </span>
          </div>

          {/* Horizontally Scrollable Subcategory Pills with Framer Motion layoutId highlight */}
          <div className="overflow-x-auto no-scrollbar flex items-center space-x-2 py-1 -mx-4 px-4 sm:mx-0 sm:px-0 relative">
            {departments.map((dept) => {
              const isSelected = selectedCategory === dept.id;
              return (
                <button
                  key={dept.id}
                  onClick={() => setSelectedCategory(dept.id)}
                  className={`relative px-4 py-1.5 rounded-full border text-xs font-medium whitespace-nowrap transition-all duration-200 cursor-pointer flex items-center gap-1.5 shrink-0 ${
                    isSelected
                      ? 'text-white border-neutral-900 dark:border-white shadow-xs'
                      : 'bg-white dark:bg-[#1A1A1A] text-neutral-600 dark:text-[#A8A29E] border-neutral-200 dark:border-[#333] hover:border-neutral-400 dark:hover:border-[#555] hover:text-neutral-900 dark:hover:text-[#F5F3EF]'
                  }`}
                >
                  {/* Sliding layoutId background */}
                  {isSelected && (
                    <motion.span
                      layoutId="activeCategoryPill"
                      className="absolute inset-0 rounded-full bg-neutral-900 dark:bg-[#F5F3EF] -z-10"
                      transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    />
                  )}
                  <span className={isSelected ? 'text-white dark:text-neutral-900' : ''}>{dept.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isSelected ? 'bg-white/20 dark:bg-black/20 text-white dark:text-neutral-900' : 'bg-neutral-100 dark:bg-[#282828] text-neutral-500 dark:text-neutral-400'
                  }`}>
                    {dept.count}
                  </span>
                </button>
              );
            })}
          </div>

        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">

        {/* ========================================================= */}
        {/* 2. MOBILE FILTER & SORT UTILITY BAR (< 1024px)            */}
        {/* ========================================================= */}
        {/* 2. MOBILE FILTER & SORT UTILITY BAR (< 1024px)            */}
        {/* ========================================================= */}
        <div className="lg:hidden flex items-center justify-between gap-3 mb-6 bg-white dark:bg-[#161616] border border-[#EAE6DE] dark:border-[#282828] p-3 rounded-xl shadow-xs">
          <button
            onClick={() => setIsMobileFilterOpen(true)}
            className="flex-1 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-semibold py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-transform active:scale-98"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filter & Sort</span>
            {activeFiltersCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-[#C85A32] text-white text-[10px] font-bold flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>

          {/* Quick Sort dropdown */}
          <div className="relative shrink-0">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-[#FAF9F6] dark:bg-[#1E1E1E] border border-[#D5D0C5] dark:border-[#333] text-xs font-medium text-neutral-800 dark:text-[#F5F3EF] py-2.5 px-3 rounded-lg focus:outline-none focus:border-neutral-900 dark:focus:border-white"
            >
              <option value="featured">Featured / Curated</option>
              <option value="bestsellers">⭐ Best Sellers First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Top Rated</option>
              <option value="newest">New Arrivals</option>
            </select>
          </div>
        </div>

        {/* Active Filter Chips Bar */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-6 pb-4 border-b border-[#EAE6DE] dark:border-[#282828]">
            <span className="text-xs font-semibold text-neutral-700 dark:text-[#D5D0C5]">Active Filters:</span>

            {selectedCategory !== 'all' && (
              <span className="inline-flex items-center gap-1.5 text-xs bg-white dark:bg-[#1E1E1E] border border-[#D5D0C5] dark:border-[#333] text-neutral-800 dark:text-[#F5F3EF] px-3 py-1 rounded-full shadow-2xs">
                <span>{activeCategoryName}</span>
                <button onClick={() => setSelectedCategory('all')} className="text-neutral-400 hover:text-neutral-900 dark:hover:text-white cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {searchQuery && (
              <span className="inline-flex items-center gap-1.5 text-xs bg-white dark:bg-[#1E1E1E] border border-[#D5D0C5] dark:border-[#333] text-neutral-800 dark:text-[#F5F3EF] px-3 py-1 rounded-full shadow-2xs">
                <span>"{searchQuery}"</span>
                <button onClick={() => setSearchQuery('')} className="text-neutral-400 hover:text-neutral-900 dark:hover:text-white cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {priceMax < 300 && (
              <span className="inline-flex items-center gap-1.5 text-xs bg-white dark:bg-[#1E1E1E] border border-[#D5D0C5] dark:border-[#333] text-neutral-800 dark:text-[#F5F3EF] px-3 py-1 rounded-full shadow-2xs">
                <span>Under ${priceMax}</span>
                <button onClick={() => setPriceMax(300)} className="text-neutral-400 hover:text-neutral-900 dark:hover:text-white cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {inStockOnly && (
              <span className="inline-flex items-center gap-1.5 text-xs bg-white dark:bg-[#1E1E1E] border border-[#D5D0C5] dark:border-[#333] text-neutral-800 dark:text-[#F5F3EF] px-3 py-1 rounded-full shadow-2xs">
                <span>In Stock Only</span>
                <button onClick={() => setInStockOnly(false)} className="text-neutral-400 hover:text-neutral-900 dark:hover:text-white cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {onSaleOnly && (
              <span className="inline-flex items-center gap-1.5 text-xs bg-white dark:bg-[#1E1E1E] border border-[#D5D0C5] dark:border-[#333] text-neutral-800 dark:text-[#F5F3EF] px-3 py-1 rounded-full shadow-2xs">
                <span>On Sale</span>
                <button onClick={() => setOnSaleOnly(false)} className="text-neutral-400 hover:text-neutral-900 dark:hover:text-white cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            <button
              onClick={handleResetFilters}
              className="text-xs text-[#C85A32] dark:text-[#E87A54] underline hover:text-[#B34E2A] dark:hover:text-[#F07D53] ml-2 cursor-pointer font-medium"
            >
              Reset All
            </button>
          </div>
        )}

        {/* ========================================================= */}
        {/* 3. TWO-COLUMN LAYOUT (DESKTOP & MOBILE)                   */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Desktop Left Sticky Department Accordion (220px-240px) */}
          <aside className="hidden lg:block lg:col-span-3 sticky top-36 space-y-6">
            
            {/* Department Accordion Box */}
            <div className="bg-white dark:bg-[#161616] border border-[#EAE6DE] dark:border-[#282828] rounded-xl p-5 space-y-4 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-[#F0ECE1] dark:border-[#282828]">
                <h3 className="text-xs font-bold text-neutral-900 dark:text-[#F5F3EF] uppercase tracking-wider font-sans">
                  Departments
                </h3>
                <span className="text-[11px] text-neutral-400 dark:text-neutral-500 font-mono">{departments.length}</span>
              </div>

              <div className="space-y-1">
                {departments.map((dept) => {
                  const isSelected = selectedCategory === dept.id;
                  return (
                    <button
                      key={dept.id}
                      onClick={() => setSelectedCategory(dept.id)}
                      className={`w-full flex items-center justify-between text-xs py-2 px-3 rounded-lg transition-colors cursor-pointer text-left ${
                        isSelected
                          ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-semibold'
                          : 'text-neutral-600 dark:text-[#A8A29E] hover:bg-[#FAF9F6] dark:hover:bg-[#222] hover:text-neutral-900 dark:hover:text-[#F5F3EF]'
                      }`}
                    >
                      <span>{dept.name}</span>
                      <span className={`text-[10px] font-mono ${isSelected ? 'text-neutral-300 dark:text-neutral-700' : 'text-neutral-400'}`}>
                        {dept.count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Price Filter Box */}
            <div className="bg-white dark:bg-[#161616] border border-[#EAE6DE] dark:border-[#282828] rounded-xl p-5 space-y-4 shadow-xs">
              <div className="flex justify-between items-center text-xs font-bold text-neutral-900 dark:text-[#F5F3EF] uppercase tracking-wider font-sans">
                <span>Max Price</span>
                <span className="text-[#C85A32] dark:text-[#E87A54] font-mono">${priceMax}</span>
              </div>
              <input
                type="range"
                min="20"
                max="300"
                step="10"
                value={priceMax}
                onChange={(e) => setPriceMax(Number(e.target.value))}
                className="w-full accent-neutral-900 dark:accent-[#E87A54] cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-neutral-400 dark:text-neutral-500 font-mono">
                <span>$20</span>
                <span>$300+</span>
              </div>
            </div>

            {/* Sort & Availability Filters */}
            <div className="bg-white dark:bg-[#161616] border border-[#EAE6DE] dark:border-[#282828] rounded-xl p-5 space-y-3.5 shadow-xs">
              <h3 className="text-xs font-bold text-neutral-900 dark:text-[#F5F3EF] uppercase tracking-wider font-sans pb-2 border-b border-[#F0ECE1] dark:border-[#282828]">
                Sort Curations
              </h3>
              
              <div className="space-y-1 text-xs">
                {[
                  { value: 'featured', label: 'Featured Curations' },
                  { value: 'bestsellers', label: '⭐ Best Sellers First' },
                  { value: 'price-low', label: 'Price: Low to High' },
                  { value: 'price-high', label: 'Price: High to Low' },
                  { value: 'rating', label: 'Top Rated Pieces' },
                  { value: 'newest', label: 'New Arrivals First' },
                ].map((s) => (
                  <button
                    key={s.value}
                    onClick={() => setSortBy(s.value as any)}
                    className={`w-full flex items-center justify-between text-xs py-1.5 px-2 rounded-md transition-colors cursor-pointer text-left ${
                      sortBy === s.value
                        ? 'font-bold text-neutral-900 dark:text-[#F5F3EF] bg-neutral-100 dark:bg-[#222]'
                        : 'text-neutral-600 dark:text-[#A8A29E] hover:text-neutral-900 dark:hover:text-[#F5F3EF]'
                    }`}
                  >
                    <span>{s.label}</span>
                    {sortBy === s.value && <Check className="w-3.5 h-3.5 text-neutral-900 dark:text-[#F5F3EF]" />}
                  </button>
                ))}
              </div>

              <div className="pt-3 border-t border-[#F0ECE1] dark:border-[#282828] space-y-2">
                <label className="flex items-center gap-2.5 text-xs text-neutral-800 dark:text-[#D5D0C5] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                    className="rounded text-neutral-900 dark:text-white focus:ring-neutral-900 cursor-pointer"
                  />
                  <span>In Stock Pieces Only</span>
                </label>

                <label className="flex items-center gap-2.5 text-xs text-neutral-800 dark:text-[#D5D0C5] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={onSaleOnly}
                    onChange={(e) => setOnSaleOnly(e.target.checked)}
                    className="rounded text-[#C85A32] dark:text-[#E87A54] focus:ring-[#C85A32] cursor-pointer"
                  />
                  <span>On Sale & Reductions</span>
                </label>
              </div>
            </div>

          </aside>

          {/* Product Grid (Mobile 2-column portrait grid / Desktop 3-column) */}
          <main className="lg:col-span-9 space-y-8">
            {filteredProducts.length === 0 ? (
              <div className="bg-white dark:bg-[#161616] border border-[#EAE6DE] dark:border-[#282828] rounded-2xl p-16 text-center space-y-4 shadow-xs">
                <div className="w-16 h-16 rounded-full bg-[#F5F3EF] dark:bg-[#222] flex items-center justify-center text-neutral-400 mx-auto">
                  <ShoppingBag className="w-8 h-8 stroke-[1.2]" />
                </div>
                <h3 className="text-xl font-semibold text-neutral-900 dark:text-[#F5F3EF] font-serif antialiased">
                  No products matched your criteria
                </h3>
                <p className="text-xs text-neutral-500 dark:text-[#A8A29E] max-w-sm mx-auto leading-relaxed">
                  Try adjusting your price ceiling, resetting active categories, or searching with broader terms.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="bg-neutral-900 dark:bg-white hover:bg-neutral-800 dark:hover:bg-neutral-200 text-white dark:text-neutral-900 text-xs font-semibold px-6 py-3 rounded-xl transition-colors cursor-pointer"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <>
                {/* Product Grid: 2-column mobile portrait, 3-column desktop with Framer Motion Stagger */}
                <motion.div
                  key={`${selectedCategory}-${safeCurrentPage}-${sortBy}`}
                  variants={gridContainerVariants}
                  initial="hidden"
                  animate="show"
                  className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-x-6 lg:gap-y-10"
                >
                  {paginatedProducts.map((prod) => (
                    <motion.div key={prod.id} variants={gridItemVariants}>
                      <ProductCard product={prod} />
                    </motion.div>
                  ))}
                </motion.div>

                {/* ========================================================= */}
                {/* 4. SMART LUXURY PAGINATION BAR COMPONENT                  */}
                {/* ========================================================= */}
                {totalPages > 1 && (
                  <div className="pt-10 pb-4 border-t border-[#EAE6DE] dark:border-[#282828] flex flex-col sm:flex-row items-center justify-between gap-4">
                    
                    {/* Catalog Range Indicator */}
                    <span className="text-xs text-neutral-500 dark:text-[#A8A29E] font-sans order-2 sm:order-1">
                      Showing <span className="font-semibold text-neutral-900 dark:text-[#F5F3EF]">{(safeCurrentPage - 1) * itemsPerPage + 1}–{Math.min(safeCurrentPage * itemsPerPage, filteredProducts.length)}</span> of <span className="font-semibold text-neutral-900 dark:text-[#F5F3EF]">{filteredProducts.length}</span> pieces
                    </span>

                    {/* Pagination Numbers & Prev/Next */}
                    <nav className="flex items-center gap-1.5 order-1 sm:order-2" aria-label="Catalog pagination">
                      
                      {/* Prev Button */}
                      <button
                        onClick={() => handlePageChange(safeCurrentPage - 1)}
                        disabled={safeCurrentPage === 1}
                        className="px-3 py-1.5 rounded-full border border-neutral-200 dark:border-[#333] text-xs font-medium text-neutral-700 dark:text-[#D5D0C5] hover:border-neutral-900 dark:hover:border-white hover:text-neutral-900 dark:hover:text-white transition-colors flex items-center gap-1 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                        aria-label="Go to previous page"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Prev</span>
                      </button>

                      {/* Numbered Pills with Ellipsis */}
                      <div className="flex items-center gap-1">
                        {paginationRange.map((page, index) => {
                          if (page === '...') {
                            return (
                              <span key={`ellipsis-${index}`} className="w-8 h-8 flex items-center justify-center text-xs text-neutral-400 dark:text-neutral-500">
                                ...
                              </span>
                            );
                          }
                          const pageNum = Number(page);
                          const isActive = safeCurrentPage === pageNum;
                          return (
                            <button
                              key={`page-${pageNum}`}
                              onClick={() => handlePageChange(pageNum)}
                              aria-current={isActive ? 'page' : undefined}
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all cursor-pointer ${
                                isActive
                                  ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 shadow-xs'
                                  : 'text-neutral-600 dark:text-[#A8A29E] hover:text-neutral-900 dark:hover:text-white hover:bg-white dark:hover:bg-[#222] border border-transparent hover:border-neutral-200 dark:hover:border-[#333]'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                      </div>

                      {/* Next Button */}
                      <button
                        onClick={() => handlePageChange(safeCurrentPage + 1)}
                        disabled={safeCurrentPage === totalPages}
                        className="px-3 py-1.5 rounded-full border border-neutral-200 dark:border-[#333] text-xs font-medium text-neutral-700 dark:text-[#D5D0C5] hover:border-neutral-900 dark:hover:border-white hover:text-neutral-900 dark:hover:text-white transition-colors flex items-center gap-1 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                        aria-label="Go to next page"
                      >
                        <span className="hidden sm:inline">Next</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>

                    </nav>

                  </div>
                )}
              </>
            )}
          </main>

        </div>

      </div>

      {/* ========================================================= */}
      {/* 5. MOBILE BOTTOM SLIDE-UP FILTER & SORT DRAWER            */}
      {/* ========================================================= */}
      <AnimatePresence>
        {isMobileFilterOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end">
            
            {/* Backdrop with Smooth Fade */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setIsMobileFilterOpen(false)} 
              className="absolute inset-0 bg-neutral-900/40 backdrop-blur-xs"
            />

            {/* Bottom Sheet Drawer with Smooth Spring/Easing */}
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="relative bg-white rounded-t-3xl shadow-2xl max-h-[85vh] flex flex-col overflow-hidden z-10"
            >
              
              {/* Drawer Header */}
              <div className="p-4 sm:p-5 border-b border-[#F0ECE1] flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-neutral-900 font-sans">Filter & Sort Catalog</h3>
                  <p className="text-xs text-neutral-500">Refine {filteredProducts.length} pieces by category, price, and attributes</p>
                </div>
                <button 
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="p-2 text-neutral-400 hover:text-neutral-900 rounded-full hover:bg-neutral-100 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Scrollable Body */}
              <div className="p-5 space-y-6 overflow-y-auto flex-1 text-xs">
                
                {/* Department Accordion Chips */}
                <div className="space-y-2">
                  <label className="font-bold text-neutral-900 uppercase tracking-wider block">
                    Select Department
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {departments.map((dept) => {
                      const isSelected = selectedCategory === dept.id;
                      return (
                        <button
                          key={dept.id}
                          onClick={() => setSelectedCategory(dept.id)}
                          className={`p-2.5 rounded-xl border text-xs font-medium text-left transition-all flex items-center justify-between cursor-pointer ${
                            isSelected
                              ? 'bg-neutral-900 text-white border-neutral-900 shadow-xs'
                              : 'bg-[#FAF9F6] text-neutral-700 border-[#EAE6DE]'
                          }`}
                        >
                          <span className="truncate">{dept.name}</span>
                          <span className={`text-[10px] font-mono ${isSelected ? 'text-neutral-300' : 'text-neutral-400'}`}>
                            {dept.count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Sort By Radios */}
                <div className="space-y-2">
                  <label className="font-bold text-neutral-900 uppercase tracking-wider block">
                    Sort Order
                  </label>
                  <div className="grid grid-cols-1 gap-1.5">
                    {[
                      { value: 'featured', label: 'Featured Curations' },
                      { value: 'bestsellers', label: '⭐ Best Sellers First' },
                      { value: 'price-low', label: 'Price: Low to High' },
                      { value: 'price-high', label: 'Price: High to Low' },
                      { value: 'rating', label: 'Top Customer Rated' },
                      { value: 'newest', label: 'New Arrivals' },
                    ].map((s) => (
                      <button
                        key={s.value}
                        onClick={() => setSortBy(s.value as any)}
                        className={`p-2.5 rounded-xl border text-xs font-medium text-left flex items-center justify-between cursor-pointer ${
                          sortBy === s.value
                            ? 'border-neutral-900 bg-neutral-900 text-white font-semibold'
                            : 'border-[#EAE6DE] bg-white text-neutral-700'
                        }`}
                      >
                        <span>{s.label}</span>
                        {sortBy === s.value && <Check className="w-4 h-4 text-white" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Range Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center font-bold text-neutral-900 uppercase tracking-wider">
                    <span>Price Ceiling</span>
                    <span className="text-[#C85A32] font-mono text-sm">${priceMax}</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="300"
                    step="10"
                    value={priceMax}
                    onChange={(e) => setPriceMax(Number(e.target.value))}
                    className="w-full accent-neutral-900 cursor-pointer"
                  />
                  <div className="flex justify-between text-[11px] text-neutral-400 font-mono">
                    <span>$20</span>
                    <span>$300+</span>
                  </div>
                </div>

                {/* Toggles */}
                <div className="space-y-2 pt-2 border-t border-[#F0ECE1]">
                  <label className="flex items-center justify-between p-3 bg-[#FAF9F6] border border-[#EAE6DE] rounded-xl cursor-pointer">
                    <span className="font-medium text-neutral-800">In Stock Items Only</span>
                    <input
                      type="checkbox"
                      checked={inStockOnly}
                      onChange={(e) => setInStockOnly(e.target.checked)}
                      className="rounded text-neutral-900 focus:ring-neutral-900 w-4 h-4 cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 bg-[#FAF9F6] border border-[#EAE6DE] rounded-xl cursor-pointer">
                    <span className="font-medium text-neutral-800">On Sale & Reductions</span>
                    <input
                      type="checkbox"
                      checked={onSaleOnly}
                      onChange={(e) => setOnSaleOnly(e.target.checked)}
                      className="rounded text-[#C85A32] focus:ring-[#C85A32] w-4 h-4 cursor-pointer"
                    />
                  </label>
                </div>

              </div>

              {/* Drawer Footer Actions */}
              <div className="p-4 bg-white border-t border-[#F0ECE1] flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="py-3 px-4 border border-neutral-300 hover:bg-neutral-100 text-neutral-800 font-bold rounded-xl text-xs uppercase tracking-wider cursor-pointer"
                >
                  Reset
                </button>
                
                <button
                  type="button"
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="flex-1 bg-neutral-900 hover:bg-neutral-800 text-white py-3 px-4 font-bold rounded-xl text-xs uppercase tracking-wider shadow-md transition-colors cursor-pointer text-center"
                >
                  Apply Filters ({filteredProducts.length} Pieces)
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
export default ShopCatalogView;
