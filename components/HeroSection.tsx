'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Sparkles, ShoppingBag, CheckCircle } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-3 md:pt-6 pb-2">
      {/* Hero Outer Wrapper with smooth rounded corners matching reference */}
      <div className="relative w-full rounded-2xl md:rounded-3xl overflow-hidden shadow-soft border border-valuecart-border/40 min-h-[460px] sm:min-h-[480px] md:min-h-[500px] lg:min-h-[520px] flex items-center">
        
        {/* Background Banner Image (REFERENCE 03) */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/hero-banner.png"
            alt="ValueCart Everyday Essentials"
            fill
            priority
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 90vw, 1200px"
            className="object-cover object-right md:object-center"
          />

          {/* Intelligent gradient overlay to guarantee 100% text readability on any screen */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#C2EFEB]/90 via-[#C2EFEB]/75 to-transparent md:w-[65%] pointer-events-none" />
          
          {/* Subtle mobile top overlay for crisp contrast */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#C2EFEB]/85 via-[#C2EFEB]/60 to-transparent md:hidden pointer-events-none" />
        </div>

        {/* Floating Badge (Top Right on Desktop - matches Reference 01) */}
        <div className="hidden lg:flex absolute top-6 right-8 z-10 items-center gap-3 bg-valuecart-green/90 backdrop-blur-md text-white px-4 py-2.5 rounded-2xl shadow-float border border-white/20">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
            <ShoppingBag className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="text-xs font-bold leading-tight">Great Products</div>
            <div className="text-[11px] text-emerald-100 font-medium leading-tight">Better Prices</div>
          </div>
        </div>

        {/* Left Side: Real Selectable HTML Content */}
        <div className="relative z-10 w-full md:w-3/5 lg:w-1/2 p-6 sm:p-8 md:p-12 lg:p-14 flex flex-col justify-center">
          
          {/* Top Pill Badge */}
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-md text-valuecart-navy px-3.5 py-1.5 rounded-full text-xs font-semibold shadow-xs border border-white/90 w-fit mb-4 md:mb-5">
            <Sparkles className="w-3.5 h-3.5 text-valuecart-green" />
            <span>Trendy • Affordable • Everyday</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[54px] font-extrabold text-valuecart-navy leading-[1.08] tracking-tight">
            Everything <br />
            You Need <br />
            <span className="text-valuecart-green drop-shadow-xs">In One Place</span>
          </h1>

          {/* Supporting Text */}
          <p className="mt-3 md:mt-4 text-sm sm:text-base text-valuecart-navy/85 max-w-md font-medium leading-relaxed">
            Quality products at better prices. Shop essentials for your home, style and daily life.
          </p>

          {/* Primary CTA Button */}
          <div className="mt-6 md:mt-8 flex flex-wrap items-center gap-4">
            <Link
              href="/products"
              className="inline-flex items-center gap-2.5 bg-valuecart-green hover:bg-valuecart-green-dark active:scale-[0.98] text-white text-sm sm:text-base font-semibold px-6 sm:px-7 py-3 sm:py-3.5 rounded-full shadow-md hover:shadow-lg transition-all duration-200 group"
            >
              <span>Shop Now</span>
              <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>

            <Link
              href="/products?filter=deals"
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-valuecart-navy hover:text-valuecart-green px-4 py-3 rounded-full hover:bg-white/60 transition-colors"
            >
              <span>Today&apos;s Deals</span>
            </Link>
          </div>

          {/* Social Proof Avatars (matches Reference 01) */}
          <div className="mt-6 md:mt-8 flex items-center gap-3 pt-2">
            <div className="flex -space-x-2 overflow-hidden">
              <img
                className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover"
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"
                alt="Customer"
              />
              <img
                className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover"
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80"
                alt="Customer"
              />
              <img
                className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover"
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80"
                alt="Customer"
              />
            </div>
            <div>
              <div className="text-xs font-bold text-valuecart-navy leading-none">
                10,000+
              </div>
              <div className="text-[11px] text-valuecart-text-muted font-medium mt-0.5">
                Happy Customers
              </div>
            </div>
          </div>

          {/* Mobile Carousel Indicators (matches Reference 02) */}
          <div className="flex md:hidden items-center gap-1.5 mt-5">
            <div className="w-5 h-1.5 bg-valuecart-green rounded-full" />
            <div className="w-1.5 h-1.5 bg-valuecart-navy/20 rounded-full" />
            <div className="w-1.5 h-1.5 bg-valuecart-navy/20 rounded-full" />
          </div>
        </div>
      </div>
    </section>
  );
}
