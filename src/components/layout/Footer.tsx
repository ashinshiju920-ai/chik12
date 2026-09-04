import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Youtube, 
  Share2, 
  CreditCard, 
  CheckCircle,
  Mail,
  MapPin,
  Phone
} from 'lucide-react';
import { DivaChicLogo } from '../common/DivaChikLogo';

export const Footer: React.FC = () => {
  const { setActivePage, setSelectedCategory, openAdminAuthModal, showToast } = useStore();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [adminClickCount, setAdminClickCount] = useState(0);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      showToast('Please enter a valid email address', 'error');
      return;
    }
    setSubscribed(true);
    showToast('Subscribed to DivaChic Gazette!', 'success', '10% welcome coupon applied.');
    setEmail('');
  };

  const handleAdminSecretTrigger = () => {
    const nextCount = adminClickCount + 1;
    setAdminClickCount(nextCount);
    if (nextCount >= 3) {
      setAdminClickCount(0);
      openAdminAuthModal();
    }
  };

  const navigateTo = (page: any, category?: any) => {
    if (category) setSelectedCategory(category);
    setActivePage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-white border-t border-[#EBE8E2] text-[#555048] pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12 pb-16 border-b border-[#EFECE6]">
          
          {/* Column 1: Brand Bio & Studio Headquarters */}
          <div className="space-y-4">
            <div className="pt-1">
              <DivaChicLogo variant="full" size="md" theme="auto" showSubtitle={true} subtitleText="HAUTE COUTURE & LIFESTYLE" />
            </div>
            <p className="text-xs leading-relaxed text-[#6E685F] max-w-sm pt-1">
              DivaChic celebrates bold femininity, timeless silhouettes, and bespoke couture essentials meticulously crafted for the modern visionary.
            </p>

            {/* Studio Headquarters Trust Box */}
            <div className="p-3.5 bg-[#FAF9F6] border border-[#EAE6DE] rounded-xs space-y-1.5 text-xs text-[#4A453C]">
              <div className="font-bold text-[#1F1F1F] flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#C85A32]" />
                <span>DivaChic Studio Headquarters</span>
              </div>
              <p className="text-[11px] text-[#6E685F] leading-snug">
                #42, 100 Feet Ring Road, Stage 2, BTM Layout<br />
                South Bangalore, Karnataka — 560076
              </p>
              <div className="pt-1 border-t border-[#EAE6DE] flex flex-col gap-1 text-[11px] font-medium">
                <a href="mailto:divachic@icloud.com" className="flex items-center gap-1.5 hover:text-[#C85A32]">
                  <Mail className="w-3 h-3 text-[#C85A32]" />
                  <span>divachic@icloud.com</span>
                </a>
                <a href="tel:6282377918" className="flex items-center gap-1.5 hover:text-[#C85A32]">
                  <Phone className="w-3 h-3 text-[#C85A32]" />
                  <span>+91 6282377918</span>
                </a>
              </div>
            </div>

            {/* Social Icons */}
            <div className="flex items-center space-x-3 pt-1">
              <a href="#" className="w-8 h-8 rounded-full bg-[#FAF9F6] border border-[#EAE6DE] flex items-center justify-center text-[#6E685F] hover:bg-[#C85A32] hover:text-white hover:border-[#C85A32] transition-colors" aria-label="Instagram">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-[#FAF9F6] border border-[#EAE6DE] flex items-center justify-center text-[#6E685F] hover:bg-[#C85A32] hover:text-white hover:border-[#C85A32] transition-colors" aria-label="Facebook">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-[#FAF9F6] border border-[#EAE6DE] flex items-center justify-center text-[#6E685F] hover:bg-[#C85A32] hover:text-white hover:border-[#C85A32] transition-colors" aria-label="Twitter">
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-4">
            <h4 className="text-base font-semibold text-[#1F1F1F]">Maison Directory</h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <button onClick={() => navigateTo('home')} className="hover:text-[#C85A32] transition-colors cursor-pointer">
                  Haute Runway Home
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('about')} className="hover:text-[#C85A32] transition-colors cursor-pointer">
                  About Our Maison
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('lookbook')} className="hover:text-[#C85A32] transition-colors cursor-pointer">
                  Editorial Lookbook
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('tracking')} className="hover:text-[#C85A32] transition-colors cursor-pointer">
                  Track Consignment
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('contact')} className="hover:text-[#C85A32] transition-colors cursor-pointer">
                  Studio Concierge
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('blog')} className="hover:text-[#C85A32] transition-colors cursor-pointer">
                  DivaChic Gazette
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Categories */}
          <div className="space-y-4">
            <h4 className="text-base font-semibold text-[#1F1F1F]">Collections</h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <button onClick={() => navigateTo('shop', 'all')} className="hover:text-[#C85A32] transition-colors cursor-pointer">
                  All Runway Items
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('shop', 'backpack')} className="hover:text-[#C85A32] transition-colors cursor-pointer">
                  Bags & Backpacks
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('shop', 'shoes')} className="hover:text-[#C85A32] transition-colors cursor-pointer">
                  Footwear & Boots
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('shop', 'glasses')} className="hover:text-[#C85A32] transition-colors cursor-pointer">
                  Eyewear & Titanium Optics
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('shop', 'hats')} className="hover:text-[#C85A32] transition-colors cursor-pointer">
                  Headwear & Berets
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('shop', 'apparel')} className="hover:text-[#C85A32] transition-colors cursor-pointer">
                  Apparel & Outerwear
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Newsletter */}
          <div className="space-y-4">
            <h4 className="text-base font-semibold text-[#1F1F1F]">Newsletter</h4>
            <p className="text-sm leading-relaxed text-[#6E685F]">
              Subscribe to get notified about product launches, special offers and news.
            </p>

            {subscribed ? (
              <div className="p-3.5 bg-[#F4F8F6] border border-[#C5E1D4] text-[#1E5638] rounded-xs text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4 shrink-0 text-[#2C5E55]" />
                <span>You are subscribed to DivaChic Gazette! Check your inbox for your 10% code.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2.5">
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="concierge@divachic.com"
                    className="w-full px-3.5 py-2.5 bg-white border border-[#D5D0C5] text-sm text-[#1F1F1F] placeholder:text-[#9E978C] focus:outline-none focus:border-[#C85A32] rounded-xs"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-[#C85A32] hover:bg-[#B34E2A] text-white font-medium text-xs tracking-wider py-2.5 px-4 rounded-xs transition-colors uppercase cursor-pointer"
                >
                  SUBSCRIBE
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#8A8478]">
          <p className="select-none">
            © 2026 DivaChic. All Rights Reserved.{' '}
            <button
              onClick={handleAdminSecretTrigger}
              className="text-[#8A8478] hover:text-[#1F1F1F] transition-colors cursor-pointer inline focus:outline-none ml-1 underline decoration-dotted"
              title="Store Management"
            >
              Merchant Portal
            </button>
          </p>
          
          <div className="flex items-center space-x-3 flex-wrap justify-center sm:justify-end gap-y-2">
            <span className="text-[11px] font-medium tracking-wide">SECURE PAYMENTS:</span>
            <div className="flex items-center gap-1.5 flex-wrap">
              <div className="px-2 py-1 bg-[#120F24] border border-[#2A2347] rounded-xs flex items-center h-6">
                <img src="/cashfree-payments.png" alt="Cashfree Payments" className="h-3.5 w-auto object-contain" />
              </div>
              <span className="px-2 py-0.5 bg-[#F5F3EF] border border-[#E5E0D8] rounded-xs font-semibold text-[10px] text-[#2C2C2C]">UPI</span>
              <span className="px-2 py-0.5 bg-[#F5F3EF] border border-[#E5E0D8] rounded-xs font-semibold text-[10px] text-[#2C2C2C]">VISA</span>
              <span className="px-2 py-0.5 bg-[#F5F3EF] border border-[#E5E0D8] rounded-xs font-semibold text-[10px] text-[#2C2C2C]">MC</span>
              <span className="px-2 py-0.5 bg-[#F5F3EF] border border-[#E5E0D8] rounded-xs font-semibold text-[10px] text-[#2C2C2C]">RUPAY</span>
              <span className="px-2 py-0.5 bg-[#F5F3EF] border border-[#E5E0D8] rounded-xs font-semibold text-[10px] text-[#2C2C2C]">NETBANKING</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
