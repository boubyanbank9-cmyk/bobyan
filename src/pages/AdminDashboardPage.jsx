import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { isSupabaseConfigured, supabase } from '../lib/supabase'
import ProtectedRoute from '../components/ProtectedRoute'
import AdminHayy from '../admin/AdminHayy'
import AdminContactMessages from '../admin/AdminContactMessages'

export default function AdminDashboardPage() {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setReady(true)
      return
    }

    const load = async () => {
      const { data: sessionData } = await supabase.auth.getSession()
      if (!sessionData.session) {
        setReady(true)
        return
      }

      const { data, error } = await supabase.rpc('is_admin')
      setReady(true)

      if (error || !data) {
        window.location.href = '/admin/login'
      }
    }

    load()
  }, [])

  if (!ready) {
    return (
      <div className="min-h-screen bg-slate-100 px-4 py-10 text-center" dir="rtl">
        <p className="text-slate-500 font-bold">جاري تجهيز لوحة التحكم...</p>
      </div>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-100 px-4 py-6 sm:px-6 lg:px-8" dir="rtl">
        <div className="mx-auto max-w-7xl space-y-6">
          <header className="rounded-[28px] border border-slate-200 bg-white px-5 py-5 shadow-sm sm:px-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-500">Admin Panel</p>
                <h1 className="mt-2 text-2xl font-black text-slate-950">لوحة التحكم</h1>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Link to="/admin/applications" className="rounded-2xl bg-red-600 px-4 py-2.5 text-sm font-black text-white transition hover:bg-red-700">
                  الطلبات المسجلة
                </Link>
                <button
                  type="button"
                  onClick={async () => {
                    await supabase.auth.signOut()
                    window.location.href = '/admin/login'
                  }}
                  className="rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-black text-white transition hover:bg-slate-800"
                >
                  تسجيل الخروج
                </button>
              </div>
            </div>
          </header>

          <div className="space-y-6">
            <AdminHayy />
            <AdminContactMessages />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
