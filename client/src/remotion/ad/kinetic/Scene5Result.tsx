import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion';
import { colors, typography, spacing } from '../theme';

/**
 * Scene 5: Result (32-40 seconds = 480 frames)
 *
 * Voiceover:
 * "Через полчаса..."
 * "Ужин готов. Без магазина. Без стресса."
 *
 * Visual: Clock animation, finished dish, happy vibes
 */

// Animated clock hand
const ClockFace: React.FC<{ progress: number }> = ({ progress }) => {
  const minuteAngle = progress * 180; // 30 minutes = 180 degrees

  return (
    <div
      style={{
        position: 'relative',
        width: 200,
        height: 200,
        borderRadius: '50%',
        background: 'white',
        boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
        border: `4px solid ${colors.charcoal}`,
      }}
    >
      {/* Hour markers */}
      {[...Array(12)].map((_, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: 4,
            height: i % 3 === 0 ? 15 : 8,
            background: colors.charcoal,
            transformOrigin: 'center 0',
            transform: `translate(-50%, 0) rotate(${i * 30}deg) translateY(-85px)`,
          }}
        />
      ))}

      {/* Hour hand */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: 6,
          height: 50,
          background: colors.charcoal,
          borderRadius: 3,
          transformOrigin: 'center 0',
          transform: `translate(-50%, 0) rotate(${210 + progress * 15}deg)`,
        }}
      />

      {/* Minute hand */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: 4,
          height: 75,
          background: colors.warmOrange,
          borderRadius: 2,
          transformOrigin: 'center 0',
          transform: `translate(-50%, 0) rotate(${minuteAngle}deg)`,
        }}
      />

      {/* Center dot */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: 12,
          height: 12,
          background: colors.warmOrange,
          borderRadius: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      />
    </div>
  );
};

// Steam particle
const SteamParticle: React.FC<{ delay: number; x: number }> = ({ delay, x }) => {
  const frame = useCurrentFrame();
  const animFrame = frame - delay;
  if (animFrame < 0) return null;

  const y = interpolate(animFrame % 120, [0, 120], [0, -150]);
  const opacity = interpolate(animFrame % 120, [0, 40, 80, 120], [0, 0.6, 0.4, 0]);
  const wobble = Math.sin((animFrame + x * 10) * 0.1) * 20;
  const scale = interpolate(animFrame % 120, [0, 120], [0.5, 1.5]);

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 300,
        left: `calc(50% + ${x}px)`,
        width: 30,
        height: 30,
        borderRadius: '50%',
        background: 'rgba(255, 255, 255, 0.8)',
        transform: `translateX(${wobble}px) translateY(${y}px) scale(${scale})`,
        opacity,
        filter: 'blur(5px)',
      }}
    />
  );
};

// Checkmark animation
const AnimatedCheck: React.FC<{ text: string; delay: number }> = ({ text, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const animFrame = frame - delay;
  if (animFrame < 0) return null;

  const scale = spring({
    frame: animFrame,
    fps,
    config: { damping: 10, stiffness: 200 },
  });

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 15,
        transform: `scale(${scale})`,
        marginBottom: 15,
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          background: colors.freshGreen,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: 24,
          fontWeight: 'bold',
        }}
      >
        ✓
      </div>
      <span
        style={{
          fontSize: 32,
          fontWeight: typography.weights.semibold,
          color: colors.charcoal,
        }}
      >
        {text}
      </span>
    </div>
  );
};

