'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { X, Star, ShoppingCart, ArrowRight, ShieldCheck, Truck, Check, Minus, Plus } from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import WishlistButton from './WishlistButton';

export default function ProductQuickView() {
  const router = useRouter();
  const { quickViewProduct, setQuickViewProduct, addToCart, buyNow } = useStore();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | undefined>(undefined);
  const [quantity, setQuantity] = useState(1);

  if (!quickViewProduct) return null;

  const product = quickViewProduct;
  const images = product.images && product.images.length > 0 ? product.images : [product.image];

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedSize);
    setQuickViewProduct(null);
  };

  const handleBuyNow = () => {
    buyNow(product, quantity, selectedSize);
    setQuickViewProduct(null);
    router.push('/checkout');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={() => setQuickViewProduct(null)}
      />

      <div className="min-h-full flex items-center justify-center p-4">
        <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-valuecart-border/80 z-10 animate-fade-in">
          {/* Close button */}
          <button
            type="button"
            onClick={() => setQuickViewProduct(null)}
            className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/80 hover:bg-white text-valuecart-navy shadow-sm transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2">
            
            {/* Gallery Column */}
            <div className="p-6 bg-gray-50 flex flex-col justify-between">
              <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-white border border-gray-200">
                <Image
                  src={images[selectedImageIndex] || product.image}
                  alt={product.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 400px"
                  className="object-cover"
                />
                <div className="absolute top-3 left-3">
                  <span className="bg-rose-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-xs">
                    -{product.discount}% OFF
                  </span>
                </div>
                <div className="absolute top-3 right-3">
                  <WishlistButton productId={product.id} />
                </div>
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-2 mt-4 overflow-x-auto no-scrollbar">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`relative w-16 h-16 rounded-xl overflow-hidden bg-white border-2 shrink-0 transition-all ${
                        selectedImageIndex === idx
                          ? 'border-valuecart-green ring-2 ring-valuecart-green/30'
                          : 'border-gray-200 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <Image
                        src={img}
                        alt=""
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info Column */}
            <div className="p-6 sm:p-8 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-valuecart-green uppercase tracking-wider">
                  {product.category}
                </span>

                <h2 className="text-xl sm:text-2xl font-bold text-valuecart-navy mt-1">
                  {product.name}
                </h2>

                {/* Rating */}
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center gap-1 bg-amber-50 text-amber-600 px-2 py-0.5 rounded-md text-xs font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    <span>{product.rating}</span>
                  </div>
                  <span className="text-xs text-valuecart-text-muted">
                    ({product.reviewCount} customer reviews)
                  </span>
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-3 mt-4">
                  <span className="text-2xl sm:text-3xl font-extrabold text-valuecart-navy">
                    ₹{product.price}
                  </span>
                  {product.originalPrice > product.price && (
                    <span className="text-base text-gray-400 line-through">
                      ₹{product.originalPrice}
                    </span>
                  )}
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    Save ₹{product.originalPrice - product.price}
                  </span>
                </div>

                {/* Short description */}
                <p className="text-xs sm:text-sm text-valuecart-text-muted mt-3 line-clamp-3 leading-relaxed">
                  {product.description}
                </p>

                {/* Sizes selector */}
                {product.variants?.sizes && (
                  <div className="mt-4">
                    <label className="block text-xs font-semibold text-valuecart-navy mb-2">
                      Select Size:
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {product.variants.sizes.map((size) => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => setSelectedSize(size)}
                          className={`w-10 h-10 rounded-xl text-xs font-semibold border flex items-center justify-center transition-all ${
                            (selectedSize || product.variants?.sizes?.[0]) === size
                              ? 'border-valuecart-green bg-valuecart-green text-white shadow-xs'
                              : 'border-gray-200 text-valuecart-navy hover:border-gray-400'
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quantity Selector */}
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-valuecart-navy">
                      Quantity:
                    </label>
                    <span className="text-xs font-bold text-valuecart-navy">
                      Total: ₹{product.price * quantity}
                    </span>
                  </div>
                  <div className="inline-flex items-center border-2 border-gray-200 rounded-xl bg-white shadow-xs">
                    <button
                      type="button"
                      onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                      disabled={quantity <= 1}
                      className="w-10 h-10 flex items-center justify-center text-valuecart-navy hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent rounded-l-lg transition-colors text-base font-bold"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-12 text-center text-sm font-extrabold text-valuecart-navy select-none">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity((prev) => Math.min(10, prev + 1))}
                      className="w-10 h-10 flex items-center justify-center text-valuecart-navy hover:bg-gray-100 rounded-r-lg transition-colors text-base font-bold"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6 pt-4 border-t border-gray-100 space-y-3">
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    className="flex-1 bg-valuecart-green hover:bg-valuecart-green-dark active:scale-[0.98] text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-sm shadow-sm transition-all"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>Add to Cart</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleBuyNow}
                    className="flex-1 bg-valuecart-navy hover:bg-valuecart-navy-light active:scale-[0.98] text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-sm shadow-sm transition-all"
                  >
                    <span>Buy Now</span>
                  </button>
                </div>

                {/* Trust mini banner */}
                <div className="flex items-center justify-between text-[11px] text-valuecart-text-muted pt-1">
                  <div className="flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-valuecart-green" />
                    <span>Free Shipping &gt; ₹499</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-valuecart-navy" />
                    <span>Cash on Delivery</span>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
