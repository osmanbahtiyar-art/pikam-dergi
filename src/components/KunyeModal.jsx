import React from 'react';
import { X, Award, ShieldCheck, Mail, Phone, MapPin, Globe } from 'lucide-react';
import { PIKAM_DATA } from '../data/pikamData';

export default function KunyeModal({ onClose }) {
  const { kunye } = PIKAM_DATA;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container" style={{ maxWidth: '800px' }} onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>
          <X size={20} />
        </button>

        <div style={{ background: '#0b132b', color: 'white', padding: '32px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <img src="/pikam_logo.png" alt="PİKAM Amblem" style={{ width: '70px', height: '70px', objectFit: 'contain' }} />
          <div>
            <h2 style={{ fontFamily: 'Playfair Display', fontSize: '1.8rem', letterSpacing: '1px' }}>
              PİKAM DERGİ KÜNYESİ VE YAYIN İLKELERİ
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '4px' }}>
              Politik ve İktisadi Araştırmalar Merkezi Akademik Hakemli Yayın Standartları
            </p>
          </div>
        </div>

        <div className="kunye-body">
          <div className="kunye-grid">
            <div className="kunye-item">
              <h4 style={{ fontSize: '0.82rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>
                YAYIN SAHİBİ
              </h4>
              <p style={{ fontWeight: '700', color: '#0f172a' }}>{kunye.yayinSahibi}</p>
            </div>

            <div className="kunye-item">
              <h4 style={{ fontSize: '0.82rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>
                GENEL YAYIN YÖNETMENİ
              </h4>
              <p style={{ fontWeight: '700', color: '#0f172a' }}>{kunye.yayinYonetmeni}</p>
            </div>

            <div className="kunye-item">
              <h4 style={{ fontSize: '0.82rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>
                SORUMLU YAZI İŞLERİ MÜDÜRÜ
              </h4>
              <p style={{ fontWeight: '700', color: '#0f172a' }}>{kunye.sorumluYaziIsleri}</p>
            </div>

            <div className="kunye-item">
              <h4 style={{ fontSize: '0.82rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>
                TASARIM VE GRAFİK MİMARİSİ
              </h4>
              <p style={{ fontWeight: '700', color: '#0f172a' }}>{kunye.grafikTasarim}</p>
            </div>
          </div>

          <div style={{ marginTop: '28px', background: '#f8fafc', padding: '20px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontFamily: 'Playfair Display', fontSize: '1.15rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <ShieldCheck size={20} color="#10b981" />
              <span>AKADEMİK DANIŞMA VE HAKEM KURULU</span>
            </h3>
            <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
              {kunye.akademikDanismaKurulu.map((member, index) => (
                <li key={index} style={{ padding: '6px 0', borderBottom: '1px solid #e2e8f0', fontSize: '0.9rem', color: '#334155' }}>
                  • {member}
                </li>
              ))}
            </ul>
          </div>

          <div style={{ marginTop: '28px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '0.88rem', color: '#475569' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MapPin size={16} color="#0b132b" />
              <span>{kunye.iletisim.adres}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Phone size={16} color="#0b132b" />
              <span>{kunye.iletisim.telefon}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Mail size={16} color="#0b132b" />
              <span>{kunye.iletisim.eposta}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Globe size={16} color="#0b132b" />
              <span>{kunye.iletisim.web}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
