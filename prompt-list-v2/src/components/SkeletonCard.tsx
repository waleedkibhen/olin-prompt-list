import React from 'react';
import styles from './SkeletonCard.module.css';

interface SkeletonCardProps {
  height?: number;
}

export function SkeletonCard({ height = 280 }: SkeletonCardProps) {
  return (
    <div className={styles.card} style={{ height }} />
  );
}

// Varied heights that mimic real portrait / landscape / square post shapes
const HEIGHTS = [320, 420, 260, 370, 460, 300, 350, 290, 400, 440, 270, 330];

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
