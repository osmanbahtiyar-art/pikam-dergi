import React, { useState } from 'react';
import { Mail, CheckCircle2, ExternalLink } from 'lucide-react';

export default function Footer({ onSelectCategory, onOpenKunye, onScrollToEDergi, footerData, headerData, sectionVisibility = {}, onSubscribeNewsletter }) {
  if (sectionVisibility.showSiteFooter === false || (footerData && footerData.showSiteFooter === false)) {
    return null;
  }

  const fData = footerData || {
    logoUrl: '/pikam_logo.png',
    title: 'PİKAM DERGİ',
    description: 'Politik ve İktisadi Araştırmalar Merkezi (PİKAM) bağımsız, akademik ve stratejik düşünce kuruluşu dijital yayın organıdır.',
    portalUrl: 'https://www.pikamtr.com/',
    portalLabel: 'Merkez Portalı: www.pikamtr.com',
    issnText: 'ISSN: 2717-9842 | Ankara, Türkiye',
    copyrightText: '© 2026 PİKAM - Politik ve İktisadi Araştırmalar Merkezi (pikamtr.com). Tüm Hakları Saklıdır.'
  };

  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;
    setIsSubmitting(true);
    if (onSubscribeNewsletter) {
      await onSubscribeNewsletter(email);
    }
    setIsSubmitting(false);
    setSubscribed(true);
  };

  return (
    <footer className="site-footer" style={{ background: '#0b132b', color: '#f8fafc', padding: '50px 0 30px 0', borderTop: '2px solid #1e293b' }}>
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '40px', flexWrap: 'wrap', marginBottom: '40px' }}>
          
          {/* LEFT BRAND BOX */}
          <div style={{ flex: '1 1 340px', maxWidth: '500px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
              <a href={fData.portalUrl || "https://www.pikamtr.com/"} target="_blank" rel="noreferrer">
                <img src={fData.logoUrl || "/pikam_logo.png"} alt="PİKAM Amblem" style={{ width: '52px', height: '52px', objectFit: 'contain', filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.3))' }} />
              </a>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#ffffff', fontFamily: 'Playfair Display, serif', fontWeight: '800', letterSpacing: '1px' }}>{fData.title || 'PİKAM DERGİ'}</h2>
                <span style={{ fontSize: '0.78rem', color: '#38bdf8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Düşünce & Politika Dergisi</span>
              </div>
            </div>

            <p style={{ fontSize: '0.9rem', color: '#94a3b8', lineHeight: '1.65', marginBottom: '16px' }}>
              {fData.description}
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'center' }}>
              {fData.portalUrl && (
                <a 
                  href={fData.portalUrl} 
                  target="_blank" 
                  rel="noreferrer" 
                  style={{ background: 'rgba(56, 189, 248, 0.12)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.3)', padding: '6px 14px', borderRadius: '6px', fontSize: '0.82rem', fontWeight: '700', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s ease' }}
                >
                  <ExternalLink size={14} />
                  <span>{fData.portalLabel || 'Merkez Portalı: www.pikamtr.com'}</span>
                </a>
              )}

              {fData.issnText && (
                <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600', background: 'rgba(255,255,255,0.05)', padding: '6px 12px', borderRadius: '6px' }}>
                  {fData.issnText}
                </span>
              )}
            </div>
          </div>

          {/* RIGHT NEWSLETTER BOX */}
          <div style={{ flex: '1 1 340px', maxWidth: '480px', background: 'rgba(30, 41, 59, 0.6)', padding: '28px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)', boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }}>
            <h4 style={{ color: '#ffffff', fontSize: '1.15rem', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '800' }}>
              <Mail size={20} color="#38bdf8" />
              <span>HAFTALIK E-BÜLTEN ABONELİĞİ</span>
            </h4>
            <p style={{ fontSize: '0.86rem', color: '#cbd5e1', lineHeight: '1.5', marginBottom: '18px' }}>
              PİKAM'ın haftalık stratejik analiz ve ekonomi özetleri e-posta adresinize gelsin.
            </p>

            {subscribed ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#4ade80', background: 'rgba(74, 222, 128, 0.12)', border: '1px solid rgba(74, 222, 128, 0.3)', padding: '14px 18px', borderRadius: '8px', fontSize: '0.88rem', fontWeight: '700' }}>
                <CheckCircle2 size={20} />
                <span>E-Bülten kaydınız başarıyla oluşturuldu. Teşekkür ederiz!</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <input
                  type="email"
                  placeholder="E-posta adresinizi giriniz..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{ flex: '1 1 200px', padding: '12px 16px', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: '#ffffff', fontSize: '0.9rem', outline: 'none' }}
                />
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  style={{ background: '#0284c7', color: '#ffffff', border: 'none', padding: '12px 20px', borderRadius: '8px', fontWeight: '800', fontSize: '0.9rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', minWidth: '110px', transition: 'background 0.2s ease' }}
                >
                  <Mail size={16} />
                  <span>{isSubmitting ? 'Kaydediliyor...' : 'Kayıt Ol'}</span>
                </button>
              </form>
            )}
          </div>

        </div>

        {/* FOOTER SOCIAL MEDIA BAR (TAKİP EDİN) */}
        {headerData?.showSocials !== false && (
          <div className="footer-socials-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px', marginBottom: '24px', flexWrap: 'wrap', background: 'rgba(255,255,255,0.03)', padding: '10px 20px', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <span style={{ fontSize: '0.82rem', color: '#94a3b8', fontWeight: '800', letterSpacing: '0.5px' }}>TAKİP EDİN:</span>
            
            {headerData?.linkedinUrl && (
              <a href={headerData.linkedinUrl} target="_blank" rel="noreferrer" title="LinkedIn" style={{ color: '#38bdf8', background: 'rgba(255,255,255,0.08)', padding: '8px 10px', borderRadius: '20px', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: '600', textDecoration: 'none' }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
                </svg>
                <span>LinkedIn</span>
              </a>
            )}

            {headerData?.twitterUrl && (
              <a href={headerData.twitterUrl} target="_blank" rel="noreferrer" title="X (Twitter)" style={{ color: '#f8fafc', background: 'rgba(255,255,255,0.08)', padding: '8px 10px', borderRadius: '20px', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: '600', textDecoration: 'none' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                <span>X (Twitter)</span>
              </a>
            )}

            {headerData?.instagramUrl && (
              <a href={headerData.instagramUrl} target="_blank" rel="noreferrer" title="Instagram" style={{ color: '#fb7185', background: 'rgba(255,255,255,0.08)', padding: '8px 10px', borderRadius: '20px', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: '600', textDecoration: 'none' }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                <span>Instagram</span>
              </a>
            )}

            {headerData?.youtubeUrl && (
              <a href={headerData.youtubeUrl} target="_blank" rel="noreferrer" title="YouTube" style={{ color: '#f87171', background: 'rgba(255,255,255,0.08)', padding: '8px 10px', borderRadius: '20px', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: '600', textDecoration: 'none' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
                <span>YouTube</span>
              </a>
            )}
          </div>
        )}

        {/* BOTTOM COPYRIGHT */}
        <div style={{ paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.08)', textAlign: 'center', fontSize: '0.82rem', color: '#64748b' }}>
          <p style={{ margin: 0 }}>{fData.copyrightText || '© 2026 PİKAM - Politik ve İktisadi Araştırmalar Merkezi (pikamtr.com). Tüm Hakları Saklıdır.'}</p>
        </div>
      </div>
    </footer>
  );
}
