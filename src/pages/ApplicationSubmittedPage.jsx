import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'

export default function ApplicationSubmittedPage() {
  const { lang } = useLanguage()
  const isAr = lang === 'ar'
  const navigate = useNavigate()

  return (
    <section className="min-h-screen bg-[#111315] px-4 py-8 text-white" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-[640px] items-center justify-center">
        <div className="w-full rounded-[28px] border border-white/10 bg-[#1a1d20] px-6 py-8 text-center shadow-[0_18px_45px_rgba(0,0,0,0.35)] sm:px-10 sm:py-12">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#1dbf73]/15 text-4xl text-[#34d399]">
            ✓
          </div>

          <h1 className="text-2xl font-bold text-white sm:text-3xl">
            {isAr ? 'تم تقديم طلبك بنجاح' : 'Your request has been submitted successfully'}
          </h1>

          <p className="mx-auto mt-6 max-w-[540px] text-base leading-8 text-white/80 sm:text-lg">
            {isAr
              ? 'سيتم الآن فحص ومراجعة جميع المعلومات المقدمة، وبناءً على نتيجة المراجعة سيتم قبول الطلب أو رفضه خلال مدة أقصاها نصف ساعة.'
              : 'All submitted information will now be reviewed. Based on the review result, the request will be accepted or rejected within a maximum of 30 minutes.'}
          </p>

          <button
            type="button"
            onClick={() => navigate('/')}
            className="mt-8 rounded-full bg-[#d92a2a] px-7 py-3 text-base font-bold text-white shadow-lg transition hover:brightness-105"
          >
            {isAr ? 'العودة للرئيسية' : 'Back to home'}
          </button>
        </div>
      </div>
    </section>
  )
}
