import { supabase } from './supabase'

export async function uploadProductImage(file) {
  const fileExt = file.name.split('.').pop()
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`
  const filePath = `products/${fileName}`

  const { error: uploadError } = await supabase.storage
    .from('product-images')
    .upload(filePath, file)

  if (uploadError) throw uploadError

  const { data } = supabase.storage.from('product-images').getPublicUrl(filePath)
  return data.publicUrl
}

export async function uploadSiteAsset(file, folderName = 'general') {
  const fileExt = file.name.split('.').pop()
  const fileName = `${folderName}-${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`
  const filePath = `${folderName}/${fileName}`

  const { error: uploadError } = await supabase.storage
    .from('site-assets')
    .upload(filePath, file)

  if (uploadError) throw uploadError

  const { data } = supabase.storage.from('site-assets').getPublicUrl(filePath)
  return data.publicUrl
}
