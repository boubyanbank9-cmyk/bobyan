/**
 * Seed Al Ain products using admin session (works without SERVICE_ROLE_KEY).
 * Also updates site_settings branding. Slug/category columns are optional —
 * storefront merges catalog metadata by product name when columns are absent.
 */
import { createClient } from '@supabase/supabase-js'
import { readFileSync, existsSync, writeFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')

function loadEnv() {
  const envPath = join(root, '.env')
  if (!existsSync(envPath)) throw new Error('Missing .env file')
  const env = {}
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue
    const idx = trimmed.indexOf('=')
    env[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim()
  }
  return env
}

const env = loadEnv()
const url = env.VITE_SUPABASE_URL
const key = env.VITE_SUPABASE_ANON_KEY || env.VITE_SUPABASE_PUBLISHABLE_KEY
if (!url || !key) throw new Error('Supabase env vars missing')

const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
})

const catalogPath = join(root, 'src', 'data', 'catalog.js')
const { ALL_PRODUCTS_RAW } = await import(`file:///${catalogPath.replace(/\\/g, '/')}`)

function buildPayload(product, index, includeSlug) {
  const images = product.images?.length ? product.images : [product.image]
  const [image_url, ...gallery] = images
  const payload = {
    name: product.name?.en || product.slug,
    name_ar: product.name?.ar || product.name?.en || product.slug,
    description: product.bullets?.join('\n') || '',
    description_ar: '',
    price: Number(product.price) || 0,
    image_url: image_url || null,
    gallery_urls: gallery,
    is_visible: true,
    is_featured: Boolean(product.featured),
    is_in_stock: true,
    stock_quantity: 999,
    sort_order: index + 1,
    updated_at: new Date().toISOString(),
  }
  if (includeSlug) {
    payload.slug = product.slug
    payload.category = product.category || null
    payload.badge = product.badge || null
    payload.bullets = product.bullets || []
  }
  return payload
}

async function loginAdmin() {
  const email = env.SEED_ADMIN_EMAIL || 'admin@alainwater.com'
  const password = env.SEED_ADMIN_PASSWORD || 'Admin123456'
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw new Error(`Admin login failed: ${error.message}`)
  const { data: isAdmin } = await supabase.rpc('is_admin')
  if (!isAdmin) throw new Error('Logged in but is_admin() is false')
  console.log('Admin session OK')
}

async function supportsSlug() {
  const { error } = await supabase.from('products').select('slug').limit(1)
  return !error
}

async function main() {
  await loginAdmin()
  const includeSlug = await supportsSlug()
  console.log('slug_columns', includeSlug)

  // Hide existing non-Al-Ain products
  const { data: existing } = await supabase.from('products').select('id,name')
  const alainNames = new Set(ALL_PRODUCTS_RAW.map((p) => p.name.en))
  for (const row of existing || []) {
    if (!alainNames.has(row.name)) {
      await supabase.from('products').update({ is_visible: false, updated_at: new Date().toISOString() }).eq('id', row.id)
    }
  }

  let inserted = 0
  let updated = 0
  for (let i = 0; i < ALL_PRODUCTS_RAW.length; i += 1) {
    const product = ALL_PRODUCTS_RAW[i]
    const payload = buildPayload(product, i, includeSlug)
    const match = (existing || []).find((row) => row.name === payload.name)
    if (match) {
      const { error } = await supabase.from('products').update(payload).eq('id', match.id)
      if (error) console.error('update fail', payload.name, error.message)
      else updated += 1
    } else {
      const { error } = await supabase.from('products').insert(payload)
      if (error) console.error('insert fail', payload.name, error.message)
      else inserted += 1
    }
  }

  const { error: settingsError } = await supabase
    .from('site_settings')
    .update({
      brand_name: 'Al Ain Water',
      brand_name_ar: 'مياه العين',
      brand_subtitle: "UAE's Leading Water Brand",
      brand_subtitle_ar: 'العلامة الرائدة للمياه في الإمارات',
      phone: '80025246',
      whatsapp: '+97180025246',
      email: 'help@alainwater.com',
      address: 'Sky Tower, 17th Floor, Al Reem Island, Abu Dhabi, UAE',
      address_ar: 'برج سكاي، الطابق ١٧، جزيرة الريم، أبوظبي، الإمارات',
      hours: 'Sat - Thu: 9:00 - 21:00',
      hours_ar: 'السبت - الخميس: ٩:٠٠ - ٢١:٠٠',
      social_instagram: 'https://www.instagram.com/alainwaterofficial',
      social_facebook: 'https://www.facebook.com/alainwater',
      logo_url:
        'https://alainwater.com/cdn/shop/files/Logo_Small_8efe5185-9bae-4d27-9986-a7c64b62bf21.png?v=1712162622',
      updated_at: new Date().toISOString(),
    })
    .eq('id', 1)

  if (settingsError) console.error('settings fail', settingsError.message)
  else console.log('site_settings updated')

  console.log(`Done inserted=${inserted} updated=${updated}`)

  // Keep SQL seed file in sync
  const sqlPath = join(root, 'supabase', 'seed-alain-products.sql')
  if (!existsSync(sqlPath)) {
    writeFileSync(sqlPath, '-- run node scripts/seed-alain-products.mjs\n')
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
