import PageHeroRed from '../components/site/PageHeroRed'
import StatsBar from '../components/site/StatsBar'
import SeoMeta from '../components/SeoMeta'
import { ABOUT, BRAND } from '../data/tamwilcomContent'
import { useLanguage } from '../context/LanguageContext'

export default function AboutPage() {
  const { lang } = useLanguage()
  const isAr = lang === 'ar'

  return (
    <>
      <SeoMeta
        title={ABOUT.pageTitle[isAr ? 'ar' : 'en']}
        description={ABOUT.headline[isAr ? 'ar' : 'en']}
        path="/about"
      />
      <PageHeroRed
        badge={BRAND.tagline[isAr ? 'ar' : 'en']}
        title={ABOUT.pageTitle[isAr ? 'ar' : 'en']}
      />
      <div className="relative z-10 -mt-8 mb-12">
        <StatsBar />
      </div>

      <section className="bg-[#faf7f4] py-14 md:py-20">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 md:grid-cols-2">
          <div className="relative">
            <div className="overflow-hidden rounded-[2rem_0.5rem_2rem_0.5rem] border-4 border-white shadow-[0_30px_60px_rgba(18,3,5,0.15)]">
              <img
                src={ABOUT.image}
                alt=""
                className="aspect-[4/5] w-full object-cover"
              />
            </div>
            <div className="absolute -bottom-4 -start-4 rounded-2xl border border-red-900/20 bg-[#120305] px-5 py-3 text-sm font-black text-red-100 shadow-xl">
              {BRAND.name[isAr ? 'ar' : 'en']}
            </div>
          </div>

          <div>
            <p className="mb-3 text-sm font-bold text-red-700">{BRAND.tagline[isAr ? 'ar' : 'en']}</p>
            <h2 className="text-2xl font-black leading-snug text-[#120305] md:text-3xl">
              {ABOUT.headline[isAr ? 'ar' : 'en']}
            </h2>
            <div className="mt-6 space-y-5">
              {ABOUT.paragraphs.map((p) => (
                <p key={p.ar} className="text-base leading-8 text-slate-600">
                  {p[isAr ? 'ar' : 'en']}
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
