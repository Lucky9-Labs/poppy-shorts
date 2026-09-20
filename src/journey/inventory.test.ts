import {describe, expect, it} from "vitest";
import {emptyInventory} from "../inventory/schema";
import {applyTagPatch} from "../inventory/tag";
import {parseJourneyPackage} from "./schema";
import {journeyToCatalogItems, mergeJourneyIntoInventory} from "./inventory";
import {publishedArtifactUri} from "./uri";

describe("journey inventory stubs", () => {
  it("maps a local motion GIF to a file:// stub", () => {
    const pkg = parseJourneyPackage({
      version: 1,
      feature: "dash",
      caption: "Walk to dash",
      artifacts: [{role: "motion", path: "journeys/dash.gif"}],
    });
    const items = journeyToCatalogItems(pkg);
    expect(items).toHaveLength(1);
    expect(items[0]?.uri).toBe("file:journeys/dash.gif");
    expect(items[0]?.kind).toBe("image");
    expect(items[0]?.sourcePrefix).toBe("file:journeys/");
  });

  it("rewrites local paths onto a published s3 proof prefix", () => {
    expect(publishedArtifactUri("journeys/dash.gif", "s3://clips/proof")).toBe(
      "s3://clips/proof/dash.gif",
    );
    const pkg = parseJourneyPackage({
      version: 1,
      feature: "dash",
      caption: "Walk to dash",
      artifacts: [{role: "motion", path: "journeys/dash.gif"}],
      publishedPrefix: "s3://clips/proof/",
    });
    expect(journeyToCatalogItems(pkg)[0]?.uri).toBe("s3://clips/proof/dash.gif");
  });

  it("upserts stubs and keeps scores on replay", () => {
    const pkg = parseJourneyPackage({
      version: 1,
      feature: "dash",
      caption: "Walk to dash",
      artifacts: [
        {role: "start", path: "journeys/a.png"},
        {role: "end", path: "journeys/b.png"},
      ],
    });
    const first = mergeJourneyIntoInventory(emptyInventory(), pkg);
    expect(first.clips).toHaveLength(2);
    expect(first.clips[0]?.notes).toContain("Walk to dash");
    const tagged = applyTagPatch(first, first.clips[0]!.id, {
      visualRichness: 4,
      engagement: 5,
      taggedBy: "test",
    });
    const replay = mergeJourneyIntoInventory(tagged, pkg);
    expect(replay.clips).toHaveLength(2);
    expect(replay.clips[0]?.visualRichness).toBe(4);
  });
});
