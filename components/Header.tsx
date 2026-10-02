'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, ShoppingBag } from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import SearchBar from './SearchBar';
import DesktopNavigation from './DesktopNavigation';
import MobileHeader from './MobileHeader';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const { cartCount, wishlist, openCart } = useStore();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`w-full z-40 transition-all duration-200 ${
        isScrolled
          ? 'sticky top-0 bg-white/95 backdrop-blur-md shadow-header'
          : 'bg-white'
      }`}
    >
      {/* Mobile Header (Under 768px) */}
      <MobileHeader />

      {/* Desktop Header (768px and above) */}
      <div className="hidden md:block">
        {/* Top Header Row */}
        <div className="border-b border-valuecart-border/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-20 gap-6 lg:gap-8">
              {/* Brand Logo */}
              <Link href="/" className="relative shrink-0 flex items-center gap-2.5 group py-1">
                <div className="relative w-11 h-11 shrink-0 flex items-center justify-center">
                  <Image
                    src="/images/valuecart-logo.png"
                    alt="ValueCart - Everyday Essentials at Better Prices"
                    width={44}
                    height={44}
                    className="object-contain"
                    priority
                  />
                </div>
                <div className="flex flex-col justify-center">
                  <span className="font-extrabold text-2xl tracking-tight text-valuecart-navy leading-none">
                    Value<span className="text-valuecart-green">Cart</span>
                  </span>
                  <span className="text-[9px] tracking-wider text-valuecart-text-muted uppercase font-bold mt-1">
                    Everyday Essentials
                  </span>
                </div>
              </Link>

              {/* Center: Search Bar */}
              <div className="flex-1 max-w-2xl mx-auto">
                <SearchBar />
              </div>

              {/* Right: Wishlist, Account, Cart */}
              <div className="flex items-center space-x-6 shrink-0">
                {/* Wishlist */}
                <Link
                  href="/account?tab=wishlist"
                  className="flex items-center gap-2 text-valuecart-navy hover:text-valuecart-green group transition-colors"
                >
                  <div className="relative p-1">
                    <Heart className="w-5 h-5 text-valuecart-navy group-hover:text-rose-500 transition-colors" />
                    {wishlist.length > 0 && (
                      <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                        {wishlist.length}
                      </span>
                    )}
                  </div>
                  <span className="text-sm font-medium">Wishlist</span>
                </Link>

                {/* Cart Button */}
                <button
                  type="button"
                  onClick={openCart}
                  className="flex items-center gap-2 text-valuecart-navy hover:text-valuecart-green group transition-colors focus:outline-none"
                  aria-label={`Shopping cart with ${cartCount} items`}
                >
                  <div className="relative p-1">
                    <ShoppingBag className="w-5 h-5 text-valuecart-navy group-hover:text-valuecart-green transition-colors" />
                    {cartCount > 0 && (
                      <span className="absolute -top-1.5 -right-2 bg-valuecart-green text-white text-[11px] font-bold h-5 w-5 rounded-full flex items-center justify-center shadow-sm">
                        {cartCount}
                      </span>
                    )}
                  </div>
                  <span className="text-sm font-medium">Cart</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Second Navigation Row */}
        <DesktopNavigation />
      </div>
    </header>
  );
}
