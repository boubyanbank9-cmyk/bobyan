import { useLanguage } from '../../context/LanguageContext'

export default function HomeNewsSection() {
  const { lang } = useLanguage()
  const isAr = lang === 'ar'

  const articles = [
    {
      id: 1,
      title: {
        ar: 'إطلاق حزم تمويلية جديدة لدعم المشاريع المتوسطة والصغيرة في الكويت',
        en: 'Launching new financing packages to support SMEs in Kuwait',
      },
      excerpt: {
        ar: 'أعلنت الجهات المالية عن تسهيلات ائتمانية جديدة تهدف إلى تحفيز قطاع ريادة الأعمال وتوسيع نطاق المشاريع الناشئة.',
        en: 'Financial authorities announced new credit facilities aimed at stimulating the entrepreneurship sector.',
      },
      date: isAr ? '١٥ أغسطس ٢٠٢٦' : 'August 15, 2026',
      category: {
        ar: 'تمويل المشاريع',
        en: 'Project Finance',
      },
      readTime: isAr ? '٤ دقائق قراءة' : '4 min read',
    },
    {
      id: 2,
      title: {
        ar: 'تأثير التحول الرقمي على قطاع التقنية المالية وحلول الدفع الإلكتروني',
        en: 'The impact of digital transformation on fintech and electronic payment solutions',
      },
      excerpt: {
        ar: 'كيف ساهمت منصات التمويل الإلكتروني في تسريع وتيرة المعاملات المالية وتوفير بيئة آمنة للمستثمرين.',
        en: 'How electronic financing platforms contributed to accelerating financial transactions and securing investments.',
      },
      date: isAr ? '١٠ أغسطس ٢٠٢٦' : 'August 10, 2026',
      category: {
        ar: 'التقنية المالية',
        en: 'Fintech',
      },
      readTime: isAr ? '٣ دقائق قراءة' : '3 min read',
    },
    {
      id: 3,
      title: {
        ar: 'دليل المستثمر المبتكر: كيف تختار برنامج التمويل المناسب لمشروعك؟',
        en: 'The Innovative Investor Guide: How to choose the right financing program for your project?',
      },
      excerpt: {
        ar: 'خطوات أساسية ومفاتيح نجاح تساعد رواد الأعمال على دراسة التدفقات النقدية واختيار الحل التمويلي الأمثل.',
        en: 'Essential steps and keys to success helping entrepreneurs analyze cash flows and choose optimal funding.',
      },
      date: isAr ? '٠٥ أغسطس ٢٠٢٦' : 'August 05, 2026',
      category: {
        ar: 'نصائح استثمارية',
        en: 'Investment Tips',
      },
      readTime: isAr ? '٥ دقائق قراءة' : '5 min read',
    },
  ]

  return (
    <section className="relative overflow-hidden bg-[#f4f1ee] py-16 text-[#120305] md:py-24" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="absolute left-1/2 top-1/2 h-[350px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-200/30 blur-[130px]" />

      <div className="relative z-10 mx-auto max-w-[1280px] px-4">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-black tracking-wide text-[#120305] md:text-4xl">
            {isAr ? 'آخر الأخبار والمقالات' : 'Latest News & Articles'}
          </h2>
          <p className="mt-2 text-sm text-[#3b1d1f] md:text-base">
            {isAr ? 'تابع أحدث المستجدات الاقتصادية وحلول التمويل الذكية' : 'Follow the latest economic updates and smart financing solutions'}
          </p>
          <div className="mx-auto mt-4 h-1 w-24 rounded-full bg-gradient-to-r from-transparent via-red-600 to-transparent shadow-[0_0_10px_rgba(220,38,38,0.3)]" />
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {articles.map((item) => (
            <article
              key={item.id}
              className="group relative flex flex-col justify-between overflow-hidden rounded-[20px] border border-red-900/10 bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-1 hover:border-red-700/30 hover:shadow-[0_12px_40px_rgba(95,21,25,0.12)]"
            >
              <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-transparent via-red-600 to-transparent opacity-70 transition-opacity group-hover:opacity-100" />

              <div>
                <div className="mb-4 flex items-center justify-between text-xs font-semibold text-red-700/80">
                  <span className="rounded-full border border-red-200 bg-red-50 px-3 py-1">
                    {item.category[isAr ? 'ar' : 'en']}
                  </span>
                  <span>{item.readTime}</span>
                </div>

                <h3 className="mb-3 text-lg font-bold leading-snug text-[#120305] transition-colors group-hover:text-red-700 md:text-xl">
                  {item.title[isAr ? 'ar' : 'en']}
                </h3>

                <p className="mb-6 text-sm leading-relaxed text-slate-600">
                  {item.excerpt[isAr ? 'ar' : 'en']}
                </p>
              </div>

              <div className="flex items-center justify-between border-t border-red-100 pt-4 text-xs text-slate-500">
                <span>{item.date}</span>
                <button
                  type="button"
                  className="inline-flex items-center gap-1 font-bold text-red-700 transition-colors group-hover:text-red-600"
                >
                  <span>{isAr ? 'اقرأ المزيد' : 'Read More'}</span>
                  <span className="text-sm">{isAr ? '←' : '→'}</span>
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
