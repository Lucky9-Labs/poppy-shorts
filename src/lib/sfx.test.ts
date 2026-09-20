import {describe, expect, it} from "vitest";
import {isRemoteSfxSrc, matchSfxFile, normalizeSfxPath} from "./sfx";

describe("normalizeSfxPath", () => {
  it("strips a leading slash and an optional sfx/ prefix", () => {
    expect(normalizeSfxPath("/sfx/whoosh/cut-01.wav")).toBe(
      "whoosh/cut-01.wav",
    );
    expect(normalizeSfxPath("sfx/impact/hit.mp3")).toBe("impact/hit.mp3");
  });

  it("leaves a category-relative path unchanged", () => {
    expect(normalizeSfxPath("comedy/boing.wav")).toBe("comedy/boing.wav");
  });
});

describe("matchSfxFile", () => {
  const files = [
    {name: "sfx/whoosh/cut-01.wav"},
    {name: "footage/clip.mp4"},
  ];

  it("finds a dropped file under public/sfx", () => {
    expect(matchSfxFile(files, "whoosh/cut-01.wav")).toBe(
      "sfx/whoosh/cut-01.wav",
    );
  });

  it("returns null when the licensed file has not been dropped in yet", () => {
    expect(matchSfxFile(files, "impact/missing.wav")).toBeNull();
  });
});

describe("isRemoteSfxSrc", () => {
  it("accepts http(s) URLs for optional hosted one-shots", () => {
    expect(isRemoteSfxSrc("https://remotion.media/whoosh.wav")).toBe(true);
    expect(isRemoteSfxSrc("whoosh/cut-01.wav")).toBe(false);
  });
});
