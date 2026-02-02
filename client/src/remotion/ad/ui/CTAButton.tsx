import React from 'react';
import { interpolate, useCurrentFrame, spring, useVideoConfig } from 'remotion';
import { colors, typography, spacing } from '../theme';

interface CTAButtonProps {
  text: string;
  pulsing?: boolean;
  delay?: number;
}

export const CTAButton: React.FC<CTAButtonProps> = ({
  text,
  pulsing = true,
  delay = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scaleIn = spring({
    frame: frame - delay,
    fps,
    config: { damping: 12, stiffness: 100 },
  });

  const pulseScale = pulsing
    ? 1 + Math.sin((frame - delay) * 0.1) * 0.03
    : 1;

  return (
    <div
      style={{
        opacity: interpolate(scaleIn, [0, 1], [0, 1]),
        transform: `scale(${scaleIn * pulseScale})`,
      }}
    >
      <button
        style={{
          background: colors.gradients.primary,
          border: 'none',
          borderRadius: 50,
          padding: `${spacing.md}px ${spacing.xl}px`,
          cursor: 'pointer',
          boxShadow: '0 10px 40px rgba(255, 107, 53, 0.4)',
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
          {text}
        </span>
      </button>
    </div>
  );
};

interface StatBubbleProps {
  value: string;
  label: string;
  delay?: number;
  icon?: string;
}

export const StatBubble: React.FC<StatBubbleProps> = ({
  value,
  label,
  delay = 0,
  icon,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scaleIn = spring({
    frame: frame - delay,
    fps,
    config: { damping: 15, stiffness: 120 },
  });

  return (
    <div
      style={{
        opacity: interpolate(scaleIn, [0, 1], [0, 1]),
        transform: `scale(${scaleIn})`,
        background: 'white',
        borderRadius: 20,
        padding: `${spacing.md}px ${spacing.lg}px`,
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        display: 'flex',
        alignItems: 'center',
        gap: spacing.sm,
      }}
    >
      {icon && <span style={{ fontSize: 32 }}>{icon}</span>}
      <div>
        <div
          style={{
            fontFamily: typography.fontFamily,
            fontSize: typography.sizes.body,
            fontWeight: typography.weights.extrabold,
            color: colors.warmOrange,
          }}
        >
          {value}
        </div>
        <div
          style={{
            fontFamily: typography.fontFamily,
            fontSize: typography.sizes.caption,
            color: colors.charcoal,
            opacity: 0.7,
          }}
        >
          {label}
        </div>
      </div>
    </div>
  );
};
