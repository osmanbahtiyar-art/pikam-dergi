import React, { useState } from 'react';
import { X, Calendar, Clock, Share2, Volume2, MessageSquare, ThumbsUp, Lock, UserCheck, Send } from 'lucide-react';

export default function ArticleModal({ article, currentUser, allCommentsList = [], onAddComment, onOpenAuthModal, onClose }) {
  const [fontSize, setFontSize] = useState(1.05); // rem
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(48);
  const [newCommentText, setNewCommentText] = useState("");

  if (!article) return null;

  // Filter comments specifically for this article (No fake comments!)
  const articleComments = allCommentsList.filter(c => c.articleId === article.id || c.article_id === article.id);

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
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>
          <X size={20} />
        </button>

        {/* ARTICLE HEADER */}
        <div className="article-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
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

          <h1 style={{ fontFamily: 'Playfair Display', fontSize: '2rem', color: '#0b132b', lineHeight: 1.25 }}>
            {article.title}
          </h1>

          {article.subtitle && (
            <p style={{ fontSize: '1.1rem', color: '#475569', marginTop: '10px', fontStyle: 'italic' }}>
              {article.subtitle}
            </p>
          )}

          {/* AUTHOR BAR & CONTROLS */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {article.author?.avatar && (
                <img src={article.author.avatar} alt={article.author.name} style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover' }} />
              )}
              <div>
                <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '0.95rem' }}>
                  {typeof article.author === 'string' ? article.author : article.author?.name}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                  {article.author?.title || 'PİKAM Kıdemli Analisti'}
                </div>
              </div>
            </div>

            {/* FONT CONTROLS & UTILS */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ display: 'flex', gap: '4px', background: '#f1f5f9', padding: '4px 8px', borderRadius: '4px' }}>
                <button 
                  onClick={() => setFontSize(Math.max(0.9, fontSize - 0.1))} 
                  style={{ fontWeight: '700', fontSize: '0.8rem', padding: '2px 6px', color: '#334155' }}
                  title="Metni Küçült"
                >
                  A-
                </button>
                <span style={{ color: '#cbd5e1' }}>|</span>
                <button 
                  onClick={() => setFontSize(Math.min(1.4, fontSize + 0.1))} 
                  style={{ fontWeight: '700', fontSize: '0.95rem', padding: '2px 6px', color: '#334155' }}
                  title="Metni Büyüt"
                >
                  A+
                </button>
              </div>

              <button 
                onClick={() => alert('Metin sesli okuma başlatıldı (Simülasyon).')} 
                style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#e0f2fe', color: '#0369a1', padding: '6px 12px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: '600' }}
              >
                <Volume2 size={15} />
                <span>Dinle</span>
              </button>

              <button 
                onClick={handleLike}
                style={{ display: 'flex', alignItems: 'center', gap: '4px', background: liked ? '#dcfce7' : '#f1f5f9', color: liked ? '#15803d' : '#334155', padding: '6px 12px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: '600' }}
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
        <div className="article-modal-body" style={{ fontSize: `${fontSize}rem` }}>
          {article.content ? (
            <div dangerouslySetInnerHTML={{ __html: article.content }} />
          ) : (
            <div>
              <p className="lead" style={{ fontWeight: '600', color: '#0f172a', marginBottom: '16px' }}>
                {article.excerpt}
              </p>
              <p>
                Politik ve İktisadi Araştırmalar Merkezi (PİKAM) tarafından hazırlanan bu çalışma, küresel konjonktürde yaşanan makroekonomik dalgalanmalar ile bölgesel jeopolitik gelişmeler arasındaki doğrudan etkileşimi analiz etmektedir.
              </p>
              <blockquote className="editorial-quote">
                "Uluslararası ilişkilerde ve iktisat politikalarında stratejik derinlik, ampirik veriler ile ulusal vizyonun sentezlenmesiyle mümkündür."
              </blockquote>
              <h3>Sonuç ve Değerlendirme</h3>
              <p>
                Gelecek dönem politikalarının şekillenmesinde kamusal ve akademik istişare kanallarının açık tutulması hayati önem taşımaktadır. PİKAM bu doğrultuda rapor ve analizlerini yayımlamaya devam edecektir.
              </p>
            </div>
          )}

          {/* SOCIAL SHARE IN TURKISH */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '40px', paddingTop: '20px', borderTop: '2px solid #0f172a' }}>
            <div style={{ fontWeight: '700', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Share2 size={16} />
              <span>BU ANALİZİ PAYLAŞIN:</span>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => alert('LinkedIn bağlantısı kopyalandı.')} style={{ background: '#0a66c2', color: 'white', padding: '6px 12px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: '600' }}>
                LinkedIn'de Paylaş
              </button>
              <button onClick={() => alert('X/Twitter bağlantısı kopyalandı.')} style={{ background: '#000000', color: 'white', padding: '6px 12px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: '600' }}>
                X'te Paylaş
              </button>
              <button onClick={() => alert('WhatsApp gönderim ekranı açıldı.')} style={{ background: '#25d366', color: 'white', padding: '6px 12px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: '600' }}>
                WhatsApp
              </button>
            </div>
          </div>

          {/* COMMENTS SECTION - GATED ONLY FOR LOGGED IN USERS */}
          <div style={{ marginTop: '40px', background: '#f8fafc', padding: '24px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontFamily: 'Playfair Display', fontSize: '1.25rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
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
