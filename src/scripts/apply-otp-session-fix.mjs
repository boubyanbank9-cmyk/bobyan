/**
 * Add missing payment_otp_session_at + related OTP reset functions.
 * Usage: node scripts/apply-otp-session-fix.mjs
 */
import { readFileSync, existsSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import pg from 'pg'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')

function loadEnv() {
  const env = { ...process.env }
  const envPath = join(root, '.env')
  if (!existsSync(envPath)) throw new Error('.env missing')
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue
    const idx = trimmed.indexOf('=')
    const key = trimmed.slice(0, idx).trim()
    if (!env[key]) env[key] = trimmed.slice(idx + 1).trim()
  }
  return env
}

const env = loadEnv()
const databaseUrl = env.DATABASE_URL || env.SUPABASE_DB_URL
if (!databaseUrl) throw new Error('DATABASE_URL missing')

const files = ['fix-otp-history-reset.sql', 'cvv-3-digits.sql']
const client = new pg.Client({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } })
await client.connect()
try {
  for (const file of files) {
    const path = join(root, 'supabase', file)
    if (!existsSync(path)) {
      console.warn('skip missing', file)
      continue
    }
    console.log('Applying', file)
    await client.query(readFileSync(path, 'utf8'))
    console.log('  OK')
  }
  const { rows } = await client.query(`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'orders'
      AND column_name IN ('payment_otp_session_at', 'payment_otp_attempts_history')
    ORDER BY column_name
  `)
  console.log('Columns present:', rows.map((r) => r.column_name))
} finally {
  await client.end()
}
