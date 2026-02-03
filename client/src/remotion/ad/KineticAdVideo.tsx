import React from 'react';
import { AbsoluteFill, Sequence } from 'remotion';
import { videoConfig, sceneTiming, toFrames } from './theme';

// Import kinetic typography scenes
import { Scene1Hook } from './kinetic/Scene1Hook';
import { Scene2Problem } from './kinetic/Scene2Problem';
import { Scene3Solution } from './kinetic/Scene3Solution';
import { Scene4Demo } from './kinetic/Scene4Demo';
import { Scene5Result } from './kinetic/Scene5Result';
import { Scene6CTA } from './kinetic/Scene6CTA';

/**
 * Fridgely - Kinetic Typography Ad Video
 *
 * 45-second ad optimized for TikTok/Reels/Shorts
 * Format: 9:16 (1080x1920) at 60fps
 *
 * Structure based on SCRIPT.md:
 * - Hook (0-3 sec): "7 вечера. Открываешь холодильник..."
 * - Problem (3-10 sec): "...и понятия не имеешь что приготовить"
 * - Solution (10-18 sec): "Забудь про это. Открой Fridgely"
 * - Demo (18-32 sec): "Нажми поиск... БАМ! 47 рецептов"
 * - Result (32-40 sec): "Через полчаса... Ужин готов"
 * - CTA (40-45 sec): "Fridgely. Скачай бесплатно"
 */

/*
 * AUDIO INTEGRATION
 * =================
 * To add synchronized audio, place files in: client/public/audio/
 *
 * Required files (generate with ElevenLabs or similar):
 * - voiceover-kinetic.mp3: Narration (45 seconds)
 * - background-music.mp3: Lo-fi/upbeat music (quiet, 0.15 volume)
 *
 * Sound effects (optional):
 * - fridge-open.mp3: For hook scene
 * - pop.mp3: For ingredient selection
 * - whoosh.mp3: For transitions
 * - tada.mp3: For results reveal
 *
 * Then uncomment audio elements below:
 *
 * import { Audio } from 'remotion';
 *
 * // Full voiceover
 * <Audio src="/audio/voiceover-kinetic.mp3" volume={1.0} />
 *
 * // Background music (starts at solution, builds to climax)
 * <Sequence from={toFrames(10)}>
 *   <Audio src="/audio/background-music.mp3" volume={0.15} />
 * </Sequence>
 *
 * // Sound effects at key moments
 * <Sequence from={toFrames(1)}>
 *   <Audio src="/audio/fridge-open.mp3" volume={0.5} />
 * </Sequence>
 */

// Scene timing in frames (based on sceneTiming from theme.ts)
const SCENE_TIMING = {
  hook: {
    from: toFrames(sceneTiming.hook.start),
    duration: toFrames(sceneTiming.hook.end - sceneTiming.hook.start),
  },
  problem: {
    from: toFrames(sceneTiming.problem.start),
    duration: toFrames(sceneTiming.problem.end - sceneTiming.problem.start),
  },
  solution: {
    from: toFrames(sceneTiming.solution.start),
    duration: toFrames(sceneTiming.solution.end - sceneTiming.solution.start),
  },
  demo: {
    from: toFrames(sceneTiming.demo.start),
    duration: toFrames(sceneTiming.demo.end - sceneTiming.demo.start),
  },
  result: {
    from: toFrames(sceneTiming.result.start),
    duration: toFrames(sceneTiming.result.end - sceneTiming.result.start),
  },
  cta: {
    from: toFrames(sceneTiming.cta.start),
    duration: toFrames(sceneTiming.cta.end - sceneTiming.cta.start),
  },
};

export const KineticAdVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      {/* Scene 1: Hook - "7 вечера. Открываешь холодильник..." */}
      <Sequence
        from={SCENE_TIMING.hook.from}
        durationInFrames={SCENE_TIMING.hook.duration}
        name="Hook: 19:00"
      >
        <Scene1Hook />
      </Sequence>

      {/* Scene 2: Problem - "...и понятия не имеешь что приготовить" */}
      <Sequence
        from={SCENE_TIMING.problem.from}
        durationInFrames={SCENE_TIMING.problem.duration}
        name="Problem: Знакомо?"
      >
        <Scene2Problem />
      </Sequence>

      {/* Scene 3: Solution - "Забудь про это. Открой Fridgely" */}
      <Sequence
        from={SCENE_TIMING.solution.from}
        durationInFrames={SCENE_TIMING.solution.duration}
        name="Solution: Fridgely"
      >
        <Scene3Solution />
      </Sequence>

      {/* Scene 4: Demo - "БАМ! 47 рецептов за секунду" */}
      <Sequence
        from={SCENE_TIMING.demo.from}
        durationInFrames={SCENE_TIMING.demo.duration}
        name="Demo: 47 рецептов"
      >
        <Scene4Demo />
      </Sequence>

      {/* Scene 5: Result - "Через полчаса... Ужин готов" */}
      <Sequence
        from={SCENE_TIMING.result.from}
        durationInFrames={SCENE_TIMING.result.duration}
        name="Result: Ужин готов"
      >
        <Scene5Result />
      </Sequence>

      {/* Scene 6: CTA - "Fridgely. Скачай бесплатно" */}
      <Sequence
        from={SCENE_TIMING.cta.from}
        durationInFrames={SCENE_TIMING.cta.duration}
        name="CTA: Скачать"
      >
        <Scene6CTA />
      </Sequence>
    </AbsoluteFill>
  );
};

// Export video configuration for composition registration
export const kineticAdVideoConfig = {
  id: 'FridgelyKinetic',
  component: KineticAdVideo,
  durationInFrames: videoConfig.durationInSeconds * videoConfig.fps, // 2700 frames (45 seconds at 60fps)
  fps: videoConfig.fps,
  width: videoConfig.width,
  height: videoConfig.height,
};
