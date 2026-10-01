import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PRODUCTS } from '@/data/products';
import { getProductBySlug } from '@/lib/supabase/products';
import ProductDetailClient from '@/components/ProductDetailClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://valuecart.in';

  if (!product) {
    return {
      title: 'Product Not Found | ValueCart',
    };
  }

  if (product.slug === 'stainless-steel-chopping-board') {
    return {
      title: '304 Stainless Steel Chopping Board | ValueCart',
      description:
        'Shop the 304 stainless steel chopping board from ValueCart. Medium 31.7 × 20.8 cm size with easy-clean, rust-resistant and multi-purpose kitchen features.',
      alternates: {
        canonical: `${siteUrl}/product/${product.slug}`,
      },
      openGraph: {
        title: '304 Stainless Steel Chopping Board | ValueCart',
        description:
          'Shop the 304 stainless steel chopping board from ValueCart. Medium 31.7 × 20.8 cm size with easy-clean, rust-resistant and multi-purpose kitchen features.',
        type: 'website',
        locale: 'en_IN',
        url: `${siteUrl}/product/${product.slug}`,
        images: [
          {
            url: product.image,
            width: 1024,
            height: 1024,
            alt: product.name,
          },
        ],
      },
    };
  }

  return {
    title: `${product.name} | ValueCart`,
    description: product.description,
    alternates: {
      canonical: `${siteUrl}/product/${product.slug}`,
    },
    openGraph: {
      title: `${product.name} | ValueCart`,
      description: product.description,
      type: 'website',
      locale: 'en_IN',
      url: `${siteUrl}/product/${product.slug}`,
      images: [
        {
          url: product.image,
          width: 800,
          height: 800,
          alt: product.name,
        },
      ],
    },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://valuecart.in';

  if (!product) {
    notFound();
  }

  // Related products from the same category
  const relatedProducts = PRODUCTS.filter(
    (p) => p.categorySlug === product.categorySlug && p.id !== product.id
  ).slice(0, 4);

  // JSON-LD Structured Data for Google Rich Snippets
  const jsonLd: Record<string, any> = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: product.name,
    image: product.images.map((img) =>
      img.startsWith('http') ? img : `${siteUrl}${img}`
    ),
    description: product.description,
    brand: {
      '@type': 'Brand',
      name: 'ValueCart',
    },
    offers: {
      '@type': 'Offer',
      url: `${siteUrl}/product/${product.slug}`,
      priceCurrency: 'INR',
      price: product.price,
      availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
    },
  };

  if (product.reviewCount > 0 && product.rating > 0) {
    jsonLd.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: product.rating,
      reviewCount: product.reviewCount,
    };
  }

  return (
    <>
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Suspense
        fallback={
          <div className="max-w-7xl mx-auto px-4 py-16 text-center text-valuecart-text-muted">
            <div className="w-8 h-8 border-3 border-valuecart-green border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <span>Loading product details...</span>
          </div>
        }
      >
        <ProductDetailClient
          product={product}
          relatedProducts={relatedProducts}
        />
      </Suspense>
    </>
  );
}
