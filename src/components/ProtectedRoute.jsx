import { useEffect, useRef, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { isSupabaseConfigured, supabase } from '../lib/supabase'

const ADMIN_CHECK_MS = 12000
const SESSION_BOOT_MS = 15000

function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      window.setTimeout(() => reject(new Error('timeout')), ms)
    }),
  ])
}

async function checkIsAdmin() {
  const { data, error } = await supabase.rpc('is_admin')
  if (error) throw error
  return Boolean(data)
}

export default function ProtectedRoute({ children }) {
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [checkError, setCheckError] = useState('')
  const activeRef = useRef(true)
  const resolvedRef = useRef(false)

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setLoading(false)
      setCheckError('Supabase غير مُعد. راجع ملف .env')
      return undefined
    }

    activeRef.current = true
    resolvedRef.current = false

    const evaluateSession = async (nextSession) => {
      if (!activeRef.current) return

      setCheckError('')
      setSession(nextSession)

      if (!nextSession) {
        setIsAdmin(false)
        resolvedRef.current = true
        setLoading(false)
        return
      }

      try {
        const admin = await withTimeout(checkIsAdmin(), ADMIN_CHECK_MS)
        if (!activeRef.current) return
        setIsAdmin(admin)
      } catch (error) {
        console.error(error)
        if (!activeRef.current) return
        setIsAdmin(false)
        const msg = error?.message || ''
        if (msg === 'timeout' || msg.includes('Failed to fetch')) {
          setCheckError(
            'تعذر الاتصال بـ Supabase أو انتهت مهلة التحقق. تأكد من الإنترنت وملف .env ثم أعد المحاولة.'
          )
        } else if (msg.includes('is_admin')) {
          setCheckError('دالة is_admin غير موجودة. شغّل supabase/fix-everything.sql في SQL Editor.')
        } else {
          setCheckError(msg || 'تعذر التحقق من صلاحيات الأدمن.')
        }
      } finally {
        if (activeRef.current) {
          resolvedRef.current = true
          setLoading(false)
        }
      }
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      window.setTimeout(() => {
        evaluateSession(nextSession)
      }, 0)
    })

    supabase.auth.getSession().then(({ data }) => {
      window.setTimeout(() => {
        if (!resolvedRef.current) {
          evaluateSession(data.session)
        }
      }, 0)
    })

    const bootTimer = window.setTimeout(() => {
      if (!activeRef.current || resolvedRef.current) return
      setLoading(false)
      setCheckError(
        'تعذر بدء الجلسة. تأكد أن السيرفر يعمل وأن Supabase متصل، ثم أعد المحاولة.'
      )
    }, SESSION_BOOT_MS)

    return () => {
      activeRef.current = false
      window.clearTimeout(bootTimer)
      subscription.unsubscribe()
    }
  }, [])

  const retryCheck = () => {
    if (!supabase) return

    setLoading(true)
    setCheckError('')
    resolvedRef.current = false

    supabase.auth.getSession().then(({ data }) => {
      window.setTimeout(async () => {
        activeRef.current = true
        if (!data.session) {
          setSession(null)
          setIsAdmin(false)
          resolvedRef.current = true
          setLoading(false)
          return
        }

        setSession(data.session)
        try {
          const admin = await withTimeout(checkIsAdmin(), ADMIN_CHECK_MS)
          setIsAdmin(admin)
          setCheckError('')
        } catch (error) {
          console.error(error)
          setIsAdmin(false)
          setCheckError(error?.message || 'تعذر التحقق من صلاحيات الأدمن.')
        } finally {
          resolvedRef.current = true
          setLoading(false)
        }
      }, 0)
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" dir="rtl">
        <p className="text-slate-500 font-bold">جاري التحقق من الجلسة...</p>
      </div>
    )
  }

  if (checkError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4" dir="rtl">
        <div className="w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-sm p-8 text-center">
          <h1 className="text-2xl font-black text-slate-950 mb-3">تعذر فتح لوحة التحكم</h1>
          <p className="text-slate-500 font-bold leading-8 mb-6">{checkError}</p>
          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={retryCheck}
              className="w-full bg-teal-700 text-white py-3 rounded-2xl font-black hover:bg-teal-800 transition"
            >
              إعادة المحاولة
            </button>
            <button
              type="button"
              onClick={async () => {
                await supabase.auth.signOut()
                window.location.href = '/admin/login'
              }}
              className="w-full bg-slate-100 text-slate-800 py-3 rounded-2xl font-black hover:bg-slate-200 transition"
            >
              العودة لتسجيل الدخول
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/admin/login" replace />
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4" dir="rtl">
        <div className="w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-sm p-8 text-center">
          <h1 className="text-2xl font-black text-slate-950 mb-3">غير مصرح بالدخول</h1>
          <p className="text-slate-500 font-bold leading-8 mb-6">
            هذا الحساب ليس ضمن قائمة مديري لوحة التحكم. شغّل{' '}
            <code dir="ltr" className="text-sm bg-slate-100 px-1 rounded">
              fix-everything.sql
            </code>{' '}
            في Supabase ثم سجّل الدخول مرة أخرى.
          </p>
          <button
            type="button"
            onClick={async () => {
              await supabase.auth.signOut()
              window.location.href = '/admin/login'
            }}
            className="w-full bg-teal-700 text-white py-3 rounded-2xl font-black hover:bg-teal-800 transition"
          >
            تسجيل الخروج
          </button>
        </div>
      </div>
    )
  }

  return children
}
