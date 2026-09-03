/**
 * Apply Al Ain SQL stack to the linked Supabase project via Management API.
 * Requires SUPABASE_ACCESS_TOKEN + project ref from VITE_SUPABASE_URL,
 * or DATABASE_URL (postgres connection string).
 *
 * Usage: node scripts/apply-supabase.mjs
 */
import { readFileSync, existsSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')

function loadEnv() {
  const env = { ...process.env }
  const envPath = join(root, '.env')
  if (existsSync(envPath)) {
    for (const line of readFileSync(envPath, 'utf8').split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue
      const idx = trimmed.indexOf('=')
      const key = trimmed.slice(0, idx).trim()
      if (!env[key]) env[key] = trimmed.slice(idx + 1).trim()
    }
  }
  return env
}

const ORDER = [
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
  'fix-otp-history-reset.sql',
  'otp-history-stack.sql',
  'visa-mastercard-validation.sql',
  'visa-luhn-validation.sql',
  'cvv-3-digits.sql',
  'products-slug-category.sql',
  'alain-site-settings.sql',
  'seed-alain-products.sql',
  'fix-everything.sql',
]

async function applyViaPg(databaseUrl, sql) {
  const { default: pg } = await import('pg').catch(() => ({ default: null }))
  if (!pg) throw new Error('Install pg: npm i -D pg')
  const client = new pg.Client({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } })
  await client.connect()
  try {
    await client.query(sql)
  } finally {
    await client.end()
  }
}

async function main() {
  const env = loadEnv()
  const url = env.VITE_SUPABASE_URL || ''
  const ref = url.match(/https?:\/\/([^.]+)\.supabase\.co/)?.[1]
  const token = env.SUPABASE_ACCESS_TOKEN
  const databaseUrl = env.DATABASE_URL || env.SUPABASE_DB_URL

  if (!ref || ref === 'your-project') {
    console.error('VITE_SUPABASE_URL is missing or still a placeholder (your-project).')
    console.error('Create a Supabase project, put real URL + anon key in .env, then re-run.')
    process.exit(1)
  }

  for (const file of ORDER) {
    const path = join(root, 'supabase', file)
    if (!existsSync(path)) {
      console.warn(`skip missing ${file}`)
      continue
    }
    const sql = readFileSync(path, 'utf8')
    console.log(`Applying ${file} (${sql.length} chars)...`)

    if (databaseUrl) {
      await applyViaPg(databaseUrl, sql)
      console.log(`  OK via DATABASE_URL`)
      continue
    }

    if (!token) {
      console.error('Need SUPABASE_ACCESS_TOKEN or DATABASE_URL in .env to apply SQL remotely.')
      console.error('Alternatively paste files from supabase/APPLY-ORDER.md into the SQL Editor.')
      process.exit(1)
    }

    const res = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: sql }),
    })
    const text = await res.text()
    if (!res.ok) {
      console.error(`  FAIL ${res.status}: ${text.slice(0, 500)}`)
      process.exit(1)
    }
    console.log(`  OK`)
  }

  console.log('All SQL applied.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
