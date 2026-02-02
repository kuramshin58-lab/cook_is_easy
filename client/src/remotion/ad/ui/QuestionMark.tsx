import React from 'react';
import { interpolate, useCurrentFrame, spring, useVideoConfig } from 'remotion';
import { colors, typography } from '../theme';

interface QuestionMarkProps {
  animated?: boolean;
}

export const QuestionMark: React.FC<QuestionMarkProps> = ({ animated = true }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = animated
    ? spring({ frame, fps, config: { damping: 10, stiffness: 80 } })
    : 1;

  const wobble = animated
    ? Math.sin(frame * 0.15) * 5
    : 0;

  return (
    <div
      style={{
        transform: `scale(${scale}) rotate(${wobble}deg)`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <span
        style={{
          fontSize: 180,
          fontFamily: typography.fontFamily,
          fontWeight: typography.weights.extrabold,
          color: colors.warmOrange,
          textShadow: '0 10px 30px rgba(255, 107, 53, 0.3)',
        }}
      >
        ?
      </span>
    </div>
  );
};
