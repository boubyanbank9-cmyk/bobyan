import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FOOTER, SITE_CONTACT, SUBSCRIBE } from '../data/tamwilcomContent'
import { useLanguage } from '../context/LanguageContext'

export default function Footer() {
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
    <footer className="mt-auto bg-gradient-to-b from-[#120305] to-[#0a0203] text-white">
      <div className="mx-auto max-w-6xl px-4 py-12 md:py-14">
        <div className="grid items-start gap-10 md:grid-cols-2 md:gap-16">
          <form onSubmit={handleSubmit}>
            <h2 className="mb-5 text-xl font-bold text-white md:text-2xl">
              {SUBSCRIBE.title[isAr ? 'ar' : 'en']}
            </h2>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={SUBSCRIBE.placeholder[isAr ? 'ar' : 'en']}
              className="mb-4 w-full rounded-lg border-0 bg-white px-5 py-3.5 text-[#120305] outline-none focus:ring-2 focus:ring-red-600"
            />
            <label className="mb-5 flex cursor-pointer items-start gap-3 text-sm leading-7 text-red-100/80">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-1 h-4 w-4 shrink-0 accent-red-600"
              />
              <span>
                {SUBSCRIBE.consent[isAr ? 'ar' : 'en']}{' '}
                <Link to="/privacy-policy" className="text-red-300 underline hover:text-white">
                  {SUBSCRIBE.consentLink[isAr ? 'ar' : 'en']}
                </Link>
                .
              </span>
            </label>
            <button
              type="submit"
              className="w-full rounded-lg bg-gradient-to-r from-red-700 to-red-600 py-3.5 text-base font-bold text-white shadow-[0_8px_24px_rgba(220,38,38,0.3)] transition hover:from-red-600 hover:to-red-500"
            >
              {done ? (isAr ? 'تم الاشتراك ✓' : 'Subscribed ✓') : SUBSCRIBE.button[isAr ? 'ar' : 'en']}
            </button>
          </form>

          <div className="space-y-8">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 text-lg text-red-200" aria-hidden>
                🕐
              </span>
              <div>
                <p className="font-bold text-white">{SUBSCRIBE.hoursLine1[isAr ? 'ar' : 'en']}</p>
                <p className="mt-1 text-sm text-red-100/70">{SUBSCRIBE.hoursLine2[isAr ? 'ar' : 'en']}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="mt-0.5 text-lg text-red-200" aria-hidden>
                💬
              </span>
              <div>
                <a
                  href={`https://wa.me/${SITE_CONTACT.whatsapp}`}
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold text-white transition hover:text-red-200"
                >
                  {SITE_CONTACT.phoneDisplay.replace(/\s/g, '')}
                </a>
                <p className="mt-1 text-sm text-red-100/70">
                  {SUBSCRIBE.consultLabel[isAr ? 'ar' : 'en']}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-red-900/30 pt-10 text-center">
          <h3 className="mb-5 text-lg font-bold text-white">{FOOTER.pagesTitle[isAr ? 'ar' : 'en']}</h3>
          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
            {FOOTER.pages.map((link) => (
              <Link
                key={link.href + link.label.ar}
                to={link.href}
                className="text-sm text-red-100/80 transition hover:text-white"
              >
                {link.label[isAr ? 'ar' : 'en']}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-8 flex flex-col gap-4 border-t border-red-900/20 pt-6 text-sm text-red-100/60 md:flex-row md:items-center md:justify-between">
          <p>{FOOTER.copyright[isAr ? 'ar' : 'en']}</p>
          <p className="text-red-100/70">
            {isAr ? (
              <>
                نحن موثوقون من طرف وزارة التجارة | نحن موثوقون من منصة{' '}
                <span className="font-bold text-amber-400">معروف</span>
              </>
            ) : (
              <>
                Trusted by the Ministry of Commerce | Verified on{' '}
                <span className="font-bold text-amber-400">Maroof</span> platform
              </>
            )}
          </p>
        </div>
      </div>
    </footer>
  )
}
