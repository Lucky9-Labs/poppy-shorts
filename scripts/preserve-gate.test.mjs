/**
 * Heuristics for the installable preserve-for-content gate.
 * Uses a temp project root so we never write `.poppy/` into the checkout.
 */
import {mkdirSync, mkdtempSync, readFileSync, writeFileSync} from "node:fs";
import {tmpdir} from "node:os";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {afterEach, describe, expect, it} from "vitest";
import {
  PENDING_RELATIVE_PATH,
  commandLooksPreservable,
  consumePendingFlag,
  evaluateSignals,
  handleMark,
  handleStopClaude,
  handleStopCursor,
  outputMentionsMedia,
  resolvePluginRoot,
} from "./preserve-gate.mjs";

/** @type {string[]} */
const tempRoots = [];

function makeProjectRoot() {
  const root = mkdtempSync(path.join(tmpdir(), "poppy-preserve-gate-"));
  tempRoots.push(root);
  return root;
}

function envFor(root) {
  return {CLAUDE_PROJECT_DIR: root, CURSOR_PROJECT_DIR: root};
}

afterEach(() => {
  // Leave dirs for OS tmp cleanup; tests must not touch the repo `.poppy/`.
  tempRoots.length = 0;
});

describe("commandLooksPreservable", () => {
  it.each([
    "git merge origin/main",
    "GIT MERGE --no-ff feature",
    "gh pr merge 42 --squash",
    "sendit --yes",
    "npm run inventory:journey -- journeys/hangar.json",
    "npm run inventory:sync -- s3://clips/wip/",
    "ffmpeg -i in.mov out/export.mp4",
    "obs --startrecording",
    "blender -b scene.blend -o exports/shot",
    "npx remotion render ExampleShort out/example.mp4",
    "scripts/capture-hangar.sh",
    "npx playwright screenshot",
    "cp plate.png captures/hero.png",
    "mv clip.webm exports/clip.webm",
    "open Recordings/take.mov",
    "convert still.gif",
  ])("marks %s", (command) => {
    expect(commandLooksPreservable(command)).toBe(true);
  });

  it.each([
    "git status",
    "npm test",
    "npm run inventory:tag -- flex --richness 5",
    "ls src",
    "eslint src",
  ])("ignores %s", (command) => {
    expect(commandLooksPreservable(command)).toBe(false);
  });
});

describe("outputMentionsMedia", () => {
  it("marks when stdout lists a new media path", () => {
    expect(outputMentionsMedia("wrote captures/bay-light.mp4")).toBe(true);
    expect(outputMentionsMedia("Exported journeys/loadout.gif")).toBe(true);
  });

  it("ignores ordinary compiler output", () => {
    expect(outputMentionsMedia("tsc: Found 0 errors")).toBe(false);
  });
});

describe("handleMark", () => {
  it("writes a pending flag for merge/sendit-like shell JSON", () => {
    const root = makeProjectRoot();
    const marked = handleMark(
      {command: "gh pr merge 9", cwd: root, output: "merged"},
      envFor(root),
    );
    expect(marked).toBe(true);
    const pending = JSON.parse(
      readFileSync(path.join(root, PENDING_RELATIVE_PATH), "utf8"),
    );
    expect(pending.consumedAt).toBeUndefined();
    expect(pending.markedAt).toMatch(/T/);
    expect(pending.command).toContain("gh pr merge");
  });

  it("marks when Claude PostToolUse wrote a media path even if the command is generic", () => {
    const root = makeProjectRoot();
    const marked = handleMark(
      {
        tool_name: "Bash",
        cwd: root,
        tool_input: {command: "cp artifact.bin dest.bin"},
        tool_response: {output: "copied dest/hero.webm"},
      },
      envFor(root),
    );
    expect(marked).toBe(true);
  });

  it("does not write a flag for an unrelated command", () => {
    const root = makeProjectRoot();
    expect(
      handleMark({command: "npm test", cwd: root, output: "ok"}, envFor(root)),
    ).toBe(false);
    expect(evaluateSignals(root).preservable).toBe(false);
  });
});

