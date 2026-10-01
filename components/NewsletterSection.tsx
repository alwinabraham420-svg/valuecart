'use client';

import React, { useState } from 'react';
import { Mail, CheckCircle } from 'lucide-react';
import { useStore } from '@/context/StoreContext';

export default function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const { addToast } = useStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && email.includes('@')) {
      setSubscribed(true);
      addToast('Subscribed!', 'You will now receive exclusive ValueCart deals and updates.', 'success');
      setEmail('');
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-7">
      <div className="rounded-2xl md:rounded-3xl bg-valuecart-navy p-6 sm:p-8 md:p-10 text-white shadow-card flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Left copy */}
        <div className="max-w-md text-center md:text-left">
          <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Get the Best Deals First
          </h3>
          <p className="text-xs sm:text-sm text-gray-300 mt-1.5 font-medium">
            Subscribe to get exclusive offers, new arrivals and secret drops.
          </p>
        </div>

        {/* Right Form */}
        <div className="w-full md:w-auto flex-1 max-w-md">
          {subscribed ? (
            <div className="flex items-center gap-2 bg-valuecart-green/20 border border-valuecart-green/40 px-4 py-3 rounded-full text-white text-xs sm:text-sm font-medium justify-center">
              <CheckCircle className="w-4 h-4 text-valuecart-green-light" />
              <span>Thank you for subscribing! Check your inbox soon.</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  required
                  className="w-full h-11 sm:h-12 pl-4 pr-4 rounded-full bg-white text-valuecart-navy placeholder:text-gray-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-valuecart-green shadow-inner"
                />
              </div>
              <button
                type="submit"
                className="h-11 sm:h-12 px-6 rounded-full bg-valuecart-green hover:bg-valuecart-green-dark text-white font-semibold text-xs sm:text-sm shrink-0 transition-colors shadow-sm"
              >
                Subscribe
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
