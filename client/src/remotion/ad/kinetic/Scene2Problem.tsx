import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion';
import { colors, typography, spacing } from '../theme';

/**
 * Scene 2: Problem (3-10 seconds = 420 frames)
 *
 * Voiceover:
 * "...и понятия не имеешь, что из этого приготовить."
 * "Курица... помидоры... это что вообще?"
 * "Знакомо?"
 *
 * Visual: Kinetic typography with ingredient chaos
 */

// Kinetic text word-by-word component
const KineticWord: React.FC<{
  word: string;
  delay: number;
  style?: React.CSSProperties;
  emphasis?: boolean;
}> = ({ word, delay, style = {}, emphasis = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const animFrame = frame - delay;
  if (animFrame < 0) return null;

  const scale = spring({
    frame: animFrame,
    fps,
    config: { damping: 12, stiffness: 200 },
  });

  const opacity = interpolate(animFrame, [0, 5], [0, 1], { extrapolateRight: 'clamp' });

  return (
    <span
      style={{
        display: 'inline-block',
        transform: `scale(${scale})`,
        opacity,
        color: emphasis ? colors.warmOrange : 'white',
        marginRight: 20,
        ...style,
      }}
    >
      {word}
    </span>
  );
};

// Ingredient chip with bounce animation
const IngredientChip: React.FC<{
  emoji: string;
  label: string;
  delay: number;
  success?: boolean;
}> = ({ emoji, label, delay, success = true }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const animFrame = frame - delay;
  if (animFrame < 0) return null;

  const scale = spring({
    frame: animFrame,
    fps,
    config: { damping: 10, stiffness: 300 },
  });

  const shake = success ? 0 : Math.sin(animFrame * 0.5) * 5;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 15,
        backgroundColor: success ? 'rgba(76, 175, 80, 0.2)' : 'rgba(229, 57, 53, 0.2)',
        border: `3px solid ${success ? colors.freshGreen : colors.tomatoRed}`,
        borderRadius: 20,
        padding: '15px 25px',
        transform: `scale(${scale}) translateX(${shake}px)`,
      }}
    >
      <span style={{ fontSize: 50 }}>{emoji}</span>
      <span
        style={{
          fontSize: 36,
          fontWeight: typography.weights.bold,
          color: 'white',
        }}
      >
        {label}
      </span>
      <span style={{ fontSize: 36 }}>{success ? '✓' : '???'}</span>
    </div>
  );
};

export const Scene2Problem: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Scene timeline (7 seconds = 420 frames)
  // 0-120: "...и понятия не имеешь что приготовить"
  // 120-300: Ingredient chips appear
  // 300-420: "ЗНАКОМО?" with shake

  // Background pulse
  const bgPulse = Math.sin(frame * 0.03) * 0.1 + 0.9;

  // "ЗНАКОМО?" shake effect (last 2 seconds)
  const shakePhase = frame > 300;
  const shakeX = shakePhase ? Math.sin(frame * 2) * 8 : 0;
  const shakeY = shakePhase ? Math.cos(frame * 2.5) * 5 : 0;

  // Final question scale
  const questionScale = spring({
    frame: Math.max(0, frame - 300),
    fps,
    config: { damping: 8, stiffness: 150 },
  });

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(135deg,
          rgba(30, 30, 50, ${bgPulse}) 0%,
          rgba(45, 45, 60, ${bgPulse}) 100%
        )`,
        overflow: 'hidden',
      }}
    >
      {/* Confused background emojis */}
      {['❓', '🤷', '😕', '❓', '🤔'].map((emoji, i) => {
        const angle = (i / 5) * Math.PI * 2 + frame * 0.01;
        const radius = 600;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;

        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: `translate(${x}px, ${y}px)`,
              fontSize: 100,
              opacity: 0.15,
            }}
          >
            {emoji}
          </div>
        );
      })}

      {/* Main text section */}
      <div
        style={{
          position: 'absolute',
          top: '15%',
          left: 0,
          right: 0,
          padding: spacing.xl,
          textAlign: 'center',
        }}
      >
        {/* Line 1: "...и понятия не имеешь" */}
        <div
          style={{
            fontSize: typography.sizes.subtitle,
            fontWeight: typography.weights.semibold,
            marginBottom: 20,
            lineHeight: 1.3,
          }}
        >
          <KineticWord word="...и" delay={0} />
          <KineticWord word="понятия" delay={8} emphasis />
          <KineticWord word="не" delay={16} />
          <KineticWord word="имеешь," delay={24} />
        </div>

        {/* Line 2: "что из этого приготовить" */}
        <div
          style={{
            fontSize: typography.sizes.subtitle,
            fontWeight: typography.weights.semibold,
            lineHeight: 1.3,
          }}
        >
          <KineticWord word="что" delay={35} />
          <KineticWord word="из" delay={42} />
          <KineticWord word="этого" delay={50} />
          <KineticWord word="приготовить." delay={58} emphasis />
        </div>
      </div>

      {/* Ingredient chips section */}
      <div
        style={{
          position: 'absolute',
          top: '40%',
          left: 0,
          right: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 25,
        }}
      >
        <IngredientChip emoji="🍗" label="Курица" delay={120} success />
        <IngredientChip emoji="🍅" label="Помидоры" delay={150} success />
        <IngredientChip emoji="🫙" label="Это что вообще" delay={200} success={false} />
      </div>

      {/* Big "ЗНАКОМО?" at the end */}
      {frame > 280 && (
        <div
          style={{
            position: 'absolute',
            bottom: '15%',
            left: 0,
            right: 0,
            textAlign: 'center',
            transform: `translate(${shakeX}px, ${shakeY}px) scale(${questionScale})`,
          }}
        >
          <div
            style={{
              fontSize: 120,
              fontWeight: typography.weights.extrabold,
              color: colors.warmOrange,
              textShadow: `
                0 0 20px ${colors.warmOrange}60,
                0 4px 0 ${colors.tomatoRed}
              `,
              letterSpacing: -2,
            }}
          >
            ЗНАКОМО?
          </div>
        </div>
      )}

      {/* Sad trombone visual hint */}
      {frame > 350 && (
        <div
          style={{
            position: 'absolute',
            bottom: '5%',
            right: '10%',
            fontSize: 80,
            opacity: interpolate(frame, [350, 380], [0, 1], { extrapolateRight: 'clamp' }),
            transform: `rotate(${Math.sin(frame * 0.1) * 10}deg)`,
          }}
        >
          😅
        </div>
      )}
    </AbsoluteFill>
  );
};
