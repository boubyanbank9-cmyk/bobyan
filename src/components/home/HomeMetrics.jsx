import { METRICS } from '../../data/tamwilcomContent'
import { useLanguage } from '../../context/LanguageContext'

// أيقونة العملات الاسطوانية المطابقة تماماً للشكل المطلوب
function CoinsIcon() {
  return (
    <div className="relative w-16 h-12 flex items-center justify-center">
      {/* العملة اليسرى (القصيرة) */}
      <div className="absolute left-0 bottom-0 w-7 h-8 rounded-[50%] border-2 border-red-400/80 bg-[#1e0508] shadow-sm flex flex-col justify-around py-1 overflow-hidden">
        <div className="w-full h-[1px] bg-red-400/50"></div>
        <div className="w-full h-[1px] bg-red-400/50"></div>
      </div>
      
      {/* العملة اليمنى (الطويلة المرتفعة) */}
      <div className="absolute right-0 top-0 w-7 h-11 rounded-[50%] border-2 border-red-400/80 bg-[#1e0508] shadow-sm flex flex-col justify-around py-1 overflow-hidden">
        <div className="w-full h-[1px] bg-red-400/50"></div>
        <div className="w-full h-[1px] bg-red-400/50"></div>
        <div className="w-full h-[1px] bg-red-400/50"></div>
      </div>
    </div>
  )
}

export default function HomeMetrics() {
  const { lang } = useLanguage()
  const isAr = lang === 'ar'

  const firstGroup = METRICS.revenueCards.slice(0, 3)
  const secondGroup = METRICS.revenueCards.length > 3 ? METRICS.revenueCards.slice(3, 6) : METRICS.revenueCards

  const renderCardContent = (cardsToRender) => (
    <div className="relative overflow-hidden rounded-[16px] border border-red-500/30 bg-gradient-to-b from-[#1c0408]/95 to-[#0d0204]/98 p-6 shadow-[0_8px_30px_rgba(0,0,0,0.6),0_0_20px_rgba(255,59,48,0.1)] backdrop-blur-md">
      {/* Top Header inside the big box */}
      <div className="mb-6 flex items-center justify-between text-[14px] sm:text-[15px] font-bold text-red-200/90 border-b border-red-900/40 pb-4">
        <span className="text-red-500 text-xs">◀</span>
        <span className="tracking-wide">{isAr ? 'الميزانية العامة للدولة للسنة المالية 2023' : 'State General Budget for FY 2023'}</span>
      </div>

      {/* 3 Columns of Revenues */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center mb-8">
        {cardsToRender.map((card, i) => (
          <div key={i} className="flex flex-col items-center">
            <div className="mb-3 flex justify-center">
              <CoinsIcon />
            </div>
            <p className="text-[20px] sm:text-[26px] font-black tracking-tight text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
              {card.value}
            </p>
            <p className="mt-1 text-xs sm:text-sm font-bold text-red-300/80">
              {card.label[isAr ? 'ar' : 'en']}
            </p>
          </div>
        ))}
      </div>

      {/* Bottom Section (Oil Price & Production) */}
      <div className="-mx-6 -mb-6 mt-6 border-t border-red-900/40 bg-[#120306]/90 p-4 sm:p-5 text-center">
        <div className="grid grid-cols-2 gap-4 divide-x divide-x-reverse divide-red-900/40">
          <div className="px-2">
            <p className="text-xs sm:text-sm font-semibold text-red-300/80">
              {METRICS.oilPrice.label[isAr ? 'ar' : 'en']}
            </p>
            <p className="mt-1 text-base sm:text-lg font-black text-white">
              {METRICS.oilPrice.value}
            </p>
          </div>
          <div className="px-2">
            <p className="text-xs sm:text-sm font-semibold text-red-300/80">
              {METRICS.production.label[isAr ? 'ar' : 'en']}
            </p>
            <p className="mt-1 text-base sm:text-lg font-black text-white">
              {METRICS.production.value}
            </p>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <section className="relative overflow-hidden bg-[#180205] py-16 text-white md:py-24" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="mx-auto max-w-[1280px] px-4 relative z-10">
        
        {/* Main Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-black text-[#ffcccc] tracking-wide drop-shadow-[0_0_15px_rgba(255,59,48,0.4)]">
            {isAr ? 'الميزانية العامة' : 'General Budget'}
          </h2>
          <div className="mx-auto mt-3 h-1 w-24 bg-gradient-to-r from-transparent via-red-500 to-transparent rounded-full shadow-[0_0_10px_rgba(255,59,48,0.8)]" />
        </div>

        {/* Two Big Container Cards Grid */}
        <div className="grid gap-8 lg:grid-cols-2">
          {renderCardContent(firstGroup.length > 0 ? firstGroup : METRICS.revenueCards)}
          {renderCardContent(secondGroup.length > 0 ? secondGroup : METRICS.revenueCards)}
        </div>

      </div>
    </section>
  )
}