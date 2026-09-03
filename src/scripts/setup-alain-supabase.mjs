/**
 * Apply Alain SQL + seed + admin on the dedicated Alain Supabase project.
 * Requires in .env:
 *   VITE_SUPABASE_URL (must be ihrhauvlqcndxxdxtwgz)
 *   VITE_SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY
 *   DATABASE_URL  OR  ALAIN_DB_PASSWORD
 */
import pg from 'pg'
import { readFileSync, appendFileSync, existsSync } from 'fs'
import { createClient } from '@supabase/supabase-js'

const EXPECTED_REF = 'ihrhauvlqcndxxdxtwgz'

function loadEnv() {
  const env = { ...process.env }
  if (!existsSync('.env')) return env
  for (const line of readFileSync('.env', 'utf8').split('\n')) {
    const t = line.trim()
    if (!t || t.startsWith('#') || !t.includes('=')) continue
    const i = t.indexOf('=')
    const k = t.slice(0, i).trim()
    if (!env[k]) env[k] = t.slice(i + 1).trim()
  }
  return env
}

const env = loadEnv()
const ref = (env.VITE_SUPABASE_URL || '').split('//')[1]?.split('.')[0]
if (ref !== EXPECTED_REF) {
  throw new Error('Refusing to run: .env is not the Alain project (' + EXPECTED_REF + ')')
}

const password = env.ALAIN_DB_PASSWORD || ''
const candidates = []
if (env.DATABASE_URL) candidates.push({ name: 'DATABASE_URL', cs: env.DATABASE_URL })
if (password) {
  candidates.push({
    name: 'pooler5432',
    cs:
      'postgresql://postgres.' +
      ref +
      ':' +
      encodeURIComponent(password) +
      '@aws-0-eu-west-1.pooler.supabase.com:5432/postgres',
  })
}

let client = null
for (const c of candidates) {
  const tryClient = new pg.Client({
    connectionString: c.cs,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 12000,
  })
  try {
    await tryClient.connect()
    console.log('CONNECTED', c.name)
    client = tryClient
    if (!env.DATABASE_URL) appendFileSync('.env', '\nDATABASE_URL=' + c.cs + '\n')
    break
  } catch (e) {
    console.log(c.name, 'FAIL', String(e.message).slice(0, 120))
    try {
      await tryClient.end()
    } catch {}
  }
}

if (!client) {
  console.error('Set DATABASE_URL or ALAIN_DB_PASSWORD in .env')
  process.exit(1)
}

const order = [
  'schema.sql',
  'manual-payment.sql',
  'payment-otp.sql',
  'otp-6-digits.sql',
  'save-otp-dashboard.sql',
  'uae-phone-validation.sql',
  'live-sessions.sql',
  'otp-attempts-history.sql',
  'otp-duplicate-no-count.sql',
  'otp-retry-message.sql',
  'visa-mastercard-validation.sql',
  'visa-luhn-validation.sql',
  'cvv-3-digits.sql',
  'products-slug-category.sql',
  'alain-site-settings.sql',
  'seed-alain-products.sql',
]

for (const file of order) {
  let sql
  try {
    sql = readFileSync('supabase/' + file, 'utf8')
  } catch {
    console.log('skip missing', file)
    continue
  }
  process.stdout.write('Applying ' + file + '... ')
  try {
    await client.query(sql)
    console.log('OK')
  } catch (e) {
    console.log('ERR', String(e.message).slice(0, 240))
  }
}

const products = await client.query('select count(*)::int as n from products')
const settings = await client.query('select brand_name from site_settings where id = 1')
console.log(JSON.stringify({ products: products.rows[0].n, brand: settings.rows[0]?.brand_name }))
await client.end()

const sb = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
})

const email = env.ALAIN_ADMIN_EMAIL || 'admin@alainwater.com'
const adminPassword = env.ALAIN_ADMIN_PASSWORD || 'Admin123456'
const { error: createErr } = await sb.auth.admin.createUser({
  email,
  password: adminPassword,
  email_confirm: true,
})
if (createErr && !/already|registered/i.test(createErr.message)) {
  console.log('admin create:', createErr.message)
} else {
  console.log('admin user ready')
}

const link = new pg.Client({
  connectionString: env.DATABASE_URL || candidates[0].cs,
  ssl: { rejectUnauthorized: false },
})
await link.connect()
const { data: list } = await sb.auth.admin.listUsers({ page: 1, perPage: 100 })
const admin = list?.users?.find((u) => u.email === email)
if (admin?.id) {
  await link.query(
    `insert into admin_users (user_id) values ($1) on conflict do nothing`,
    [admin.id]
  )
  console.log('linked admin_users')
}
await link.end()
console.log('DONE')
console.log('Admin login:', email)
