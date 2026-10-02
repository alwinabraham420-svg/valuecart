'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Grid, Tag, User, MoreHorizontal } from 'lucide-react';

export default function MobileBottomNavigation() {
  const pathname = usePathname();

  // Hide bottom bar on product detail pages (which have sticky purchase bar),
  // checkout page (which has full sticky submission buttons), and admin panel.
  if (
    pathname.startsWith('/product/') ||
    pathname.startsWith('/checkout') ||
    pathname.startsWith('/admin')
  ) {
    return null;
  }

  const navItems = [
    { name: 'Home', href: '/', icon: Home, active: pathname === '/' },
    { name: 'Categories', href: '/products', icon: Grid, active: pathname.startsWith('/category') },
    { name: 'Deals', href: '/products?filter=deals', icon: Tag, active: pathname.includes('deals') },
    { name: 'Account', href: '/account', icon: User, active: pathname === '/account' },
    { name: 'More', href: '/products', icon: MoreHorizontal, active: pathname === '/products' && !pathname.includes('deals') },
  ];

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-valuecart-border/80 px-2 py-1 shadow-lg"
      style={{ paddingBottom: 'max(0.35rem, env(safe-area-inset-bottom))' }}
      aria-label="Mobile Navigation"
    >
      <div className="grid grid-cols-5 h-13 items-center">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.active;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 transition-all group ${
                isActive ? 'text-valuecart-green' : 'text-slate-500 hover:text-valuecart-navy'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform duration-150 ${
                    isActive ? 'scale-110 stroke-[2.4]' : 'group-hover:scale-105'
                  }`}
                />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-valuecart-green rounded-full" />
                )}
              </div>
              <span
                className={`text-[11px] mt-1 font-medium leading-none ${
                  isActive ? 'font-semibold text-valuecart-green' : 'text-slate-500'
                }`}
              >
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
