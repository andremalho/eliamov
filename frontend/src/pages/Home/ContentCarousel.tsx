import React from 'react';
import { Link } from 'react-router-dom';
import { Bookmark } from 'lucide-react';
import { Article } from '../../services/content.api';

const PHASE_CONFIG: Record<string, { color: string; label: string }> = {
  menstrual: { color: '#D97757', label: 'Menstrual' },
  follicular: { color: '#22C55E', label: 'Folicular' },
  ovulatory: { color: '#F59E0B', label: 'Ovulatória' },
  luteal: { color: '#F97316', label: 'Lútea' },
};

interface ContentCarouselProps {
  articles: Article[];
  phase?: string | null;
}

export default function ContentCarousel({ articles, phase }: ContentCarouselProps) {
  const config = phase ? PHASE_CONFIG[phase] : null;

  return (
    <div className="content-carousel" style={{ marginBottom: 24 }}>
      <h3
        style={{
          fontSize: 16,
          fontWeight: 600,
          color: '#14161F',
          margin: '0 0 12px',
        }}
      >
        Para você hoje
        {config && (
          <span style={{ color: config.color, fontWeight: 500 }}>
            {' '}
            — fase {config.label}
          </span>
        )}
      </h3>

      {articles.length === 0 ? (
        <p style={{ fontSize: 14, color: '#9ca3af', textAlign: 'center', padding: '16px 0' }}>
          Conteudo sendo preparado para você.
        </p>
      ) : (
        <div
          style={{
            display: 'flex',
            overflowX: 'auto',
            gap: 12,
            paddingBottom: 8,
            scrollSnapType: 'x mandatory',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {articles.map((article) => (
            <Link
              key={article.id}
              to={`/content/articles/${article.id}`}
              style={{
                flexShrink: 0,
                width: 200,
                background: '#fff',
                borderRadius: 12,
                overflow: 'hidden',
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                textDecoration: 'none',
                color: 'inherit',
                scrollSnapAlign: 'start',
              }}
            >
              {article.coverImageUrl && (
                <img
                  src={article.coverImageUrl}
                  alt={article.title}
                  style={{
                    width: '100%',
                    height: 120,
                    objectFit: 'cover',
                    display: 'block',
                  }}
                />
              )}

              <div style={{ padding: '10px 12px' }}>
                <p
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: '#1f2937',
                    margin: '0 0 6px',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    lineHeight: '1.3',
                  }}
                >
                  {article.title}
                </p>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  {article.category && (
                    <span
                      style={{
                        fontSize: 11,
                        background: '#f3f4f6',
                        padding: '2px 8px',
                        borderRadius: 20,
                        color: '#6b7280',
                      }}
                    >
                      {article.category.name}
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 2,
                      display: 'flex',
                    }}
                    aria-label="Salvar"
                  >
                    <Bookmark size={16} color="#9ca3af" />
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
