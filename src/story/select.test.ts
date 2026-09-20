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
