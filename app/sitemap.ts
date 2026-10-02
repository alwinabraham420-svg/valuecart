import { MetadataRoute } from 'next';
import { PRODUCTS } from '@/data/products';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://valuecart.in';

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/products`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/cart`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.5,
    },
  ];

  const categories = ['home-kitchen', 'men-fashion', 'women-fashion', 'electronics', 'beauty-care'];
  const categoryRoutes: MetadataRoute.Sitemap = categories.map((slug) => ({
    url: `${baseUrl}/category/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.8,
  }));

  const productRoutes: MetadataRoute.Sitemap = PRODUCTS.map((product) => ({
    url: `${baseUrl}/product/${product.slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: product.slug === 'stainless-steel-chopping-board' ? 0.95 : 0.7,
  }));

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}
