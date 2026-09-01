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
                <h3 className="text-base font-semibold tracking-wide text-white mb-1.5 font-sans">
                  {p.title}
                </h3>
                <p className="text-xs text-white/70 max-w-xs leading-relaxed font-light">
                  {p.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
