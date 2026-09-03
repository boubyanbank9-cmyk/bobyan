import { Link } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import SeoMeta from '../components/SeoMeta'
import { PAGE_SEO } from '../data/seo'

export default function NotFoundPage() {
  const { t } = useLanguage()
  const seo = PAGE_SEO.notFound

  return (
    <>
      <SeoMeta title={seo.title} description={seo.description} path={seo.path} noindex={seo.noindex} />
      <section className="py-20 md:py-28 bg-[#f4f8fb] min-h-[60vh] flex items-center">
        <div className="max-w-lg mx-auto px-4 text-center">
          <p className="text-7xl font-black text-teal-700 mb-4">404</p>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 mb-3">الصفحة غير موجودة</h1>
          <p className="text-slate-500 font-bold leading-8 mb-8">
            عذراً، الصفحة التي تبحث عنها غير متوفرة أو تم نقلها.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/" className="btn-primary px-8 py-3 rounded-xl font-black">
              {t.nav.home}
            </Link>
            <Link to="/contact" className="px-8 py-3 rounded-xl font-black bg-white border border-slate-200 text-slate-800">
              {t.nav.contact}
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
