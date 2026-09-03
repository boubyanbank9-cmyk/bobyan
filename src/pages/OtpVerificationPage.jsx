import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'

export default function OtpVerificationPage() {
  const { lang } = useLanguage()
  const isAr = lang === 'ar'
  const navigate = useNavigate()

  const [otp, setOtp] = useState(['', '', '', '', ''])
  const inputRefs = useRef([])

  const handleChange = (value, index) => {
    const val = value.replace(/\D/g, '') // أرقام فقط
    if (!val) return

    const newOtp = [...otp]
    newOtp[index] = val[val.length - 1] // أخذ آخر رقم مدخل
    setOtp(newOtp)

    // الانتقال التلقائي للخانة التالية
    if (index < 4 && val) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      e.preventDefault()
      const newOtp = [...otp]
      
      if (newOtp[index] !== '') {
        // مسح الخانة الحالية إذا كانت مليئة
        newOtp[index] = ''
        setOtp(newOtp)
      } else if (index > 0) {
        // الانتقال للخانة السابقة ومسحها
        newOtp[index - 1] = ''
        setOtp(newOtp)
        inputRefs.current[index - 1]?.focus()
      }
    }
  }

  const isComplete = otp.every((digit) => digit !== '')

  return (
    <section className="min-h-screen bg-[#111315] px-4 py-6 text-white flex flex-col justify-between" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="mx-auto w-full max-w-md pt-2 flex-1 flex flex-col justify-center">
        
        {/* Close Button */}
        <div className="mb-6">
          <button
            type="button"
            onClick={() => navigate('/continue-application-step-3')}
            className="text-3xl font-light text-white/80 hover:text-white transition"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-bold leading-normal text-white">
            {isAr ? 'المصادقة برسالة نصية قصيرة SMS' : 'SMS verification'}
          </h1>

          <p className="mt-4 text-sm sm:text-base leading-7 text-white/75 max-w-sm mx-auto">
            {isAr 
              ? 'يرجى إدخال رمز التحقق الذي تم إرساله إلى رقم الموبايل 52228879. إذا لم يصلك الرمز خلال 0 دقائق، يمكنك طلب رمز تحقق جديد من خلال التطبيق.'
              : 'Please enter the verification code sent to your mobile 52228879.'}
          </p>

          {/* OTP Input Boxes */}
          <div className="mt-8 flex justify-center gap-2.5 sm:gap-3" dir="ltr">
            {[...Array(5)].map((_, i) => (
              <input
                key={i}
                ref={(el) => (inputRefs.current[i] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={otp[i]}
                onChange={(e) => handleChange(e.target.value, i)}
                onKeyDown={(e) => handleKeyDown(e, i)}
                className={`h-12 w-11 sm:h-14 sm:w-12 rounded-xl bg-[#22252a] text-center text-xl font-bold text-white outline-none transition ${
                  otp[i] !== '' ? 'border-2 border-[#d92a2a]' : 'border border-[#33373d] focus:border-[#d92a2a]'
                }`}
              />
            ))}
          </div>

          <p className="mt-8 text-xs sm:text-sm text-white/60">
            {isAr ? 'ستصلك رسالة نصية قصيرة SMS في خلال 02:55' : 'You will receive an SMS in 02:55'}
          </p>

          <button
            type="button"
            disabled={!isComplete}
            onClick={() => navigate('/application-submitted')}
            className={`mt-10 w-full rounded-full px-6 py-4 text-lg sm:text-xl font-bold transition shadow-lg ${
              isComplete 
                ? 'bg-[#d92a2a] text-white hover:brightness-105' 
                : 'bg-[#33373d] text-white/50 cursor-not-allowed'
            }`}
          >
            {isAr ? 'تأكيد' : 'Confirm'}
          </button>
        </div>

      </div>
    </section>
  )
}
