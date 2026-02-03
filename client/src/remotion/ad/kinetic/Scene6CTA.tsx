import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion';
import { colors, typography, spacing } from '../theme';

/**
 * Scene 6: CTA (40-45 seconds = 300 frames)
 *
 * Voiceover:
 * "Fridgely. 365 рецептов из того, что есть."
 * "Скачай бесплатно."
 *
 * Visual: Logo, statistics with number tween, CTA button
 */

// Animated number with counting effect
const CountingNumber: React.FC<{
  value: number;
  suffix?: string;
  prefix?: string;
  delay: number;
  duration?: number;
}> = ({ value, suffix = '', prefix = '', delay, duration = 40 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const animFrame = Math.max(0, frame - delay);
  if (frame < delay) return null;

  const progress = interpolate(animFrame, [0, duration], [0, 1], { extrapolateRight: 'clamp' });
  const displayValue = Math.floor(progress * value);

  const scale = spring({
    frame: animFrame,
    fps,
    config: { damping: 12, stiffness: 200 },
  });

  return (
    <span
      style={{
        display: 'inline-block',
        transform: `scale(${scale})`,
        fontWeight: typography.weights.extrabold,
        color: colors.warmOrange,
      }}
    >
      {prefix}{displayValue}{suffix}
    </span>
  );
};

// Stat item with icon
const StatItem: React.FC<{
  icon: string;
  value: number;
  suffix: string;
  label: string;
  delay: number;
}> = ({ icon, value, suffix, label, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const animFrame = frame - delay;
  if (animFrame < 0) return null;

  const slideUp = spring({
    frame: animFrame,
    fps,
    config: { damping: 12, stiffness: 150 },
  });

  return (
    <div
      style={{
        textAlign: 'center',
        transform: `translateY(${(1 - slideUp) * 30}px)`,
        opacity: slideUp,
      }}
    >
      <div style={{ fontSize: 40, marginBottom: 10 }}>{icon}</div>
      <div style={{ fontSize: 36, fontWeight: typography.weights.bold, color: colors.charcoal }}>
        <CountingNumber value={value} suffix={suffix} delay={delay + 10} duration={30} />
      </div>
      <div style={{ fontSize: 20, color: '#666', marginTop: 5 }}>{label}</div>
    </div>
  );
};

// Ripple button effect
const RippleButton: React.FC<{ delay: number }> = ({ delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const animFrame = frame - delay;
  if (animFrame < 0) return null;

  const scale = spring({
    frame: animFrame,
    fps,
    config: { damping: 10, stiffness: 200 },
  });

  // Pulse effect
  const pulse = animFrame > 30 ? Math.sin((animFrame - 30) * 0.1) * 0.05 + 1 : 1;

  // Ripple
  const rippleScale = interpolate((animFrame - 60) % 60, [0, 60], [0, 2]);
  const rippleOpacity = interpolate((animFrame - 60) % 60, [0, 30, 60], [0.6, 0.3, 0]);

  return (
    <div
      style={{
        position: 'relative',
        transform: `scale(${scale * pulse})`,
      }}
    >
      {/* Ripple effect */}
      {animFrame > 60 && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: '100%',
            height: '100%',
            borderRadius: 60,
            border: `3px solid ${colors.warmOrange}`,
            transform: `translate(-50%, -50%) scale(${rippleScale})`,
            opacity: rippleOpacity,
          }}
        />
      )}

      {/* Button */}
      <div
        style={{
          background: `linear-gradient(135deg, ${colors.warmOrange}, ${colors.tomatoRed})`,
          color: 'white',
          padding: '25px 60px',
          borderRadius: 60,
          fontSize: 36,
          fontWeight: typography.weights.bold,
          boxShadow: `0 10px 40px ${colors.warmOrange}50`,
          display: 'flex',
          alignItems: 'center',
          gap: 15,
        }}
      >
        <span>📲</span>
        <span>Скачать бесплатно</span>
      </div>
    </div>
  );
};

