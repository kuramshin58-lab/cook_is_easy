import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  spring,
  Sequence,
} from "remotion";
import type { RecipeVideoProps } from "../Root";

// Title slide component
const TitleSlide: React.FC<{ title: string; difficulty: string; prepTime: number; cookTime: number }> = ({
  title,
  difficulty,
  prepTime,
  cookTime,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });
  const titleY = spring({ frame, fps, config: { damping: 20 } });

  const badgeScale = spring({ frame: frame - 15, fps, config: { damping: 15 } });

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        justifyContent: "center",
        alignItems: "center",
        padding: 40,
      }}
    >
      <div
        style={{
          opacity: titleOpacity,
          transform: `translateY(${interpolate(titleY, [0, 1], [50, 0])}px)`,
          textAlign: "center",
        }}
      >
        <h1
          style={{
            color: "white",
            fontSize: 72,
            fontWeight: "bold",
            textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
            marginBottom: 30,
            fontFamily: "system-ui, sans-serif",
          }}
        >
          {title}
        </h1>

        <div
          style={{
            display: "flex",
            gap: 20,
            justifyContent: "center",
            transform: `scale(${Math.max(0, badgeScale)})`,
          }}
        >
          <Badge icon="⏱️" text={`${prepTime + cookTime} min`} />
          <Badge icon="📊" text={difficulty} />
          <Badge icon="🍳" text="Cook Is Easy" />
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Badge component
const Badge: React.FC<{ icon: string; text: string }> = ({ icon, text }) => (
  <div
    style={{
      background: "rgba(255,255,255,0.2)",
      padding: "12px 24px",
      borderRadius: 30,
      display: "flex",
      alignItems: "center",
      gap: 8,
      backdropFilter: "blur(10px)",
    }}
  >
    <span style={{ fontSize: 24 }}>{icon}</span>
    <span style={{ color: "white", fontSize: 20, fontWeight: 600, textTransform: "capitalize" }}>
      {text}
    </span>
  </div>
);

// Ingredients slide component
const IngredientsSlide: React.FC<{ ingredients: string[] }> = ({ ingredients }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
        padding: 60,
        justifyContent: "center",
      }}
    >
      <h2
        style={{
          fontSize: 56,
          fontWeight: "bold",
          color: "#333",
          marginBottom: 40,
          fontFamily: "system-ui, sans-serif",
        }}
      >
        Ingredients
      </h2>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {ingredients.slice(0, 6).map((ingredient, index) => {
          const delay = index * 5;
          const itemSpring = spring({
            frame: frame - delay,
            fps,
            config: { damping: 15 },
          });

          return (
            <div
              key={index}
              style={{
                opacity: interpolate(itemSpring, [0, 1], [0, 1]),
                transform: `translateX(${interpolate(itemSpring, [0, 1], [-50, 0])}px)`,
                display: "flex",
                alignItems: "center",
                gap: 16,
              }}
            >
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  background: "#667eea",
                }}
              />
              <span
                style={{
                  fontSize: 32,
                  color: "#444",
                  fontFamily: "system-ui, sans-serif",
                }}
              >
                {ingredient}
              </span>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// Instructions slide component
const InstructionsSlide: React.FC<{ instructions: string[]; stepIndex: number }> = ({
  instructions,
  stepIndex,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const instruction = instructions[stepIndex] || "";

  const slideIn = spring({ frame, fps, config: { damping: 20 } });

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(135deg, #fff5f5 0%, #ffd6d6 100%)",
        padding: 60,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          transform: `scale(${slideIn})`,
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: 120,
            marginBottom: 30,
            opacity: 0.3,
          }}
        >
          {stepIndex + 1}
        </div>

        <h3
          style={{
            fontSize: 48,
            fontWeight: 600,
            color: "#333",
            maxWidth: 800,
            lineHeight: 1.4,
            fontFamily: "system-ui, sans-serif",
          }}
        >
          {instruction}
        </h3>
      </div>
    </AbsoluteFill>
  );
};

// Outro slide component
const OutroSlide: React.FC<{ title: string }> = ({ title }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({ frame, fps, config: { damping: 15 } });

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          transform: `scale(${scale})`,
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 80, marginBottom: 20 }}>🍽️</div>
        <h2
          style={{
            color: "white",
            fontSize: 48,
            fontWeight: "bold",
            marginBottom: 20,
            fontFamily: "system-ui, sans-serif",
          }}
        >
          Enjoy your {title}!
        </h2>
        <p
          style={{
            color: "rgba(255,255,255,0.8)",
            fontSize: 28,
            fontFamily: "system-ui, sans-serif",
          }}
        >
          Made with Cook Is Easy
        </p>
      </div>
    </AbsoluteFill>
  );
};

// Main RecipeVideo component
export const RecipeVideo: React.FC<RecipeVideoProps> = ({
  title,
  description,
  ingredients,
  instructions,
  prepTime,
  cookTime,
  difficulty,
}) => {
  const TITLE_DURATION = 90; // 3 seconds
  const INGREDIENTS_DURATION = 120; // 4 seconds
  const INSTRUCTION_DURATION = 60; // 2 seconds per step
  const OUTRO_DURATION = 60; // 2 seconds

  // Show max 3 instruction steps to fit in 15 seconds
  const stepsToShow = Math.min(3, instructions.length);

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {/* Title sequence */}
      <Sequence from={0} durationInFrames={TITLE_DURATION}>
        <TitleSlide
          title={title}
          difficulty={difficulty}
          prepTime={prepTime}
          cookTime={cookTime}
        />
      </Sequence>

      {/* Ingredients sequence */}
      <Sequence from={TITLE_DURATION} durationInFrames={INGREDIENTS_DURATION}>
        <IngredientsSlide ingredients={ingredients} />
      </Sequence>

      {/* Instructions sequences */}
      {Array.from({ length: stepsToShow }).map((_, index) => (
        <Sequence
          key={index}
          from={TITLE_DURATION + INGREDIENTS_DURATION + index * INSTRUCTION_DURATION}
          durationInFrames={INSTRUCTION_DURATION}
        >
          <InstructionsSlide instructions={instructions} stepIndex={index} />
        </Sequence>
      ))}

      {/* Outro sequence */}
      <Sequence
        from={TITLE_DURATION + INGREDIENTS_DURATION + stepsToShow * INSTRUCTION_DURATION}
        durationInFrames={OUTRO_DURATION}
      >
        <OutroSlide title={title} />
      </Sequence>
    </AbsoluteFill>
  );
};
