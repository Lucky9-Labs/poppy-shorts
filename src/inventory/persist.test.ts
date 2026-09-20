import {mkdtemp, writeFile} from "node:fs/promises";
import {tmpdir} from "node:os";
import path from "node:path";
import {describe, expect, it} from "vitest";
import {emptyInventory} from "./schema";
import {loadInventory, saveInventory} from "./persist";
import {applyTagPatch} from "./tag";

describe("inventory persist", () => {
  it("round-trips tags and does not invent a wipe on missing files", async () => {
    const dir = await mkdtemp(path.join(tmpdir(), "poppy-inventory-"));
    const filePath = path.join(dir, "clips.json");

    const missing = await loadInventory(filePath);
    expect(missing).toEqual(emptyInventory());

    const tagged = applyTagPatch(
      {
        version: 1,
        clips: [
          {
            id: "flex",
            s3Uri: "s3://lucky9-clips/gameplay/flex.mp4",
            sourcePrefix: "s3://lucky9-clips/gameplay/",
            mediaType: "video",
            nature: [],
            tags: [],
            usedInShorts: [],
          },
        ],
      },
      "flex",
      {visualRichness: 5, engagement: 4, taggedBy: "test"},
    );
    await saveInventory(tagged, filePath);
    const loaded = await loadInventory(filePath);
    expect(loaded.clips[0]?.visualRichness).toBe(5);
    expect(loaded.clips[0]?.engagement).toBe(4);
  });

  it("rejects a corrupt inventory instead of silently dropping tags", async () => {
    const dir = await mkdtemp(path.join(tmpdir(), "poppy-inventory-"));
    const filePath = path.join(dir, "clips.json");
    await writeFile(filePath, '{"version":2,"clips":[]}\n', "utf8");
    await expect(loadInventory(filePath)).rejects.toThrow();
  });
});
