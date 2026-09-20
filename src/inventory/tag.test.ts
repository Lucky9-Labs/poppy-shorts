import {describe, expect, it} from "vitest";
import {emptyInventory, type ClipInventory} from "./schema";
import {applyTagPatch, parseTagCliArgs} from "./tag";

describe("applyTagPatch", () => {
  it("patches scores and merges nature tags without dropping usedInShorts", () => {
    const base = emptyInventory();
    const withClip: ClipInventory = {
      ...base,
      clips: [
        {
          id: "flex",
          s3Uri: "s3://lucky9-clips/gameplay/flex.mp4",
          sourcePrefix: "s3://lucky9-clips/gameplay/",
          mediaType: "video",
          nature: ["gameplay"],
          tags: ["old"],
          usedInShorts: ["ExampleShort"],
        },
      ],
    };

    const next = applyTagPatch(withClip, "flex", {
      visualRichness: 5,
      engagement: 4,
      hookPotential: 3,
      nature: ["mech-flex", "horror"],
      tags: ["cold open"],
      notes: "use as hook",
      taggedBy: "agent",
    });

    expect(next.clips[0]?.visualRichness).toBe(5);
    expect(next.clips[0]?.nature).toEqual(["gameplay", "mech-flex", "horror"]);
    expect(next.clips[0]?.tags).toEqual(["old", "cold open"]);
    expect(next.clips[0]?.usedInShorts).toEqual(["ExampleShort"]);
    expect(next.clips[0]?.taggedBy).toBe("agent");
    expect(next.clips[0]?.taggedAt).toMatch(/T/);
  });
});

describe("parseTagCliArgs", () => {
  it("reads id, scores, comma tags, and notes", () => {
    const parsed = parseTagCliArgs([
      "flex",
      "--richness",
      "5",
      "--engagement",
      "4",
      "--tags",
      "mech-flex,horror",
      "--notes",
      "use as hook",
    ]);
    expect(parsed.id).toBe("flex");
    expect(parsed.patch.visualRichness).toBe(5);
    expect(parsed.patch.engagement).toBe(4);
    expect(parsed.patch.nature).toEqual(["mech-flex", "horror"]);
    expect(parsed.patch.notes).toBe("use as hook");
  });

  it("accepts an interactive JSON patch", () => {
    const parsed = parseTagCliArgs([
      "--id",
      "flex",
      "--json",
      '{"visualRichness":5,"notes":"hook","nature":["absurd"]}',
    ]);
    expect(parsed.id).toBe("flex");
    expect(parsed.patch.visualRichness).toBe(5);
    expect(parsed.patch.nature).toEqual(["absurd"]);
  });
});
