import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { ProductCard } from '../shop/ProductCard';
import { ArrowRight, Sparkles } from 'lucide-react';

export const ProductGrids: React.FC = () => {
  const { products, setActivePage, setSelectedCategory } = useStore();
  const [activeTab, setActiveTab] = useState<'all' | 'new' | 'featured' | 'eyewear'>('all');

  const newArrivals = products.filter((p) => p.isNewArrival || p.id === 'prod-1' || p.id === 'prod-2' || p.id === 'prod-3' || p.id === 'prod-4');
  const featuredItems = products.filter((p) => p.isFeatured || p.id === 'prod-5' || p.id === 'prod-2' || p.id === 'prod-4' || p.id === 'prod-3');
  const trendingEyewear = products.filter((p) => p.category === 'glasses' || p.isTrendingEyewear);

  const displayedProducts = 
    activeTab === 'new' ? newArrivals :
    activeTab === 'featured' ? featuredItems :
    activeTab === 'eyewear' ? trendingEyewear :
    products.slice(0, 8);

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
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12 border-b border-[#EAE6DE] pb-6">
        <div>
          <h2 className="text-3xl font-semibold text-[#1F1F1F] font-editorial tracking-tight text-center md:text-left">
            Curated Collections
          </h2>
          <p className="text-xs text-[#827A6D] mt-1 text-center md:text-left">
            Minimalist Nordic apparel, optics, and handcrafted accessories.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 bg-[#EFECE6] p-1 rounded-xs text-xs font-medium">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-1.5 rounded-xs transition-all cursor-pointer ${
              activeTab === 'all'
                ? 'bg-white text-[#1F1F1F] font-semibold shadow-xs'
                : 'text-[#696256] hover:text-[#1F1F1F]'
            }`}
          >
            All Products
          </button>
          <button
            onClick={() => setActiveTab('new')}
            className={`px-3.5 py-1.5 rounded-xs transition-all cursor-pointer ${
              activeTab === 'new'
                ? 'bg-white text-[#1F1F1F] font-semibold shadow-xs'
                : 'text-[#696256] hover:text-[#1F1F1F]'
            }`}
          >
            New Arrivals
          </button>
          <button
            onClick={() => setActiveTab('featured')}
            className={`px-3.5 py-1.5 rounded-xs transition-all cursor-pointer ${
              activeTab === 'featured'
                ? 'bg-white text-[#1F1F1F] font-semibold shadow-xs'
                : 'text-[#696256] hover:text-[#1F1F1F]'
            }`}
          >
            Featured Items
          </button>
          <button
            onClick={() => setActiveTab('eyewear')}
            className={`px-3.5 py-1.5 rounded-xs transition-all cursor-pointer ${
              activeTab === 'eyewear'
                ? 'bg-white text-[#1F1F1F] font-semibold shadow-xs'
                : 'text-[#696256] hover:text-[#1F1F1F]'
            }`}
          >
            Trending Eyewear
          </button>
        </div>
      </div>

      {/* 4-Column Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {displayedProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* View All Button */}
      <div className="mt-12 text-center">
        <button
          onClick={handleViewAll}
          className="inline-flex items-center gap-2 bg-[#1F1F1F] hover:bg-[#C85A32] text-white text-xs font-semibold tracking-widest uppercase px-8 py-3.5 rounded-xs transition-colors cursor-pointer"
        >
          <span>VIEW FULL CATALOG</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </section>
  );
};
