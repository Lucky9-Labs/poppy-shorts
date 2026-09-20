import {lstatSync, readdirSync, readFileSync, realpathSync, statSync} from "node:fs";
import path from "node:path";
import {describe, expect, it} from "vitest";
import {NATURE_TAGS} from "./schema";
import {PRESERVE_USES} from "../journey/preserve";

const repoRoot = path.join(import.meta.dirname, "../..");

const PLUGIN_SKILLS = [
  "tag-poppy-clips",
  "poppy-journey",
  "poppy-preserve-content",
] as const;

function readRepoFile(relativePath: string): string {
  return readFileSync(path.join(repoRoot, relativePath), "utf8");
}

/** Markdown the plugin must not steer toward a merge-bot tagging path. */
const DOC_PATHS = [
  "skills/tag-poppy-clips/SKILL.md",
  "skills/poppy-journey/SKILL.md",
  "skills/poppy-preserve-content/SKILL.md",
  "docs/INSTALL-PLUGIN.md",
  "docs/INSTALL-SKILL.md",
  "docs/INVENTORY.md",
  "docs/hooks/post-work-tag-clips.md",
  "README.md",
  "hooks/README.md",
  "inventory/README.md",
  "commands/tag-poppy-clips.md",
  "commands/poppy-journey.md",
  "commands/poppy-preserve-content.md",
];

function listMarkdownFiles(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const full = path.join(dir, name);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      out.push(...listMarkdownFiles(full));
    } else if (name.endsWith(".md")) {
      out.push(full);
    }
  }
  return out;
}

describe("poppy-shorts plugin packaging", () => {
  it("ships Cursor skill frontmatter for the full capture loop", () => {
    for (const name of PLUGIN_SKILLS) {
      const skill = readRepoFile(`skills/${name}/SKILL.md`);
      expect(skill).toMatch(new RegExp(`^---\\nname: ${name}\\n`, "s"));
      expect(skill).toMatch(/description: .+/);
    }
    const tag = readRepoFile("skills/tag-poppy-clips/SKILL.md");
    expect(tag).toContain("inventory:sync");
    expect(tag).toContain("inventory:tag");
    expect(tag).toMatch(/ShowMe GIF/i);
    for (const nature of NATURE_TAGS) {
      expect(tag).toContain(nature);
    }
  });

  it("documents journey capture via the host adapter, not a vendored recorder", () => {
    const journey = readRepoFile("skills/poppy-journey/SKILL.md");
    expect(journey).toContain("inventory:journey");
    expect(journey).toMatch(/GIF/i);
    expect(journey).toContain("contentSources");
    expect(journey.toLowerCase()).toContain("do **not** vendor unity showme");
    expect(journey.toLowerCase()).toContain("playwright");
    expect(journey).toContain("No journey to capture");
  });

  it("documents a post-ship preserve prompt that can exit quietly", () => {
    const preserve = readRepoFile("skills/poppy-preserve-content/SKILL.md");
    expect(preserve).toContain("Preserve this work for content?");
    expect(preserve).toContain("Not preserving for content.");
    expect(preserve).toContain("tag-poppy-clips");
    for (const use of PRESERVE_USES) {
      expect(preserve).toContain(use);
    }
  });

  it("documents copy-folder and Cursor plugin install for the loop", () => {
    const install = readRepoFile("docs/INSTALL-PLUGIN.md");
    expect(install).toContain(".cursor/skills");
    expect(install).toContain("marketplace.json");
    expect(install).toContain("github.com/Lucky9-Labs/poppy-shorts");
    expect(install).toContain("/poppy-journey");
    expect(install).toContain("/poppy-preserve-content");
    expect(install).toContain("/tag-poppy-clips");
    expect(install).toContain("inventory:journey");
    expect(install).toContain("inventory:sync");
    expect(install).toContain("inventory:tag");
    expect(install).toMatch(/--prefix/i);
    expect(readRepoFile("docs/INSTALL-SKILL.md")).toContain("INSTALL-PLUGIN.md");
    expect(readRepoFile("README.md")).toContain("docs/INSTALL-PLUGIN.md");
    expect(readRepoFile("README.md")).toMatch(/show the journey/i);
  });

  it("exposes plugin manifests that wrap the skill folder", () => {
    const agent = JSON.parse(readRepoFile("plugin.json")) as {
      name: string;
      $schema?: string;
      description: string;
    };
    const cursor = JSON.parse(readRepoFile(".cursor-plugin/plugin.json")) as {
      name: string;
      skills?: string;
    };
    const market = JSON.parse(
      readRepoFile(".cursor-plugin/marketplace.json"),
    ) as {
      plugins: Array<{name: string; source: string; description: string}>;
    };

    expect(agent.name).toBe("poppy-shorts");
    expect(agent.$schema).toContain("agent-plugins.org");
    expect(agent.description.toLowerCase()).toContain("journey");
    expect(cursor.name).toBe("poppy-shorts");
    expect(cursor.skills).toBe("./skills");
    expect(market.plugins[0]?.source).toBe(".");
    expect(market.plugins[0]?.description).toContain("poppy-journey");
  });

  it("exposes every plugin skill via project skill directories", () => {
    for (const name of PLUGIN_SKILLS) {
      const canonical = realpathSync(path.join(repoRoot, `skills/${name}/SKILL.md`));
      for (const root of [".cursor/skills", ".agents/skills"]) {
        const link = path.join(repoRoot, root, name);
        expect(lstatSync(link).isSymbolicLink()).toBe(true);
        expect(realpathSync(path.join(link, "SKILL.md"))).toBe(canonical);
      }
    }
  });

  it("does not tell people to tag via a merge-bot routine", () => {
    const forbidden = [/grok bot/i, /game dev cos/i];
    const files = new Set([
      ...DOC_PATHS.map((rel) => path.join(repoRoot, rel)),
      ...listMarkdownFiles(path.join(repoRoot, "docs")),
      ...listMarkdownFiles(path.join(repoRoot, "skills")),
    ]);
    for (const file of files) {
      const text = readFileSync(file, "utf8");
      for (const pattern of forbidden) {
        expect(text, `${file} matches ${pattern}`).not.toMatch(pattern);
      }
    }
  });
});
