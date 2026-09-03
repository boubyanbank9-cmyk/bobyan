import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const env = Object.fromEntries(
  readFileSync(join(root, '.env'), 'utf8')
    .split('\n')
    .filter((l) => l.trim() && !l.startsWith('#'))
    .map((l) => {
      const i = l.indexOf('=')
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()]
    })
)
const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY)

const { data, error } = await supabase.storage.from('product-images').list('', { limit: 100 })
if (error) console.error(error.message)
else console.log(JSON.stringify(data, null, 2))

const { data: products } = await supabase.from('products').select('name_ar,image_url,price').order('sort_order')
console.log('PRODUCTS', JSON.stringify(products, null, 2))
