import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  spring,
  useVideoConfig,
} from 'remotion';
import { colors, typography, spacing } from '../theme';
import { IngredientIcon, IngredientType } from '../illustrations/IngredientIcon';
import { BackgroundParticles } from '../animations/BackgroundParticles';

const selectedIngredients: { type: IngredientType; name: string; delay: number }[] = [
  { type: 'chicken', name: 'Chicken', delay: 0 },
  { type: 'tomato', name: 'Tomato', delay: 30 },
  { type: 'garlic', name: 'Garlic', delay: 60 },
  { type: 'pasta', name: 'Pasta', delay: 90 },
];

const IngredientChip: React.FC<{
  type: IngredientType;
  name: string;
  delay: number;
  selected: boolean;
  index: number;
}> = ({ type, name, delay, selected, index }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({
    frame: frame - delay,
    fps,
    config: { damping: 12, stiffness: 150 },
  });

  const checkScale = spring({
    frame: frame - delay - 15,
    fps,
    config: { damping: 10 },
  });

  // Pulse effect when selected
  const selectionFrame = frame - delay - 15;
  const pulseScale = selected && selectionFrame > 0 && selectionFrame < 30
    ? 1 + Math.sin(selectionFrame * 0.3) * 0.08
    : 1;

  // Shimmer effect - moving highlight
  const shimmerPosition = ((frame - delay) * 3) % 400 - 100;
  const showShimmer = selected && frame > delay + 30;

  // Glow intensity when selected
  const glowIntensity = selected ? 0.4 + Math.sin(frame * 0.1) * 0.1 : 0;

  return (
    <div
      style={{
        transform: `scale(${Math.max(0, scale * pulseScale)})`,
        opacity: interpolate(scale, [0, 0.5, 1], [0, 0.5, 1]),
        background: selected ? colors.freshGreen : 'white',
        borderRadius: 60,
        padding: '16px 32px',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        boxShadow: selected
          ? `0 8px 24px rgba(76, 175, 80, 0.3), 0 0 ${30 + glowIntensity * 20}px rgba(76, 175, 80, ${glowIntensity})`
          : '0 4px 16px rgba(0,0,0,0.1)',
        border: `3px solid ${selected ? colors.freshGreen : '#eee'}`,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Shimmer effect */}
      {showShimmer && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: shimmerPosition,
            width: 100,
            height: '100%',
            background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)',
            transform: 'skewX(-20deg)',
            pointerEvents: 'none',
          }}
        />
      )}
      <IngredientIcon type={type} size={50} />
      <span
        style={{
          fontFamily: typography.fontFamily,
          fontSize: typography.sizes.body,
          fontWeight: typography.weights.semibold,
          color: selected ? 'white' : colors.charcoal,
        }}
      >
        {name}
      </span>
      {selected && (
        <span
          style={{
            fontSize: 28,
            transform: `scale(${Math.max(0, checkScale)})`,
          }}
        >
          ✓
        </span>
      )}
    </div>
  );
};

