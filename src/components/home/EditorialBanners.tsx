import React from 'react';
import { useStore } from '../../context/StoreContext';
import { ArrowRight, Sparkles } from 'lucide-react';

export const EditorialBanners: React.FC = () => {
  const { setActivePage, setSelectedCategory, siteBanners } = useStore();

  const handleEyewearClick = () => {
    setSelectedCategory('glasses');
    setActivePage('shop');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleApparelClick = () => {
    setSelectedCategory('apparel');
    setActivePage('shop');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const editorialImage = siteBanners?.editorialImage || 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1200&auto=format&fit=crop';
  const editorialTitle = siteBanners?.editorialTitle || 'KEEP CALM & STAY CLASSY';
  const editorialSubtitle = siteBanners?.editorialSubtitle || 'Understated craftsmanship, tactile fabrics, and effortless silhouettes designed to transition seamlessly from Copenhagen rain to urban nightfall.';

  const eyewearImage = siteBanners?.eyewearImage || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1000&auto=format&fit=crop';
  const eyewearTitle = siteBanners?.eyewearTitle || 'Trending Eyewear';
  const eyewearSubtitle = siteBanners?.eyewearSubtitle || 'Largest collection of genuine quality prescription glasses frames, handmade bio-acetates, and Japanese titanium hinge optics.';

  return (
    <div className="space-y-16 py-12">
      
      {/* 1. KEEP CALM & STAY CLASSY Split High-Contrast Banner (Page 6) */}
      <section className="relative w-full bg-[#1F1F1F] text-white overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 min-h-[460px]">
          <div className="lg:col-span-6 flex flex-col justify-center px-8 sm:px-14 py-16 z-10">
            <span className="font-sans text-[11px] font-semibold tracking-[0.22em] text-[#C85A32] uppercase mb-3">
              Nordic Philosophy
            </span>
            <h2 className="text-4xl sm:text-5xl font-serif font-medium tracking-tight leading-[1.15] mb-4 text-white">
              {editorialTitle}
            </h2>
            <p className="font-sans text-sm text-white/80 leading-relaxed max-w-md font-normal mb-8">
              {editorialSubtitle}
            </p>
            <div>
              <button
                onClick={handleApparelClick}
                className="inline-flex items-center gap-2 border border-white hover:border-[#C85A32] bg-transparent hover:bg-[#C85A32] text-white font-sans text-xs font-semibold tracking-[0.2em] uppercase px-7 py-3.5 rounded-xs transition-colors cursor-pointer"
              >
                <span>EXPLORE EDITORIAL</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="lg:col-span-6 relative min-h-[320px] lg:min-h-full">
            <img
              src={editorialImage}
              alt="Editorial Man Streetwear"
              className="w-full h-full object-cover object-center"
              loading="lazy"
            />
          </div>
        </div>
      </section>

      {/* 2. Trending Eyewear Banner (Page 7) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-[#161616] border border-[#EBE8E2] dark:border-[#282828] rounded-xs overflow-hidden grid grid-cols-1 md:grid-cols-12 shadow-xs">
          
          <div className="md:col-span-6 relative min-h-[340px]">
            <img
              src={eyewearImage}
              alt="Trending Eyewear Model"
              className="w-full h-full object-cover object-center"
              loading="lazy"
            />
          </div>

          <div className="md:col-span-6 flex flex-col justify-center items-center text-center p-8 sm:p-14 bg-[#FAF9F6] dark:bg-[#161616]">
            <span className="font-sans text-[11px] font-semibold text-[#C85A32] dark:text-[#E87A54] uppercase tracking-[0.22em] mb-2">
              #glasses #optics
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-medium text-[#1A1918] dark:text-[#F5F3EF] tracking-tight mb-3 antialiased">
              {eyewearTitle}
            </h2>
            <p className="font-sans text-sm text-[#6E685F] dark:text-[#A8A29E] max-w-md mb-6 leading-relaxed font-normal">
              {eyewearSubtitle}
            </p>
            <button
              onClick={handleEyewearClick}
              className="underline font-sans font-semibold text-xs text-[#1A1918] dark:text-[#EAE6DE] hover:text-[#C85A32] dark:hover:text-[#E87A54] transition-colors cursor-pointer uppercase tracking-[0.18em]"
            >
              View Collection
            </button>
          </div>

        </div>
      </section>

      {/* 3. Weekend Collective & It's Cold Outside Twin Editorial Tiles (Page 8) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Tile A: Weekend Collective */}
          <div className="bg-white dark:bg-[#161616] border border-[#EBE8E2] dark:border-[#282828] rounded-xs overflow-hidden flex flex-col group">
            <div className="relative aspect-[4/3] overflow-hidden bg-[#F5F3EF] dark:bg-[#1E1E1E]">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1000&auto=format&fit=crop"
                alt="Weekend Collective"
                className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
            </div>
            <div className="p-8 text-center flex-1 flex flex-col justify-center items-center">
              <h3 className="text-2xl font-serif font-medium text-[#1A1918] dark:text-[#F5F3EF] tracking-tight mb-2 antialiased">
                Weekend Collective
              </h3>
              <p className="font-sans text-xs text-[#6E685F] dark:text-[#A8A29E] max-w-sm mb-4 leading-relaxed font-normal">
                Largest collection of genuine quality prescription glasses frames & casual loungewear.
              </p>
              <button
                onClick={handleApparelClick}
                className="underline font-sans font-semibold text-xs text-[#1A1918] dark:text-[#EAE6DE] hover:text-[#C85A32] dark:hover:text-[#E87A54] tracking-[0.18em] uppercase cursor-pointer"
              >
                Shop Now
              </button>
            </div>
          </div>

          {/* Tile B: It's Cold Outside */}
          <div className="bg-white dark:bg-[#161616] border border-[#EBE8E2] dark:border-[#282828] rounded-xs overflow-hidden flex flex-col group">
            <div className="relative aspect-[4/3] overflow-hidden bg-[#F5F3EF] dark:bg-[#1E1E1E]">
              <img
                src="https://images.unsplash.com/photo-1544923246-77307dd654cb?q=80&w=1000&auto=format&fit=crop"
                alt="It's Cold Outside Winter Puffer"
                className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
            </div>
            <div className="p-8 text-center flex-1 flex flex-col justify-center items-center">
              <h3 className="text-2xl font-serif font-medium text-[#1A1918] dark:text-[#F5F3EF] tracking-tight mb-2 antialiased">
                It’s Cold Outside
              </h3>
              <p className="font-sans text-xs text-[#6E685F] dark:text-[#A8A29E] max-w-sm mb-4 leading-relaxed font-normal">
                Curated collection of our favorite holiday style, warm merino knits, and marigold puffers.
              </p>
              <button
                onClick={handleApparelClick}
                className="underline font-sans font-semibold text-xs text-[#1A1918] dark:text-[#EAE6DE] hover:text-[#C85A32] dark:hover:text-[#E87A54] tracking-[0.18em] uppercase cursor-pointer"
              >
                Check It Out
              </button>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
};
