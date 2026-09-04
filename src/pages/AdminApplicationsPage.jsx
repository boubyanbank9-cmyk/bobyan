import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getApplications } from '../lib/applicationStorage'
import { isSupabaseConfigured, supabase } from '../lib/supabase'

function formatDate(value) {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString('ar-KW')
}

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState([])
  const [source, setSource] = useState('local')

  useEffect(() => {
    let active = true

    const loadApplications = async () => {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase
          .from('loan_applications')
          .select('*')
          .order('updated_at', { ascending: false })

        if (!error && active) {
          setApplications(data || [])
          setSource('supabase')
          return
        }
      }

      if (active) setApplications(getApplications())
    }

    loadApplications()

    if (!isSupabaseConfigured || !supabase) return () => { active = false }

    const channel = supabase
      .channel('loan-applications-admin')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'loan_applications' }, loadApplications)
      .subscribe()

    return () => {
      active = false
      supabase.removeChannel(channel)
    }
  }, [])

  const normalize = (item) => ({
    ...item,
    fullName: item.fullName || item.full_name,
    phoneNumber: item.phoneNumber || item.phone_number,
    civilId: item.civilId || item.civil_id_last2,
    accountNumber: item.accountNumber || item.account_last4,
    createdAt: item.createdAt || item.created_at,
    updatedAt: item.updatedAt || item.updated_at,
  })

  const normalizedApplications = applications.map(normalize)
  const pendingCount = normalizedApplications.filter((item) => item.status !== 'submitted').length

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-6" dir="rtl">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-3 rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Loan Requests</p>
            <h1 className="mt-2 text-2xl font-black text-slate-950">طلبات القروض والتسجيلات</h1>
          </div>
          <Link to="/admin" className="rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-black text-white">
            العودة للوحة الرئيسية
          </Link>
        </div>

        <div className="mb-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-xs font-bold text-slate-500">إجمالي الطلبات</p><p className="mt-1 text-3xl font-black text-slate-950">{normalizedApplications.length}</p></div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-xs font-bold text-slate-500">طلبات قيد المراجعة</p><p className="mt-1 text-3xl font-black text-amber-600">{pendingCount}</p></div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-xs font-bold text-slate-500">مصدر البيانات</p><p className="mt-2 font-black text-emerald-700">{source === 'supabase' ? 'مباشر من Supabase' : 'تخزين محلي'}</p></div>
        </div>

        {normalizedApplications.length === 0 ? (
          <div className="rounded-[24px] border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
            لا توجد طلبات مسجلة حاليًا.
          </div>
        ) : (
          <div className="space-y-4">
            {normalizedApplications.map((item) => (
              <div key={item.id} className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex flex-col gap-2 border-b border-slate-100 pb-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-bold text-slate-500">الطلب #{item.id?.slice(0, 8) || 'new'}</p>
                        <h2 className="text-xl font-black text-slate-900">{item.fullName || item.name || item.username || 'مستخدم جديد'}</h2>
                  </div>
                  <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">
                    {item.status || 'new'}
                  </span>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  <div><p className="text-xs text-slate-500">اسم المستخدم</p><p className="font-bold text-slate-800">{item.username || '—'}</p></div>
                  <div><p className="text-xs text-slate-500">البطاقة المدنية</p><p className="font-bold text-slate-800">{item.civilId || '—'}</p></div>
                  <div><p className="text-xs text-slate-500">رقم الحساب</p><p className="font-bold text-slate-800">{item.accountNumber || '—'}</p></div>
                  <div><p className="text-xs text-slate-500">رقم الهاتف</p><p className="font-bold text-slate-800">{item.phoneNumber || item.phone || '—'}</p></div>
                  <div><p className="text-xs text-slate-500">المبلغ</p><p className="font-bold text-slate-800">{item.amount || '—'}</p></div>
                  <div><p className="text-xs text-slate-500">الخطة</p><p className="font-bold text-slate-800">{item.plan || '—'}</p></div>
                  <div><p className="text-xs text-slate-500">الخطوة الحالية</p><p className="font-bold text-slate-800">{item.current_step || item.step || '—'}</p></div>
                  <div><p className="text-xs text-slate-500">تاريخ الإرسال</p><p className="font-bold text-slate-800">{formatDate(item.createdAt)}</p></div>
                  <div><p className="text-xs text-slate-500">آخر تحديث</p><p className="font-bold text-slate-800">{formatDate(item.updatedAt)}</p></div>
                </div>

                {item.notes && (
                  <div className="mt-4 rounded-2xl bg-slate-50 p-3 text-sm text-slate-700">
                    <span className="font-black">ملاحظات:</span> {item.notes}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
