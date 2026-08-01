import React, { useState } from 'react';
import { Mail, CheckCircle2, ExternalLink } from 'lucide-react';

export default function Footer({ onSelectCategory, onOpenKunye, onScrollToEDergi, footerData, sectionVisibility = {}, onSubscribeNewsletter }) {
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

        {/* BOTTOM COPYRIGHT */}
        <div style={{ paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.08)', textAlign: 'center', fontSize: '0.82rem', color: '#64748b' }}>
          <p style={{ margin: 0 }}>{fData.copyrightText || '© 2026 PİKAM - Politik ve İktisadi Araştırmalar Merkezi (pikamtr.com). Tüm Hakları Saklıdır.'}</p>
        </div>
      </div>
    </footer>
  );
}
