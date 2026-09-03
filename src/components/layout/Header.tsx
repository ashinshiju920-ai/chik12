import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { 
  Search, 
  ShoppingBag, 
  User as UserIcon, 
  Heart, 
  Menu, 
  X, 
  ChevronDown, 
  ShieldCheck, 
  Sparkles,
  ArrowRight,
  Sun,
  Moon
} from 'lucide-react';
import { Currency } from '../../types';

import { DivaChicLogo } from '../common/DivaChikLogo';

export const Header: React.FC = () => {
  const { 
    activePage, 
    setActivePage, 
    cartCount, 
    setIsMiniCartOpen, 
    setIsSearchOpen, 
    wishlist, 
    currentUser, 
    setIsAuthModalOpen,
    currency,
    setCurrency,
    formatPrice,
    setSelectedCategory,
    isAdminAuthenticated,
    lockAdmin,
    products,
    isDarkMode,
    toggleDarkMode
  } = useStore();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [shopDropdownOpen, setShopDropdownOpen] = useState(false);
  const [pagesDropdownOpen, setPagesDropdownOpen] = useState(false);

  const navigateTo = (page: any, category?: any) => {
    if (category) {
      setSelectedCategory(category);
    }
    setActivePage(page);
    setMobileMenuOpen(false);
    setShopDropdownOpen(false);
    setPagesDropdownOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-[#EAE6DE] shadow-xs">
      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Left: Mobile Menu Trigger */}
          <div className="flex items-center lg:hidden">
            <button
              id="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 -ml-2 text-[#1F1F1F] hover:text-[#C85A32] focus:outline-none cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Center-Left: Logo */}
          <div className="flex items-center">
            <button
              id="header-brand-logo"
              onClick={() => navigateTo('home')}
              className="cursor-pointer hover:opacity-90 transition-opacity flex items-center"
              aria-label="DivaChic Home"
            >
              <DivaChicLogo variant="full" size="md" theme="auto" />
            </button>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-8 text-xs font-semibold tracking-widest uppercase text-[#1F1F1F]">
            <button
              onClick={() => navigateTo('home')}
              className={`hover:text-[#C85A32] transition-colors cursor-pointer relative py-2 ${
                activePage === 'home' ? 'text-[#C85A32]' : ''
              }`}
            >
              HOME
              {activePage === 'home' && (
                <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#C85A32]"></span>
              )}
            </button>

            {/* Shop Dropdown */}
            <div 
              className="relative group"
              onMouseEnter={() => setShopDropdownOpen(true)}
              onMouseLeave={() => setShopDropdownOpen(false)}
            >
              <button
                onClick={() => navigateTo('shop', 'all')}
                className={`flex items-center gap-1 hover:text-[#C85A32] transition-colors cursor-pointer py-2 ${
                  activePage === 'shop' || activePage === 'product-detail' ? 'text-[#C85A32]' : ''
                }`}
              >
                COLLECTIONS
                <ChevronDown className="w-3.5 h-3.5 opacity-70 group-hover:rotate-180 transition-transform duration-200" />
              </button>

              {shopDropdownOpen && (
                <div className="absolute top-full left-0 w-80 bg-white border border-[#EAE6DE] shadow-2xl py-3 px-2 z-50 rounded-xs animate-fadeIn">
                  <div className="px-3 py-1.5 text-[10px] font-bold text-[#8C8275] uppercase tracking-widest border-b border-[#F0ECE1] mb-2">
                    Department Directory
                  </div>
                  
                  <button
                    onClick={() => navigateTo('shop', 'all')}
                    className="w-full text-left px-3 py-2 rounded-xs text-xs font-medium hover:bg-[#FAF9F6] hover:text-[#C85A32] transition-colors flex items-center justify-between group/item"
                  >
                    <div>
                      <div className="font-semibold text-[#1F1F1F] group-hover/item:text-[#C85A32]">All Collections</div>
                      <div className="text-[11px] text-[#8C8477]">Complete seasonal catalog ({products.length} items)</div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-[#C85A32] opacity-0 group-hover/item:opacity-100 group-hover/item:translate-x-0.5 transition-all" />
                  </button>

                  <button
                    onClick={() => navigateTo('shop', 'backpack')}
                    className="w-full text-left px-3 py-2 rounded-xs text-xs font-medium hover:bg-[#FAF9F6] hover:text-[#C85A32] transition-colors flex items-center justify-between group/item"
                  >
                    <div>
                      <div className="font-semibold text-[#1F1F1F] group-hover/item:text-[#C85A32]">Backpacks & Leather Goods</div>
                      <div className="text-[11px] text-[#8C8477]">Waxed canvas & waterproof carryalls</div>
                    </div>
                  </button>

                  <button
                    onClick={() => navigateTo('shop', 'shoes')}
                    className="w-full text-left px-3 py-2 rounded-xs text-xs font-medium hover:bg-[#FAF9F6] hover:text-[#C85A32] transition-colors flex items-center justify-between group/item"
                  >
                    <div>
                      <div className="font-semibold text-[#1F1F1F] group-hover/item:text-[#C85A32]">Footwear & Boots</div>
                      <div className="text-[11px] text-[#8C8477]">Waterproof nubuck & trail shoes</div>
                    </div>
                  </button>

                  <button
                    onClick={() => navigateTo('shop', 'glasses')}
                    className="w-full text-left px-3 py-2 rounded-xs text-xs font-medium hover:bg-[#FAF9F6] hover:text-[#C85A32] transition-colors flex items-center justify-between group/item"
                  >
                    <div>
                      <div className="font-semibold text-[#1F1F1F] group-hover/item:text-[#C85A32]">Optics & Eyewear</div>
                      <div className="text-[11px] text-[#8C8477]">Italian bio-acetate handcrafted frames</div>
                    </div>
                  </button>

                  <button
                    onClick={() => navigateTo('shop', 'hats')}
                    className="w-full text-left px-3 py-2 rounded-xs text-xs font-medium hover:bg-[#FAF9F6] hover:text-[#C85A32] transition-colors flex items-center justify-between group/item"
                  >
                    <div>
                      <div className="font-semibold text-[#1F1F1F] group-hover/item:text-[#C85A32]">Headwear & Caps</div>
                      <div className="text-[11px] text-[#8C8477]">Organic twill 6-panel silhouettes</div>
                    </div>
                  </button>

                  <button
                    onClick={() => navigateTo('shop', 'apparel')}
                    className="w-full text-left px-3 py-2 rounded-xs text-xs font-medium hover:bg-[#FAF9F6] hover:text-[#C85A32] transition-colors flex items-center justify-between group/item"
                  >
                    <div>
                      <div className="font-semibold text-[#1F1F1F] group-hover/item:text-[#C85A32]">Apparel & Outerwear</div>
                      <div className="text-[11px] text-[#8C8477]">Heavyweight cotton & winter down</div>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* Pages Dropdown */}
            <div 
              className="relative group"
              onMouseEnter={() => setPagesDropdownOpen(true)}
              onMouseLeave={() => setPagesDropdownOpen(false)}
            >
              <button
                className={`flex items-center gap-1 hover:text-[#C85A32] transition-colors cursor-pointer py-2 ${
                  ['about', 'lookbook', 'tracking'].includes(activePage) ? 'text-[#C85A32]' : ''
                }`}
              >
                PAGES
                <ChevronDown className="w-3.5 h-3.5 opacity-70 group-hover:rotate-180 transition-transform duration-200" />
              </button>

              {pagesDropdownOpen && (
                <div className="absolute top-full left-0 w-56 bg-white border border-[#EAE6DE] shadow-xl py-2 z-50 rounded-xs animate-fadeIn">
                  <button
                    onClick={() => navigateTo('about')}
                    className="w-full text-left px-4 py-2 text-xs font-medium hover:bg-[#FAF9F6] hover:text-[#C85A32] transition-colors"
                  >
                    About Brand
                  </button>
                  <button
                    onClick={() => navigateTo('lookbook')}
                    className="w-full text-left px-4 py-2 text-xs font-medium hover:bg-[#FAF9F6] hover:text-[#C85A32] transition-colors"
                  >
                    Editorial Lookbook
                  </button>
                  <button
                    onClick={() => navigateTo('tracking')}
                    className="w-full text-left px-4 py-2 text-xs font-medium hover:bg-[#FAF9F6] hover:text-[#C85A32] transition-colors"
                  >
                    Live Order Tracking
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={() => navigateTo('blog')}
              className={`hover:text-[#C85A32] transition-colors cursor-pointer py-2 ${
                activePage === 'blog' ? 'text-[#C85A32]' : ''
              }`}
            >
              JOURNAL
            </button>

            <button
              onClick={() => navigateTo('contact')}
              className={`hover:text-[#C85A32] transition-colors cursor-pointer py-2 ${
                activePage === 'contact' ? 'text-[#C85A32]' : ''
              }`}
            >
              CONTACT
            </button>
          </nav>

          {/* Right: Actions */}
          <div className="flex items-center space-x-3 sm:space-x-4 text-[#1F1F1F]">
            {/* Currency Selector */}
            <div className="hidden md:flex items-center border border-[#EAE6DE] rounded-xs px-2 py-1 bg-[#FAF9F6]">
              <span className="text-[10px] font-bold text-[#8C8477] mr-1">CUR</span>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as Currency)}
                className="bg-transparent text-xs font-semibold text-[#1F1F1F] cursor-pointer focus:outline-none"
                aria-label="Currency Selector"
              >
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>

            {/* Admin status pill if logged in */}
            {isAdminAuthenticated && (
              <button
                onClick={() => navigateTo('admin')}
                className="hidden md:flex items-center gap-1.5 text-[11px] bg-[#FAF1ED] text-[#C85A32] border border-[#F6D0C1] px-2.5 py-1 rounded-full font-semibold cursor-pointer hover:bg-[#C85A32] hover:text-white transition-colors"
                title="Admin Control Hub"
              >
                <ShieldCheck className="w-3 h-3" />
                <span>Admin</span>
              </button>
            )}

            {/* Night Mode / Light Mode Toggle */}
            <button
              id="header-theme-toggle"
              onClick={toggleDarkMode}
              className="p-1.5 hover:text-[#C85A32] hover:bg-[#FAF9F6] dark:hover:bg-[#222222] rounded-xs transition-all cursor-pointer"
              aria-label={isDarkMode ? 'Switch to Light Mode' : 'Switch to Night Mode'}
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Night Mode'}
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5 text-[#E5A663] transition-transform duration-300 rotate-0 hover:rotate-45" />
              ) : (
                <Moon className="w-5 h-5 text-[#1F1F1F] transition-transform duration-300 hover:-rotate-12" />
              )}
            </button>

            {/* Search Trigger */}
            <button
              id="header-search-trigger"
              onClick={() => setIsSearchOpen(true)}
              className="p-1 hover:text-[#C85A32] transition-colors cursor-pointer"
              aria-label="Search catalog"
            >
              <Search className="w-5 h-5 stroke-[1.75]" />
            </button>

            {/* Wishlist Icon */}
            <button
              id="header-wishlist-trigger"
              onClick={() => navigateTo('wishlist')}
              className="p-1 hover:text-[#C85A32] transition-colors relative cursor-pointer hidden sm:block"
              aria-label="View saved wishlist"
              title="Saved Wishlist"
            >
              <Heart className="w-5 h-5 stroke-[1.75]" />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#1F1F1F] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* User Account / Profile */}
            <button
              id="header-user-trigger"
              onClick={() => {
                if (currentUser) {
                  navigateTo('account');
                } else {
                  setIsAuthModalOpen(true);
                }
              }}
              className="p-1 hover:text-[#C85A32] transition-colors cursor-pointer"
              aria-label="User Account"
            >
              {currentUser?.avatar ? (
                <img 
                  src={currentUser.avatar} 
                  alt={currentUser.name} 
                  className="w-6 h-6 rounded-full object-cover border border-[#C85A32]"
                />
              ) : (
                <UserIcon className="w-5 h-5 stroke-[1.75]" />
              )}
            </button>

            {/* Cart Trigger with Dynamic Orange Badge */}
            <button
              id="header-cart-trigger"
              onClick={() => setIsMiniCartOpen(true)}
              className="p-1 hover:text-[#C85A32] transition-colors relative cursor-pointer flex items-center"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5 stroke-[1.75]" />
              <span className="absolute -top-1.5 -right-2 min-w-[18px] h-[18px] px-1 bg-[#C85A32] text-white text-[11px] font-bold rounded-full flex items-center justify-center shadow-xs">
                {cartCount}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-[#E5E0D8] px-6 py-5 space-y-4 animate-fadeIn">
          {/* Mobile Drawer Brand Header */}
          <div className="flex items-center justify-between pb-3 border-b border-[#F0ECE1]">
            <DivaChicLogo variant="full" size="sm" theme="auto" showSubtitle={true} subtitleText="HAUTE COUTURE & LIFESTYLE" />
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-1.5 text-[#8C8477] hover:text-[#1F1F1F] rounded-xs"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex flex-col space-y-3 font-medium text-sm">
            <button
              onClick={() => navigateTo('home')}
              className="text-left py-2 border-b border-[#F0ECE1] flex justify-between items-center"
            >
              <span className="font-semibold text-xs uppercase tracking-wider">Home</span>
              <ArrowRight className="w-4 h-4 text-[#C85A32]" />
            </button>

            {/* Night Mode Switch for Mobile */}
            <div className="py-2 border-b border-[#F0ECE1] flex items-center justify-between text-xs">
              <span className="text-[#8C8275] font-semibold uppercase tracking-wider text-[11px]">Night Mode:</span>
              <button
                onClick={toggleDarkMode}
                className="flex items-center gap-1.5 px-3 py-1 bg-[#FAF9F6] border border-[#EAE6DE] rounded-xs font-semibold text-xs cursor-pointer"
              >
                {isDarkMode ? (
                  <>
                    <Sun className="w-3.5 h-3.5 text-[#E5A663]" />
                    <span>Active (Dark)</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-3.5 h-3.5 text-[#1F1F1F]" />
                    <span>Light Theme</span>
                  </>
                )}
              </button>
            </div>

            {/* Redesigned Shop Categories without Hashtags */}
            <div className="py-2 border-b border-[#F0ECE1]">
              <div className="text-[11px] uppercase font-bold text-[#8C8275] tracking-wider mb-2">
                Departments & Collections
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button 
                  onClick={() => navigateTo('shop', 'all')} 
                  className="text-left p-2.5 bg-[#FAF9F6] border border-[#EAE6DE] rounded-xs font-medium text-[#1F1F1F] hover:border-[#C85A32] hover:text-[#C85A32] transition-colors"
                >
                  All Items
                </button>
                <button 
                  onClick={() => navigateTo('shop', 'backpack')} 
                  className="text-left p-2.5 bg-[#FAF9F6] border border-[#EAE6DE] rounded-xs font-medium text-[#1F1F1F] hover:border-[#C85A32] hover:text-[#C85A32] transition-colors"
                >
                  Bags & Backpacks
                </button>
                <button 
                  onClick={() => navigateTo('shop', 'shoes')} 
                  className="text-left p-2.5 bg-[#FAF9F6] border border-[#EAE6DE] rounded-xs font-medium text-[#1F1F1F] hover:border-[#C85A32] hover:text-[#C85A32] transition-colors"
                >
                  Footwear & Boots
                </button>
                <button 
                  onClick={() => navigateTo('shop', 'glasses')} 
                  className="text-left p-2.5 bg-[#FAF9F6] border border-[#EAE6DE] rounded-xs font-medium text-[#1F1F1F] hover:border-[#C85A32] hover:text-[#C85A32] transition-colors"
                >
                  Eyewear & Optics
                </button>
                <button 
                  onClick={() => navigateTo('shop', 'hats')} 
                  className="text-left p-2.5 bg-[#FAF9F6] border border-[#EAE6DE] rounded-xs font-medium text-[#1F1F1F] hover:border-[#C85A32] hover:text-[#C85A32] transition-colors"
                >
                  Headwear & Caps
                </button>
                <button 
                  onClick={() => navigateTo('shop', 'apparel')} 
                  className="text-left p-2.5 bg-[#FAF9F6] border border-[#EAE6DE] rounded-xs font-medium text-[#1F1F1F] hover:border-[#C85A32] hover:text-[#C85A32] transition-colors"
                >
                  Apparel & Outerwear
                </button>
              </div>
            </div>

            {/* Currency selector for Mobile */}
            <div className="py-2 border-b border-[#F0ECE1] flex items-center justify-between text-xs">
              <span className="text-[#8C8275] font-semibold uppercase tracking-wider text-[11px]">Display Currency:</span>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as Currency)}
                className="bg-[#FAF9F6] text-[#1F1F1F] border border-[#EAE6DE] rounded-xs px-2.5 py-1 font-semibold text-xs"
              >
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>

            <button
              onClick={() => navigateTo('wishlist')}
              className="text-left py-2 border-b border-[#F0ECE1] flex justify-between items-center"
            >
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-[#C85A32]" />
                <span className="text-xs uppercase tracking-wider font-semibold">Saved Wishlist</span>
              </div>
              <span className="bg-[#FAF1ED] text-[#C85A32] text-[10px] font-bold px-2 py-0.5 rounded-full">
                {wishlist.length}
              </span>
            </button>

            <button
              onClick={() => navigateTo('about')}
              className="text-left py-2 border-b border-[#F0ECE1] text-xs uppercase tracking-wider font-semibold"
            >
              About DivaChic
            </button>

            <button
              onClick={() => navigateTo('lookbook')}
              className="text-left py-2 border-b border-[#F0ECE1] text-xs uppercase tracking-wider font-semibold"
            >
              Editorial Lookbook
            </button>

            <button
              onClick={() => navigateTo('tracking')}
              className="text-left py-2 border-b border-[#F0ECE1] text-xs uppercase tracking-wider font-semibold"
            >
              Track Your Order
            </button>

            <button
              onClick={() => navigateTo('blog')}
              className="text-left py-2 border-b border-[#F0ECE1] text-xs uppercase tracking-wider font-semibold"
            >
              Journal / Blog
            </button>

            <button
              onClick={() => navigateTo('contact')}
              className="text-left py-2 border-b border-[#F0ECE1] text-xs uppercase tracking-wider font-semibold"
            >
              Contact Us
            </button>

            {isAdminAuthenticated && (
              <button
                onClick={() => navigateTo('admin')}
                className="text-left py-2 text-[#C85A32] font-semibold flex items-center gap-2 text-xs uppercase tracking-wider"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Admin Operations Hub</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
