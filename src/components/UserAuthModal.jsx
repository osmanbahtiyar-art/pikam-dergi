import React, { useState } from 'react';
import { X, User, Mail, Lock, LogIn, UserPlus, KeyRound, ArrowLeft, CheckCircle2, Phone } from 'lucide-react';
import { isCloudEnabled } from '../lib/supabaseClient';
import { signIn, signUp, sendPasswordReset, profileFromSession } from '../lib/db';

const INTERESTS = ['EKONOMİ', 'POLİTİKA', 'STRATEJİ', 'TEKNOLOJİ', 'DÜNYA'];

const translateError = (err) => {
  const msg = (err?.message || '').toLowerCase();
  if (msg.includes('invalid login')) return 'E-posta veya şifre hatalı.';
  if (msg.includes('email not confirmed')) return 'E-posta adresiniz henüz doğrulanmadı. Gelen kutunuzdaki doğrulama bağlantısına tıklayın.';
  if (msg.includes('already registered')) return 'Bu e-posta ile zaten bir hesap var. Giriş yapmayı deneyin.';
  if (msg.includes('password')) return 'Şifre en az 6 karakter olmalıdır.';
  if (msg.includes('rate limit')) return 'Çok fazla deneme yapıldı. Lütfen birkaç dakika sonra tekrar deneyin.';
  return err?.message || 'Bir hata oluştu. Lütfen tekrar deneyin.';
};

