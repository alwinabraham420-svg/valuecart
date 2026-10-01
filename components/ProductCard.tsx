'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Star, Eye } from 'lucide-react';
import { Product } from '@/types';
import { useStore } from '@/context/StoreContext';
import WishlistButton from './WishlistButton';

interface ProductCardProps {
  product: Product;
  className?: string;
}

export default function ProductCard({ product, className = '' }: ProductCardProps) {
  const { addToCart, setQuickViewProduct } = useStore();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setQuickViewProduct(product);
  };

  const formatReviewCount = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  return (
    <div
      className={`group relative flex flex-col justify-between bg-white rounded-2xl p-3 sm:p-3.5 border border-valuecart-border/80 hover:border-valuecart-green/30 shadow-xs hover:shadow-card-hover transition-all duration-200 ${className}`}
    >
      {/* Product Image Area */}
      <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-[#F8F9FA] mb-3">
        {/* Stock / Discount Badge (Top Left) */}
        {product.slug !== 'stainless-steel-chopping-board' || product.stock <= 0 ? (
          <div className="absolute top-2 left-2 z-10 bg-gray-700/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
            Restock Soon
          </div>
        ) : product.discount > 0 ? (
          <div className="absolute top-2 left-2 z-10 bg-[#EF4444] text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow-xs">
            -{product.discount}%
          </div>
        ) : null}

        {/* Wishlist Button (Top Right) */}
        <div className="absolute top-2 right-2 z-10">
          <WishlistButton productId={product.id} />
        </div>

        {/* Quick View Button (Desktop hover) */}
        <button
          type="button"
          onClick={handleQuickView}
          className="hidden md:flex absolute bottom-2 left-1/2 -translate-x-1/2 z-10 items-center gap-1.5 bg-white/95 backdrop-blur-xs text-valuecart-navy hover:text-valuecart-green text-xs font-semibold px-3 py-1.5 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-all duration-200 translate-y-2 group-hover:translate-y-0"
          aria-label="Quick View"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Quick View</span>
        </button>

        {/* Product Image */}
        <Link href={`/product/${product.slug}`} className="block w-full h-full">
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 160px, (max-width: 1024px) 220px, 260px"
            className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
          />
        </Link>
      </div>

      {/* Product Information */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          {/* Title */}
          <Link href={`/product/${product.slug}`} className="block group-hover:text-valuecart-green transition-colors">
            <h3 className="text-xs sm:text-sm font-semibold text-valuecart-navy line-clamp-1 leading-snug">
              {product.shortName || product.name}
            </h3>
          </Link>

          {/* Rating & Reviews (Only show if real reviewCount > 0) */}
          {product.reviewCount > 0 ? (
            <div className="flex items-center gap-1.5 mt-1.5 text-xs">
              <div className="flex items-center gap-0.5 text-amber-500 font-semibold">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{product.rating}</span>
              </div>
              <span className="text-[11px] text-valuecart-text-muted">
                ({formatReviewCount(product.reviewCount)})
              </span>
            </div>
          ) : (
            <div className="text-[11px] text-valuecart-green font-medium mt-1">
              ✓ Verified Quality
            </div>
          )}

          {/* Pricing */}
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-base sm:text-lg font-bold text-valuecart-navy">
              ₹{product.price}
            </span>
            {product.originalPrice > product.price && (
              <span className="text-xs text-valuecart-text-muted line-through">
                ₹{product.originalPrice}
              </span>
            )}
          </div>
        </div>

        {/* Action Button: Live only for chopping board */}
        {product.slug === 'stainless-steel-chopping-board' && product.stock > 0 ? (
          <button
            type="button"
            onClick={handleAddToCart}
            className="mt-3 w-full bg-valuecart-green hover:bg-valuecart-green-dark active:scale-[0.98] text-white text-xs sm:text-sm font-semibold py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors duration-150 cursor-pointer"
            aria-label={`Add ${product.name} to Cart`}
          >
            <ShoppingCart className="w-4 h-4 stroke-[2.2]" />
            <span>Add to Cart</span>
          </button>
        ) : (
          <div className="mt-3 w-full bg-gray-100 text-gray-500 text-xs font-semibold py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 cursor-not-allowed select-none border border-gray-200/60">
            <span>Restocking Soon</span>
          </div>
        )}
      </div>
    </div>
  );
}
