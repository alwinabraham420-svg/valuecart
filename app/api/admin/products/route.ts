import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { PRODUCTS } from '@/data/products';

export async function GET() {
  try {
    const supabase = createAdminClient();
    if (!supabase) {
      return NextResponse.json({ products: PRODUCTS });
    }

    const { data, error } = await supabase
      .from('products')
      .select('*, categories(name, slug), product_economics(*)')
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      return NextResponse.json({ products: PRODUCTS });
    }

    // Merge DB records with static catalog
    const merged = PRODUCTS.map((staticProd) => {
      const dbMatch = data.find((d: any) => d.slug === staticProd.slug || d.id === staticProd.id);
      if (!dbMatch) return staticProd;

      const stockQty = typeof dbMatch.stock_quantity === 'number' ? dbMatch.stock_quantity : 0;
      const isAvail = Boolean(dbMatch.is_active !== false && stockQty > 0);

      return {
        ...staticProd,
        id: dbMatch.id,
        price: Number(dbMatch.selling_price) || staticProd.price,
        originalPrice: Number(dbMatch.original_price) || staticProd.originalPrice,
        stock: stockQty,
        isAvailable: isAvail,
      };
    });

    return NextResponse.json({ products: merged });
  } catch (err: any) {
    return NextResponse.json({ products: PRODUCTS, error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { productId, slug, updates } = body;

    if (!productId && !slug) {
      return NextResponse.json({ error: 'productId or slug is required.' }, { status: 400 });
    }

    const supabase = createAdminClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Database client unavailable.' }, { status: 500 });
    }

    const dbPayload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (typeof updates?.stock === 'number') {
      dbPayload.stock_quantity = Math.max(0, Math.floor(updates.stock));
    }

    if (updates?.isAvailable !== undefined) {
      // Products stay visible (is_active = true) for SEO & discovery per requirements.
      // If marked unavailable, set stock_quantity to 0 unless an explicit stock > 0 was given.
      if (!updates.isAvailable && updates.stock === undefined) {
        dbPayload.stock_quantity = 0;
      } else if (updates.isAvailable && (updates.stock === undefined || updates.stock <= 0)) {
        dbPayload.stock_quantity = 100;
      }
    }

    if (updates?.price !== undefined) {
      dbPayload.selling_price = Number(updates.price);
    }
    if (updates?.originalPrice !== undefined) {
      dbPayload.original_price = Number(updates.originalPrice);
    }
    if (updates?.name) {
      dbPayload.name = updates.name;
    }

    let query = supabase.from('products').update(dbPayload);
    if (productId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(productId)) {
      query = query.eq('id', productId);
    } else if (slug) {
      query = query.eq('slug', slug);
    } else {
      query = query.eq('slug', productId);
    }

    const { data, error } = await query.select().maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, updated: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