export const Scene5Result: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Scene timeline (8 seconds = 480 frames)
  // 0-120: Clock animation "Через полчаса..."
  // 120-300: Dish reveal with steam
  // 300-480: "Ужин готов. Без магазина. Без стресса."

  // Clock progress
  const clockProgress = interpolate(frame, [0, 100], [0, 1], { extrapolateRight: 'clamp' });

  // Clock visibility
  const clockOpacity = interpolate(frame, [0, 30, 100, 140], [0, 1, 1, 0]);
  const clockScale = spring({
    frame,
    fps,
    config: { damping: 15, stiffness: 100 },
  });

  // Dish reveal
  const dishReveal = spring({
    frame: Math.max(0, frame - 120),
    fps,
    config: { damping: 12, stiffness: 100 },
  });

  // Background warmth
  const warmth = interpolate(frame, [120, 200], [0, 1], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(180deg,
          rgb(${255 - warmth * 10}, ${248 - warmth * 8}, ${240 - warmth * 5}) 0%,
          rgb(${255 - warmth * 20}, ${240 - warmth * 15}, ${220 - warmth * 10}) 100%
        )`,
        overflow: 'hidden',
      }}
    >
      {/* Warm glow overlay */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: 800,
          height: 800,
          borderRadius: '50%',
          background: `radial-gradient(circle,
            rgba(255, 200, 100, ${warmth * 0.3}) 0%,
            transparent 70%
          )`,
          transform: 'translate(-50%, -50%)',
        }}
      />

      {/* Clock section */}
      {frame < 180 && (
        <div
          style={{
            position: 'absolute',
            top: '30%',
            left: '50%',
            transform: `translate(-50%, -50%) scale(${clockScale})`,
            opacity: clockOpacity,
            textAlign: 'center',
          }}
        >
          <ClockFace progress={clockProgress} />

          {/* "Через полчаса..." text */}
          <div
            style={{
              marginTop: 30,
              fontSize: 42,
              fontWeight: typography.weights.semibold,
              color: colors.charcoal,
              opacity: interpolate(frame, [30, 60], [0, 1]),
            }}
          >
            Через полчаса...
          </div>
        </div>
      )}

      {/* Dish reveal section */}
      {frame >= 100 && (
        <div
          style={{
            position: 'absolute',
            top: '35%',
            left: '50%',
            transform: `translate(-50%, -50%) scale(${dishReveal})`,
            opacity: dishReveal,
            textAlign: 'center',
          }}
        >
          {/* Plate */}
          <div
            style={{
              width: 350,
              height: 350,
              borderRadius: '50%',
              background: 'white',
              boxShadow: `
                0 20px 60px rgba(0,0,0,0.15),
                inset 0 -10px 30px rgba(0,0,0,0.05)
              `,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto',
              position: 'relative',
            }}
          >
            {/* Food emoji */}
            <div
              style={{
                fontSize: 150,
                filter: 'drop-shadow(0 5px 10px rgba(0,0,0,0.2))',
              }}
            >
              🍝
            </div>

            {/* Sparkles around */}
            {frame >= 200 && (
              <>
                {['✨', '😋', '✨', '🌟'].map((emoji, i) => {
                  const angle = (i / 4) * Math.PI * 2 + frame * 0.02;
                  const radius = 200;
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
                        fontSize: 40,
                        opacity: interpolate(frame, [200, 250], [0, 1]),
                      }}
                    >
                      {emoji}
                    </div>
                  );
                })}
              </>
            )}
          </div>
        </div>
      )}

      {/* Steam particles */}
      {frame >= 150 && (
        <>
          {[-60, -30, 0, 30, 60].map((x, i) => (
            <SteamParticle key={i} delay={150 + i * 15} x={x} />
          ))}
        </>
      )}

      {/* "Ужин готов" text section */}
      {frame >= 280 && (
        <div
          style={{
            position: 'absolute',
            bottom: '18%',
            left: 0,
            right: 0,
            textAlign: 'center',
          }}
        >
          {/* Main text */}
          <div
            style={{
              fontSize: 56,
              fontWeight: typography.weights.extrabold,
              color: colors.charcoal,
              marginBottom: 40,
              opacity: interpolate(frame, [280, 320], [0, 1]),
            }}
          >
            Ужин{' '}
            <span style={{ color: colors.freshGreen }}>готов</span>
          </div>

          {/* Checkmarks */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <AnimatedCheck text="Без магазина" delay={340} />
            <AnimatedCheck text="Без стресса" delay={380} />
          </div>
        </div>
      )}

      {/* Happy family hint */}
      {frame >= 420 && (
        <div
          style={{
            position: 'absolute',
            bottom: '5%',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: 20,
            opacity: interpolate(frame, [420, 460], [0, 1]),
          }}
        >
          {['👨', '👩', '👧', '👦'].map((emoji, i) => (
            <span
              key={i}
              style={{
                fontSize: 50,
                animation: `bounce ${0.5 + i * 0.1}s ease-in-out infinite`,
              }}
            >
              {emoji}
            </span>
          ))}
        </div>
      )}
    </AbsoluteFill>
  );
};
