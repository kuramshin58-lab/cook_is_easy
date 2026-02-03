import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  spring,
  useVideoConfig,
} from 'remotion';
import { colors, typography } from '../theme';
import { AppLogo } from '../ui/AppLogo';
import { BackgroundParticles } from '../animations/BackgroundParticles';

// Floating ingredient chips around the phone
const floatingChips = [
  { emoji: '🍗', label: 'Chicken', x: 80, y: 700, delay: 120 },
  { emoji: '🍅', label: 'Tomato', x: 920, y: 750, delay: 140 },
  { emoji: '🧄', label: 'Garlic', x: 100, y: 950, delay: 160 },
  { emoji: '🧀', label: 'Cheese', x: 900, y: 1000, delay: 180 },
  { emoji: '🥕', label: 'Carrot', x: 120, y: 1200, delay: 200 },
  { emoji: '🧅', label: 'Onion', x: 880, y: 1250, delay: 220 },
];

// Typing animation text
const typingText = 'chicken, tomato, garlic...';

export const Phase2Solution: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Background transition
  const bgProgress = interpolate(frame, [0, 30], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Phone mockup slide up
  const phoneY = spring({
    frame: frame - 60,
    fps,
    config: { damping: 15, stiffness: 80 },
  });

  const phoneOpacity = interpolate(frame, [60, 80], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Phone glow effect
  const glowIntensity = interpolate(
    Math.sin(frame * 0.05),
    [-1, 1],
    [0.3, 0.6]
  );

  // Typing animation - show characters one by one
  const typingProgress = Math.floor(
    interpolate(frame, [150, 300], [0, typingText.length], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    })
  );
  const displayedText = typingText.slice(0, typingProgress);
  const showCursor = frame > 150 && frame % 30 < 15;

  return (
    <AbsoluteFill
      style={{
        background: interpolate(
          bgProgress,
          [0, 1],
          [0, 1]
        ) > 0.5
          ? colors.creamWhite
          : colors.gradients.warm,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {/* Background particles */}
      <BackgroundParticles
        count={12}
        emojis={['✨', '💡', '🔍']}
        color="rgba(255, 107, 53, 0.1)"
        minOpacity={0.05}
        maxOpacity={0.15}
      />
      {/* Transition wipe effect */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: `${(1 - bgProgress) * 100}%`,
          background: colors.creamWhite,
        }}
      />

      {/* App Logo */}
      <div
        style={{
          position: 'absolute',
          top: 250,
        }}
      >
        <AppLogo animated scale={1.2} />
      </div>

      {/* Floating ingredient chips */}
      {floatingChips.map((chip, index) => {
        const chipFrame = frame - chip.delay;
        const chipScale = spring({
          frame: chipFrame,
          fps,
          config: { damping: 12 },
        });
        const floatY = Math.sin(chipFrame * 0.03) * 15;
        const floatX = Math.cos(chipFrame * 0.02) * 10;

        return (
          <div
            key={index}
            style={{
              position: 'absolute',
              left: chip.x,
              top: chip.y + floatY,
              transform: `translateX(${floatX}px) scale(${Math.max(0, chipScale)})`,
              background: 'white',
              borderRadius: 25,
              padding: '12px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
              opacity: chipFrame > 0 ? 1 : 0,
            }}
          >
            <span style={{ fontSize: 24 }}>{chip.emoji}</span>
            <span
              style={{
                fontFamily: typography.fontFamily,
                fontSize: 18,
                fontWeight: typography.weights.semibold,
                color: colors.charcoal,
              }}
            >
              {chip.label}
            </span>
          </div>
        );
      })}

      {/* Phone mockup with GLOW */}
      <div
        style={{
          position: 'absolute',
          bottom: interpolate(phoneY, [0, 1], [-400, 100]),
          opacity: phoneOpacity,
        }}
      >
        {/* Glow effect behind phone */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 450,
            height: 850,
            background: `radial-gradient(circle, rgba(255, 107, 53, ${glowIntensity}) 0%, transparent 70%)`,
            filter: 'blur(40px)',
            zIndex: -1,
          }}
        />

        {/* Phone frame */}
        <div
          style={{
            width: 380,
            height: 780,
            background: colors.charcoal,
            borderRadius: 50,
            padding: 12,
            boxShadow: `0 30px 60px rgba(0,0,0,0.3), 0 0 80px rgba(255, 107, 53, ${glowIntensity * 0.5})`,
          }}
        >
          {/* Screen */}
          <div
            style={{
              width: '100%',
              height: '100%',
              background: 'white',
              borderRadius: 40,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: 30,
            }}
          >
            {/* App header mockup */}
            <div
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                marginBottom: 30,
              }}
            >
              <div
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 12,
                  background: colors.gradients.primary,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <span style={{ fontSize: 28 }}>🍳</span>
              </div>
              <span
                style={{
                  fontFamily: typography.fontFamily,
                  fontSize: 24,
                  fontWeight: typography.weights.bold,
                  color: colors.charcoal,
                }}
              >
                Fridgely
              </span>
            </div>

            {/* Search bar mockup with typing animation */}
            <div
              style={{
                width: '100%',
                height: 60,
                background: frame > 150 ? 'white' : colors.creamWhite,
                borderRadius: 30,
                display: 'flex',
                alignItems: 'center',
                padding: '0 24px',
                gap: 12,
                border: frame > 150 ? `2px solid ${colors.warmOrange}` : '2px solid transparent',
                transition: 'all 0.3s',
              }}
            >
              <span style={{ fontSize: 24 }}>🔍</span>
              <span
                style={{
                  fontFamily: typography.fontFamily,
                  fontSize: 18,
                  color: frame > 150 ? colors.charcoal : '#999',
                }}
              >
                {frame > 150 ? (
                  <>
                    {displayedText}
                    {showCursor && <span style={{ color: colors.warmOrange }}>|</span>}
                  </>
                ) : (
                  'What ingredients do you have?'
                )}
              </span>
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
