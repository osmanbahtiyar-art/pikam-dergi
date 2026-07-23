import React, { useState } from 'react';
import { PIKAM_DATA } from '../data/pikamData';
import { Mail, CheckCircle2, ExternalLink } from 'lucide-react';

export default function Footer({ onSelectCategory, onOpenKunye, onScrollToEDergi }) {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;
    setSubscribed(true);
  };

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          {/* BRAND */}
          <div className="footer-brand">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <a href="https://www.pikamtr.com/" target="_blank" rel="noreferrer">
                <img src="/pikam_logo.png" alt="PİKAM Amblem" style={{ width: '48px', height: '48px', objectFit: 'contain' }} />
              </a>
              <h2 style={{ margin: 0 }}>PİKAM DERGİ</h2>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.6, maxWidth: '360px' }}>
              Politik ve İktisadi Araştırmalar Merkezi (PİKAM) bağımsız, akademik ve stratejik düşünce kuruluşu dijital yayın organıdır.
            </p>
            <div style={{ marginTop: '10px', fontSize: '0.82rem', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ExternalLink size={14} />
              <a href="https://www.pikamtr.com/" target="_blank" rel="noreferrer" style={{ textDecoration: 'underline', color: '#38bdf8', fontWeight: '700' }}>
                Merkez Portalı: www.pikamtr.com
              </a>
            </div>
            <div style={{ marginTop: '6px', fontSize: '0.78rem', color: '#64748b' }}>
              ISSN: 2717-9842 | Ankara, Türkiye
            </div>
          </div>

          {/* KATEGORİLER */}
          <div className="footer-links">
            <h4>KATEGORİLER</h4>
            <ul>
              <li><button onClick={() => onSelectCategory('DÜNYA')}>DÜNYA</button></li>
              <li><button onClick={() => onSelectCategory('EKONOMİ')}>EKONOMİ</button></li>
              <li><button onClick={() => onSelectCategory('POLİTİKA')}>POLİTİKA</button></li>
              <li><button onClick={() => onSelectCategory('STRATEJİ')}>STRATEJİ</button></li>
              <li><button onClick={() => onSelectCategory('TEKNOLOJİ')}>TEKNOLOJİ</button></li>
            </ul>
          </div>

          {/* KURUMSAL */}
          <div className="footer-links">
            <h4>KURUMSAL</h4>
            <ul>
              <li><a href="https://www.pikamtr.com/" target="_blank" rel="noreferrer" style={{ color: '#38bdf8', fontWeight: '700' }}>PİKAM ANA WEB SİTESİ ↗</a></li>
              <li><button onClick={onOpenKunye}>KÜNYE VE YAYIN KURULU</button></li>
              <li><button onClick={onScrollToEDergi}>E-DERGİ ARŞİVİ</button></li>
              <li><button onClick={onOpenKunye}>AKADEMİK HAKEM SÜRECİ</button></li>
              <li><button onClick={onOpenKunye}>İLETİŞİM & YERLEŞKE</button></li>
            </ul>
          </div>

          {/* BÜLTEN ABONELİĞİ */}
          <div className="footer-subscribe">
            <h4>HAFTALIK E-BÜLTEN</h4>
            <p style={{ fontSize: '0.82rem', color: '#cbd5e1', marginBottom: '10px' }}>
              PİKAM'ın haftalık stratejik analiz ve ekonomi özetleri e-posta adresinize gelsin.
            </p>

            {subscribed ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#4ade80', background: 'rgba(74, 222, 128, 0.1)', padding: '10px 14px', borderRadius: '4px', fontSize: '0.85rem' }}>
                <CheckCircle2 size={18} />
                <span>E-Bülten kaydınız başarıyla oluşturuldu. Teşekkür ederiz!</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="subscribe-form">
                <input
                  type="email"
                  className="subscribe-input"
                  placeholder="E-posta adresiniz..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <button type="submit" className="subscribe-btn">
                  Kayıt Ol
                </button>
              </form>
            )}
          </div>
        </div>

        {/* BOTTOM COPYRIGHT */}
        <div className="footer-bottom">
          <p>© 2026 PİKAM - Politik ve İktisadi Araştırmalar Merkezi (<a href="https://www.pikamtr.com/" target="_blank" rel="noreferrer" style={{ color: '#38bdf8', textDecoration: 'underline' }}>pikamtr.com</a>). Tüm Hakları Saklıdır.</p>
        </div>
      </div>
    </footer>
  );
}
