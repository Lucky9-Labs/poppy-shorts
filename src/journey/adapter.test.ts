import {describe, expect, it} from "vitest";
import {locateShowmeAdapter} from "./adapter";

describe("locateShowmeAdapter", () => {
  it("prefers a host showme skill over inventing capture", () => {
    const found = locateShowmeAdapter({
      files: [".cursor/skills/showme/SKILL.md", "playwright.config.ts"],
      npmScripts: {showme: "node tools/showme.js"},
    });
    expect(found.kind).toBe("skill");
    expect(found.path).toBe(".cursor/skills/showme/SKILL.md");
  });

  it("falls back to an npm showme script, then a CLI path", () => {
    expect(
      locateShowmeAdapter({
        files: [],
        npmScripts: {showme: "python tools/showme.py"},
      }).command,
    ).toBe("npm run showme");
    expect(
      locateShowmeAdapter({files: ["scripts/showme"], npmScripts: {}}).path,
    ).toBe("scripts/showme");
  });

  it("routes Playwright hosts to their existing runner", () => {
    const found = locateShowmeAdapter({
      files: ["playwright.config.ts"],
      npmScripts: {test: "playwright test"},
    });
    expect(found.kind).toBe("playwright");
  });

  it("returns none so the agent does not vendor a Unity ShowMe binary", () => {
    expect(locateShowmeAdapter({files: ["Assets/Scripts/Foo.cs"]}).kind).toBe(
      "none",
    );
  });
});
