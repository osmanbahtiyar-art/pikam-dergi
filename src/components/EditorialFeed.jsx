import React from 'react';
import { PIKAM_DATA } from '../data/pikamData';
import { Calendar, ArrowUpRight } from 'lucide-react';

export default function EditorialFeed({ activeCategory, articlesList, onSelectArticle }) {
  const rawArticles = articlesList && articlesList.length > 0 ? articlesList : PIKAM_DATA.articles;
  // Filter out hidden articles for site visitors
  const sourceArticles = rawArticles.filter(a => !a.hidden);

  const isAllCategory = activeCategory === 'TÜMÜ' || activeCategory === 'ANASAYFA' || activeCategory === 'KÜNYE' || activeCategory === 'E-DERGİ' || activeCategory === 'YAZARLAR';

  const filteredArticles = isAllCategory 
    ? sourceArticles 
    : sourceArticles.filter(a => a.category === activeCategory);

  const fallbackImage = 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=600&q=80';

  return (
    <section className="editorial-section">
      <div className="container">
        <div className="section-header">
          <div className="section-title">
            <span className="section-title-line"></span>
            <span>
              {isAllCategory ? 'SON EKLENEN MAKALE VE ANALİZLER' : `${activeCategory} KATEGORİSİ ANALİZLERİ`}
            </span>
          </div>
          <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '500' }}>
            Toplam {filteredArticles.length} Yayın Listeleniyor
          </span>
        </div>

        {filteredArticles.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', background: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <p style={{ fontSize: '1.1rem', color: '#64748b' }}>Bu kategoride henüz yayınlanmış makale bulunmamaktadır.</p>
          </div>
        ) : (
          <div className="editorial-grid">
            {filteredArticles.map((article) => {
              const imgUrl = (article.image && !article.image.startsWith('blob:')) ? article.image : fallbackImage;
              return (
                <article key={article.id} className="article-card" onClick={() => onSelectArticle(article)}>
                  <div className="article-img-wrap">
                    <img 
                      src={imgUrl} 
                      alt={article.title} 
                      className="article-img" 
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = fallbackImage;
                      }}
                    />
                    <span 
                      className="category-tag" 
                      style={{ 
                        position: 'absolute', 
                        top: '12px', 
                        left: '12px', 
                        backgroundColor: article.categoryColor || '#10b981'
                      }}
                    >
                      {article.category}
                    </span>
                  </div>

                  <div className="article-body">
                    <h3 className="article-title">{article.title}</h3>
                    <p className="article-excerpt">{article.excerpt}</p>

                    <div className="article-footer">
                      <div style={{ fontWeight: '600', color: '#1e293b' }}>
                        {typeof article.author === 'string' ? article.author : article.author?.name}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <Calendar size={11} /> {article.date || 'Bugün'}
                        </span>
                        <ArrowUpRight size={14} color="#64748b" />
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