export const Scene6CTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Scene timeline (5 seconds = 300 frames)
  // 0-100: Logo appears with tagline
  // 100-200: Stats appear
  // 200-300: CTA button with ripple

  // Logo animation
  const logoScale = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 150 },
  });

  // Logo breathing
  const logoBreathe = Math.sin(frame * 0.05) * 0.03 + 1;

  // Glow animation
  const glow = Math.sin(frame * 0.08) * 0.3 + 0.7;

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(180deg,
          ${colors.creamWhite} 0%,
          #fff 50%,
          ${colors.creamWhite} 100%
        )`,
        overflow: 'hidden',
      }}
    >
      {/* Background decorative circles */}
      {[
        { x: -200, y: -300, size: 600, color: colors.warmOrange, opacity: 0.05 },
        { x: 400, y: 600, size: 500, color: colors.freshGreen, opacity: 0.05 },
        { x: -100, y: 800, size: 400, color: colors.softYellow, opacity: 0.08 },
      ].map((circle, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: circle.x,
            top: circle.y,
            width: circle.size,
            height: circle.size,
            borderRadius: '50%',
            background: circle.color,
            opacity: circle.opacity,
            transform: `rotate(${frame * 0.5 + i * 120}deg)`,
          }}
        />
      ))}

      {/* Logo section */}
      <div
        style={{
          position: 'absolute',
          top: '15%',
          left: '50%',
          transform: `translate(-50%, 0) scale(${logoScale * logoBreathe})`,
          textAlign: 'center',
        }}
      >
        {/* App icon */}
        <div
          style={{
            width: 140,
            height: 140,
            margin: '0 auto 25px',
            background: `linear-gradient(135deg, ${colors.warmOrange}, ${colors.tomatoRed})`,
            borderRadius: 35,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 70,
            boxShadow: `0 0 ${50 * glow}px ${colors.warmOrange}60`,
          }}
        >
          🍳
        </div>

        {/* Logo text */}
        <div
          style={{
            fontSize: 64,
            fontWeight: typography.weights.extrabold,
            color: colors.charcoal,
            letterSpacing: -1,
          }}
        >
          Fridgely
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 28,
            color: '#666',
            marginTop: 15,
            opacity: interpolate(frame, [30, 60], [0, 1]),
          }}
        >
          365 рецептов из того, что есть
        </div>
      </div>

      {/* Stats section */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          gap: 60,
          padding: '0 40px',
        }}
      >
        <StatItem icon="📖" value={365} suffix="+" label="рецептов" delay={100} />
        <StatItem icon="⏱️" value={30} suffix=" мин" label="максимум" delay={130} />
        <StatItem icon="🥗" value={10} suffix="" label="ингредиентов" delay={160} />
      </div>

      {/* CTA Button */}
      <div
        style={{
          position: 'absolute',
          bottom: '20%',
          left: '50%',
          transform: 'translateX(-50%)',
        }}
      >
        <RippleButton delay={200} />
      </div>

      {/* "Ссылка в описании" */}
      {frame >= 250 && (
        <div
          style={{
            position: 'absolute',
            bottom: '10%',
            left: 0,
            right: 0,
            textAlign: 'center',
            opacity: interpolate(frame, [250, 280], [0, 1]),
          }}
        >
          <div
            style={{
              fontSize: 24,
              color: '#888',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
            }}
          >
            <span>👇</span>
            <span>Ссылка в описании</span>
            <span>👇</span>
          </div>
        </div>
      )}

      {/* Floating food emojis */}
      {['🍕', '🥗', '🍜', '🥘', '🍲', '🍝'].map((emoji, i) => {
        const angle = (i / 6) * Math.PI * 2 + frame * 0.005;
        const radius = 500;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius * 0.3;

        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: `translate(${x}px, ${y}px)`,
              fontSize: 50,
              opacity: 0.15,
            }}
          >
            {emoji}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
