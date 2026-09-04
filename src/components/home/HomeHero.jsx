import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'

const HERO_IMAGE_URL = '/assets/h.jpg'

export default function HomeHero() {
  const { lang } = useLanguage()
  const isAr = lang === 'ar'
  const navigate = useNavigate()

  return (
    <section className="relative overflow-hidden" dir={isAr ? 'rtl' : 'ltr'}>
      <button
        type="button"
        onClick={() => navigate('/register')}
        aria-label={isAr ? 'الانتقال إلى خدماتنا' : 'Go to our services'}
        className="block w-full cursor-pointer border-0 bg-transparent p-0 text-left"
      >
        <div
          className="relative w-full bg-no-repeat min-h-[220px] sm:min-h-[340px] md:min-h-[480px] lg:min-h-[620px] xl:min-h-[700px]"
          style={{
            backgroundImage: `url('${HERO_IMAGE_URL}')`,
            backgroundSize: 'contain',
            backgroundPosition: 'center top',
            backgroundRepeat: 'no-repeat',
          }}
        >
          <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-3 py-4 sm:px-6 md:px-8 lg:px-10" />
        </div>
      </button>
    </section>
  )
}
