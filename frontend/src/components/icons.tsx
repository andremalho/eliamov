import React from 'react';

type IconProps = { size?: number; className?: string };

const wrap = (children: React.ReactNode) => ({ size = 24, className = '' }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    {children}
  </svg>
);

// === Objetivos ===
export const ScaleIcon = wrap(
  <>
    <path d="M12 3v3" />
    <path d="M5 6h14l-2 4h-10z" />
    <circle cx="9" cy="8" r="0.5" fill="currentColor" />
    <path d="M6 13h12v7H6z" />
    <path d="M9 16h6" />
  </>,
);

export const MuscleIcon = wrap(
  <>
    <path d="M6 14c0-3 2-5 5-5h2c2 0 4 2 4 4v2a4 4 0 0 1-4 4h-2a3 3 0 0 1-3-3" />
    <path d="M10 9c0-2 1-4 3-4h1" />
    <path d="M11 14h4" />
  </>,
);

export const DumbbellIcon = wrap(
  <>
    <path d="M6 8v8" />
    <path d="M3 10v4" />
    <path d="M18 8v8" />
    <path d="M21 10v4" />
    <path d="M6 12h12" />
  </>,
);

export const StretchIcon = wrap(
  <>
    <circle cx="12" cy="5" r="2" />
    <path d="M12 7v6" />
    <path d="M8 10l4 3 4-3" />
    <path d="M9 21l3-8 3 8" />
  </>,
);

export const HeartPulseIcon = wrap(
  <>
    <path d="M3 12h3l2-4 3 8 2-4h8" />
    <path d="M20.84 7.61a5.5 5.5 0 0 0-7.78 0L12 8.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 0" opacity="0.4" />
  </>,
);

export const ShieldIcon = wrap(
  <>
    <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" />
    <path d="M9 12l2 2 4-4" />
  </>,
);

export const SproutIcon = wrap(
  <>
    <path d="M12 21V9" />
    <path d="M12 9c-3 0-5-2-5-5 3 0 5 2 5 5z" />
    <path d="M12 11c3 0 5-2 5-5-3 0-5 2-5 5z" />
    <path d="M5 21h14" />
  </>,
);

export const BabyIcon = wrap(
  <>
    <circle cx="12" cy="8" r="4" />
    <path d="M9 8h.01" />
    <path d="M15 8h.01" />
    <path d="M10 11s.5 1 2 1 2-1 2-1" />
    <path d="M5 21c0-4 3-7 7-7s7 3 7 7" />
  </>,
);

export const MoonIcon = wrap(
  <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />,
);

export const BoneIcon = wrap(
  <path d="M17 17a3 3 0 1 0-2.8-4.1L9.9 8.7a3 3 0 1 0-1.4 1.4l4.3 4.3a3 3 0 1 0 4.2 2.6z" />,
);

export const BrainIcon = wrap(
  <>
    <path d="M9 3a3 3 0 0 0-3 3v0a3 3 0 0 0-2 5 3 3 0 0 0 1 5 3 3 0 0 0 4 4 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3z" />
    <path d="M15 3a3 3 0 0 1 3 3v0a3 3 0 0 1 2 5 3 3 0 0 1-1 5 3 3 0 0 1-4 4 3 3 0 0 1-3-3" />
  </>,
);

export const SleepIcon = wrap(
  <>
    <path d="M3 18h6l-6 0c0-3 3-3 3-6h-3" />
    <path d="M14 14h6l-6 0c0-2 3-2 3-5h-3" />
    <path d="M14 6h4" />
    <path d="M14 6c0-1.5 1.5-2 3-2" />
  </>,
);

export const BoltIcon = wrap(<path d="M13 2L4 14h7l-1 8 9-12h-7z" />);

export const FlowerIcon = wrap(
  <>
    <circle cx="12" cy="12" r="2" />
    <path d="M12 10V5a3 3 0 0 1 0 5z" />
    <path d="M12 14v5a3 3 0 0 1 0-5z" />
    <path d="M10 12H5a3 3 0 0 1 5 0z" />
    <path d="M14 12h5a3 3 0 0 1-5 0z" />
  </>,
);

// === Exercícios ===
export const RunIcon = wrap(
  <>
    <circle cx="14" cy="4" r="1.5" />
    <path d="M11 12l3-3 3 2-2 4 3 4" />
    <path d="M5 13l4-2 2 3-2 5" />
    <path d="M9 7l3-1" />
  </>,
);

export const LotusIcon = wrap(
  <>
    <circle cx="12" cy="9" r="2" />
    <path d="M12 11c-2 1-4 3-5 6 3 0 5-1 5-3" />
    <path d="M12 11c2 1 4 3 5 6-3 0-5-1-5-3" />
    <path d="M5 17h14" />
  </>,
);

export const MusicIcon = wrap(
  <>
    <circle cx="6" cy="18" r="2" />
    <circle cx="17" cy="16" r="2" />
    <path d="M8 18V6l11-2v12" />
  </>,
);

