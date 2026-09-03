import { useState } from 'react'
import PageHeroRed from '../components/site/PageHeroRed'
import StatsBar from '../components/site/StatsBar'
import SeoMeta from '../components/SeoMeta'
import { BRAND, CONTACT, SITE_CONTACT } from '../data/tamwilcomContent'
import { useLanguage } from '../context/LanguageContext'

export default function ContactPage() {
  const { lang } = useLanguage()
  const isAr = lang === 'ar'
  const [sent, setSent] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setSent(true)
    e.target.reset()
  }

  return (
    <>
      <SeoMeta
        title={isAr ? 'تواصل معنا — تمويلكم' : 'Contact Us — Tamwilcom'}
        description={CONTACT.subtitle[isAr ? 'ar' : 'en']}
        path="/contact"
      />
      <PageHeroRed
        title={BRAND.fullName[isAr ? 'ar' : 'en']}
        subtitle={CONTACT.title[isAr ? 'ar' : 'en']}
      />
      <div className="relative z-10 -mt-8 mb-12">
        <StatsBar />
      </div>

      <section className="bg-[#faf7f4] py-14 md:py-20">
        <div className="mx-auto max-w-5xl px-4">
          <p className="mb-10 text-center text-slate-600">{CONTACT.subtitle[isAr ? 'ar' : 'en']}</p>

          <div className="mb-10 rounded-3xl border border-red-900/10 bg-white p-6 text-center shadow-sm md:p-8">
            <p className="text-sm font-bold text-red-700">{CONTACT.channels[isAr ? 'ar' : 'en']}</p>
            <a
              href={`tel:${SITE_CONTACT.phone.replace(/\D/g, '')}`}
              className="mt-2 block text-2xl font-black text-[#120305] hover:text-red-700"
            >
              {SITE_CONTACT.phoneDisplay}
            </a>
            <a
              href={`https://wa.me/${SITE_CONTACT.whatsapp}`}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-red-700 hover:underline"
            >
              WhatsApp →
            </a>
          </div>

          <form
            onSubmit={handleSubmit}
            className="mx-auto max-w-2xl space-y-4 rounded-3xl border border-red-900/10 bg-white p-6 shadow-sm md:p-8"
          >
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                {isAr ? 'الاسم الكامل' : 'Full Name'}
              </label>
              <input
                name="name"
                required
                type="text"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3.5 outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                {isAr ? 'البريد الإلكتروني' : 'Email'}
              </label>
              <input
                name="email"
                required
                type="email"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3.5 outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                {isAr ? 'رسالتك' : 'Your Message'}
              </label>
              <textarea
                name="message"
                required
                rows={5}
                className="w-full resize-none rounded-2xl border border-slate-200 px-4 py-3.5 outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-2xl bg-gradient-to-r from-red-700 to-red-600 py-4 font-black text-white shadow-lg transition hover:from-red-600 hover:to-red-500"
            >
              {sent ? (isAr ? 'تم الإرسال ✓' : 'Sent ✓') : isAr ? 'إرسال' : 'Send'}
            </button>
          </form>
        </div>
      </section>
    </>
  )
}
