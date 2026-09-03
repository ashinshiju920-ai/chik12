import React, { useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import { ArrowUpRight, Compass } from 'lucide-react';
import { CategoryType } from '../../types';

export const CategoryGrid: React.FC = () => {
  const { setActivePage, setSelectedCategory, products, categories } = useStore();

  const handleCategoryClick = (categoryKey?: string) => {
    if (categoryKey) {
      setSelectedCategory(categoryKey as CategoryType);
    } else {
      setSelectedCategory('all');
    }
    setActivePage('shop');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Filter featured categories (or all sorted by orderIndex)
  const displayCategories = useMemo(() => {
    const featuredList = categories.filter((c) => c.featured);
    const list = featuredList.length > 0 ? featuredList : categories;
    return list.slice(0, 6);
  }, [categories]);

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12 border-b border-[#EAE6DE] pb-6">
        <div>
          <div className="flex items-center gap-2 font-sans text-[11px] font-semibold text-[#C85A32] uppercase tracking-[0.22em] mb-2">
            <Compass className="w-3.5 h-3.5" />
            <span>Curated Departments</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif font-medium text-[#1F1F1F] dark:text-white tracking-tight">
            Design-Forward Categories
          </h2>
        </div>
        <button
          onClick={() => handleCategoryClick('all')}
          className="font-sans text-xs font-semibold text-[#1F1F1F] dark:text-[#EAEAEA] hover:text-[#C85A32] uppercase tracking-[0.18em] flex items-center gap-1.5 self-start md:self-auto cursor-pointer transition-colors group"
        >
          <span>Explore All Collections</span>
          <ArrowUpRight className="w-4 h-4 text-[#C85A32] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </button>
      </div>

      {/* Grid of Editorial Category Tiles (Live Firestore onSnapshot Sync) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
        {displayCategories.map((cat, index) => {
          const categoryKey = cat.key || cat.id;
          const count = products.filter((p) => p.category === categoryKey).length || 2;
          const imageUrl = cat.imageUrl || cat.image || 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=1000&auto=format&fit=crop';
          const badge = cat.badgeText || (cat.featured ? 'Featured on Home' : (categoryKey.toUpperCase() || 'COLLECTION'));
          
          // Layout sizing based on index for balanced editorial rhythm
          let colSpan = 'lg:col-span-3';
          let minHeight = 'min-h-[280px]';
          if (index === 0) {
            colSpan = 'lg:col-span-6 lg:row-span-2';
            minHeight = 'min-h-[440px]';
          } else if (index === 1) {
            colSpan = 'lg:col-span-6';
            minHeight = 'min-h-[280px]';
          } else if (index >= 4) {
            colSpan = 'lg:col-span-6';
            minHeight = 'min-h-[280px]';
          }

          return (
            <div
              key={cat.id}
              onClick={() => handleCategoryClick(categoryKey)}
              className={`group relative overflow-hidden bg-[#EAE6DE] rounded-xs cursor-pointer shadow-xs transition-all duration-500 hover:shadow-xl ${minHeight} ${colSpan}`}
            >
              {/* Background Image with Zoom on Hover */}
              <img
                src={imageUrl}
                alt={cat.name}
                className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
              />

              {/* Editorial Multi-Stop Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10 transition-opacity duration-300"></div>

              {/* Top Pill: Department Collection / Badge Text */}
              <div className="absolute top-5 left-5 z-10">
                <span className="inline-flex items-center gap-1.5 bg-black/40 backdrop-blur-md text-white border border-white/20 font-sans text-[10px] font-semibold uppercase tracking-[0.2em] px-3 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C85A32]"></span>
                  {badge}
                </span>
              </div>

              {/* Bottom Content Area */}
              <div className="absolute bottom-6 inset-x-6 z-10 flex flex-col justify-end text-white">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <span className="font-sans text-[11px] uppercase tracking-[0.22em] font-semibold text-neutral-300 block mb-1.5">
                      {count} curated items
                    </span>
                    <h3 className="font-serif font-medium tracking-tight text-white text-2xl lg:text-3xl leading-snug group-hover:text-[#F3ECE1] transition-colors">
                      {cat.name}
                    </h3>
                    <p className="font-sans text-sm font-normal text-neutral-300/90 leading-relaxed max-w-sm mt-1.5 hidden sm:block">
                      {cat.description || cat.quote || cat.tagline}
                    </p>
                  </div>

                  <div className="w-10 h-10 shrink-0 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white group-hover:bg-[#C85A32] group-hover:border-[#C85A32] flex items-center justify-center transition-all duration-300 shadow-sm">
                    <ArrowUpRight className="w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
