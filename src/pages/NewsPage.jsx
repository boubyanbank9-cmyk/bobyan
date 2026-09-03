import { Link } from 'react-router-dom'
import PageHeroRed from '../components/site/PageHeroRed'
import SeoMeta from '../components/SeoMeta'
import { useLanguage } from '../context/LanguageContext'

const POSTS = [
  {
    id: 1,
    date: { ar: 'مارس 2026', en: 'March 2026' },
    title: {
      ar: 'إطلاق بوابة التمويل الإلكتروني الجديدة',
      en: 'Launch of the new electronic financing portal',
    },
    excerpt: {
      ar: 'أطلقت تمويلكم منصة محدّثة لتقديم طلبات التمويل بشكل أسرع وأكثر أماناً.',
      en: 'Tamwilcom launched an updated platform for faster, more secure financing applications.',
    },
  },
  {
    id: 2,
    date: { ar: 'فبراير 2026', en: 'February 2026' },
    title: {
      ar: 'برامج تمويل جديدة للمشاريع الصغيرة',
      en: 'New financing programs for small projects',
    },
    excerpt: {
      ar: 'برامج مرنة تدعم رواد الأعمال في الكويت بإجراءات مبسّطة.',
      en: 'Flexible programs supporting entrepreneurs in Kuwait with simplified procedures.',
    },
  },
  {
    id: 3,
    date: { ar: 'يناير 2026', en: 'January 2026' },
    title: {
      ar: 'توسيع ساعات الدعم والاستشارات',
      en: 'Extended support and consultation hours',
    },
    excerpt: {
      ar: 'فريقنا متاح يومياً من 8 صباحاً حتى 6 مساءً لخدمتكم عبر جميع القنوات.',
      en: 'Our team is available daily from 8 AM to 6 PM across all channels.',
    },
  },
]

export default function NewsPage() {
  const { lang } = useLanguage()
  const isAr = lang === 'ar'

  return (
    <>
      <SeoMeta
        title={isAr ? 'آخر الأخبار — تمويلكم' : 'Latest News — Tamwilcom'}
        path="/news"
      />
      <PageHeroRed title={isAr ? 'آخر الأخبار والمقالات' : 'News & Articles'} />
      <section className="py-14 md:py-20">
        <div className="mx-auto max-w-6xl px-4">
          <nav className="mb-8 text-sm text-slate-500">
            <Link to="/" className="font-bold text-red-700 hover:underline">
              {isAr ? 'الرئيسية' : 'Home'}
            </Link>
            <span className="mx-2">/</span>
            <span>{isAr ? 'الأخبار' : 'News'}</span>
          </nav>
          <div className="grid gap-6 md:grid-cols-3">
            {POSTS.map((post) => (
              <article
                key={post.id}
                className="rounded-3xl border border-red-900/10 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <p className="text-xs font-bold text-red-600">{post.date[isAr ? 'ar' : 'en']}</p>
                <h2 className="mt-3 text-lg font-black leading-snug text-[#120305]">
                  {post.title[isAr ? 'ar' : 'en']}
                </h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  {post.excerpt[isAr ? 'ar' : 'en']}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
