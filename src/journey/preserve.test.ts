import {describe, expect, it} from "vitest";
import {NATURE_TAGS} from "../inventory/schema";
import {natureForPreserveUse, PRESERVE_USES} from "./preserve";
import {chooseProofPrefix} from "./proof-prefix";

describe("preserve-content mapping", () => {
  it("maps each content use onto known nature buckets", () => {
    expect(natureForPreserveUse("smash-cut-short")).toEqual(["gameplay", "absurd"]);
    expect(natureForPreserveUse("expectation-vs-reality")).toEqual(["wip", "absurd"]);
    expect(natureForPreserveUse("wip-flex")).toEqual(["wip", "mech-flex"]);
    expect(natureForPreserveUse("bug-comedy")).toEqual(["bug", "absurd"]);
    expect(natureForPreserveUse("hangar-process")).toEqual(["hangar", "wip"]);
    expect(natureForPreserveUse("trailer-b-roll")).toEqual(["b-roll"]);
    for (const use of PRESERVE_USES) {
      for (const tag of natureForPreserveUse(use)) {
        expect(NATURE_TAGS).toContain(tag);
      }
    }
  });

  it("returns empty nature when the operator skips or names an unknown use", () => {
    expect(natureForPreserveUse("no")).toEqual([]);
    expect(natureForPreserveUse("custom-vibes")).toEqual([]);
  });
});

describe("chooseProofPrefix", () => {
  it("prefers a proof or wip-evidence folder over a generic gameplay prefix", () => {
    expect(
      chooseProofPrefix([
        "s3://clips/gameplay/",
        "s3://clips/wip-evidence/",
        "s3://clips/brand-stills/",
      ]),
    ).toBe("s3://clips/wip-evidence/");
  });

  it("falls back to the first source, or null when none exist", () => {
    expect(chooseProofPrefix(["s3://clips/gameplay/"])).toBe("s3://clips/gameplay/");
    expect(chooseProofPrefix([])).toBeNull();
  });
});
