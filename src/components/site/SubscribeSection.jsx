import { useState } from 'react'
import { Link } from 'react-router-dom'
import { SUBSCRIBE, SITE_CONTACT } from '../../data/tamwilcomContent'
import { useLanguage } from '../../context/LanguageContext'

export default function SubscribeSection() {
  const { lang } = useLanguage()
  const isAr = lang === 'ar'
  const [email, setEmail] = useState('')
  const [consent, setConsent] = useState(true)
  const [done, setDone] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!email.trim() || !consent) return
    setDone(true)
  }

  return (
    <section className="bg-gradient-to-br from-[#120305] via-[#1a0406] to-[#200508] py-16 text-white md:py-20">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 md:grid-cols-2">
        <div className="space-y-4">
          <p className="text-sm font-bold text-red-300">{SUBSCRIBE.consultLabel[isAr ? 'ar' : 'en']}</p>
          <p className="text-lg font-bold leading-8 text-red-50">
            {SUBSCRIBE.hours[isAr ? 'ar' : 'en']}
          </p>
          <a
            href={`https://wa.me/${SITE_CONTACT.whatsapp}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-red-800/50 bg-red-950/40 px-5 py-2.5 text-sm font-bold text-red-100 transition hover:bg-red-700"
          >
            <span aria-hidden>💬</span>
            {SITE_CONTACT.phoneDisplay}
          </a>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-red-900/40 bg-[#180406]/80 p-6 shadow-[0_0_40px_rgba(220,20,60,0.12)] backdrop-blur md:p-8"
        >
          <h2 className="mb-5 text-xl font-black text-white md:text-2xl">
            {SUBSCRIBE.title[isAr ? 'ar' : 'en']}
          </h2>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={SUBSCRIBE.placeholder[isAr ? 'ar' : 'en']}
            className="mb-4 w-full rounded-2xl border border-red-900/30 bg-white px-5 py-3.5 text-[#120305] outline-none focus:ring-2 focus:ring-red-600"
          />
          <label className="mb-5 flex cursor-pointer items-start gap-3 text-sm text-red-100/80">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-1 accent-red-600"
            />
            <span>
              {SUBSCRIBE.consent[isAr ? 'ar' : 'en']}{' '}
              <Link to="/privacy-policy" className="text-red-300 underline hover:text-white">
                {isAr ? 'اقرأ المزيد' : 'Read more'}
              </Link>
            </span>
          </label>
          <button
            type="submit"
            className="w-full rounded-2xl bg-gradient-to-r from-red-700 to-red-600 py-4 text-base font-black text-white shadow-[0_0_25px_rgba(220,38,38,0.4)] transition hover:from-red-600 hover:to-red-500"
          >
            {done ? (isAr ? 'تم الاشتراك ✓' : 'Subscribed ✓') : SUBSCRIBE.button[isAr ? 'ar' : 'en']}
          </button>
        </form>
      </div>
    </section>
  )
}
