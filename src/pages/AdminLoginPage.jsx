import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { isSupabaseConfigured, supabase } from '../lib/supabase'

export default function AdminLoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!isSupabaseConfigured || !supabase) {
      setError('Supabase غير مهيأ بعد. تأكد من ملف .env وأن المشروع متصل بقاعدة البيانات.')
      return
    }

    setLoading(true)
    setError('')

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })

    setLoading(false)

    if (signInError) {
      setError(signInError.message || 'حدث خطأ أثناء تسجيل الدخول.')
      return
    }

    navigate('/admin')
  }

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-10" dir="rtl">
      <div className="mx-auto max-w-md rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-8 text-center">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Dashboard</p>
          <h1 className="mt-3 text-3xl font-black text-slate-950">تسجيل دخول الإدارة</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-bold text-slate-700">البريد الإلكتروني</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
              placeholder="admin@domain.com"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-slate-700">كلمة المرور</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-sky-700 px-5 py-3.5 text-base font-black text-white transition hover:bg-sky-800 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? 'جاري تسجيل الدخول...' : 'دخول'}
          </button>
        </form>
      </div>
    </div>
  )
}
