import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Davet veya şifre sıfırlama bağlantısından mı gelindi? (Supabase adres satırını
// istemci oluşturulunca temizlediği için bunu önce okuyoruz.)
const initialHash = typeof window !== 'undefined' ? window.location.hash : '';
export const authLinkType = /type=(invite|recovery)/.exec(initialHash)?.[1] || null;

// Ortam değişkenleri yoksa site statik içerikle (src/data/pikamData.js) çalışmaya devam eder.
export const supabase = SUPABASE_URL && SUPABASE_ANON_KEY
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

export const isCloudEnabled = Boolean(supabase);
