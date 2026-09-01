import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { Compass, X, ArrowUpRight, Sparkles, SlidersHorizontal, Check } from 'lucide-react';
import { CategoryType } from '../../types';

export const FloatingCatalogPopup: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { setActivePage, selectedCategory, setSelectedCategory, products } = useStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const departments = [
    {
      id: 'all' as CategoryType,
      title: 'Full Archive',
      subtitle: 'Browse all active collections and seasonal releases',
      badge: 'COMPLETE STORE',
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=600&auto=format&fit=crop',
      count: products.length
    },
    {
      id: 'backpack' as CategoryType,
      title: 'Backpacks & Bags',
      subtitle: 'Waxed canvas & vegetable-tanned leather rucksacks',
      badge: 'TRAVEL & CARRY',
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=600&auto=format&fit=crop',
      count: products.filter((p) => p.category === 'backpack').length
    },
    {
      id: 'shoes' as CategoryType,
      title: 'Footwear & Boots',
      subtitle: 'Waterproof heritage boots & custom trail soles',
      badge: 'HANDCRAFTED',
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600&auto=format&fit=crop',
      count: products.filter((p) => p.category === 'shoes').length
    },
    {
      id: 'glasses' as CategoryType,
      title: 'Optics & Eyewear',
      subtitle: 'Bio-acetate frames with CR-39 anti-glare lenses',
      badge: 'STUDIO OPTICS',
      image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?q=80&w=600&auto=format&fit=crop',
      count: products.filter((p) => p.category === 'glasses').length
    },
    {
      id: 'hats' as CategoryType,
      title: 'Headwear & Caps',
      subtitle: 'Washed organic twill & low-profile silhouettes',
      badge: 'URBAN ESSENTIALS',
      image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?q=80&w=600&auto=format&fit=crop',
      count: products.filter((p) => p.category === 'hats').length
    },
    {
      id: 'apparel' as CategoryType,
      title: 'Apparel & Outerwear',
      subtitle: 'Heavyweight organic cottons & technical jackets',
      badge: 'READY-TO-WEAR',
      image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=600&auto=format&fit=crop',
      count: products.filter((p) => p.category === 'apparel').length
    }
  ];

  const handleSelect = (categoryId: CategoryType) => {
    setSelectedCategory(categoryId);
    setActivePage('shop');
    setIsOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* Floating Round Trigger Button */}
      <aside aria-label="Catalog quick navigation" className="fixed bottom-20 left-4 md:bottom-6 md:left-6 z-40">
        <button
          id="floating-catalog-button"
          onClick={() => setIsOpen(!isOpen)}
          className={`group relative flex items-center justify-center w-13 h-13 sm:w-14 sm:h-14 rounded-full shadow-2xl transition-all duration-300 cursor-pointer active:scale-95 ${
            isOpen
              ? 'bg-[#1F1F1F] text-white rotate-90 scale-105'
              : 'bg-[#C85A32] hover:bg-[#B34E2A] text-white hover:scale-105 shadow-[0_8px_25px_rgba(200,90,50,0.35)]'
          }`}
          aria-label="Open Catalog Directory"
          title="Browse Catalogs & Departments"
        >
          {isOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <>
              {/* Outer gentle ripple ring */}
              <span className="absolute -inset-1 rounded-full bg-[#C85A32]/30 animate-ping pointer-events-none opacity-75"></span>
              <Compass className="w-6 h-6 transition-transform duration-300 group-hover:rotate-45" />
            </>
          )}

          {/* Floating Tooltip Label */}
          {!isOpen && (
            <span className="absolute left-16 top-1/2 -translate-y-1/2 bg-[#1F1F1F] text-white text-[11px] font-semibold tracking-wider uppercase px-3 py-1.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap hidden sm:inline-flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-[#C85A32]" />
              <span>Explore Catalogs</span>
            </span>
          )}
        </button>
      </aside>

      {/* Floating Round Popup Modal / Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          {/* Backdrop click dismiss */}
          <div className="absolute inset-0" onClick={() => setIsOpen(false)}></div>

          {/* Modal Container */}
          <div className="relative z-10 w-full max-w-2xl bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden max-h-[85vh] sm:max-h-[88vh] flex flex-col border border-[#EAE6DE] animate-scaleUp">
            {/* Mobile drag handle bar */}
            <div className="w-12 h-1.5 bg-[#D5D0C5] rounded-full mx-auto my-2.5 sm:hidden"></div>

            {/* Header */}
            <div className="px-5 sm:px-6 py-4 sm:py-5 bg-[#FAF9F6] border-b border-[#EAE6DE] flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-[#C85A32] uppercase tracking-widest font-accent">
                  <Compass className="w-4 h-4" />
                  <span>Curated Departments</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-normal text-[#1F1F1F] font-display mt-0.5">
                  Browse Catalog Directory
                </h3>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="w-9 h-9 rounded-full bg-white border border-[#EAE6DE] hover:bg-[#EAE6DE] text-[#1F1F1F] flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Close catalog popup"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Catalog Grid Cards */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {departments.map((dept) => {
                  const isSelected = selectedCategory === dept.id;
                  return (
                    <div
                      key={dept.id}
                      onClick={() => handleSelect(dept.id)}
                      className={`group relative flex items-center gap-3.5 p-3 rounded-xl border cursor-pointer transition-all duration-300 hover:shadow-md ${
                        isSelected
                          ? 'border-[#C85A32] bg-[#FAF1ED]/50 ring-1 ring-[#C85A32]'
                          : 'border-[#EAE6DE] bg-white hover:border-[#C85A32]/50 hover:bg-[#FAF9F6]'
                      }`}
                    >
                      {/* Image Thumbnail */}
                      <div className="relative w-16 h-16 sm:w-18 sm:h-18 rounded-lg overflow-hidden shrink-0 bg-[#EAE6DE]">
                        <img
                          src={dept.image}
                          alt={dept.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-black/10"></div>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <span className="text-[9px] font-bold font-accent text-[#C85A32] tracking-wider uppercase">
                            {dept.badge}
                          </span>
                          <span className="text-[10px] text-[#8C8477] font-mono">
                            {dept.count} items
                          </span>
                        </div>
                        <h4 className="text-sm font-semibold text-[#1F1F1F] font-modern truncate group-hover:text-[#C85A32] transition-colors">
                          {dept.title}
                        </h4>
                        <p className="text-[11px] text-[#6E675D] line-clamp-1 mt-0.5 font-sans-clean">
                          {dept.subtitle}
                        </p>
                      </div>

                      {/* Action Icon */}
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                        isSelected
                          ? 'bg-[#C85A32] text-white'
                          : 'bg-[#F5F3EF] text-[#1F1F1F] group-hover:bg-[#C85A32] group-hover:text-white'
                      }`}>
                        {isSelected ? (
                          <Check className="w-3.5 h-3.5" />
                        ) : (
                          <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer Quick Action */}
            <div className="px-6 py-4 bg-[#FAF9F6] border-t border-[#EAE6DE] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <span className="text-[#6E675D]">
                Showing curated luxury collections with instant INR pricing.
              </span>
              <button
                onClick={() => handleSelect('all')}
                className="w-full sm:w-auto px-5 py-2.5 bg-[#1F1F1F] hover:bg-[#C85A32] text-white font-semibold rounded-xs tracking-wider uppercase text-xs transition-colors cursor-pointer text-center"
              >
                Open Full Catalog View
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
