import React from 'react';
import styles from './SkeletonCard.module.css';

interface SkeletonCardProps {
  height?: number;
}

export function SkeletonCard({ height = 280 }: SkeletonCardProps) {
  return (
    <div className={styles.card} style={{ height }}>
      <div className={styles.shimmer} />
      <div className={styles.meta}>
        <div className={styles.avatar} />
        <div className={styles.lines}>
          <div className={styles.line} style={{ width: '60%' }} />
          <div className={styles.line} style={{ width: '40%', opacity: 0.6 }} />
        </div>
      </div>
    </div>
  );
}

const HEIGHTS = [260, 340, 220, 300, 380, 250, 320, 290, 240, 360, 200, 310];

export default function SkeletonGrid({ count = 12 }: { count?: number }) {
  return (
    <div className="masonry-grid">
      {Array.from({ length: count }).map((_, i) => (
        <div className="masonry-item" key={`skel-${i}`}>
          <SkeletonCard height={HEIGHTS[i % HEIGHTS.length]} />
        </div>
      ))}
    </div>
  );
}
