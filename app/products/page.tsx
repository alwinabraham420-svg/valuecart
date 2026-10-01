'use client';

import React, { useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Filter, SlidersHorizontal, ArrowUpDown, ChevronRight, X } from 'lucide-react';
import { PRODUCTS } from '@/data/products';
import { CATEGORIES } from '@/data/categories';
import ProductCard from '@/components/ProductCard';

function ProductsContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const filterParam = searchParams.get('filter') || '';
  const categoryParam = searchParams.get('category') || '';

  const [selectedCategory, setSelectedCategory] = useState<string>(categoryParam || 'all');
  const [sortBy, setSortBy] = useState<string>('featured');
  const [maxPrice, setMaxPrice] = useState<number>(2000);
  const [onlyDeals, setOnlyDeals] = useState<boolean>(filterParam === 'deals');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Filtered & sorted products
  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter((p) => {
      // Search query filter
      if (query) {
        const q = query.toLowerCase();
        const matches =
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q);
        if (!matches) return false;
      }

      // Category filter
      if (selectedCategory !== 'all' && p.categorySlug !== selectedCategory) {
        return false;
      }

      // Deals filter
      if (onlyDeals && !p.deal) {
        return false;
      }

      // Price filter
      if (p.price > maxPrice) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'discount') return b.discount - a.discount;
      return 0; // Default
    });
  }, [query, selectedCategory, onlyDeals, maxPrice, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-valuecart-text-muted mb-4">
        <Link href="/" className="hover:text-valuecart-green">
          Home
        </Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-valuecart-navy font-semibold">
          {query ? `Search: "${query}"` : 'All Products'}
        </span>
      </div>

      {/* Page Title & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-valuecart-navy">
            {query ? `Results for "${query}"` : 'Shop All Products'}
          </h1>
          <p className="text-xs sm:text-sm text-valuecart-text-muted mt-1">
            Showing <strong className="text-valuecart-navy">{filteredProducts.length}</strong> items
          </p>
        </div>

        {/* Sort & Mobile Filter Buttons */}
        <div className="flex items-center gap-3 self-end sm:self-auto">
          {/* Mobile Filter Trigger */}
          <button
            type="button"
            onClick={() => setMobileFilterOpen(true)}
            className="md:hidden flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-valuecart-navy shadow-xs"
          >
            <Filter className="w-3.5 h-3.5 text-valuecart-green" />
            <span>Filters</span>
          </button>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 shadow-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-valuecart-text-muted" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-xs sm:text-sm font-medium text-valuecart-navy bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="featured">Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="discount">Biggest Discount</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content Layout with Sidebar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-6">
        
        {/* Desktop Sidebar Filters */}
        <div className="hidden md:block md:col-span-1 space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-valuecart-border/80 shadow-xs space-y-6 sticky top-24">
            
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-bold text-sm text-valuecart-navy flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-valuecart-green" />
                <span>Filters</span>
              </h3>
              {(selectedCategory !== 'all' || onlyDeals || maxPrice < 2000) && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory('all');
                    setOnlyDeals(false);
                    setMaxPrice(2000);
                  }}
                  className="text-xs text-rose-500 hover:underline font-medium"
                >
                  Reset
                </button>
              )}
            </div>

            {/* Categories Filter */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-valuecart-navy mb-2.5">
                Category
              </h4>
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => setSelectedCategory('all')}
                  className={`w-full text-left text-xs font-medium px-2.5 py-1.5 rounded-lg transition-colors ${
                    selectedCategory === 'all'
                      ? 'bg-valuecart-green text-white font-semibold'
                      : 'text-valuecart-text-muted hover:bg-gray-100 hover:text-valuecart-navy'
                  }`}
                >
                  All Categories
                </button>
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.slug)}
                    className={`w-full text-left text-xs font-medium px-2.5 py-1.5 rounded-lg transition-colors ${
                      selectedCategory === cat.slug
                        ? 'bg-valuecart-green text-white font-semibold'
                        : 'text-valuecart-text-muted hover:bg-gray-100 hover:text-valuecart-navy'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Filter */}
            <div>
              <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-valuecart-navy mb-2">
                <span>Max Price</span>
                <span className="text-valuecart-green font-bold">₹{maxPrice}</span>
              </div>
              <input
                type="range"
                min="200"
                max="2000"
                step="50"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-valuecart-green cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-valuecart-text-muted mt-1">
                <span>₹200</span>
                <span>₹2,000</span>
              </div>
            </div>

            {/* Deal Filter Toggle */}
            <div className="pt-2 border-t border-gray-100">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={onlyDeals}
                  onChange={(e) => setOnlyDeals(e.target.checked)}
                  className="rounded text-valuecart-green focus:ring-valuecart-green w-4 h-4"
                />
                <span className="text-xs font-semibold text-valuecart-navy">
                  Show Only Deals &amp; Discounts
                </span>
              </label>
            </div>

          </div>
        </div>

        {/* Product Grid Area */}
        <div className="md:col-span-3">
          {filteredProducts.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
              <p className="text-base font-semibold text-valuecart-navy">
                No products found matching your filters.
              </p>
              <p className="text-xs text-valuecart-text-muted mt-1">
                Try widening your price range or selecting another category.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('all');
                  setOnlyDeals(false);
                  setMaxPrice(2000);
                }}
                className="mt-4 bg-valuecart-green text-white text-xs font-bold px-5 py-2.5 rounded-full"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Mobile Filter Slide Drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setMobileFilterOpen(false)}
          />
          <div className="relative w-4/5 max-w-xs bg-white h-full ml-auto p-5 overflow-y-auto space-y-6 flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <h3 className="font-bold text-sm text-valuecart-navy">Filters</h3>
                <button
                  type="button"
                  onClick={() => setMobileFilterOpen(false)}
                  className="p-1 text-gray-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Categories */}
              <div>
                <h4 className="text-xs font-bold text-valuecart-navy mb-2">Category</h4>
                <div className="space-y-1">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCategory('all');
                      setMobileFilterOpen(false);
                    }}
                    className={`w-full text-left text-xs p-2 rounded-lg ${
                      selectedCategory === 'all'
                        ? 'bg-valuecart-green text-white'
                        : 'text-valuecart-navy'
                    }`}
                  >
                    All Categories
                  </button>
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setSelectedCategory(cat.slug);
                        setMobileFilterOpen(false);
                      }}
                      className={`w-full text-left text-xs p-2 rounded-lg ${
                        selectedCategory === cat.slug
                          ? 'bg-valuecart-green text-white'
                          : 'text-valuecart-navy'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price */}
              <div>
                <div className="flex justify-between text-xs font-bold text-valuecart-navy mb-2">
                  <span>Max Price</span>
                  <span className="text-valuecart-green">₹{maxPrice}</span>
                </div>
                <input
                  type="range"
                  min="200"
                  max="2000"
                  step="50"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-valuecart-green"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={() => setMobileFilterOpen(false)}
              className="w-full bg-valuecart-green text-white py-3 rounded-xl font-bold text-sm"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-sm text-valuecart-text-muted">Loading products...</div>}>
      <ProductsContent />
    </Suspense>
  );
}

