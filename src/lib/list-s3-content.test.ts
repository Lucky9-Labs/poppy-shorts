import {describe, expect, it} from "vitest";
import {listContentSources, listPrefix} from "./list-s3-content";
import type {S3ListClient} from "./list-s3-content";

function fakeClient(
  pages: Record<string, Array<{Key?: string; Size?: number}>>,
): S3ListClient {
  return {
    async listObjectsV2({Prefix}) {
      const prefix = Prefix ?? "";
      return {Contents: pages[prefix] ?? [], IsTruncated: false};
    },
  };
}

describe("listPrefix", () => {
  it("keeps image, video, and audio objects and skips other keys", async () => {
    const client = fakeClient({
      "gameplay/": [
        {Key: "gameplay/boss.mp4", Size: 10},
        {Key: "gameplay/notes.txt", Size: 2},
        {Key: "gameplay/", Size: 0},
        {Key: "gameplay/hit.wav", Size: 4},
        {Key: "gameplay/poster.png", Size: 8},
      ],
    });

    const items = await listPrefix(client, "s3://lucky9-clips/gameplay/");
    expect(items.map((item) => item.kind).sort()).toEqual([
      "audio",
      "image",
      "video",
    ]);
  });
});

describe("listContentSources", () => {
  it("lists several folders and merges them into one catalog", async () => {
    const client = fakeClient({
      "gameplay/": [{Key: "gameplay/boss.mp4", Size: 10}],
      "wip-evidence/": [{Key: "wip-evidence/desk.jpg", Size: 3}],
      "stills/": [{Key: "stills/logo.png", Size: 5}],
    });

    const catalog = await listContentSources(client, [
      "s3://lucky9-clips/gameplay/",
      "s3://lucky9-clips/wip-evidence/",
      "s3://lucky9-brand/stills/",
    ]);

    expect(catalog.sources).toHaveLength(3);
    expect(catalog.items).toHaveLength(3);
    expect(catalog.items.map((item) => item.kind).sort()).toEqual([
      "image",
      "image",
      "video",
    ]);
  });

  it("returns an empty catalog when no sources are configured", async () => {
    const catalog = await listContentSources(fakeClient({}), []);
    expect(catalog.items).toEqual([]);
    expect(catalog.sources).toEqual([]);
  });
});
