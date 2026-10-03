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
      const stockQty =
        typeof data.stock_quantity === 'number'
          ? data.stock_quantity
          : data.slug === 'stainless-steel-chopping-board'
          ? 120
          : data.slug === '2-in-1-oil-sprayer-glass-bottle-dispenser'
          ? 100
          : 0;
      const isAvail = Boolean(data.is_active !== false && stockQty > 0);

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
        rating: Number(data.rating) || 0,
        reviewCount: data.review_count || 0,
        image: data.primary_image,
        images: Array.isArray(data.images) ? data.images : [data.primary_image],
        description: data.description || '',
        stock: stockQty,
        isAvailable: isAvail,
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
      const dbSlugs = new Set(data.map((d: any) => d.slug));
      const dbProducts = data.map((item) => {
        const specs = (item.specs as Record<string, unknown>) || {};
        const categoryData = Array.isArray(item.categories) ? item.categories[0] : item.categories;
        const stockQty =
          typeof item.stock_quantity === 'number'
            ? item.stock_quantity
            : item.slug === 'stainless-steel-chopping-board'
            ? 120
            : item.slug === '2-in-1-oil-sprayer-glass-bottle-dispenser'
            ? 100
            : 0;
        const isAvail = Boolean(item.is_active !== false && stockQty > 0);

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
          rating: Number(item.rating) || 0,
          reviewCount: item.review_count || 0,
          image: item.primary_image,
          images: Array.isArray(item.images) ? item.images : [item.primary_image],
          description: item.description || '',
          stock: stockQty,
          isAvailable: isAvail,
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

      const remainingStatic = PRODUCTS.filter((p) => !dbSlugs.has(p.slug));
      return [...dbProducts, ...remainingStatic];
    }
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[ValueCart Supabase] Failed to fetch all products from DB, using fallback:', err);
    }
  }

  return PRODUCTS;
}
