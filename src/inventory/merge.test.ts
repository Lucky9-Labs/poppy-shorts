import {describe, expect, it} from "vitest";
import type {ContentCatalog} from "../lib/content-catalog";
import {emptyInventory, stubFromCatalogItem} from "./schema";
import {applyTagPatch} from "./tag";
import {mergeCatalogIntoInventory} from "./merge";

const catalog: ContentCatalog = {
  sources: [
    "s3://lucky9-clips/gameplay/",
    "s3://lucky9-clips/wip-evidence/",
  ],
  items: [
    {
      uri: "s3://lucky9-clips/gameplay/boss.mp4",
      bucket: "lucky9-clips",
      key: "gameplay/boss.mp4",
      kind: "video",
      sourcePrefix: "s3://lucky9-clips/gameplay/",
    },
    {
      uri: "s3://lucky9-clips/wip-evidence/desk.jpg",
      bucket: "lucky9-clips",
      key: "wip-evidence/desk.jpg",
      kind: "image",
      sourcePrefix: "s3://lucky9-clips/wip-evidence/",
    },
  ],
};

describe("mergeCatalogIntoInventory", () => {
  it("inserts untagged stubs for new S3 objects", () => {
    const next = mergeCatalogIntoInventory(emptyInventory(), catalog);
    expect(next.version).toBe(1);
    expect(next.clips).toHaveLength(2);
    expect(next.clips.every((clip) => clip.tags.length === 0)).toBe(true);
    expect(next.clips.every((clip) => clip.visualRichness === undefined)).toBe(
      true,
    );
  });

  it("keeps manual tags and scores when the same object is re-ingested", () => {
    const first = mergeCatalogIntoInventory(emptyInventory(), catalog);
    const tagged = applyTagPatch(first, first.clips[0]!.id, {
      visualRichness: 5,
      engagement: 4,
      nature: ["mech-flex", "horror"],
      tags: ["cold open"],
      notes: "best hangar lighting this week",
      taggedBy: "lakshya",
    });

    const replay = mergeCatalogIntoInventory(tagged, {
      sources: catalog.sources,
      items: [catalog.items[0]!],
    });

    const clip = replay.clips.find((item) => item.s3Uri === catalog.items[0]!.uri);
    expect(clip?.visualRichness).toBe(5);
    expect(clip?.engagement).toBe(4);
    expect(clip?.nature).toEqual(["mech-flex", "horror"]);
    expect(clip?.tags).toEqual(["cold open"]);
    expect(clip?.notes).toContain("hangar");
    expect(replay.clips.some((item) => item.s3Uri === catalog.items[1]!.uri)).toBe(
      true,
    );
  });

  it("does not wipe a tagged clip that is missing from this listing", () => {
    const stub = stubFromCatalogItem(catalog.items[0]!);
    const existing = {
      version: 1 as const,
      clips: [
        {
          ...stub,
          visualRichness: 3,
          engagement: 3,
          taggedAt: "2026-01-01T00:00:00.000Z",
        },
      ],
    };
    const next = mergeCatalogIntoInventory(existing, {
      sources: [],
      items: [],
    });
    expect(next.clips[0]?.visualRichness).toBe(3);
  });
});
