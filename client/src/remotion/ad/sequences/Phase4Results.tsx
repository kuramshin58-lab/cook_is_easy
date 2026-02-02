import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  spring,
  useVideoConfig,
} from 'remotion';
import { colors, typography, spacing } from '../theme';
import { RecipeCard } from '../ui/RecipeCard';
import { FloatingIngredients } from '../animations/FloatingIngredients';

// Orbiting sparkles configuration
const orbitingSparkles = [
  { emoji: '✨', radius: 380, speed: 0.02, offset: 0, size: 40 },
  { emoji: '⭐', radius: 420, speed: -0.015, offset: Math.PI / 2, size: 50 },
  { emoji: '💫', radius: 350, speed: 0.025, offset: Math.PI, size: 35 },
  { emoji: '🌟', radius: 400, speed: -0.02, offset: Math.PI * 1.5, size: 45 },
  { emoji: '✨', radius: 360, speed: 0.018, offset: Math.PI / 4, size: 38 },
  { emoji: '⭐', radius: 440, speed: -0.012, offset: Math.PI * 1.25, size: 42 },
];

const recipes = [
  {
    title: 'Garlic Butter Pasta',
    cookTime: 15,
    difficulty: 'easy' as const,
    matchScore: 98,
    emoji: '🍝',
    delay: 0,
  },
  {
    title: 'Chicken Tomato Stir-Fry',
    cookTime: 20,
    difficulty: 'easy' as const,
    matchScore: 95,
    emoji: '🍳',
    delay: 15,
  },
  {
    title: 'Simple Marinara',
    cookTime: 25,
    difficulty: 'medium' as const,
    matchScore: 87,
    emoji: '🍅',
    delay: 30,
  },
];

export const Phase4Results: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Header animation
  const headerOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: 'clamp',
  });

  // Results count animation
  const countSpring = spring({
    frame: frame - 10,
    fps,
    config: { damping: 12 },
  });

  // Center point for orbiting
  const centerX = 540; // half of 1080
  const centerY = 700;

  return (
    <AbsoluteFill
      style={{
        background: colors.creamWhite,
        padding: spacing.xl,
      }}
    >
      {/* Floating ingredients in background */}
      <FloatingIngredients
        ingredients={['🍝', '🍗', '🍅', '🧄', '🧀']}
        density="low"
        animationStyle="float"
        entranceDelay={0}
      />
      {/* Header */}
      <div
        style={{
          position: 'absolute',
          top: 80,
          left: 0,
          right: 0,
          textAlign: 'center',
          opacity: headerOpacity,
        }}
      >
        <h2
          style={{
            fontFamily: typography.fontFamily,
            fontSize: typography.sizes.subtitle,
            fontWeight: typography.weights.bold,
            color: colors.charcoal,
            margin: 0,
          }}
        >
          Found{' '}
          <span style={{ color: colors.freshGreen }}>
            {Math.round(interpolate(countSpring, [0, 1], [0, 47]))}
          </span>{' '}
          recipes!
        </h2>
        <p
          style={{
            fontFamily: typography.fontFamily,
            fontSize: typography.sizes.body,
            color: colors.charcoal,
            opacity: 0.7,
            marginTop: 10,
          }}
        >
          Sorted by best match
        </p>
      </div>

      {/* Recipe cards */}
      <div
        style={{
          position: 'absolute',
          top: 300,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          gap: spacing.lg,
        }}
      >
        {recipes.map((recipe, index) => (
          <RecipeCard
            key={recipe.title}
            title={recipe.title}
            cookTime={recipe.cookTime}
            difficulty={recipe.difficulty}
            matchScore={recipe.matchScore}
            emoji={recipe.emoji}
            delay={30 + recipe.delay}
          />
        ))}
      </div>

      {/* "Tap to see details" hint */}
      {frame > 120 && (
        <div
          style={{
            position: 'absolute',
            bottom: 150,
            left: '50%',
            transform: 'translateX(-50%)',
            opacity: interpolate(frame, [120, 140], [0, 1]),
          }}
        >
          <div
            style={{
              background: colors.charcoal,
              borderRadius: 30,
              padding: '12px 30px',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <span style={{ fontSize: 24 }}>👆</span>
            <span
              style={{
                fontFamily: typography.fontFamily,
                fontSize: typography.sizes.caption,
                color: 'white',
              }}
            >
              Tap any recipe for details
            </span>
          </div>
        </div>
      )}

      {/* Orbiting sparkles around recipe cards */}
      {frame > 60 && orbitingSparkles.map((sparkle, index) => {
        const sparkleFrame = frame - 60;
        const angle = sparkleFrame * sparkle.speed + sparkle.offset;
        const x = centerX + Math.cos(angle) * sparkle.radius;
        const y = centerY + Math.sin(angle) * sparkle.radius * 0.6; // Elliptical orbit

        // Entrance animation
        const entranceScale = spring({
          frame: sparkleFrame - index * 5,
          fps,
          config: { damping: 12 },
        });

        // Pulsing opacity and scale
        const pulse = 0.7 + Math.sin(sparkleFrame * 0.1 + index) * 0.3;
        const scalePulse = 1 + Math.sin(sparkleFrame * 0.08 + index * 0.5) * 0.2;

        return (
          <div
            key={index}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              fontSize: sparkle.size,
              opacity: pulse * Math.max(0, entranceScale),
              transform: `translate(-50%, -50%) scale(${scalePulse * Math.max(0, entranceScale)}) rotate(${sparkleFrame * 2}deg)`,
              filter: 'drop-shadow(0 0 10px rgba(255, 215, 0, 0.5))',
            }}
          >
            {sparkle.emoji}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
