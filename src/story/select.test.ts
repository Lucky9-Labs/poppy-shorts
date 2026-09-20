import {describe, expect, it} from "vitest";
import type {ContentCatalog} from "../lib/content-catalog";
import {selectStoryBeats, splitNarration} from "./select";

const catalog: ContentCatalog = {
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
};

describe("splitNarration", () => {
  it("splits sentences into smash-cut lines", () => {
    expect(
      splitNarration("We forged a mech. In a group chat named oops!"),
    ).toEqual(["We forged a mech", "In a group chat named oops"]);
  });
});

describe("selectStoryBeats", () => {
  it("alternates serious/goofy and binds catalog clips when present", () => {
    const beats = selectStoryBeats({
      lines: ["We forged a mech", "In a group chat named oops"],
      catalog,
    });

    expect(beats).toHaveLength(2);
    expect(beats[0]?.tone).toBe("serious");
    expect(beats[1]?.tone).toBe("goofy");
    expect(beats[0]?.source).toEqual({
      type: "video",
      src: "https://cdn.example/boss.mp4",
    });
    expect(beats[1]?.source.type).toBe("placeholder");
  });

  it("prefers higher richness/engagement clips when inventory is present", () => {
    const twoClips: ContentCatalog = {
      sources: ["s3://lucky9-clips/gameplay/"],
      items: [
        {
          uri: "s3://lucky9-clips/gameplay/mud.mp4",
          bucket: "lucky9-clips",
          key: "gameplay/mud.mp4",
          kind: "video",
          sourcePrefix: "s3://lucky9-clips/gameplay/",
          url: "https://cdn.example/mud.mp4",
        },
        {
          uri: "s3://lucky9-clips/gameplay/flex.mp4",
          bucket: "lucky9-clips",
          key: "gameplay/flex.mp4",
          kind: "video",
          sourcePrefix: "s3://lucky9-clips/gameplay/",
          url: "https://cdn.example/flex.mp4",
        },
      ],
    };
    const beats = selectStoryBeats({
      lines: ["HOOK"],
      catalog: twoClips,
      inventory: {
        version: 1,
        clips: [
          {
            id: "mud",
            s3Uri: "s3://lucky9-clips/gameplay/mud.mp4",
            sourcePrefix: "s3://lucky9-clips/gameplay/",
            mediaType: "video",
            nature: [],
            tags: [],
            visualRichness: 1,
            engagement: 1,
            usedInShorts: [],
          },
          {
            id: "flex",
            s3Uri: "s3://lucky9-clips/gameplay/flex.mp4",
            sourcePrefix: "s3://lucky9-clips/gameplay/",
            mediaType: "video",
            nature: ["mech-flex"],
            tags: [],
            visualRichness: 5,
            engagement: 5,
            usedInShorts: [],
          },
        ],
      },
    });
    expect(beats[0]?.source).toEqual({
      type: "video",
      src: "https://cdn.example/flex.mp4",
    });
  });

  it("uses placeholders when the catalog is empty (offline)", () => {
    const beats = selectStoryBeats({
      lines: ["Hook line"],
      catalog: {sources: [], items: []},
    });
    expect(beats[0]?.source.type).toBe("placeholder");
    expect(beats[0]?.durationInSeconds).toBeGreaterThanOrEqual(0.8);
    expect(beats[0]?.durationInSeconds).toBeLessThanOrEqual(2);
  });
});
