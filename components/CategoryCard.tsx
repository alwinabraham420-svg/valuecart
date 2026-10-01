import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Category } from '@/types';
import { LayoutGrid } from 'lucide-react';

interface CategoryCardProps {
  category: Category;
  variant?: 'compact' | 'featured';
}

export default function CategoryCard({ category, variant = 'compact' }: CategoryCardProps) {
  if (variant === 'featured') {
    return (
      <Link
        href={`/category/${category.slug}`}
        className="group relative flex flex-col items-center justify-between p-4 sm:p-5 rounded-2xl bg-white border border-valuecart-border/70 hover:border-valuecart-green/40 hover:shadow-card-hover transition-all duration-200 overflow-hidden text-center"
      >
        <div className="relative w-full aspect-square max-w-[140px] mb-3 rounded-xl overflow-hidden bg-gray-50 flex items-center justify-center">
          <Image
            src={category.image}
            alt={category.name}
            fill
            sizes="(max-width: 640px) 140px, 180px"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        <div className="w-full">
          <h3 className="text-sm sm:text-base font-semibold text-valuecart-navy group-hover:text-valuecart-green transition-colors">
            {category.name}
          </h3>
          <span className="inline-flex items-center text-xs font-medium text-valuecart-green mt-1 group-hover:translate-x-0.5 transition-transform">
            Shop Now →
          </span>
        </div>
      </Link>
    );
  }

  // Quick navigation pill/card (matches the row right below Hero in Reference 01 and Reference 02)
  return (
    <Link
      href={`/category/${category.slug}`}
      className="group flex flex-col items-center justify-center p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-white hover:bg-valuecart-green-surface border border-valuecart-border/60 hover:border-valuecart-green/30 hover:shadow-sm transition-all duration-200 text-center"
    >
      <div className="relative w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl overflow-hidden bg-gray-50 mb-2 flex items-center justify-center shadow-2xs">
        {category.slug === 'everyday-essentials' ? (
          <div className="w-full h-full flex items-center justify-center bg-valuecart-green/10 text-valuecart-green">
            <LayoutGrid className="w-6 h-6 stroke-[2]" />
          </div>
        ) : (
          <Image
            src={category.image}
            alt={category.name}
            fill
            sizes="64px"
            className="object-cover group-hover:scale-110 transition-transform duration-300"
          />
        )}
      </div>
      <span className="text-[11px] sm:text-xs font-semibold text-valuecart-navy group-hover:text-valuecart-green transition-colors line-clamp-1 leading-tight">
        {category.name}
      </span>
    </Link>
  );
}
