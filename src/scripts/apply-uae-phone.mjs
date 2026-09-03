/**
 * Apply UAE phone validation to the linked Supabase database.
 * Usage: node scripts/apply-uae-phone.mjs
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
if (!databaseUrl) throw new Error('DATABASE_URL missing in .env')

const sql = readFileSync(join(root, 'supabase/uae-phone-validation.sql'), 'utf8')
const client = new pg.Client({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } })
await client.connect()
try {
  await client.query(sql)
  const { rows } = await client.query(`
    SELECT
      normalize_uae_phone('+971501234567') AS uae_full,
      normalize_uae_phone('501234567') AS uae_local,
      normalize_uae_phone('91234567') AS oman_rejected
  `)
  console.log('Verification:', rows[0])
  console.log('Applied uae-phone-validation.sql')
} finally {
  await client.end()
}
