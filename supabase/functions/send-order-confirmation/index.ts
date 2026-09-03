import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function normalizeUaePhone(phone: string) {
  const digits = phone.replace(/\D/g, '')
  if (digits.startsWith('971')) return `+${digits}`
  if (digits.startsWith('00971')) return `+${digits.slice(2)}`
  if (digits.startsWith('05') && digits.length === 10) return `+971${digits.slice(1)}`
  if (digits.startsWith('5') && digits.length === 9) return `+971${digits}`
  if (digits.startsWith('0')) return `+971${digits.slice(1)}`
  return `+${digits}`
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { order_id: orderId } = await req.json()

    if (!orderId) {
      return new Response(JSON.stringify({ error: 'رقم الطلب مطلوب.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const twilioSid = Deno.env.get('TWILIO_ACCOUNT_SID')
    const twilioToken = Deno.env.get('TWILIO_AUTH_TOKEN')
    const twilioFrom = Deno.env.get('TWILIO_PHONE_NUMBER')

    const admin = createClient(supabaseUrl, serviceRoleKey)

    const { data: order, error: orderError } = await admin
      .from('orders')
      .select('order_number, customer_name, customer_phone, pay_now_amount, total_amount, payment_status')
      .eq('id', orderId)
      .maybeSingle()

    if (orderError || !order) {
      return new Response(JSON.stringify({ error: 'تعذر قراءة الطلب.' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const payNow = Number(order.pay_now_amount || 0).toFixed(3)
    const message = `شكراً ${order.customer_name}! تم تأكيد طلبك ${order.order_number} في Al Ain Water. المبلغ: ${payNow} AED. سنتواصل معك قريباً.`

    let smsSent = false

    if (twilioSid && twilioToken && twilioFrom && order.customer_phone) {
      const toPhone = normalizeUaePhone(order.customer_phone)
      const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`
      const twilioResponse = await fetch(twilioUrl, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${btoa(`${twilioSid}:${twilioToken}`)}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `To=${encodeURIComponent(toPhone)}&From=${encodeURIComponent(twilioFrom)}&Body=${encodeURIComponent(message)}`,
      })

      smsSent = twilioResponse.ok
    }

    return new Response(
      JSON.stringify({
        success: true,
        order_number: order.order_number,
        sms_sent: smsSent,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (error) {
    return new Response(JSON.stringify({ error: error?.message || 'خطأ غير متوقع' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
