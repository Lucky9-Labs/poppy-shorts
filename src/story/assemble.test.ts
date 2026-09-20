import {describe, expect, it} from "vitest";
import {parseShortProps} from "../lib/schema";
import {assembleStoryShort} from "./assemble";
import type {StoryBeat} from "./types";

const beats: StoryBeat[] = [
  {
    id: "beat-1",
    line: "We forged a mech",
    tone: "serious",
    durationInSeconds: 1.2,
    source: {type: "placeholder", color: "#0b0f14", label: "CLIP 1"},
  },
  {
    id: "beat-2",
    line: "in a group chat named oops",
    tone: "goofy",
    durationInSeconds: 1.4,
    source: {type: "placeholder", color: "#2a1840", label: "CLIP 2"},
  },
];

describe("assembleStoryShort", () => {
  it("builds Remotion Short props with smash-cut SFX slots", () => {
    const short = assembleStoryShort({
      title: "Hullscape weekly",
      contentSources: ["s3://lucky9-clips/gameplay/"],
      beats,
      voice: {provider: "fish_audio", referenceId: "voice_abc"},
    });

    const parsed = parseShortProps(short);
    expect(parsed.beats).toHaveLength(2);
    expect(parsed.beats[0]?.sfx?.[0]?.kind).toBe("whoosh");
    expect(parsed.beats[1]?.sfx?.[0]?.kind).toBe("impact");
    expect(parsed.voice?.referenceId).toBe("voice_abc");
    expect(parsed.voiceover).toBeUndefined();
  });

  it("attaches a VO track when TTS produced a file", () => {
    const short = assembleStoryShort({
      title: "With VO",
      contentSources: [],
      beats,
      voiceover: {src: "voiceover/narration.mp3", volume: 0.85},
    });
    expect(short.voiceover?.src).toBe("voiceover/narration.mp3");
  });
});
