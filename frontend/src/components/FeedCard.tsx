import React, { useState } from 'react';
import { FeedPost } from '../services/feed.api';

const ACTIVITY_TYPE_LABELS: Record<string, string> = {
  run: 'Corrida',
  ride: 'Ciclismo',
  walk: 'Caminhada',
  swim: 'Natacao',
  hike: 'Trilha',
  workout: 'Treino',
  yoga: 'Yoga',
  other: 'Outro',
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'agora';
  if (mins < 60) return `${mins}min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d`;
  return new Date(iso).toLocaleDateString('pt-BR');
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins}min`;
  const hrs = Math.floor(mins / 60);
  const rem = mins % 60;
  return rem > 0 ? `${hrs}h ${rem}min` : `${hrs}h`;
}

function formatDistance(meters: number): string {
  if (meters < 1000) return `${meters}m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

interface FeedCardProps {
  post: FeedPost;
  onLike: (postId: string, liked: boolean) => void;
  onComment: (postId: string) => void;
  onDelete?: (postId: string) => void;
  currentUserId: string;
}

const HeartIcon: React.FC<{ filled: boolean }> = ({ filled }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? '#dc2626' : 'none'} stroke={filled ? '#dc2626' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const ChatIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const TrashIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6" />
    <path d="M14 11v6" />
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
);

export default function FeedCard({ post, onLike, onComment, onDelete, currentUserId }: FeedCardProps) {
  const [animating, setAnimating] = useState(false);

  const handleLike = () => {
    setAnimating(true);
    onLike(post.id, post.liked);
    setTimeout(() => setAnimating(false), 300);
  };

  const handleDelete = () => {
    if (!confirm('Remover esta publicacao?')) return;
    onDelete?.(post.id);
  };

  const user = post.user;
  const activity = post.activity;

  return (
    <div className="card feed-card">
      {/* Header */}
      <div className="feed-header">
        <div className="feed-avatar">
          {user?.avatarUrl ? (
            <img src={user.avatarUrl} alt={user.name} />
          ) : (
            getInitials(user?.name ?? '?')
          )}
        </div>
        <div className="feed-meta">
          <div className="feed-name">{user?.name ?? 'Utilizadora'}</div>
          <div className="feed-time">{timeAgo(post.createdAt)}</div>
        </div>
      </div>

      {/* Content */}
      {post.content && <div className="feed-content">{post.content}</div>}

      {/* Activity card */}
      {activity && (
        <div className="feed-activity-card">
          <span className="feed-activity-type">
            {ACTIVITY_TYPE_LABELS[activity.type] ?? activity.type}
          </span>
          <div style={{ fontWeight: 600, fontSize: 15 }}>{activity.title}</div>
          <div className="feed-activity-stats">
            <span>{formatDuration(activity.duration)}</span>
            {activity.distance != null && activity.distance > 0 && (
              <span>{formatDistance(activity.distance)}</span>
            )}
            {activity.calories != null && activity.calories > 0 && (
              <span>{activity.calories} kcal</span>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="feed-actions">
        <button
          type="button"
          className={`feed-action-btn ${post.liked ? 'liked' : ''} ${animating ? 'liked-animate' : ''}`}
          onClick={handleLike}
        >
          <HeartIcon filled={post.liked} />
          {post.likesCount > 0 && <span>{post.likesCount}</span>}
        </button>

        <button
          type="button"
          className="feed-action-btn"
          onClick={() => onComment(post.id)}
        >
          <ChatIcon />
          {post.commentsCount > 0 && <span>{post.commentsCount}</span>}
        </button>

        {currentUserId === post.userId && onDelete && (
          <button
            type="button"
            className="feed-action-btn"
            onClick={handleDelete}
            style={{ marginLeft: 'auto' }}
          >
            <TrashIcon />
          </button>
        )}
      </div>
    </div>
  );
}
