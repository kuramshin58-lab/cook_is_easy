import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion';
import { colors, typography, spacing } from '../theme';

/**
 * Scene 4: Demo (18-32 seconds = 840 frames)
 *
 * Voiceover:
 * "...нажми поиск..."
 * "Бам! 47 рецептов за секунду."
 * "Смотри - паста с курицей, 98% совпадение."
 * "Двадцать минут. Из того, что уже есть."
 *
 * Visual: Search button, explosion of results, recipe cards
 */

// Ripple effect component
const Ripple: React.FC<{ delay: number; x: number; y: number }> = ({ delay, x, y }) => {
  const frame = useCurrentFrame();
  const animFrame = frame - delay;
  if (animFrame < 0 || animFrame > 60) return null;

  const scale = interpolate(animFrame, [0, 60], [0, 3]);
  const opacity = interpolate(animFrame, [0, 20, 60], [0.8, 0.4, 0]);

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: 200,
        height: 200,
        borderRadius: '50%',
        border: `4px solid ${colors.warmOrange}`,
        transform: `translate(-50%, -50%) scale(${scale})`,
        opacity,
      }}
    />
  );
};

// Animated number counter
const NumberCounter: React.FC<{
  target: number;
  delay: number;
  duration?: number;
  fontSize?: number;
  color?: string;
}> = ({ target, delay, duration = 30, fontSize = 120, color = colors.warmOrange }) => {
  const frame = useCurrentFrame();
  const animFrame = Math.max(0, frame - delay);

  const progress = interpolate(animFrame, [0, duration], [0, 1], { extrapolateRight: 'clamp' });
  const value = Math.floor(progress * target);

  const scale = spring({
    frame: animFrame,
    fps: 60,
    config: { damping: 10, stiffness: 200 },
  });

  if (frame < delay) return null;

  return (
    <span
      style={{
        display: 'inline-block',
        fontSize,
        fontWeight: typography.weights.extrabold,
        color,
        transform: `scale(${scale})`,
        textShadow: `0 0 30px ${color}60`,
      }}
    >
      {value}
    </span>
  );
};

// Recipe card component
const RecipeCard: React.FC<{
  title: string;
  matchPercent: number;
  time: string;
  difficulty: string;
  delay: number;
  featured?: boolean;
  position?: { x: number; y: number };
}> = ({ title, matchPercent, time, difficulty, delay, featured = false, position }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const animFrame = frame - delay;
  if (animFrame < 0) return null;

  const slideUp = spring({
    frame: animFrame,
    fps,
    config: { damping: 12, stiffness: featured ? 150 : 200 },
  });

  const glowPulse = featured && animFrame > 30 ? Math.sin((animFrame - 30) * 0.08) * 0.3 + 0.7 : 0;

  const style: React.CSSProperties = {
    background: 'white',
    borderRadius: 25,
    padding: featured ? 30 : 20,
    boxShadow: featured
      ? `0 10px 40px rgba(0,0,0,0.2), 0 0 ${30 * glowPulse}px ${colors.freshGreen}60`
      : '0 5px 20px rgba(0,0,0,0.1)',
    transform: `translateY(${(1 - slideUp) * 100}px) scale(${featured ? 1 : 0.9})`,
    opacity: slideUp,
    border: featured ? `3px solid ${colors.freshGreen}` : 'none',
  };

  if (position) {
    Object.assign(style, {
      position: 'absolute',
      left: position.x,
      top: position.y,
    });
  }

  return (
    <div style={style}>
      {/* Match badge */}
      <div
        style={{
          position: 'absolute',
          top: -15,
          right: featured ? 20 : 10,
          background: matchPercent >= 90 ? colors.freshGreen : colors.warmOrange,
          color: 'white',
          padding: featured ? '8px 16px' : '5px 10px',
          borderRadius: 20,
          fontSize: featured ? 28 : 20,
          fontWeight: typography.weights.bold,
          boxShadow: featured ? `0 0 15px ${colors.freshGreen}80` : 'none',
        }}
      >
        {matchPercent}%
      </div>

      {/* Title */}
      <div
        style={{
          fontSize: featured ? 32 : 22,
          fontWeight: typography.weights.bold,
          color: colors.charcoal,
          marginBottom: 10,
          marginTop: featured ? 10 : 5,
        }}
      >
        {title}
      </div>

      {/* Meta info */}
      <div
        style={{
          display: 'flex',
          gap: featured ? 20 : 10,
          fontSize: featured ? 22 : 16,
          color: '#666',
        }}
      >
        <span>⏱️ {time}</span>
        <span>👨‍🍳 {difficulty}</span>
      </div>
    </div>
  );
};

