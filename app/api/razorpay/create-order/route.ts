import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { PRODUCTS } from '@/data/products';
import { getProductRuntimeOverride } from '@/lib/runtimeProductStore';

export async function POST(req: NextRequest) {
  try {
    const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return NextResponse.json(
        {
          error:
            'Razorpay API credentials (RAZORPAY_KEY_ID & RAZORPAY_KEY_SECRET) are not configured on the server. Please configure them in .env.local or select Cash on Delivery.',
          code: 'RAZORPAY_CONFIG_MISSING',
        },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { items, customer, delivery, marketing } = body;

    if (!customer?.name || !customer?.mobile) {
      return NextResponse.json(
        { error: 'Customer name and 10-digit mobile number are required.' },
        { status: 400 }
      );
    }

    const cleanMobile = customer.mobile.replace(/\D/g, '');
    if (cleanMobile.length !== 10) {
      return NextResponse.json(
        { error: 'Mobile number must be a valid 10-digit Indian number.' },
        { status: 400 }
      );
    }

    if (!delivery?.pincode) {
      return NextResponse.json({ error: 'Delivery PIN code is required.' }, { status: 400 });
    }

    const cleanPincode = delivery.pincode.replace(/\D/g, '');
    if (cleanPincode.length !== 6) {
      return NextResponse.json({ error: 'PIN code must be exactly 6 digits.' }, { status: 400 });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Order must contain at least one item.' }, { status: 400 });
    }

    const supabase = await getSupabaseServerClient();

    // 1. Server-side price & stock verification (NEVER trust client price)
    let subtotal = 0;
    const verifiedOrderItems = [];

    for (const item of items) {
      const qty = Math.max(1, Math.min(10, Number(item.quantity) || 1));
      let officialPrice = 0;
      let officialName = '';
      let officialSlug = '';
      let officialImage = '';
      let supplierCost = 0;
      let dbProductId = item.productId;

      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(item.productId || '');
      const slugToLookup = item.productSlug || item.slug || '';

      if (supabase) {
        try {
          let query = supabase
            .from('products')
            .select('id, name, slug, selling_price, primary_image, is_active, stock_quantity');

          if (isUuid && slugToLookup) {
            query = query.or(`id.eq.${item.productId},slug.eq.${slugToLookup}`);
          } else if (isUuid) {
            query = query.eq('id', item.productId);
          } else if (slugToLookup) {
            query = query.eq('slug', slugToLookup);
          } else {
            query = query.eq('slug', 'stainless-steel-chopping-board');
          }

          const { data: dbProduct } = await query.maybeSingle();

          if (dbProduct) {
            if (!dbProduct.is_active || (dbProduct.stock_quantity !== null && dbProduct.stock_quantity <= 0)) {
              return NextResponse.json(
                { error: `Sorry, product "${dbProduct.name}" is currently out of stock.` },
                { status: 400 }
              );
            }
            officialPrice = Number(dbProduct.selling_price);
            officialName = dbProduct.name;
            officialSlug = dbProduct.slug;
            officialImage = dbProduct.primary_image;
            dbProductId = dbProduct.id;
            supplierCost = Math.round(officialPrice * 0.38);
          }
        } catch {
          // Fallback to static catalog if Supabase query fails
        }
      }

      if (officialPrice === 0) {
        const staticProd = PRODUCTS.find((p) => p.id === item.productId || p.slug === item.productSlug);
        if (staticProd) {
          const override = getProductRuntimeOverride(staticProd.id) || getProductRuntimeOverride(staticProd.slug);
          const effectiveIsAvailable = override?.isAvailable !== undefined ? override.isAvailable : staticProd.isAvailable;
          const effectiveStock = override?.stock !== undefined ? override.stock : staticProd.stock;

          if (!effectiveIsAvailable || effectiveStock <= 0) {
            return NextResponse.json(
              { error: `Sorry, product "${staticProd.name}" is currently out of stock.` },
              { status: 400 }
            );
          }
          officialPrice = staticProd.price;
          officialName = staticProd.name;
          officialSlug = staticProd.slug;
          officialImage = staticProd.image;
          supplierCost = staticProd.economics?.supplierCost || Math.round(staticProd.price * 0.38);
          dbProductId = staticProd.id;
        } else {
          return NextResponse.json(
            { error: `Invalid product requested: ${item.productId || item.productSlug}` },
            { status: 400 }
          );
        }
      }

      subtotal += officialPrice * qty;
      verifiedOrderItems.push({
        productId: dbProductId,
        productName: officialName,
        productSlug: officialSlug,
        image: officialImage,
        variant: item.variant || undefined,
        quantity: qty,
        unitPrice: officialPrice,
        supplierCost,
      });
    }

    const shippingCharge = 0;
    const grandTotal = subtotal + shippingCharge;
    const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `VC-${datePart}-${randSuffix}`;

    // 2. Initialize Razorpay SDK
    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const amountInPaise = Math.round(grandTotal * 100);

    const rzpOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: orderNumber,
      notes: {
        customer_name: customer.name,
        customer_mobile: cleanMobile,
        order_number: orderNumber,
      },
    });

    // 3. Create initial pending order in Supabase
    let orderId = `ord-${Date.now()}`;

    if (supabase) {
      try {
        let validUserId: string | null = null;
        if (customer.userId) {
          try {
            const { data: userRow } = await supabase
              .from('users')
              .select('id')
              .eq('id', customer.userId)
              .maybeSingle();
            if (userRow?.id) {
              validUserId = userRow.id;
            }
          } catch {
            // Ignore error
          }
        }

        const { data: orderData } = await supabase
          .from('orders')
          .insert({
            order_number: orderNumber,
            user_id: validUserId,
            customer_name: customer.name.trim(),
            customer_mobile: cleanMobile,
            customer_email: customer.email?.trim() || null,
            shipping_address: delivery,
            order_status: 'new',
            total_amount: grandTotal,
            discount_amount: 0,
            shipping_charge: shippingCharge,
            internal_notes: `Razorpay pending order: ${rzpOrder.id}`,
          })
          .select()
          .single();

        if (orderData?.id) {
          orderId = orderData.id;

          // Insert order items
          const itemsPayload = verifiedOrderItems.map((v) => ({
            order_id: orderId,
            product_id: v.productId.includes('-') ? v.productId : null,
            product_name: v.productName,
            product_slug: v.productSlug,
            image_url: v.image,
            quantity: v.quantity,
            unit_selling_price: v.unitPrice,
            unit_supplier_cost: v.supplierCost,
          }));
          await supabase.from('order_items').insert(itemsPayload);

          // Insert initial payment record (marks as 'failed' until server HMAC signature verification or webhook sets it to 'paid')
          await supabase.from('payments').insert({
            order_id: orderId,
            payment_method: 'online',
            payment_status: 'failed',
            razorpay_order_id: rzpOrder.id,
            amount: grandTotal,
          });

          // Marketing attribution
          if (marketing) {
            await supabase.from('marketing_attribution').insert({
              order_id: orderId,
              utm_source: marketing.utm_source || 'direct',
              utm_medium: marketing.utm_medium || 'organic',
              utm_campaign: marketing.utm_campaign,
              utm_content: marketing.utm_content,
              utm_term: marketing.utm_term,
              fbclid: marketing.fbclid,
              landing_page: marketing.landingPage,
              referrer: marketing.referrer,
            });
          }
        }
      } catch (dbErr) {
        console.error('Supabase error creating pending Razorpay order:', dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      orderId,
      orderNumber,
      razorpayOrderId: rzpOrder.id,
      amount: grandTotal,
      currency: 'INR',
      keyId,
    });
  } catch (error: any) {
    console.error('Error creating Razorpay order:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to initiate online payment.' },
      { status: 500 }
    );
  }
}
