'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Phone,
  ChevronDown,
  ShieldCheck,
  CreditCard,
  Truck,
  MapPin,
} from 'lucide-react';

export default function Footer() {
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [modalContent, setModalContent] = useState<{ title: string; content: string[] } | null>(null);

  const toggleSection = (name: string) => {
    setOpenSection((prev) => (prev === name ? null : name));
  };

  const policyDetails: Record<string, { title: string; content: string[] }> = {
    'Shipping Policy': {
      title: 'ValueCart Shipping & Delivery Policy',
      content: [
        'Free Pan-India Delivery: We provide complimentary fast shipping across 19,000+ Indian pin codes.',
        'Dispatch Time: Orders are processed and dispatched within 24 hours from our fulfillment center in Kochi, Kerala.',
        'Delivery Timelines: South India: 2-3 business days. Rest of India: 4-6 business days.',
        'Live Tracking: As soon as your order is handed over to our courier partners (BlueDart, Delhivery, Xpressbees), a real-time tracking link is sent via SMS and Email.',
      ],
    },
    'Help Center': {
      title: 'Customer Help Center',
      content: [
        'Have a question about your order, delivery, or product? Our support team is here to help!',
        'Email Support: support@valuecart.in (24-hour turnaround)',
        'Phone / WhatsApp: +91 98765 43210 (Mon - Sat, 9:00 AM - 6:00 PM IST)',
        'Address: ValueCart Retail India, Infopark Technology Hub, Kochi, Kerala - 682042.',
      ],
    },
    'Contact Us': {
      title: 'Contact ValueCart',
      content: [
        'Email: support@valuecart.in',
        'Helpline: +91 98765 43210',
        'Customer Support Hours: Monday to Saturday, 9:00 AM to 6:00 PM IST',
        'Office: ValueCart Retail Hub, Kochi, Kerala, India.',
      ],
    },
    'FAQs': {
      title: 'Frequently Asked Questions',
      content: [
        '1. Is Cash on Delivery (COD) available? Yes, COD is available for almost all serviceable pin codes across India with zero advance payment.',
        '2. Is the Stainless Steel Chopping Board made of genuine 304 food-grade steel? Yes! It is certified heavy-duty 304 stainless steel that is rust-free, non-porous, antibacterial, and knife-friendly.',
        '3. What is your return and refund policy? We offer a 7-day hassle-free replacement or full refund if your item arrives damaged or defective.',
        '4. How can I track my shipment? You can track your order status anytime from your ValueCart account page or via the SMS tracking link sent upon order dispatch.',
      ],
    },
    'About ValueCart': {
      title: 'About ValueCart Retail India',
      content: [
        'ValueCart is built to deliver everyday essential products directly from verified manufacturers to Indian homes at honest, fair prices.',
        'We eliminate middleman markups, exorbitant distributor margins, and unnecessary retail overheads so you get premium kitchenware, daily essentials, and lifestyle goods at unbeatable value.',
        'Headquartered in Kochi, Kerala, ValueCart serves customers across all 28 states and 8 union territories.',
      ],
    },
    'Our Story': {
      title: 'Our Story & Mission',
      content: [
        'Founded with the belief that Indian households deserve durable, non-toxic, and hygienic products without overpaying.',
        'From our flagship 304 Stainless Steel Chopping Board to daily essentials, we meticulously quality-test each batch before dispatch.',
      ],
    },
    'Terms & Conditions': {
      title: 'Terms & Conditions',
      content: [
        '1. All orders placed on ValueCart are subject to product availability and confirmation.',
        '2. Prices listed on the website are in Indian Rupees (INR) and are inclusive of applicable GST.',
        '3. For Cash on Delivery orders, customers are expected to verify order details prior to delivery.',
        '4. Any disputes are subject to the exclusive jurisdiction of the courts in Ernakulam, Kerala.',
      ],
    },
    'Privacy Policy': {
      title: 'Privacy Policy',
      content: [
        '1. ValueCart strictly respects customer privacy. We will NEVER sell or trade your phone number, delivery address, or personal data to third-party marketers.',
        '2. Your delivery details are solely used for fulfilling your order, providing SMS dispatch notifications, and customer service.',
        '3. All online payments are 256-bit SSL encrypted and securely processed through RBI-authorized payment aggregators.',
      ],
    },
  };

  const openPolicy = (name: string, e: React.MouseEvent) => {
    if (policyDetails[name]) {
      e.preventDefault();
      setModalContent(policyDetails[name]);
    }
  };

  const shopLinks = [
    { name: 'All Categories', href: '/products' },
    { name: 'Men Fashion', href: '/category/men-fashion' },
    { name: 'Women Fashion', href: '/category/women-fashion' },
    { name: 'Home & Kitchen', href: '/category/home-kitchen' },
    { name: 'Electronics', href: '/category/electronics' },
    { name: 'Beauty & Care', href: '/category/beauty-care' },
  ];

  const customerCareLinks = [
    { name: 'Track Order', href: '/account' },
    { name: 'Returns & Refunds', href: '/account' },
    { name: 'Shipping Policy', href: '#shipping', isModal: true },
    { name: 'Help Center', href: '#help', isModal: true },
    { name: 'Contact Us', href: '#contact', isModal: true },
    { name: 'FAQs', href: '#faq', isModal: true },
  ];

  const aboutLinks = [
    { name: 'About ValueCart', href: '#about', isModal: true },
    { name: 'Our Story', href: '#story', isModal: true },
    { name: 'Terms & Conditions', href: '#terms', isModal: true },
    { name: 'Privacy Policy', href: '#privacy', isModal: true },
    { name: 'Sitemap', href: '/sitemap.xml', isModal: false },
  ];

  return (
    <footer className="bg-white border-t border-valuecart-border/80 pt-10 sm:pt-12 pb-8 text-valuecart-text-main">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-6 pb-10 border-b border-gray-100">
          
          {/* Col 1: Brand Info */}
          <div className="lg:col-span-1 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="relative w-9 h-9 shrink-0">
                <Image
                  src="/images/valuecart-logo.png"
                  alt="ValueCart Logo"
                  width={36}
                  height={36}
                  className="object-contain"
                />
              </div>
              <span className="font-extrabold text-2xl tracking-tight text-valuecart-navy leading-none">
                Value<span className="text-valuecart-green">Cart</span>
              </span>
            </Link>
            <p className="text-xs text-valuecart-text-muted leading-relaxed">
              Quality products. Better prices. <br />
              Your everyday shopping destination.
            </p>

            {/* Social Links */}
            <div className="flex items-center space-x-3 pt-1 text-valuecart-navy">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-valuecart-green hover:text-white flex items-center justify-center transition-colors"
                aria-label="Instagram"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-valuecart-green hover:text-white flex items-center justify-center transition-colors"
                aria-label="Facebook"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-valuecart-green hover:text-white flex items-center justify-center transition-colors"
                aria-label="YouTube"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
              <a
                href="https://whatsapp.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-valuecart-green hover:text-white flex items-center justify-center transition-colors"
                aria-label="WhatsApp"
              >
                <Phone className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Col 2: Shop Links */}
          <div className="space-y-3">
            <div
              className="flex items-center justify-between cursor-pointer md:cursor-default"
              onClick={() => toggleSection('shop')}
            >
              <h4 className="text-xs font-bold uppercase tracking-wider text-valuecart-navy">
                Shop
              </h4>
              <ChevronDown
                className={`w-4 h-4 md:hidden transition-transform ${
                  openSection === 'shop' ? 'rotate-180' : ''
                }`}
              />
            </div>
            <ul
              className={`space-y-2 text-xs text-valuecart-text-muted ${
                openSection === 'shop' ? 'block' : 'hidden md:block'
              }`}
            >
              {shopLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="hover:text-valuecart-green transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Customer Care */}
          <div className="space-y-3">
            <div
              className="flex items-center justify-between cursor-pointer md:cursor-default"
              onClick={() => toggleSection('care')}
            >
              <h4 className="text-xs font-bold uppercase tracking-wider text-valuecart-navy">
                Customer Care
              </h4>
              <ChevronDown
                className={`w-4 h-4 md:hidden transition-transform ${
                  openSection === 'care' ? 'rotate-180' : ''
                }`}
              />
            </div>
            <ul
              className={`space-y-2 text-xs text-valuecart-text-muted ${
                openSection === 'care' ? 'block' : 'hidden md:block'
              }`}
            >
              {customerCareLinks.map((link) => (
                <li key={link.name}>
                  {link.isModal ? (
                    <button
                      type="button"
                      onClick={(e) => openPolicy(link.name, e)}
                      className="hover:text-valuecart-green transition-colors text-left cursor-pointer"
                    >
                      {link.name}
                    </button>
                  ) : (
                    <Link
                      href={link.href}
                      className="hover:text-valuecart-green transition-colors"
                    >
                      {link.name}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: About */}
          <div className="space-y-3">
            <div
              className="flex items-center justify-between cursor-pointer md:cursor-default"
              onClick={() => toggleSection('about')}
            >
              <h4 className="text-xs font-bold uppercase tracking-wider text-valuecart-navy">
                About
              </h4>
              <ChevronDown
                className={`w-4 h-4 md:hidden transition-transform ${
                  openSection === 'about' ? 'rotate-180' : ''
                }`}
              />
            </div>
            <ul
              className={`space-y-2 text-xs text-valuecart-text-muted ${
                openSection === 'about' ? 'block' : 'hidden md:block'
              }`}
            >
              {aboutLinks.map((link) => (
                <li key={link.name}>
                  {link.isModal ? (
                    <button
                      type="button"
                      onClick={(e) => openPolicy(link.name, e)}
                      className="hover:text-valuecart-green transition-colors text-left cursor-pointer"
                    >
                      {link.name}
                    </button>
                  ) : (
                    <Link
                      href={link.href}
                      className="hover:text-valuecart-green transition-colors"
                    >
                      {link.name}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Col 5: Secure Payments & Delivery Across India */}
          <div className="space-y-4">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-valuecart-navy mb-2">
                Secure Payments
              </h4>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-bold bg-gray-100 text-valuecart-navy px-2.5 py-1 rounded border border-gray-200">
                  UPI
                </span>
                <span className="text-[11px] font-bold bg-gray-100 text-blue-700 px-2.5 py-1 rounded border border-gray-200">
                  VISA
                </span>
                <span className="text-[11px] font-bold bg-gray-100 text-red-600 px-2.5 py-1 rounded border border-gray-200">
                  Mastercard
                </span>
                <span className="text-[11px] font-bold bg-gray-100 text-emerald-700 px-2.5 py-1 rounded border border-gray-200">
                  RuPay
                </span>
              </div>
            </div>

            <div className="pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-valuecart-navy mb-2">
                We Deliver Across India
              </h4>
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-valuecart-green-surface border border-valuecart-green/20">
                <div className="w-7 h-7 rounded-lg bg-valuecart-green text-white flex items-center justify-center shrink-0">
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-valuecart-navy">
                    Pan India Delivery
                  </div>
                  <div className="text-[11px] text-valuecart-text-muted">
                    Safe &amp; Reliable with live tracking
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Copyright */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-valuecart-text-muted gap-3">
          <p>© {new Date().getFullYear()} VALUECART RETAIL INDIA. All rights reserved.</p>
          <div className="flex items-center space-x-4">
            <span>Made with precision for Indian shoppers</span>
            <span>•</span>
            <span className="text-valuecart-green font-medium">Kerala • Pan India</span>
          </div>
        </div>

      </div>

      {/* Policy & Support Detail Modal */}
      {modalContent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full max-h-[85vh] overflow-y-auto shadow-2xl border border-gray-100 relative animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-extrabold text-base sm:text-lg text-valuecart-navy">
                {modalContent.title}
              </h3>
              <button
                type="button"
                onClick={() => setModalContent(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 text-gray-500 hover:text-valuecart-navy transition-colors cursor-pointer text-sm font-bold"
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>
            <div className="mt-4 space-y-2.5 text-xs sm:text-sm text-valuecart-text-main leading-relaxed">
              {modalContent.content.map((paragraph, idx) => (
                <div key={idx} className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-valuecart-text-muted">
                  {paragraph}
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setModalContent(null)}
                className="bg-valuecart-navy hover:bg-valuecart-navy-light text-white font-bold px-6 py-2.5 rounded-full text-xs transition-colors cursor-pointer shadow-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
}
