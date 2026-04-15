import { Dumbbell, Flame, Trophy, Star, Zap, Award, Crown, Target } from 'lucide-react';

export interface BadgeConfig {
  key: string;
  label: string;
  Icon: React.ElementType;
  color: string;
}

export const BADGE_CONFIG: BadgeConfig[] = [
  { key: 'first_workout', label: 'Primeiro treino', Icon: Dumbbell, color: '#7C3AED' },
  { key: '10_workouts', label: '10 treinos', Icon: Target, color: '#3B82F6' },
  { key: '50_workouts', label: '50 treinos', Icon: Trophy, color: '#F59E0B' },
  { key: '7_day_streak', label: '7 dias seguidos', Icon: Flame, color: '#EF4444' },
  { key: '30_day_streak', label: '30 dias seguidos', Icon: Zap, color: '#F97316' },
  { key: 'level_5', label: 'Nivel 5', Icon: Star, color: '#22C55E' },
  { key: 'level_10', label: 'Nivel 10', Icon: Crown, color: '#D97706' },
  { key: 'first_post', label: 'Primeiro post', Icon: Award, color: '#EC4899' },
];

export const BADGE_LABELS: Record<string, string> = Object.fromEntries(
  BADGE_CONFIG.map((b) => [b.key, b.label]),
);
