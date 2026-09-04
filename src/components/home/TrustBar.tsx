import React from 'react';
import { Truck, PhoneCall, ShieldCheck, RotateCcw } from 'lucide-react';

export const TrustBar: React.FC = () => {
  const pillars = [
    {
      icon: Truck,
      title: 'Flat-rate Delivery',
      desc: 'Predictable standard or free delivery on orders $75+'
    },
    {
      icon: PhoneCall,
      title: 'Support 24/7',
      desc: 'Dedicated concierge styling & order assistance'
    },
    {
      icon: ShieldCheck,
      title: 'Secure Payment',
      desc: '256-bit SSL encrypted PCI-DSS payment gateways'
    },
    {
      icon: RotateCcw,
      title: '7-Day Easy Returns',
      desc: '7-day hassle-free returns & exchanges guarantee'
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
                <p className="font-sans text-xs text-neutral-400 leading-relaxed font-light mt-1 max-w-xs">
                  {p.desc}
                </p>
              </div>
            );
          })}
        </div>

        {/* Official Cashfree Payments Partner Trust Strip */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-6 px-4 py-3 bg-white/5 rounded-2xl">
          <div className="flex items-center gap-4 flex-wrap justify-center md:justify-start">
            <div className="bg-[#120F24] px-4 py-2 rounded-xl border border-white/10 shadow-xs flex items-center">
              <img
                src="/cashfree-payments.png"
                alt="Cashfree Payments Official Partner"
                className="h-7 w-auto object-contain"
              />
            </div>
            <div className="text-left">
              <p className="text-xs font-semibold text-white tracking-wide flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Official Cashfree Payment Gateway Partner
              </p>
              <p className="text-[11px] text-neutral-300 font-light">
                100% RBI Authorized & Encrypted — Instant UPI (GPay, PhonePe, Paytm), Debit/Credit Cards & NetBanking
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[11px] font-mono tracking-widest text-neutral-300 uppercase bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>256-Bit Bank Grade SSL</span>
          </div>
        </div>
      </div>
    </section>
  );
};
