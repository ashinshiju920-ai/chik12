import React, { ReactNode, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { StoreProvider, useStore } from './context/StoreContext';
import { trackPageView } from './lib/analytics';
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
import { WhatsAppSupportWidget } from './components/common/WhatsAppSupportWidget';
import { SearchModal } from './components/common/SearchModal';
import { AnimatePresence, motion } from 'framer-motion';

const MainContent: React.FC = () => {
  const { activePage } = useStore();

  // Automatically track route & page views via native Firebase Analytics
  useEffect(() => {
    trackPageView(activePage);
  }, [activePage]);

  return (
    <main className="flex-1 pb-16 md:pb-0 relative overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={activePage}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="w-full"
        >
          {activePage === 'home' && (
            <>
              <HeroBanner />
              <CategoryGrid />
              <ProductGrids />
              <EditorialBanners />
              <TrustBar />
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
        </motion.div>
      </AnimatePresence>
    </main>
  );
};

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public props: ErrorBoundaryProps;
  public state: ErrorBoundaryState;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.props = props;
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('App ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F9F8F6] text-[#1F1F1F] flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white border border-[#EAE6DE] rounded-xl p-8 shadow-xl text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#C85A32]/10 text-[#C85A32] flex items-center justify-center mx-auto text-xl font-bold">
              !
            </div>
            <h2 className="text-xl font-bold font-editorial">DivaChic Studio Reload</h2>
            <p className="text-xs text-[#6E685F] leading-relaxed">
              A temporary rendering state occurred. Click below to restore standard storefront defaults.
            </p>
            <div className="text-[10px] bg-red-50 text-red-700 p-2 rounded-md font-mono text-left max-h-24 overflow-y-auto">
              {this.state.error?.message || 'Unknown render error'}
            </div>
            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={() => {
                  try {
                    localStorage.removeItem('diva_site_banners');
                    localStorage.removeItem('haute_admin_auth');
                  } catch {}
                  window.location.reload();
                }}
                className="w-full bg-[#1F1F1F] hover:bg-[#C85A32] text-white py-3 rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                Reset & Reload Storefront
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <StoreProvider>
          <div className="min-h-screen flex flex-col bg-[#F9F8F6] text-[#1F1F1F] font-sans antialiased selection:bg-[#C85A32] selection:text-white transition-colors duration-300">
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
            <WhatsAppSupportWidget />
            <SearchModal />
          </div>
        </StoreProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
