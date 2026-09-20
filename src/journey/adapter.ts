/** How a consuming project already captures verified visual proof. */
export type ShowmeAdapter = {
  kind: "skill" | "npm-script" | "cli" | "playwright" | "none";
  path?: string;
  command?: string;
};

const SKILL_CANDIDATES = [
  "skills/showme/SKILL.md",
  ".cursor/skills/showme/SKILL.md",
  ".agents/skills/showme/SKILL.md",
  ".codex/skills/showme/SKILL.md",
];

const CLI_CANDIDATES = ["scripts/showme", "bin/showme", "tools/showme"];

const PLAYWRIGHT_CANDIDATES = [
  "playwright.config.ts",
  "playwright.config.js",
  "playwright.config.mts",
];

/**
 * Pick the host project's capture adapter. Never vendor a Unity ShowMe binary;
 * if nothing matches, return `none` and ask the human for artifacts.
 */
export function locateShowmeAdapter(input: {
  files: string[];
  npmScripts?: Record<string, string>;
}): ShowmeAdapter {
  const files = new Set(input.files);
  const skill = SKILL_CANDIDATES.find((candidate) => files.has(candidate));
  if (skill) {
    return {kind: "skill", path: skill};
  }
  if (input.npmScripts?.showme) {
    return {kind: "npm-script", command: "npm run showme"};
  }
  const cli = CLI_CANDIDATES.find((candidate) => files.has(candidate));
  if (cli) {
    return {kind: "cli", path: cli, command: cli};
  }
  const playwright = PLAYWRIGHT_CANDIDATES.find((candidate) => files.has(candidate));
  if (playwright) {
    return {kind: "playwright", path: playwright};
  }
  return {kind: "none"};
}
