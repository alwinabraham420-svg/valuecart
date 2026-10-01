'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Search, X, TrendingUp } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { PRODUCTS } from '@/data/products';
import { CATEGORIES } from '@/data/categories';
import Image from 'next/image';

interface SearchBarProps {
  isMobile?: boolean;
}

export default function SearchBar({ isMobile = false }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Close search suggestions on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const trimmed = query.trim().toLowerCase();
  const matchingProducts = trimmed
    ? PRODUCTS.filter(
        (p) =>
          p.name.toLowerCase().includes(trimmed) ||
          p.category.toLowerCase().includes(trimmed) ||
          p.description.toLowerCase().includes(trimmed)
      ).slice(0, 5)
    : [];

  const matchingCategories = trimmed
    ? CATEGORIES.filter((c) => c.name.toLowerCase().includes(trimmed)).slice(0, 3)
    : [];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (trimmed) {
      setIsOpen(false);
      router.push(`/products?q=${encodeURIComponent(trimmed)}`);
    }
  };

  return (
    <div ref={searchContainerRef} className="relative w-full">
      <form onSubmit={handleSearchSubmit} className="relative flex items-center">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search for products, brands and more..."
          className={`w-full bg-[#F3F4F6] text-valuecart-text-main placeholder:text-gray-400 rounded-full pl-5 pr-14 focus:outline-none focus:ring-2 focus:ring-valuecart-green/40 focus:bg-white transition-all text-sm ${
            isMobile ? 'h-11' : 'h-12'
          }`}
          aria-label="Search products"
        />

        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            className="absolute right-12 text-gray-400 hover:text-valuecart-navy p-1 transition-colors"
            aria-label="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        <button
          type="submit"
          className="absolute right-1.5 w-9 h-9 rounded-full bg-valuecart-green hover:bg-valuecart-green-dark text-white flex items-center justify-center transition-colors shadow-sm"
          aria-label="Search"
        >
          <Search className="w-4 h-4 stroke-[2.2]" />
        </button>
      </form>

      {/* Auto-suggest dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-card border border-valuecart-border/80 overflow-hidden z-50 animate-fade-in max-h-[420px] overflow-y-auto">
          {trimmed ? (
            <div>
              {matchingCategories.length > 0 && (
                <div className="p-3 border-b border-gray-100 bg-gray-50/50">
                  <div className="text-xs font-semibold text-valuecart-navy uppercase tracking-wider mb-2">
                    Categories
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {matchingCategories.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          setIsOpen(false);
                          router.push(`/category/${cat.slug}`);
                        }}
                        className="text-xs bg-white hover:bg-valuecart-green hover:text-white border border-gray-200 px-3 py-1.5 rounded-full transition-colors font-medium text-valuecart-navy"
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {matchingProducts.length > 0 ? (
                <div className="py-2">
                  <div className="px-4 py-1.5 text-xs font-semibold text-valuecart-text-muted uppercase tracking-wider">
                    Products
                  </div>
                  {matchingProducts.map((prod) => (
                    <button
                      key={prod.id}
                      type="button"
                      onClick={() => {
                        setIsOpen(false);
                        router.push(`/product/${prod.slug}`);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-left"
                    >
                      <div className="relative w-11 h-11 rounded-lg overflow-hidden bg-gray-100 shrink-0 border border-gray-100">
                        <Image
                          src={prod.image}
                          alt={prod.name}
                          fill
                          sizes="44px"
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-valuecart-navy truncate">
                          {prod.name}
                        </div>
                        <div className="text-xs text-valuecart-text-muted flex items-center gap-2">
                          <span>{prod.category}</span>
                          <span className="font-semibold text-valuecart-green">
                            ₹{prod.price}
                          </span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-sm text-valuecart-text-muted">
                  No products found for &ldquo;{query}&rdquo;.
                </div>
              )}
            </div>
          ) : (
            <div className="p-4">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-valuecart-text-muted uppercase tracking-wider mb-2.5">
                <TrendingUp className="w-3.5 h-3.5 text-valuecart-green" />
                <span>Trending Searches</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  "Men's Casual Shirt",
                  'Cookware Set',
                  'Laptop Backpack',
                  'Wireless Earbuds',
                  'Water Bottle',
                  "Women's Kurti",
                ].map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => {
                      setQuery(term);
                      setIsOpen(false);
                      router.push(`/products?q=${encodeURIComponent(term)}`);
                    }}
                    className="text-xs bg-gray-100 hover:bg-valuecart-green-tint hover:text-valuecart-green-dark px-3 py-1.5 rounded-full transition-colors text-valuecart-navy font-medium"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
