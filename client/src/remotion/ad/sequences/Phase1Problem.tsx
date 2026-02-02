import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  spring,
  useVideoConfig,
} from 'remotion';
import { colors, typography } from '../theme';
import { FridgeIllustration } from '../illustrations/FridgeIllustration';
import { IngredientIcon, IngredientType } from '../illustrations/IngredientIcon';
import { QuestionMark } from '../ui/QuestionMark';
import { BackgroundParticles } from '../animations/BackgroundParticles';

const floatingIngredients: { type: IngredientType; x: number; y: number; delay: number }[] = [
  { type: 'chicken', x: 200, y: 600, delay: 30 },
  { type: 'tomato', x: 850, y: 500, delay: 40 },
  { type: 'pasta', x: 300, y: 900, delay: 50 },
  { type: 'egg', x: 780, y: 800, delay: 60 },
  { type: 'onion', x: 150, y: 1100, delay: 70 },
  { type: 'garlic', x: 900, y: 1000, delay: 80 },
];

// Confused emojis that appear around the question
const confusedEmojis = [
  { emoji: '🤔', x: 150, y: 100, delay: 100 },
  { emoji: '😕', x: 920, y: 120, delay: 110 },
  { emoji: '❓', x: 100, y: 200, delay: 120 },
  { emoji: '🤷', x: 950, y: 220, delay: 130 },
];

export const Phase1Problem: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Fridge opens animation
  const fridgeOpen = frame > 60;

  // Animated gradient - subtle pulse
  const gradientShift = interpolate(
    Math.sin(frame * 0.03),
    [-1, 1],
    [0, 10]
  );

  // Text animation
  const textOpacity = interpolate(frame, [120, 150], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const textY = spring({
    frame: frame - 120,
    fps,
    config: { damping: 15 },
  });

  // Text shake effect when confused
  const textShake = frame > 150 ? Math.sin(frame * 0.2) * 2 : 0;

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(${180 + gradientShift}deg, #FFF5F0 0%, #FFE4D6 50%, #FFCDB8 100%)`,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {/* Background particles - visible from the start */}
      <BackgroundParticles
        count={15}
        emojis={['🍴', '🥄', '🍽️']}
        color="rgba(255, 107, 53, 0.15)"
        minOpacity={0.08}
        maxOpacity={0.2}
      />
      {/* Fridge */}
      <div
        style={{
          position: 'absolute',
          top: 300,
          left: '50%',
          transform: 'translateX(-50%)',
        }}
      >
        <FridgeIllustration isOpen={fridgeOpen} scale={1.5} />
      </div>

      {/* Floating ingredients (appear when fridge opens) - ENHANCED wobble */}
      {fridgeOpen &&
        floatingIngredients.map((ing, index) => {
          const itemFrame = frame - 60 - ing.delay;
          // Enhanced wobble - more chaotic movement
          const floatY = Math.sin(itemFrame * 0.07) * 35 + Math.cos(itemFrame * 0.04) * 15;
          const floatX = Math.cos(itemFrame * 0.05) * 30 + Math.sin(itemFrame * 0.03) * 10;
          const itemScale = spring({
            frame: itemFrame,
            fps,
            config: { damping: 10, stiffness: 150 },
          });
          // More dramatic rotation
          const rotation = Math.sin(itemFrame * 0.1) * 25 + Math.cos(itemFrame * 0.06) * 10;
          // Pulsing scale
          const pulseScale = 1 + Math.sin(itemFrame * 0.08) * 0.1;

          return (
            <div
              key={index}
              style={{
                position: 'absolute',
                left: ing.x,
                top: ing.y + floatY,
                transform: `translate(-50%, -50%) translateX(${floatX}px) rotate(${rotation}deg) scale(${Math.max(0, itemScale * pulseScale)})`,
              }}
            >
              <IngredientIcon type={ing.type} size={100} />
            </div>
          );
        })}

      {/* Confused emojis around the question */}
      {frame > 90 &&
        confusedEmojis.map((item, index) => {
          const emojiFrame = frame - item.delay;
          const emojiScale = spring({
            frame: emojiFrame,
            fps,
            config: { damping: 12 },
          });
          const wobble = Math.sin(emojiFrame * 0.1) * 8;
          const floatY = Math.sin(emojiFrame * 0.04) * 15;

          return (
            <div
              key={index}
              style={{
                position: 'absolute',
                left: item.x,
                top: item.y + floatY,
                fontSize: 60,
                transform: `rotate(${wobble}deg) scale(${Math.max(0, emojiScale)})`,
                opacity: emojiFrame > 0 ? 0.8 : 0,
              }}
            >
              {item.emoji}
            </div>
          );
        })}

      {/* Question mark */}
      {frame > 90 && (
        <div
          style={{
            position: 'absolute',
            top: 150,
            left: '50%',
            transform: 'translateX(-50%)',
          }}
        >
          <QuestionMark animated />
        </div>
      )}

      {/* Text: "What can I cook tonight?" - with shake */}
      <div
        style={{
          position: 'absolute',
          bottom: 200,
          left: '50%',
          transform: `translateX(-50%) translateY(${interpolate(textY, [0, 1], [30, 0])}px) translateX(${textShake}px)`,
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
          What can I cook
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
          tonight?
        </h2>
      </div>
    </AbsoluteFill>
  );
};
