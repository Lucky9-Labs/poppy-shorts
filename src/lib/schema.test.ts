import {describe, expect, it} from "vitest";
import {SHORTS_FPS, YOUTUBE_SHORT_MAX_SECONDS} from "./constants";
import {parseShortProps, ShortPropsSchema} from "./schema";
import {exampleShortProps} from "../shorts/example-short";
import {totalDurationInFrames} from "./timeline";

describe("ShortPropsSchema", () => {
  it("accepts a prop-driven multi-beat Short", () => {
    const parsed = ShortPropsSchema.parse({
      title: "Test Short",
      beats: [
        {
          id: "a",
          durationInSeconds: 1,
          source: {type: "placeholder", color: "#000000"},
          caption: {text: "HELLO", tone: "serious"},
          sfx: [{src: "whoosh/cut-01.wav", atSeconds: 0, kind: "whoosh"}],
        },
      ],
    });

    expect(parsed.beats).toHaveLength(1);
    expect(parsed.beats[0]?.caption?.tone).toBe("serious");
    expect(parsed.contentSources).toEqual([]);
  });

  it("accepts a dynamic list of S3 folder prefixes", () => {
    const parsed = ShortPropsSchema.parse({
      title: "From S3",
      contentSources: [
        "s3://lucky9-clips/gameplay/",
        "s3://lucky9-clips/wip-evidence",
      ],
      beats: [
        {
          id: "a",
          durationInSeconds: 1,
          source: {type: "catalog", kind: "video", index: 0},
        },
      ],
    });

    expect(parsed.contentSources).toHaveLength(2);
    expect(parsed.beats[0]?.source.type).toBe("catalog");
  });

  it("rejects a beat with no duration", () => {
    const result = ShortPropsSchema.safeParse({
      title: "Bad",
      beats: [
        {
          id: "empty",
          durationInSeconds: 0,
          source: {type: "placeholder", color: "#000"},
        },
      ],
    });

    expect(result.success).toBe(false);
  });
});

describe("exampleShortProps", () => {
  it("is a valid Short and stays inside the YouTube Shorts cap", () => {
    const parsed = parseShortProps(exampleShortProps);
    const seconds =
      totalDurationInFrames(parsed.beats, SHORTS_FPS) / SHORTS_FPS;

    expect(seconds).toBeGreaterThan(4);
    expect(seconds).toBeLessThanOrEqual(YOUTUBE_SHORT_MAX_SECONDS);
    expect(parsed.contentSources).toEqual([]);
    expect(parsed.voice).toBeUndefined();
    expect(parsed.voiceover).toBeUndefined();
  });

  it("demonstrates smash-cut juxtaposition plus SFX slots", () => {
    const kinds = exampleShortProps.beats.flatMap((beat) =>
      (beat.sfx ?? []).map((cue) => cue.kind),
    );
    const tones = exampleShortProps.beats
      .map((beat) => beat.caption?.tone)
      .filter(Boolean);

    expect(kinds).toContain("whoosh");
    expect(kinds).toContain("impact");
    expect(tones).toContain("serious");
    expect(tones).toContain("goofy");
  });
});
