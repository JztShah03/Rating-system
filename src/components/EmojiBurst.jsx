import { motion } from 'framer-motion';
import { useMemo } from 'react';

function buildParticles(count) {
  return Array.from({ length: count }, (_, index) => {
    const angle = (Math.PI * 2 * index) / count;
    const distance = 80 + Math.random() * 80;

    return {
      id: index,
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance,
      rotate: -40 + Math.random() * 80,
      scale: 0.7 + Math.random() * 0.8
    };
  });
}

export default function EmojiBurst({ emoji, burstKey }) {
  const particles = useMemo(() => buildParticles(24), [burstKey]);

  if (!emoji || !burstKey) return null;

  return (
    <div className="emoji-burst" aria-hidden="true">
      {particles.map((particle) => (
        <motion.span
          key={`${burstKey}-${particle.id}`}
          className="emoji-burst__particle"
          initial={{ opacity: 1, x: 0, y: 0, scale: 0.6, rotate: 0 }}
          animate={{
            opacity: 0,
            x: particle.x,
            y: particle.y,
            scale: particle.scale,
            rotate: particle.rotate
          }}
          transition={{ duration: 0.75, ease: 'easeOut' }}
        >
          {emoji}
        </motion.span>
      ))}
    </div>
  );
}
