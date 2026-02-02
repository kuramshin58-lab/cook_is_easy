import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  spring,
  useVideoConfig,
} from 'remotion';
import { colors, typography } from '../theme';
import { BackgroundParticles } from '../animations/BackgroundParticles';

// Sizzle sparks configuration
const sizzleSparks = [
  { x: -80, delay: 0 },
  { x: -40, delay: 5 },
  { x: 0, delay: 10 },
  { x: 40, delay: 15 },
  { x: 80, delay: 20 },
  { x: -60, delay: 25 },
  { x: 60, delay: 30 },
];

export const Phase5Outcome: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Pan animation with wobble
  const panScale = spring({
    frame,
    fps,
    config: { damping: 15 },
  });
  const panWobble = Math.sin(frame * 0.1) * 3;

  // Steam particles
  const steamOpacity = interpolate(frame, [30, 60], [0, 1], {
    extrapolateRight: 'clamp',
  });

  // Dish transformation
  const dishScale = spring({
    frame: frame - 120,
    fps,
    config: { damping: 12, stiffness: 80 },
  });

  // Success checkmark
  const checkScale = spring({
    frame: frame - 180,
    fps,
    config: { damping: 10 },
  });

  // Text animation
  const textOpacity = interpolate(frame, [200, 230], [0, 1], {
    extrapolateRight: 'clamp',
  });

  // Glow intensity for dish
  const dishGlow = frame > 120 ? 0.3 + Math.sin((frame - 120) * 0.05) * 0.2 : 0;

  // Animated gradient hue shift
  const hueShift = Math.sin(frame * 0.02) * 5;

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(${180 + hueShift}deg, #FFF5F0 0%, #FFE4D6 50%, #FFCDB8 100%)`,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {/* Background particles - cooking themed */}
      <BackgroundParticles
        count={12}
        emojis={['🔥', '✨', '💨']}
        color="rgba(255, 87, 34, 0.15)"
        minOpacity={0.05}
        maxOpacity={0.2}
      />
      {/* Cooking pan with wobble */}
      <div
        style={{
          position: 'absolute',
          top: 400,
          transform: `scale(${panScale}) rotate(${panWobble}deg)`,
        }}
      >
        {/* Pan body */}
        <div
          style={{
            width: 400,
            height: 100,
            background: 'linear-gradient(180deg, #444 0%, #222 100%)',
            borderRadius: '0 0 200px 200px',
            position: 'relative',
          }}
        >
          {/* Pan interior */}
          <div
            style={{
              position: 'absolute',
              top: 10,
              left: 20,
              right: 20,
              height: 80,
              background: 'linear-gradient(180deg, #333 0%, #555 100%)',
              borderRadius: '0 0 180px 180px',
            }}
          />

          {/* Handle */}
          <div
            style={{
              position: 'absolute',
              right: -120,
              top: 30,
              width: 120,
              height: 30,
              background: 'linear-gradient(90deg, #333 0%, #666 100%)',
              borderRadius: 15,
            }}
          />
        </div>

        {/* Enhanced steam particles with wobble and rotation */}
        {frame > 30 && (
          <div style={{ opacity: steamOpacity }}>
            {[0, 1, 2, 3, 4, 5, 6].map((i) => {
              const steamFrame = frame - 30 + i * 15;
              const yOffset = (steamFrame % 120);
              const xWobble = Math.sin(steamFrame * 0.1 + i) * 20;
              const rotation = Math.sin(steamFrame * 0.08 + i * 0.5) * 30;
              const scale = 1 - yOffset / 150;

              return (
                <div
                  key={i}
                  style={{
                    position: 'absolute',
                    top: -30 - yOffset,
                    left: 60 + i * 45 + xWobble,
                    width: 25,
                    height: 50,
                    background: 'rgba(255,255,255,0.7)',
                    borderRadius: 25,
                    filter: 'blur(10px)',
                    opacity: Math.max(0, scale),
                    transform: `rotate(${rotation}deg) scale(${Math.max(0.3, scale)})`,
                  }}
                />
              );
            })}
          </div>
        )}

        {/* Sizzle sparks */}
        {frame > 20 && sizzleSparks.map((spark, i) => {
          const sparkFrame = (frame - 20 + spark.delay * 3) % 40;
          const sparkY = -sparkFrame * 3;
          const sparkOpacity = sparkFrame < 20 ? sparkFrame / 20 : (40 - sparkFrame) / 20;
          const sparkX = spark.x + Math.sin(sparkFrame * 0.3) * 10;

          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                top: -10 + sparkY,
                left: 200 + sparkX,
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: '#FFD700',
                boxShadow: '0 0 10px #FFA500, 0 0 20px #FF6B35',
                opacity: sparkOpacity * 0.8,
              }}
            />
          );
        })}
      </div>

      {/* Finished dish (appears later) with GLOW */}
      {frame > 120 && (
        <div
          style={{
            position: 'absolute',
            top: 300,
            transform: `scale(${Math.max(0, dishScale)})`,
            textAlign: 'center',
          }}
        >
          {/* Glow behind dish */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 400,
              height: 400,
              borderRadius: '50%',
              background: `radial-gradient(circle, rgba(255, 215, 0, ${dishGlow}) 0%, transparent 70%)`,
              filter: 'blur(30px)',
              zIndex: -1,
            }}
          />
          <div
            style={{
              width: 300,
              height: 300,
              borderRadius: '50%',
              background: 'white',
              boxShadow: `0 20px 60px rgba(0,0,0,0.15), 0 0 ${60 + dishGlow * 40}px rgba(255, 215, 0, ${dishGlow})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 150,
            }}
          >
            🍝
          </div>
        </div>
      )}

      {/* Success checkmark */}
      {frame > 180 && (
        <div
          style={{
            position: 'absolute',
            top: 200,
            right: 300,
            transform: `scale(${Math.max(0, checkScale)})`,
          }}
        >
          <div
            style={{
              width: 100,
              height: 100,
              borderRadius: '50%',
              background: colors.freshGreen,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 10px 30px rgba(76, 175, 80, 0.4)',
            }}
          >
            <span style={{ fontSize: 50, color: 'white' }}>✓</span>
          </div>
        </div>
      )}

      {/* Text */}
      <div
        style={{
          position: 'absolute',
          bottom: 250,
          opacity: textOpacity,
          textAlign: 'center',
        }}
      >
        <h2
          style={{
            fontFamily: typography.fontFamily,
            fontSize: typography.sizes.title,
            fontWeight: typography.weights.bold,
            color: colors.charcoal,
            margin: 0,
          }}
        >
          Dinner solved
        </h2>
        <h2
          style={{
            fontFamily: typography.fontFamily,
            fontSize: typography.sizes.title,
            fontWeight: typography.weights.bold,
            color: colors.warmOrange,
            margin: 0,
          }}
        >
          in seconds!
        </h2>
      </div>
    </AbsoluteFill>
  );
};
