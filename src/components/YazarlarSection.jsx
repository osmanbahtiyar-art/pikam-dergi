import React, { useState } from 'react';
import { PIKAM_DATA } from '../data/pikamData';
import { Feather, ChevronDown, ChevronUp } from 'lucide-react';

function AuthorCard({ author, fallbackAvatar, onSelectAuthor }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const avatarUrl = (author.avatar && !author.avatar.startsWith('blob:')) ? author.avatar : fallbackAvatar;
  const aboutText = author.latestArticle || author.bio || '';
  const isLong = aboutText.length > 200;

  const displayText = (!isExpanded && isLong) 
    ? `${aboutText.slice(0, 200)}...` 
    : aboutText;

  return (
    <div 
      className="yazar-card" 
      onClick={() => onSelectAuthor && onSelectAuthor(author)}
      style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
    >
      <img 
        src={avatarUrl} 
        alt={author.name} 
        className="yazar-avatar" 
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = fallbackAvatar;
        }}
      />
      <h4 className="yazar-name">{author.name}</h4>
      <p className="yazar-role">{author.role}</p>
      <div style={{ fontSize: '0.72rem', color: '#38bdf8', fontWeight: '600', textTransform: 'uppercase', marginBottom: '8px' }}>
        {author.affiliation || 'PİKAM Kıdemli Analisti'}
      </div>

      {aboutText && (
        <div className="yazar-latest" style={{ flex: 1, fontSize: '0.84rem', color: '#cbd5e1', lineHeight: '1.6', fontStyle: 'normal', marginTop: '6px' }}>
          <span>{displayText}</span>

          {isLong && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                marginTop: '8px',
                background: 'rgba(56, 189, 248, 0.12)',
                color: '#38bdf8',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                padding: '4px 10px',
                borderRadius: '4px',
                fontSize: '0.76rem',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {isExpanded ? (
                <><span>Daha Az Göster</span> <ChevronUp size={12} /></>
              ) : (
                <><span>Devamını Oku</span> <ChevronDown size={12} /></>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function YazarlarSection({ id, authorsList, onSelectAuthor }) {
  const sourceAuthors = authorsList && authorsList.length > 0 ? authorsList : PIKAM_DATA.authors;
  const fallbackAvatar = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80';

  return (
    <section className="yazarlar-bg" id={id}>
      <div className="container">
        <div className="section-header" style={{ borderBottomColor: '#38bdf8' }}>
          <div className="section-title" style={{ color: '#ffffff' }}>
            <Feather size={22} color="#38bdf8" />
            <span>EKİBİMİZ</span>
          </div>
        </div>

        <div className="yazarlar-grid">
          {sourceAuthors.map((author) => (
            <AuthorCard 
              key={author.id} 
              author={author} 
              fallbackAvatar={fallbackAvatar} 
              onSelectAuthor={onSelectAuthor} 
            />
          ))}
        </div>
      </div>
    </section>
  );
}
