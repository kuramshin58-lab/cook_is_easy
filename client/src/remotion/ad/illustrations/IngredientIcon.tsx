import React from 'react';
import { colors } from '../theme';

export type IngredientType = 'chicken' | 'tomato' | 'onion' | 'pasta' | 'egg' | 'garlic' | 'cheese' | 'carrot' | 'broccoli' | 'salmon';

interface IngredientIconProps {
  type: IngredientType;
  size?: number;
}

export const IngredientIcon: React.FC<IngredientIconProps> = ({ type, size = 80 }) => {
  const iconMap: Record<IngredientType, React.ReactNode> = {
    chicken: (
      <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
        <ellipse cx="40" cy="45" rx="28" ry="25" fill="#FFE4C4" />
        <ellipse cx="40" cy="45" rx="20" ry="18" fill="#FFDAB9" />
        <circle cx="28" cy="30" r="12" fill="#FFE4C4" />
        <path d="M20 25 L15 15 L25 20" fill={colors.tomatoRed} />
      </svg>
    ),
    tomato: (
      <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
        <circle cx="40" cy="45" r="30" fill={colors.tomatoRed} />
        <circle cx="40" cy="45" r="25" fill="#FF6B6B" />
        <path d="M35 20 Q40 10 45 20" stroke={colors.herbGreen} strokeWidth="4" fill="none" />
        <ellipse cx="40" cy="15" rx="8" ry="5" fill={colors.herbGreen} />
      </svg>
    ),
    onion: (
      <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
        <ellipse cx="40" cy="50" rx="28" ry="25" fill="#DDA0DD" />
        <ellipse cx="40" cy="50" rx="20" ry="18" fill="#E6E6FA" />
        <path d="M40 25 L40 10 L45 15" stroke={colors.herbGreen} strokeWidth="3" fill="none" />
      </svg>
    ),
    pasta: (
      <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
        <path d="M15 60 Q20 30 40 40 Q60 50 65 20" stroke={colors.softYellow} strokeWidth="8" fill="none" strokeLinecap="round" />
        <path d="M20 65 Q25 35 45 45 Q65 55 70 25" stroke="#F0C14B" strokeWidth="8" fill="none" strokeLinecap="round" />
        <path d="M10 55 Q15 25 35 35 Q55 45 60 15" stroke={colors.softYellow} strokeWidth="8" fill="none" strokeLinecap="round" />
      </svg>
    ),
    egg: (
      <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
        <ellipse cx="40" cy="45" rx="22" ry="28" fill="#FFF8DC" />
        <ellipse cx="40" cy="45" rx="18" ry="24" fill={colors.creamWhite} />
        <circle cx="40" cy="48" r="12" fill={colors.softYellow} />
      </svg>
    ),
    garlic: (
      <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
        <ellipse cx="40" cy="50" rx="25" ry="22" fill={colors.creamWhite} />
        <ellipse cx="32" cy="48" rx="10" ry="18" fill="#F5F5DC" />
        <ellipse cx="48" cy="48" rx="10" ry="18" fill="#F5F5DC" />
        <ellipse cx="40" cy="50" rx="8" ry="16" fill="#F5F5DC" />
        <path d="M40 28 L40 15" stroke={colors.herbGreen} strokeWidth="4" strokeLinecap="round" />
      </svg>
    ),
    cheese: (
      <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
        <path d="M10 60 L40 20 L70 60 Z" fill={colors.softYellow} />
        <circle cx="25" cy="50" r="5" fill="#FFA500" />
        <circle cx="45" cy="45" r="4" fill="#FFA500" />
        <circle cx="55" cy="55" r="6" fill="#FFA500" />
      </svg>
    ),
    carrot: (
      <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
        <path d="M40 70 L25 25 L55 25 Z" fill={colors.warmOrange} />
        <path d="M35 25 Q40 10 45 25" stroke={colors.herbGreen} strokeWidth="4" fill="none" />
        <path d="M30 25 Q35 5 40 20" stroke={colors.herbGreen} strokeWidth="3" fill="none" />
        <path d="M50 25 Q45 5 40 20" stroke={colors.herbGreen} strokeWidth="3" fill="none" />
      </svg>
    ),
    broccoli: (
      <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
        <rect x="35" y="50" width="10" height="25" rx="3" fill={colors.herbGreen} />
        <circle cx="30" cy="35" r="15" fill={colors.freshGreen} />
        <circle cx="50" cy="35" r="15" fill={colors.freshGreen} />
        <circle cx="40" cy="25" r="15" fill={colors.herbGreen} />
      </svg>
    ),
    salmon: (
      <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
        <ellipse cx="40" cy="40" rx="35" ry="20" fill="#FA8072" />
        <path d="M70 40 L80 30 L80 50 Z" fill="#FA8072" />
        <ellipse cx="40" cy="40" rx="25" ry="12" fill="#FFA07A" />
        <line x1="20" y1="35" x2="60" y2="35" stroke="#FFB6C1" strokeWidth="2" />
        <line x1="20" y1="45" x2="60" y2="45" stroke="#FFB6C1" strokeWidth="2" />
      </svg>
    ),
  };

  return <>{iconMap[type]}</>;
};

// Animated floating ingredient
export const FloatingIngredient: React.FC<{
  type: IngredientType;
  size?: number;
  delay?: number;
  x: number;
  y: number;
}> = ({ type, size = 80, delay = 0, x, y }) => {
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: 'translate(-50%, -50%)',
      }}
    >
      <IngredientIcon type={type} size={size} />
    </div>
  );
};
