'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, Heart, ShoppingBag, X, ChevronRight, Phone, ShieldCheck, Truck } from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import SearchBar from './SearchBar';
import { CATEGORIES } from '@/data/categories';

export default function MobileHeader() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { cartCount, wishlist, openCart } = useStore();

  return (
    <div className="md:hidden bg-white border-b border-valuecart-border/80 sticky top-0 z-40">
      {/* Top row */}
      <div className="flex items-center justify-between px-4 h-14">
        {/* Hamburger */}
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="p-1.5 -ml-1 text-valuecart-navy hover:text-valuecart-green focus:outline-none transition-colors"
          aria-label="Open menu"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="relative w-8 h-8 shrink-0">
            <Image
              src="/images/valuecart-logo.png"
              alt="ValueCart - Everyday Essentials at Better Prices"
              width={32}
              height={32}
              className="object-contain"
              priority
            />
          </div>
          <span className="font-extrabold text-xl tracking-tight text-valuecart-navy leading-none">
            Value<span className="text-valuecart-green">Cart</span>
          </span>
        </Link>

        {/* Right Actions: Wishlist + Cart */}
        <div className="flex items-center space-x-1">
          <Link
            href="/account?tab=wishlist"
            className="relative p-2 text-valuecart-navy hover:text-rose-500 transition-colors"
            aria-label="Wishlist"
          >
            <Heart className="w-5 h-5" />
            {wishlist.length > 0 && (
              <span className="absolute 1 top-1.5 right-1 w-2 h-2 bg-rose-500 rounded-full" />
            )}
          </Link>

          <button
            type="button"
            onClick={openCart}
            className="relative p-2 text-valuecart-navy hover:text-valuecart-green transition-colors"
            aria-label={`Cart with ${cartCount} items`}
          >
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-valuecart-green text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center shadow-sm">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Second row: Search bar */}
      <div className="px-4 pb-3">
        <SearchBar isMobile={true} />
      </div>

      {/* Side Slide-out Drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setDrawerOpen(false)}
          />

          {/* Drawer content */}
          <div className="relative w-4/5 max-w-xs bg-white h-full shadow-2xl z-10 flex flex-col justify-between overflow-y-auto">
            <div>
              {/* Header */}
              <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-valuecart-navy text-white">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-white p-1 flex items-center justify-center shadow-xs">
                    <Image
                      src="/images/valuecart-logo.png"
                      alt="ValueCart"
                      width={28}
                      height={28}
                      className="object-contain"
                    />
                  </div>
                  <div>
                    <div className="font-bold text-sm leading-tight">ValueCart</div>
                    <div className="text-[11px] text-gray-300">Everyday Essentials • Better Prices</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  className="p-1 rounded-md text-gray-300 hover:text-white"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Categories Navigation */}
              <div className="p-3">
                <div className="text-xs font-bold uppercase tracking-wider text-valuecart-text-muted px-3 py-2">
                  Shop By Category
                </div>
                <div className="space-y-0.5">
                  {CATEGORIES.map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/category/${cat.slug}`}
                      onClick={() => setDrawerOpen(false)}
                      className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-valuecart-navy hover:bg-valuecart-green-surface hover:text-valuecart-green-dark transition-colors"
                    >
                      <span>{cat.name}</span>
                      <ChevronRight className="w-4 h-4 text-gray-300" />
                    </Link>
                  ))}
                </div>
              </div>

              {/* Help & Account links */}
              <div className="border-t border-gray-100 p-3">
                <div className="text-xs font-bold uppercase tracking-wider text-valuecart-text-muted px-3 py-2">
                  Account & Help
                </div>
                <div className="space-y-0.5">
                  <Link
                    href="/account"
                    onClick={() => setDrawerOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 text-sm text-valuecart-navy hover:text-valuecart-green"
                  >
                    <span>My Account & Orders</span>
                  </Link>
                  <Link
                    href="/cart"
                    onClick={() => setDrawerOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 text-sm text-valuecart-navy hover:text-valuecart-green"
                  >
                    <span>My Shopping Cart ({cartCount})</span>
                  </Link>
                  <Link
                    href="/products"
                    onClick={() => setDrawerOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 text-sm text-valuecart-navy hover:text-valuecart-green"
                  >
                    <span>Today&apos;s Special Deals</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Drawer footer */}
            <div className="p-4 bg-gray-50 border-t border-gray-100 text-xs text-valuecart-text-muted space-y-2">
              <div className="flex items-center gap-2 text-valuecart-green font-medium">
                <Truck className="w-4 h-4" />
                <span>Pan India Delivery (Kerala Priority)</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-valuecart-navy" />
                <span>Cash on Delivery Available</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
