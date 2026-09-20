import type {Beat} from "./schema";

/**
 * Converts seconds to whole frames on the Shorts timeline.
 * Positive durations always occupy at least one frame so a smash cut is visible.
 */
export function secondsToFrames(seconds: number, fps: number): number {
  const frames = Math.round(seconds * fps);
  if (seconds > 0 && frames < 1) {
    return 1;
  }
  return Math.max(0, frames);
}

/** Converts a frame index back to seconds at the given frame rate. */
export function framesToSeconds(frames: number, fps: number): number {
  return frames / fps;
}

/** A beat placed on the composition timeline (smash-cut, no overlap). */
export type ScheduledBeat = Beat & {
  startFrame: number;
  durationInFrames: number;
};

/**
 * Lays beats end-to-end. Cuts are hard: the next beat starts on the frame
 * after the previous beat ends (Remotion Sequences are exclusive at the end).
 */
export function buildBeatTimeline(beats: Beat[], fps: number): ScheduledBeat[] {
  let cursor = 0;
  return beats.map((beat) => {
    const durationInFrames = secondsToFrames(beat.durationInSeconds, fps);
    const scheduled: ScheduledBeat = {
      ...beat,
      startFrame: cursor,
      durationInFrames,
    };
    cursor += durationInFrames;
    return scheduled;
  });
}

/**
 * Total composition length from the beat list.
 * Empty input returns 1 so Remotion still has a valid composition.
 */
export function totalDurationInFrames(beats: Beat[], fps: number): number {
  const total = beats.reduce((sum, beat) => {
    return sum + secondsToFrames(beat.durationInSeconds, fps);
  }, 0);
  return Math.max(1, total);
}

/**
 * Absolute frame for an SFX cue that is timed relative to a beat start.
 * Negative offsets clamp to the beat start so a whoosh cannot fire early.
 */
export function cueFrameOnTimeline(
  beatStartFrame: number,
  atSeconds: number,
  fps: number,
): number {
  const offset = secondsToFrames(Math.max(0, atSeconds), fps);
  return beatStartFrame + offset;
}
