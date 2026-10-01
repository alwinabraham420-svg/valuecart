'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import HeroSection from '@/components/HeroSection';
import CategoryGrid from '@/components/CategoryGrid';
import CategoryCard from '@/components/CategoryCard';
import SectionHeader from '@/components/SectionHeader';
import CountdownTimer from '@/components/CountdownTimer';
import ProductCard from '@/components/ProductCard';
import ProductCarousel from '@/components/ProductCarousel';
import DealBanner from '@/components/DealBanner';
import PromoBanner from '@/components/PromoBanner';
import BenefitsSection from '@/components/BenefitsSection';
import NewsletterSection from '@/components/NewsletterSection';
import { PRODUCTS } from '@/data/products';
import { CATEGORIES } from '@/data/categories';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState('All');

  // Filter Today's Deals products (the first 5 products matching Reference 01)
  const dealsProducts = PRODUCTS.filter((p) => p.deal).slice(0, 5);

  // Featured categories (6 items matching Reference 01)
  const featuredCategories = CATEGORIES.filter((c) => c.featured);

  // Best Sellers tabs & filtering
  const tabs = ['All', 'Men Fashion', 'Home & Kitchen', 'Electronics', 'Beauty & Care', 'More'];

  const bestSellerProducts = PRODUCTS.filter((p) => {
    if (activeTab === 'All') return p.bestSeller;
    if (activeTab === 'More') return !['Men Fashion', 'Home & Kitchen', 'Electronics', 'Beauty & Care'].includes(p.category);
    return p.category === activeTab;
  });

  return (
    <div className="flex flex-col min-h-screen">
      
      {/* 1. Hero Section (Reference 03 Visual Composition + Selectable HTML Text) */}
      <HeroSection />

      {/* 2. Quick Category Icons Grid */}
      <CategoryGrid />

      {/* 3. Promotional Strip Banner (Prominent in Mobile Reference 02) */}
      <div className="block md:hidden">
        <DealBanner />
      </div>

      {/* 4. Today's Deals Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-7 w-full">
        <SectionHeader
          title="Today's"
          highlight="Deals"
          actionText="View All Deals"
          actionHref="/products?filter=deals"
        >
          <CountdownTimer />
        </SectionHeader>

        {/* Desktop 5-Card Layout / Carousel on Mobile */}
        <div className="hidden lg:grid grid-cols-5 gap-4">
          {dealsProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="lg:hidden">
          <ProductCarousel products={dealsProducts} />
        </div>
      </section>

      {/* 5. Promotional 2-Column Banners */}
      <PromoBanner />

      {/* 6. Featured Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-7 w-full">
        <SectionHeader
          title="Featured"
          highlight="Categories"
          actionText="View All Categories"
          actionHref="/products"
        />

        {/* Grid on tablet/desktop, smooth scroll on mobile */}
        <div className="hidden sm:grid sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {featuredCategories.map((cat) => (
            <CategoryCard key={cat.id} category={cat} variant="featured" />
          ))}
        </div>

        <div className="sm:hidden flex gap-3 overflow-x-auto no-scrollbar pb-2 -mx-4 px-4">
          {featuredCategories.map((cat) => (
            <div key={cat.id} className="w-[155px] shrink-0">
              <CategoryCard category={cat} variant="featured" />
            </div>
          ))}
        </div>
      </section>

      {/* 7. Best Sellers with Category Filter Tabs */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-7 w-full">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
          <h2 className="text-xl sm:text-2xl lg:text-[26px] font-bold text-valuecart-navy tracking-tight flex items-center gap-1.5">
            <span>Best</span>
            <span className="text-valuecart-green">Sellers</span>
          </h2>

          {/* Horizontally scrollable tabs without multi-line wrapping */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar pb-1 -mx-4 px-4 sm:mx-0 sm:px-0">
            {tabs.map((tab) => {
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-150 ${
                    isActive
                      ? 'bg-valuecart-navy text-white shadow-xs'
                      : 'bg-white hover:bg-gray-100 text-valuecart-text-muted hover:text-valuecart-navy border border-gray-200'
                  }`}
                >
                  {tab}
                </button>
              );
            })}
          </div>
        </div>

        {/* Best sellers product cards */}
        <div className="hidden lg:grid grid-cols-6 gap-3 sm:gap-4">
          {(bestSellerProducts.length > 0 ? bestSellerProducts : PRODUCTS.slice(0, 6)).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="hidden sm:grid lg:hidden grid-cols-3 gap-3">
          {(bestSellerProducts.length > 0 ? bestSellerProducts : PRODUCTS.slice(0, 6)).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="sm:hidden">
          <ProductCarousel
            products={bestSellerProducts.length > 0 ? bestSellerProducts : PRODUCTS.slice(0, 6)}
          />
        </div>
      </section>

      {/* 8. Trust & Benefits Section */}
      <BenefitsSection />

      {/* 9. Newsletter Strip Banner */}
      <NewsletterSection />

    </div>
  );
}
