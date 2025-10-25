/**
 * Supabase Edge Function: Razorpay Webhook Handler
 * Handles payment webhooks from Razorpay
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { createHmac } from 'https://deno.land/std@0.177.0/node/crypto.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-razorpay-signature',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get webhook signature
    const signature = req.headers.get('x-razorpay-signature')
    if (!signature) {
      throw new Error('Missing signature')
    }

    // Get raw body
    const body = await req.text()

    // Verify webhook signature
    const webhookSecret = Deno.env.get('RAZORPAY_WEBHOOK_SECRET') ?? ''
    const expectedSignature = createHmac('sha256', webhookSecret)
      .update(body)
      .digest('hex')

    if (signature !== expectedSignature) {
      throw new Error('Invalid signature')
    }

    // Parse event
    const event = JSON.parse(body)
    console.log('Processing event:', event.event)

    // Handle different event types
    switch (event.event) {
      case 'payment.captured': {
        const payment = event.payload.payment.entity

        // Update payment status
        const { error } = await supabaseClient
          .from('payments')
          .update({
            status: 'completed',
            razorpay_payment_id: payment.id,
            payment_method: payment.method,
            webhook_processed_at: new Date().toISOString(),
          })
          .eq('razorpay_order_id', payment.order_id)

        if (error) {
          console.error('Failed to update payment:', error)
          throw error
        }

        // Get booking and update status
        const { data: paymentData } = await supabaseClient
          .from('payments')
          .select('booking_id, bookings(advisor_id)')
          .eq('razorpay_order_id', payment.order_id)
          .single()

        if (paymentData) {
          await supabaseClient
            .from('bookings')
            .update({ status: 'confirmed' })
            .eq('id', paymentData.booking_id)

          // Update advisor stats
          await supabaseClient.rpc('increment_advisor_bookings', {
            advisor_id: paymentData.bookings.advisor_id,
          })
        }
        break
      }

      case 'payment.failed': {
        const payment = event.payload.payment.entity

        await supabaseClient
          .from('payments')
          .update({
            status: 'failed',
            error_code: payment.error_code,
            error_description: payment.error_description,
            webhook_processed_at: new Date().toISOString(),
          })
          .eq('razorpay_order_id', payment.order_id)
        break
      }

      case 'refund.created': {
        const refund = event.payload.refund.entity

        await supabaseClient
          .from('payments')
          .update({
            status: 'refunded',
            refund_amount: refund.amount / 100,
            refunded_at: new Date().toISOString(),
          })
          .eq('razorpay_payment_id', refund.payment_id)
        break
      }

      default:
        console.log('Unhandled event type:', event.event)
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})