export const Phase3Magic: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Counter animation - smooth interpolation
  const rawCount = Math.min(4, Math.floor(frame / 30));
  const smoothCount = interpolate(frame, [0, 30, 60, 90, 120], [0, 1, 2, 3, 4], {
    extrapolateRight: 'clamp',
  });
  // Display with smooth spring for number
  const displayCount = Math.floor(smoothCount);

  // Button appears
  const buttonDelay = 150;
  const buttonScale = spring({
    frame: frame - buttonDelay,
    fps,
    config: { damping: 12 },
  });

  // Button pulse when ready
  const buttonPulse = frame > buttonDelay + 30
    ? 1 + Math.sin((frame - buttonDelay) * 0.1) * 0.03
    : 1;

  // Loading spinner
  const isSearching = frame > 200;
  const spinnerRotation = (frame - 200) * 8;

  // Counter scale bounce when changing
  const counterBounce = spring({
    frame: frame % 30,
    fps,
    config: { damping: 8, stiffness: 200 },
  });

  return (
    <AbsoluteFill
      style={{
        background: colors.creamWhite,
        padding: spacing.xl,
      }}
    >
      {/* Background particles */}
      <BackgroundParticles
        count={10}
        emojis={['✨', '🔮', '💫']}
        color="rgba(76, 175, 80, 0.15)"
        minOpacity={0.05}
        maxOpacity={0.15}
      />
      {/* Header */}
      <div
        style={{
          position: 'absolute',
          top: 100,
          left: 0,
          right: 0,
          textAlign: 'center',
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
          Select your ingredients
        </h2>
      </div>

      {/* Ingredient chips */}
      <div
        style={{
          position: 'absolute',
          top: 300,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          gap: spacing.md,
          alignItems: 'center',
        }}
      >
        {selectedIngredients.map((ing, index) => (
          <IngredientChip
            key={ing.type}
            type={ing.type}
            name={ing.name}
            delay={ing.delay}
            selected={frame > ing.delay + 15}
            index={index}
          />
        ))}
      </div>

      {/* Counter with bounce animation */}
      <div
        style={{
          position: 'absolute',
          top: 900,
          left: '50%',
          transform: 'translateX(-50%)',
          textAlign: 'center',
        }}
      >
        <span
          style={{
            fontFamily: typography.fontFamily,
            fontSize: typography.sizes.hero,
            fontWeight: typography.weights.extrabold,
            color: colors.warmOrange,
            display: 'inline-block',
            transform: `scale(${0.9 + counterBounce * 0.2})`,
            textShadow: `0 0 ${20 + displayCount * 5}px rgba(255, 107, 53, 0.3)`,
          }}
        >
          {displayCount}
        </span>
        <span
          style={{
            fontFamily: typography.fontFamily,
            fontSize: typography.sizes.body,
            color: colors.charcoal,
            display: 'block',
          }}
        >
          ingredients selected
        </span>
      </div>

      {/* Find Recipes button with pulse */}
      {frame > buttonDelay && !isSearching && (
        <div
          style={{
            position: 'absolute',
            bottom: 300,
            left: '50%',
            transform: `translateX(-50%) scale(${Math.max(0, buttonScale * buttonPulse)})`,
          }}
        >
          {/* Glow behind button */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 350,
              height: 100,
              background: `radial-gradient(circle, rgba(255, 107, 53, ${0.3 + Math.sin(frame * 0.1) * 0.1}) 0%, transparent 70%)`,
              filter: 'blur(20px)',
              zIndex: -1,
            }}
          />
          <button
            style={{
              background: colors.gradients.primary,
              border: 'none',
              borderRadius: 50,
              padding: '24px 60px',
              boxShadow: `0 10px 40px rgba(255, 107, 53, 0.4), 0 0 60px rgba(255, 107, 53, ${0.2 + Math.sin(frame * 0.1) * 0.1})`,
              cursor: 'pointer',
            }}
          >
            <span
              style={{
                fontFamily: typography.fontFamily,
                fontSize: typography.sizes.body,
                fontWeight: typography.weights.bold,
                color: 'white',
              }}
            >
              🔍 Find Recipes
            </span>
          </button>
        </div>
      )}

      {/* Loading spinner */}
      {isSearching && (
        <div
          style={{
            position: 'absolute',
            bottom: 300,
            left: '50%',
            transform: 'translateX(-50%)',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: 80,
              height: 80,
              border: `6px solid ${colors.creamWhite}`,
              borderTop: `6px solid ${colors.warmOrange}`,
              borderRadius: '50%',
              transform: `rotate(${spinnerRotation}deg)`,
              margin: '0 auto 20px',
            }}
          />
          <span
            style={{
              fontFamily: typography.fontFamily,
              fontSize: typography.sizes.body,
              color: colors.charcoal,
            }}
          >
            Finding recipes...
          </span>
        </div>
      )}
    </AbsoluteFill>
  );
};
