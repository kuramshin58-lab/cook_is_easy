import React from 'react';
import { interpolate, useCurrentFrame, spring, useVideoConfig } from 'remotion';
import { colors, typography } from '../theme';

interface AppLogoProps {
  animated?: boolean;
  scale?: number;
}

export const AppLogo: React.FC<AppLogoProps> = ({ animated = true, scale = 1 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoScale = animated
    ? spring({ frame, fps, config: { damping: 12, stiffness: 100 } })
    : 1;

  const textOpacity = animated
    ? interpolate(frame, [10, 25], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    : 1;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 20 * scale,
        transform: `scale(${logoScale * scale})`,
      }}
    >
      {/* Logo icon */}
      <div
        style={{
          width: 120 * scale,
          height: 120 * scale,
          borderRadius: 30 * scale,
          background: colors.gradients.primary,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 10px 40px rgba(255, 107, 53, 0.4)',
        }}
      >
        <span style={{ fontSize: 60 * scale }}>🍳</span>
      </div>

      {/* Logo text */}
      <div
        style={{
          opacity: textOpacity,
          textAlign: 'center',
        }}
      >
        <h1
          style={{
            fontFamily: typography.fontFamily,
            fontSize: typography.sizes.title * scale,
            fontWeight: typography.weights.extrabold,
            color: colors.charcoal,
            margin: 0,
            lineHeight: 1,
          }}
        >
          Cook Is Easy
        </h1>
        <p
          style={{
            fontFamily: typography.fontFamily,
            fontSize: typography.sizes.body * scale,
            fontWeight: typography.weights.medium,
            color: colors.warmOrange,
            margin: 0,
            marginTop: 8 * scale,
          }}
        >
          Find recipes with what you have
        </p>
      </div>
    </div>
  );
};
