import { useState } from 'react'
import { Link } from 'react-router-dom'
import PageHeroRed from '../components/site/PageHeroRed'
import StatsBar from '../components/site/StatsBar'
import SeoMeta from '../components/SeoMeta'
import { FAQ_ITEMS, FAQ_SIDEBAR } from '../data/tamwilcomContent'
import { useLanguage } from '../context/LanguageContext'

export default function FAQPage() {
  const { lang } = useLanguage()
  const isAr = lang === 'ar'
  const [openIndex, setOpenIndex] = useState(0)

  return (
    <>
      <SeoMeta
        title={isAr ? 'أسئلة وأجوبة — تمويلكم' : 'FAQ — Tamwilcom'}
        description={isAr ? 'إجابات على أكثر الأسئلة شيوعاً حول التمويل.' : 'Answers to common financing questions.'}
        path="/faq"
      />
      <PageHeroRed title={isAr ? 'أسئلة وأجوبة' : 'Questions & Answers'} />
      <div className="relative z-10 -mt-8 mb-12">
        <StatsBar />
      </div>

      <section className="bg-[#faf7f4] py-14 md:py-20">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 lg:grid-cols-[1fr_340px]">
          <div className="space-y-3">
            {FAQ_ITEMS.map((item, index) => {
              const isOpen = openIndex === index
              return (
                <div
                  key={item.q.ar}
                  className="overflow-hidden rounded-2xl border border-red-900/10 bg-white shadow-sm"
                >
                  <button
                    type="button"
                    onClick={() => setOpenIndex(isOpen ? -1 : index)}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-start font-bold text-[#120305] transition hover:bg-red-50/50"
                  >
                    <span>{item.q[isAr ? 'ar' : 'en']}</span>
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-lg ${
                        isOpen
                          ? 'border-red-600 bg-red-600 text-white'
                          : 'border-red-200 bg-red-50 text-red-700'
                      }`}
                    >
                      {isOpen ? '−' : '+'}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="border-t border-red-50 px-5 pb-5 pt-3 text-sm leading-8 text-slate-600">
                      {item.a[isAr ? 'ar' : 'en']}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          <aside className="relative overflow-hidden rounded-3xl border border-red-900/10 shadow-lg lg:sticky lg:top-28 lg:self-start">
            <img
              src={FAQ_SIDEBAR.image}
              alt=""
              className="h-48 w-full object-cover md:h-56"
            />
            <div className="bg-white p-6">
              <h3 className="text-lg font-black text-[#120305]">
                {FAQ_SIDEBAR.title[isAr ? 'ar' : 'en']}
              </h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                {FAQ_SIDEBAR.desc[isAr ? 'ar' : 'en']}
              </p>
              <Link
                to="/contact"
                className="mt-5 flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-red-700 to-red-600 py-3.5 font-black text-white shadow-lg transition hover:from-red-600 hover:to-red-500"
              >
                {FAQ_SIDEBAR.button[isAr ? 'ar' : 'en']}
              </Link>
            </div>
          </aside>
        </div>
      </section>
    </>
  )
}
