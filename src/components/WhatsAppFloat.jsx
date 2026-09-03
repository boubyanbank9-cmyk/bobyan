import { SITE_CONTACT } from '../data/tamwilcomContent'
import { useLanguage } from '../context/LanguageContext'

export default function WhatsAppFloat() {
  const { lang } = useLanguage()
  const isAr = lang === 'ar'
  const href = `https://wa.me/${SITE_CONTACT.whatsapp}`

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="wa-page-float group fixed bottom-5 start-5 z-40 flex flex-col items-center gap-1"
      aria-label="WhatsApp"
    >
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] shadow-lg transition group-hover:scale-105">
        <svg viewBox="0 0 32 32" className="h-8 w-8 fill-white" aria-hidden>
          <path d="M16.1 4C9.6 4 4.3 9.3 4.3 15.8c0 2.1.6 4.1 1.6 5.9L4 28l6.5-1.7c1.7.9 3.6 1.4 5.6 1.4 6.5 0 11.8-5.3 11.8-11.8S22.6 4 16.1 4zm0 21.5c-1.8 0-3.5-.5-5-1.3l-.4-.2-3.8 1 1-3.7-.2-.4c-1-1.6-1.5-3.4-1.5-5.2 0-5.4 4.4-9.8 9.8-9.8s9.8 4.4 9.8 9.8-4.3 9.8-9.7 9.8zm5.4-7.3c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.2-.7.2-.2.3-.8.9-.9 1.1-.2.2-.3.2-.6.1-1.7-.8-2.8-1.5-3.9-3.4-.3-.5.3-.5.8-1.6.1-.2 0-.3 0-.5l-1-2.3c-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.4s1 2.8 1.2 3c.1.2 2 3.1 4.9 4.3 1.8.8 2.5.8 3.4.7.5-.1 1.7-.7 1.9-1.4.2-.7.2-1.3.2-1.4 0-.1-.2-.2-.5-.3z" />
        </svg>
      </span>
      <span className="text-[11px] font-bold text-[#120305]">{isAr ? 'تواصل معنا' : 'Chat with us'}</span>
    </a>
  )
}
