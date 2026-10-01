import React from 'react';
import { Truck, Banknote, RotateCcw, ShieldCheck } from 'lucide-react';

export default function BenefitsSection() {
  const benefits = [
    {
      icon: Truck,
      title: 'Free Shipping',
      description: 'On orders above ₹499',
    },
    {
      icon: Banknote,
      title: 'Cash on Delivery',
      description: 'Available',
    },
    {
      icon: RotateCcw,
      title: 'Easy Returns',
      description: 'Hassle free returns',
    },
    {
      icon: ShieldCheck,
      title: 'Secure Payments',
      description: '100% safe & secure',
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-7">
      <div className="bg-white rounded-2xl md:rounded-3xl p-5 sm:p-6 shadow-soft border border-valuecart-border/70">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {benefits.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="flex items-center gap-3 sm:gap-3.5 p-2 rounded-xl transition-colors"
              >
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-valuecart-green-tint text-valuecart-green flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 sm:w-5 sm:h-5 stroke-[2.2]" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-valuecart-navy leading-tight">
                    {item.title}
                  </h4>
                  <p className="text-[11px] sm:text-xs text-valuecart-text-muted mt-0.5">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
