import React from 'react';
import { useStore } from '../../context/StoreContext';

export interface DivaChikLogoProps {
  className?: string;
  variant?: 'full' | 'icon' | 'badge' | 'compact';
  theme?: 'dark' | 'light' | 'gold' | 'monochrome';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'hero';
  showSubtitle?: boolean;
  subtitleText?: string;
  onClick?: () => void;
  logoImageUrl?: string;
}

export const DivaChikLogo: React.FC<DivaChikLogoProps> = ({
  className = '',
  variant = 'full',
  theme = 'dark',
  size = 'md',
  showSubtitle = false,
  subtitleText = 'HAUTE COUTURE & LIFESTYLE',
  onClick,
  logoImageUrl
}) => {
  let contextLogoUrl = '';
  try {
    const store = useStore();
    contextLogoUrl = store.siteBanners?.logoUrl;
  } catch {}

  const activeLogoUrl = logoImageUrl || contextLogoUrl || 'https://i.ibb.co/MymbxNmJ/image.png';
  // Height presets
  const heightPx = {
    xs: 26,
    sm: 34,
    md: 46,
    lg: 60,
    xl: 76,
    hero: 96,
  }[size];

  const subtitleSizeClass = {
    xs: 'text-[7px]',
    sm: 'text-[8px]',
    md: 'text-[9px]',
    lg: 'text-[10px]',
    xl: 'text-[11px]',
    hero: 'text-[12px]',
  }[size];

  // Blending styles:
  // On light backgrounds, mix-blend-mode multiply removes white background.
  // On dark backgrounds, contrast/invert filters allow the logo to pop elegantly.
  const blendStyle: React.CSSProperties = 
    theme === 'light'
      ? { filter: 'brightness(1.1) contrast(1.15)' }
      : { filter: 'brightness(1.05)' };

  return (
    <div
      onClick={onClick}
      className={`inline-flex flex-col items-center justify-center select-none transition-all duration-200 ${
        onClick ? 'cursor-pointer active:scale-[0.98]' : ''
      } ${className}`}
    >
      <div className="relative flex items-center justify-center">
        <img
          src={activeLogoUrl}
          alt="Diva'Chik Haute Couture & Lifestyle Logo"
          style={{ height: `${heightPx}px`, width: 'auto', ...blendStyle }}
          className="object-contain max-w-full transition-opacity duration-300"
          onError={(e) => {
            // Fallback to secondary image link if primary fails
            (e.currentTarget as HTMLImageElement).src = 'https://i.ibb.co/KcJYpyJ8/image.png';
          }}
        />
      </div>

      {showSubtitle && (
        <span
          className={`font-modern uppercase tracking-[0.25em] font-semibold text-center w-full mt-1 ${subtitleSizeClass} ${
            theme === 'light' ? 'text-[#D5D0C5]' : 'text-[#8C8477]'
          }`}
        >
          {subtitleText}
        </span>
      )}
    </div>
  );
};
