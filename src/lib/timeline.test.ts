import {describe, expect, it} from "vitest";
import {SHORTS_FPS} from "./constants";
import {
  buildBeatTimeline,
  cueFrameOnTimeline,
  framesToSeconds,
  secondsToFrames,
  totalDurationInFrames,
} from "./timeline";
import type {Beat} from "./schema";

const sampleBeats: Beat[] = [
  {
    id: "hook",
    durationInSeconds: 1.2,
    source: {type: "placeholder", color: "#111111"},
  },
  {
    id: "punchline",
    durationInSeconds: 1.5,
    source: {type: "placeholder", color: "#ffcc00"},
  },
];

describe("secondsToFrames", () => {
  it("maps whole seconds onto the Shorts frame grid", () => {
    expect(secondsToFrames(2, SHORTS_FPS)).toBe(60);
  });

  it("rounds fractional seconds so smash cuts stay on whole frames", () => {
    expect(secondsToFrames(1.2, SHORTS_FPS)).toBe(36);
    expect(secondsToFrames(0.08, SHORTS_FPS)).toBe(2);
  });

  it("never returns a zero-length beat when given a positive duration", () => {
    expect(secondsToFrames(0.01, SHORTS_FPS)).toBeGreaterThanOrEqual(1);
  });
});

describe("framesToSeconds", () => {
  it("is the inverse of secondsToFrames for whole-second values", () => {
    expect(framesToSeconds(90, SHORTS_FPS)).toBe(3);
  });
});

describe("buildBeatTimeline", () => {
  it("schedules beats back-to-back with no overlap (smash cuts)", () => {
    const timeline = buildBeatTimeline(sampleBeats, SHORTS_FPS);

    expect(timeline).toHaveLength(2);
    expect(timeline[0]?.startFrame).toBe(0);
    expect(timeline[0]?.durationInFrames).toBe(36);
    expect(timeline[1]?.startFrame).toBe(36);
    expect(timeline[1]?.durationInFrames).toBe(45);
  });

  it("preserves beat ids and sources on each scheduled beat", () => {
    const [first] = buildBeatTimeline(sampleBeats, SHORTS_FPS);
    expect(first?.id).toBe("hook");
    expect(first?.source).toEqual({type: "placeholder", color: "#111111"});
  });
});

describe("totalDurationInFrames", () => {
  it("sums every beat so calculateMetadata can size the composition", () => {
    expect(totalDurationInFrames(sampleBeats, SHORTS_FPS)).toBe(81);
  });

  it("returns at least one frame for an empty beat list", () => {
    expect(totalDurationInFrames([], SHORTS_FPS)).toBe(1);
  });
});

describe("cueFrameOnTimeline", () => {
  it("offsets an SFX cue from the beat start", () => {
    expect(cueFrameOnTimeline(36, 0.08, SHORTS_FPS)).toBe(38);
  });

  it("clamps negative offsets to the beat start", () => {
    expect(cueFrameOnTimeline(36, -1, SHORTS_FPS)).toBe(36);
  });
});
