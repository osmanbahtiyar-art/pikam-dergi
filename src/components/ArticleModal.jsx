import React, { useState } from 'react';
import { X, Calendar, Clock, Share2, Volume2, Square, MessageSquare, ThumbsUp, Lock, UserCheck, Send, Check, Copy } from 'lucide-react';

export default function ArticleModal({ article, currentUser, allCommentsList = [], onAddComment, onOpenAuthModal, onClose }) {
  const [fontSize, setFontSize] = useState(1.05); // rem
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(48);
  const [newCommentText, setNewCommentText] = useState("");
  const [copySuccess, setCopySuccess] = useState(false);
  const [isPlayingSpeech, setIsPlayingSpeech] = useState(false);

  if (!article) return null;

  const handleToggleSpeech = () => {
    if (!('speechSynthesis' in window)) {
      alert('Tarayıcınız sesli okuma özelliğini desteklememektedir.');
      return;
    }

    if (isPlayingSpeech) {
      window.speechSynthesis.cancel();
      setIsPlayingSpeech(false);
      return;
    }

    window.speechSynthesis.cancel();

    const tempDiv = document.createElement('div');
    const rawText = article.content || article.excerpt || '';
    tempDiv.innerHTML = rawText;
    const cleanText = (tempDiv.textContent || tempDiv.innerText || rawText)
      .replace(/Politik ve İktisadi Araştırmalar Merkezi yayın kurulunca hazırlanan özel analiz\.?/gi, '')
      .trim();

    const fullTextToRead = `${article.title}. ${cleanText}`;

    const utterance = new SpeechSynthesisUtterance(fullTextToRead);
    utterance.lang = 'tr-TR';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const trVoice = voices.find(v => v.lang && v.lang.toLowerCase().includes('tr'));
    if (trVoice) {
      utterance.voice = trVoice;
    }

    utterance.onend = () => {
      setIsPlayingSpeech(false);
    };

    utterance.onerror = () => {
      setIsPlayingSpeech(false);
    };

    window.speechSynthesis.speak(utterance);
    setIsPlayingSpeech(true);
  };

  const handleCloseModal = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlayingSpeech(false);
    onClose();
  };

  // Filter comments specifically for this article (No fake comments!)
  const articleComments = allCommentsList.filter(c => c.articleId === article.id || c.article_id === article.id);

  const getArticleShareUrl = () => {
    return `${window.location.origin}/${article.id}`;
  };

  const handleShareWhatsApp = () => {
    const shareUrl = getArticleShareUrl();
    const text = encodeURIComponent(`"${article.title}" - PİKAM Dergi Analizini Okuyun:\n${shareUrl}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleShareTwitter = () => {
    const shareUrl = getArticleShareUrl();
    const text = encodeURIComponent(`"${article.title}" - PİKAM Dergi Analizi`);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(shareUrl)}`, '_blank');
  };

  const handleShareLinkedIn = () => {
    const shareUrl = getArticleShareUrl();
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank');
  };

  const handleCopyLink = () => {
    const shareUrl = getArticleShareUrl();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(shareUrl);
    } else {
      const textarea = document.createElement('textarea');
      textarea.value = shareUrl;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 4000);
  };

  const handleLike = () => {
    if (!liked) {
      setLiked(true);
      setLikeCount(likeCount + 1);
    } else {
      setLiked(false);
      setLikeCount(likeCount - 1);
    }
  };

  const handlePublishComment = (e) => {
    e.preventDefault();
    if (!newCommentText.trim() || !currentUser) return;

    const now = new Date();
    const formattedDate = `${now.toLocaleDateString('tr-TR')} ${now.toLocaleTimeString('tr-TR')}`;

    const commentObj = {
      id: `cmt-${Date.now()}`,
      articleId: article.id,
      article_id: article.id,
      articleTitle: article.title,
      article_title: article.title,
      authorName: currentUser.fullName,
      author_name: currentUser.fullName,
      authorEmail: currentUser.email,
      author_email: currentUser.email,
      commentText: newCommentText.trim(),
      comment_text: newCommentText.trim(),
      createdAt: formattedDate,
      created_at: formattedDate
    };

    if (onAddComment) {
      onAddComment(commentObj);
    }
    setNewCommentText("");
  };

  return (
    <div className="modal-backdrop" onClick={handleCloseModal}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={handleCloseModal}>
          <X size={20} />
        </button>

        {/* ARTICLE HEADER */}
        <div className="article-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', flexWrap: 'wrap' }}>
            <span className="category-tag" style={{ backgroundColor: article.categoryColor || '#10b981' }}>
              {article.category}
            </span>
            <span style={{ fontSize: '0.82rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Calendar size={13} /> {article.date}
            </span>
            <span style={{ fontSize: '0.82rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Clock size={13} /> {article.readTime || '6 Dakika'}
            </span>
          </div>

          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.85rem', color: '#0b132b', lineHeight: 1.25 }}>
            {article.title}
          </h1>

          {article.subtitle && (
            <p style={{ fontSize: '1.05rem', color: '#475569', marginTop: '10px', fontStyle: 'italic' }}>
              {article.subtitle}
            </p>
          )}

          {/* AUTHOR BAR & CONTROLS */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #e2e8f0', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {article.author?.avatar && (
                <img src={article.author.avatar} alt={article.author.name} style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover' }} />
              )}
              <div>
                <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '0.95rem' }}>
                  {typeof article.author === 'string' ? article.author : article.author?.name}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '600' }}>
                  Yazar
                </div>
              </div>
            </div>

            {/* FONT CONTROLS & UTILS */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ display: 'flex', gap: '4px', background: '#f1f5f9', padding: '4px 8px', borderRadius: '4px' }}>
                <button 
                  onClick={() => setFontSize(Math.max(0.9, fontSize - 0.1))} 
                  style={{ fontWeight: '700', fontSize: '0.8rem', padding: '2px 6px', color: '#334155', border: 'none', background: 'transparent', cursor: 'pointer' }}
                  title="Metni Küçült"
                >
                  A-
                </button>
                <span style={{ color: '#cbd5e1' }}>|</span>
                <button 
                  onClick={() => setFontSize(Math.min(1.4, fontSize + 0.1))} 
                  style={{ fontWeight: '700', fontSize: '0.95rem', padding: '2px 6px', color: '#334155', border: 'none', background: 'transparent', cursor: 'pointer' }}
                  title="Metni Büyüt"
                >
                  A+
                </button>
              </div>

              <button 
                onClick={handleToggleSpeech} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '6px', 
                  background: isPlayingSpeech ? '#fef2f2' : '#e0f2fe', 
                  color: isPlayingSpeech ? '#dc2626' : '#0369a1', 
                  border: isPlayingSpeech ? '1px solid #fca5a5' : '1px solid #bae6fd', 
                  cursor: 'pointer', 
                  padding: '6px 12px', 
                  borderRadius: '4px', 
                  fontSize: '0.8rem', 
                  fontWeight: '700',
                  transition: 'all 0.2s ease'
                }}
                title={isPlayingSpeech ? "Sesli Okumayı Durdur" : "Makaleyi Sesli Dinle"}
              >
                {isPlayingSpeech ? <Square size={15} color="#dc2626" /> : <Volume2 size={15} color="#0369a1" />}
                <span>{isPlayingSpeech ? 'Durdur' : 'Dinle'}</span>
              </button>

              <button 
                onClick={handleLike}
                style={{ display: 'flex', alignItems: 'center', gap: '4px', background: liked ? '#dcfce7' : '#f1f5f9', color: liked ? '#15803d' : '#334155', border: 'none', cursor: 'pointer', padding: '6px 12px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: '600' }}
              >
                <ThumbsUp size={15} />
                <span>{likeCount}</span>
              </button>
            </div>
          </div>
        </div>

        {/* ARTICLE FEATURED IMAGE */}
        <div style={{ padding: '0 32px', marginTop: '20px' }}>
          <img 
            src={article.image} 
            alt={article.title} 
            style={{ width: '100%', maxHeight: '420px', objectFit: 'cover', borderRadius: '6px' }} 
          />
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '6px', textAlign: 'right' }}>
            Görsel / Kaynak: PİKAM Medya Arşivi & Reuters
          </div>
        </div>

        {/* ARTICLE BODY */}
        <div className="article-modal-body" style={{ fontSize: `${fontSize}rem`, whiteSpace: 'pre-line' }}>
          {article.content ? (
            <div dangerouslySetInnerHTML={{ __html: String(article.content).replace(/<p>\s*Politik ve İktisadi Araştırmalar Merkezi yayın kurulunca hazırlanan özel analiz\.?\s*<\/p>|Politik ve İktisadi Araştırmalar Merkezi yayın kurulunca hazırlanan özel analiz\.?/gi, '').trim() }} />
          ) : (
            <div>
              {String(article.excerpt || '').replace(/Politik ve İktisadi Araştırmalar Merkezi yayın kurulunca hazırlanan özel analiz\.?/gi, '').trim().split(/\n\s*\n/).map((p, pIdx) => (
                <p key={pIdx} style={{ marginBottom: '1.4rem', lineHeight: '1.8' }}>
                  {p}
                </p>
              ))}
            </div>
          )}

          {/* REAL SOCIAL SHARE WITH DIRECT ARTICLE DEEP LINK */}
          <div style={{ marginTop: '40px', paddingTop: '20px', borderTop: '2px solid #0f172a' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ fontWeight: '700', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.95rem' }}>
                <Share2 size={18} color="#0284c7" />
                <span>BU MAKALEYİ DOĞRUDAN LİNK İLE PAYLAŞIN:</span>
              </div>

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button 
                  onClick={handleShareWhatsApp} 
                  style={{ background: '#25d366', color: 'white', border: 'none', cursor: 'pointer', padding: '8px 14px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.81 9.81 0 0 0 12.04 2zm.01 1.67c4.54 0 8.24 3.7 8.24 8.24 0 2.2-.86 4.27-2.42 5.82a8.17 8.17 0 0 1-5.82 2.41c-1.45 0-2.88-.38-4.14-1.12l-.3-.18-3.1.81.83-3.02-.19-.31A8.2 8.2 0 0 1 3.8 11.91c0-4.54 3.7-8.24 8.25-8.24zm4.53 11.45c-.25-.13-1.47-.73-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.98-.14.17-.29.19-.54.06-.25-.13-1.05-.39-2-1.23-.74-.66-1.24-1.48-1.38-1.73-.15-.25-.02-.38.11-.51.11-.11.25-.29.38-.44.13-.14.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.35-.77-1.85-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.13.17 1.77 2.7 4.29 3.79.6.26 1.07.41 1.44.53.6.19 1.15.16 1.58.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.11-.23-.17-.48-.3z"/>
                  </svg>
                  <span>WhatsApp</span>
                </button>
                <button 
                  onClick={handleShareTwitter} 
                  style={{ background: '#000000', color: 'white', border: 'none', cursor: 'pointer', padding: '8px 14px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                  <span>X (Twitter)</span>
                </button>
                <button 
                  onClick={handleShareLinkedIn} 
                  style={{ background: '#0a66c2', color: 'white', border: 'none', cursor: 'pointer', padding: '8px 14px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
                  </svg>
                  <span>LinkedIn</span>
                </button>
                <button 
                  onClick={handleCopyLink} 
                  style={{ background: copySuccess ? '#16a34a' : '#0b132b', color: 'white', border: 'none', cursor: 'pointer', padding: '8px 14px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  {copySuccess ? <Check size={16} /> : <Copy size={16} />}
                  <span>{copySuccess ? 'Link Kopyalandı!' : 'Linki Kopyala'}</span>
                </button>
              </div>
            </div>

            {/* DIRECT ARTICLE LINK BOX */}
            <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', marginTop: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
              <div style={{ fontSize: '0.8rem', color: '#475569', wordBreak: 'break-all' }}>
                <strong style={{ color: '#0f172a' }}>Makale Bağlantısı:</strong> {getArticleShareUrl()}
              </div>
              <button 
                onClick={handleCopyLink} 
                style={{ background: '#e2e8f0', color: '#334155', border: 'none', cursor: 'pointer', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '700', whiteSpace: 'nowrap' }}
              >
                {copySuccess ? '✓ Kopyalandı' : 'Kopyala'}
              </button>
            </div>
          </div>

          {/* COMMENTS SECTION - GATED ONLY FOR LOGGED IN USERS */}
          <div style={{ marginTop: '40px', background: '#f8fafc', padding: '24px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.25rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <MessageSquare size={18} color="#0284c7" />
              <span>Gerçek Okuyucu Değerlendirmeleri ({articleComments.length})</span>
            </h3>

            {articleComments.length === 0 ? (
              <div style={{ background: '#ffffff', padding: '20px', borderRadius: '6px', border: '1px solid #e2e8f0', textAlign: 'center', color: '#64748b', fontSize: '0.88rem', marginBottom: '20px' }}>
                Bu makaleye henüz okuyucu yorumu yapılmamıştır. İlk yorumu siz yazın!
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
                {articleComments.map((c) => (
                  <div key={c.id} style={{ background: '#ffffff', padding: '14px 18px', borderRadius: '6px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontWeight: '700', fontSize: '0.88rem', color: '#0f172a' }}>{c.authorName || c.author_name}</span>
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{c.createdAt || c.created_at}</span>
                    </div>
                    <p style={{ fontSize: '0.9rem', color: '#334155', margin: 0, lineHeight: '1.5' }}>{c.commentText || c.comment_text}</p>
                  </div>
                ))}
              </div>
            )}

            {/* ADD COMMENT FORM - EXCLUSIVELY GATED FOR LOGGED-IN REGISTERED MEMBERS */}
            {currentUser ? (
              <form onSubmit={handlePublishComment} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#15803d', background: '#dcfce7', padding: '8px 14px', borderRadius: '6px', fontSize: '0.82rem', fontWeight: '600' }}>
                  <UserCheck size={16} />
                  <span>Giriş Yapan Üye: <strong>{currentUser.fullName}</strong> ({currentUser.email})</span>
                </div>

                <textarea 
                  placeholder="Akademik değerlendirme veya görüşünüzü yazın..." 
                  rows="3" 
                  value={newCommentText} 
                  onChange={(e) => setNewCommentText(e.target.value)} 
                  required
                  style={{ padding: '12px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem', fontFamily: 'inherit' }}
                ></textarea>

                <button 
                  type="submit" 
                  style={{ background: '#0b132b', color: 'white', padding: '10px 20px', borderRadius: '6px', fontWeight: '700', fontSize: '0.88rem', alignSelf: 'flex-start', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Send size={14} color="#38bdf8" /> Değerlendirmeyi Gönder ve Yayınla
                </button>
              </form>
            ) : (
              <div style={{ background: '#fef3c7', border: '1px solid #fde68a', borderRadius: '8px', padding: '24px', textAlign: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#92400e', fontWeight: '700', fontSize: '0.95rem', marginBottom: '6px' }}>
                  <Lock size={18} />
                  <span>YORUM YAPABİLMEK İÇİN ÜYE GİRİŞİ YAPMALISINIZ</span>
                </div>
                <p style={{ fontSize: '0.85rem', color: '#78350f', marginBottom: '16px' }}>
                  Makalelere değerlendirme yazabilmek için kayıtlı PİKAM okuyucusu olmanız gerekmektedir. Üyelik tamamen ücretsizdir.
                </p>
                <button 
                  onClick={onOpenAuthModal}
                  style={{ background: '#0b132b', color: 'white', padding: '10px 24px', borderRadius: '6px', fontWeight: '700', fontSize: '0.88rem', border: 'none', cursor: 'pointer' }}
                >
                  Giriş Yap / Ücretsiz Üye Ol
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
