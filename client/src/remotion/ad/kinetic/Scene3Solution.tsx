import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion';
import { colors, typography, spacing } from '../theme';

/**
 * Scene 3: Solution (10-18 seconds = 480 frames)
 *
 * Voiceover:
 * "Забудь про это."
 * "Просто открой Cook Is Easy."
 * "Выбери что у тебя есть..."
 *
 * Visual: Swipe transition, logo reveal, app interface
 */

// Animated text reveal
const AnimatedText: React.FC<{
  text: string;
  delay: number;
  fontSize?: number;
  color?: string;
  style?: React.CSSProperties;
}> = ({ text, delay, fontSize = 48, color = 'white', style = {} }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const animFrame = frame - delay;
  if (animFrame < 0) return null;

  const slideUp = spring({
    frame: animFrame,
    fps,
    config: { damping: 15, stiffness: 150 },
  });

  const opacity = interpolate(animFrame, [0, 10], [0, 1], { extrapolateRight: 'clamp' });

  return (
    <div
      style={{
        transform: `translateY(${(1 - slideUp) * 50}px)`,
        opacity,
        fontSize,
        fontWeight: typography.weights.bold,
        color,
        ...style,
      }}
    >
      {text}
    </div>
  );
};

// Ingredient chip with selection animation
const SelectableChip: React.FC<{
  emoji: string;
  label: string;
  delay: number;
}> = ({ emoji, label, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const animFrame = frame - delay;
  if (animFrame < 0) return null;

  const scale = spring({
    frame: animFrame,
    fps,
    config: { damping: 10, stiffness: 300 },
  });

  // Glow pulse after appearing
  const glowPulse = animFrame > 20 ? Math.sin((animFrame - 20) * 0.1) * 0.3 + 0.7 : 0;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        backgroundColor: colors.warmOrange,
        borderRadius: 50,
        padding: '12px 24px',
        transform: `scale(${scale})`,
        boxShadow: `0 0 ${20 * glowPulse}px ${colors.warmOrange}80`,
      }}
    >
      <span style={{ fontSize: 32 }}>{emoji}</span>
      <span
        style={{
          fontSize: 28,
          fontWeight: typography.weights.semibold,
          color: 'white',
        }}
      >
        {label}
      </span>
    </div>
  );
};

