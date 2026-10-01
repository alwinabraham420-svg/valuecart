import { createClient } from './server';
import { Product } from '@/types';
import { PRODUCTS } from '@/data/products';

export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const supabase = await createClient();
    if (!supabase) {
      return PRODUCTS.find((p) => p.slug === slug) || null;
    }

    const { data, error } = await supabase
      .from('products')
      .select('*, categories(name, slug)')
      .eq('slug', slug)
      .eq('is_active', true)
      .maybeSingle();

    if (!error && data) {
      const specs = (data.specs as Record<string, unknown>) || {};
      const categoryData = Array.isArray(data.categories) ? data.categories[0] : data.categories;

      return {
        id: data.id,
        slug: data.slug,
        name: data.name,
        shortName: data.short_name || data.name,
        category: categoryData?.name || 'Home & Kitchen',
        categorySlug: categoryData?.slug || 'home-kitchen',
        price: Number(data.selling_price),
        originalPrice: Number(data.original_price),
        discount: Number(data.discount_percentage) || 0,
        rating: Number(data.rating) || 4.8,
        reviewCount: data.review_count || 0,
        image: data.primary_image,
        images: Array.isArray(data.images) ? data.images : [data.primary_image],
        description: data.description || '',
        stock: data.stock_quantity || 100,
        featured: data.is_deal || false,
        bestSeller: data.is_bestseller || false,
        deal: data.is_deal || false,
        badge: data.is_bestseller ? 'Best Seller' : undefined,
        material: (specs.material as string) || undefined,
        dimensions: (specs.dimensions as string) || undefined,
        sizeLabel: (specs.sizeLabel as string) || undefined,
        features: (specs.features as string[]) || undefined,
        useCases: (specs.useCases as { title: string; subtitle: string; image: string }[]) || undefined,
      };
    }
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[ValueCart Supabase] Failed to fetch product from DB, using fallback:', err);
    }
  }

  // Graceful fallback to static product catalog
  return PRODUCTS.find((p) => p.slug === slug) || null;
}

export async function getAllProducts(): Promise<Product[]> {
  try {
    const supabase = await createClient();
    if (!supabase) {
      return PRODUCTS;
    }

    const { data, error } = await supabase
      .from('products')
      .select('*, categories(name, slug)')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) {
      return data.map((item) => {
        const specs = (item.specs as Record<string, unknown>) || {};
        const categoryData = Array.isArray(item.categories) ? item.categories[0] : item.categories;

        return {
          id: item.id,
          slug: item.slug,
          name: item.name,
          shortName: item.short_name || item.name,
          category: categoryData?.name || 'Home & Kitchen',
          categorySlug: categoryData?.slug || 'home-kitchen',
          price: Number(item.selling_price),
          originalPrice: Number(item.original_price),
          discount: Number(item.discount_percentage) || 0,
          rating: Number(item.rating) || 4.8,
          reviewCount: item.review_count || 0,
          image: item.primary_image,
          images: Array.isArray(item.images) ? item.images : [item.primary_image],
          description: item.description || '',
          stock: item.stock_quantity || 100,
          featured: item.is_deal || false,
          bestSeller: item.is_bestseller || false,
          deal: item.is_deal || false,
          badge: item.is_bestseller ? 'Best Seller' : undefined,
          material: (specs.material as string) || undefined,
          dimensions: (specs.dimensions as string) || undefined,
          sizeLabel: (specs.sizeLabel as string) || undefined,
          features: (specs.features as string[]) || undefined,
          useCases: (specs.useCases as { title: string; subtitle: string; image: string }[]) || undefined,
        };
      });
    }
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[ValueCart Supabase] Failed to fetch all products from DB, using fallback:', err);
    }
  }

  return PRODUCTS;
}
