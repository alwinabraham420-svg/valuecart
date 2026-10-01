import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

export default function PromoBanner() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-7">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        
        {/* Banner 1: Men Fashion (Dark Green / Navy Theme) */}
        <div className="relative overflow-hidden rounded-2xl md:rounded-3xl bg-gradient-to-br from-[#0F2D25] via-[#12392F] to-[#1A4C40] p-6 sm:p-8 flex flex-col justify-between min-h-[220px] sm:min-h-[250px] shadow-soft group">
          {/* Subtle background image */}
          <div className="absolute right-0 top-0 bottom-0 w-1/2 sm:w-5/12 overflow-hidden pointer-events-none opacity-40 md:opacity-60">
            <Image
              src="https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=600&q=80"
              alt="Men Fashion Banner"
              fill
              sizes="(max-width: 768px) 50vw, 300px"
              className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0F2D25] to-transparent" />
          </div>

          {/* Banner 1 Content */}
          <div className="relative z-10 max-w-[280px] sm:max-w-xs">
            <span className="inline-block bg-white/15 backdrop-blur-xs text-emerald-200 text-[11px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full mb-3">
              MEN FASHION
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
              Stylish Looks <br />
              Everyday
            </h3>
            <p className="text-xs sm:text-sm text-gray-200 mt-2 font-medium">
              Trendy shirts, t-shirts &amp; more at best prices.
            </p>
          </div>

          <div className="relative z-10 mt-6">
            <Link
              href="/category/men-fashion"
              className="inline-flex items-center gap-2 bg-white hover:bg-gray-100 text-valuecart-navy font-bold text-xs sm:text-sm px-5 py-2.5 rounded-full shadow-sm transition-colors"
            >
              <span>Shop Men</span>
              <ArrowRight className="w-3.5 h-3.5 text-valuecart-green" />
            </Link>
          </div>
        </div>

        {/* Banner 2: Home Essentials (Light Mint Theme) */}
        <div className="relative overflow-hidden rounded-2xl md:rounded-3xl bg-gradient-to-br from-[#E8F8F2] via-[#E0F5EC] to-[#D5EFE3] p-6 sm:p-8 flex flex-col justify-between min-h-[220px] sm:min-h-[250px] shadow-soft border border-valuecart-green/15 group">
          {/* Subtle background image */}
          <div className="absolute right-0 top-0 bottom-0 w-1/2 sm:w-5/12 overflow-hidden pointer-events-none opacity-60 md:opacity-75">
            <Image
              src="https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=600&q=80"
              alt="Home Essentials Banner"
              fill
              sizes="(max-width: 768px) 50vw, 300px"
              className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#E8F8F2] to-transparent" />
          </div>

          {/* Banner 2 Content */}
          <div className="relative z-10 max-w-[280px] sm:max-w-xs">
            <span className="inline-block bg-valuecart-green/15 text-valuecart-green-dark text-[11px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full mb-3">
              HOME ESSENTIALS
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-valuecart-navy leading-tight">
              Make your <br />
              home better
            </h3>
            <p className="text-xs sm:text-sm text-valuecart-navy/80 mt-2 font-medium">
              Smart and useful products for everyday living.
            </p>
          </div>

          <div className="relative z-10 mt-6">
            <Link
              href="/category/home-kitchen"
              className="inline-flex items-center gap-2 bg-valuecart-navy hover:bg-valuecart-navy-light text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-full shadow-sm transition-colors"
            >
              <span>Shop Home</span>
              <ArrowRight className="w-3.5 h-3.5 text-valuecart-green-light" />
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}