export const Scene3Solution: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Scene timeline (8 seconds = 480 frames)
  // 0-60: Swipe transition "Забудь про это"
  // 60-180: Logo appears with "Просто открой Cook Is Easy"
  // 180-480: Phone UI with ingredient selection

  // Swipe wipe transition
  const swipeProgress = interpolate(frame, [0, 40], [0, 1], { extrapolateRight: 'clamp' });

  // Logo animation
  const logoScale = spring({
    frame: Math.max(0, frame - 60),
    fps,
    config: { damping: 12, stiffness: 180 },
  });

  const logoGlow = frame > 80 ? Math.sin((frame - 80) * 0.05) * 0.3 + 0.7 : 0;

  // Phone slide up
  const phoneSlide = spring({
    frame: Math.max(0, frame - 180),
    fps,
    config: { damping: 15, stiffness: 100 },
  });

  // Counter animation
  const counterFrame = Math.max(0, frame - 380);
  const counterValue = Math.min(3, Math.floor(counterFrame / 30) + 1);

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(180deg,
          ${colors.creamWhite} 0%,
          #f0f0f0 100%
        )`,
        overflow: 'hidden',
      }}
    >
      {/* Swipe wipe overlay */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `linear-gradient(90deg,
            transparent ${swipeProgress * 100 - 20}%,
            ${colors.warmOrange} ${swipeProgress * 100}%,
            ${colors.freshGreen} ${swipeProgress * 100 + 5}%
          )`,
          transform: `translateX(${(1 - swipeProgress) * 100}%)`,
          zIndex: swipeProgress < 1 ? 10 : -1,
        }}
      />

      {/* "Забудь про это" text */}
      {frame < 80 && (
        <div
          style={{
            position: 'absolute',
            top: '40%',
            left: 0,
            right: 0,
            textAlign: 'center',
            opacity: interpolate(frame, [20, 40, 60, 80], [0, 1, 1, 0]),
            transform: `translateX(${interpolate(frame, [60, 80], [0, -200])}px)`,
          }}
        >
          <AnimatedText
            text="Забудь про это."
            delay={0}
            fontSize={64}
            color={colors.charcoal}
          />
        </div>
      )}

      {/* Logo section */}
      {frame >= 60 && frame < 240 && (
        <div
          style={{
            position: 'absolute',
            top: '30%',
            left: 0,
            right: 0,
            textAlign: 'center',
            transform: `scale(${logoScale})`,
            opacity: interpolate(frame, [180, 220], [1, 0], { extrapolateRight: 'clamp' }),
          }}
        >
          {/* App Icon */}
          <div
            style={{
              width: 150,
              height: 150,
              margin: '0 auto 30px',
              background: `linear-gradient(135deg, ${colors.warmOrange}, ${colors.tomatoRed})`,
              borderRadius: 35,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 80,
              boxShadow: `0 0 ${40 * logoGlow}px ${colors.warmOrange}80`,
            }}
          >
            🍳
          </div>

          {/* Logo text */}
          <div
            style={{
              fontSize: 72,
              fontWeight: typography.weights.extrabold,
              color: colors.charcoal,
            }}
          >
            Cook Is Easy
          </div>

          {/* Subtitle */}
          <AnimatedText
            text="Просто открой"
            delay={90}
            fontSize={36}
            color={colors.charcoal}
            style={{ marginTop: 20, opacity: 0.7 }}
          />
        </div>
      )}

      {/* Phone mockup with app interface */}
      {frame >= 180 && (
        <div
          style={{
            position: 'absolute',
            bottom: -100 + phoneSlide * 100,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 380,
            height: 800,
            background: '#1a1a1a',
            borderRadius: '50px 50px 0 0',
            padding: 15,
            opacity: phoneSlide,
          }}
        >
          {/* Phone screen */}
          <div
            style={{
              width: '100%',
              height: '100%',
              background: colors.creamWhite,
              borderRadius: '40px 40px 0 0',
              overflow: 'hidden',
              padding: 20,
            }}
          >
            {/* App header */}
            <div
              style={{
                fontSize: 28,
                fontWeight: typography.weights.bold,
                color: colors.charcoal,
                marginBottom: 20,
                textAlign: 'center',
              }}
            >
              🍳 Cook Is Easy
            </div>

            {/* "Выбери что у тебя есть" text */}
            {frame >= 220 && (
              <div
                style={{
                  fontSize: 22,
                  color: colors.charcoal,
                  textAlign: 'center',
                  marginBottom: 30,
                  opacity: interpolate(frame, [220, 250], [0, 1]),
                }}
              >
                Выбери что у тебя есть:
              </div>
            )}

            {/* Selected ingredients */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 15,
                alignItems: 'center',
              }}
            >
              <SelectableChip emoji="🍗" label="Курица" delay={280} />
              <SelectableChip emoji="🍅" label="Помидоры" delay={320} />
              <SelectableChip emoji="🧀" label="Сыр" delay={360} />
            </div>

            {/* Counter */}
            {frame >= 380 && (
              <div
                style={{
                  position: 'absolute',
                  bottom: 150,
                  left: 0,
                  right: 0,
                  textAlign: 'center',
                  opacity: interpolate(frame, [380, 410], [0, 1]),
                }}
              >
                <div
                  style={{
                    fontSize: 24,
                    color: colors.freshGreen,
                    fontWeight: typography.weights.semibold,
                  }}
                >
                  {counterValue} ингредиента выбрано
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Floating decoration */}
      {frame >= 60 && (
        <>
          {['🥗', '🍲', '🥘', '🍝'].map((emoji, i) => {
            const angle = (i / 4) * Math.PI * 2 + frame * 0.008;
            const radius = 450;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius * 0.5 - 100;

            return (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: `translate(${x}px, ${y}px) scale(${0.8})`,
                  fontSize: 60,
                  opacity: 0.2,
                }}
              >
                {emoji}
              </div>
            );
          })}
        </>
      )}
    </AbsoluteFill>
  );
};
