'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  TrendingUp,
  Megaphone,
  LogOut,
  ExternalLink,
  ShieldCheck,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { useAdmin } from '@/context/AdminContext';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAdminAuthenticated, adminLoading, logout, orders } = useAdmin();

  // If on /admin/login, don't wrap with navigation
  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    if (!adminLoading && !isAdminAuthenticated && !isLoginPage) {
      router.push('/admin/login');
    }
  }, [isAdminAuthenticated, adminLoading, isLoginPage, router]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (adminLoading) {
    return (
      <div className="min-h-screen bg-valuecart-navy flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 border-3 border-valuecart-green border-t-transparent rounded-full animate-spin" />
        <span className="text-xs text-gray-300">Verifying administrator session...</span>
      </div>
    );
  }

  if (!isAdminAuthenticated) {
    return null; // Will redirect via useEffect
  }

  const pendingOrdersCount = orders.filter((o) =>
    ['new', 'payment_confirmed', 'ready_for_supplier'].includes(o.orderStatus)
  ).length;

  const navItems = [
    {
      name: 'Overview',
      href: '/admin',
      icon: LayoutDashboard,
      active: pathname === '/admin',
    },
    {
      name: 'Orders',
      href: '/admin/orders',
      icon: ShoppingBag,
      active: pathname.startsWith('/admin/orders'),
      badge: pendingOrdersCount > 0 ? pendingOrdersCount : undefined,
    },
    {
      name: 'Products & Economics',
      href: '/admin/products',
      icon: Package,
      active: pathname === '/admin/products',
    },
    {
      name: 'Profit Analytics',
      href: '/admin/analytics',
      icon: TrendingUp,
      active: pathname === '/admin/analytics',
    },
    {
      name: 'Marketing & Meta Ads',
      href: '/admin/marketing',
      icon: Megaphone,
      active: pathname === '/admin/marketing',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F0F2F5] text-valuecart-text-main flex flex-col md:flex-row font-sans">
      
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-valuecart-navy text-white flex flex-col justify-between shrink-0 shadow-xl border-r border-valuecart-navy-light/40">
        <div>
          {/* Brand header */}
          <div className="p-5 border-b border-valuecart-navy-light/50 flex items-center justify-between">
            <Link href="/admin" className="flex items-center gap-2.5">
              <div className="relative w-8 h-8 shrink-0">
                <Image
                  src="/images/valuecart-logo.png"
                  alt="ValueCart Admin"
                  width={32}
                  height={32}
                  className="object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-lg text-white leading-none">
                  Value<span className="text-emerald-400">Cart</span>
                </span>
                <span className="text-[9px] uppercase tracking-wider text-emerald-300 font-bold mt-0.5">
                  Admin Portal
                </span>
              </div>
            </Link>
            <span className="text-[10px] font-black uppercase tracking-wider bg-valuecart-green text-white px-2 py-0.5 rounded">
              ADMIN
            </span>
          </div>

          {/* Navigation links */}
          <nav className="p-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors ${
                    item.active
                      ? 'bg-valuecart-green text-white shadow-xs'
                      : 'text-gray-300 hover:text-white hover:bg-valuecart-navy-light/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 stroke-[2.2]" />
                    <span>{item.name}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-valuecart-navy-light/50 space-y-3">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between text-xs text-gray-300 hover:text-white bg-valuecart-navy-dark/80 px-3.5 py-2.5 rounded-xl border border-white/10 transition-colors"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5 text-valuecart-green-light" />
              <span>Live Storefront</span>
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
          </Link>

          <button
            type="button"
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 text-xs font-semibold text-rose-300 hover:text-rose-100 hover:bg-rose-950/40 px-3 py-2 rounded-xl transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Navbar */}
        <header className="bg-white border-b border-gray-200 h-16 px-6 sm:px-8 flex items-center justify-between shrink-0 shadow-2xs">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-valuecart-navy uppercase tracking-wider">
              ValueCart Business Operations Hub
            </span>
            <span className="text-gray-300">|</span>
            <span className="text-xs text-valuecart-text-muted flex items-center gap-1.5 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-valuecart-green" />
              Reselling &amp; Meta Ads Fulfillment
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="hidden sm:flex items-center gap-2 text-valuecart-text-muted bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-lg">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>System Live • Orders Synchronized</span>
            </div>
            <div className="flex items-center gap-2 text-valuecart-navy font-bold">
              <div className="w-8 h-8 rounded-full bg-valuecart-navy text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                VC
              </div>
              <span className="hidden md:inline">Operations Admin</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6 sm:p-8 flex-1">
          {children}
        </div>
      </main>

    </div>
  );
}
