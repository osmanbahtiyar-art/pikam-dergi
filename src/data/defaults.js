// Supabase'de karşılığı olmayan her içerik anahtarı için kullanılan varsayılanlar.
// Supabase'e ilk kurulumda bu değerler yüklenir (scripts/seed-content.mjs).
import { PIKAM_DATA } from './pikamData.js';

export const DEFAULT_SECTIONS = {
  showHero: false,
  showEDergi: false,
  showTicker: false,
  showYazarlar: true,
  showEditorialFeed: false,
};

export const DEFAULT_NAV = {
  ANASAYFA: true,
  'E-DERGİ': false,
  POLİTİKA: false,
  EKONOMİ: false,
  FİNANS: false,
  'KÜLTÜR SANAT': false,
  KÜNYE: true,
  EKİBİMİZ: true,
};

export const DEFAULT_HEADER = {
  showSiteHeader: true,
  emblemUrl: '/pikam_blue_emblem.png',
  logotypeUrl: '/pikam_blue_logotype.png',
  showEmblem: true,
  showLogotype: true,
  showPortalBadge: true,
  showIssn: true,
  showTagline: true,
  showAbout: true,
  showSocials: true,
  linkedinUrl: 'https://linkedin.com',
  twitterUrl: 'https://x.com',
  instagramUrl: 'https://instagram.com',
  youtubeUrl: 'https://youtube.com',
  title: 'PİKAM DERGİ',
  fullTitle: 'Politik ve İktisadi Araştırmalar Merkezi',
  tagline: "Türkiye'nin politik ve iktisadi geleceğine yön veren düşünce merkezi.",
  aboutText:
    'PİKAM Dergi; Politik ve İktisadi Araştırmalar Merkezi bünyesinde yayınlanan, küresel jeopolitik, iktisadi stratejiler ve kamu politikaları alanında bağımsız ve akademik analizler sunan dijital yayın organıdır.',
  issn: 'ISSN 2717-9842 | Yıl: 7 | Sayı: 74 | Temmuz 2026',
  portalUrl: 'https://www.pikamtr.com/',
  portalLabel: 'pikamtr.com',
};

export const DEFAULT_FOOTER = {
  showSiteFooter: true,
  logoUrl: '/pikam_logo.png',
  title: 'PİKAM DERGİ',
  description:
    'Politik ve İktisadi Araştırmalar Merkezi (PİKAM) bağımsız, akademik ve stratejik düşünce kuruluşu dijital yayın organıdır.',
  portalUrl: 'https://www.pikamtr.com/',
  portalLabel: 'Merkez Portalı: www.pikamtr.com',
  issnText: 'ISSN: 2717-9842 | Ankara, Türkiye',
  copyrightText: '© 2026 PİKAM - Politik ve İktisadi Araştırmalar Merkezi (pikamtr.com). Tüm Hakları Saklıdır.',
};

export const DEFAULT_NOTES = [];

export const SITE_DEFAULTS = {
  articles: PIKAM_DATA.articles,
  authors: PIKAM_DATA.authors,
  issues: PIKAM_DATA.eDergiIssues,
  hero: PIKAM_DATA.heroFeatured,
  kunye: PIKAM_DATA.kunye,
  sections: DEFAULT_SECTIONS,
  nav: DEFAULT_NAV,
  header: DEFAULT_HEADER,
  footer: DEFAULT_FOOTER,
  notes: DEFAULT_NOTES,
};
