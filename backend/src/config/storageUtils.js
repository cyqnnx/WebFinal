import { supabase } from './supabase.js';

const productBucket = process.env.PRODUCT_IMAGES_BUCKET || 'product-images';
const assetUrlMode = process.env.ASSET_URL_MODE || 'public'; // 'public' or 'signed'
const signedExpiresSeconds = Number(process.env.SIGNED_URL_EXPIRES_SECONDS || 3600);

export function getProductImagesBucket() {
  return productBucket;
}

export function toSupabasePublicUrl(path) {
  const { data } = supabase.storage.from(productBucket).getPublicUrl(path);
  return data.publicUrl;
}

export async function toSupabaseSignedUrl(path) {
  const { data, error } = await supabase.storage
    .from(productBucket)
    .createSignedUrl(path, signedExpiresSeconds);

  if (error) throw error;
  return data.signedUrl;
}

export async function getAssetUrl(path) {
  if (!path) return null;
  if (assetUrlMode === 'signed') return toSupabaseSignedUrl(path);
  return toSupabasePublicUrl(path);
}

export async function uploadAsset({ path, fileBuffer, contentType }) {
  const { data, error } = await supabase.storage
    .from(productBucket)
    .upload(path, fileBuffer, {
      contentType,
      upsert: true,
    });

  if (error) throw error;
  return data;
}

