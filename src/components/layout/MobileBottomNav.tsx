import React from 'react';
import { useStore } from '../../context/StoreContext';
import { Home, Compass, Heart, ShoppingBag, Search, ShieldCheck } from 'lucide-react';
import { ActivePage } from '../../types';

export const MobileBottomNav: React.FC = () => {
  const {
    activePage,
    setActivePage,
    cartCount,
    setIsMiniCartOpen,
    wishlist,
    setIsSearchOpen,
    isAdminAuthenticated,
    setSelectedCategory
  } = useStore();

  const navItems: {
    id: string;
    label: string;
    icon: React.ReactNode;
    badge?: number;
    onClick: () => void;
    isActive: boolean;
  }[] = [
    {
      id: 'home',
      label: 'Home',
      icon: <Home className="w-5 h-5" />,
      onClick: () => {
        setActivePage('home');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
      isActive: activePage === 'home'
    },
    {
      id: 'shop',
      label: 'Catalog',
      icon: <Compass className="w-5 h-5" />,
      onClick: () => {
        setSelectedCategory('all');
        setActivePage('shop');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
      isActive: activePage === 'shop' || activePage === 'product-detail'
    },
    {
      id: 'search',
      label: 'Search',
      icon: <Search className="w-5 h-5" />,
      onClick: () => {
        setIsSearchOpen(true);
      },
      isActive: false
    },
    {
      id: 'wishlist',
      label: 'Wishlist',
      icon: <Heart className="w-5 h-5" />,
      badge: wishlist.length,
      onClick: () => {
        setActivePage('wishlist');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
      isActive: activePage === 'wishlist'
    },
    {
      id: 'cart',
      label: 'Bag',
      icon: <ShoppingBag className="w-5 h-5" />,
      badge: cartCount,
      onClick: () => {
        setIsMiniCartOpen(true);
      },
      isActive: activePage === 'cart' || activePage === 'checkout'
    }
  ];

  return (
    <nav 
      aria-label="Mobile Navigation Bar"
      className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-lg border-t border-[#EAE6DE] px-2 py-1.5 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] md:hidden safe-area-pb"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          return (
            <button
              key={item.id}
              onClick={item.onClick}
              className={`relative flex flex-col items-center justify-center py-1 px-3 min-w-[56px] min-h-[48px] rounded-lg transition-all active:scale-95 cursor-pointer ${
                item.isActive 
                  ? 'text-[#C85A32] font-semibold' 
                  : 'text-[#6E675D] hover:text-[#1F1F1F]'
              }`}
              aria-label={item.label}
            >
              <div className="relative">
                {item.icon}
                {typeof item.badge === 'number' && item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-[#C85A32] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] tracking-tight mt-1 font-sans-clean">
                {item.label}
              </span>
              {item.isActive && (
                <span className="w-1 h-1 rounded-full bg-[#C85A32] mt-0.5 animate-pulse"></span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
