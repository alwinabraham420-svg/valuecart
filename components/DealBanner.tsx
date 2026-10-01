import React from 'react';
import Link from 'next/link';
import { Percent, ArrowRight } from 'lucide-react';

export default function DealBanner() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 md:py-3">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#EAF8F1] via-[#E2F5EB] to-[#DCF2E6] border border-valuecart-green/20 p-4 sm:p-5 flex items-center justify-between shadow-xs">
        {/* Left Content */}
        <div className="flex-1 pr-3">
          <div className="flex items-center gap-2">
            <span className="text-sm sm:text-base md:text-lg font-bold text-valuecart-navy">
              Top Deals
            </span>
            <span className="text-sm sm:text-base md:text-lg font-extrabold text-valuecart-green">
              Up to 70% Off
            </span>
          </div>
          <p className="text-xs text-valuecart-text-muted mt-0.5 font-medium">
            Big savings on your favorite products
          </p>
        </div>

        {/* Center / Accent Icon */}
        <div className="hidden sm:flex items-center justify-center w-10 h-10 rounded-full bg-valuecart-green text-white shadow-sm shrink-0 mx-4">
          <Percent className="w-5 h-5 stroke-[2.5]" />
        </div>

        {/* CTA Button */}
        <Link
          href="/products?filter=deals"
          className="shrink-0 bg-valuecart-navy hover:bg-valuecart-navy-light text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-full flex items-center gap-1.5 shadow-sm transition-colors"
        >
          <span>View Deals</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </section>
  );
}
