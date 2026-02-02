import React from 'react';
import { useCurrentFrame, interpolate } from 'remotion';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
  type: 'circle' | 'emoji';
  emoji?: string;
  delay: number;
}

interface BackgroundParticlesProps {
  count?: number;
  color?: string;
  emojis?: string[];
  minSize?: number;
  maxSize?: number;
  minOpacity?: number;
  maxOpacity?: number;
}

const generateParticles = (
  count: number,
  emojis: string[],
  minSize: number,
  maxSize: number,
  minOpacity: number,
  maxOpacity: number
): Particle[] => {
  const particles: Particle[] = [];

  for (let i = 0; i < count; i++) {
    const isEmoji = emojis.length > 0 && Math.random() > 0.5;
    particles.push({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: minSize + Math.random() * (maxSize - minSize),
      speed: 0.3 + Math.random() * 0.7,
      opacity: minOpacity + Math.random() * (maxOpacity - minOpacity),
      type: isEmoji ? 'emoji' : 'circle',
      emoji: isEmoji ? emojis[Math.floor(Math.random() * emojis.length)] : undefined,
      delay: Math.random() * 100,
    });
  }

  return particles;
};

export const BackgroundParticles: React.FC<BackgroundParticlesProps> = ({
  count = 20,
  color = 'rgba(255, 107, 53, 0.3)',
  emojis = [],
  minSize = 8,
  maxSize = 24,
  minOpacity = 0.1,
  maxOpacity = 0.3,
}) => {
  const frame = useCurrentFrame();

  // Memoize particles using a stable reference
  const particles = React.useMemo(
    () => generateParticles(count, emojis, minSize, maxSize, minOpacity, maxOpacity),
    [count, emojis.join(','), minSize, maxSize, minOpacity, maxOpacity]
  );

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
      }}
    >
      {particles.map((particle) => {
        // Calculate animated position
        const adjustedFrame = frame + particle.delay;

        // Smooth floating motion using sin/cos waves
        const floatY = Math.sin(adjustedFrame * 0.02 * particle.speed) * 30;
        const floatX = Math.cos(adjustedFrame * 0.015 * particle.speed) * 20;

        // Subtle rotation for circles
        const rotation = Math.sin(adjustedFrame * 0.01 * particle.speed) * 15;

        // Pulsing opacity
        const pulseOpacity = interpolate(
          Math.sin(adjustedFrame * 0.03 + particle.id),
          [-1, 1],
          [particle.opacity * 0.7, particle.opacity]
        );

        // Scale pulse
        const scalePulse = interpolate(
          Math.sin(adjustedFrame * 0.025 + particle.id * 0.5),
          [-1, 1],
          [0.9, 1.1]
        );

        return (
          <div
            key={particle.id}
            style={{
              position: 'absolute',
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              transform: `translate(${floatX}px, ${floatY}px) rotate(${rotation}deg) scale(${scalePulse})`,
              opacity: pulseOpacity,
              transition: 'none',
            }}
          >
            {particle.type === 'emoji' ? (
              <span
                style={{
                  fontSize: particle.size * 2,
                  filter: 'blur(1px)',
                }}
              >
                {particle.emoji}
              </span>
            ) : (
              <div
                style={{
                  width: particle.size,
                  height: particle.size,
                  borderRadius: '50%',
                  background: color,
                  filter: 'blur(2px)',
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

// Preset configurations for different scenes
export const ParticlePresets = {
  kitchen: {
    emojis: ['🍳', '🥄', '🍴', '🥣', '🧂'],
    color: 'rgba(255, 107, 53, 0.2)',
    count: 15,
  },
  ingredients: {
    emojis: ['🍅', '🧅', '🥕', '🧄', '🥬', '🍗'],
    color: 'rgba(76, 175, 80, 0.2)',
    count: 18,
  },
  celebration: {
    emojis: ['✨', '⭐', '🎉', '💫'],
    color: 'rgba(255, 215, 0, 0.3)',
    count: 25,
  },
  cooking: {
    emojis: ['🔥', '💨', '✨'],
    color: 'rgba(255, 87, 34, 0.2)',
    count: 12,
  },
  neutral: {
    emojis: [],
    color: 'rgba(128, 128, 128, 0.15)',
    count: 20,
  },
};
