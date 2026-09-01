import React from 'react';
import { useStore } from '../../context/StoreContext';
import { ArrowUpRight, Sparkles, Compass } from 'lucide-react';
import { CategoryType } from '../../types';

export const CategoryGrid: React.FC = () => {
  const { setActivePage, setSelectedCategory, products, siteBanners } = useStore();

  const handleCategoryClick = (category: CategoryType) => {
    setSelectedCategory(category);
    setActivePage('shop');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const categories = [
    {
      id: 'backpack' as CategoryType,
      collection: 'LEATHER & CANVAS',
      title: 'Backpacks & Rucksacks',
      subtitle: 'Water-resistant waxed canvas & vegetable-tanned details',
      image: siteBanners?.backpackCatImage || 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=1000&auto=format&fit=crop',
      colSpan: 'lg:col-span-6 lg:row-span-2',
      minHeight: 'min-h-[420px]',
      count: products.filter((p) => p.category === 'backpack').length || 3
    },
    {
      id: 'shoes' as CategoryType,
      collection: 'HERITAGE CRAFT',
      title: 'Handcrafted Footwear',
      subtitle: 'Seam-sealed nubuck & custom Vibram lug outsoles',
      image: siteBanners?.footwearCatImage || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1000&auto=format&fit=crop',
      colSpan: 'lg:col-span-6',
      minHeight: 'min-h-[260px]',
      count: products.filter((p) => p.category === 'shoes').length || 2
    },
    {
      id: 'glasses' as CategoryType,
      collection: 'STUDIO OPTICS',
      title: 'Eyewear & Frames',
      subtitle: 'Mazzucchelli bio-acetate & anti-glare CR-39 lenses',
      image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?q=80&w=1000&auto=format&fit=crop',
      colSpan: 'lg:col-span-3',
      minHeight: 'min-h-[260px]',
      count: products.filter((p) => p.category === 'glasses').length || 2
    },
    {
      id: 'hats' as CategoryType,
      collection: 'URBAN ESSENTIALS',
      title: 'Headwear & Caps',
      subtitle: 'Washed organic twill with low-profile tailoring',
      image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?q=80&w=1000&auto=format&fit=crop',
      colSpan: 'lg:col-span-3',
      minHeight: 'min-h-[260px]',
      count: products.filter((p) => p.category === 'hats').length || 2
    }
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12 border-b border-[#EAE6DE] pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#C85A32] uppercase tracking-widest mb-1.5 font-accent">
            <Compass className="w-3.5 h-3.5" />
            <span>Curated Departments</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-normal text-[#1F1F1F] font-display tracking-tight">
            Design-Forward Categories
          </h2>
        </div>
        <button
          onClick={() => {
            setSelectedCategory('all');
            setActivePage('shop');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="text-xs font-semibold text-[#1F1F1F] hover:text-[#C85A32] uppercase tracking-wider flex items-center gap-1.5 self-start md:self-auto cursor-pointer transition-colors group"
        >
          <span>Explore All Collections</span>
          <ArrowUpRight className="w-4 h-4 text-[#C85A32] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </button>
      </div>

      {/* Grid of Editorial Category Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
        {categories.map((cat) => (
          <div
            key={cat.id}
            onClick={() => handleCategoryClick(cat.id)}
            className={`group relative overflow-hidden bg-[#EAE6DE] rounded-xs cursor-pointer shadow-xs transition-all duration-500 hover:shadow-xl ${cat.minHeight} ${cat.colSpan}`}
          >
            {/* Background Image with Zoom on Hover */}
            <img
              src={cat.image}
              alt={cat.title}
              className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
              loading="lazy"
            />

            {/* Editorial Multi-Stop Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10 transition-opacity duration-300"></div>

            {/* Top Pill: Department Collection */}
            <div className="absolute top-5 left-5 z-10">
              <span className="inline-flex items-center gap-1.5 bg-black/40 backdrop-blur-md text-white border border-white/20 text-[10px] font-accent uppercase tracking-widest px-3 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C85A32]"></span>
                {cat.collection}
              </span>
            </div>

            {/* Bottom Content Area */}
            <div className="absolute bottom-6 inset-x-6 z-10 flex flex-col justify-end text-white">
              <div className="flex items-end justify-between gap-3">
                <div>
                  <span className="text-[11px] text-white/70 font-mono tracking-wider block mb-1">
                    {cat.count} curated items
                  </span>
                  <h3 className="text-xl sm:text-2xl font-normal font-display text-white group-hover:text-[#F3ECE1] transition-colors">
                    {cat.title}
                  </h3>
                  <p className="text-xs text-white/80 line-clamp-1 mt-1 font-sans-clean max-w-md hidden sm:block">
                    {cat.subtitle}
                  </p>
                </div>

                <div className="w-10 h-10 shrink-0 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white group-hover:bg-[#C85A32] group-hover:border-[#C85A32] flex items-center justify-center transition-all duration-300">
                  <ArrowUpRight className="w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
