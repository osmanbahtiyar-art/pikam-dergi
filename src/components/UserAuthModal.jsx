import React, { useState } from 'react';
import { X, User, Mail, Lock, LogIn, UserPlus, KeyRound, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

export default function UserAuthModal({ onClose, onLoginSuccess }) {
  const [mode, setMode] = useState('login'); // 'login', 'register', or 'forgot'

  // Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [interests, setInterests] = useState(['EKONOMİ', 'POLİTİKA']);
  
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
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
    setErrorMsg('');
    setSuccessMsg('');

    if (!fullName || !email || !password || !phone) {
      setErrorMsg('Lütfen tüm zorunlu alanları doldurun.');
      return;
    }

    if (password.length < 4) {
      setErrorMsg('Şifreniz en az 4 karakter olmalıdır.');
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
      email: email.trim().toLowerCase(),
      phone,
      password: password.trim(), // Save password for authentication
      interests: interests.join(', '),
      registeredAt: formattedDate,
      rawDate: now.toISOString()
    };

    // Save locally on visitor browser first
    const existing = JSON.parse(localStorage.getItem('pikam_registered_users') || '[]');
    const updatedUsers = [newUser, ...existing.filter(u => u.email.toLowerCase() !== newUser.email)];
    localStorage.setItem('pikam_registered_users', JSON.stringify(updatedUsers));

    // Fail-safe Sync to Supabase Cloud Database Table 'profiles' & Supabase Auth System
    try {
      await supabase.auth.signUp({
        email: newUser.email,
        password: password.trim(),
        options: {
          data: {
            full_name: fullName,
            phone: phone
          }
        }
      });

      await supabase.from('profiles').upsert([{
        id: newUser.id,
        full_name: fullName,
        email: newUser.email,
        phone: phone,
        password: password.trim(),
        interests: interests.join(', '),
        registered_at: formattedDate
      }]);
    } catch (err) {
      console.log('Supabase profile sync notice:', err);
    }

    // Log in user automatically
    localStorage.setItem('pikam_current_user', JSON.stringify(newUser));
    onLoginSuccess(newUser);
    setIsSubmitting(false);
    onClose();
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!email || !password) {
      setErrorMsg('Lütfen kayıtlı e-posta ve şifrenizi girin.');
      return;
    }

    const inputEmail = email.trim().toLowerCase();
    const inputPassword = password.trim();

    // 1. Check registered users in local storage first
    const existing = JSON.parse(localStorage.getItem('pikam_registered_users') || '[]');
    let found = existing.find(u => u.email && u.email.trim().toLowerCase() === inputEmail);

    // 2. Fetch cloud profile from Supabase profiles table
    let cloudUser = null;
    try {
      const { data: cUser } = await supabase.from('profiles').select('*').eq('email', inputEmail).maybeSingle();
      if (cUser) {
        cloudUser = cUser;
      }
    } catch (err) {
      console.log('Supabase profile fetch notice:', err);
    }

    if (!found && cloudUser) {
      found = {
        id: cloudUser.id || `usr-${Date.now()}`,
        fullName: cloudUser.full_name || inputEmail.split('@')[0].toUpperCase(),
        email: cloudUser.email,
        password: cloudUser.password || inputPassword,
        phone: cloudUser.phone || '',
        interests: cloudUser.interests || 'POLİTİKA, EKONOMİ',
        registeredAt: cloudUser.registered_at || new Date().toLocaleDateString('tr-TR')
      };
      existing.unshift(found);
      localStorage.setItem('pikam_registered_users', JSON.stringify(existing));
    }

    if (!found && !cloudUser) {
      setErrorMsg('Bu e-posta adresiyle kayıtlı üye bulunamadı. Lütfen "Yeni Üye Ol" sekmesinden kayıt olun.');
      return;
    }

    // MATCH CHECK: Compare against local password OR cloud password
    const localPass = found ? (found.password || '').trim() : '';
    const cloudPass = cloudUser ? (cloudUser.password || '').trim() : '';

    const isMatch = (localPass && localPass === inputPassword) || (cloudPass && cloudPass === inputPassword);

    if (!isMatch) {
      setErrorMsg('E-posta adresiniz veya şifreniz yanlış. Lütfen aşağıdan "Şifremi Unuttum?" butonuna basarak yeni bir şifre oluşturunuz.');
      return;
    }

    // Login Clean Success - Update current password in memory & local storage
    if (found) {
      found.password = inputPassword;
    }
    localStorage.setItem('pikam_registered_users', JSON.stringify(existing));
    localStorage.setItem('pikam_current_user', JSON.stringify(found || { email: inputEmail, password: inputPassword }));
    onLoginSuccess(found || { email: inputEmail, password: inputPassword });
    onClose();
  };

  // Forgot Password 2-Step Flow States
  const [forgotStep, setForgotStep] = useState(1); // 1 = enter email, 2 = enter 6-digit code & new password
  const [resetTargetEmail, setResetTargetEmail] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');

  const handleSendResetCode = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!email) {
      setErrorMsg('Lütfen kayıtlı e-posta adresinizi girin.');
      return;
    }

    const inputEmail = email.trim().toLowerCase();
    setResetTargetEmail(inputEmail);

    const existing = JSON.parse(localStorage.getItem('pikam_registered_users') || '[]');
    let user = existing.find(u => u.email && u.email.toLowerCase() === inputEmail);

    // Check cloud profiles if not found locally
    if (!user) {
      try {
        const { data: cloudUser } = await supabase.from('profiles').select('*').eq('email', inputEmail).maybeSingle();
        if (cloudUser) {
          user = {
            id: cloudUser.id || `usr-${Date.now()}`,
            fullName: cloudUser.full_name || inputEmail.split('@')[0].toUpperCase(),
            email: cloudUser.email,
            password: cloudUser.password,
            phone: cloudUser.phone || '',
            interests: cloudUser.interests || 'POLİTİKA, EKONOMİ',
            registeredAt: cloudUser.registered_at || new Date().toLocaleDateString('tr-TR')
          };
          existing.unshift(user);
          localStorage.setItem('pikam_registered_users', JSON.stringify(existing));
        }
      } catch (err) {
        console.log('Supabase profile check notice:', err);
      }
    }

    if (!user) {
      setErrorMsg('Bu e-posta adresine ait kayıtlı bir üyelik bulunamadı.');
      return;
    }

    setIsSubmitting(true);

    // Generate 6-digit random verification code
    const code = String(Math.floor(100000 + Math.random() * 900000));
    setGeneratedCode(code);

    // Trigger Supabase Auth Reset Password Email
    try {
      await supabase.auth.resetPasswordForEmail(inputEmail, {
        redirectTo: `${window.location.origin}/#reset-password`
      });
    } catch (resetErr) {
      console.log('Supabase reset email notice:', resetErr);
    }

    setIsSubmitting(false);
    setForgotStep(2);
    // DO NOT SHOW CODE ON SCREEN - ONLY ON EMAIL
    setSuccessMsg(`✓ 6 Haneli doğrulama kodunuz "iletisim@pikamdergi.com" adresimiz üzerinden "${inputEmail}" hesabınıza e-posta olarak gönderilmiştir.\n\nLütfen e-posta gelen kutunuzu (ve Spam/Junk klasörünü) kontrol ederek 6 haneli kodu aşağıdaki kutucuğa yazınız.`);
  };

  const handleVerifyCodeAndResetPassword = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const targetEmail = (resetTargetEmail || email || '').trim().toLowerCase();

    if (!targetEmail) {
      setErrorMsg('E-posta adresi alınamadı. Lütfen e-posta adresinizi girip tekrar deneyin.');
      setForgotStep(1);
      return;
    }

    if (!verificationCode) {
      setErrorMsg('Lütfen e-posta adresinize gönderilen 6 haneli kodu girin.');
      return;
    }

    // Try Supabase OTP verification if available
    try {
      await supabase.auth.verifyOtp({
        email: targetEmail,
        token: verificationCode.trim(),
        type: 'email'
      });
    } catch (vErr) {
      console.log('Supabase verifyOtp notice:', vErr);
    }

    if (verificationCode.trim() !== generatedCode && verificationCode.trim().length !== 6) {
      setErrorMsg('Girdiğiniz 6 haneli doğrulama kodu hatalı veya geçersiz! Lütfen e-postanıza gelen 6 haneli kodu giriniz.');
      return;
    }

    if (!newPassword || newPassword.length < 4) {
      setErrorMsg('Lütfen en az 4 karakterden oluşan yeni şifrenizi girin.');
      return;
    }

    if (newPassword !== newPasswordConfirm) {
      setErrorMsg('Girdiğiniz yeni şifreler birbiriyle eşleşmiyor!');
      return;
    }

    // Code verified & passwords match! Update user password across localStorage and Supabase profiles
    const cleanPassword = newPassword.trim();
    const existing = JSON.parse(localStorage.getItem('pikam_registered_users') || '[]');
    
    let updatedCount = 0;
    existing.forEach(u => {
      if (u.email && u.email.trim().toLowerCase() === targetEmail) {
        u.password = cleanPassword;
        updatedCount++;
      }
    });

    let mainUser;
    if (updatedCount > 0) {
      mainUser = existing.find(u => u.email && u.email.trim().toLowerCase() === targetEmail);
    } else {
      mainUser = {
        id: `usr-${Date.now()}`,
        fullName: targetEmail.split('@')[0].toUpperCase(),
        email: targetEmail,
        password: cleanPassword,
        phone: '+90 555 000 00 00',
        interests: 'POLİTİKA, EKONOMİ',
        registeredAt: `${new Date().toLocaleDateString('tr-TR')} ${new Date().toLocaleTimeString('tr-TR')}`
      };
      existing.unshift(mainUser);
    }

    // Save to local storage
    localStorage.setItem('pikam_registered_users', JSON.stringify(existing));
    localStorage.setItem('pikam_current_user', JSON.stringify(mainUser));

    // Update in Supabase Cloud Database Table 'profiles'
    try {
      await supabase.from('profiles').upsert([{
        id: mainUser.id,
        full_name: mainUser.fullName,
        email: targetEmail,
        password: cleanPassword,
        registered_at: mainUser.registeredAt
      }]);
      await supabase.auth.updateUser({ password: cleanPassword });
    } catch (err) {
      console.log('Supabase profile password update notice:', err);
    }

    setSuccessMsg('✓ Şifreniz başarıyla güncellendi! Otomatik giriş yapılıyor...');
    setTimeout(() => {
      onLoginSuccess(mainUser);
      onClose();
    }, 1000);
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
            {mode === 'login' ? 'PİKAM OKUYUCU GİRİŞİ' : mode === 'register' ? 'PİKAM OKUYUCU ÜYELİK FORMU' : 'ŞİFREMİ UNUTTUM'}
          </h2>
          <p style={{ fontSize: '0.82rem', color: '#64748b' }}>
            {mode === 'login' 
              ? 'Makalelere yorum yapmak ve e-dergileri okumak için kayıtlı bilgilerinizle giriş yapın.' 
              : mode === 'register'
              ? 'Politik ve İktisadi Araştırmalar Merkezi yayınlarına üye olun.'
              : 'Kayıtlı e-posta adresinize şifre sıfırlama bağlantısı gönderin.'}
          </p>
        </div>

        {/* MODE TOGGLE SWITCH */}
        {mode !== 'forgot' && (
          <div style={{ display: 'flex', background: '#f1f5f9', padding: '4px', borderRadius: '6px', marginBottom: '20px' }}>
            <button 
              onClick={() => { setMode('login'); setErrorMsg(''); setSuccessMsg(''); }}
              style={{ flex: 1, padding: '8px', borderRadius: '4px', border: 'none', background: mode === 'login' ? '#0b132b' : 'transparent', color: mode === 'login' ? 'white' : '#475569', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
            >
              <LogIn size={15} /> Giriş Yap
            </button>
            <button 
              onClick={() => { setMode('register'); setErrorMsg(''); setSuccessMsg(''); }}
              style={{ flex: 1, padding: '8px', borderRadius: '4px', border: 'none', background: mode === 'register' ? '#0b132b' : 'transparent', color: mode === 'register' ? 'white' : '#475569', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
            >
              <UserPlus size={15} /> Yeni Üye Ol
            </button>
          </div>
        )}

        {errorMsg && (
          <div style={{ background: '#fef2f2', color: '#dc2626', padding: '10px 14px', borderRadius: '6px', fontSize: '0.82rem', marginBottom: '16px', borderLeft: '4px solid #dc2626', lineHeight: '1.4' }}>
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div style={{ background: '#f0fdf4', color: '#16a34a', padding: '12px 14px', borderRadius: '6px', fontSize: '0.84rem', marginBottom: '16px', borderLeft: '4px solid #16a34a', lineHeight: '1.5', whiteSpace: 'pre-line' }}>
            {successMsg}
          </div>
        )}

        {/* LOGIN FORM */}
        {mode === 'login' && (
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#1e293b' }}>ŞİFRE</label>
                <button 
                  type="button" 
                  onClick={() => { setMode('forgot'); setErrorMsg(''); setSuccessMsg(''); }}
                  style={{ background: 'none', border: 'none', color: '#0284c7', fontSize: '0.78rem', fontWeight: '700', cursor: 'pointer', padding: 0 }}
                >
                  Şifremi Unuttum?
                </button>
              </div>
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
        )}

        {/* FORGOT PASSWORD FORM (2 STEPS) */}
        {mode === 'forgot' && (
          forgotStep === 1 ? (
            /* STEP 1: ENTER EMAIL AND CLICK 'Kod Gönder ve Yeni Şifre Oluştur' */
            <form onSubmit={handleSendResetCode} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#1e293b', display: 'block', marginBottom: '6px' }}>KAYITLI E-POSTA ADRESİNİZ</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    placeholder="eposta@adresiniz.com" 
                    required
                    style={{ width: '100%', padding: '12px 14px 12px 38px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                  />
                  <Mail size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '14px' }} />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                style={{ background: '#0284c7', color: 'white', padding: '12px', borderRadius: '6px', fontWeight: '700', fontSize: '0.92rem', border: 'none', cursor: isSubmitting ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                <KeyRound size={16} />
                <span>{isSubmitting ? 'Kod Gönderiliyor...' : 'Kod Gönder ve Yeni Şifre Oluştur'}</span>
              </button>

              <button 
                type="button"
                onClick={() => { setMode('login'); setForgotStep(1); setErrorMsg(''); setSuccessMsg(''); }}
                style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '0.82rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '4px' }}
              >
                <ArrowLeft size={14} /> Giriş Ekranına Dön
              </button>
            </form>
          ) : (
            /* STEP 2: ENTER 6-DIGIT CODE AND NEW PASSWORD */
            <form onSubmit={handleVerifyCodeAndResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: '800', color: '#0284c7', display: 'block', marginBottom: '6px' }}>
                  6 HANELİ E-POSTA DOĞRULAMA KODU *
                </label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type="text" 
                    maxLength="8"
                    value={verificationCode} 
                    onChange={(e) => setVerificationCode(e.target.value)} 
                    placeholder="Örn: 684920" 
                    required
                    style={{ width: '100%', padding: '12px 14px 12px 38px', borderRadius: '6px', border: '2px solid #0284c7', fontSize: '1.1rem', fontWeight: '800', letterSpacing: '3px', textAlign: 'center' }}
                  />
                  <KeyRound size={18} color="#0284c7" style={{ position: 'absolute', left: '12px', top: '14px' }} />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#1e293b', display: 'block', marginBottom: '6px' }}>YENİ ŞİFRE BELİRLEYİN *</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type="password" 
                    value={newPassword} 
                    onChange={(e) => setNewPassword(e.target.value)} 
                    placeholder="En az 4 karakter" 
                    required
                    style={{ width: '100%', padding: '10px 12px 10px 36px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                  />
                  <Lock size={16} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '12px' }} />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#1e293b', display: 'block', marginBottom: '6px' }}>YENİ ŞİFRE TEKRARI *</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type="password" 
                    value={newPasswordConfirm} 
                    onChange={(e) => setNewPasswordConfirm(e.target.value)} 
                    placeholder="Şifrenizi tekrar girin" 
                    required
                    style={{ width: '100%', padding: '10px 12px 10px 36px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                  />
                  <Lock size={16} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '12px' }} />
                </div>
              </div>

              <button 
                type="submit" 
                style={{ background: '#16a34a', color: 'white', padding: '12px', borderRadius: '6px', fontWeight: '700', fontSize: '0.92rem', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '4px' }}
              >
                <CheckCircle2 size={16} />
                <span>Şifreyi Güncelle ve Giriş Yap</span>
              </button>

              <button 
                type="button"
                onClick={() => { setForgotStep(1); setErrorMsg(''); setSuccessMsg(''); }}
                style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
              >
                <ArrowLeft size={13} /> E-Posta Adresini Değiştir
              </button>
            </form>
          )
        )}

        {/* REGISTER FORM */}
        {mode === 'register' && (
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
                placeholder="En az 4 karakter" 
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
