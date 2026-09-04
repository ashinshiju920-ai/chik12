import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { ProductCard } from '../shop/ProductCard';
import { ArrowRight, Sparkles } from 'lucide-react';
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

export const ProductGrids: React.FC = () => {
  const { products, setActivePage, setSelectedCategory } = useStore();
  const [activeTab, setActiveTab] = useState<'all' | 'bestsellers' | 'new' | 'featured' | 'eyewear'>('all');

  // Strictly order products by admin displayRank priority
  const sortedProducts = [...products].sort((a, b) => (a.displayRank ?? 9999) - (b.displayRank ?? 9999));

  const bestSellers = sortedProducts.filter((p) => p.isBestSeller || (p.recentPurchasesCount && p.recentPurchasesCount > 20));
  const newArrivals = sortedProducts.filter((p) => p.isNewArrival || p.isNew || p.id === 'prod-1' || p.id === 'prod-2');
  const featuredItems = sortedProducts.filter((p) => p.isFeatured || p.id === 'prod-5' || p.id === 'prod-3');
  const trendingEyewear = sortedProducts.filter((p) => p.category === 'glasses' || p.isTrendingEyewear);

  const displayedProducts = 
    activeTab === 'bestsellers' ? (bestSellers.length > 0 ? bestSellers.slice(0, 8) : sortedProducts.slice(0, 8)) :
    activeTab === 'new' ? (newArrivals.length > 0 ? newArrivals.slice(0, 8) : sortedProducts.slice(0, 8)) :
    activeTab === 'featured' ? (featuredItems.length > 0 ? featuredItems.slice(0, 8) : sortedProducts.slice(0, 8)) :
    activeTab === 'eyewear' ? (trendingEyewear.length > 0 ? trendingEyewear.slice(0, 8) : sortedProducts.slice(0, 8)) :
    sortedProducts.slice(0, 8);

  const tabs: { id: 'all' | 'bestsellers' | 'new' | 'featured' | 'eyewear'; label: string }[] = [
    { id: 'all', label: 'All Curations' },
    { id: 'bestsellers', label: '⭐ Best Sellers' },
    { id: 'new', label: 'New Arrivals' },
    { id: 'featured', label: 'Featured Pieces' },
    { id: 'eyewear', label: 'Optics' },
  ];

  const handleViewAll = () => {
    if (activeTab === 'eyewear') {
      setSelectedCategory('glasses');
    } else {
      setSelectedCategory('all');
    }
    setActivePage('shop');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      {/* Section Heading & Tabs */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12 border-b border-[#EAE6DE] dark:border-[#282828] pb-6">
        <div>
          <h2 className="text-3xl font-serif font-medium font-black-white-border tracking-tight text-center md:text-left antialiased">
            Curated Collections
          </h2>
          <p className="font-sans text-xs text-[#6E685F] dark:text-[#A8A29E] mt-1 text-center md:text-left">
            Minimalist Nordic apparel, optics, and handcrafted accessories.
          </p>
        </div>

        {/* Tab Switcher with sliding layoutId indicator */}
        <div className="flex items-center gap-1.5 bg-[#EFECE6] dark:bg-[#1E1E1E] p-1 rounded-full text-xs font-medium relative overflow-x-auto no-scrollbar max-w-full">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-4 py-1.5 rounded-full transition-all cursor-pointer ${
                  isActive
                    ? 'text-[#1A1918] dark:text-[#F5F3EF] font-semibold'
                    : 'text-[#696256] dark:text-[#A8A29E] hover:text-[#1A1918] dark:hover:text-[#F5F3EF]'
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="homeProductTab"
                    className="absolute inset-0 rounded-full bg-white dark:bg-[#2C2C2C] shadow-xs"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4-Column Product Grid with Framer Motion Stagger */}
      <motion.div
        key={activeTab}
        variants={gridContainerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {displayedProducts.map((product) => (
          <motion.div key={product.id} variants={gridItemVariants}>
            <ProductCard product={product} />
          </motion.div>
        ))}
      </motion.div>

      {/* View All Button */}
      <div className="mt-12 text-center">
        <button
          onClick={handleViewAll}
          className="inline-flex items-center gap-2 bg-[#1A1918] dark:bg-[#F5F3EF] hover:bg-[#C85A32] dark:hover:bg-[#E87A54] text-white dark:text-[#1A1918] dark:hover:text-white text-xs font-semibold tracking-widest uppercase px-8 py-3.5 rounded-xs transition-colors cursor-pointer"
        >
          <span>VIEW FULL CATALOG</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </section>
  );
};