export const Scene4Demo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Scene timeline (14 seconds = 840 frames)
  // 0-120: Search button pulse and press
  // 120-180: Loading spinner
  // 180-300: "БАМ! 47 рецептов" explosion
  // 300-600: Featured card zoom
  // 600-840: Other cards appear, final stats

  // Button animation
  const buttonPulse = frame < 100 ? Math.sin(frame * 0.15) * 0.1 + 1 : 1;
  const buttonPress = interpolate(frame, [100, 110, 120], [1, 0.9, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Loading visibility
  const isLoading = frame >= 120 && frame < 180;
  const loadingRotation = frame * 8;

  // Results explosion
  const explosionScale = spring({
    frame: Math.max(0, frame - 180),
    fps,
    config: { damping: 8, stiffness: 150 },
  });

  // Background transition
  const bgProgress = interpolate(frame, [180, 220], [0, 1], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill
      style={{
        background: interpolate(
          bgProgress,
          [0, 1],
          [0, 1]
        ) === 1
          ? `linear-gradient(180deg, #f8f9fa 0%, #e9ecef 100%)`
          : colors.creamWhite,
        overflow: 'hidden',
      }}
    >
      {/* Search button section (first 2 seconds) */}
      {frame < 200 && (
        <div
          style={{
            position: 'absolute',
            top: '40%',
            left: '50%',
            transform: `translate(-50%, -50%) scale(${buttonPulse * buttonPress})`,
            opacity: interpolate(frame, [150, 200], [1, 0]),
          }}
        >
          {/* Button */}
          <div
            style={{
              background: `linear-gradient(135deg, ${colors.warmOrange}, ${colors.tomatoRed})`,
              color: 'white',
              padding: '25px 60px',
              borderRadius: 50,
              fontSize: 36,
              fontWeight: typography.weights.bold,
              boxShadow: `0 10px 30px ${colors.warmOrange}60`,
              cursor: 'pointer',
            }}
          >
            🔍 Найти рецепты
          </div>

          {/* Ripples on click */}
          <Ripple delay={105} x={200} y={40} />
          <Ripple delay={115} x={200} y={40} />
        </div>
      )}

      {/* Loading spinner */}
      {isLoading && (
        <div
          style={{
            position: 'absolute',
            top: '45%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: 80,
              height: 80,
              border: `6px solid #f0f0f0`,
              borderTop: `6px solid ${colors.warmOrange}`,
              borderRadius: '50%',
              margin: '0 auto 20px',
              transform: `rotate(${loadingRotation}deg)`,
            }}
          />
          <div style={{ fontSize: 28, color: colors.charcoal }}>Ищем рецепты...</div>
        </div>
      )}

      {/* EXPLOSION: "БАМ! 47 рецептов" */}
      {frame >= 180 && frame < 350 && (
        <div
          style={{
            position: 'absolute',
            top: '35%',
            left: '50%',
            transform: `translate(-50%, -50%) scale(${explosionScale})`,
            textAlign: 'center',
            zIndex: 10,
          }}
        >
          {/* BAM! */}
          <div
            style={{
              fontSize: 100,
              fontWeight: typography.weights.extrabold,
              color: colors.warmOrange,
              textShadow: `
                0 0 30px ${colors.warmOrange}80,
                3px 3px 0 ${colors.tomatoRed}
              `,
              marginBottom: 20,
            }}
          >
            БАМ!
          </div>

          {/* Number + text */}
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 15 }}>
            <NumberCounter target={47} delay={200} duration={40} />
            <span
              style={{
                fontSize: 48,
                fontWeight: typography.weights.bold,
                color: colors.charcoal,
              }}
            >
              рецептов
            </span>
          </div>

          <div
            style={{
              fontSize: 32,
              color: '#666',
              marginTop: 10,
              opacity: interpolate(frame, [250, 280], [0, 1]),
            }}
          >
            за секунду!
          </div>
        </div>
      )}

      {/* Explosion particles */}
      {frame >= 180 && frame < 300 && (
        <>
          {[...Array(12)].map((_, i) => {
            const angle = (i / 12) * Math.PI * 2;
            const particleFrame = frame - 180;
            const distance = particleFrame * 8;
            const x = Math.cos(angle) * distance;
            const y = Math.sin(angle) * distance;
            const opacity = interpolate(particleFrame, [0, 60, 120], [1, 0.8, 0]);

            return (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  top: '35%',
                  left: '50%',
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  background: i % 2 === 0 ? colors.warmOrange : colors.freshGreen,
                  transform: `translate(${x}px, ${y}px)`,
                  opacity,
                }}
              />
            );
          })}
        </>
      )}

      {/* Featured recipe card */}
      {frame >= 300 && (
        <div
          style={{
            position: 'absolute',
            top: '25%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 450,
          }}
        >
          <RecipeCard
            title="🍝 Паста с курицей в сливочном соусе"
            matchPercent={98}
            time="20 мин"
            difficulty="Легко"
            delay={300}
            featured
          />

          {/* "Смотри" indicator */}
          {frame >= 350 && (
            <div
              style={{
                position: 'absolute',
                top: -60,
                left: 20,
                fontSize: 28,
                color: colors.charcoal,
                opacity: interpolate(frame, [350, 380], [0, 1]),
              }}
            >
              👆 Смотри:
            </div>
          )}
        </div>
      )}

      {/* Other recipe cards (smaller) */}
      {frame >= 500 && (
        <>
          <RecipeCard
            title="Курица с овощами"
            matchPercent={89}
            time="25 мин"
            difficulty="Легко"
            delay={500}
            position={{ x: 80, y: 650 }}
          />
          <RecipeCard
            title="Запеканка с сыром"
            matchPercent={85}
            time="35 мин"
            difficulty="Средне"
            delay={550}
            position={{ x: 550, y: 650 }}
          />
          <RecipeCard
            title="Томатный суп"
            matchPercent={76}
            time="30 мин"
            difficulty="Легко"
            delay={600}
            position={{ x: 80, y: 850 }}
          />
        </>
      )}

      {/* Bottom text: "20 минут. Из того, что уже есть." */}
      {frame >= 700 && (
        <div
          style={{
            position: 'absolute',
            bottom: 100,
            left: 0,
            right: 0,
            textAlign: 'center',
            opacity: interpolate(frame, [700, 750], [0, 1]),
          }}
        >
          <div
            style={{
              fontSize: 40,
              fontWeight: typography.weights.bold,
              color: colors.charcoal,
            }}
          >
            <span style={{ color: colors.freshGreen }}>20 минут.</span>{' '}
            Из того, что уже есть.
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};
