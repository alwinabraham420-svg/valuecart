'use client';

import React from 'react';
import { Heart } from 'lucide-react';
import { useStore } from '@/context/StoreContext';

interface WishlistButtonProps {
  productId: string;
  className?: string;
  iconSize?: number;
}

export default function WishlistButton({
  productId,
  className = '',
  iconSize = 18,
}: WishlistButtonProps) {
  const { isInWishlist, toggleWishlist } = useStore();
  const active = isInWishlist(productId);

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleWishlist(productId);
      }}
      className={`group relative flex items-center justify-center p-2 rounded-full transition-all duration-200 ${
        active
          ? 'bg-rose-50 text-rose-500 scale-105'
          : 'bg-white/90 hover:bg-white text-gray-500 hover:text-rose-500 shadow-sm'
      } ${className}`}
      aria-label={active ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      <Heart
        size={iconSize}
        className={`transition-transform duration-200 group-hover:scale-110 ${
          active ? 'fill-rose-500 text-rose-500' : 'text-gray-400 group-hover:text-rose-500'
        }`}
      />
    </button>
  );
}
