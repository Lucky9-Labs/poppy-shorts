import {describe, expect, it} from "vitest";
import {parseContentSourcesInput} from "./content-sources";

describe("parseContentSourcesInput", () => {
  it("accepts a string array of s3 folder paths", () => {
    expect(
      parseContentSourcesInput([
        "s3://lucky9-clips/gameplay/",
        "s3://lucky9-clips/wip-evidence",
      ]),
    ).toEqual([
      "s3://lucky9-clips/gameplay/",
      "s3://lucky9-clips/wip-evidence/",
    ]);
  });

  it("parses a JSON env string", () => {
    expect(
      parseContentSourcesInput(
        '["s3://lucky9-clips/gameplay/","s3://lucky9-brand/stills/"]',
      ),
    ).toEqual([
      "s3://lucky9-clips/gameplay/",
      "s3://lucky9-brand/stills/",
    ]);
  });

  it("parses a comma-separated env string", () => {
    expect(
      parseContentSourcesInput(
        "s3://lucky9-clips/gameplay, s3://lucky9-brand/stills/",
      ),
    ).toEqual([
      "s3://lucky9-clips/gameplay/",
      "s3://lucky9-brand/stills/",
    ]);
  });

  it("returns an empty list when S3 is not configured", () => {
    expect(parseContentSourcesInput(undefined)).toEqual([]);
    expect(parseContentSourcesInput("")).toEqual([]);
    expect(parseContentSourcesInput([])).toEqual([]);
  });

  it("dedupes identical prefixes after normalization", () => {
    expect(
      parseContentSourcesInput([
        "s3://lucky9-clips/gameplay",
        "s3://lucky9-clips/gameplay/",
      ]),
    ).toEqual(["s3://lucky9-clips/gameplay/"]);
  });
});
