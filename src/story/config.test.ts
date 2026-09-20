import {describe, expect, it} from "vitest";
import {parseStoryConfig, StoryConfigSchema, storyConfigFromEnv} from "./config";

describe("StoryConfigSchema", () => {
  it("accepts dynamic S3 folders plus an optional Fish Audio voice", () => {
    const parsed = parseStoryConfig({
      title: "Hullscape weekly",
      contentSources: [
        "s3://lucky9-clips/gameplay/",
        "s3://lucky9-clips/wip-evidence/",
      ],
      voice: {provider: "fish_audio", referenceId: "voice_abc"},
      transcribe: {provider: "openai_whisper"},
      narration: "We forged a mech. In a group chat named oops.",
    });

    expect(parsed.contentSources).toHaveLength(2);
    expect(parsed.voice?.provider).toBe("fish_audio");
    expect(parsed.voice?.referenceId).toBe("voice_abc");
  });

  it("defaults to offline voice and transcribe when APIs are not configured", () => {
    const parsed = StoryConfigSchema.parse({title: "Offline demo"});
    expect(parsed.contentSources).toEqual([]);
    expect(parsed.voice?.provider ?? "offline").toBe("offline");
    expect(parsed.transcribe?.provider ?? "offline").toBe("offline");
  });

  it("treats a Fish key + reference id in env as fish_audio", () => {
    const knobs = storyConfigFromEnv({
      FISH_AUDIO_API_KEY: "secret",
      FISH_AUDIO_REFERENCE_ID: "voice_abc",
    });
    expect(knobs.voice?.provider).toBe("fish_audio");
    expect(knobs.voice?.referenceId).toBe("voice_abc");
  });

  it("rejects a missing title", () => {
    expect(StoryConfigSchema.safeParse({contentSources: []}).success).toBe(
      false,
    );
  });
});
