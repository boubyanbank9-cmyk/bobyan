import { Link, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useLanguage } from '../context/LanguageContext'
import { NAV_ITEMS, SITE_CONTACT } from '../data/tamwilcomContent'

function IconMenu() {
  return (
    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
    </svg>
  )
}

function IconClose() {
  return (
    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
    </svg>
  )
}

function SocialIcon({ type }) {
  const common = 'w-4 h-4 fill-current'
  if (type === 'facebook') {
    return (
      <svg viewBox="0 0 24 24" className={common}>
        <path d="M14 9h3V6h-3c-2.2 0-4 1.8-4 4v2H7v3h3v7h3v-7h3l1-3h-4V10c0-.6.4-1 1-1z" />
      </svg>
    )
  }
  if (type === 'x') {
    return (
      <svg viewBox="0 0 24 24" className={common}>
        <path d="M4 4l6.5 8.2L4.3 20H7l4.5-5.5L15.8 20H20l-6.7-8.4L19.5 4H17l-4.1 5L9 4H4z" />
      </svg>
    )
  }
  if (type === 'instagram') {
    return (
      <svg viewBox="0 0 24 24" className={common}>
        <path d="M7 3h10a4 4 0 014 4v10a4 4 0 01-4 4H7a4 4 0 01-4-4V7a4 4 0 014-4zm5 5.2A3.8 3.8 0 1015.8 12 3.8 3.8 0 0012 8.2zm5.1-.9a.9.9 0 10.9.9.9.9 0 00-.9-.9z" />
      </svg>
    )
  }
  if (type === 'snapchat') {
    return (
      <svg viewBox="0 0 24 24" className={common}>
        <path d="M12 2c2.8 0 5 2.2 5 5v1.2c0 .6.2 1.2.6 1.6l1 .9c.5.5.7 1.2.4 1.9-.3.6-.9 1-1.6 1-.8 0-1.5.4-2 .9-.3.3-.7.5-1.1.5h-4.6c-.4 0-.8-.2-1.1-.5-.5-.5-1.2-.9-2-.9-.7 0-1.3-.4-1.6-1-.3-.7-.1-1.4.4-1.9l1-.9c.4-.4.6-1 .6-1.6V7c0-2.8 2.2-5 5-5z" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 24 24" className={common}>
      <path d="M23 12.2s0-3.2-.4-4.7a2.9 2.9 0 00-2-2C18.8 5 12 5 12 5s-6.8 0-8.6.5a2.9 2.9 0 00-2 2C1 9 1 12.2 1 12.2s0 3.2.4 4.7a2.9 2.9 0 002 2c1.8.5 8.6.5 8.6.5s6.8 0 8.6-.5a2.9 2.9 0 002-2c.4-1.5.4-4.7.4-4.7zM9.8 15.5v-6.6l5.7 3.3-5.7 3.3z" />
    </svg>
  )
}

export default function Navbar() {
  const { lang, setLang } = useLanguage()
  const isAr = lang === 'ar'
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!mobileOpen) return undefined
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.documentElement.classList.add('mobile-menu-open')
    return () => {
      document.body.style.overflow = prev
      document.documentElement.classList.remove('mobile-menu-open')
    }
  }, [mobileOpen])

  const toggleLang = () => setLang(isAr ? 'en' : 'ar')
  const closeMobile = () => setMobileOpen(false)

  const socials = [
    { type: 'instagram', href: SITE_CONTACT.social.instagram },
  ]

  const isActive = (href) =>
    href === '/' ? location.pathname === '/' : location.pathname.startsWith(href)

  return (
    <>
      <header className="sticky top-0 z-50 bg-white shadow-[0_4px_25px_rgba(168,25,36,0.18)]">
        <div className="px-4 py-2 sm:px-8">
          <div className="mx-auto flex max-w-[1400px] items-center justify-between">
            <div className="flex items-center gap-3">
              {socials.map((s) => (
                <a
                  key={s.type}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-[#a81924] bg-white text-[#a81924] shadow-sm transition hover:bg-[#a81924] hover:text-white"
                  aria-label={s.type}
                >
                  <SocialIcon type={s.type} />
                </a>
              ))}
            </div>
            <button
              type="button"
              onClick={toggleLang}
              className="rounded-full border border-[#a81924] bg-white px-3 py-1 text-xs font-bold text-[#a81924] shadow-sm transition hover:bg-[#a81924] hover:text-white"
            >
              {isAr ? 'English (EN)' : 'العربية (AR)'}
            </button>
          </div>
        </div>

        <div className="mx-auto hidden max-w-[1400px] px-4 py-3 sm:px-8 md:block">
          <div className="flex items-center justify-between gap-4">
            <nav className="hidden flex-1 items-center justify-center gap-3 md:flex">
              {NAV_ITEMS.map((item) => {
                const active = isActive(item.href)
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={`relative inline-flex items-center justify-center rounded-full px-6 py-2.5 text-center text-[14px] font-bold shadow-md transition-all duration-300 ${
                      active
                        ? 'border border-[#a81924] bg-[#a81924] text-white shadow-[0_0_20px_rgba(168,25,36,0.3)]'
                        : 'border border-[#a81924] bg-white text-[#a81924] hover:bg-[#a81924] hover:text-white'
                    }`}
                  >
                    {item.label[isAr ? 'ar' : 'en']}
                    {active && (
                      <span className="absolute -bottom-1 h-1.5 w-1.5 rounded-full bg-amber-400" />
                    )}
                  </Link>
                )
              })}
            </nav>

          </div>
        </div>

        <div className="border-t border-[#a81924]/20 bg-white px-4 py-3 shadow-inner md:hidden">
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#a81924] bg-white text-[#a81924] transition hover:bg-[#a81924] hover:text-white"
              aria-label="Open menu"
              onClick={() => setMobileOpen(true)}
            >
              <IconMenu />
            </button>
            <div className="w-9" />
            <a
              href={`https://wa.me/${SITE_CONTACT.whatsapp}`}
              target="_blank"
              rel="noreferrer"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[#a81924] bg-white text-lg text-[#a81924]"
              aria-label="WhatsApp"
            >
              💬
            </a>
          </div>
        </div>
      </header>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-[60] flex flex-col bg-white text-[#a81924] md:hidden"
          dir={isAr ? 'rtl' : 'ltr'}
        >
          <div className="relative flex h-[65px] shrink-0 items-center justify-between border-b border-[#a81924]/20 px-4">
            <button type="button" className="p-2 text-[#a81924] hover:text-[#7f121b]" aria-label="Close" onClick={closeMobile}>
              <IconClose />
            </button>
            <div className="w-10" />
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-4">
            <nav className="space-y-2">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={closeMobile}
                  className="block rounded-xl border border-[#a81924] bg-white px-4 py-3 text-[16px] font-bold text-[#a81924] shadow-sm transition hover:bg-[#a81924] hover:text-white"
                >
                  {item.label[isAr ? 'ar' : 'en']}
                </Link>
              ))}
            </nav>
          </div>

          <div className="shrink-0 border-t border-[#a81924]/20 bg-white px-6 py-5">
            <button
              type="button"
              onClick={toggleLang}
              className="w-full rounded-full border border-[#a81924] bg-white py-2.5 text-sm font-bold text-[#a81924]"
            >
              {isAr ? 'English' : 'العربية'}
            </button>
          </div>
        </div>
      )}
    </>
  )
}
