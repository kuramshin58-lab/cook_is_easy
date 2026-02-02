import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion';
import { colors, typography, spacing } from '../theme';

/**
 * Scene 1: Hook (0-3 seconds)
 *
 * Voiceover: "Семь вечера. Открываешь холодильник..."
 *
 * Visual:
 * - [0:00-0:01] Black screen → "19:00" appears with glitch effect
 * - [0:01-0:02] Fridge door opens animation
 * - [0:02-0:03] Light burst, chaos of products
 */

export const Scene1Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Timing (3 seconds = 180 frames at 60fps)
  const timeGlitch = interpolate(frame, [0, 30], [0, 1], { extrapolateRight: 'clamp' });
  const timeFade = interpolate(frame, [60, 90], [0, 1], { extrapolateRight: 'clamp' });
  const fridgeOpen = interpolate(frame, [90, 150], [0, 1], { extrapolateRight: 'clamp' });

  // Glitch offset for time display
  const glitchX = Math.sin(frame * 0.5) * (1 - timeGlitch) * 20;
  const glitchY = Math.cos(frame * 0.7) * (1 - timeGlitch) * 10;

  // Time opacity with flicker
  const timeOpacity = interpolate(frame, [0, 15, 18, 20, 25, 30], [0, 1, 0.3, 1, 0.8, 1], {
    extrapolateRight: 'clamp',
  });

  // Scale bounce for time
  const timeScale = spring({
    frame: frame - 5,
    fps,
    config: { damping: 12, stiffness: 200 },
  });

  // Fridge light intensity
  const lightIntensity = interpolate(frame, [90, 120, 150, 180], [0, 0.3, 0.8, 1], {
    extrapolateRight: 'clamp',
  });

  // Background color transition (dark to fridge light)
  const bgColor = interpolate(lightIntensity, [0, 1], [0, 40]);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: `rgb(${bgColor}, ${bgColor * 0.9}, ${bgColor * 1.1})`,
        overflow: 'hidden',
      }}
    >
      {/* Scanline effect */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `repeating-linear-gradient(
            0deg,
            rgba(0,0,0,0.1) 0px,
            rgba(0,0,0,0.1) 1px,
            transparent 1px,
            transparent 3px
          )`,
          pointerEvents: 'none',
          opacity: 0.3,
        }}
      />

      {/* Time Display: "19:00" */}
      <div
        style={{
          position: 'absolute',
          top: '40%',
          left: '50%',
          transform: `translate(-50%, -50%) translate(${glitchX}px, ${glitchY}px) scale(${0.5 + timeScale * 0.5})`,
          opacity: timeOpacity * (1 - timeFade),
        }}
      >
        {/* Glitch layers */}
        <div
          style={{
            position: 'absolute',
            fontSize: 180,
            fontWeight: typography.weights.extrabold,
            fontFamily: 'monospace',
            color: 'cyan',
            transform: `translate(${-3 + glitchX * 0.5}px, ${glitchY * 0.3}px)`,
            opacity: (1 - timeGlitch) * 0.5,
          }}
        >
          19:00
        </div>
        <div
          style={{
            position: 'absolute',
            fontSize: 180,
            fontWeight: typography.weights.extrabold,
            fontFamily: 'monospace',
            color: 'magenta',
            transform: `translate(${3 - glitchX * 0.5}px, ${-glitchY * 0.3}px)`,
            opacity: (1 - timeGlitch) * 0.5,
          }}
        >
          19:00
        </div>
        {/* Main text */}
        <div
          style={{
            fontSize: 180,
            fontWeight: typography.weights.extrabold,
            fontFamily: 'monospace',
            color: 'white',
            textShadow: '0 0 30px rgba(255,255,255,0.5)',
          }}
        >
          19:00
        </div>
      </div>

      {/* Fridge Opening Visual */}
      {frame >= 60 && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '100%',
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            opacity: timeFade,
          }}
        >
          {/* Fridge silhouette */}
          <div
            style={{
              width: 500,
              height: 800,
              backgroundColor: '#1a1a2e',
              borderRadius: 20,
              position: 'relative',
              boxShadow: `0 0 ${100 * lightIntensity}px rgba(200, 220, 255, ${lightIntensity * 0.5})`,
              transform: `perspective(1000px) rotateY(${-fridgeOpen * 15}deg)`,
            }}
          >
            {/* Door opening */}
            <div
              style={{
                position: 'absolute',
                top: 20,
                left: 20,
                right: 20,
                height: '60%',
                background: `linear-gradient(180deg,
                  rgba(200, 220, 255, ${lightIntensity * 0.8}) 0%,
                  rgba(180, 200, 240, ${lightIntensity * 0.6}) 50%,
                  rgba(160, 180, 220, ${lightIntensity * 0.4}) 100%
                )`,
                borderRadius: 10,
                transform: `perspective(500px) rotateY(${fridgeOpen * 60}deg)`,
                transformOrigin: 'left',
              }}
            />

            {/* Light rays */}
            {lightIntensity > 0.3 && (
              <>
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    style={{
                      position: 'absolute',
                      top: '30%',
                      left: '50%',
                      width: 4,
                      height: 400 + i * 100,
                      background: `linear-gradient(180deg,
                        rgba(255, 255, 255, ${0.3 * lightIntensity}) 0%,
                        transparent 100%
                      )`,
                      transform: `translateX(-50%) rotate(${-20 + i * 10}deg)`,
                      transformOrigin: 'top',
                      opacity: lightIntensity,
                    }}
                  />
                ))}
              </>
            )}
          </div>
        </div>
      )}

      {/* Floating food items chaos (appears with fridge) */}
      {frame >= 120 && (
        <>
          {['🍗', '🍅', '🧀', '🥕', '🥚', '🥛'].map((emoji, i) => {
            const delay = i * 8;
            const floatFrame = frame - 120 - delay;
            if (floatFrame < 0) return null;

            const floatY = spring({
              frame: floatFrame,
              fps,
              config: { damping: 8, stiffness: 100 },
            });

            const angle = (i / 6) * Math.PI * 2;
            const radius = 200 + i * 30;
            const x = Math.cos(angle + frame * 0.02) * radius * floatY;
            const y = Math.sin(angle + frame * 0.02) * radius * floatY - 200;

            return (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: `translate(${x}px, ${y}px) rotate(${frame * 2 + i * 60}deg)`,
                  fontSize: 60 + i * 10,
                  opacity: Math.min(1, floatY),
                }}
              >
                {emoji}
              </div>
            );
          })}
        </>
      )}

      {/* Question marks appearing */}
      {frame >= 150 && (
        <>
          {['❓', '🤔', '❓'].map((emoji, i) => {
            const delay = i * 5;
            const qFrame = frame - 150 - delay;
            if (qFrame < 0) return null;

            const pop = spring({
              frame: qFrame,
              fps,
              config: { damping: 10, stiffness: 300 },
            });

            const positions = [
              { x: -200, y: -300 },
              { x: 0, y: -400 },
              { x: 200, y: -300 },
            ];

            return (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: `translate(${positions[i].x}px, ${positions[i].y}px) scale(${pop})`,
                  fontSize: 80,
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
