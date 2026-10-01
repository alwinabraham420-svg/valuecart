import React from 'react';
import { CATEGORIES } from '@/data/categories';
import CategoryCard from './CategoryCard';

export default function CategoryGrid() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      {/* Container with soft card styling matching Reference 01 and Reference 02 */}
      <div className="bg-white rounded-2xl md:rounded-3xl p-3 sm:p-5 shadow-soft border border-valuecart-border/70">
        {/* Desktop: 9-column grid / Flex */}
        <div className="hidden lg:grid grid-cols-9 gap-3 xl:gap-4 items-center">
          {CATEGORIES.map((cat) => (
            <CategoryCard key={cat.id} category={cat} variant="compact" />
          ))}
        </div>

        {/* Tablet / Medium screens */}
        <div className="hidden md:grid lg:hidden grid-cols-5 gap-3">
          {CATEGORIES.slice(0, 10).map((cat) => (
            <CategoryCard key={cat.id} category={cat} variant="compact" />
          ))}
        </div>

        {/* Mobile: 4-column grid matching Reference 02 */}
        <div className="grid grid-cols-4 md:hidden gap-2 sm:gap-2.5">
          {CATEGORIES.map((cat) => (
            <CategoryCard key={cat.id} category={cat} variant="compact" />
          ))}
        </div>
      </div>
    </section>
  );
}
