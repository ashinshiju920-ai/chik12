import React from 'react';
import { Truck, PhoneCall, ShieldCheck, RotateCcw } from 'lucide-react';

export const TrustBar: React.FC = () => {
  const pillars = [
    {
      icon: Truck,
      title: 'Delivery by Shiprocket',
      desc: 'Insured express dispatch across 29,000+ PIN codes with live tracking'
    },
    {
      icon: RotateCcw,
      title: 'Free 7-Day Home Pickup',
      desc: '100% free doorstep pickup on returns for up to 7 days on all orders'
    },
    {
      icon: ShieldCheck,
      title: 'Secure Cashfree Payments',
      desc: '100% RBI authorized 256-bit SSL encrypted PCI-DSS payment gateway'
    },
    {
      icon: PhoneCall,
      title: 'Support 24/7',
      desc: 'Dedicated concierge styling & WhatsApp order assistance'
    }
  ];

  return (
    <section className="bg-[#0C2B2F] text-white py-16 px-4 sm:px-6 lg:px-8 border-y border-[#082023]">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          {pillars.map((p, idx) => {
            const Icon = p.icon;
            return (
              <div
                key={idx}
                className="flex flex-col items-center text-center group cursor-default"
              >
                <div className="w-16 h-16 rounded-full bg-white/5 group-hover:bg-[#C85A32]/20 border border-white/10 flex items-center justify-center mb-5 transition-all duration-300">
                  <Icon className="w-7 h-7 text-white group-hover:text-[#C85A32] transition-colors stroke-[1.5]" />
                </div>
                <h3 className="font-sans font-semibold text-base tracking-wide text-white">
                  {p.title}
                </h3>
                <p className="font-sans text-xs text-neutral-300 leading-relaxed font-light mt-1 max-w-xs">
                  {p.desc}
                </p>
              </div>
            );
          })}
        </div>

        {/* Official Partners Trust Bar: Cashfree Payments & Shiprocket */}
        <div className="mt-12 pt-8 border-t border-white/10 grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Partner 1: Shiprocket Delivery & 7-Day Free Home Pickup */}
          <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/10">
            <div className="bg-[#2e0954] p-2 rounded-xl border border-purple-400/30 shadow-md shrink-0 flex items-center justify-center">
              <img
                src="/shiprocket-logo.png"
                alt="Shiprocket Official Delivery Partner"
                className="h-10 w-auto object-contain rounded-sm"
              />
            </div>
            <div className="text-left flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <p className="text-xs font-bold text-white tracking-wide uppercase">
                  Delivery Done by Shiprocket
                </p>
              </div>
              <p className="text-[11px] text-neutral-200 mt-0.5 leading-snug font-light">
                <strong className="text-amber-300 font-semibold">Free Doorstep Pickup on Returns for up to 7 Days</strong> for all orders across India.
              </p>
            </div>
          </div>

          {/* Partner 2: Cashfree Payments Official Partner */}
          <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/10">
            <div className="bg-[#120F24] p-2 rounded-xl border border-white/10 shadow-md shrink-0 flex items-center justify-center">
              <img
                src="/cashfree-payments.png"
                alt="Cashfree Payments Official Partner"
                className="h-9 w-auto object-contain"
              />
            </div>
            <div className="text-left flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <p className="text-xs font-bold text-white tracking-wide uppercase">
                  Cashfree Payment Partner
                </p>
              </div>
              <p className="text-[11px] text-neutral-200 mt-0.5 leading-snug font-light">
                100% RBI Authorized & Encrypted — Instant UPI (GPay, PhonePe, Paytm), Debit/Credit Cards & NetBanking.
              </p>
            </div>
          </div>

        </div>

        {/* Micro Security & Quality Badges */}
        <div className="mt-6 flex items-center justify-center sm:justify-between flex-wrap gap-4 text-xs text-neutral-400 border-t border-white/5 pt-4">
          <div className="flex items-center gap-2 text-[11px] font-mono tracking-wider uppercase text-neutral-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>256-Bit Bank Grade SSL Encrypted</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] tracking-wider text-neutral-300">
            <RotateCcw className="w-4 h-4 text-amber-400" />
            <span>Zero-Question 7-Day Doorstep Return Pickup</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] tracking-wider text-neutral-300">
            <Truck className="w-4 h-4 text-purple-400" />
            <span>Fulfilled Nationwide by Shiprocket</span>
          </div>
        </div>

      </div>
    </section>
  );
};
