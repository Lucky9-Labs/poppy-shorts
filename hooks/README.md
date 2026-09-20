# Preserve-for-content lifecycle hooks

The installable **poppy-shorts** plugin now ships real agent lifecycle hooks. They mark a local pending flag when a shell/tool call looks like merge, sendit, media export, or journey capture, then on **Stop / stop** they nudge the agent to run `/poppy-preserve-content` — only when a signal is present.

Nothing in these hooks talks to GitHub, stores secrets, or invents clip scores.

| Path | Host | Events |
| --- | --- | --- |
| [`hooks.json`](./hooks.json) | Claude Code + Codex (PascalCase) | `PostToolUse` (`Bash`) → `--mark`; `Stop` → `--stop-claude` |
| [`cursor-hooks.json`](./cursor-hooks.json) | Cursor (camelCase, `version: 1`) | `afterShellExecution` → `--mark`; `stop` (`loop_limit: 1`) → `--stop-cursor` |
| [`scripts/preserve-gate.mjs`](../scripts/preserve-gate.mjs) | All three | Shared Node gate (no npm deps) |

Skills and slash commands are unchanged: [`poppy-journey`](../skills/poppy-journey/SKILL.md) → [`poppy-preserve-content`](../skills/poppy-preserve-content/SKILL.md) → [`tag-poppy-clips`](../skills/tag-poppy-clips/SKILL.md).

If hooks cannot load, use the copy-paste fallback: [`docs/hooks/post-work-tag-clips.md`](../docs/hooks/post-work-tag-clips.md).

## What fires

1. **Mark** after a matching shell/tool completion. The script reads stdin JSON, extracts the command + cwd + output, and writes `.poppy/preserve-pending.json` under the **project cwd** (or `CLAUDE_PROJECT_DIR` / `CURSOR_PROJECT_DIR`) when the command matches merge/sendit/export/journey patterns, a media-ish path was written, or stdout mentions a new `.mp4` / `.webm` / `.mov` / `.png` / `.gif` / journey JSON.
2. **Stop** evaluates signals: a fresh unused pending flag (< 24h), `git status --porcelain` media/journey/inventory paths, recent mtime (< 2h) under `content-pipeline`, `captures`, `journeys`, `exports`, `Recordings`, `inventory`, or untagged stubs in `inventory/clips.json`.
3. If a signal exists, the agent is told to follow **poppy-preserve-content** (ask “Preserve this work for content?”; if no, stop; if yes, journey/tag next). The pending flag is marked `consumedAt` so the same Stop cannot loop.
4. If there is no signal, the hook stays silent (`{}` on Cursor, `{"continue":true}` on Claude/Codex).

**PR-merge is not a native hook event.** We approximate it: `git merge` / `gh pr merge` / `sendit` on the shell mark the flag; Stop asks the preserve question. There is no GitHub merge bot.

## Trust and disable

Hooks execute local Node. Review them before enabling:

| Product | Trust / inspect | Disable |
| --- | --- | --- |
| Claude Code | Type `/hooks` to browse plugin hooks. Accept the workspace trust prompt if asked. | Toggle the plugin off, or set `"disableAllHooks": true` in Claude settings. |
| Codex | Plugin-bundled hooks stay skipped until you **review and trust** the current hook definition. | Leave them untrusted, or disable the plugin. |
| Cursor | **Settings → Hooks** (or the Hooks tab). Plugin hooks resolve `${CURSOR_PLUGIN_ROOT}`. | Disable the plugin, or remove the `hooks` entry from `.cursor-plugin/plugin.json`. |

No tokens, AWS keys, or Fish keys belong in hook JSON or in `.poppy/preserve-pending.json`.

## Plugin root fallback

Installed plugins should set `CURSOR_PLUGIN_ROOT` (Cursor), `CLAUDE_PLUGIN_ROOT` (Claude Code; Codex also sets this for compatibility), and/or `PLUGIN_ROOT` (Codex). `preserve-gate.mjs` tries those env vars, then the parent of `scripts/` via `import.meta.url`.

If a host does not expand `${CURSOR_PLUGIN_ROOT}` in the command string, point the hook at the absolute script under the plugin install directory, or run from a sibling checkout:

```bash
node "$(pwd)/scripts/preserve-gate.mjs" --mark
```

The pending flag is always written in the **consumer project**, not inside the plugin package.

## Loop guards

- Cursor: `loop_limit: 1` plus the script exits `{}` when `loop_count >= 1` or `status` is not `completed`.
- Claude / Codex: if `stop_hook_active` is true, the script prints `{"continue":true}` and does not block again.
- Emitting a followup writes `consumedAt` on the pending flag.

Install: [`docs/INSTALL-PLUGIN.md`](../docs/INSTALL-PLUGIN.md). Keep secrets out of prompts. Call `inventory:journey` / `inventory:sync` / `inventory:tag` instead of pasting AWS or Fish keys.
