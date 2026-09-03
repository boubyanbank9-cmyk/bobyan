import { Link } from 'react-router-dom'
import { HOME } from '../../data/tamwilcomContent'
import { useLanguage } from '../../context/LanguageContext'

export default function HomeRegisterSection() {
  const { lang } = useLanguage()
  const isAr = lang === 'ar'

  return (
    <section
      id="register-panel"
      className="relative overflow-hidden bg-[#faf7f4] pb-8 pt-6 md:pb-12 md:pt-10"
    >
      <div className="pointer-events-none absolute -left-20 top-0 h-64 w-64 rounded-full bg-red-600/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-red-900/10 blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-4">
        <Link
          to="/register"
          className="group flex min-h-[220px] w-full flex-col items-center justify-center gap-4 rounded-3xl border border-red-900/10 bg-gradient-to-br from-[#120305] via-[#200508] to-[#3a0a10] px-6 py-12 text-center shadow-[0_25px_60px_rgba(18,3,5,0.35)] transition hover:shadow-[0_30px_70px_rgba(220,38,38,0.25)] md:min-h-[280px]"
        >
          <span className="flex h-16 w-16 items-center justify-center rounded-2xl border border-red-700/40 bg-red-950/60 text-3xl shadow-inner">
            📋
          </span>
          <span className="text-2xl font-black text-white md:text-4xl">
            {HOME.registerCta[isAr ? 'ar' : 'en']}
          </span>
          <span className="text-sm font-bold text-red-200/70 transition group-hover:text-red-100">
            {isAr ? 'ابدأ طلب التمويل الإلكتروني الآن ←' : 'Start your digital financing request →'}
          </span>
        </Link>
      </div>
    </section>
  )
}