const inputStyle = { width: '100%', padding: '10px 12px 10px 36px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' };
const iconStyle = { position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' };
const labelStyle = { fontSize: '0.78rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: 5 };

function Field({ icon: Icon, label, ...props }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <div style={{ position: 'relative' }}>
        <Icon size={15} style={iconStyle} />
        <input {...props} style={inputStyle} />
      </div>
    </div>
  );
}

export default function UserAuthModal({ onClose, onLoginSuccess }) {
  const [mode, setMode] = useState('login'); // login | register | forgot
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [phone, setPhone] = useState('');
  const [interests, setInterests] = useState(['EKONOMİ', 'POLİTİKA']);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [busy, setBusy] = useState(false);

  const switchMode = (m) => {
    setMode(m);
    setErrorMsg('');
    setSuccessMsg('');
  };

  const run = async (fn) => {
    setErrorMsg('');
    setSuccessMsg('');
    setBusy(true);
    try {
      await fn();
    } catch (err) {
      setErrorMsg(translateError(err));
    } finally {
      setBusy(false);
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    run(async () => {
      const { session } = await signIn(email, password);
      onLoginSuccess?.(profileFromSession(session));
      onClose();
    });
  };

  const handleRegister = (e) => {
    e.preventDefault();
    if (password !== password2) {
      setErrorMsg('Şifreler eşleşmiyor.');
      return;
    }
    run(async () => {
      const { session } = await signUp({ email, password, fullName, phone, interests: interests.join(', ') });
      if (session) {
        onLoginSuccess?.(profileFromSession(session));
        onClose();
      } else {
        setSuccessMsg(`Kaydınız alındı. ${email} adresine gönderilen doğrulama bağlantısına tıkladıktan sonra giriş yapabilirsiniz.`);
        setMode('login');
      }
    });
  };

  const handleForgot = (e) => {
    e.preventDefault();
    run(async () => {
      await sendPasswordReset(email);
      setSuccessMsg(`Şifre sıfırlama bağlantısı ${email} adresine gönderildi.`);
    });
  };

  const titles = {
    login: ['Üye Girişi', 'Yorum yapmak için hesabınıza giriş yapın.'],
    register: ['Yeni Üyelik', 'PİKAM Dergi okur topluluğuna katılın.'],
    forgot: ['Şifremi Unuttum', 'Kayıtlı e-posta adresinize sıfırlama bağlantısı gönderelim.'],
  };

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(11,19,43,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ background: '#fff', borderRadius: 10, width: '100%', maxWidth: 440, maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }}
      >
        <div style={{ background: '#0b132b', color: '#fff', padding: '18px 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderRadius: '10px 10px 0 0' }}>
          <div>
            <h2 style={{ margin: 0, fontFamily: 'Playfair Display, serif', fontSize: '1.25rem' }}>{titles[mode][0]}</h2>
            <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>{titles[mode][1]}</p>
          </div>
          <button onClick={onClose} aria-label="Kapat" style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {!isCloudEnabled && (
            <div style={{ background: '#fffbeb', border: '1px solid #fcd34d', color: '#92400e', padding: 10, borderRadius: 6, fontSize: '0.82rem' }}>
              Üyelik sistemi şu anda bakımda. Lütfen daha sonra tekrar deneyin.
            </div>
          )}
          {errorMsg && (
            <div style={{ background: '#fef2f2', borderLeft: '4px solid #ef4444', color: '#b91c1c', padding: '9px 12px', borderRadius: 4, fontSize: '0.84rem' }}>{errorMsg}</div>
          )}
          {successMsg && (
            <div style={{ background: '#ecfdf5', borderLeft: '4px solid #10b981', color: '#047857', padding: '9px 12px', borderRadius: 4, fontSize: '0.84rem', display: 'flex', gap: 8 }}>
              <CheckCircle2 size={16} style={{ flexShrink: 0, marginTop: 2 }} />
              <span>{successMsg}</span>
            </div>
          )}

          {mode === 'login' && (
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <Field icon={Mail} label="E-POSTA" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
              <Field icon={Lock} label="ŞİFRE" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
              <button type="submit" disabled={busy || !isCloudEnabled} style={btn(busy)}>
                <LogIn size={16} /> {busy ? 'Giriş yapılıyor…' : 'Giriş Yap'}
              </button>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                <button type="button" onClick={() => switchMode('forgot')} style={linkBtn}>
                  <KeyRound size={13} /> Şifremi unuttum
                </button>
                <button type="button" onClick={() => switchMode('register')} style={linkBtn}>
                  <UserPlus size={13} /> Hesap oluştur
                </button>
              </div>
            </form>
          )}

          {mode === 'register' && (
            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Field icon={User} label="AD SOYAD" value={fullName} onChange={(e) => setFullName(e.target.value)} required autoComplete="name" />
              <Field icon={Mail} label="E-POSTA" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
              <Field icon={Phone} label="TELEFON (İSTEĞE BAĞLI)" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" />
              <Field icon={Lock} label="ŞİFRE (EN AZ 6 KARAKTER)" type="password" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="new-password" />
              <Field icon={Lock} label="ŞİFRE TEKRAR" type="password" minLength={6} value={password2} onChange={(e) => setPassword2(e.target.value)} required autoComplete="new-password" />
              <div>
                <label style={labelStyle}>İLGİ ALANLARI</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {INTERESTS.map((c) => {
                    const on = interests.includes(c);
                    return (
                      <button
                        type="button"
                        key={c}
                        onClick={() => setInterests(on ? interests.filter((i) => i !== c) : [...interests, c])}
                        style={{ padding: '5px 10px', borderRadius: 999, fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', border: `1px solid ${on ? '#0284c7' : '#cbd5e1'}`, background: on ? '#e0f2fe' : '#fff', color: on ? '#0369a1' : '#64748b' }}
                      >
                        {c}
                      </button>
                    );
                  })}
                </div>
              </div>
              <button type="submit" disabled={busy || !isCloudEnabled} style={btn(busy)}>
                <UserPlus size={16} /> {busy ? 'Kaydediliyor…' : 'Kayıt Ol'}
              </button>
              <button type="button" onClick={() => switchMode('login')} style={{ ...linkBtn, justifyContent: 'center' }}>
                <ArrowLeft size={13} /> Zaten hesabım var
              </button>
            </form>
          )}

          {mode === 'forgot' && (
            <form onSubmit={handleForgot} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <Field icon={Mail} label="E-POSTA" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
              <button type="submit" disabled={busy || !isCloudEnabled} style={btn(busy)}>
                <KeyRound size={16} /> {busy ? 'Gönderiliyor…' : 'Sıfırlama Bağlantısı Gönder'}
              </button>
              <button type="button" onClick={() => switchMode('login')} style={{ ...linkBtn, justifyContent: 'center' }}>
                <ArrowLeft size={13} /> Girişe dön
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

const btn = (busy) => ({
  background: busy ? '#334155' : '#0b132b',
  color: '#fff',
  padding: 12,
  borderRadius: 6,
  fontWeight: 700,
  fontSize: '0.92rem',
  border: 'none',
  cursor: busy ? 'wait' : 'pointer',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: 8,
});

const linkBtn = { background: 'none', border: 'none', color: '#0284c7', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.82rem', padding: 0 };
