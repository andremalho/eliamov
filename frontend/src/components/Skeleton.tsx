import React from 'react';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: number;
  style?: React.CSSProperties;
}

export function Skeleton({ width = '100%', height = 16, borderRadius = 8, style }: SkeletonProps) {
  return (
    <>
      <style>{`
        @keyframes elia-shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
      <div style={{
        width, height, borderRadius,
        background: 'linear-gradient(90deg, #F3F4F6 25%, #E5E7EB 50%, #F3F4F6 75%)',
        backgroundSize: '200% 100%',
        animation: 'elia-shimmer 1.5s ease-in-out infinite',
        ...style,
      }} />
    </>
  );
}

export function SkeletonCard() {
  return (
    <div style={{
      background: '#fff', borderRadius: 16, padding: 20,
      marginBottom: 16, border: '1px solid #E5E7EB',
    }}>
      <Skeleton width={120} height={12} style={{ marginBottom: 12 }} />
      <Skeleton height={20} style={{ marginBottom: 8 }} />
      <Skeleton width="60%" height={14} style={{ marginBottom: 16 }} />
      <div style={{ display: 'flex', gap: 8 }}>
        <Skeleton width={60} height={24} borderRadius={12} />
        <Skeleton width={80} height={24} borderRadius={12} />
        <Skeleton width={50} height={24} borderRadius={12} />
      </div>
    </div>
  );
}

export function SkeletonFeed() {
  return (
    <div>
      {[1, 2, 3].map((i) => (
        <div key={i} style={{
          background: '#fff', borderRadius: 14, padding: 16,
          marginBottom: 16, border: '1px solid #E5E7EB',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <Skeleton width={40} height={40} borderRadius={20} />
            <div style={{ flex: 1 }}>
              <Skeleton width={120} height={14} style={{ marginBottom: 4 }} />
              <Skeleton width={80} height={10} />
            </div>
          </div>
          <Skeleton height={14} style={{ marginBottom: 6 }} />
          <Skeleton width="80%" height={14} style={{ marginBottom: 12 }} />
          <Skeleton height={200} borderRadius={12} style={{ marginBottom: 12 }} />
          <div style={{ display: 'flex', gap: 16 }}>
            <Skeleton width={24} height={24} borderRadius={12} />
            <Skeleton width={24} height={24} borderRadius={12} />
            <Skeleton width={24} height={24} borderRadius={12} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div style={{ background: '#fff', borderRadius: 12, padding: 16, border: '1px solid #E5E7EB' }}>
      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} width={`${100 / cols}%`} height={12} />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} style={{ display: 'flex', gap: 12, marginBottom: 10 }}>
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton key={c} width={`${100 / cols}%`} height={16} />
          ))}
        </div>
      ))}
    </div>
  );
}
