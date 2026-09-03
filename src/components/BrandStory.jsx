import { BRAND_STORY } from '../data/alainContent'
import { useLanguage } from '../context/LanguageContext'

export default function BrandStory() {
  const { lang } = useLanguage()
  const body = BRAND_STORY.body[lang] || BRAND_STORY.body.en

  return (
    <section className="bg-[#f8fbfe] py-12 md:py-20">
      <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
        {lang === 'ar' ? (
          <h3 className="relative inline-block text-3xl font-black leading-tight text-slate-900 md:text-5xl">
            {BRAND_STORY.title.ar}
            <span
              className="pointer-events-none absolute -bottom-1 left-[10%] right-[10%] h-2 rounded-full bg-[#4da3e0]/35"
              aria-hidden
            />
          </h3>
        ) : (
          <h3 className="text-3xl font-black uppercase leading-tight tracking-tight text-slate-900 md:text-5xl">
            UAE&apos;S FAVORITE{' '}
            <span className="relative inline-block">
              WATER BRAND.
              <span
                className="pointer-events-none absolute -bottom-1 left-0 right-0 h-2 rounded-full bg-[#4da3e0]/35 md:h-2.5"
                aria-hidden
              />
            </span>
          </h3>
        )}
        <p className="mx-auto mt-6 max-w-3xl text-base leading-8 text-slate-600 md:text-lg">{body}</p>
      </div>

      <div className="mx-auto mt-10 max-w-5xl overflow-hidden px-4 sm:px-6">
        <img
          src={BRAND_STORY.videoThumb}
          alt={BRAND_STORY.title.en}
          className="h-56 w-full rounded-[24px] object-cover shadow-sm sm:h-72 md:h-96"
          loading="lazy"
        />
      </div>
    </section>
  )
}
