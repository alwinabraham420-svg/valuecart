'use client';

import React, { useState, use } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRight, ArrowUpDown } from 'lucide-react';
import { CATEGORIES } from '@/data/categories';
import { PRODUCTS } from '@/data/products';
import ProductCard from '@/components/ProductCard';

export default function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;
  const category = CATEGORIES.find((c) => c.slug === slug);

  const [sortBy, setSortBy] = useState('featured');

  if (!category) {
    notFound();
  }

  const categoryProducts = PRODUCTS.filter((p) => p.categorySlug === slug).sort(
    (a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'discount') return b.discount - a.discount;
      return 0;
    }
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-valuecart-text-muted mb-4">
        <Link href="/" className="hover:text-valuecart-green">
          Home
        </Link>
        <ChevronRight className="w-3 h-3" />
        <Link href="/products" className="hover:text-valuecart-green">
          Categories
        </Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-valuecart-navy font-semibold">{category.name}</span>
      </nav>

      {/* Category Hero Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-valuecart-navy to-valuecart-navy-light p-6 sm:p-10 text-white shadow-soft mb-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-valuecart-green-light bg-valuecart-navy-dark px-3 py-1 rounded-full">
            Category Collection
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold mt-3">
            {category.name}
          </h1>
          <p className="text-xs sm:text-sm text-gray-200 mt-2 max-w-lg">
            Explore quality {category.name.toLowerCase()} essentials curated for everyday life at unbeatable prices.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/20 text-center">
            <span className="text-xl sm:text-2xl font-black block">
              {categoryProducts.length > 0 ? categoryProducts.length : '100+'}
            </span>
            <span className="text-[11px] text-gray-300">Items Available</span>
          </div>
        </div>
      </div>

      {/* Sorting bar */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-200 mb-6">
        <div className="text-xs sm:text-sm text-valuecart-text-muted">
          Showing <strong className="text-valuecart-navy">{categoryProducts.length}</strong> products
        </div>

        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-1.5 shadow-xs">
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

      {/* Products Grid */}
      {categoryProducts.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {categoryProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-12 text-center border border-gray-100">
          <p className="text-base font-semibold text-valuecart-navy">
            More {category.name} products arriving soon!
          </p>
          <p className="text-xs text-valuecart-text-muted mt-1">
            Check out our other categories in the meantime.
          </p>
          <Link
            href="/products"
            className="inline-block mt-4 bg-valuecart-green text-white text-xs font-bold px-6 py-2.5 rounded-full"
          >
            Explore All Products
          </Link>
        </div>
      )}
    </div>
  );
}
