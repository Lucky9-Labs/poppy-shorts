/**
 * poppy-shorts preserve-for-content lifecycle gate (Node, no dependencies).
 *
 * Hook entry points (JSON on stdin):
 *   --mark          Cursor afterShellExecution / Claude+Codex PostToolUse
 *   --stop-cursor   Cursor `stop` — `{ followup_message }` or `{}`
 *   --stop-claude   Claude/Codex `Stop` — block+reason or `{ continue: true }`
 *
 * Plugin root: CLAUDE_PLUGIN_ROOT, CURSOR_PLUGIN_ROOT, PLUGIN_ROOT, then
 * the parent of this file (`import.meta.url`) when installed as a plugin.
 */
import {execFileSync} from "node:child_process";
import {
  mkdirSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import {fileURLToPath, pathToFileURL} from "node:url";

/** Local flag written under the consumer project (not this plugin checkout). */
export const PENDING_RELATIVE_PATH = ".poppy/preserve-pending.json";
export const PENDING_TTL_MS = 24 * 60 * 60 * 1000;
export const RECENT_MTIME_MS = 2 * 60 * 60 * 1000;

const MEDIA_EXT_RE = /\.(mp4|webm|mov|png|gif)\b/i;

/** Case-insensitive shell / export signals from the product brief. */
const COMMAND_PATTERNS = [
  /\bgit\s+merge\b/i,
  /\bgh\s+pr\s+merge\b/i,
  /\bsendit\b/i,
  /inventory:journey/i,
  /inventory:sync/i,
  /\bffmpeg\b/i,
  /\bobs(?:-studio)?\b/i,
  /\bblender\b/i,
  /\bremotion\b/i,
  /\bcapture\b/i,
  /\bscreenshot\b/i,
  MEDIA_EXT_RE,
];

const SIGNAL_DIRS = [
  "content-pipeline",
  "captures",
  "journeys",
  "exports",
  "Recordings",
  "inventory",
];

const SKIP_DIR_NAMES = new Set([
  "node_modules",
  ".git",
  "dist",
  "out",
  "coverage",
  ".remotion",
]);

const FOLLOWUP_LINES = [
  "This session produced a preservable capture signal (merge, sendit, media export, or journey).",
  "Follow the poppy-preserve-content skill (`/poppy-preserve-content`):",
  "1. Ask the human: “Preserve this work for content?”",
  "2. If no: leave `.poppy/preserve-pending.json` consumed and stop. Reply only “Not preserving for content.”",
  "3. If yes: collect a Shorts use, then suggest `/poppy-journey` if proof is missing and `/tag-poppy-clips` next.",
  "Do NOT invent clip scores. Scores come from a human who watched the clip.",
];

/** True when the shell command looks like merge, sendit, export, or capture. */
export function commandLooksPreservable(command) {
  if (!command || typeof command !== "string") {
    return false;
  }
  return COMMAND_PATTERNS.some((pattern) => pattern.test(command));
}

/** True when tool output names a media file or a journey JSON path. */
export function outputMentionsMedia(text) {
  if (!text || typeof text !== "string") {
    return false;
  }
  return MEDIA_EXT_RE.test(text) || /journeys\/.+\.json/i.test(text);
}

/** Media extensions, or journey JSON (not inventory/clips.json). */
export function pathLooksLikeMedia(filePath) {
  if (!filePath || typeof filePath !== "string") {
    return false;
  }
  if (MEDIA_EXT_RE.test(filePath)) {
    return true;
  }
  const normalized = filePath.replaceAll("\\", "/");
  return /(?:^|\/)journeys\/.+\.json$/i.test(normalized);
}

/** Prefer payload cwd, then workspace roots, then project env, then process cwd. */
export function resolveProjectRoot(payload, env = process.env) {
  const data = isRecord(payload) ? payload : {};
  if (typeof data.cwd === "string" && data.cwd) {
    return data.cwd;
  }
  if (typeof data.working_directory === "string" && data.working_directory) {
    return data.working_directory;
  }
  if (Array.isArray(data.workspace_roots) && data.workspace_roots[0]) {
    return String(data.workspace_roots[0]);
  }
  return (
    env.CLAUDE_PROJECT_DIR ||
    env.CURSOR_PROJECT_DIR ||
    env.PROJECT_DIR ||
    process.cwd()
  );
}

/** Installed plugin root, with import.meta.url as the last-resort fallback. */
export function resolvePluginRoot(env = process.env, importMetaUrl = import.meta.url) {
  return (
    env.CLAUDE_PLUGIN_ROOT ||
    env.CURSOR_PLUGIN_ROOT ||
    env.PLUGIN_ROOT ||
    path.join(path.dirname(fileURLToPath(importMetaUrl)), "..")
  );
}

/** Command + output + file paths from Cursor, Claude, or Codex hook JSON. */
export function extractHookContext(payload) {
  const data = isRecord(payload) ? payload : {};
  return {
    command: extractCommand(data),
    output: extractOutput(data),
    paths: extractPaths(data),
  };
}

/** Write `.poppy/preserve-pending.json` when the completed tool looks preservable. */
export function handleMark(payload, env = process.env) {
  const root = resolveProjectRoot(payload, env);
  const ctx = extractHookContext(payload);
  const shouldMark =
    commandLooksPreservable(ctx.command) ||
    outputMentionsMedia(ctx.output) ||
    ctx.paths.some((filePath) => pathLooksLikeMedia(filePath));
  if (!shouldMark) {
    return false;
  }
  writePendingFlag(root, {
    command: ctx.command.slice(0, 500),
    reason: markReason(ctx),
  });
  return true;
}

/** Cursor stop: one followup when signals exist; `{}` otherwise (no loops). */
export function handleStopCursor(payload, env = process.env) {
  const data = isRecord(payload) ? payload : {};
  if (Number(data.loop_count) >= 1) {
    return {};
  }
  if (data.status && data.status !== "completed") {
    return {};
  }
  return emitCursorFollowup(resolveProjectRoot(data, env));
}

/** Claude/Codex Stop: block+reason continues the turn; otherwise stay silent. */
export function handleStopClaude(payload, env = process.env) {
  const data = isRecord(payload) ? payload : {};
  if (isStopHookActive(data)) {
    return {continue: true};
  }
  return emitClaudeContinue(resolveProjectRoot(data, env));
}

/**
 * Any one signal is enough: fresh pending flag, git media/journey paths,
 * recent files under common capture dirs, or untagged inventory stubs.
 */
export function evaluateSignals(root, now = Date.now()) {
  const reasons = [];
  if (isPendingFresh(readPendingFlag(root), now)) {
    reasons.push("pending-flag");
  }
  if (gitStatusShowsPreservable(root)) {
    reasons.push("git-status");
  }
  if (recentMediaUnderCommonDirs(root, now)) {
    reasons.push("recent-media");
  }
  if (inventoryHasUntaggedStubs(root)) {
    reasons.push("untagged-stubs");
  }
  return {preservable: reasons.length > 0, reasons};
}

export function pendingFlagPath(root) {
  return path.join(root, PENDING_RELATIVE_PATH);
}

export function readPendingFlag(root) {
  try {
    return JSON.parse(readFileSync(pendingFlagPath(root), "utf8"));
  } catch {
    return null;
  }
}

export function writePendingFlag(root, meta) {
  mkdirSync(path.dirname(pendingFlagPath(root)), {recursive: true});
  const body = {markedAt: new Date().toISOString(), ...meta};
  writeFileSync(pendingFlagPath(root), `${JSON.stringify(body, null, 2)}\n`);
  return body;
}

export function isPendingFresh(flag, now = Date.now()) {
  if (!flag || flag.consumedAt) {
    return false;
  }
  const marked = Date.parse(flag.markedAt);
  return Number.isFinite(marked) && now - marked < PENDING_TTL_MS;
}

/** Mark the pending flag consumed so Stop cannot nudge again from the same mark. */
export function consumePendingFlag(root, now = Date.now()) {
  const existing = readPendingFlag(root) ?? {};
  const next = {
    ...existing,
    markedAt: existing.markedAt ?? new Date(now).toISOString(),
    consumedAt: new Date(now).toISOString(),
  };
  mkdirSync(path.dirname(pendingFlagPath(root)), {recursive: true});
  writeFileSync(pendingFlagPath(root), `${JSON.stringify(next, null, 2)}\n`);
  return next;
}

export function alreadyNudgedRecently(flag, now = Date.now()) {
  if (!flag?.consumedAt) {
    return false;
  }
  const consumed = Date.parse(flag.consumedAt);
  return Number.isFinite(consumed) && now - consumed < RECENT_MTIME_MS;
}

export function buildFollowupText() {
  return FOLLOWUP_LINES.join("\n");
}

export function gitStatusShowsPreservable(root) {
  let text = "";
  try {
    text = execFileSync("git", ["status", "--porcelain"], {
      cwd: root,
      encoding: "utf8",
      timeout: 4000,
      stdio: ["ignore", "pipe", "ignore"],
    });
  } catch {
    return false;
  }
  return text.split("\n").some((line) => porcelainLineLooksPreservable(line));
}

export function recentMediaUnderCommonDirs(root, now = Date.now()) {
  return SIGNAL_DIRS.some((dir) =>
    walkRecentPreservable(path.join(root, dir), now, 0),
  );
}

export function inventoryHasUntaggedStubs(root) {
  let parsed;
  try {
    parsed = JSON.parse(
      readFileSync(path.join(root, "inventory", "clips.json"), "utf8"),
    );
  } catch {
    return false;
  }
  const clips = Array.isArray(parsed?.clips) ? parsed.clips : [];
  return clips.some((clip) => isUntaggedStub(clip));
}

function isRecord(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function extractCommand(data) {
  if (typeof data.command === "string") {
    return data.command;
  }
  const input = data.tool_input ?? data.toolInput ?? data.input;
  if (isRecord(input) && typeof input.command === "string") {
    return input.command;
  }
  if (typeof input === "string") {
    return commandFromMaybeJson(input);
  }
  return "";
}

function commandFromMaybeJson(input) {
  try {
    const parsed = JSON.parse(input);
    if (isRecord(parsed) && typeof parsed.command === "string") {
      return parsed.command;
    }
  } catch {
    return input;
  }
  return input;
}

function extractOutput(data) {
  if (typeof data.output === "string") {
    return data.output;
  }
  if (typeof data.stdout === "string") {
    return data.stdout;
  }
  const response = data.tool_response ?? data.toolResponse ?? data.result;
  if (typeof response === "string") {
    return response;
  }
  if (isRecord(response) && typeof response.output === "string") {
    return response.output;
  }
  if (isRecord(response) && typeof response.stdout === "string") {
    return response.stdout;
  }
  return "";
}

function extractPaths(data) {
  const input = isRecord(data.tool_input) ? data.tool_input : {};
  const toolInput = isRecord(data.toolInput) ? data.toolInput : {};
  return [data.file_path, data.filePath, input.file_path, input.path, toolInput.file_path]
    .filter((value) => typeof value === "string" && value.length > 0);
}

function markReason(ctx) {
  if (commandLooksPreservable(ctx.command)) {
    return "command-pattern";
  }
  if (outputMentionsMedia(ctx.output)) {
    return "output-media";
  }
  return "media-path";
}

function emitCursorFollowup(root) {
  if (alreadyNudgedRecently(readPendingFlag(root))) {
    return {};
  }
  if (!evaluateSignals(root).preservable) {
    return {};
  }
  consumePendingFlag(root);
  return {followup_message: buildFollowupText()};
}

function emitClaudeContinue(root) {
  if (alreadyNudgedRecently(readPendingFlag(root))) {
    return {continue: true};
  }
  if (!evaluateSignals(root).preservable) {
    return {continue: true};
  }
  consumePendingFlag(root);
  return {decision: "block", reason: buildFollowupText()};
}

function isStopHookActive(data) {
  return (
    data.stop_hook_active === true ||
    data.stop_hook_active === "true" ||
    data.stop_hook_active === 1
  );
}

function porcelainLineLooksPreservable(line) {
  const trimmed = line.trim();
  if (!trimmed) {
    return false;
  }
  const filePath = (trimmed.slice(3).split(" -> ").pop() ?? "").trim();
  return pathLooksLikeMedia(filePath) || pathIsUnderSignalDir(filePath);
}

function pathIsUnderSignalDir(filePath) {
  const normalized = filePath.replaceAll("\\", "/").toLowerCase();
  return SIGNAL_DIRS.some((dir) => {
    const prefix = dir.toLowerCase();
    return normalized === prefix || normalized.startsWith(`${prefix}/`);
  });
}

function walkRecentPreservable(dir, now, depth) {
  if (depth > 4) {
    return false;
  }
  let entries;
  try {
    entries = readdirSync(dir, {withFileTypes: true});
  } catch {
    return false;
  }
  return entries.some((entry) => entryLooksRecentlyPreservable(dir, entry, now, depth));
}

function entryLooksRecentlyPreservable(dir, entry, now, depth) {
  if (entry.name.startsWith(".") || SKIP_DIR_NAMES.has(entry.name)) {
    return false;
  }
  const full = path.join(dir, entry.name);
  if (entry.isDirectory()) {
    return walkRecentPreservable(full, now, depth + 1);
  }
  if (!entry.isFile() || !pathLooksLikeMedia(full)) {
    return false;
  }
  try {
    return now - statSync(full).mtimeMs < RECENT_MTIME_MS;
  } catch {
    return false;
  }
}

function isUntaggedStub(clip) {
  if (!isRecord(clip)) {
    return false;
  }
  const nature = Array.isArray(clip.nature) ? clip.nature : [];
  const tags = Array.isArray(clip.tags) ? clip.tags : [];
  return nature.length === 0 && tags.length === 0;
}

async function readStdinJson() {
  const chunks = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }
  const raw = Buffer.concat(chunks).toString("utf8").trim();
  if (!raw) {
    return {};
  }
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function writeJson(value) {
  process.stdout.write(`${JSON.stringify(value)}\n`);
}

/** CLI dispatcher. Always exit 0 so a hook failure cannot stall the agent. */
async function main(argv = process.argv.slice(2)) {
  const payload = await readStdinJson();
  if (argv.includes("--mark")) {
    handleMark(payload);
    return;
  }
  if (argv.includes("--stop-cursor")) {
    writeJson(handleStopCursor(payload));
    return;
  }
  if (argv.includes("--stop-claude")) {
    writeJson(handleStopClaude(payload));
    return;
  }
  writeJson({});
}

const invoked =
  process.argv[1] !== undefined
    ? pathToFileURL(path.resolve(process.argv[1])).href
    : "";

if (import.meta.url === invoked) {
  main().catch(() => {
    process.exitCode = 0;
  });
}
