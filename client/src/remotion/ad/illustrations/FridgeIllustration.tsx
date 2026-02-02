import React from 'react';
import { interpolate, useCurrentFrame, spring, useVideoConfig } from 'remotion';
import { colors } from '../theme';

interface FridgeIllustrationProps {
  isOpen?: boolean;
  scale?: number;
}

export const FridgeIllustration: React.FC<FridgeIllustrationProps> = ({
  isOpen = false,
  scale = 1,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const doorRotation = isOpen
    ? spring({ frame, fps, config: { damping: 15, stiffness: 100 } }) * -60
    : 0;

  return (
    <svg
      width={300 * scale}
      height={450 * scale}
      viewBox="0 0 300 450"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Fridge body */}
      <rect
        x="20"
        y="20"
        width="260"
        height="410"
        rx="20"
        fill={colors.creamWhite}
        stroke={colors.charcoal}
        strokeWidth="4"
      />

      {/* Freezer section */}
      <rect
        x="30"
        y="30"
        width="240"
        height="100"
        rx="10"
        fill="#E8E8E8"
      />

      {/* Main section */}
      <rect
        x="30"
        y="140"
        width="240"
        height="280"
        rx="10"
        fill="#F5F5F5"
      />

      {/* Shelves */}
      <rect x="30" y="200" width="240" height="4" fill="#DDD" />
      <rect x="30" y="280" width="240" height="4" fill="#DDD" />
      <rect x="30" y="360" width="240" height="4" fill="#DDD" />

      {/* Door (animated) */}
      <g
        style={{
          transformOrigin: '270px 225px',
          transform: `rotateY(${doorRotation}deg)`,
        }}
      >
        {/* Door panel */}
        <rect
          x="25"
          y="25"
          width="250"
          height="400"
          rx="15"
          fill={colors.creamWhite}
          stroke={colors.charcoal}
          strokeWidth="3"
          opacity={isOpen ? 0.3 : 1}
        />

        {/* Freezer handle */}
        <rect
          x="240"
          y="60"
          width="8"
          height="50"
          rx="4"
          fill={colors.charcoal}
        />

        {/* Main handle */}
        <rect
          x="240"
          y="200"
          width="8"
          height="80"
          rx="4"
          fill={colors.charcoal}
        />
      </g>
    </svg>
  );
};
