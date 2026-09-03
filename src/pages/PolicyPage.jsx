import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useLanguage } from '../context/LanguageContext'
import { isSupabaseConfigured, supabase } from '../lib/supabase'
import { replaceLegacyContact } from '../lib/siteContact'
import SeoMeta from '../components/SeoMeta'
import { PAGE_SEO } from '../data/seo'

const POLICY_KEYS = {
  'privacy-policy': 'privacy',
  terms: 'terms',
  'shipping-policy': 'shipping',
  'return-policy': 'returns',
}

const SEO_KEYS = {
  'privacy-policy': 'privacy',
  terms: 'terms',
  'shipping-policy': 'shipping',
  'return-policy': 'returns',
}

export default function PolicyPage({ slug }) {
  const { t, lang } = useLanguage()
  const key = POLICY_KEYS[slug]
  const fallback = key ? t.policies[key] : null
  const [page, setPage] = useState(null)
  const isAr = lang === 'ar' || lang === 'ur'

  useEffect(() => {
    if (!isSupabaseConfigured) return

    supabase
      .from('site_pages')
      .select('*')
      .eq('slug', slug)
      .eq('is_published', true)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setPage(data)
      })
  }, [slug])

  const title = page ? (isAr ? page.title_ar || page.title : page.title) : fallback?.title
  const rawBody = page
    ? isAr
      ? page.content_ar || page.content
      : page.content
    : fallback?.body
  const body = replaceLegacyContact(rawBody)
  const seoKey = SEO_KEYS[slug]
  const seo = seoKey ? PAGE_SEO[seoKey] : PAGE_SEO.home

  if (!title) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <Link to="/" className="text-alain-blue font-black">
          ← {t.nav.home}
        </Link>
      </div>
    )
  }

  return (
    <>
      <SeoMeta title={title || seo.title} description={seo.description} path={seo.path} />
      <section className="py-16 md:py-20 bg-[#f4f8fb] min-h-[50vh]">
      <div className="max-w-3xl mx-auto px-4">
        <div className="rounded-3xl bg-white border border-slate-100 shadow-sm p-8 md:p-10">
          <Link
            to="/"
            className="text-sm font-bold text-alain-blue hover:underline mb-6 inline-block"
          >
            ← {t.nav.home}
          </Link>
          <h1 className="text-3xl font-black text-slate-900 mb-6">{title}</h1>
          {page ? (
            <div
              className="text-slate-600 leading-8 text-lg prose prose-slate max-w-none"
              dangerouslySetInnerHTML={{ __html: body }}
            />
          ) : (
            <p className="text-slate-600 leading-8 text-lg">{body}</p>
          )}
        </div>
      </div>
    </section>
    </>
  )
}
