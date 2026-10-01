'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  ChevronRight,
} from 'lucide-react';
import { useStore } from '@/context/StoreContext';

export default function CartPage() {
  const {
    cart,
    updateQuantity,
    removeFromCart,
    clearCart,
    cartSubtotal,
    cartOriginalTotal,
    cartSavings,
    cartShipping,
    cartGrandTotal,
    cartCount,
  } = useStore();

  const freeShippingThreshold = 499;
  const remainingForFree = Math.max(0, freeShippingThreshold - cartSubtotal);

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-20 h-20 rounded-full bg-valuecart-green-tint flex items-center justify-center text-valuecart-green mx-auto mb-4">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h1 className="text-2xl font-bold text-valuecart-navy">Your Cart is Empty</h1>
        <p className="text-xs sm:text-sm text-valuecart-text-muted mt-2 max-w-sm mx-auto">
          Explore everyday essentials with great deals and free delivery on orders above ₹499.
        </p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 mt-6 bg-valuecart-green hover:bg-valuecart-green-dark text-white font-bold px-6 py-3 rounded-full text-sm shadow-md transition-colors"
        >
          <span>Start Shopping</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-valuecart-text-muted mb-6">
        <Link href="/" className="hover:text-valuecart-green">
          Home
        </Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-valuecart-navy font-semibold">Shopping Cart</span>
      </nav>

      <h1 className="text-2xl sm:text-3xl font-extrabold text-valuecart-navy mb-6">
        Shopping Cart ({cartCount} {cartCount === 1 ? 'item' : 'items'})
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Cart Items List (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* Free Shipping Alert Banner */}
          <div className="bg-[#EAF7F0] p-4 rounded-2xl border border-[#D2EEDD] flex items-center justify-between text-xs sm:text-sm">
            <div className="flex items-center gap-2 text-valuecart-navy font-medium">
              <Truck className="w-4 h-4 text-valuecart-green shrink-0" />
              {remainingForFree > 0 ? (
                <span>
                  Add items worth <strong className="text-valuecart-green font-bold">₹{remainingForFree}</strong> more to get <strong>FREE Delivery</strong>!
                </span>
              ) : (
                <span className="text-valuecart-green font-bold">
                  🎉 Congratulations! Your order qualifies for FREE Pan India Delivery.
                </span>
              )}
            </div>
            <Link href="/products" className="text-xs text-valuecart-green font-bold hover:underline shrink-0">
              Add More
            </Link>
          </div>

          {/* Cart Table / Items */}
          <div className="bg-white rounded-3xl border border-valuecart-border/80 shadow-soft divide-y divide-gray-100 overflow-hidden">
            {cart.map((item) => (
              <div
                key={item.product.id}
                className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 shrink-0">
                    <Image
                      src={item.product.image}
                      alt={item.product.name}
                      fill
                      sizes="96px"
                      className="object-cover"
                    />
                  </div>

                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-valuecart-green uppercase tracking-wider">
                      {item.product.category}
                    </span>
                    <Link
                      href={`/product/${item.product.slug}`}
                      className="text-sm sm:text-base font-bold text-valuecart-navy hover:text-valuecart-green block transition-colors line-clamp-1"
                    >
                      {item.product.name}
                    </Link>
                    {item.selectedSize && (
                      <span className="text-xs text-valuecart-text-muted block">
                        Size: <strong className="text-valuecart-navy">{item.selectedSize}</strong>
                      </span>
                    )}
                    <div className="flex items-baseline gap-2 pt-1">
                      <span className="text-base font-extrabold text-valuecart-navy">
                        ₹{item.product.price}
                      </span>
                      {item.product.originalPrice > item.product.price && (
                        <span className="text-xs text-gray-400 line-through">
                          ₹{item.product.originalPrice}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quantity Controls & Total & Remove */}
                <div className="flex items-center justify-between w-full sm:w-auto gap-6 sm:self-center">
                  <div className="flex items-center border border-gray-200 rounded-xl bg-white overflow-hidden shadow-2xs">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      className="p-2 hover:bg-gray-100 text-valuecart-navy transition-colors"
                      aria-label="Decrease"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-3.5 text-xs font-bold text-valuecart-navy min-w-[32px] text-center">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      className="p-2 hover:bg-gray-100 text-valuecart-navy transition-colors"
                      aria-label="Increase"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="text-right min-w-[70px]">
                    <div className="text-base font-bold text-valuecart-navy">
                      ₹{item.product.price * item.quantity}
                    </div>
                    {item.product.originalPrice > item.product.price && (
                      <div className="text-[11px] text-emerald-600 font-semibold">
                        Save ₹{(item.product.originalPrice - item.product.price) * item.quantity}
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => removeFromCart(item.product.id)}
                    className="p-2 text-gray-400 hover:text-rose-500 rounded-lg transition-colors"
                    aria-label="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center pt-2">
            <Link
              href="/products"
              className="text-xs sm:text-sm font-semibold text-valuecart-green hover:underline"
            >
              ← Continue Shopping
            </Link>
            <button
              type="button"
              onClick={clearCart}
              className="text-xs text-rose-500 hover:underline font-medium"
            >
              Clear Cart
            </button>
          </div>
        </div>

        {/* Right: Order Summary (4 cols) */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-3xl p-6 border border-valuecart-border/80 shadow-soft space-y-5 sticky top-24">
            <h2 className="text-lg font-bold text-valuecart-navy pb-3 border-b border-gray-100">
              Order Summary
            </h2>

            <div className="space-y-3 text-xs sm:text-sm text-valuecart-text-muted">
              <div className="flex justify-between">
                <span>Total Items</span>
                <span className="font-semibold text-valuecart-navy">{cartCount}</span>
              </div>
              <div className="flex justify-between">
                <span>Original Price</span>
                <span className="text-gray-400 line-through">₹{cartOriginalTotal}</span>
              </div>
              {cartSavings > 0 && (
                <div className="flex justify-between text-valuecart-green font-semibold">
                  <span>Product Discount</span>
                  <span>-₹{cartSavings}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-valuecart-navy">₹{cartSubtotal}</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Delivery</span>
                <span>
                  {cartShipping === 0 ? (
                    <span className="text-valuecart-green font-bold">FREE</span>
                  ) : (
                    <span className="font-semibold text-valuecart-navy">₹{cartShipping}</span>
                  )}
                </span>
              </div>
              <div className="border-t border-gray-100 pt-3 flex justify-between text-base font-extrabold text-valuecart-navy">
                <span>Total Amount</span>
                <span className="text-xl text-valuecart-green">₹{cartGrandTotal}</span>
              </div>
            </div>

            <Link
              href="/checkout"
              className="w-full bg-valuecart-green hover:bg-valuecart-green-dark active:scale-[0.99] text-white font-bold py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2 text-sm shadow-md transition-all block text-center"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <div className="pt-2 border-t border-gray-100 space-y-2 text-xs text-valuecart-text-muted">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-valuecart-green shrink-0" />
                <span>100% Safe &amp; Secure Payments</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-valuecart-green shrink-0" />
                <span>Pan India Delivery (Kerala Express Available)</span>
              </div>
              <div className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-valuecart-green shrink-0" />
                <span>7-Day Return Policy</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
