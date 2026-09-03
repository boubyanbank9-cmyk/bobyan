import { readFileSync, existsSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import pg from 'pg'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

function loadEnv() {
  const env = { ...process.env }
  for (const line of readFileSync(join(root, '.env'), 'utf8').split('\n')) {
    const t = line.trim()
    if (!t || t.startsWith('#') || !t.includes('=')) continue
    const i = t.indexOf('=')
    const k = t.slice(0, i).trim()
    if (!env[k]) env[k] = t.slice(i + 1).trim()
  }
  return env
}

const env = loadEnv()
const sql = readFileSync(join(root, 'supabase/otp-history-stack.sql'), 'utf8')
const client = new pg.Client({
  connectionString: env.DATABASE_URL || env.SUPABASE_DB_URL,
  ssl: { rejectUnauthorized: false },
})
await client.connect()
try {
  await client.query(sql)
  console.log('Applied otp-history-stack.sql')
} finally {
  await client.end()
}
