import { isSupabaseConfigured, supabase } from './supabase'

export async function submitContactMessage({ name, email, message, subject = 'رسالة من الموقع' }) {
  const payload = {
    name: String(name || '').trim(),
    email: String(email || '').trim(),
    message: String(message || '').trim(),
    subject: String(subject || '').trim() || 'رسالة من الموقع',
  }

  if (!payload.name || !payload.email || !payload.message) {
    return { ok: false, error: 'يرجى تعبئة جميع الحقول.' }
  }

  if (!isSupabaseConfigured) {
    await new Promise((resolve) => window.setTimeout(resolve, 400))
    return { ok: true, demo: true }
  }

  const { error } = await supabase.from('contact_messages').insert(payload)
  if (error) {
    return { ok: false, error: error.message }
  }

  return { ok: true }
}
