import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getSupabaseServerClient, createAdminClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    const signature = req.headers.get('x-razorpay-signature');
    const rawBody = await req.text();

    if (webhookSecret) {
      if (!signature) {
        return NextResponse.json({ error: 'Missing x-razorpay-signature header' }, { status: 400 });
      }

      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(rawBody)
        .digest('hex');

      if (expectedSignature !== signature) {
        console.error('Invalid Razorpay webhook signature');
        return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
      }
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event;
    const payment = payload.payload?.payment?.entity;
    const rzpOrderId = payment?.order_id;

    if (!rzpOrderId) {
      return NextResponse.json({ received: true });
    }

    const supabase = createAdminClient() || (await getSupabaseServerClient());
    if (!supabase) {
      return NextResponse.json({ received: true });
    }

    // Find the payment row in Supabase
    const { data: paymentRecord } = await supabase
      .from('payments')
      .select('id, order_id, payment_status')
      .eq('razorpay_order_id', rzpOrderId)
      .maybeSingle();

    if (!paymentRecord) {
      return NextResponse.json({ received: true, note: 'Order not found in DB' });
    }

    // Idempotent event processing
    if (event === 'payment.captured' || event === 'order.paid') {
      if (paymentRecord.payment_status !== 'paid') {
        await supabase
          .from('payments')
          .update({
            payment_status: 'paid',
            razorpay_payment_id: payment?.id,
            paid_at: new Date().toISOString(),
          })
          .eq('id', paymentRecord.id);

        await supabase
          .from('orders')
          .update({
            order_status: 'payment_confirmed',
            updated_at: new Date().toISOString(),
          })
          .eq('id', paymentRecord.order_id);

        await supabase.from('order_status_history').insert({
          order_id: paymentRecord.order_id,
          previous_status: 'new',
          new_status: 'payment_confirmed',
          note: `Payment confirmed via webhook (${event}). Amount: ₹${(payment?.amount || 0) / 100}`,
          updated_by: 'Razorpay Webhook',
        });
      }
    } else if (event === 'payment.failed') {
      await supabase
        .from('payments')
        .update({ payment_status: 'failed' })
        .eq('id', paymentRecord.id);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Error handling Razorpay webhook:', error);
    return NextResponse.json(
      { error: error?.message || 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