describe("stop handlers", () => {
  it("Cursor emits followup only when a fresh pending flag exists", () => {
    const root = makeProjectRoot();
    expect(
      handleStopCursor({status: "completed", loop_count: 0, cwd: root}, envFor(root)),
    ).toEqual({});

    handleMark({command: "sendit", cwd: root}, envFor(root));
    const first = handleStopCursor(
      {status: "completed", loop_count: 0, cwd: root},
      envFor(root),
    );
    expect(first.followup_message).toMatch(/\/poppy-preserve-content/);
    expect(first.followup_message).toMatch(/Preserve this work for content\?/);
    expect(first.followup_message).toMatch(/Do NOT invent clip scores/i);

    const again = handleStopCursor(
      {status: "completed", loop_count: 0, cwd: root},
      envFor(root),
    );
    expect(again).toEqual({});
  });

  it("Cursor stays silent on loop_count >= 1 or a non-completed status", () => {
    const root = makeProjectRoot();
    handleMark({command: "ffmpeg -i a.mov b.mp4", cwd: root}, envFor(root));
    expect(
      handleStopCursor({status: "completed", loop_count: 1, cwd: root}, envFor(root)),
    ).toEqual({});
    expect(
      handleStopCursor({status: "aborted", loop_count: 0, cwd: root}, envFor(root)),
    ).toEqual({});
  });

  it("Claude blocks with a skill prompt when preservable, else continues", () => {
    const root = makeProjectRoot();
    expect(
      handleStopClaude({stop_hook_active: false, cwd: root}, envFor(root)),
    ).toEqual({continue: true});

    handleMark({command: "inventory:journey", cwd: root}, envFor(root));
    const blocked = handleStopClaude(
      {stop_hook_active: false, cwd: root},
      envFor(root),
    );
    expect(blocked.decision).toBe("block");
    expect(blocked.reason).toMatch(/poppy-preserve-content/);
    expect(blocked.reason).toMatch(/Preserve this work for content\?/);
  });

  it("Claude/Codex stay silent when stop_hook_active is set", () => {
    const root = makeProjectRoot();
    handleMark({command: "git merge main", cwd: root}, envFor(root));
    expect(
      handleStopClaude({stop_hook_active: true, cwd: root}, envFor(root)),
    ).toEqual({continue: true});
  });
});

describe("evaluateSignals", () => {
  it("treats untagged inventory stubs as preservable", () => {
    const root = makeProjectRoot();
    mkdirSync(path.join(root, "inventory"), {recursive: true});
    writeFileSync(
      path.join(root, "inventory/clips.json"),
      JSON.stringify({
        version: 1,
        clips: [
          {
            id: "stub",
            s3Uri: "s3://clips/wip/stub.mp4",
            sourcePrefix: "s3://clips/wip/",
            mediaType: "video",
            nature: [],
            tags: [],
          },
        ],
      }),
    );
    expect(evaluateSignals(root).preservable).toBe(true);
  });

  it("treats a recent capture file as preservable", () => {
    const root = makeProjectRoot();
    const captures = path.join(root, "captures");
    mkdirSync(captures, {recursive: true});
    writeFileSync(path.join(captures, "take.mp4"), "fake");
    expect(evaluateSignals(root).preservable).toBe(true);
  });

  it("ignores a consumed or stale pending flag", () => {
    const root = makeProjectRoot();
    handleMark({command: "sendit", cwd: root}, envFor(root));
    consumePendingFlag(root);
    expect(evaluateSignals(root).preservable).toBe(false);

    const staleRoot = makeProjectRoot();
    handleMark({command: "sendit", cwd: staleRoot}, envFor(staleRoot));
    const now = Date.now() + 25 * 60 * 60 * 1000;
    expect(evaluateSignals(staleRoot, now).preservable).toBe(false);
  });
});

describe("resolvePluginRoot", () => {
  it("prefers CLAUDE_PLUGIN_ROOT / CURSOR_PLUGIN_ROOT / PLUGIN_ROOT then import.meta.url", () => {
    expect(resolvePluginRoot({CLAUDE_PLUGIN_ROOT: "/opt/plugin"})).toBe(
      "/opt/plugin",
    );
    expect(resolvePluginRoot({CURSOR_PLUGIN_ROOT: "/cursor/plugin"})).toBe(
      "/cursor/plugin",
    );
    expect(resolvePluginRoot({PLUGIN_ROOT: "/codex/plugin"})).toBe("/codex/plugin");
    const fallback = resolvePluginRoot({});
    expect(fallback).toBe(path.join(path.dirname(fileURLToPath(import.meta.url)), ".."));
  });
});
