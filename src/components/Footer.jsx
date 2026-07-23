import React, { useState } from 'react';
import { PIKAM_DATA } from '../data/pikamData';
import { Mail, CheckCircle2 } from 'lucide-react';

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
            <h2>PİKAM DERGİ</h2>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.6, maxWidth: '360px' }}>
              Politik ve İktisadi Araştırmalar Merkezi (PİKAM) bağımsız, akademik ve stratejik düşünce kuruluşu dijital yayın organıdır. Küresel jeopolitik ve makroekonomi alanlarında ampirik analizler sunar.
            </p>
            <div style={{ marginTop: '12px', fontSize: '0.78rem', color: '#38bdf8' }}>
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
              <li><button onClick={onOpenKunye}>KÜNYE VE YAYIN KURULU</button></li>
              <li><button onClick={onScrollToEDergi}>E-DERGİ ARŞİVİ</button></li>
              <li><button onClick={onOpenKunye}>AKADEMİK HAKEM SÜRECİ</button></li>
              <li><button onClick={onOpenKunye}>GİZLİLİK VE TELİF HAKLARI</button></li>
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
          <p>© 2026 PİKAM - Politik ve İktisadi Araştırmalar Merkezi. Tüm Hakları Saklıdır.</p>
          <p style={{ marginTop: '4px', opacity: 0.7 }}>
            ByProtokol ve prestijli dijital gazetecilik tasarımı standartlarında geliştirilmiştir.
          </p>
        </div>
      </div>
    </footer>
  );
}
