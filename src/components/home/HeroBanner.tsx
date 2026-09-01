import React from 'react';
import { useStore } from '../../context/StoreContext';
import { ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

export const HeroBanner: React.FC = () => {
  const { setActivePage, setSelectedCategory, siteBanners } = useStore();

  const handleShopNow = () => {
    setSelectedCategory('all');
    setActivePage('shop');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const heroImage = siteBanners?.heroImage || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1200&auto=format&fit=crop';
  const heroTitle = siteBanners?.heroTitle || 'Enhancing your inner beauty.';
  const heroSubtitle = siteBanners?.heroSubtitle || 'Discover curated runway silhouettes, sustainable bio-acetate optics, and bespoke handcrafted couture essentials designed for the bold modern visionary.';

  return (
    <section className="relative w-full bg-[#C85A32] overflow-hidden">
      {/* Subtle background circles for organic aesthetic */}
      <div className="absolute top-10 left-12 w-64 h-64 rounded-full bg-white/5 blur-2xl pointer-events-none"></div>
      <div className="absolute bottom-10 left-1/3 w-80 h-80 rounded-full bg-black/10 blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 min-h-[540px] lg:min-h-[620px]">
        
        {/* Left: Burnt Orange Copy with Script Overlay */}
        <div className="lg:col-span-6 flex flex-col justify-center px-6 sm:px-12 lg:px-16 py-16 lg:py-24 text-white z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-4 max-w-xl"
          >
            {/* Eyebrow department accent */}
            <div className="flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-white/80 font-accent">
              <Sparkles className="w-4 h-4 text-white" />
              <span>Diva'Chik Couture · Autumn / Winter Drop</span>
            </div>

            {/* Editorial Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-normal tracking-tight leading-tight font-brand text-white">
              {heroTitle}
            </h1>

            {/* Sub-copy */}
            <p className="text-sm sm:text-base text-white/85 max-w-md font-light leading-relaxed pt-2">
              {heroSubtitle}
            </p>

            {/* CTA Button */}
            <div className="pt-6">
              <button
                id="hero-shop-now-button"
                onClick={handleShopNow}
                className="bg-white hover:bg-[#F9F8F6] text-[#1F1F1F] font-semibold text-xs tracking-widest uppercase px-8 py-4 rounded-xs shadow-lg hover:shadow-xl transition-all duration-200 inline-flex items-center gap-2.5 cursor-pointer group"
              >
                <span>SHOP NOW</span>
                <ArrowRight className="w-4 h-4 text-[#C85A32] group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>
        </div>

        {/* Right: Lifestyle Photo */}
        <div className="lg:col-span-6 relative min-h-[380px] lg:min-h-full">
          <div className="w-full h-full relative overflow-hidden">
            <img
              src={heroImage}
              alt="Diva'Chik Runway & Lifestyle Model"
              className="w-full h-full object-cover object-center lg:object-right"
              loading="eager"
            />
            {/* Soft gradient blend for small screens */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#C85A32] via-transparent to-transparent lg:hidden"></div>
          </div>
        </div>

      </div>
    </section>
  );
};
