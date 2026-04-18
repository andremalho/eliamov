import React, { useEffect, useState } from 'react';
import { storiesApi, StoryGroup } from '../services/stories.api';
import { useAuth } from '../contexts/AuthContext';

// Tons Lunar Bloom — cor do ring indica fase do ciclo
const phaseRingColors: Record<string, string> = {
  follicular: '#9CA89A',   // sage
  ovulatory: '#C9A977',    // brass
  luteal: '#D97757',       // terracotta
  menstrual: '#B85A3D',    // terracotta deep
};

function getRingColor(group: StoryGroup): string {
  const allViewed = group.stories.every(s => s.viewed);
  if (allViewed) return 'rgba(20,22,31,0.18)';
  const latest = group.stories[group.stories.length - 1];
  if (latest?.cyclePhase && phaseRingColors[latest.cyclePhase]) {
    return phaseRingColors[latest.cyclePhase];
  }
  return '#D97757';
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
