import React, { useState } from 'react';
import { FeedPost, ReactionType } from '../services/feed.api';
import { InstagramIcon, FacebookIcon, XIcon, SnapchatIcon, WhatsAppIcon } from './SocialIcons';

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

const CYCLE_PHASE_COLORS: Record<string, string> = {
  menstrual: '#dc2626',
  follicular: '#16a34a',
  ovulatory: '#7c3aed',
  luteal: '#f59e0b',
};

const CYCLE_PHASE_LABELS: Record<string, string> = {
  menstrual: 'Menstrual',
  follicular: 'Folicular',
  ovulatory: 'Ovulatoria',
  luteal: 'Lutea',
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
  onReaction: (postId: string, reaction: ReactionType) => void;
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

export default function FeedCard({ post, onLike, onComment, onReaction, onDelete, currentUserId }: FeedCardProps) {
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
  const workout = post.workout;

  return (
    <div className="card feed-card">
      {/* Post type badge */}
      {post.postType === 'workout' && (
        <span className="feed-post-type workout">Treino</span>
      )}
      {post.postType === 'achievement' && (
        <span className="feed-post-type achievement">Conquista</span>
      )}

      {/* Cycle phase badge */}
      {post.cyclePhase && (
        <span
          className="feed-phase-badge"
          style={{ background: CYCLE_PHASE_COLORS[post.cyclePhase] ?? '#9ca3af' }}
        >
          {CYCLE_PHASE_LABELS[post.cyclePhase] ?? post.cyclePhase}
        </span>
      )}

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

      {/* Media */}
      {post.mediaUrls && post.mediaUrls.length > 0 && (
        <div className="feed-media-scroll">
          {post.mediaUrls.map((url, i) => (
            <img key={i} src={url} alt={`media-${i}`} />
          ))}
        </div>
      )}

      {/* Workout card */}
      {workout && (
        <div className="feed-activity-card">
          <span className="feed-activity-type">
            {ACTIVITY_TYPE_LABELS[workout.type] ?? workout.type}
          </span>
          <div style={{ fontWeight: 600, fontSize: 15 }}>{workout.title}</div>
          <div className="feed-activity-stats">
            <span>{formatDuration(workout.duration)}</span>
            {workout.distance != null && workout.distance > 0 && (
              <span>{formatDistance(workout.distance)}</span>
            )}
            {workout.calories != null && workout.calories > 0 && (
              <span>{workout.calories} kcal</span>
            )}
          </div>
        </div>
      )}

      {/* Reactions */}
      <div className="feed-reactions">
        {(['heart', 'fire', 'muscle'] as const).map(r => (
          <button key={r} type="button" className="feed-reaction-btn" onClick={() => onReaction(post.id, r)}>
            {r === 'heart' ? '\u2764\uFE0F' : r === 'fire' ? '\uD83D\uDD25' : '\uD83D\uDCAA'}
          </button>
        ))}
      </div>

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

        {/* Share icons */}
        <div style={{ display: 'flex', gap: 6, marginLeft: 'auto' }}>
          {[
            { Icon: WhatsAppIcon, href: `https://wa.me/?text=${encodeURIComponent(post.content ?? 'Veja no eliaMov!')}`, title: 'WhatsApp' },
            { Icon: InstagramIcon, href: 'https://www.instagram.com/', title: 'Instagram' },
            { Icon: XIcon, href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(post.content?.slice(0, 100) ?? 'eliaMov')}`, title: 'X' },
            { Icon: FacebookIcon, href: 'https://www.facebook.com/sharer/sharer.php?u=https://eliamov.com', title: 'Facebook' },
            { Icon: SnapchatIcon, href: 'https://www.snapchat.com/', title: 'Snapchat' },
          ].map(({ Icon, href, title }) => (
            <a key={title} href={href} target="_blank" rel="noopener noreferrer" title={title}
              style={{ color: '#9CA3AF', opacity: 0.6, transition: 'opacity 0.15s', display: 'flex', alignItems: 'center' }}
              onMouseEnter={e => { (e.target as HTMLElement).style.opacity = '1'; }}
              onMouseLeave={e => { (e.target as HTMLElement).style.opacity = '0.6'; }}>
              <Icon />
            </a>
          ))}
        </div>

        {currentUserId === post.userId && onDelete && (
          <button
            type="button"
            className="feed-action-btn"
            onClick={handleDelete}
          >
            <TrashIcon />
          </button>
        )}
      </div>
    </div>
  );
}
