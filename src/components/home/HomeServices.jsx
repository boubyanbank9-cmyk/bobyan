import { Link } from 'react-router-dom'
import { ELECTRONIC_SERVICES, HOME } from '../../data/tamwilcomContent'
import { useLanguage } from '../../context/LanguageContext'

export default function HomeServices() {
  const { lang } = useLanguage()
  const isAr = lang === 'ar'

  return (
    <section className="bg-[#faf7f4] py-14 md:py-20">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-10 flex items-end justify-between gap-4">
          <h2 className="text-2xl font-black text-[#120305] md:text-4xl">
            {HOME.servicesTitle[isAr ? 'ar' : 'en']}
          </h2>
          <Link
            to="/register"
            className="hidden rounded-full border border-red-900/30 bg-white px-5 py-2 text-sm font-bold text-red-800 transition hover:bg-red-50 md:inline-flex"
          >
            {isAr ? 'عرض الكل' : 'View all'}
          </Link>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {ELECTRONIC_SERVICES.map((service) => (
            <Link
              key={service.id}
              to="/register"
              className="group rounded-3xl border border-red-900/10 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-red-700/30 hover:shadow-[0_20px_40px_rgba(220,38,38,0.12)]"
            >
              <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#120305] to-[#3a0a10] text-2xl shadow-lg">
                {service.icon}
              </span>
              <h3 className="mb-2 text-lg font-black text-[#120305]">
                {service.title[isAr ? 'ar' : 'en']}
              </h3>
              <p className="text-sm leading-7 text-slate-600">
                {service.desc[isAr ? 'ar' : 'en']}
              </p>
              <span className="mt-4 inline-block text-sm font-bold text-red-700 opacity-0 transition group-hover:opacity-100">
                {isAr ? 'اعرف المزيد ←' : 'Learn more →'}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
