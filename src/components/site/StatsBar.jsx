import { STATS } from '../../data/tamwilcomContent'
import { useLanguage } from '../../context/LanguageContext'

export default function StatsBar({ className = '' }) {
  const { lang } = useLanguage()
  const isAr = lang === 'ar'

  return (
    <div className={`relative z-10 mx-auto max-w-5xl px-4 ${className}`}>
      <div className="grid grid-cols-2 gap-3 rounded-2xl border border-red-900/20 bg-white/95 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.15)] backdrop-blur md:grid-cols-4 md:gap-0 md:divide-x md:divide-red-100 rtl:md:divide-x-reverse">
        {STATS.map((item) => (
          <div key={item.label.ar} className="px-2 py-2 text-center md:px-4">
            <p className="text-xl font-black text-[#120305] md:text-2xl">{item.value}</p>
            <p className="mt-1 text-xs font-bold text-red-900/70 md:text-sm">
              {item.label[isAr ? 'ar' : 'en']}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
