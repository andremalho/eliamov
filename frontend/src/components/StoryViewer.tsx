import React, { useEffect, useState, useRef, useCallback } from 'react';
import { storiesApi, StoryGroup } from '../services/stories.api';

interface StoryViewerProps {
  group: StoryGroup;
  onClose: () => void;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'agora';
  if (mins < 60) return `${mins}min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

export default function StoryViewer({ group, onClose }: StoryViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<number>();

  const story = group.stories[currentIndex];

  const goNext = useCallback(() => {
    if (currentIndex < group.stories.length - 1) {
      setCurrentIndex(i => i + 1);
      setProgress(0);
    } else {
      onClose();
    }
  }, [currentIndex, group.stories.length, onClose]);

  const goPrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(i => i - 1);
      setProgress(0);
    }
  }, [currentIndex]);

  useEffect(() => {
    const current = group.stories[currentIndex];
    if (!current) return;

    const totalMs = (current.duration ?? 5) * 1000;
    const intervalMs = 50;
    let elapsed = 0;

    timerRef.current = window.setInterval(() => {
      elapsed += intervalMs;
      setProgress(elapsed / totalMs);
      if (elapsed >= totalMs) {
        clearInterval(timerRef.current);
        if (currentIndex < group.stories.length - 1) {
          setCurrentIndex(i => i + 1);
          setProgress(0);
        } else {
          onClose();
        }
      }
    }, intervalMs);

    storiesApi.registerView(current.id).catch(() => {});

    return () => clearInterval(timerRef.current);
  }, [currentIndex, group.stories, onClose]);

  if (!story) return null;

  return (
    <div className="story-viewer">
      {/* Progress bars */}
      <div className="story-progress-bar">
        {group.stories.map((_, i) => (
          <div key={i} className="story-progress-segment">
            <div
              className="story-progress-fill"
              style={{
                width:
                  i < currentIndex
                    ? '100%'
                    : i === currentIndex
                      ? `${Math.min(progress * 100, 100)}%`
                      : '0%',
              }}
            />
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="story-header">
        <div className="story-header-avatar">
          {group.avatarUrl ? (
            <img src={group.avatarUrl} alt={group.name} />
          ) : (
            group.name.charAt(0).toUpperCase()
          )}
        </div>
        <span className="story-header-name">{group.name}</span>
        <span className="story-header-time">{timeAgo(story.createdAt)}</span>
      </div>

      {/* Close button */}
      <button className="story-close" onClick={onClose} aria-label="Fechar">
        &times;
      </button>

      {/* Media */}
      <div className="story-media">
        <div className="story-tap-zone story-tap-left" onClick={goPrev} />
        <div className="story-tap-zone story-tap-right" onClick={goNext} />
        {story.mediaType === 'video' ? (
          <video src={story.mediaUrl} autoPlay playsInline muted />
        ) : (
          <img src={story.mediaUrl} alt="" />
        )}
      </div>

      {/* Footer (views count for own stories) */}
      {story.isOwn && (
        <div className="story-footer">
          <span className="story-views-count">{story.viewsCount}</span> viram
        </div>
      )}
    </div>
  );
}
