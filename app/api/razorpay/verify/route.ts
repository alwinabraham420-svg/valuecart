import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getSupabaseServerClient, createAdminClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keySecret) {
      return NextResponse.json(
        { error: 'Razorpay secret key not configured on server.' },
        { status: 500 }
      );
    }

    const body = await req.json();
    const {
      orderId,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    } = body;

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return NextResponse.json(
        { error: 'Missing required Razorpay verification parameters.' },
        { status: 400 }
      );
    }

    // 1. Cryptographic HMAC SHA256 verification
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    const isValid = expectedSignature === razorpaySignature;

    if (!isValid) {
      console.error('Razorpay signature mismatch:', {
        expected: expectedSignature,
        received: razorpaySignature,
      });

      // Update payment status as failed in DB
      const supabase = createAdminClient() || (await getSupabaseServerClient());
      if (supabase && orderId) {
        await supabase
          .from('payments')
          .update({ payment_status: 'failed' })
          .eq('order_id', orderId);
      }

      return NextResponse.json(
        { error: 'Payment signature verification failed. Tampering detected.' },
        { status: 400 }
      );
    }

    // 2. Signature is strictly valid -> Mark order as paid in Supabase
    const supabase = createAdminClient() || (await getSupabaseServerClient());
    if (supabase && orderId) {
      // Update payment row
      await supabase
        .from('payments')
        .update({
          payment_status: 'paid',
          razorpay_payment_id: razorpayPaymentId,
          razorpay_signature: razorpaySignature,
          paid_at: new Date().toISOString(),
        })
        .eq('order_id', orderId);

      // Update order status
      await supabase
        .from('orders')
        .update({
          order_status: 'payment_confirmed',
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId);

      // Add status history record
      await supabase.from('order_status_history').insert({
        order_id: orderId,
        previous_status: 'new',
        new_status: 'payment_confirmed',
        note: `Online payment of ₹ verified successfully via Razorpay (Payment ID: ${razorpayPaymentId})`,
        updated_by: 'Razorpay Gateway Webhook / Verify',
      });
    }

    return NextResponse.json({
      success: true,
      orderId,
      paymentId: razorpayPaymentId,
      paymentStatus: 'paid',
      orderStatus: 'payment_confirmed',
    });
  } catch (error: any) {
    console.error('Error verifying Razorpay payment:', error);
    return NextResponse.json(
      { error: error?.message || 'Server error verifying payment.' },
      { status: 500 }
    );
  }
}
