// Varsayılan site içeriğini Supabase'e yüklemek için SQL üretir.
// Kullanım: npm run seed > seed.sql  → çıktıyı Supabase SQL Editor'da çalıştırın.
// Mevcut kayıtların üzerine yazmaz (on conflict do nothing).
import { SITE_DEFAULTS } from '../src/data/defaults.js';

const tag = '$pikam$';
const rows = Object.entries(SITE_DEFAULTS).map(
  ([key, value]) => `  ('${key}', ${tag}${JSON.stringify(value)}${tag}::jsonb)`
);

process.stdout.write(
  `insert into public.content (key, data) values\n${rows.join(',\n')}\non conflict (key) do nothing;\n`
);
