import React, { useState } from 'react';
import { X, User, Mail, Lock, Phone, CheckSquare, LogIn, UserPlus, ShieldCheck } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

export default function UserAuthModal({ onClose, onLoginSuccess }) {
  const [mode, setMode] = useState('login'); // 'login' or 'register'

  // Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [interests, setInterests] = useState(['EKONOMİ', 'POLİTİKA']);
  
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availableInterests = ['EKONOMİ', 'POLİTİKA', 'STRATEJİ', 'TEKNOLOJİ', 'DÜNYA'];

  const toggleInterest = (category) => {
    if (interests.includes(category)) {
      setInterests(interests.filter(i => i !== category));
    } else {
      setInterests([...interests, category]);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!fullName || !email || !password || !phone) {
      setErrorMsg('Lütfen tüm zorunlu alanları doldurun.');
      return;
    }

    if (interests.length === 0) {
      setErrorMsg('Lütfen en az 1 adet ilgi alanı seçin.');
      return;
    }

    setIsSubmitting(true);

    const now = new Date();
    const formattedDate = `${now.toLocaleDateString('tr-TR')} ${now.toLocaleTimeString('tr-TR')}`;

    const newUser = {
      id: `usr-${Date.now()}`,
      fullName,
      email,
      phone,
      interests: interests.join(', '),
      registeredAt: formattedDate,
      rawDate: now.toISOString()
    };

    // Try Supabase Auth/Database Sync
    try {
      await supabase.from('profiles').insert([{
        id: newUser.id,
        full_name: fullName,
        email: email,
        phone: phone,
        interests: interests.join(', '),
        registered_at: formattedDate
      }]);
    } catch (err) {
      console.log('Supabase profile sync notice:', err);
    }

    // Save locally
    const existing = JSON.parse(localStorage.getItem('pikam_registered_users') || '[]');
    const updatedUsers = [newUser, ...existing];
    localStorage.setItem('pikam_registered_users', JSON.stringify(updatedUsers));

    // Log in user automatically
    localStorage.setItem('pikam_current_user', JSON.stringify(newUser));
    onLoginSuccess(newUser);
    setIsSubmitting(false);
    onClose();
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Lütfen e-posta ve şifrenizi girin.');
      return;
    }

    // Check registered users
    const existing = JSON.parse(localStorage.getItem('pikam_registered_users') || '[]');
    const found = existing.find(u => u.email.toLowerCase() === email.toLowerCase());

    const loggedUser = found || {
      id: `usr-${Date.now()}`,
      fullName: email.split('@')[0].toUpperCase(),
      email: email,
      phone: '+90 555 000 00 00',
      interests: 'POLİTİKA, EKONOMİ',
      registeredAt: `${new Date().toLocaleDateString('tr-TR')} ${new Date().toLocaleTimeString('tr-TR')}`
    };

    localStorage.setItem('pikam_current_user', JSON.stringify(loggedUser));
    onLoginSuccess(loggedUser);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container" style={{ maxWidth: '520px', padding: '32px' }} onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>
          <X size={18} />
        </button>

        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <img src="/pikam_logo.png" alt="PİKAM Logo" style={{ width: '65px', height: '65px', margin: '0 auto 10px auto' }} />
          <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.5rem', color: '#0b132b' }}>
            {mode === 'login' ? 'PİKAM OKUYUCU GİRİŞİ' : 'PİKAM OKUYUCU ÜYELİK FORMU'}
          </h2>
          <p style={{ fontSize: '0.82rem', color: '#64748b' }}>
            {mode === 'login' 
              ? 'Makalelere yorum yapmak ve e-dergileri okumak için giriş yapın.' 
              : 'Politik ve İktisadi Araştırmalar Merkezi yayınlarına üye olun.'}
          </p>
        </div>

        {/* MODE TOGGLE SWITCH */}
        <div style={{ display: 'flex', background: '#f1f5f9', padding: '4px', borderRadius: '6px', marginBottom: '20px' }}>
          <button 
            onClick={() => { setMode('login'); setErrorMsg(''); }}
            style={{ flex: 1, padding: '8px', borderRadius: '4px', border: 'none', background: mode === 'login' ? '#0b132b' : 'transparent', color: mode === 'login' ? 'white' : '#475569', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
          >
            <LogIn size={15} /> Giriş Yap
          </button>
          <button 
            onClick={() => { setMode('register'); setErrorMsg(''); }}
            style={{ flex: 1, padding: '8px', borderRadius: '4px', border: 'none', background: mode === 'register' ? '#0b132b' : 'transparent', color: mode === 'register' ? 'white' : '#475569', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
          >
            <UserPlus size={15} /> Yeni Üye Ol
          </button>
        </div>

        {errorMsg && (
          <div style={{ background: '#fef2f2', color: '#dc2626', padding: '10px 14px', borderRadius: '6px', fontSize: '0.82rem', marginBottom: '16px', borderLeft: '4px solid #dc2626' }}>
            {errorMsg}
          </div>
        )}

        {/* LOGIN FORM */}
        {mode === 'login' ? (
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#1e293b', display: 'block', marginBottom: '4px' }}>E-POSTA ADRESİ</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="ornek@pikamdergi.com" 
                  required
                  style={{ width: '100%', padding: '10px 12px 10px 36px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                />
                <Mail size={16} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '12px' }} />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#1e293b', display: 'block', marginBottom: '4px' }}>ŞİFRE</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  placeholder="••••••••" 
                  required
                  style={{ width: '100%', padding: '10px 12px 10px 36px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                />
                <Lock size={16} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '12px' }} />
              </div>
            </div>

            <button 
              type="submit" 
              style={{ background: '#0b132b', color: 'white', padding: '12px', borderRadius: '6px', fontWeight: '700', fontSize: '0.92rem', border: 'none', cursor: 'pointer', marginTop: '8px' }}
            >
              Giriş Yap
            </button>
          </form>
        ) : (
          /* REGISTER FORM */
          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#1e293b', display: 'block', marginBottom: '4px' }}>İSİM VE SOYİSİM *</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type="text" 
                  value={fullName} 
                  onChange={(e) => setFullName(e.target.value)} 
                  placeholder="Örn: Dr. Canan Yılmaz" 
                  required
                  style={{ width: '100%', padding: '10px 12px 10px 36px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                />
                <User size={16} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '12px' }} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#1e293b', display: 'block', marginBottom: '4px' }}>E-POSTA *</label>
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="eposta@adresiniz.com" 
                  required
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#1e293b', display: 'block', marginBottom: '4px' }}>TELEFON NUMARASI *</label>
                <input 
                  type="tel" 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)} 
                  placeholder="05xx xxx xx xx" 
                  required
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#1e293b', display: 'block', marginBottom: '4px' }}>ŞİFRE OLUŞTURUN *</label>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="En az 6 karakter" 
                required
                style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#1e293b', display: 'block', marginBottom: '6px' }}>İLGİ ALANLARINIZ * (Çoklu Seçilebilir)</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {availableInterests.map((cat) => (
                  <button 
                    type="button" 
                    key={cat} 
                    onClick={() => toggleInterest(cat)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '20px',
                      border: '1px solid',
                      borderColor: interests.includes(cat) ? '#0284c7' : '#cbd5e1',
                      background: interests.includes(cat) ? '#e0f2fe' : '#ffffff',
                      color: interests.includes(cat) ? '#0369a1' : '#64748b',
                      fontSize: '0.78rem',
                      fontWeight: '700',
                      cursor: 'pointer'
                    }}
                  >
                    {interests.includes(cat) ? '✓ ' : '+ '}{cat}
                  </button>
                ))}
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting}
              style={{ background: '#0b132b', color: 'white', padding: '12px', borderRadius: '6px', fontWeight: '700', fontSize: '0.92rem', border: 'none', cursor: 'pointer', marginTop: '8px' }}
            >
              {isSubmitting ? 'Üyelik Oluşturuluyor...' : 'Üyeliğimi Tamamla ve Giriş Yap'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
