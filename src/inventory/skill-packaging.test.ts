import {lstatSync, readdirSync, readFileSync, realpathSync, statSync} from "node:fs";
import path from "node:path";
import {describe, expect, it} from "vitest";
import {NATURE_TAGS} from "./schema";

const repoRoot = path.join(import.meta.dirname, "../..");

function readRepoFile(relativePath: string): string {
  return readFileSync(path.join(repoRoot, relativePath), "utf8");
}

/** Markdown the skill packaging must not steer toward a merge-bot tagging path. */
const DOC_PATHS = [
  "skills/tag-poppy-clips/SKILL.md",
  "docs/INSTALL-SKILL.md",
  "docs/INVENTORY.md",
  "docs/hooks/post-work-tag-clips.md",
  "README.md",
  "hooks/README.md",
  "inventory/README.md",
  "commands/tag-poppy-clips.md",
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

describe("tag-poppy-clips skill packaging", () => {
  it("ships Cursor skill frontmatter agents can discover", () => {
    const skill = readRepoFile("skills/tag-poppy-clips/SKILL.md");
    expect(skill).toMatch(/^---\nname: tag-poppy-clips\n/s);
    expect(skill).toMatch(/description: .+/);
    expect(skill).toContain("inventory:sync");
    expect(skill).toContain("inventory:tag");
    expect(skill).toContain("When to use");
    expect(skill).toMatch(/ShowMe GIF/i);
    for (const tag of NATURE_TAGS) {
      expect(skill).toContain(tag);
    }
  });

  it("documents copy-folder and Cursor plugin install", () => {
    const install = readRepoFile("docs/INSTALL-SKILL.md");
    expect(install).toContain(".cursor/skills");
    expect(install).toContain("marketplace.json");
    expect(install).toContain("github.com/Lucky9-Labs/poppy-shorts");
    expect(install).toContain("/tag-poppy-clips");
    expect(install).toContain("inventory:sync");
    expect(install).toContain("inventory:tag");
    expect(install).toMatch(/--prefix/i);
    expect(readRepoFile("README.md")).toContain("docs/INSTALL-SKILL.md");
  });

  it("exposes plugin manifests that wrap the skill folder", () => {
    const agent = JSON.parse(readRepoFile("plugin.json")) as {
      name: string;
      $schema?: string;
    };
    const cursor = JSON.parse(readRepoFile(".cursor-plugin/plugin.json")) as {
      name: string;
      skills?: string;
    };
    const market = JSON.parse(
      readRepoFile(".cursor-plugin/marketplace.json"),
    ) as {
      plugins: Array<{name: string; source: string}>;
    };

    expect(agent.name).toBe("poppy-shorts");
    expect(agent.$schema).toContain("agent-plugins.org");
    expect(cursor.name).toBe("poppy-shorts");
    expect(cursor.skills).toBe("./skills");
    expect(market.plugins[0]?.source).toBe(".");
  });

  it("exposes the skill via project skill directories", () => {
    const canonical = realpathSync(
      path.join(repoRoot, "skills/tag-poppy-clips/SKILL.md"),
    );
    for (const rel of [".cursor/skills/tag-poppy-clips", ".agents/skills/tag-poppy-clips"]) {
      const link = path.join(repoRoot, rel);
      expect(lstatSync(link).isSymbolicLink()).toBe(true);
      expect(realpathSync(path.join(link, "SKILL.md"))).toBe(canonical);
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
