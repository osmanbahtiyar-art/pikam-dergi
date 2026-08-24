import React, { StrictMode, Component } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught UI Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ background: '#0b132b', color: 'white', minHeight: '100vh', padding: '40px 20px', textAlign: 'center', fontFamily: 'sans-serif', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <img src="/pikam_logo.png" alt="PİKAM Logo" style={{ width: '80px', marginBottom: '20px' }} />
          <h1 style={{ fontSize: '1.5rem', color: '#38bdf8', marginBottom: '10px' }}>PİKAM DERGİ YÜKLENİYOR...</h1>
          <p style={{ color: '#cbd5e1', fontSize: '0.95rem', maxWidth: '500px', margin: '0 auto 20px', lineHeight: '1.6' }}>
            Sayfa yüklenirken bir tarayıcı hafıza çakışması tespit edildi. Lütfen aşağıdaki butona basarak verileri tazeleyiniz.
          </p>
          <button 
            onClick={() => {
              try { localStorage.clear(); } catch (e) {}
              window.location.href = '/';
            }}
            style={{ background: '#10b981', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '6px', fontSize: '0.95rem', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Sayfayı Yenile ve Giriş Yap 🔄
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
