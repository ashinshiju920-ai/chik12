import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { 
  Sparkles, 
  Flame, 
  Gift, 
  Zap, 
  Tag, 
  Truck, 
  Star, 
  Crown, 
  Heart, 
  Bell, 
  ArrowRight, 
  X 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { FloatingBannerIcon } from '../../types';

export const FloatingBanner: React.FC = () => {
  const { floatingBanner, activePage, setActivePage, setSelectedCategory } = useStore();
  const [dismissed, setDismissed] = useState(() => {
    try {
      return sessionStorage.getItem('diva_floating_banner_dismissed') === 'true';
    } catch {
      return false;
    }
  });

  if (!floatingBanner || !floatingBanner.enabled || dismissed) {
    return null;
  }

  // Display Scope Check: If home_only and current page is not home, hide
  if (floatingBanner.displayScope === 'home_only' && activePage !== 'home') {
    return null;
  }

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDismissed(true);
    try {
      sessionStorage.setItem('diva_floating_banner_dismissed', 'true');
    } catch {}
  };

  const handleCtaClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = floatingBanner.linkUrl || '/shop';
    if (url.startsWith('http://') || url.startsWith('https://')) {
      window.open(url, '_blank', 'noopener,noreferrer');
      return;
    }
    
    // Internal navigation
    if (url.includes('shop')) {
      setSelectedCategory('all');
      setActivePage('shop');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (url.includes('cart')) {
      setActivePage('cart');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (url.includes('wishlist')) {
      setActivePage('wishlist');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (url.includes('account')) {
      setActivePage('account');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (url.includes('about')) {
      setActivePage('about');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setActivePage('shop');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Render configured icon
  const renderIcon = (iconName: FloatingBannerIcon, className = 'w-3.5 h-3.5') => {
    switch (iconName) {
      case 'sparkles':
        return <Sparkles className={className} />;
      case 'flame':
        return <Flame className={className} />;
      case 'gift':
        return <Gift className={className} />;
      case 'zap':
        return <Zap className={className} />;
      case 'tag':
        return <Tag className={className} />;
      case 'truck':
        return <Truck className={className} />;
      case 'star':
        return <Star className={className} />;
      case 'crown':
        return <Crown className={className} />;
      case 'heart':
        return <Heart className={className} />;
      case 'bell':
        return <Bell className={className} />;
      case 'none':
      default:
        return null;
    }
  };

  // Dynamic font styles
  const fontStyle: React.CSSProperties = {
    fontFamily: floatingBanner.fontFamily ? `'${floatingBanner.fontFamily}', sans-serif` : undefined,
    letterSpacing: 
      floatingBanner.letterSpacing === 'widest' ? '0.22em' :
      floatingBanner.letterSpacing === 'wider' ? '0.12em' :
      floatingBanner.letterSpacing === 'wide' ? '0.06em' : 'normal',
    textTransform: floatingBanner.textTransform || 'uppercase',
    fontWeight: Number(floatingBanner.fontWeight) || 600,
  };

  // Font size classes
  const textSizeClass = 
    floatingBanner.fontSize === 'lg' ? 'text-sm md:text-base' :
    floatingBanner.fontSize === 'base' ? 'text-xs md:text-sm' :
    floatingBanner.fontSize === 'sm' ? 'text-[11px] md:text-xs' :
    'text-[10px] md:text-[11px]';

  // Compute background CSS
  const getBackgroundStyle = (): React.CSSProperties => {
    if (floatingBanner.bgStyle === 'gradient') {
      const start = floatingBanner.bgColor || '#C85A32';
      const end = floatingBanner.bgGradientEnd || '#8E381A';
      return {
        background: `linear-gradient(135deg, ${start} 0%, ${end} 100%)`,
        color: floatingBanner.textColor || '#FFFFFF',
        borderColor: floatingBanner.borderColor || 'rgba(255, 255, 255, 0.25)'
      };
    }
    if (floatingBanner.bgStyle === 'glass') {
      return {
        backgroundColor: floatingBanner.bgColor || 'rgba(31, 31, 31, 0.85)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        color: floatingBanner.textColor || '#FFFFFF',
        borderColor: floatingBanner.borderColor || 'rgba(255, 255, 255, 0.2)'
      };
    }
    // solid
    return {
      backgroundColor: floatingBanner.bgColor || '#C85A32',
      color: floatingBanner.textColor || '#FFFFFF',
      borderColor: floatingBanner.borderColor || 'rgba(255, 255, 255, 0.2)'
    };
  };

  const bgStyle = getBackgroundStyle();

  return (
    <AnimatePresence>
      <motion.div
        key="floating-banner"
        initial={{ opacity: 0, y: -10, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -8, scale: 0.98 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="w-full relative z-30 select-none overflow-hidden"
      >
        {/* Ambient Glow Background Effect */}
        {floatingBanner.glowEffect && (
          <div 
            className="absolute -inset-1 blur-xl opacity-30 pointer-events-none transition-all duration-700"
            style={{
              background: `radial-gradient(ellipse at center, ${floatingBanner.bgColor || '#C85A32'} 0%, transparent 70%)`
            }}
          />
        )}

        {/* VARIANT 1: FLOATING PILL */}
        {floatingBanner.designVariant === 'floating-pill' && (
          <div className="max-w-6xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3 relative">
            <div
              style={bgStyle}
              className="w-full rounded-full shadow-lg sm:shadow-xl border px-3 sm:px-6 py-2 sm:py-2.5 flex items-center justify-between gap-2.5 sm:gap-4 transition-all duration-300 hover:shadow-2xl"
            >
              {/* Left & Center Content */}
              <div className="flex items-center gap-2 sm:gap-3.5 min-w-0 flex-1 justify-start sm:justify-center overflow-hidden">
                {/* Optional Badge */}
                {floatingBanner.showBadge && floatingBanner.badgeText && (
                  <span
                    style={{
                      backgroundColor: floatingBanner.badgeBg || '#FFFFFF',
                      color: floatingBanner.badgeTextColor || '#C85A32'
                    }}
                    className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold tracking-wider uppercase shrink-0 shadow-2xs"
                  >
                    {floatingBanner.pulseBadge && (
                      <span className="relative flex h-1.5 w-1.5">
                        <span 
                          className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                          style={{ backgroundColor: floatingBanner.badgeTextColor || '#C85A32' }}
                        />
                        <span 
                          className="relative inline-flex rounded-full h-1.5 w-1.5"
                          style={{ backgroundColor: floatingBanner.badgeTextColor || '#C85A32' }}
                        />
                      </span>
                    )}
                    {renderIcon(floatingBanner.iconName, 'w-3 h-3 shrink-0')}
                    <span className="truncate">{floatingBanner.badgeText}</span>
                  </span>
                )}

                {/* Main Announcement Text */}
                <p 
                  style={fontStyle}
                  className={`${textSizeClass} truncate leading-tight font-medium drop-shadow-2xs`}
                >
                  {floatingBanner.text}
                </p>
              </div>

              {/* Right CTA Button & Dismiss */}
              <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
                {floatingBanner.linkText && (
                  <button
                    type="button"
                    onClick={handleCtaClick}
                    style={{
                      backgroundColor: floatingBanner.btnBg || '#FFFFFF',
                      color: floatingBanner.btnTextColor || '#1F1F1F'
                    }}
                    className="cursor-pointer px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-bold tracking-widest uppercase inline-flex items-center gap-1.5 transition-transform duration-200 hover:scale-105 active:scale-95 shadow-xs"
                  >
                    <span>{floatingBanner.linkText}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}

                {floatingBanner.showCloseButton && (
                  <button
                    type="button"
                    onClick={handleDismiss}
                    aria-label="Dismiss banner"
                    className="p-1 rounded-full opacity-75 hover:opacity-100 hover:bg-white/10 transition-colors cursor-pointer text-current"
                  >
                    <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* VARIANT 2: EDITORIAL STRIP */}
        {floatingBanner.designVariant === 'editorial-strip' && (
          <div
            style={bgStyle}
            className="w-full border-b py-2 sm:py-2.5 px-4 sm:px-8 flex items-center justify-between gap-3 shadow-xs relative"
          >
            <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0 flex-1 justify-center">
                {floatingBanner.showBadge && floatingBanner.badgeText && (
                  <span
                    style={{
                      backgroundColor: floatingBanner.badgeBg || '#FFFFFF',
                      color: floatingBanner.badgeTextColor || '#C85A32'
                    }}
                    className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-xs text-[9px] sm:text-[10px] font-bold tracking-widest uppercase shrink-0"
                  >
                    {floatingBanner.pulseBadge && (
                      <span className="relative flex h-1.5 w-1.5">
                        <span 
                          className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                          style={{ backgroundColor: floatingBanner.badgeTextColor || '#C85A32' }}
                        />
                        <span 
                          className="relative inline-flex rounded-full h-1.5 w-1.5"
                          style={{ backgroundColor: floatingBanner.badgeTextColor || '#C85A32' }}
                        />
                      </span>
                    )}
                    {renderIcon(floatingBanner.iconName, 'w-3 h-3')}
                    <span>{floatingBanner.badgeText}</span>
                  </span>
                )}

                <p
                  style={fontStyle}
                  className={`${textSizeClass} truncate leading-tight font-medium`}
                >
                  {floatingBanner.text}
                </p>

                {floatingBanner.linkText && (
                  <button
                    type="button"
                    onClick={handleCtaClick}
                    className="hidden md:inline-flex items-center gap-1 font-bold underline underline-offset-4 text-[11px] uppercase tracking-wider hover:opacity-80 transition-opacity cursor-pointer ml-2"
                  >
                    <span>{floatingBanner.linkText}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>

              {floatingBanner.showCloseButton && (
                <button
                  type="button"
                  onClick={handleDismiss}
                  aria-label="Dismiss banner"
                  className="p-1 rounded-full opacity-70 hover:opacity-100 hover:bg-white/10 transition-colors cursor-pointer text-current shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* VARIANT 3: MARQUEE TICKER */}
        {floatingBanner.designVariant === 'marquee-ticker' && (
          <div
            style={bgStyle}
            className="w-full border-b py-2 px-2 overflow-hidden relative shadow-xs flex items-center"
          >
            <div className="flex w-full items-center">
              {/* Marquee Track */}
              <div 
                onClick={handleCtaClick}
                className="flex items-center gap-8 whitespace-nowrap animate-marquee cursor-pointer flex-1"
              >
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4 shrink-0">
                    {floatingBanner.showBadge && floatingBanner.badgeText && (
                      <span
                        style={{
                          backgroundColor: floatingBanner.badgeBg || '#FFFFFF',
                          color: floatingBanner.badgeTextColor || '#C85A32'
                        }}
                        className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold tracking-widest uppercase"
                      >
                        {renderIcon(floatingBanner.iconName, 'w-2.5 h-2.5')}
                        <span>{floatingBanner.badgeText}</span>
                      </span>
                    )}
                    <span 
                      style={fontStyle}
                      className={`${textSizeClass} font-medium`}
                    >
                      {floatingBanner.text}
                    </span>
                    {floatingBanner.linkText && (
                      <span className="font-bold underline text-[10px] tracking-widest uppercase">
                        {floatingBanner.linkText} →
                      </span>
                    )}
                    <span className="opacity-40 text-xs">✦</span>
                  </div>
                ))}
              </div>

              {floatingBanner.showCloseButton && (
                <button
                  type="button"
                  onClick={handleDismiss}
                  aria-label="Dismiss banner"
                  className="p-1 rounded-full opacity-75 hover:opacity-100 hover:bg-white/10 transition-colors cursor-pointer text-current ml-2 z-10 shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* VARIANT 4: GLASS GLOW */}
        {floatingBanner.designVariant === 'glass-glow' && (
          <div className="max-w-5xl mx-auto px-4 py-2.5 sm:py-3 relative">
            <div
              style={bgStyle}
              className="w-full rounded-2xl shadow-xl border px-4 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-3 relative overflow-hidden backdrop-blur-xl"
            >
              {/* Shimmer light sweep animation */}
              <div className="absolute inset-0 -translate-x-full animate-[shimmer_3.5s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />

              <div className="flex items-center gap-3 min-w-0 flex-1 justify-start sm:justify-center">
                {floatingBanner.showBadge && floatingBanner.badgeText && (
                  <span
                    style={{
                      backgroundColor: floatingBanner.badgeBg || '#FFFFFF',
                      color: floatingBanner.badgeTextColor || '#C85A32'
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[10px] font-bold tracking-wider uppercase shrink-0 shadow-xs"
                  >
                    {floatingBanner.pulseBadge && (
                      <span className="relative flex h-2 w-2">
                        <span 
                          className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                          style={{ backgroundColor: floatingBanner.badgeTextColor || '#C85A32' }}
                        />
                        <span 
                          className="relative inline-flex rounded-full h-2 w-2"
                          style={{ backgroundColor: floatingBanner.badgeTextColor || '#C85A32' }}
                        />
                      </span>
                    )}
                    {renderIcon(floatingBanner.iconName, 'w-3 h-3')}
                    <span className="truncate">{floatingBanner.badgeText}</span>
                  </span>
                )}

                <p
                  style={fontStyle}
                  className={`${textSizeClass} truncate leading-tight font-medium`}
                >
                  {floatingBanner.text}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {floatingBanner.linkText && (
                  <button
                    type="button"
                    onClick={handleCtaClick}
                    style={{
                      backgroundColor: floatingBanner.btnBg || '#FFFFFF',
                      color: floatingBanner.btnTextColor || '#1F1F1F'
                    }}
                    className="cursor-pointer px-3.5 py-1.5 rounded-xl text-[11px] font-bold tracking-wider uppercase inline-flex items-center gap-1.5 transition-all duration-200 hover:scale-105 active:scale-95 shadow-xs"
                  >
                    <span>{floatingBanner.linkText}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}

                {floatingBanner.showCloseButton && (
                  <button
                    type="button"
                    onClick={handleDismiss}
                    aria-label="Dismiss banner"
                    className="p-1.5 rounded-lg opacity-75 hover:opacity-100 hover:bg-white/10 transition-colors cursor-pointer text-current"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};
