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

export const Phase6CTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Background pulse animation
  const bgPulse = interpolate(
    Math.sin(frame * 0.05),
    [-1, 1],
    [0.95, 1.05]
  );

  // Logo entrance
  const logoScale = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 80 },
  });

  // Stats animation
  const statsOpacity = interpolate(frame, [30, 50], [0, 1], {
    extrapolateRight: 'clamp',
  });

  // CTA button entrance
  const ctaY = spring({
    frame: frame - 90,
    fps,
    config: { damping: 15 },
  });

  const ctaScale = interpolate(
    Math.sin((frame - 90) * 0.1),
    [-1, 1],
    [0.98, 1.02]
  );

  // Tagline entrance
  const taglineOpacity = interpolate(frame, [150, 180], [0, 1], {
    extrapolateRight: 'clamp',
  });

  // Number tween for recipes count
  const recipesCount = Math.round(
    interpolate(frame, [30, 90], [0, 365], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    })
  );

  // Stats data with animated values
  const stats = [
    { value: recipesCount.toString(), label: 'Recipes', icon: '📖', isAnimated: true },
    { value: '<30', label: 'Minutes', icon: '⏱️', isAnimated: false },
    { value: '5-10', label: 'Ingredients', icon: '🥗', isAnimated: false },
  ];

  return (
    <AbsoluteFill
      style={{
        background: colors.gradients.primary,
        justifyContent: 'center',
        alignItems: 'center',
        transform: `scale(${bgPulse})`,
      }}
    >
      {/* Animated decorative circles */}
      <div
        style={{
          position: 'absolute',
          width: 800,
          height: 800,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.05)',
          top: -200 + Math.sin(frame * 0.02) * 30,
          right: -200 + Math.cos(frame * 0.015) * 20,
          transform: `scale(${1 + Math.sin(frame * 0.03) * 0.1}) rotate(${frame * 0.2}deg)`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: 600,
          height: 600,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.05)',
          bottom: -150 + Math.cos(frame * 0.025) * 25,
          left: -150 + Math.sin(frame * 0.02) * 15,
          transform: `scale(${1 + Math.cos(frame * 0.025) * 0.1}) rotate(${-frame * 0.15}deg)`,
        }}
      />
      {/* Additional floating circles */}
      <div
        style={{
          position: 'absolute',
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.03)',
          top: 400 + Math.sin(frame * 0.03) * 40,
          left: 100 + Math.cos(frame * 0.02) * 30,
          transform: `rotate(${frame * 0.3}deg)`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.04)',
          bottom: 400 + Math.cos(frame * 0.035) * 35,
          right: 80 + Math.sin(frame * 0.025) * 25,
          transform: `rotate(${-frame * 0.25}deg)`,
        }}
      />

      {/* Main content container */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 60,
        }}
      >
        {/* App Logo */}
        <div style={{ transform: `scale(${logoScale})` }}>
          <AppLogo scale={1.5} animated={false} />
        </div>

        {/* App name */}
        <h1
          style={{
            fontFamily: typography.fontFamily,
            fontSize: 80,
            fontWeight: typography.weights.bold,
            color: 'white',
            margin: 0,
            textShadow: '0 4px 20px rgba(0,0,0,0.3)',
            opacity: logoScale,
          }}
        >
          Cook Is Easy
        </h1>

        {/* Stats row */}
        <div
          style={{
            display: 'flex',
            gap: 40,
            opacity: statsOpacity,
          }}
        >
          {stats.map((stat, index) => {
            const statDelay = index * 10;
            const statScale = spring({
              frame: frame - 30 - statDelay,
              fps,
              config: { damping: 15 },
            });

            return (
              <div
                key={index}
                style={{
                  background: 'rgba(255,255,255,0.15)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: 24,
                  padding: '30px 40px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 12,
                  transform: `scale(${Math.max(0, statScale)})`,
                  border: '1px solid rgba(255,255,255,0.2)',
                }}
              >
                <span style={{ fontSize: 40 }}>{stat.icon}</span>
                <span
                  style={{
                    fontFamily: typography.fontFamily,
                    fontSize: 48,
                    fontWeight: typography.weights.bold,
                    color: 'white',
                  }}
                >
                  {stat.value}
                </span>
                <span
                  style={{
                    fontFamily: typography.fontFamily,
                    fontSize: 24,
                    color: 'rgba(255,255,255,0.9)',
                  }}
                >
                  {stat.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* CTA Button with ripple effect */}
        {frame > 90 && (
          <div
            style={{
              transform: `translateY(${interpolate(
                ctaY,
                [0, 1],
                [50, 0]
              )}px) scale(${ctaScale})`,
              position: 'relative',
            }}
          >
            {/* Ripple waves */}
            {[0, 1, 2].map((i) => {
              const rippleFrame = (frame - 90 + i * 40) % 120;
              const rippleScale = 1 + rippleFrame / 40;
              const rippleOpacity = Math.max(0, 1 - rippleFrame / 80);

              return (
                <div
                  key={i}
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: `translate(-50%, -50%) scale(${rippleScale})`,
                    width: '100%',
                    height: '100%',
                    borderRadius: 40,
                    border: `3px solid rgba(255,255,255,${rippleOpacity * 0.5})`,
                    pointerEvents: 'none',
                  }}
                />
              );
            })}
            <div
              style={{
                background: 'white',
                borderRadius: 40,
                padding: '32px 80px',
                boxShadow: `0 20px 60px rgba(0,0,0,0.3), 0 0 ${40 + Math.sin(frame * 0.1) * 10}px rgba(255,255,255,0.3)`,
                display: 'flex',
                alignItems: 'center',
                gap: 20,
                position: 'relative',
                zIndex: 1,
              }}
            >
              <span style={{ fontSize: 40 }}>🍳</span>
              <span
                style={{
                  fontFamily: typography.fontFamily,
                  fontSize: 40,
                  fontWeight: typography.weights.bold,
                  color: colors.warmOrange,
                }}
              >
                Try Cook Is Easy
              </span>
            </div>
          </div>
        )}

        {/* Tagline */}
        <div
          style={{
            opacity: taglineOpacity,
            textAlign: 'center',
          }}
        >
          <p
            style={{
              fontFamily: typography.fontFamily,
              fontSize: 36,
              color: 'rgba(255,255,255,0.9)',
              margin: 0,
              marginBottom: 10,
            }}
          >
            Stop wondering.
          </p>
          <p
            style={{
              fontFamily: typography.fontFamily,
              fontSize: 48,
              fontWeight: typography.weights.bold,
              color: 'white',
              margin: 0,
            }}
          >
            Start cooking.
          </p>
        </div>
      </div>

      {/* Bottom decoration - floating ingredients */}
      <div
        style={{
          position: 'absolute',
          bottom: 100,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          gap: 80,
          opacity: 0.6,
        }}
      >
        {['🍅', '🧀', '🥚', '🧄', '🥕'].map((emoji, i) => {
          const floatY = Math.sin((frame + i * 30) * 0.05) * 15;
          return (
            <span
              key={i}
              style={{
                fontSize: 50,
                transform: `translateY(${floatY}px)`,
              }}
            >
              {emoji}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
