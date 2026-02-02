import React from 'react';
import { interpolate, useCurrentFrame, spring, useVideoConfig } from 'remotion';
import { colors, typography, spacing } from '../theme';

interface RecipeCardProps {
  title: string;
  cookTime: number;
  difficulty: 'easy' | 'medium' | 'hard';
  matchScore: number;
  emoji: string;
  delay?: number;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({
  title,
  cookTime,
  difficulty,
  matchScore,
  emoji,
  delay = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const slideIn = spring({
    frame: frame - delay,
    fps,
    config: { damping: 15, stiffness: 100 },
  });

  const difficultyColors = {
    easy: colors.freshGreen,
    medium: colors.softYellow,
    hard: colors.tomatoRed,
  };

  return (
    <div
      style={{
        opacity: interpolate(slideIn, [0, 1], [0, 1]),
        transform: `translateY(${interpolate(slideIn, [0, 1], [50, 0])}px)`,
        background: 'white',
        borderRadius: 24,
        padding: spacing.lg,
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        display: 'flex',
        alignItems: 'center',
        gap: spacing.md,
        width: 900,
      }}
    >
      {/* Emoji icon */}
      <div
        style={{
          width: 100,
          height: 100,
          borderRadius: 20,
          background: colors.creamWhite,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 50,
          flexShrink: 0,
        }}
      >
        {emoji}
      </div>

      {/* Content */}
      <div style={{ flex: 1 }}>
        <h3
          style={{
            fontFamily: typography.fontFamily,
            fontSize: typography.sizes.body,
            fontWeight: typography.weights.bold,
            color: colors.charcoal,
            margin: 0,
            marginBottom: 8,
          }}
        >
          {title}
        </h3>

        <div style={{ display: 'flex', gap: spacing.sm, alignItems: 'center' }}>
          {/* Cook time badge */}
          <div
            style={{
              background: colors.creamWhite,
              padding: '6px 16px',
              borderRadius: 20,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <span>⏱️</span>
            <span
              style={{
                fontFamily: typography.fontFamily,
                fontSize: typography.sizes.caption,
                color: colors.charcoal,
              }}
            >
              {cookTime} min
            </span>
          </div>

          {/* Difficulty badge */}
          <div
            style={{
              background: difficultyColors[difficulty],
              padding: '6px 16px',
              borderRadius: 20,
            }}
          >
            <span
              style={{
                fontFamily: typography.fontFamily,
                fontSize: typography.sizes.caption,
                fontWeight: typography.weights.semibold,
                color: 'white',
                textTransform: 'capitalize',
              }}
            >
              {difficulty}
            </span>
          </div>
        </div>
      </div>

      {/* Match score */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontFamily: typography.fontFamily,
            fontSize: typography.sizes.subtitle,
            fontWeight: typography.weights.extrabold,
            color: colors.freshGreen,
          }}
        >
          {matchScore}%
        </span>
        <span
          style={{
            fontFamily: typography.fontFamily,
            fontSize: typography.sizes.small,
            color: colors.charcoal,
            opacity: 0.6,
          }}
        >
          match
        </span>
      </div>
    </div>
  );
};
