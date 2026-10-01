'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MobileBottomNavigation from '@/components/MobileBottomNavigation';
import CartDrawer from '@/components/CartDrawer';
import ProductQuickView from '@/components/ProductQuickView';
import Toast from '@/components/Toast';

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');

  if (isAdmin) {
    return (
      <div className="min-h-screen bg-[#F4F6F9] text-valuecart-text-main flex flex-col font-sans">
        {children}
        <Toast />
      </div>
    );
  }

  return (
    <>
      {/* Header has both Desktop & Mobile versions */}
      <Header />

      {/* Main content with safe bottom padding for mobile navigation bar */}
      <main className="flex-1 pb-20 md:pb-0">{children}</main>

      {/* Footer */}
      <Footer />

      {/* Fixed Mobile Bottom Navigation */}
      <MobileBottomNavigation />

      {/* Interactive Drawers & Overlays */}
      <CartDrawer />
      <ProductQuickView />
      <Toast />
    </>
  );
}
