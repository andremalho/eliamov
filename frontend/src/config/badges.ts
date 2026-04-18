import { Dumbbell, Flame, Trophy, Star, Zap, Award, Crown, Target } from 'lucide-react';

export interface BadgeConfig {
  key: string;
  label: string;
  Icon: React.ElementType;
  color: string;
}

/**
 * Badges mapeados para a paleta Lunar Bloom.
 * Cada "tier" ganha um tom coerente com progressão simbólica:
 * entrada (sage) → consistência (brass) → conquista (terracotta) → mastery (ink).
 */
export const BADGE_CONFIG: BadgeConfig[] = [
  { key: 'first_workout',  label: 'Primeiro treino',    Icon: Dumbbell, color: '#9CA89A' }, // sage
  { key: '10_workouts',    label: '10 treinos',         Icon: Target,   color: '#9CA89A' }, // sage
  { key: '50_workouts',    label: '50 treinos',         Icon: Trophy,   color: '#C9A977' }, // brass
  { key: '7_day_streak',   label: '7 dias seguidos',    Icon: Flame,    color: '#D97757' }, // terracotta
  { key: '30_day_streak',  label: '30 dias seguidos',   Icon: Zap,      color: '#B85A3D' }, // terracotta deep
  { key: 'level_5',        label: 'Nível 5',            Icon: Star,     color: '#C9A977' }, // brass
  { key: 'level_10',       label: 'Nível 10',           Icon: Crown,    color: '#14161F' }, // ink (mastery)
  { key: 'first_post',     label: 'Primeiro post',      Icon: Award,    color: '#D97757' }, // terracotta
];

export const BADGE_LABELS: Record<string, string> = Object.fromEntries(
  BADGE_CONFIG.map((b) => [b.key, b.label]),
);
