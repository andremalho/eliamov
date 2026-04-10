import React, { useEffect, useState } from 'react';
import { storiesApi, StoryGroup } from '../services/stories.api';
import { useAuth } from '../contexts/AuthContext';

const phaseRingColors: Record<string, string> = {
  follicular: '#16a34a',
  ovulatory: '#f59e0b',
  luteal: '#7c3aed',
  menstrual: '#dc2626',
};

function getRingColor(group: StoryGroup): string {
  const allViewed = group.stories.every(s => s.viewed);
  if (allViewed) return '#d1d5db';
  const latest = group.stories[group.stories.length - 1];
  if (latest?.cyclePhase && phaseRingColors[latest.cyclePhase]) {
    return phaseRingColors[latest.cyclePhase];
  }
  return '#9ca3af';
}

function getInitial(name: string): string {
  return name.charAt(0).toUpperCase();
}

function getFirstName(name: string): string {
  return name.split(' ')[0] || name;
}

interface StoriesBarProps {
  onOpenStory: (group: StoryGroup) => void;
  onCreateStory: () => void;
}

export default function StoriesBar({ onOpenStory, onCreateStory }: StoriesBarProps) {
  const { currentUser } = useAuth();
  const [groups, setGroups] = useState<StoryGroup[]>([]);

  useEffect(() => {
    storiesApi.list().then(setGroups).catch(() => {});
  }, []);

  if (groups.length === 0) return null;

  return (
    <div className="stories-bar">
      <div className="story-avatar-wrap" onClick={onCreateStory}>
        <div className="story-add" aria-label="Criar story">+</div>
        <span className="story-name">Novo</span>
      </div>

      {groups.map(group => {
        const ringColor = getRingColor(group);
        return (
          <div
            key={group.userId}
            className="story-avatar-wrap"
            onClick={() => onOpenStory(group)}
          >
            <div
              className="story-avatar-ring"
              style={{ background: ringColor }}
            >
              <div className="story-avatar">
                {group.avatarUrl ? (
                  <img src={group.avatarUrl} alt={group.name} />
                ) : (
                  getInitial(group.name)
                )}
              </div>
            </div>
            <span className="story-name">{getFirstName(group.name)}</span>
          </div>
        );
      })}
    </div>
  );
}
