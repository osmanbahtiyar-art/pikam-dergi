// Tüm Supabase okuma/yazma işlemleri bu dosyada toplanır.
import { supabase } from './supabaseClient';

export const CONTENT_KEYS = ['articles', 'authors', 'issues', 'hero', 'sections', 'nav', 'kunye', 'header', 'footer', 'notes'];

const requireCloud = () => {
  if (!supabase) throw new Error('Supabase bağlantısı yapılandırılmamış (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY).');
  return supabase;
};

// ---------- Site içeriği ----------
export async function loadContent() {
  if (!supabase) return {};
  const { data, error } = await supabase.from('content').select('key, data');
  if (error) throw error;
  return Object.fromEntries((data || []).map((row) => [row.key, row.data]));
}

export async function saveContent(key, value) {
  const { error } = await requireCloud()
    .from('content')
    .upsert({ key, data: value, updated_at: new Date().toISOString() });
  if (error) throw error;
}

// ---------- Yorumlar ----------
const mapComment = (row) => ({
  id: row.id,
  articleId: row.article_id,
  articleTitle: row.article_title,
  userId: row.user_id,
  authorName: row.author_name,
  commentText: row.body,
  createdAt: new Date(row.created_at).toLocaleString('tr-TR'),
});

export async function loadComments() {
  if (!supabase) return [];
  const { data, error } = await supabase.from('comments').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(mapComment);
}

export async function addComment({ articleId, articleTitle, authorName, commentText }) {
  const { data, error } = await requireCloud()
    .from('comments')
    .insert({ article_id: articleId, article_title: articleTitle || '', author_name: authorName, body: commentText })
    .select()
    .single();
  if (error) throw error;
  return mapComment(data);
}

export async function deleteComment(id) {
  const { error } = await requireCloud().from('comments').delete().eq('id', id);
  if (error) throw error;
}

// ---------- Bülten ----------
export async function subscribeNewsletter(email) {
  const { error } = await requireCloud().from('newsletter').insert({ email: email.trim().toLowerCase() });
  // 23505 = zaten abone; kullanıcı için başarı sayılır.
  if (error && error.code !== '23505') throw error;
}

export async function loadSubscribers() {
  const { data, error } = await requireCloud().from('newsletter').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map((r) => ({ id: r.id, email: r.email, subscribedAt: new Date(r.created_at).toLocaleString('tr-TR') }));
}

export async function deleteSubscriber(id) {
  const { error } = await requireCloud().from('newsletter').delete().eq('id', id);
  if (error) throw error;
}

// ---------- Üyeler (yalnızca yönetici okuyabilir) ----------
export async function loadProfiles() {
  const { data, error } = await requireCloud().from('profiles').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map((p) => ({
    id: p.id,
    fullName: p.full_name || 'PİKAM Okuru',
    email: p.email,
    phone: p.phone,
    interests: p.interests,
    registeredAt: new Date(p.created_at).toLocaleString('tr-TR'),
  }));
}

export async function deleteProfile(id) {
  const { error } = await requireCloud().from('profiles').delete().eq('id', id);
  if (error) throw error;
}

// ---------- Kimlik doğrulama ----------
export const profileFromSession = (session) => {
  const user = session?.user;
  if (!user) return null;
  const meta = user.user_metadata || {};
  return {
    id: user.id,
    email: user.email,
    fullName: meta.full_name || user.email,
    phone: meta.phone || '',
    interests: meta.interests || '',
  };
};

export async function signUp({ email, password, fullName, phone, interests }) {
  const { data, error } = await requireCloud().auth.signUp({
    email: email.trim(),
    password,
    options: {
      data: { full_name: fullName.trim(), phone: (phone || '').trim(), interests: interests || '' },
      emailRedirectTo: window.location.origin,
    },
  });
  if (error) throw error;
  return data; // data.session null ise e-posta doğrulaması bekleniyor
}

export async function signIn(email, password) {
  const { data, error } = await requireCloud().auth.signInWithPassword({ email: email.trim(), password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  if (supabase) await supabase.auth.signOut();
}

export async function sendPasswordReset(email) {
  const { error } = await requireCloud().auth.resetPasswordForEmail(email.trim(), {
    redirectTo: window.location.origin,
  });
  if (error) throw error;
}

export async function isCurrentUserAdmin() {
  if (!supabase) return false;
  const { data, error } = await supabase.rpc('is_admin');
  if (error) return false;
  return data === true;
}

// ---------- Dosya yükleme (media deposu) ----------
const slugify = (name) =>
  name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/ı/g, 'i')
    .replace(/[^a-z0-9.]+/g, '-')
    .replace(/^-+|-+$/g, '');

export async function uploadMedia(fileOrBlob, folder = 'genel', fileName = 'dosya') {
  const client = requireCloud();
  const path = `${folder}/${Date.now()}-${slugify(fileOrBlob.name || fileName)}`;
  const { error } = await client.storage.from('media').upload(path, fileOrBlob, {
    cacheControl: '31536000',
    upsert: false,
    contentType: fileOrBlob.type || undefined,
  });
  if (error) throw error;
  return client.storage.from('media').getPublicUrl(path).data.publicUrl;
}

// Görseli tarayıcıda küçültüp JPEG olarak yükler, herkese açık URL döndürür.
export async function uploadImage(file, folder = 'gorseller', maxSize = 1600) {
  const blob = await resizeImage(file, maxSize);
  const base = (file.name || 'gorsel').replace(/\.[^.]+$/, '');
  return uploadMedia(new File([blob], `${base}.jpg`, { type: 'image/jpeg' }), folder);
}

function resizeImage(file, maxSize) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Görsel işlenemedi'))), 'image/jpeg', 0.85);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Görsel okunamadı'));
    };
    img.src = url;
  });
}

export async function dataUrlToBlob(dataUrl) {
  const res = await fetch(dataUrl);
  return res.blob();
}
