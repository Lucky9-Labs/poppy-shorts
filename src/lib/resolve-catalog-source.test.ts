import {describe, expect, it} from "vitest";
import {resolveCatalogSource} from "./resolve-catalog-source";
import type {ContentCatalog} from "./content-catalog";

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

describe("resolveCatalogSource", () => {
  it("uses a playback URL when the catalog has one", () => {
    expect(
      resolveCatalogSource(
        {type: "catalog", kind: "video", index: 0},
        catalog,
      ),
    ).toEqual({type: "video", src: "https://cdn.example/boss.mp4"});
  });

  it("falls back to a placeholder when S3 is offline or the slot is empty", () => {
    expect(
      resolveCatalogSource(
        {
          type: "catalog",
          kind: "video",
          index: 0,
          fallbackColor: "#111111",
          fallbackLabel: "OFFLINE",
        },
        {sources: [], items: []},
      ),
    ).toEqual({
      type: "placeholder",
      color: "#111111",
      label: "OFFLINE",
    });
  });
});
