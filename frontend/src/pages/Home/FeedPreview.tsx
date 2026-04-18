import React from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { FeedPost } from '../../services/feed.api';

const PHASE_COLORS: Record<string, string> = {
  menstrual: '#D97757',
  follicular: '#22C55E',
  ovulatory: '#F59E0B',
  luteal: '#F97316',
};

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

interface FeedPreviewProps {
  posts: FeedPost[];
}

export default function FeedPreview({ posts }: FeedPreviewProps) {
  return (
    <div className="feed-preview" style={{ marginBottom: 16 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 12,
        }}
      >
        <h3
          style={{
            fontSize: 16,
            fontWeight: 600,
            color: '#14161F',
            margin: 0,
          }}
        >
          Na sua academia
        </h3>
        <Link
          to="/feed"
          style={{ fontSize: 13, color: '#14161F', textDecoration: 'none', fontWeight: 500 }}
        >
          Ver tudo →
        </Link>
      </div>

      {posts.length === 0 ? (
        <p style={{ fontSize: 14, color: '#9ca3af', textAlign: 'center', padding: '16px 0' }}>
          Nenhuma atividade recente.
        </p>
      ) : (
        posts.slice(0, 3).map((post) => {
          const user = post.user;
          return (
            <div
              key={post.id}
              style={{
                background: '#fff',
                borderRadius: 12,
                padding: '12px 14px',
                marginBottom: 8,
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: '#e5e7eb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 11,
                    fontWeight: 600,
                    color: '#374151',
                    overflow: 'hidden',
                    flexShrink: 0,
                  }}
                >
                  {user?.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    getInitials(user?.name ?? '?')
                  )}
                </div>

                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: '#1f2937',
                    marginLeft: 8,
                    flex: 1,
                  }}
                >
                  {user?.name ?? 'Utilizadora'}
                </span>

                {post.cyclePhase && (
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: PHASE_COLORS[post.cyclePhase] ?? '#9ca3af',
                      display: 'inline-block',
                      marginLeft: 6,
                    }}
                  />
                )}
              </div>

              {post.content && (
                <p
                  style={{
                    fontSize: 13,
                    color: '#374151',
                    margin: '0 0 8px',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    lineHeight: '1.4',
                  }}
                >
                  {post.content}
                </p>
              )}

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  fontSize: 12,
                  color: '#9ca3af',
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                  <Heart size={14} color={post.liked ? '#dc2626' : '#9ca3af'} fill={post.liked ? '#dc2626' : 'none'} />
                  {post.likesCount}
                </span>
                <span>{post.commentsCount} comentarios</span>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
