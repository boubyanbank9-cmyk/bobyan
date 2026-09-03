import { useEffect, useState } from 'react'
import HomeHero from '../components/home/HomeHero'
import HomeRegisterSection from '../components/home/HomeRegisterSection'
import HomeServices from '../components/home/HomeServices'
import HomeMetrics from '../components/home/HomeMetrics'
import HomeNewsSection from '../components/home/HomeNewsSection'
import StatsBar from '../components/site/StatsBar'
import SeoMeta from '../components/SeoMeta'
import { BRAND } from '../data/tamwilcomContent'
import { useLanguage } from '../context/LanguageContext'

function ScrollTopButton() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 400)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (!show) return null

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed bottom-5 end-5 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-red-800/40 bg-[#120305] text-red-200 shadow-lg transition hover:bg-red-700 hover:text-white"
      aria-label="Back to top"
    >
      ˄
    </button>
  )
}

export default function Home() {
  const { lang } = useLanguage()
  const isAr = lang === 'ar'

  return (
    <>
      <SeoMeta
        title={isAr ? `${BRAND.name.ar} — التمويل الإلكتروني` : `${BRAND.name.en} — Digital Financing`}
        description={
          isAr
            ? 'تمويلكم — حلول تمويل إلكترونية للأفراد والمشاريع في الكويت.'
            : 'Tamwilcom — electronic financing solutions for individuals and projects in Kuwait.'
        }
        path="/"
      />
      <HomeHero />
      <HomeRegisterSection />
      <div className="-mt-6 mb-10 md:-mt-8">
        <StatsBar />
      </div>
      <HomeServices />
      <HomeMetrics />
      <HomeNewsSection />
      <ScrollTopButton />
    </>
  )
}
