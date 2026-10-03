'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Star,
  ShoppingCart,
  Heart,
  Truck,
  RotateCcw,
  ShieldCheck,
  Check,
  ChevronRight,
  ChevronLeft,
  MapPin,
  Sparkles,
  Zap,
  Ruler,
  CheckCircle2,
  Share2,
} from 'lucide-react';
import { Product } from '@/types';
import { useStore } from '@/context/StoreContext';
import { captureAttributionFromUrl } from '@/lib/attribution';
import { trackViewContent, trackAddToCart } from '@/lib/analytics';
import ProductCard from '@/components/ProductCard';

interface ProductDetailClientProps {
  product: Product;
  relatedProducts: Product[];
}

export default function ProductDetailClient({
  product,
  relatedProducts,
}: ProductDetailClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToCart, buyNow, isInWishlist, toggleWishlist, addToast, openCart } = useStore();

  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [pincode, setPincode] = useState('');
  const [pinChecked, setPinChecked] = useState(false);
  const [pinLoading, setPinLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isBuying, setIsBuying] = useState(false);
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'reviews'>('desc');

  // Touch swipe support for mobile gallery
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const isOutOfStock =
    product.isAvailable === false ||
    (typeof product.stock === 'number' && product.stock <= 0);
  const images = product.images && product.images.length > 0 ? product.images : [product.image];
  const isWishlisted = isInWishlist(product.id);

  // Capture Meta Ad Attribution on product landing
  useEffect(() => {
    captureAttributionFromUrl(searchParams, `/product/${product.slug}`);
    trackViewContent(product);
  }, [searchParams, product]);

  const handlePrevImage = () => {
    setActiveImage((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setActiveImage((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  // Touch swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;
    if (isLeftSwipe) {
      handleNextImage();
    } else if (isRightSwipe) {
      handlePrevImage();
    }
  };

  const handleAddToCart = () => {
    if (isOutOfStock) {
      addToast('Product Unavailable', 'Sorry, this product is currently out of stock.', 'warning');
      return;
    }
    setIsAdding(true);
    addToCart(product, quantity);
    trackAddToCart(product, quantity);
    setTimeout(() => {
      setIsAdding(false);
    }, 300);
  };

  const handleBuyNow = () => {
    if (isOutOfStock) {
      addToast('Product Unavailable', 'Sorry, this product is currently out of stock.', 'warning');
      return;
    }
    setIsBuying(true);
    buyNow(product, quantity);
    trackAddToCart(product, quantity);
    router.push('/checkout');
  };

  const handleCheckPincode = (e: React.FormEvent) => {
    e.preventDefault();
    if (pincode.length === 6 && /^\d+$/.test(pincode)) {
      setPinLoading(true);
      setTimeout(() => {
        setPinLoading(false);
        setPinChecked(true);
        addToast('Delivery Available', `PIN Code ${pincode} is serviceable for COD & fast delivery.`, 'success');
      }, 350);
    } else {
      addToast('Invalid PIN Code', 'Please enter a valid 6-digit Indian PIN code.', 'warning');
    }
  };

  const handleShare = () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator
        .share({
          title: product.name,
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      addToast('Link Copied', 'Product link copied to clipboard.', 'success');
    }
  };

  // 8 Specific Highlights from the uploaded creative
  const defaultFeatures = [
    '304 Stainless Steel',
    'Rust Resistant',
    'Hygienic Surface',
    'Easy to Clean',
    'Odour & Stain Resistant',
    'Multi-Purpose Use',
    'Convenient Handle Design',
    'Smooth Rounded Edges',
  ];
  const featuresList = product.features || defaultFeatures;

  // 4 Specific Use Cases from the creative
  const defaultUseCases = [
    {
      title: 'CUT VEGETABLES & FRUITS',
      subtitle: 'Effortless cutting without juice staining or discoloration',
      image: '/images/products/chopping-board-1.jpg',
    },
    {
      title: 'CUT MEAT & FISH',
      subtitle: 'Hygienic prep that will not harbor bacteria or absorb raw odors',
      image: '/images/products/chopping-board-2.jpg',
    },
    {
      title: 'KNEAD DOUGH & BAKE PREP',
      subtitle: 'Smooth food-safe surface for rolling dough and pastry prep',
      image: '/images/products/chopping-board-3.jpg',
    },
    {
      title: 'CUT BREAD & MORE',
      subtitle: 'Durable everyday cutting with knife-friendly surface',
      image: '/images/products/chopping-board-1.jpg',
    },
  ];
  const useCasesList = product.useCases || defaultUseCases;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-7 pb-24 md:pb-12">
      
      {/* 1. Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-valuecart-text-muted mb-5 overflow-x-auto no-scrollbar whitespace-nowrap">
        <Link href="/" className="hover:text-valuecart-green shrink-0 transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
        <Link href="/category/home-kitchen" className="hover:text-valuecart-green shrink-0 transition-colors">
          Home &amp; Kitchen
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
        <Link href="/products?category=Home+%26+Kitchen" className="hover:text-valuecart-green shrink-0 transition-colors">
          Kitchen Essentials
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
        <span className="text-valuecart-navy font-semibold truncate max-w-[200px] sm:max-w-xs">
          {product.shortName || product.name}
        </span>
      </nav>

      {/* 2. Main Product Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
        
        {/* LEFT COLUMN: Premium Product Gallery (5.5 cols on desktop) */}
        <div className="lg:col-span-6 space-y-4">
          <div
            className="relative aspect-square w-full rounded-2xl md:rounded-3xl overflow-hidden bg-white border border-valuecart-border/80 shadow-soft select-none group"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <Image
              src={images[activeImage] || product.image}
              alt={product.name}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 600px"
              className="object-contain p-2 sm:p-4 transition-all duration-300"
            />

            {/* Badges Overlay */}
            <div className="absolute top-3.5 left-3.5 flex flex-col gap-1.5 z-10">
              {product.badge && (
                <span className="bg-valuecart-navy text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-sm">
                  {product.badge}
                </span>
              )}
              <span className="bg-valuecart-green text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-sm">
                {product.slug === '2-in-1-oil-sprayer-glass-bottle-dispenser'
                  ? 'Food Grade Material'
                  : '304 Food Grade'}
              </span>
            </div>

            {/* Top Right Action Buttons: Wishlist & Share */}
            <div className="absolute top-3.5 right-3.5 flex items-center gap-2 z-10">
              <button
                type="button"
                onClick={handleShare}
                className="p-2.5 rounded-full bg-white/90 hover:bg-white text-valuecart-navy shadow-sm transition-all"
                aria-label="Share product"
                title="Share product"
              >
                <Share2 className="w-4 h-4 text-valuecart-text-muted hover:text-valuecart-navy" />
              </button>

              <button
                type="button"
                onClick={() => toggleWishlist(product.id)}
                className="p-2.5 rounded-full bg-white/90 hover:bg-white text-valuecart-navy shadow-sm transition-all"
                aria-label="Wishlist"
              >
                <Heart
                  className={`w-4 h-4 ${
                    isWishlisted ? 'fill-rose-500 text-rose-500' : 'text-gray-400 hover:text-rose-500'
                  }`}
                />
              </button>
            </div>

            {/* Desktop Prev/Next Buttons */}
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrevImage}
                  className="hidden md:flex absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-valuecart-navy items-center justify-center shadow-md transition-all opacity-0 group-hover:opacity-100 z-10 cursor-pointer"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={handleNextImage}
                  className="hidden md:flex absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-valuecart-navy items-center justify-center shadow-md transition-all opacity-0 group-hover:opacity-100 z-10 cursor-pointer"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}

            {/* Mobile Image Counter Badge */}
            <div className="md:hidden absolute bottom-3 right-3 bg-black/60 text-white text-[11px] font-bold px-2.5 py-1 rounded-full backdrop-blur-xs">
              {activeImage + 1} / {images.length}
            </div>
          </div>

          {/* Thumbnails Row */}
          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto no-scrollbar py-1">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveImage(idx)}
                  className={`relative w-20 sm:w-24 h-20 sm:h-24 rounded-2xl overflow-hidden bg-white border-2 shrink-0 transition-all cursor-pointer ${
                    activeImage === idx
                      ? 'border-valuecart-green ring-2 ring-valuecart-green/30 scale-[1.02]'
                      : 'border-gray-200 opacity-70 hover:opacity-100 hover:border-gray-300'
                  }`}
                >
                  <Image
                    src={img}
                    alt={`Thumbnail ${idx + 1}`}
                    fill
                    sizes="100px"
                    className="object-contain p-1"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Conversion-Focused Product Information */}
        <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
          <div>
            {/* Category tag */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-valuecart-green uppercase tracking-wider bg-valuecart-green-tint px-3 py-1 rounded-md">
                Kitchen Essentials
              </span>
              <span className="text-xs text-valuecart-text-muted">
                • {product.slug === '2-in-1-oil-sprayer-glass-bottle-dispenser' ? 'Oil Sprayer / Dispenser' : 'Cutting Boards'}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-xl sm:text-2xl lg:text-[28px] font-black text-valuecart-navy mt-2.5 leading-snug tracking-tight">
              {product.name}
            </h1>

            {/* Rating & Stock Status */}
            <div className="flex items-center gap-3 mt-3 text-xs sm:text-sm">
              <span className={`font-bold flex items-center gap-1.5 px-3 py-1 rounded-full text-xs ${
                !isOutOfStock
                  ? 'text-valuecart-green bg-valuecart-green-tint border border-emerald-200'
                  : 'text-rose-700 bg-rose-50 border border-rose-200'
              }`}>
                {!isOutOfStock ? (
                  <>
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" /> In Stock
                  </>
                ) : (
                  <>
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" /> Out of Stock (Will Restock Soon)
                  </>
                )}
              </span>
              <span className="text-gray-300">•</span>
              <span className="text-valuecart-text-muted font-medium">
                {product.category}
              </span>
            </div>

            {/* Price Area: ₹349 ONLY */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-black text-valuecart-navy tracking-tight">
                  ₹{product.price}
                </span>
                <span className="text-xs font-semibold text-valuecart-green bg-valuecart-green-tint px-2.5 py-1 rounded-full">
                  Best Value Price
                </span>
              </div>
              <p className="text-xs text-valuecart-text-muted mt-1">
                Inclusive of all taxes. Free shipping on this product across India.
              </p>
            </div>

            {/* Size & Dimensions Badge */}
            <div className="mt-5 p-3.5 rounded-2xl bg-valuecart-warm-white border border-valuecart-border flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-valuecart-navy text-white flex items-center justify-center shrink-0">
                  <Ruler className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-valuecart-navy block">
                    {product.sizeLabel || (product.slug === '2-in-1-oil-sprayer-glass-bottle-dispenser' ? '18.5 cm Tall × 10.5 cm Wide' : 'Medium Size')}
                  </span>
                  <span className="text-[11px] text-valuecart-text-muted">
                    Dimensions: {product.dimensions || (product.slug === '2-in-1-oil-sprayer-glass-bottle-dispenser' ? '18.5 cm × 10.5 cm' : '31.7 CM × 20.8 CM')}
                  </span>
                </div>
              </div>
              <span className="text-[11px] font-bold text-valuecart-green bg-white px-2.5 py-1 rounded-lg border border-gray-200">
                Everyday Kitchen Fit
              </span>
            </div>

            {/* Key Features / Highlights Feature Cards */}
            <div className="mt-5">
              <span className="text-xs font-bold text-valuecart-navy uppercase tracking-wider block mb-2.5">
                Product Highlights
              </span>
              {product.slug === '2-in-1-oil-sprayer-glass-bottle-dispenser' ? (
                <div className="grid grid-cols-2 gap-2 text-xs text-valuecart-text-main">
                  {[
                    { title: '2-IN-1', sub: 'Pour & Spray' },
                    { title: 'FINE MIST SPRAY', sub: 'Even Coverage' },
                    { title: 'SMOOTH POURING', sub: 'No Spilling' },
                    { title: 'FOOD GRADE MATERIAL', sub: 'Borosilicate Glass' },
                    { title: 'LEAK PROOF DESIGN', sub: 'Tight Silicone Seal' },
                    { title: 'EASY TO CLEAN', sub: 'Quick Maintenance' },
                    { title: 'DURABLE & LONG LASTING', sub: 'Built for Daily Use' },
                  ].map((card, i) => (
                    <div
                      key={i}
                      className={`p-2.5 rounded-xl border flex flex-col justify-center transition-all ${
                        card.title === '2-IN-1'
                          ? 'bg-valuecart-green-tint/70 border-valuecart-green/40 col-span-2 sm:col-span-1 shadow-2xs'
                          : 'bg-white border-gray-100 shadow-2xs'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-valuecart-green shrink-0" />
                        <span className="font-extrabold text-valuecart-navy text-xs tracking-tight">
                          {card.title}
                        </span>
                      </div>
                      <span className="text-[11px] text-valuecart-text-muted font-medium ml-5">
                        {card.sub}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 text-xs text-valuecart-text-main">
                  {featuresList.map((feat) => (
                    <div key={feat} className="flex items-center gap-2 p-2 rounded-xl bg-white border border-gray-100 shadow-2xs">
                      <CheckCircle2 className="w-4 h-4 text-valuecart-green shrink-0" />
                      <span className="font-semibold">{feat}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quantity Selector */}
            <div className="mt-6 flex flex-wrap items-center gap-4">
              <span className="text-xs font-bold text-valuecart-navy uppercase tracking-wider">
                Quantity:
              </span>
              <div className={`flex items-center border-2 border-gray-200 rounded-2xl bg-white overflow-hidden shadow-2xs ${
                isOutOfStock ? 'opacity-50 cursor-not-allowed bg-gray-50' : ''
              }`}>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={isOutOfStock || quantity <= 1}
                  className="w-11 h-11 flex items-center justify-center hover:bg-gray-100 text-valuecart-navy font-bold text-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span className="w-12 text-center text-base font-black text-valuecart-navy select-none">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                  disabled={isOutOfStock || quantity >= 10}
                  className="w-11 h-11 flex items-center justify-center hover:bg-gray-100 text-valuecart-navy font-bold text-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
              <span className="text-xs sm:text-sm text-valuecart-text-muted">
                Subtotal: <strong className="text-valuecart-navy font-black text-sm sm:text-base">₹{product.price * quantity}</strong>
              </span>
            </div>

            {/* Primary Action Buttons: ADD TO CART & BUY NOW */}
            {isOutOfStock ? (
              <div className="mt-6 space-y-3">
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-center">
                  <span className="font-extrabold text-amber-900 text-sm sm:text-base block">
                    Out of Stock • Will Restock Soon
                  </span>
                  <p className="text-xs text-amber-700 mt-1">
                    This item is currently unavailable for purchase. Keep browsing our store for available everyday essentials.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    disabled
                    className="flex-1 bg-gray-100 border border-gray-200 text-gray-400 font-bold py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2.5 text-sm sm:text-base cursor-not-allowed select-none"
                  >
                    <ShoppingCart className="w-5 h-5 text-gray-400" />
                    <span>OUT OF STOCK</span>
                  </button>
                  <button
                    type="button"
                    disabled
                    className="flex-1 bg-gray-100 border border-gray-200 text-gray-400 font-bold py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2.5 text-sm sm:text-base cursor-not-allowed select-none"
                  >
                    <span>WILL RESTOCK SOON</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={isAdding}
                  className="flex-1 bg-valuecart-green hover:bg-valuecart-green-dark active:scale-[0.99] text-white font-bold py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2.5 text-sm sm:text-base shadow-md hover:shadow-lg transition-all cursor-pointer"
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span>{isAdding ? 'Adding...' : 'Add to Cart'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleBuyNow}
                  disabled={isBuying}
                  className="flex-1 bg-valuecart-navy hover:bg-valuecart-navy-light active:scale-[0.99] text-white font-bold py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2.5 text-sm sm:text-base shadow-md hover:shadow-lg transition-all cursor-pointer"
                >
                  <Zap className="w-5 h-5 text-amber-400 fill-amber-400" />
                  <span>{isBuying ? 'Redirecting...' : 'Buy Now'}</span>
                </button>
              </div>
            )}

            {/* PIN Code Delivery Checker */}
            <div className="mt-6 p-4 rounded-2xl bg-gray-50 border border-gray-200">
              <div className="flex items-center gap-2 text-xs font-bold text-valuecart-navy mb-2">
                <MapPin className="w-4 h-4 text-valuecart-green" />
                <span>Enter your PIN code to check delivery availability</span>
              </div>
              <form onSubmit={handleCheckPincode} className="flex gap-2">
                <input
                  type="text"
                  maxLength={6}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={pincode}
                  onChange={(e) => {
                    setPincode(e.target.value.replace(/\D/g, ''));
                    setPinChecked(false);
                  }}
                  placeholder="Enter 6-digit PIN code"
                  className="flex-1 h-10 px-3.5 rounded-xl border border-gray-300 text-xs text-valuecart-navy bg-white focus:outline-none focus:ring-2 focus:ring-valuecart-green"
                />
                <button
                  type="submit"
                  disabled={pinLoading}
                  className="h-10 px-5 rounded-xl bg-valuecart-navy hover:bg-valuecart-navy-light text-white text-xs font-bold transition-colors shrink-0"
                >
                  {pinLoading ? 'Checking...' : 'Check'}
                </button>
              </form>

              {pinChecked && (
                <div className="mt-2.5 text-xs text-valuecart-green font-semibold flex items-center gap-1.5 animate-fade-in">
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Delivery available • Estimated in 2–4 business days</span>
                </div>
              )}
            </div>

            {/* Payment Options Section */}
            <div className="mt-4 p-3.5 rounded-2xl bg-white border border-gray-200/80 space-y-2">
              <div className="text-xs font-bold text-valuecart-navy flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-valuecart-green" />
                <span>Payment Options</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-valuecart-navy">
                <div className="flex items-center gap-2 p-2 rounded-xl bg-valuecart-green-surface border border-valuecart-green/20">
                  <Check className="w-3.5 h-3.5 text-valuecart-green" />
                  <span>Cash on Delivery Available</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-xl bg-valuecart-green-surface border border-valuecart-green/20">
                  <Check className="w-3.5 h-3.5 text-valuecart-green" />
                  <span>Secure Online Payment</span>
                </div>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-4 gap-2 pt-2 text-center">
              <div className="p-2.5 rounded-xl bg-white border border-gray-100 shadow-2xs">
                <Truck className="w-4 h-4 text-valuecart-green mx-auto mb-1" />
                <span className="text-[10px] sm:text-[11px] font-bold text-valuecart-navy block leading-tight">Pan India</span>
                <span className="text-[9px] text-valuecart-text-muted">Delivery</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-gray-100 shadow-2xs">
                <ShieldCheck className="w-4 h-4 text-valuecart-green mx-auto mb-1" />
                <span className="text-[10px] sm:text-[11px] font-bold text-valuecart-navy block leading-tight">Cash on Delivery</span>
                <span className="text-[9px] text-valuecart-text-muted">Available</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-gray-100 shadow-2xs">
                <RotateCcw className="w-4 h-4 text-valuecart-green mx-auto mb-1" />
                <span className="text-[10px] sm:text-[11px] font-bold text-valuecart-navy block leading-tight">Easy Returns</span>
                <span className="text-[9px] text-valuecart-text-muted">Hassle free</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-gray-100 shadow-2xs">
                <Sparkles className="w-4 h-4 text-valuecart-green mx-auto mb-1" />
                <span className="text-[10px] sm:text-[11px] font-bold text-valuecart-navy block leading-tight">100% Genuine</span>
                <span className="text-[9px] text-valuecart-text-muted">Quality checked</span>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* 3. Product Use Cases Section */}
      <div className="mt-14">
        <div className="text-center max-w-xl mx-auto mb-8">
          <span className="text-xs font-bold uppercase tracking-wider text-valuecart-green bg-valuecart-green-tint px-3 py-1 rounded-full">
            {product.slug === '2-in-1-oil-sprayer-glass-bottle-dispenser' ? 'Versatile Kitchen Usage' : 'Versatile Kitchen Prep'}
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-valuecart-navy mt-2">
            {product.slug === '2-in-1-oil-sprayer-glass-bottle-dispenser' ? 'Everyday Use Cases' : 'Multi-Purpose Cutting & Prep'}
          </h2>
          <p className="text-xs sm:text-sm text-valuecart-text-muted mt-1.5">
            {product.slug === '2-in-1-oil-sprayer-glass-bottle-dispenser'
              ? 'Suitable for controlled oil usage while cooking, baking, preparing salads, air fryer and barbecue.'
              : 'Designed to replace toxic plastic boards with food-safe 304 stainless steel.'}
          </p>
        </div>

        <div className={`grid grid-cols-1 sm:grid-cols-2 ${useCasesList.length >= 5 ? 'lg:grid-cols-5' : 'lg:grid-cols-4'} gap-4 sm:gap-5`}>
          {useCasesList.map((item, idx) => (
            <div
              key={idx}
              className="bg-white rounded-3xl p-5 border border-valuecart-border/80 shadow-soft flex flex-col justify-between hover:shadow-md transition-shadow group"
            >
              <div>
                <div className="relative aspect-video w-full rounded-2xl overflow-hidden mb-4 bg-gray-50 border border-gray-100">
                  <Image
                    src={item.image || product.image}
                    alt={item.title}
                    fill
                    sizes="(max-width: 640px) 100vw, 300px"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="w-6 h-6 rounded-full bg-valuecart-green/10 text-valuecart-green font-black text-xs flex items-center justify-center mb-2">
                  {idx + 1}
                </div>
                <h3 className="font-extrabold text-sm text-valuecart-navy leading-snug">
                  {item.title}
                </h3>
                {item.subtitle && (
                  <p className="text-xs text-valuecart-text-muted mt-1 leading-relaxed">
                    {item.subtitle}
                  </p>
                )}
              </div>
              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-1.5 text-[11px] font-bold text-valuecart-green">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>{product.slug === '2-in-1-oil-sprayer-glass-bottle-dispenser' ? 'Controlled Dispensing' : 'Food Grade Surface'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Tabs Section: Description, Specifications, Reviews */}
      <div className="mt-12 bg-white rounded-3xl p-6 sm:p-8 border border-valuecart-border/80 shadow-soft">
        <div className="flex border-b border-gray-200 space-x-6 sm:space-x-8 text-sm sm:text-base font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('desc')}
            className={`pb-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'desc'
                ? 'border-valuecart-green text-valuecart-green'
                : 'border-transparent text-valuecart-text-muted hover:text-valuecart-navy'
            }`}
          >
            About this product
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('specs')}
            className={`pb-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'specs'
                ? 'border-valuecart-green text-valuecart-green'
                : 'border-transparent text-valuecart-text-muted hover:text-valuecart-navy'
            }`}
          >
            Specifications
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('reviews')}
            className={`pb-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'reviews'
                ? 'border-valuecart-green text-valuecart-green'
                : 'border-transparent text-valuecart-text-muted hover:text-valuecart-navy'
            }`}
          >
            Customer Reviews ({product.reviewCount})
          </button>
        </div>

        {/* Tab 1: Description */}
        {activeTab === 'desc' && (
          <div className="py-6 text-sm text-valuecart-text-main leading-relaxed space-y-4">
            {product.slug === '2-in-1-oil-sprayer-glass-bottle-dispenser' ? (
              <>
                <h3 className="text-base font-bold text-valuecart-navy">
                  2-in-1 Oil Sprayer &amp; Dispenser Bottle for Kitchen
                </h3>
                <p>
                  Upgrade your everyday cooking with this 2-in-1 Oil Sprayer and Dispenser Bottle. Designed for both fine mist spraying and smooth pouring, it is suitable for controlled oil usage while cooking, baking, preparing salads, using an air fryer and barbecue.
                </p>
                <p>
                  The bottle features a glass container with a green dispenser top and comfortable handle design.
                </p>

                <div className="pt-2">
                  <h4 className="text-xs font-bold text-valuecart-navy uppercase tracking-wider mb-2.5">
                    Key Features
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {[
                      '2-in-1 oil sprayer and dispenser',
                      'Fine mist spray',
                      'Smooth pouring',
                      'No-spillage design',
                      'Leak-proof seal',
                      'Food-grade material',
                      'Premium glass bottle',
                      'Durable and long-lasting',
                      'Comfortable PP handle',
                      'Gravity sensor lid',
                      'Anti-clogging filter',
                      'Easy to clean',
                      'Suitable for cooking, salads, air fryer, barbecue and baking',
                      'Green color',
                      'Pack of 1',
                    ].map((feature, i) => (
                      <div key={i} className="flex items-center gap-2 p-2 rounded-xl bg-gray-50 border border-gray-100">
                        <CheckCircle2 className="w-4 h-4 text-valuecart-green shrink-0" />
                        <span className="font-semibold">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3">
                  <div className="p-3.5 rounded-2xl bg-valuecart-warm-white border border-gray-100 flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-valuecart-green shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-valuecart-navy">Dual Spray &amp; Pour Action</h4>
                      <p className="text-xs text-valuecart-text-muted mt-0.5">Press to spray fine mist or tilt for smooth pouring without dripping.</p>
                    </div>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-valuecart-warm-white border border-gray-100 flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-valuecart-green shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-valuecart-navy">Premium Borosilicate Glass</h4>
                      <p className="text-xs text-valuecart-text-muted mt-0.5">Clear glass body with durable PP handle, gravity sensor lid, and leak-proof seal.</p>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <h3 className="text-base font-bold text-valuecart-navy">
                  Everyday Healthier Kitchen Essentials
                </h3>
                <p>
                  A medium-size stainless steel chopping board designed for everyday kitchen use.
                  Unlike traditional plastic cutting boards that harbor bacteria, absorb deep stains,
                  and release microplastics into prepared meals, this cutting board is built with food-grade
                  <strong> 304 stainless steel</strong> to ensure maximum hygiene.
                </p>
                <p>
                  Its non-porous surface delivers seamless easy cleaning—just rinse under running water and it is good as new.
                  Engineered with smooth rounded edges for safe and comfortable handling, along with a convenient handle cut-out
                  for easy holding and hanging storage.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                  <div className="p-3.5 rounded-2xl bg-valuecart-warm-white border border-gray-100 flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-valuecart-green shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-valuecart-navy">Hygienic &amp; Microplastic Free</h4>
                      <p className="text-xs text-valuecart-text-muted mt-0.5">Non-porous surface that prevents bacteria build-up and food absorption.</p>
                    </div>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-valuecart-warm-white border border-gray-100 flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-valuecart-green shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-valuecart-navy">Easy to Clean &amp; Odor Resistant</h4>
                      <p className="text-xs text-valuecart-text-muted mt-0.5">Quick water rinse cleans off grease and raw meat residues completely.</p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Tab 2: Clean Specifications Table */}
        {activeTab === 'specs' && (
          <div className="py-6">
            <div className="border border-gray-200 rounded-2xl overflow-hidden divide-y divide-gray-100 max-w-2xl bg-white shadow-2xs">
              {product.specs && Object.keys(product.specs).length > 0 ? (
                Object.entries(product.specs).map(([key, val], idx) => (
                  <div
                    key={key}
                    className={`flex px-4 py-3 text-xs sm:text-sm ${
                      idx % 2 === 1 ? 'bg-gray-50/50' : ''
                    }`}
                  >
                    <span className="w-1/3 font-semibold text-valuecart-navy">{key}</span>
                    <span className="w-2/3 text-valuecart-text-muted">{val}</span>
                  </div>
                ))
              ) : (
                <>
                  <div className="flex px-4 py-3 text-xs sm:text-sm">
                    <span className="w-1/3 font-semibold text-valuecart-navy">Product</span>
                    <span className="w-2/3 text-valuecart-text-muted">{product.name}</span>
                  </div>
                  {product.material && (
                    <div className="flex px-4 py-3 text-xs sm:text-sm bg-gray-50/50">
                      <span className="w-1/3 font-semibold text-valuecart-navy">Material</span>
                      <span className="w-2/3 text-valuecart-text-muted">{product.material}</span>
                    </div>
                  )}
                  {product.dimensions && (
                    <div className="flex px-4 py-3 text-xs sm:text-sm">
                      <span className="w-1/3 font-semibold text-valuecart-navy">Dimensions</span>
                      <span className="w-2/3 text-valuecart-text-muted">{product.dimensions}</span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Reviews */}
        {activeTab === 'reviews' && (
          <div className="py-8 text-center space-y-3">
            <p className="text-sm font-semibold text-valuecart-navy">
              No customer reviews yet
            </p>
            <p className="text-xs text-valuecart-text-muted max-w-md mx-auto">
              Verified customer ratings and reviews will be displayed here once early delivery orders are fulfilled.
            </p>
          </div>
        )}
      </div>

      {/* 5. You May Also Like Section */}
      {relatedProducts.length > 0 && (
        <div className="mt-14">
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-valuecart-green bg-valuecart-green-tint px-3 py-1 rounded-full">
                Recommendations
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-valuecart-navy mt-1.5">
                You May Also Like
              </h2>
            </div>
            <Link
              href="/products?category=Home+%26+Kitchen"
              className="text-xs sm:text-sm font-semibold text-valuecart-green hover:text-valuecart-green-dark transition-colors"
            >
              View More Kitchen Deals →
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}

      {/* 6. Sticky Mobile Purchase Bar (< 768px) */}
      <div
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-valuecart-border px-4 py-2.5 shadow-2xl flex items-center justify-between gap-3"
        style={{ paddingBottom: 'max(0.6rem, env(safe-area-inset-bottom))' }}
      >
        <div>
          <span className="text-[10px] text-valuecart-text-muted block leading-none">
            {quantity > 1 ? `Total (${quantity} units)` : 'Price'}
          </span>
          <span className="text-xl font-black text-valuecart-navy leading-tight">
            ₹{product.price * quantity}
          </span>
        </div>

        <div className="flex items-center gap-2 flex-1 max-w-[240px]">
          {isOutOfStock ? (
            <span className="flex-1 text-center py-2.5 px-3 rounded-xl bg-gray-100 text-gray-500 font-bold text-xs border border-gray-200 select-none cursor-not-allowed">
              OUT OF STOCK
            </span>
          ) : (
            <>
              <button
                type="button"
                onClick={handleAddToCart}
                className="flex-1 bg-white hover:bg-gray-50 text-valuecart-navy border-2 border-valuecart-navy font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all active:scale-[0.98]"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>

              <button
                type="button"
                onClick={handleBuyNow}
                className="flex-1 bg-valuecart-green hover:bg-valuecart-green-dark text-white font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-[0.98]"
              >
                <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                <span>Buy Now</span>
              </button>
            </>
          )}
        </div>
      </div>

    </div>
  );
}