export const WalkIcon = wrap(
  <>
    <circle cx="13" cy="4" r="1.5" />
    <path d="M9 20l2-6-2-3 3-3 2 3 3 1" />
    <path d="M11 14l-3 6" />
  </>,
);

export const WaveIcon = wrap(
  <>
    <path d="M3 8c2 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2" />
    <path d="M3 14c2 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2" />
    <path d="M3 20c2 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2" />
  </>,
);

export const BikeIcon = wrap(
  <>
    <circle cx="6" cy="16" r="3" />
    <circle cx="18" cy="16" r="3" />
    <path d="M6 16l4-8h6" />
    <path d="M18 16l-3-8" />
    <circle cx="15" cy="6" r="1" />
  </>,
);

export const FlameIcon = wrap(
  <path d="M12 2c1 4 5 5 5 10a5 5 0 0 1-10 0c0-3 2-3 2-6 0 0 2 1 3-4z" />,
);

export const SparkleIcon = wrap(
  <>
    <path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8" />
  </>,
);

// === Local de treino ===
export const HomeIcon = wrap(
  <>
    <path d="M3 12L12 3l9 9" />
    <path d="M5 10v10h14V10" />
  </>,
);

export const BuildingIcon = wrap(
  <>
    <rect x="5" y="3" width="14" height="18" rx="1" />
    <path d="M9 7h.01M15 7h.01M9 11h.01M15 11h.01M9 15h.01M15 15h.01" />
  </>,
);

export const TreeIcon = wrap(
  <>
    <path d="M12 3a5 5 0 0 0-3 9 5 5 0 0 0 6 0 5 5 0 0 0-3-9z" />
    <path d="M12 12v9" />
  </>,
);

export const LeafIcon = wrap(
  <>
    <path d="M11 20A7 7 0 0 1 4 13c0-5 3-9 16-9-1 7-4 16-9 16z" />
    <path d="M4 20l9-9" />
  </>,
);

// === Recursos do app (Dashboard tiles) ===
export const CycleIcon = wrap(
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </>,
);

export const HeartOutlineIcon = wrap(
  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />,
);

export const DropletIcon = wrap(<path d="M12 2.5s6 7 6 11.5a6 6 0 0 1-12 0c0-4.5 6-11.5 6-11.5z" />);

export const ActivityIcon = wrap(<path d="M3 12h4l3-8 4 16 3-8h4" />);

export const FlaskIcon = wrap(
  <>
    <path d="M9 3h6" />
    <path d="M10 3v6L5 19a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-10V3" />
    <path d="M7 14h10" />
  </>,
);

export const CalendarIcon = wrap(
  <>
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <path d="M16 3v4M8 3v4M3 11h18" />
  </>,
);

export const WatchIcon = wrap(
  <>
    <circle cx="12" cy="12" r="6" />
    <path d="M9 3h6l-1 5M9 21h6l-1-5" />
  </>,
);

export const SaladIcon = wrap(
  <>
    <path d="M3 11h18a9 9 0 0 1-18 0z" />
    <path d="M8 8s.5-3 4-3 4 3 4 3" />
  </>,
);

export const SparklesIcon = wrap(
  <>
    <path d="M12 2v6M12 16v6M2 12h6M16 12h6M5 5l4 4M15 15l4 4M5 19l4-4M15 9l4-4" />
  </>,
);

// === Mapa nome → componente ===
const ICONS: Record<string, React.FC<IconProps>> = {
  scale: ScaleIcon,
  muscle: MuscleIcon,
  dumbbell: DumbbellIcon,
  stretch: StretchIcon,
  heart: HeartPulseIcon,
  shield: ShieldIcon,
  sprout: SproutIcon,
  baby: BabyIcon,
  moon: MoonIcon,
  bone: BoneIcon,
  brain: BrainIcon,
  sleep: SleepIcon,
  bolt: BoltIcon,
  flower: FlowerIcon,
  run: RunIcon,
  lotus: LotusIcon,
  music: MusicIcon,
  walk: WalkIcon,
  wave: WaveIcon,
  bike: BikeIcon,
  flame: FlameIcon,
  sparkle: SparkleIcon,
  home: HomeIcon,
  building: BuildingIcon,
  tree: TreeIcon,
  leaf: LeafIcon,
  cycle: CycleIcon,
  droplet: DropletIcon,
  activity: ActivityIcon,
  flask: FlaskIcon,
  calendar: CalendarIcon,
  watch: WatchIcon,
  salad: SaladIcon,
  sparkles: SparklesIcon,
  heart_outline: HeartOutlineIcon,
};

export const Icon: React.FC<{ name: string; size?: number; className?: string }> = ({
  name,
  ...rest
}) => {
  const Component = ICONS[name];
  if (!Component) return null;
  return <Component {...rest} />;
};
