import PageHeroRed from '../components/site/PageHeroRed'
import StatsBar from '../components/site/StatsBar'
import LoanSelectionPanel from '../components/site/LoanSelectionPanel'
import SeoMeta from '../components/SeoMeta'
import { BRAND, HOME } from '../data/tamwilcomContent'
import { useLanguage } from '../context/LanguageContext'

export default function ServicesPage() {
  const { lang } = useLanguage()
  const isAr = lang === 'ar'

  return (
    <>
      <SeoMeta
        title={isAr ? 'خدماتنا — تمويلكم' : 'Our Services — Tamwilcom'}
        description={isAr ? 'اختر برنامج التمويل المناسب لك.' : 'Choose the financing program that fits your needs.'}
        path="/services"
      />
      <PageHeroRed
        badge={BRAND.tagline[isAr ? 'ar' : 'en']}
        title={isAr ? 'خدماتنا' : 'Our Services'}
        subtitle={HOME.loansSubtitle[isAr ? 'ar' : 'en']}
      />
      <div className="relative z-10 -mt-8 mb-12">
        <StatsBar />
      </div>

      <section className="bg-[#faf7f4] pb-20 pt-4">
        <div className="mx-auto max-w-6xl px-4">
          <LoanSelectionPanel />
        </div>
      </section>
    </>
  )
}
