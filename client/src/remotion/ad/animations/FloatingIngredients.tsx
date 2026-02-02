import React from 'react';
import { useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion';

interface FloatingIngredient {
  id: number;
  emoji: string;
  x: number;
  y: number;
  size: number;
  blur: number;
  speed: number;
  rotationSpeed: number;
  delay: number;
  layer: 'back' | 'mid' | 'front';
}

interface FloatingIngredientsProps {
  ingredients?: string[];
  density?: 'low' | 'medium' | 'high';
  animationStyle?: 'float' | 'orbit' | 'bounce';
  entranceDelay?: number;
}

const defaultIngredients = ['🍅', '🧅', '🥕', '🧄', '🥬', '🍗', '🥚', '🧀'];

const generateIngredients = (
  emojis: string[],
  density: 'low' | 'medium' | 'high'
): FloatingIngredient[] => {
  const counts = { low: 5, medium: 8, high: 12 };
  const count = counts[density];
  const ingredients: FloatingIngredient[] = [];

  for (let i = 0; i < count; i++) {
    const layer = i < count / 3 ? 'back' : i < (count * 2) / 3 ? 'mid' : 'front';
    const layerConfig = {
      back: { size: 40, blur: 6, opacity: 0.4 },
      mid: { size: 60, blur: 3, opacity: 0.6 },
      front: { size: 80, blur: 0, opacity: 0.8 },
    };

    ingredients.push({
      id: i,
      emoji: emojis[i % emojis.length],
      x: 5 + Math.random() * 90,
      y: 5 + Math.random() * 90,
      size: layerConfig[layer].size + Math.random() * 20,
      blur: layerConfig[layer].blur,
      speed: 0.5 + Math.random() * 0.5,
      rotationSpeed: (Math.random() - 0.5) * 2,
      delay: i * 8,
      layer,
    });
  }

  return ingredients;
};

export const FloatingIngredients: React.FC<FloatingIngredientsProps> = ({
  ingredients = defaultIngredients,
  density = 'medium',
  animationStyle = 'float',
  entranceDelay = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const floatingItems = React.useMemo(
    () => generateIngredients(ingredients, density),
    [ingredients.join(','), density]
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
      {floatingItems.map((item) => {
        const adjustedFrame = Math.max(0, frame - entranceDelay - item.delay);

        // Entrance animation
        const entranceScale = spring({
          frame: adjustedFrame,
          fps,
          config: { damping: 15, stiffness: 100 },
        });

        // Calculate position based on animation style
        let x = item.x;
        let y = item.y;
        let rotation = 0;

        if (animationStyle === 'float') {
          // Gentle floating motion
          x = item.x + Math.sin(adjustedFrame * 0.02 * item.speed) * 15;
          y = item.y + Math.cos(adjustedFrame * 0.025 * item.speed) * 20;
          rotation = Math.sin(adjustedFrame * 0.015 * item.rotationSpeed) * 20;
        } else if (animationStyle === 'orbit') {
          // Orbital motion around center
          const orbitRadius = 20 + item.id * 5;
          const angle = adjustedFrame * 0.01 * item.speed + (item.id * Math.PI) / 4;
          x = item.x + Math.cos(angle) * orbitRadius * 0.5;
          y = item.y + Math.sin(angle) * orbitRadius;
          rotation = adjustedFrame * item.rotationSpeed;
        } else if (animationStyle === 'bounce') {
          // Bouncy motion
          const bounce = Math.abs(Math.sin(adjustedFrame * 0.04 * item.speed));
          y = item.y - bounce * 30;
          x = item.x + Math.sin(adjustedFrame * 0.02) * 10;
          rotation = Math.sin(adjustedFrame * 0.03) * 15;
        }

        // Scale pulse
        const scalePulse = interpolate(
          Math.sin(adjustedFrame * 0.02 + item.id),
          [-1, 1],
          [0.95, 1.05]
        );

        // Opacity based on layer
        const layerOpacity = {
          back: 0.4,
          mid: 0.6,
          front: 0.85,
        };

        // Parallax effect based on layer
        const parallaxMultiplier = {
          back: 0.5,
          mid: 1,
          front: 1.5,
        };

        const finalX = x + (frame * 0.1 * parallaxMultiplier[item.layer]) % 10 - 5;

        return (
          <div
            key={item.id}
            style={{
              position: 'absolute',
              left: `${finalX}%`,
              top: `${y}%`,
              fontSize: item.size,
              transform: `scale(${entranceScale * scalePulse}) rotate(${rotation}deg)`,
              opacity: frame >= entranceDelay + item.delay ? layerOpacity[item.layer] : 0,
              filter: `blur(${item.blur}px)`,
              zIndex: item.layer === 'back' ? 1 : item.layer === 'mid' ? 2 : 3,
              transition: 'none',
            }}
          >
            {item.emoji}
          </div>
        );
      })}
    </div>
  );
};

// Preset configurations
export const IngredientPresets = {
  vegetables: ['🥕', '🥬', '🍅', '🧅', '🥒', '🌽', '🥦'],
  proteins: ['🍗', '🥩', '🍖', '🥚', '🐟', '🦐'],
  italian: ['🍝', '🍅', '🧀', '🧄', '🫒', '🌿'],
  asian: ['🍜', '🥢', '🥡', '🍣', '🥟', '🌶️'],
  breakfast: ['🥚', '🥓', '🍞', '🧈', '🥞', '☕'],
  mixed: ['🍗', '🍅', '🧅', '🧄', '🥕', '🧀', '🥬', '🍝'],
};
