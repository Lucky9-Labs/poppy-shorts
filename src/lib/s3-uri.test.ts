import {describe, expect, it} from "vitest";
import {classifyContentKind, parseS3Uri, toS3Uri} from "./s3-uri";

describe("parseS3Uri", () => {
  it("parses a folder prefix with a trailing slash", () => {
    expect(parseS3Uri("s3://lucky9-clips/gameplay/captures/")).toEqual({
      bucket: "lucky9-clips",
      prefix: "gameplay/captures/",
    });
  });

  it("normalizes a prefix that is missing the trailing slash", () => {
    expect(parseS3Uri("s3://lucky9-clips/gameplay/captures")).toEqual({
      bucket: "lucky9-clips",
      prefix: "gameplay/captures/",
    });
  });

  it("accepts a bucket-only path", () => {
    expect(parseS3Uri("s3://lucky9-clips")).toEqual({
      bucket: "lucky9-clips",
      prefix: "",
    });
  });

  it("rejects non-s3 URIs and empty buckets", () => {
    expect(() => parseS3Uri("https://example.com/clips")).toThrow(/s3:\/\//);
    expect(() => parseS3Uri("s3://")).toThrow(/bucket/);
  });
});

describe("toS3Uri", () => {
  it("rebuilds an s3 URI from bucket and key", () => {
    expect(toS3Uri("lucky9-clips", "gameplay/boss.mp4")).toBe(
      "s3://lucky9-clips/gameplay/boss.mp4",
    );
  });
});

describe("classifyContentKind", () => {
  it("classifies image, video, and audio extensions", () => {
    expect(classifyContentKind("stills/logo.PNG")).toBe("image");
    expect(classifyContentKind("wip/take-03.mov")).toBe("video");
    expect(classifyContentKind("voice/line.wav")).toBe("audio");
  });

  it("returns other for keys that are not media", () => {
    expect(classifyContentKind("notes/readme.md")).toBe("other");
    expect(classifyContentKind("gameplay/")).toBe("other");
  });
});
