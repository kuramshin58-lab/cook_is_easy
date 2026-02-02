import React from 'react';
import { AbsoluteFill, Sequence } from 'remotion';
import { videoConfig } from './theme';

// Import all phases
import { Phase1Problem } from './sequences/Phase1Problem';
import { Phase2Solution } from './sequences/Phase2Solution';
import { Phase3Magic } from './sequences/Phase3Magic';
import { Phase4Results } from './sequences/Phase4Results';
import { Phase5Outcome } from './sequences/Phase5Outcome';
import { Phase6CTA } from './sequences/Phase6CTA';

/*
 * AUDIO INTEGRATION
 * =================
 * To add audio, place files in: client/public/audio/
 *
 * Required files:
 * - voiceover.mp3: Main narration (60 seconds)
 * - background-music.mp3: Background music (quiet, loops)
 * - whoosh.mp3: Transition sound effect (optional)
 *
 * Then uncomment the audio elements in the component below.
 *
 * Example usage:
 * import { Audio } from 'remotion';
 *
 * <Audio src="/audio/voiceover.mp3" volume={1.0} />
 * <Audio src="/audio/background-music.mp3" volume={0.15} />
 *
 * For transition sounds at specific times:
 * <Sequence from={PHASE_TIMING.phase2.from}>
 *   <Audio src="/audio/whoosh.mp3" volume={0.4} />
 * </Sequence>
 */

// Phase timing configuration (in frames at 60fps)
const PHASE_TIMING = {
  // Phase 1: The Problem (0:00 - 0:08) - 8 seconds
  phase1: {
    from: 0,
    duration: 8 * videoConfig.fps, // 480 frames
  },
  // Phase 2: The Solution (0:08 - 0:15) - 7 seconds
  phase2: {
    from: 8 * videoConfig.fps, // 480
    duration: 7 * videoConfig.fps, // 420 frames
  },
  // Phase 3: The Magic (0:15 - 0:30) - 15 seconds
  phase3: {
    from: 15 * videoConfig.fps, // 900
    duration: 15 * videoConfig.fps, // 900 frames
  },
  // Phase 4: The Results (0:30 - 0:42) - 12 seconds
  phase4: {
    from: 30 * videoConfig.fps, // 1800
    duration: 12 * videoConfig.fps, // 720 frames
  },
  // Phase 5: The Outcome (0:42 - 0:50) - 8 seconds
  phase5: {
    from: 42 * videoConfig.fps, // 2520
    duration: 8 * videoConfig.fps, // 480 frames
  },
  // Phase 6: Call to Action (0:50 - 1:00) - 10 seconds
  phase6: {
    from: 50 * videoConfig.fps, // 3000
    duration: 10 * videoConfig.fps, // 600 frames
  },
};

export const AdVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      {/* Phase 1: The Problem - "What can I cook tonight?" */}
      <Sequence
        from={PHASE_TIMING.phase1.from}
        durationInFrames={PHASE_TIMING.phase1.duration}
        name="Phase 1: The Problem"
      >
        <Phase1Problem />
      </Sequence>

      {/* Phase 2: The Solution - "Meet Cook Is Easy" */}
      <Sequence
        from={PHASE_TIMING.phase2.from}
        durationInFrames={PHASE_TIMING.phase2.duration}
        name="Phase 2: The Solution"
      >
        <Phase2Solution />
      </Sequence>

      {/* Phase 3: The Magic - "Ingredient Selection" */}
      <Sequence
        from={PHASE_TIMING.phase3.from}
        durationInFrames={PHASE_TIMING.phase3.duration}
        name="Phase 3: The Magic"
      >
        <Phase3Magic />
      </Sequence>

      {/* Phase 4: The Results - "Recipe Discovery" */}
      <Sequence
        from={PHASE_TIMING.phase4.from}
        durationInFrames={PHASE_TIMING.phase4.duration}
        name="Phase 4: The Results"
      >
        <Phase4Results />
      </Sequence>

      {/* Phase 5: The Outcome - "Cooking Success" */}
      <Sequence
        from={PHASE_TIMING.phase5.from}
        durationInFrames={PHASE_TIMING.phase5.duration}
        name="Phase 5: The Outcome"
      >
        <Phase5Outcome />
      </Sequence>

      {/* Phase 6: Call to Action - "Try Cook Is Easy" */}
      <Sequence
        from={PHASE_TIMING.phase6.from}
        durationInFrames={PHASE_TIMING.phase6.duration}
        name="Phase 6: CTA"
      >
        <Phase6CTA />
      </Sequence>
    </AbsoluteFill>
  );
};

// Export video configuration for composition registration
export const adVideoConfig = {
  id: 'CookIsEasyAd',
  component: AdVideo,
  durationInFrames: videoConfig.durationInSeconds * videoConfig.fps, // 3600 frames (60 seconds at 60fps)
  fps: videoConfig.fps,
  width: videoConfig.width,
  height: videoConfig.height,
};
