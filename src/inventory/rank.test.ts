import {describe, expect, it} from "vitest";
import type {ContentCatalog} from "../lib/content-catalog";
import {clipScore} from "./score";
import {rankCatalogItems} from "./rank";
import type {ClipInventory} from "./schema";

const catalog: ContentCatalog = {
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

const inventory: ClipInventory = {
  version: 1,
  clips: [
    {
      id: "mud",
      s3Uri: "s3://lucky9-clips/gameplay/mud.mp4",
      sourcePrefix: "s3://lucky9-clips/gameplay/",
      mediaType: "video",
      nature: ["gameplay"],
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
      hookPotential: 5,
      usedInShorts: [],
    },
  ],
};

describe("clipScore", () => {
  it("sums richness, engagement, and half of hook potential", () => {
    expect(clipScore(inventory.clips[1])).toBe(12.5);
    expect(clipScore(undefined)).toBe(0);
  });
});

describe("rankCatalogItems", () => {
  it("orders visually richer / more engaging clips first", () => {
    const ranked = rankCatalogItems(catalog.items, inventory, "video");
    expect(ranked.map((item) => item.key)).toEqual([
      "gameplay/flex.mp4",
      "gameplay/mud.mp4",
    ]);
  });

  it("keeps listing order when no inventory is provided", () => {
    const ranked = rankCatalogItems(catalog.items, undefined, "video");
    expect(ranked.map((item) => item.key)).toEqual([
      "gameplay/mud.mp4",
      "gameplay/flex.mp4",
    ]);
  });
});
