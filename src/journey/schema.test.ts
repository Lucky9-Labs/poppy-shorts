import {describe, expect, it} from "vitest";
import {parseJourneyPackage} from "./schema";

describe("parseJourneyPackage", () => {
  it("accepts a motion GIF as the whole start-to-finish proof", () => {
    const pkg = parseJourneyPackage({
      version: 1,
      feature: "hangar loadout swap",
      caption: "Empty rack to painted mech in one take",
      runtime: {identity: "unity-editor", commit: "abc1234", branch: "feat/loadout"},
      artifacts: [{role: "motion", path: "journeys/loadout.gif"}],
    });
    expect(pkg.artifacts).toHaveLength(1);
    expect(pkg.artifacts[0]?.role).toBe("motion");
    expect(pkg.runtime?.commit).toBe("abc1234");
  });

  it("accepts before/after stills plus an optional published prefix", () => {
    const pkg = parseJourneyPackage({
      version: 1,
      feature: "ui contrast fix",
      caption: "Unreadable hangar labels vs readable ones",
      artifacts: [
        {role: "start", path: "journeys/ui-before.png", mediaType: "image"},
        {role: "end", path: "journeys/ui-after.png", mediaType: "image"},
      ],
      publishedPrefix: "s3://clips/proof/",
    });
    expect(pkg.artifacts.map((item) => item.role)).toEqual(["start", "end"]);
    expect(pkg.publishedPrefix).toBe("s3://clips/proof/");
  });

  it("rejects an empty artifact list", () => {
    expect(() =>
      parseJourneyPackage({
        version: 1,
        feature: "no proof",
        caption: "forgot to capture",
        artifacts: [],
      }),
    ).toThrow();
  });
});
