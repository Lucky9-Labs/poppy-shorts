import {describe, expect, it} from "vitest";
import {emptyContentCatalog} from "../lib/content-catalog";
import {runStoryPipeline} from "./pipeline";

describe("runStoryPipeline", () => {
  it("runs offline without AWS or Fish and still assembles a Short", async () => {
    const result = await runStoryPipeline({
      config: {
        title: "Hullscape offline",
        contentSources: [],
        narration: "We forged a mech. It walks into walls.",
        voice: {provider: "offline"},
        transcribe: {provider: "offline"},
      },
    });

    expect(result.skipped.ingest).toBe(true);
    expect(result.skipped.voiceover).toBe(true);
    expect(result.short.beats.length).toBeGreaterThanOrEqual(2);
    expect(result.short.beats.every((beat) => beat.source.type === "placeholder")).toBe(
      true,
    );
    expect(result.short.voiceover).toBeUndefined();
  });

  it("uses a provided catalog instead of listing S3", async () => {
    const result = await runStoryPipeline({
      config: {
        title: "From catalog",
        contentSources: ["s3://lucky9-clips/gameplay/"],
        narration: "Boss fight energy.",
      },
      catalog: {
        sources: ["s3://lucky9-clips/gameplay/"],
        items: [
          {
            uri: "s3://lucky9-clips/gameplay/boss.mp4",
            bucket: "lucky9-clips",
            key: "gameplay/boss.mp4",
            kind: "video",
            sourcePrefix: "s3://lucky9-clips/gameplay/",
            url: "https://cdn.example/boss.mp4",
          },
        ],
      },
    });

    expect(result.skipped.ingest).toBe(false);
    expect(result.short.beats[0]?.source).toEqual({
      type: "video",
      src: "https://cdn.example/boss.mp4",
    });
  });

  it("does not list S3 when no lister is wired (empty catalog)", async () => {
    const result = await runStoryPipeline({
      config: {
        title: "No lister",
        contentSources: ["s3://lucky9-clips/gameplay/"],
        narration: "Hook.",
      },
    });

    expect(result.catalog).toEqual(emptyContentCatalog());
    expect(result.short.beats[0]?.source.type).toBe("placeholder");
  });
});
