import React from 'react';
import { useStore } from '../../context/StoreContext';

export interface DivaChicLogoProps {
  className?: string;
  variant?: 'full' | 'icon' | 'badge' | 'compact';
  theme?: 'dark' | 'light' | 'gold' | 'auto';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'hero';
  showSubtitle?: boolean;
  subtitleText?: string;
  onClick?: () => void;
  logoImageUrl?: string;
}

export const DivaChicLogo: React.FC<DivaChicLogoProps> = ({
  className = '',
  variant = 'full',
  theme = 'auto',
  size = 'md',
  showSubtitle = false,
  subtitleText = 'HAUTE COUTURE & LIFESTYLE',
  onClick,
  logoImageUrl
}) => {
  let isDarkMode = false;
  let contextLogoUrl = '';

  try {
    const store = useStore();
    isDarkMode = store.isDarkMode;
    contextLogoUrl = store.siteBanners?.logoUrl;
  } catch {}

  // Resolve effective theme
  const effectiveTheme = theme === 'auto' ? (isDarkMode ? 'light' : 'dark') : theme;

  // Determine active logo URL based on theme and custom overrides
  let activeLogoUrl = '/logo.png';
  if (logoImageUrl) {
    activeLogoUrl = logoImageUrl;
  } else if (contextLogoUrl && !contextLogoUrl.includes('i.ibb.co') && !contextLogoUrl.startsWith('data:image')) {
    activeLogoUrl = contextLogoUrl;
  } else if (effectiveTheme === 'light') {
    activeLogoUrl = '/logo-white.png';
  } else if (effectiveTheme === 'gold') {
    activeLogoUrl = '/logo-gold.png';
  }

  // Height presets
  const heightPx = {
    xs: 24,
    sm: 32,
    md: 44,
    lg: 56,
    xl: 72,
    hero: 92,
  }[size];

  const subtitleSizeClass = {
    xs: 'text-[7px]',
    sm: 'text-[8px]',
    md: 'text-[9px]',
    lg: 'text-[10px]',
    xl: 'text-[11px]',
    hero: 'text-[12px]',
  }[size];

  return (
    <div
      onClick={onClick}
      className={`inline-flex flex-col items-center justify-center select-none group transition-all duration-300 ${
        onClick ? 'cursor-pointer active:scale-[0.98]' : ''
      } ${className}`}
    >
      <div className="relative flex items-center justify-center">
        <img
          src={activeLogoUrl}
          alt="DivaChic Haute Couture & Lifestyle"
          style={{ height: `${heightPx}px`, width: 'auto' }}
          className="object-contain max-w-full drop-shadow-xs transition-transform duration-300 group-hover:scale-[1.02]"
          onError={(e) => {
            const target = e.currentTarget as HTMLImageElement;
            if (target.src !== '/logo.png' && target.src !== '/logo-white.png') {
              target.src = effectiveTheme === 'light' ? '/logo-white.png' : '/logo.png';
            }
          }}
        />
      </div>

      {showSubtitle && (
        <span
          className={`font-modern uppercase tracking-[0.28em] font-semibold text-center w-full mt-1.5 transition-colors duration-300 ${subtitleSizeClass} ${
            effectiveTheme === 'light'
              ? 'text-[#D5D0C5] group-hover:text-white'
              : 'text-[#8C8477] group-hover:text-[#1F1F1F] dark:text-[#A8A29E] dark:group-hover:text-white'
          }`}
        >
          {subtitleText}
        </span>
      )}
    </div>
  );
};

// Aliases for seamless imports across all components
export const DivaChikLogo = DivaChicLogo;
export type DivaChikLogoProps = DivaChicLogoProps;


