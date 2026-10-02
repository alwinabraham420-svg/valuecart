'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, ShieldCheck } from 'lucide-react';
import { useStore } from '@/context/StoreContext';

export default function CartDrawer() {
  const {
    cart,
    isCartOpen,
    closeCart,
    updateQuantity,
    removeFromCart,
    cartSubtotal,
    cartOriginalTotal,
    cartSavings,
    cartShipping,
    cartGrandTotal,
    cartCount,
  } = useStore();

  if (!isCartOpen) return null;

  const freeShippingThreshold = 499;
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - cartSubtotal);
  const progressPercent = Math.min(100, (cartSubtotal / freeShippingThreshold) * 100);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={closeCart}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between">
          
          {/* Header */}
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-white">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-valuecart-green" />
              <h2 className="text-base font-bold text-valuecart-navy">
                Shopping Cart ({cartCount})
              </h2>
            </div>
            <button
              type="button"
              onClick={closeCart}
              className="p-1.5 rounded-full text-gray-400 hover:text-valuecart-navy hover:bg-gray-100 transition-colors"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Alert Bar */}
          {cart.length > 0 && (
            <div className="bg-[#EAF7F0] px-5 py-3 border-b border-[#D2EEDD]">
              <div className="flex items-center justify-between text-xs font-semibold text-valuecart-navy mb-1.5">
                {remainingForFreeShipping > 0 ? (
                  <span>
                    Add <strong className="text-valuecart-green font-bold">₹{remainingForFreeShipping}</strong> more for <span className="text-valuecart-green">FREE Delivery</span>
                  </span>
                ) : (
                  <span className="text-valuecart-green flex items-center gap-1">
                    🎉 You have unlocked <strong>FREE Delivery!</strong>
                  </span>
                )}
                <span className="text-[11px] text-valuecart-text-muted">
                  {Math.round(progressPercent)}%
                </span>
              </div>
              <div className="w-full bg-white/80 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-valuecart-green h-full rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-valuecart-green-tint flex items-center justify-center text-valuecart-green">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-valuecart-navy">
                    Your cart is empty
                  </h3>
                  <p className="text-xs text-valuecart-text-muted mt-1 max-w-xs">
                    Looks like you haven&apos;t added any essentials to your cart yet.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeCart}
                  className="bg-valuecart-green hover:bg-valuecart-green-dark text-white text-xs font-semibold px-6 py-2.5 rounded-full transition-colors"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.product.id}
                  className="flex gap-3.5 p-3 rounded-xl bg-gray-50/70 border border-gray-100 hover:border-gray-200 transition-colors"
                >
                  {/* Thumbnail */}
                  <div className="relative w-18 h-18 rounded-lg overflow-hidden bg-white shrink-0 border border-gray-100">
                    <Image
                      src={item.product.image}
                      alt={item.product.name}
                      fill
                      sizes="72px"
                      className="object-cover"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          href={`/product/${item.product.slug}`}
                          onClick={closeCart}
                          className="text-xs sm:text-sm font-semibold text-valuecart-navy hover:text-valuecart-green transition-colors line-clamp-1"
                        >
                          {item.product.name}
                        </Link>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.product.id)}
                          className="text-gray-400 hover:text-rose-500 p-0.5 transition-colors shrink-0"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {item.selectedSize && (
                        <div className="text-[11px] text-valuecart-text-muted mt-0.5">
                          Size: <span className="font-semibold text-valuecart-navy">{item.selectedSize}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      {/* Price */}
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-sm font-bold text-valuecart-navy">
                          ₹{item.product.price * item.quantity}
                        </span>
                        {item.product.originalPrice > item.product.price && (
                          <span className="text-[11px] text-gray-400 line-through">
                            ₹{item.product.originalPrice * item.quantity}
                          </span>
                        )}
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center border border-gray-200 rounded-lg bg-white overflow-hidden shadow-2xs">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.product.id, Math.max(1, item.quantity - 1))}
                          disabled={item.quantity <= 1}
                          className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed text-valuecart-navy transition-colors font-bold"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-7 sm:w-8 text-center text-xs font-bold text-valuecart-navy select-none">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.product.id, Math.min(10, item.quantity + 1))}
                          className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center hover:bg-gray-100 text-valuecart-navy transition-colors font-bold"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout */}
          {cart.length > 0 && (
            <div className="p-5 border-t border-gray-100 bg-white space-y-3">
              {/* Price summary */}
              <div className="space-y-1.5 text-xs text-valuecart-text-muted">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-valuecart-navy">₹{cartSubtotal}</span>
                </div>
                {cartSavings > 0 && (
                  <div className="flex justify-between text-valuecart-green font-medium">
                    <span>Discount Savings</span>
                    <span>-₹{cartSavings}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Delivery Charge</span>
                  <span>
                    {cartShipping === 0 ? (
                      <span className="text-valuecart-green font-semibold">FREE</span>
                    ) : (
                      <span className="font-semibold text-valuecart-navy">₹{cartShipping}</span>
                    )}
                  </span>
                </div>
                <div className="border-t border-gray-100 pt-2 flex justify-between text-sm font-bold text-valuecart-navy">
                  <span>Grand Total</span>
                  <span className="text-base text-valuecart-green">₹{cartGrandTotal}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="w-full bg-valuecart-green hover:bg-valuecart-green-dark active:scale-[0.99] text-white text-sm font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-md transition-all duration-150"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <div className="flex items-center justify-between text-xs text-valuecart-text-muted px-1">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-valuecart-green" />
                    <span>Safe &amp; Secure Checkout</span>
                  </div>
                  <Link
                    href="/cart"
                    onClick={closeCart}
                    className="hover:text-valuecart-navy underline font-medium"
                  >
                    View Full Cart
                  </Link>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
