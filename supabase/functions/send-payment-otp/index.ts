import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function maskPhone(phone: string) {
  const digits = phone.replace(/\D/g, '')
  if (digits.length < 4) return '****'
  return `****${digits.slice(-4)}`
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

    const { data: otpResult, error: otpError } = await admin.rpc('request_payment_otp', {
      p_order_id: orderId,
    })

    if (otpError) {
      return new Response(JSON.stringify({ error: otpError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (otpResult?.locked) {
      return new Response(JSON.stringify({ error: 'فشل التحقق.', locked: true }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (!otpResult?.success) {
      return new Response(JSON.stringify({ error: 'تعذر إنشاء رمز التحقق.' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { data: order, error: orderError } = await admin
      .from('orders')
      .select('customer_phone, payment_otp_code')
      .eq('id', orderId)
      .maybeSingle()

    if (orderError || !order?.payment_otp_code) {
      return new Response(JSON.stringify({ error: 'تعذر قراءة رمز التحقق.' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    let smsSent = false

    if (twilioSid && twilioToken && twilioFrom && order.customer_phone) {
      const toPhone = normalizeUaePhone(order.customer_phone)
      const body = encodeURIComponent(
        `رمز التحقق Al Ain Water: ${order.payment_otp_code}. صالح 5 دقائق. لا تشارك الرمز مع أحد.`,
      )

      const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`
      const twilioResponse = await fetch(twilioUrl, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${btoa(`${twilioSid}:${twilioToken}`)}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `To=${encodeURIComponent(toPhone)}&From=${encodeURIComponent(twilioFrom)}&Body=${body}`,
      })

      smsSent = twilioResponse.ok
    }

    return new Response(
      JSON.stringify({
        success: true,
        masked_phone: maskPhone(order.customer_phone || ''),
        otp_length: otpResult.otp_length,
        attempts: otpResult.attempts,
        remaining: otpResult.remaining,
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
