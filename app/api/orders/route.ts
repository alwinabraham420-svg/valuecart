import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { PRODUCTS } from '@/data/products';
import { Order, OrderItem } from '@/types';
import { getProductRuntimeOverride } from '@/lib/runtimeProductStore';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { customer, delivery, items, paymentMethod, marketing } = body;

    // 1. Server-side validation of customer & delivery fields
    if (!customer?.name || !customer?.mobile) {
      return NextResponse.json(
        { error: 'Customer name and valid mobile number are required.' },
        { status: 400 }
      );
    }

    const cleanMobile = String(customer.mobile).replace(/\D/g, '');
    if (cleanMobile.length !== 10) {
      return NextResponse.json(
        { error: 'Mobile number must be a valid 10-digit Indian phone number.' },
        { status: 400 }
      );
    }

    if (!delivery?.houseFlat || !delivery?.streetArea || !delivery?.city || !delivery?.district || !delivery?.state || !delivery?.pincode) {
      return NextResponse.json(
        { error: 'Complete delivery address is required.' },
        { status: 400 }
      );
    }

    const cleanPincode = String(delivery.pincode).replace(/\D/g, '');
    if (cleanPincode.length !== 6) {
      return NextResponse.json(
        { error: 'PIN Code must be a valid 6-digit Indian postal code.' },
        { status: 400 }
      );
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Cannot create an order with an empty cart.' },
        { status: 400 }
      );
    }

    // 2. SERVER-SIDE PRICE VALIDATION (Never trust price from browser!)
    const supabase = await createClient();
    const verifiedOrderItems: OrderItem[] = [];
    let subtotal = 0;

    for (const item of items) {
      const qty = Math.max(1, Math.min(10, parseInt(item.quantity, 10) || 1));
      let officialPrice = 0;
      let officialName = '';
      let officialSlug = item.productSlug || '';
      let officialImage = '';
      let supplierCost = 0;
      let dbProductId = item.productId;

      const slugToLookup = item.productSlug || item.slug || '';
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(item.productId || '');

      // Check Supabase products table first if connected
      if (supabase) {
        try {
          let query = supabase.from('products').select('id, name, slug, selling_price, primary_image, is_active, stock_quantity');
          if (isUuid && slugToLookup) {
            query = query.or(`id.eq.${item.productId},slug.eq.${slugToLookup}`);
          } else if (isUuid) {
            query = query.eq('id', item.productId);
          } else if (slugToLookup) {
            query = query.eq('slug', slugToLookup);
          } else {
            query = query.eq('slug', 'stainless-steel-chopping-board');
          }

          const { data: dbProduct, error: dbError } = await query.maybeSingle();

          if (!dbError && dbProduct) {
            // Verify stock availability
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

            // Fetch supplier cost from product_economics if available
            const { data: dbEconomics } = await supabase
              .from('product_economics')
              .select('supplier_cost')
              .eq('product_id', dbProduct.id)
              .maybeSingle();

            if (dbEconomics?.supplier_cost) {
              supplierCost = Number(dbEconomics.supplier_cost);
            } else {
              supplierCost = Math.round(officialPrice * 0.38);
            }
          }
        } catch {
          // Fallback to static catalog if Supabase query fails
        }
      }

      // If not resolved from DB, check server-side static catalog fallback
      if (officialPrice === 0) {
        const staticProd = PRODUCTS.find(
          (p) => p.id === item.productId || p.slug === slugToLookup
        );
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

    // 3. Shipping charge calculation (Free delivery)
    const shippingCharge = 0;
    const grandTotal = subtotal + shippingCharge;
    const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `VC-${datePart}-${randSuffix}`;

    // 4. Handle Payment Method
    if (paymentMethod === 'online') {
      // Per instructions: DO NOT implement fake Razorpay success.
      return NextResponse.json(
        {
          error:
            'Razorpay online payment gateway is currently pending configuration with live API credentials. Please select Cash on Delivery to place your order immediately.',
          status: 'gateway_pending',
        },
        { status: 400 }
      );
    }

    // Cash on Delivery Order Creation
    const isCOD = true;
    const orderStatus = 'new';
    const paymentStatus = 'pending_cod';
    const totalSupplierCost = verifiedOrderItems.reduce(
      (acc, item) => acc + item.supplierCost * item.quantity,
      0
    );
    const advertisingCost = 0;
    const otherCost = 0;
    const estimatedProfit = grandTotal - totalSupplierCost;

    const fullOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      customer: {
        name: customer.name.trim(),
        mobile: cleanMobile,
        email: customer.email?.trim() || '',
      },
      delivery: {
        fullName: (delivery.fullName || customer.name || '').trim(),
        mobile: cleanMobile,
        email: (delivery.email || customer.email || '').trim(),
        houseFlat: (delivery.houseFlat || '').trim(),
        streetArea: (delivery.streetArea || '').trim(),
        landmark: (delivery.landmark || '').trim(),
        city: (delivery.city || '').trim(),
        district: (delivery.district || '').trim(),
        state: (delivery.state || '').trim(),
        pincode: cleanPincode,
      },
      items: verifiedOrderItems,
      payment: {
        method: 'cod',
        status: 'pending_cod',
      },
      orderStatus: 'new',
      statusHistory: [
        {
          status: 'new',
          timestamp: new Date().toISOString(),
          note: 'COD order placed by customer. Cash payment pending on delivery.',
          updatedBy: 'System / Customer Checkout',
        },
      ],
      supplier: {
        supplierName: '',
        supplierCost: totalSupplierCost,
        notes: '',
      },
      marketing: {
        utm_source: marketing?.utm_source || 'direct',
        utm_medium: marketing?.utm_medium || 'organic',
        utm_campaign: marketing?.utm_campaign || 'direct_traffic',
        utm_content: marketing?.utm_content,
        utm_term: marketing?.utm_term,
        fbclid: marketing?.fbclid,
        landingPage: marketing?.landingPage,
        referrer: marketing?.referrer,
        timestamp: new Date().toISOString(),
      },
      financials: {
        sellingPrice: grandTotal,
        supplierCost: totalSupplierCost,
        gatewayFee: 0,
        advertisingCost,
        otherCost,
        estimatedProfit,
      },
      customerTrackingTimeline: [
        {
          title: 'Order Placed (COD)',
          description: 'Order confirmed. Cash collection on delivery.',
          date: 'Just now',
          completed: true,
          current: true,
        },
        {
          title: 'Processing',
          description: 'Item being packed by our fulfillment partner.',
          date: 'Upcoming',
          completed: false,
          current: false,
        },
        {
          title: 'Shipped',
          description: 'Package handed over to courier partner.',
          date: 'Upcoming',
          completed: false,
          current: false,
        },
        {
          title: 'Out for Delivery',
          description: 'Courier agent will arrive at your address.',
          date: 'Upcoming',
          completed: false,
          current: false,
        },
        {
          title: 'Delivered',
          description: 'Delivered and cash collected.',
          date: 'Upcoming',
          completed: false,
          current: false,
        },
      ],
    };

    // 5. Insert into Supabase tables if connected
    let supabasePersisted = false;
    let supabaseErrorDetails = null;

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
            // Ignore user lookup error
          }
        }

        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .insert({
            order_number: orderNumber,
            user_id: validUserId,
            customer_name: fullOrder.customer.name,
            customer_mobile: fullOrder.customer.mobile,
            customer_email: fullOrder.customer.email,
            shipping_address: fullOrder.delivery,
            order_status: orderStatus,
            total_amount: grandTotal,
            discount_amount: 0,
            shipping_charge: shippingCharge,
            internal_notes: 'Created via Web Checkout API',
          })
          .select()
          .single();

      if (!orderError && orderData?.id) {
        const orderId = orderData.id;
        fullOrder.id = orderId;

        // Insert Order Items
        const orderItemsPayload = verifiedOrderItems.map((item) => ({
          order_id: orderId,
          product_name: item.productName,
          product_slug: item.productSlug,
          image_url: item.image,
          variant_details: item.variant || null,
          quantity: item.quantity,
          unit_selling_price: item.unitPrice,
          unit_supplier_cost: item.supplierCost,
        }));
        await supabase.from('order_items').insert(orderItemsPayload);

        // Insert Payments
        await supabase.from('payments').insert({
          order_id: orderId,
          payment_method: 'cod',
          payment_status: 'pending_cod',
          amount: grandTotal,
        });

        // Insert Marketing Attribution
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

        // Insert Order Status History
        await supabase.from('order_status_history').insert({
          order_id: orderId,
          previous_status: null,
          new_status: 'new',
          note: 'COD order placed by customer.',
          updated_by: 'Customer Checkout',
        });

        supabasePersisted = true;
      } else if (orderError) {
        supabaseErrorDetails = orderError.message;
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      supabaseErrorDetails = message;
    }
  }

    return NextResponse.json({
      success: true,
      order: fullOrder,
      persistedInSupabase: supabasePersisted,
      dbNotice: supabasePersisted
        ? 'Stored successfully in Supabase database'
        : `Local order created. Supabase sync pending: ${supabaseErrorDetails || 'Credentials not provided'}`,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown server error';
    return NextResponse.json(
      { error: 'Internal Server Error while creating order', details: message },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orderNumber = searchParams.get('order_number');

    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json({
        orders: [],
        notice: 'Supabase credentials pending in environment variables.',
      });
    }

    if (orderNumber) {
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*), payments(*), order_status_history(*)')
        .eq('order_number', orderNumber)
        .maybeSingle();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      return NextResponse.json({ order: data });
    }

    // List recent orders
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*), payments(*)')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ orders: data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, orderStatus, note, supplierDetails } = body;

    if (!orderId) {
      return NextResponse.json({ error: 'orderId is required' }, { status: 400 });
    }

    const supabase = createAdminClient() || (await createClient());
    if (!supabase) {
      return NextResponse.json({ error: 'Database client unavailable' }, { status: 500 });
    }

    if (orderStatus) {
      const { error: updateError } = await supabase
        .from('orders')
        .update({
          order_status: orderStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId);

      if (updateError) {
        console.error('Error updating order status in Supabase:', updateError);
        return NextResponse.json({ error: updateError.message }, { status: 500 });
      }

      await supabase.from('order_status_history').insert({
        order_id: orderId,
        new_status: orderStatus,
        note: note || `Status changed to ${orderStatus}`,
        updated_by: 'Admin Operations',
      });
    }

    if (supplierDetails) {
      await supabase.from('supplier_orders').upsert({
        order_id: orderId,
        supplier_order_id: supplierDetails.supplierOrderId,
        courier_name: supplierDetails.courier,
        tracking_number: supplierDetails.trackingNumber,
        total_supplier_cost: supplierDetails.supplierCost,
        notes: supplierDetails.notes,
      });
    }

    return NextResponse.json({ success: true, orderId, orderStatus });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    let orderId: string | null = null;
    try {
      const body = await req.json();
      orderId = body?.orderId || null;
    } catch {
      // Non-JSON body fallback to searchParams
    }

    if (!orderId) {
      const { searchParams } = new URL(req.url);
      orderId = searchParams.get('orderId') || searchParams.get('id');
    }

    if (!orderId) {
      return NextResponse.json({ error: 'orderId is required' }, { status: 400 });
    }

    // 1. Server-side Authentication & Admin Role Enforcement
    const supabaseServer = await createClient();
    let authUser = null;

    const authHeader = req.headers.get('Authorization') || req.headers.get('authorization');
    const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

    if (bearerToken && supabaseServer) {
      try {
        const { data } = await supabaseServer.auth.getUser(bearerToken);
        authUser = data?.user || null;
      } catch {
        // Continue to fallback checks
      }
    }

    if (!authUser && supabaseServer) {
      try {
        const { data } = await supabaseServer.auth.getUser();
        authUser = data?.user || null;
      } catch {
        // Continue
      }
    }

    if (!authUser && bearerToken) {
      try {
        const adminClient = createAdminClient();
        if (adminClient) {
          const { data } = await adminClient.auth.getUser(bearerToken);
          authUser = data?.user || null;
        }
      } catch {
        // Continue
      }
    }

    if (!authUser) {
      return NextResponse.json(
        { error: 'Unauthorized: Authentication required to delete orders.' },
        { status: 401 }
      );
    }

    // Verify Admin Role strictly
    const dbClient = createAdminClient() || supabaseServer;
    let isAdmin = false;

    const userEmail = authUser.email?.toLowerCase().trim() || '';
    if (
      userEmail === 'alwinabraham420@gmail.com' ||
      authUser.app_metadata?.role === 'admin' ||
      authUser.user_metadata?.role === 'admin'
    ) {
      isAdmin = true;
    } else if (dbClient) {
      const { data: userProfile } = await dbClient
        .from('users')
        .select('role')
        .eq('id', authUser.id)
        .maybeSingle();

      if (userProfile?.role === 'admin' || userProfile?.role === 'operator') {
        isAdmin = true;
      }
    }

    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required to delete orders.' },
        { status: 403 }
      );
    }

    if (!dbClient) {
      return NextResponse.json(
        { error: 'Database client unavailable' },
        { status: 500 }
      );
    }

    // 2. Resolve the actual database order UUID primary key
    let targetDbId: string | null = null;
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(orderId);

    if (isUuid) {
      const { data: ord } = await dbClient
        .from('orders')
        .select('id, order_number')
        .eq('id', orderId)
        .maybeSingle();
      if (ord?.id) {
        targetDbId = ord.id;
      }
    }

    if (!targetDbId) {
      const { data: ord } = await dbClient
        .from('orders')
        .select('id, order_number')
        .or(`id.eq.${orderId},order_number.eq.${orderId}`)
        .maybeSingle();
      if (ord?.id) {
        targetDbId = ord.id;
      }
    }

    // 3. Dependent records cleanup and Order Deletion
    if (targetDbId) {
      // Explicitly delete dependent child records in order to ensure clean cascade and avoid orphaned data
      await dbClient.from('order_status_history').delete().eq('order_id', targetDbId);
      await dbClient.from('marketing_attribution').delete().eq('order_id', targetDbId);
      await dbClient.from('supplier_orders').delete().eq('order_id', targetDbId);
      await dbClient.from('payments').delete().eq('order_id', targetDbId);
      await dbClient.from('order_items').delete().eq('order_id', targetDbId);

      // Delete the actual order
      const { error: deleteOrderError } = await dbClient
        .from('orders')
        .delete()
        .eq('id', targetDbId);

      if (deleteOrderError) {
        console.error('Error deleting order from database:', deleteOrderError);
        return NextResponse.json({ error: deleteOrderError.message }, { status: 500 });
      }
    }

    return NextResponse.json({
      success: true,
      deletedOrderId: targetDbId || orderId,
    });
  } catch (err: any) {
    console.error('Error in DELETE /api/orders:', err);
    return NextResponse.json(
      { error: err.message || 'Server error while deleting order' },
      { status: 500 }
    );
  }
}

