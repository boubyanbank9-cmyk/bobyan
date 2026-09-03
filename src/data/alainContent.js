const PUBLIC_ASSET_BASE = import.meta.env.DEV ? '/assets/' : new URL('../assets/', import.meta.url).href

export const LOGO_URL = `${PUBLIC_ASSET_BASE}i.jpeg`
