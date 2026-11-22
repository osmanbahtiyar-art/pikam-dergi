# PİKAM Dergi — pikamdergi.com

React + Vite ile yazılmış dergi sitesi. İçerik, üyeler, yorumlar ve bülten aboneleri Supabase'de tutulur; site Vercel'de yayınlanır.

## Yapı

| Parça | Nerede |
|---|---|
| Site kodu | `src/` |
| Veritabanı şeması | `supabase/schema.sql` |
| Supabase erişimi | `src/lib/db.js` |
| Varsayılan içerik (Supabase boşsa) | `src/data/defaults.js`, `src/data/pikamData.js` |
| Yönetim paneli | `https://www.pikamdergi.com/admin` |

## Kurulum

1. Supabase'de yeni proje açın, `supabase/schema.sql` dosyasını SQL Editor'da çalıştırın.
2. Authentication > Users'tan yönetici kullanıcısını oluşturun ve şemanın sonundaki `insert into public.admins …` sorgusunu çalıştırın.
3. İlk içeriği yüklemek için: `npm run seed -- <SUPABASE_URL> <SERVICE_ROLE_KEY>` (anahtarı repoya koymayın).
4. Vercel > Settings > Environment Variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY` (Project Settings > API > anon / publishable key)
5. Supabase > Authentication > URL Configuration: Site URL `https://www.pikamdergi.com`.

## Geliştirme

```bash
npm install
cp .env.example .env.local   # değerleri doldurun
npm run dev
```

Yönetici girişi Supabase Auth ile yapılır; yalnızca `admins` tablosundaki kullanıcılar paneli açabilir. Görseller ve PDF'ler Supabase Storage'daki `media` deposuna yüklenir.
