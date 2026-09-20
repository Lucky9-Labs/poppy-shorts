import {describe, expect, it} from "vitest";
import {
  catalogItemsOfKind,
  emptyContentCatalog,
  mergeContentCatalogs,
  pickCatalogItem,
} from "./content-catalog";
import type {CatalogItem, ContentCatalog} from "./content-catalog";

const gameplay: CatalogItem = {
  uri: "s3://lucky9-clips/gameplay/boss.mp4",
  bucket: "lucky9-clips",
  key: "gameplay/boss.mp4",
  kind: "video",
  sourcePrefix: "s3://lucky9-clips/gameplay/",
  sizeBytes: 1200,
};

const still: CatalogItem = {
  uri: "s3://lucky9-brand/stills/logo.png",
  bucket: "lucky9-brand",
  key: "stills/logo.png",
  kind: "image",
  sourcePrefix: "s3://lucky9-brand/stills/",
};

const wipDup: CatalogItem = {
  ...gameplay,
  sourcePrefix: "s3://lucky9-clips/wip-evidence/",
};

describe("mergeContentCatalogs", () => {
  it("merges items from multiple prefixes and records every source", () => {
    const left = {sources: [gameplay.sourcePrefix], items: [gameplay]};
    const right = {sources: [still.sourcePrefix], items: [still]};
    const merged = mergeContentCatalogs(left, right);

    expect(merged.sources).toEqual([
      "s3://lucky9-clips/gameplay/",
      "s3://lucky9-brand/stills/",
    ]);
    expect(merged.items).toHaveLength(2);
  });

  it("dedupes the same object listed under two prefixes", () => {
    const merged = mergeContentCatalogs(
      {sources: [gameplay.sourcePrefix], items: [gameplay]},
      {sources: [wipDup.sourcePrefix], items: [wipDup]},
    );

    expect(merged.items).toHaveLength(1);
    expect(merged.sources).toHaveLength(2);
  });
});

describe("catalog helpers", () => {
  const catalog: ContentCatalog = {
    sources: [gameplay.sourcePrefix, still.sourcePrefix],
    items: [gameplay, still],
  };

  it("filters by kind for smash-cut plates vs SFX", () => {
    expect(catalogItemsOfKind(catalog, "video").map((item) => item.key)).toEqual([
      "gameplay/boss.mp4",
    ]);
  });

  it("picks by kind and index, or null when the catalog is empty", () => {
    expect(pickCatalogItem(catalog, "image", 0)?.key).toBe("stills/logo.png");
    expect(pickCatalogItem(emptyContentCatalog(), "video", 0)).toBeNull();
    expect(pickCatalogItem(catalog, "video", 4)).toBeNull();
  });
});
