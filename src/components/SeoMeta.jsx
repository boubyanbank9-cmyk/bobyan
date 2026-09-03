import { useEffect } from 'react'
import { SITE_NAME, SITE_URL } from '../data/seo'

function upsertMeta(name, content, attribute = 'name') {
  if (!content) return
  let tag = document.querySelector(`meta[${attribute}="${name}"]`)
  if (!tag) {
    tag = document.createElement('meta')
    tag.setAttribute(attribute, name)
    document.head.appendChild(tag)
  }
  tag.setAttribute('content', content)
}

function upsertLink(rel, href) {
  if (!href) return
  let tag = document.querySelector(`link[rel="${rel}"]`)
  if (!tag) {
    tag = document.createElement('link')
    tag.setAttribute('rel', rel)
    document.head.appendChild(tag)
  }
  tag.setAttribute('href', href)
}

export default function SeoMeta({
  title = SITE_NAME,
  description = '',
  path = '/',
  image = `${SITE_URL}/favicon.svg`,
  noindex = false,
}) {
  useEffect(() => {
    const url = `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`
    document.title = title

    upsertMeta('description', description)
    upsertMeta('robots', noindex ? 'noindex, nofollow' : 'index, follow')

    upsertMeta('og:title', title, 'property')
    upsertMeta('og:description', description, 'property')
    upsertMeta('og:type', 'website', 'property')
    upsertMeta('og:url', url, 'property')
    upsertMeta('og:site_name', SITE_NAME, 'property')
    upsertMeta('og:image', image, 'property')
    upsertMeta('og:locale', 'ar_OM', 'property')

    upsertMeta('twitter:card', 'summary_large_image')
    upsertMeta('twitter:title', title)
    upsertMeta('twitter:description', description)
    upsertMeta('twitter:image', image)

    upsertLink('canonical', url)
  }, [title, description, path, image, noindex])

  return null
}
