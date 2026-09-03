import { isSupabaseConfigured, supabase } from './supabase'

export async function sendOrderConfirmation(orderId) {
  if (!isSupabaseConfigured || !orderId) {
    return { ok: true, smsSent: false, demo: true }
  }

  try {
    const { data, error } = await supabase.functions.invoke('send-order-confirmation', {
      body: { order_id: orderId },
    })

    if (error && !data) {
      console.warn('send-order-confirmation failed', error.message)
      return { ok: false, error: error.message }
    }

    return {
      ok: Boolean(data?.success),
      smsSent: Boolean(data?.sms_sent),
      orderNumber: data?.order_number || '',
      error: data?.error,
    }
  } catch (err) {
    console.warn('send-order-confirmation unavailable', err)
    return { ok: false, error: err?.message || 'تعذر إرسال التأكيد' }
  }
}
