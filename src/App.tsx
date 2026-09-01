import React from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { HeroBanner } from './components/home/HeroBanner';
import { TrustBar } from './components/home/TrustBar';
import { CategoryGrid } from './components/home/CategoryGrid';
import { ProductGrids } from './components/home/ProductGrids';
import { EditorialBanners } from './components/home/EditorialBanners';
import { ProductDetailView } from './components/product/ProductDetailView';
import { ShopCatalogView } from './components/shop/ShopCatalogView';
import { WishlistView } from './components/wishlist/WishlistView';
import { CartView } from './components/cart/CartView';
import { MiniCartDrawer } from './components/cart/MiniCartDrawer';
import { CheckoutView } from './components/checkout/CheckoutView';
import { AccountDashboard } from './components/account/AccountDashboard';
import { AdminPortal } from './components/admin/AdminPortal';
import { EditorialPages } from './components/pages/EditorialPages';
import { AuthModal } from './components/auth/AuthModal';
import { AdminAuthModal } from './components/admin/AdminAuthModal';
import { FloatingCatalogPopup } from './components/common/FloatingCatalogPopup';
import { MobileBottomNav } from './components/layout/MobileBottomNav';
import { QuickViewModal } from './components/product/QuickViewModal';
import { ToastContainer } from './components/common/ToastContainer';
import { ScrollToTop } from './components/common/ScrollToTop';

const MainContent: React.FC = () => {
  const { activePage } = useStore();

  return (
    <main className="flex-1 pb-16 md:pb-0">
      {activePage === 'home' && (
        <>
          <HeroBanner />
          <TrustBar />
          <CategoryGrid />
          <ProductGrids />
          <EditorialBanners />
        </>
      )}

      {activePage === 'shop' && <ShopCatalogView />}
      {activePage === 'product-detail' && <ProductDetailView />}
      {activePage === 'wishlist' && <WishlistView />}
      {activePage === 'cart' && <CartView />}
      {(activePage === 'checkout' || activePage === 'order-confirmation') && <CheckoutView />}
      {activePage === 'account' && <AccountDashboard />}
      {activePage === 'admin' && <AdminPortal />}
      {activePage === 'about' && <EditorialPages type="about" />}
      {activePage === 'blog' && <EditorialPages type="blog" />}
      {activePage === 'contact' && <EditorialPages type="contact" />}
    </main>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <div className="min-h-screen flex flex-col bg-[#F9F8F6] text-[#1F1F1F] font-sans antialiased selection:bg-[#C85A32] selection:text-white">
        <ScrollToTop />
        <Header />
        <MainContent />
        <Footer />
        <MobileBottomNav />
        <MiniCartDrawer />
        <AuthModal />
        <AdminAuthModal />
        <FloatingCatalogPopup />
        <QuickViewModal />
        <ToastContainer />
      </div>
    </StoreProvider>
  );
}
