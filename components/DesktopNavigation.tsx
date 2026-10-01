'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, ChevronDown, Sparkles } from 'lucide-react';
import { CATEGORIES } from '@/data/categories';

export default function DesktopNavigation() {
  const [allCategoriesOpen, setAllCategoriesOpen] = useState(false);

  const mainNavItems = [
    { name: 'Men Fashion', href: '/category/men-fashion' },
    { name: 'Women Fashion', href: '/category/women-fashion' },
    { name: 'Home & Kitchen', href: '/category/home-kitchen' },
    { name: 'Bags & Luggage', href: '/category/bags-luggage' },
    { name: 'Electronics', href: '/category/electronics' },
    { name: 'Beauty & Care', href: '/category/beauty-care' },
    { name: 'Accessories', href: '/category/accessories' },
    { name: 'Sports & Fitness', href: '/category/sports-fitness' },
    { name: 'More', href: '/products' },
  ];

  return (
    <div className="bg-valuecart-navy text-white text-sm relative z-30 shadow-inner">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 lg:gap-6 h-11">
          {/* All Categories Dropdown Trigger */}
          <div
            className="relative shrink-0 h-full"
            onMouseEnter={() => setAllCategoriesOpen(true)}
            onMouseLeave={() => setAllCategoriesOpen(false)}
          >
            <button
              type="button"
              className="h-full flex items-center gap-2.5 px-4 font-semibold text-xs sm:text-sm bg-valuecart-navy-dark hover:bg-valuecart-navy-light text-white transition-colors whitespace-nowrap cursor-pointer select-none"
            >
              <Menu className="w-4 h-4 text-valuecart-green-light shrink-0" />
              <span className="whitespace-nowrap font-semibold">All Categories</span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-gray-300 transition-transform duration-200 shrink-0 ${
                  allCategoriesOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Mega Dropdown Menu */}
            {allCategoriesOpen && (
              <div className="absolute top-full left-0 w-72 bg-white text-valuecart-navy rounded-b-xl shadow-card border border-valuecart-border/80 p-2 z-50 animate-fade-in">
                <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-valuecart-text-muted border-b border-gray-100 flex items-center justify-between">
                  <span>Explore Catalog</span>
                  <Sparkles className="w-3.5 h-3.5 text-valuecart-orange" />
                </div>
                <div className="py-1">
                  {CATEGORIES.map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/category/${cat.slug}`}
                      className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-valuecart-green-surface hover:text-valuecart-green-dark transition-colors group"
                      onClick={() => setAllCategoriesOpen(false)}
                    >
                      <span className="group-hover:translate-x-1 transition-transform">
                        {cat.name}
                      </span>
                      <span className="text-xs text-gray-400 group-hover:text-valuecart-green">
                        {cat.itemCount}+ items
                      </span>
                    </Link>
                  ))}
                  <div className="pt-2 mt-1 border-t border-gray-100">
                    <Link
                      href="/products"
                      className="flex items-center justify-center w-full py-2 text-xs font-semibold text-valuecart-green hover:text-valuecart-green-dark bg-valuecart-green-tint rounded-lg transition-colors"
                      onClick={() => setAllCategoriesOpen(false)}
                    >
                      View All Products →
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Direct Category Links */}
          <nav className="flex-1 flex items-center space-x-1 lg:space-x-3 overflow-x-auto no-scrollbar py-1">
            {mainNavItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="px-3 py-1.5 rounded-md text-xs lg:text-sm font-medium text-gray-200 hover:text-white hover:bg-valuecart-navy-light/60 transition-colors whitespace-nowrap"
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}
